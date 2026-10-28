# Aşama 5 — Cila ve yayın hazırlığı

Tarayıcı eklentisi (Aşama 3) rafa kalktığı için mağaza materyalleri ve zip paketleme bu aşamada yok. Onların yerine site için gereken son işler yapıldı.

## Erişilebilirlik

- **Otomatik denetim (axe-core, WCAG 2.2 A/AA + iyi uygulamalar):** 11 ekran tarandı: karşılama (bilgisayar, telefon, dil ve ☰ menüsü açık), okuyucu (boş, PDF açık, saklama kartı, ayarlar, arama, yardım, son okunanlar), göz molası ekranı, gizlilik sayfası. Bulunan 3 sorun düzeltildi, hepsi temiz.
  - Okuyucunun üst çubuğu artık bir başlık bölgesi (`header`); ekran okuyucu kullananlar ona bölgeler arası kısayolla ulaşıyor.
  - Sayfa alanının adı ekran okuyuculara ulaşıyor (`role="region"`).
  - Rehber ekran görüntüleri, hemen üstündeki adım yazısını ikinci kez okutmuyor.
- **Klavyeyle gezinme:** Karşılama sayfasında 21, okuyucunun üst kısmında 15 durak; hepsi ekranda ve odak halkalı. `S` ayarları açıp odağı içine alıyor, `Escape` kapatıyor. Dil fareyle seçilince artık düğmede halka kalmıyor.
- Sayfa alanında her yüklü sayfanın yazı katmanı ayrı bir durak: bu pdf.js'in bilinçli tercihi (ekran okuyucu ve klavyeyle metin seçimi için), olduğu gibi bırakıldı.
- Hareketler `prefers-reduced-motion` ayarına uyuyor; renk karşıtlığı denetimden geçti.

## Performans (500 sayfalık kitap)

- Açılış, ilk sayfa çizilene kadar: ~1,3 saniye.
- Mod değiştirme, 4 kat yavaşlatılmış telefonda: 0,1–0,18 saniye (gözle anında).
- İki parmakla yakınlaştırma: hareket boyunca sadece esnetme, sonda tek yeniden dizilme (takılan kare 45 → 7).

## Gizlilik politikası

`/privacy/`, beş dilde: ne saklandığı ve nerede durduğu, nasıl silineceği, çerez/reklam/ölçüm olmadığı, barındırıcı Vercel'in teknik erişim kayıtları, bağışın GitHub'da işlendiği. Altbilgiden ve SSS'den bağlantılı.
Testle doğrulandı: karşılama, gizlilik ve PDF açılmış okuyucu boyunca bilgisayardan dışarı **hiçbir istek** çıkmıyor.

## Paylaşım ve arama motorları

- Link paylaşılınca görünen 1200×630 kart (`og-image.jpg`, 90 KB) ve Open Graph / Twitter etiketleri.
- `robots.txt`, `sitemap.xml`, sayfa açıklamaları ve `canonical` adresleri.
- Tam adres gerektiren yerler `https://loshreader.vercel.app` yazıyor; özel alan adına geçilirse `index.html`, `privacy/index.html`, `robots.txt` ve `sitemap.xml` güncellenmeli.

## README

GitHub sayfası için Türkçe (`README.md`) ve İngilizce (`README.en.md`) tanıtım: ne yapar, gizlilik, geliştirme komutları, yapı, lisans.

## Bekleyenler

- **Bağış:** GitHub Sponsors onaylanınca `packages/core/src/config.ts` içinde `SUPPORT.enabled = true` ve `.github/FUNDING.yml`. Öncesinde Vercel Hobby planının ticari olmayan kullanım şartı kontrol edilecek (gerekirse Cloudflare Pages).
- **Tarayıcı eklentisi:** rafta.
