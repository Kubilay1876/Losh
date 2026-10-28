# Losh

Göz dostu, ücretsiz ve açık kaynak PDF okuyucu. PDF'ler cihazından hiçbir yere gönderilmez; her şey tarayıcıda, internetsiz çalışır.

*An eye-friendly, free and open-source PDF reader. Your files never leave your device.*

> Durum: geliştirme aşamasında (Aşama 1 tamam: çekirdek, görüntüleyici, karşılama sayfası). Plan: [docs/asama-0-plan.md](docs/asama-0-plan.md)

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

## Yapı

```
apps/web          web sitesi: karşılama sayfası (/) ve okuyucu (/app/)
packages/core     modlar, filtreler, ayarlar, çeviriler, proje ayarları (saf TypeScript)
packages/viewer   pdf.js tabanlı görüntüleyici + arayüz (Preact)
scripts/          yardımcı betikler
docs/             plan ve test listeleri
```

## Lisans

[MIT](LICENSE) · Üçüncü taraf lisansları: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

Losh bir okuma kolaylığı aracıdır, tıbbi bir ürün değildir. Göz ağrınız sürerse bir göz doktoruna başvurun.
