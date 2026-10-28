import type { Locale } from '@losh/core';

// Inline SVG flags: flag emoji don't render on Windows (they show letters like "TR").
// Each flag fills a small 3:2 box; ids are prefixed so several flags can share a page.
const FLAGS: Record<Locale, (id: string) => preact.JSX.Element> = {
  tr: () => (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <rect width="1200" height="800" fill="#e30a17" />
      <circle cx="425" cy="400" r="200" fill="#fff" />
      <circle cx="475" cy="400" r="160" fill="#e30a17" />
      <polygon fill="#fff" points="483.3,400 552.4,377.5 552.4,304.9 595.1,363.7 664.2,341.2 621.5,400 664.2,458.8 595.1,436.3 552.4,495.1 552.4,422.5" />
    </svg>
  ),
  en: (id) => (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice">
      <clipPath id={`${id}-t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clip-path={`url(#${id}-t)`} stroke="#c8102e" stroke-width="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" stroke-width="6" />
    </svg>
  ),
  es: () => (
    <svg viewBox="0 0 750 500" preserveAspectRatio="xMidYMid slice">
      <rect width="750" height="500" fill="#c60b1e" />
      <rect y="125" width="750" height="250" fill="#ffc400" />
    </svg>
  ),
  fr: () => (
    <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice">
      <rect width="1" height="2" fill="#002654" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#ce1126" />
    </svg>
  ),
  ru: () => (
    <svg viewBox="0 0 9 6" preserveAspectRatio="xMidYMid slice">
      <rect width="9" height="2" fill="#fff" />
      <rect y="2" width="9" height="2" fill="#0039a6" />
      <rect y="4" width="9" height="2" fill="#d52b1e" />
    </svg>
  ),
};

export function Flag({ locale }: { locale: Locale }) {
  return (
    <span class="flag" aria-hidden="true">
      {FLAGS[locale](`flag-${locale}`)}
    </span>
  );
}
