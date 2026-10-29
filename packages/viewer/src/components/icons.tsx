// Small inline icons (24×24, stroke = currentColor) so nothing is loaded from the network.
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 1.8,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'aria-hidden': 'true',
} as const;

export const IconOpen = () => (
  <svg {...base}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M12 18v-6M9 15l3-3 3 3" />
  </svg>
);

export const IconSliders = () => (
  <svg {...base}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);

export const IconSearch = () => (
  <svg {...base}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
);

export const IconHelp = () => (
  <svg {...base}>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
  </svg>
);

export const IconChevronLeft = () => (
  <svg {...base}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);

export const IconChevronRight = () => (
  <svg {...base}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const IconChevronUp = () => (
  <svg {...base}>
    <path d="m6 15 6-6 6 6" />
  </svg>
);

export const IconChevronDown = () => (
  <svg {...base}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconPlus = () => (
  <svg {...base}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/** Lines of text reaching right up to the page edges. */
export const IconFitText = () => (
  <svg {...base}>
    <path d="M3 4v16M21 4v16M7 8h10M7 12h10M7 16h6" />
  </svg>
);

export const IconMinus = () => (
  <svg {...base}>
    <path d="M5 12h14" />
  </svg>
);

// Reading mode icons (16 px).
const small = { ...base, width: 16, height: 16, 'stroke-width': 2 } as const;

export const IconSun = () => (
  <svg {...small}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </svg>
);

export const IconBook = () => (
  <svg {...small}>
    <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5v13" />
  </svg>
);

export const IconMoon = () => (
  <svg {...small}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </svg>
);

export const IconCandle = () => (
  <svg {...small}>
    <path d="M12 2.5c1.8 2 2.6 3.4 2.6 4.7a2.6 2.6 0 0 1-5.2 0c0-1.3.8-2.7 2.6-4.7z" />
    <path d="M9 12h6v9.5H9zM12 10v2" />
  </svg>
);

export const IconClose = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconFile = () => (
  <svg {...base}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);

/** Highlighter: a marker with a chisel tip over a stroke of colour. */
export const IconHighlighter = () => (
  <svg {...base}>
    <path d="m14.5 3.5 6 6-8.5 8.5-6-6z" />
    <path d="m6 12-1.5 4.5 3 3L12 18" />
    <path d="M3 21h6" />
  </svg>
);

export const IconEraser = () => (
  <svg {...base}>
    <path d="M9 20h11" />
    <path d="M4.7 14.3 13.3 5.7a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L11 20H9.4z" />
    <path d="m9 10 5 5" />
  </svg>
);

export const IconUndo = () => (
  <svg {...base}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </svg>
);
