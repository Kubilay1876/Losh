# Aşama 2 — Telefon uygulaması (PWA)

Losh artık telefona ve bilgisayara "uygulama" gibi kurulabiliyor ve bir kez açıldıktan sonra internetsiz çalışıyor.
Yayın adresi: https://loshreader.vercel.app (her `git push` sonrası Vercel kendiliğinden günceller).

## Ne eklendi

| Parça | Ne işe yarıyor | Nerede |
|---|---|---|
| **Manifest** | Tarayıcıya "bu site bir uygulama; adı, ikonu, renkleri bunlar" diyen dosya. Ana ekrana ekleme bunu kullanır. Açılış sayfası karşılama ekranı. | `apps/web/public/manifest.webmanifest` |
| **İkonlar** | iPhone ana ekranı (180 px), Android ve bilgisayar (192/512 px, Android'in kestiği "maskable" sürüm dahil). Logodan üretildi. | `apps/web/public/*.png` |
| **Service worker** | Arka planda çalışan küçük bir betik. İlk ziyarette sitenin tüm dosyalarını (yaklaşık 6 MB) cihaza kaydeder; internet yokken her şeyi oradan verir. | `apps/web/sw/sw.js` + derlemede dosya listesini yazan eklenti (`apps/web/vite.config.ts`) |
| **Son okunanlar** | Kullanıcı isterse açtığı PDF'ler cihazda (IndexedDB, tarayıcının içindeki veritabanı) saklanır; metroda internetsiz yeniden açılır. İlk PDF'te sorulur, en fazla 12 dosya tutulur, kaplanan yer gösterilir, tek tek ya da toplu silinir. | `packages/viewer/src/library.ts`, `RecentList.tsx` |
| **Paylaş → Losh (Android)** | Kurulu Losh, Android'in paylaş menüsünde çıkar; paylaşılan PDF okuyucuda açılır. Dosya hiçbir sunucuya gitmez: service worker onu cihazdaki bir önbelleğe koyar, okuyucu oradan alır. | `share_target` (manifest) + `sw.js` + `apps/web/src/app/main.tsx` |
| **Birlikte aç (bilgisayar)** | Chrome/Edge'de kurulu Losh, PDF dosyaları için "Birlikte aç" listesinde çıkar. | `file_handlers` (manifest) + `launchQueue` |
| **Telefon arayüzü** | Modlar ve sayfa numarası altta (tek elle), 44 px dokunma alanları, ayarlar alttan açılan panel, iki parmakla yakınlaştırma sadece PDF'i büyütür, sayfaya bir dokunuşla üst ve alt çubuk gizlenir (okuma modu), iPhone çentiği ve saat çubuğu için boşluk. | `packages/viewer/src/styles.css`, `pdf/pinch.ts` |

### Güncellemeler nasıl gelir
Sayfalar önce internetten istenir (3 saniye içinde gelirse yeni sürüm görünür), gelmezse cihazdaki kopya açılır.
Kod ve pdf.js dosyaları cihazdan verilir. Yeni sürümün dosyaları arka planda indirilir; pdf.js değişmediyse onun 4 MB'lık dosyaları yeniden indirilmez.

## iPhone'da ne çalışıyor, ne çalışmıyor (dürüst liste)

**Çalışıyor**
- Safari → Paylaş → **Ana Ekrana Ekle**: ikonlu, tam ekran uygulama (iOS 16.4'ten beri Chrome gibi diğer tarayıcılardan da eklenebiliyor).
- Bir kez açıldıktan sonra **tamamen internetsiz** açılış ve okuma.
- **Dosyalar** uygulaması / iCloud Drive'dan dosya seçerek PDF açma.
- Son okunanlar, kaldığın yerden devam, tüm modlar, arama, iki parmakla yakınlaştırma.

**Çalışmıyor (Apple izin vermiyor)**
- **Paylaş menüsünde Losh çıkmıyor.** iOS, web uygulamalarına "Share Target" desteği vermiyor. PDF'i açmak için Losh'u açıp "Dosya seç" demek gerekiyor.
- **"Birlikte aç" yok.** Dosyalar uygulamasında bir PDF'e dokununca Losh seçeneği çıkmıyor.
- **Otomatik "Yükle" önerisi yok.** iPhone kullanıcısı Ana Ekrana Ekle'yi kendisi bulmalı (Aşama 4'te sitede kısa bir rehber olacak).

**Bilinmesi gerekenler**
- Safari sekmesindeki Losh ile ana ekrandaki Losh **ayrı depolar** kullanıyor: Safari'de saklanan PDF'ler ve ayarlar ana ekran uygulamasında görünmez.
  Bu yüzden asıl kullanım ana ekran uygulaması olmalı.
- Safari, **sekmede** açılan siteler 7 gün kullanılmazsa onların verilerini silebiliyor. Ana ekrana eklenen uygulamalar bu kuraldan muaf.
- Cihazın yeri çok azalırsa tarayıcı yine de saklanan PDF'leri silebilir. Losh tarayıcıdan "kalıcı depolama" ister ama bu bir rica, garanti değil.

## Diğer platformlar (özet)

| | Kurulum | İnternetsiz | Paylaş → Losh | Birlikte aç |
|---|---|---|---|---|
| iPhone Safari | Elle (Ana Ekrana Ekle) | Evet | Hayır | Hayır |
| Android Chrome | Evet, tarayıcı önerir | Evet | **Evet** | — |
| Bilgisayar Chrome / Edge | Evet ("Yükle" simgesi) | Evet | — | **Evet** |
| Bilgisayar Firefox / Safari | Safari (macOS) "Dock'a ekle" ile; Firefox'ta sınırlı | Evet | — | Hayır |

## Nasıl test edildi
- Otomatik: başsız Chrome ile, sunucu tamamen kapatılarak internetsiz açılış, PDF açma, son okunanlardan açma, paylaş menüsü
  (Android'in gönderdiği isteğin aynısı), iki parmakla yakınlaştırma, telefon/masaüstü düzeni — 6 tekrarın 6'sında 16/16 geçti.
- "Eski Safari" taklidi (yeni JavaScript özellikleri silinerek) ile okuyucu açılıyor ve PDF çiziliyor.
- Elle test adımları: `docs/elle-test-listesi.md` → "Aşama 2".
