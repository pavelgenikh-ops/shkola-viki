/* Отрисовка и проверка заданий. SCHOOL.tasks.render(task, root, { onMistake, onDone }) */
(function () {
  const S = window.SCHOOL;
  const U = S.util;

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  /** Экранирует всё, кроме <b>, <i>, <u>, <br> */
  const rich = s => esc(s).replace(/&lt;(\/?)(b|i|u|br)\s*\/?&gt;/g, '<$1$2>');
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  };
  const btn = (cls, html) => { const b = el('button', cls, html); b.type = 'button'; return b; };
  const isEmojiLike = v => v.length <= 3 && !/[a-zA-Zа-яА-ЯёЁ0-9]/.test(v);

  const normalizeAns = v => U.norm(v).replace(/,/g, '.').replace(/\s+/g, ' ');
  function answerMatches(given, answer) {
    const arr = Array.isArray(answer) ? answer : [answer];
    const g = normalizeAns(given);
    const gNum = g.replace(/\s/g, '');
    return arr.some(a => {
      const n = normalizeAns(a);
      if (n === g) return true;
      const nNum = n.replace(/\s/g, '');
      if (/^-?\d+(\.\d+)?$/.test(gNum) && /^-?\d+(\.\d+)?$/.test(nNum)) return Math.abs(parseFloat(gNum) - parseFloat(nNum)) < 1e-9;
      return false;
    });
  }

  /** Текст правильного ответа для панели обратной связи */
  function correctText(t) {
    switch (t.type) {
      case 'choice': return Array.isArray(t.answer) ? t.answer.join(', ') : String(t.answer);
      case 'input': return Array.isArray(t.answer) ? String(t.answer[0]) : String(t.answer);
      case 'compare': return t.a + ' ' + t.answer + ' ' + t.b;
      case 'gap': { let i = 0; return t.text.replace(/_/g, () => String(t.answers[i++])); }
      case 'order': return t.items.join(' ');
      case 'spell': return t.word;
      case 'sort': return t.groups.map(g => g.name + ': ' + g.items.join(', ')).join('; ');
      default: return '';
    }
  }

  function header(task, root) {
    const head = el('div', 'task-head');
    head.appendChild(el('div', 'task-prompt', rich(task.prompt)));
    if (task.say) {
      const b = btn('say-btn', '🔊'); b.title = 'Послушать';
      b.onclick = () => S.audio.speak(task.say, task.sayLang || 'ru-RU');
      head.appendChild(b);
    }
    root.appendChild(head);
    if (task.visual) {
      const v = el('div', 'task-visual');
      const s = String(task.visual).trim();
      v.innerHTML = s.startsWith('<') ? s : '<div class="vis vis-big">' + esc(s) + '</div>';
      root.appendChild(v);
    }
    if (task.say && task.autoSay) setTimeout(() => S.audio.speak(task.say, task.sayLang || 'ru-RU'), 400);
  }

  const R = {};

  /* ---------- choice ---------- */
  R.choice = (t, root, api) => {
    const body = el('div', 'task-body');
    const opts = el('div', 'opts' + (t.big ? ' big' : ''));
    const answers = (t.multi ? t.answer : [t.answer]).map(String);
    let attempts = 0, done = false;
    const buttons = t.options.map(o => {
      const b = btn('opt', rich(String(o))); b.dataset.v = String(o); opts.appendChild(b); return b;
    });
    const reveal = () => buttons.forEach(b => { b.disabled = true; if (answers.includes(b.dataset.v)) b.classList.add('right'); });
    body.appendChild(opts);

    if (!t.multi) {
      buttons.forEach(b => b.onclick = () => {
        if (done) return;
        S.audio.play('click');
        if (answers.includes(b.dataset.v)) {
          done = true; b.classList.add('right'); buttons.forEach(x => x.disabled = true);
          api.onDone({ correct: true, mistakes: attempts });
        } else {
          attempts++; b.classList.add('wrong'); b.disabled = true;
          if (attempts >= 2) { done = true; reveal(); api.onDone({ correct: false, mistakes: attempts }); }
          else api.onMistake();
        }
      });
    } else {
      buttons.forEach(b => b.onclick = () => { if (done) return; S.audio.play('click'); b.classList.toggle('selected'); });
      const check = btn('btn btn-primary btn-big', 'Проверить');
      check.onclick = () => {
        if (done) return;
        const sel = buttons.filter(b => b.classList.contains('selected')).map(b => b.dataset.v);
        if (!sel.length) return;
        const ok = sel.length === answers.length && sel.every(v => answers.includes(v));
        if (ok) {
          done = true; check.disabled = true;
          buttons.forEach(b => { b.disabled = true; if (answers.includes(b.dataset.v)) b.classList.add('right'); });
          api.onDone({ correct: true, mistakes: attempts });
        } else {
          attempts++;
          buttons.forEach(b => {
            if (b.classList.contains('selected') && !answers.includes(b.dataset.v)) {
              b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong', 'selected'), 700);
            }
          });
          if (attempts >= 2) { done = true; check.disabled = true; reveal(); api.onDone({ correct: false, mistakes: attempts }); }
          else api.onMistake();
        }
      };
      const row = el('div', 'check-row'); row.appendChild(check); body.appendChild(row);
    }
    root.appendChild(body);
  };

  /* ---------- input ---------- */
  R.input = (t, root, api) => {
    const body = el('div', 'task-body');
    const inp = el('input', 'answer-input');
    inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false;
    inp.placeholder = t.placeholder || (t.mode === 'num' ? '?' : 'напиши ответ');
    if (t.mode === 'num') inp.inputMode = 'numeric';
    body.appendChild(inp);
    if (t.mode === 'num') {
      const pad = el('div', 'numpad');
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '−', '⌫'].forEach(k => {
        const b = btn('', k);
        b.onclick = () => {
          if (inp.disabled) return; S.audio.play('click');
          if (k === '⌫') inp.value = inp.value.slice(0, -1);
          else if (k === '−') { if (!inp.value) inp.value = '-'; }
          else inp.value += k;
          inp.focus();
        };
        pad.appendChild(b);
      });
      body.appendChild(pad);
    }
    const row = el('div', 'check-row'); const check = btn('btn btn-primary btn-big', 'Проверить'); row.appendChild(check); body.appendChild(row);
    let attempts = 0, done = false;
    const submit = () => {
      if (done) return;
      const v = inp.value.trim(); if (!v) { inp.focus(); return; }
      if (answerMatches(v, t.answer)) {
        done = true; inp.classList.add('right'); inp.disabled = true; check.disabled = true;
        api.onDone({ correct: true, mistakes: attempts });
      } else {
        attempts++; inp.classList.add('wrong'); setTimeout(() => inp.classList.remove('wrong'), 500);
        if (attempts >= 2) {
          done = true; inp.disabled = true; check.disabled = true;
          body.appendChild(el('div', 'answer-reveal', 'Правильно: ' + esc(correctText(t))));
          api.onDone({ correct: false, mistakes: attempts });
        } else { api.onMistake(); inp.select(); inp.focus(); }
      }
    };
    check.onclick = submit;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    root.appendChild(body);
    setTimeout(() => inp.focus(), 80);
  };

  /* ---------- match ---------- */
  R.match = (t, root, api) => {
    const body = el('div', 'task-body'); const grid = el('div', 'match');
    const lefts = t.pairs.map(p => String(p[0]));
    let rights = U.shuffle(t.pairs.map(p => String(p[1])));
    if (rights.length > 1 && rights.every((v, i) => v === String(t.pairs[i][1]))) rights = rights.reverse();
    const map = {}; t.pairs.forEach(p => { map[String(p[0])] = String(p[1]); });
    const lBtns = [], rBtns = [];
    for (let i = 0; i < lefts.length; i++) {
      const l = btn('match-item', rich(lefts[i])); l.dataset.v = lefts[i];
      const r = btn('match-item', rich(rights[i])); r.dataset.v = rights[i];
      grid.appendChild(l); grid.appendChild(r); lBtns.push(l); rBtns.push(r);
    }
    let selL = null, selR = null, mistakes = 0, matched = 0, color = 0, done = false;
    const tryMatch = () => {
      if (!selL || !selR) return;
      const a = selL, b = selR; selL = null; selR = null;
      if (map[a.dataset.v] === b.dataset.v) {
        color++;
        [a, b].forEach(x => { x.classList.remove('selected'); x.classList.add('done'); x.disabled = true; x.style.background = 'var(--pair-' + ((color - 1) % 6 + 1) + ')'; });
        matched++; S.audio.play('flip');
        if (matched === lefts.length) { done = true; api.onDone({ correct: mistakes < lefts.length, mistakes }); }
      } else {
        mistakes++;
        [a, b].forEach(x => x.classList.add('wrong'));
        setTimeout(() => [a, b].forEach(x => x.classList.remove('wrong', 'selected')), 550);
        api.onMistake();
      }
    };
    lBtns.forEach(b => b.onclick = () => { if (done || b.disabled) return; S.audio.play('click'); if (selL) selL.classList.remove('selected'); selL = b; b.classList.add('selected'); tryMatch(); });
    rBtns.forEach(b => b.onclick = () => { if (done || b.disabled) return; S.audio.play('click'); if (selR) selR.classList.remove('selected'); selR = b; b.classList.add('selected'); tryMatch(); });
    body.appendChild(grid); root.appendChild(body);
  };

  /* ---------- order ---------- */
  R.order = (t, root, api) => {
    const items = t.items.map(String);
    let shuffled = U.shuffle(items);
    if (items.length > 1 && shuffled.join('|') === items.join('|')) shuffled = shuffled.slice().reverse();
    const body = el('div', 'task-body'); const line = el('div', 'line'); const pool = el('div', 'pool');
    const row = el('div', 'check-row'); const check = btn('btn btn-primary btn-big', 'Проверить'); row.appendChild(check);
    let placed = [], attempts = 0, done = false;
    function render() {
      line.innerHTML = ''; pool.innerHTML = '';
      placed.forEach((v, i) => {
        const c = btn('chip', rich(v));
        c.onclick = () => { if (done) return; S.audio.play('click'); placed.splice(i, 1); render(); };
        line.appendChild(c);
      });
      shuffled.filter(v => !placed.includes(v)).forEach(v => {
        const c = btn('chip', rich(v));
        c.onclick = () => { if (done) return; S.audio.play('click'); placed.push(v); render(); };
        pool.appendChild(c);
      });
      check.disabled = placed.length !== items.length;
    }
    check.onclick = () => {
      if (done || placed.length !== items.length) return;
      const chips = [...line.querySelectorAll('.chip')];
      const ok = placed.every((v, i) => v === items[i]);
      if (ok) { done = true; chips.forEach(c => c.classList.add('right')); check.disabled = true; api.onDone({ correct: true, mistakes: attempts }); return; }
      attempts++;
      chips.forEach((c, i) => c.classList.add(placed[i] === items[i] ? 'right' : 'wrong'));
      if (attempts >= 2) {
        done = true; check.disabled = true;
        setTimeout(() => { placed = items.slice(); render(); line.querySelectorAll('.chip').forEach(c => c.classList.add('right')); }, 900);
        api.onDone({ correct: false, mistakes: attempts });
      } else {
        api.onMistake();
        setTimeout(() => chips.forEach(c => c.classList.remove('wrong', 'right')), 1000);
      }
    };
    render();
    body.appendChild(line); body.appendChild(pool); body.appendChild(row); root.appendChild(body);
  };

  /* ---------- sort ---------- */
  R.sort = (t, root, api) => {
    const groups = t.groups;
    const truth = {}; groups.forEach((g, gi) => g.items.forEach(it => { truth[String(it)] = gi; }));
    const all = U.shuffle(Object.keys(truth));
    const placed = {}; let selected = null, attempts = 0, done = false;
    const body = el('div', 'task-body'); const gwrap = el('div', 'groups'); const pool = el('div', 'pool');
    const row = el('div', 'check-row'); const check = btn('btn btn-primary btn-big', 'Проверить'); row.appendChild(check);
    const gEls = groups.map((g, gi) => {
      const box = el('div', 'group');
      box.appendChild(el('div', 'group-title', rich(g.name)));
      const itemsEl = el('div', 'group-items'); box.appendChild(itemsEl);
      box.onclick = e => {
        if (done) return;
        if (e.target.closest('.chip')) return;
        if (selected !== null) { S.audio.play('click'); placed[selected] = gi; selected = null; render(); }
      };
      gwrap.appendChild(box);
      return { box, itemsEl };
    });
    function render() {
      pool.innerHTML = ''; gEls.forEach(g => { g.itemsEl.innerHTML = ''; g.box.classList.toggle('target', selected !== null); });
      all.forEach(v => {
        const c = btn('chip', rich(v));
        if (placed[v] === undefined) {
          if (selected === v) c.classList.add('selected');
          c.onclick = () => { if (done) return; S.audio.play('click'); selected = selected === v ? null : v; render(); };
          pool.appendChild(c);
        } else {
          c.onclick = () => { if (done) return; S.audio.play('click'); delete placed[v]; selected = null; render(); };
          gEls[placed[v]].itemsEl.appendChild(c);
        }
      });
      check.disabled = Object.keys(placed).length !== all.length;
    }
    check.onclick = () => {
      if (done || Object.keys(placed).length !== all.length) return;
      const wrongItems = all.filter(v => placed[v] !== truth[v]);
      const chips = [...gwrap.querySelectorAll('.chip')];
      if (!wrongItems.length) { done = true; check.disabled = true; chips.forEach(c => c.classList.add('right')); api.onDone({ correct: true, mistakes: attempts }); return; }
      attempts++;
      chips.forEach(c => c.classList.add(wrongItems.includes(c.textContent) ? 'wrong' : 'right'));
      if (attempts >= 2) {
        done = true; check.disabled = true;
        setTimeout(() => { all.forEach(v => { placed[v] = truth[v]; }); render(); gwrap.querySelectorAll('.chip').forEach(c => c.classList.add('right')); }, 900);
        api.onDone({ correct: false, mistakes: attempts });
      } else {
        api.onMistake();
        setTimeout(() => { wrongItems.forEach(v => { delete placed[v]; }); render(); }, 1100);
      }
    };
    render();
    body.appendChild(gwrap); body.appendChild(pool); body.appendChild(row); root.appendChild(body);
  };

  /* ---------- gap ---------- */
  R.gap = (t, root, api) => {
    const body = el('div', 'task-body'); const textEl = el('div', 'gap-text');
    const parts = t.text.split('_'); const slots = [];
    parts.forEach((seg, i) => {
      textEl.appendChild(document.createTextNode(seg));
      if (i < parts.length - 1) { const s = el('span', 'slot', ''); slots.push(s); textEl.appendChild(s); }
    });
    const answers = t.answers.map(String);
    const filled = new Array(slots.length).fill(null);
    let active = 0, attempts = 0, done = false;
    const tiles = el('div', 'tiles');
    const row = el('div', 'check-row'); const check = btn('btn btn-primary btn-big', 'Проверить'); row.appendChild(check);
    function refresh() {
      slots.forEach((s, i) => {
        s.textContent = filled[i] === null ? '' : filled[i];
        s.classList.toggle('filled', filled[i] !== null);
        s.classList.toggle('active', i === active && !done);
      });
      check.disabled = filled.some(v => v === null);
    }
    t.options.map(String).forEach(o => {
      const b = btn('tile', esc(o));
      b.onclick = () => {
        if (done) return; S.audio.play('click');
        let idx = active;
        if (filled[idx] !== null) { const e = filled.indexOf(null); if (e >= 0) idx = e; }
        filled[idx] = o; slots[idx].classList.remove('wrong');
        const ne = filled.indexOf(null); active = ne >= 0 ? ne : idx;
        refresh();
      };
      tiles.appendChild(b);
    });
    slots.forEach((s, i) => s.onclick = () => {
      if (done) return; S.audio.play('click');
      if (filled[i] !== null) filled[i] = null;
      s.classList.remove('wrong'); active = i; refresh();
    });
    check.onclick = () => {
      if (done || filled.some(v => v === null)) return;
      const wrong = filled.map((v, i) => v !== answers[i]);
      if (!wrong.some(Boolean)) { done = true; check.disabled = true; slots.forEach(s => { s.classList.remove('active'); s.classList.add('right'); }); api.onDone({ correct: true, mistakes: attempts }); return; }
      attempts++;
      slots.forEach((s, i) => s.classList.add(wrong[i] ? 'wrong' : 'right'));
      if (attempts >= 2) {
        done = true; check.disabled = true;
        setTimeout(() => { answers.forEach((a, i) => { filled[i] = a; }); refresh(); slots.forEach(s => { s.classList.remove('wrong'); s.classList.add('right'); }); }, 900);
        api.onDone({ correct: false, mistakes: attempts });
      } else {
        api.onMistake();
        active = wrong.indexOf(true); refresh();
      }
    };
    refresh();
    body.appendChild(textEl); body.appendChild(tiles); body.appendChild(row); root.appendChild(body);
  };

  /* ---------- spell ---------- */
  R.spell = (t, root, api) => {
    const parts = (t.parts || Array.from(t.word)).map(String);
    const extra = (t.extra || []).map(String);
    let tilesArr = U.shuffle(parts.concat(extra));
    if (!extra.length && parts.length > 1 && tilesArr.join('') === parts.join('')) tilesArr = tilesArr.slice().reverse();
    const body = el('div', 'task-body'); const line = el('div', 'line'); const tiles = el('div', 'tiles');
    let placed = [], attempts = 0, done = false, checking = false;
    const tileBtns = tilesArr.map((v, idx) => {
      const b = btn('tile', esc(v));
      b.onclick = () => {
        if (done || checking || placed.includes(idx)) return;
        S.audio.play('click'); placed.push(idx); render();
        if (placed.length === parts.length) { checking = true; setTimeout(check, 250); }
      };
      tiles.appendChild(b); return b;
    });
    function render() {
      line.innerHTML = '';
      placed.forEach((idx, i) => {
        const c = btn('chip', esc(tilesArr[idx]));
        c.onclick = () => { if (done || checking) return; S.audio.play('click'); placed.splice(i, 1); render(); };
        line.appendChild(c);
      });
      tileBtns.forEach((b, idx) => b.classList.toggle('used', placed.includes(idx)));
    }
    function check() {
      const word = placed.map(i => tilesArr[i]).join('');
      const chips = [...line.querySelectorAll('.chip')];
      if (word === t.word) { done = true; chips.forEach(c => c.classList.add('right')); api.onDone({ correct: true, mistakes: attempts }); return; }
      attempts++; chips.forEach(c => c.classList.add('wrong'));
      if (attempts >= 2) {
        done = true;
        setTimeout(() => { line.innerHTML = ''; parts.forEach(p => { const c = el('span', 'chip right', esc(p)); line.appendChild(c); }); tileBtns.forEach(b => b.disabled = true); }, 800);
        api.onDone({ correct: false, mistakes: attempts });
      } else {
        api.onMistake();
        setTimeout(() => { placed = []; checking = false; render(); }, 800);
      }
    }
    render();
    body.appendChild(line); body.appendChild(tiles); root.appendChild(body);
  };

  /* ---------- compare ---------- */
  R.compare = (t, root, api) => {
    const body = el('div', 'task-body');
    const cmp = el('div', 'compare');
    const q = el('div', 'cmp-q', '?');
    cmp.appendChild(el('div', 'cmp-side', esc(t.a))); cmp.appendChild(q); cmp.appendChild(el('div', 'cmp-side', esc(t.b)));
    const btns = el('div', 'cmp-btns');
    let attempts = 0, done = false;
    const buttons = ['<', '=', '>'].map(s => {
      const b = btn('opt', esc(s)); b.dataset.v = s;
      b.onclick = () => {
        if (done) return; S.audio.play('click');
        if (s === t.answer) { done = true; b.classList.add('right'); q.textContent = s; q.classList.add('filled'); buttons.forEach(x => x.disabled = true); api.onDone({ correct: true, mistakes: attempts }); }
        else {
          attempts++; b.classList.add('wrong'); b.disabled = true;
          if (attempts >= 2) { done = true; buttons.forEach(x => { x.disabled = true; if (x.dataset.v === t.answer) x.classList.add('right'); }); q.textContent = t.answer; q.classList.add('filled'); api.onDone({ correct: false, mistakes: attempts }); }
          else api.onMistake();
        }
      };
      btns.appendChild(b); return b;
    });
    body.appendChild(cmp); body.appendChild(btns); root.appendChild(body);
  };

  /* ---------- memory ---------- */
  R.memory = (t, root, api) => {
    const body = el('div', 'task-body');
    const cards = U.shuffle(t.pairs.flatMap((p, i) => [{ v: String(p[0]), pair: i }, { v: String(p[1]), pair: i }]));
    const grid = el('div', 'memory-grid' + (cards.length <= 6 ? ' c3' : ''));
    let open = [], lock = false, matched = 0, done = false;
    cards.forEach(c => {
      const b = btn('mcard');
      const inner = el('div', 'inner');
      inner.appendChild(el('div', 'face back', '❓'));
      inner.appendChild(el('div', 'face front' + (isEmojiLike(c.v) ? ' emoji' : ''), rich(c.v)));
      b.appendChild(inner);
      b.onclick = () => {
        if (done || lock || b.classList.contains('open') || b.classList.contains('matched')) return;
        S.audio.play('flip'); b.classList.add('open'); open.push({ b, c });
        if (open.length === 2) {
          lock = true;
          const [x, y] = open; open = [];
          if (x.c.pair === y.c.pair) {
            setTimeout(() => {
              x.b.classList.remove('open'); y.b.classList.remove('open'); x.b.classList.add('matched'); y.b.classList.add('matched');
              lock = false; matched++; S.audio.play('star');
              if (matched === t.pairs.length) { done = true; api.onDone({ correct: true, mistakes: 0 }); }
            }, 350);
          } else {
            setTimeout(() => { x.b.classList.remove('open'); y.b.classList.remove('open'); lock = false; }, 850);
          }
        }
      };
      grid.appendChild(b);
    });
    body.appendChild(grid); root.appendChild(body);
  };

  S.tasks = {
    render(task, root, api) {
      root.innerHTML = '';
      const wrap = el('div', 'task');
      header(task, wrap);
      root.appendChild(wrap);
      const fn = R[task.type];
      if (!fn) { wrap.appendChild(el('div', 'hint', 'Неизвестный тип задания: ' + esc(task.type))); return wrap; }
      fn(task, wrap, api);
      return wrap;
    },
    hint(wrap, html) {
      let h = wrap.querySelector('.hint');
      if (!h) { h = el('div', 'hint'); wrap.appendChild(h); }
      h.innerHTML = html;
      h.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },
    correctText, answerMatches, rich, esc, el
  };
})();
