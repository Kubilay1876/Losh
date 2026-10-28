import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { computeFilters, MODE_IDS, STORAGE_KEYS, translate, type KeyValueStore, type MessageKey } from '@losh/core';
import { ReaderController, type SearchState, type ZoomValue } from '../pdf/controller';
import { documentKey } from '../pdf/docKey';
import { useSettings } from '../useSettings';
import { isTextField, matchShortcut } from '../shortcuts';
import { SettingsPanel } from './SettingsPanel';
import { SearchBar } from './SearchBar';
import { HelpDialog } from './HelpDialog';
import { IconChevronLeft, IconChevronRight, IconHelp, IconMinus, IconOpen, IconPlus, IconSearch, IconSliders } from './icons';

export interface ReaderProps {
  store: KeyValueStore;
  /** URL (relative to the page) of the folder holding pdf.js cmaps/, standard_fonts/, wasm/, iccs/. */
  pdfAssetsBase: string;
}

type Status = { kind: 'empty' } | { kind: 'loading' } | { kind: 'ready'; name: string } | { kind: 'error'; message: MessageKey };

const POSITION_SAVE_DELAY_MS = 500;
const TOAST_MS = 3500;
const ZOOM_PERCENTS = [50, 75, 100, 125, 150, 200, 300];

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

export function Reader({ store, pdfAssetsBase }: ReaderProps) {
  const [settings, update] = useSettings(store);
  const t = useCallback(
    (key: MessageKey, params?: Record<string, string | number>) => translate(settings.locale, key, params),
    [settings.locale],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const controllerRef = useRef<ReaderController | null>(null);
  const docKeyRef = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  // --- pdf.js controller -------------------------------------------------
  useEffect(() => {
    const controller = new ReaderController(scrollRef.current!, pdfAssetsBase, {
      onPageChange(current, total) {
        setPage({ current, total });
        setPageInput(String(current));
        const key = docKeyRef.current;
        if (!key) return;
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => void store.set(STORAGE_KEYS.position(key), { page: current, savedAt: Date.now() }), POSITION_SAVE_DELAY_MS);
      },
      onZoomChange(scale, preset) {
        setZoom({ scale, preset });
      },
      onSearchChange: setSearch,
    });
    controllerRef.current = controller;
    return () => controller.destroy();
  }, [pdfAssetsBase, store]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

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
      controller.clearSearch();
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        // Hash before opening: pdf.js transfers the buffer to its worker.
        const key = await documentKey(bytes);
        const saved = await store.get<{ page?: number }>(STORAGE_KEYS.position(key));
        const startPage = typeof saved?.page === 'number' ? saved.page : 1;
        docKeyRef.current = null;
        await controller.open(bytes, startPage);
        docKeyRef.current = key;
        setStatus({ kind: 'ready', name: file.name });
        document.title = `${file.name} — ${translate(settings.locale, 'app.name')}`;
        if (startPage > 1 && startPage <= controller.pageCount) setToast(translate(settings.locale, 'resume.toast', { page: startPage }));
      } catch (err) {
        console.error(err);
        const name = (err as { name?: string })?.name;
        setStatus({ kind: 'error', message: name === 'PasswordException' ? 'error.password' : 'error.load' });
      }
    },
    [store, settings.locale],
  );

  const pickFile = () => fileInput.current?.click();

  // --- keyboard -------------------------------------------------------------
  const closeTopmost = useCallback(() => {
    if (helpOpen) setHelpOpen(false);
    else if (settingsOpen) setSettingsOpen(false);
    else if (searchOpen) {
      setSearchOpen(false);
      controllerRef.current?.clearSearch();
    }
  }, [helpOpen, settingsOpen, searchOpen]);

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
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [helpOpen, status.kind, settings.mode, update, closeTopmost]);

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
  const zoomSelectValue = typeof zoom.preset === 'string' ? zoom.preset : 'custom';
  const zoomPercent = Math.round(zoom.scale * 100);

  return (
    <div
      class={`losh${filters.imageRestoreFilter ? ' losh-restore-images' : ''}`}
      data-mode={settings.mode}
      style={styleVars}
      lang={settings.locale}
      {...dropHandlers}
    >
      <div class="losh-toolbar" role="toolbar" aria-label={t('app.tagline')}>
        <div class="losh-brand" aria-label={t('app.name')}>
          Loş
        </div>

        <button type="button" class="losh-btn losh-btn-primary" onClick={pickFile} title={`${t('open.button')} (O)`}>
          <IconOpen />
          <span>{t('open.button')}</span>
        </button>

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
              <span class="losh-swatch" aria-hidden="true" />
              <span>{t(`mode.${id}` as MessageKey)}</span>
            </button>
          ))}
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
          <div class="losh-group">
            <button type="button" class="losh-icon-btn" onClick={() => controllerRef.current?.previousPage()} aria-label={t('page.prev')} title={`${t('page.prev')} (←)`} disabled={page.current <= 1}>
              <IconChevronLeft />
            </button>
            <input
              class="losh-page-input"
              inputMode="numeric"
              aria-label={t('page.input')}
              value={pageInput}
              onFocus={(e) => (e.currentTarget as HTMLInputElement).select()}
              onInput={(e) => setPageInput((e.currentTarget as HTMLInputElement).value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') controllerRef.current?.goToPage(Number(pageInput) || page.current);
              }}
              onBlur={() => setPageInput(String(page.current))}
            />
            <span class="losh-page-total">{t('page.of', { total: page.total })}</span>
            <button type="button" class="losh-icon-btn" onClick={() => controllerRef.current?.nextPage()} aria-label={t('page.next')} title={`${t('page.next')} (→)`} disabled={page.current >= page.total}>
              <IconChevronRight />
            </button>
          </div>
        )}

        {hasDoc && (
          <div class="losh-group">
            <button type="button" class="losh-icon-btn" onClick={() => controllerRef.current?.zoomOut()} aria-label={t('zoom.out')} title={`${t('zoom.out')} (−)`}>
              <IconMinus />
            </button>
            <select
              class="losh-zoom"
              aria-label={t('zoom.label')}
              value={zoomSelectValue === 'custom' ? String(zoom.preset) : zoomSelectValue}
              onChange={(e) => {
                const v = (e.currentTarget as HTMLSelectElement).value;
                controllerRef.current?.setZoom(v === 'page-fit' || v === 'page-width' ? v : Number(v));
              }}
            >
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

        <button type="button" class="losh-icon-btn" onClick={() => setHelpOpen(true)} aria-label={t('help.open')} title={`${t('help.open')} (?)`}>
          <IconHelp />
        </button>
      </div>

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

      {settingsOpen && <SettingsPanel settings={settings} update={update} t={t} onClose={() => setSettingsOpen(false)} />}

      <main class="losh-stage">
        <div class="losh-scroll" ref={scrollRef} tabIndex={0} aria-label={status.kind === 'ready' ? status.name : t('app.name')}>
          <div class="pdfViewer" />
        </div>
        <div class="losh-warm" aria-hidden="true" />

        {status.kind !== 'ready' && (
          <div class="losh-empty">
            {status.kind === 'loading' ? (
              <p class="losh-loading" role="status">
                {t('loading')}
              </p>
            ) : (
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

      <div class="losh-toast" role="status" aria-live="polite">
        {toast && <span>{toast}</span>}
      </div>

      {helpOpen && <HelpDialog t={t} onClose={() => setHelpOpen(false)} />}
    </div>
  );
}
