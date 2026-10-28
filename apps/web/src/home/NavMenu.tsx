import { useEffect, useRef, useState } from 'preact/hooks';

export interface NavLink {
  href: string;
  label: string;
}

interface Props {
  links: NavLink[];
  /** Accessible name of the button, in the current language. */
  label: string;
}

/** Phones: the page sections behind a "☰" button, since they don't fit next to the logo. */
export function NavMenu({ links, label }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) root.current?.querySelector<HTMLAnchorElement>('.nav-menu a')?.focus();
  }, [open]);

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, []);

  return (
    <div
      class="nav-more"
      ref={root}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.preventDefault();
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <button ref={button} type="button" class="nav-more-button" aria-expanded={open} aria-label={label} onClick={() => setOpen((o) => !o)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <nav class="nav-menu" aria-label={label}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
