/**
 * Project-wide settings that change rarely. Edit here, nowhere else.
 */
export const PROJECT = {
  /** Shown in the footer (surname initial only). */
  maker: 'Kubilay Ç.',
  githubUser: 'Kubilay1876',
  githubUrl: 'https://github.com/Kubilay1876',
} as const;

/**
 * Donation link. Keep `enabled: false` until the GitHub Sponsors profile is approved;
 * then switch it to true and the "Destek ol" buttons appear everywhere.
 */
export const SUPPORT = {
  enabled: false,
  url: 'https://github.com/sponsors/Kubilay1876',
} as const;
