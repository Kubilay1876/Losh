import type { Locale } from '@losh/core';

/**
 * Long texts of the welcome page (install guide, how-to, FAQ), one block per language.
 * `**word**` marks a button or menu name; it is shown in bold.
 * `{start}`, `{choose}`, `{normal}`… are filled in with the app's own button names (see Home.tsx), so they always match.
 */
export type PlatformId = 'ios' | 'android' | 'desktop';

export interface HomeContent {
  install: {
    intro: string;
    yourDevice: string;
    installed: string;
    platforms: Record<PlatformId, { name: string; steps: string[]; note?: string }>;
  };
  guide: {
    intro: string;
    /** Same order as GUIDE_ICONS in Sections.tsx. */
    items: { title: string; text: string }[];
  };
  faq: {
    intro: string;
    items: { q: string; a: string }[];
  };
}

const tr: HomeContent = {
  install: {
    intro: "Losh'u kurmak zorunda değilsin, “{start}”a basman yeter. Ama ana ekrana eklersen ikonuyla açılır ve internetsiz de rahatça çalışır.",
    yourDevice: 'Senin cihazın',
    installed: 'Losh bu cihazda zaten kurulu.',
    platforms: {
      ios: {
        name: 'iPhone ve iPad',
        steps: [
          "**Safari**'de loshreader.vercel.app adresini aç.",
          'Alttaki **Paylaş** düğmesine dokun (yukarı ok olan kare).',
          "**Ana Ekrana Ekle**'yi seç (görmüyorsan listeyi biraz aşağı kaydır).",
          "Sağ üstteki **Ekle**'ye dokun. Losh artık ana ekranında.",
        ],
        note: "Safari'de açtığın Losh ile ana ekrandaki Losh ayrı hafıza kullanır. Kitaplarını ana ekrandaki Losh'ta saklaman daha iyi olur.",
      },
      android: {
        name: 'Android',
        steps: [
          "**Chrome**'da loshreader.vercel.app adresini aç.",
          'Sağ üstteki **⋮** menüsüne dokun.',
          "**Uygulamayı yükle**'yi (bazı telefonlarda **Ana ekrana ekle**) seç ve onayla.",
          'Artık bir PDF’i başka bir uygulamadan **Paylaş → Losh** ile de açabilirsin.',
        ],
      },
      desktop: {
        name: 'Bilgisayar',
        steps: [
          "**Chrome** ya da **Edge**'de loshreader.vercel.app adresini aç.",
          'Adres çubuğunun sağındaki **Yükle** simgesine (ekran ve aşağı ok) tıkla.',
          "**Yükle**'ye bas. Losh kendi penceresinde açılır.",
          'Bir PDF’e sağ tıklayıp **Birlikte aç → Losh** diyerek doğrudan açabilirsin.',
        ],
        note: "Mac'te Safari kullanıyorsan: **Dosya → Dock'a Ekle**. Firefox kurmayı desteklemiyor ama Losh orada da tarayıcının içinde çalışır.",
      },
    },
  },
  guide: {
    intro: 'Birkaç dakikada her şeyi öğrenirsin.',
    items: [
      { title: "PDF'ini aç", text: '“{start}”a bas, sonra **{choose}**. Bilgisayarda dosyayı sayfaya sürükleyip bırakman da yeter. Dosyan cihazından çıkmaz.' },
      { title: 'Gözüne uygun tonu seç', text: "**{normal}**, **{sepia}**, **{night}** ya da **{darkSepia}**. Ayarlar'dan sıcak ışığı, parlaklığı ve kontrastı da değiştirebilirsin." },
      { title: 'Yazıya sığdır', text: 'Sayfanın boş kenarlarını atar, yazıyı ekran genişliğine büyütür. Telefonda yana kaydırmadan okursun.' },
      { title: 'Menüleri gizle', text: 'Telefonda sayfaya bir kez dokun: menüler kaybolur, PDF bütün ekranı kaplar. Bir daha dokununca geri gelirler.' },
      { title: 'Kaldığın yerden devam et', text: 'Losh her kitapta kaldığın sayfayı hatırlar. Saklamayı seçtiğin kitaplar **{recent}** listesinde durur ve internetsiz de açılır.' },
      { title: 'Ara ve kısayolları kullan', text: 'Büyüteçle kitabın içinde arama yaparsın. Bilgisayarda **?** tuşu bütün klavye kısayollarını gösterir.' },
      { title: 'Göz molası ver', text: 'Losh ilk okumanda sorar; sonra **{settings}** içinden **{breakReminder}**nı açıp kapatabilirsin. Açıksa her 20 dakikalık okumadan sonra 20 saniyelik bir mola verdirir: önce uzağa bakarsın, sonra göz kırparsın. Aralığı 10 ile 60 dakika arasında seçebilirsin.' },
    ],
  },
  faq: {
    intro: 'Aklına takılan bir şey varsa cevabı büyük ihtimalle burada.',
    items: [
      { q: "PDF'im bir yere yükleniyor mu?", a: "Hayır. Losh'un sunucusu yok; PDF tamamen kendi cihazında, tarayıcının içinde açılır. İstersen interneti kapatıp dene, yine çalışır." },
      { q: 'Ücretli mi, üyelik gerekiyor mu?', a: "Hayır. Losh ücretsiz, reklamsız ve üyeliksiz. Kodun tamamı GitHub'da herkese açık." },
      { q: 'İnternetsiz çalışır mı?', a: 'Evet. Siteyi bir kez açtıktan sonra Losh cihazına kaydedilir. Saklamayı seçtiğin kitaplar da internetsiz açılır.' },
      { q: 'Hangi cihazlarda çalışır?', a: 'Güncel bir tarayıcısı olan her cihazda: iPhone, iPad, Android, Windows, Mac ve Linux.' },
      { q: 'Kaldığım sayfa ve ayarlarım nerede saklanıyor?', a: 'Sadece bu cihazda, tarayıcının hafızasında. Hesap olmadığı için başka cihazlara aktarılmaz.' },
      { q: 'Losh beni takip ediyor mu?', a: "Hayır. Losh çerez, reklam ya da analiz aracı kullanmaz. Siteyi barındıran Vercel, her web sitesinde olduğu gibi teknik erişim kayıtları tutabilir; PDF'lerin ise hiçbir zaman internete çıkmaz. Ayrıntılar: [gizlilik politikası](./privacy/)." },
      { q: 'Gece modunda fotoğraflar neden ters dönmüyor?', a: "Losh fotoğrafları doğal renginde bırakır, yazıyı ve çizimleri koyulaştırır. İstemezsen Ayarlar'dan kapatabilirsin." },
      { q: "Şifreli PDF'leri açabilir miyim?", a: 'Henüz hayır.' },
      { q: "Losh'ta sakladığım her şeyi nasıl silerim?", a: 'Okuyucuda **{settings} → {clear}** son okunanları siler. Tarayıcıdan bu sitenin verilerini silersen ayarların ve kaldığın sayfalar da gider.' },
      { q: 'Göz ağrıma iyi gelir mi?', a: 'Losh ekranı daha yumuşak gösterir ve istersen 20 dakikada bir göz molası hatırlatır: 20 saniye uzağa bakıp göz kırparsın. Ama tıbbi bir ürün değildir; ağrın sürerse bir göz doktoruna başvur.' },
    ],
  },
};

