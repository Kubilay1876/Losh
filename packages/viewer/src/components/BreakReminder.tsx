import { useEffect, useRef, useState } from 'preact/hooks';
import { BREAK_SECONDS, type MessageKey } from '@losh/core';

interface Props {
  t(key: MessageKey, params?: Record<string, string | number>): string;
  /** The break is over or was skipped. */
  onDone(): void;
  onSnooze(): void;
}

/** After the break, the screen goes away by itself after this long. */
const CLOSE_AFTER_MS = 5000;
const RING_RADIUS = 52;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/** The 20-second eye break: first look far away, then blink, then back to reading. */
export function BreakReminder({ t, onDone, onSnooze }: Props) {
  const [left, setLeft] = useState(BREAK_SECONDS);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const remaining = Math.max(0, BREAK_SECONDS - Math.floor((Date.now() - start) / 1000));
      setLeft(remaining);
      if (!remaining) clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, []);

  const finished = left === 0;
  useEffect(() => {
    // Keyboard focus inside the break screen, on its main button once there is one.
    ref.current?.querySelector<HTMLButtonElement>(finished ? '.losh-btn-primary' : 'button')?.focus();
    if (!finished) return;
    const id = setTimeout(onDone, CLOSE_AFTER_MS);
    return () => clearTimeout(id);
  }, [finished]);

  const text = finished ? t('break.done') : left > BREAK_SECONDS / 2 ? t('break.look') : t('break.blink');

  return (
    <div
      class="losh-break"
      role="dialog"
      aria-modal="true"
      aria-labelledby="losh-break-title"
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onDone();
      }}
    >
      <div class="losh-break-card" data-done={finished}>
        <p class="losh-break-title" id="losh-break-title">
          {t('break.title')}
        </p>
        <div class="losh-break-ring" aria-hidden="true">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r={RING_RADIUS} class="losh-break-track" />
            <circle
              cx="64"
              cy="64"
              r={RING_RADIUS}
              class="losh-break-progress"
              stroke-dasharray={RING_LENGTH}
              stroke-dashoffset={RING_LENGTH * (left / BREAK_SECONDS)}
            />
          </svg>
          <span class="losh-break-count">{finished ? '✓' : left}</span>
        </div>
        <div aria-live="polite">
          {/* Keyed by the text, so each new instruction fades in. */}
          <p class="losh-break-text" key={text}>
            {text}
          </p>
        </div>
        <div class="losh-break-actions">
          {finished ? (
            <button type="button" class="losh-btn losh-btn-primary" onClick={onDone}>
              {t('break.back')}
            </button>
          ) : (
            <>
              <button type="button" class="losh-text-btn" onClick={onDone}>
                {t('break.skip')}
              </button>
              {/* No highlighted button while resting: the break itself is the point. */}
              <button type="button" class="losh-text-btn" onClick={onSnooze}>
                {t('break.snooze')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
