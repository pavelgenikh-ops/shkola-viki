/* Дипломы: выдаются за предмет и за особые достижения, печатаются на принтере. */
(function () {
  const S = window.SCHOOL, U = S.util, G = S.game, ST = S.store, T = S.tasks;
  const esc = T.esc, el = T.el;
  const $ = sel => document.querySelector(sel);

  const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  function today() {
    const d = new Date();
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() + ' года';
  }

  /** Условия дипломов. level: 'bronze' — предмет пройден, 'gold' — все уроки на 3 звезды */
  function subjectState(p, sub) {
    const lessons = sub.lessons;
    if (!lessons.length) return null;
    const started = lessons.filter(l => G.bestStars(p, l.id) >= 1).length;
    const perfect = lessons.filter(l => G.lessonStarsSum(p, l.id) === 9).length;
    const allDone = started === lessons.length;
    const allPerfect = perfect === lessons.length;
    return { started, perfect, total: lessons.length, allDone, allPerfect };
  }

  function list(p) {
    const out = [];
    S.subjects.forEach(sub => {
      const st = subjectState(p, sub);
      if (!st) return;
      out.push({
        id: 'subj-' + sub.id, kind: 'subject', sub, emoji: sub.emoji, color: sub.color,
        title: 'Диплом по предмету «' + sub.title + '»',
        text: 'за то, что все уроки предмета «' + sub.title + '» пройдены до конца. Звание — знаток предмета!',
        got: st.allDone, progress: st.started + ' из ' + st.total + ' уроков',
        gold: st.allPerfect
      });
    });
    out.push({
      id: 'all-subjects', kind: 'special', emoji: '🎓', color: '#6c5ce7',
      title: 'Диплом «Все предметы покорены»',
      text: 'за то, что пройдены все уроки всех предметов. Это настоящее усердие!',
      got: S.subjects.every(sub => { const st = subjectState(p, sub); return st && st.allDone; }),
      progress: S.subjects.filter(sub => { const st = subjectState(p, sub); return st && st.allDone; }).length + ' из ' + S.subjects.length + ' предметов'
    });
    out.push({
      id: 'stars-100', kind: 'special', emoji: '⭐', color: '#f5a623',
      title: 'Диплом «Сто звёзд»', text: 'за сто звёзд, собранных старанием и внимательностью',
      got: p.stars >= 100, progress: Math.min(p.stars, 100) + ' из 100 звёзд'
    });
    out.push({
      id: 'tasks-500', kind: 'special', emoji: '💪', color: '#2ecc71',
      title: 'Диплом «Пятьсот задач»', text: 'за пятьсот решённых заданий и упорство в каждом из них',
      got: p.tasksTotal >= 500, progress: Math.min(p.tasksTotal, 500) + ' из 500 заданий'
    });
    out.push({
      id: 'streak-7', kind: 'special', emoji: '🔥', color: '#ff5c6c',
      title: 'Диплом «Неделя без пропусков»', text: 'за семь дней занятий подряд, без единого пропуска',
      got: p.streak.count >= 7 || Object.keys(p.streak.days || {}).length >= 7,
      progress: 'серия ' + p.streak.count + ' ' + U.plural(p.streak.count, ['день', 'дня', 'дней'])
    });
    return out;
  }

  function render() {
    const p = ST.profile(); if (!p) return;
    const items = list(p);
    const got = items.filter(x => x.got).length;
    const root = $('#screen-diploma');
    root.innerHTML =
      '<div class="topbar"><button class="btn btn-ghost" id="d-back">← Домой</button><h1 class="grow">🎓 Дипломы</h1>' +
      '<div class="pill">' + got + ' / ' + items.length + '</div></div>' +
      '<p class="muted" style="font-weight:800">Готовый диплом можно распечатать и повесить на стену.</p>' +
      '<div class="grid grid-lessons" id="d-list"></div>';
    const wrap = root.querySelector('#d-list');
    items.forEach(it => {
      const b = el('button', 'lesson-card' + (it.got ? ' complete' : ''),
        '<div class="emoji">' + (it.got ? it.emoji : '🔒') + '</div><div><div class="title">' + esc(it.title) + '</div>' +
        '<div class="lv"><span>' + (it.got ? (it.gold ? 'получен · все уроки на 3 звезды' : 'получен') : esc(it.progress)) + '</span></div></div>');
      b.style.setProperty('--c', it.color); b.type = 'button';
      b.onclick = () => {
        S.audio.play('click');
        if (!it.got) { S.app.toast('Диплом ещё не открыт: ' + it.progress); return; }
        showDiploma(it, p);
      };
      wrap.appendChild(b);
    });
    root.querySelector('#d-back').onclick = () => S.app.renderHome();
    S.app.show('screen-diploma');
  }

  function showDiploma(it, p) {
    const stars = it.kind === 'subject' ? G.subjectProgress(p, it.sub).got : p.stars;
    const maxStars = it.kind === 'subject' ? G.subjectProgress(p, it.sub).max : null;
    const lv = G.levelFor(p.xp);
    const root = $('#screen-diploma');
    root.innerHTML =
      '<div class="topbar no-print"><button class="btn btn-ghost" id="d-back2">← К дипломам</button><div class="grow"></div>' +
      '<button class="btn btn-primary" id="d-print">🖨️ Распечатать</button></div>' +
      '<div class="diploma" id="diploma" style="--c:' + it.color + '">' +
      '<div class="dip-border">' +
      '<div class="dip-emoji">' + it.emoji + '</div>' +
      '<div class="dip-kicker">Школа Вики</div>' +
      '<h1 class="dip-title">' + esc(it.title).replace(/^Диплом /, 'Диплом<br>') + '</h1>' +
      '<div class="dip-award">награждается</div>' +
      '<div class="dip-name">' + esc(p.name) + '</div>' +
      '<div class="dip-text">' + esc(it.text) + '</div>' +
      '<div class="dip-stats">' +
      (it.kind === 'subject' ? '<span>⭐ ' + stars + ' из ' + maxStars + ' звёзд</span>' : '<span>⭐ ' + p.stars + ' звёзд всего</span>') +
      '<span>📚 ' + p.lessonsDone + ' ' + U.plural(p.lessonsDone, ['занятие', 'занятия', 'занятий']) + '</span>' +
      '<span>' + lv.emoji + ' ' + esc(lv.title) + '</span></div>' +
      '<div class="dip-foot"><div class="dip-date">' + today() + '</div>' +
      '<div class="dip-sign"><span>' + (G.MASCOTS[p.mascot] || G.MASCOTS.fox).emoji + '</span><i>твой помощник</i></div></div>' +
      '</div></div>';
    root.querySelector('#d-back2').onclick = () => render();
    root.querySelector('#d-print').onclick = () => {
      document.body.classList.add('printing');
      setTimeout(() => { window.print(); setTimeout(() => document.body.classList.remove('printing'), 500); }, 60);
    };
    S.audio.play('badge');
  }

  S.diploma = { render, list };
})();