const en: HomeContent = {
  install: {
    intro: "You don't have to install Losh: just press “{start}”. But if you add it to your home screen, it opens from its own icon and works comfortably offline.",
    yourDevice: 'Your device',
    installed: 'Losh is already installed on this device.',
    platforms: {
      ios: {
        name: 'iPhone and iPad',
        steps: [
          'Open loshreader.vercel.app in **Safari**.',
          'Tap the **Share** button at the bottom (the square with an arrow pointing up).',
          'Choose **Add to Home Screen** (scroll the list down a little if you don’t see it).',
          'Tap **Add** in the top right. Losh is now on your home screen.',
        ],
        note: 'Losh in Safari and Losh on the home screen keep separate storage. It is best to keep your books in the home screen Losh.',
      },
      android: {
        name: 'Android',
        steps: [
          'Open loshreader.vercel.app in **Chrome**.',
          'Tap the **⋮** menu in the top right.',
          'Choose **Install app** (on some phones **Add to Home screen**) and confirm.',
          'You can now also open a PDF from another app with **Share → Losh**.',
        ],
      },
      desktop: {
        name: 'Computer',
        steps: [
          'Open loshreader.vercel.app in **Chrome** or **Edge**.',
          'Click the **Install** icon (a screen with a down arrow) on the right of the address bar.',
          'Press **Install**. Losh opens in its own window.',
          'You can open a PDF straight in Losh: right-click it and choose **Open with → Losh**.',
        ],
        note: 'Safari on a Mac: **File → Add to Dock**. Firefox cannot install sites, but Losh works there inside the browser too.',
      },
    },
  },
  guide: {
    intro: "You'll know everything in a few minutes.",
    items: [
      { title: 'Open your PDF', text: "Press “{start}”, then **{choose}**. On a computer you can also drag the file onto the page. Your file never leaves your device." },
      { title: 'Pick a tone for your eyes', text: '**{normal}**, **{sepia}**, **{night}** or **{darkSepia}**. In Settings you can also change warm light, brightness and contrast.' },
      { title: 'Fit text', text: 'Drops the empty page margins and enlarges the text to the width of the screen. On a phone you read without scrolling sideways.' },
      { title: 'Hide the menus', text: 'On a phone, tap the page once: the menus go away and the PDF fills the screen. Tap again to bring them back.' },
      { title: 'Pick up where you left off', text: 'Losh remembers your page in every book. Books you chose to keep stay in **{recent}** and open offline too.' },
      { title: 'Search and use shortcuts', text: 'Use the magnifier to search inside the book. On a computer, the **?** key shows every keyboard shortcut.' },
      { title: 'Take eye breaks', text: 'Losh asks the first time you read; later you can switch the **{breakReminder}** on or off in **{settings}**. When it is on, after every 20 minutes of reading you get a 20-second break: first look far away, then blink. You can pick an interval from 10 to 60 minutes.' },
    ],
  },
  faq: {
    intro: "If something is on your mind, the answer is probably here.",
    items: [
      { q: 'Is my PDF uploaded anywhere?', a: "No. Losh has no server; the PDF opens entirely on your own device, inside the browser. Try it with the internet switched off: it still works." },
      { q: 'Does it cost anything? Do I need an account?', a: 'No. Losh is free, ad-free and needs no account. All of the code is public on GitHub.' },
      { q: 'Does it work offline?', a: 'Yes. After you open the site once, Losh is saved on your device. Books you chose to keep open offline too.' },
      { q: 'Which devices does it work on?', a: 'Any device with an up-to-date browser: iPhone, iPad, Android, Windows, Mac and Linux.' },
      { q: 'Where are my last page and settings stored?', a: "Only on this device, in the browser's storage. There are no accounts, so they are not copied to other devices." },
      { q: 'Does Losh track me?', a: 'No. Losh uses no cookies, ads or analytics. Vercel, which hosts the site, may keep technical access logs like any website host; your PDFs never go online. Details: [privacy policy](./privacy/).' },
      { q: "Why don't photos turn negative in night mode?", a: 'Losh keeps photos in their natural colours and darkens text and drawings. You can turn this off in Settings.' },
      { q: 'Can I open password-protected PDFs?', a: 'Not yet.' },
      { q: 'How do I delete everything Losh has stored?', a: "In the reader, **{settings} → {clear}** removes your recently read books. Clearing this site's data in your browser also removes your settings and saved pages." },
      { q: 'Will it help my sore eyes?', a: 'Losh makes the screen gentler and, if you like, reminds you to take an eye break every 20 minutes: look far away for 20 seconds and blink. But it is not a medical product; if the pain continues, see an eye doctor.' },
    ],
  },
};

