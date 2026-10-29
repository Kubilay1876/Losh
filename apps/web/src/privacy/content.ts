import { PROJECT, type Locale } from '@losh/core';

/**
 * The privacy policy, one block per language. Same text markup as the welcome page:
 * `**bold**`, `{settings}`-style button names and `[links](https://…)`.
 */
export interface PrivacyContent {
  title: string;
  /** `{date}` is filled in with the date below, written the local way. */
  updated: string;
  sections: { title: string; text: string }[];
}

/** Bump this whenever the policy text changes. */
export const PRIVACY_UPDATED = '2026-10-29';

const REPO = PROJECT.repoUrl;
const VERCEL_PRIVACY = 'https://vercel.com/legal/privacy-policy';

const tr: PrivacyContent = {
  title: 'Gizlilik politikası',
  updated: 'Son güncelleme: {date}',
  sections: [
    { title: 'Kısaca', text: "Losh senin hakkında hiçbir bilgi toplamaz, saklamaz ya da satmaz. PDF'lerin cihazından hiçbir yere gönderilmez." },
    { title: "PDF'lerin", text: "Açtığın PDF'ler kendi cihazında, tarayıcının içinde açılır; hiçbir sunucuya yüklenmez. **{recent}** listesinde saklamayı seçersen dosya yine sadece bu cihazdaki tarayıcı depolamasında durur." },
    { title: 'Cihazında saklananlar', text: "Ayarların (mod, dil, parlaklık gibi), her kitapta kaldığın sayfa, işaretlediğin yerler ve saklamayı seçtiğin PDF'ler tarayıcının yerel depolamasında (localStorage ve IndexedDB) durur. Bunlar bize ulaşmaz. Hepsini silmek için tarayıcından bu sitenin verilerini temizlemen yeter; son okunanları okuyucudaki **{settings} → {clear}** ile de silebilirsin." },
    { title: 'Çerez, reklam ve ölçüm yok', text: "Losh çerez kullanmaz, reklam göstermez ve ziyaretleri ölçen bir araç (analytics) içermez. Sayfalar başka sitelerden yazı tipi ya da kod yüklemez; her şey Losh'un kendi dosyalarından gelir." },
    { title: 'Barındırma', text: `Site Vercel üzerinde yayınlanıyor. Her web sunucusu gibi Vercel de siteyi açtığında teknik erişim kayıtları (IP adresi, tarayıcı türü ve saat gibi) tutabilir. Bu kayıtlar [Vercel'in gizlilik politikasına](${VERCEL_PRIVACY}) tabidir; Losh bunları kimseyi tanımak ya da izlemek için kullanmaz.` },
    { title: 'Bağış', text: 'Bağış bağlantısı seni GitHub Sponsors’a götürür. Ödeme ve hesap bilgilerin Losh’a değil GitHub’a gider ve orada GitHub’ın kuralları geçerlidir.' },
    { title: 'Açık kaynak', text: `Losh'un kodunun tamamı [GitHub'da](${REPO}) herkese açık; burada yazanları kendin de kontrol edebilirsin.` },
    { title: 'Değişiklikler ve iletişim', text: `Bu politika değişirse bu sayfa güncellenir. Bir sorun olursa [GitHub'da](${REPO}/issues) yazabilirsin.` },
  ],
};

