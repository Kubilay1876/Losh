import type { MessageKey } from '@losh/core';

export type ShortcutAction =
  | { type: 'open' }
  | { type: 'cycleMode' }
  | { type: 'pickMode'; index: number }
  | { type: 'prevPage' }
  | { type: 'nextPage' }
  | { type: 'search' }
  | { type: 'zoomIn' }
  | { type: 'zoomOut' }
  | { type: 'fitWidth' }
  | { type: 'settings' }
  | { type: 'help' }
  | { type: 'mark' }
  | { type: 'undo' }
  | { type: 'close' };

/** Shown in the help dialog. Keep in sync with matchShortcut(). */
export const SHORTCUT_HELP: { keys: string[]; label: MessageKey }[] = [
  { keys: ['O'], label: 'shortcut.open' },
  { keys: ['M'], label: 'shortcut.cycleMode' },
  { keys: ['1', '2', '3', '4'], label: 'shortcut.pickMode' },
  { keys: ['←', '→', 'PgUp', 'PgDn'], label: 'shortcut.page' },
  { keys: ['Ctrl + F', '/'], label: 'shortcut.search' },
  { keys: ['+', '−'], label: 'shortcut.zoom' },
  { keys: ['0'], label: 'shortcut.fitWidth' },
  { keys: ['S'], label: 'shortcut.settings' },
  { keys: ['H'], label: 'shortcut.mark' },
  { keys: ['Ctrl + Z'], label: 'shortcut.undo' },
  { keys: ['?'], label: 'shortcut.help' },
  { keys: ['Esc'], label: 'shortcut.close' },
];

export interface KeyInput {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  /** True when focus is in a text field, where plain keys must keep typing. */
  inTextField: boolean;
}

export function matchShortcut(e: KeyInput): ShortcutAction | null {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && !e.altKey && e.key.toLowerCase() === 'f') return { type: 'search' };
  if (mod && !e.altKey && !e.inTextField && e.key.toLowerCase() === 'z') return { type: 'undo' };
  if (e.key === 'Escape') return { type: 'close' };
  if (e.inTextField || mod || e.altKey) return null;

  switch (e.key) {
    case 'o':
    case 'O':
      return { type: 'open' };
    case 'm':
    case 'M':
      return { type: 'cycleMode' };
    case '1':
    case '2':
    case '3':
    case '4':
      return { type: 'pickMode', index: Number(e.key) - 1 };
    case 'ArrowLeft':
    case 'PageUp':
      return { type: 'prevPage' };
    case 'ArrowRight':
    case 'PageDown':
      return { type: 'nextPage' };
    case '/':
      return { type: 'search' };
    case '+':
    case '=':
      return { type: 'zoomIn' };
    case '-':
    case '_':
      return { type: 'zoomOut' };
    case '0':
      return { type: 'fitWidth' };
    case 's':
    case 'S':
      return { type: 'settings' };
    case '?':
      return { type: 'help' };
    case 'h':
    case 'H':
      return { type: 'mark' };
    default:
      return null;
  }
}

export function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  return target instanceof HTMLInputElement && !['button', 'checkbox', 'radio', 'range'].includes(target.type);
}
