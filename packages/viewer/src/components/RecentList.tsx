import type { Locale, MessageKey } from '@losh/core';
import type { RecentEntry } from '../library';
import { IconClose, IconFile } from './icons';

export interface RecentItem extends RecentEntry {
  /** Last read page, if known. */
  page?: number;
}

interface Props {
  items: RecentItem[];
  locale: Locale;
  t(key: MessageKey, params?: Record<string, string | number>): string;
  onOpen(key: string): void;
  onRemove(key: string): void;
  onClear(): void;
}

/** "12.4 MB" / "830 kB" in the reader's language. */
export function formatSize(bytes: number, locale: Locale): string {
  const mb = bytes / 1_000_000;
  const [value, unit] = mb >= 1 ? [mb, 'megabyte'] : [Math.max(1, bytes / 1000), 'kilobyte'];
  return new Intl.NumberFormat(locale, { style: 'unit', unit, maximumFractionDigits: mb >= 10 || mb < 1 ? 0 : 1 }).format(value);
}

export function RecentList({ items, locale, t, onOpen, onRemove, onClear }: Props) {
  const total = items.reduce((sum, i) => sum + i.size, 0);
  return (
    <section class="losh-recent" aria-labelledby="losh-recent-title">
      <h2 id="losh-recent-title">{t('recent.title')}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.key}>
            <button type="button" class="losh-recent-open" onClick={() => onOpen(item.key)}>
              <IconFile />
              <span class="losh-recent-text">
                <span class="losh-recent-name">{item.name}</span>
                <span class="losh-recent-meta">
                  {formatSize(item.size, locale)}
                  {item.page && item.page > 1 ? ` · ${t('recent.page', { page: item.page })}` : ''}
                </span>
              </span>
            </button>
            <button
              type="button"
              class="losh-icon-btn"
              onClick={() => onRemove(item.key)}
              aria-label={t('recent.remove', { name: item.name })}
              title={t('recent.remove', { name: item.name })}
            >
              <IconClose />
            </button>
          </li>
        ))}
      </ul>
      <p class="losh-recent-foot">
        <span>{t('recent.usage', { size: formatSize(total, locale) })}</span>
        <button type="button" class="losh-link-btn" onClick={onClear}>
          {t('recent.clear')}
        </button>
      </p>
    </section>
  );
}