const en: PrivacyContent = {
  title: 'Privacy policy',
  updated: 'Last updated: {date}',
  sections: [
    { title: 'In short', text: 'Losh does not collect, keep or sell any information about you. Your PDFs never leave your device.' },
    { title: 'Your PDFs', text: 'The PDFs you open are opened on your own device, inside the browser; they are never uploaded to a server. If you choose to keep one in **{recent}**, the file still stays only in this browser’s storage on this device.' },
    { title: 'What is stored on your device', text: 'Your settings (mode, language, brightness and so on), your last page and your highlights in each book and the PDFs you chose to keep are stored in the browser’s local storage (localStorage and IndexedDB). None of it reaches us. To delete all of it, clear this site’s data in your browser; you can also remove recently read books in the reader with **{settings} → {clear}**.' },
    { title: 'No cookies, ads or analytics', text: 'Losh uses no cookies, shows no ads and contains no analytics. The pages load no fonts or code from other sites; everything comes from Losh’s own files.' },
    { title: 'Hosting', text: `The site is hosted on Vercel. Like any web server, Vercel may keep technical access logs (such as IP address, browser type and time) when you open the site. These logs fall under [Vercel’s privacy policy](${VERCEL_PRIVACY}); Losh does not use them to identify or track anyone.` },
    { title: 'Donations', text: 'The donation link takes you to GitHub Sponsors. Your payment and account details go to GitHub, not to Losh, and GitHub’s terms apply there.' },
    { title: 'Open source', text: `All of Losh’s code is public [on GitHub](${REPO}), so you can check what this page says yourself.` },
    { title: 'Changes and contact', text: `If this policy changes, this page will be updated. If something is wrong, you can write [on GitHub](${REPO}/issues).` },
  ],
};

const es: PrivacyContent = {
  title: 'Política de privacidad',
  updated: 'Última actualización: {date}',
  sections: [
    { title: 'En resumen', text: 'Losh no recoge, guarda ni vende ninguna información sobre ti. Tus PDF nunca salen de tu dispositivo.' },
    { title: 'Tus PDF', text: 'Los PDF que abres se abren en tu propio dispositivo, dentro del navegador; nunca se suben a un servidor. Si eliges guardar uno en **{recent}**, el archivo sigue estando solo en el almacenamiento del navegador de este dispositivo.' },
    { title: 'Qué se guarda en tu dispositivo', text: 'Tus ajustes (modo, idioma, brillo, etc.), tu última página y tus marcas de cada libro y los PDF que decidiste guardar están en el almacenamiento local del navegador (localStorage e IndexedDB). Nada de ello nos llega. Para borrarlo todo, borra los datos de este sitio en tu navegador; también puedes quitar los libros recientes en el lector con **{settings} → {clear}**.' },
    { title: 'Sin cookies, anuncios ni analíticas', text: 'Losh no usa cookies, no muestra anuncios y no incluye analíticas. Las páginas no cargan fuentes ni código de otros sitios; todo viene de los propios archivos de Losh.' },
    { title: 'Alojamiento', text: `El sitio está alojado en Vercel. Como cualquier servidor web, Vercel puede guardar registros técnicos de acceso (como la dirección IP, el tipo de navegador y la hora) cuando abres el sitio. Estos registros se rigen por la [política de privacidad de Vercel](${VERCEL_PRIVACY}); Losh no los usa para identificar ni rastrear a nadie.` },
    { title: 'Donaciones', text: 'El enlace de donación te lleva a GitHub Sponsors. Tus datos de pago y de cuenta van a GitHub, no a Losh, y allí se aplican las condiciones de GitHub.' },
    { title: 'Código abierto', text: `Todo el código de Losh es público [en GitHub](${REPO}), así que puedes comprobar tú mismo lo que dice esta página.` },
    { title: 'Cambios y contacto', text: `Si esta política cambia, esta página se actualizará. Si algo no está bien, puedes escribir [en GitHub](${REPO}/issues).` },
  ],
};

