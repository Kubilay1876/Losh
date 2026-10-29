import { describe, expect, it } from 'vitest';
import { matchShortcut, type KeyInput } from './shortcuts';

const key = (k: string, extra: Partial<KeyInput> = {}): KeyInput => ({
  key: k,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  inTextField: false,
  ...extra,
});

describe('matchShortcut', () => {
  it('maps plain keys to actions', () => {
    expect(matchShortcut(key('m'))).toEqual({ type: 'cycleMode' });
    expect(matchShortcut(key('3'))).toEqual({ type: 'pickMode', index: 2 });
    expect(matchShortcut(key('ArrowRight'))).toEqual({ type: 'nextPage' });
    expect(matchShortcut(key('PageUp'))).toEqual({ type: 'prevPage' });
    expect(matchShortcut(key('?'))).toEqual({ type: 'help' });
    expect(matchShortcut(key('h'))).toEqual({ type: 'mark' });
  });

  it('undoes the last mark with Ctrl+Z, but not while typing', () => {
    expect(matchShortcut(key('z', { ctrlKey: true }))).toEqual({ type: 'undo' });
    expect(matchShortcut(key('Z', { metaKey: true }))).toEqual({ type: 'undo' });
    expect(matchShortcut(key('z', { ctrlKey: true, inTextField: true }))).toBeNull();
  });

  it('opens search with Ctrl+F, Cmd+F and /', () => {
    expect(matchShortcut(key('f', { ctrlKey: true }))).toEqual({ type: 'search' });
    expect(matchShortcut(key('F', { metaKey: true }))).toEqual({ type: 'search' });
    expect(matchShortcut(key('/'))).toEqual({ type: 'search' });
  });

  it('ignores plain keys while typing, but not Escape or Ctrl+F', () => {
    expect(matchShortcut(key('m', { inTextField: true }))).toBeNull();
    expect(matchShortcut(key('Escape', { inTextField: true }))).toEqual({ type: 'close' });
    expect(matchShortcut(key('f', { ctrlKey: true, inTextField: true }))).toEqual({ type: 'search' });
  });

  it('leaves other browser shortcuts alone', () => {
    expect(matchShortcut(key('s', { ctrlKey: true }))).toBeNull();
    expect(matchShortcut(key('1', { altKey: true }))).toBeNull();
    expect(matchShortcut(key('x'))).toBeNull();
  });
});
