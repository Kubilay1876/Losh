import { useEffect } from 'preact/hooks';
import { translate, type KeyValueStore, type MessageKey, type Settings } from '@losh/core';
import { Logo, useSettings } from '@losh/viewer/settings';
import { LanguageMenu } from '../home/LanguageMenu';
import { Footer } from '../home/Footer';
import { Rich } from '../home/Rich';
import { PRIVACY_CONTENT, PRIVACY_UPDATED } from './content';

const HOME_HREF = '../';

export function Privacy({ store, initial }: { store: KeyValueStore; initial?: Settings }) {
  const [settings, update, loaded] = useSettings(store, initial);
  const t = (key: MessageKey, params?: Record<string, string | number>) => translate(settings.locale, key, params);
  const content = PRIVACY_CONTENT[settings.locale];

  useEffect(() => {
    document.documentElement.lang = settings.locale;
    document.title = `${content.title} — ${t('app.name')}`;
  }, [settings.locale]);

  if (!loaded) return null;

  const date = new Intl.DateTimeFormat(settings.locale, { dateStyle: 'long' }).format(new Date(`${PRIVACY_UPDATED}T12:00:00`));

  return (
    <div class="home">
      <header class="home-top is-stuck">
        <div class="home-top-inner">
          <a class="home-brand" href={HOME_HREF} aria-label={`${t('app.name')} — ${t('home.back')}`}>
            <Logo size={34} id="privacy-logo" />
            <span class="home-wordmark losh-gradient-text">Losh</span>
          </a>
          <div class="home-top-end home-top-end-alone">
            <LanguageMenu locale={settings.locale} label={t('home.languageMenu')} onChange={(locale) => update({ locale })} />
          </div>
        </div>
      </header>

      <main class="home-doc">
        <h1>{content.title}</h1>
        <p class="home-doc-date">{content.updated.replace('{date}', date)}</p>
        {content.sections.map((s) => (
          <section key={s.title}>
            <h2>{s.title}</h2>
            <p>
              <Rich text={s.text} locale={settings.locale} />
            </p>
          </section>
        ))}
        <p class="home-doc-back">
          <a href={HOME_HREF}>← {t('home.back')}</a>
        </p>
      </main>

      <Footer t={t} />
    </div>
  );
}
