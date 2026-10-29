<p align="center">
  <img src="apps/web/public/og-image.jpg" alt="Losh: aynı sayfanın beyaz, kağıt ve gece tonları" width="720">
</p>

# Losh

**Gözünü yormadan oku.** Losh, PDF kitaplarını kağıt ya da gece tonunda gösteren ücretsiz ve açık kaynak bir okuyucu. Üyelik yok, reklam yok; PDF'lerin cihazından hiçbir yere gönderilmez.

**Hemen dene:** https://loshreader.vercel.app · [English](README.en.md)

## Neden Losh?

**Sorun:** Uzun süre PDF kitap okuyunca gözler yoruluyor ve ağrıyor. Bembeyaz sayfa ve sert ekran ışığı bunu daha da artırıyor.

**Amaç:** Herkesin, özellikle öğrencilerin ve kitap okuyanların, PDF'lerini gözünü yormadan, ücretsiz ve güvenle okuyabilmesi.

**İsim:** *Loş*: kısık, yumuşak, rahat ışık. Losh'un sayfaları da arayüzü de tam böyle hissettirmek için tasarlandı.

> Losh'u, PDF kitap okurken gözleri yorulan biri olarak önce kendim için, sonra aynı sorunu yaşayan herkes için yaptım. — Kubilay

### Sözümüz

- **Hep ücretsiz:** Ücretli sürüm, abonelik ya da reklam yok. Sadece isteğe bağlı bağış.
- **Dosyan sende kalır:** PDF'ler hiçbir sunucuya yüklenmez; takip, çerez ya da ölçüm aracı yok.
- **İnternetsiz çalışır:** Metroda, uçakta, internetin olmadığı her yerde okuyabilirsin.
- **Açık kaynak:** Kodun tamamı burada; söylediklerimizi herkes kontrol edebilir.

## Neler yapar

- **Göz dostu modlar:** Normal, Kağıt, Gece ve Koyu sepya; sıcak ışık, parlaklık ve kontrast ayarı. Gece modunda fotoğraflar doğal renginde kalır.
- **Yazıya sığdır:** Sayfanın boş kenarlarını atar, yazıyı ekran genişliğine büyütür. Telefonda yana kaydırmadan okursun.
- **Okuma modu:** Telefonda sayfaya bir kez dokun, menüler kaybolsun.
- **İşaretleyici:** Sağ alttaki kalemle önemli yerleri 4 renkle işaretle. Parmağınla kabaca geçsen de işaret satıra oturur, taşmaz; işaretler kitapla birlikte cihazında saklanır.
- **Kaldığın yerden devam:** Her kitapta kaldığın sayfayı hatırlar; istersen kitapları cihazında saklar (**Son okunanlar**).
- **Göz molası (20-20-20):** İstersen 20 dakikada bir, 20 saniyelik bir mola verdirir: önce uzağa bak, sonra göz kırp.
- **Her yerde çalışır:** iPhone, Android ve bilgisayarda ana ekrana eklenir; bir kez açtıktan sonra internetsiz çalışır.
- **Beş dil:** Türkçe, English, Español, Français, Русский.

Kurulum ve kullanım rehberi sitede: [Kurulum](https://loshreader.vercel.app/#install) · [Nasıl kullanılır](https://loshreader.vercel.app/#guide) · [SSS](https://loshreader.vercel.app/#faq)

## Gizlilik

Losh hiçbir bilgi toplamaz: sunucu, hesap, çerez, reklam ya da ölçüm aracı yok. PDF'ler tarayıcının içinde açılır; ayarlar ve saklanan kitaplar sadece senin cihazında durur. Ayrıntılar: [gizlilik politikası](https://loshreader.vercel.app/privacy/).

## Geliştirme

Gerekenler: [Node.js](https://nodejs.org) 22 veya üstü.

```sh
npm install        # bağımlılıkları kur (bir kez)
npm run dev        # siteyi aç: http://localhost:5173 (karşılama) → /app/ (okuyucu)
npm test           # birim testleri
npm run typecheck  # TypeScript tür denetimi
npm run build      # derleme (apps/web/dist)
npm run test-pdf   # 500 sayfalık test kitabı üret (test-book.pdf)
```

Her `main` güncellemesi Vercel'de kendiliğinden yayına çıkar. Elle denenecekler: [docs/elle-test-listesi.md](docs/elle-test-listesi.md).

### Yapı

```
apps/web          web sitesi: karşılama (/), okuyucu (/app/), gizlilik (/privacy/), service worker
packages/core     modlar, filtreler, ayarlar, çeviriler, göz molası sayacı (saf TypeScript, testli)
packages/viewer   pdf.js tabanlı görüntüleyici ve arayüzü (Preact)
scripts/          yardımcı betikler
docs/             plan, aşama raporları, test listeleri
```

Kullanılanlar: TypeScript, [Preact](https://preactjs.com), [pdf.js](https://mozilla.github.io/pdf.js/), Vite, Vitest.

## Destek

Losh tamamen ücretsiz. Geliştirmeye destek olmak için yakında GitHub Sponsors bağlantısı eklenecek. Bir hata ya da öneri için [issue açabilirsin](https://github.com/Kubilay1876/Losh/issues).

## Lisans

[MIT](LICENSE) · Üçüncü taraf lisansları: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

Yapımcı: Kubilay Ç. ([@Kubilay1876](https://github.com/Kubilay1876))

Losh bir okuma kolaylığı aracıdır, tıbbi bir ürün değildir. Göz ağrınız sürerse bir göz doktoruna başvurun.
