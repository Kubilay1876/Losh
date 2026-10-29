# Elle test listesi

Her aşamadan sonra bu listeyi baştan sona dene. Bir madde çalışmazsa hangi madde olduğunu not al.

Hazırlık: terminalde `cd C:\Users\admin\Desktop\losh` ve `npm.cmd run dev` çalışıyor, tarayıcıda `http://localhost:5173` açık. Test kitabı için bir kez `npm.cmd run test-pdf` (proje klasöründe `test-book.pdf` oluşur).

## Karşılama sayfası
- [ ] `http://localhost:5173` açılınca önce karşılama sayfası geliyor (Hoş geldin, Gözünü yormadan oku).
- [ ] "Hadi başlayalım" okuyucuyu açıyor.
- [ ] Okuyucuda sol üstteki "Losh" yazısı karşılamaya geri götürüyor.
- [ ] Sağ üstteki 🌐 "Language" düğmesine tıklayınca dil listesi açılıyor; English seçince sayfa İngilizce oluyor, okuyucuya geçince de İngilizce kalıyor.
- [ ] Bağış bölümünde "Bağış seçeneği yakında burada olacak." yazıyor.
- [ ] Telefon genişliğinde (tarayıcıyı daraltınca) yatay kaydırma çıkmıyor, buton tam genişlik.
- [ ] Hareket: açılışta başlık ve buton sırayla beliriyor; aşağı inerken kartlar ve bağış kutusu yumuşakça beliriyor; arka plan ışığı yavaşça dalgalanıyor.
- [ ] Windows Ayarlar → Erişilebilirlik → Görsel efektler → "Animasyon efektleri" kapatılınca hiçbir şey hareket etmiyor, her şey anında görünüyor.

## Aşama 1 — Görüntüleyici

### PDF açma
- [ ] "Dosya seç" ile bir PDF açılıyor.
- [ ] Bir PDF'i sayfanın üstüne sürükleyip bırakınca açılıyor (sürüklerken "Bırak, açılsın" yazısı çıkıyor).
- [ ] PDF olmayan bir dosya seçince "Bu bir PDF dosyası değil." uyarısı çıkıyor.
- [ ] Açıkken üstteki "PDF aç" ile başka bir PDF'e geçilebiliyor.

### Görünüm modları
- [ ] Varsayılan mod **Kağıt** (krem renk).
- [ ] Normal / Kağıt / Gece / Koyu sepya düğmeleri **anında** değişiyor.
- [ ] Klavyede `1` `2` `3` `4` modları seçiyor, `M` sıradaki moda geçiyor.
- [ ] Ayarlar (kaydırıcı simgesi ya da `S`): Sıcak ışık, Parlaklık, Kontrast kaydırıcıları anında etki ediyor.
- [ ] "Varsayılana dön" kaydırıcıları sıfırlıyor.
- [ ] Gece modunda (test kitabı, "fotoğrafları doğal renkte göster" açık — varsayılan):
  - 25. sayfadaki renkli resim doğal renkli (güneş sarı, gökyüzü mavi), biraz kısık;
  - 10. sayfadaki siyah-beyaz grafik koyu zemin üstünde açık çizgili (beyaz kutu yok);
  - 2. ve 3. sayfa (taranmış sayfa) koyu zemin, açık yazı (beyaz sayfa yok).
- [ ] Ayarı kapatınca 25. sayfadaki resim negatif gibi görünüyor.
- [ ] Sayfa yenilenince seçtiğin mod ve ayarlar korunuyor.

### Okuma
- [ ] Yazı fareyle seçilip kopyalanabiliyor (her modda). Seçim, yazının tam üstüne düşüyor.
- [ ] `Ctrl+F` ya da `/` aramayı açıyor; "zeytin" yazınca 321. sayfaya gidiyor, "1 / 1" görünüyor; `Enter` sonraki, `Shift+Enter` önceki sonuç.
- [ ] Yakınlaştırma: `+` `−` düğmeleri, açılır menü (Genişliğe sığdır, Sayfaya sığdır, yüzdeler), `0` genişliğe sığdırıyor.
- [ ] Sayfa kutusuna numara yazıp `Enter`'a basınca o sayfaya gidiyor; `←` `→` önceki/sonraki sayfa.
- [ ] 500 sayfalık test kitabında hızlı kaydırma takılmıyor.

