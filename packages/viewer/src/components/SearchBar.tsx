import { useEffect, useRef, useState } from 'preact/hooks';
import type { MessageKey } from '@losh/core';
import type { SearchState } from '../pdf/controller';
import { IconChevronDown, IconChevronUp, IconClose } from './icons';

interface Props {
  state: SearchState;
  t(key: MessageKey, params?: Record<string, string | number>): string;
  onSearch(query: string, options?: { again?: boolean; previous?: boolean }): void;
  onClose(): void;
  /** Bumped by the parent to re-focus the field (e.g. Ctrl+F while already open). */
  focusSignal: number;
}

export function SearchBar({ state, t, onSearch, onClose, focusSignal }: Props) {
  const [query, setQuery] = useState(state.query);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
    input.current?.select();
  }, [focusSignal]);

  const status = !query ? '' : state.notFound ? t('search.notFound') : state.total ? t('search.count', { current: state.current, total: state.total }) : '';

  return (
    <div class="losh-search" role="search">
      <input
        ref={input}
        type="search"
        value={query}
        placeholder={t('search.placeholder')}
        aria-label={t('search.open')}
        onInput={(e) => {
          const q = (e.currentTarget as HTMLInputElement).value;
          setQuery(q);
          onSearch(q);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSearch(query, { again: true, previous: e.shiftKey });
          }
        }}
      />
      <span class="losh-search-status" aria-live="polite">
        {status}
      </span>
      <button type="button" class="losh-icon-btn" onClick={() => onSearch(query, { again: true, previous: true })} aria-label={t('search.prev')} title={t('search.prev')} disabled={!query}>
        <IconChevronUp />
      </button>
      <button type="button" class="losh-icon-btn" onClick={() => onSearch(query, { again: true })} aria-label={t('search.next')} title={t('search.next')} disabled={!query}>
        <IconChevronDown />
      </button>
      <button type="button" class="losh-icon-btn" onClick={onClose} aria-label={t('search.close')} title={t('search.close')}>
        <IconClose />
      </button>
    </div>
  );
}
