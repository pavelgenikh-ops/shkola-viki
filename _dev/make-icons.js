/* Рисует иконки приложения (PNG) без сторонних библиотек: фиолетовый скруглённый квадрат
   с белым рюкзаком. Запуск: _dev\node.exe _dev\make-icons.js   */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return buf => { let c = -1; for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
})();

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(td));
  return Buffer.concat([len, td, crc]);
}
/** rgba — Uint8Array размера w*h*4 */
function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;                                  // фильтр «нет»
    rgba.copy ? rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4)
              : Buffer.from(rgba.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;   // 8 бит, RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ---- рисование ---- */
function draw(size) {
  const px = Buffer.alloc(size * size * 4);
  const S = size;
  const set = (x, y, r, g, b, a) => {
    if (x < 0 || y < 0 || x >= S || y >= S) return;
    const i = (y * S + x) * 4;
    const na = a / 255, ia = 1 - na;
    px[i] = px[i] * ia + r * na; px[i + 1] = px[i + 1] * ia + g * na;
    px[i + 2] = px[i + 2] * ia + b * na; px[i + 3] = Math.max(px[i + 3], a);
  };
  /** скруглённый прямоугольник со сглаживанием краёв */
  const rrect = (x0, y0, x1, y1, rad, col, alpha) => {
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
      const cx = Math.min(Math.max(x, x0 + rad), x1 - rad);
      const cy = Math.min(Math.max(y, y0 + rad), y1 - rad);
      const d = Math.hypot(x - cx, y - cy);
      const a = d <= rad - 1 ? 1 : d >= rad + 0.5 ? 0 : (rad + 0.5 - d) / 1.5;
      if (a > 0) set(x, y, col[0], col[1], col[2], Math.round(255 * a * (alpha === undefined ? 1 : alpha)));
    }
  };
  const circle = (cx, cy, r, col) => {
    for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r + 1); y++) for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++) {
      const d = Math.hypot(x - cx, y - cy);
      const a = d <= r - 1 ? 1 : d >= r + 0.5 ? 0 : (r + 0.5 - d) / 1.5;
      if (a > 0) set(x, y, col[0], col[1], col[2], Math.round(255 * a));
    }
  };

  /* фон: вертикальный градиент фиолетового, скруглённый квадрат */
  const rad = S * 0.2;
  for (let y = 0; y < S; y++) {
    const t = y / S;
    const col = [Math.round(139 - 40 * t), Math.round(124 - 48 * t), Math.round(246 - 32 * t)];
    for (let x = 0; x < S; x++) {
      const cx = Math.min(Math.max(x, rad), S - rad), cy = Math.min(Math.max(y, rad), S - rad);
      const d = Math.hypot(x - cx, y - cy);
      const a = d <= rad - 1 ? 1 : d >= rad + 0.5 ? 0 : (rad + 0.5 - d) / 1.5;
      if (a > 0) set(x, y, col[0], col[1], col[2], Math.round(255 * a));
    }
  }

  /* рюкзак */
  const W = [255, 255, 255];
  const bx0 = S * 0.26, bx1 = S * 0.74, by0 = S * 0.34, by1 = S * 0.80;
  /* лямки */
  rrect(S * 0.36, S * 0.20, S * 0.44, S * 0.42, S * 0.035, W, 0.85);
  rrect(S * 0.56, S * 0.20, S * 0.64, S * 0.42, S * 0.035, W, 0.85);
  /* корпус */
  rrect(bx0, by0, bx1, by1, S * 0.10, W);
  /* клапан */
  rrect(bx0, by0, bx1, S * 0.56, S * 0.10, [238, 234, 255]);
  /* замок */
  rrect(S * 0.455, S * 0.50, S * 0.545, S * 0.60, S * 0.018, [108, 92, 231]);
  /* кармашек */
  rrect(S * 0.37, S * 0.63, S * 0.63, S * 0.755, S * 0.045, [238, 234, 255]);
  /* ручка сверху */
  circle(S * 0.5, S * 0.335, S * 0.055, W);
  circle(S * 0.5, S * 0.335, S * 0.028, [125, 108, 240]);
  return px;
}

const dir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);
[192, 512].forEach(size => {
  const file = path.join(dir, 'icon-' + size + '.png');
  fs.writeFileSync(file, png(size, size, draw(size)));
  console.log('готово: icons/icon-' + size + '.png (' + Math.round(fs.statSync(file).size / 1024) + ' КБ)');
});
