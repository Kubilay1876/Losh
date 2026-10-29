import { translate, type Locale, type MessageKey } from '@losh/core';

/** Button names that the texts mention as {start}, {choose}…, taken from the app itself. */
const UI_NAMES: Record<string, MessageKey> = {
  start: 'home.start',
  choose: 'open.choose',
  normal: 'mode.normal',
  sepia: 'mode.sepia',
  night: 'mode.night',
  darkSepia: 'mode.darkSepia',
  recent: 'recent.title',
  settings: 'settings.title',
  clear: 'recent.clear',
  breakReminder: 'settings.breakReminder',
  undo: 'mark.undo',
  erase: 'mark.erase',
};

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

function fill(text: string, locale: Locale): string {
  return text.replace(/\{(\w+)\}/g, (m, name: string) => (UI_NAMES[name] ? translate(locale, UI_NAMES[name]) : m));
}

/** **bold** parts of a piece of text. */
function bold(text: string, key: string) {
  return text.split('**').map((part, i) => (i % 2 ? <strong key={`${key}-${i}`}>{part}</strong> : part));
}

/** A text with {name} placeholders filled in, **bold** parts and [links](https://…). */
export function Rich({ text, locale }: { text: string; locale: Locale }) {
  const filled = fill(text, locale);
  const out = [];
  let at = 0;
  for (const m of filled.matchAll(LINK)) {
    out.push(...bold(filled.slice(at, m.index), `t${at}`));
    const external = /^https?:/.test(m[2]);
    out.push(
      <a key={`a${m.index}`} href={m[2]} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {m[1]}
      </a>,
    );
    at = m.index + m[0].length;
  }
  out.push(...bold(filled.slice(at), `t${at}`));
  return <>{out}</>;
}
