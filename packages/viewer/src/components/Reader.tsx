import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { BREAK_SNOOZE_MINUTES, computeFilters, eraseMarks, MODE_IDS, sanitizeMarks, STORAGE_KEYS, translate, type KeyValueStore, type Mark, type MarkRect, type MessageKey } from '@losh/core';
import { ReaderController, type SearchState, type ZoomValue } from '../pdf/controller';
import { documentKey } from '../pdf/docKey';
import { enableAxisLock } from '../pdf/axisLock';
import { enablePinchZoom } from '../pdf/pinch';
import { createSnapper, MarkPainter } from '../pdf/marks';
import { enablePen, type PenTool } from '../pdf/pen';
import type { RecentLibrary } from '../library';
import { useSettings } from '../useSettings';
import { useBreakReminder } from '../useBreakReminder';
import { isTextField, matchShortcut } from '../shortcuts';
import { SettingsPanel } from './SettingsPanel';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { HelpDialog } from './HelpDialog';
import { RecentList, type RecentItem } from './RecentList';
import { BreakReminder } from './BreakReminder';
import { MarkTools } from './MarkTools';
import { IconBook, IconCandle, IconChevronLeft, IconChevronRight, IconFitText, IconHelp, IconMinus, IconMoon, IconOpen, IconPlus, IconSearch, IconSliders, IconSun } from './icons';

export interface ReaderProps {
  store: KeyValueStore;
  /** URL (relative to the page) of the folder holding pdf.js cmaps/, standard_fonts/, wasm/, iccs/. */
  pdfAssetsBase: string;
  /** When set, the "Losh" brand links back to this page (the welcome page). */
  homeHref?: string;
  /** On-device storage for "Recently read". Without it the reader keeps nothing. */
  library?: RecentLibrary;
  /**
   * Called once with a function that opens a file, for files arriving from outside (share sheet, "Open with"),
   * and one that shows a short note, e.g. when a shared file got lost on the way.
   */
  connectFiles?(open: (file: File) => void, notify: (message: MessageKey) => void): void;
}

type Status = { kind: 'empty' } | { kind: 'loading' } | { kind: 'ready'; name: string } | { kind: 'error'; message: MessageKey };

const POSITION_SAVE_DELAY_MS = 500;
const TOAST_MS = 3500;
const ZOOM_PERCENTS = [50, 75, 100, 125, 150, 200, 300];
const MODE_ICONS = { normal: IconSun, sepia: IconBook, night: IconMoon, darkSepia: IconCandle } as const;
/** Phones and tablets: a tap on the page hides the bars, so the PDF gets the whole screen. */
const TOUCH_UI_QUERY = '(max-width: 640px), (pointer: coarse)';
const BARS_HINT_DELAY_MS = 1500;
/** Reading time before asking, once, whether to turn on eye break reminders. */
const BREAK_ASK_AFTER_MS = 45_000;
/** Undo remembers this many highlighter steps. */
const UNDO_LIMIT = 100;

