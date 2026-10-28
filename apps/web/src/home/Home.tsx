import { useEffect } from 'preact/hooks';
import { PROJECT, SUPPORT, translate, type KeyValueStore, type MessageKey } from '@losh/core';
import { useSettings } from '@losh/viewer/settings';

const READER_HREF = './app/';

const FEATURES: { title: MessageKey; text: MessageKey; icon: string }[] = [
  { title: 'home.feature.modes.title', text: 'home.feature.modes.text', icon: 'M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z' },
  { title: 'home.feature.private.title', text: 'home.feature.private.text', icon: 'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5zM12 14v3' },
  { title: 'home.feature.free.title', text: 'home.feature.free.text', icon: 'M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z' },
];

const PREVIEWS = [
  { mode: 'normal', label: 'mode.normal' },
  { mode: 'sepia', label: 'mode.sepia' },
  { mode: 'night', label: 'mode.night' },
] as const;

export function Home({ store }: { store: KeyValueStore }) {
  const [settings, update, loaded] = useSettings(store);
  const t = (key: MessageKey, params?: Record<string, string | number>) => translate(settings.locale, key, params);

  useEffect(() => {
    document.documentElement.lang = settings.locale;
    document.title = `${t('app.name')} — ${t('app.tagline')}`;
  }, [settings.locale]);

  // Wait for the saved language (a few ms) so English users don't see a Turkish flash.
  if (!loaded) return null;

  return (
    <div class="home">
      <header class="home-top">
        <span class="home-wordmark losh-gradient-text">Loş</span>
        <button type="button" class="home-lang" onClick={() => update({ locale: settings.locale === 'tr' ? 'en' : 'tr' })}>
          {t('home.switchLanguage')}
        </button>
      </header>

      <main>
        <section class="home-hero">
          <p class="home-eyebrow">{t('home.hello')}</p>
          <h1>{t('home.title')}</h1>
          <p class="home-lead">{t('home.subtitle')}</p>
          <a class="home-start" href={READER_HREF}>
            {t('home.start')}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <p class="home-note">{t('open.privacy')}</p>
        </section>

        <section class="home-preview" aria-label={t('home.preview.label')}>
          <div class="home-pages">
            {PREVIEWS.map((p) => (
              <figure class="home-page" data-mode={p.mode} key={p.mode}>
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
          <p class="home-preview-label">{t('home.preview.label')}</p>
        </section>

        <section class="home-features" aria-labelledby="home-features-title">
          <h2 id="home-features-title">{t('home.featuresTitle')}</h2>
          <ul>
            {FEATURES.map((f) => (
              <li key={f.title}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d={f.icon} />
                </svg>
                <h3>{t(f.title)}</h3>
                <p>{t(f.text)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section class="home-support" aria-labelledby="home-support-title">
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

      <footer class="home-footer">
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