const es: HomeContent = {
  install: {
    intro: 'No hace falta instalar Losh: basta con pulsar «{start}». Pero si lo añades a tu pantalla de inicio, se abre con su propio icono y funciona cómodamente sin conexión.',
    yourDevice: 'Tu dispositivo',
    installed: 'Losh ya está instalado en este dispositivo.',
    platforms: {
      ios: {
        name: 'iPhone y iPad',
        steps: [
          'Abre loshreader.vercel.app en **Safari**.',
          'Toca el botón **Compartir** de abajo (el cuadrado con una flecha hacia arriba).',
          'Elige **Añadir a pantalla de inicio** (si no lo ves, desplaza un poco la lista).',
          'Toca **Añadir** arriba a la derecha. Losh ya está en tu pantalla de inicio.',
        ],
        note: 'Losh en Safari y Losh en la pantalla de inicio guardan los datos por separado. Es mejor guardar tus libros en el Losh de la pantalla de inicio.',
      },
      android: {
        name: 'Android',
        steps: [
          'Abre loshreader.vercel.app en **Chrome**.',
          'Toca el menú **⋮** arriba a la derecha.',
          'Elige **Instalar aplicación** (en algunos teléfonos **Añadir a pantalla de inicio**) y confirma.',
          'Ahora también puedes abrir un PDF desde otra aplicación con **Compartir → Losh**.',
        ],
      },
      desktop: {
        name: 'Ordenador',
        steps: [
          'Abre loshreader.vercel.app en **Chrome** o **Edge**.',
          'Haz clic en el icono **Instalar** (una pantalla con una flecha hacia abajo) a la derecha de la barra de direcciones.',
          'Pulsa **Instalar**. Losh se abre en su propia ventana.',
          'Puedes abrir un PDF directamente en Losh: haz clic derecho y elige **Abrir con → Losh**.',
        ],
        note: 'Safari en Mac: **Archivo → Añadir al Dock**. Firefox no permite instalar sitios, pero Losh también funciona ahí dentro del navegador.',
      },
    },
  },
  guide: {
    intro: 'En unos minutos lo sabrás todo.',
    items: [
      { title: 'Abre tu PDF', text: 'Pulsa «{start}» y luego **{choose}**. En un ordenador también puedes arrastrar el archivo a la página. Tu archivo no sale de tu dispositivo.' },
      { title: 'Elige un tono para tus ojos', text: '**{normal}**, **{sepia}**, **{night}** o **{darkSepia}**. En Ajustes también puedes cambiar la luz cálida, el brillo y el contraste.' },
      { title: 'Ajustar al texto', text: 'Quita los márgenes vacíos de la página y amplía el texto al ancho de la pantalla. En el móvil lees sin desplazarte a los lados.' },
      { title: 'Oculta los menús', text: 'En el móvil, toca la página una vez: los menús desaparecen y el PDF ocupa toda la pantalla. Vuelve a tocar para que regresen.' },
      { title: 'Sigue donde lo dejaste', text: 'Losh recuerda tu página en cada libro. Los libros que decidiste guardar quedan en **{recent}** y se abren también sin conexión.' },
      { title: 'Busca y usa atajos', text: 'Con la lupa buscas dentro del libro. En un ordenador, la tecla **?** muestra todos los atajos de teclado.' },
      { title: 'Descansa la vista', text: 'Losh te lo pregunta la primera vez que lees; luego puedes activar o desactivar el **{breakReminder}** en **{settings}**. Si está activado, tras cada 20 minutos de lectura te propone un descanso de 20 segundos: primero mira lejos y luego parpadea. Puedes elegir un intervalo de 10 a 60 minutos.' },
    ],
  },
  faq: {
    intro: 'Si tienes alguna duda, probablemente la respuesta esté aquí.',
    items: [
      { q: '¿Se sube mi PDF a algún sitio?', a: 'No. Losh no tiene servidor; el PDF se abre por completo en tu propio dispositivo, dentro del navegador. Pruébalo sin conexión: sigue funcionando.' },
      { q: '¿Cuesta algo? ¿Necesito una cuenta?', a: 'No. Losh es gratis, sin anuncios y sin cuentas. Todo el código es público en GitHub.' },
      { q: '¿Funciona sin conexión?', a: 'Sí. Tras abrir el sitio una vez, Losh queda guardado en tu dispositivo. Los libros que decidiste guardar también se abren sin conexión.' },
      { q: '¿En qué dispositivos funciona?', a: 'En cualquiera con un navegador actualizado: iPhone, iPad, Android, Windows, Mac y Linux.' },
      { q: '¿Dónde se guardan mi última página y mis ajustes?', a: 'Solo en este dispositivo, en el almacenamiento del navegador. Como no hay cuentas, no se copian a otros dispositivos.' },
      { q: '¿Losh me rastrea?', a: 'No. Losh no usa cookies, anuncios ni analíticas. Vercel, que aloja el sitio, puede guardar registros técnicos de acceso como cualquier alojamiento web; tus PDF nunca salen a internet. Detalles: [política de privacidad](./privacy/).' },
      { q: '¿Por qué las fotos no se invierten en modo noche?', a: 'Losh deja las fotos en sus colores naturales y oscurece el texto y los dibujos. Puedes desactivarlo en Ajustes.' },
      { q: '¿Puedo abrir PDF protegidos con contraseña?', a: 'Todavía no.' },
      { q: '¿Cómo borro todo lo que Losh ha guardado?', a: 'En el lector, **{settings} → {clear}** elimina los libros leídos recientemente. Si borras los datos de este sitio en tu navegador, también se van tus ajustes y páginas guardadas.' },
      { q: '¿Me ayudará con el dolor de ojos?', a: 'Losh hace la pantalla más suave y, si quieres, te recuerda hacer un descanso visual cada 20 minutos: mirar lejos 20 segundos y parpadear. Pero no es un producto médico; si el dolor continúa, consulta a un oftalmólogo.' },
    ],
  },
};

