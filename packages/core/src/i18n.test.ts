import { describe, expect, it } from 'vitest';
import { detectLocale, MESSAGES, translate } from './i18n';

describe('i18n', () => {
  it('has the same keys in every language', () => {
    expect(Object.keys(MESSAGES.en).sort()).toEqual(Object.keys(MESSAGES.tr).sort());
  });

  it('has no empty messages', () => {
    for (const messages of Object.values(MESSAGES)) {
      for (const [key, text] of Object.entries(messages)) expect(text, key).not.toBe('');
    }
  });

  it('fills placeholders', () => {
    expect(translate('tr', 'resume.toast', { page: 42 })).toBe('Kaldığın yerden devam: sayfa 42');
    expect(translate('en', 'search.count', { current: 2, total: 9 })).toBe('2 of 9');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(translate('en', 'page.of', {})).toBe('/ {total}');
  });

  it('detects Turkish and English, falling back to Turkish', () => {
    expect(detectLocale(['tr-TR', 'en-US'])).toBe('tr');
    expect(detectLocale(['en-GB'])).toBe('en');
    expect(detectLocale(['de-DE'])).toBe('tr');
    expect(detectLocale([])).toBe('tr');
  });
});
