# Elle test listesi

Her aşamadan sonra bu listeyi baştan sona dene. Bir madde çalışmazsa hangi madde olduğunu not al.

Hazırlık: `npm run dev` çalışıyor, tarayıcıda `http://localhost:5173` açık. Test kitabı için bir kez `npm run test-pdf` (proje klasöründe `test-book.pdf` oluşur).

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
- [ ] Windows açık/koyu tema değiştirince araç çubuğu da açık/koyu oluyor.
- [ ] Wi-Fi kapalıyken (sayfa zaten açıksa) PDF açmak çalışıyor.
