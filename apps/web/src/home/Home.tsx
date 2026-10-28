import { useEffect, useRef, useState } from 'preact/hooks';
import { PROJECT, SUPPORT, translate, type KeyValueStore, type MessageKey } from '@losh/core';
import { Logo, useSettings } from '@losh/viewer/settings';
import { LanguageMenu } from './LanguageMenu';
import { NavMenu } from './NavMenu';
import { useReveal } from './useReveal';

/** Stagger delay for reveal animations. */
const delay = (ms: number) => ({ '--d': `${ms}ms` }) as Record<string, string>;

const READER_HREF = './app/';

const FEATURES: { title: MessageKey; text: MessageKey; icon: string }[] = [
  { title: 'home.feature.modes.title', text: 'home.feature.modes.text', icon: 'M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z' },
  { title: 'home.feature.private.title', text: 'home.feature.private.text', icon: 'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5zM12 14v3' },
  { title: 'home.feature.free.title', text: 'home.feature.free.text', icon: 'M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z' },
];

/** Page sections in the top bar; ids are the same in every language so links can be shared. */
const NAV: { id: string; label: MessageKey }[] = [
  { id: 'install', label: 'home.nav.install' },
  { id: 'guide', label: 'home.nav.guide' },
  { id: 'faq', label: 'home.nav.faq' },
  { id: 'support', label: 'home.nav.support' },
];

const PREVIEWS = [
  { mode: 'normal', label: 'mode.normal' },
  { mode: 'sepia', label: 'mode.sepia' },
  { mode: 'night', label: 'mode.night' },
] as const;

export function Home({ store }: { store: KeyValueStore }) {
  const [settings, update, loaded] = useSettings(store);
  const t = (key: MessageKey, params?: Record<string, string | number>) => translate(settings.locale, key, params);
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef, loaded);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.lang = settings.locale;
    document.title = `${t('app.name')} — ${t('app.tagline')}`;
  }, [settings.locale]);

  // Wait for the saved language (a few ms) so English users don't see a Turkish flash.
  if (!loaded) return null;

  return (
    <div class="home" id="top" ref={rootRef}>
      <header class={`home-top${stuck ? ' is-stuck' : ''}`}>
        <div class="home-top-inner">
          <a class="home-brand" href="#top" aria-label={t('app.name')}>
            <Logo size={34} id="home-logo-small" />
            <span class="home-wordmark losh-gradient-text">Losh</span>
          </a>
          <nav class="home-nav" aria-label={t('home.nav.label')}>
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`}>
                {t(n.label)}
              </a>
            ))}
          </nav>
          <div class="home-top-end">
            <LanguageMenu locale={settings.locale} label={t('home.languageMenu')} onChange={(locale) => update({ locale })} />
            <NavMenu links={NAV.map((n) => ({ href: `#${n.id}`, label: t(n.label) }))} label={t('home.nav.menu')} />
          </div>
        </div>
      </header>

      <main>
        <section class="home-hero">
          <div data-reveal style={delay(0)}>
            <Logo size={132} glow id="home-logo-hero" class="home-hero-logo" />
          </div>
          <p class="home-eyebrow" data-reveal style={delay(90)}>
            {t('home.hello')}
          </p>
          <h1 data-reveal style={delay(170)}>
            {t('home.title')}
          </h1>
          <p class="home-lead" data-reveal style={delay(250)}>
            {t('home.subtitle')}
          </p>
          <a class="home-start" href={READER_HREF} data-reveal style={delay(340)}>
            {t('home.start')}
            <svg class="home-start-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <p class="home-note" data-reveal style={delay(420)}>
            {t('open.privacy')}
          </p>
        </section>

        <section class="home-preview" aria-label={t('home.preview.label')}>
          <div class="home-pages">
            {PREVIEWS.map((p, i) => (
              <figure class="home-page" data-mode={p.mode} key={p.mode} data-reveal style={delay(i * 120)}>
                <div class="home-sheet" aria-hidden="true">
                  <span class="home-line home-line-title" />
                  <span class="home-line" />
                  <span class="home-line" />
                  <span class="home-line home-line-short" />
                  <span class="home-line" />
                  <span class="home-line" />
                  <span class="home-line home-line-short" />
                </div>
                <figcaption>{t(p.label)}</figcaption>
              </figure>
            ))}
          </div>
          <p class="home-preview-label" data-reveal style={delay(360)}>{t('home.preview.label')}</p>
        </section>

        <section class="home-features" aria-labelledby="home-features-title">
          <h2 id="home-features-title" data-reveal>{t('home.featuresTitle')}</h2>
          <ul>
            {FEATURES.map((f, i) => (
              <li key={f.title} data-reveal style={delay(100 + i * 120)}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d={f.icon} />
                </svg>
                <h3>{t(f.title)}</h3>
                <p>{t(f.text)}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Phase 4: install guide, how-to and FAQ fill these. */}
        {NAV.filter((n) => n.id !== 'support').map((n) => (
          <section class="home-section" id={n.id} key={n.id} aria-labelledby={`home-${n.id}-title`}>
            <h2 id={`home-${n.id}-title`} data-reveal>
              {t(n.label)}
            </h2>
          </section>
        ))}

        <section class="home-support" id="support" aria-labelledby="home-support-title" data-reveal>
          <h2 id="home-support-title">{t('home.support.title')}</h2>
          <p>{t('home.support.text')}</p>
          {SUPPORT.enabled ? (
            <a class="home-support-btn" href={SUPPORT.url} target="_blank" rel="noopener noreferrer">
              {t('home.support.button')}
            </a>
          ) : (
            <p class="home-soon">{t('home.support.soon')}</p>
          )}
        </section>
      </main>

      <footer class="home-footer" data-reveal>
        <p>
          {t('home.footer.maker', { name: PROJECT.maker })} ·{' '}
          <a href={PROJECT.githubUrl} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
        <p class="home-medical">{t('home.footer.medical')}</p>
      </footer>
    </div>
  );
}
