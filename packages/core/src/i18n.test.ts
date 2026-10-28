import { describe, expect, it } from 'vitest';
import { detectLocale, LOCALE_NAMES, MESSAGES, translate } from './i18n';
import { LOCALES } from './settings';

describe('i18n', () => {
  it('has the same keys in every language', () => {
    const reference = Object.keys(MESSAGES.tr).sort();
    for (const [locale, messages] of Object.entries(MESSAGES)) expect(Object.keys(messages).sort(), locale).toEqual(reference);
  });

  it('has a native name for every language', () => {
    for (const locale of LOCALES) expect(LOCALE_NAMES[locale]).toBeTruthy();
  });

  it('keeps the same placeholders in every translation', () => {
    const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
    for (const [locale, messages] of Object.entries(MESSAGES)) {
      for (const [key, text] of Object.entries(messages)) {
        expect(placeholders(text), `${locale} ${key}`).toEqual(placeholders(MESSAGES.tr[key as keyof typeof MESSAGES.tr]));
      }
    }
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

  it('detects supported languages, falling back to Turkish', () => {
    expect(detectLocale(['tr-TR', 'en-US'])).toBe('tr');
    expect(detectLocale(['en-GB'])).toBe('en');
    expect(detectLocale(['es-MX'])).toBe('es');
    expect(detectLocale(['fr-CA', 'en'])).toBe('fr');
    expect(detectLocale(['ru'])).toBe('ru');
    expect(detectLocale(['de-DE'])).toBe('tr');
    expect(detectLocale([])).toBe('tr');
  });
});
