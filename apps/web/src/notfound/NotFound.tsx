import { useEffect } from 'preact/hooks';
import { translate, type KeyValueStore, type MessageKey, type Settings } from '@losh/core';
import { Logo, useSettings } from '@losh/viewer/settings';
import { LanguageMenu } from '../home/LanguageMenu';
import { Footer } from '../home/Footer';

// 404.html carries <base href="/">, so these work at any depth of a wrong address.
const HOME_HREF = './';
const READER_HREF = './app/';

/** "Page not found", in the welcome page's look, with the way back home and to the reader. */
export function NotFound({ store, initial }: { store: KeyValueStore; initial?: Settings }) {
  const [settings, update, loaded] = useSettings(store, initial);
  const t = (key: MessageKey, params?: Record<string, string | number>) => translate(settings.locale, key, params);

  useEffect(() => {
    document.documentElement.lang = settings.locale;
    document.title = `${t('notFound.title')} — ${t('app.name')}`;
  }, [settings.locale]);

  if (!loaded) return null;

  return (
    <div class="home">
      <header class="home-top is-stuck">
        <div class="home-top-inner">
          <a class="home-brand" href={HOME_HREF} aria-label={`${t('app.name')} — ${t('home.back')}`}>
            <Logo size={34} id="notfound-logo" />
            <span class="home-wordmark losh-gradient-text">Losh</span>
          </a>
          <div class="home-top-end home-top-end-alone">
            <LanguageMenu locale={settings.locale} label={t('home.languageMenu')} onChange={(locale) => update({ locale })} />
          </div>
        </div>
      </header>

      <main>
        <section class="home-hero">
          <Logo size={104} glow id="notfound-logo-hero" class="home-hero-logo" />
          <p class="home-eyebrow">404</p>
          <h1>{t('notFound.title')}</h1>
          <p class="home-lead">{t('notFound.text')}</p>
          <a class="home-start" href={READER_HREF}>
            {t('notFound.reader')}
            <svg class="home-start-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <p class="home-note">
            <a href={HOME_HREF}>{t('home.back')}</a>
          </p>
        </section>
      </main>

      <Footer t={t} privacyHref="./privacy/" />
    </div>
  );
}
