/* Утилиты для генераторов заданий: SCHOOL.util (сокращённо U). */
(function () {
  const root = typeof window !== 'undefined' ? window : globalThis;
  const S = root.SCHOOL;
  const U = {};

  /** Целое от min до max включительно */
  U.rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  /** true с вероятностью p (0..1) */
  U.chance = p => Math.random() < p;
  /** Случайный элемент массива */
  U.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  /** Новая перемешанная копия массива */
  U.shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  /** n разных случайных элементов */
  U.pickN = (arr, n) => U.shuffle(arr).slice(0, n);
  /** Случайный элемент, не равный exclude (значение или массив значений) */
  U.pickOther = (arr, exclude) => {
    const ex = Array.isArray(exclude) ? exclude : [exclude];
    const c = arr.filter(x => !ex.includes(x));
    return c.length ? U.pick(c) : undefined;
  };
  /** Уникальные элементы, порядок сохраняется */
  U.uniq = arr => [...new Set(arr)];
  /** Массив целых от a до b включительно */
  U.range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
  /** Первая буква заглавная */
  U.cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  /** Склонение: U.plural(5, ['яблоко','яблока','яблок']) → 'яблок' */
  U.plural = (n, forms) => {
    n = Math.abs(n) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
  };
  /** Число с формой слова: U.count(3, ['яблоко','яблока','яблок']) → '3 яблока' */
  U.count = (n, forms) => n + ' ' + U.plural(n, forms);

  /**
   * n уникальных чисел-ловушек, не равных answer, в диапазоне [min,max].
   * Если диапазон тесный — расширяется автоматически.
   */
  U.distractNums = (answer, n, min, max) => {
    answer = Number(answer);
    const set = new Set();
    let lo = min, hi = max, guard = 0;
    while (set.size < n && guard < 1000) {
      guard++;
      const v = U.rand(lo, hi);
      if (v !== answer) set.add(v);
      if (guard % 40 === 0) { lo = Math.max(0, lo - 5); hi += 5; }
    }
    return [...set];
  };
  /** Ловушки рядом с ответом (±spread), не меньше min */
  U.nearNums = (answer, n, spread, min) => {
    answer = Number(answer); spread = spread || 5; min = (min === undefined ? 0 : min);
    return U.distractNums(answer, n, Math.max(min, answer - spread), answer + spread);
  };
  /** Перемешанные уникальные варианты: правильный + ловушки */
  U.opts = (answer, distractors) => U.shuffle(U.uniq([answer].concat(distractors).map(String)));
  /** Варианты числом: правильный + n ловушек */
  U.numOpts = (answer, n, min, max) => U.opts(answer, U.distractNums(answer, n, min, max));

  /** Ключ для сравнения ответов: без регистра, ё→е, лишние пробелы */
  U.norm = s => String(s).trim().toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').replace(/[.!]+$/, '');

  S.util = U;
})();
