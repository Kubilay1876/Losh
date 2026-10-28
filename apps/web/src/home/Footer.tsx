import { PROJECT } from '@losh/core';

interface Props {
  t(key: 'home.footer.maker' | 'home.footer.privacy' | 'home.footer.medical', params?: Record<string, string>): string;
  /** Link to the privacy page, relative to the current page. */
  privacyHref?: string;
}

/** Maker, source code and privacy links, plus the "not a medical product" note. Shared by the welcome and privacy pages. */
export function Footer({ t, privacyHref }: Props) {
  return (
    <footer class="home-footer" data-reveal>
      <p>
        {t('home.footer.maker', { name: PROJECT.maker })} ·{' '}
        <a href={PROJECT.githubUrl} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        {privacyHref && (
          <>
            {' · '}
            <a href={privacyHref}>{t('home.footer.privacy')}</a>
          </>
        )}
      </p>
      <p class="home-medical">{t('home.footer.medical')}</p>
    </footer>
  );
}