### Kaldığı yerden devam
- [ ] Bir sayfaya git, sayfayı yenile, aynı PDF'i tekrar aç: "Kaldığın yerden devam: sayfa N" yazıyor ve o sayfa açılıyor.
- [ ] Dosyanın adını değiştirip tekrar açınca da kaldığı yeri hatırlıyor.

### Diğer
- [ ] `?` kısayol penceresini açıyor, `Esc` kapatıyor.
- [ ] Ayarlardan dil English yapılınca tüm yazılar İngilizce oluyor.
- [ ] Sadece klavyeyle (`Tab`) tüm düğmelere ulaşılabiliyor ve odaklanan düğmenin etrafında çerçeve görünüyor.
- [ ] Arayüz her zaman koyu mor temada (Windows açık temada olsa bile).
- [ ] Wi-Fi kapalıyken (sayfa zaten açıksa) PDF açmak çalışıyor.

## Aşama 2 — Telefon uygulaması (PWA)

Bunlar yayındaki sitede denenir: https://loshreader.vercel.app

### iPhone'a kurma ve internetsiz açılış
- [ ] Safari'de siteyi aç → Paylaş düğmesi (yukarı ok olan kare) → **Ana Ekrana Ekle**. Ana ekranda Losh logolu ikon çıkıyor.
- [ ] İkona dokununca Losh adres çubuğu olmadan, tam ekran ve **karşılama sayfasıyla** açılıyor.
- [ ] Üstteki saat ve pil göstergesi Losh'un düğmelerinin üstüne binmiyor.
- [ ] Uygulamayı bir kez açıp kapattıktan sonra **uçak modunu aç** → Losh'u ana ekrandan aç: karşılama sayfası, okuyucu ve PDF açma çalışıyor.

### Son okunanlar
- [ ] İlk PDF'i açınca altta "Bu PDF'i cihazında saklayayım mı?" kartı çıkıyor.
- [ ] "Evet, sakla" deyip okuyucuyu yeniden açınca **Son okunanlar** listesinde dosya adı, boyutu ve kaldığın sayfa görünüyor.
- [ ] Uçak modunda listedeki PDF'e dokununca kaldığın sayfadan açılıyor.
- [ ] Sonraki PDF'lerde kart bir daha çıkmıyor (seçim hatırlanıyor).
- [ ] Listede × ile tek dosya, "Tümünü sil" ile hepsi siliniyor (onay soruyor).
- [ ] Ayarlar'daki "PDF'leri bu cihazda sakla" seçeneği (Sor / Evet / Hayır) ve kaplanan yer görünüyor.

### Telefon arayüzü
- [ ] Modlar ve sayfa numarası **altta**, başparmakla ulaşılacak yerde.
- [ ] Sayfaları iki parmakla açıp kapatınca (pinch) **sadece PDF** büyüyor, üst ve alt çubuklar aynı kalıyor; parmaklar durunca yazı netleşiyor.
- [ ] PDF açıkken sayfaya **bir kez dokununca** üst ve alt çubuk kayarak kayboluyor, PDF bütün ekranı kaplıyor; yazı yerinden oynamıyor. Bir daha dokununca çubuklar geri geliyor.
- [ ] İlk PDF'te bir kez "Menüleri gizlemek ya da geri getirmek için sayfaya bir kez dokun." ipucu çıkıyor, sonra bir daha çıkmıyor.
- [ ] PDF'in son sayfasının en altı alt çubuğun arkasında kalmıyor.
- [ ] Üstteki **Yazıya sığdır** düğmesine (iki dikey çizgi arasında satırlar) basınca sayfanın boş kenarları ekran dışına çıkıyor, yazı ekranı kenardan kenara dolduruyor; düğme basılı görünüyor. Bir daha basınca eski haline dönüyor.
- [ ] Yazıya sığdır açıkken açılan bir sonraki PDF de yazıya sığdırılmış açılıyor.
- [ ] Yakınlaştırıp sayfa ekrandan genişken aşağı kaydırınca sayfa **sağa sola kaymıyor**; belirgin şekilde yana kaydırınca yana gidiyor.
- [ ] Ayarlar alttan yukarı kayan bir panel olarak açılıyor.
- [ ] Sayfa numarası kutusuna dokununca ekran kendi kendine büyümüyor.
- [ ] Telefonu yan çevirince de düzen bozulmuyor.

