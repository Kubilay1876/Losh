import { useState } from 'preact/hooks';
import type { Locale, MessageKey } from '@losh/core';
import type { RecentEntry } from '../library';
import { IconBook, IconClose, IconFile, IconSearch } from './icons';

export interface RecentItem extends RecentEntry {
  /** Last read page, if known. */
  page?: number;
  /** Page count of the book, if known (saved along with the page since the "continue" card came). */
  total?: number;
}

interface Props {
  items: RecentItem[];
  locale: Locale;
  t(key: MessageKey, params?: Record<string, string | number>): string;
  onOpen(key: string): void;
  onRemove(key: string): void;
  onClear(): void;
}

/** The search box shows up once the list is longer than this. */
const SEARCH_FROM = 6;

/** "12.4 MB" / "830 kB" in the reader's language. */
export function formatSize(bytes: number, locale: Locale): string {
  const mb = bytes / 1_000_000;
  const [value, unit] = mb >= 1 ? [mb, 'megabyte'] : [Math.max(1, bytes / 1000), 'kilobyte'];
  return new Intl.NumberFormat(locale, { style: 'unit', unit, maximumFractionDigits: mb >= 10 || mb < 1 ? 0 : 1 }).format(value);
}

/** For searching: lower case, without accents, and Turkish dotless ı as i, so "isik" finds "Işık". */
function simplify(text: string, locale: Locale): string {
  return text.toLocaleLowerCase(locale).replace(/ı/g, 'i').normalize('NFD').replace(/\p{M}/gu, '');
}

function RemoveButton({ item, t, onRemove }: { item: RecentItem; t: Props['t']; onRemove(key: string): void }) {
  const label = t('recent.remove', { name: item.name });
  return (
    <button type="button" class="losh-icon-btn" onClick={() => onRemove(item.key)} aria-label={label} title={label}>
      <IconClose />
    </button>
  );
}

export function RecentList({ items, locale, t, onOpen, onRemove, onClear }: Props) {
  const [query, setQuery] = useState('');
  const total = items.reduce((sum, i) => sum + i.size, 0);
  const wanted = simplify(query.trim(), locale);
  // While searching, every book is a plain row; otherwise the latest one gets the big "continue" card.
  const [latest, rest] = wanted ? [null, items.filter((i) => simplify(i.name, locale).includes(wanted))] : [items[0], items.slice(1)];
  const percent = latest?.page && latest.total ? Math.round((latest.page / latest.total) * 100) : null;

  return (
    <section class="losh-recent" aria-labelledby="losh-recent-title">
      <h2 id="losh-recent-title">{t('recent.title')}</h2>

      {latest && (
        <div class="losh-continue">
          <button type="button" class="losh-continue-open" onClick={() => onOpen(latest.key)}>
            <span class="losh-continue-label">
              <IconBook />
              {t('recent.continue')}
            </span>
            <span class="losh-continue-name">{latest.name}</span>
            <span class="losh-recent-meta">
              {percent !== null
                ? t('recent.progress', { page: latest.page!, total: latest.total!, percent })
                : [formatSize(latest.size, locale), latest.page && latest.page > 1 ? t('recent.page', { page: latest.page }) : ''].filter(Boolean).join(' · ')}
            </span>
            {percent !== null && (
              <span class="losh-progress" aria-hidden="true">
                <span style={{ width: `${Math.max(2, percent)}%` }} />
              </span>
            )}
          </button>
          <RemoveButton item={latest} t={t} onRemove={onRemove} />
        </div>
      )}

      {items.length > SEARCH_FROM && (
        <label class="losh-recent-search">
          <IconSearch />
          <input type="search" placeholder={t('recent.search')} aria-label={t('recent.search')} value={query} onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)} />
        </label>
      )}

      {rest.length > 0 && (
        <ul>
          {rest.map((item) => (
            <li key={item.key}>
              <button type="button" class="losh-recent-open" onClick={() => onOpen(item.key)}>
                <IconFile />
                <span class="losh-recent-text">
                  <span class="losh-recent-name">{item.name}</span>
                  <span class="losh-recent-meta">
                    {formatSize(item.size, locale)}
                    {item.page && item.page > 1
                      ? ` · ${item.total ? t('recent.pageOf', { page: item.page, total: item.total }) : t('recent.page', { page: item.page })}`
                      : ''}
                  </span>
                </span>
              </button>
              <RemoveButton item={item} t={t} onRemove={onRemove} />
            </li>
          ))}
        </ul>
      )}
      {wanted && !rest.length && (
        <p class="losh-recent-empty" role="status">
          {t('recent.noMatch', { query: query.trim() })}
        </p>
      )}

      <p class="losh-recent-foot">
        <span>{t('recent.usage', { size: formatSize(total, locale) })}</span>
        <button type="button" class="losh-link-btn" onClick={onClear}>
          {t('recent.clear')}
        </button>
      </p>
    </section>
  );
}
