/* Смоук-тест в браузере. Открыть приложение, вставить в консоль:
     fetch('_dev/smoke.js').then(r=>r.text()).then(eval)
   или скопировать содержимое. Прогоняет каждый урок каждого предмета на трёх уровнях:
   рендерит задания в скрытый контейнер, отвечает правильно и проверяет, что движок засчитал ответ. */
(async function () {
  const S = window.SCHOOL, T = S.tasks;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;left:-9999px;top:0;width:900px';
  document.body.appendChild(box);

  const problems = [];
  let checked = 0, answered = 0;

  /** Ответить правильно на отрисованное задание. Возвращает true, если удалось. */
  function solve(t, wrap) {
    switch (t.type) {
      case 'choice': {
        const opts = [...wrap.querySelectorAll('.opt')];
        const ans = (t.multi ? t.answer : [t.answer]).map(String);
        const found = ans.map(a => opts.find(b => b.dataset.v === a));
        if (found.some(x => !x)) return 'ответ не найден среди кнопок';
        found.forEach(b => b.click());
        if (t.multi) { const c = wrap.querySelector('.check-row .btn'); if (!c) return 'нет кнопки Проверить'; c.click(); }
        return true;
      }
      case 'input': {
        const i = wrap.querySelector('.answer-input'); if (!i) return 'нет поля ввода';
        i.value = String(Array.isArray(t.answer) ? t.answer[0] : t.answer);
        wrap.querySelector('.check-row .btn').click();
        return true;
      }
      case 'compare': {
        const b = [...wrap.querySelectorAll('.cmp-btns .opt')].find(x => x.dataset.v === t.answer);
        if (!b) return 'нет кнопки знака'; b.click(); return true;
      }
      case 'order': {
        for (const it of t.items) {
          const c = [...wrap.querySelectorAll('.pool .chip')].find(x => x.textContent === String(it));
          if (!c) return 'нет фишки «' + it + '»';
          c.click();
        }
        wrap.querySelector('.check-row .btn').click();
        return true;
      }
      case 'gap': {
        const tiles = [...wrap.querySelectorAll('.tile')];
        for (const a of t.answers) {
          const tile = tiles.find(x => x.textContent === String(a));
          if (!tile) return 'нет плитки «' + a + '»';
          tile.click();
        }
        wrap.querySelector('.check-row .btn').click();
        return true;
      }
      case 'spell': {
        const parts = t.parts || Array.from(t.word);
        const tiles = [...wrap.querySelectorAll('.tile')];
        const used = new Set();
        for (const p of parts) {
          const tile = tiles.find((x, i) => x.textContent === String(p) && !used.has(i));
          if (!tile) return 'нет плитки «' + p + '»';
          used.add(tiles.indexOf(tile));
          tile.click();
        }
        return true;
      }
      default: return 'skip';
    }
  }

  for (const sub of S.subjects) {
    for (const les of sub.lessons) {
      for (let level = 1; level <= 3; level++) {
        for (let n = 0; n < 6; n++) {
          let t;
          try { t = les.gen(level); } catch (e) { problems.push([sub.id, les.id, level, 'gen бросил: ' + e.message]); break; }
          if (!t) { problems.push([sub.id, les.id, level, 'gen вернул пустое']); break; }
          checked++;
          let done = null;
          let wrap;
          try {
            wrap = T.render(t, box, { onMistake() { done = 'засчитана ошибка при верном ответе'; }, onDone(r) { done = r.correct ? true : 'ответ верный, но не засчитан'; } });
          } catch (e) { problems.push([sub.id, les.id, level, t.type + ': render бросил ' + e.message]); continue; }
          let res;
          try { res = solve(t, wrap); } catch (e) { res = 'solve бросил ' + e.message; }
          if (res === 'skip') continue;
          if (res !== true) { problems.push([sub.id, les.id, level, t.type + ': ' + res]); continue; }
          await sleep(t.type === 'spell' ? 400 : 30);   // spell проверяет себя через 250 мс после последней плитки
          answered++;
          if (done !== true) problems.push([sub.id, les.id, level, t.type + ': ' + (done || 'движок не отреагировал на верный ответ')]);
        }
      }
    }
  }
  box.remove();
  console.log('Проверено заданий: ' + checked + ', из них отвечено: ' + answered);
  if (!problems.length) console.log('%cПроблем нет ✅', 'color:green;font-weight:bold');
  else { console.log('%cПроблемы (' + problems.length + '):', 'color:red;font-weight:bold'); problems.forEach(p => console.log(p.join(' | '))); }
  window.__smoke = { checked, answered, problems };
  return { checked, answered, problems: problems.length };
})();
