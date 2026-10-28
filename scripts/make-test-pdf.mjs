// Generates a large test book: node scripts/make-test-pdf.mjs [pages=500] [out=test-book.pdf]
// Plain text pages, a colourful image every 25 pages, and the word "zeytin" only on page 321 (for search tests).
import { writeFileSync } from 'node:fs';

const pageCount = Number(process.argv[2] ?? 500);
const out = process.argv[3] ?? 'test-book.pdf';

const objects = []; // index i -> object number i + 1
const add = (body) => objects.push(body) && objects.length;

const catalog = add(null);
const pages = add(null);
const font = add('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>');
const bold = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

// 96x64 RGB gradient image with a sun, stored uncompressed.
const W = 96, H = 64;
const pixels = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    const sun = (x - 70) ** 2 + (y - 18) ** 2 < 120;
    pixels[i] = sun ? 255 : 40 + (y / H) * 200;
    pixels[i + 1] = sun ? 210 : 90 + (x / W) * 80;
    pixels[i + 2] = sun ? 60 : 220 - (y / H) * 160;
  }
}
const image = add(`<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Length ${pixels.length} >>\nstream\n${pixels.toString('latin1')}\nendstream`);

const lorem =
  'The quick brown fox jumps over the lazy dog while the reader keeps turning pages in soft light. ' +
  'Long reading sessions on bright screens tire the eyes, so a calm and warm page can help a lot. ';
const words = lorem.split(' ');

const kids = [];
for (let p = 1; p <= pageCount; p++) {
  const lines = [];
  let line = '';
  let w = p;
  let planted = false;
  while (lines.length < 34) {
    const plant = p === 321 && lines.length === 10 && !planted;
    planted ||= plant;
    const word = plant ? 'zeytin' : words[w++ % words.length];
    if ((line + ' ' + word).length > 78) {
      lines.push(line.trim());
      line = '';
    }
    line += ' ' + word;
  }
  const withImage = p % 25 === 0;
  const text = lines
    .slice(0, withImage ? 18 : 34)
    .map((l) => `(${l}) Tj T*`)
    .join(' ');
  let stream = `BT /F2 16 Tf 72 780 Td (Chapter ${Math.ceil(p / 10)} - page ${p}) Tj ET BT /F1 12 Tf 15 TL 72 750 Td ${text} ET`;
  if (withImage) stream += ` q 300 0 0 200 150 140 cm /Im1 Do Q`;
  stream += ` BT /F1 10 Tf 290 40 Td (${p}) Tj ET`;
  const content = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  kids.push(
    add(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 595 842] /Contents ${content} 0 R /Resources << /Font << /F1 ${font} 0 R /F2 ${bold} 0 R >> /XObject << /Im1 ${image} 0 R >> >> >>`),
  );
}
objects[catalog - 1] = `<< /Type /Catalog /Pages ${pages} 0 R >>`;
objects[pages - 1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`;

let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
const offsets = objects.map((body, i) => {
  const offset = Buffer.byteLength(pdf, 'latin1');
  pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  return offset;
});
const xref = Buffer.byteLength(pdf, 'latin1');
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
writeFileSync(out, pdf, 'latin1');
console.log(`Wrote ${out} (${pageCount} pages)`);
