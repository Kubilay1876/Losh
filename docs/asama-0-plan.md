# Losh — Aşama 0: Plan ve Araştırma Raporu

Tarih: 27 Ekim 2026 · Durum: **Onay bekliyor** (henüz uygulama kodu yok)

---

## 1. Projeyi nasıl anladım (kısa özet)

Losh, uzun süre PDF kitap okurken göz yorgunluğunu azaltan **ücretsiz ve açık kaynak** bir PDF okuyucu. PDF'i sepya, gece gibi göz dostu renklerle gösteriyor. Sıcak ışık, parlaklık ve kontrast ayarlanabiliyor. İsteyene 20-20-20 mola hatırlatması yapıyor.

Üç parçadan oluşuyor:
1. **Tarayıcı eklentisi** (önce Edge, sonra Firefox, en son Chrome mağazası)
2. **PWA**: telefona "uygulama gibi" eklenen, internetsiz de çalışan web sitesi
3. **Tanıtım sitesi** (Vercel'de)

Eklenti ve PWA **aynı çekirdeği** paylaşıyor.

Değişmez kurallar: sunucu yok, maliyet yok, PDF cihazdan hiç çıkmıyor, takip ve reklam yok, tamamen çevrimdışı çalışıyor.

---

## 2. Denemelerin sonuçları (gerçek tarayıcıda yapıldı)

Deneme ortamı: Chrome for Testing 156 (Google'ın otomasyon için yayınladığı resmi Chrome sürümü), pdf.js 6.4.299.

| Deneme | Sonuç |
|---|---|
| pdf.js'i eklentinin içine gömüp, internetsiz ve CDN'siz PDF açmak | ✅ Çalıştı. 2 sayfa açıldı, metin okundu. |
| Eklentinin katı güvenlik kurallarında (Manifest V3) pdf.js çalışıyor mu? | ✅ Evet (`isEvalSupported: false` ayarıyla) |
| Sepya filtresinin görüntüye anında uygulanması | ✅ Çalıştı |
| **Otomatik yönlendirme:** tarayıcıda açılan bir PDF'i Losh görüntüleyicisine göndermek | ✅ Çalıştı. Adresinde ".pdf" geçmeyen bir PDF bile yakalandı, çünkü sunucunun "bu bir PDF" etiketine (`Content-Type`) bakıyoruz. |
| **B yolu:** Chrome'un kendi PDF ekranında eklenti kodu çalışıyor mu? | ✅ Çalışıyor, filtre sayfaya eklendi |
| B yolu: Filtre PDF'in **kendisini** gerçekten boyuyor mu? | ✅ Kubilay elle denedi (28 Ekim 2026, Chrome 156). Hem web PDF'i hem bilgisayardaki PDF (dosya erişimi açıkken) koyu zemin + açık yazı oldu. |

### Karar önerisi: A ana yol, B sonra hafif ek seçenek

- **A (kendi görüntüleyicimiz)** her açıdan çalıştı. Web uygulamasıyla aynı kodu kullanıyor. Arama, kaldığı yerden devam ve sıcak ışık gibi her özellik burada mümkün.
- **B (Chrome'un ekranının üstüne filtre)** en iyi ihtimalle sadece "her şeyi ters çevir" gibi kaba bir filtre verebilir. Arama, kaldığın yer ya da mola hatırlatıcısı yok. Chrome bir güncellemeyle bunu her an bozabilir.
- **Elle test sonucu:** B, Chrome 156'da hem web hem yerel PDF'lerde görsel olarak çalışıyor.
- **Önerim:** İlk sürümün ana yolu A olsun. A'daki otomatik yönlendirme zaten "PDF'e tıkla, Losh'ta açılsın" deneyimini veriyor. B'yi ana yol bittikten sonra ayarlardan açılan hafif bir ek seçenek olarak ekleyebiliriz ("Chrome'un kendi görüntüleyicisini koyulaştır"). Chrome bir güncellemeyle bozabileceği için ana yol yapmayalım.

---

## 3. Teknoloji önerileri

| Konu | Öneri | Neden (kısaca) |
|---|---|---|
| Dil | **TypeScript** | Yazım hatalarını kod çalışmadan yakalar |
| Derleme aracı | **Vite** | Hızlı ve basit. Hem eklentiyi hem web sitesini üretebilir. |
| Arayüz | **Preact** (yaklaşık 4 KB) | Ayarlar, popup ve "son okunanlar" gibi ekranlarda kod düzenli kalır. React ile neredeyse aynı olduğu için öğrendiğin şey başka işlerde de işine yarar. Tanıtım sitesi ise düz HTML/CSS olur. |
| PDF | **pdf.js 6.x** + pdf.js'in hazır `PDFViewer` bileşeni | Tembel yükleme, metin seçme, sayfa içi arama ve yakınlaştırma bu bileşende **hazır geliyor**. Sıfırdan yazmak yerine bunu kullanmak hem daha hızlı hem daha sağlam. |
| Kaldığı yer | pdf.js'in belge parmak izi (`fingerprint`). Yoksa dosyanın SHA-256 özeti. | Dosya adı değişse bile aynı kitabı tanır |
| PWA çevrimdışı | **vite-plugin-pwa** | Service worker'ı (tarayıcının arka planda dosyaları saklayan yardımcısı) elle yazmak hataya açık. Bu araç onu bizim için üretir. |
| Testler | **Vitest** | Vite ile aynı ayarları kullanır |
| Repo yapısı | **npm workspaces** | Tek repo içinde paketler birbirini kullanabilir |
| Lisans | **MIT** ✅ | pdf.js'in Apache-2.0 lisansıyla uyumlu (pakete pdf.js'in lisans notunu eklememiz yeterli) |

### Klasör yapısı

```
losh/
├─ packages/
│  ├─ core/        → modlar, filtre hesapları, ayar şeması, çeviriler (saf TypeScript)
│  └─ viewer/      → pdf.js görüntüleyici + araç çubuğu + mola hatırlatıcısı
├─ apps/
│  ├─ extension/   → eklenti (manifest, popup, karşılama sayfası, ayarlar)
│  └─ web/         → PWA (/app) + tanıtım sitesi (/) + gizlilik sayfası
├─ scripts/        → eklenti zip'leme, Firefox manifest üretme
├─ docs/           → bu rapor, test listeleri, mağaza metinleri
└─ .github/FUNDING.yml
```

### Görünüm modları nasıl yapılacak

- **Sepya, parlaklık, kontrast:** sayfa resminin üstüne CSS filtresi. Sayfayı yeniden çizmeye gerek yok, **anında** değişir.
- **Sıcak ışık:** sayfanın üstüne yarı saydam turuncu bir katman (`mix-blend-mode: multiply`).
- **Gece:** `invert + hue-rotate(180°)`. Renkler ters çevrilir, ardından renk tonu geri döndürülür. Böylece kırmızı yine kırmızı kalır.
- **Metin katmanı:** pdf.js'te seçilebilir metin, sayfanın üstünde görünmez bir katman. Filtreyi sadece resim katmanına uyguladığımız için seçme ve arama her modda çalışır.

### ⚠️ Gece modunda resimler (dürüst sınırlama)

CSS filtresi yazı ile fotoğrafı birbirinden ayıramaz. Gece modunda fotoğraflar da ters döner. Renkler yaklaşık korunur ama aydınlık ve karanlık yerler yer değiştirir, yani fotoğraflar biraz "negatif" gibi görünür. Düz yazı kitaplarında sorun olmaz. Bol resimli kitaplarda göze batar.

- **Olası çözüm:** pdf.js'in `pageColors` adlı bir ayarı var. Sayfayı doğrudan koyu renklerle çiziyor. Bu durumda resimler bozulmayabilir ama mod değişimi anlık olmaz, sayfalar yeniden çizilir.
- Bunu Aşama 1'de deneyip sana göstereceğim. Henüz doğrulamadım.

---

## 4. Eklenti ayrıntıları

### İzinler (en azda tuttum)

| İzin | Ne zaman | Neden |
|---|---|---|
| `storage` | Kurulumda | Ayarları kaydetmek için (Chrome hesabıyla senkron olabilir, sunucu gerekmez) |
| `contextMenus` | Kurulumda | Sağ tık → "Losh ile aç" |
| `declarativeNetRequest` | Kurulumda | Otomatik yönlendirme kuralı için. Tarayıcı kuralı kendisi uygular; biz trafiği okumayız. |
| Tüm sitelere erişim (`<all_urls>`) | **İsteğe bağlı, kullanıcı açarsa** | Web'deki PDF'leri yakalayıp indirebilmek için gerekli. Mağazada "tüm sitelerdeki verilerinizi okuyabilir" diye korkutucu bir uyarı çıkarıyor. Bu yüzden kurulumda **istemeyelim**. Kullanıcı ayarlardan "Web PDF'lerini Losh'ta aç" seçeneğini açınca soralım. |
| Dosya URL'lerine erişim | Kullanıcı elle açar | Bilgisayardaki PDF'ler (`file://`) için. Kod ile açılamaz. Karşılama sayfası nasıl açılacağını resimli anlatacak. Kapalıysa `isAllowedFileSchemeAccess()` ile anlayıp hatırlatacağız. |

Notlar:
- Otomatik yönlendirme Chrome/Edge **128 ve üstünü** istiyor. Senin tarayıcıların 156, sorun yok.
- Yönlendirmede PDF iki kez indirilir (bir kez tarayıcı, bir kez Losh). Küçük bir verimsizlik ama dosya yine hiçbir sunucuya gitmez.
- Bilgisayardaki dosyaların (`file://`) eklenti sayfasından okunup okunamadığını otomasyonla deneyemedim, çünkü bu izin elle açılıyor. Aşama 3'te ilk kontrol edeceğimiz şey bu. Olmazsa yedek yol: sürükle-bırak ve dosya seçici, ikisi de her zaman çalışır.

### Firefox

- Firefox, eklentinin arka plan dosyasını farklı bir şekilde istiyor (`scripts` alanı). Chrome bu alanı yok sayıyor. Derleme betiği Firefox için ayrı bir manifest üretecek.
- Firefox'ta otomatik yönlendirmeyi ilk sürümde koymamayı öneriyorum. Firefox'un kendi PDF görüntüleyicisi zaten pdf.js. İlk sürümde eklenti düğmesi ve sağ tık menüsü yeterli.

---

## 5. PWA: hangi cihazda ne çalışır?

| Özellik | Android Chrome | Masaüstü Chrome/Edge | iPhone Safari | Firefox |
|---|---|---|---|---|
| Ana ekrana / bilgisayara kurma | ✅ | ✅ | ✅ (iOS 26'dan beri her site "web uygulaması" olarak eklenebiliyor) | ⚠️ Site olarak çalışır |
| İnternetsiz açılma | ✅ | ✅ | ✅ | ✅ |
| "Paylaş → Losh" (Share Target) | ✅ (uygulama kuruluysa) | ❌ | ❌ | ❌ |
| "Birlikte aç → Losh" (File Handling) | ❓ Aşama 2'de denenecek | ✅ (deneysel ama Chromium'da var) | ❌ | ❌ |
| Dosya seçiciyle açma | ✅ | ✅ | ✅ (Dosyalar uygulaması, iCloud dahil) | ✅ |
| Son okunanları cihazda saklama (IndexedDB) | ✅ | ✅ | ⚠️ Çalışır, ama iOS uzun süre açılmayan uygulamaların verisini silebilir | ✅ |

**iPhone özetle:** Losh iPhone'da çalışır, internetsiz de açılır. Ama "Paylaş" menüsünde görünmez. Kullanıcı PDF'i uygulama içindeki "Dosya aç" düğmesiyle seçer. Bunu tanıtım sitesinde açıkça yazacağız.

---

## 6. Diğer kontroller

| Konu | Sonuç |
|---|---|
| `losh.vercel.app` | ❌ Başkası almış (kapalı bir proje duruyor) |
| `losh-reader.vercel.app` | ✅ Kontrol ettiğim anda boştu |
| GitHub Sponsors Türkiye | ✅ **Destekleniyor** (resmi listede var). Kişisel bağışlarda GitHub kesinti yapmıyor. *Daha önce "belirsiz" demiştim, o endişem yersizmiş.* |
| Vercel ücretsiz plan + bağış bağlantısı | ✅ Vercel'in kurallarında açıkça yazıyor: "Bağış istemek ticari kullanım sayılmaz." |
| Mağaza ücretleri | Edge: ücretsiz · Firefox: ücretsiz · Chrome: bir kerelik 5 $ |

---

## 7. Kararlar (28 Ekim 2026)

| Konu | Karar |
|---|---|
| Arayüz | **Preact** |
| Web PDF izni | Kurulumda istenmez; kullanıcı ilk kez web PDF'i açmak istediğinde istenir (isteğe bağlı izin) |
| Adres | **`loshreader.vercel.app`** (28 Ekim'de boştu; ilk yayında alınacak) |
| Gece modu | Hızlı CSS yöntemiyle başla; resimleri koruyan `pageColors` yöntemi Aşama 1'de denenip gösterilecek |
| Telefon | **iPhone** → mobil testler iOS öncelikli; Share Target iOS'ta yok, "Dosya aç" düğmesi öne çıkacak |
| GitHub reposu | Kubilay GitHub sitesinden açacak (Aşama 1 sonunda adımlar verilecek), kodu Claude gönderecek |
| Bağış | Sponsors başvurusu henüz yok → bağlantı **kapalı** başlar, tek ayarla açılacak |

Aşağıdaki sorular yukarıdaki kararlarla cevaplandı.

### Sorulan sorular

1. **Arayüz:** Preact mı (önerim), yoksa hiç framework kullanmayalım mı?
2. **Web PDF'leri:** "Tüm sitelere erişim" izni kurulumda değil, kullanıcı açınca istensin. Bu yaklaşım uygun mu?
3. **Adres:** `losh-reader.vercel.app` olur mu, yoksa başka bir isim mi düşünürsün?
4. **Gece modu ve resimler:** İlk sürümde hızlı CSS yöntemi yeterli mi, yoksa resimleri korumak senin için önemli mi?
5. **Telefon:** Senin telefonun Android mi iPhone mu? Testleri ona göre önceliklendiririm.
6. **GitHub reposu:** `Kubilay1876/losh` adıyla public bir repo açmamız gerekecek. Bilgisayarında GitHub komut satırı aracı (`gh`) kurulu değil. Repoyu GitHub sitesinden sen mi açarsın, yoksa `gh`'yi kurup ben mi açayım?
7. **Bağış bağlantısı:** Sponsors başvurun onaylandı mı? Onaylanmadıysa başlangıçta bağlantıyı kapalı tutarım.

---

## 8. Senin yapacağın küçük test (B yolu, yaklaşık 3 dakika)

Bu test sadece "Chrome'un kendi PDF ekranına filtre uygulanabiliyor mu?" sorusunu cevaplamak için.

1. Chrome'da adres çubuğuna `chrome://extensions` yaz ve Enter'a bas.
2. Sağ üstteki **Geliştirici modu** düğmesini aç.
3. **Paketlenmemiş öğe yükle** düğmesine bas ve şu klasörü seç: `Masaüstü\losh\spikes\extB`
4. Yeni bir sekmede herhangi bir web PDF'i aç, örneğin: `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`
5. **Beklenen:** PDF koyu arka planlı ve açık yazılı görünür (gece modu gibi).
6. (İsteğe bağlı) Eklentinin **Ayrıntılar** sayfasında "Dosya URL'lerine erişime izin ver" seçeneğini aç. Sonra bilgisayarındaki bir PDF'i Chrome'a sürükle. Aynı etki görünüyor mu?
7. Bitince eklentiyi **Kaldır**.

Bana sadece şunu söylemen yeterli: **"Web PDF'i koyu oldu / olmadı"** ve **"bilgisayardaki PDF koyu oldu / olmadı"**. Mümkünse bir ekran görüntüsü de at.

---

## Kaynaklar

- [GitHub Sponsors — desteklenen bölgeler](https://docs.github.com/en/sponsors/getting-started-with-github-sponsors/about-github-sponsors)
- [Vercel Fair Use (bağış ticari sayılmaz)](https://vercel.com/docs/limits/fair-use-guidelines)
- [Chrome declarativeNetRequest (responseHeaders, Chrome 128+)](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest)
- [Chrome PDF görüntüleyicisi ve CSS filtreleri](https://dev.to/liuhao04/why-most-pdf-dark-mode-chrome-extensions-do-nothing-on-a-web-pdf-on5)
- [web.dev — PWA işletim sistemi entegrasyonu](https://web.dev/learn/pwa/os-integration)
- [WebKit — iOS 26 ana ekran web uygulamaları](https://webkit.org/?p=16993)
- [MDN — cross-browser eklenti, background alanı](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Build_a_cross_browser_extension)
