import { useState } from 'preact/hooks';
import type { Locale } from '@losh/core';
import { HOME_CONTENT, type PlatformId } from './content';
import { Rich } from './Rich';

/** Delay for the scroll reveal of the n-th item. */
const delay = (ms: number) => ({ '--d': `${ms}ms` }) as Record<string, string>;

interface Shot {
  src: string;
  width: number;
  height: number;
  /** Width on the page, in CSS pixels. */
  shown: number;
}

/**
 * Screenshots under the install steps, by step index. Taken on a Turkish iPhone; the yellow frame
 * marks what to tap, which sits in the same place in every language.
 */
const STEP_SHOTS: Partial<Record<PlatformId, Record<number, Shot[]>>> = {
  ios: {
    1: [{ src: './guide/ios-share-button.webp', width: 300, height: 598, shown: 200 }],
    2: [{ src: './guide/ios-share-sheet.webp', width: 520, height: 924, shown: 240 }],
    3: [
      { src: './guide/ios-add.webp', width: 560, height: 316, shown: 300 },
      { src: './guide/ios-home.webp', width: 360, height: 244, shown: 150 },
    ],
  },
  desktop: {
    1: [{ src: './guide/desktop-install-icon.webp', width: 909, height: 69, shown: 420 }],
  },
};

function detectPlatform(): PlatformId {
  const ua = navigator.userAgent;
  // iPadOS presents itself as a Mac; touch gives it away.
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

function isInstalled(): boolean {
  return matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
}

const PLATFORMS: PlatformId[] = ['ios', 'android', 'desktop'];

export function InstallSection({ locale, title }: { locale: Locale; title: string }) {
  const content = HOME_CONTENT[locale].install;
  const [mine] = useState(detectPlatform);
  const [shown, setShown] = useState<PlatformId>(mine);
  const platform = content.platforms[shown];

  return (
    <section class="home-section" id="install" aria-labelledby="home-install-title">
      <h2 id="home-install-title" data-reveal>
        {title}
      </h2>
      <p class="home-section-intro" data-reveal>
        <Rich text={content.intro} locale={locale} />
      </p>
      {isInstalled() && (
        <p class="home-installed" data-reveal>
          {content.installed}
        </p>
      )}
      <div class="home-tabs" role="tablist" aria-label={title} data-reveal>
        {PLATFORMS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`home-tab-${id}`}
            aria-controls="home-install-panel"
            aria-selected={shown === id}
            class="home-tab"
            onClick={() => setShown(id)}
          >
            {content.platforms[id].name}
            {id === mine && <span class="home-tab-mine">{content.yourDevice}</span>}
          </button>
        ))}
      </div>
      <div class="home-install-card" role="tabpanel" id="home-install-panel" aria-labelledby={`home-tab-${shown}`} data-reveal>
        <ol class="home-steps">
          {platform.steps.map((step, i) => (
            <li key={`${shown}-${i}`}>
              <span class="home-step-no" aria-hidden="true">
                {i + 1}
              </span>
              <span>
                <Rich text={step} locale={locale} />
                {STEP_SHOTS[shown]?.[i] && (
                  <span class="home-shots">
                    {STEP_SHOTS[shown][i].map((shot) => (
                      <img
                        key={shot.src}
                        src={shot.src}
                        width={shot.width}
                        height={shot.height}
                        style={{ width: `${shot.shown}px` }}
                        // The step text right above says what the picture shows.
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ))}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
        {platform.note && (
          <p class="home-install-note">
            <Rich text={platform.note} locale={locale} />
          </p>
        )}
      </div>
    </section>
  );
}

/** Icons for the how-to cards, in the same order as the texts. */
const GUIDE_ICONS = [
  'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M12 18v-6M9 15l3-3 3 3',
  'M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z',
  'M3 4v16M21 4v16M7 8h10M7 12h10M7 16h6',
  'M10 13V5a2 2 0 0 1 4 0v6l4.5.9A2 2 0 0 1 20 14l-.7 4.2A3 3 0 0 1 16.3 21H12a3 3 0 0 1-2.4-1.2L6 15a1.7 1.7 0 0 1 2.6-2.2zM6 6.5a6 6 0 0 1 2-2.8M18 6.5a6 6 0 0 0-2-2.8',
  'M6 3h12v18l-6-4-6 4z',
  'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
];
/** The eye break card closes the how-to list across the full width. */
const GUIDE_WIDE_ITEM = 6;

export function GuideSection({ locale, title }: { locale: Locale; title: string }) {
  const content = HOME_CONTENT[locale].guide;
  return (
    <section class="home-section" id="guide" aria-labelledby="home-guide-title">
      <h2 id="home-guide-title" data-reveal>
        {title}
      </h2>
      <p class="home-section-intro" data-reveal>
        {content.intro}
      </p>
      <ol class="home-guide">
        {content.items.map((item, i) => (
          <li key={i} class={i === GUIDE_WIDE_ITEM ? 'home-guide-wide' : undefined} data-reveal style={delay((i % 3) * 110)}>
            <span class="home-guide-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d={GUIDE_ICONS[i]} />
              </svg>
            </span>
            <h3>{item.title}</h3>
            <p>
              <Rich text={item.text} locale={locale} />
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function FaqSection({ locale, title }: { locale: Locale; title: string }) {
  const content = HOME_CONTENT[locale].faq;
  return (
    <section class="home-section" id="faq" aria-labelledby="home-faq-title">
      <h2 id="home-faq-title" data-reveal>
        {title}
      </h2>
      <p class="home-section-intro" data-reveal>
        {content.intro}
      </p>
      <div class="home-faq">
        {content.items.map((item, i) => (
          <details key={i} data-reveal style={delay(Math.min(i, 4) * 60)}>
            <summary>
              <span>{item.q}</span>
              <svg class="home-faq-caret" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <p>
              <Rich text={item.a} locale={locale} />
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
