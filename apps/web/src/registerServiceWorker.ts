/**
 * Installs the service worker (a small background script that keeps Losh on the device so it opens offline).
 * Paths are relative to the current page, so both the welcome page and /app/ point at the one /sw.js.
 */
export function registerServiceWorker(swUrl: string, scope: string): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl, { scope }).catch((err: unknown) => console.error(err));
  });
}
