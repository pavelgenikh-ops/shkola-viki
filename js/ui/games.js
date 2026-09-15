/* Мини-игры: блиц на время и мемори-турнир. Задания берутся из обычных уроков. */
(function () {
  const S = window.SCHOOL, U = S.util, G = S.game, ST = S.store, T = S.tasks;
  const esc = T.esc, rich = T.rich, el = T.el;
  const $ = sel => document.querySelector(sel);

  const GAMES = [
    { id: 'blitz', title: 'Блиц-счёт', emoji: '⚡', color: '#4f8ef7', desc: 'Сколько примеров решишь за минуту?',
      kind: 'race', secs: 60, subject: 'math', lessons: ['m-oral', 'm-numbers', 'm-compare', 'm-table23', 'm-mult10', 'm-mult-sense'] },
    { id: 'gramotey', title: 'Грамотей', emoji: '✍️', color: '#ff6b8a', desc: 'Лови слова без ошибок на скорость',
      kind: 'race', secs: 60, subject: 'russian', lessons: ['ru-zhi-shi', 'ru-chk-chn', 'ru-unstressed', 'ru-paired-cons', 'ru-soft-sign-sep', 'ru-capital', 'ru-dictionary'] },
    { id: 'wordcatch', title: 'Английский на слух', emoji: '🎧', color: '#8b6cf6', desc: 'Слушай слово — выбирай картинку',
      kind: 'race', secs: 60, subject: 'english', lessons: ['en-colours', 'en-animals', 'en-food', 'en-toys', 'en-body', 'en-clothes', 'en-numbers', 'en-home'] },
    { id: 'smart', title: 'Смекалка на скорость', emoji: '🧠', color: '#20c4cf', desc: 'Закономерности и лишнее — быстро!',
      kind: 'race', secs: 60, subject: 'logic', lessons: ['lg-series', 'lg-odd', 'lg-patterns', 'lg-attention', 'lg-space'] },
    { id: 'nature', title: 'Знаток природы', emoji: '🦉', color: '#3ccf7a', desc: 'Что ты знаешь о мире вокруг?',
      kind: 'race', secs: 60, subject: 'world', lessons: ['w-animals', 'w-plants', 'w-weather', 'w-seasons', 'w-sky', 'w-map', 'w-transport-prof'] },
    { id: 'memcup', title: 'Мемори-турнир', emoji: '🃏', color: '#ff9f43', desc: 'Три раунда: 3, 4 и 6 пар', kind: 'memory' }
  ];

  const state = { game: null, timer: null, left: 0, score: 0, combo: 0, best: 0, level: 1, streak: 0, asked: 0, right: 0, round: 0, moves: 0, startedAt: 0 };

  const profile = () => ST.profile();
  function rec(id) {
    const p = profile(); if (!p) return { best: 0, plays: 0 };
    p.games = p.games || {};
    return p.games[id] || { best: 0, plays: 0 };
  }
  function saveRec(id, score) {
    const p = profile(); if (!p) return false;
    p.games = p.games || {};
    const r = p.games[id] || { best: 0, plays: 0 };
    const isRecord = score > (r.best || 0);
    r.best = Math.max(r.best || 0, score);
    r.plays = (r.plays || 0) + 1;
    r.last = score; r.lastAt = ST.today();
    p.games[id] = r;
    p.xp += Math.round(score * 2);
    ST.save();
    return isRecord;
  }

  /* ---------- экран со списком игр ---------- */
  function renderGames() {
    const p = profile(); if (!p) return;
    const root = $('#screen-games');
    root.innerHTML =
      '<div class="topbar"><button class="btn btn-ghost" id="g-back">← Домой</button><h1 class="grow">🎮 Игры</h1>' +
      '<div class="pill gold">⭐ ' + p.stars + '</div></div>' +
      '<p class="muted" style="font-weight:800">В играх опыт тоже начисляется, а рекорды сохраняются. Звёзды за игры не дают — они только за уроки.</p>' +
      '<div class="grid grid-subjects" id="g-list"></div>';
    const list = root.querySelector('#g-list');
    GAMES.forEach(g => {
      const r = rec(g.id);
      const b = el('button', 'subject-card', '<div class="emoji">' + g.emoji + '</div><div class="title">' + esc(g.title) + '</div>' +
        '<div class="desc">' + esc(g.desc) + '</div>' +
        '<div class="prog"><span>' + (r.best ? '🏆 рекорд: ' + r.best + (g.kind === 'memory' ? ' очков' : ' верных') : 'ещё не играли') + '</span></div>');
      b.style.setProperty('--c', g.color); b.type = 'button';
      b.onclick = () => { S.audio.play('click'); startGame(g); };
      list.appendChild(b);
    });
    root.querySelector('#g-back').onclick = () => S.app.renderHome();
    S.app.show('screen-games');
  }

  /* ---------- общая оболочка игры ---------- */
  function gameShell(g, bodyHtml) {
    const root = $('#screen-game');
    root.innerHTML =
      '<div class="playbar"><button class="btn btn-round btn-ghost" id="gp-exit" title="Выйти">✕</button>' +
      '<div class="game-hud"><div class="hud-item"><b id="gp-score">0</b><span>очки</span></div>' +
      '<div class="hud-item" id="gp-timer-box"><b id="gp-timer">' + (g.secs || 0) + '</b><span>секунд</span></div>' +
      '<div class="hud-item"><b id="gp-best">' + rec(g.id).best + '</b><span>рекорд</span></div></div></div>' +
      '<div class="game-title" style="--c:' + g.color + '">' + g.emoji + ' ' + esc(g.title) + '</div>' +
      '<div id="game-body">' + (bodyHtml || '') + '</div>';
    root.querySelector('#gp-exit').onclick = () => quit();
    document.body.style.setProperty('--subj', g.color);
    document.body.classList.add('playing');
    S.app.show('screen-game');
  }
  function quit() {
    stopTimer(); S.audio.stop();
    state.game = null;
    renderGames();
  }
  function stopTimer() { if (state.timer) { clearInterval(state.timer); state.timer = null; } }

  function startGame(g) {
    state.game = g; state.score = 0; state.combo = 0; state.level = 1; state.streak = 0;
    state.asked = 0; state.right = 0; state.round = 0; state.moves = 0; state.startedAt = Date.now();
    state.left = g.secs || 0;
    S.audio.play('start');
    if (g.kind === 'race') startRace(g); else startMemoryCup(g);
  }

  /* ---------- игра-гонка: поток заданий из уроков ---------- */
  function pickTask(g) {
    const lessons = g.lessons.map(id => S.getLesson(g.subject, id)).filter(Boolean);
    if (!lessons.length) return null;
    for (let i = 0; i < 40; i++) {
      const les = U.pick(lessons);
      let t;
      try { t = les.gen(state.level); } catch (e) { continue; }
      if (!t || t.type !== 'choice' || t.multi) continue;
      if (t.options.length > 4) continue;
      if (String(t.prompt).length > 120) continue;
      return { task: t, lesson: les };
    }
    return null;
  }

  function startRace(g) {
    gameShell(g, '<div id="race-area"></div>');
    const tick = () => {
      state.left--;
      const tEl = $('#gp-timer');
      if (tEl) tEl.textContent = Math.max(0, state.left);
      if (state.left <= 5 && state.left > 0) { S.audio.play('tick'); $('#gp-timer-box').classList.add('hot'); }
      if (state.left <= 0) { stopTimer(); finishRace(g); }
    };
    stopTimer();
    state.timer = setInterval(tick, 1000);
    nextRaceTask(g);
  }

  function nextRaceTask(g) {
    if (!state.game) return;
    const item = pickTask(g);
    const area = $('#race-area');
    if (!item || !area) { finishRace(g); return; }
    state.asked++;
    const t = item.task;
    area.innerHTML = '';
    const card = el('div', 'task race-task');
    const head = el('div', 'task-head');
    head.appendChild(el('div', 'task-prompt', rich(t.prompt)));
    if (t.say) {
      const b = el('button', 'say-btn', '🔊'); b.type = 'button';
      b.onclick = e => { e.stopPropagation(); S.audio.speak(t.say, t.sayLang || 'ru-RU'); };
      head.appendChild(b);
    }
    card.appendChild(head);
    if (t.visual) {
      const v = el('div', 'task-visual');
      const s = String(t.visual).trim();
      v.innerHTML = s.startsWith('<') ? s : '<div class="vis vis-big">' + esc(s) + '</div>';
      card.appendChild(v);
    }
    const opts = el('div', 'opts' + (t.big ? ' big' : ''));
    const buttons = t.options.map(o => {
      const b = el('button', 'opt', rich(String(o))); b.type = 'button'; b.dataset.v = String(o);
      b.onclick = () => answer(g, b, t, buttons);
      opts.appendChild(b);
      return b;
    });
    card.appendChild(opts);
    area.appendChild(card);
    if (t.say && t.autoSay) setTimeout(() => S.audio.speak(t.say, t.sayLang || 'ru-RU'), 150);
  }

  function answer(g, btn, t, buttons) {
    if (!state.game || btn.disabled) return;
    buttons.forEach(b => b.disabled = true);
    const ok = btn.dataset.v === String(t.answer);
    if (ok) {
      btn.classList.add('right');
      state.score++; state.right++; state.combo++; state.streak++;
      S.audio.play(state.combo >= 5 ? 'correctStreak' : 'correct');
      $('#gp-score').textContent = state.score;
      if (state.combo >= 3 && state.combo % 3 === 0) {
        state.left += 3;
        $('#gp-timer').textContent = state.left;
        floatText('+3 сек ⏱', 'good');
      }
      if (state.streak >= 4 && state.level < 3) { state.level++; state.streak = 0; floatText('Уровень ' + G.LEVEL_EMOJI[state.level], 'good'); }
    } else {
      btn.classList.add('wrong');
      buttons.forEach(b => { if (b.dataset.v === String(t.answer)) b.classList.add('right'); });
      state.combo = 0; state.streak = 0;
      state.left = Math.max(0, state.left - 3);
      $('#gp-timer').textContent = state.left;
      floatText('−3 сек', 'bad');
      S.audio.play('wrong');
      if (state.level > 1) state.level--;
    }
    setTimeout(() => { if (state.game && state.left > 0) nextRaceTask(g); }, ok ? 260 : 900);
  }

  function floatText(text, cls) {
    const area = $('#game-body'); if (!area) return;
    const d = el('div', 'float-msg ' + (cls || ''), esc(text));
    area.appendChild(d);
    setTimeout(() => d.remove(), 1100);
  }

  function finishRace(g) {
    stopTimer();
    if (!state.game) return;
    state.game = null;
    const score = state.score;
    const isRecord = saveRec(g.id, score);
    S.audio.play(isRecord ? 'levelup' : 'done');
    if (isRecord || score >= 20) S.confetti.burst({ count: isRecord ? 200 : 90 });
    const acc = state.asked ? Math.round(state.right / state.asked * 100) : 0;
    const r = rec(g.id);
    const root = $('#screen-game');
    root.innerHTML =
      '<div class="card result"><div style="font-size:72px">' + g.emoji + '</div><h1>' + esc(g.title) + '</h1>' +
      (isRecord ? '<div class="reward" style="justify-content:center"><div class="ic">🏆</div><div><b>Новый рекорд!</b> Было ' + (r.best === score ? (r.last !== undefined ? '' : '') : '') + '</div></div>' : '') +
      '<div class="stat-row"><div class="stat"><b>' + score + '</b><span>верных ответов</span></div>' +
      '<div class="stat"><b>' + acc + '%</b><span>точность</span></div>' +
      '<div class="stat"><b>' + r.best + '</b><span>твой рекорд</span></div>' +
      '<div class="stat"><b>+' + Math.round(score * 2) + '</b><span>опыта</span></div></div>' +
      '<div class="actions"><button class="btn btn-primary btn-big" id="gr-again">🔁 Ещё раз</button>' +
      '<button class="btn btn-ghost" id="gr-list">🎮 Другие игры</button>' +
      '<button class="btn btn-ghost" id="gr-home">🏠 Домой</button></div></div>';
    root.querySelector('#gr-again').onclick = () => startGame(g);
    root.querySelector('#gr-list').onclick = () => renderGames();
    root.querySelector('#gr-home').onclick = () => S.app.renderHome();
    document.body.classList.remove('playing');
  }

  /* ---------- мемори-турнир ---------- */
  const ROUNDS = [3, 4, 6];
  function startMemoryCup(g) {
    state.round = 0; state.score = 0; state.moves = 0; state.startedAt = Date.now();
    gameShell(g, '<div id="mem-area"></div>');
    const box = $('#gp-timer-box');
    box.querySelector('b').id = 'gp-round';
    box.querySelector('b').textContent = '1/3';
    box.querySelector('span').textContent = 'раунд';
    memRound(g);
  }
  function memRound(g) {
    const pairsCount = ROUNDS[state.round];
    const les = S.getLesson('logic', 'lg-memory');
    let task = null;
    for (let i = 0; i < 30 && !task; i++) {
      const t = les ? les.gen(state.round + 1) : null;
      if (t && t.type === 'memory' && t.pairs.length >= 3) task = t;
    }
    if (!task) { finishMemCup(g); return; }
    const pairs = task.pairs.slice(0, pairsCount);
    const area = $('#mem-area');
    area.innerHTML = '';
    const card = el('div', 'task');
    card.appendChild(el('div', 'task-prompt', 'Раунд ' + (state.round + 1) + ' из 3: найди ' + U.count(pairs.length, ['пару', 'пары', 'пар'])));
    const holder = el('div', 'task-body');
    card.appendChild(holder);
    area.appendChild(card);
    const roundStart = Date.now();
    let moves = 0;
    T.render({ type: 'memory', prompt: '', pairs }, holder, {
      onMistake() { moves++; },
      onDone() {
        const secs = Math.round((Date.now() - roundStart) / 1000);
        const bonus = Math.max(5, 60 - secs) + pairs.length * 5;
        state.score += bonus;
        $('#gp-score').textContent = state.score;
        S.audio.play('star');
        floatText('+' + bonus + ' очков за раунд', 'good');
        state.round++;
        if (state.round >= ROUNDS.length) setTimeout(() => finishMemCup(g), 900);
        else setTimeout(() => { $('#gp-round').textContent = (state.round + 1) + '/3'; memRound(g); }, 900);
      }
    });
    /* у мемори свой заголовок не нужен — убираем пустую строку */
    const p = holder.querySelector('.task-prompt'); if (p) p.remove();
  }
  function finishMemCup(g) {
    if (!state.game) return;
    state.game = null;
    const score = state.score;
    const isRecord = saveRec(g.id, score);
    S.audio.play(isRecord ? 'levelup' : 'done');
    S.confetti.burst({ count: isRecord ? 200 : 100 });
    const r = rec(g.id);
    const secs = Math.round((Date.now() - state.startedAt) / 1000);
    const root = $('#screen-game');
    root.innerHTML =
      '<div class="card result"><div style="font-size:72px">🃏</div><h1>Мемори-турнир пройден!</h1>' +
      (isRecord ? '<div class="reward" style="justify-content:center"><div class="ic">🏆</div><div><b>Новый рекорд!</b></div></div>' : '') +
      '<div class="stat-row"><div class="stat"><b>' + score + '</b><span>очков</span></div>' +
      '<div class="stat"><b>' + secs + ' с</b><span>время</span></div>' +
      '<div class="stat"><b>' + r.best + '</b><span>рекорд</span></div>' +
      '<div class="stat"><b>+' + Math.round(score * 2) + '</b><span>опыта</span></div></div>' +
      '<div class="actions"><button class="btn btn-primary btn-big" id="gr-again">🔁 Ещё раз</button>' +
      '<button class="btn btn-ghost" id="gr-list">🎮 Другие игры</button>' +
      '<button class="btn btn-ghost" id="gr-home">🏠 Домой</button></div></div>';
    root.querySelector('#gr-again').onclick = () => startGame(g);
    root.querySelector('#gr-list').onclick = () => renderGames();
    root.querySelector('#gr-home').onclick = () => S.app.renderHome();
    document.body.classList.remove('playing');
  }

  S.games = { GAMES, renderGames, rec, startGame };
})();
