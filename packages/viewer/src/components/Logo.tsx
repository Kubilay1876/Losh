// The Losh mark: a rounded "L" tube and a crescent moon on a dark tile.
// Drawn on a 1024 grid; the tile spans 140–885. `glow` adds the neon halo for large sizes.

/** Tube centre line of the "L" (stroked, so it reads as a hollow neon tube). */
export const LOGO_L_PATH =
  'M335 330A47.5 47.5 0 0 1 430 330L430 620Q430 640 450 640L655 640A47.5 47.5 0 0 1 655 735L382.5 735A47.5 47.5 0 0 1 335 687.5Z';

interface LogoProps {
  size: number;
  /** Neon halo; use only for large sizes (it blurs into mush when tiny). */
  glow?: boolean;
  /** Draw the dark rounded tile behind the mark. */
  tile?: boolean;
  /** Unique per instance on a page: SVG ids are document-wide. */
  id: string;
  class?: string;
}

export function Logo({ size, glow = false, tile = true, id, class: className }: LogoProps) {
  // Crop to the tile so small sizes use every pixel; keep a margin for the halo when glowing.
  const viewBox = glow ? '60 55 905 905' : tile ? '140 135 745 745' : '300 250 470 520';
  const lGrad = `${id}-l`;
  const moonGrad = `${id}-m`;
  const moonMask = `${id}-mask`;
  const halo = `${id}-halo`;

  const mark = (
    <>
      <path d={LOGO_L_PATH} fill="none" stroke={`url(#${lGrad})`} stroke-width="50" stroke-linejoin="round" />
      <rect x="440" y="260" width="320" height="340" fill={`url(#${moonGrad})`} mask={`url(#${moonMask})`} />
    </>
  );

  return (
    <svg class={className} width={size} height={size} viewBox={viewBox} role="img" aria-label="Losh">
      <defs>
        <linearGradient id={lGrad} gradientUnits="userSpaceOnUse" x1="320" y1="270" x2="740" y2="760">
          <stop offset="0" stop-color="#8b5cff" />
          <stop offset="0.48" stop-color="#ef3fb4" />
          <stop offset="0.75" stop-color="#ff8f5e" />
          <stop offset="1" stop-color="#f9cd4f" />
        </linearGradient>
        <linearGradient id={moonGrad} gradientUnits="userSpaceOnUse" x1="490" y1="580" x2="740" y2="330">
          <stop offset="0" stop-color="#b45cff" />
          <stop offset="0.35" stop-color="#ff6fae" />
          <stop offset="0.7" stop-color="#ffa45e" />
          <stop offset="1" stop-color="#f9d04f" />
        </linearGradient>
        <mask id={moonMask}>
          <circle cx="588" cy="428" r="148" fill="#fff" />
          <circle cx="530" cy="372" r="128" fill="#000" />
        </mask>
        {glow && (
          <filter id={halo} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="26" />
          </filter>
        )}
      </defs>
      {tile && (
        <>
          {glow && <rect x="140" y="135" width="745" height="745" rx="170" fill="none" stroke="#6b4cff" stroke-width="10" opacity="0.55" filter={`url(#${halo})`} />}
          <rect x="140" y="135" width="745" height="745" rx="170" fill="#0c0817" stroke="#4a37a8" stroke-opacity="0.8" stroke-width="5" />
        </>
      )}
      {glow && (
        <g filter={`url(#${halo})`}>
          {mark}
        </g>
      )}
      {mark}
    </svg>
  );
}
