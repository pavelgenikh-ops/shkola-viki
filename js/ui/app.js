/* Экраны и логика приложения «Школа Вики». */
(function () {
  const S = window.SCHOOL, U = S.util, G = S.game, ST = S.store, T = S.tasks;
  const esc = T.esc, rich = T.rich, el = T.el;
  const $ = sel => document.querySelector(sel);
  const SUBJECT_ORDER = ['math', 'russian', 'reading', 'world', 'english', 'logic'];

  const state = { subject: null, lesson: null, level: 1, session: null, fromDaily: false, parentOk: false };

  /* ---------- служебное ---------- */
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
    document.body.classList.toggle('playing', id === 'screen-play');
    hideFeedback(); window.scrollTo(0, 0);
  }
  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }
  function modal(opts) {
    const root = $('#modal-root'); root.innerHTML = '';
    const bg = el('div', 'modal-bg'); const m = el('div', 'modal');
    if (opts.title) m.appendChild(el('h2', '', rich(opts.title)));
    if (opts.html) m.appendChild(el('div', '', opts.html));
    const acts = el('div', 'actions');
    (opts.buttons || []).forEach(b => {
      const x = el('button', 'btn ' + (b.cls || ''), b.label); x.type = 'button';
      x.onclick = () => { root.innerHTML = ''; b.onClick && b.onClick(m); };
      acts.appendChild(x);
    });
    m.appendChild(acts); bg.appendChild(m); root.appendChild(bg);
    if (opts.onOpen) opts.onOpen(m);
    return m;
  }
  const closeModal = () => { $('#modal-root').innerHTML = ''; };
  const profile = () => ST.profile();
  const mascot = p => G.MASCOTS[(p || profile() || {}).mascot] || G.MASCOTS.fox;
  const subjects = () => S.subjects.slice().sort((a, b) => {
    const ia = SUBJECT_ORDER.indexOf(a.id), ib = SUBJECT_ORDER.indexOf(b.id);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const starsHtml = n => '<span class="stars"><b>' + '★'.repeat(n) + '</b>' + '★'.repeat(3 - n) + '</span>';
  const fmtMin = secs => { const m = Math.round(secs / 60); return m < 60 ? m + ' мин' : Math.floor(m / 60) + ' ч ' + (m % 60) + ' мин'; };

  function bubbles() {
    const b = $('#bubbles'); if (!b) return;
    const colors = ['#ffd6e0', '#d6f5e3', '#dbe9ff', '#fff1c9', '#eadcff', '#d9f7fb'];
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span');
      const size = 40 + Math.random() * 120;
      s.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + Math.random() * 100 + '%;background:' + colors[i % colors.length] +
        ';animation-duration:' + (18 + Math.random() * 22) + 's;animation-delay:-' + Math.random() * 30 + 's;';
      b.appendChild(s);
    }
  }

  function playerBar(p) {
    const lv = G.levelFor(p.xp);
    return '<div class="player"><div class="avatar">' + p.avatar + '</div><div><div class="name">' + esc(p.name) + '</div>' +
      '<div class="lvl">' + lv.emoji + ' ' + lv.title + ' · ' + p.xp + ' XP</div><div class="xpbar"><i style="width:' + Math.round(lv.progress * 100) + '%"></i></div></div></div>' +
      '<div class="pill gold">⭐ ' + p.stars + '</div>' + (p.streak.count > 0 ? '<div class="pill fire">🔥 ' + p.streak.count + '</div>' : '');
  }

  /* ---------- профили ---------- */
  function renderProfiles() {
    const root = $('#screen-profiles');
    const list = ST.profiles();
    root.innerHTML = '<div class="result"><h1>🎒 Школа Вики</h1><p class="muted" style="font-weight:800">Кто сегодня будет учиться?</p></div><div class="profiles" id="plist"></div>';
    const pl = root.querySelector('#plist');
    list.forEach(p => {
      const lv = G.levelFor(p.xp);
      const b = el('button', 'profile-btn', '<div class="av">' + p.avatar + '</div><div class="nm">' + esc(p.name) + '</div><div class="sub">' + lv.emoji + ' ' + lv.title + ' · ⭐ ' + p.stars + '</div>');
      b.type = 'button'; b.onclick = () => { S.audio.play('click'); ST.setCurrent(p.id); renderHome(); show('screen-home'); };
      pl.appendChild(b);
    });
    const add = el('button', 'profile-btn add', '<div class="av">➕</div><div class="nm">Новый ученик</div>');
    add.type = 'button'; add.onclick = () => { renderNewProfile(); show('screen-newprofile'); };
    pl.appendChild(add);
    show('screen-profiles');
  }

  function renderNewProfile() {
    const root = $('#screen-newprofile');
    const hasAny = ST.profiles().length > 0;
    let avatar = '👧', mascotKey = 'fox';
    root.innerHTML =
      '<div class="topbar"><button class="btn btn-ghost" id="np-back">← Назад</button><h1 class="grow">Новый ученик</h1></div>' +
      '<div class="card">' +
      '<div class="field"><label>Как тебя зовут?</label><input class="text-input" id="np-name" maxlength="20" placeholder="Имя" value="' + (hasAny ? '' : 'Вика') + '"></div>' +
      '<div class="field"><label>Выбери себе картинку</label><div class="emoji-pick" id="np-av"></div></div>' +
      '<div class="field"><label>Выбери друга, который будет тебе помогать</label><div class="mascot-pick" id="np-ms"></div></div>' +
      '<div class="check-row"><button class="btn btn-primary btn-big" id="np-go">Поехали! 🚀</button></div></div>';
    const av = root.querySelector('#np-av');
    G.AVATARS.forEach(a => {
      const b = el('button', a === avatar ? 'on' : '', a); b.type = 'button';
      b.onclick = () => { avatar = a; av.querySelectorAll('button').forEach(x => x.classList.toggle('on', x.textContent === a)); S.audio.play('click'); };
      av.appendChild(b);
    });
    const ms = root.querySelector('#np-ms');
    Object.keys(G.MASCOTS).forEach(k => {
      const m = G.MASCOTS[k];
      const b = el('button', k === mascotKey ? 'on' : '', '<div class="f">' + m.emoji + '</div><div class="n">' + m.name + '</div>'); b.type = 'button';
      b.onclick = () => { mascotKey = k; ms.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); S.audio.play('click'); };
      ms.appendChild(b);
    });
    root.querySelector('#np-back').onclick = () => renderProfiles();
    root.querySelector('#np-go').onclick = () => {
      const name = root.querySelector('#np-name').value.trim();
      if (!name) { toast('Напиши своё имя 😊'); root.querySelector('#np-name').focus(); return; }
      ST.newProfile(name, avatar, mascotKey);
      S.audio.play('unlock');
      renderHome(); show('screen-home');
    };
  }

  /* ---------- главная ---------- */
  function suggestLesson(p) {
    const all = S.allLessons();
    if (!all.length) return null;
    const started = all.filter(l => G.bestStars(p, l.id) > 0 && G.lessonStarsSum(p, l.id) < 9);
    if (started.length && U.chance(0.5)) return U.pick(started);
    const fresh = all.filter(l => G.bestStars(p, l.id) === 0);
    return fresh.length ? U.pick(fresh) : U.pick(all);
  }

  function renderHome() {
    const p = profile(); if (!p) return renderProfiles();
    const root = $('#screen-home');
    const m = mascot(p);
    const sug = suggestLesson(p);
    const dailyDone = p.daily && p.daily.date === ST.today() && p.daily.done;
    let greet = G.phrase('greet', { name: p.name });
    if (sug && U.chance(0.6)) greet += ' Может, «' + sug.title + '»?';
    root.innerHTML =
      '<div class="topbar">' + playerBar(p) + '<div class="grow"></div>' +
      '<button class="btn btn-ghost" id="h-games">🎮 <span class="btn-label">Игры</span></button><button class="btn btn-ghost" id="h-stickers">🎒 <span class="btn-label">Наклейки</span></button>' +
      '<button class="btn btn-ghost" id="h-badges">🏅 <span class="btn-label">Награды</span></button><button class="btn btn-ghost" id="h-diploma">🎓 <span class="btn-label">Дипломы</span></button>' +
      '<button class="btn btn-round btn-ghost" id="h-music" title="Фоновая музыка">' + (ST.settings().music ? '🎵' : '🔇') + '</button>' +
      '<button class="btn btn-ghost" id="h-parent">👨‍👩‍👧 <span class="btn-label">Родителям</span></button><button class="btn btn-ghost" id="h-switch">👤</button></div>' +
      '<div class="mascot"><button class="face" id="h-mascot" title="Поменять голос">' + m.emoji + '</button>' +
      '<div class="bubble">' + esc(greet) + ' <span class="muted" style="font-size:15px">нажми на меня, чтобы поменять голос 🔊</span></div></div>' +
      '<div class="daily' + (dailyDone ? ' done' : '') + '" id="h-daily" role="button"><div class="ic">' + (dailyDone ? '✅' : '🎯') + '</div><div><div class="t">Задание дня</div>' +
      '<div class="d">' + (dailyDone ? 'Сегодня выполнено! Приходи завтра за новым.' : G.DAILY_TASKS + ' заданий из разных предметов · опыт ×2') + '</div></div></div>' +
      '<div class="grid grid-subjects" id="h-subjects"></div>';
    const grid = root.querySelector('#h-subjects');
    subjects().forEach(sub => {
      const pr = G.subjectProgress(p, sub);
      const b = el('button', 'subject-card', '<div class="emoji">' + sub.emoji + '</div><div class="title">' + esc(sub.title) + '</div><div class="desc">' + esc(sub.desc || '') +
        '</div><div class="prog"><div class="bar"><i style="width:' + pr.pct + '%"></i></div><span>' + pr.started + '/' + pr.total + ' уроков</span></div>');
      b.style.setProperty('--c', sub.color || '#6c5ce7'); b.type = 'button';
      b.onclick = () => { S.audio.play('click'); openSubject(sub); };
      grid.appendChild(b);
    });
    if (!S.subjects.length) grid.innerHTML = '<div class="card">Пока нет ни одного предмета — файлы контента ещё не подключены.</div>';
    root.querySelector('#h-mascot').onclick = () => { S.audio.play('tap'); voiceModal(); };
    root.querySelector('#h-games').onclick = () => { S.audio.play('click'); S.games.renderGames(); };
    root.querySelector('#h-diploma').onclick = () => { S.audio.play('click'); S.diploma.render(); };
    root.querySelector('#h-music').onclick = e => {
      const s = ST.settings();
      s.music = !s.music; ST.save();
      e.currentTarget.textContent = s.music ? '🎵' : '🔇';
      if (s.music) { S.audio.unlock(); S.audio.startMusic(); toast('Музыка включена 🎵'); }
      else { S.audio.stopMusic(); toast('Музыка выключена'); }
    };
    root.querySelector('#h-stickers').onclick = () => renderStickers();
    root.querySelector('#h-badges').onclick = () => renderBadges();
    root.querySelector('#h-parent').onclick = () => parentGate();
    root.querySelector('#h-switch').onclick = () => renderProfiles();
    root.querySelector('#h-daily').onclick = () => { if (dailyDone) { toast('Задание дня уже выполнено. Завтра будет новое! 🌙'); return; } startDaily(); };
    show('screen-home');
  }

  /* ---------- предмет ---------- */
  function openSubject(sub) {
    state.subject = sub;
    const p = profile(); const root = $('#screen-subject');
    const pr = G.subjectProgress(p, sub);
    root.innerHTML =
      '<div class="topbar"><button class="btn btn-ghost" id="s-back">← Домой</button>' +
      '<div class="avatar" style="background:' + sub.color + '22">' + sub.emoji + '</div><div class="grow"><h1>' + esc(sub.title) + '</h1>' +
      '<div class="muted" style="font-weight:800">' + pr.got + ' из ' + pr.max + ' звёзд · ' + pr.started + '/' + pr.total + ' уроков начато</div></div>' +
      '<div class="pill gold">⭐ ' + pr.got + '</div></div><div id="s-sections"></div>';
    const wrap = root.querySelector('#s-sections');
    sub.sections.forEach(sec => {
      wrap.appendChild(el('div', 'section-title', esc(sec.title) + ' <small>' + sec.lessons.length + ' ' + U.plural(sec.lessons.length, ['урок', 'урока', 'уроков']) + '</small>'));
      const grid = el('div', 'grid grid-lessons');
      sec.lessons.forEach(les => {
        const sum = G.lessonStarsSum(p, les.id);
        const lv = [1, 2, 3].map(l => {
          const s = G.levelStars(p, les.id, l);
          return '<span class="' + (s === 3 ? 'full' : s > 0 ? 'done' : '') + '">' + G.LEVEL_EMOJI[l] + ' ' + '★'.repeat(s) + '☆'.repeat(3 - s) + '</span>';
        }).join('');
        const b = el('button', 'lesson-card' + (sum === 9 ? ' complete' : ''), '<div class="emoji">' + (les.emoji || '📘') + '</div><div><div class="title">' + esc(les.title) + '</div><div class="lv">' + lv + '</div></div>');
        b.style.setProperty('--c', sub.color); b.type = 'button';
        b.onclick = () => { S.audio.play('click'); openLesson(les); };
        grid.appendChild(b);
      });
      wrap.appendChild(grid);
    });
    root.querySelector('#s-back').onclick = () => renderHome();
    show('screen-subject');
  }

  /* ---------- урок: правило и уровни ---------- */
  function openLesson(les) {
    state.lesson = les;
    const sub = S.getSubject(les.subjectId); state.subject = sub;
    const p = profile(); const root = $('#screen-lesson'); const m = mascot(p);
    root.innerHTML =
      '<div class="topbar"><button class="btn btn-ghost" id="l-back">← ' + esc(sub.title) + '</button><div class="grow"></div></div>' +
      '<div class="card"><div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><div class="avatar lg" style="background:' + sub.color + '22">' + (les.emoji || '📘') + '</div>' +
      '<div><div class="muted" style="font-weight:800">' + esc(sub.title) + ' · ' + esc(les.sectionTitle || '') + '</div><h1>' + esc(les.title) + '</h1></div></div>' +
      (les.rule ? '<div class="rule-card"><div class="lbl">📌 Правило <button class="btn btn-ghost" id="l-say" style="font-size:14px;padding:4px 10px;margin-left:6px">🔊 Послушать</button></div>' + rich(les.rule) + '</div>' : '') +
      '<div class="mascot" style="margin-top:6px"><div class="face small">' + m.emoji + '</div><div class="bubble">Выбирай уровень! Начни с лёгкого, а потом — выше!</div></div>' +
      '<div class="levels" id="l-levels"></div></div>';
    const lv = root.querySelector('#l-levels');
    [1, 2, 3].forEach(level => {
      const st = ST.levelState(p, les.id, level);
      const stars = st ? st.stars : 0;
      const locked = level > 1 && G.levelStars(p, les.id, level - 1) < 1;
      const b = el('button', 'level-btn l' + level + (locked ? ' locked' : ''),
        '<div class="n">' + G.LEVEL_EMOJI[level] + '</div><div class="t">' + G.LEVEL_NAMES[level] + '</div>' + starsHtml(stars) +
        '<div class="s">' + G.LEVEL_TASKS[level] + ' заданий' + (st && st.plays ? ' · лучший ' + st.best + '%' : '') + '</div>');
      b.type = 'button';
      b.onclick = () => {
        if (locked) { toast('Сначала пройди уровень «' + G.LEVEL_NAMES[level - 1] + '» хотя бы на одну звезду 🌟'); return; }
        S.audio.play('click'); startSession(les, level);
      };
      lv.appendChild(b);
    });
    root.querySelector('#l-back').onclick = () => openSubject(sub);
    const sayBtn = root.querySelector('#l-say');
    if (sayBtn) sayBtn.onclick = () => { S.audio.play('tap'); S.audio.speak(S.audio.taskText(les.rule), 'ru-RU'); };
    show('screen-lesson');
  }

  /* ---------- сессия ---------- */
  function generateTasks(les, level, n) {
    const out = [], keys = new Set();
    for (let i = 0; i < n * 8 && out.length < n; i++) {
      let t;
      try { t = les.gen(level); } catch (e) { console.error('gen', les.id, e); continue; }
      if (!t || !t.type) continue;
      const k = S.taskKey(t);
      if (keys.has(k)) continue;
      keys.add(k); out.push({ task: t, lesson: les });
    }
    while (out.length < n && out.length) out.push(out[out.length % out.length]);
    return out;
  }

  function startSession(les, level, opts) {
    opts = opts || {};
    const n = opts.daily ? G.DAILY_TASKS : G.LEVEL_TASKS[level];
    const items = opts.items || generateTasks(les, level, n);
    if (!items.length) { toast('Не удалось собрать задания для урока'); return; }
    state.session = { lesson: les, subject: les ? S.getSubject(les.subjectId) : null, level, items, i: 0, results: [], startedAt: Date.now(), daily: !!opts.daily };
    renderPlayShell();
    renderTask();
    show('screen-play');
  }

  function renderPlayShell() {
    const root = $('#screen-play'); const m = mascot(); const set = ST.settings();
    root.innerHTML =
      '<div class="playbar"><button class="btn btn-round btn-ghost" id="p-exit" title="Выйти">✕</button><div class="progress"><i id="p-bar"></i></div>' +
      '<div class="progress-count" id="p-count"></div>' +
      '<button class="btn btn-round btn-ghost" id="p-read" title="Читать задания вслух">' + (set.readAloud ? '🔊' : '🔇') + '</button>' +
      '<button class="btn btn-round btn-ghost" id="p-repeat" title="Повторить задание">🔁</button></div>' +
      '<div class="dots" id="p-dots"></div>' +
      '<div class="muted" id="p-label" style="font-weight:800;margin:0 4px 8px;text-align:center"></div><div id="task-root"></div>' +
      '<div class="play-mascot" id="p-mascot">' + m.emoji + '</div>';
    root.querySelector('#p-read').onclick = e => {
      const s = ST.settings();
      s.readAloud = !s.readAloud; ST.save();
      e.currentTarget.textContent = s.readAloud ? '🔊' : '🔇';
      S.audio.play('tap');
      if (s.readAloud) { const it = state.session && state.session.items[state.session.i]; if (it) S.audio.speakTask(it.task); }
      else S.audio.stop();
      toast(s.readAloud ? 'Задания читаются вслух' : 'Чтение вслух выключено');
    };
    root.querySelector('#p-repeat').onclick = () => {
      const it = state.session && state.session.items[state.session.i];
      if (!it) return;
      S.audio.play('tap');
      if (it.task.say) S.audio.speak(it.task.say, it.task.sayLang || 'ru-RU');
      else S.audio.speak(S.audio.taskText(it.task.prompt), 'ru-RU');
    };
    root.querySelector('#p-exit').onclick = () => {
      modal({ title: 'Закончить урок?', html: '<p class="muted" style="font-weight:700">Результат этого урока не сохранится.</p>',
        buttons: [{ label: 'Продолжить урок', cls: 'btn-primary' }, { label: 'Выйти', cls: 'btn-ghost', onClick: () => exitSession() }] });
    };
  }
  function exitSession() {
    const s = state.session; state.session = null; S.audio.stop();
    if (!s || s.daily) return renderHome();
    openLesson(s.lesson);
  }

  function renderDots() {
    const s = state.session; if (!s) return;
    const d = $('#p-dots'); if (!d) return;
    d.innerHTML = s.items.map((_, i) => {
      const r = s.results[i];
      const cls = i === s.i ? 'now' : r ? (r.correct && !r.mistakes ? 'ok' : r.correct ? 'ok' : 'bad') : '';
      return '<i class="' + cls + '"></i>';
    }).join('');
  }
  function mascotReact(cls) {
    const m = $('#p-mascot'); if (!m) return;
    m.classList.remove('cheer', 'oops');
    void m.offsetWidth;
    m.classList.add(cls);
    setTimeout(() => m.classList.remove(cls), 900);
  }

  function renderTask() {
    const s = state.session; if (!s) return;
    const item = s.items[s.i]; const t = item.task;
    $('#p-bar').style.width = Math.round(s.i / s.items.length * 100) + '%';
    $('#p-count').textContent = (s.i + 1) + ' / ' + s.items.length;
    renderDots();
    const sub = S.getSubject(item.lesson.subjectId);
    const lvl = item.level || s.level;
    document.body.classList.add('playing');
    if (sub) document.body.style.setProperty('--subj', sub.color || '#6c5ce7');
    $('#p-label').textContent = (sub ? sub.emoji + ' ' + sub.title + ' · ' : '') + item.lesson.title + ' · ' + G.LEVEL_EMOJI[lvl] + ' ' + G.LEVEL_NAMES[lvl];
    S.audio.play('swoosh');
    const wrap = T.render(t, $('#task-root'), {
      onMistake() {
        S.audio.play('wrong');
        mascotReact('oops');
        const msg = '<b>' + G.phrase('retry') + '</b>' + (t.hint ? '<br>💡 ' + rich(t.hint) : '');
        T.hint(wrap, msg);
      },
      onDone(r) {
        s.results.push({ correct: r.correct, mistakes: r.mistakes || 0 });
        renderDots();
        const last = s.i + 1 >= s.items.length;
        const streak = (() => { let n = 0; for (let i = s.results.length - 1; i >= 0; i--) { if (s.results[i].correct && !s.results[i].mistakes) n++; else break; } return n; })();
        if (r.correct) {
          S.audio.play(streak >= 3 ? 'correctStreak' : 'correct');
          mascotReact('cheer');
          let title = r.mistakes ? G.phrase('ok2') : G.phrase('ok');
          if (!r.mistakes && streak >= 3) title += ' ' + streak + ' подряд! 🔥';
          if (!r.mistakes && streak > 0 && streak % 5 === 0) S.confetti.burst({ count: 70, duration: 1600 });
          showFeedback(true, title, t.explain ? rich(t.explain) : '', last ? 'Итоги 🏁' : 'Дальше →');
        } else {
          S.audio.play('wrong');
          mascotReact('oops');
          const ct = T.correctText(t);
          const ex = (ct ? 'Правильно: <b>' + esc(ct) + '</b>. ' : '') + (t.explain ? rich(t.explain) : '');
          showFeedback(false, G.phrase('fail'), ex, last ? 'Итоги 🏁' : 'Дальше →');
        }
      }
    });
    setTimeout(() => S.audio.speakTask(t), 250);
  }

  let feedbackNext = null, fbRaf = 0;
  function showFeedback(ok, title, explain, btnLabel) {
    const f = $('#feedback');
    cancelAnimationFrame(fbRaf);
    f.className = 'feedback ' + (ok ? 'ok' : 'bad');
    f.innerHTML = '<div class="inner"><div class="fb-icon">' + (ok ? '🎉' : '🤔') + '</div><div class="fb-text"><div class="fb-title">' + esc(title) + '</div>' +
      (explain ? '<div class="fb-explain">' + explain + '</div>' : '') + '</div><button class="btn ' + (ok ? 'btn-ok' : 'btn-bad') + '" id="fb-next">' + btnLabel + '</button></div>';
    feedbackNext = () => { hideFeedback(); nextTask(); };
    f.querySelector('#fb-next').onclick = feedbackNext;
    if (ST.settings().readAloud && explain) {
      const plain = S.audio.taskText(explain);
      if (plain) setTimeout(() => S.audio.speak(title + '. ' + plain, 'ru-RU'), 300);
    }
    fbRaf = requestAnimationFrame(() => f.classList.add('show'));
    setTimeout(() => { const b = f.querySelector('#fb-next'); b && b.focus(); }, 350);
  }
  function hideFeedback() { cancelAnimationFrame(fbRaf); const f = $('#feedback'); f.classList.remove('show'); feedbackNext = null; }
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && feedbackNext && $('#feedback').classList.contains('show')) { e.preventDefault(); feedbackNext(); } });

  function nextTask() {
    const s = state.session; if (!s) return;
    s.i++;
    if (s.i >= s.items.length) return finishSession();
    renderTask();
  }

  function finishSession() {
    const s = state.session; state.session = null;
    const p = profile();
    const secs = Math.round((Date.now() - s.startedAt) / 1000);
    const summary = G.applyResult(p, {
      lessonId: s.daily ? 'daily' : s.lesson.id, subjectId: s.daily ? 'daily' : s.lesson.subjectId, level: s.level, results: s.results, secs, daily: s.daily
    });
    renderResult(summary, s);
  }

  function renderResult(r, s) {
    const root = $('#screen-result'); const m = mascot();
    const phraseKey = s.daily ? (r.first >= r.total * 0.7 ? 'result3' : 'result2') : 'result' + r.stars;
    let rewards = '';
    if (r.levelUp) rewards += '<div class="reward"><div class="ic">' + r.levelAfter.emoji + '</div><div>Новый уровень: <b>' + r.levelAfter.title + '</b>!</div></div>';
    r.newStickers.forEach(st => { rewards += '<div class="reward"><div class="ic">' + st.emoji + '</div><div>Новая наклейка в альбоме: <b>' + st.name + '</b>!</div></div>'; });
    r.newBadges.forEach(b => { rewards += '<div class="reward"><div class="ic">' + b.emoji + '</div><div>Награда: <b>' + b.title + '</b> — ' + esc(b.desc) + '</div></div>'; });
    if (r.streak >= 2) rewards += '<div class="reward"><div class="ic">🔥</div><div>Серия: <b>' + r.streak + '</b> ' + U.plural(r.streak, ['день', 'дня', 'дней']) + ' подряд!</div></div>';
    const next = G.nextSticker(profile());
    root.innerHTML =
      '<div class="card result">' +
      (s.daily ? '<h1>🎯 Задание дня выполнено!</h1>' : '<div class="result-stars">' + [1, 2, 3].map(i => '<span class="' + (i <= r.stars ? 'on' : '') + '">★</span>').join('') + '</div><h1>' + esc(s.lesson.title) + '</h1>') +
      '<div class="mascot" style="justify-content:center"><div class="face">' + m.emoji + '</div><div class="bubble">' + esc(G.phrase(phraseKey)) + '</div></div>' +
      '<div class="stat-row"><div class="stat"><b>' + r.first + '/' + r.total + '</b><span>верно с первого раза</span></div><div class="stat"><b>' + r.any + '/' + r.total + '</b><span>всего верно</span></div>' +
      '<div class="stat"><b>+' + r.xp + '</b><span>опыта' + (s.daily ? ' (×2)' : '') + '</span></div>' + (!s.daily && r.stars > r.prevStars ? '<div class="stat"><b>+' + (r.stars - r.prevStars) + ' ⭐</b><span>новых звёзд</span></div>' : '') + '</div>' +
      rewards +
      (next ? '<p class="muted" style="font-weight:800">До следующей наклейки ' + next.emoji + ' — ещё ' + Math.max(0, next.need - profile().stars) + ' ⭐</p>' : '') +
      '<div class="actions">' +
      (s.daily ? '' : '<button class="btn btn-ghost" id="r-again">🔁 Ещё раз</button>') +
      (!s.daily && s.level < 3 && r.stars >= 1 ? '<button class="btn btn-primary" id="r-next">Следующий уровень ' + G.LEVEL_EMOJI[s.level + 1] + '</button>' : '') +
      (s.daily ? '' : '<button class="btn btn-ghost" id="r-lessons">📚 К урокам</button>') +
      '<button class="btn ' + (s.daily ? 'btn-primary' : 'btn-ghost') + '" id="r-home">🏠 Домой</button></div></div>';
    const q = id => root.querySelector(id);
    q('#r-home').onclick = () => renderHome();
    if (q('#r-again')) q('#r-again').onclick = () => startSession(s.lesson, s.level);
    if (q('#r-next')) q('#r-next').onclick = () => startSession(s.lesson, s.level + 1);
    if (q('#r-lessons')) q('#r-lessons').onclick = () => openSubject(S.getSubject(s.lesson.subjectId));
    show('screen-result');
    S.audio.play(r.levelUp ? 'levelup' : 'done');
    if (s.daily || r.stars >= 2) S.confetti.burst({ count: r.stars === 3 || s.daily ? 220 : 120 });
    r.stars > 0 && [1, 2, 3].slice(0, r.stars).forEach((_, i) => setTimeout(() => S.audio.play('star'), 300 + i * 250));
  }

  /* ---------- задание дня ---------- */
  function startDaily() {
    const p = profile();
    const all = S.allLessons(); if (!all.length) return;
    const picked = U.pickN(all, Math.min(G.DAILY_TASKS, all.length));
    const items = [];
    let tries = 0;
    while (items.length < G.DAILY_TASKS && tries < 60) {
      const les = picked[items.length % picked.length] || U.pick(all);
      tries++;
      const lvl = G.levelStars(p, les.id, 2) > 0 ? U.rand(2, 3) : (G.levelStars(p, les.id, 1) > 0 ? 2 : 1);
      try { const t = les.gen(lvl); if (t && t.type) items.push({ task: t, lesson: les, level: lvl }); } catch (e) { console.error(e); }
    }
    startSession(null, 2, { daily: true, items });
  }

  /* ---------- альбом наклеек ---------- */
  function renderStickers() {
    const p = profile(); const root = $('#screen-stickers');
    const seen = new Set(p.seenStickers || []);
    root.innerHTML = '<div class="topbar"><button class="btn btn-ghost" id="st-back">← Домой</button><h1 class="grow">🎒 Альбом наклеек</h1><div class="pill gold">⭐ ' + p.stars + '</div></div>' +
      '<p class="muted" style="font-weight:800">Наклейки открываются за звёзды. Собрано: ' + p.stickers.length + ' из ' + G.STICKERS.length + '</p><div class="sticker-grid" id="st-grid"></div>';
    const grid = root.querySelector('#st-grid');
    G.STICKERS.forEach(s => {
      const has = p.stickers.includes(s.id);
      const d = el('div', 'sticker' + (has ? '' : ' locked') + (has && !seen.has(s.id) ? ' new' : ''), has ? s.emoji + '<small>' + s.name + '</small>' : '❓<small>' + s.need + ' ⭐</small>');
      d.title = has ? s.name : 'Откроется при ' + s.need + ' звёздах';
      grid.appendChild(d);
    });
    p.seenStickers = p.stickers.slice(); ST.save();
    root.querySelector('#st-back').onclick = () => renderHome();
    show('screen-stickers');
  }

  /* ---------- награды ---------- */
  function renderBadges() {
    const p = profile(); const root = $('#screen-badges');
    const got = Object.keys(p.badges).length;
    root.innerHTML = '<div class="topbar"><button class="btn btn-ghost" id="b-back">← Домой</button><h1 class="grow">🏅 <span class="btn-label">Награды</span></h1><div class="pill">' + got + ' / ' + G.BADGES.length + '</div></div><div class="badge-list" id="b-list"></div>';
    const list = root.querySelector('#b-list');
    G.BADGES.slice().sort((a, b) => (p.badges[b.id] ? 1 : 0) - (p.badges[a.id] ? 1 : 0)).forEach(b => {
      const has = !!p.badges[b.id];
      list.appendChild(el('div', 'badge' + (has ? '' : ' locked'), '<div class="ic">' + b.emoji + '</div><div><div class="t">' + b.title + '</div><div class="d">' + esc(b.desc) + (has ? ' · получено ' + p.badges[b.id] : '') + '</div></div>'));
    });
    root.querySelector('#b-back').onclick = () => renderHome();
    show('screen-badges');
  }

  /* ---------- родителям ---------- */
  function parentGate() {
    if (state.parentOk) return renderParent();
    const a = U.rand(6, 9), b = U.rand(6, 9);
    modal({ title: 'Только для взрослых', html: '<p class="muted" style="font-weight:700">Сколько будет ' + a + ' × ' + b + '?</p><input class="text-input" id="pg-in" inputmode="numeric" style="text-align:center">',
      buttons: [{ label: 'Отмена', cls: 'btn-ghost' }, { label: 'Войти', cls: 'btn-primary', onClick: m => {
        const v = parseInt(m.querySelector('#pg-in').value, 10);
        if (v === a * b) { state.parentOk = true; renderParent(); } else toast('Неверно 🙂');
      } }],
      onOpen: m => { const i = m.querySelector('#pg-in'); i.focus(); i.addEventListener('keydown', e => { if (e.key === 'Enter') m.querySelector('.btn-primary').click(); }); }
    });
  }

  function renderParent() {
    const p = profile(); const root = $('#screen-parent'); const set = ST.settings();
    const lv = G.levelFor(p.xp);
    const acc = p.tasksTotal ? Math.round(p.correctTotal / p.tasksTotal * 100) : 0;
    // активность за 14 дней
    let days = '';
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const n = p.streak.days[k] || 0;
      days += '<div class="day' + (n ? ' on' : '') + '" title="' + k + ': ' + n + ' заданий">' + d.getDate() + '</div>';
    }
    // по предметам
    let rows = '';
    subjects().forEach(sub => {
      const pr = G.subjectProgress(p, sub);
      let c = 0, t = 0;
      sub.lessons.forEach(l => { const ls = p.lessons[l.id]; if (ls && ls.levels) Object.values(ls.levels).forEach(v => { c += v.correct; t += v.total; }); });
      const a = t ? Math.round(c / t * 100) : null;
      rows += '<tr><td>' + sub.emoji + ' ' + esc(sub.title) + '</td><td class="num">' + pr.started + ' / ' + pr.total + '</td><td class="num">' + pr.got + ' / ' + pr.max + '</td><td class="num">' + t + '</td><td>' + accBadge(a) + '</td></tr>';
    });
    // слабые темы
    const weak = [];
    S.allLessons().forEach(l => {
      const ls = p.lessons[l.id]; if (!ls || !ls.levels) return;
      let c = 0, t = 0; Object.values(ls.levels).forEach(v => { c += v.correct; t += v.total; });
      if (t >= 8) weak.push({ l, acc: Math.round(c / t * 100), t });
    });
    weak.sort((a, b) => a.acc - b.acc);
    const weakRows = weak.filter(w => w.acc < 70).slice(0, 8).map(w => '<tr><td>' + esc(S.getSubject(w.l.subjectId).title) + '</td><td>' + esc(w.l.title) + '</td><td class="num">' + w.t + '</td><td>' + accBadge(w.acc) + '</td></tr>').join('');
    const logRows = p.log.slice(0, 15).map(e => {
      const les = e.daily ? null : S.getLesson(e.subjectId, e.lessonId);
      const d = new Date(e.date);
      return '<tr><td>' + d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) + '</td><td>' + (e.daily ? '🎯 Задание дня' : (les ? esc(les.title) : e.lessonId)) +
        '</td><td>' + (e.daily ? '—' : G.LEVEL_NAMES[e.level]) + '</td><td class="num">' + e.correct + '/' + e.total + '</td><td>' + (e.daily ? '' : '★'.repeat(e.stars)) + '</td><td class="num">+' + e.xp + '</td></tr>';
    }).join('');

    root.innerHTML =
      '<div class="topbar"><button class="btn btn-ghost" id="pa-back">← Домой</button><h1 class="grow">👨‍👩‍👧 Для родителей</h1><div class="avatar">' + p.avatar + '</div></div>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">' +
      '<div class="card"><h3>' + esc(p.name) + ' · ' + lv.emoji + ' ' + lv.title + '</h3><div class="stat-row" style="justify-content:flex-start">' +
      '<div class="stat"><b>' + p.tasksTotal + '</b><span>заданий</span></div><div class="stat"><b>' + acc + '%</b><span>точность</span></div><div class="stat"><b>' + p.lessonsDone + '</b><span>уроков</span></div>' +
      '<div class="stat"><b>' + fmtMin(p.secsTotal) + '</b><span>занятий</span></div><div class="stat"><b>' + p.stars + '</b><span>звёзд</span></div><div class="stat"><b>' + p.xp + '</b><span>опыта</span></div></div>' +
      '<div class="muted" style="font-weight:800;margin:6px 0">Активность за 14 дней · серия ' + p.streak.count + ' ' + U.plural(p.streak.count, ['день', 'дня', 'дней']) + '</div><div class="days">' + days + '</div></div>' +
      '<div class="card"><h3>Звук</h3>' +
      '<label style="display:block;margin:10px 0;font-weight:800"><input type="checkbox" id="pa-sound"' + (set.sound !== false ? ' checked' : '') + '> Звуки кнопок и наград</label>' +
      '<label style="display:block;margin:10px 0;font-weight:800"><input type="checkbox" id="pa-music"' + (set.music ? ' checked' : '') + '> Тихая фоновая музыка</label>' +
      '<label style="display:block;margin:10px 0;font-weight:800"><input type="checkbox" id="pa-read"' + (set.readAloud ? ' checked' : '') + '> Читать задания и объяснения вслух</label>' +
      '<label style="display:block;margin:10px 0;font-weight:800"><input type="checkbox" id="pa-tts"' + (set.tts !== false ? ' checked' : '') + '> Озвучка слов (диктанты, английский)</label>' +
      '<h3 style="margin-top:14px">Характер голоса</h3>' +
      '<div class="muted" style="font-size:14px;font-weight:700;margin-bottom:6px">Нажмите карточку — голос сразу заговорит так.</div>' + neuroNote() +
      voiceCards(set) +
      voiceRow('ru-RU', 'voiceRu', 'Русский голос', set) + voiceRow('en-US', 'voiceEn', 'Английский голос', set) +
      '<div class="muted" style="font-size:13px;font-weight:700;margin-top:6px">Мягкие голоса (Natural) есть в Microsoft Edge — запускай через «Запустить.bat». В Chrome нужен интернет для голосов Google.</div>' +
      '<div class="check-row" style="justify-content:flex-start"><button class="btn btn-ghost" id="pa-phone">📱 Открыть на телефоне</button><button class="btn btn-ghost" id="pa-export">💾 Сохранить прогресс в файл</button><button class="btn btn-ghost" id="pa-import">📂 Загрузить из файла</button></div>' +
      '<div class="check-row" style="justify-content:flex-start"><button class="btn btn-ghost" id="pa-reset">♻️ Сбросить прогресс</button><button class="btn btn-ghost" id="pa-delete">🗑️ Удалить ученика</button></div>' +
      '<input type="file" id="pa-file" accept="application/json" class="hidden"></div></div>' +
      '<div class="card" style="margin-top:14px"><h3>По предметам</h3><table class="stats"><tr><th>Предмет</th><th>Уроков начато</th><th>Звёзд</th><th>Заданий</th><th>Точность</th></tr>' + rows + '</table></div>' +
      '<div class="card" style="margin-top:14px"><h3>Темы, где стоит потренироваться</h3>' + (weakRows ? '<table class="stats"><tr><th>Предмет</th><th>Урок</th><th>Заданий</th><th>Точность</th></tr>' + weakRows + '</table>' : '<p class="muted" style="font-weight:700">Пока нет тем с низкой точностью (нужно хотя бы 8 решённых заданий по теме).</p>') + '</div>' +
      '<div class="card" style="margin-top:14px"><h3>Последние занятия</h3>' + (logRows ? '<table class="stats"><tr><th>Когда</th><th>Урок</th><th>Уровень</th><th>Верно</th><th>Звёзды</th><th>Опыт</th></tr>' + logRows + '</table>' : '<p class="muted" style="font-weight:700">Ещё ничего не пройдено.</p>') + '</div>';

    const q = id => root.querySelector(id);
    q('#pa-back').onclick = () => renderHome();
    q('#pa-sound').onchange = e => { set.sound = e.target.checked; ST.save(); if (e.target.checked) S.audio.play('star'); };
    q('#pa-tts').onchange = e => { set.tts = e.target.checked; ST.save(); };
    q('#pa-read').onchange = e => { set.readAloud = e.target.checked; ST.save(); if (!e.target.checked) S.audio.stop(); };
    q('#pa-music').onchange = e => {
      set.music = e.target.checked; ST.save();
      if (e.target.checked) { S.audio.unlock(); S.audio.startMusic(); } else S.audio.stopMusic();
    };
    bindVoiceCards(root);
    root.querySelectorAll('select[data-voice]').forEach(sel => {
      sel.onchange = () => {
        set[sel.dataset.voice] = sel.value; if (sel.dataset.voice === 'voiceRu') S.audio.setPreferredVoice(sel.value); else ST.save();
        if (sel.dataset.voice === 'voiceRu') S.audio.speak('Теперь я говорю этим голосом.', 'ru-RU');
      };
    });
    root.querySelectorAll('button[data-try]').forEach(b => {
      b.onclick = () => S.audio.speak(b.dataset.try === 'ru-RU' ? 'Привет! Я помогу тебе учиться. Давай начнём урок!' : 'Hello! I am a cat. I can jump and run.', b.dataset.try);
    });
    q('#pa-phone').onclick = () => { S.audio.play('click'); window.open('телефон.html', '_blank'); };
    q('#pa-export').onclick = () => {
      const blob = new Blob([ST.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'школа-вики-прогресс-' + ST.today() + '.json'; document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    };
    q('#pa-import').onclick = () => q('#pa-file').click();
    q('#pa-file').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => { try { ST.importJSON(rd.result); toast('Прогресс загружен'); renderParent(); } catch (err) { toast('Не удалось загрузить: ' + err.message); } };
      rd.readAsText(f);
    };
    q('#pa-reset').onclick = () => modal({ title: 'Сбросить весь прогресс?', html: '<p class="muted" style="font-weight:700">Звёзды, опыт, наклейки и награды ученика «' + esc(p.name) + '» будут удалены. Это нельзя отменить.</p>',
      buttons: [{ label: 'Отмена', cls: 'btn-primary' }, { label: 'Сбросить', cls: 'btn-bad', onClick: () => { ST.resetProfile(p.id); toast('Прогресс сброшен'); renderParent(); } }] });
    q('#pa-delete').onclick = () => modal({ title: 'Удалить ученика?', html: '<p class="muted" style="font-weight:700">Профиль «' + esc(p.name) + '» и весь его прогресс будут удалены.</p>',
      buttons: [{ label: 'Отмена', cls: 'btn-primary' }, { label: 'Удалить', cls: 'btn-bad', onClick: () => { ST.deleteProfile(p.id); renderProfiles(); } }] });
    show('screen-parent');
  }
  /** Карточки «характер голоса» — как в Котошколе */
  function voiceCards(set) {
    return '<div class="voice-cards" id="v-cards">' + S.audio.PRESETS.map(p =>
      '<button class="vcard' + (set.voicePreset === p.id ? ' sel' : '') + '" data-id="' + p.id + '" type="button">' +
      '<span class="ve">' + p.e + '</span><b>' + esc(p.name) + '</b><small>' + esc(p.hint) + '</small></button>').join('') + '</div>';
  }
  function bindVoiceCards(root, onPick) {
    root.querySelectorAll('.vcard').forEach(card => {
      card.onclick = () => {
        S.audio.play('tap');
        const p = S.audio.setPreset(card.dataset.id);
        root.querySelectorAll('.vcard').forEach(c => c.classList.toggle('sel', c === card));
        const pr = profile();
        S.audio.speak('Привет' + (pr ? ', ' + pr.name : '') + '! Теперь я говорю вот так.', 'ru-RU');
        if (onPick) onPick(p);
      };
    });
  }
  /** Окно выбора голоса для ребёнка — по клику на друга-помощника */
  function voiceModal() {
    const set = ST.settings(); const m = mascot();
    const body = '<p class="muted" style="font-weight:800;margin:0 0 10px">Нажимай на карточки — послушай, какой голос тебе нравится</p>' + neuroNote() +
      voiceCards(set) +
      '<label style="display:flex;align-items:center;justify-content:center;gap:8px;font-weight:800;margin-top:12px">' +
      '<input type="checkbox" id="vm-read"' + (set.readAloud ? ' checked' : '') + '> Читать задания вслух</label>';
    const mo = modal({ title: m.emoji + ' Каким голосом мне говорить?', html: body, buttons: [{ label: 'Готово', cls: 'btn-primary' }] });
    bindVoiceCards(mo);
    mo.querySelector('#vm-read').onchange = e => { set.readAloud = e.target.checked; ST.save(); if (!e.target.checked) S.audio.stop(); };
  }

  function voiceRow(lang, key, label, set) {
    const list = S.audio.voicesFor(lang);
    const cur = set[key] || '';
    let opts = '<option value="">Авто — лучший из доступных' + (list[0] ? ' (' + esc(list[0].name) + ')' : '') + '</option>';
    list.forEach(v => { opts += '<option value="' + esc(v.name) + '"' + (v.name === cur ? ' selected' : '') + '>' + esc(v.name) + (v.natural ? ' — естественный' : v.local ? ' — системный' : '') + '</option>'; });
    const warn = !list.length ? '<span class="acc lo">голос не найден</span>' : '';
    return '<div class="field" style="margin:8px 0"><label>' + label + ' ' + warn + '</label><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
      '<select class="text-input" style="flex:1;font-size:15px;padding:8px 10px;min-width:220px" data-voice="' + key + '">' + opts + '</select>' +
      '<button class="btn btn-ghost" data-try="' + lang + '">▶ Проба</button></div></div>';
  }
  /** Строка состояния нейросетевого голоса */
  function neuroNote() {
    const n = S.audio.neuro();
    if (!n.on) return '<div class="muted" style="font-size:14px;font-weight:700;margin:6px 0">Сейчас выбран системный голос Windows. Первые три характера в списке считает нейросеть прямо на компьютере — они звучат живее.</div>';
    if (location.protocol === 'file:') return '<div class="acc lo" style="display:block;padding:8px 12px;margin:6px 0">Нейросетевой голос не работает при открытии файлом. Запусти приложение через «Запустить.bat» — он поднимает локальный сервер.</div>';
    return '<div class="muted" style="font-size:14px;font-weight:700;margin:6px 0">Нейросетевой голос: ' +
      (n.ready ? '<span class="acc hi">готов</span>' : '<span class="acc mid">загружается, первые фразы скажет системный голос</span>') + '</div>';
  }
  function accBadge(a) {
    if (a === null || a === undefined) return '<span class="muted">—</span>';
    return '<span class="acc ' + (a >= 80 ? 'hi' : a >= 60 ? 'mid' : 'lo') + '">' + a + '%</span>';
  }

  /* ---------- старт ---------- */
  function init() {
    ST.load(); bubbles();
    document.addEventListener('pointerdown', () => S.audio.unlock(), { once: true });
    if (profile()) { renderHome(); } else renderProfiles();
    /* голоса подгружаются не сразу: через пару секунд проверяем, мягкий ли голос нашёлся */
    setTimeout(() => {
      const set = ST.settings();
      if (!set.readAloud || set.voiceHintShown) return;
      const v = S.audio.currentVoice('ru-RU');
      if (v && !S.audio.isNatural(v)) {
        set.voiceHintShown = true; ST.save();
        toast('Голос звучит роботом? Запусти файл «Запустить.bat» — в Edge голос мягкий');
      }
    }, 2500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  S.app = { renderHome, openSubject, openLesson, startSession, startDaily, renderProfiles, show, toast, modal, mascot, _state: state };
})();
