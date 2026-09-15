/* Визуальные помощники: SCHOOL.vis — возвращают HTML-строку для поля task.visual. */
(function () {
  const root = typeof window !== 'undefined' ? window : globalThis;
  const S = root.SCHOOL;
  const V = {};
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /** Ряд эмодзи: n штук, по perRow в строке (по умолчанию 10) */
  V.emojis = (emoji, n, perRow) => {
    perRow = perRow || 10;
    let s = '';
    for (let i = 0; i < n; i++) {
      s += '<span class="em">' + emoji + '</span>';
      if ((i + 1) % perRow === 0 && i + 1 < n) s += '<br>';
    }
    return '<div class="vis vis-emojis">' + s + '</div>';
  };

  /** Группы эмодзи (для смысла умножения): g групп по k штук */
  V.groups = (emoji, g, k) => {
    let s = '';
    for (let i = 0; i < g; i++) {
      let inner = '';
      for (let j = 0; j < k; j++) inner += '<span class="em">' + emoji + '</span>';
      s += '<div class="vis-group">' + inner + '</div>';
    }
    return '<div class="vis vis-groups">' + s + '</div>';
  };

  /** Пример в столбик: a op b (op: '+' или '-') */
  V.column = (a, b, op) => {
    const sa = String(a), sb = String(b);
    const w = Math.max(sa.length, sb.length) + 1;
    const row = (str, cls) => {
      const p = str.padStart(w, ' ');
      return '<div class="col-row ' + (cls || '') + '">' +
        p.split('').map(ch => '<span class="d">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>').join('') + '</div>';
    };
    return '<div class="vis vis-column">' + row(sa) + row(op + sb, 'op') +
      '<div class="col-line"></div>' + row('?', 'ans') + '</div>';
  };

  /** Аналоговые часы */
  V.clock = (h, m) => {
    const cx = 100, cy = 100, r = 90;
    const ha = ((h % 12) * 30 + m * 0.5) * Math.PI / 180;
    const ma = (m * 6) * Math.PI / 180;
    let ticks = '';
    for (let i = 0; i < 60; i++) {
      const a = i * 6 * Math.PI / 180, big = i % 5 === 0;
      const r1 = big ? r - 12 : r - 6;
      ticks += '<line x1="' + (cx + r1 * Math.sin(a)).toFixed(1) + '" y1="' + (cy - r1 * Math.cos(a)).toFixed(1) +
        '" x2="' + (cx + (r - 2) * Math.sin(a)).toFixed(1) + '" y2="' + (cy - (r - 2) * Math.cos(a)).toFixed(1) +
        '" stroke="#555" stroke-width="' + (big ? 3 : 1.2) + '"/>';
    }
    let nums = '';
    for (let i = 1; i <= 12; i++) {
      const a = i * 30 * Math.PI / 180, rr = r - 26;
      nums += '<text x="' + (cx + rr * Math.sin(a)).toFixed(1) + '" y="' + (cy - rr * Math.cos(a) + 6).toFixed(1) +
        '" text-anchor="middle" font-size="17" font-weight="700" fill="#333">' + i + '</text>';
    }
    const hand = (a, len, w, color) => '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + len * Math.sin(a)).toFixed(1) +
      '" y2="' + (cy - len * Math.cos(a)).toFixed(1) + '" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="round"/>';
    return '<div class="vis vis-clock"><svg viewBox="0 0 200 200" width="190" height="190">' +
      '<circle cx="100" cy="100" r="96" fill="#fffdf5" stroke="#f5a623" stroke-width="6"/>' + ticks + nums +
      hand(ha, 48, 7, '#333') + hand(ma, 70, 4.5, '#e0452b') +
      '<circle cx="100" cy="100" r="6" fill="#333"/></svg></div>';
  };

  /** Таблица-сетка: rows — массив массивов; '' — пусто, '?' — подсвечено */
  V.grid = rows => {
    const body = rows.map(r => '<tr>' + r.map(c =>
      '<td class="' + (c === '?' ? 'q' : (c === '' ? 'empty' : '')) + '">' + esc(c) + '</td>').join('') + '</tr>').join('');
    return '<div class="vis vis-grid-wrap"><table class="vis-grid">' + body + '</table></div>';
  };

  /** Прямоугольник со сторонами w×h (подписи, единица unit) */
  V.rect = (w, h, unit) => {
    unit = unit === undefined ? ' см' : unit;
    const maxW = 240, maxH = 150;
    const k = Math.min(maxW / w, maxH / h);
    const pw = Math.max(60, w * k), ph = Math.max(40, h * k);
    const x = 40, y = 30;
    return '<div class="vis vis-shape"><svg viewBox="0 0 ' + (pw + 110) + ' ' + (ph + 70) + '" width="' + (pw + 110) + '" height="' + (ph + 70) + '">' +
      '<rect x="' + x + '" y="' + y + '" width="' + pw + '" height="' + ph + '" fill="#dff3ff" stroke="#2b7de9" stroke-width="4" rx="3"/>' +
      '<text x="' + (x + pw / 2) + '" y="' + (y - 10) + '" text-anchor="middle" font-size="18" font-weight="700" fill="#2b4a6b">' + esc(w + unit) + '</text>' +
      '<text x="' + (x + pw + 12) + '" y="' + (y + ph / 2 + 6) + '" font-size="18" font-weight="700" fill="#2b4a6b">' + esc(h + unit) + '</text>' +
      '</svg></div>';
  };
  V.square = (a, unit) => V.rect(a, a, unit);

  /** Треугольник со сторонами a, b, c (схематично, подписи) */
  V.triangle = (a, b, c, unit) => {
    unit = unit === undefined ? ' см' : unit;
    return '<div class="vis vis-shape"><svg viewBox="0 0 280 200" width="280" height="200">' +
      '<polygon points="30,170 250,170 120,30" fill="#e8ffe0" stroke="#3aa655" stroke-width="4" stroke-linejoin="round"/>' +
      '<text x="140" y="195" text-anchor="middle" font-size="18" font-weight="700" fill="#2b5a2b">' + esc(a + unit) + '</text>' +
      '<text x="55" y="95" text-anchor="middle" font-size="18" font-weight="700" fill="#2b5a2b">' + esc(b + unit) + '</text>' +
      '<text x="210" y="95" text-anchor="middle" font-size="18" font-weight="700" fill="#2b5a2b">' + esc(c + unit) + '</text>' +
      '</svg></div>';
  };

  /** Ломаная из звеньев с длинами */
  V.polyline = (lengths, unit) => {
    unit = unit === undefined ? ' см' : unit;
    const n = lengths.length;
    const step = 260 / n;
    let pts = [], labels = '';
    for (let i = 0; i <= n; i++) pts.push([20 + i * step, i % 2 === 0 ? 120 : 40]);
    for (let i = 0; i < n; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      labels += '<text x="' + mx + '" y="' + (my - 12) + '" text-anchor="middle" font-size="17" font-weight="700" fill="#7a3fa0">' + esc(lengths[i] + unit) + '</text>';
    }
    return '<div class="vis vis-shape"><svg viewBox="0 0 300 150" width="300" height="150">' +
      '<polyline points="' + pts.map(p => p.join(',')).join(' ') + '" fill="none" stroke="#9b59b6" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>' +
      pts.map(p => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="#9b59b6"/>').join('') + labels + '</svg></div>';
  };

  /** Флаг из горизонтальных полос (эмодзи-флаги в Windows не рисуются — только буквы) */
  V.flag = colors => {
    const h = 120 / colors.length;
    const bars = colors.map((c, i) => '<rect x="0" y="' + (i * h).toFixed(1) + '" width="180" height="' + h.toFixed(1) + '" fill="' + c + '"/>').join('');
    return '<div class="vis vis-shape"><svg viewBox="-2 -2 184 124" width="190" height="128">' + bars +
      '<rect x="0" y="0" width="180" height="120" fill="none" stroke="#9a96b8" stroke-width="2"/></svg></div>';
  };
  V.flagRu = () => V.flag(['#ffffff', '#0039a6', '#d52b1e']);

  /** Абзац текста для чтения (HTML разрешён) */
  V.text = html => '<div class="vis vis-text">' + html + '</div>';
  /** Крупная надпись/эмодзи */
  V.big = s => '<div class="vis vis-big">' + s + '</div>';
  /** Карточки-подписи: [['🍎','apple'],…] */
  V.cards = arr => '<div class="vis vis-cards">' + arr.map(c =>
    '<div class="vis-card"><div class="vc-pic">' + c[0] + '</div>' + (c[1] ? '<div class="vc-cap">' + esc(c[1]) + '</div>' : '') + '</div>').join('') + '</div>';

  S.vis = V;
})();
