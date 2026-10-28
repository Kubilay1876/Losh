import type { Locale } from './settings';

const tr = {
  'app.name': 'Loş',
  'app.tagline': 'Göz dostu PDF okuyucu',
  'open.button': 'PDF aç',
  'open.drop': "PDF'i buraya sürükle",
  'open.or': 'ya da',
  'open.choose': 'Dosya seç',
  'open.privacy': 'Dosyan cihazından hiçbir yere gönderilmez.',
  'open.dropHere': 'Bırak, açılsın',
  'open.notPdf': 'Bu bir PDF dosyası değil.',
  'loading': 'Açılıyor…',
  'error.load': 'Bu PDF açılamadı. Dosya bozuk olabilir.',
  'error.password': 'Bu PDF şifreli. Şifreli PDF desteği henüz yok.',
  'resume.toast': 'Kaldığın yerden devam: sayfa {page}',
  'mode.group': 'Görünüm modu',
  'mode.normal': 'Normal',
  'mode.sepia': 'Kağıt',
  'mode.night': 'Gece',
  'mode.darkSepia': 'Koyu sepya',
  'settings.open': 'Görünüm ayarları',
  'settings.title': 'Görünüm ayarları',
  'settings.warmth': 'Sıcak ışık',
  'settings.brightness': 'Parlaklık',
  'settings.contrast': 'Kontrast',
  'settings.preserveImages': 'Gece modunda resimleri koru (deneysel)',
  'settings.reset': 'Varsayılana dön',
  'settings.language': 'Dil',
  'page.prev': 'Önceki sayfa',
  'page.next': 'Sonraki sayfa',
  'page.input': 'Sayfa numarası',
  'page.of': '/ {total}',
  'zoom.label': 'Yakınlaştırma',
  'zoom.in': 'Yakınlaştır',
  'zoom.out': 'Uzaklaştır',
  'zoom.pageFit': 'Sayfaya sığdır',
  'zoom.pageWidth': 'Genişliğe sığdır',
  'zoom.custom': '%{percent}',
  'search.open': 'Belgede ara',
  'search.placeholder': 'Belgede ara…',
  'search.prev': 'Önceki sonuç',
  'search.next': 'Sonraki sonuç',
  'search.close': 'Aramayı kapat',
  'search.count': '{current} / {total}',
  'search.notFound': 'Bulunamadı',
  'help.open': 'Klavye kısayolları',
  'help.title': 'Klavye kısayolları',
  'help.close': 'Kapat',
  'shortcut.open': 'PDF aç',
  'shortcut.cycleMode': 'Sonraki görünüm modu',
  'shortcut.pickMode': 'Modu doğrudan seç (Normal, Kağıt, Gece, Koyu sepya)',
  'shortcut.page': 'Önceki / sonraki sayfa',
  'shortcut.search': 'Belgede ara',
  'shortcut.zoom': 'Yakınlaştır / uzaklaştır',
  'shortcut.fitWidth': 'Genişliğe sığdır',
  'shortcut.settings': 'Görünüm ayarlarını aç / kapat',
  'shortcut.help': 'Bu pencereyi aç',
  'shortcut.close': 'Açık pencereyi kapat',
};

export type MessageKey = keyof typeof tr;
type Messages = Record<MessageKey, string>;

const en: Messages = {
  'app.name': 'Losh',
  'app.tagline': 'Eye-friendly PDF reader',
  'open.button': 'Open PDF',
  'open.drop': 'Drag a PDF here',
  'open.or': 'or',
  'open.choose': 'Choose file',
  'open.privacy': 'Your file never leaves your device.',
  'open.dropHere': 'Drop to open',
  'open.notPdf': 'This is not a PDF file.',
  'loading': 'Opening…',
  'error.load': 'This PDF could not be opened. The file may be damaged.',
  'error.password': 'This PDF is password-protected. Password support is not available yet.',
  'resume.toast': 'Continuing where you left off: page {page}',
  'mode.group': 'Reading mode',
  'mode.normal': 'Normal',
  'mode.sepia': 'Paper',
  'mode.night': 'Night',
  'mode.darkSepia': 'Dark sepia',
  'settings.open': 'Display settings',
  'settings.title': 'Display settings',
  'settings.warmth': 'Warm light',
  'settings.brightness': 'Brightness',
  'settings.contrast': 'Contrast',
  'settings.preserveImages': 'Keep images natural in night modes (experimental)',
  'settings.reset': 'Reset to defaults',
  'settings.language': 'Language',
  'page.prev': 'Previous page',
  'page.next': 'Next page',
  'page.input': 'Page number',
  'page.of': '/ {total}',
  'zoom.label': 'Zoom',
  'zoom.in': 'Zoom in',
  'zoom.out': 'Zoom out',
  'zoom.pageFit': 'Fit page',
  'zoom.pageWidth': 'Fit width',
  'zoom.custom': '{percent}%',
  'search.open': 'Search document',
  'search.placeholder': 'Search document…',
  'search.prev': 'Previous match',
  'search.next': 'Next match',
  'search.close': 'Close search',
  'search.count': '{current} of {total}',
  'search.notFound': 'Not found',
  'help.open': 'Keyboard shortcuts',
  'help.title': 'Keyboard shortcuts',
  'help.close': 'Close',
  'shortcut.open': 'Open PDF',
  'shortcut.cycleMode': 'Next reading mode',
  'shortcut.pickMode': 'Pick a mode directly (Normal, Paper, Night, Dark sepia)',
  'shortcut.page': 'Previous / next page',
  'shortcut.search': 'Search document',
  'shortcut.zoom': 'Zoom in / out',
  'shortcut.fitWidth': 'Fit width',
  'shortcut.settings': 'Toggle display settings',
  'shortcut.help': 'Open this window',
  'shortcut.close': 'Close the open window',
};

export const MESSAGES: Record<Locale, Messages> = { tr, en };

/** Looks up a message and fills `{name}` placeholders. */
export function translate(locale: Locale, key: MessageKey, params?: Record<string, string | number>): string {
  const text = MESSAGES[locale][key] ?? MESSAGES.tr[key] ?? key;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

/** Picks the UI language from the browser on first run. */
export function detectLocale(languages: readonly string[]): Locale {
  for (const lang of languages) {
    const short = lang.toLowerCase().split('-')[0];
    if (short === 'tr') return 'tr';
    if (short === 'en') return 'en';
  }
  return 'tr';
}