const fr: HomeContent = {
  install: {
    intro: 'Pas besoin d’installer Losh : il suffit d’appuyer sur « {start} ». Mais si vous l’ajoutez à votre écran d’accueil, il s’ouvre avec sa propre icône et fonctionne confortablement hors ligne.',
    yourDevice: 'Votre appareil',
    installed: 'Losh est déjà installé sur cet appareil.',
    platforms: {
      ios: {
        name: 'iPhone et iPad',
        steps: [
          'Ouvrez loshreader.vercel.app dans **Safari**.',
          'Touchez le bouton **Partager** en bas (le carré avec une flèche vers le haut).',
          'Choisissez **Sur l’écran d’accueil** (faites défiler un peu la liste si vous ne le voyez pas).',
          'Touchez **Ajouter** en haut à droite. Losh est maintenant sur votre écran d’accueil.',
        ],
        note: 'Losh dans Safari et Losh sur l’écran d’accueil gardent des données séparées. Mieux vaut garder vos livres dans le Losh de l’écran d’accueil.',
      },
      android: {
        name: 'Android',
        steps: [
          'Ouvrez loshreader.vercel.app dans **Chrome**.',
          'Touchez le menu **⋮** en haut à droite.',
          'Choisissez **Installer l’application** (sur certains téléphones **Ajouter à l’écran d’accueil**) et confirmez.',
          'Vous pouvez maintenant aussi ouvrir un PDF depuis une autre application avec **Partager → Losh**.',
        ],
      },
      desktop: {
        name: 'Ordinateur',
        steps: [
          'Ouvrez loshreader.vercel.app dans **Chrome** ou **Edge**.',
          'Cliquez sur l’icône **Installer** (un écran avec une flèche vers le bas) à droite de la barre d’adresse.',
          'Appuyez sur **Installer**. Losh s’ouvre dans sa propre fenêtre.',
          'Vous pouvez ouvrir un PDF directement dans Losh : clic droit, puis **Ouvrir avec → Losh**.',
        ],
        note: 'Safari sur Mac : **Fichier → Ajouter au Dock**. Firefox ne permet pas d’installer des sites, mais Losh y fonctionne aussi dans le navigateur.',
      },
    },
  },
  guide: {
    intro: 'Quelques minutes suffisent pour tout savoir.',
    items: [
      { title: 'Ouvrez votre PDF', text: 'Appuyez sur « {start} », puis **{choose}**. Sur un ordinateur, vous pouvez aussi glisser le fichier sur la page. Votre fichier ne quitte jamais votre appareil.' },
      { title: 'Choisissez un ton pour vos yeux', text: '**{normal}**, **{sepia}**, **{night}** ou **{darkSepia}**. Dans les réglages, vous pouvez aussi changer la lumière chaude, la luminosité et le contraste.' },
      { title: 'Ajuster au texte', text: 'Retire les marges vides de la page et agrandit le texte à la largeur de l’écran. Sur téléphone, vous lisez sans défiler sur les côtés.' },
      { title: 'Masquez les menus', text: 'Sur téléphone, touchez la page une fois : les menus disparaissent et le PDF occupe tout l’écran. Touchez à nouveau pour les faire revenir.' },
      { title: 'Reprenez où vous en étiez', text: 'Losh retient votre page dans chaque livre. Les livres que vous avez choisi de garder restent dans **{recent}** et s’ouvrent aussi hors ligne.' },
      { title: 'Cherchez et utilisez les raccourcis', text: 'La loupe permet de chercher dans le livre. Sur ordinateur, la touche **?** affiche tous les raccourcis clavier.' },
      { title: 'Faites des pauses', text: 'Losh vous le propose à votre première lecture ; ensuite, activez ou désactivez le **{breakReminder}** dans **{settings}**. S’il est activé, après chaque 20 minutes de lecture vous faites une pause de 20 secondes : d’abord regarder au loin, puis cligner des yeux. L’intervalle va de 10 à 60 minutes.' },
    ],
  },
  faq: {
    intro: 'Si vous vous posez une question, la réponse est sûrement ici.',
    items: [
      { q: 'Mon PDF est-il envoyé quelque part ?', a: 'Non. Losh n’a pas de serveur ; le PDF s’ouvre entièrement sur votre appareil, dans le navigateur. Essayez sans internet : cela fonctionne toujours.' },
      { q: 'Est-ce payant ? Faut-il un compte ?', a: 'Non. Losh est gratuit, sans publicité et sans compte. Tout le code est public sur GitHub.' },
      { q: 'Est-ce que ça marche hors ligne ?', a: 'Oui. Après une première visite, Losh est enregistré sur votre appareil. Les livres que vous avez choisi de garder s’ouvrent aussi hors ligne.' },
      { q: 'Sur quels appareils ça fonctionne ?', a: 'Sur tout appareil doté d’un navigateur à jour : iPhone, iPad, Android, Windows, Mac et Linux.' },
      { q: 'Où sont gardés ma dernière page et mes réglages ?', a: 'Uniquement sur cet appareil, dans le stockage du navigateur. Comme il n’y a pas de compte, ils ne sont pas copiés sur d’autres appareils.' },
      { q: 'Losh me suit-il ?', a: 'Non. Losh n’utilise ni cookies, ni publicité, ni outil d’analyse. Vercel, qui héberge le site, peut garder des journaux techniques d’accès comme tout hébergeur ; vos PDF ne vont jamais en ligne. Détails : [politique de confidentialité](./privacy/).' },
      { q: 'Pourquoi les photos ne s’inversent-elles pas en mode nuit ?', a: 'Losh garde les photos dans leurs couleurs naturelles et assombrit le texte et les dessins. Vous pouvez le désactiver dans les réglages.' },
      { q: 'Puis-je ouvrir des PDF protégés par mot de passe ?', a: 'Pas encore.' },
      { q: 'Comment effacer tout ce que Losh a gardé ?', a: 'Dans le lecteur, **{settings} → {clear}** efface les livres lus récemment. Effacer les données de ce site dans votre navigateur supprime aussi vos réglages et pages enregistrées.' },
      { q: 'Est-ce que ça soulage mes yeux fatigués ?', a: 'Losh rend l’écran plus doux et, si vous le souhaitez, vous rappelle une pause toutes les 20 minutes : regarder au loin 20 secondes et cligner des yeux. Mais ce n’est pas un produit médical ; si la douleur persiste, consultez un ophtalmologue.' },
    ],
  },
};