const fr: PrivacyContent = {
  title: 'Politique de confidentialité',
  updated: 'Dernière mise à jour : {date}',
  sections: [
    { title: 'En bref', text: 'Losh ne collecte, ne conserve et ne vend aucune information vous concernant. Vos PDF ne quittent jamais votre appareil.' },
    { title: 'Vos PDF', text: 'Les PDF que vous ouvrez sont ouverts sur votre propre appareil, dans le navigateur ; ils ne sont jamais envoyés à un serveur. Si vous choisissez d’en garder un dans **{recent}**, le fichier reste uniquement dans le stockage du navigateur de cet appareil.' },
    { title: 'Ce qui est gardé sur votre appareil', text: 'Vos réglages (mode, langue, luminosité, etc.), votre dernière page et vos surlignages dans chaque livre et les PDF que vous avez choisi de garder sont stockés dans le stockage local du navigateur (localStorage et IndexedDB). Rien de tout cela ne nous parvient. Pour tout effacer, supprimez les données de ce site dans votre navigateur ; vous pouvez aussi retirer les livres récents dans le lecteur avec **{settings} → {clear}**.' },
    { title: 'Ni cookies, ni publicité, ni mesure d’audience', text: 'Losh n’utilise pas de cookies, n’affiche pas de publicité et ne contient aucun outil de mesure d’audience. Les pages ne chargent ni polices ni code venant d’autres sites ; tout vient des propres fichiers de Losh.' },
    { title: 'Hébergement', text: `Le site est hébergé par Vercel. Comme tout serveur web, Vercel peut conserver des journaux techniques d’accès (adresse IP, type de navigateur, heure…) lorsque vous ouvrez le site. Ces journaux relèvent de la [politique de confidentialité de Vercel](${VERCEL_PRIVACY}) ; Losh ne s’en sert pas pour identifier ou suivre qui que ce soit.` },
    { title: 'Dons', text: 'Le lien de don vous emmène sur GitHub Sponsors. Vos informations de paiement et de compte vont à GitHub, pas à Losh, et les conditions de GitHub s’y appliquent.' },
    { title: 'Open source', text: `Tout le code de Losh est public [sur GitHub](${REPO}) : vous pouvez vérifier vous-même ce que dit cette page.` },
    { title: 'Modifications et contact', text: `Si cette politique change, cette page sera mise à jour. Si quelque chose ne va pas, vous pouvez écrire [sur GitHub](${REPO}/issues).` },
  ],
};

const ru: PrivacyContent = {
  title: 'Политика конфиденциальности',
  updated: 'Обновлено: {date}',
  sections: [
    { title: 'Коротко', text: 'Losh не собирает, не хранит и не продаёт никакой информации о вас. Ваши PDF никогда не покидают устройство.' },
    { title: 'Ваши PDF', text: 'PDF открываются на вашем устройстве, прямо в браузере, и никогда не загружаются на сервер. Если вы решите сохранить файл в списке **{recent}**, он всё равно хранится только в браузере на этом устройстве.' },
    { title: 'Что хранится на устройстве', text: 'Ваши настройки (режим, язык, яркость и т. п.), последняя страница и выделения в каждой книге и PDF, которые вы решили сохранить, лежат в локальном хранилище браузера (localStorage и IndexedDB). К нам ничего из этого не попадает. Чтобы удалить всё, очистите данные этого сайта в браузере; недавние книги можно удалить и в читалке: **{settings} → {clear}**.' },
    { title: 'Без cookie, рекламы и аналитики', text: 'Losh не использует cookie, не показывает рекламу и не содержит аналитики. Страницы не загружают шрифты или код с других сайтов; всё берётся из собственных файлов Losh.' },
    { title: 'Хостинг', text: `Сайт размещён на Vercel. Как и любой веб-сервер, Vercel может вести технические журналы доступа (IP-адрес, тип браузера, время), когда вы открываете сайт. На эти журналы распространяется [политика конфиденциальности Vercel](${VERCEL_PRIVACY}); Losh не использует их, чтобы кого-то узнавать или отслеживать.` },
    { title: 'Пожертвования', text: 'Ссылка для пожертвований ведёт на GitHub Sponsors. Платёжные данные и данные аккаунта получает GitHub, а не Losh, и там действуют правила GitHub.' },
    { title: 'Открытый код', text: `Весь код Losh открыт [на GitHub](${REPO}), так что сказанное здесь можно проверить самому.` },
    { title: 'Изменения и связь', text: `Если политика изменится, эта страница будет обновлена. Если что-то не так, напишите [на GitHub](${REPO}/issues).` },
  ],
};

export const PRIVACY_CONTENT: Record<Locale, PrivacyContent> = { tr, en, es, fr, ru };
