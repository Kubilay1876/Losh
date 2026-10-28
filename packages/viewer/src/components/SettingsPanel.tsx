import { useEffect, useRef } from 'preact/hooks';
import { DEFAULT_SETTINGS, LOCALES, MODES, SETTINGS_LIMITS, type Locale, type MessageKey, type Settings } from '@losh/core';
import { IconClose } from './icons';

interface Props {
  settings: Settings;
  update(patch: Partial<Settings>): void;
  t(key: MessageKey): string;
  onClose(): void;
}

const LOCALE_NAMES: Record<Locale, string> = { tr: 'Türkçe', en: 'English' };

export function SettingsPanel({ settings, update, t, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLInputElement>('input')?.focus();
  }, []);

  const slider = (key: 'warmth' | 'brightness' | 'contrast', label: MessageKey, unit: string) => {
    const limits = SETTINGS_LIMITS[key];
    const id = `losh-${key}`;
    return (
      <div class="losh-field">
        <label for={id}>
          <span>{t(label)}</span>
          <output for={id}>
            {settings[key]}
            {unit}
          </output>
        </label>
        <input
          id={id}
          type="range"
          min={limits.min}
          max={limits.max}
          value={settings[key]}
          onInput={(e) => update({ [key]: Number((e.currentTarget as HTMLInputElement).value) })}
        />
      </div>
    );
  };

  const inverted = MODES[settings.mode].inverted;

  return (
    <div class="losh-panel" role="dialog" aria-label={t('settings.title')} ref={ref}>
      <div class="losh-panel-head">
        <h2>{t('settings.title')}</h2>
        <button type="button" class="losh-icon-btn" onClick={onClose} aria-label={t('help.close')} title={t('help.close')}>
          <IconClose />
        </button>
      </div>
      {slider('warmth', 'settings.warmth', '%')}
      {slider('brightness', 'settings.brightness', '%')}
      {slider('contrast', 'settings.contrast', '%')}
      <label class={`losh-check${inverted ? '' : ' is-muted'}`}>
        <input
          type="checkbox"
          checked={settings.preserveImages}
          onChange={(e) => update({ preserveImages: (e.currentTarget as HTMLInputElement).checked })}
        />
        <span>{t('settings.preserveImages')}</span>
      </label>
      <div class="losh-field">
        <label for="losh-locale">
          <span>{t('settings.language')}</span>
        </label>
        <select
          id="losh-locale"
          value={settings.locale}
          onChange={(e) => update({ locale: (e.currentTarget as HTMLSelectElement).value as Locale })}
        >
          {LOCALES.map((l) => (
            <option value={l} key={l}>
              {LOCALE_NAMES[l]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        class="losh-text-btn"
        onClick={() =>
          update({
            warmth: DEFAULT_SETTINGS.warmth,
            brightness: DEFAULT_SETTINGS.brightness,
            contrast: DEFAULT_SETTINGS.contrast,
            preserveImages: DEFAULT_SETTINGS.preserveImages,
          })
        }
      >
        {t('settings.reset')}
      </button>
    </div>
  );
}
