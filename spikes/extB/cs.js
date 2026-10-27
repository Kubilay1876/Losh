// Spike B: does a content script run on a top-level PDF, and does a CSS filter on <html> tint it?
const root = document.documentElement;
root.dataset.loshCs = (root.dataset.loshCs || '') + `[${location.href} ct=${document.contentType}]`;
if (document.contentType === 'application/pdf') {
  root.style.filter = 'invert(0.9) hue-rotate(180deg)';
  root.dataset.loshApplied = '1';
}