const ru: HomeContent = {
  install: {
    intro: 'Устанавливать Losh не обязательно: достаточно нажать «{start}». Но если добавить его на экран «Домой», он будет открываться со своей иконки и спокойно работать без интернета.',
    yourDevice: 'Ваше устройство',
    installed: 'Losh уже установлен на этом устройстве.',
    platforms: {
      ios: {
        name: 'iPhone и iPad',
        steps: [
          'Откройте loshreader.vercel.app в **Safari**.',
          'Нажмите кнопку **Поделиться** внизу (квадрат со стрелкой вверх).',
          'Выберите **На экран «Домой»** (если не видно, прокрутите список немного вниз).',
          'Нажмите **Добавить** в правом верхнем углу. Теперь Losh на вашем экране «Домой».',
        ],
        note: 'Losh в Safari и Losh на экране «Домой» хранят данные отдельно. Книги лучше хранить в Losh на экране «Домой».',
      },
      android: {
        name: 'Android',
        steps: [
          'Откройте loshreader.vercel.app в **Chrome**.',
          'Нажмите меню **⋮** в правом верхнем углу.',
          'Выберите **Установить приложение** (на некоторых телефонах **Добавить на главный экран**) и подтвердите.',
          'Теперь PDF можно открыть и из другого приложения через **Поделиться → Losh**.',
        ],
      },
      desktop: {
        name: 'Компьютер',
        steps: [
          'Откройте loshreader.vercel.app в **Chrome** или **Edge**.',
          'Нажмите значок **Установить** (экран со стрелкой вниз) справа в адресной строке.',
          'Нажмите **Установить**. Losh откроется в отдельном окне.',
          'PDF можно открыть сразу в Losh: щёлкните по нему правой кнопкой и выберите **Открыть с помощью → Losh**.',
        ],
        note: 'Safari на Mac: **Файл → Добавить в Dock**. Firefox не умеет устанавливать сайты, но Losh работает и там, прямо в браузере.',
      },
    },
  },
  guide: {
    intro: 'Разобраться можно за пару минут.',
    items: [
      { title: 'Откройте PDF', text: 'Нажмите «{start}», затем **{choose}**. На компьютере файл можно просто перетащить на страницу. Файл не покидает ваше устройство.' },
      { title: 'Выберите тон для глаз', text: '**{normal}**, **{sepia}**, **{night}** или **{darkSepia}**. В настройках можно изменить тёплый свет, яркость и контраст.' },
      { title: 'По ширине текста', text: 'Убирает пустые поля страницы и увеличивает текст до ширины экрана. На телефоне читаете без прокрутки в стороны.' },
      { title: 'Скройте меню', text: 'На телефоне коснитесь страницы один раз: меню исчезнут, и PDF займёт весь экран. Коснитесь снова, чтобы вернуть их.' },
      { title: 'Продолжайте с того же места', text: 'Losh помнит вашу страницу в каждой книге. Книги, которые вы решили сохранить, остаются в списке **{recent}** и открываются без интернета.' },
      { title: 'Поиск и сочетания клавиш', text: 'Лупа ищет по тексту книги. На компьютере клавиша **?** показывает все сочетания клавиш.' },
      { title: 'Делайте перерывы', text: 'Losh спросит об этом при первом чтении; потом **{breakReminder}** можно включить или выключить в разделе **{settings}**. Если он включён, после каждых 20 минут чтения будет 20-секундный перерыв: сначала смотрите вдаль, потом моргайте. Интервал можно выбрать от 10 до 60 минут.' },
    ],
  },
  faq: {
    intro: 'Если у вас есть вопрос, ответ, скорее всего, здесь.',
    items: [
      { q: 'Мой PDF куда-то загружается?', a: 'Нет. У Losh нет сервера; PDF открывается полностью на вашем устройстве, в браузере. Попробуйте без интернета — всё работает.' },
      { q: 'Это платно? Нужна регистрация?', a: 'Нет. Losh бесплатный, без рекламы и без регистрации. Весь код открыт на GitHub.' },
      { q: 'Работает ли без интернета?', a: 'Да. После первого открытия сайта Losh сохраняется на устройстве. Книги, которые вы решили сохранить, тоже открываются без интернета.' },
      { q: 'На каких устройствах работает?', a: 'На любом устройстве с современным браузером: iPhone, iPad, Android, Windows, Mac и Linux.' },
      { q: 'Где хранятся моя последняя страница и настройки?', a: 'Только на этом устройстве, в хранилище браузера. Аккаунтов нет, поэтому на другие устройства они не переносятся.' },
      { q: 'Losh следит за мной?', a: 'Нет. Losh не использует cookie, рекламу и аналитику. Vercel, где размещён сайт, может вести технические журналы доступа, как любой хостинг; ваши PDF никогда не попадают в интернет. Подробнее: [политика конфиденциальности](./privacy/).' },
      { q: 'Почему в ночном режиме фото не становятся негативом?', a: 'Losh оставляет фотографии в естественных цветах и затемняет текст и рисунки. Это можно отключить в настройках.' },
      { q: 'Можно ли открыть PDF с паролем?', a: 'Пока нет.' },
      { q: 'Как удалить всё, что сохранил Losh?', a: 'В читалке **{settings} → {clear}** удаляет недавние книги. Если очистить данные этого сайта в браузере, удалятся и настройки, и сохранённые страницы.' },
      { q: 'Поможет ли это при усталости глаз?', a: 'Losh делает экран мягче и, если хотите, каждые 20 минут напоминает о перерыве: 20 секунд смотреть вдаль и моргать. Но это не медицинский продукт; если боль не проходит, обратитесь к офтальмологу.' },
    ],
  },
};

export const HOME_CONTENT: Record<Locale, HomeContent> = { tr, en, es, fr, ru };
