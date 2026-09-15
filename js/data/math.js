/* Математика, 2 класс (Моро, «Школа России»). */
(function () {
  const S = window.SCHOOL;
  const U = S.util;
  const V = S.vis;
  const N = U.rand;

  /* ---------- общие банки ---------- */
  const GIRLS = ['Вика', 'Катя', 'Маша', 'Оля', 'Соня', 'Лиза', 'Аня', 'Даша', 'Настя', 'Полина'];
  const BOYS = ['Петя', 'Миша', 'Саша', 'Ваня', 'Коля', 'Дима', 'Артём', 'Егор'];
  const KIDS = GIRLS.concat(BOYS);
  /** Родительный падеж имени: Вика → Вики, Катя → Кати, Лиза → Лизы, Егор → Егора */
  const GEN = n => /я$/.test(n) ? n.slice(0, -1) + 'и' : /[гкхжшчщ]а$/.test(n) ? n.slice(0, -1) + 'и' : /а$/.test(n) ? n.slice(0, -1) + 'ы' : n + 'а';
  const OBJ = [
    ['наклейка', 'наклейки', 'наклеек', '🌟'], ['яблоко', 'яблока', 'яблок', '🍎'], ['конфета', 'конфеты', 'конфет', '🍬'],
    ['книга', 'книги', 'книг', '📚'], ['шарик', 'шарика', 'шариков', '🎈'], ['карандаш', 'карандаша', 'карандашей', '✏️'],
    ['ракушка', 'ракушки', 'ракушек', '🐚'], ['гриб', 'гриба', 'грибов', '🍄'], ['цветок', 'цветка', 'цветков', '🌸'],
    ['марка', 'марки', 'марок', '📮'], ['монета', 'монеты', 'монет', '🪙'], ['орех', 'ореха', 'орехов', '🌰'],
    ['открытка', 'открытки', 'открыток', '💌'], ['кубик', 'кубика', 'кубиков', '🧊'], ['пирожок', 'пирожка', 'пирожков', '🥟']
  ];
  const cnt = (n, o) => n + ' ' + U.plural(n, [o[0], o[1], o[2]]);
  const two = (arr) => { const a = U.pick(arr); return [a, U.pickOther(arr, a)]; };

  function angleSvg(type) {
    // луч вправо и второй луч под углом
    const deg = type === 'right' ? 90 : type === 'acute' ? U.pick([35, 45, 55]) : U.pick([120, 135, 150]);
    const r = 110, cx = 30, cy = 130;
    const x2 = cx + r * Math.cos(deg * Math.PI / 180), y2 = cy - r * Math.sin(deg * Math.PI / 180);
    const marker = type === 'right' ? '<path d="M ' + (cx + 18) + ' ' + cy + ' L ' + (cx + 18) + ' ' + (cy - 18) + ' L ' + cx + ' ' + (cy - 18) + '" fill="none" stroke="#e0452b" stroke-width="3"/>' :
      '<path d="M ' + (cx + 22) + ' ' + cy + ' A 22 22 0 0 0 ' + (cx + 22 * Math.cos(deg * Math.PI / 180)).toFixed(1) + ' ' + (cy - 22 * Math.sin(deg * Math.PI / 180)).toFixed(1) + '" fill="none" stroke="#e0452b" stroke-width="3"/>';
    return '<div class="vis vis-shape"><svg viewBox="0 0 170 150" width="200" height="176">' +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + r) + '" y2="' + cy + '" stroke="#2b7de9" stroke-width="5" stroke-linecap="round"/>' +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#2b7de9" stroke-width="5" stroke-linecap="round"/>' +
      marker + '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="#2b4a6b"/></svg></div>';
  }
  const fmtTime = (h, m) => h + ':' + String(m).padStart(2, '0');

  /* ---------- 1. Числа до 100 ---------- */
  function genNumbers(level) {
    const kind = N(1, level === 1 ? 4 : level === 2 ? 5 : 5);
    if (level === 1) {
      if (kind === 1) { const n = N(21, 99); const d = Math.floor(n / 10), e = n % 10; if (e === 0) return genNumbers(level);
        const right = d + ' дес. ' + e + ' ед.';
        const wrongs = U.uniq([e + ' дес. ' + d + ' ед.', d + ' дес. ' + (e === 9 ? 1 : e + 1) + ' ед.', (d === 9 ? 1 : d + 1) + ' дес. ' + e + ' ед.']).filter(x => x !== right);
        return { type: 'choice', prompt: 'Сколько десятков и единиц в числе <b>' + n + '</b>?', options: U.shuffle([right].concat(wrongs.slice(0, 2))), answer: right,
          hint: 'Первая цифра — десятки, вторая — единицы', explain: n + ' — это ' + d + ' десятков и ' + e + ' единиц.' }; }
      if (kind === 2) { const d = N(2, 9), e = N(1, 9); const n = d * 10 + e;
        return { type: 'choice', prompt: 'Какое число: <b>' + d + ' дес. ' + e + ' ед.</b>?', options: U.numOpts(n, 2, 10, 99), answer: String(n), hint: 'Десятки пишем первыми', explain: d + ' десятков и ' + e + ' единиц — это число ' + n + '.' }; }
      if (kind === 3) { const n = N(11, 98); const which = U.pick(['перед', 'после']); const ans = which === 'перед' ? n - 1 : n + 1;
        return { type: 'choice', prompt: 'Какое число стоит <b>' + which + '</b> числом ' + n + '?', options: U.opts(ans, [which === 'перед' ? n + 1 : n - 1, ans + (which === 'перед' ? -1 : 1)]), answer: String(ans), explain: 'Соседи числа ' + n + ' — это ' + (n - 1) + ' и ' + (n + 1) + '.' }; }
      const start = N(1, 5) * 10; const seq = [start, start + 10, start + 20, start + 30];
      return { type: 'choice', prompt: 'Считаем десятками. Что дальше?', visual: V.big(seq.join(', ') + ', ?'), options: U.numOpts(start + 40, 2, start + 31, start + 49), answer: String(start + 40), hint: 'Каждый раз прибавляем 10', explain: 'Считаем десятками: ' + seq.concat(start + 40).join(', ') + '.' };
    }
    if (level === 2) {
      if (kind === 1) { const d = N(2, 9), e = N(1, 9); const n = d * 10 + e;
        return { type: 'input', mode: 'num', prompt: 'Замени число суммой разрядных слагаемых: <b>' + n + ' = ' + d * 10 + ' + ?</b>', answer: e, hint: 'Сколько единиц в числе ' + n + '?', explain: n + ' = ' + d * 10 + ' + ' + e + '.' }; }
      if (kind === 2) { const d = N(2, 9), e = N(1, 9); const n = d * 10 + e;
        return { type: 'input', mode: 'num', prompt: 'Запиши число: <b>' + d + ' десятков и ' + e + ' единиц</b>', answer: n, explain: d + ' дес. ' + e + ' ед. = ' + n + '.' }; }
      if (kind === 3) { const nums = U.uniq([N(10, 99), N(10, 99), N(10, 99), N(10, 99), N(10, 99)]).slice(0, 4); if (nums.length < 4) return genNumbers(level);
        const sorted = nums.slice().sort((a, b) => a - b);
        return { type: 'order', prompt: 'Расставь числа от меньшего к большему', items: sorted.map(String), explain: 'По возрастанию: ' + sorted.join(', ') + '.' }; }
      if (kind === 4) { const n = N(11, 98); const which = U.pick(['предыдущее', 'следующее']); const ans = which === 'предыдущее' ? n - 1 : n + 1;
        return { type: 'input', mode: 'num', prompt: 'Запиши <b>' + which + '</b> число для числа ' + n, answer: ans, explain: U.cap(which) + ' число для ' + n + ' — это ' + ans + '.' }; }
      const n = N(20, 99); return { type: 'input', mode: 'num', prompt: 'Сколько всего десятков в числе <b>' + n + '</b>?', answer: Math.floor(n / 10), hint: 'Посмотри на первую цифру', explain: 'В числе ' + n + ' — ' + Math.floor(n / 10) + ' десятков.' };
    }
    // level 3
    if (kind === 1) { const nums = U.uniq([N(10, 99), N(10, 99), N(10, 99), N(10, 99), N(10, 99), N(10, 99), N(10, 99)]).slice(0, 6); if (nums.length < 5) return genNumbers(level);
      const sorted = nums.slice().sort((a, b) => b - a);
      return { type: 'order', prompt: 'Расставь числа от большего к меньшему', items: sorted.map(String), explain: 'По убыванию: ' + sorted.join(', ') + '.' }; }
    if (kind === 2) { const a = N(1, 9), b = U.pickOther(U.range(1, 9), a); const big = Math.max(a, b) * 10 + Math.min(a, b), small = Math.min(a, b) * 10 + Math.max(a, b); const which = U.pick(['наибольшее', 'наименьшее']);
      return { type: 'input', mode: 'num', prompt: 'Из цифр <b>' + a + '</b> и <b>' + b + '</b> составь <b>' + which + '</b> двузначное число (цифры не повторяются)', answer: which === 'наибольшее' ? big : small, hint: 'Большую цифру — в десятки или в единицы?', explain: 'Из цифр ' + a + ' и ' + b + ': наибольшее — ' + big + ', наименьшее — ' + small + '.' }; }
    if (kind === 3) { const q = U.pick([['Какое число самое маленькое двузначное?', 10], ['Какое число самое большое двузначное?', 99], ['Какое число самое маленькое трёхзначное?', 100], ['Какое число самое большое однозначное?', 9], ['Сколько десятков в сотне?', 10], ['Сколько единиц в одном десятке?', 10]]);
      return { type: 'choice', prompt: q[0], options: U.numOpts(q[1], 3, 1, 110), answer: String(q[1]), explain: q[0].replace('?', '') + ' — ' + q[1] + '.' }; }
    if (kind === 4) { const d = N(1, 9), e = N(1, 9); const n = d * 10 + e; const sw = e * 10 + d;
      return { type: 'choice', prompt: 'В каком числе <b>' + e + ' десятков</b> и <b>' + d + ' единиц</b>?', options: U.opts(sw, [n, d * 10 + (e % 9) + 1, e * 10 + (d % 9) + 1]), answer: String(sw), explain: e + ' дес. и ' + d + ' ед. — это ' + sw + '.' }; }
    const a = N(2, 9); const n = a * 10 + N(1, 9); const m = n + N(1, 9) * 10 > 99 ? n - 10 : n + 10;
    return { type: 'input', mode: 'num', prompt: 'Запиши число, которое на <b>1 десяток ' + (m > n ? 'больше' : 'меньше') + '</b>, чем ' + n, answer: m, explain: (m > n ? n + ' + 10 = ' : n + ' − 10 = ') + m + '.' };
  }

  /* ---------- 2. Сравнение ---------- */
  const sign = (a, b) => a < b ? '<' : a > b ? '>' : '=';
  function genCompare(level) {
    if (level === 1) {
      const a = N(1, 99), b = U.chance(0.15) ? a : N(1, 99);
      return { type: 'compare', prompt: 'Сравни числа', a: String(a), b: String(b), answer: sign(a, b), hint: 'Сначала сравни десятки, потом единицы', explain: a + ' ' + sign(a, b) + ' ' + b + '.' };
    }
    if (level === 2) {
      const x = N(10, 80), y = N(1, 19); const op = U.pick(['+', '-']); const val = op === '+' ? x + y : x - y;
      const b = U.chance(0.25) ? val : val + U.pick([-5, -3, -2, -1, 1, 2, 3, 5]);
      const left = x + ' ' + op + ' ' + y;
      return U.chance(0.5) ? { type: 'compare', prompt: 'Сравни выражение и число', a: left, b: String(b), answer: sign(val, b), hint: 'Сначала вычисли: ' + left, explain: left + ' = ' + val + ', значит ' + left + ' ' + sign(val, b) + ' ' + b + '.' }
        : { type: 'compare', prompt: 'Сравни число и выражение', a: String(b), b: left, answer: sign(b, val), hint: 'Сначала вычисли: ' + left, explain: left + ' = ' + val + ', значит ' + b + ' ' + sign(b, val) + ' ' + left + '.' };
    }
    const kind = N(1, 3);
    if (kind === 1) {
      const x1 = N(10, 60), y1 = N(1, 30), x2 = N(10, 60), y2 = N(1, 30);
      const o1 = U.pick(['+', '-']), o2 = U.pick(['+', '-']);
      const v1 = o1 === '+' ? x1 + y1 : x1 - y1, v2 = o2 === '+' ? x2 + y2 : x2 - y2;
      const l = x1 + ' ' + o1 + ' ' + y1, r = x2 + ' ' + o2 + ' ' + y2;
      return { type: 'compare', prompt: 'Сравни выражения', a: l, b: r, answer: sign(v1, v2), hint: 'Вычисли обе части', explain: l + ' = ' + v1 + ', ' + r + ' = ' + v2 + '. Значит ' + sign(v1, v2) + '.' };
    }
    if (kind === 2) {
      const pairs = [['1 м', '100 см', '='], ['1 дм', '10 см', '='], ['1 см', '10 мм', '='], ['1 м', '9 дм', '>'], ['5 дм', '50 см', '='], ['1 ч', '60 мин', '='], ['1 ч', '50 мин', '>'], ['1 р.', '100 к.', '='], ['1 р.', '90 к.', '>'], ['2 дм', '25 см', '<'], ['1 м', '99 см', '>'], ['3 см', '30 мм', '='], ['4 см', '45 мм', '<'], ['7 дм', '1 м', '<'], ['2 ч', '120 мин', '='], ['90 мин', '1 ч', '>'], ['10 дм', '1 м', '='], ['1 дм 2 см', '12 см', '='], ['3 дм 5 см', '53 см', '<'], ['1 м 5 см', '105 см', '=']];
      const p = U.pick(pairs);
      return { type: 'compare', prompt: 'Сравни величины', a: p[0], b: p[1], answer: p[2], hint: '1 м = 10 дм = 100 см, 1 см = 10 мм, 1 ч = 60 мин, 1 р. = 100 к.', explain: p[0] + ' ' + p[2] + ' ' + p[1] + '.' };
    }
    const x = N(20, 70), y = N(1, 20); const val = x + y; const other = val + U.pick([-2, -1, 1, 2]);
    const expr = x + ' + ' + y;
    const opts = U.shuffle([expr + ' < ' + (val + 1), expr + ' > ' + (val - 1), expr + ' = ' + val, expr + ' > ' + (val + 1), expr + ' < ' + (val - 1)]);
    const truths = opts.filter(o => { const s = o.includes('<') ? '<' : o.includes('>') ? '>' : '='; const rhs = parseInt(o.split(s)[1], 10); return sign(val, rhs) === s; });
    return { type: 'choice', multi: true, prompt: 'Выбери все <b>верные</b> записи', options: opts, answer: truths, hint: expr + ' = ' + val, explain: expr + ' = ' + val + '. Верные записи: ' + truths.join('; ') + '.' + (other ? '' : '') };
  }

  /* ---------- 3. Устный счёт ---------- */
  function genOral(level) {
    if (level === 1) {
      const kind = N(1, 4); let a, b, ans, ex;
      if (kind === 1) { a = N(2, 8) * 10 + N(1, 7); b = N(1, 9 - a % 10); ans = a + b; ex = a + ' + ' + b + ' = ' + ans + ': к единицам прибавляем единицы.'; }
      else if (kind === 2) { a = N(2, 8) * 10 + N(2, 9); b = N(1, a % 10 - 1); ans = a - b; ex = a + ' − ' + b + ' = ' + ans + ': из единиц вычитаем единицы.'; }
      else if (kind === 3) { a = N(1, 6) * 10 + N(1, 9); b = N(1, 8 - Math.floor(a / 10)) * 10; ans = a + b; ex = a + ' + ' + b + ' = ' + ans + ': к десяткам прибавляем десятки.'; }
      else { a = N(3, 9) * 10 + N(1, 9); b = N(1, Math.floor(a / 10) - 1) * 10; ans = a - b; ex = a + ' − ' + b + ' = ' + ans + ': из десятков вычитаем десятки.'; }
      const op = ans > a ? '+' : '−';
      return { type: 'choice', prompt: 'Сосчитай: <b>' + a + ' ' + op + ' ' + b + '</b>', options: U.numOpts(ans, 2, Math.max(0, ans - 12), ans + 12), answer: String(ans), hint: op === '+' ? 'Десятки складываем с десятками, единицы — с единицами' : 'Десятки вычитаем из десятков, единицы — из единиц', explain: ex };
    }
    if (level === 2) {
      const kind = N(1, 5); let a, b, ans, ex;
      if (kind === 1) { a = N(2, 8) * 10 + N(1, 9); b = 10 - a % 10; ans = a + b; ex = a + ' + ' + b + ' = ' + ans + ': дополняем до круглого числа.'; }
      else if (kind === 2) { a = N(3, 9) * 10; b = N(2, 9); ans = a - b; ex = a + ' − ' + b + ' = ' + ans + ': занимаем один десяток.'; }
      else if (kind === 3) { a = N(2, 7) * 10 + N(3, 9); b = N(10 - a % 10 + 1, 9); ans = a + b; ex = a + ' + ' + b + ' = ' + ans + ': сначала до круглого (' + a + ' + ' + (10 - a % 10) + ' = ' + (a + 10 - a % 10) + '), потом ещё ' + (b - (10 - a % 10)) + '.'; }
      else if (kind === 4) { a = N(3, 9) * 10 + N(1, 5); b = N(a % 10 + 1, 9); ans = a - b; ex = a + ' − ' + b + ' = ' + ans + ': сначала вычитаем ' + (a % 10) + ' до круглого, потом ещё ' + (b - a % 10) + '.'; }
      else { a = N(4, 9) * 10; b = N(1, Math.floor(a / 10) - 2) * 10 + N(1, 9); ans = a - b; ex = a + ' − ' + b + ' = ' + ans + ': вычитаем десятки, потом единицы.'; }
      const op = ans > a ? '+' : '−';
      return { type: 'input', mode: 'num', prompt: 'Сосчитай: <b>' + a + ' ' + op + ' ' + b + '</b>', answer: ans, hint: op === '+' ? 'Дополни первое число до круглого' : 'Вычитай по частям', explain: ex };
    }
    const kind = N(1, 4);
    if (kind === 1) { const a = N(20, 60), b = N(11, 39); if (a + b > 100) return genOral(level); return { type: 'input', mode: 'num', prompt: 'Сосчитай устно: <b>' + a + ' + ' + b + '</b>', answer: a + b, hint: 'Прибавь десятки, потом единицы', explain: a + ' + ' + b + ' = ' + (a + Math.floor(b / 10) * 10) + ' + ' + (b % 10) + ' = ' + (a + b) + '.' }; }
    if (kind === 2) { const a = N(40, 99), b = N(11, a - 5); return { type: 'input', mode: 'num', prompt: 'Сосчитай устно: <b>' + a + ' − ' + b + '</b>', answer: a - b, hint: 'Вычти десятки, потом единицы', explain: a + ' − ' + b + ' = ' + (a - Math.floor(b / 10) * 10) + ' − ' + (b % 10) + ' = ' + (a - b) + '.' }; }
    if (kind === 3) { const a = N(10, 50), b = N(5, 30), c = N(2, 20); const v1 = a + b; if (v1 - c < 0) return genOral(level); return { type: 'input', mode: 'num', prompt: 'Цепочка: <b>' + a + ' + ' + b + ' − ' + c + '</b>', answer: v1 - c, hint: 'Считай слева направо: сначала ' + a + ' + ' + b, explain: a + ' + ' + b + ' = ' + v1 + ', ' + v1 + ' − ' + c + ' = ' + (v1 - c) + '.' }; }
    const x = N(11, 39), y = N(1, 9), z = 10 - y; const total = x + y + z; const expr = x + ' + ' + y + ' + ' + z;
    return { type: 'choice', prompt: 'Как удобнее сосчитать <b>' + expr + '</b>?', options: U.shuffle([x + ' + (' + y + ' + ' + z + ')', '(' + x + ' + ' + y + ') + ' + z, x + ' + ' + y + ' − ' + z]), answer: x + ' + (' + y + ' + ' + z + ')', hint: y + ' + ' + z + ' — круглое число', explain: 'Удобно сложить ' + y + ' и ' + z + ' — получится 10, а ' + x + ' + 10 = ' + total + '.' };
  }

  /* ---------- 4–5. Столбик ---------- */
  function genColAdd(level) {
    let a, b;
    if (level === 1) { const d1 = N(1, 5), d2 = N(1, 8 - d1), e1 = N(1, 5), e2 = N(1, 9 - e1); a = d1 * 10 + e1; b = d2 * 10 + e2;
      return { type: 'choice', prompt: 'Реши пример в столбик', visual: V.column(a, b, '+'), options: U.numOpts(a + b, 2, a + b - 11, a + b + 11), answer: String(a + b), hint: 'Складывай единицы под единицами, десятки под десятками', explain: a + ' + ' + b + ' = ' + (a + b) + ': единицы ' + (a % 10) + ' + ' + (b % 10) + ' = ' + (a % 10 + b % 10) + ', десятки ' + Math.floor(a / 10) + ' + ' + Math.floor(b / 10) + ' = ' + (Math.floor(a / 10) + Math.floor(b / 10)) + '.' }; }
    if (level === 2) { do { a = N(13, 79); b = N(13, 79); } while (a % 10 + b % 10 < 10 || a + b > 99);
      return { type: 'input', mode: 'num', prompt: 'Реши пример в столбик', visual: V.column(a, b, '+'), answer: a + b, hint: (a % 10) + ' + ' + (b % 10) + ' = ' + (a % 10 + b % 10) + ' — пиши ' + ((a % 10 + b % 10) % 10) + ', а 1 десяток запомни', explain: a + ' + ' + b + ' = ' + (a + b) + ': единицы ' + (a % 10 + b % 10) + ' — пишем ' + ((a % 10 + b % 10) % 10) + ', 1 десяток переходит к десяткам.' }; }
    const kind = N(1, 3);
    if (kind === 1) { do { a = N(15, 85); b = N(15, 85); } while (a + b > 100 || a % 10 + b % 10 < 10);
      return { type: 'input', mode: 'num', prompt: 'Реши в столбик', visual: V.column(a, b, '+'), answer: a + b, explain: a + ' + ' + b + ' = ' + (a + b) + '.' }; }
    if (kind === 2) { a = N(11, 89); b = 100 - a; return { type: 'input', mode: 'num', prompt: 'Дополни до сотни: <b>' + a + ' + ? = 100</b>', answer: b, hint: 'Сначала до круглого десятка, потом до 100', explain: a + ' + ' + b + ' = 100.' }; }
    do { a = N(13, 79); b = N(13, 79); } while (a + b > 99);
    const wrong = a + b + U.pick([-10, 10, -1, 1]);
    const shown = U.chance(0.5) ? a + b : wrong;
    return { type: 'choice', prompt: 'Проверь: <b>' + a + ' + ' + b + ' = ' + shown + '</b>. Верно?', options: ['Верно', 'Неверно'], answer: shown === a + b ? 'Верно' : 'Неверно', hint: 'Посчитай сам(а) и сравни', explain: a + ' + ' + b + ' = ' + (a + b) + (shown === a + b ? ', запись верна.' : ', а не ' + shown + '.') };
  }
  function genColSub(level) {
    let a, b;
    if (level === 1) { const d1 = N(3, 9), e1 = N(2, 9); a = d1 * 10 + e1; b = N(1, d1 - 1) * 10 + N(1, e1 - 1);
      return { type: 'choice', prompt: 'Реши пример в столбик', visual: V.column(a, b, '-'), options: U.numOpts(a - b, 2, Math.max(0, a - b - 11), a - b + 11), answer: String(a - b), hint: 'Вычитай единицы из единиц, десятки из десятков', explain: a + ' − ' + b + ' = ' + (a - b) + '.' }; }
    if (level === 2) { do { a = N(31, 98); b = N(12, a - 5); } while (a % 10 >= b % 10);
      return { type: 'input', mode: 'num', prompt: 'Реши пример в столбик', visual: V.column(a, b, '-'), answer: a - b, hint: (a % 10) + ' меньше ' + (b % 10) + ' — займи 1 десяток: ' + (a % 10 + 10) + ' − ' + (b % 10) + ' = ' + (a % 10 + 10 - b % 10), explain: a + ' − ' + b + ' = ' + (a - b) + ': занимаем десяток, ' + (a % 10 + 10) + ' − ' + (b % 10) + ' = ' + (a % 10 + 10 - b % 10) + ', десятков осталось ' + (Math.floor(a / 10) - 1) + ' − ' + Math.floor(b / 10) + ' = ' + (Math.floor(a / 10) - 1 - Math.floor(b / 10)) + '.' }; }
    const kind = N(1, 3);
    if (kind === 1) { a = N(3, 9) * 10; b = N(11, a - 5); if (b % 10 === 0) b += 3; return { type: 'input', mode: 'num', prompt: 'Реши в столбик', visual: V.column(a, b, '-'), answer: a - b, hint: 'В единицах 0 — занимай десяток', explain: a + ' − ' + b + ' = ' + (a - b) + '.' }; }
    if (kind === 2) { b = N(12, 88); return { type: 'input', mode: 'num', prompt: 'Реши в столбик', visual: V.column(100, b, '-'), answer: 100 - b, hint: 'Сначала вычти до круглого', explain: '100 − ' + b + ' = ' + (100 - b) + '.' }; }
    do { a = N(31, 98); b = N(12, a - 5); } while (a % 10 >= b % 10);
    return { type: 'choice', prompt: 'Каким действием проверить вычитание <b>' + a + ' − ' + b + ' = ' + (a - b) + '</b>?', options: U.shuffle([(a - b) + ' + ' + b + ' = ' + a, a + ' + ' + b + ' = ' + (a + b), (a - b) + ' − ' + b]), answer: (a - b) + ' + ' + b + ' = ' + a, hint: 'Вычитание проверяют сложением', explain: 'Если к разности прибавить вычитаемое, получится уменьшаемое: ' + (a - b) + ' + ' + b + ' = ' + a + '.' };
  }

  /* ---------- 6. Порядок действий ---------- */
  function genOrder(level) {
    if (level === 1) {
      const a = N(5, 15), b = N(1, 5), c = N(1, 4); const kind = N(1, 2);
      if (kind === 1) { const v = a - (b + c); if (v < 0) return genOrder(level); return { type: 'choice', prompt: 'Что делаем <b>первым</b> в выражении <b>' + a + ' − (' + b + ' + ' + c + ')</b>?', options: U.shuffle([b + ' + ' + c, a + ' − ' + b]), answer: b + ' + ' + c, hint: 'Сначала — действие в скобках', explain: 'Действие в скобках выполняется первым: ' + b + ' + ' + c + ' = ' + (b + c) + ', потом ' + a + ' − ' + (b + c) + ' = ' + v + '.' }; }
      const v = a - (b + c); if (v < 0) return genOrder(level);
      return { type: 'choice', prompt: 'Сосчитай: <b>' + a + ' − (' + b + ' + ' + c + ')</b>', options: U.opts(v, [a - b + c, v + 1]), answer: String(v), hint: 'Сначала скобки: ' + b + ' + ' + c, explain: b + ' + ' + c + ' = ' + (b + c) + ', ' + a + ' − ' + (b + c) + ' = ' + v + '.' };
    }
    if (level === 2) {
      const kind = N(1, 3); const a = N(10, 40), b = N(2, 9), c = N(2, 9), d = N(1, 9);
      if (kind === 1) { const v = a - (b + c) + d; if (v < 0) return genOrder(level); return { type: 'input', mode: 'num', prompt: 'Сосчитай: <b>' + a + ' − (' + b + ' + ' + c + ') + ' + d + '</b>', answer: v, hint: 'Сначала скобки, потом слева направо', explain: '(' + b + ' + ' + c + ') = ' + (b + c) + '; ' + a + ' − ' + (b + c) + ' = ' + (a - b - c) + '; + ' + d + ' = ' + v + '.' }; }
      if (kind === 2) { const v = a + (b - c > 0 ? b - c : c - b); const big = Math.max(b, c), small = Math.min(b, c); return { type: 'input', mode: 'num', prompt: 'Сосчитай: <b>' + a + ' + (' + big + ' − ' + small + ')</b>', answer: v, explain: big + ' − ' + small + ' = ' + (big - small) + '; ' + a + ' + ' + (big - small) + ' = ' + v + '.' }; }
      const v1 = a - b + c, v2 = a - (b + c);
      return { type: 'choice', prompt: 'Чем отличаются выражения <b>' + a + ' − ' + b + ' + ' + c + '</b> и <b>' + a + ' − (' + b + ' + ' + c + ')</b>?', options: U.shuffle(['Скобки меняют порядок действий: ответы ' + v1 + ' и ' + v2, 'Ничем, ответ один и тот же', 'Во втором нужно сначала вычесть ' + b]), answer: 'Скобки меняют порядок действий: ответы ' + v1 + ' и ' + v2, hint: 'Скобки выполняются первыми', explain: 'Без скобок: ' + a + ' − ' + b + ' = ' + (a - b) + ', + ' + c + ' = ' + v1 + '. Со скобками: ' + b + ' + ' + c + ' = ' + (b + c) + ', ' + a + ' − ' + (b + c) + ' = ' + v2 + '.' };
    }
    const kind = N(1, 3); const a = N(20, 60), b = N(3, 15), c = N(2, 12), d = N(2, 15);
    if (kind === 1) { const v = a - (b + c) - d; if (v < 0) return genOrder(level); return { type: 'input', mode: 'num', prompt: 'Сосчитай: <b>' + a + ' − (' + b + ' + ' + c + ') − ' + d + '</b>', answer: v, hint: 'Скобки → слева направо', explain: b + ' + ' + c + ' = ' + (b + c) + '; ' + a + ' − ' + (b + c) + ' = ' + (a - b - c) + '; − ' + d + ' = ' + v + '.' }; }
    if (kind === 2) {
      const target = a - b + c; const opts = U.shuffle([a + ' − ' + b + ' + ' + c, a + ' − (' + b + ' + ' + c + ')', '(' + a + ' − ' + b + ') + ' + c]);
      const ok = opts.filter(o => o !== a + ' − (' + b + ' + ' + c + ')');
      return { type: 'choice', multi: true, prompt: 'Выбери все выражения, значение которых равно <b>' + target + '</b>', options: opts, answer: ok, hint: 'Вычисли каждое', explain: a + ' − ' + b + ' + ' + c + ' = ' + target + ' и (' + a + ' − ' + b + ') + ' + c + ' = ' + target + '; а ' + a + ' − (' + b + ' + ' + c + ') = ' + (a - b - c) + '.' };
    }
    const v = (a + b) - (c + d);
    return { type: 'input', mode: 'num', prompt: 'Сосчитай: <b>(' + a + ' + ' + b + ') − (' + c + ' + ' + d + ')</b>', answer: v, hint: 'Сначала обе скобки', explain: a + ' + ' + b + ' = ' + (a + b) + '; ' + c + ' + ' + d + ' = ' + (c + d) + '; ' + (a + b) + ' − ' + (c + d) + ' = ' + v + '.' };
  }

  /* ---------- 7. Уравнения ---------- */
  function genEquation(level) {
    const kinds = ['x+', '+x', '-x', 'x-'];
    const k = U.pick(kinds);
    let a, b, x, text, ex;
    if (level === 1) { x = N(1, 9); a = N(1, 9); }
    else if (level === 2) { x = N(5, 40); a = N(5, 40); }
    else { x = N(12, 60); a = N(12, 60); }
    if (k === 'x+') { b = x + a; text = 'x + ' + a + ' = ' + b; ex = 'Неизвестное слагаемое: x = ' + b + ' − ' + a + ' = ' + x + '.'; }
    else if (k === '+x') { b = x + a; text = a + ' + x = ' + b; ex = 'Неизвестное слагаемое: x = ' + b + ' − ' + a + ' = ' + x + '.'; }
    else if (k === '-x') { b = a + x; text = b + ' − x = ' + a; ex = 'Неизвестное вычитаемое: x = ' + b + ' − ' + a + ' = ' + x + '.'; }
    else { b = x - a; if (b < 0) { b = a - x; [x, a] = [a, x]; } text = 'x − ' + a + ' = ' + b; ex = 'Неизвестное уменьшаемое: x = ' + b + ' + ' + a + ' = ' + x + '.'; }
    if (level === 1) return { type: 'choice', prompt: 'Реши уравнение: <b>' + text + '</b>', options: U.numOpts(x, 2, Math.max(0, x - 6), x + 6), answer: String(x), hint: 'Подбери число вместо x, чтобы равенство стало верным', explain: ex };
    if (level === 2) return { type: 'input', mode: 'num', prompt: 'Реши уравнение: <b>' + text + '</b>. Чему равен x?', answer: x, hint: k.includes('+') ? 'Чтобы найти слагаемое, из суммы вычти известное слагаемое' : (k === '-x' ? 'Чтобы найти вычитаемое, из уменьшаемого вычти разность' : 'Чтобы найти уменьшаемое, сложи разность и вычитаемое'), explain: ex };
    const kind = N(1, 3);
    if (kind === 1) return { type: 'input', mode: 'num', prompt: 'Реши уравнение: <b>' + text + '</b>', answer: x, explain: ex };
    if (kind === 2) { const v = N(5, 30), c = N(3, 20); const op = U.pick(['+', '−']); const r = op === '+' ? v + c : (v >= c ? v - c : c - v); const vv = op === '−' && v < c ? c : v; const cc = op === '−' && v < c ? v : c;
      return { type: 'input', mode: 'num', prompt: 'Найди значение выражения <b>a ' + op + ' ' + cc + '</b>, если <b>a = ' + vv + '</b>', answer: r, hint: 'Подставь число вместо буквы', explain: vv + ' ' + op + ' ' + cc + ' = ' + r + '.' }; }
    const cand = U.shuffle([x, x + 1, x - 1 > 0 ? x - 1 : x + 2]);
    return { type: 'choice', prompt: 'Какое число — решение уравнения <b>' + text + '</b>? Проверь подстановкой', options: cand.map(String), answer: String(x), hint: 'Подставь каждое число и проверь', explain: ex };
  }

  /* ---------- 8. Задачи в одно действие ---------- */
  function genWord1(level) {
    const max = level === 1 ? 10 : level === 2 ? 50 : 99;
    const g = U.pick(GIRLS), other = U.pickOther(KIDS, g), o = U.pick(OBJ);
    const kind = N(1, 7);
    let a, b, ans, text, ex, hint;
    if (kind === 1) { a = N(2, max - 5); b = N(1, Math.min(9, max - a)); ans = a + b; text = 'У ' + GEN(g) + ' ' + cnt(a, o) + ', а у ' + GEN(other) + ' на ' + b + ' больше. Сколько ' + o[2] + ' у ' + GEN(other) + '?'; hint = '«На ' + b + ' больше» — значит прибавляем'; ex = a + ' + ' + b + ' = ' + ans + '.'; }
    else if (kind === 2) { a = N(5, max); b = N(1, Math.min(9, a - 1)); ans = a - b; text = 'У ' + GEN(g) + ' ' + cnt(a, o) + ', а у ' + GEN(other) + ' на ' + b + ' меньше. Сколько ' + o[2] + ' у ' + GEN(other) + '?'; hint = '«На ' + b + ' меньше» — значит вычитаем'; ex = a + ' − ' + b + ' = ' + ans + '.'; }
    else if (kind === 3) { a = N(4, max); b = N(1, a - 1); ans = a - b; text = 'В корзине было ' + cnt(a, o) + '. ' + g + ' взяла ' + b + '. Сколько ' + o[2] + ' осталось?'; hint = 'Было — взяли = осталось'; ex = a + ' − ' + b + ' = ' + ans + '.'; }
    else if (kind === 4) { a = N(2, max - 3); b = N(2, Math.max(2, Math.min(max - a, 20))); ans = a + b; text = 'В автобусе ' + (a % 10 === 1 && a % 100 !== 11 ? 'ехал ' : 'ехало ') + U.count(a, ['человек', 'человека', 'человек']) + '. На остановке вошли ещё ' + U.count(b, ['человек', 'человека', 'человек']) + '. Сколько человек стало в автобусе?'; hint = 'Было + вошли = стало'; ex = a + ' + ' + b + ' = ' + ans + '.'; }
    else if (kind === 5) { a = N(3, max); b = N(1, a - 1); ans = a - b; text = 'У ' + GEN(g) + ' ' + cnt(a, o) + ', а у ' + GEN(other) + ' — ' + cnt(b, o) + '. На сколько ' + o[2] + ' больше у ' + GEN(g) + '?'; hint = 'Чтобы узнать «на сколько больше», из большего вычти меньшее'; ex = a + ' − ' + b + ' = ' + ans + '.'; }
    else if (kind === 6) { a = N(2, max - 3); ans = N(1, Math.min(max - a, 20)); b = a + ans; text = 'В вазе было ' + cnt(a, o) + '. Мама положила ещё несколько, и стало ' + b + '. Сколько ' + o[2] + ' положила мама?'; hint = 'Стало − было = положили'; ex = b + ' − ' + a + ' = ' + ans + '.'; }
    else { a = N(2, max - 3); b = N(1, Math.min(max - a, 30)); ans = a + b; text = g + ' прочитала ' + U.count(a, ['страницу', 'страницы', 'страниц']) + ' утром и ' + U.count(b, ['страницу', 'страницы', 'страниц']) + ' вечером. Сколько всего страниц прочитала ' + g + '?'; hint = 'Всего — значит складываем'; ex = a + ' + ' + b + ' = ' + ans + '.'; }
    const emo = o[3];
    if (level === 1) return { type: 'choice', prompt: text, visual: V.big(emo), options: U.numOpts(ans, 2, Math.max(0, ans - 5), ans + 5), answer: String(ans), hint, explain: ex };
    if (level === 2) return { type: 'input', mode: 'num', prompt: text, visual: V.big(emo), answer: ans, hint, explain: ex };
    if (U.chance(0.35)) {
      const good = ans === a + b ? a + ' + ' + b : a + ' − ' + b;
      const bad = ans === a + b ? a + ' − ' + b : a + ' + ' + b;
      const opts = U.shuffle([good, bad, b + ' − ' + a]);
      return { type: 'choice', prompt: text + '<br><i>Каким действием решается задача?</i>', options: U.uniq(opts), answer: good, hint, explain: good + ' = ' + ans + '.' };
    }
    return { type: 'input', mode: 'num', prompt: text, answer: ans, hint, explain: ex };
  }

  /* ---------- 9. Задачи в два действия ---------- */
  function genWord2(level) {
    const max = level === 1 ? 10 : level === 2 ? 30 : 45;
    const g = U.pick(GIRLS), other = U.pickOther(KIDS, g), o = U.pick(OBJ);
    const kind = N(1, 6);
    let a, b, c, ans, text, ex, hint;
    if (kind === 1) { a = N(2, max); b = N(1, 9); ans = a + (a + b); text = 'У ' + GEN(g) + ' ' + cnt(a, o) + ', а у ' + GEN(other) + ' на ' + b + ' больше. Сколько ' + o[2] + ' у них вместе?'; hint = 'Сначала узнай, сколько у ' + GEN(other); ex = '1) ' + a + ' + ' + b + ' = ' + (a + b) + ' (у ' + GEN(other) + '); 2) ' + a + ' + ' + (a + b) + ' = ' + ans + '.'; }
    else if (kind === 2) { a = N(3, max); b = N(1, Math.max(1, a - 2)); ans = a + (a - b); text = 'У ' + GEN(g) + ' ' + cnt(a, o) + ', а у ' + GEN(other) + ' на ' + b + ' меньше. Сколько ' + o[2] + ' у них вместе?'; hint = 'Сначала узнай, сколько у ' + GEN(other); ex = '1) ' + a + ' − ' + b + ' = ' + (a - b) + '; 2) ' + a + ' + ' + (a - b) + ' = ' + ans + '.'; }
    else if (kind === 3) { b = N(2, max); c = N(2, max); ans = N(1, max); a = b + c + ans; text = 'В корзине ' + cnt(a, ['гриб', 'гриба', 'грибов']) + ': ' + b + ' белых, ' + c + ' лисичек, а остальные — опята. Сколько опят?'; hint = 'Сначала сложи белые и лисички'; ex = '1) ' + b + ' + ' + c + ' = ' + (b + c) + '; 2) ' + a + ' − ' + (b + c) + ' = ' + ans + '.'; }
    else if (kind === 4) { b = N(2, max); c = N(2, max); ans = N(1, max); a = b + c + ans; text = 'В магазине было ' + cnt(a, o) + '. Утром продали ' + b + ', а днём ещё ' + c + '. Сколько ' + o[2] + ' осталось?'; hint = 'Вычитай по очереди или сложи проданные'; ex = '1) ' + b + ' + ' + c + ' = ' + (b + c) + '; 2) ' + a + ' − ' + (b + c) + ' = ' + ans + '.'; }
    else if (kind === 5) { a = N(3, max); b = N(1, a - 1); ans = a + (a - b); text = 'В первый день ' + g + ' собрала ' + cnt(a, o) + ', а во второй на ' + b + ' меньше. Сколько ' + o[2] + ' собрала ' + g + ' за два дня?'; hint = 'Сначала — сколько во второй день'; ex = '1) ' + a + ' − ' + b + ' = ' + (a - b) + '; 2) ' + a + ' + ' + (a - b) + ' = ' + ans + '.'; }
    else { a = N(2, max); b = N(2, max); c = N(1, Math.min(a + b - 1, max)); ans = a + b - c; text = 'На полке стояло ' + cnt(a, ['книга', 'книги', 'книг']) + '. ' + g + ' поставила ещё ' + b + ', а ' + U.pick(BOYS) + ' взял ' + c + '. Сколько книг стало на полке?'; hint = 'Сначала прибавь, потом вычти'; ex = '1) ' + a + ' + ' + b + ' = ' + (a + b) + '; 2) ' + (a + b) + ' − ' + c + ' = ' + ans + '.'; }
    if (level === 1) return { type: 'choice', prompt: text, visual: V.big(o[3]), options: U.numOpts(ans, 2, Math.max(0, ans - 6), ans + 6), answer: String(ans), hint, explain: ex };
    if (level === 3 && U.chance(0.3)) {
      const steps = ex.replace(/^1\) /, '').split('; 2) ');
      return { type: 'order', prompt: text + '<br><i>Расставь решение по порядку</i>', items: [steps[0], steps[1].replace(/\.$/, ''), 'Ответ: ' + ans], hint, explain: ex };
    }
    return { type: 'input', mode: 'num', prompt: text, visual: level === 2 ? V.big(o[3]) : undefined, answer: ans, hint, explain: ex };
  }

  /* ---------- 10. Длина ---------- */
  function genLength(level) {
    if (level === 1) {
      const facts = [['1 см = ? мм', 10, 'мм'], ['1 дм = ? см', 10, 'см'], ['1 м = ? дм', 10, 'дм'], ['1 м = ? см', 100, 'см'], ['2 см = ? мм', 20, 'мм'], ['3 дм = ? см', 30, 'см'], ['5 см = ? мм', 50, 'мм'], ['2 м = ? дм', 20, 'дм'], ['10 мм = ? см', 1, 'см'], ['10 см = ? дм', 1, 'дм'], ['100 см = ? м', 1, 'м'], ['40 мм = ? см', 4, 'см'], ['70 см = ? дм', 7, 'дм']];
      if (U.chance(0.35)) {
        const items = [['длина карандаша', 'см'], ['высота дома', 'м'], ['толщина монеты', 'мм'], ['длина класса', 'м'], ['рост человека', 'см'], ['длина ластика', 'см'], ['длина футбольного поля', 'м'], ['ширина ногтя', 'мм'], ['длина тетради', 'см'], ['высота дерева', 'м'], ['толщина книги', 'см'], ['длина муравья', 'мм']];
        const it = U.pick(items);
        return { type: 'choice', prompt: 'В чём удобнее измерить <b>' + it[0] + '</b>?', options: U.shuffle(['мм', 'см', 'м']), answer: it[1], hint: 'Маленькое — в миллиметрах, среднее — в сантиметрах, большое — в метрах', explain: U.cap(it[0]) + ' удобно измерять в ' + ({ мм: 'миллиметрах', см: 'сантиметрах', м: 'метрах' })[it[1]] + '.' };
      }
      const f = U.pick(facts);
      return { type: 'choice', prompt: f[0].replace('?', '<b>?</b>'), options: U.opts(f[1] + ' ' + f[2], [f[1] * 10 + ' ' + f[2], (f[1] === 1 ? 2 : Math.max(1, f[1] / 10)) + ' ' + f[2]]), answer: f[1] + ' ' + f[2], hint: '1 см = 10 мм, 1 дм = 10 см, 1 м = 10 дм = 100 см', explain: f[0].replace('?', f[1]) + '.' };
    }
    if (level === 2) {
      const kind = N(1, 4);
      if (kind === 1) { const a = N(2, 9); return { type: 'input', mode: 'num', prompt: '<b>' + a + ' дм = ? см</b>', answer: a * 10, hint: '1 дм = 10 см', explain: a + ' дм = ' + a * 10 + ' см.' }; }
      if (kind === 2) { const a = N(1, 9), b = N(1, 9); return { type: 'input', mode: 'num', prompt: '<b>' + a + ' см ' + b + ' мм = ? мм</b>', answer: a * 10 + b, hint: '1 см = 10 мм', explain: a + ' см = ' + a * 10 + ' мм, и ещё ' + b + ' мм: всего ' + (a * 10 + b) + ' мм.' }; }
      if (kind === 3) { const a = N(1, 9), b = N(1, 9); return { type: 'input', mode: 'num', prompt: '<b>' + a + ' дм ' + b + ' см = ? см</b>', answer: a * 10 + b, hint: '1 дм = 10 см', explain: a + ' дм ' + b + ' см = ' + (a * 10 + b) + ' см.' }; }
      const pairs = [['1 м', '10 дм', '='], ['1 м', '90 см', '>'], ['5 дм', '50 см', '='], ['2 дм', '25 см', '<'], ['3 см', '30 мм', '='], ['4 см', '45 мм', '<'], ['7 дм', '1 м', '<'], ['1 дм 2 см', '12 см', '='], ['3 дм 5 см', '53 см', '<'], ['6 см', '58 мм', '>'], ['9 дм', '1 м', '<'], ['2 м', '20 дм', '='], ['15 мм', '2 см', '<'], ['80 см', '8 дм', '=']];
      const p = U.pick(pairs);
      return { type: 'compare', prompt: 'Сравни длины', a: p[0], b: p[1], answer: p[2], hint: 'Переведи в одинаковые единицы', explain: p[0] + ' ' + p[2] + ' ' + p[1] + '.' };
    }
    const kind = N(1, 4);
    if (kind === 1) { const a = N(1, 5), b = N(1, 9), c = N(1, 4); return { type: 'input', mode: 'num', prompt: '<b>' + a + ' дм ' + b + ' см + ' + c + ' дм = ? см</b>', answer: (a + c) * 10 + b, hint: 'Сначала переведи всё в сантиметры', explain: a + ' дм ' + b + ' см = ' + (a * 10 + b) + ' см; ' + c + ' дм = ' + c * 10 + ' см; всего ' + ((a + c) * 10 + b) + ' см.' }; }
    if (kind === 2) { const a = N(15, 99); return { type: 'input', mode: 'num', prompt: 'Сколько <b>полных дециметров</b> в ' + a + ' см?', answer: Math.floor(a / 10), hint: '10 см = 1 дм', explain: a + ' см = ' + Math.floor(a / 10) + ' дм ' + (a % 10) + ' см.' }; }
    if (kind === 3) { const a = N(1, 3), b = N(1, 9); const other = N(1, 9); return { type: 'choice', prompt: 'Что длиннее: <b>' + a + ' м ' + b + ' дм</b> или <b>' + (a * 10 + other) + ' дм</b>?', options: U.uniq([a + ' м ' + b + ' дм', (a * 10 + other) + ' дм', 'Одинаково']), answer: b > other ? a + ' м ' + b + ' дм' : b < other ? (a * 10 + other) + ' дм' : 'Одинаково', hint: '1 м = 10 дм', explain: a + ' м ' + b + ' дм = ' + (a * 10 + b) + ' дм.' + (b === other ? ' Длины равны.' : '') }; }
    const items = ['12 см', '1 дм', '2 дм 5 см', '30 мм', '1 м'];
    const vals = { '12 см': 120, '1 дм': 100, '2 дм 5 см': 250, '30 мм': 30, '1 м': 1000 };
    const pick = U.pickN(items, 4).sort((x, y) => vals[x] - vals[y]);
    return { type: 'order', prompt: 'Расставь длины от самой короткой к самой длинной', items: pick, hint: 'Переведи всё в миллиметры или сантиметры', explain: 'По возрастанию: ' + pick.join(' < ') + '.' };
  }

  /* ---------- 11. Время ---------- */
  function genTime(level) {
    if (level === 1) {
      if (U.chance(0.25)) { const q = U.pick([['Сколько минут в одном часе?', 60], ['Сколько часов в сутках?', 24], ['Сколько минут в половине часа?', 30], ['Сколько секунд в минуте?', 60]]); return { type: 'choice', prompt: q[0], options: U.numOpts(q[1], 2, 10, 70), answer: String(q[1]), explain: q[0].replace('?', ' — ' + q[1] + '.') }; }
      const h = N(1, 12);
      return { type: 'choice', prompt: 'Который час показывают часы?', visual: V.clock(h, 0), options: U.shuffle(U.uniq([h + ' часов', (h % 12) + 1 + ' часов', (h === 1 ? 12 : h - 1) + ' часов'])), answer: h + ' часов', hint: 'Короткая стрелка показывает часы, длинная — минуты (на 12 — ровно)', explain: 'Короткая стрелка на ' + h + ', длинная на 12: ровно ' + h + ' часов.' };
    }
    if (level === 2) {
      const h = N(1, 12), m = U.pick([0, 15, 30, 45]);
      const ans = fmtTime(h, m);
      const d1 = fmtTime(h, (m + 30) % 60), d2 = fmtTime(h % 12 + 1, m), d3 = fmtTime(m === 0 ? h : (m / 5) % 12 || 12, h * 5 % 60);
      const opts = U.uniq([ans, d1, d2, d3]).slice(0, 4);
      return { type: 'choice', prompt: 'Какое время показывают часы?', visual: V.clock(h, m), options: U.shuffle(opts), answer: ans, hint: 'Длинная стрелка: на 3 — 15 минут, на 6 — 30, на 9 — 45', explain: 'Часовая стрелка между ' + h + ' и ' + (h % 12 + 1) + ', минутная показывает ' + m + ' минут: ' + ans + '.' };
    }
    const kind = N(1, 4);
    if (kind === 1) { const h = N(1, 12), m = N(1, 11) * 5; const ans = fmtTime(h, m); const opts = U.uniq([ans, fmtTime(h, (m + 5) % 60), fmtTime(h, (m + 55) % 60), fmtTime(h % 12 + 1, m)]);
      return { type: 'choice', prompt: 'Какое время показывают часы?', visual: V.clock(h, m), options: U.shuffle(opts), answer: ans, hint: 'Считай минуты по пять: 5, 10, 15…', explain: 'Минутная стрелка на ' + (m / 5) + ' — это ' + m + ' минут: ' + ans + '.' }; }
    if (kind === 2) { const h = N(1, 11), m = U.pick([0, 10, 15, 20, 30, 40]); const add = U.pick([10, 15, 20, 30, 45]); let nh = h, nm = m + add; if (nm >= 60) { nm -= 60; nh++; }
      return { type: 'input', mode: 'text', prompt: 'Сейчас <b>' + fmtTime(h, m) + '</b>. Какое время будет через <b>' + add + ' минут</b>? Запиши как ' + fmtTime(nh, nm).replace(/\d/g, 'ч').replace(/ч+:/, 'ч:').replace(/ч+$/, 'мм'), visual: V.clock(h, m), answer: [fmtTime(nh, nm), nh + '.' + String(nm).padStart(2, '0'), nh + ' ' + String(nm).padStart(2, '0')], hint: 'Прибавь минуты; если получилось 60 и больше — это ещё один час', explain: fmtTime(h, m) + ' + ' + add + ' мин = ' + fmtTime(nh, nm) + '.' }; }
    if (kind === 3) { const h1 = N(1, 10), m1 = U.pick([0, 15, 30]); const diff = U.pick([15, 25, 30, 45, 60, 75, 90]); const t2 = h1 * 60 + m1 + diff; const h2 = Math.floor(t2 / 60), m2 = t2 % 60;
      return { type: 'input', mode: 'num', prompt: 'Урок начался в <b>' + fmtTime(h1, m1) + '</b>, а закончился в <b>' + fmtTime(h2, m2) + '</b>. Сколько <b>минут</b> длился урок?', answer: diff, hint: 'Считай минуты от начала до конца', explain: 'От ' + fmtTime(h1, m1) + ' до ' + fmtTime(h2, m2) + ' прошло ' + diff + ' минут.' }; }
    const q = U.pick([['Сколько минут в 2 часах?', 120], ['Сколько минут в 1 часе 30 минутах?', 90], ['Сколько минут в 1 часе 15 минутах?', 75], ['Сколько часов в 120 минутах?', 2], ['Сколько минут в 3 часах?', 180], ['Сколько часов и минут в 100 минутах? Запиши минуты', 40], ['Сколько минут в четверти часа?', 15]]);
    return { type: 'input', mode: 'num', prompt: q[0], answer: q[1], hint: '1 ч = 60 мин', explain: q[0].replace('?', '') + ' — ' + q[1] + '.' };
  }

  /* ---------- 12. Деньги ---------- */
  const GOODS = [['тетрадь', 'тетради', 'тетрадей', '📓'], ['ручка', 'ручки', 'ручек', '🖊️'], ['ластик', 'ластика', 'ластиков', '🧽'], ['булочка', 'булочки', 'булочек', '🥐'], ['сок', 'сока', 'соков', '🧃'], ['открытка', 'открытки', 'открыток', '💌'], ['наклейка', 'наклейки', 'наклеек', '🌟'], ['шоколадка', 'шоколадки', 'шоколадок', '🍫'], ['карандаш', 'карандаша', 'карандашей', '✏️'], ['пирожок', 'пирожка', 'пирожков', '🥟']];
  function genMoney(level) {
    if (level === 1) {
      const kind = N(1, 3);
      if (kind === 1) { const q = U.pick([['Сколько копеек в одном рубле?', 100], ['Сколько рублей в 100 копейках?', 1], ['Сколько копеек в 2 рублях?', 200], ['Сколько копеек в половине рубля?', 50]]); return { type: 'choice', prompt: q[0], options: U.numOpts(q[1], 2, 1, 210), answer: String(q[1]), hint: '1 р. = 100 к.', explain: q[0].replace('?', '') + ' — ' + q[1] + '.' }; }
      const [g1, g2] = two(GOODS); const p1 = N(3, 20), p2 = N(3, 20);
      if (kind === 2) return { type: 'choice', prompt: U.cap(g1[0]) + ' стоит ' + p1 + ' р., а ' + g2[0] + ' — ' + p2 + ' р. Сколько стоит покупка?', visual: V.big(g1[3] + ' ' + g2[3]), options: U.numOpts(p1 + p2, 2, p1 + p2 - 8, p1 + p2 + 8), answer: String(p1 + p2), hint: 'Сложи цены', explain: p1 + ' + ' + p2 + ' = ' + (p1 + p2) + ' р.' };
      const coins = U.pick([[5, 2], [10, 5], [10, 2], [5, 1], [2, 1], [10, 1]]); const n1 = N(1, 3), n2 = N(1, 3); const sum = coins[0] * n1 + coins[1] * n2;
      return { type: 'choice', prompt: 'Сколько всего рублей?', visual: V.big(('🪙' + coins[0] + ' ').repeat(n1) + ('🪙' + coins[1] + ' ').repeat(n2)), options: U.numOpts(sum, 2, Math.max(1, sum - 6), sum + 6), answer: String(sum), hint: 'Сложи монеты', explain: n1 + ' × ' + coins[0] + ' + ' + n2 + ' × ' + coins[1] + ' = ' + sum + ' р.' };
    }
    if (level === 2) {
      const kind = N(1, 3); const g = U.pick(GOODS);
      if (kind === 1) { const price = N(5, 45); const pay = U.pick([50, 100].filter(v => v > price)); return { type: 'input', mode: 'num', prompt: U.cap(g[0]) + ' стоит ' + price + ' р. Вика дала ' + pay + ' р. Сколько сдачи она получит?', visual: V.big(g[3]), answer: pay - price, hint: 'Сдача = дала − цена', explain: pay + ' − ' + price + ' = ' + (pay - price) + ' р.' }; }
      if (kind === 2) { const price = N(3, 15), n = N(2, 3); return { type: 'input', mode: 'num', prompt: 'Одна ' + g[0] + ' стоит ' + price + ' р. Сколько стоят ' + cnt(n, g) + '?', visual: V.emojis(g[3], n), answer: price * n, hint: 'Сложи цену ' + n + ' раза', explain: (price + ' + ').repeat(n).slice(0, -3) + ' = ' + price * n + ' р.' }; }
      const [g1, g2] = two(GOODS); const p1 = N(10, 40), p2 = N(10, 40); const have = p1 + p2 + N(1, 15);
      return { type: 'input', mode: 'num', prompt: 'У Пети ' + have + ' р. Он купил ' + g1[0].replace(/а$/, 'у') + ' за ' + p1 + ' р. и ' + g2[0].replace(/а$/, 'у') + ' за ' + p2 + ' р. Сколько денег осталось?', answer: have - p1 - p2, hint: 'Сначала — сколько потратил', explain: p1 + ' + ' + p2 + ' = ' + (p1 + p2) + '; ' + have + ' − ' + (p1 + p2) + ' = ' + (have - p1 - p2) + ' р.' };
    }
    const kind = N(1, 4); const g = U.pick(GOODS);
    if (kind === 1) { const price = N(11, 24), n = N(2, 4); const pay = U.pick([50, 100].filter(v => v >= price * n)); if (!pay) return genMoney(level); return { type: 'input', mode: 'num', prompt: 'Купили ' + cnt(n, g) + ' по ' + price + ' р. и дали ' + pay + ' р. Сколько сдачи?', answer: pay - price * n, hint: 'Сначала стоимость покупки, потом сдача', explain: price + ' × ' + n + ' = ' + price * n + '; ' + pay + ' − ' + price * n + ' = ' + (pay - price * n) + ' р.' }; }
    if (kind === 2) { const price = N(6, 15), n = N(2, 5); return { type: 'input', mode: 'num', prompt: 'За ' + cnt(n, g) + ' заплатили ' + price * n + ' р. Сколько стоит одна ' + g[0] + '?', answer: price, hint: 'Стоимость : количество = цена', explain: price * n + ' : ' + n + ' = ' + price + ' р.' }; }
    if (kind === 3) { const price = N(12, 45); const have = price + U.pick([-5, -3, -1, 0, 2, 4]); return { type: 'choice', prompt: U.cap(g[0]) + ' стоит ' + price + ' р. У Кати ' + have + ' р. Хватит ли ей денег?', options: ['Да, хватит', 'Нет, не хватит'], answer: have >= price ? 'Да, хватит' : 'Нет, не хватит', hint: 'Сравни ' + have + ' и ' + price, explain: have >= price ? have + ' ≥ ' + price + ', денег хватит' + (have > price ? ', и останется ' + (have - price) + ' р.' : '.') : have + ' < ' + price + ': не хватает ' + (price - have) + ' р.' }; }
    const r = N(1, 9), k = N(1, 9) * 10;
    return { type: 'input', mode: 'num', prompt: '<b>' + r + ' р. ' + k + ' к. = ? к.</b>', answer: r * 100 + k, hint: '1 р. = 100 к.', explain: r + ' р. = ' + r * 100 + ' к., плюс ' + k + ' к. = ' + (r * 100 + k) + ' к.' };
  }

  /* ---------- 13. Смысл умножения ---------- */
  function genMultSense(level) {
    const o = U.pick(OBJ);
    if (level === 1) {
      const a = N(2, 5), k = N(2, 4);
      const kind = N(1, 2);
      if (kind === 1) return { type: 'choice', prompt: 'Замени сложение умножением: <b>' + Array(k).fill(a).join(' + ') + '</b>', visual: V.groups(o[3], k, a), options: U.shuffle(U.uniq([a + ' · ' + k, k + ' · ' + (a + 1), a + ' + ' + k])), answer: a + ' · ' + k, hint: 'Число ' + a + ' взяли ' + k + ' раза', explain: a + ' повторяется ' + k + ' раза — это ' + a + ' · ' + k + ' = ' + a * k + '.' };
      return { type: 'choice', prompt: 'Сколько всего ' + o[2] + '?', visual: V.groups(o[3], k, a), options: U.numOpts(a * k, 2, a * k - 4, a * k + 4), answer: String(a * k), hint: k + ' коробки по ' + a, explain: a + ' · ' + k + ' = ' + a * k + '.' };
    }
    if (level === 2) {
      const kind = N(1, 4); const a = N(2, 6), k = N(2, 5);
      if (kind === 1) return { type: 'input', mode: 'num', prompt: 'Сосчитай: <b>' + a + ' · ' + k + '</b>', visual: V.groups(o[3], k, a), answer: a * k, hint: 'Это ' + Array(k).fill(a).join(' + '), explain: a + ' · ' + k + ' = ' + Array(k).fill(a).join(' + ') + ' = ' + a * k + '.' };
      if (kind === 2) return { type: 'choice', prompt: 'Какое выражение равно сумме <b>' + Array(k).fill(a).join(' + ') + '</b>?', options: U.shuffle(U.uniq([a + ' · ' + k, a + ' · ' + (k + 1), (a + 1) + ' · ' + k])), answer: a + ' · ' + k, explain: 'Слагаемое ' + a + ' взято ' + k + ' раз: ' + a + ' · ' + k + '.' };
      if (kind === 3) { const q = U.pick([['Как называются числа, которые умножают?', 'множители', ['множители', 'слагаемые', 'сумма']], ['Как называется результат умножения?', 'произведение', ['произведение', 'сумма', 'разность']], ['Как называется результат деления?', 'частное', ['частное', 'произведение', 'разность']], ['Как называется число, которое делят?', 'делимое', ['делимое', 'делитель', 'частное']], ['Как называется число, на которое делят?', 'делитель', ['делитель', 'делимое', 'множитель']]]);
        return { type: 'choice', prompt: q[0], options: U.shuffle(q[2]), answer: q[1], explain: q[0].replace('?', '') + ' — ' + q[1] + '.' }; }
      const g = U.pick(GIRLS); return { type: 'input', mode: 'num', prompt: g + ' разложила ' + cnt(a * k, o) + ' в коробки по ' + a + ' в каждую. Сколько коробок получилось?', visual: V.emojis(o[3], a * k), answer: k, hint: 'Сколько раз по ' + a + ' в ' + a * k + '?', explain: a * k + ' : ' + a + ' = ' + k + '.' };
    }
    const kind = N(1, 4); const a = N(2, 9), k = N(2, 9);
    if (kind === 1) return { type: 'compare', prompt: 'Сравни, не вычисляя', a: a + ' · ' + k, b: k + ' · ' + a, answer: '=', hint: 'От перестановки множителей произведение не меняется', explain: a + ' · ' + k + ' = ' + k + ' · ' + a + ' — переместительное свойство умножения.' };
    if (kind === 2) { const q = U.pick([[a + ' · 1', a], ['1 · ' + a, a], [a + ' · 0', 0], ['0 · ' + a, 0], [a + ' : 1', a], [a + ' : ' + a, 1], ['0 : ' + a, 0]]); return { type: 'input', mode: 'num', prompt: 'Сосчитай: <b>' + q[0] + '</b>', answer: q[1], hint: 'Умножение на 1 даёт то же число, на 0 — ноль', explain: q[0] + ' = ' + q[1] + '.' }; }
    if (kind === 3) { const g = U.pick(GIRLS); const n = N(2, 5), m = N(2, 6); return { type: 'choice', prompt: 'В ' + n + ' вазах по ' + cnt(m, ['цветок', 'цветка', 'цветков']) + '. Каким выражением найти, сколько всего цветков?', options: U.shuffle(U.uniq([m + ' · ' + n, m + ' + ' + n, m + ' : ' + n])), answer: m + ' · ' + n, hint: 'По ' + m + ' взяли ' + n + ' раз', explain: m + ' · ' + n + ' = ' + m * n + ' цветков.' }; }
    const total = a * k; return { type: 'input', mode: 'num', prompt: cnt(total, o) + ' раздали поровну ' + k + ' детям. Сколько ' + o[2] + ' получил каждый?', answer: a, hint: 'Это деление: ' + total + ' : ' + k, explain: total + ' : ' + k + ' = ' + a + '.' };
  }

  /* ---------- 14. Таблица на 2 и 3 ---------- */
  function genTable23(level) {
    if (level === 1) { const b = N(1, 9); const kind = N(1, 2); if (kind === 1) return { type: 'choice', prompt: 'Сосчитай: <b>2 · ' + b + '</b>', visual: V.groups('🍒', b, 2), options: U.numOpts(2 * b, 2, Math.max(1, 2 * b - 4), 2 * b + 4), answer: String(2 * b), hint: 'Считай двойками: 2, 4, 6…', explain: '2 · ' + b + ' = ' + 2 * b + '.' };
      return { type: 'choice', prompt: 'Сосчитай: <b>' + b + ' · 2</b>', options: U.numOpts(2 * b, 2, Math.max(1, 2 * b - 4), 2 * b + 4), answer: String(2 * b), hint: b + ' · 2 = 2 · ' + b, explain: b + ' · 2 = ' + 2 * b + '.' }; }
    if (level === 2) { const b = N(1, 10); const kind = N(1, 4);
      if (kind === 1) return { type: 'input', mode: 'num', prompt: 'Сосчитай: <b>3 · ' + b + '</b>', answer: 3 * b, hint: 'Считай тройками: 3, 6, 9…', explain: '3 · ' + b + ' = ' + 3 * b + '.' };
      if (kind === 2) return { type: 'input', mode: 'num', prompt: 'Сосчитай: <b>' + b + ' · 3</b>', answer: 3 * b, explain: b + ' · 3 = ' + 3 * b + '.' };
      if (kind === 3) return { type: 'input', mode: 'num', prompt: 'Сосчитай: <b>' + 2 * b + ' : 2</b>', answer: b, hint: 'Какое число умножить на 2, чтобы получить ' + 2 * b + '?', explain: 2 * b + ' : 2 = ' + b + ', потому что ' + b + ' · 2 = ' + 2 * b + '.' };
      return { type: 'input', mode: 'num', prompt: 'Сосчитай: <b>' + 3 * b + ' : 3</b>', answer: b, hint: 'Какое число умножить на 3, чтобы получить ' + 3 * b + '?', explain: 3 * b + ' : 3 = ' + b + '.' }; }
    const kind = N(1, 4);
    if (kind === 1) { const m = U.pick([2, 3]), b = N(2, 10); return { type: 'input', mode: 'num', prompt: 'Найди неизвестный множитель: <b>' + m + ' · x = ' + m * b + '</b>', answer: b, hint: 'Раздели произведение на известный множитель', explain: 'x = ' + m * b + ' : ' + m + ' = ' + b + '.' }; }
    if (kind === 2) { const nums = U.shuffle(U.pickN(U.range(1, 30).filter(n => n % 2 === 0), 4).concat(U.pickN(U.range(1, 30).filter(n => n % 2 === 1), 4))); return { type: 'sort', prompt: 'Разложи числа: чётные и нечётные', groups: [{ name: 'Чётные', items: nums.filter(n => n % 2 === 0).map(String) }, { name: 'Нечётные', items: nums.filter(n => n % 2 === 1).map(String) }], hint: 'Чётные делятся на 2 без остатка: оканчиваются на 0, 2, 4, 6, 8', explain: 'Чётные: ' + nums.filter(n => n % 2 === 0).join(', ') + '. Нечётные: ' + nums.filter(n => n % 2 === 1).join(', ') + '.' }; }
    if (kind === 3) { const pairs = U.pickN([['2 · 7', '14'], ['3 · 6', '18'], ['2 · 9', '18 '], ['3 · 4', '12'], ['2 · 8', '16'], ['3 · 7', '21'], ['3 · 9', '27'], ['2 · 6', '12 '], ['3 · 8', '24'], ['2 · 4', '8'], ['3 · 5', '15'], ['2 · 5', '10']], 4);
      const seen = new Set(); const uniqPairs = pairs.filter(p => { const v = p[1].trim(); if (seen.has(v)) return false; seen.add(v); return true; });
      if (uniqPairs.length < 3) return genTable23(level);
      return { type: 'match', prompt: 'Соедини пример и ответ', pairs: uniqPairs.map(p => [p[0], p[1].trim()]), explain: uniqPairs.map(p => p[0] + ' = ' + p[1].trim()).join(', ') + '.' }; }
    const m = U.pick([2, 3]), b = N(2, 9), c = N(1, 9); const v = m * b + c;
    return { type: 'input', mode: 'num', prompt: 'Сосчитай: <b>' + m + ' · ' + b + ' + ' + c + '</b>', answer: v, hint: 'Сначала умножение, потом сложение', explain: m + ' · ' + b + ' = ' + m * b + '; ' + m * b + ' + ' + c + ' = ' + v + '.' };
  }

  /* ---------- 15. Умножение на 10, 1, 0 ---------- */
  function genMult10(level) {
    const a = N(1, 9);
    if (level === 1) { const q = U.pick([[a + ' · 10', a * 10], ['10 · ' + a, a * 10], [a + ' · 1', a], ['1 · ' + a, a], [a + ' · 0', 0], ['0 · ' + a, 0]]);
      return { type: 'choice', prompt: 'Сосчитай: <b>' + q[0] + '</b>', options: U.numOpts(q[1], 2, 0, 100), answer: String(q[1]), hint: 'Умножить на 10 — приписать 0; на 1 — то же число; на 0 — ноль', explain: q[0] + ' = ' + q[1] + '.' }; }
    if (level === 2) { const q = U.pick([[a + ' · 10', a * 10], ['10 · ' + a, a * 10], [a * 10 + ' : 10', a], [a * 10 + ' : ' + a, 10], [a + ' · 1', a], [a + ' : 1', a], ['0 · ' + a, 0], ['0 : ' + a, 0], [a + ' : ' + a, 1]]);
      return { type: 'input', mode: 'num', prompt: 'Сосчитай: <b>' + q[0] + '</b>', answer: q[1], hint: '1 — «ничего не меняет», 0 — «всё обнуляет», 10 — «приписывает ноль»', explain: q[0] + ' = ' + q[1] + '.' }; }
    const kind = N(1, 3);
    if (kind === 1) { const b = N(1, 9); const v = a * 10 - b; return { type: 'input', mode: 'num', prompt: 'Сосчитай: <b>' + a + ' · 10 − ' + b + '</b>', answer: v, hint: 'Сначала умножение', explain: a + ' · 10 = ' + a * 10 + '; ' + a * 10 + ' − ' + b + ' = ' + v + '.' }; }
    if (kind === 2) { const b = N(2, 9); const l = a + ' · 10', r = b * 10 + ' : 10'; return { type: 'compare', prompt: 'Сравни', a: l, b: r, answer: sign(a * 10, b), explain: l + ' = ' + a * 10 + ', ' + r + ' = ' + b + '.' }; }
    const exprs = U.shuffle([a + ' · 0', '0 · ' + a, a + ' − ' + a, '0 : ' + a, a + ' · 1', a + ' : ' + a]);
    const zero = exprs.filter(e => /· 0|0 ·|− |0 :/.test(e));
    return { type: 'choice', multi: true, prompt: 'Выбери все выражения, значение которых равно <b>0</b>', options: exprs, answer: zero, hint: 'Умножение на ноль и деление нуля дают ноль', explain: 'Равны нулю: ' + zero.join(', ') + '. А ' + a + ' · 1 = ' + a + ', ' + a + ' : ' + a + ' = 1.' };
  }

  /* ---------- 16. Геометрия ---------- */
  function genGeometry(level) {
    if (level === 1) {
      const kind = N(1, 3);
      if (kind === 1) { const q = U.pick([['Сколько сторон у треугольника?', 3, '🔺'], ['Сколько углов у квадрата?', 4, '🟥'], ['Сколько сторон у прямоугольника?', 4, '▬'], ['Сколько вершин у треугольника?', 3, '🔺'], ['Сколько сторон у пятиугольника?', 5, '⬠'], ['Сколько углов у шестиугольника?', 6, '⬡']]); return { type: 'choice', prompt: q[0], visual: V.big(q[2]), options: U.numOpts(q[1], 2, 2, 8), answer: String(q[1]), explain: q[0].replace('?', '') + ' — ' + q[1] + '.' }; }
      if (kind === 2) { const t = U.pick(['right', 'acute', 'obtuse']); const names = { right: 'прямой', acute: 'острый', obtuse: 'тупой' }; return { type: 'choice', prompt: 'Какой это угол?', visual: angleSvg(t), options: U.shuffle(['прямой', 'острый', 'тупой']), answer: names[t], hint: 'Прямой — как уголок листа, острый — меньше прямого, тупой — больше', explain: 'Это ' + names[t] + ' угол.' }; }
      const a = N(2, 6), b = N(2, 6), c = N(2, 6); return { type: 'choice', prompt: 'Найди периметр треугольника (сумму длин всех сторон)', visual: V.triangle(a, b, c), options: U.numOpts(a + b + c, 2, a + b + c - 4, a + b + c + 4).map(v => v + ' см'), answer: (a + b + c) + ' см', hint: 'Сложи все три стороны', explain: a + ' + ' + b + ' + ' + c + ' = ' + (a + b + c) + ' см.' };
    }
    if (level === 2) {
      const kind = N(1, 4);
      if (kind === 1) { const w = N(3, 12), h = N(2, w - 1); return { type: 'input', mode: 'num', prompt: 'Найди периметр прямоугольника (в см)', visual: V.rect(w, h), answer: (w + h) * 2, hint: 'У прямоугольника противоположные стороны равны: ' + w + ' + ' + h + ' + ' + w + ' + ' + h, explain: 'P = ' + w + ' + ' + h + ' + ' + w + ' + ' + h + ' = ' + (w + h) * 2 + ' см (или (' + w + ' + ' + h + ') · 2).' }; }
      if (kind === 2) { const a = N(2, 12); return { type: 'input', mode: 'num', prompt: 'Найди периметр квадрата (в см)', visual: V.square(a), answer: a * 4, hint: 'У квадрата все 4 стороны равны', explain: 'P = ' + a + ' · 4 = ' + a * 4 + ' см.' }; }
      if (kind === 3) { const segs = [N(2, 9), N(2, 9), N(2, 9)]; if (U.chance(0.4)) segs.push(N(2, 9)); const sum = segs.reduce((x, y) => x + y, 0); return { type: 'input', mode: 'num', prompt: 'Найди длину ломаной (в см)', visual: V.polyline(segs), answer: sum, hint: 'Сложи длины всех звеньев', explain: segs.join(' + ') + ' = ' + sum + ' см.' }; }
      const items = [['треугольник', 'Три стороны и три угла'], ['квадрат', 'Четыре равные стороны и четыре прямых угла'], ['прямоугольник', 'Четыре прямых угла, противоположные стороны равны'], ['круг', 'Нет углов, все точки на одинаковом расстоянии от центра'], ['отрезок', 'Часть прямой, ограниченная двумя точками'], ['луч', 'Часть прямой, у которой есть начало, но нет конца'], ['ломаная', 'Несколько отрезков, соединённых концами']];
      const pick = U.pickN(items, 4);
      return { type: 'match', prompt: 'Соедини фигуру и её описание', pairs: pick, explain: pick.map(p => U.cap(p[0]) + ' — ' + p[1].toLowerCase()).join('; ') + '.' };
    }
    const kind = N(1, 4);
    if (kind === 1) { const w = N(3, 15), h = N(2, w - 1); const P = (w + h) * 2; return { type: 'input', mode: 'num', prompt: 'Периметр прямоугольника <b>' + P + ' см</b>, одна сторона <b>' + w + ' см</b>. Найди другую сторону (в см)', visual: V.rect(w, h).replace(h + ' см', '? см'), answer: h, hint: 'Половина периметра — это сумма двух разных сторон: ' + P + ' : 2 = ' + (P / 2), explain: P + ' : 2 = ' + (P / 2) + '; ' + (P / 2) + ' − ' + w + ' = ' + h + ' см.' }; }
    if (kind === 2) { const P = N(3, 12) * 4; return { type: 'input', mode: 'num', prompt: 'Периметр квадрата <b>' + P + ' см</b>. Найди его сторону (в см)', answer: P / 4, hint: 'У квадрата 4 равные стороны', explain: P + ' : 4 = ' + (P / 4) + ' см.' }; }
    if (kind === 3) { const a = N(2, 9), b = N(2, 9), c = N(2, 9); const sq = N(2, 8); const P1 = a + b + c, P2 = sq * 4; return { type: 'compare', prompt: 'Что больше: периметр треугольника со сторонами ' + a + ', ' + b + ', ' + c + ' см или периметр квадрата со стороной ' + sq + ' см?', a: 'треугольник', b: 'квадрат', answer: sign(P1, P2), hint: 'Найди оба периметра', explain: 'Треугольник: ' + P1 + ' см, квадрат: ' + P2 + ' см.' }; }
    const t = U.pick(['right', 'acute', 'obtuse']); const names = { right: 'прямой', acute: 'острый', obtuse: 'тупой' };
    const facts = { right: 'Прямой угол — как угол тетрадного листа', acute: 'Острый угол меньше прямого', obtuse: 'Тупой угол больше прямого' };
    return { type: 'choice', prompt: 'Определи вид угла и выбери верное утверждение', visual: angleSvg(t), options: U.shuffle(['Это ' + names[t] + ' угол', 'Это ' + names[U.pickOther(Object.keys(names), t)] + ' угол', 'У этого угла нет вершины']), answer: 'Это ' + names[t] + ' угол', explain: facts[t] + '.' };
  }

  /* ---------- регистрация ---------- */
  S.registerSubject({
    id: 'math', title: 'Математика', emoji: '🔢', color: '#4f8ef7', desc: 'Числа, задачи и фигуры',
    sections: [
      { title: 'Числа от 1 до 100', lessons: [
        { id: 'm-numbers', title: 'Числа до 100', emoji: '💯', rule: 'В двузначном числе первая цифра — <b>десятки</b>, вторая — <b>единицы</b>: 47 = 4 дес. 7 ед. = 40 + 7. Самое маленькое двузначное число — 10, самое большое — 99, а 100 — это <b>сотня</b>.', gen: genNumbers },
        { id: 'm-compare', title: 'Сравнение чисел и выражений', emoji: '⚖️', rule: 'Сравниваем сначала <b>десятки</b>, потом <b>единицы</b>: 47 < 52, потому что 4 дес. меньше 5 дес. Чтобы сравнить выражение с числом, сначала <b>вычисли</b> выражение.', gen: genCompare }
      ]},
      { title: 'Сложение и вычитание', lessons: [
        { id: 'm-oral', title: 'Устный счёт до 100', emoji: '🧠', rule: 'Десятки складываем с десятками, единицы — с единицами: 36 + 20 = 56, 36 + 2 = 38. Если единиц становится 10 и больше — <b>дополняй до круглого</b>: 26 + 7 = 26 + 4 + 3 = 33.', gen: genOral },
        { id: 'm-col-add', title: 'Сложение в столбик', emoji: '➕', rule: 'Пишем <b>единицы под единицами</b>, десятки под десятками. Складываем справа налево. Если получилось 10 и больше — пишем единицы, а <b>1 десяток запоминаем</b> и прибавляем к десяткам.', gen: genColAdd },
        { id: 'm-col-sub', title: 'Вычитание в столбик', emoji: '➖', rule: 'Вычитаем справа налево. Если единиц не хватает — <b>занимаем 1 десяток</b> (ставим точку над десятками): 52 − 24: 12 − 4 = 8, потом 4 − 2 = 2. Ответ 28. Проверяем <b>сложением</b>: 28 + 24 = 52.', gen: genColSub },
        { id: 'm-order', title: 'Порядок действий и скобки', emoji: '🔀', rule: 'Сначала выполняем действие <b>в скобках</b>, потом остальные <b>слева направо</b>. 10 − (2 + 3) = 10 − 5 = 5, а 10 − 2 + 3 = 8 + 3 = 11.', gen: genOrder },
        { id: 'm-equations', title: 'Уравнения', emoji: '❓', rule: '<b>Уравнение</b> — равенство с неизвестным числом x. Чтобы найти <b>слагаемое</b>, из суммы вычти другое слагаемое. Чтобы найти <b>уменьшаемое</b>, сложи разность и вычитаемое. Чтобы найти <b>вычитаемое</b>, из уменьшаемого вычти разность.', gen: genEquation },
        { id: 'm-word1', title: 'Задачи в одно действие', emoji: '📖', rule: '«На … <b>больше</b>» — прибавляем, «на … <b>меньше</b>» — вычитаем. «Сколько <b>всего</b>» — складываем, «сколько <b>осталось</b>» — вычитаем. Чтобы узнать, <b>на сколько больше</b>, из большего вычитаем меньшее.', gen: genWord1 },
        { id: 'm-word2', title: 'Задачи в два действия', emoji: '📚', rule: 'В задаче в два действия сначала найди то, что <b>неизвестно, но нужно</b> для ответа. Например: «У Вики 5 конфет, у Кати на 3 больше. Сколько у них вместе?» 1) 5 + 3 = 8 (у Кати); 2) 5 + 8 = 13 (вместе).', gen: genWord2 }
      ]},
      { title: 'Величины', lessons: [
        { id: 'm-length', title: 'Единицы длины', emoji: '📏', rule: '<b>1 см = 10 мм</b>, <b>1 дм = 10 см</b>, <b>1 м = 10 дм = 100 см</b>. Маленькое измеряют в миллиметрах, среднее — в сантиметрах, большое — в метрах.', gen: genLength },
        { id: 'm-time', title: 'Часы и время', emoji: '🕗', rule: 'Короткая стрелка показывает <b>часы</b>, длинная — <b>минуты</b>. Каждая цифра на циферблате — это <b>5 минут</b>: длинная стрелка на 3 — 15 минут, на 6 — 30 минут (полчаса). <b>1 час = 60 минут</b>.', gen: genTime },
        { id: 'm-money', title: 'Деньги: рубли и копейки', emoji: '💰', rule: '<b>1 рубль = 100 копеек</b>. <b>Стоимость</b> покупки = цена · количество. <b>Сдача</b> = сколько дали − сколько стоит.', gen: genMoney }
      ]},
      { title: 'Умножение и деление', lessons: [
        { id: 'm-mult-sense', title: 'Что такое умножение', emoji: '✖️', rule: '<b>Умножение</b> заменяет сложение одинаковых слагаемых: 3 + 3 + 3 + 3 = 3 · 4 = 12. Числа при умножении — <b>множители</b>, результат — <b>произведение</b>. <b>Деление</b> — обратное действие: 12 : 4 = 3 (делимое, делитель, частное).', gen: genMultSense },
        { id: 'm-table23', title: 'Таблица на 2 и на 3', emoji: '✌️', rule: 'Умножить на 2 — сложить число с самим собой: 7 · 2 = 7 + 7 = 14. Считаем двойками: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20. Тройками: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30. Деление проверяем умножением: 18 : 3 = 6, потому что 6 · 3 = 18.', gen: genTable23 },
        { id: 'm-mult10', title: 'Умножение на 10, 1 и 0', emoji: '🔟', rule: 'Умножить на <b>10</b> — приписать справа ноль: 7 · 10 = 70. Разделить на 10 — убрать ноль: 70 : 10 = 7. Умножить на <b>1</b> — число не меняется. Умножить на <b>0</b> — получается 0. Число, делённое на само себя, равно 1.', gen: genMult10 }
      ]},
      { title: 'Геометрия', lessons: [
        { id: 'm-geometry', title: 'Фигуры, углы, периметр', emoji: '📐', rule: 'Углы бывают <b>прямые</b> (как угол листа), <b>острые</b> (меньше прямого) и <b>тупые</b> (больше прямого). <b>Периметр</b> — сумма длин всех сторон. У прямоугольника противоположные стороны равны, у квадрата все стороны равны.', gen: genGeometry }
      ]}
    ]
  });
})();