const newMarkId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => typeof matchMedia === 'function' && matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export function Reader({ store, pdfAssetsBase, homeHref, library, connectFiles }: ReaderProps) {
  const [settings, update, settingsLoaded] = useSettings(store);
  const t = useCallback(
    (key: MessageKey, params?: Record<string, string | number>) => translate(settings.locale, key, params),
    [settings.locale],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const controllerRef = useRef<ReaderController | null>(null);
  const docKeyRef = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  /** Latest page number, readable from event handlers without waiting for a re-render. */
  const currentPageRef = useRef(0);

  const [status, setStatus] = useState<Status>({ kind: 'empty' });
  const [page, setPage] = useState({ current: 0, total: 0 });
  const [pageInput, setPageInput] = useState('');
  const [zoom, setZoom] = useState<{ scale: number; preset: ZoomValue }>({ scale: 1, preset: 'page-width' });
  const [search, setSearch] = useState<SearchState>({ query: '', current: 0, total: 0, notFound: false });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState('');
  const [recent, setRecent] = useState<RecentItem[]>([]);
  /** A just-opened PDF waiting for the "keep it on this device?" answer. */
  const [keepAsk, setKeepAsk] = useState<{ file: File; key: string } | null>(null);
  const touchUi = useMediaQuery(TOUCH_UI_QUERY);
  const stageRef = useRef<HTMLElement>(null);
  /** Where the pages started on screen before the bars last moved. */
  const stageTopRef = useRef<number | null>(null);
  const [barsAway, setBarsAway] = useState(false);
  const [barsEverAway, setBarsEverAway] = useState(false);
  const [barsHintSeen, setBarsHintSeen] = useState(true);
  const [breakAsk, setBreakAsk] = useState(false);
  // Highlighter: marks live in a ref and are drawn straight onto the pages; React only tracks the buttons.
  const [penTool, setPenTool] = useState<PenTool | null>(null);
  const penToolRef = useRef(penTool);
  penToolRef.current = penTool;
  const markColorRef = useRef(settings.markColor);
  markColorRef.current = settings.markColor;
  const painterRef = useRef<MarkPainter | null>(null);
  const marksRef = useRef<Mark[]>([]);
  /** The marks as they were before each step, newest last. */
  const undoRef = useRef<Mark[][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [marksHintSeen, setMarksHintSeen] = useState(true);

  // --- pdf.js controller -------------------------------------------------
  // A layout effect, so the controller exists before the first paint: a file picked or shared
  // in that first moment must not be dropped.
  useLayoutEffect(() => {
    const viewerEl = scrollRef.current!.querySelector<HTMLElement>('.pdfViewer')!;
    const painter = new MarkPainter(viewerEl);
    painterRef.current = painter;
    const controller = new ReaderController(scrollRef.current!, pdfAssetsBase, {
      onPageChange(current, total) {
        currentPageRef.current = current;
        setPage({ current, total });
        setPageInput(String(current));
        const key = docKeyRef.current;
        if (!key) return;
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => void store.set(STORAGE_KEYS.position(key), { page: current, total, savedAt: Date.now() }), POSITION_SAVE_DELAY_MS);
      },
      onZoomChange(scale, preset) {
        setZoom({ scale, preset });
      },
      onSearchChange: setSearch,
      onPageRendered: (div) => painter.paint(div),
    });
    controllerRef.current = controller;
    const stopPinch = enablePinchZoom(scrollRef.current!, viewerEl, {
      range: () => controller.zoomRange(),
      zoomBy: (factor, origin) => controller.zoomBy(factor, origin),
    });
    const stopAxisLock = enableAxisLock(scrollRef.current!, () => penToolRef.current !== null);
    // The page under a stroke is read once per stroke, then every finger move snaps quickly.
    let snap: { div: HTMLElement; at: ReturnType<typeof createSnapper> } | null = null;
    const snapped = (div: HTMLElement, points: [number, number][], tool: PenTool): MarkRect[] | null => {
      if (snap?.div !== div) snap = { div, at: createSnapper(div) };
      // A dab of the eraser rubs out the word under it; a dab of the pen marks nothing.
      return snap.at(points, tool === 'eraser');
    };
    /** The marks with this stroke applied: a new mark, or the eraser's stretch cut out of the old ones. */
    const withStroke = (div: HTMLElement, points: [number, number][], tool: PenTool): Mark[] => {
      const rects = snapped(div, points, tool);
      const page = Number(div.dataset.pageNumber);
      if (!rects) return marksRef.current;
      if (tool === 'eraser') return eraseMarks(marksRef.current, page, rects);
      return [...marksRef.current, { id: newMarkId(), page, color: markColorRef.current, rects }];
    };
    const stopPen = enablePen(scrollRef.current!, {
      tool: () => penToolRef.current,
      draw(div, points, tool) {
        // Shown live under the finger, kept only when it lifts.
        painter.set(withStroke(div, points, tool));
      },
      commit(div, points, tool) {
        const marks = withStroke(div, points, tool);
        snap = null;
        if (marks !== marksRef.current) changeMarksRef.current(marks);
        else painter.set(marks);
      },
      cancel() {
        snap = null;
        painter.set(marksRef.current);
      },
    });
    return () => {
      stopPen();
      stopAxisLock();
      stopPinch();
      controller.destroy();
    };
  }, [pdfAssetsBase, store]);

  useEffect(() => {
    if (!toast) return;
    // Long tips stay a little longer, so there is time to read them.
    const id = setTimeout(() => setToast(''), Math.max(TOAST_MS, toast.length * 60));
    return () => clearTimeout(id);
  }, [toast]);

  // --- recently read -------------------------------------------------------------
  const refreshRecent = useCallback(async () => {
    if (!library) return;
    try {
      const entries = await library.list();
      const items = await Promise.all(
        entries.map(async (e) => {
          const pos = await store.get<{ page?: number; total?: number }>(STORAGE_KEYS.position(e.key));
          return { ...e, page: pos?.page, total: pos?.total };
        }),
      );
      setRecent(items);
    } catch (err) {
      console.error(err);
    }
  }, [library, store]);

  useEffect(() => {
    void refreshRecent();
  }, [refreshRecent]);

  const keepFile = useCallback(
    async (file: File, key: string) => {
      if (!library) return;
      await library.save({ key, name: file.name, size: file.size, openedAt: Date.now() }, await file.arrayBuffer());
      // Ask the browser not to clear our storage when space runs low (only a hint; it may say no).
      void navigator.storage?.persist?.().catch(() => false);
      await refreshRecent();
    },
    [library, refreshRecent],
  );

  /** After a PDF opened: refresh its "recent" entry, keep it, or ask, depending on the setting. */
  const rememberFile = useCallback(
    async (file: File, key: string) => {
      if (!library) return;
      try {
        if (await library.touch(key)) await refreshRecent();
        else if (settings.keepRecent === 'always') await keepFile(file, key);
        else if (settings.keepRecent === 'ask') setKeepAsk({ file, key });
      } catch (err) {
        console.error(err);
      }
    },
    [library, settings.keepRecent, keepFile, refreshRecent],
  );

  const openFile = useCallback(
    async (file: File) => {
      const controller = controllerRef.current;
      if (!controller) return;
      if (!isPdf(file)) {
        setStatus({ kind: 'error', message: 'open.notPdf' });
        return;
      }
      setStatus({ kind: 'loading' });
      setSearchOpen(false);
      setKeepAsk(null);
      setBarsAway(false);
      controller.clearSearch();
      setPenTool(null);
      marksRef.current = [];
      undoRef.current = [];
      setCanUndo(false);
      painterRef.current?.set([]);
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        // Hash before opening: pdf.js transfers the buffer to its worker.
        const key = await documentKey(bytes);
        const saved = await store.get<{ page?: number }>(STORAGE_KEYS.position(key));
        const startPage = typeof saved?.page === 'number' ? saved.page : 1;
        docKeyRef.current = null;
        // Before the pages are drawn, so each page shows its marks right away.
        marksRef.current = sanitizeMarks(await store.get(STORAGE_KEYS.marks(key)));
        painterRef.current?.set(marksRef.current);
        await controller.open(bytes, startPage, settings.fitText ? 'text-width' : 'page-width');
        docKeyRef.current = key;
        setStatus({ kind: 'ready', name: file.name });
        document.title = `${file.name} — ${translate(settings.locale, 'app.name')}`;
        if (startPage > 1 && startPage <= controller.pageCount) setToast(translate(settings.locale, 'resume.toast', { page: startPage }));
        void rememberFile(file, key);
      } catch (err) {
        console.error(err);
        const name = (err as { name?: string })?.name;
        setStatus({ kind: 'error', message: name === 'PasswordException' ? 'error.password' : 'error.load' });
      }
    },
    [store, settings.locale, settings.fitText, rememberFile],
  );

  // Files from outside arrive through this once; route them to the latest openFile.
  const openFileRef = useRef(openFile);
  openFileRef.current = openFile;
  // A note waits for the saved language before it shows.
  const [note, setNote] = useState<MessageKey | null>(null);
  useEffect(() => {
    connectFiles?.((file) => void openFileRef.current(file), setNote);
  }, []);
  useEffect(() => {
    if (!note || !settingsLoaded) return;
    setToast(t(note));
    setNote(null);
  }, [note, settingsLoaded, t]);

  const openRecent = async (key: string) => {
    const file = await library?.load(key).catch(() => null);
    if (file) {
      void openFile(file);
      return;
    }
    setStatus({ kind: 'error', message: 'recent.missing' });
    await library?.remove(key).catch(() => undefined);
    await refreshRecent();
  };

  const removeRecent = async (key: string) => {
    await library?.remove(key);
    await refreshRecent();
  };

  const clearRecent = async () => {
    if (!library || !window.confirm(t('recent.clearConfirm'))) return;
    await library.clear();
    await refreshRecent();
  };

  const pickFile = () => fileInput.current?.click();

  // --- highlighter -------------------------------------------------------------
  /** Replaces this PDF's marks (remembering the old ones for undo), redraws and saves them on the device. */
  const changeMarks = useCallback(
    (marks: Mark[], undoing = false) => {
      if (!undoing) undoRef.current = [...undoRef.current, marksRef.current].slice(-UNDO_LIMIT);
      marksRef.current = marks;
      painterRef.current?.set(marks);
      const key = docKeyRef.current;
      if (key) void (marks.length ? store.set(STORAGE_KEYS.marks(key), marks) : store.remove(STORAGE_KEYS.marks(key)));
      setCanUndo(undoRef.current.length > 0);
    },
    [store],
  );
  const changeMarksRef = useRef(changeMarks);
  changeMarksRef.current = changeMarks;

  const undoMark = useCallback(() => {
    const before = undoRef.current.pop();
    if (before) changeMarks(before, true);
  }, [changeMarks]);

  useEffect(() => {
    void store.get<boolean>(STORAGE_KEYS.marksHint).then((seen) => setMarksHintSeen(seen === true));
  }, [store]);

  const choosePenTool = useCallback(
    (tool: PenTool | null) => {
      setPenTool(tool);
      if (!tool) return;
      window.getSelection()?.removeAllRanges();
      if (!marksHintSeen) {
        setToast(translate(settings.locale, touchUi ? 'mark.hintTouch' : 'mark.hintMouse'));
        setMarksHintSeen(true);
        void store.set(STORAGE_KEYS.marksHint, true);
      }
    },
    [marksHintSeen, settings.locale, touchUi, store],
  );

  // --- keyboard -------------------------------------------------------------
  const closeTopmost = useCallback(() => {
    if (helpOpen) setHelpOpen(false);
    else if (settingsOpen) setSettingsOpen(false);
    else if (searchOpen) {
      setSearchOpen(false);
      controllerRef.current?.clearSearch();
    } else if (penTool) setPenTool(null);
  }, [helpOpen, settingsOpen, searchOpen, penTool]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const action = matchShortcut({ key: e.key, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, inTextField: isTextField(e.target) });
      if (!action) return;
      if (helpOpen && action.type !== 'close') return;
      const c = controllerRef.current;
      const hasDoc = status.kind === 'ready';
      switch (action.type) {
        case 'close':
          closeTopmost();
          return; // let the browser also handle Escape (closes <dialog>)
        case 'search':
          if (!hasDoc) return;
          setSearchOpen(true);
          setSearchFocus((n) => n + 1);
          break;
        case 'open':
          pickFile();
          break;
        case 'cycleMode': {
          const i = MODE_IDS.indexOf(settings.mode);
          update({ mode: MODE_IDS[(i + 1) % MODE_IDS.length] });
          break;
        }
        case 'pickMode':
          update({ mode: MODE_IDS[action.index] });
          break;
        case 'prevPage':
          if (hasDoc) c?.previousPage();
          break;
        case 'nextPage':
          if (hasDoc) c?.nextPage();
          break;
        case 'zoomIn':
          c?.zoomIn();
          break;
        case 'zoomOut':
          c?.zoomOut();
          break;
        case 'fitWidth':
          c?.setZoom('page-width');
          break;
        case 'settings':
          setSettingsOpen((o) => !o);
          break;
        case 'help':
          setHelpOpen(true);
          break;
        case 'mark':
          if (!hasDoc) return;
          choosePenTool(penTool ? null : 'pen');
          break;
        case 'undo':
          if (!hasDoc || !undoRef.current.length) return;
          undoMark();
          break;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [helpOpen, status.kind, settings.mode, update, closeTopmost, penTool, choosePenTool, undoMark]);

  // --- drag & drop -------------------------------------------------------------
  const dragDepth = useRef(0);
  const dropHandlers = {
    onDragEnter: (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes('Files')) return;
      e.preventDefault();
      dragDepth.current++;
      setDragging(true);
    },
    onDragOver: (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) e.preventDefault();
    },
    onDragLeave: () => {
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragging(false);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      const file = e.dataTransfer?.files[0];
      if (file) void openFile(file);
    },
  };

  // --- appearance ------------------------------------------------------------------
  const filters = useMemo(() => computeFilters(settings), [settings]);
  const styleVars = {
    '--losh-page-filter': filters.pageFilter,
    '--losh-page-tint': filters.pageTint,
    '--losh-image-restore': filters.imageRestoreFilter ?? 'none',
    '--losh-warm-color': filters.warmOverlay.color,
    '--losh-warm-opacity': String(filters.warmOverlay.opacity),
    '--losh-page-bg': filters.pageBg,
    '--losh-viewer-bg': filters.viewerBg,
  } as Record<string, string>;

  const hasDoc = status.kind === 'ready';

  // --- bars out of the way while reading (touch screens) ---------------------------
  const barsHidden = barsAway && touchUi && hasDoc && !searchOpen && !settingsOpen && !penTool;

  // The pages area grows or shrinks when the bars go or come back; scroll by the same amount so the text stays still.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const scroller = scrollRef.current;
    if (!stage || !scroller) return;
    const top = stage.getBoundingClientRect().top;
    if (stageTopRef.current !== null && top !== stageTopRef.current) scroller.scrollTop += top - stageTopRef.current;
    stageTopRef.current = top;
  }, [barsHidden]);

  useEffect(() => {
    void store.get<boolean>(STORAGE_KEYS.barsHint).then((seen) => setBarsHintSeen(seen === true));
  }, [store]);

  const markBarsHintSeen = useCallback(() => {
    setBarsHintSeen(true);
    void store.set(STORAGE_KEYS.barsHint, true);
  }, [store]);

  // Tell touch users once, when nothing else is on screen, that a tap hides the menus.
  useEffect(() => {
    if (!touchUi || !hasDoc || barsHintSeen || keepAsk || breakAsk || toast) return;
    const id = setTimeout(() => {
      setToast(t('bars.hint'));
      markBarsHintSeen();
    }, BARS_HINT_DELAY_MS);
    return () => clearTimeout(id);
  }, [touchUi, hasDoc, barsHintSeen, keepAsk, breakAsk, toast, t, markBarsHintSeen]);

  const onPageTap = (e: MouseEvent) => {
    if (!touchUi || !hasDoc || searchOpen || settingsOpen || penTool) return;
    // Links in the PDF keep working, and a tap that clears a text selection is not a toggle.
    if ((e.target as Element).closest('a, button, input, select, textarea')) return;
    if (window.getSelection()?.isCollapsed === false) return;
    if (stageRef.current) stageTopRef.current = stageRef.current.getBoundingClientRect().top;
    if (!barsHidden) setBarsEverAway(true);
    setBarsAway(!barsHidden);
    if (!barsHintSeen) markBarsHintSeen();
  };

  // --- eye breaks (20-20-20) ---------------------------------------------------------
  const breaks = settings.breakReminder;
  const breakReminder = useBreakReminder(breaks.enabled, breaks.intervalMinutes, hasDoc);
  const setBreaks = (patch: Partial<typeof breaks>) => update({ breakReminder: { ...breaks, ...patch } });

  // Ask once, after a little reading, when nothing else is asking for attention.
  useEffect(() => {
    if (!hasDoc || breaks.asked || keepAsk || breakAsk || toast) return;
    // Measured with Date.now() rather than one long timer, so time in the background is not counted twice.
    let last = Date.now();
    let read = 0;
    const id = setInterval(() => {
      const now = Date.now();
      if (!document.hidden) read += now - last;
      last = now;
      if (read >= BREAK_ASK_AFTER_MS) setBreakAsk(true);
    }, 1000);
    return () => clearInterval(id);
  }, [hasDoc, breaks.asked, keepAsk, breakAsk, toast]);

  const zoomSelectValue = typeof zoom.preset === 'string' ? zoom.preset : 'custom';
  const zoomPercent = Math.round(zoom.scale * 100);

  return (
    <div
      class={`losh${filters.imageRestoreFilter ? ' losh-restore-images' : ''}${filters.pageTint !== 'transparent' ? ' losh-tinted' : ''}`}
      data-mode={settings.mode}
      data-bars={barsHidden ? 'hidden' : barsEverAway ? 'back' : undefined}
      data-pen={penTool ?? undefined}
      style={styleVars}
      lang={settings.locale}
      {...dropHandlers}
    >
      {/* A header landmark, so screen reader users can jump to the controls (role="toolbar" would promise arrow-key navigation). */}
      <header class="losh-toolbar" aria-label={t('app.tagline')}>
        {homeHref ? (
          <a class="losh-brand" href={homeHref} title={t('home.back')} aria-label={`${t('app.name')} — ${t('home.back')}`}>
            <Logo size={28} id="losh-reader-logo" />
            <span class="losh-brand-text">Losh</span>
          </a>
        ) : (
          <div class="losh-brand" aria-label={t('app.name')}>
            <Logo size={28} id="losh-reader-logo" />
            <span class="losh-brand-text">Losh</span>
          </div>
        )}

        <button type="button" class="losh-btn losh-btn-primary" onClick={pickFile} title={`${t('open.button')} (O)`}>
          <IconOpen />
          <span>{t('open.button')}</span>
        </button>

        {/* Modes and page controls: inline on wide screens, a bottom bar within thumb reach on phones. */}
        <div class="losh-dock">
          <div class="losh-modes" role="group" aria-label={t('mode.group')}>
            {MODE_IDS.map((id, i) => (
              <button
                type="button"
                key={id}
                class="losh-mode"
                data-swatch={id}
                aria-pressed={settings.mode === id}
                onClick={() => update({ mode: id })}
                title={`${t(`mode.${id}` as MessageKey)} (${i + 1})`}
              >
                <span class="losh-mode-icon">{MODE_ICONS[id]()}</span>
                <span>{t(`mode.${id}` as MessageKey)}</span>
              </button>
            ))}
          </div>

          {hasDoc && (
            <div class="losh-group losh-pages">
              <button type="button" class="losh-icon-btn" onClick={() => controllerRef.current?.previousPage()} aria-label={t('page.prev')} title={`${t('page.prev')} (←)`} disabled={page.current <= 1}>
                <IconChevronLeft />
              </button>
              <input
                class="losh-page-input"
                inputMode="numeric"
                enterKeyHint="go"
                aria-label={t('page.input')}
                value={pageInput}
                onFocus={(e) => (e.currentTarget as HTMLInputElement).select()}
                onInput={(e) => setPageInput((e.currentTarget as HTMLInputElement).value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    controllerRef.current?.goToPage(Number(pageInput) || page.current);
                    // Hand focus back to the pages so arrow keys work and the next click re-selects the number.
                    scrollRef.current?.focus();
                  }
                }}
                onBlur={() => setPageInput(String(currentPageRef.current))}
              />
              <span class="losh-page-total">{t('page.of', { total: page.total })}</span>
              <button type="button" class="losh-icon-btn" onClick={() => controllerRef.current?.nextPage()} aria-label={t('page.next')} title={`${t('page.next')} (→)`} disabled={page.current >= page.total}>
                <IconChevronRight />
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          class="losh-icon-btn"
          aria-expanded={settingsOpen}
          aria-label={t('settings.open')}
          title={`${t('settings.open')} (S)`}
          onClick={() => setSettingsOpen((o) => !o)}
        >
          <IconSliders />
        </button>

        <div class="losh-spacer" />

        {hasDoc && (
          <div class="losh-group losh-zoom-group">
            <button type="button" class="losh-icon-btn" onClick={() => controllerRef.current?.zoomOut()} aria-label={t('zoom.out')} title={`${t('zoom.out')} (−)`}>
              <IconMinus />
            </button>
            <select
              class="losh-zoom"
              aria-label={t('zoom.label')}
              value={zoomSelectValue === 'custom' ? String(zoom.preset) : zoomSelectValue}
              onChange={(e) => {
                const v = (e.currentTarget as HTMLSelectElement).value;
                if (v === 'text-width' || v === 'page-width' || v === 'page-fit') {
                  if (settings.fitText !== (v === 'text-width')) update({ fitText: v === 'text-width' });
                  controllerRef.current?.setZoom(v);
                } else controllerRef.current?.setZoom(Number(v));
              }}
            >
              <option value="text-width">{t('zoom.textWidth')}</option>
              <option value="page-width">{t('zoom.pageWidth')}</option>
              <option value="page-fit">{t('zoom.pageFit')}</option>
              {zoomSelectValue === 'custom' && !ZOOM_PERCENTS.includes(zoomPercent) && (
                <option value={String(zoom.preset)}>{t('zoom.custom', { percent: zoomPercent })}</option>
              )}
              {ZOOM_PERCENTS.map((p) => (
                <option key={p} value={String(p / 100)}>
                  {t('zoom.custom', { percent: p })}
                </option>
              ))}
            </select>
            <button type="button" class="losh-icon-btn" onClick={() => controllerRef.current?.zoomIn()} aria-label={t('zoom.in')} title={`${t('zoom.in')} (+)`}>
              <IconPlus />
            </button>
            <button
              type="button"
              class="losh-icon-btn"
              aria-pressed={zoom.preset === 'text-width'}
              aria-label={t('zoom.textWidth')}
              title={t('zoom.textWidth')}
              onClick={() => {
                const on = zoom.preset !== 'text-width';
                update({ fitText: on });
                controllerRef.current?.setZoom(on ? 'text-width' : 'page-width');
              }}
            >
              <IconFitText />
            </button>
          </div>
        )}

        {hasDoc && (
          <button
            type="button"
            class="losh-icon-btn"
            aria-label={t('search.open')}
            aria-expanded={searchOpen}
            title={`${t('search.open')} (Ctrl+F)`}
            onClick={() => {
              setSearchOpen(true);
              setSearchFocus((n) => n + 1);
            }}
          >
            <IconSearch />
          </button>
        )}

        <button type="button" class="losh-icon-btn losh-help-btn" onClick={() => setHelpOpen(true)} aria-label={t('help.open')} title={`${t('help.open')} (?)`}>
          <IconHelp />
        </button>
      </header>

      {searchOpen && hasDoc && (
        <SearchBar
          state={search}
          t={t}
          focusSignal={searchFocus}
          onSearch={(q, o) => controllerRef.current?.find(q, o)}
          onClose={() => {
            setSearchOpen(false);
            controllerRef.current?.clearSearch();
          }}
        />
      )}

      <main class="losh-stage" ref={stageRef}>
        {/* Inside the page area, so it always opens below the toolbar and the search bar, never on top of them. */}
        {settingsOpen && (
          <SettingsPanel
            settings={settings}
            update={update}
            t={t}
            onClose={() => setSettingsOpen(false)}
            recentBytes={library ? recent.reduce((sum, r) => sum + r.size, 0) : undefined}
            onClearRecent={() => void clearRecent()}
          />
        )}
        {/* Before the pages, so the keyboard reaches it right after the toolbar (it floats in the corner either way). */}
        {hasDoc && (
          <MarkTools
            t={t}
            tool={penTool}
            color={settings.markColor}
            canUndo={canUndo}
            onTool={choosePenTool}
            onColor={(markColor) => update({ markColor })}
            onUndo={undoMark}
          />
        )}
        <div class="losh-scroll" ref={scrollRef} tabIndex={0} role="region" aria-label={status.kind === 'ready' ? status.name : t('app.name')} onClick={onPageTap}>
          <div class="pdfViewer" />
        </div>
        {/* Blend layers cost phones smooth scrolling, so they exist only while they change something. */}
        {filters.warmOverlay.opacity > 0 && <div class="losh-warm" aria-hidden="true" />}

        {status.kind !== 'ready' && (
          <div class="losh-empty">
            {status.kind === 'loading' ? (
              <p class="losh-loading" role="status">
                {t('loading')}
              </p>
            ) : (
              <div class="losh-start">
                <div class="losh-drop">
                  <p class="losh-drop-title">{t('open.drop')}</p>
                  <p class="losh-drop-or">{t('open.or')}</p>
                  <button type="button" class="losh-btn losh-btn-primary losh-btn-large" onClick={pickFile}>
                    <IconOpen />
                    <span>{t('open.choose')}</span>
                  </button>
                  {status.kind === 'error' && (
                    <p class="losh-error" role="alert">
                      {t(status.message)}
                    </p>
                  )}
                  <p class="losh-privacy">{t('open.privacy')}</p>
                </div>
                {recent.length > 0 && (
                  <RecentList
                    items={recent}
                    locale={settings.locale}
                    t={t}
                    onOpen={(key) => void openRecent(key)}
                    onRemove={(key) => void removeRecent(key)}
                    onClear={() => void clearRecent()}
                  />
                )}
                {/* A "no" once turns keeping off for good; say so where the list would be, with the way back. */}
                {library && settings.keepRecent === 'never' && (
                  <div class="losh-keep-off">
                    <p>{t('keep.off')}</p>
                    <button
                      type="button"
                      class="losh-text-btn"
                      onClick={() => {
                        update({ keepRecent: 'always' });
                        setToast(t('keep.turnedOn'));
                      }}
                    >
                      {t('keep.turnOn')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {dragging && (
          <div class="losh-dropzone" aria-hidden="true">
            <p>{t('open.dropHere')}</p>
          </div>
        )}
      </main>

      <input
        ref={fileInput}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={(e) => {
          const input = e.currentTarget as HTMLInputElement;
          const file = input.files?.[0];
          if (file) void openFile(file);
          input.value = '';
        }}
      />

      {breakAsk && !keepAsk && !breaks.asked && (
        <div class="losh-keep" role="region" aria-label={t('break.title')}>
          <p class="losh-keep-question">{t('break.ask', { minutes: breaks.intervalMinutes })}</p>
          <p class="losh-hint">{t('break.askNote')}</p>
          <div class="losh-keep-actions">
            <button type="button" class="losh-text-btn" onClick={() => setBreaks({ asked: true, enabled: false })}>
              {t('break.no')}
            </button>
            <button type="button" class="losh-btn losh-btn-primary" onClick={() => setBreaks({ asked: true, enabled: true })}>
              {t('break.yes')}
            </button>
          </div>
        </div>
      )}

      {breakReminder.due && hasDoc && (
        <BreakReminder t={t} onDone={breakReminder.rested} onSnooze={() => breakReminder.snooze(BREAK_SNOOZE_MINUTES)} />
      )}

      {keepAsk && (
        <div class="losh-keep" role="region" aria-label={t('recent.title')}>
          <p class="losh-keep-question">{t('keep.question')}</p>
          <p class="losh-hint">{t('keep.note')}</p>
          <div class="losh-keep-actions">
            <button
              type="button"
              class="losh-text-btn"
              onClick={() => {
                update({ keepRecent: 'never' });
                setKeepAsk(null);
              }}
            >
              {t('keep.no')}
            </button>
            <button
              type="button"
              class="losh-btn losh-btn-primary"
              onClick={() => {
                const { file, key } = keepAsk;
                update({ keepRecent: 'always' });
                setKeepAsk(null);
                keepFile(file, key).catch((err) => console.error(err));
              }}
            >
              {t('keep.yes')}
            </button>
          </div>
        </div>
      )}

      <div class="losh-toast" role="status" aria-live="polite">
        {toast && <span>{toast}</span>}
      </div>

      {helpOpen && <HelpDialog t={t} onClose={() => setHelpOpen(false)} />}
    </div>
  );
}