### Android ve bilgisayar (cihaz varsa)
- [ ] Android Chrome: siteye girince "Uygulamayı yükle" çıkıyor; kurulunca bir PDF'i **Paylaş** menüsünden Losh'a gönderince okuyucuda açılıyor.
- [ ] Bilgisayar Chrome/Edge: adres çubuğundaki "Yükle" simgesiyle kurulabiliyor; kurulu Losh, PDF dosyalarında "Birlikte aç" listesinde çıkıyor.

## Aşama 4 — Karşılama sayfası ve göz molası

### Karşılama sayfası
- [ ] Üstte **Kurulum · Nasıl kullanılır · SSS · Destek ol** var (telefonda ☰ menüsünde); tıklayınca sayfa o bölüme kayıyor, çubuk üstte sabit kalıyor.
- [ ] Kurulum bölümünde kendi cihazının sekmesi açık ve **Senin cihazın** yazıyor; iPhone adımlarının altında ekran görüntüleri var.
- [ ] SSS'de bir soruya dokununca cevabı açılıyor.
- [ ] Dil değiştirince bölümlerin hepsi o dile geçiyor.

### Göz molası (20-20-20)
- [ ] Bir PDF açıp ~45 saniye okuyunca bir kez "20 dakikada bir kısa bir göz molası hatırlatayım mı?" diye soruyor; cevap verince bir daha sormuyor.
- [ ] "Evet" dedikten sonra 20 dakika okuyunca sayfa kararıyor, 20 saniyelik sayaç çıkıyor: önce "uzağa bak", sonra "göz kırp", sonunda "Gözlerin dinlendi".
- [ ] **5 dk sonra** 5 dakika sonra yeniden hatırlatıyor; **Atla** kapatıyor.
- [ ] Losh arka plandayken ya da telefon kilitliyken süre işlemiyor.
- [ ] Görünüm ayarlarında hatırlatıcı açılıp kapanıyor ve aralığı (10–60 dk) değiştirilebiliyor.

## İşaretleyici

### iPhone
- [ ] Bir PDF açınca sağ altta, alt çubuğun hemen üstünde kalem düğmesi var. Sayfaya dokunup menüleri gizleyince o da kayboluyor.
- [ ] Kaleme basınca 4 renk, silgi ve geri al açılıyor; ilk seferde "Kaydırmak için iki parmak kullan" ipucu çıkıyor.
- [ ] Parmağınla bir satırın üstünden geçince işaret **satıra oturuyor**: sadece kelimeler boyanıyor, üst ve alt satıra taşmıyor; elin biraz kaysa da tek satırda kalıyor.
- [ ] Birkaç satır boyunca aşağı çekince o satırlar düzgünce boyanıyor (ilk satır başladığın kelimeden, son satır bitirdiğin kelimeye kadar).
- [ ] Kalem açıkken tek parmak sayfayı kaydırmıyor; **iki parmakla** kaydırma ve yakınlaştırma çalışıyor.
- [ ] Kalem açıkken uzun basınca iPhone'un kopyala/seç menüsü çıkmıyor.
- [ ] Başka renk seçince sonraki işaret o renkte; kalem düğmesindeki küçük nokta da o renge dönüyor.
- [ ] **Geri al** son adımı geri alıyor (çizdiğini de, sildiğini de).
- [ ] **Silgi** kalem gibi çalışıyor: üstünden geçtiğin kelimeler ya da satırlar siliniyor, işaretin geri kalanı duruyor. Bir kelimeye tek dokunuş sadece o kelimeyi siliyor.
- [ ] Gece ve koyu sepya modunda işaretler koyu renkli şerit olarak görünüyor, üstündeki yazı rahat okunuyor.
- [ ] Yakınlaştırınca, "Yazıya sığdır"ı açınca işaretler yerinde kalıyor.
- [ ] Losh'u kapatıp aynı PDF'i yeniden açınca işaretler duruyor.
- [ ] Taranmış (fotoğraf gibi) bir kitapta da işaret satırın yüksekliğinde, düz bir şerit oluyor.
- [ ] Kalem düğmesine yeniden basınca normal okumaya dönülüyor: tek parmak yine kaydırıyor.

### Bilgisayar
- [ ] Fareyle yazının üstünden sürükleyince aynı şekilde satıra oturuyor; **H** kalemi açıp kapatıyor, **Ctrl+Z** geri alıyor, **Esc** kalemi kapatıyor.
