import 'pdfjs-dist/legacy/web/pdf_viewer.css';
import './theme.css';
import './styles.css';
import { render } from 'preact';
import { Reader, type ReaderProps } from './components/Reader';

export { Reader, type ReaderProps } from './components/Reader';
export { createLocalStore } from './localStore';

/** Mounts the full Losh reader into an element. */
export function mountReader(el: HTMLElement, props: ReaderProps): () => void {
  render(<Reader {...props} />, el);
  return () => render(null, el);
}
