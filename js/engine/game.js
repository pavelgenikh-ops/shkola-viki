/* Игровая механика: опыт, уровни игрока, звёзды, серия дней, наклейки, награды. */
(function () {
  const S = window.SCHOOL;
  const U = S.util;

  const G = {};

  G.LEVELS = [
    { xp: 0, title: 'Новичок', emoji: '🌱' }, { xp: 80, title: 'Ученица', emoji: '✏️' }, { xp: 220, title: 'Умница', emoji: '⭐' },
    { xp: 450, title: 'Знайка', emoji: '📘' }, { xp: 800, title: 'Отличница', emoji: '🏅' }, { xp: 1250, title: 'Эрудит', emoji: '🧠' },
    { xp: 1800, title: 'Мастер', emoji: '🏆' }, { xp: 2600, title: 'Профессор', emoji: '🎓' }, { xp: 3600, title: 'Гений', emoji: '💎' },
    { xp: 5000, title: 'Легенда', emoji: '👑' }
  ];
  G.levelFor = xp => {
    let i = 0;
    while (i + 1 < G.LEVELS.length && xp >= G.LEVELS[i + 1].xp) i++;
    const cur = G.LEVELS[i], next = G.LEVELS[i + 1] || null;
    const progress = next ? (xp - cur.xp) / (next.xp - cur.xp) : 1;
    return { n: i + 1, title: cur.title, emoji: cur.emoji, cur: cur.xp, next: next ? next.xp : null, progress };
  };

  G.LEVEL_NAMES = { 1: 'Лёгкий', 2: 'Средний', 3: 'Сложный' };
  G.LEVEL_EMOJI = { 1: '🌼', 2: '🌟', 3: '🔥' };
  G.LEVEL_TASKS = { 1: 8, 2: 10, 3: 12 };
  G.LEVEL_MULT = { 1: 1, 2: 1.5, 3: 2 };
  G.DAILY_TASKS = 10;

  /** Опыт за одно задание */
  G.xpForTask = (level, r) => {
    const base = r.correct ? (r.mistakes === 0 ? 10 : 5) : 1;
    return Math.round(base * G.LEVEL_MULT[level]);
  };
  /** Звёзды за урок по результатам заданий */
  G.starsFor = results => {
    const n = results.length || 1;
    const first = results.filter(r => r.correct && r.mistakes === 0).length;
    const any = results.filter(r => r.correct).length;
    if (first / n >= 0.9) return 3;
    if (any / n >= 0.7) return 2;
    if (any / n >= 0.4) return 1;
    return 0;
  };

  G.MASCOTS = {
    fox: { emoji: '🦊', name: 'Лисёнок Рыжик' },
    cat: { emoji: '🐱', name: 'Котик Мурзик' },
    unicorn: { emoji: '🦄', name: 'Единорожка Радуга' },
    dragon: { emoji: '🐉', name: 'Дракоша Искорка' },
    panda: { emoji: '🐼', name: 'Панда Бамбук' },
    owl: { emoji: '🦉', name: 'Сова Умница' },
    bunny: { emoji: '🐰', name: 'Зайка Пушинка' },
    dolphin: { emoji: '🐬', name: 'Дельфин Волна' }
  };
  G.AVATARS = ['👧', '👧🏼', '👩‍🦰', '👱‍♀️', '🧒', '👦', '🧑', '🦸‍♀️', '🧜‍♀️', '🧚', '🐱', '🐶', '🦊', '🐼', '🦄', '🐸', '🐧', '🦋', '🌸', '🍓', '⭐', '🌈'];

  G.PHRASES = {
    ok: ['Супер!', 'Верно!', 'Молодец!', 'Точно!', 'Ты умница!', 'Вот это да!', 'Отлично!', 'Так держать!', 'Правильно!', 'Ура!', 'Класс!', 'Великолепно!', 'Именно так!', 'Блестяще!'],
    ok2: ['Получилось!', 'Со второй попытки — верно!', 'Разобралась!', 'Вот теперь правильно!'],
    retry: ['Почти! Попробуй ещё раз', 'Подумай ещё чуть-чуть', 'Не спеши, посмотри внимательно', 'Ещё одна попытка!', 'Хм, не совсем. Ещё разок?'],
    fail: ['Ничего страшного, запомним!', 'Бывает! Теперь ты знаешь', 'В следующий раз получится!', 'Это было непросто. Запоминаем!'],
    greet: ['Привет, {name}! Чем займёмся сегодня?', 'Вот и ты, {name}! Выбирай урок!', '{name}, давай учиться! Я всё утро тебя жду!', 'О, {name} пришла! Сегодня будет интересно!', 'Привет-привет! Готова к новым звёздочкам?', 'С возвращением, {name}! За какой предмет возьмёмся?'],
    result3: ['Три звезды! Ты просто чудо!', 'Идеально! Ни одной ошибки!', 'Вау! Лучше не бывает!'],
    result2: ['Две звезды! Очень хорошо!', 'Отличная работа! Ещё чуть-чуть — и будет три!', 'Здорово! Ты почти мастер!'],
    result1: ['Урок пройден! Молодец!', 'Есть звезда! Потренируемся ещё?', 'Хорошее начало!'],
    result0: ['Это было сложно. Давай попробуем ещё раз вместе!', 'Не расстраивайся — повторим правило и всё получится!']
  };
  G.phrase = (key, vars) => {
    let s = U.pick(G.PHRASES[key] || ['']);
    Object.keys(vars || {}).forEach(k => { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  };

  /* ---- наклейки: открываются за звёзды ---- */
  G.STICKERS = [
    ['🐣', 'Цыплёнок'], ['🐥', 'Утёнок'], ['🐰', 'Зайка'], ['🐱', 'Котёнок'], ['🐶', 'Щенок'], ['🦊', 'Лисичка'], ['🐼', 'Панда'], ['🐨', 'Коала'],
    ['🦁', 'Львёнок'], ['🐯', 'Тигрёнок'], ['🐸', 'Лягушонок'], ['🐧', 'Пингвин'], ['🦉', 'Совёнок'], ['🦋', 'Бабочка'], ['🐝', 'Пчёлка'], ['🐞', 'Божья коровка'],
    ['🐬', 'Дельфин'], ['🐳', 'Кит'], ['🐙', 'Осьминог'], ['🦄', 'Единорог'], ['🐉', 'Дракон'], ['🦕', 'Динозаврик'], ['🦩', 'Фламинго'], ['🦚', 'Павлин'],
    ['🌸', 'Сакура'], ['🌻', 'Подсолнух'], ['🌈', 'Радуга'], ['⭐', 'Звезда'], ['🌙', 'Луна'], ['☀️', 'Солнышко'], ['❄️', 'Снежинка'], ['🍀', 'Клевер'],
    ['🍓', 'Клубника'], ['🍉', 'Арбуз'], ['🍒', 'Вишенки'], ['🧁', 'Кексик'], ['🍩', 'Пончик'], ['🍭', 'Леденец'], ['🍦', 'Мороженое'], ['🎂', 'Тортик'],
    ['🎈', 'Шарик'], ['🎀', 'Бантик'], ['👑', 'Корона'], ['💎', 'Кристалл'], ['🏆', 'Кубок'], ['🎨', 'Палитра'], ['🎸', 'Гитара'], ['🎠', 'Карусель'],
    ['🚀', 'Ракета'], ['🛸', 'Тарелка'], ['🪐', 'Сатурн'], ['🌋', 'Вулкан'], ['🏰', 'Замок'], ['⛵', 'Кораблик'], ['🎡', 'Колесо'], ['🧸', 'Мишка'],
    ['🧚', 'Фея'], ['🧜‍♀️', 'Русалка'], ['🦸‍♀️', 'Супергероиня'], ['🧙‍♀️', 'Волшебница'], ['🎁', 'Подарок'], ['💝', 'Сердечко'], ['🌟', 'Суперзвезда'], ['🥇', 'Чемпионка']
  ].map((s, i) => ({ id: 'st' + i, emoji: s[0], name: s[1], need: 6 * (i + 1) + Math.floor(i / 8) * 4 }));

  /* ---- награды ---- */
  const subjectBadge = (id, title, emoji) => ({
    id: 'subj-' + id, title, emoji, desc: 'Все уроки предмета пройдены хотя бы на одну звезду',
    check: p => { const s = S.getSubject(id); return !!s && s.lessons.length > 0 && s.lessons.every(l => bestStars(p, l.id) >= 1); }
  });
  const subjectMaster = (id, title, emoji) => ({
    id: 'master-' + id, title, emoji, desc: 'Все уроки предмета — на три звезды на сложном уровне',
    check: p => { const s = S.getSubject(id); return !!s && s.lessons.length > 0 && s.lessons.every(l => levelStars(p, l.id, 3) === 3); }
  });
  function bestStars(p, lessonId) {
    const l = p.lessons[lessonId]; if (!l || !l.levels) return 0;
    return Math.max(0, ...Object.values(l.levels).map(v => v.stars || 0));
  }
  function levelStars(p, lessonId, level) {
    const l = p.lessons[lessonId]; return l && l.levels && l.levels[level] ? l.levels[level].stars || 0 : 0;
  }
  G.bestStars = bestStars; G.levelStars = levelStars;
  G.lessonStarsSum = (p, lessonId) => [1, 2, 3].reduce((a, lv) => a + levelStars(p, lessonId, lv), 0);

  G.BADGES = [
    { id: 'first', title: 'Первый шаг', emoji: '🐾', desc: 'Пройти первый урок', check: p => p.lessonsDone >= 1 },
    { id: 'five', title: 'Пять уроков', emoji: '🖐️', desc: 'Пройти 5 уроков', check: p => p.lessonsDone >= 5 },
    { id: 'twenty', title: 'Двадцать уроков', emoji: '📚', desc: 'Пройти 20 уроков', check: p => p.lessonsDone >= 20 },
    { id: 'fifty', title: 'Полсотни', emoji: '🎒', desc: 'Пройти 50 уроков', check: p => p.lessonsDone >= 50 },
    { id: 'perfect', title: 'Без единой ошибки', emoji: '💯', desc: 'Пройти урок, ответив верно с первого раза на всё', check: p => p.perfectCount >= 1 },
    { id: 'perfect10', title: 'Снайпер', emoji: '🎯', desc: '10 уроков без единой ошибки', check: p => p.perfectCount >= 10 },
    { id: 'tasks100', title: 'Сто задач', emoji: '💪', desc: 'Решить 100 заданий', check: p => p.tasksTotal >= 100 },
    { id: 'tasks500', title: 'Пятьсот задач', emoji: '🦾', desc: 'Решить 500 заданий', check: p => p.tasksTotal >= 500 },
    { id: 'tasks1000', title: 'Тысяча задач', emoji: '🚀', desc: 'Решить 1000 заданий', check: p => p.tasksTotal >= 1000 },
    { id: 'streak3', title: 'Три дня подряд', emoji: '🔥', desc: 'Заниматься 3 дня подряд', check: p => p.streak.count >= 3 },
    { id: 'streak7', title: 'Целая неделя', emoji: '🔥🔥', desc: 'Заниматься 7 дней подряд', check: p => p.streak.count >= 7 },
    { id: 'streak30', title: 'Месяц без пропусков', emoji: '🌋', desc: 'Заниматься 30 дней подряд', check: p => p.streak.count >= 30 },
    { id: 'hard', title: 'Смельчак', emoji: '🦁', desc: 'Пройти сложный уровень на 2 звезды и больше', check: p => Object.values(p.lessons).some(l => l.levels && l.levels[3] && l.levels[3].stars >= 2) },
    { id: 'hard10', title: 'Покоритель вершин', emoji: '🏔️', desc: '10 сложных уровней на 3 звезды', check: p => Object.values(p.lessons).filter(l => l.levels && l.levels[3] && l.levels[3].stars === 3).length >= 10 },
    { id: 'daily1', title: 'Задание дня', emoji: '📅', desc: 'Выполнить задание дня', check: p => p.dailyCount >= 1 },
    { id: 'daily10', title: 'Десять дней заданий', emoji: '🗓️', desc: 'Выполнить 10 заданий дня', check: p => p.dailyCount >= 10 },
    { id: 'stars50', title: '50 звёзд', emoji: '✨', desc: 'Собрать 50 звёзд', check: p => p.stars >= 50 },
    { id: 'stars200', title: '200 звёзд', emoji: '🌠', desc: 'Собрать 200 звёзд', check: p => p.stars >= 200 },
    { id: 'allsubj', title: 'Всесторонняя', emoji: '🎓', desc: 'Пройти хотя бы один урок в каждом предмете', check: p => S.subjects.every(s => s.lessons.some(l => bestStars(p, l.id) >= 1)) },
    subjectBadge('math', 'Математик', '🔢'), subjectBadge('russian', 'Грамотей', '📝'), subjectBadge('reading', 'Книголюб', '📚'),
    subjectBadge('world', 'Натуралист', '🌍'), subjectBadge('english', 'Полиглот', '🇬🇧'), subjectBadge('logic', 'Логик', '🧩'),
    subjectMaster('math', 'Мастер математики', '🥇'), subjectMaster('russian', 'Мастер русского', '🥇'), subjectMaster('reading', 'Мастер чтения', '🥇'),
    subjectMaster('world', 'Мастер окружающего мира', '🥇'), subjectMaster('english', 'Мастер английского', '🥇'), subjectMaster('logic', 'Мастер логики', '🥇')
  ];

  function updateStreak(p) {
    const t = S.store.today();
    const d = new Date(); d.setDate(d.getDate() - 1);
    const y = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    if (p.streak.last === t) return;
    p.streak.count = p.streak.last === y ? p.streak.count + 1 : 1;
    p.streak.last = t;
  }
  function recalcStars(p) {
    let sum = 0;
    Object.values(p.lessons).forEach(l => { if (l.levels) Object.values(l.levels).forEach(v => { sum += v.stars || 0; }); });
    p.stars = sum;
  }

  /**
   * Применить результат урока к профилю.
   * res = { lessonId, subjectId, level, results:[{correct, mistakes}], secs, daily }
   */
  G.applyResult = (p, res) => {
    const before = G.levelFor(p.xp);
    const stars = res.daily ? 0 : G.starsFor(res.results);
    let xp = res.results.reduce((a, r) => a + G.xpForTask(res.level, r), 0);
    if (res.daily) xp *= 2;
    const first = res.results.filter(r => r.correct && r.mistakes === 0).length;
    const any = res.results.filter(r => r.correct).length;
    const total = res.results.length;

    p.xp += xp;
    p.tasksTotal += total;
    p.correctTotal += any;
    p.secsTotal += res.secs || 0;
    p.lessonsDone += 1;
    if (first === total) p.perfectCount += 1;

    let prevStars = 0;
    if (!res.daily) {
      const l = p.lessons[res.lessonId] = p.lessons[res.lessonId] || { levels: {}, last: null };
      l.levels = l.levels || {};
      const lv = l.levels[res.level] = l.levels[res.level] || { stars: 0, best: 0, plays: 0, correct: 0, total: 0 };
      prevStars = lv.stars || 0;
      lv.stars = Math.max(lv.stars || 0, stars);
      lv.best = Math.max(lv.best || 0, Math.round(any / total * 100));
      lv.plays += 1; lv.correct += any; lv.total += total; lv.lastAcc = Math.round(any / total * 100);
      l.last = S.store.today();
    } else {
      p.dailyCount += 1;
      p.daily = { date: S.store.today(), done: true };
    }
    updateStreak(p);
    const t = S.store.today();
    p.streak.days[t] = (p.streak.days[t] || 0) + total;
    recalcStars(p);

    p.log.unshift({ date: new Date().toISOString(), lessonId: res.lessonId, subjectId: res.subjectId, level: res.level, correct: any, first, total, stars, xp, secs: res.secs || 0, daily: !!res.daily });
    if (p.log.length > 300) p.log.length = 300;

    const newBadges = [];
    G.BADGES.forEach(b => { if (!p.badges[b.id]) { try { if (b.check(p)) { p.badges[b.id] = t; newBadges.push(b); } } catch (e) {} } });
    const newStickers = [];
    G.STICKERS.forEach(s => { if (!p.stickers.includes(s.id) && p.stars >= s.need) { p.stickers.push(s.id); newStickers.push(s); } });

    const after = G.levelFor(p.xp);
    S.store.save();
    return { stars, prevStars, xp, first, any, total, newBadges, newStickers, levelUp: after.n > before.n, levelBefore: before, levelAfter: after, streak: p.streak.count };
  };

  G.nextSticker = p => G.STICKERS.find(s => !p.stickers.includes(s.id)) || null;

  /** Прогресс по предмету: доля звёзд от максимума (9 на урок) */
  G.subjectProgress = (p, subj) => {
    const max = subj.lessons.length * 9;
    const got = subj.lessons.reduce((a, l) => a + G.lessonStarsSum(p, l.id), 0);
    const started = subj.lessons.filter(l => bestStars(p, l.id) > 0).length;
    return { got, max, pct: max ? Math.round(got / max * 100) : 0, started, total: subj.lessons.length };
  };

  S.game = G;
})();
