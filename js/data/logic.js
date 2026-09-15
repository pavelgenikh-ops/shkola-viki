/* Логика и смекалка — развивающий предмет: закономерности, внимание, память, головоломки. */
(function () {
  const S = window.SCHOOL;
  const U = S.util;
  const V = S.vis;
  const N = U.rand;

  /* ---------- общие банки и помощники ---------- */
  const GIRLS = ['Вика', 'Катя', 'Маша', 'Оля', 'Соня', 'Лиза', 'Аня', 'Даша'];
  const BOYS = ['Петя', 'Миша', 'Саша', 'Ваня', 'Коля', 'Дима', 'Егор'];
  const EMO = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍉', '🍋', '🍐', '🥕', '🍄', '🐱', '🐶', '🐭', '🐰', '🦊', '🐻', '🐼', '🐸', '🐵', '🐔',
    '🐧', '🦋', '🐝', '🐢', '🌸', '🌻', '🌈', '⭐', '🌙', '🔴', '🔵', '🟢', '🟡', '🟣', '⚽', '🏀', '🎈', '🎁', '🚗', '🚌',
    '🚀', '🍬', '🍭', '🍪', '🧀', '🎂', '🔑', '🎸', '🧸', '🪁'];
  const DAYS = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'];
  const DAYS_ACC = ['понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу', 'воскресенье'];
  const MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
  const fmtTime = (h, m) => h + ':' + String(m).padStart(2, '0');
  const joinSeq = arr => arr.join(', ');
  const arith = (start, step, n) => U.range(0, n - 1).map(i => start + step * i);
  const stepText = d => d > 0 ? 'больше предыдущего на ' + d : 'меньше предыдущего на ' + (-d);
  const mod = (a, n) => ((a % n) + n) % n;
  /** Ряд эмодзи из массива (перенос по perRow) — та же разметка, что у V.emojis */
  const emojiRow = (arr, perRow) => {
    perRow = perRow || 10;
    let s = '';
    arr.forEach((e, i) => { s += '<span class="em">' + e + '</span>'; if ((i + 1) % perRow === 0 && i + 1 < arr.length) s += '<br>'; });
    return '<div class="vis vis-emojis">' + s + '</div>';
  };
  const twoRows = (label1, arr1, label2, arr2) => V.text('<p><b>' + label1 + '</b></p>') + emojiRow(arr1) + V.text('<p><b>' + label2 + '</b></p>') + emojiRow(arr2);

  /* =====================================================================
     1. Числовые ряды
     ===================================================================== */
  function oddInRow(step, len, big) {
    // ряд с шагом step, одно число заменено на «чужое»
    const start = step > 0 ? N(1, big ? 30 : 12) : N(Math.abs(step) * (len + 1), 60);
    const seq = arith(start, step, len);
    const idx = N(0, len - 1);
    const good = seq[idx];
    let bad = good + U.pick([-1, 1]);
    if (bad < 0 || seq.includes(bad)) bad = good + 1;
    if (seq.includes(bad)) bad = good + 2;
    const row = seq.map((v, i) => i === idx ? bad : v);
    return { type: 'choice', prompt: 'Одно число в ряду <b>лишнее</b> — оно нарушает закономерность. Какое?<br><b>' + joinSeq(row) + '</b>',
      visual: V.big(joinSeq(row)), options: row.map(String), answer: String(bad), hint: 'Найди шаг ряда: на сколько отличаются соседние числа',
      explain: 'Ряд идёт с шагом ' + (step > 0 ? '+' : '−') + Math.abs(step) + ': ' + joinSeq(seq) + '. Число ' + bad + ' в него не вписывается, вместо него должно быть ' + good + '.' };
  }

  function genSeries(level) {
    if (level === 1) {
      const kind = N(1, 3);
      const step = U.pick([1, 2, 5, 10]);
      const start = step === 10 ? N(1, 5) * 10 : step === 5 ? N(1, 4) * 5 : N(1, 10);
      const seq = arith(start, step, 5);
      if (kind <= 2) {
        const ans = seq[4], shown = seq.slice(0, 4);
        return { type: 'choice', prompt: 'Продолжи ряд: <b>' + joinSeq(shown) + ', ?</b>', visual: V.big(joinSeq(shown) + ', ?'),
          options: U.opts(ans, U.nearNums(ans, 2, step + 1, 0)), answer: String(ans), hint: 'Каждое число ' + stepText(step),
          explain: 'Каждое число ' + stepText(step) + ': ' + shown[3] + ' + ' + step + ' = ' + ans + '.' };
      }
      const idx = N(1, 3), ans = seq[idx];
      const shown = seq.map((v, i) => i === idx ? '?' : v);
      return { type: 'choice', prompt: 'Какое число пропущено: <b>' + joinSeq(shown) + '</b>?', visual: V.big(joinSeq(shown)),
        options: U.opts(ans, U.nearNums(ans, 2, step + 1, 0)), answer: String(ans), hint: 'Числа идут с шагом ' + step,
        explain: 'Каждое число ' + stepText(step) + ': ' + seq[idx - 1] + ' + ' + step + ' = ' + ans + '.' };
    }
    if (level === 2) {
      const kind = N(1, 4);
      if (kind === 4) return oddInRow(U.pick([2, 3, 5, 10]), 5, false);
      const t = U.pick(['+3', '-2', '-5', 'alt', 'x2', 'x4', 'tens']);
      let seq, ex;
      if (t === '+3') { const s = N(1, 20); seq = arith(s, 3, 7); ex = 'Каждое число больше предыдущего на 3'; }
      else if (t === '-2') { const s = N(15, 30); seq = arith(s, -2, 7); ex = 'Каждое число меньше предыдущего на 2'; }
      else if (t === '-5') { const s = N(35, 60); seq = arith(s, -5, 7); ex = 'Каждое число меньше предыдущего на 5'; }
      else if (t === 'alt') { const s = N(1, 10); seq = [s]; for (let i = 1; i < 7; i++) seq.push(seq[i - 1] + (i % 2 ? 2 : 1)); ex = 'Шаги чередуются: +2, +1, +2, +1…'; }
      else if (t === 'x2') { const s = N(1, 15); seq = arith(s, 2, 7); ex = 'Считаем двойками от ' + s + ': каждое число больше на 2'; }
      else if (t === 'x4') { const s = N(1, 10); seq = arith(s, 4, 7); ex = 'Каждое число больше предыдущего на 4'; }
      else { const s = N(3, 39); seq = arith(s, 10, 7); ex = 'Считаем десятками: каждое число больше на 10'; }
      if (kind === 1) {
        const ans = seq[6], shown = seq.slice(0, 6);
        return { type: 'choice', prompt: 'Продолжи ряд: <b>' + joinSeq(shown) + ', ?</b>', visual: V.big(joinSeq(shown) + ', ?'),
          options: U.opts(ans, U.nearNums(ans, 3, 5, 0)), answer: String(ans), hint: 'Сравни соседние числа: на сколько они отличаются?',
          explain: ex + '. Дальше ' + ans + '.' };
      }
      if (kind === 2) {
        const idx = N(1, 5), ans = seq[idx];
        const shown = seq.map((v, i) => i === idx ? '?' : v);
        return { type: 'choice', prompt: 'Какое число пропущено: <b>' + joinSeq(shown) + '</b>?', visual: V.big(joinSeq(shown)),
          options: U.opts(ans, U.nearNums(ans, 3, 5, 0)), answer: String(ans), hint: 'Посмотри на числа слева и справа от пропуска',
          explain: ex + '. Пропущено ' + ans + '.' };
      }
      const shown = seq.slice(0, 5), a1 = seq[5], a2 = seq[6];
      const good = a1 + ', ' + a2;
      const dis = [(a1 + 1) + ', ' + (a2 + 1), a1 + ', ' + (a2 + 1), (a1 - 1) + ', ' + a2, a2 + ', ' + a1];
      return { type: 'choice', prompt: 'Какие <b>два</b> числа продолжат ряд: <b>' + joinSeq(shown) + ', ?, ?</b>', visual: V.big(joinSeq(shown) + ', ?, ?'),
        options: U.opts(good, U.pickN(dis, 3)), answer: good,
        hint: 'Найди шаг и сделай два шага подряд', explain: ex + ': ' + a1 + ', затем ' + a2 + '.' };
    }
    // уровень 3 — ввод
    const kind = N(1, 7);
    if (kind === 1) { // ×2 или :2
      const v = U.pick([[[1, 2, 4, 8, 16], 32, 'Каждое число в 2 раза больше предыдущего: 16 + 16 = 32'], [[2, 4, 8, 16, 32], 64, 'Каждое число удваивается: 32 + 32 = 64'],
        [[3, 6, 12, 24], 48, 'Каждое число удваивается: 24 + 24 = 48'], [[5, 10, 20, 40], 80, 'Каждое число удваивается: 40 + 40 = 80'],
        [[64, 32, 16, 8], 4, 'Каждое число в 2 раза меньше предыдущего: половина от 8 — это 4'], [[80, 40, 20, 10], 5, 'Каждое число — половина предыдущего: половина от 10 — это 5'],
        [[96, 48, 24, 12], 6, 'Каждое число — половина предыдущего: половина от 12 — это 6'], [[1, 3, 9, 27], 81, 'Каждое число в 3 раза больше предыдущего: 27 · 3 = 81']]);
      return { type: 'input', mode: 'num', prompt: 'Продолжи ряд: <b>' + joinSeq(v[0]) + ', ?</b>', visual: V.big(joinSeq(v[0]) + ', ?'), answer: v[1], hint: 'Здесь числа не прибавляются, а умножаются или делятся', explain: v[2] + '.' };
    }
    if (kind === 2) { // нарастающий шаг
      const s = N(1, 6), first = U.pick([1, 2]); const seq = [s]; const steps = [];
      for (let i = 0; i < 5; i++) { steps.push(first + i); seq.push(seq[i] + first + i); }
      const shown = seq.slice(0, 5), ans = seq[5];
      return { type: 'input', mode: 'num', prompt: 'Продолжи ряд: <b>' + joinSeq(shown) + ', ?</b>', visual: V.big(joinSeq(shown) + ', ?'), answer: ans,
        hint: 'Шаг каждый раз растёт на 1', explain: 'Шаги растут: ' + steps.slice(0, 4).map(x => '+' + x).join(', ') + ', значит следующий шаг +' + steps[4] + ': ' + shown[4] + ' + ' + steps[4] + ' = ' + ans + '.' };
    }
    if (kind === 3) { // два перемешанных ряда
      const s1 = N(1, 5), d1 = U.pick([1, 2, 5]);
      const s2 = U.pick([10, 20, 30, 50, 100]), d2 = U.pick(s2 >= 30 ? [10, -10, -5] : [10, 5]);
      const A = arith(s1, d1, 4), B = arith(s2, d2, 4);
      if (A.some(x => B.includes(x)) || B.some(x => x < 0)) return genSeries(level);
      const askA = U.chance(0.5);
      const shown = []; for (let i = 0; i < 3; i++) { shown.push(A[i], B[i]); }
      if (!askA) shown.push(A[3]);
      const ans = askA ? A[3] : B[3];
      return { type: 'input', mode: 'num', prompt: 'Здесь спрятаны <b>два</b> ряда, их числа чередуются. Продолжи: <b>' + joinSeq(shown) + ', ?</b>', visual: V.big(joinSeq(shown) + ', ?'), answer: ans,
        hint: 'Смотри через одно число: ' + joinSeq(A.slice(0, 3)) + '… и ' + joinSeq(B.slice(0, 3)) + '…',
        explain: 'Первый ряд: ' + joinSeq(A) + ' (шаг ' + (d1 > 0 ? '+' : '') + d1 + '). Второй: ' + joinSeq(B) + ' (шаг ' + (d2 > 0 ? '+' : '−') + Math.abs(d2) + '). Следующее число — ' + ans + '.' };
    }
    if (kind === 4) { // Фибоначчи-лайт
      const st = U.pick([[1, 1], [2, 2], [1, 3], [2, 3], [3, 3], [1, 4], [2, 4], [3, 4], [1, 2]]);
      const seq = st.slice(); while (seq.length < 7) seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
      const len = U.pick([5, 6]); const shown = seq.slice(0, len), ans = seq[len];
      return { type: 'input', mode: 'num', prompt: 'Продолжи ряд: <b>' + joinSeq(shown) + ', ?</b>', visual: V.big(joinSeq(shown) + ', ?'), answer: ans,
        hint: 'Сложи два последних числа', explain: 'Каждое число — сумма двух предыдущих: ' + shown[len - 2] + ' + ' + shown[len - 1] + ' = ' + ans + '.' };
    }
    if (kind === 5) { // убывающие
      const d = U.pick([3, 4, 6, 7, 10]); const s = N(d * 6 + 1, 99); const seq = arith(s, -d, 6);
      const shown = seq.slice(0, 5), ans = seq[5];
      return { type: 'input', mode: 'num', prompt: 'Продолжи ряд: <b>' + joinSeq(shown) + ', ?</b>', visual: V.big(joinSeq(shown) + ', ?'), answer: ans,
        hint: 'Числа уменьшаются. На сколько каждый раз?', explain: 'Каждое число меньше предыдущего на ' + d + ': ' + shown[4] + ' − ' + d + ' = ' + ans + '.' };
    }
    if (kind === 6) return oddInRow(U.pick([3, 4, 5, 10, -2, -3]), 6, true);
    const s = N(1, 6), first = U.pick([1, 2]); const seq = [s];
    for (let i = 0; i < 6; i++) seq.push(seq[i] + first + i);
    const idx = N(2, 4), ans = seq[idx];
    const shown = seq.map((v, i) => i === idx ? '?' : v);
    return { type: 'input', mode: 'num', prompt: 'Какое число пропущено: <b>' + joinSeq(shown) + '</b>?', visual: V.big(joinSeq(shown)), answer: ans,
      hint: 'Шаг каждый раз растёт на 1', explain: 'Шаги: +' + first + ', +' + (first + 1) + ', +' + (first + 2) + '… Пропущено ' + ans + ' (' + seq[idx - 1] + ' + ' + (first + idx - 1) + ').' };
  }

  /* =====================================================================
     2. Четвёртый лишний
     ===================================================================== */
  const CATS = [
    { id: 'fruit', one: 'фрукт', many: 'фрукты', items: [['яблоко', '🍎'], ['банан', '🍌'], ['груша', '🍐'], ['апельсин', '🍊'], ['лимон', '🍋'], ['персик', '🍑'], ['ананас', '🍍'], ['киви', '🥝'], ['манго', '🥭']], vs: ['veg', 'sweet', 'pet', 'furniture', 'toy', 'dish', 'clothes'] },
    { id: 'veg', one: 'овощ', many: 'овощи', items: [['морковь', '🥕'], ['огурец', '🥒'], ['помидор', '🍅'], ['картошка', '🥔'], ['лук', '🧅'], ['капуста', '🥬'], ['перец', '🫑'], ['баклажан', '🍆'], ['кукуруза', '🌽']], vs: ['fruit', 'sweet', 'dish', 'toy', 'tool', 'pet'] },
    { id: 'berry', one: 'ягода', many: 'ягоды', items: [['клубника', '🍓'], ['вишня', '🍒'], ['виноград', '🍇'], ['малина'], ['смородина'], ['черника'], ['крыжовник']], vs: ['veg', 'mushroom', 'flower', 'tree', 'sweet'] },
    { id: 'wild', one: 'дикое животное', many: 'дикие животные', items: [['волк', '🐺'], ['лиса', '🦊'], ['заяц', '🐰'], ['медведь', '🐻'], ['ёж', '🦔'], ['кабан', '🐗'], ['олень', '🦌'], ['тигр', '🐯'], ['лев', '🦁'], ['слон', '🐘'], ['жираф', '🦒'], ['зебра', '🦓']], vs: ['pet', 'bird', 'fish', 'insect', 'furniture', 'tr_land', 'toy'] },
    { id: 'pet', one: 'домашнее животное', many: 'домашние животные', items: [['корова', '🐄'], ['коза', '🐐'], ['овца', '🐑'], ['лошадь', '🐴'], ['свинья', '🐷'], ['собака', '🐶'], ['кошка', '🐱']], vs: ['wild', 'bird', 'fish', 'insect', 'furniture', 'fruit', 'veg'] },
    { id: 'bird', one: 'птица', many: 'птицы', items: [['воробей'], ['ворона'], ['синица'], ['голубь', '🕊️'], ['сова', '🦉'], ['орёл', '🦅'], ['дятел'], ['ласточка'], ['сорока'], ['попугай', '🦜'], ['пингвин', '🐧'], ['фламинго', '🦩'], ['павлин', '🦚'], ['утка', '🦆'], ['лебедь', '🦢']], vs: ['wild', 'pet', 'fish', 'insect', 'flower', 'tree'] },
    { id: 'fish', one: 'рыба', many: 'рыбы', items: [['щука', '🐟'], ['окунь', '🐠'], ['акула', '🦈'], ['ёрш', '🐡'], ['карась'], ['сом'], ['карп'], ['сельдь']], vs: ['bird', 'wild', 'pet', 'insect', 'veg'] },
    { id: 'insect', one: 'насекомое', many: 'насекомые', items: [['бабочка', '🦋'], ['пчела', '🐝'], ['муравей', '🐜'], ['жук', '🪲'], ['божья коровка', '🐞'], ['комар', '🦟'], ['кузнечик', '🦗'], ['муха'], ['стрекоза']], vs: ['bird', 'fish', 'pet', 'wild', 'flower'] },
    { id: 'furniture', one: 'мебель', many: 'мебель', items: [['стул', '🪑'], ['диван', '🛋️'], ['кровать', '🛏️'], ['стол'], ['шкаф'], ['полка'], ['кресло'], ['табурет']], vs: ['dish', 'clothes', 'fruit', 'toy', 'tool', 'school', 'tr_land'] },
    { id: 'dish', one: 'посуда', many: 'посуда', items: [['тарелка', '🍽️'], ['ложка', '🥄'], ['чайник', '🫖'], ['сковорода', '🍳'], ['нож', '🔪'], ['чашка', '☕'], ['вилка'], ['кастрюля'], ['кружка'], ['блюдце']], vs: ['furniture', 'clothes', 'fruit', 'veg', 'toy', 'tool', 'school'] },
    { id: 'clothes', one: 'одежда', many: 'одежда', items: [['платье', '👗'], ['рубашка', '👔'], ['брюки', '👖'], ['куртка', '🧥'], ['футболка', '👕'], ['носки', '🧦'], ['шарф', '🧣'], ['варежки', '🧤'], ['юбка'], ['свитер']], vs: ['shoes', 'hat', 'furniture', 'dish', 'toy', 'school', 'fruit'] },
    { id: 'shoes', one: 'обувь', many: 'обувь', items: [['сапоги', '👢'], ['туфли', '👠'], ['кроссовки', '👟'], ['ботинки', '🥾'], ['тапочки', '🩴'], ['сандалии', '👡'], ['валенки']], vs: ['clothes', 'hat', 'furniture', 'dish', 'toy'] },
    { id: 'hat', one: 'головной убор', many: 'головные уборы', items: [['кепка', '🧢'], ['шляпа', '👒'], ['каска', '⛑️'], ['корона', '👑'], ['цилиндр', '🎩'], ['шапка'], ['панама'], ['берет'], ['платок']], vs: ['clothes', 'shoes', 'furniture', 'dish', 'toy'] },
    { id: 'tr_land', one: 'наземный транспорт', many: 'наземный транспорт', items: [['машина', '🚗'], ['автобус', '🚌'], ['поезд', '🚆'], ['трамвай', '🚋'], ['велосипед', '🚲'], ['грузовик', '🚚'], ['мотоцикл', '🏍️'], ['такси', '🚕'], ['троллейбус', '🚎']], vs: ['tr_water', 'tr_air', 'wild', 'furniture', 'pet'] },
    { id: 'tr_water', one: 'водный транспорт', many: 'водный транспорт', items: [['корабль', '🚢'], ['лодка', '🛶'], ['катер', '🚤'], ['парусник', '⛵'], ['пароход', '🛳️'], ['плот'], ['подводная лодка']], vs: ['tr_land', 'tr_air', 'furniture', 'wild'] },
    { id: 'tr_air', one: 'воздушный транспорт', many: 'воздушный транспорт', items: [['самолёт', '✈️'], ['вертолёт', '🚁'], ['ракета', '🚀'], ['воздушный шар', '🎈'], ['дирижабль'], ['планёр']], vs: ['tr_land', 'tr_water', 'furniture', 'pet'] },
    { id: 'school', one: 'школьная принадлежность', many: 'школьные принадлежности', items: [['ручка', '🖊️'], ['карандаш', '✏️'], ['тетрадь', '📓'], ['учебник', '📘'], ['линейка', '📏'], ['портфель', '🎒'], ['кисточка', '🖌️'], ['ножницы', '✂️'], ['ластик'], ['пенал']], vs: ['toy', 'furniture', 'dish', 'clothes', 'fruit', 'tool'] },
    { id: 'toy', one: 'игрушка', many: 'игрушки', items: [['кукла', '🪆'], ['мяч', '⚽'], ['мишка', '🧸'], ['кубики', '🎲'], ['пазл', '🧩'], ['воздушный змей', '🪁'], ['юла'], ['скакалка'], ['погремушка']], vs: ['school', 'furniture', 'dish', 'fruit', 'veg', 'tool', 'clothes'] },
    { id: 'tool', one: 'инструмент', many: 'инструменты', items: [['молоток', '🔨'], ['пила', '🪚'], ['топор', '🪓'], ['отвёртка', '🪛'], ['гаечный ключ', '🔧'], ['клещи'], ['рубанок'], ['дрель']], vs: ['school', 'toy', 'dish', 'furniture', 'music', 'veg'] },
    { id: 'music', one: 'музыкальный инструмент', many: 'музыкальные инструменты', items: [['гитара', '🎸'], ['скрипка', '🎻'], ['барабан', '🥁'], ['пианино', '🎹'], ['труба', '🎺'], ['саксофон', '🎷'], ['аккордеон', '🪗'], ['флейта'], ['балалайка']], vs: ['tool', 'toy', 'school', 'furniture', 'sport'] },
    { id: 'prof', one: 'профессия', many: 'профессии', items: [['врач'], ['учитель'], ['повар'], ['шофёр'], ['строитель'], ['пожарный'], ['лётчик'], ['продавец'], ['художник'], ['парикмахер']], vs: ['wild', 'pet', 'furniture', 'dish', 'fruit'] },
    { id: 'flower', one: 'цветок', many: 'цветы', items: [['роза', '🌹'], ['тюльпан', '🌷'], ['ромашка', '🌼'], ['подсолнух', '🌻'], ['колокольчик'], ['василёк'], ['ландыш'], ['гвоздика'], ['одуванчик']], vs: ['tree', 'mushroom', 'berry', 'insect', 'bird', 'veg'] },
    { id: 'tree', one: 'дерево', many: 'деревья', items: [['ель', '🌲'], ['пальма', '🌴'], ['берёза'], ['дуб'], ['сосна'], ['клён'], ['тополь'], ['осина'], ['рябина'], ['липа']], vs: ['flower', 'mushroom', 'berry', 'veg', 'bird'] },
    { id: 'mushroom', one: 'гриб', many: 'грибы', items: [['мухомор', '🍄'], ['белый гриб'], ['лисичка'], ['подосиновик'], ['опёнок'], ['сыроежка'], ['груздь'], ['маслёнок']], vs: ['flower', 'tree', 'berry', 'veg', 'fruit'] },
    { id: 'season', one: 'время года', many: 'времена года', items: [['зима', '❄️'], ['весна', '🌱'], ['лето', '☀️'], ['осень', '🍂']], vs: ['month', 'day', 'color'] },
    { id: 'month', one: 'месяц', many: 'месяцы', items: MONTHS.map(m => [m]), vs: ['season', 'day', 'color'] },
    { id: 'day', one: 'день недели', many: 'дни недели', items: DAYS.map(d => [d]), vs: ['season', 'month', 'color'] },
    { id: 'color', one: 'цвет', many: 'цвета', items: [['красный', '🔴'], ['синий', '🔵'], ['зелёный', '🟢'], ['жёлтый', '🟡'], ['оранжевый', '🟠'], ['фиолетовый', '🟣'], ['белый', '⚪'], ['чёрный', '⚫'], ['коричневый', '🟤']], vs: ['season', 'day', 'month', 'fruit', 'shape'] },
    { id: 'shape', one: 'фигура', many: 'геометрические фигуры', items: [['круг', '⭕'], ['треугольник', '🔺'], ['квадрат', '🔲'], ['ромб', '🔶'], ['звезда', '⭐'], ['прямоугольник'], ['овал'], ['пятиугольник']], vs: ['season', 'month', 'day', 'fruit', 'pet'] },
    { id: 'sweet', one: 'сладость', many: 'сладости', items: [['конфета', '🍬'], ['леденец', '🍭'], ['торт', '🎂'], ['печенье', '🍪'], ['шоколад', '🍫'], ['пирожное', '🧁'], ['мороженое', '🍦'], ['пончик', '🍩'], ['зефир'], ['мармелад']], vs: ['fruit', 'veg', 'drink', 'dish', 'toy', 'tool'] },
    { id: 'drink', one: 'напиток', many: 'напитки', items: [['чай', '🍵'], ['сок', '🧃'], ['молоко', '🥛'], ['лимонад', '🥤'], ['компот'], ['какао'], ['кефир'], ['вода']], vs: ['sweet', 'fruit', 'veg', 'furniture'] },
    { id: 'body', one: 'часть тела', many: 'части тела', items: [['нос', '👃'], ['нога', '🦵'], ['ухо', '👂'], ['глаз', '👁️'], ['рот', '👄'], ['рука', '✋'], ['палец'], ['голова'], ['колено'], ['спина']], vs: ['room', 'furniture', 'clothes', 'dish', 'fruit'] },
    { id: 'room', one: 'комната', many: 'комнаты', items: [['кухня'], ['спальня'], ['ванная'], ['прихожая'], ['гостиная'], ['детская'], ['кладовка'], ['балкон']], vs: ['body', 'furniture', 'clothes', 'tr_land', 'fruit'] },
    { id: 'planet', one: 'планета', many: 'планеты', items: [['Земля', '🌍'], ['Сатурн', '🪐'], ['Марс'], ['Венера'], ['Юпитер'], ['Меркурий'], ['Нептун'], ['Уран']], vs: ['country', 'city', 'color', 'day'] },
    { id: 'country', one: 'страна', many: 'страны', items: [['Россия'], ['Франция'], ['Италия'], ['Китай'], ['Япония'], ['Германия'], ['Испания'], ['Египет'], ['Индия'], ['Англия']], vs: ['city', 'planet', 'day', 'month'] },
    { id: 'city', one: 'город', many: 'города', items: [['Москва'], ['Париж'], ['Лондон'], ['Рим'], ['Берлин'], ['Петербург'], ['Казань'], ['Сочи']], vs: ['country', 'planet', 'day', 'month'] },
    { id: 'sport', one: 'вид спорта', many: 'виды спорта', items: [['футбол', '⚽'], ['хоккей', '🏒'], ['баскетбол', '🏀'], ['теннис', '🎾'], ['плавание', '🏊'], ['бокс', '🥊'], ['волейбол', '🏐'], ['лыжи', '🎿'], ['шахматы', '♟️'], ['бег', '🏃']], vs: ['music', 'school', 'prof', 'tool'] }
  ];
  const CAT_BY_ID = {}; CATS.forEach(c => { CAT_BY_ID[c.id] = c; });
  const withEmo = c => c.items.filter(it => it[1]);
  const GROUP_LABEL_OK = ['fruit', 'veg', 'berry', 'wild', 'pet', 'bird', 'fish', 'insect', 'furniture', 'dish', 'clothes', 'shoes', 'hat', 'school', 'toy', 'tool', 'music', 'prof', 'flower', 'tree', 'mushroom', 'sweet', 'drink', 'body', 'room', 'planet', 'country', 'city', 'sport', 'color', 'month', 'day', 'season', 'shape'];

  /** Основная группа + «чужой» элемент. n — сколько своих. emoOnly — только с эмодзи. */
  function oddSet(n, emoOnly) {
    for (let guard = 0; guard < 30; guard++) {
      const cat = U.pick(CATS);
      const pool = emoOnly ? withEmo(cat) : cat.items;
      if (pool.length < n) continue;
      const oddCats = cat.vs.map(id => CAT_BY_ID[id]).filter(c => c && (emoOnly ? withEmo(c).length : c.items.length));
      if (!oddCats.length) continue;
      const oddCat = U.pick(oddCats);
      const main = U.pickN(pool, n);
      const odd = U.pick(emoOnly ? withEmo(oddCat) : oddCat.items);
      const all = U.shuffle(main.concat([odd]));
      if (U.uniq(all.map(x => x[0])).length !== n + 1) continue;
      if (emoOnly && U.uniq(all.map(x => x[1])).length !== n + 1) continue;
      return { cat, oddCat, main, odd, all };
    }
    return null;
  }

  // банки для «тонких признаков» (уровень 3)
  const SYL = { 1: ['кот', 'дом', 'сыр', 'лук', 'мак', 'сон', 'нос', 'лес', 'мяч', 'дуб', 'мост', 'стол', 'слон', 'кит', 'лев', 'шар'],
    2: ['мама', 'папа', 'рука', 'нога', 'книга', 'лиса', 'роза', 'зима', 'окно', 'каша', 'вода', 'сова', 'коза', 'лужа', 'небо', 'море', 'парта', 'сумка'],
    3: ['собака', 'корова', 'машина', 'молоко', 'ворона', 'сорока', 'малина', 'дорога', 'бумага', 'работа', 'лопата', 'полоса', 'сапоги', 'комната'] };
  const LEGS = { 2: ['воробей', 'курица', 'голубь', 'гусь', 'ворона', 'пингвин', 'страус', 'петух', 'утка'],
    4: ['кошка', 'собака', 'лошадь', 'корова', 'коза', 'лиса', 'волк', 'заяц', 'слон', 'тигр'],
    6: ['жук', 'муха', 'пчела', 'муравей', 'бабочка', 'комар', 'стрекоза', 'кузнечик'], 8: ['паук'] };
  const EDIBLE = ['яблоко', 'хлеб', 'сыр', 'каша', 'суп', 'груша', 'морковь', 'котлета', 'пирог', 'банан', 'блин', 'сосиска'];
  const NONEDIBLE = ['камень', 'стол', 'мяч', 'книга', 'кубик', 'ложка', 'стул', 'карандаш', 'ботинок', 'кирпич', 'зонт', 'молоток'];
  const FIRST = { а: ['арбуз', 'аист', 'ананас', 'автобус', 'акула'], б: ['банан', 'белка', 'бабочка', 'барабан', 'булка'], в: ['волк', 'ваза', 'ворона', 'вишня', 'весна'], г: ['гриб', 'гусь', 'груша', 'гора', 'гитара'],
    д: ['дом', 'дятел', 'дыня', 'дерево', 'дождь'], е: ['ель', 'енот', 'ежевика', 'еда'], ж: ['жук', 'жираф', 'жёлудь', 'журнал'], з: ['заяц', 'зонт', 'звезда', 'зебра', 'замок'], и: ['игла', 'индюк', 'ирис', 'игрушка'],
    к: ['кот', 'кит', 'книга', 'кукла', 'капуста'], л: ['лиса', 'лук', 'лимон', 'ложка', 'лампа'], м: ['мак', 'мышь', 'малина', 'машина', 'мяч'], н: ['нос', 'носок', 'нитка', 'небо', 'нора'],
    о: ['окно', 'ослик', 'облако', 'огурец', 'орех'], п: ['пила', 'петух', 'помидор', 'парта', 'пирог'], р: ['рак', 'рыба', 'роза', 'ручка', 'ракета'], с: ['сом', 'слон', 'сыр', 'сова', 'сумка'],
    т: ['тигр', 'торт', 'туча', 'тарелка', 'топор'], у: ['утка', 'улитка', 'ухо', 'улица', 'утюг'], ф: ['флаг', 'фонарь', 'филин', 'фартук'], х: ['хлеб', 'хомяк', 'халат', 'хвост'], ц: ['цапля', 'цветок', 'цирк', 'цыплёнок'],
    ч: ['чай', 'чашка', 'черепаха', 'часы'], ш: ['шар', 'шуба', 'шапка', 'школа'], щ: ['щука', 'щенок', 'щётка'], э: ['экран', 'эскимо', 'этаж'], ю: ['юла', 'юбка', 'юнга'], я: ['яблоко', 'якорь', 'ягода', 'ящик'] };

  function genOdd(level) {
    if (level === 1) {
      const kind = N(1, 3);
      if (kind === 1) {
        const s = oddSet(3, true); if (!s) return genOdd(level);
        return { type: 'choice', big: true, prompt: 'Три картинки из одной группы, а одна — из другой. Какая <b>лишняя</b>?', visual: V.cards(s.all.map(x => [x[1], x[0]])),
          options: s.all.map(x => x[1]), answer: s.odd[1], hint: 'Подумай, как одним словом назвать три картинки: ' + s.cat.many,
          explain: U.cap(s.odd[0]) + ' — ' + s.oddCat.one + ', а остальные — ' + s.cat.many + '.' };
      }
      if (kind === 2) {
        const s = oddSet(3, false); if (!s) return genOdd(level);
        const emo = s.all.every(x => x[1]) ? V.big(s.all.map(x => x[1]).join(' ')) : undefined;
        return { type: 'choice', prompt: 'Какое слово <b>лишнее</b>?', visual: emo, options: s.all.map(x => x[0]), answer: s.odd[0],
          hint: 'Три слова — это ' + s.cat.many + ', а одно — нет', explain: U.cap(s.odd[0]) + ' — ' + s.oddCat.one + ', а остальные — ' + s.cat.many + '.' };
      }
      const cat = U.pick(CATS.filter(c => GROUP_LABEL_OK.includes(c.id) && c.items.length >= 3));
      const items = U.pickN(cat.items, 3);
      const dis = U.pickN(CATS.filter(c => c.id !== cat.id && c.many !== cat.many), 2).map(c => c.many);
      return { type: 'choice', prompt: 'Как назвать одним словом: <b>' + items.map(x => x[0]).join(', ') + '</b>?', visual: items.every(x => x[1]) ? V.big(items.map(x => x[1]).join(' ')) : undefined,
        options: U.opts(cat.many, dis), answer: cat.many, hint: 'Что общего у всех трёх?', explain: items.map(x => U.cap(x[0])).join(', ') + ' — это ' + cat.many + '.' };
    }
    if (level === 2) {
      const kind = N(1, 4);
      if (kind === 1) {
        const s = oddSet(3, false); if (!s) return genOdd(level);
        return { type: 'choice', prompt: 'Какое слово <b>лишнее</b>?<br><b>' + s.all.map(x => x[0]).join(', ') + '</b>', options: s.all.map(x => x[0]), answer: s.odd[0],
          hint: 'Назови группу для трёх слов', explain: U.cap(s.odd[0]) + ' — ' + s.oddCat.one + ', а остальные — ' + s.cat.many + '.' };
      }
      if (kind === 2) {
        const s = oddSet(3, false); if (!s) return genOdd(level);
        const third = U.pick(CATS.filter(c => c.id !== s.cat.id && c.id !== s.oddCat.id && c.one !== s.oddCat.one && c.one !== s.cat.one));
        const good = U.cap(s.odd[0]) + ' — ' + s.oddCat.one + ', а остальные — ' + s.cat.many;
        const bad1 = U.cap(s.odd[0]) + ' — ' + s.cat.one + ', а остальные — ' + s.oddCat.many;
        const bad2 = U.cap(s.odd[0]) + ' — ' + third.one + ', а остальные — ' + s.cat.many;
        const bad3 = U.cap(s.odd[0]) + ' — самое длинное слово';
        return { type: 'choice', prompt: '<b>' + s.all.map(x => x[0]).join(', ') + '</b>.<br>Лишнее слово — «' + s.odd[0] + '». <b>Почему?</b>', options: U.opts(good, [bad1, bad2, bad3]), answer: good,
          hint: 'К какой группе относятся три слова, а к какой — четвёртое?', explain: good + '.' };
      }
      if (kind === 3) {
        const cats = U.pickN(CATS.filter(c => GROUP_LABEL_OK.includes(c.id)), 4);
        if (U.uniq(cats.map(c => c.many)).length < 4) return genOdd(level);
        const pairs = cats.map(c => [U.pick(c.items)[0], c.many]);
        return { type: 'match', prompt: 'Соедини слово и его группу', pairs, explain: pairs.map(p => U.cap(p[0]) + ' — ' + p[1]).join('; ') + '.' };
      }
      const cat = U.pick(CATS.filter(c => GROUP_LABEL_OK.includes(c.id) && c.items.length >= 4));
      const items = U.pickN(cat.items, 4);
      const dis = U.pickN(CATS.filter(c => c.id !== cat.id && c.many !== cat.many), 3).map(c => c.many);
      return { type: 'choice', prompt: 'Как назвать одним словом: <b>' + items.map(x => x[0]).join(', ') + '</b>?',
        options: U.opts(cat.many, dis), answer: cat.many, explain: 'Всё это — ' + cat.many + '.' };
    }
    // уровень 3
    const kind = N(1, 7);
    if (kind === 1) {
      const s = oddSet(U.pick([4, 5]), false); if (!s) return genOdd(level);
      return { type: 'choice', prompt: 'Какое слово <b>лишнее</b>?<br><b>' + s.all.map(x => x[0]).join(', ') + '</b>', options: s.all.map(x => x[0]), answer: s.odd[0],
        explain: U.cap(s.odd[0]) + ' — ' + s.oddCat.one + ', а остальные — ' + s.cat.many + '.' };
    }
    if (kind === 2) {
      const k = U.pick([1, 2, 3]); const other = U.pickOther([1, 2, 3], k);
      const main = U.pickN(SYL[k], 4), odd = U.pick(SYL[other]);
      const all = U.shuffle(main.concat([odd]));
      const f = ['слог', 'слога', 'слогов'], per = { 1: 'одному слогу', 2: 'два слога', 3: 'три слога' };
      return { type: 'choice', prompt: 'Одно слово отличается <b>числом слогов</b>. Какое?<br><b>' + all.join(', ') + '</b>', options: all, answer: odd,
        hint: 'Сколько гласных — столько и слогов', explain: 'В слове «' + odd + '» ' + U.count(other, f) + ', а в остальных — по ' + per[k] + '.' };
    }
    if (kind === 3) {
      const letters = Object.keys(FIRST).filter(l => FIRST[l].length >= 4);
      const L = U.pick(letters); const other = U.pickOther(letters, L);
      const main = U.pickN(FIRST[L], 4), odd = U.pick(FIRST[other]);
      const all = U.shuffle(main.concat([odd]));
      return { type: 'choice', prompt: 'Какое слово начинается <b>с другой буквы</b>?<br><b>' + all.join(', ') + '</b>', options: all, answer: odd,
        explain: '«' + U.cap(odd) + '» начинается с буквы ' + other.toUpperCase() + ', а остальные — с буквы ' + L.toUpperCase() + '.' };
    }
    if (kind === 4) {
      const g = U.pick([2, 4, 6]); const others = [2, 4, 6, 8].filter(x => x !== g && (x !== 8 || g === 6));
      const og = U.pick(others);
      const main = U.pickN(LEGS[g], 4), odd = U.pick(LEGS[og]);
      const all = U.shuffle(main.concat([odd]));
      const f = ['нога', 'ноги', 'ног'];
      return { type: 'choice', prompt: 'У кого <b>не столько ног</b>, сколько у остальных?<br><b>' + all.join(', ') + '</b>', options: all, answer: odd,
        hint: 'У птиц 2 ноги, у зверей 4, у насекомых 6, у паука 8', explain: 'У ' + (og === 8 ? 'паука' : 'этого животного') + ' ' + U.count(og, f) + ', а у остальных — по ' + g + '.' };
    }
    if (kind === 5) {
      const evenMain = U.chance(0.5);
      const pool = U.range(1, 30).filter(x => (x % 2 === 0) === evenMain), oddPool = U.range(1, 30).filter(x => (x % 2 === 0) !== evenMain);
      const main = U.pickN(pool, 4), odd = U.pick(oddPool);
      const all = U.shuffle(main.concat([odd])).map(String);
      return { type: 'choice', prompt: 'Одно число <b>лишнее</b>. Подсказка: подумай про чётные и нечётные.<br><b>' + all.join(', ') + '</b>', options: all, answer: String(odd),
        hint: 'Чётные числа оканчиваются на 0, 2, 4, 6, 8', explain: 'Число ' + odd + ' ' + (evenMain ? 'нечётное' : 'чётное') + ', а остальные — ' + (evenMain ? 'чётные' : 'нечётные') + '.' };
    }
    if (kind === 6) {
      const edibleMain = U.chance(0.5);
      const main = U.pickN(edibleMain ? EDIBLE : NONEDIBLE, 4), odd = U.pick(edibleMain ? NONEDIBLE : EDIBLE);
      const all = U.shuffle(main.concat([odd]));
      return { type: 'choice', prompt: 'Что здесь <b>лишнее</b>? Подумай, что можно съесть, а что нельзя.<br><b>' + all.join(', ') + '</b>', options: all, answer: odd,
        explain: U.cap(odd) + ' — ' + (edibleMain ? 'это нельзя есть, а остальное съедобное' : 'это еда, а остальное есть нельзя') + '.' };
    }
    const s = oddSet(3, false); if (!s) return genOdd(level);
    const a = U.pickN(s.cat.items, U.pick([3, 4])).map(x => x[0]), b = U.pickN(s.oddCat.items, 3).map(x => x[0]);
    if (a.some(x => b.includes(x))) return genOdd(level);
    return { type: 'sort', prompt: 'Разложи слова по группам', groups: [{ name: U.cap(s.cat.many), items: a }, { name: U.cap(s.oddCat.many), items: b }],
      explain: U.cap(s.cat.many) + ': ' + a.join(', ') + '. ' + U.cap(s.oddCat.many) + ': ' + b.join(', ') + '.' };
  }

  /* =====================================================================
     3. Закономерности (узоры из эмодзи, буквы, матрицы)
     ===================================================================== */
  const PAT_POOL = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⭐', '🌙', '🍎', '🍌', '🍇', '🐱', '🐶', '🐭', '🌸', '🌻', '⚽', '🎈', '🔺', '🔷', '🍓', '🐸'];
  const TPL = { ABAB: [0, 1], AABB: [0, 0, 1, 1], ABC: [0, 1, 2], ABBA: [0, 1, 1, 0], ABCC: [0, 1, 2, 2], AAB: [0, 0, 1], ABB: [0, 1, 1] };
  const COLORS = { '🔴': ['красный', 'красных'], '🔵': ['синий', 'синих'], '🟢': ['зелёный', 'зелёных'], '🟡': ['жёлтый', 'жёлтых'] };
  const ALPHA_CLEAN = 'КЛМНОПРСТУФХЦЧШЩ'.split('');
  const ALPHA_START = 'АБВГДЕ'.split('');
  function makePattern(tplName, len, pool) {
    const tpl = TPL[tplName];
    const k = Math.max.apply(null, tpl) + 1;
    const syms = U.pickN(pool || PAT_POOL, k);
    const seq = U.range(0, len - 1).map(i => syms[tpl[i % tpl.length]]);
    return { syms, seq, tpl, name: tplName };
  }
  const tplWords = p => p.tpl.map(i => p.syms[i]).join('');

  function genPatterns(level) {
    if (level === 1) {
      const kind = N(1, 3);
      const p = makePattern(U.pick(['ABAB', 'AABB', 'ABC']), 7);
      if (kind <= 2) {
        const shown = p.seq.slice(0, 6), ans = p.seq[6];
        return { type: 'choice', big: true, prompt: 'Что будет <b>дальше</b>?<br>' + shown.join('') + ' ?', visual: V.big(shown.join('') + ' ❓'), options: U.shuffle(p.syms), answer: ans,
          hint: 'Узор повторяется: ' + tplWords(p) + ' ' + tplWords(p) + '…', explain: 'Узор повторяется кусочками «' + tplWords(p) + '», значит дальше ' + ans + '.' };
      }
      const idx = N(2, 4), ans = p.seq[idx];
      const shown = p.seq.map((s, i) => i === idx ? '❓' : s);
      return { type: 'choice', big: true, prompt: 'Какой картинки <b>не хватает</b> в середине?<br>' + shown.join(''), visual: V.big(shown.join('')), options: U.shuffle(p.syms), answer: ans,
        hint: 'Посмотри, как повторяется узор до пропуска', explain: 'Узор повторяется: «' + tplWords(p) + '». На месте ❓ должно быть ' + ans + '.' };
    }
    if (level === 2) {
      const kind = N(1, 5);
      if (kind === 1) {
        const p = makePattern(U.pick(['ABBA', 'ABCC', 'AAB', 'ABB', 'AABB']), 9);
        const shown = p.seq.slice(0, 8), ans = p.seq[8];
        const dis = p.syms.filter(s => s !== ans); const extra = U.pickOther(PAT_POOL, p.syms);
        return { type: 'choice', big: true, prompt: 'Что будет <b>дальше</b>?<br>' + shown.join('') + ' ?', visual: V.big(shown.join('') + ' ❓'), options: U.opts(ans, dis.concat([extra])), answer: ans,
          hint: 'Найди повторяющийся кусочек', explain: 'Повторяется «' + tplWords(p) + '», значит дальше ' + ans + '.' };
      }
      if (kind === 2) {
        const p = makePattern(U.pick(['ABAB', 'ABC', 'AAB', 'ABB']), 8);
        const shown = p.seq.slice(0, 6), a1 = p.seq[6], a2 = p.seq[7];
        const good = a1 + a2;
        const others = U.uniq([a2 + a1, a1 + a1, a2 + a2, p.syms[p.syms.length - 1] + p.syms[0]]).filter(x => x !== good);
        return { type: 'choice', big: true, prompt: 'Какие <b>две</b> картинки продолжат ряд?<br>' + shown.join('') + ' ??', visual: V.big(shown.join('') + ' ❓❓'), options: U.opts(good, others.slice(0, 3)), answer: good,
          hint: 'Повторяющийся кусочек: ' + tplWords(p), explain: 'Узор «' + tplWords(p) + '» продолжается так: ' + a1 + a2 + '.' };
      }
      if (kind === 3) {
        const t = N(1, 3);
        if (t === 1) {
          const src = U.chance(0.4) ? ALPHA_START : ALPHA_CLEAN; const i = N(0, src.length - 5);
          const shown = src.slice(i, i + 4), ans = src[i + 4];
          const dis = [src[i + 5], src[i + 3], src[(i + 7) % src.length]].filter(x => x && x !== ans);
          return { type: 'choice', prompt: 'Буквы идут по алфавиту. Какая следующая?<br><b>' + shown.join(', ') + ', ?</b>', visual: V.big(shown.join(', ') + ', ?'), options: U.opts(ans, dis), answer: ans,
            hint: 'Вспомни алфавит: какая буква идёт после ' + shown[3] + '?', explain: 'По алфавиту после ' + shown[3] + ' идёт ' + ans + '.' };
        }
        if (t === 2) {
          const i = N(0, 9); const shown = [ALPHA_CLEAN[i], ALPHA_CLEAN[i + 2], ALPHA_CLEAN[i + 4]], ans = ALPHA_CLEAN[i + 6];
          return { type: 'choice', prompt: 'Буквы идут <b>через одну</b>. Какая следующая?<br><b>' + shown.join(', ') + ', ?</b>', visual: V.big(shown.join(', ') + ', ?'),
            options: U.opts(ans, [ALPHA_CLEAN[i + 5], ALPHA_CLEAN[i + 7], ALPHA_CLEAN[i + 3]]), answer: ans,
            hint: 'Между буквами ряда пропущена одна буква алфавита', explain: 'Между ' + shown[2] + ' и ' + ans + ' пропущена буква ' + ALPHA_CLEAN[i + 5] + ': ' + shown.join(', ') + ', ' + ans + '.' };
        }
        const src = U.chance(0.5) ? ALPHA_START : ALPHA_CLEAN; const i = N(0, src.length - 5);
        const seq = src.slice(i, i + 5).map((L, j) => j % 2 === 0 ? L.toLowerCase() : L);
        const shown = seq.slice(0, 4), ans = seq[4]; const up = ans.toUpperCase(), nextL = src[i + 5] || src[0];
        return { type: 'choice', prompt: 'Продолжи ряд букв. Смотри и на букву, и на её размер!<br><b>' + shown.join(', ') + ', ?</b>', visual: V.big(shown.join(', ') + ', ?'),
          options: U.opts(ans, [up, nextL.toLowerCase(), nextL]), answer: ans,
          hint: 'Маленькая, большая, маленькая, большая…', explain: 'Буквы идут по алфавиту и чередуются: строчная, заглавная. Следующая — строчная ' + ans + '.' };
      }
      if (kind === 4) {
        const syms = U.pickN(PAT_POOL, 3);
        const rows = U.shuffle([[0, 1, 2], [1, 2, 0], [2, 0, 1]]);
        const colOrder = U.shuffle([0, 1, 2]);
        const g = rows.map(r => colOrder.map(c => syms[r[c]]));
        const r = N(0, 2), c = N(0, 2); const ans = g[r][c];
        const shown = g.map((row, i) => row.map((v, j) => i === r && j === c ? '?' : v));
        return { type: 'choice', big: true, prompt: 'В каждой строке и каждом столбце все три картинки <b>разные</b>. Какой не хватает (строка ' + (r + 1) + ')?', visual: V.grid(shown),
          options: U.shuffle(syms), answer: ans, hint: 'Каких картинок ещё нет в этой строке?', explain: 'В строке ' + (r + 1) + ' уже есть ' + shown[r].filter(x => x !== '?').join(' и ') + ', не хватает ' + ans + '.' };
      }
      const items = U.pickN(PAT_POOL, 4);
      return { type: 'order', prompt: 'Запомни узор и повтори его: расставь картинки в том же порядке', visual: V.big(items.join(' ')), items, explain: 'Порядок: ' + items.join(' ') + '.' };
    }
    // уровень 3
    const kind = N(1, 6);
    if (kind === 1) {
      const p = makePattern(U.pick(['ABAB', 'AABB', 'AAB', 'ABB']), 9, Object.keys(COLORS));
      const A = p.syms[0], B = p.syms[1];
      const descr = { ABAB: A + ' и ' + B + ' по очереди', AABB: 'два ' + COLORS[A][1] + ', два ' + COLORS[B][1], AAB: 'два ' + COLORS[A][1] + ', один ' + COLORS[B][0], ABB: 'один ' + COLORS[A][0] + ', два ' + COLORS[B][1] };
      const good = descr[p.name];
      const dis = Object.keys(descr).filter(k => k !== p.name).map(k => descr[k]);
      return { type: 'choice', prompt: 'По какому <b>правилу</b> составлен ряд?<br>' + p.seq.join(''), visual: V.big(p.seq.join('')), options: U.opts(good, dis), answer: good,
        hint: 'Посчитай, сколько кружков подряд одного цвета', explain: 'Ряд повторяет кусочек «' + tplWords(p) + '»: ' + good + '.' };
    }
    if (kind === 2) {
      const p = makePattern(U.pick(['ABBA', 'ABCC', 'ABC', 'AABB']), 10);
      const shown = p.seq.slice(0, 7), a1 = p.seq[7], a2 = p.seq[8], a3 = p.seq[9];
      const good = a1 + a2 + a3;
      const s = p.syms;
      const cand = U.uniq([a2 + a1 + a3, a1 + a1 + a2, a3 + a2 + a1, s[0] + s[0] + s[0], a2 + a3 + a1, s[s.length - 1] + s[0] + s[0]]).filter(x => x !== good);
      return { type: 'choice', big: true, prompt: 'Какие <b>три</b> картинки продолжат ряд?<br>' + shown.join('') + ' ???', visual: V.big(shown.join('') + ' ❓❓❓'), options: U.opts(good, U.pickN(cand, 3)), answer: good,
        hint: 'Кусочек узора: ' + tplWords(p), explain: 'Узор «' + tplWords(p) + '» продолжается так: ' + good + '.' };
    }
    if (kind === 3) {
      const t = N(1, 2);
      if (t === 1) {
        const i = N(0, 9); const shown = [ALPHA_CLEAN[i], ALPHA_CLEAN[i + 2], ALPHA_CLEAN[i + 4]], ans = ALPHA_CLEAN[i + 6];
        return { type: 'input', mode: 'text', prompt: 'Буквы идут через одну. Напиши следующую букву:<br><b>' + shown.join(', ') + ', ?</b>', visual: V.big(shown.join(', ') + ', ?'), answer: [ans, ans.toLowerCase()],
          hint: 'Между буквами ряда пропущена одна буква алфавита', explain: 'После ' + shown[2] + ' пропускаем ' + ALPHA_CLEAN[i + 5] + ' и получаем ' + ans + '.' };
      }
      const i = N(0, 8); const seq = [ALPHA_CLEAN[i + 7], ALPHA_CLEAN[i + 5], ALPHA_CLEAN[i + 3], ALPHA_CLEAN[i + 1]];
      const shown = seq.slice(0, 3), ans = seq[3];
      return { type: 'input', mode: 'text', prompt: 'Буквы идут <b>в обратную сторону</b> через одну. Напиши следующую:<br><b>' + shown.join(', ') + ', ?</b>', visual: V.big(shown.join(', ') + ', ?'), answer: [ans, ans.toLowerCase()],
        hint: 'Алфавит наоборот: ' + ALPHA_CLEAN.slice(i, i + 8).reverse().join(' '), explain: 'Идём по алфавиту назад через одну букву: ' + shown.join(', ') + ', ' + ans + '.' };
    }
    if (kind === 4) {
      const syms = U.pickN(PAT_POOL, 3);
      const rows = U.shuffle([[0, 1, 2], [1, 2, 0], [2, 0, 1]]);
      const colOrder = U.shuffle([0, 1, 2]);
      const g = rows.map(r => colOrder.map(c => syms[r[c]]));
      const r = N(0, 2), c = N(0, 2); const ans = g[r][c];
      let r2, c2; do { r2 = N(0, 2); c2 = N(0, 2); } while (r2 === r || c2 === c);
      const shown = g.map((row, i) => row.map((v, j) => (i === r && j === c) ? '?' : (i === r2 && j === c2) ? '' : v));
      return { type: 'choice', big: true, prompt: 'В каждой строке и каждом столбце все три картинки разные. Что стоит на месте <b>?</b> (строка ' + (r + 1) + ', столбец ' + (c + 1) + ')?', visual: V.grid(shown),
        options: U.shuffle(syms), answer: ans, hint: 'Смотри и на строку, и на столбец со знаком ?', explain: 'В строке ' + (r + 1) + ' и столбце ' + (c + 1) + ' не хватает именно ' + ans + '.' };
    }
    if (kind === 5) {
      const items = U.pickN(PAT_POOL, U.pick([5, 6]));
      return { type: 'order', prompt: 'Запомни узор и повтори его: расставь картинки в том же порядке', visual: V.big(items.join(' ')), items, explain: 'Порядок: ' + items.join(' ') + '.' };
    }
    const e = U.pick(PAT_POOL); const n0 = N(1, 3);
    const items = U.range(n0, n0 + 3).map(k => e.repeat(k));
    return { type: 'order', prompt: 'Расставь ряды от <b>короткого</b> к <b>длинному</b>', items, hint: 'Считай картинки в каждом ряду', explain: 'Каждый следующий ряд длиннее на одну картинку: ' + U.range(n0, n0 + 3).join(', ') + '.' };
  }

  /* =====================================================================
     4. Внимание
     ===================================================================== */
  const WORDS_L = ['молоко', 'корова', 'сорока', 'ворона', 'колобок', 'хорошо', 'облако', 'золото', 'болото', 'воробей', 'банан', 'ананас', 'барабан', 'карандаш', 'сарафан',
    'самовар', 'какао', 'пирамида', 'тарелка', 'кукуруза', 'шоколад', 'лягушка', 'апельсин', 'велосипед', 'телевизор', 'крокодил', 'помидор', 'бегемот', 'попугай', 'мороженое', 'сковорода'];
  const PHRASES = ['мама мыла раму', 'у осы усы', 'на дворе трава', 'папа купил арбуз', 'кошка спит на окошке', 'рыбак ловит рыбу', 'около кола колокола', 'у Вики новая книга',
    'белка ест орехи', 'на горе растут дубы', 'сорока сидит на заборе', 'в саду поспели сливы', 'по дороге едет машина', 'молоко налили в кружку'];
  const HIDDEN = [['победа', 'беда'], ['коса', 'оса'], ['хлев', 'лев'], ['удочка', 'дочка'], ['экран', 'кран'], ['шутка', 'утка'], ['рыбак', 'рыба'], ['гроза', 'роза'], ['столб', 'стол'],
    ['машина', 'шина'], ['дорога', 'рога'], ['укол', 'кол'], ['крот', 'рот'], ['щель', 'ель'], ['зубр', 'зуб'], ['волк', 'вол'], ['уточка', 'точка'], ['бусы', 'усы'], ['столица', 'лица'],
    ['каприз', 'приз'], ['смех', 'мех'], ['плуг', 'луг'], ['лесник', 'лес'], ['семья', 'семь'], ['опушка', 'пушка'], ['кустарник', 'куст'], ['гвоздика', 'гвозди'], ['черёмуха', 'муха'], ['пирожок', 'рожок'], ['баранка', 'баран']];
  const VOW = 'аеёиоуыэюя';
  const ORD = ['первое', 'второе', 'третье', 'четвёртое', 'пятое', 'шестое'];
  const DIFF_WORDS = ['мама', 'папа', 'кошка', 'школа', 'книга', 'лето', 'зима', 'рука', 'дом', 'сон', 'мяч', 'парта', 'вода', 'снег', 'окно', 'сова', 'лиса', 'роза', 'стол', 'нос'];
  const SHOP = [['фрукты', ['🍎 яблоки', '🍌 бананы', '🍐 груши', '🍊 апельсины', '🍇 виноград']], ['овощи', ['🥕 морковь', '🥒 огурцы', '🍅 помидоры', '🥔 картошка', '🧅 лук']],
    ['сладости', ['🍬 конфеты', '🍪 печенье', '🍫 шоколад', '🎂 торт', '🍭 леденцы']], ['напитки', ['🧃 сок', '🍵 чай', '🥤 лимонад', '☕ кофе']], ['молочные продукты', ['🥛 молоко', '🧀 сыр', '🧈 масло', '🍦 мороженое']],
    ['канцтовары', ['✏️ карандаши', '📓 тетради', '🖊️ ручки', '📏 линейки']], ['игрушки', ['🧸 мишка', '⚽ мяч', '🪆 кукла', '🧩 пазл']]];
  const SENTENCES = ['Вика читает интересную книгу', 'Кошка спит на тёплом окне', 'Мама испекла вкусный пирог', 'Дети играют во дворе', 'Осенью листья желтеют и падают', 'Петя быстро бежит домой',
    'На столе лежат три красных яблока', 'Зимой мы катаемся на санках с горки', 'Птицы улетают на юг', 'Папа купил хлеб и молоко'];
  const countIn = (text, ch) => text.toLowerCase().split('').filter(x => x === ch).length;
  const changeLetter = w => { const i = N(0, w.length - 1); const alt = U.pickOther('абвгдеиклмнопрстуяы'.split(''), w[i]); return w.slice(0, i) + alt + w.slice(i + 1); };

  function countTask(level) {
    const kinds = U.pickN(EMO, level === 1 ? 3 : 4);
    const target = kinds[0];
    const total = level === 1 ? N(10, 14) : level === 2 ? N(16, 22) : N(24, 30);
    const cnt = level === 1 ? N(2, 5) : N(3, 8);
    const arr = [];
    for (let i = 0; i < cnt; i++) arr.push(target);
    while (arr.length < total) arr.push(U.pick(kinds.slice(1)));
    const row = U.shuffle(arr);
    const base = { prompt: 'Сколько раз здесь встречается <b>' + target + '</b>?', visual: emojiRow(row), hint: 'Считай по порядку, не пропускай ряды', explain: 'Здесь ' + cnt + ' ' + target + '.' };
    if (level === 1) return Object.assign({ type: 'choice', options: U.numOpts(cnt, 2, 1, 9), answer: String(cnt) }, base);
    return Object.assign({ type: 'input', mode: 'num', answer: cnt }, base);
  }
  function changedTask(level) {
    const n = level === 1 ? N(4, 5) : level === 2 ? N(5, 6) : N(6, 7);
    const row1 = U.pickN(EMO, n + 1); const fresh = row1.pop();
    const idx = N(0, n - 1); const gone = row1[idx];
    if (level === 3 && U.chance(0.5)) {
      const row2 = U.shuffle(row1.map((e, i) => i === idx ? fresh : e));
      return { type: 'choice', big: true, prompt: 'Сравни два ряда. Какая картинка <b>появилась</b> во втором ряду?', visual: twoRows('Было:', row1, 'Стало:', row2),
        options: U.opts(fresh, U.pickN(row1.filter(e => e !== gone), 3)), answer: fresh, hint: 'Ищи картинку, которой нет в первом ряду', explain: 'Во втором ряду появилась ' + fresh + ' — вместо ' + gone + '.' };
    }
    const row2 = row1.filter((e, i) => i !== idx); const shown2 = level === 1 ? row2 : U.shuffle(row2);
    return { type: 'choice', big: true, prompt: 'Сравни два ряда. Какой картинки <b>не стало</b>?', visual: twoRows('Было:', row1, 'Стало:', shown2),
      options: U.opts(gone, U.pickN(row2, level === 1 ? 2 : 3)), answer: gone, hint: 'Проверяй картинки первого ряда по одной', explain: 'Пропала ' + gone + '.' };
  }
  function shopTask(level) {
    const [g1, g2] = U.pickN(SHOP, 2);
    if (g1[1].some(x => g2[1].includes(x))) return shopTask(level);
    const main = U.pickN(g1[1], level === 1 ? 3 : 4), odd = U.pick(g2[1]);
    const list = U.shuffle(main.concat([odd]));
    return { type: 'choice', prompt: 'Мама попросила купить <b>только ' + g1[0] + '</b>. Что в списке лишнее?', visual: V.text('<p>' + list.join('<br>') + '</p>'),
      options: list, answer: odd, hint: 'Проверь каждую строчку: это ' + g1[0] + '?', explain: U.cap(odd.replace(/^\S+\s/, '')) + ' — это ' + g2[0] + ', а не ' + g1[0] + '.' };
  }

  function genAttention(level) {
    if (level === 1) {
      const kind = N(1, 4);
      if (kind === 1) return countTask(1);
      if (kind === 2) {
        const w = U.pick(DIFF_WORDS); const bad = changeLetter(w); const n = N(4, 5); const pos = N(0, n - 1);
        const row = U.range(0, n - 1).map(i => i === pos ? bad : w);
        return { type: 'choice', prompt: 'Одно слово написано <b>иначе</b>. Какое?', visual: V.big(row.join('&nbsp;&nbsp; ')), options: U.shuffle([w, bad]), answer: bad,
          hint: 'Сравнивай слова по буквам', explain: 'Слово «' + bad + '» отличается от слова «' + w + '».' };
      }
      if (kind === 3) return changedTask(1);
      return shopTask(1);
    }
    if (level === 2) {
      const kind = N(1, 7);
      if (kind === 1) return countTask(2);
      if (kind === 2) {
        const w = U.pick(WORDS_L); const letters = U.uniq(w.split('')).filter(ch => countIn(w, ch) >= 1 && ch !== 'ё');
        const ch = U.pick(letters); const cnt = countIn(w, ch);
        return { type: 'input', mode: 'num', prompt: 'Сколько раз буква «<b>' + ch + '</b>» встречается в слове «<b>' + w + '</b>»?', visual: V.big(w), answer: cnt,
          hint: 'Читай слово по буквам и считай', explain: 'В слове «' + w + '» буква ' + ch + ' встречается ' + U.count(cnt, ['раз', 'раза', 'раз']) + '.' };
      }
      if (kind === 3) {
        const w = U.pick(DIFF_WORDS); const bad = changeLetter(w); const n = N(4, 6); const pos = N(0, n - 1);
        const row = U.range(0, n - 1).map(i => i === pos ? bad : w);
        return { type: 'choice', prompt: 'Одно слово написано иначе. <b>Какое по счёту</b>?', visual: V.big(row.join('&nbsp;&nbsp; ')), options: ORD.slice(0, n), answer: ORD[pos],
          hint: 'Считай слова слева направо', explain: U.cap(ORD[pos]) + ' слово — «' + bad + '», остальные — «' + w + '».' };
      }
      if (kind === 4) {
        const h = U.pick(HIDDEN); const dis = U.pickN(HIDDEN.filter(x => x !== h && !h[0].includes(x[1])).map(x => x[1]), 3);
        return { type: 'choice', prompt: 'Какое слово <b>спряталось</b> в слове «<b>' + h[0] + '</b>»?', visual: V.big(h[0]), options: U.opts(h[1], dis), answer: h[1],
          hint: 'Закрой первые буквы и прочитай, что осталось', explain: 'В слове «' + h[0] + '» спряталось слово «' + h[1] + '».' };
      }
      if (kind === 5) {
        const w = U.pick(WORDS_L.concat(DIFF_WORDS)); const vs = w.split('').filter(ch => VOW.includes(ch));
        return { type: 'input', mode: 'num', prompt: 'Сколько <b>гласных</b> букв в слове «<b>' + w + '</b>»?', visual: V.big(w), answer: vs.length,
          hint: 'Гласные: а, о, у, ы, э, я, ё, ю, и, е', explain: 'Гласные в слове «' + w + '»: ' + vs.join(', ') + ' — всего ' + vs.length + '.' };
      }
      if (kind === 6) return changedTask(2);
      return shopTask(2);
    }
    const kind = N(1, 8);
    if (kind === 1) return countTask(3);
    if (kind === 2) {
      const ph = U.pick(PHRASES); const letters = U.uniq(ph.toLowerCase().replace(/\s/g, '').split('')).filter(ch => countIn(ph, ch) >= 2);
      const ch = U.pick(letters); const cnt = countIn(ph, ch);
      return { type: 'input', mode: 'num', prompt: 'Сколько раз буква «<b>' + ch + '</b>» встречается во фразе?', visual: V.big(ph), answer: cnt,
        hint: 'Проверь каждое слово отдельно, потом сложи', explain: 'Во фразе «' + ph + '» буква ' + ch + ' встречается ' + U.count(cnt, ['раз', 'раза', 'раз']) + '.' };
    }
    if (kind === 3) {
      const kinds = U.pickN(EMO, 4); const c1 = N(2, 6), c2 = N(2, 6); const arr = [];
      for (let i = 0; i < c1; i++) arr.push(kinds[0]); for (let i = 0; i < c2; i++) arr.push(kinds[1]);
      while (arr.length < N(22, 28)) arr.push(U.pick(kinds.slice(2)));
      return { type: 'input', mode: 'num', prompt: 'Сколько здесь <b>всего</b> ' + kinds[0] + ' и ' + kinds[1] + ' вместе?', visual: emojiRow(U.shuffle(arr)), answer: c1 + c2,
        hint: 'Сначала посчитай ' + kinds[0] + ', потом ' + kinds[1] + ', потом сложи', explain: kinds[0] + ' — ' + c1 + ', ' + kinds[1] + ' — ' + c2 + ', вместе ' + (c1 + c2) + '.' };
    }
    if (kind === 4) {
      const h = U.pick(HIDDEN.filter(x => x[0].length >= 6)); const dis = U.pickN(HIDDEN.filter(x => x !== h && !h[0].includes(x[1])).map(x => x[1]), 4);
      return { type: 'choice', prompt: 'Какое слово спряталось в слове «<b>' + h[0] + '</b>»?', options: U.opts(h[1], dis), answer: h[1],
        explain: 'В слове «' + h[0] + '» спряталось слово «' + h[1] + '».' };
    }
    if (kind === 5) {
      const w = U.pick(WORDS_L.filter(x => x.length >= 7)); const vs = w.split('').filter(ch => VOW.includes(ch)); const cons = w.length - vs.length;
      const askV = U.chance(0.5);
      return { type: 'input', mode: 'num', prompt: 'Сколько <b>' + (askV ? 'гласных' : 'согласных') + '</b> букв в слове «<b>' + w + '</b>»?', visual: V.big(w), answer: askV ? vs.length : cons,
        hint: 'Гласные: а, о, у, ы, э, я, ё, ю, и, е. Остальные буквы — согласные', explain: 'В слове «' + w + '» ' + w.length + ' букв: гласных ' + vs.length + ' (' + vs.join(', ') + '), согласных ' + cons + '.' };
    }
    if (kind === 6) return changedTask(3);
    if (kind === 7) {
      const s = U.pick(SENTENCES); const n = s.split(' ').length;
      return { type: 'input', mode: 'num', prompt: 'Сколько <b>слов</b> в предложении?', visual: V.big(s), answer: n, hint: 'Слова разделены пробелами', explain: 'В предложении «' + s + '» ' + U.count(n, ['слово', 'слова', 'слов']) + '.' };
    }
    return shopTask(3);
  }

  /* =====================================================================
     5. Судоку и сетки
     ===================================================================== */
  const transpose = g => g[0].map((_, i) => g.map(r => r[i]));
  const rotate = g => g[0].map((_, i) => g.map(r => r[i]).reverse());
  function makeSudoku() {
    const base = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]];
    const rowOrder = U.shuffle([U.shuffle([0, 1]), U.shuffle([2, 3])]).reduce((a, b) => a.concat(b), []);
    const colOrder = U.shuffle([U.shuffle([0, 1]), U.shuffle([2, 3])]).reduce((a, b) => a.concat(b), []);
    const digits = U.shuffle([1, 2, 3, 4]);
    let g = rowOrder.map(r => colOrder.map(c => digits[base[r][c] - 1]));
    if (U.chance(0.5)) g = transpose(g);
    return g;
  }
  const blockOf = (r, c) => Math.floor(r / 2) * 2 + Math.floor(c / 2);
  const SUDOKU_RULE = 'Судоку 4×4: в каждой строке, каждом столбце и каждом квадрате 2×2 ';
  function sudokuTask(level, emo) {
    const g = makeSudoku();
    const syms = emo ? U.pickN(EMO, 4) : ['1', '2', '3', '4'];
    const r = N(0, 3), c = N(0, 3);
    let r2 = -1, c2 = -1;
    if (level >= 2) { do { r2 = N(0, 3); c2 = N(0, 3); } while (r2 === r || c2 === c || blockOf(r2, c2) === blockOf(r, c)); }
    const shown = g.map((row, i) => row.map((v, j) => (i === r && j === c) ? '?' : (i === r2 && j === c2) ? '' : syms[v - 1]));
    const ans = syms[g[r][c] - 1];
    const rowHas = shown[r].filter(x => x !== '?' && x !== '');
    return { type: 'choice', big: !!emo, prompt: SUDOKU_RULE + (emo ? 'каждая картинка встречается' : 'числа 1, 2, 3, 4 встречаются') + ' по одному разу. ' + (emo ? 'Какая картинка' : 'Какое число') + ' вместо <b>?</b> (строка ' + (r + 1) + ', столбец ' + (c + 1) + ')?',
      visual: V.grid(shown), options: emo ? U.shuffle(syms) : syms, answer: ans, hint: (emo ? 'Каких картинок' : 'Какого числа') + ' нет в строке ' + (r + 1) + '?',
      explain: 'В строке ' + (r + 1) + ' уже есть ' + rowHas.join(', ') + (rowHas.length === 3 ? '' : ', а в столбце ' + (c + 1) + ' — ' + shown.map(row => row[c]).filter(x => x !== '?' && x !== '').join(', ')) + '. Значит, вместо ? — ' + ans + '.' };
  }
  function sumTable(level) {
    const [e1, e2] = U.pickN(['🍎', '🍐', '🍌', '🍓', '🍬', '🌰', '🎈', '⭐'], 2);
    const [k1, k2] = U.pickN(GIRLS.concat(BOYS), 2);
    const mx = level === 2 ? 9 : 15;
    const a = N(1, mx), b = N(1, mx), c = N(1, mx), d = N(1, mx);
    const cells = [[1, 1, a, 'Сколько ' + e1 + ' у ' + k1 + '?', (a + b) + ' − ' + b + ' = ' + a], [1, 2, b, 'Сколько ' + e2 + ' у ' + k1 + '?', (a + b) + ' − ' + a + ' = ' + b],
      [2, 1, c, 'Сколько ' + e1 + ' у ' + k2 + '?', (c + d) + ' − ' + d + ' = ' + c], [2, 2, d, 'Сколько ' + e2 + ' у ' + k2 + '?', (c + d) + ' − ' + c + ' = ' + d],
      [1, 3, a + b, 'Сколько всего у ' + k1 + '?', a + ' + ' + b + ' = ' + (a + b)], [2, 3, c + d, 'Сколько всего у ' + k2 + '?', c + ' + ' + d + ' = ' + (c + d)],
      [3, 1, a + c, 'Сколько всего ' + e1 + '?', a + ' + ' + c + ' = ' + (a + c)], [3, 2, b + d, 'Сколько всего ' + e2 + '?', b + ' + ' + d + ' = ' + (b + d)]];
    const cell = U.pick(level === 2 ? cells.slice(0, 4) : cells);
    const grid = [['', e1, e2, 'всего'], [k1, a, b, a + b], [k2, c, d, c + d], ['всего', a + c, b + d, a + b + c + d]];
    grid[cell[0]][cell[1]] = '?';
    const base = { prompt: 'В таблице справа и снизу — суммы. ' + cell[3] + ' (вместо <b>?</b>)', visual: V.grid(grid), hint: 'Найди строку или столбец, где известна сумма и одно слагаемое', explain: cell[4] + '.' };
    if (level === 2) return Object.assign({ type: 'choice', options: U.numOpts(cell[2], 3, 1, 20), answer: String(cell[2]) }, base);
    return Object.assign({ type: 'input', mode: 'num', answer: cell[2] }, base);
  }

  function genSudoku(level) {
    if (level === 1) {
      const kind = N(1, 3);
      if (kind === 1) return sudokuTask(1, false);
      if (kind === 2) {
        const row = U.shuffle([1, 2, 3, 4]); const i = N(0, 3); const ans = row[i];
        const shown = row.map((v, j) => j === i ? '?' : String(v));
        return { type: 'choice', prompt: 'В строке должны быть числа 1, 2, 3, 4 — каждое по одному разу. Какого не хватает?', visual: V.grid([shown]), options: ['1', '2', '3', '4'], answer: String(ans),
          hint: 'Проверь по порядку: есть 1? есть 2?…', explain: 'В строке есть ' + shown.filter(x => x !== '?').join(', ') + ', не хватает ' + ans + '.' };
      }
      const syms = U.pickN(EMO, 4); const row = U.shuffle(syms); const i = N(0, 3); const ans = row[i];
      const shown = row.map((v, j) => j === i ? '?' : v);
      return { type: 'choice', big: true, prompt: 'В строке должны быть все четыре картинки — каждая по одному разу. Какой не хватает?', visual: V.grid([shown]) + V.cards(syms.map(s => [s])), options: U.shuffle(syms), answer: ans,
        hint: 'Сравни строку с набором картинок ниже', explain: 'В строке есть ' + shown.filter(x => x !== '?').join(' ') + ', не хватает ' + ans + '.' };
    }
    if (level === 2) {
      const kind = N(1, 3);
      if (kind === 1) return sudokuTask(2, false);
      if (kind === 2) return sudokuTask(1, true);
      return sumTable(2);
    }
    const kind = N(1, 4);
    if (kind === 1) return sudokuTask(3, true);
    if (kind === 2) {
      let g = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];
      const k = N(0, 3); for (let i = 0; i < k; i++) g = rotate(g);
      if (U.chance(0.5)) g = transpose(g);
      const r = N(0, 2), c = N(0, 2); const ans = g[r][c];
      const shown = g.map((row, i) => row.map((v, j) => (i === r && j === c) ? '?' : v));
      const known = shown[r].filter(x => x !== '?');
      return { type: 'input', mode: 'num', prompt: 'Магический квадрат: сумма чисел в каждой строке, каждом столбце и по диагоналям равна <b>15</b>. Какое число вместо <b>?</b> (строка ' + (r + 1) + ')?', visual: V.grid(shown), answer: ans,
        hint: 'В строке ' + (r + 1) + ' известны два числа. Сколько не хватает до 15?', explain: known.join(' + ') + ' = ' + (known[0] + known[1]) + ', 15 − ' + (known[0] + known[1]) + ' = ' + ans + '.' };
    }
    if (kind === 3) return sumTable(3);
    const a = N(1, 9), b = N(1, 9), c = N(1, 9); const m1 = a + b, m2 = b + c, top = m1 + m2;
    const cells = [['top', top, m1 + ' + ' + m2 + ' = ' + top], ['m1', m1, a + ' + ' + b + ' = ' + m1], ['m2', m2, b + ' + ' + c + ' = ' + m2],
      ['a', a, m1 + ' − ' + b + ' = ' + a], ['b', b, m1 + ' − ' + a + ' = ' + b], ['c', c, m2 + ' − ' + b + ' = ' + c]];
    const cell = U.pick(cells);
    const q = name => cell[0] === name ? '?' : ({ top, m1, m2, a, b, c })[name];
    const grid = [['', '', q('top'), '', ''], ['', q('m1'), '', q('m2'), ''], [q('a'), '', q('b'), '', q('c')]];
    return { type: 'input', mode: 'num', prompt: 'Числовая пирамида: каждое число равно <b>сумме двух чисел под ним</b>. Какое число вместо <b>?</b>', visual: V.grid(grid), answer: cell[1],
      hint: cell[0] === 'top' || cell[0] === 'm1' || cell[0] === 'm2' ? 'Сложи два числа под знаком ?' : 'Из числа сверху вычти известного соседа', explain: cell[2] + '.' };
  }

  /* =====================================================================
     6. Слова и буквы
     ===================================================================== */
  const ANA1 = [['кот', '🐱'], ['дом', '🏠'], ['сыр', '🧀'], ['рыба', '🐟'], ['лиса', '🦊'], ['мяч', '⚽'], ['зонт', '☂️'], ['лук', '🧅'], ['слон', '🐘'], ['гриб', '🍄'], ['кит', '🐳'], ['утка', '🦆'],
    ['роза', '🌹'], ['торт', '🎂'], ['мост', '🌉'], ['ключ', '🔑'], ['часы', '⌚'], ['лимон', '🍋'], ['книга', '📚'], ['заяц', '🐰'], ['волк', '🐺'], ['коза', '🐐'], ['пила', '🪚'], ['луна', '🌙'],
    ['сова', '🦉'], ['арбуз', '🍉'], ['банан', '🍌'], ['мышь', '🐭'], ['жук', '🪲'], ['шар', '🎈'], ['дуб', '🌳'], ['мак', '🌺']];
  const ANA2 = [['яблоко', '🍎'], ['морковь', '🥕'], ['собака', '🐶'], ['корова', '🐄'], ['машина', '🚗'], ['ракета', '🚀'], ['бабочка', '🦋'], ['пингвин', '🐧'], ['медведь', '🐻'], ['лошадь', '🐴'],
    ['кролик', '🐇'], ['гитара', '🎸'], ['облако', '☁️'], ['радуга', '🌈'], ['вишня', '🍒'], ['груша', '🍐'], ['ананас', '🍍'], ['персик', '🍑'], ['огурец', '🥒'], ['помидор', '🍅'], ['капуста', '🥬'],
    ['звезда', '⭐'], ['солнце', '☀️'], ['цветок', '🌸'], ['дерево', '🌳'], ['корабль', '🚢'], ['автобус', '🚌'], ['телефон', '📱'], ['подарок', '🎁'], ['лягушка', '🐸'], ['улитка', '🐌'],
    ['курица', '🐔'], ['дельфин', '🐬'], ['барабан', '🥁'], ['клубника', '🍓']];
  const ANA3 = [['черепаха', '🐢'], ['обезьяна', '🐵'], ['крокодил', '🐊'], ['динозавр', '🦕'], ['мороженое', '🍦'], ['велосипед', '🚲'], ['клубника', '🍓'], ['бабочка', '🦋'], ['карандаш', '✏️'],
    ['апельсин', '🍊'], ['помидор', '🍅'], ['кукуруза', '🌽'], ['носорог', '🦏'], ['светофор', '🚦'], ['снеговик', '⛄'], ['телевизор', '📺'], ['компьютер', '💻'], ['самокат', '🛴'], ['баклажан', '🍆'],
    ['попугай', '🦜'], ['кенгуру', '🦘'], ['шоколад', '🍫'], ['пингвин', '🐧'], ['фламинго', '🦩'], ['корзина', '🧺'], ['лестница', '🪜'], ['ножницы', '✂️'], ['вертолет', '🚁'], ['медуза', '🪼']];
  const REV_PAIRS = [['нос', 'сон'], ['сон', 'нос'], ['кот', 'ток'], ['ток', 'кот'], ['лом', 'мол'], ['мол', 'лом'], ['дар', 'рад'], ['рад', 'дар'], ['лес', 'сел'], ['сел', 'лес'], ['куб', 'бук'], ['бук', 'куб'],
    ['вол', 'лов'], ['лов', 'вол'], ['зал', 'лаз'], ['лаз', 'зал'], ['год', 'дог'], ['дог', 'год'], ['ров', 'вор'], ['вор', 'ров'], ['раб', 'бар'], ['бар', 'раб'], ['лей', 'йел'.slice(0, 0) || 'йел']].filter(p => p[1] !== 'йел');
  const REV_ANY = ['рука', 'зима', 'лиса', 'нога', 'парта', 'книга', 'сумка', 'окно', 'мост', 'стол', 'волк', 'слон', 'кино', 'море', 'лето', 'небо'];
  const PAL = ['шалаш', 'казак', 'топот', 'довод', 'потоп', 'заказ', 'комок', 'дед', 'поп', 'боб', 'кок', 'тот', 'око', 'радар', 'ротор', 'мадам', 'анна'];
  const NONPAL = ['школа', 'ручка', 'котик', 'лапа', 'сова', 'дом', 'мама', 'папа', 'дядя', 'нос', 'кот', 'лес', 'парта', 'каша', 'сок', 'мак', 'лук', 'рак', 'сом', 'зима', 'окно'];
  const isPal = w => w === w.split('').reverse().join('');
  const CHAIN = [['кот', 'о', 'и', 'кит'], ['кит', 'и', 'о', 'кот'], ['дом', 'д', 'с', 'сом'], ['дом', 'д', 'к', 'ком'], ['дом', 'д', 'т', 'том'], ['мак', 'м', 'р', 'рак'], ['мак', 'м', 'л', 'лак'], ['мак', 'м', 'б', 'бак'],
    ['лук', 'л', 'ж', 'жук'], ['лук', 'л', 'с', 'сук'], ['сон', 'с', 'т', 'тон'], ['роза', 'р', 'к', 'коза'], ['коза', 'к', 'л', 'лоза'], ['лиса', 'с', 'п', 'липа'], ['мышка', 'ы', 'и', 'мишка'], ['мишка', 'м', 'ш', 'шишка'],
    ['булка', 'у', 'е', 'белка'], ['кошка', 'о', 'а', 'кашка'], ['точка', 'т', 'д', 'дочка'], ['точка', 'т', 'б', 'бочка'], ['точка', 'т', 'к', 'кочка'], ['точка', 'т', 'н', 'ночка'], ['бочка', 'б', 'п', 'почка'],
    ['галка', 'г', 'п', 'палка'], ['палка', 'п', 'б', 'балка'], ['ручка', 'р', 'т', 'тучка'], ['тучка', 'т', 'к', 'кучка'], ['лапа', 'л', 'п', 'папа'], ['зуб', 'з', 'д', 'дуб'], ['дуб', 'д', 'з', 'зуб'], ['лес', 'л', 'в', 'вес'],
    ['день', 'д', 'п', 'пень'], ['пень', 'п', 'т', 'тень'], ['тень', 'т', 'л', 'лень'], ['кора', 'к', 'н', 'нора'], ['нора', 'н', 'г', 'гора'], ['гора', 'г', 'к', 'кора'], ['коса', 'к', 'р', 'роса'], ['роса', 'р', 'к', 'коса'],
    ['сок', 'с', 'б', 'бок'], ['сок', 'о', 'у', 'сук'], ['сом', 'о', 'а', 'сам'], ['ваза', 'в', 'ф', 'фаза'], ['рама', 'р', 'м', 'мама'], ['мука', 'м', 'р', 'рука'], ['рука', 'р', 'м', 'мука'], ['рука', 'р', 'щ', 'щука'],
    ['щука', 'щ', 'р', 'рука'], ['пила', 'п', 'с', 'сила'], ['сила', 'с', 'п', 'пила']].filter(c => c[0].split(c[1]).length === 2 && c[0].replace(c[1], c[2]) === c[3]);
  const REBUS = [['ПАР', 'УС', 'парус'], ['БАР', 'СУК', 'барсук'], ['ВОЛ', 'ОСЫ', 'волосы'], ['ПАР', 'АД', 'парад'], ['БАЛ', 'КОН', 'балкон'], ['ГОР', 'ОД', 'город'], ['ПОЛ', 'ОСА', 'полоса'], ['ПОЛ', 'Е', 'поле'],
    ['КАР', 'ТИНА', 'картина'], ['КАР', 'ТА', 'карта'], ['МАК', 'УШКА', 'макушка'], ['РЫБ', 'АК', 'рыбак'], ['ПЕ', 'СОК', 'песок'], ['КО', 'СЫ', 'косы'], ['О', 'СЕНЬ', 'осень'], ['БА', 'РАН', 'баран'], ['КО', 'РОВА', 'корова'],
    ['ВО', 'РОНА', 'ворона'], ['СО', 'РОКА', 'сорока'], ['МО', 'РОЗ', 'мороз'], ['ПИ', 'РОГ', 'пирог'], ['СТО', 'ЛИЦА', 'столица'], ['ГИ', 'ТАРА', 'гитара'], ['ЛА', 'СТОЧКА', 'ласточка'], ['КОР', 'ЗИНА', 'корзина']];
  const T3 = ['кот', 'дом', 'сом', 'нос', 'мак', 'лук', 'рак', 'сон', 'лес', 'зуб', 'кит', 'рот', 'шар', 'бак', 'дар', 'мир', 'пар', 'суп', 'ток', 'лак'];
  const T45 = ['рука', 'лиса', 'роза', 'коза', 'зима', 'нора', 'гора', 'мост', 'стол', 'слон', 'стул', 'волк', 'лист', 'шарф', 'парк', 'утка', 'сова', 'мука', 'пила', 'нога', 'луна'];
  const LETTERS = 'абвгдежзиклмнопрстуфхцчшщэюя'.split('');
  const firstWords = target => target.split('').map(ch => U.cap(U.pick(FIRST[ch])));
  const permsNot = (w, ans, n) => { const out = new Set(); let guard = 0; while (out.size < n && guard < 200) { guard++; const p = U.shuffle(w.split('')).join(''); if (p !== ans && p !== w) out.add(p); } return [...out]; };

  function genWords(level) {
    if (level === 1) {
      const kind = N(1, 6);
      if (kind <= 2) { const w = U.pick(ANA1); return { type: 'spell', prompt: 'Собери слово из букв: ' + w[1], word: w[0], hint: 'Это ' + w[0].length + ' буквы, начинается на «' + w[0][0].toUpperCase() + '»', explain: 'Это слово — «' + w[0] + '».' }; }
      if (kind === 3) {
        const p = U.pick(REV_PAIRS);
        return { type: 'choice', prompt: 'Прочитай слово «<b>' + p[0] + '</b>» <b>наоборот</b> — справа налево. Что получится?', visual: V.big(p[0]), options: U.opts(p[1], permsNot(p[0], p[1], 2)), answer: p[1],
          hint: 'Читай буквы с конца: ' + p[0].split('').reverse().join(', '), explain: '«' + p[0] + '» наоборот — «' + p[1] + '».' };
      }
      if (kind === 4) {
        const pal = U.pick(PAL); const dis = U.pickN(NONPAL.filter(w => !isPal(w)), 2);
        return { type: 'choice', prompt: 'Какое слово читается <b>одинаково</b> слева направо и справа налево?', options: U.opts(pal, dis), answer: pal,
          hint: 'Прочитай каждое слово задом наперёд', explain: '«' + pal + '» наоборот — тоже «' + pal + '». Такие слова называют перевёртышами.' };
      }
      if (kind === 5) {
        const c = U.pick(CHAIN); const other = c[0].replace(c[1], U.pickOther(LETTERS, [c[1], c[2]]));
        return { type: 'choice', prompt: 'В слове «<b>' + c[0] + '</b>» замени букву «<b>' + c[1] + '</b>» на «<b>' + c[2] + '</b>». Какое слово получится?', visual: V.big(c[0] + ' → ?'),
          options: U.opts(c[3], [c[0], other]), answer: c[3], hint: 'Найди букву ' + c[1] + ' и поставь на её место ' + c[2], explain: c[0] + ' → ' + c[3] + ': буква ' + c[1] + ' заменилась на ' + c[2] + '.' };
      }
      const r = U.pick(REBUS); const dis = U.pickN(REBUS.filter(x => x !== r).map(x => x[2]), 2);
      return { type: 'choice', prompt: 'Сложи два слова в одно: <b>' + r[0] + ' + ' + r[1] + '</b> = ?', visual: V.big(r[0] + ' + ' + r[1]), options: U.opts(r[2], dis), answer: r[2],
        hint: 'Прочитай слова подряд без паузы', explain: r[0] + ' + ' + r[1] + ' = ' + r[2].toUpperCase() + '.' };
    }
    if (level === 2) {
      const kind = N(1, 7);
      if (kind <= 2) { const w = U.pick(ANA2); return { type: 'spell', prompt: 'Собери слово из букв: ' + w[1], word: w[0], hint: 'В слове ' + w[0].length + ' букв, первая — «' + w[0][0].toUpperCase() + '»', explain: 'Это слово — «' + w[0] + '».' }; }
      if (kind === 3) {
        const p = U.pick(REV_PAIRS);
        return { type: 'input', mode: 'text', prompt: 'Напиши слово «<b>' + p[0] + '</b>» <b>наоборот</b> — так, чтобы получилось новое слово', visual: V.big(p[0]), answer: p[1],
          hint: 'Пиши буквы с конца к началу', explain: '«' + p[0] + '» наоборот — «' + p[1] + '».' };
      }
      if (kind === 4) {
        const pal = U.pick(PAL); const dis = U.pickN(NONPAL.filter(w => !isPal(w)), 3);
        return { type: 'choice', prompt: 'Найди слово-перевёртыш: оно читается одинаково в обе стороны', options: U.opts(pal, dis), answer: pal,
          hint: 'Прочитай каждое слово задом наперёд', explain: '«' + pal + '» — перевёртыш: наоборот читается так же.' };
      }
      if (kind === 5) {
        const c = U.pick(CHAIN); const letters = U.uniq(c[0].split(''));
        return { type: 'choice', prompt: 'Было слово «<b>' + c[0] + '</b>», стало «<b>' + c[3] + '</b>». <b>Какую букву</b> заменили?', visual: V.big(c[0] + ' → ' + c[3]), options: letters, answer: c[1],
          hint: 'Сравни слова буква за буквой', explain: 'В слове «' + c[0] + '» букву ' + c[1] + ' заменили на ' + c[2] + ' — получилось «' + c[3] + '».' };
      }
      if (kind === 6) {
        const r = U.pick(REBUS);
        return { type: 'input', mode: 'text', prompt: 'Сложи два слова в одно и напиши его: <b>' + r[0] + ' + ' + r[1] + '</b>', visual: V.big(r[0] + ' + ' + r[1]), answer: r[2],
          hint: 'Прочитай подряд: ' + r[0].toLowerCase() + r[1].toLowerCase(), explain: r[0] + ' + ' + r[1] + ' = ' + r[2].toUpperCase() + '.' };
      }
      const t = U.pick(T3); const ws = firstWords(t);
      return { type: 'input', mode: 'text', prompt: 'Возьми <b>первые буквы</b> слов и прочитай, что получилось: <b>' + ws.join(', ') + '</b>', visual: V.big(ws.join(' ')), answer: t,
        hint: 'Первые буквы: ' + ws.map(w => w[0]).join(', '), explain: 'Первые буквы ' + ws.map(w => w[0]).join(', ') + ' дают слово «' + t + '».' };
    }
    const kind = N(1, 7);
    if (kind <= 2) {
      const w = U.pick(ANA3); const extra = U.pickN(LETTERS.filter(l => !w[0].includes(l)), 2);
      return { type: 'spell', prompt: 'Собери слово: ' + w[1] + '. Осторожно, две буквы <b>лишние</b>!', word: w[0], extra, hint: 'В слове ' + w[0].length + ' букв, первая — «' + w[0][0].toUpperCase() + '»', explain: 'Это слово — «' + w[0] + '», лишние буквы: ' + extra.join(', ') + '.' };
    }
    if (kind === 3) {
      const w = U.pick(REV_ANY); const ans = w.split('').reverse().join('');
      return { type: 'input', mode: 'text', prompt: 'Напиши слово «<b>' + w + '</b>» задом наперёд (получится не настоящее слово — так и надо)', visual: V.big(w), answer: ans,
        hint: 'Последняя буква станет первой', explain: '«' + w + '» наоборот — «' + ans + '».' };
    }
    if (kind === 4) {
      const pals = U.pickN(PAL, 2), non = U.pickN(NONPAL.filter(w => !isPal(w)), 3);
      const opts = U.shuffle(pals.concat(non));
      return { type: 'choice', multi: true, prompt: 'Выбери <b>все</b> слова-перевёртыши (читаются одинаково в обе стороны)', options: opts, answer: pals,
        hint: 'Проверь каждое слово, прочитав его с конца', explain: 'Перевёртыши здесь: ' + pals.join(', ') + '.' };
    }
    if (kind === 5) {
      const c = U.pick(CHAIN);
      return { type: 'input', mode: 'text', prompt: 'В слове «<b>' + c[0] + '</b>» замени букву «<b>' + c[1] + '</b>» на «<b>' + c[2] + '</b>» и напиши новое слово', visual: V.big(c[0] + ' → ?'), answer: c[3],
        explain: c[0] + ' → ' + c[3] + '.' };
    }
    if (kind === 6) {
      const r = U.pick(REBUS.filter(x => x[2].length >= 5)); const w = r[2].toUpperCase(); const good = r[0] + ' + ' + r[1];
      const cut = r[0].length; const others = U.range(1, w.length - 1).filter(i => i !== cut).map(i => w.slice(0, i) + ' + ' + w.slice(i));
      return { type: 'choice', prompt: 'Из каких <b>двух слов</b> сложено слово «<b>' + w + '</b>»?', visual: V.big(w), options: U.opts(good, U.pickN(others, 3)), answer: good,
        hint: 'Обе части должны быть настоящими словами', explain: w + ' = ' + good + '.' };
    }
    const t = U.pick(T45); const ws = firstWords(t);
    return { type: 'input', mode: 'text', prompt: 'Возьми <b>первые буквы</b> слов и прочитай, что получилось: <b>' + ws.join(', ') + '</b>', visual: V.big(ws.join(' ')), answer: t,
      hint: 'Первые буквы: ' + ws.map(w => w[0]).join(', '), explain: 'Первые буквы ' + ws.map(w => w[0]).join(', ') + ' дают слово «' + t + '».' };
  }

  /* =====================================================================
     7. Логические задачи
     ===================================================================== */
  const NAMES = [
    { n: 'Вика', g: 'Вики', i: 'Викой', d: 'Вике', f: true }, { n: 'Катя', g: 'Кати', i: 'Катей', d: 'Кате', f: true }, { n: 'Маша', g: 'Маши', i: 'Машей', d: 'Маше', f: true },
    { n: 'Оля', g: 'Оли', i: 'Олей', d: 'Оле', f: true }, { n: 'Соня', g: 'Сони', i: 'Соней', d: 'Соне', f: true }, { n: 'Лиза', g: 'Лизы', i: 'Лизой', d: 'Лизе', f: true },
    { n: 'Аня', g: 'Ани', i: 'Аней', d: 'Ане', f: true }, { n: 'Даша', g: 'Даши', i: 'Дашей', d: 'Даше', f: true },
    { n: 'Петя', g: 'Пети', i: 'Петей', d: 'Пете', f: false }, { n: 'Миша', g: 'Миши', i: 'Мишей', d: 'Мише', f: false }, { n: 'Саша', g: 'Саши', i: 'Сашей', d: 'Саше', f: false },
    { n: 'Ваня', g: 'Вани', i: 'Ваней', d: 'Ване', f: false }, { n: 'Коля', g: 'Коли', i: 'Колей', d: 'Коле', f: false }, { n: 'Дима', g: 'Димы', i: 'Димой', d: 'Диме', f: false }, { n: 'Егор', g: 'Егора', i: 'Егором', d: 'Егору', f: false }];
  const NAMES_F = NAMES.filter(x => x.f), NAMES_M = NAMES.filter(x => !x.f);
  const RELS = [{ cmp: 'старше', opp: 'младше', top: ['самый старший', 'самая старшая'], bot: ['самый младший', 'самая младшая'] },
    { cmp: 'выше', opp: 'ниже', top: ['самый высокий', 'самая высокая'], bot: ['самый низкий', 'самая низкая'] },
    { cmp: 'быстрее', opp: 'медленнее', top: ['самый быстрый', 'самая быстрая'], bot: ['самый медленный', 'самая медленная'] },
    { cmp: 'тяжелее', opp: 'легче', top: ['самый тяжёлый', 'самая тяжёлая'], bot: ['самый лёгкий', 'самая лёгкая'] },
    { cmp: 'сильнее', opp: 'слабее', top: ['самый сильный', 'самая сильная'], bot: ['самый слабый', 'самая слабая'] }];
  const ANIMALS = [['кошка', 'кошек', 4, 'лап', 'лапы'], ['собака', 'собак', 4, 'лап', 'лапы'], ['корова', 'коров', 4, 'ног', 'ноги'], ['лошадь', 'лошадей', 4, 'ног', 'ноги'], ['заяц', 'зайцев', 4, 'лап', 'лапы'],
    ['курица', 'куриц', 2, 'ног', 'ноги'], ['воробей', 'воробьёв', 2, 'лапки', 'лапки'], ['утка', 'уток', 2, 'лапы', 'лапы'], ['жук', 'жуков', 6, 'ног', 'ног'], ['паук', 'пауков', 8, 'ног', 'ног']];
  const PARTS = [['ушей', 'уха', 2, ['кошек', 'зайцев', 'собак', 'коров']], ['хвостов', 'хвост', 1, ['кошек', 'собак', 'лисиц', 'коров']], ['рогов', 'рога', 2, ['коров', 'коз', 'оленей', 'баранов']],
    ['крыльев', 'крыла', 2, ['птиц', 'воробьёв', 'уток', 'ворон']], ['глаз', 'глаза', 2, ['кошек', 'детей', 'собак', 'зайцев']]];
  const HOLD = ['мяч', 'книгу', 'шарик', 'яблоко', 'флажок', 'куклу', 'зонтик'];
  const BALLS = ['красный', 'синий', 'зелёный', 'жёлтый'];
  const SYLLOG = [['Все кошки любят молоко', 'Мурка — кошка', 'Мурка любит молоко', 'Мурка не любит молоко', 'Мурка — собака'],
    ['Все птицы имеют перья', 'Сорока — птица', 'У сороки есть перья', 'У сороки нет перьев', 'Сорока — не птица'],
    ['Все рыбы живут в воде', 'Щука — рыба', 'Щука живёт в воде', 'Щука живёт на суше', 'Щука не рыба'],
    ['Все ученики 2 «А» любят рисовать', 'Вика учится во 2 «А»', 'Вика любит рисовать', 'Вика не любит рисовать', 'Вика учится в 3 классе'],
    ['У всех жуков 6 ног', 'Божья коровка — жук', 'У божьей коровки 6 ног', 'У божьей коровки 8 ног', 'Божья коровка — птица'],
    ['Все ели зимой зелёные', 'У Пети во дворе растёт ель', 'Ель у Пети зимой зелёная', 'Ель у Пети зимой жёлтая', 'У Пети во дворе берёза'],
    ['Все квадраты — прямоугольники', 'Эта фигура — квадрат', 'Эта фигура — прямоугольник', 'Эта фигура — круг', 'Эта фигура — не прямоугольник'],
    ['Все дети класса пришли в школу', 'Маша учится в этом классе', 'Маша пришла в школу', 'Маша осталась дома', 'Маша заболела'],
    ['Все собаки умеют лаять', 'Шарик — собака', 'Шарик умеет лаять', 'Шарик умеет мяукать', 'Шарик — кот'],
    ['Все яблоки растут на деревьях', 'Антоновка — яблоко', 'Антоновка растёт на дереве', 'Антоновка растёт на грядке', 'Антоновка — это груша'],
    ['У всех треугольников три угла', 'Эта фигура — треугольник', 'У этой фигуры три угла', 'У этой фигуры четыре угла', 'Это квадрат'],
    ['Все ученики нашей школы носят форму', 'Даша учится в нашей школе', 'Даша носит форму', 'Даша не носит форму', 'Даша учится в другой школе']];
  const VERIFY = [['Все кошки — животные. Значит, все животные — кошки.', false, 'Животные бывают разные: собаки, коровы, птицы. Не все животные — кошки.'],
    ['У всех квадратов 4 угла. У этой фигуры 4 угла. Значит, это точно квадрат.', false, 'Четыре угла есть и у прямоугольника, и у ромба — это не обязательно квадрат.'],
    ['Все ученики 2 класса умеют читать. Вика — ученица 2 класса. Значит, Вика умеет читать.', true, 'Если умеют все, то умеет и Вика.'],
    ['У всех птиц есть крылья. У бабочки есть крылья. Значит, бабочка — птица.', false, 'Крылья есть и у насекомых. Бабочка — насекомое, а не птица.'],
    ['Все рыбы плавают. Утка плавает. Значит, утка — рыба.', false, 'Плавать умеют не только рыбы. Утка — птица.'],
    ['Если идёт дождь, земля мокрая. Сейчас идёт дождь. Значит, земля мокрая.', true, 'Дождь идёт — земля точно мокрая.'],
    ['Если идёт дождь, земля мокрая. Земля мокрая. Значит, точно идёт дождь.', false, 'Землю могли полить из шланга или растаял снег — дождь не обязателен.'],
    ['Все ёлки зелёные. Это дерево жёлтое. Значит, это не ёлка.', true, 'Раз все ёлки зелёные, жёлтое дерево ёлкой быть не может.'],
    ['У всех собак 4 лапы. У Шарика 4 лапы. Значит, Шарик — собака.', false, 'Четыре лапы есть и у кошки, и у коровы. Шарик может быть кем угодно.'],
    ['Все дети в этом классе — мальчики. Саша учится в этом классе. Значит, Саша — мальчик.', true, 'Если все — мальчики, то и Саша мальчик.'],
    ['Ни одна рыба не умеет летать. Щука — рыба. Значит, щука не умеет летать.', true, 'Щука — рыба, а рыбы не летают.'],
    ['Некоторые птицы не летают. Воробей — птица. Значит, воробей не летает.', false, 'Не летают только некоторые птицы (пингвин, страус), а воробей летает.'],
    ['Все конфеты сладкие. Этот леденец — конфета. Значит, он сладкий.', true, 'Леденец — конфета, а все конфеты сладкие.'],
    ['Зимой холодно. Сейчас холодно. Значит, сейчас точно зима.', false, 'Холодно бывает и поздней осенью, и ранней весной.']];
  const TRICK = [['Горело 5 свечей. Две из них потушили. Сколько свечей останется?', 2, 'Останутся те 2, которые потушили: остальные 3 догорят до конца.'],
    ['На дереве сидели 5 птиц. Охотник выстрелил и попал в одну. Сколько птиц осталось на дереве?', 0, 'Остальные птицы испугались выстрела и улетели — на дереве никого не осталось.'],
    ['Одно яйцо варится 10 минут. Сколько минут будут вариться 3 яйца в одной кастрюле?', 10, 'Яйца варятся одновременно, поэтому тоже 10 минут.'],
    ['Тройка лошадей пробежала 12 км. Сколько километров пробежала каждая лошадь?', 12, 'Лошади бежали вместе, каждая пробежала все 12 км.'],
    ['У стола 4 угла. Один угол отпилили. Сколько углов стало?', 5, 'На месте отпиленного угла появляются два новых: 4 − 1 + 2 = 5.'],
    ['В комнате 4 угла. В каждом углу сидит кошка, а напротив каждой кошки — по 3 кошки. Сколько кошек в комнате?', 4, 'Всего 4 кошки: каждая видит трёх остальных.'],
    ['Сколько месяцев в году имеют 28 дней?', 12, '28 дней есть в каждом месяце — просто в остальных месяцах есть ещё и 29-й, 30-й, 31-й день.'],
    ['На берёзе 6 веток, на каждой ветке по 2 яблока. Сколько яблок на берёзе?', 0, 'На берёзе яблоки не растут!'],
    ['Два мальчика играли в шашки 2 часа. Сколько часов играл каждый мальчик?', 2, 'Они играли друг с другом одновременно — каждый играл 2 часа.'],
    ['Врач назначил 3 укола: по одному через каждые полчаса. За сколько минут сделают все уколы?', 60, 'Первый укол сразу, второй через 30 минут, третий ещё через 30: всего 60 минут.'],
    ['Из-под забора видно 8 кошачьих лап. Сколько кошек за забором?', 2, 'У каждой кошки 4 лапы: 8 = 4 + 4, значит 2 кошки.'],
    ['Из-под ворот видно 12 куриных ног. Сколько куриц во дворе?', 6, 'У курицы 2 ноги: 2 + 2 + 2 + 2 + 2 + 2 = 12, значит 6 куриц.'],
    ['Сколько концов у двух палок?', 4, 'У каждой палки 2 конца: 2 + 2 = 4.'],
    ['Сколько концов у двух с половиной палок?', 6, 'У половины палки тоже 2 конца: 2 + 2 + 2 = 6.'],
    ['Гусь весит 2 кг. Сколько он будет весить, если встанет на одну ногу?', 2, 'Вес не меняется от того, на скольких ногах стоишь: 2 кг.'],
    ['У семи братьев по одной сестре. Сколько всего детей в семье?', 8, 'Сестра у всех братьев одна и та же: 7 + 1 = 8.'],
    ['На столе лежало 4 яблока. Одно разрезали пополам. Сколько яблок на столе?', 4, 'Разрезанное яблоко никуда не делось: по-прежнему 4 яблока.'],
    ['Сколько орехов в пустом стакане?', 0, 'Стакан пустой — в нём ничего нет.'],
    ['Дед, бабка, внучка, Жучка, кошка и мышка тянули репку. Сколько глаз смотрело на репку?', 12, 'Шесть героев, у каждого по 2 глаза: 6 · 2 = 12.'],
    ['Пара лошадей пробежала 20 км. Сколько километров пробежала каждая лошадь?', 20, 'Лошади бежали вместе: каждая — все 20 км.'],
    ['Мама купила 3 пакета молока. Один пакет открыли. Сколько пакетов молока осталось?', 3, 'Открытый пакет никуда не делся — всё ещё 3 пакета.'],
    ['У Вики в двух карманах по 3 конфеты. Она съела 2. Сколько конфет осталось?', 4, '3 + 3 = 6, 6 − 2 = 4.'],
    ['Сколько пальцев на руках у двух человек?', 20, 'У каждого по 10 пальцев на руках: 10 + 10 = 20.'],
    ['Петя и Коля собрали 10 грибов поровну. Сколько грибов собрал Коля?', 5, 'Поровну — значит пополам: 10 = 5 + 5.'],
    ['Бабушка связала 3 пары варежек. Сколько варежек она связала?', 6, 'В каждой паре 2 варежки: 2 + 2 + 2 = 6.'],
    ['У трёхколёсного велосипеда и двухколёсного вместе сколько колёс?', 5, '3 + 2 = 5.']];
  const TRICK_TEXT = [['Шли два отца и два сына, нашли 3 апельсина и разделили поровну — каждому по одному. Как так?', 'Их было трое: дедушка, папа и внук', ['Апельсины были маленькие', 'Один апельсин разрезали пополам', 'Кто-то остался без апельсина'], 'Дедушка — отец папы, папа — отец сына: два отца и два сына, а людей всего трое.'],
    ['Что тяжелее: килограмм ваты или килограмм железа?', 'Одинаково', ['Килограмм железа', 'Килограмм ваты'], 'И там, и там ровно килограмм — вес одинаковый, просто ваты по объёму больше.'],
    ['Что легче: килограмм пуха или килограмм гвоздей?', 'Одинаково', ['Килограмм гвоздей', 'Килограмм пуха'], 'Килограмм — это килограмм, вес одинаковый.'],
    ['Что можно увидеть с закрытыми глазами?', 'Сон', ['Солнце', 'Стол', 'Стену'], 'С закрытыми глазами мы видим только сны.'],
    ['Какой рукой лучше размешивать чай?', 'Ложкой', ['Правой', 'Левой', 'Обеими'], 'Чай размешивают не рукой, а ложкой.'],
    ['Может ли страус назвать себя птицей?', 'Нет, страус не умеет говорить', ['Да, ведь он птица', 'Только по утрам', 'Может, если захочет'], 'Страус — птица, но говорить он не умеет.'],
    ['Что становится больше, если его поставить вверх ногами?', 'Число 6', ['Число 8', 'Стакан', 'Число 3'], 'Перевёрнутая 6 превращается в 9.'],
    ['Под каким деревом сидит заяц во время дождя?', 'Под мокрым', ['Под берёзой', 'Под ёлкой', 'Под дубом'], 'Во время дождя все деревья мокрые.'],
    ['Что находится между рекой и берегом?', 'Буква «и»', ['Песок', 'Вода', 'Мост'], 'Смотри на слова: «рекой И берегом» — между ними буква «и».'],
    ['Сколько яиц можно съесть натощак?', 'Одно', ['Два', 'Три', 'Сколько угодно'], 'После первого яйца ты уже не натощак.']];

  function taskLogic(level) {
    // возвращает { q, ans, dis, ex, hint, mode } — mode: 'num' | 'text'
    const fams = level === 1 ? ['legs', 'days', 'trans', 'neg', 'sib', 'time', 'age', 'cuts', 'parts']
      : level === 2 ? ['legs', 'queue', 'trans', 'syl', 'verify', 'days', 'age', 'cuts', 'time', 'negcol', 'sib', 'parts']
        : ['legs2', 'age2', 'cuts', 'time', 'sib2', 'trick', 'trick', 'trickText', 'negcol', 'verify', 'queue', 'days3'];
    const fam = U.pick(fams);
    const near = (a, k, sp) => U.nearNums(a, k, sp || 3, 0);
    if (fam === 'legs') {
      const a = U.pick(ANIMALS); const n = level === 1 ? N(2, 3) : N(2, 5); const ans = n * a[2];
      return { q: 'Сколько ' + a[3] + ' у ' + n + ' ' + a[1] + '?', ans, dis: near(ans, 3, 4), mode: 'num', hint: 'У каждой — по ' + a[2], ex: 'По ' + a[2] + ' у каждой: ' + Array(n).fill(a[2]).join(' + ') + ' = ' + ans + '.' };
    }
    if (fam === 'parts') {
      const p = U.pick(PARTS); const n = N(2, 5); const ans = n * p[2];
      return { q: 'Сколько ' + p[0] + ' у ' + n + ' ' + U.pick(p[3]) + '?', ans, dis: near(ans, 3, 3), mode: 'num', hint: 'У каждого — ' + (p[2] === 1 ? 'один' : 'по два'), ex: (p[2] === 1 ? 'По одному у каждого: всего ' : 'По 2 у каждого: ' + Array(n).fill(2).join(' + ') + ' = ') + ans + '.' };
    }
    if (fam === 'legs2') {
      const [a, b] = U.pickN(ANIMALS, 2); const n = N(2, 4), m = N(1, 3); const ans = n * a[2] + m * b[2];
      return { q: 'Сколько ног у ' + n + ' ' + a[1] + ' и ' + m + ' ' + b[1] + ' вместе?', ans, dis: near(ans, 3, 4), mode: 'num', hint: 'Сосчитай отдельно, потом сложи', ex: n + ' · ' + a[2] + ' = ' + n * a[2] + ', ' + m + ' · ' + b[2] + ' = ' + m * b[2] + ', вместе ' + ans + '.' };
    }
    if (fam === 'days') {
      const d = N(0, 6); const n = level === 1 ? N(1, 2) : N(2, 6); const ans = DAYS[mod(d + n, 7)];
      return { q: 'Сегодня ' + DAYS[d] + '. Какой день будет через ' + U.count(n, ['день', 'дня', 'дней']) + '?', ans, dis: U.pickN(DAYS.filter(x => x !== ans), 3), mode: 'text', hint: 'Считай дни по порядку от ' + DAYS[d], ex: 'От ' + DAYS[d] + ' отсчитываем ' + n + ': ' + U.range(1, n).map(i => DAYS[mod(d + i, 7)]).join(', ') + '.' };
    }
    if (fam === 'days3') {
      const d = N(0, 6); const n = U.pick([7, 8, 9, 10, 14]); const ans = DAYS[mod(d + n, 7)];
      return { q: 'Сегодня ' + DAYS[d] + '. Какой день недели будет через ' + U.count(n, ['день', 'дня', 'дней']) + '?', ans, dis: U.pickN(DAYS.filter(x => x !== ans), 3), mode: 'text', hint: 'Через 7 дней — снова ' + DAYS[d] + ', а дальше досчитай', ex: 'Через 7 дней опять ' + DAYS[d] + (n % 7 ? ', ещё через ' + (n % 7) + ' — ' + ans : '') + '.' };
    }
    if (fam === 'trans') {
      const f = U.chance(0.5); const [A, B, C] = U.pickN(f ? NAMES_F : NAMES_M, 3); const r = U.pick(RELS); const top = U.chance(0.5);
      const clue2 = level === 1 || U.chance(0.5) ? B.n + ' ' + r.cmp + ' ' + C.g : C.n + ' ' + r.opp + ' ' + B.g;
      const ans = top ? A.n : C.n;
      return { q: A.n + ' ' + r.cmp + ' ' + B.g + ', а ' + clue2 + '. Кто ' + (top ? r.top : r.bot)[f ? 1 : 0] + '?', ans, dis: [B.n, top ? C.n : A.n], mode: 'text', hint: 'Расставь всех по порядку', ex: 'По порядку: ' + A.n + ', ' + B.n + ', ' + C.n + '. ' + (top ? r.top : r.bot)[f ? 1 : 0].replace(/^сам/, 'Сам') + ' — ' + ans + '.' };
    }
    if (fam === 'queue') {
      const [A, B, C] = U.pickN(NAMES, 3); const t = N(1, 3);
      const clue = t === 1 ? B.n + ' стоит за ' + A.i + ', а ' + C.n + ' — за ' + B.i : t === 2 ? A.n + ' стоит перед ' + B.i + ', а ' + B.n + ' — перед ' + C.i : B.n + ' стоит за ' + A.i + ' и перед ' + C.i;
      const ask = N(1, 3); const ans = ask === 1 ? A.n : ask === 2 ? C.n : B.n;
      return { q: 'В очереди стоят ' + A.n + ', ' + B.n + ' и ' + C.n + '. ' + clue + '. Кто стоит ' + (ask === 1 ? 'первым' : ask === 2 ? 'последним' : 'в середине') + '?', ans, dis: [A.n, B.n, C.n].filter(x => x !== ans), mode: 'text', hint: 'Нарисуй очередь: кто за кем', ex: 'Очередь: ' + A.n + ' → ' + B.n + ' → ' + C.n + '.' };
    }
    if (fam === 'neg') {
      const [A, B, C] = U.pickN(NAMES, 3); const h = U.pick(HOLD);
      return { q: U.cap(h) + ' держит не ' + A.n + ' и не ' + B.n + '. Кто держит ' + h + ': ' + A.n + ', ' + B.n + ' или ' + C.n + '?', ans: C.n, dis: [A.n, B.n], mode: 'text', hint: 'Убери тех, кто точно не держит', ex: 'Не ' + A.n + ' и не ' + B.n + ' — остаётся ' + C.n + '.' };
    }
    if (fam === 'negcol') {
      const [A, B, C] = U.pickN(NAMES, 3); const cols = U.pickN(BALLS, 3); const ask = N(0, 2); const who = [A, B, C][ask]; const ans = cols[ask];
      return { q: 'У ' + A.g + ', ' + B.g + ' и ' + C.g + ' шарики: ' + cols.join(', ') + '. У ' + A.g + ' не ' + cols[1] + ' и не ' + cols[2] + '. У ' + B.g + ' не ' + cols[2] + '. Какой шарик у ' + who.g + '?', ans, dis: cols.filter(c => c !== ans), mode: 'text',
        hint: 'Сначала узнай шарик ' + A.g, ex: 'У ' + A.g + ' ' + cols[0] + ' (остальные не подходят). У ' + B.g + ' не ' + cols[2] + ', а ' + cols[0] + ' уже занят — значит ' + cols[1] + '. У ' + C.g + ' — ' + cols[2] + '.' };
    }
    if (fam === 'sib') {
      const t = N(1, 3);
      if (t === 1) { const g = U.pick(NAMES_F); const n = N(2, 4); return { q: 'У ' + g.g + ' ' + U.count(n, ['брат', 'брата', 'братьев']) + ', а сестёр нет. Сколько сестёр у каждого брата?', ans: 1, dis: [n, n + 1, 0], mode: 'num', hint: 'Кто приходится сестрой братьям?', ex: 'У братьев одна сестра — ' + g.n + '.' }; }
      if (t === 2) { const n = N(2, 5); return { q: 'В семье ' + U.count(n, ['сестра', 'сестры', 'сестёр']) + ', и у каждой есть брат. Сколько всего детей в семье?', ans: n + 1, dis: [n, n * 2, n + 2], mode: 'num', hint: 'Брат у сестёр один и тот же', ex: 'Брат один на всех: ' + n + ' + 1 = ' + (n + 1) + '.' }; }
      const g = U.pick(NAMES_F); const n = N(1, 3); return { q: 'У ' + g.g + ' ' + U.count(n, ['сестра', 'сестры', 'сестёр']) + '. Сколько всего девочек в семье?', ans: n + 1, dis: [n, n + 2, n * 2 + 1], mode: 'num', hint: 'Не забудь посчитать саму ' + g.n.replace(/а$/, 'у').replace(/я$/, 'ю'), ex: n + ' сестры и сама ' + g.n + ': ' + n + ' + 1 = ' + (n + 1) + '.' };
    }
    if (fam === 'sib2') {
      const b = U.pick(NAMES_M); const n = N(1, 4), m = N(1, 3);
      return { q: 'У ' + b.g + ' ' + U.count(n, ['сестра', 'сестры', 'сестёр']) + ' и ' + U.count(m, ['брат', 'брата', 'братьев']) + '. Сколько всего детей в семье?', ans: n + m + 1, dis: [n + m, n + m + 2], mode: 'num', hint: 'Не забудь самого ' + b.g, ex: n + ' + ' + m + ' + 1 (сам ' + b.n + ') = ' + (n + m + 1) + '.' };
    }
    if (fam === 'cuts') {
      const t = N(1, 4); const n = level === 1 ? N(3, 4) : N(3, 8);
      if (t === 1) return { q: 'Батон разрезали на ' + U.count(n, ['кусок', 'куска', 'кусков']) + '. Сколько разрезов сделали?', ans: n - 1, dis: [n, n + 1], mode: 'num', hint: 'Один разрез делит батон на 2 куска', ex: 'Разрезов всегда на один меньше, чем кусков: ' + n + ' − 1 = ' + (n - 1) + '.' };
      if (t === 2) return { q: 'Бревно распилили ' + U.count(n, ['раз', 'раза', 'раз']) + '. Сколько получилось частей?', ans: n + 1, dis: [n, n - 1], mode: 'num', hint: 'Один распил — 2 части', ex: 'Частей на одну больше, чем распилов: ' + n + ' + 1 = ' + (n + 1) + '.' };
      if (t === 3) return { q: 'Ленту разрезали на ' + U.count(n, ['часть', 'части', 'частей']) + '. Каждый разрез занимает 1 минуту. Сколько минут это заняло?', ans: n - 1, dis: [n, n + 1], mode: 'num', hint: 'Сначала узнай, сколько было разрезов', ex: 'Разрезов ' + (n - 1) + ', по минуте на каждый: ' + (n - 1) + ' минут.' };
      return { q: 'На верёвке завязали ' + U.count(n, ['узел', 'узла', 'узлов']) + ' — между каждыми двумя узлами по 1 метру. Какой длины верёвка от первого до последнего узла?', ans: n - 1, dis: [n, n + 1], mode: 'num', hint: 'Промежутков на один меньше, чем узлов', ex: 'Между ' + n + ' узлами ' + (n - 1) + ' промежутков по метру: ' + (n - 1) + ' м.' };
    }
    if (fam === 'time') {
      const t = N(1, 3);
      if (t === 1) { const h = N(4, 11), n = N(1, 3); return { q: 'Который сейчас час, если через ' + U.count(n, ['час', 'часа', 'часов']) + ' будет ' + h + '?', ans: h - n, dis: [h + n, h - n - 1], mode: 'num', hint: 'Отсчитай назад от ' + h, ex: h + ' − ' + n + ' = ' + (h - n) + '.' }; }
      if (t === 2) { const h = N(5, 12), n = N(1, 4); return { q: 'Сейчас ' + h + ' часов. Сколько было ' + U.count(n, ['час', 'часа', 'часов']) + ' назад?', ans: h - n, dis: [h + n, h - n + 1], mode: 'num', hint: '«Назад» — вычитаем', ex: h + ' − ' + n + ' = ' + (h - n) + '.' }; }
      const h1 = N(1, 8), h2 = N(h1 + 1, 12); return { q: 'Сейчас ' + h1 + ' ' + U.plural(h1, ['час', 'часа', 'часов']) + '. Через сколько часов будет ' + h2 + '?', ans: h2 - h1, dis: [h2 - h1 + 1, h2 - h1 - 1 || h2 - h1 + 2, h1 + h2], mode: 'num', hint: 'Найди разницу', ex: h2 + ' − ' + h1 + ' = ' + (h2 - h1) + '.' };
    }
    if (fam === 'age') {
      const p = U.pick(NAMES); const t = N(1, 3);
      if (t === 1) { const n = N(1, 5), m = N(9, 15); return { q: 'Через ' + U.count(n, ['год', 'года', 'лет']) + ' ' + p.d + ' будет ' + U.count(m, ['год', 'года', 'лет']) + '. Сколько ' + (p.f ? 'ей' : 'ему') + ' сейчас?', ans: m - n, dis: [m + n, m - n - 1], mode: 'num', hint: 'Сейчас меньше, чем будет', ex: m + ' − ' + n + ' = ' + (m - n) + '.' }; }
      if (t === 2) { const n = N(1, 4), m = N(3, 8); return { q: U.count(n, ['год', 'года', 'лет']) + ' назад ' + p.d + ' было ' + U.count(m, ['год', 'года', 'лет']) + '. Сколько ' + (p.f ? 'ей' : 'ему') + ' сейчас?', ans: m + n, dis: [m - n > 0 ? m - n : m + n + 2, m + n + 1], mode: 'num', hint: 'С тех пор прошло ' + n + ' ' + U.plural(n, ['год', 'года', 'лет']), ex: m + ' + ' + n + ' = ' + (m + n) + '.' }; }
      const m = N(25, 40), d = N(5, 10); return { q: 'Маме ' + m + ' лет, а дочке ' + U.count(d, ['год', 'года', 'лет']) + '. На сколько лет мама старше?', ans: m - d, dis: [m + d, m - d + 1, m - d - 2], mode: 'num', hint: '«На сколько» — вычитаем из большего меньшее', ex: m + ' − ' + d + ' = ' + (m - d) + '.' };
    }
    if (fam === 'age2') {
      const p = U.pick(NAMES); const t = N(1, 3);
      if (t === 1) { const a = N(6, 9), n = N(2, 5), k = N(1, 4); return { q: p.d + ' ' + U.count(a, ['год', 'года', 'лет']) + ', а брат на ' + U.count(n, ['год', 'года', 'лет']) + ' старше. Сколько лет будет брату через ' + U.count(k, ['год', 'года', 'лет']) + '?', ans: a + n + k, dis: [], mode: 'num', hint: 'Сначала узнай, сколько брату сейчас', ex: 'Брату сейчас ' + a + ' + ' + n + ' = ' + (a + n) + ', через ' + k + ' будет ' + (a + n + k) + '.' }; }
      if (t === 2) { const a = N(6, 9), n = N(1, 3); return { q: p.d + ' ' + U.count(a, ['год', 'года', 'лет']) + '. Сколько ' + (p.f ? 'ей' : 'ему') + ' было ' + U.count(n, ['год', 'года', 'лет']) + ' назад, и сколько будет через ' + U.count(n, ['год', 'года', 'лет']) + '? Запиши сумму этих двух чисел', ans: 2 * a, dis: [], mode: 'num', hint: 'Назад — вычитаем, вперёд — прибавляем', ex: (a - n) + ' + ' + (a + n) + ' = ' + 2 * a + '.' }; }
      const q2 = U.pickOther(NAMES, p); const n = N(2, 5), m = N(9, 14); return { q: 'Через ' + U.count(n, ['год', 'года', 'лет']) + ' ' + p.d + ' будет столько лет, сколько ' + q2.d + ' сейчас — ' + m + '. Сколько лет ' + p.d + ' сейчас?', ans: m - n, dis: [], mode: 'num', hint: p.d + ' через ' + n + ' будет ' + m, ex: m + ' − ' + n + ' = ' + (m - n) + '.' };
    }
    if (fam === 'syl') {
      const s = U.pick(SYLLOG);
      return { q: s[0] + '. ' + s[1] + '. Что из этого следует?', ans: s[2], dis: [s[3], s[4]], mode: 'text', hint: 'Если верно для всех, то верно и для одного', ex: s[1] + ', а ' + s[0].charAt(0).toLowerCase() + s[0].slice(1) + ' — значит, ' + s[2].charAt(0).toLowerCase() + s[2].slice(1) + '.' };
    }
    if (fam === 'verify') {
      const v = U.pick(VERIFY);
      return { q: v[0] + ' Это рассуждение верное?', ans: v[1] ? 'Верно' : 'Неверно', dis: [v[1] ? 'Неверно' : 'Верно'], mode: 'text', hint: 'Подумай, бывает ли по-другому', ex: v[2] };
    }
    if (fam === 'trick') { const t = U.pick(TRICK); return { q: t[0], ans: t[1], dis: [], mode: 'num', hint: 'Здесь есть подвох — представь всё по-настоящему', ex: t[2] }; }
    const t = U.pick(TRICK_TEXT); return { q: t[0], ans: t[1], dis: t[2], mode: 'text', hint: 'Это задача-шутка: подумай, где подвох', ex: t[3] };
  }

  function genTasks(level) {
    const t = taskLogic(level);
    if (level === 3 && t.mode === 'num') return { type: 'input', mode: 'num', prompt: t.q, answer: t.ans, hint: t.hint, explain: t.ex };
    const k = level === 1 ? 2 : 3;
    let dis = t.dis.map(String).filter(x => x !== String(t.ans));
    if (t.mode === 'num') dis = U.uniq(dis.concat(U.nearNums(t.ans, 3, 3, 0).map(String))).slice(0, k);
    else dis = dis.slice(0, k);
    return { type: 'choice', prompt: t.q, options: U.opts(t.ans, dis), answer: String(t.ans), hint: t.hint, explain: t.ex };
  }

  /* =====================================================================
     8. Весы и ребусы с картинками
     ===================================================================== */
  const FRUIT = ['🍎', '🍌', '🍇', '🍒', '🍓', '🍉', '🥝', '🍑', '🍐', '🍊'];
  const eq = lines => V.text(lines.map(l => '<p style="font-size:30px;text-align:center;margin:6px 0"><b>' + l + '</b></p>').join(''));
  const HEAVY = [['🍉', '🍎', 3], ['🎃', '🍊', 4], ['🐘', '🐕', 5], ['📦', '📕', 3], ['🧊', '🍬', 4]];

  function genScales(level) {
    const [A, B, C] = U.pickN(FRUIT, 3);
    if (level === 1) {
      const kind = N(1, 4);
      if (kind === 1) {
        const a = N(2, 9);
        return { type: 'choice', prompt: 'Чему равен ' + A + '?', visual: eq([A + ' + ' + A + ' = ' + (2 * a)]),
          options: U.numOpts(a, 2, 1, 12), answer: String(a), hint: 'Два одинаковых значка дают ' + (2 * a) + '. Какое число сложили само с собой?',
          explain: A + ' + ' + A + ' = ' + (2 * a) + ', значит ' + A + ' = ' + a + '.' };
      }
      if (kind === 2) {
        const a = N(1, 5);
        return { type: 'choice', prompt: 'Чему равен ' + A + '?', visual: eq([A + ' + ' + A + ' + ' + A + ' = ' + (3 * a)]),
          options: U.numOpts(a, 2, 1, 10), answer: String(a), hint: 'Три одинаковых значка дают ' + (3 * a),
          explain: 'Три раза по ' + a + ' — это ' + (3 * a) + ', значит ' + A + ' = ' + a + '.' };
      }
      if (kind === 3) {
        const price = N(2, 9), n = N(2, 3);
        return { type: 'choice', prompt: 'Одна конфета ' + A + ' стоит ' + price + ' р. Сколько стоят ' + U.count(n, ['конфета', 'конфеты', 'конфет']) + '?',
          visual: emojiRow(Array(n).fill(A)), options: U.numOpts(price * n, 2, 1, price * n + 8), answer: String(price * n),
          hint: 'Сложи ' + price + ' столько раз, сколько конфет', explain: Array(n).fill(price).join(' + ') + ' = ' + (price * n) + ' р.' };
      }
      const a = N(2, 6), add = N(1, 3);
      return { type: 'choice', prompt: 'Слева на весах ' + (a + add) + ' яблок, справа ' + a + '. Сколько яблок добавить справа, чтобы весы уравновесились?',
        visual: twoRows('Слева:', Array(a + add).fill('🍎'), 'Справа:', Array(a).fill('🍎')),
        options: U.numOpts(add, 2, 1, 8), answer: String(add), hint: 'Посчитай, на сколько слева больше',
        explain: (a + add) + ' − ' + a + ' = ' + add + ': нужно добавить ' + U.count(add, ['яблоко', 'яблока', 'яблок']) + '.' };
    }
    if (level === 2) {
      const kind = N(1, 4);
      if (kind === 1) {
        const a = N(2, 8), b = N(1, 9);
        return { type: 'input', mode: 'num', prompt: 'Чему равен ' + B + '?', visual: eq([A + ' + ' + A + ' = ' + (2 * a), A + ' + ' + B + ' = ' + (a + b)]),
          answer: b, hint: 'Сначала найди ' + A + ' из первой строки', explain: A + ' = ' + a + ' (потому что ' + a + ' + ' + a + ' = ' + (2 * a) + '). Тогда ' + B + ' = ' + (a + b) + ' − ' + a + ' = ' + b + '.' };
      }
      if (kind === 2) {
        const a = N(2, 6), b = N(2, 8);
        return { type: 'input', mode: 'num', prompt: 'Чему равна сумма ' + A + ' + ' + B + '?', visual: eq([A + ' + ' + A + ' + ' + A + ' = ' + (3 * a), B + ' + ' + B + ' = ' + (2 * b)]),
          answer: a + b, hint: A + ' = ' + a + ', теперь найди ' + B, explain: A + ' = ' + a + ', ' + B + ' = ' + b + '. Сумма: ' + a + ' + ' + b + ' = ' + (a + b) + '.' };
      }
      if (kind === 3) {
        const price = N(3, 9), n = N(2, 4), pay = U.pick([20, 50].filter(v => v > price * n));
        if (!pay) return genScales(level);
        return { type: 'input', mode: 'num', prompt: 'Купили ' + U.count(n, ['леденец', 'леденца', 'леденцов']) + ' ' + A + ' по ' + price + ' р. и дали ' + pay + ' р. Сколько сдачи?',
          visual: emojiRow(Array(n).fill(A)), answer: pay - price * n, hint: 'Сначала посчитай, сколько стоит вся покупка',
          explain: price + ' · ' + n + ' = ' + (price * n) + ' р.; ' + pay + ' − ' + (price * n) + ' = ' + (pay - price * n) + ' р. сдачи.' };
      }
      const h = U.pick(HEAVY), k = h[2];
      return { type: 'input', mode: 'num', prompt: h[0] + ' весит столько же, сколько ' + U.count(k, ['штука', 'штуки', 'штук']) + ' ' + h[1] + '. Сколько ' + h[1] + ' уравновесят два ' + h[0] + '?',
        visual: twoRows('Одни весы:', [h[0]], 'уравновешивают:', Array(k).fill(h[1])),
        answer: k * 2, hint: 'Один ' + h[0] + ' — это ' + k + ', а два?', explain: k + ' + ' + k + ' = ' + (k * 2) + '.' };
    }
    const kind = N(1, 4);
    if (kind === 1) {
      const a = N(2, 7), b = N(1, 8), c = N(1, 9);
      return { type: 'input', mode: 'num', prompt: 'Чему равен ' + C + '?', visual: eq([A + ' + ' + A + ' = ' + (2 * a), A + ' + ' + B + ' = ' + (a + b), B + ' + ' + C + ' = ' + (b + c)]),
        answer: c, hint: 'Разгадывай по цепочке: сначала ' + A + ', потом ' + B, explain: A + ' = ' + a + '; ' + B + ' = ' + (a + b) + ' − ' + a + ' = ' + b + '; ' + C + ' = ' + (b + c) + ' − ' + b + ' = ' + c + '.' };
    }
    if (kind === 2) {
      const small = N(2, 4), mid = N(2, 3);
      return { type: 'input', mode: 'num', prompt: '🍉 весит как ' + U.count(mid, ['яблоко', 'яблока', 'яблок']) + ' 🍎, а одно 🍎 весит как ' + U.count(small, ['вишенка', 'вишенки', 'вишенок']) + ' 🍒. Сколько 🍒 весит 🍉?',
        visual: eq(['🍉 = ' + Array(mid).fill('🍎').join(' '), '🍎 = ' + Array(small).fill('🍒').join(' ')]),
        answer: mid * small, hint: 'В каждом яблоке ' + small + ' вишенок, а яблок ' + mid,
        explain: mid + ' яблок по ' + small + ' вишенок: ' + mid + ' · ' + small + ' = ' + (mid * small) + ' вишенок.' };
    }
    if (kind === 3) {
      const a = N(2, 8), b = N(2, 9);
      const total = a * 2 + b;
      return { type: 'input', mode: 'num', prompt: 'Чему равен ' + B + '?', visual: eq([A + ' + ' + A + ' + ' + B + ' = ' + total, A + ' = ' + a]),
        answer: b, hint: 'Подставь значение ' + A + ' в первую строку', explain: a + ' + ' + a + ' = ' + (2 * a) + '; ' + B + ' = ' + total + ' − ' + (2 * a) + ' = ' + b + '.' };
    }
    const x = N(3, 9), y = N(2, 8);
    const heavier = x > y ? A : B;
    return { type: 'choice', prompt: 'Что тяжелее?', visual: eq([A + ' весит ' + x + ' кг', B + ' весит ' + y + ' кг']),
      options: U.uniq([A, B, 'Одинаково']), answer: x === y ? 'Одинаково' : heavier,
      hint: 'Сравни числа ' + x + ' и ' + y, explain: x === y ? 'Оба весят по ' + x + ' кг — одинаково.' : heavier + ' тяжелее: ' + Math.max(x, y) + ' кг больше, чем ' + Math.min(x, y) + ' кг.' };
  }

  /* =====================================================================
     9. Пространство и направления
     ===================================================================== */
  const MIRROR_OK = ['А', 'О', 'Т', 'Н', 'Ф', 'Х', 'М', 'П', 'Ш', 'Ж', 'Д', 'Л'];
  const MIRROR_NO = ['Б', 'В', 'Г', 'Я', 'Р', 'С', 'Ц', 'Ч', 'Э', 'Ю', 'К', 'З', 'У', 'Е'];
  const DIRS = ['север', 'восток', 'юг', 'запад'];
  const ORD_M = ['первым', 'вторым', 'третьим', 'четвёртым', 'пятым', 'шестым'];
  const ORD_N = ['первый', 'второй', 'третий', 'четвёртый', 'пятый', 'шестой'];

  /** Сетка n×m из уникальных эмодзи */
  function makeGrid(rows, cols) {
    const cells = U.pickN(EMO, rows * cols);
    const g = [];
    for (let r = 0; r < rows; r++) g.push(cells.slice(r * cols, r * cols + cols));
    return g;
  }
  function genSpace(level) {
    if (level === 1) {
      const kind = N(1, 4);
      if (kind === 1) {
        const row = U.pickN(EMO, N(4, 5));
        const idx = N(0, row.length - 1);
        return { type: 'choice', big: true, prompt: 'Что стоит <b>' + ORD_M[idx] + '</b> слева?', visual: emojiRow(row),
          options: U.shuffle(U.uniq([row[idx]].concat(U.pickN(row.filter(x => x !== row[idx]), 2)))), answer: row[idx],
          hint: 'Считай слева направо', explain: U.cap(ORD_N[idx]) + ' слева — ' + row[idx] + '.' };
      }
      if (kind === 2) {
        const g = makeGrid(2, 3);
        const r = N(0, 1), c = N(0, 1);
        return { type: 'choice', big: true, prompt: 'Что находится <b>справа</b> от ' + g[r][c] + '?', visual: V.grid(g),
          options: U.shuffle(U.uniq([g[r][c + 1]].concat(U.pickN(g.flat().filter(x => x !== g[r][c + 1] && x !== g[r][c]), 2)))), answer: g[r][c + 1],
          hint: 'Справа — это в ту же строку, но в соседнюю клетку правее', explain: 'Справа от ' + g[r][c] + ' стоит ' + g[r][c + 1] + '.' };
      }
      if (kind === 3) {
        const g = makeGrid(2, 3);
        const c = N(0, 2);
        return { type: 'choice', big: true, prompt: 'Что находится <b>под</b> ' + g[0][c] + '?', visual: V.grid(g),
          options: U.shuffle(U.uniq([g[1][c]].concat(U.pickN(g.flat().filter(x => x !== g[1][c] && x !== g[0][c]), 2)))), answer: g[1][c],
          hint: 'Под — значит в нижней строке, в том же столбце', explain: 'Под ' + g[0][c] + ' находится ' + g[1][c] + '.' };
      }
      const rows = N(2, 3), cols = N(2, 4);
      return { type: 'choice', prompt: 'Сколько всего клеток в этой таблице?', visual: V.grid(makeGrid(rows, cols)),
        options: U.numOpts(rows * cols, 2, 2, rows * cols + 5), answer: String(rows * cols),
        hint: 'В каждой строке по ' + cols + ' клеток, а строк ' + rows, explain: rows + ' строки по ' + cols + ' клеток: ' + rows + ' · ' + cols + ' = ' + (rows * cols) + '.' };
    }
    if (level === 2) {
      const kind = N(1, 4);
      if (kind === 1) {
        const g = makeGrid(3, 3);
        const r = N(0, 1), c = N(0, 1);
        const dr = N(0, 1), dc = dr === 1 ? N(0, 1) : 1;
        const target = g[r + dr][c + dc];
        const moves = [];
        if (dc) moves.push(U.count(dc, ['шаг', 'шага', 'шагов']) + ' вправо');
        if (dr) moves.push(U.count(dr, ['шаг', 'шага', 'шагов']) + ' вниз');
        return { type: 'choice', big: true, prompt: 'Мышка стоит на ' + g[r][c] + '. Она делает ' + moves.join(' и ') + '. На какой картинке она окажется?',
          visual: V.grid(g), options: U.shuffle(U.uniq([target].concat(U.pickN(g.flat().filter(x => x !== target && x !== g[r][c]), 3)))), answer: target,
          hint: 'Вправо — по строке, вниз — по столбцу', explain: 'Из клетки ' + g[r][c] + ' ' + moves.join(' и ') + ' — это клетка ' + target + '.' };
      }
      if (kind === 2) {
        const L = U.pick(MIRROR_OK);
        return { type: 'choice', big: true, prompt: 'Какая буква в зеркале выглядит <b>так же</b>, как и была?',
          options: U.shuffle([L].concat(U.pickN(MIRROR_NO, 3))), answer: L,
          hint: 'Мысленно раздели букву пополам сверху вниз: если половинки одинаковые — в зеркале не изменится',
          explain: 'Буква ' + L + ' симметричная: её левая и правая половинки одинаковые, поэтому в зеркале она не меняется.' };
      }
      if (kind === 3) {
        const from = U.pick(DIRS);
        const turn = U.pick(['направо', 'налево']);
        const i = DIRS.indexOf(from);
        const to = DIRS[mod(i + (turn === 'направо' ? 1 : -1), 4)];
        return { type: 'choice', prompt: 'Ты стоишь лицом на <b>' + from + '</b> и поворачиваешься <b>' + turn + '</b>. Куда теперь смотришь?',
          options: U.shuffle(DIRS.slice()), answer: to,
          hint: 'Если смотреть на север, то справа восток, слева запад, сзади юг',
          explain: 'Лицом на ' + from + ', поворот ' + turn + ' — получается ' + to + '.' };
      }
      const g = makeGrid(3, 3);
      const r1 = N(0, 2), c1 = N(0, 2);
      let r2 = N(0, 2), c2 = N(0, 2);
      if (r1 === r2 && c1 === c2) { r2 = (r1 + 1) % 3; }
      const steps = Math.abs(r1 - r2) + Math.abs(c1 - c2);
      return { type: 'input', mode: 'num', prompt: 'Сколько шагов от ' + g[r1][c1] + ' до ' + g[r2][c2] + '? Ходить можно только вверх, вниз, влево и вправо.',
        visual: V.grid(g), answer: steps, hint: 'Считай отдельно шаги по строкам и по столбцам, потом сложи',
        explain: 'По строкам ' + Math.abs(r1 - r2) + ', по столбцам ' + Math.abs(c1 - c2) + ': всего ' + steps + '.' };
    }
    const kind = N(1, 4);
    if (kind === 1) {
      const g = makeGrid(4, 4);
      const r = N(0, 1), c = N(0, 1);
      const dc = N(1, 2), dr = N(1, 2);
      const target = g[r + dr][c + dc];
      return { type: 'choice', big: true, prompt: 'Жук сидит на ' + g[r][c] + ' и ползёт: ' + U.count(dc, ['шаг', 'шага', 'шагов']) + ' вправо, потом ' + U.count(dr, ['шаг', 'шага', 'шагов']) + ' вниз. Где он окажется?',
        visual: V.grid(g), options: U.shuffle(U.uniq([target].concat(U.pickN(g.flat().filter(x => x !== target && x !== g[r][c]), 3)))), answer: target,
        hint: 'Сначала пройди вправо по строке, потом вниз по столбцу', explain: 'Ответ — клетка ' + target + '.' };
    }
    if (kind === 2) {
      const from = U.pick(DIRS);
      const i = DIRS.indexOf(from);
      const side = U.pick(['справа', 'слева', 'сзади']);
      const to = side === 'справа' ? DIRS[mod(i + 1, 4)] : side === 'слева' ? DIRS[mod(i - 1, 4)] : DIRS[mod(i + 2, 4)];
      return { type: 'input', mode: 'text', prompt: 'Ты встал лицом на <b>' + from + '</b>. Какая сторона горизонта окажется <b>' + side + '</b>?',
        answer: to, hint: 'Стороны по кругу: север → восток → юг → запад',
        explain: 'Лицом на ' + from + ': ' + side + ' будет ' + to + '.' };
    }
    if (kind === 3) {
      const rows = N(3, 5), cols = N(3, 5);
      return { type: 'input', mode: 'num', prompt: 'В таблице ' + rows + ' строк и ' + cols + ' столбцов. Сколько в ней клеток?',
        answer: rows * cols, hint: 'Умножь число строк на число столбцов', explain: rows + ' · ' + cols + ' = ' + (rows * cols) + ' клеток.' };
    }
    const g = makeGrid(3, 3);
    const r = N(0, 2), c = N(0, 2);
    const neigh = [];
    if (r > 0) neigh.push(['над', g[r - 1][c]]);
    if (r < 2) neigh.push(['под', g[r + 1][c]]);
    if (c > 0) neigh.push(['слева от', g[r][c - 1]]);
    if (c < 2) neigh.push(['справа от', g[r][c + 1]]);
    const pick2 = U.pickN(neigh, 2);
    return { type: 'match', prompt: 'Соедини: что где находится относительно ' + g[r][c] + '?',
      pairs: pick2.map(p => [p[0] + ' ' + g[r][c], p[1]]), visual: V.grid(g),
      explain: pick2.map(p => U.cap(p[0]) + ' ' + g[r][c] + ' — ' + p[1]).join('; ') + '.' };
  }

  /* =====================================================================
     10. Дни недели и время
     ===================================================================== */
  const SEASONS = { 'Зима ❄️': ['декабрь', 'январь', 'февраль'], 'Весна 🌷': ['март', 'апрель', 'май'], 'Лето ☀️': ['июнь', 'июль', 'август'], 'Осень 🍂': ['сентябрь', 'октябрь', 'ноябрь'] };
  const TIMES_OF_DAY = [[7, 'утро'], [8, 'утро'], [9, 'утро'], [10, 'утро'], [13, 'день'], [14, 'день'], [15, 'день'], [16, 'день'], [19, 'вечер'], [20, 'вечер'], [21, 'вечер'], [23, 'ночь'], [2, 'ночь'], [4, 'ночь']];
  const CAL_FACTS = [['Сколько дней в неделе?', 7], ['Сколько месяцев в году?', 12], ['Сколько выходных дней в неделе?', 2], ['Сколько месяцев в одном времени года?', 3], ['Сколько времён года?', 4], ['Сколько минут в часе?', 60], ['Сколько часов в сутках?', 24], ['Сколько секунд в минуте?', 60], ['Сколько дней в обычном году?', 365], ['Сколько минут в половине часа?', 30], ['Сколько минут в четверти часа?', 15], ['Сколько рабочих дней в неделе?', 5]];

  function genCalendar(level) {
    if (level === 1) {
      const kind = N(1, 5);
      if (kind === 1) {
        const i = N(0, 6);
        const which = U.pick(['после', 'перед']);
        const ans = DAYS[mod(i + (which === 'после' ? 1 : -1), 7)];
        return { type: 'choice', prompt: 'Какой день идёт <b>' + which + '</b> днём «' + DAYS[i] + '»?',
          options: U.shuffle(U.uniq([ans].concat(U.pickN(DAYS.filter(d => d !== ans), 2)))), answer: ans,
          hint: 'Дни идут по кругу: понедельник, вторник, среда, четверг, пятница, суббота, воскресенье',
          explain: which === 'после' ? 'После дня «' + DAYS[i] + '» идёт ' + ans + '.' : 'Перед днём «' + DAYS[i] + '» идёт ' + ans + '.' };
      }
      if (kind === 2) {
        const f = U.pick(CAL_FACTS.slice(0, 5));
        return { type: 'choice', prompt: f[0], options: U.numOpts(f[1], 2, 2, 14), answer: String(f[1]), explain: f[0].replace('?', '') + ' — ' + f[1] + '.' };
      }
      if (kind === 3) {
        const h = N(1, 12);
        return { type: 'choice', prompt: 'Который час показывают часы?', visual: V.clock(h, 0),
          options: U.shuffle(U.uniq([h + ' часов', ((h % 12) + 1) + ' часов', (h === 1 ? 12 : h - 1) + ' часов'])), answer: h + ' часов',
          hint: 'Короткая стрелка — часы, длинная на 12 — значит ровно', explain: 'Ровно ' + h + ' часов.' };
      }
      if (kind === 4) {
        const s = U.pick(Object.keys(SEASONS));
        const m = U.pick(SEASONS[s]);
        return { type: 'choice', prompt: 'К какому времени года относится <b>' + m + '</b>?',
          options: U.shuffle(Object.keys(SEASONS)), answer: s, explain: U.cap(m) + ' — это ' + s.split(' ')[0].toLowerCase() + '.' };
      }
      const t = U.pick(TIMES_OF_DAY);
      return { type: 'choice', prompt: 'Часы показывают <b>' + fmtTime(t[0], 0) + '</b>. Это утро, день, вечер или ночь?',
        options: U.shuffle(['утро', 'день', 'вечер', 'ночь']), answer: t[1],
        hint: 'Утро — примерно с 6 до 11, день — с 12 до 17, вечер — с 18 до 22, ночь — с 23 до 5',
        explain: fmtTime(t[0], 0) + ' — это ' + t[1] + '.' };
    }
    if (level === 2) {
      const kind = N(1, 5);
      if (kind === 1) return { type: 'order', prompt: 'Расставь дни недели по порядку', items: DAYS.slice(), explain: 'Порядок: ' + DAYS.join(', ') + '.' };
      if (kind === 2) {
        const s = U.pickN(Object.keys(SEASONS), 2);
        return { type: 'sort', prompt: 'Разложи месяцы по временам года', groups: s.map(k => ({ name: k, items: SEASONS[k].slice() })),
          explain: s.map(k => k.split(' ')[0] + ': ' + SEASONS[k].join(', ')).join('; ') + '.' };
      }
      if (kind === 3) {
        const h = N(1, 12), m = U.pick([15, 30, 45]);
        const ans = fmtTime(h, m);
        const opts = U.uniq([ans, fmtTime(h, (m + 30) % 60), fmtTime((h % 12) + 1, m), fmtTime(h, m === 15 ? 45 : 15)]).slice(0, 4);
        return { type: 'choice', prompt: 'Какое время показывают часы?', visual: V.clock(h, m), options: U.shuffle(opts), answer: ans,
          hint: 'Длинная стрелка на 3 — 15 минут, на 6 — 30, на 9 — 45', explain: 'Это ' + ans + '.' };
      }
      if (kind === 4) {
        const i = N(0, 6), step = N(2, 3);
        const ans = DAYS[mod(i + step, 7)];
        return { type: 'choice', prompt: 'Сегодня <b>' + DAYS[i] + '</b>. Какой день будет через ' + U.count(step, ['день', 'дня', 'дней']) + '?',
          options: U.shuffle(U.uniq([ans].concat(U.pickN(DAYS.filter(d => d !== ans), 3)))), answer: ans,
          hint: 'Отсчитай по дням, а после воскресенья снова понедельник',
          explain: 'От дня «' + DAYS[i] + '» через ' + step + ' — это ' + ans + '.' };
      }
      const f = U.pick(CAL_FACTS);
      return { type: 'input', mode: 'num', prompt: f[0], answer: f[1], explain: f[0].replace('?', '') + ' — ' + f[1] + '.' };
    }
    const kind = N(1, 5);
    if (kind === 1) {
      const h = N(1, 12), m = N(1, 11) * 5;
      return { type: 'choice', prompt: 'Какое время показывают часы?', visual: V.clock(h, m),
        options: U.shuffle(U.uniq([fmtTime(h, m), fmtTime(h, (m + 5) % 60), fmtTime(h, (m + 55) % 60), fmtTime((h % 12) + 1, m)])), answer: fmtTime(h, m),
        hint: 'Считай минуты по пять: каждая цифра циферблата — это 5 минут', explain: 'Минутная стрелка на ' + (m / 5) + ' — это ' + m + ' минут: ' + fmtTime(h, m) + '.' };
    }
    if (kind === 2) {
      const h = N(1, 11), m = U.pick([0, 10, 15, 20, 30, 40]), add = U.pick([15, 20, 25, 30, 45]);
      let nh = h, nm = m + add;
      if (nm >= 60) { nm -= 60; nh++; }
      return { type: 'input', mode: 'text', prompt: 'Сейчас <b>' + fmtTime(h, m) + '</b>. Какое время будет через <b>' + add + ' минут</b>? Запиши, например, 7:45',
        visual: V.clock(h, m), answer: [fmtTime(nh, nm), nh + '.' + String(nm).padStart(2, '0')],
        hint: 'Прибавь минуты; если получилось 60 и больше — прибавь час, а из минут вычти 60',
        explain: fmtTime(h, m) + ' + ' + add + ' мин = ' + fmtTime(nh, nm) + '.' };
    }
    if (kind === 3) {
      const i = N(0, 6), step = N(8, 15);
      const ans = DAYS[mod(i + step, 7)];
      return { type: 'input', mode: 'text', prompt: 'Сегодня <b>' + DAYS[i] + '</b>. Какой день недели будет через ' + U.count(step, ['день', 'дня', 'дней']) + '?',
        answer: ans, hint: 'Через 7 дней будет тот же день недели, так что вычти из ' + step + ' семёрку',
        explain: 'Через 7 дней снова ' + DAYS[i] + ', значит через ' + step + ' — это ещё ' + (step - 7) + ' ' + U.plural(step - 7, ['день', 'дня', 'дней']) + ': ' + ans + '.' };
    }
    if (kind === 4) {
      const m = N(0, 11);
      return { type: 'input', mode: 'num', prompt: 'Каким по счёту месяцем в году идёт <b>' + MONTHS[m] + '</b>?',
        answer: m + 1, hint: 'Начинай считать с января', explain: U.cap(MONTHS[m]) + ' — ' + (m + 1) + '-й месяц года.' };
    }
    const h1 = N(8, 11), m1 = U.pick([0, 15, 30]), diff = U.pick([25, 40, 45, 50, 60, 75, 90]);
    const t2 = h1 * 60 + m1 + diff, h2 = Math.floor(t2 / 60), m2 = t2 % 60;
    return { type: 'input', mode: 'num', prompt: 'Мультфильм начался в <b>' + fmtTime(h1, m1) + '</b>, а закончился в <b>' + fmtTime(h2, m2) + '</b>. Сколько <b>минут</b> он шёл?',
      answer: diff, hint: 'Сначала посчитай целые часы, потом минуты', explain: 'От ' + fmtTime(h1, m1) + ' до ' + fmtTime(h2, m2) + ' прошло ' + diff + ' минут.' };
  }

  /* =====================================================================
     11. Мемори: тренируем память
     ===================================================================== */
  const MEM_ANIMALS = [['🐱', 'кошка'], ['🐶', 'собака'], ['🐭', 'мышка'], ['🐰', 'заяц'], ['🦊', 'лиса'], ['🐻', 'медведь'], ['🐼', 'панда'], ['🐸', 'лягушка'], ['🐝', 'пчела'], ['🦋', 'бабочка'], ['🐧', 'пингвин'], ['🐢', 'черепаха'], ['🐄', 'корова'], ['🐔', 'курица'], ['🐷', 'свинья'], ['🐺', 'волк']];
  const MEM_NUM = [['один', '1'], ['два', '2'], ['три', '3'], ['четыре', '4'], ['пять', '5'], ['шесть', '6'], ['семь', '7'], ['восемь', '8'], ['девять', '9'], ['десять', '10']];
  const MEM_BABY = [['🐄 корова', 'телёнок'], ['🐴 лошадь', 'жеребёнок'], ['🐷 свинья', 'поросёнок'], ['🐑 овца', 'ягнёнок'], ['🐐 коза', 'козлёнок'], ['🐔 курица', 'цыплёнок'], ['🦆 утка', 'утёнок'], ['🐶 собака', 'щенок'], ['🐱 кошка', 'котёнок'], ['🦊 лиса', 'лисёнок'], ['🐺 волк', 'волчонок'], ['🐻 медведь', 'медвежонок'], ['🐰 заяц', 'зайчонок'], ['🐿️ белка', 'бельчонок'], ['🦁 лев', 'львёнок'], ['🐘 слон', 'слонёнок']];
  const MEM_CAP = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ'.split('').map(c => [c, c.toLowerCase()]);
  const MEM_EN = [['cat', 'кот'], ['dog', 'собака'], ['fish', 'рыба'], ['bird', 'птица'], ['apple', 'яблоко'], ['milk', 'молоко'], ['red', 'красный'], ['blue', 'синий'], ['house', 'дом'], ['sun', 'солнце'], ['book', 'книга'], ['ball', 'мяч'], ['mother', 'мама'], ['school', 'школа']];
  const MEM_CAPITAL = [['Россия', 'Москва'], ['Франция', 'Париж'], ['Англия', 'Лондон'], ['Италия', 'Рим'], ['Германия', 'Берлин'], ['Китай', 'Пекин'], ['Япония', 'Токио'], ['Египет', 'Каир']];

  /** Пары «пример — ответ», все ответы разные */
  function mathPairs(n, level) {
    const pairs = [], used = new Set();
    let guard = 0;
    while (pairs.length < n && guard < 200) {
      guard++;
      let a, b, op, res;
      if (level === 1) { a = N(1, 9); b = N(1, 9 - a); op = '+'; res = a + b; }
      else if (level === 2) { a = N(5, 18); b = N(1, 9); op = U.chance(0.5) ? '+' : '−'; res = op === '+' ? a + b : a - b; }
      else { a = N(2, 9); b = N(2, 9); op = U.chance(0.5) ? '·' : '+'; res = op === '·' ? a * b : a + b; }
      if (res < 1 || used.has(res)) continue;
      used.add(res);
      pairs.push([a + ' ' + op + ' ' + b, String(res)]);
    }
    return pairs;
  }

  function genMemory(level) {
    const n = level === 1 ? 3 : level === 2 ? 4 : 6;
    const kind = N(1, level === 1 ? 4 : 6);
    if (kind === 1) {
      const p = U.pickN(MEM_ANIMALS, n);
      return { type: 'memory', prompt: 'Найди пары: картинка и название', pairs: p, explain: 'Пары: ' + p.map(x => x[0] + ' — ' + x[1]).join(', ') + '.' };
    }
    if (kind === 2) {
      const p = U.pickN(MEM_NUM, n);
      return { type: 'memory', prompt: 'Найди пары: число словом и цифрой', pairs: p, explain: 'Пары: ' + p.map(x => x[0] + ' — ' + x[1]).join(', ') + '.' };
    }
    if (kind === 3) {
      const p = U.pickN(MEM_CAP, n);
      return { type: 'memory', prompt: 'Найди пары: большая и маленькая буква', pairs: p, explain: 'Каждой заглавной букве соответствует строчная.' };
    }
    if (kind === 4) {
      const row = U.pickN(EMO, N(6, 8));
      const absent = U.pick(EMO.filter(e => !row.includes(e)));
      const present = U.pickN(row, 3);
      return { type: 'choice', big: true, prompt: 'Посмотри на ряд. Какой картинки в нём <b>нет</b>?', visual: emojiRow(row),
        options: U.shuffle([absent].concat(present)), answer: absent, hint: 'Проверяй по очереди каждый вариант',
        explain: 'В ряду есть ' + present.join(' ') + ', а ' + absent + ' — нет.' };
    }
    if (kind === 5) {
      const p = U.pickN(level === 3 ? MEM_BABY : MEM_ANIMALS, n);
      return { type: 'memory', prompt: 'Найди пары: взрослое животное и детёныш', pairs: p, explain: 'Пары: ' + p.map(x => x[0] + ' — ' + x[1]).join(', ') + '.' };
    }
    if (kind === 6 && level === 3) {
      const mode = N(1, 3);
      if (mode === 1) {
        const p = mathPairs(n, level);
        if (p.length < 3) return genMemory(level);
        return { type: 'memory', prompt: 'Найди пары: пример и его ответ', pairs: p, explain: 'Пары: ' + p.map(x => x[0] + ' = ' + x[1]).join(', ') + '.' };
      }
      if (mode === 2) {
        const p = U.pickN(MEM_EN, n);
        return { type: 'memory', prompt: 'Найди пары: английское слово и перевод', pairs: p, explain: 'Пары: ' + p.map(x => x[0] + ' — ' + x[1]).join(', ') + '.' };
      }
      const p = U.pickN(MEM_CAPITAL, Math.min(n, MEM_CAPITAL.length));
      return { type: 'memory', prompt: 'Найди пары: страна и её столица', pairs: p, explain: 'Пары: ' + p.map(x => x[0] + ' — ' + x[1]).join(', ') + '.' };
    }
    const p = mathPairs(n, level);
    if (p.length < 3) return genMemory(level);
    return { type: 'memory', prompt: 'Найди пары: пример и его ответ', pairs: p, explain: 'Пары: ' + p.map(x => x[0] + ' = ' + x[1]).join(', ') + '.' };
  }

  /* =====================================================================
     12. Зеркало и симметрия
     ===================================================================== */
  const SYM_THINGS = [['бабочка', '🦋'], ['снежинка', '❄️'], ['сердце', '❤️'], ['ёлка', '🌲'], ['кленовый лист', '🍁'], ['гриб', '🍄'],
    ['мяч', '⚽'], ['звезда', '⭐'], ['солнце', '☀️'], ['цветок', '🌼']];
  const ASYM_THINGS = [['ботинок', '🥾'], ['флаг', '🚩'], ['чайник', '🫖'], ['ложка', '🥄'], ['гитара', '🎸'], ['молоток', '🔨'],
    ['карандаш', '✏️'], ['ключ', '🔑'], ['нож', '🔪'], ['кроссовок', '👟']];
  const MIR_DIG_OK = ['0', '8'];
  const MIR_DIG_NO = ['2', '3', '4', '5', '6', '7', '9'];
  const AXES_FIG = [['квадрат', 4], ['прямоугольник', 2], ['равносторонний треугольник', 3]];
  const AXES_GEN = { 'квадрат': 'квадрата', 'прямоугольник': 'прямоугольника', 'равносторонний треугольник': 'равностороннего треугольника' };
  const axesWord = n => U.count(n, ['ось', 'оси', 'осей']);
  const thingLabel = t => t[1] + ' ' + t[0];

  function genMirror(level) {
    if (level === 1) {
      const kind = N(1, 5);
      if (kind === 1) {
        const L = U.pick(MIRROR_OK);
        return { type: 'choice', big: true, prompt: 'Какая буква в зеркале останется <b>точно такой же</b>?',
          options: U.shuffle([L].concat(U.pickN(MIRROR_NO, 2))), answer: L,
          hint: 'Проведи через букву черту сверху вниз: если половинки одинаковые — в зеркале не изменится',
          explain: 'У буквы ' + L + ' левая и правая половинки одинаковые, поэтому в зеркале она такая же.' };
      }
      if (kind === 2) {
        const s = U.pick(SYM_THINGS);
        return { type: 'choice', big: true, prompt: 'Какую картинку можно сложить пополам так, чтобы половинки совпали?',
          options: U.shuffle([s[1]].concat(U.pickN(ASYM_THINGS, 2).map(x => x[1]))), answer: s[1],
          hint: 'Проведи воображаемую черту сверху вниз через середину картинки',
          explain: 'На картинке ' + s[0] + ' ' + s[1] + ': её левая половинка точно такая же, как правая.' };
      }
      if (kind === 3) {
        const d = U.pick(MIR_DIG_OK);
        return { type: 'choice', big: true, prompt: 'Какая цифра в зеркале выглядит <b>так же</b>, как и была?',
          options: U.shuffle([d].concat(U.pickN(MIR_DIG_NO, 2))), answer: d,
          hint: 'Симметричная цифра складывается пополам ровно: у неё половинки одинаковые',
          explain: 'Цифра ' + d + ' симметричная, поэтому в зеркале она не меняется.' };
      }
      if (kind === 4) {
        const L = U.pick(MIRROR_NO);
        return { type: 'choice', big: true, prompt: 'Какая буква в зеркале <b>изменится</b>?',
          options: U.shuffle([L].concat(U.pickN(MIRROR_OK, 2))), answer: L,
          hint: 'У симметричной буквы половинки одинаковые, у несимметричной — разные',
          explain: 'Буква ' + L + ' несимметричная: её половинки разные, в зеркале она повернётся.' };
      }
      const f = U.pick(AXES_FIG);
      return { type: 'choice', prompt: 'Сколько осей симметрии у ' + AXES_GEN[f[0]] + '?',
        options: U.opts(f[1], U.pickN([1, 2, 3, 4, 5].filter(x => x !== f[1]), 2)), answer: String(f[1]),
        hint: 'Ось симметрии — линия, по которой фигуру складывают пополам и половинки совпадают',
        explain: 'У ' + AXES_GEN[f[0]] + ' ' + axesWord(f[1]) + ' симметрии.' };
    }
    if (level === 2) {
      const kind = N(1, 6);
      if (kind === 1) {
        const all = [['квадрата', '4'], ['прямоугольника', '2'], ['равностороннего треугольника', '3'], ['круга', 'бесконечно много']];
        const f = U.pick(all);
        return { type: 'choice', prompt: 'Сколько осей симметрии у <b>' + f[0] + '</b>?',
          options: U.opts(f[1], U.pickN(['1', '2', '3', '4', 'бесконечно много'].filter(x => x !== f[1]), 3)), answer: f[1],
          hint: 'У круга любая линия через центр делит его на одинаковые половинки',
          explain: 'У ' + f[0] + ' осей симметрии — ' + f[1] + '.' };
      }
      if (kind === 2) {
        const row = U.pickN(EMO, 4);
        const rev = row.slice().reverse();
        return { type: 'order', prompt: 'Этот ряд поднесли к зеркалу. Расставь картинки так, как их видно <b>в зеркале</b>.',
          visual: emojiRow(row), items: rev,
          hint: 'В зеркале ряд читается наоборот: последняя картинка становится первой',
          explain: 'В зеркале порядок переворачивается: ' + rev.join(' ') + '.' };
      }
      if (kind === 3) {
        const row = U.pickN(EMO, 4);
        const rev = row.slice().reverse().join('');
        const others = [];
        let guard = 0;
        while (others.length < 3 && guard++ < 60) {
          const p = U.shuffle(row).join('');
          if (p !== rev && !others.includes(p)) others.push(p);
        }
        return { type: 'choice', prompt: 'Ряд ' + row.join('') + ' поднесли к зеркалу. Что будет видно в зеркале?',
          options: U.opts(rev, others), answer: rev,
          hint: 'Переверни ряд: первая картинка окажется последней',
          explain: 'В зеркале ряд читается наоборот: ' + rev + '.' };
      }
      if (kind === 4) {
        return { type: 'sort', prompt: 'Разложи буквы: какие в зеркале не меняются, а какие меняются?',
          groups: [{ name: 'В зеркале такие же 🪞', items: U.pickN(MIRROR_OK, 3) }, { name: 'В зеркале меняются ↔️', items: U.pickN(MIRROR_NO, 3) }],
          explain: 'Симметричные буквы: А, О, Т, Н, Ф, Х, М, П, Ш, Ж, Д, Л — у них половинки одинаковые.' };
      }
      if (kind === 5) {
        const s = U.pickN(SYM_THINGS, 3), a = U.pickN(ASYM_THINGS, 3);
        return { type: 'sort', prompt: 'Разложи картинки: симметричные и несимметричные.',
          groups: [{ name: 'Симметричные 🪞', items: s.map(thingLabel) }, { name: 'Несимметричные ↔️', items: a.map(thingLabel) }],
          explain: 'Симметричные здесь: ' + s.map(x => x[0]).join(', ') + '.' };
      }
      const bank = [['квадрат', '4 оси'], ['прямоугольник', '2 оси'], ['равносторонний треугольник', '3 оси'], ['круг', 'бесконечно много осей']];
      const pairs = U.pickN(bank, 3);
      return { type: 'match', prompt: 'Соедини фигуру и число её осей симметрии', pairs: pairs,
        explain: pairs.map(p => U.cap(p[0]) + ' — ' + p[1]).join('; ') + '.' };
    }
    const kind = N(1, 6);
    if (kind === 1) {
      const ok = U.pickN(MIRROR_OK, 3), no = U.pickN(MIRROR_NO, 3);
      return { type: 'choice', multi: true, prompt: 'Выбери <b>все</b> буквы, которые в зеркале остаются такими же',
        options: U.shuffle(ok.concat(no)), answer: ok,
        explain: 'Симметричные буквы здесь: ' + ok.join(', ') + '. У них левая и правая половинки одинаковые.' };
    }
    if (kind === 2) {
      const s = U.pickN(SYM_THINGS, 3), a = U.pickN(ASYM_THINGS, 3);
      return { type: 'choice', multi: true, prompt: 'Выбери <b>все</b> симметричные предметы',
        options: U.shuffle(s.concat(a).map(thingLabel)), answer: s.map(thingLabel),
        explain: 'Симметричные: ' + s.map(x => x[0]).join(', ') + ' — их можно сложить пополам ровно.' };
    }
    if (kind === 3) {
      const f = U.pick(AXES_FIG);
      return { type: 'input', mode: 'num', prompt: 'Сколько осей симметрии у ' + AXES_GEN[f[0]] + '? Напиши число.',
        answer: f[1], hint: 'Сложи фигуру пополам всеми способами и посчитай линии',
        explain: 'У ' + AXES_GEN[f[0]] + ' ' + axesWord(f[1]) + ' симметрии.' };
    }
    if (kind === 4) {
      const row = U.pickN(EMO, 5);
      const rev = row.slice().reverse();
      return { type: 'order', prompt: 'Расставь картинки так, как этот ряд видно в <b>зеркале</b>.',
        visual: emojiRow(row), items: rev,
        explain: 'Зеркало переворачивает ряд: ' + rev.join(' ') + '.' };
    }
    if (kind === 5) {
      return { type: 'choice', prompt: 'У какой фигуры <b>бесконечно много</b> осей симметрии?',
        options: U.shuffle(['круг', 'квадрат', 'прямоугольник', 'равносторонний треугольник']), answer: 'круг',
        explain: 'У круга любая прямая через центр делит его на две одинаковые половинки, поэтому осей бесконечно много.' };
    }
    const two = U.pickN(AXES_FIG, 2).sort((x, y) => y[1] - x[1]);
    const diff = two[0][1] - two[1][1];
    return { type: 'input', mode: 'num', prompt: 'На сколько осей симметрии у ' + AXES_GEN[two[0][0]] + ' больше, чем у ' + AXES_GEN[two[1][0]] + '?',
      answer: diff, hint: 'Посчитай оси у каждой фигуры и вычти',
      explain: two[0][1] + ' − ' + two[1][1] + ' = ' + diff + '.' };
  }

  /* =====================================================================
     13. Лабиринт и маршруты
     ===================================================================== */
  const DIR_WORD = { R: 'вправо', L: 'влево', D: 'вниз', U: 'вверх' };
  const DIR_ARROW = { R: '→', L: '←', D: '↓', U: '↑' };
  const cmdWords = arr => arr.map(c => DIR_WORD[c]).join(', ');
  /** Маршрут только вправо и вниз (клетки не повторяются), команды перемешаны */
  function monoPath(r1, c1, r2, c2) {
    const cmds = [];
    for (let i = 0; i < c2 - c1; i++) cmds.push('R');
    for (let i = 0; i < r2 - r1; i++) cmds.push('D');
    return U.shuffle(cmds);
  }
  /** Клетки, которые робот пройдёт, начиная со стартовой */
  function pathCells(g, r, c, cmds) {
    const cells = [g[r][c]];
    let rr = r, cc = c;
    cmds.forEach(cm => {
      if (cm === 'R') cc++; else if (cm === 'L') cc--; else if (cm === 'D') rr++; else rr--;
      cells.push(g[rr][cc]);
    });
    return cells;
  }
  /** Текст маршрута: «2 шага вправо, 1 шаг вниз» */
  function routeText(cmds) {
    const cnt = {};
    cmds.forEach(c => { cnt[c] = (cnt[c] || 0) + 1; });
    return Object.keys(cnt).map(k => U.count(cnt[k], ['шаг', 'шага', 'шагов']) + ' ' + DIR_WORD[k]).join(', ');
  }
  function someRoute(len) {
    const out = [];
    for (let i = 0; i < len; i++) out.push(U.chance(0.5) ? 'R' : 'D');
    return out;
  }
  /** [строк клеток, столбцов клеток, число путей] — сочетания, они же треугольник Паскаля */
  const PATHS = [[1, 2, 3], [1, 3, 4], [2, 2, 6], [2, 3, 10], [3, 2, 10], [3, 3, 20], [2, 4, 15]];

  function genMaze(level) {
    if (level === 1) {
      const kind = N(1, 5);
      const g = makeGrid(3, 3);
      if (kind === 1) {
        const r1 = N(0, 2), c1 = N(0, 2);
        let r2 = N(0, 2), c2 = N(0, 2);
        if (r1 === r2 && c1 === c2) { r2 = (r1 + 1) % 3; c2 = (c1 + 1) % 3; }
        const steps = Math.abs(r1 - r2) + Math.abs(c1 - c2);
        return { type: 'choice', prompt: 'Сколько шагов от ' + g[r1][c1] + ' до ' + g[r2][c2] + '? Ходить можно вверх, вниз, влево и вправо.',
          visual: V.grid(g), options: U.numOpts(steps, 2, 1, 6), answer: String(steps),
          hint: 'Посчитай шаги по строкам и по столбцам, потом сложи',
          explain: 'По строкам ' + Math.abs(r1 - r2) + ', по столбцам ' + Math.abs(c1 - c2) + ': всего ' + steps + '.' };
      }
      if (kind === 2) {
        const r = N(0, 1), c = N(0, 1);
        const cmds = monoPath(r, c, r + N(0, 1), c + N(1, 1));
        const cells = pathCells(g, r, c, cmds);
        const target = cells[cells.length - 1];
        return { type: 'choice', big: true, prompt: 'Робот стоит на ' + g[r][c] + ' и выполняет команды: <b>' + cmdWords(cmds) + '</b>. Куда он придёт?',
          visual: V.grid(g), options: U.shuffle(U.uniq([target].concat(U.pickN(g.flat().filter(x => x !== target && x !== g[r][c]), 2)))), answer: target,
          hint: 'Вправо — соседняя клетка в той же строке, вниз — соседняя клетка в том же столбце',
          explain: 'Робот прошёл ' + cells.join(' → ') + '.' };
      }
      if (kind === 3) {
        const a = someRoute(2), b = someRoute(4);
        return { type: 'choice', prompt: 'Какой путь <b>короче</b>?',
          options: U.shuffle([routeText(a), routeText(b)]), answer: routeText(a),
          hint: 'Посчитай, сколько всего шагов в каждом пути',
          explain: 'Короче путь из 2 шагов: ' + routeText(a) + '. В другом пути шагов 4.' };
      }
      if (kind === 4) {
        const r = N(0, 1), c = N(0, 1);
        const cmds = monoPath(r, c, r + 1, c + 1);
        const cells = pathCells(g, r, c, cmds);
        return { type: 'order', prompt: 'Робот идёт из ' + cells[0] + ' в ' + cells[cells.length - 1] + ': <b>' + cmdWords(cmds) + '</b>. Расставь клетки по порядку пути.',
          visual: V.grid(g), items: cells,
          hint: 'Первая клетка — та, где робот стоял в самом начале',
          explain: 'Путь робота: ' + cells.join(' → ') + '.' };
      }
      const rows = N(2, 3), cols = N(2, 4);
      const st = rows - 1 + cols - 1;
      return { type: 'choice', prompt: 'В сетке ' + rows + '×' + cols + ' клеток. Сколько шагов от левой верхней клетки до правой нижней?',
        visual: V.grid(makeGrid(rows, cols)), options: U.numOpts(st, 2, 1, 7), answer: String(st),
        hint: 'Вниз надо пройти на одну строку меньше, чем всего строк, и так же вправо',
        explain: 'Вниз ' + (rows - 1) + ', вправо ' + (cols - 1) + ': всего ' + st + ' ' + U.plural(st, ['шаг', 'шага', 'шагов']) + '.' };
    }
    if (level === 2) {
      const kind = N(1, 5);
      const g = makeGrid(4, 4);
      if (kind === 1) {
        const r1 = N(0, 3), c1 = N(0, 3);
        let r2 = N(0, 3), c2 = N(0, 3);
        if (r1 === r2 && c1 === c2) { r2 = (r1 + 2) % 4; c2 = (c1 + 1) % 4; }
        const steps = Math.abs(r1 - r2) + Math.abs(c1 - c2);
        return { type: 'input', mode: 'num', prompt: 'Сколько шагов от ' + g[r1][c1] + ' до ' + g[r2][c2] + '? Ходить можно только вверх, вниз, влево и вправо.',
          visual: V.grid(g), answer: steps, hint: 'Сложи шаги по строкам и шаги по столбцам',
          explain: 'По строкам ' + Math.abs(r1 - r2) + ', по столбцам ' + Math.abs(c1 - c2) + ': ' + steps + '.' };
      }
      if (kind === 2) {
        const r = N(0, 1), c = N(0, 1);
        const cmds = monoPath(r, c, r + N(1, 2), c + N(1, 2));
        const cells = pathCells(g, r, c, cmds);
        return { type: 'order', prompt: 'Робот идёт из ' + cells[0] + ': <b>' + cmdWords(cmds) + '</b>. Расставь клетки по порядку пути.',
          visual: V.grid(g), items: cells,
          hint: 'Выполняй команды по одной и отмечай, в какую клетку попал',
          explain: 'Путь: ' + cells.join(' → ') + '.' };
      }
      if (kind === 3) {
        const r = N(0, 1), c = N(0, 1);
        const cmds = monoPath(r, c, r + N(1, 2), c + N(1, 2));
        const cells = pathCells(g, r, c, cmds);
        const target = cells[cells.length - 1];
        return { type: 'choice', big: true, prompt: 'Робот на ' + g[r][c] + ' выполняет команды: <b>' + cmdWords(cmds) + '</b>. В какой клетке он окажется?',
          visual: V.grid(g), options: U.shuffle(U.uniq([target].concat(U.pickN(g.flat().filter(x => x !== target && x !== g[r][c]), 3)))), answer: target,
          hint: 'Считай команды по порядку, не спеши',
          explain: 'Робот прошёл ' + cells.join(' → ') + '.' };
      }
      if (kind === 4) {
        const r1 = N(0, 1), c1 = N(0, 1);
        const r2 = r1 + N(1, 2), c2 = c1 + N(1, 2);
        const good = cmdWords(monoPath(r1, c1, r2, c2));
        const targets = [];
        for (let i = r1; i < 4; i++) for (let j = c1; j < 4; j++) {
          if ((i === r1 && j === c1) || (i === r2 && j === c2)) continue;
          targets.push([i, j]);
        }
        const bad = U.pickN(targets, 3).map(t => cmdWords(monoPath(r1, c1, t[0], t[1])));
        return { type: 'choice', prompt: 'Робот на ' + g[r1][c1] + '. Какие команды приведут его на ' + g[r2][c2] + '?',
          visual: V.grid(g), options: U.opts(good, bad), answer: good,
          hint: 'Посчитай, на сколько клеток надо сдвинуться вправо и на сколько вниз',
          explain: 'Нужно ' + (c2 - c1) + ' вправо и ' + (r2 - r1) + ' вниз — это «' + good + '».' };
      }
      const lens = U.pickN([2, 3, 4, 5, 6], 3).sort((a, b) => a - b);
      const routes = lens.map(someRoute);
      return { type: 'choice', prompt: 'Робот может пройти тремя путями. Какой путь <b>самый короткий</b>?',
        options: U.shuffle(routes.map(routeText)), answer: routeText(routes[0]),
        hint: 'Сложи шаги в каждом пути и сравни суммы',
        explain: 'Длины путей: ' + lens.join(', ') + '. Самый короткий — ' + routeText(routes[0]) + '.' };
    }
    const kind = N(1, 6);
    if (kind === 1) {
      const p = U.pick(PATHS);
      return { type: 'choice', prompt: 'Сетка ' + p[0] + '×' + p[1] + ' клеток. Муравей ползёт по линиям сетки из левого верхнего угла в правый нижний только вправо и вниз. Сколько у него разных путей?',
        options: U.numOpts(p[2], 3, 2, p[2] + 8), answer: String(p[2]),
        hint: 'Подпиши у каждого перекрёстка, сколькими путями в него можно прийти',
        explain: 'В каждый перекрёсток приходит столько путей, сколько в соседний сверху плюс в соседний слева. По верхнему краю и левому краю всюду по одному пути, дальше числа складываются — в углу получается ' + p[2] + '.' };
    }
    if (kind === 2) {
      const g = makeGrid(4, 4);
      const r1 = N(0, 3), c1 = N(0, 3);
      let r2 = N(0, 3), c2 = N(0, 3);
      if (r1 === r2 && c1 === c2) { r2 = (r1 + 3) % 4; c2 = (c1 + 2) % 4; }
      const steps = Math.abs(r1 - r2) + Math.abs(c1 - c2);
      return { type: 'input', mode: 'num', prompt: 'Самый короткий путь от ' + g[r1][c1] + ' до ' + g[r2][c2] + ' — сколько в нём шагов?',
        visual: V.grid(g), answer: steps, hint: 'Шаги по строкам плюс шаги по столбцам',
        explain: 'По строкам ' + Math.abs(r1 - r2) + ' и по столбцам ' + Math.abs(c1 - c2) + ': всего ' + steps + '.' };
    }
    if (kind === 3) {
      const g = makeGrid(4, 4);
      const r = N(0, 3), c = N(0, 3);
      const at2 = [], other = [];
      g.forEach((row, i) => row.forEach((e, j) => {
        const d = Math.abs(i - r) + Math.abs(j - c);
        if (d === 2) at2.push(e); else if (d > 0) other.push(e);
      }));
      const good = U.pickN(at2, 3);
      return { type: 'choice', multi: true, big: true, prompt: 'Робот стоит на ' + g[r][c] + '. Выбери <b>все</b> клетки, до которых ровно <b>2 шага</b>.',
        visual: V.grid(g), options: U.shuffle(good.concat(U.pickN(other, 3))), answer: good,
        explain: 'Два шага — это или две клетки по прямой, или одна вбок и одна вверх-вниз. Подходят: ' + good.join(' ') + '.' };
    }
    if (kind === 4) {
      const g = makeGrid(4, 4);
      const r = N(0, 1), c = N(0, 1);
      const cmds = monoPath(r, c, r + 2, c + N(2, 2));
      const cells = pathCells(g, r, c, cmds);
      return { type: 'order', prompt: 'Робот идёт из ' + cells[0] + ': <b>' + cmdWords(cmds) + '</b>. Расставь клетки по порядку пути.',
        visual: V.grid(g), items: cells,
        explain: 'Путь робота: ' + cells.join(' → ') + '.' };
    }
    if (kind === 5) {
      const rows = N(3, 6), cols = N(3, 6);
      const st = rows - 1 + cols - 1;
      return { type: 'input', mode: 'num', prompt: 'В сетке ' + rows + ' строк и ' + cols + ' столбцов клеток. Сколько шагов в самом коротком пути из левой верхней клетки в правую нижнюю?',
        answer: st, hint: 'Вниз надо пройти на 1 меньше, чем строк, вправо — на 1 меньше, чем столбцов',
        explain: '(' + rows + ' − 1) + (' + cols + ' − 1) = ' + st + '.' };
    }
    const p = U.pick(PATHS);
    return { type: 'input', mode: 'num', prompt: 'Сетка ' + p[0] + '×' + p[1] + ' клеток. Сколько разных путей из левого верхнего угла в правый нижний, если идти по линиям только вправо и вниз?',
      answer: p[2], hint: 'Подписывай перекрёстки: число путей в перекрёсток = сверху + слева',
      explain: 'Складывая числа путей у перекрёстков (сверху + слева), в правом нижнем углу получаем ' + p[2] + '.' };
  }

  /* =====================================================================
     14. Шифры и коды
     ===================================================================== */
  const ALPH33 = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');
  const codeOf = ch => ALPH33.indexOf(ch.toUpperCase()) + 1;
  const letterOf = n => ALPH33[n - 1];
  const numsOf = w => w.split('').map(codeOf);
  const shiftWord = (w, d) => w.split('').map(ch => ALPH33[mod(ALPH33.indexOf(ch.toUpperCase()) + d, 33)].toLowerCase()).join('');
  /** Буквы, удобные для заданий: без Ё, Й, Ъ, Ы, Ь */
  const ALPH_PICK = ALPH33.filter(c => !'ЁЙЪЫЬ'.includes(c));
  const VOWELS = 'аеёиоуыэюя';
  const skeleton = w => w.split('').map(ch => VOWELS.includes(ch) ? '_' : ch.toUpperCase()).join('');
  const CIPH_S = ANA1.filter(p => p[0].length <= 4);
  const CIPH_M = ANA1.filter(p => p[0].length >= 4);
  const CIPH_UNIQ = ANA1.filter(p => p[0].length <= 4 && new Set(p[0].split('')).size === p[0].length);
  const KEY_EMO = ['🍎', '🍌', '🍒', '🍇', '🍓', '🥝', '🍑', '🍐', '🍉'];
  /* Слова, у которых «следующая буква алфавита» даёт обычные буквы (без Ё, Й, Ъ, Ы, Ь) */
  const NEXT_SAFE = ['кот', 'дом', 'сом', 'сон', 'нос', 'лук', 'мак', 'рак', 'сад', 'зуб', 'стол', 'мост', 'парк', 'шарф', 'слон',
    'волк', 'крот', 'плот', 'торт', 'бор', 'дуб', 'бант', 'куст', 'мох', 'пар', 'храм', 'зонт', 'стул', 'банк', 'банан', 'сахар',
    'лампа', 'кран', 'зал', 'ком', 'пол', 'ток'];

  /** Задание с эмодзи-ключом: возвращает {code, cards} */
  function emojiKey(word) {
    const letters = word.split('');
    const emo = U.pickN(KEY_EMO, letters.length + 1);
    const map = {};
    letters.forEach((ch, i) => { map[ch] = emo[i]; });
    const decoy = U.pickOther(ALPH_PICK.map(c => c.toLowerCase()), letters);
    const cards = U.shuffle(letters.map((ch, i) => [emo[i], ch.toUpperCase()]).concat([[emo[letters.length], decoy.toUpperCase()]]));
    return { code: letters.map(ch => map[ch]).join(''), cards: cards };
  }

  function genCipher(level) {
    if (level === 1) {
      const kind = N(1, 5);
      if (kind === 1) {
        const n = N(1, 20);
        const L = letterOf(n);
        return { type: 'choice', big: true, prompt: 'Какая буква стоит в алфавите под номером <b>' + n + '</b>?',
          options: U.shuffle([L].concat(U.pickN(ALPH_PICK.filter(c => c !== L), 2))), answer: L,
          hint: 'Проговори алфавит с начала и считай буквы',
          explain: 'Буква номер ' + n + ' — это ' + L + '.' };
      }
      if (kind === 2) {
        const L = U.pick(ALPH_PICK.slice(0, 20));
        const n = codeOf(L);
        return { type: 'choice', prompt: 'Какой номер у буквы <b>' + L + '</b> в алфавите?',
          options: U.numOpts(n, 2, 1, 22), answer: String(n),
          hint: 'Считай буквы алфавита по порядку: А — 1, Б — 2, В — 3…',
          explain: 'Буква ' + L + ' стоит ' + n + '-й: её номер ' + n + '.' };
      }
      if (kind === 3) {
        const w = U.pick(CIPH_S);
        const others = U.pickN(CIPH_S.filter(p => p[0] !== w[0]), 2).map(p => p[0]);
        return { type: 'choice', prompt: 'Расшифруй слово: <b>' + numsOf(w[0]).join(', ') + '</b>',
          options: U.opts(w[0], others), answer: w[0],
          hint: 'Каждое число — номер буквы в алфавите: 1 это А, 2 это Б…',
          explain: numsOf(w[0]).map((n, i) => n + ' — ' + letterOf(n)).join(', ') + ': получилось «' + w[0] + '» ' + w[1] + '.' };
      }
      if (kind === 4) {
        const w = U.pick(CIPH_S.filter(p => p[0].split('').some(ch => VOWELS.includes(ch))));
        const idx = w[0].split('').findIndex(ch => VOWELS.includes(ch));
        const vow = w[0][idx];
        const text = w[0].slice(0, idx) + '_' + w[0].slice(idx + 1);
        return { type: 'gap', prompt: 'В слове спряталась гласная. Какая? ' + w[1],
          text: text, answers: [vow], options: U.shuffle(U.uniq([vow].concat(U.pickN('аоиуэ'.split('').filter(c => c !== vow), 2)))),
          hint: 'Посмотри на картинку и назови слово вслух',
          explain: 'На картинке ' + w[1] + ' — это «' + w[0] + '», пропала буква ' + vow.toUpperCase() + '.' };
      }
      const w = U.pick(CIPH_S);
      const rev = w[0].split('').reverse().join('').toUpperCase();
      return { type: 'choice', prompt: 'Слово записали задом наперёд: <b>' + rev + '</b>. Какое это слово?',
        options: U.opts(w[0], U.pickN(CIPH_S.filter(p => p[0] !== w[0]), 2).map(p => p[0])), answer: w[0],
        hint: 'Читай буквы с конца',
        explain: 'Если прочитать ' + rev + ' с конца, получится «' + w[0] + '» ' + w[1] + '.' };
    }
    if (level === 2) {
      const kind = N(1, 7);
      if (kind === 1) {
        const w = U.pick(CIPH_M);
        return { type: 'spell', prompt: 'Расшифруй и собери слово: <b>' + numsOf(w[0]).join(', ') + '</b>',
          word: w[0], extra: U.pickN('бвгджзпфцчшэю'.split('').filter(c => !w[0].includes(c)), 2),
          hint: 'Каждое число — номер буквы: 1 — А, 2 — Б, 3 — В…',
          explain: numsOf(w[0]).join(', ') + ' — это «' + w[0] + '» ' + w[1] + '.' };
      }
      if (kind === 2) {
        const w = U.pick(CIPH_S);
        const good = numsOf(w[0]).join(', ');
        const bad = [numsOf(shiftWord(w[0], 1)).join(', '), numsOf(shiftWord(w[0], -1)).join(', '), numsOf(w[0]).reverse().join(', ')];
        return { type: 'choice', prompt: 'Как записать числами слово <b>' + w[0].toUpperCase() + '</b>?',
          options: U.opts(good, bad), answer: good,
          hint: 'Найди номер каждой буквы по порядку',
          explain: w[0].split('').map(ch => ch.toUpperCase() + ' — ' + codeOf(ch)).join(', ') + '.' };
      }
      if (kind === 3) {
        const w = U.pick(NEXT_SAFE);
        const good = shiftWord(w, 1);
        return { type: 'choice', prompt: 'Шифр «следующая буква»: каждую букву заменяем на следующую по алфавиту. Как зашифруется <b>' + w.toUpperCase() + '</b>?',
          options: U.opts(good, [shiftWord(w, -1), shiftWord(w, 2), w]), answer: good,
          hint: 'Например, КОТ → ЛПУ: после К идёт Л, после О — П, после Т — У',
          explain: w.split('').map((ch, i) => ch.toUpperCase() + ' → ' + good[i].toUpperCase()).join(', ') + '.' };
      }
      if (kind === 4) {
        const w = U.pick(CIPH_UNIQ);
        const k = emojiKey(w[0]);
        return { type: 'choice', prompt: 'Расшифруй слово по ключу: <b>' + k.code + '</b>',
          visual: V.cards(k.cards), options: U.opts(w[0], U.pickN(CIPH_S.filter(p => p[0] !== w[0]), 3).map(p => p[0])), answer: w[0],
          hint: 'Смотри в ключ: каждая картинка — это одна буква',
          explain: 'По ключу получается «' + w[0] + '» ' + w[1] + '.' };
      }
      if (kind === 5) {
        const ls = U.pickN(ALPH_PICK, 4);
        return { type: 'match', prompt: 'Соедини букву и её номер в алфавите', pairs: ls.map(c => [c, String(codeOf(c))]),
          explain: ls.map(c => c + ' — ' + codeOf(c)).join(', ') + '.' };
      }
      if (kind === 6) {
        const w = U.pick(CIPH_M);
        const rev = w[0].split('').reverse().join('');
        return { type: 'input', mode: 'text', prompt: 'Слово записали задом наперёд: <b>' + rev.toUpperCase() + '</b>. Запиши его правильно.',
          answer: w[0], hint: 'Читай буквы справа налево',
          explain: 'Наоборот получается «' + w[0] + '» ' + w[1] + '.' };
      }
      const ls = U.pickN(ALPH_PICK, 4).sort((a, b) => codeOf(a) - codeOf(b));
      return { type: 'order', prompt: 'Расставь буквы по алфавиту — от самой ранней к самой поздней', items: ls,
        hint: 'У буквы, которая идёт раньше, номер меньше',
        explain: ls.map(c => c + ' (' + codeOf(c) + ')').join(' → ') + '.' };
    }
    const kind = N(1, 7);
    if (kind === 1) {
      const w = U.pick(CIPH_M);
      return { type: 'input', mode: 'text', prompt: 'Расшифруй слово: <b>' + numsOf(w[0]).join(', ') + '</b>',
        answer: w[0], hint: 'Число — это номер буквы в алфавите: А — 1, Б — 2, В — 3…',
        explain: numsOf(w[0]).map(n => n + '=' + letterOf(n)).join(', ') + ' — «' + w[0] + '».' };
    }
    if (kind === 2) {
      const w = U.pick(CIPH_S);
      const ns = numsOf(w[0]);
      return { type: 'input', mode: 'text', prompt: 'Зашифруй слово <b>' + w[0].toUpperCase() + '</b> номерами букв. Пиши через запятую.',
        answer: [ns.join(', '), ns.join(','), ns.join(' ')],
        hint: 'Найди номер каждой буквы по порядку и запиши их через запятую',
        explain: w[0].split('').map((ch, i) => ch.toUpperCase() + ' — ' + ns[i]).join(', ') + '.' };
    }
    if (kind === 3) {
      const w = U.pick(NEXT_SAFE);
      return { type: 'input', mode: 'text', prompt: 'Зашифруй слово <b>' + w.toUpperCase() + '</b> шифром «следующая буква алфавита».',
        answer: shiftWord(w, 1), hint: 'КОТ превращается в ЛПУ: каждую букву заменяем на следующую',
        explain: w.toUpperCase() + ' → ' + shiftWord(w, 1).toUpperCase() + '.' };
    }
    if (kind === 4) {
      const w = U.pick(ANA2.filter(p => p[0].length <= 7));
      const rev = w[0].split('').reverse().join('');
      return { type: 'input', mode: 'text', prompt: 'Прочитай наоборот и запиши слово: <b>' + rev.toUpperCase() + '</b>',
        answer: w[0], hint: 'Начинай с последней буквы',
        explain: 'Задом наперёд это «' + w[0] + '» ' + w[1] + '.' };
    }
    if (kind === 5) {
      const w = U.pick(CIPH_UNIQ);
      const k = emojiKey(w[0]);
      return { type: 'spell', prompt: 'Расшифруй по ключу и собери слово: <b>' + k.code + '</b>',
        visual: V.cards(k.cards), word: w[0], extra: U.pickN('бвгджзпфцчшэю'.split('').filter(c => !w[0].includes(c)), 2),
        explain: 'По ключу получается «' + w[0] + '» ' + w[1] + '.' };
    }
    if (kind === 6) {
      const big = U.pickN(ALPH_PICK.filter(c => codeOf(c) > 20), 3);
      const small = U.pickN(ALPH_PICK.filter(c => codeOf(c) <= 20), 3);
      return { type: 'choice', multi: true, prompt: 'Выбери <b>все</b> буквы, у которых номер в алфавите больше 20',
        options: U.shuffle(big.concat(small)), answer: big,
        explain: big.map(c => c + ' — ' + codeOf(c)).join(', ') + '. У остальных номер меньше 20.' };
    }
    const w = U.pick(CIPH_S.filter(p => p[0].length === 3));
    const ns = numsOf(w[0]);
    const sum = ns.reduce((a, b) => a + b, 0);
    return { type: 'input', mode: 'num', prompt: 'Слово <b>' + w[0].toUpperCase() + '</b> зашифровали номерами букв. Чему равна сумма этих номеров?',
      answer: sum, hint: 'Сначала найди номер каждой буквы, потом сложи',
      explain: ns.join(' + ') + ' = ' + sum + '.' };
  }

  /* =====================================================================
     15. Группы и признаки
     ===================================================================== */
  const PROP_ITEMS = [
    ['🍎', 'яблоко', ['round', 'eat', 'red']], ['🍊', 'апельсин', ['round', 'eat']], ['🍅', 'помидор', ['round', 'eat', 'red']],
    ['⚽', 'футбольный мяч', ['round']], ['🏀', 'баскетбольный мяч', ['round']], ['🌕', 'луна', ['round']], ['🪙', 'монета', ['round']],
    ['🍒', 'вишня', ['round', 'eat', 'red']], ['🍉', 'арбуз', ['round', 'eat']], ['🍌', 'банан', ['eat']], ['🍐', 'груша', ['eat', 'green']],
    ['🥒', 'огурец', ['eat', 'green']], ['🥝', 'киви', ['eat', 'green']], ['🍏', 'зелёное яблоко', ['round', 'eat', 'green']],
    ['🍞', 'хлеб', ['eat']], ['🧀', 'сыр', ['eat']], ['🍓', 'клубника', ['eat', 'red']],
    ['🦋', 'бабочка', ['fly', 'alive']], ['🐝', 'пчела', ['fly', 'alive']], ['🦅', 'орёл', ['fly', 'alive']], ['🕊️', 'голубь', ['fly', 'alive']],
    ['✈️', 'самолёт', ['fly']], ['🚀', 'ракета', ['fly']], ['🎈', 'воздушный шарик', ['fly', 'round']],
    ['🐸', 'лягушка', ['green', 'alive', 'swim']], ['🌲', 'ёлка', ['green', 'alive']], ['🐢', 'черепаха', ['green', 'alive', 'swim']],
    ['🐟', 'рыба', ['alive', 'swim']], ['🦈', 'акула', ['alive', 'swim']], ['🐧', 'пингвин', ['alive', 'swim']],
    ['🚢', 'корабль', ['swim']], ['🛶', 'лодка', ['swim']], ['🐱', 'кошка', ['alive']], ['🐶', 'собака', ['alive']],
    ['🌹', 'роза', ['red', 'alive']], ['🌻', 'подсолнух', ['alive']], ['🚗', 'машина', []], ['🪑', 'стул', []]];
  const PROPS = ['round', 'eat', 'fly', 'green', 'red', 'alive', 'swim'];
  const PROP_LABEL = { round: 'все круглые', eat: 'все съедобные', fly: 'все умеют летать', green: 'все зелёные', red: 'все красные', alive: 'все живые', swim: 'все умеют плавать' };
  const SPLIT_LABEL = { round: 'круглые и некруглые', eat: 'съедобные и несъедобные', fly: 'кто летает и кто не летает', green: 'зелёные и не зелёные', red: 'красные и не красные', alive: 'живые и неживые', swim: 'кто плавает и кто не плавает' };
  const PROP_ADJ = { round: 'круглое', eat: 'съедобное', fly: 'умеет летать', green: 'зелёное', red: 'красное', alive: 'живое', swim: 'умеет плавать' };
  const PAIR_PROPS = [['round', 'eat'], ['eat', 'green'], ['eat', 'red'], ['alive', 'fly'], ['alive', 'swim'], ['alive', 'green'], ['round', 'red'], ['green', 'swim']];
  const hasProp = (it, p) => it[2].includes(p);
  const itemsWith = p => PROP_ITEMS.filter(it => hasProp(it, p));
  const itemsWithout = p => PROP_ITEMS.filter(it => !hasProp(it, p));
  const itLabel = it => it[0] + ' ' + it[1];
  const EMO_CATS = GROUP_LABEL_OK.filter(id => withEmo(CAT_BY_ID[id]).length >= 4);
  const LIKES = [['мороженое', 'печенье'], ['сок', 'чай'], ['яблоки', 'бананы'], ['футбол', 'шахматы'], ['рисование', 'лепку'],
    ['кошек', 'собак'], ['конфеты', 'пирожные'], ['лыжи', 'коньки'], ['мультики', 'книги'], ['математику', 'чтение'],
    ['плавание', 'танцы'], ['груши', 'сливы']];

  /** По одному предмету из каждой категории, без повторов слов */
  function pickFromCats(ids, exclude, emoOnly) {
    const used = new Set(exclude);
    const out = [];
    ids.forEach(id => {
      const c = CAT_BY_ID[id];
      const pool = (emoOnly ? withEmo(c) : c.items).filter(it => !used.has(it[0]));
      if (pool.length) { const it = U.pick(pool); used.add(it[0]); out.push(it); }
    });
    return out;
  }
  /** Группы из категорий CATS: по per предметов, без повторов между группами */
  function catGroups(ids, per) {
    const used = new Set();
    return ids.map(id => {
      const c = CAT_BY_ID[id];
      const got = U.pickN(c.items.filter(it => !used.has(it[0])), per);
      got.forEach(it => used.add(it[0]));
      return { name: U.cap(c.many), items: got.map(it => it[1] ? it[1] + ' ' + it[0] : it[0]) };
    });
  }
  /** «Что общего?»: признак + n ловушек, каждая ловушка заведомо неверна */
  function commonTask(n) {
    const p = U.pick(PROPS);
    const set = U.pickN(itemsWith(p), 3);
    const bad = PROPS.filter(q => q !== p && !set.every(it => hasProp(it, q))).map(q => PROP_LABEL[q]);
    return { type: 'choice', prompt: 'Что <b>общего</b> у этих картинок?', visual: emojiRow(set.map(it => it[0])),
      options: U.opts(PROP_LABEL[p], U.pickN(bad, n)), answer: PROP_LABEL[p],
      hint: 'Проверь каждый ответ на всех трёх картинках сразу',
      explain: set.map(it => it[1]).join(', ') + ' — ' + PROP_LABEL[p] + '.' };
  }
  /** «По какому признаку разложили?» */
  function splitTask(n) {
    const p = U.pick(PROPS);
    const a = U.pickN(itemsWith(p), 3), b = U.pickN(itemsWithout(p), 3);
    const bad = PROPS.filter(q => q !== p && !(a.every(it => hasProp(it, q)) && b.every(it => !hasProp(it, q)))).map(q => SPLIT_LABEL[q]);
    return { type: 'choice', prompt: 'По какому <b>признаку</b> разложили картинки?',
      visual: twoRows('Первая куча:', a.map(it => it[0]), 'Вторая куча:', b.map(it => it[0])),
      options: U.opts(SPLIT_LABEL[p], U.pickN(bad, n)), answer: SPLIT_LABEL[p],
      hint: 'Посмотри, чем все картинки первой кучи отличаются от второй',
      explain: 'В первой куче ' + PROP_LABEL[p] + ', во второй — нет.' };
  }
  /** Задача на пересечение: возвращает {total, none, u, inter, a, b} */
  function interData() {
    const total = N(9, 16);
    const none = N(1, 3);
    const u = total - none;
    const inter = N(1, u - 2);
    const a = N(inter + 1, u - 1);
    const b = u + inter - a;
    return { total: total, none: none, u: u, inter: inter, a: a, b: b, w: U.pick(LIKES) };
  }
  const interPrompt = d => 'В классе ' + U.count(d.total, ['ребёнок', 'ребёнка', 'детей']) + '. ' + d.a + ' любят ' + d.w[0] + ', ' +
    d.b + ' любят ' + d.w[1] + ', а ' + (d.none === 1 ? '1 ребёнок не любит' : U.count(d.none, ['ребёнок', 'ребёнка', 'детей']) + ' не любят') + ' ни то ни другое.';
  const interExplain = d => 'Хоть что-то любят ' + d.total + ' − ' + d.none + ' = ' + d.u + '. Сложим: ' + d.a + ' + ' + d.b + ' = ' + (d.a + d.b) +
    ' — тех, кто любит и то и другое, посчитали два раза. Значит их ' + (d.a + d.b) + ' − ' + d.u + ' = ' + d.inter + '.';

  function genSets(level) {
    if (level === 1) {
      const kind = N(1, 5);
      if (kind === 1) return commonTask(2);
      if (kind === 2) {
        const p = U.pick(PROPS);
        const good = U.pickN(itemsWith(p), 2), bad = U.pickN(itemsWithout(p), 2);
        return { type: 'choice', multi: true, big: true, prompt: 'Выбери <b>всё</b>, что ' + PROP_ADJ[p],
          options: U.shuffle(good.concat(bad)).map(it => it[0]), answer: good.map(it => it[0]),
          hint: 'Нажми на каждую подходящую картинку',
          explain: 'Подходят: ' + good.map(it => it[1]).join(', ') + '.' };
      }
      if (kind === 3) {
        const c1 = U.pick(EMO_CATS);
        const c2 = U.pick(CAT_BY_ID[c1].vs.filter(id => withEmo(CAT_BY_ID[id]).length >= 4));
        return { type: 'sort', prompt: 'Разложи картинки по группам', groups: catGroups([c1, c2], 2),
          explain: 'В одну группу — ' + CAT_BY_ID[c1].many + ', в другую — ' + CAT_BY_ID[c2].many + '.' };
      }
      if (kind === 4) return splitTask(2);
      const c = CAT_BY_ID[U.pick(EMO_CATS)];
      const three = U.pickN(withEmo(c), 3);
      const bad = U.pickN(c.vs.filter(id => withEmo(CAT_BY_ID[id]).length), 2).map(id => U.pick(withEmo(CAT_BY_ID[id]))[1]);
      return { type: 'choice', big: true, prompt: 'В этой группе — ' + c.many + ': ' + three[0][1] + ' ' + three[1][1] + '. Что ещё сюда подходит?',
        options: U.opts(three[2][1], bad), answer: three[2][1],
        hint: 'Назови группу одним словом и подумай, кто в неё входит',
        explain: three[2][0] + ' — это ' + c.one + ', значит подходит к группе «' + c.many + '».' };
    }
    if (level === 2) {
      const kind = N(1, 6);
      if (kind === 1) return commonTask(3);
      if (kind === 2) return splitTask(3);
      if (kind === 3) {
        const p = U.pick(PROPS);
        const good = U.pickN(itemsWith(p), 3), bad = U.pickN(itemsWithout(p), 3);
        return { type: 'choice', multi: true, prompt: 'Выбери <b>всё</b>, что ' + PROP_ADJ[p],
          options: U.shuffle(good.concat(bad)).map(itLabel), answer: good.map(itLabel),
          explain: 'Подходят: ' + good.map(it => it[1]).join(', ') + '.' };
      }
      if (kind === 4) {
        const c1 = U.pick(EMO_CATS);
        const c2 = U.pick(CAT_BY_ID[c1].vs.filter(id => CAT_BY_ID[id].items.length >= 5));
        return { type: 'sort', prompt: 'Разложи слова по группам', groups: catGroups([c1, c2], 3),
          explain: U.cap(CAT_BY_ID[c1].many) + ' отдельно, ' + CAT_BY_ID[c2].many + ' отдельно.' };
      }
      if (kind === 5) {
        const d = interData();
        return { type: 'choice', prompt: interPrompt(d) + ' Сколько детей любят <b>и</b> ' + d.w[0] + ', <b>и</b> ' + d.w[1] + '?',
          options: U.numOpts(d.inter, 3, 1, d.u), answer: String(d.inter),
          hint: 'Сначала узнай, сколько детей любят хоть что-то одно, потом сложи ' + d.a + ' и ' + d.b,
          explain: interExplain(d) };
      }
      const c = CAT_BY_ID[U.pick(EMO_CATS)];
      const inC = U.pickN(withEmo(c), 2);
      const out = pickFromCats(U.pickN(c.vs.filter(id => withEmo(CAT_BY_ID[id]).length), 3), inC.map(it => it[0]), true);
      return { type: 'choice', multi: true, prompt: 'Выбери всё, что <b>не</b> входит в группу «' + c.many + '»',
        options: U.shuffle(inC.concat(out)).map(it => it[1] + ' ' + it[0]), answer: out.map(it => it[1] + ' ' + it[0]),
        explain: U.cap(c.many) + ' здесь: ' + inC.map(it => it[0]).join(', ') + '. Всё остальное — не из этой группы.' };
    }
    const kind = N(1, 6);
    if (kind === 1) {
      const d = interData();
      return { type: 'input', mode: 'num', prompt: interPrompt(d) + ' Сколько детей любят и то, и другое?',
        answer: d.inter, hint: 'Хоть что-то любят ' + d.total + ' − ' + d.none + ' детей. Сложи ' + d.a + ' и ' + d.b + ' и сравни.',
        explain: interExplain(d) };
    }
    if (kind === 2) {
      const d = interData();
      return { type: 'input', mode: 'num', prompt: interPrompt(d) + ' Сколько детей любят <b>только</b> ' + d.w[0] + '?',
        answer: d.a - d.inter, hint: 'Сначала найди, сколько любят и то и другое, потом вычти это из ' + d.a,
        explain: interExplain(d) + ' Только ' + d.w[0] + ' любят ' + d.a + ' − ' + d.inter + ' = ' + (d.a - d.inter) + '.' };
    }
    if (kind === 3) {
      const pr = U.pick(PAIR_PROPS);
      const both = U.pickN(PROP_ITEMS.filter(it => hasProp(it, pr[0]) && hasProp(it, pr[1])), 2);
      const only1 = U.pickN(PROP_ITEMS.filter(it => hasProp(it, pr[0]) && !hasProp(it, pr[1])), 2);
      const only2 = U.pickN(PROP_ITEMS.filter(it => !hasProp(it, pr[0]) && hasProp(it, pr[1])), 2);
      return { type: 'choice', multi: true, prompt: 'Выбери всё, что <b>и</b> ' + PROP_ADJ[pr[0]] + ', <b>и</b> ' + PROP_ADJ[pr[1]],
        options: U.shuffle(both.concat(only1, only2)).map(itLabel), answer: both.map(itLabel),
        explain: 'Оба признака сразу есть у: ' + both.map(it => it[1]).join(', ') + '. У остальных только один признак.' };
    }
    if (kind === 4) {
      const c1 = U.pick(EMO_CATS);
      const vs = CAT_BY_ID[c1].vs.filter(id => CAT_BY_ID[id].items.length >= 5);
      const pair = U.pickN(vs, 2);
      return { type: 'sort', prompt: 'Разложи слова на три группы', groups: catGroups([c1].concat(pair), 3),
        explain: 'Группы: ' + [c1].concat(pair).map(id => CAT_BY_ID[id].many).join(', ') + '.' };
    }
    if (kind === 5) {
      const c = CAT_BY_ID[U.pick(EMO_CATS)];
      const inC = U.pickN(c.items, 2);
      const out = pickFromCats(U.pickN(c.vs.filter(id => CAT_BY_ID[id].items.length), 4), inC.map(it => it[0]), false);
      return { type: 'choice', multi: true, prompt: 'Выбери всё, что <b>не</b> входит в группу «' + c.many + '»',
        options: U.shuffle(inC.concat(out)).map(it => it[0]), answer: out.map(it => it[0]),
        explain: 'К группе «' + c.many + '» относятся только ' + inC.map(it => it[0]).join(' и ') + '.' };
    }
    return commonTask(4);
  }

  /* =====================================================================
     16. План и порядок дел
     ===================================================================== */
  const DAY_EVENTS = ['проснуться', 'умыться', 'позавтракать', 'собрать портфель', 'пойти в школу', 'пообедать', 'сделать уроки',
    'погулять', 'поужинать', 'почитать книжку', 'лечь спать'];
  const ALGOS = [
    ['Почистить зубы', ['взять щётку', 'выдавить пасту', 'почистить зубы', 'прополоскать рот', 'убрать щётку на место']],
    ['Посадить семечко', ['насыпать землю в горшок', 'сделать ямку', 'положить семечко', 'засыпать землёй', 'полить водой']],
    ['Перейти дорогу', ['подойти к переходу', 'дождаться зелёного света', 'посмотреть налево и направо', 'перейти дорогу']],
    ['Заварить чай', ['налить воду в чайник', 'вскипятить воду', 'положить заварку в кружку', 'налить кипяток', 'подождать, пока заварится']],
    ['Собрать портфель', ['посмотреть расписание', 'сложить учебники', 'положить пенал', 'положить дневник', 'закрыть портфель']],
    ['Испечь пирог', ['замесить тесто', 'выложить тесто в форму', 'поставить форму в духовку', 'испечь пирог', 'достать пирог из духовки']],
    ['Постирать вещи', ['собрать грязные вещи', 'положить их в машинку', 'насыпать порошок', 'включить стирку', 'развесить бельё сушиться']],
    ['Как из гусеницы получается бабочка', ['яйцо', 'гусеница', 'куколка', 'бабочка']],
    ['Как получается хлеб', ['зерно', 'мука', 'тесто', 'хлеб']],
    ['Как вырастает дерево', ['семечко', 'росток', 'молодое деревце', 'взрослое дерево']],
    ['Помыть руки', ['открыть кран', 'намочить руки', 'намылить руки мылом', 'смыть пену', 'вытереть полотенцем']],
    ['Сварить суп', ['почистить овощи', 'нарезать овощи', 'налить воду в кастрюлю', 'положить овощи в кастрюлю', 'варить суп']],
    ['Купить хлеб', ['взять деньги', 'прийти в магазин', 'взять хлеб с полки', 'заплатить на кассе', 'принести хлеб домой']],
    ['Слепить снеговика', ['скатать большой ком', 'поставить на него средний ком', 'поставить сверху маленький ком', 'сделать глаза и нос']],
    ['Отправить письмо', ['написать письмо', 'положить его в конверт', 'подписать адрес', 'наклеить марку', 'бросить конверт в почтовый ящик']],
    ['Нарисовать рисунок', ['придумать, что рисовать', 'взять альбом и карандаши', 'нарисовать рисунок', 'убрать карандаши на место']],
    ['Полить цветок', ['набрать воду в лейку', 'подойти к цветку', 'полить землю', 'убрать лейку на место']],
    ['Лечь спать', ['убрать игрушки', 'почистить зубы', 'надеть пижаму', 'расстелить кровать', 'выключить свет']],
    ['Как молоко попадает на стол', ['корова ест траву', 'корову доят', 'молоко везут на завод', 'молоко разливают в пакеты', 'молоко продают в магазине']],
    ['Как вырастает яблоко', ['яблоня цветёт', 'на месте цветка появляется завязь', 'яблоко растёт', 'яблоко созревает']]];
  const MIN_TASKS = ['почистить зубы', 'помыть руки', 'съесть яблоко', 'надеть куртку', 'заварить чай', 'полить цветы',
    'застелить кровать', 'позвонить бабушке', 'написать одно слово', 'завязать шнурки'];
  const HOUR_TASKS = ['выспаться ночью', 'провести все уроки в школе', 'испечь большой пирог', 'съездить на поезде в другой город',
    'сходить в поход в лес', 'посмотреть два фильма подряд'];
  const DAYS_TASKS = ['съездить в отпуск к морю', 'вырастить цветок из семечка', 'прочитать толстую книгу', 'построить новый дом',
    'дождаться Нового года'];
  const RANKED_TIME = [['почистить зубы', 3], ['съесть яблоко', 5], ['помыть посуду', 15], ['сделать уроки', 60],
    ['посмотреть фильм', 120], ['провести день в школе', 300], ['выспаться ночью', 540], ['съездить в отпуск', 10080]];
  const SIMUL_OK = ['слушать музыку и рисовать', 'идти и разговаривать', 'мыть посуду и петь', 'ехать в автобусе и читать',
    'гладить кота и смотреть мультик', 'завтракать и слушать радио', 'бежать и смеяться'];
  const SIMUL_NO = ['спать и бегать', 'спать и завтракать', 'молчать и петь', 'сидеть и стоять',
    'плавать в бассейне и кататься на санках', 'есть суп и чистить зубы', 'идти пешком и ехать на велосипеде',
    'закрыть глаза и читать книгу'];
  /* Алгоритмы-действия (без «Как …» — там не действия, а этапы превращения) */
  const ALGO_ACTIONS = ALGOS.filter(a => a[0].slice(0, 3) !== 'Как');
  const stepsList = arr => V.text('<p>' + arr.map((s, i) => (i + 1) + '. ' + U.cap(s)).join('<br>') + '</p>');
  const otherSteps = (algo, n) => U.pickN(ALGOS.filter(a => a[0] !== algo[0]).map(a => U.pick(a[1])).filter(s => !algo[1].includes(s)), n);

  function genPlan(level) {
    if (level === 1) {
      const kind = N(1, 5);
      if (kind === 1) {
        const st = N(0, DAY_EVENTS.length - 4);
        const items = DAY_EVENTS.slice(st, st + 4);
        return { type: 'order', prompt: 'Расставь дела по порядку — что за чем идёт в течение дня', items: items,
          hint: 'Подумай, что бывает раньше: утром или вечером',
          explain: 'По порядку: ' + items.join(' → ') + '.' };
      }
      if (kind === 2) {
        const a = U.pick(ALGOS);
        const two = U.pickN(U.range(0, a[1].length - 1), 2).sort((x, y) => x - y);
        return { type: 'choice', prompt: '<b>' + a[0] + '.</b> Что бывает <b>раньше</b>?',
          options: U.shuffle([a[1][two[0]], a[1][two[1]]]), answer: a[1][two[0]],
          hint: 'Представь всё дело от начала до конца',
          explain: 'Сначала — «' + a[1][two[0]] + '», потом «' + a[1][two[1]] + '».' };
      }
      if (kind === 3) {
        const a = U.pick(ALGOS.filter(x => x[1].length === 4));
        const idx = N(1, 3);
        const shown = a[1].slice(); shown[idx] = '❓';
        return { type: 'choice', prompt: '<b>' + a[0] + '.</b> Какой шаг пропущен — вместо ❓?', visual: stepsList(shown),
          options: U.opts(a[1][idx], otherSteps(a, 2)), answer: a[1][idx],
          hint: 'Прочитай шаги по порядку и подумай, чего не хватает',
          explain: 'Пропущен шаг «' + a[1][idx] + '».' };
      }
      if (kind === 4) {
        return { type: 'sort', prompt: 'Разложи дела: какие занимают минуты, а какие — часы?',
          groups: [{ name: 'Минуты ⏱️', items: U.pickN(MIN_TASKS, 2) }, { name: 'Часы ⏳', items: U.pickN(HOUR_TASKS, 2) }],
          explain: 'Короткие дела мы меряем минутами, а долгие — часами.' };
      }
      const ok = U.pick(SIMUL_OK);
      return { type: 'choice', prompt: 'Что <b>можно</b> делать одновременно?', options: U.opts(ok, U.pickN(SIMUL_NO, 2)), answer: ok,
        hint: 'Одновременно можно делать то, что не мешает друг другу',
        explain: 'Можно ' + ok + ' — эти дела друг другу не мешают.' };
    }
    if (level === 2) {
      const kind = N(1, 6);
      if (kind === 1) {
        const a = U.pick(ALGOS);
        return { type: 'order', prompt: '<b>' + a[0] + '.</b> Расставь шаги по порядку', items: a[1],
          hint: 'Начни с самого первого действия',
          explain: 'Правильный порядок: ' + a[1].join(' → ') + '.' };
      }
      if (kind === 2) {
        const a = U.pick(ALGO_ACTIONS.filter(x => x[1].length >= 5));
        const i = N(0, a[1].length - 2);
        const wrong = a[1].filter((s, j) => j !== i && j !== i + 1);
        return { type: 'choice', prompt: '<b>' + a[0] + '.</b> Что делают сразу <b>после</b> шага «' + a[1][i] + '»?',
          options: U.opts(a[1][i + 1], U.pickN(wrong, 3)), answer: a[1][i + 1],
          hint: 'Восстанови в голове всю цепочку по порядку',
          explain: 'После «' + a[1][i] + '» идёт «' + a[1][i + 1] + '».' };
      }
      if (kind === 3) {
        const a = U.pick(ALGOS);
        const idx = N(1, a[1].length - 1);
        const shown = a[1].slice(); shown[idx] = '❓';
        return { type: 'choice', prompt: '<b>' + a[0] + '.</b> Какой шаг пропущен?', visual: stepsList(shown),
          options: U.opts(a[1][idx], otherSteps(a, 3)), answer: a[1][idx],
          explain: 'На месте ❓ должен быть шаг «' + a[1][idx] + '».' };
      }
      if (kind === 4) {
        return { type: 'sort', prompt: 'Разложи дела по времени: минуты или часы?',
          groups: [{ name: 'Минуты ⏱️', items: U.pickN(MIN_TASKS, 3) }, { name: 'Часы ⏳', items: U.pickN(HOUR_TASKS, 3) }],
          explain: 'Дела из первой группы успеваешь за несколько минут, из второй — только за часы.' };
      }
      if (kind === 5) {
        const no = U.pick(SIMUL_NO);
        return { type: 'choice', prompt: 'Что <b>нельзя</b> делать одновременно?', options: U.opts(no, U.pickN(SIMUL_OK, 3)), answer: no,
          explain: 'Нельзя ' + no + ': одно дело мешает другому.' };
      }
      const st = N(0, DAY_EVENTS.length - 5);
      const items = DAY_EVENTS.slice(st, st + 5);
      return { type: 'order', prompt: 'Расставь дела дня по порядку', items: items,
        explain: 'По порядку: ' + items.join(' → ') + '.' };
    }
    const kind = N(1, 6);
    if (kind === 1) {
      const a = U.pick(ALGOS.filter(x => x[1].length >= 5));
      return { type: 'order', prompt: '<b>' + a[0] + '.</b> Расставь все шаги по порядку', items: a[1],
        explain: 'Порядок: ' + a[1].join(' → ') + '.' };
    }
    if (kind === 2) {
      const st = N(0, DAY_EVENTS.length - 6);
      const items = DAY_EVENTS.slice(st, st + 6);
      return { type: 'order', prompt: 'Расставь шесть дел дня по порядку', items: items,
        explain: 'По порядку: ' + items.join(' → ') + '.' };
    }
    if (kind === 3) {
      const four = U.pickN(RANKED_TIME, 4).sort((x, y) => x[1] - y[1]);
      return { type: 'order', prompt: 'Расставь дела по времени — от самого короткого к самому долгому',
        items: four.map(x => x[0]), hint: 'Прикинь, сколько минут или часов занимает каждое дело',
        explain: 'От короткого к долгому: ' + four.map(x => x[0]).join(' → ') + '.' };
    }
    if (kind === 4) {
      const h = U.pickN(HOUR_TASKS, 3), m = U.pickN(MIN_TASKS, 3);
      return { type: 'choice', multi: true, prompt: 'Выбери <b>все</b> дела, на которые нужны часы, а не минуты',
        options: U.shuffle(h.concat(m)), answer: h,
        explain: 'Часы нужны, чтобы ' + h.join(', ') + '. Остальное успеваешь за минуты.' };
    }
    if (kind === 5) {
      return { type: 'sort', prompt: 'Разложи дела на три группы по времени',
        groups: [{ name: 'Минуты ⏱️', items: U.pickN(MIN_TASKS, 3) }, { name: 'Часы ⏳', items: U.pickN(HOUR_TASKS, 3) },
          { name: 'Дни и дольше 📆', items: U.pickN(DAYS_TASKS, 3) }],
        explain: 'Чем больше дело, тем крупнее мерка времени: минуты, часы, дни.' };
    }
    const a = U.pick(ALGOS.filter(x => x[1].length >= 5));
    const idx = N(1, a[1].length - 1);
    const shown = a[1].slice(); shown[idx] = '❓';
    return { type: 'choice', prompt: '<b>' + a[0] + '.</b> Найди пропущенный шаг', visual: stepsList(shown),
      options: U.opts(a[1][idx], otherSteps(a, 4)), answer: a[1][idx],
      explain: 'Вместо ❓ должно быть «' + a[1][idx] + '».' };
  }

  /* =====================================================================
     17. Взвешивания и переливания
     ===================================================================== */
  const SAME_WEIGHT = [['килограмм ваты', 'килограмм железа'], ['килограмм пуха', 'килограмм камней'],
    ['килограмм сена', 'килограмм гвоздей'], ['килограмм ягод', 'килограмм песка'], ['килограмм снега', 'килограмм кирпичей']];
  const HEAVY_CHAINS = [
    { q: 'Кто', row: ['слон', 'лошадь', 'собака', 'кошка', 'мышка'] },
    { q: 'Кто', row: ['бегемот', 'корова', 'волк', 'заяц', 'белка'] },
    { q: 'Что', row: ['арбуз', 'дыня', 'яблоко', 'слива', 'вишня'] },
    { q: 'Что', row: ['мешок картошки', 'ведро воды', 'книга', 'карандаш'] },
    { q: 'Что', row: ['холодильник', 'телевизор', 'чайник', 'кружка'] },
    { q: 'Что', row: ['грузовик', 'машина', 'велосипед', 'самокат'] }];
  const COINS = [[3, 1], [2, 1], [9, 2], [4, 2], [8, 2], [27, 3]];
  const COIN_WHY = { 3: 'Положи по монете на каждую чашу: если весы ровно — лёгкая та, что осталась, если нет — та, что легче.',
    2: 'Положи по монете на каждую чашу — которая легче, та и нужна.',
    9: 'Разложи на три кучки по 3 монеты. Первое взвешивание покажет кучку с лёгкой монетой, второе — саму монету.',
    4: 'Взвесь две монеты: если весы ровно, лёгкая среди двух оставшихся, и нужно ещё одно взвешивание.',
    8: 'Разложи на кучки 3, 3 и 2. Первое взвешивание найдёт кучку, второе — монету.',
    27: 'Дели на три кучки по 9, потом по 3, потом по 1 — три взвешивания.' };
  const HEAVY_1KG = ['арбуз', 'велосипед', 'мешок картошки', 'ведро воды', 'чемодан', 'телевизор', 'большая собака'];
  const LIGHT_1KG = ['карандаш', 'яблоко', 'ложка', 'тетрадь', 'конфета', 'носок', 'ключ', 'ластик'];
  const POUR = [
    ['4 л', ['налить полный кувшин 5 л', 'перелить из него в кувшин 3 л — в большом останется 2 л', 'вылить воду из кувшина 3 л',
      'перелить оставшиеся 2 л в кувшин 3 л', 'снова налить полный кувшин 5 л',
      'долить из большого в кувшин 3 л — туда войдёт 1 л, и в большом останется 4 л']],
    ['1 л', ['налить полный кувшин 5 л', 'перелить из него в кувшин 2 л — в большом останется 3 л', 'вылить воду из кувшина 2 л',
      'снова перелить из большого в кувшин 2 л — в большом останется 1 л']]];
  const POUR_EASY = [
    ['2 л', 'налить полный кувшин 5 л и перелить из него в кувшин 3 л — в большом останется 2 л',
      ['налить полный кувшин 3 л и перелить его в кувшин 5 л', 'налить полный кувшин 5 л и вылить из него половину',
        'налить оба кувшина полными и слить вместе']],
    ['8 л', 'налить полными оба кувшина — 5 л и 3 л — и слить их в одно ведро',
      ['налить полный кувшин 5 л и перелить в кувшин 3 л', 'налить кувшин 3 л два раза',
        'налить полный кувшин 5 л и долить из него в кувшин 3 л']],
    ['6 л', 'два раза налить полный кувшин 3 л и слить в одно ведро',
      ['налить полный кувшин 5 л и добавить кувшин 3 л', 'налить полный кувшин 5 л и вылить 1 л',
        'налить кувшин 5 л и перелить его в кувшин 3 л']]];

  function genWeigh(level) {
    if (level === 1) {
      const kind = N(1, 5);
      if (kind === 1) {
        const two = U.pickN(FRUIT, 2), a = two[0], b = two[1];
        const w = N(2, 4), k = N(1, 3);
        return { type: 'choice', prompt: 'Сколько ' + a + ' весит один ' + b + '?',
          visual: eq([k + ' × ' + a + ' + ' + b + '  =  ' + (k + w) + ' × ' + a]),
          options: U.numOpts(w, 2, 1, 6), answer: String(w),
          hint: 'Убери с обеих чаш по ' + k + ' ' + a + ' — что останется?',
          explain: 'Уберём с обеих чаш по ' + k + ' ' + a + ': слева останется ' + b + ', справа ' + w + ' ' + a + '. Значит ' + b + ' = ' + w + ' ' + a + '.' };
      }
      if (kind === 2) {
        const p = U.pick(SAME_WEIGHT);
        return { type: 'choice', prompt: 'Что тяжелее: ' + p[0] + ' или ' + p[1] + '?',
          options: U.shuffle([p[0], p[1], 'весят одинаково']), answer: 'весят одинаково',
          hint: 'Посмотри внимательно: и там, и там сказано «килограмм»',
          explain: 'Килограмм — это всегда килограмм. ' + U.cap(p[0]) + ' занимает больше места, но весит столько же.' };
      }
      if (kind === 3) {
        const ch = U.pick(HEAVY_CHAINS);
        const three = U.pickN(U.range(0, ch.row.length - 1), 3).sort((x, y) => x - y).map(i => ch.row[i]);
        return { type: 'choice', prompt: U.cap(three[0]) + ' тяжелее, чем ' + three[1] + '. ' + U.cap(three[1]) + ' тяжелее, чем ' + three[2] + '. ' + ch.q + ' <b>легче всех</b>?',
          options: U.shuffle(three.slice()), answer: three[2],
          hint: 'Выстрой всех в ряд от самого тяжёлого к самому лёгкому',
          explain: 'Ряд получается такой: ' + three.join(' → ') + '. Легче всех ' + three[2] + '.' };
      }
      if (kind === 4) {
        const c = U.pick([[3, 1], [2, 1]]);
        return { type: 'choice', prompt: 'Есть ' + c[0] + ' монеты, одна из них легче остальных. За сколько взвешиваний её точно найдёшь?',
          options: U.opts(c[1], [2, 3]), answer: String(c[1]),
          hint: 'Клади монеты на чаши по одной',
          explain: COIN_WHY[c[0]] + ' Хватит ' + U.count(c[1], ['взвешивания', 'взвешиваний', 'взвешиваний']) + '.' };
      }
      const a = N(2, 9), b = N(1, a - 1);
      return { type: 'choice', prompt: 'На левой чаше гиря ' + a + ' кг, на правой — ' + b + ' кг. Сколько килограммов добавить справа, чтобы весы уравновесились?',
        options: U.numOpts(a - b, 2, 1, 9), answer: String(a - b),
        hint: 'Справа не хватает столько, на сколько ' + a + ' больше ' + b,
        explain: a + ' − ' + b + ' = ' + (a - b) + ' кг.' };
    }
    if (level === 2) {
      const kind = N(1, 6);
      if (kind === 1) {
        const two = U.pickN(FRUIT, 2), a = two[0], b = two[1];
        const w = N(2, 5), n = N(2, 3);
        return { type: 'choice', prompt: 'Сколько ' + a + ' весит один ' + b + '?',
          visual: eq([n + ' × ' + b + '  =  ' + (n * w) + ' × ' + a]),
          options: U.numOpts(w, 3, 1, 8), answer: String(w),
          hint: 'Раздели ' + (n * w) + ' поровну на ' + n + ' штук',
          explain: n + ' ' + b + ' весят ' + (n * w) + ' ' + a + ', значит один ' + b + ' — это ' + (n * w) + ' : ' + n + ' = ' + w + ' ' + a + '.' };
      }
      if (kind === 2) {
        const ch = U.pick(HEAVY_CHAINS);
        const four = U.pickN(U.range(0, ch.row.length - 1), 4).sort((x, y) => x - y).map(i => ch.row[i]);
        const ask = U.chance(0.5);
        return { type: 'choice', prompt: four.slice(0, -1).map((x, i) => U.cap(x) + ' тяжелее, чем ' + four[i + 1]).join('. ') + '. ' + ch.q + ' <b>' + (ask ? 'тяжелее' : 'легче') + ' всех</b>?',
          options: U.shuffle(four.slice()), answer: ask ? four[0] : four[four.length - 1],
          hint: 'Выстрой всех по весу в один ряд',
          explain: 'Ряд по весу: ' + four.join(' → ') + '.' };
      }
      if (kind === 3) {
        const a = N(2, 9), b = N(2, 9), c = N(1, a + b - 1);
        return { type: 'input', mode: 'num', prompt: 'Слева гири ' + a + ' кг и ' + b + ' кг, справа ' + c + ' кг. Сколько килограммов добавить справа?',
          answer: a + b - c, hint: 'Сначала сложи гири слева, потом вычти то, что уже стоит справа',
          explain: a + ' + ' + b + ' = ' + (a + b) + ', а справа ' + c + '. Не хватает ' + (a + b) + ' − ' + c + ' = ' + (a + b - c) + ' кг.' };
      }
      if (kind === 4) {
        return { type: 'sort', prompt: 'Что весит больше килограмма, а что меньше?',
          groups: [{ name: 'Тяжелее 1 кг 🏋️', items: U.pickN(HEAVY_1KG, 3) }, { name: 'Легче 1 кг 🪶', items: U.pickN(LIGHT_1KG, 3) }],
          explain: 'Килограмм — это примерно как большая пачка сахара.' };
      }
      if (kind === 5) {
        const p = U.pick(POUR_EASY);
        return { type: 'choice', prompt: 'Есть пустое ведро и два кувшина без мерок — на 3 л и на 5 л. Как отмерить ровно ' + p[0] + '?',
          options: U.opts(p[1], p[2]), answer: p[1],
          hint: 'Кувшин можно налить только доверху — значит, отмерять надо полными кувшинами',
          explain: 'Верный способ: ' + p[1] + '.' };
      }
      const c = U.pick(COINS.filter(x => x[0] <= 9));
      return { type: 'choice', prompt: 'Есть ' + U.count(c[0], ['монета', 'монеты', 'монет']) + ', одна легче остальных. За сколько взвешиваний на чашечных весах её точно найдёшь?',
        options: U.opts(c[1], [1, 2, 3, 4].filter(x => x !== c[1])), answer: String(c[1]),
        hint: 'Дели монеты на равные кучки и сравнивай кучки целиком',
        explain: COIN_WHY[c[0]] };
    }
    const kind = N(1, 6);
    if (kind === 1) {
      const two = U.pickN(FRUIT, 2), a = two[0], b = two[1];
      const w = N(2, 4), n = N(2, 4);
      return { type: 'input', mode: 'num', prompt: 'Один ' + b + ' весит столько же, сколько ' + w + ' ' + a + '. Сколько ' + a + ' уравновесят ' + n + ' ' + b + '?',
        visual: eq([b + '  =  ' + w + ' × ' + a]), answer: w * n,
        hint: 'Каждый ' + b + ' — это ' + w + ' ' + a + ', а их ' + n,
        explain: w + ' · ' + n + ' = ' + (w * n) + '.' };
    }
    if (kind === 2) {
      const two = U.pickN(FRUIT, 2), a = two[0], b = two[1];
      const w = N(2, 5), k = N(2, 4);
      return { type: 'input', mode: 'num', prompt: 'Сколько ' + a + ' весит один ' + b + '?',
        visual: eq([k + ' × ' + a + ' + ' + b + '  =  ' + (k + w) + ' × ' + a]), answer: w,
        hint: 'Сними с обеих чаш по ' + k + ' ' + a + ' — весы останутся в равновесии',
        explain: 'Убираем с обеих чаш по ' + k + ' ' + a + ': остаётся ' + b + ' = ' + w + ' ' + a + '.' };
    }
    if (kind === 3) {
      const p = U.pick(POUR);
      const jug = p[0] === '4 л' ? 'на 3 л и на 5 л' : 'на 2 л и на 5 л';
      return { type: 'order', prompt: 'Есть кувшины ' + jug + ' без мерок. Расставь действия по порядку, чтобы отмерить ровно ' + p[0] + '.',
        items: p[1], hint: 'Наливать можно только полный кувшин, а переливать — пока второй не наполнится',
        explain: 'Порядок действий: ' + p[1].join('; ') + '.' };
    }
    if (kind === 4) {
      const c = U.pick(COINS);
      return { type: 'input', mode: 'num', prompt: 'Есть ' + U.count(c[0], ['монета', 'монеты', 'монет']) + ', одна легче остальных. Сколько взвешиваний на чашечных весах нужно, чтобы её точно найти?',
        answer: c[1], hint: 'Дели монеты на три равные кучки — одно взвешивание сразу отсекает две трети',
        explain: COIN_WHY[c[0]] };
    }
    if (kind === 5) {
      const heavy = U.pickN(HEAVY_1KG, 3);
      return { type: 'choice', multi: true, prompt: 'Выбери <b>всё</b>, что весит больше килограмма',
        options: U.shuffle(heavy.concat(U.pickN(LIGHT_1KG, 3))), answer: heavy,
        explain: 'Больше килограмма весят: ' + heavy.join(', ') + '. Остальное можно спокойно поднять одной рукой.' };
    }
    const ch = U.pick(HEAVY_CHAINS);
    const four = U.pickN(U.range(0, ch.row.length - 1), 4).sort((x, y) => x - y).map(i => ch.row[i]);
    return { type: 'choice', prompt: four.slice(0, -1).map((x, i) => U.cap(x) + ' тяжелее, чем ' + four[i + 1]).join('. ') + '. ' + ch.q + ' на <b>втором месте</b> по тяжести?',
      options: U.shuffle(four.slice()), answer: four[1],
      hint: 'Сначала выстрой всех в ряд от самого тяжёлого, потом посчитай',
      explain: 'Ряд по весу: ' + four.join(' → ') + '. На втором месте ' + four[1] + '.' };
  }

  /* ---------- регистрация ---------- */
  S.registerSubject({
    id: 'logic', title: 'Логика и смекалка', emoji: '🧩', color: '#20c4cf', desc: 'Головоломки, внимание, память',
    sections: [
      { title: 'Закономерности', lessons: [
        { id: 'lg-series', title: 'Числовые ряды', emoji: '🔢', rule: 'Чтобы продолжить ряд, найди <b>правило</b>: сравни соседние числа. Если каждое следующее больше на одно и то же число — это <b>шаг</b>: 3, 6, 9, 12 — шаг 3. Бывают ряды, где числа <b>удваиваются</b> (1, 2, 4, 8) или где шаг <b>растёт</b> (1, 2, 4, 7, 11).', gen: genSeries },
        { id: 'lg-odd', title: 'Четвёртый лишний', emoji: '🍎', rule: 'Чтобы найти лишнее, назови <b>одним словом</b> группу, к которой подходят почти все: фрукты, мебель, птицы… Тот, кто в эту группу не входит, — <b>лишний</b>. Иногда признак хитрый: число слогов, первая буква, число ног.', gen: genOdd },
        { id: 'lg-patterns', title: 'Закономерности', emoji: '🔴', rule: 'Узор состоит из <b>повторяющегося кусочка</b>: 🔴🔵 🔴🔵 🔴🔵… Найди этот кусочек — и узнаешь, что дальше. В таблице-матрице в каждой строке и каждом столбце все картинки <b>разные</b>: ищи, какой не хватает.', gen: genPatterns },
        { id: 'lg-attention', title: 'Внимание', emoji: '👀', rule: 'Чтобы ничего не пропустить, проверяй <b>по порядку</b>: слева направо, ряд за рядом. Когда считаешь картинки или буквы, можно тихонько отмечать пальцем каждую найденную.', gen: genAttention },
        { id: 'lg-sudoku', title: 'Судоку и сетки', emoji: '🔲', rule: 'В <b>судоку 4×4</b> в каждой строке, каждом столбце и каждом квадрате 2×2 числа 1, 2, 3, 4 стоят по одному разу. Чтобы найти пропуск, посмотри, каких чисел ещё нет в его строке и столбце. В <b>магическом квадрате</b> суммы по строкам, столбцам и диагоналям одинаковые.', gen: genSudoku },
        { id: 'lg-words', title: 'Слова и буквы', emoji: '🔤', rule: 'Из одних и тех же букв можно собрать разные слова. <b>Перевёртыш</b> читается одинаково в обе стороны: шалаш, казак. Если в слове заменить <b>одну букву</b>, получится новое слово: кот → кит. А два коротких слова могут сложиться в одно длинное: ПАР + УС = парус.', gen: genWords }
      ]},
      { title: 'Соображаем', lessons: [
        { id: 'lg-tasks', title: 'Логические задачи', emoji: '🤔', rule: 'Читай задачу <b>внимательно и до конца</b>: в ней часто есть подвох. Помогает нарисовать или расставить героев по порядку. Если сказано «не Петя и не Вася» — просто <b>вычеркни</b> их. Проверь ответ: подходит ли он ко всем условиям?', gen: genTasks },
        { id: 'lg-scales', title: 'Весы и ребусы с картинками', emoji: '⚖️', rule: 'В ребусе <b>одинаковые картинки</b> — это одинаковые числа. Начинай с той строки, где картинка одна и та же: 🍎 + 🍎 = 10, значит 🍎 = 5. Найденное число подставляй в следующие строки.', gen: genScales },
        { id: 'lg-space', title: 'Пространство и направления', emoji: '🧭', rule: 'Вправо и влево — движение по <b>строке</b>, вверх и вниз — по <b>столбцу</b>. Стороны горизонта идут по кругу: север → восток → юг → запад. Если встать лицом на север, справа будет восток, слева — запад, сзади — юг.', gen: genSpace },
        { id: 'lg-calendar', title: 'Дни недели и время', emoji: '📅', rule: 'В неделе <b>7 дней</b>, в году <b>12 месяцев</b>, в каждом времени года по <b>3 месяца</b>. Через 7 дней всегда тот же день недели. На часах короткая стрелка — часы, длинная — минуты, и каждая цифра циферблата это <b>5 минут</b>.', gen: genCalendar },
        { id: 'lg-memory', title: 'Мемори: тренируем память', emoji: '🧠', rule: 'Открывай карточки по две и <b>запоминай</b>, что где лежало. Если пара не совпала — не расстраивайся: теперь ты знаешь ещё две карточки. Старайся запоминать место, а не только картинку.', gen: genMemory }
      ]},
      { title: 'Головоломки', lessons: [
        { id: 'lg-mirror', title: 'Зеркало и симметрия', emoji: '🪞', rule: 'Фигура <b>симметричная</b>, если её можно сложить пополам и половинки совпадут. Линия сгиба — <b>ось симметрии</b>. Симметричные буквы в зеркале не меняются: А, О, Т, Н, Ф, Х, М, П, Ш, Ж, Д, Л. У квадрата <b>4</b> оси, у прямоугольника <b>2</b>, у равностороннего треугольника <b>3</b>, а у круга их <b>бесконечно много</b>. Ряд картинок в зеркале читается наоборот.', gen: genMirror },
        { id: 'lg-maze', title: 'Лабиринт и маршруты', emoji: '🧭', rule: 'Чтобы посчитать шаги по клеткам, сложи шаги <b>по строкам</b> и <b>по столбцам</b>. Команды выполняй по одной и отмечай клетку, куда попал. Чтобы сосчитать, сколькими путями можно пройти по линиям сетки <b>только вправо и вниз</b>, подпиши у каждого перекрёстка число путей: оно равно <b>сумме</b> числа сверху и числа слева.', gen: genMaze },
        { id: 'lg-cipher', title: 'Шифры и коды', emoji: '🔐', rule: 'Самый простой шифр — <b>номер буквы в алфавите</b>: А — 1, Б — 2, В — 3, Г — 4, Д — 5, Е — 6, Ё — 7, Ж — 8, З — 9, И — 10, Й — 11, К — 12, Л — 13, М — 14, Н — 15, О — 16, П — 17, Р — 18, С — 19, Т — 20, У — 21, Ф — 22, Х — 23, Ц — 24, Ч — 25, Ш — 26, Щ — 27, Ъ — 28, Ы — 29, Ь — 30, Э — 31, Ю — 32, Я — 33.<br>Бывают и другие шифры: заменить каждую букву на <b>следующую</b> (кот → лпу), записать слово <b>задом наперёд</b> или заменить буквы картинками по ключу.', gen: genCipher },
        { id: 'lg-sets', title: 'Группы и признаки', emoji: '🎯', rule: 'Предметы объединяют в группу по <b>общему признаку</b>: все круглые, все съедобные, все живые. Один и тот же предмет может попасть сразу в несколько групп: яблоко и круглое, и съедобное. Если в двух группах есть общие предметы, то при сложении их посчитаешь <b>дважды</b>: чтобы найти, сколько предметов попало сразу в обе группы, сложи обе группы и вычти тех, кто входит хотя бы в одну.', gen: genSets },
        { id: 'lg-time-plan', title: 'План и порядок дел', emoji: '📋', rule: '<b>Алгоритм</b> — это шаги дела по порядку. Если шаги перепутать, ничего не получится: сначала надо выдавить пасту, а уже потом чистить зубы. Чтобы найти пропущенный шаг, проговори всё дело от начала до конца. Короткие дела меряют <b>минутами</b>, длинные — <b>часами</b>, а совсем долгие — <b>днями</b>. Одновременно можно делать только те дела, которые не мешают друг другу.', gen: genPlan },
        { id: 'lg-weigh', title: 'Взвешивания и переливания', emoji: '⚖️', rule: 'Если с обеих чаш весов снять <b>поровну</b>, равновесие не нарушится — так и решают задачи про яблоки и груши. Килограмм ваты и килограмм железа весят <b>одинаково</b>: вата просто занимает больше места. В цепочке сравнений выстрой всех в ряд: если А тяжелее Б, а Б тяжелее В, то легче всех — В. В кувшинах без мерок отмеряют только полными кувшинами и переливаниями доверху.', gen: genWeigh }
      ]}
    ]
  });
})();
