import { useEffect, useRef, useState } from 'preact/hooks';
import { LOCALE_NAMES, LOCALES, type Locale } from '@losh/core';
import { Flag } from './Flag';

interface Props {
  locale: Locale;
  /** Accessible name of the menu, in the current language. */
  label: string;
  onChange(locale: Locale): void;
}

/** "🌐 Language" button that opens a small list of languages. */
export function LanguageMenu({ locale, label, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  const items = () => Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []);

  // Focus the current language when the menu opens.
  useEffect(() => {
    if (open) items().find((el) => el.getAttribute('aria-checked') === 'true')?.focus();
  }, [open]);

  // A click anywhere outside closes the menu (listener lives for the component's lifetime, so it is never late).
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, []);

  const close = () => {
    setOpen(false);
    button.current?.focus();
  };

  const onMenuKey = (e: KeyboardEvent) => {
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = (i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length;
      list[next]?.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div
      class="lang"
      ref={root}
      onKeyDown={(e) => {
        // Escape closes the menu whether focus is on the button or on an item.
        if (e.key === 'Escape' && open) {
          e.preventDefault();
          close();
        }
      }}
    >
      <button
        ref={button}
        type="button"
        class="lang-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Language — ${label}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <svg class="lang-globe" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
        </svg>
        <span>Language</span>
        <svg class="lang-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div class="lang-menu" role="menu" aria-label={label} onKeyDown={onMenuKey}>
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitemradio"
              aria-checked={l === locale}
              lang={l}
              class="lang-item"
              onClick={() => {
                onChange(l);
                close();
              }}
            >
              <span class="lang-name">
                <Flag locale={l} />
                {LOCALE_NAMES[l]}
              </span>
              {l === locale && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="m5 12 5 5 9-10" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
