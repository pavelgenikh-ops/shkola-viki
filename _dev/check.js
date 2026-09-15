/* Валидатор файлов контента.
   Запуск из папки приложения:  _dev\node.exe _dev\check.js js\data\russian.js
   Проверяет схему заданий каждого урока на уровнях 1–3 и разнообразие генерации. */
const path = require('path');
const fs = require('fs');

global.window = global;
const base = path.join(__dirname, '..');
require(path.join(base, 'js/engine/core.js'));
require(path.join(base, 'js/lib/util.js'));
require(path.join(base, 'js/lib/vis.js'));
const S = global.SCHOOL;

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Укажи файл(ы) контента: _dev\\node.exe _dev\\check.js js\\data\\math.js');
  process.exit(2);
}

const TYPES = ['choice', 'input', 'match', 'order', 'sort', 'gap', 'spell', 'compare', 'memory'];
let errors = 0, warnings = 0;
const err = (ctx, msg) => { errors++; console.log('  ОШИБКА  [' + ctx + '] ' + msg); };
const warn = (ctx, msg) => { warnings++; console.log('  предупр [' + ctx + '] ' + msg); };
const isStr = v => typeof v === 'string' && v.trim().length > 0;
const strOrNum = v => isStr(v) || typeof v === 'number';
const uniqLen = arr => new Set(arr.map(String)).size;

function validateTask(t, ctx) {
  if (!t || typeof t !== 'object') return err(ctx, 'gen вернул не объект: ' + JSON.stringify(t));
  if (!TYPES.includes(t.type)) return err(ctx, 'неизвестный type: ' + t.type);
  if (!isStr(t.prompt)) err(ctx, 'пустой prompt');
  if (t.prompt && t.prompt.length > 260) warn(ctx, 'очень длинный prompt (' + t.prompt.length + ')');
  if (t.say && !['ru-RU', 'en-US', 'en-GB', undefined].includes(t.sayLang)) err(ctx, 'sayLang должен быть ru-RU или en-US');
  ['hint', 'explain', 'visual'].forEach(f => { if (t[f] !== undefined && typeof t[f] !== 'string') err(ctx, f + ' должен быть строкой'); });

  switch (t.type) {
    case 'choice': {
      if (!Array.isArray(t.options) || t.options.length < 2) return err(ctx, 'choice: options < 2');
      if (t.options.length > 8) warn(ctx, 'choice: больше 8 вариантов');
      if (uniqLen(t.options) !== t.options.length) err(ctx, 'choice: варианты повторяются: ' + JSON.stringify(t.options));
      if (!t.options.every(strOrNum)) err(ctx, 'choice: варианты должны быть строками/числами');
      const opts = t.options.map(String);
      if (t.multi) {
        if (!Array.isArray(t.answer) || !t.answer.length) return err(ctx, 'choice multi: answer должен быть непустым массивом');
        t.answer.forEach(a => { if (!opts.includes(String(a))) err(ctx, 'choice multi: ответ "' + a + '" не среди вариантов'); });
      } else {
        if (Array.isArray(t.answer)) return err(ctx, 'choice: answer-массив только с multi:true');
        if (!opts.includes(String(t.answer))) err(ctx, 'choice: ответ "' + t.answer + '" не среди вариантов ' + JSON.stringify(t.options));
      }
      break;
    }
    case 'input': {
      const ans = Array.isArray(t.answer) ? t.answer : [t.answer];
      if (!ans.length || !ans.every(strOrNum)) err(ctx, 'input: answer пустой или не строка/число');
      if (t.mode && !['num', 'text'].includes(t.mode)) err(ctx, 'input: mode только num|text');
      if (t.mode === 'num' && !ans.every(a => /^-?\d+([.,]\d+)?$/.test(String(a).trim()))) err(ctx, 'input num: ответ не число: ' + JSON.stringify(t.answer));
      break;
    }
    case 'match': {
      if (!Array.isArray(t.pairs) || t.pairs.length < 2) return err(ctx, 'match: pairs < 2');
      if (t.pairs.length > 6) warn(ctx, 'match: больше 6 пар');
      if (!t.pairs.every(p => Array.isArray(p) && p.length === 2 && strOrNum(p[0]) && strOrNum(p[1]))) return err(ctx, 'match: пара должна быть [лево, право]');
      if (uniqLen(t.pairs.map(p => p[0])) !== t.pairs.length) err(ctx, 'match: левые части повторяются');
      if (uniqLen(t.pairs.map(p => p[1])) !== t.pairs.length) err(ctx, 'match: правые части повторяются');
      break;
    }
    case 'order': {
      if (!Array.isArray(t.items) || t.items.length < 3) return err(ctx, 'order: items < 3');
      if (t.items.length > 8) warn(ctx, 'order: больше 8 элементов');
      if (uniqLen(t.items) !== t.items.length) err(ctx, 'order: элементы повторяются: ' + JSON.stringify(t.items));
      break;
    }
    case 'sort': {
      if (!Array.isArray(t.groups) || t.groups.length < 2) return err(ctx, 'sort: groups < 2');
      if (t.groups.length > 4) warn(ctx, 'sort: больше 4 групп');
      const all = [];
      t.groups.forEach(g => {
        if (!g || !isStr(g.name) || !Array.isArray(g.items) || !g.items.length) return err(ctx, 'sort: группа без name/items');
        all.push(...g.items.map(String));
      });
      if (uniqLen(all) !== all.length) err(ctx, 'sort: элемент попал в две группы или повторяется: ' + JSON.stringify(all));
      if (all.length > 10) warn(ctx, 'sort: больше 10 элементов');
      break;
    }
    case 'gap': {
      if (!isStr(t.text)) return err(ctx, 'gap: нет text');
      const blanks = (t.text.match(/_/g) || []).length;
      if (!blanks) return err(ctx, 'gap: в text нет пропусков "_"');
      if (!Array.isArray(t.answers) || t.answers.length !== blanks) return err(ctx, 'gap: answers (' + (t.answers || []).length + ') ≠ число пропусков (' + blanks + ')');
      if (!Array.isArray(t.options) || t.options.length < 2) return err(ctx, 'gap: options < 2');
      if (uniqLen(t.options) !== t.options.length) err(ctx, 'gap: options повторяются');
      const opts = t.options.map(String);
      t.answers.forEach(a => { if (!opts.includes(String(a))) err(ctx, 'gap: ответ "' + a + '" отсутствует в options'); });
      break;
    }
    case 'spell': {
      if (!isStr(t.word)) return err(ctx, 'spell: нет word');
      if (t.parts) {
        if (!Array.isArray(t.parts) || t.parts.join('') !== t.word) err(ctx, 'spell: parts.join() ≠ word');
      }
      if (t.extra && !Array.isArray(t.extra)) err(ctx, 'spell: extra должен быть массивом');
      if (t.word.length > 12 && !t.parts) warn(ctx, 'spell: слово длиннее 12 букв');
      break;
    }
    case 'compare': {
      if (!strOrNum(t.a) || !strOrNum(t.b)) err(ctx, 'compare: нужны a и b');
      if (!['<', '>', '='].includes(t.answer)) err(ctx, 'compare: answer только < > =');
      break;
    }
    case 'memory': {
      if (!Array.isArray(t.pairs) || t.pairs.length < 2) return err(ctx, 'memory: pairs < 2');
      if (t.pairs.length > 8) warn(ctx, 'memory: больше 8 пар');
      const all = t.pairs.flat().map(String);
      if (uniqLen(all) !== all.length) err(ctx, 'memory: карточки повторяются');
      break;
    }
  }
}

files.forEach(file => {
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) { console.log('Нет файла: ' + abs); errors++; return; }
  const before = S.subjects.length;
  try { require(abs); } catch (e) { console.log('ОШИБКА загрузки ' + file + ': ' + e.stack); errors++; return; }
  const added = S.subjects.slice(before);
  if (added.length !== 1) { err(file, 'файл должен регистрировать ровно один предмет, зарегистрировано: ' + added.length); return; }
  const subj = added[0];
  console.log('\n=== ' + subj.title + ' (' + subj.id + ') — ' + subj.lessons.length + ' уроков, ' + subj.sections.length + ' разделов ===');
  ['emoji', 'color', 'desc'].forEach(f => { if (!subj[f]) warn(subj.id, 'у предмета нет поля ' + f); });
  const typeStats = {};
  subj.lessons.forEach(les => {
    if (!les.emoji) warn(les.id, 'нет emoji');
    if (!les.rule) warn(les.id, 'нет rule (карточка правила)');
    if (!/^[a-z0-9-]+$/.test(les.id)) err(les.id, 'id только латиница/цифры/дефис');
    const line = [];
    for (let level = 1; level <= 3; level++) {
      const keys = new Set();
      let withExplain = 0, n = 40;
      for (let i = 0; i < n; i++) {
        let t;
        try { t = les.gen(level); } catch (e) { err(les.id + ' L' + level, 'gen бросил исключение: ' + e.message); break; }
        validateTask(t, les.id + ' L' + level);
        if (t && t.type) {
          keys.add(S.taskKey(t));
          typeStats[t.type] = (typeStats[t.type] || 0) + 1;
          if (t.explain) withExplain++;
        }
      }
      if (keys.size < 8) err(les.id + ' L' + level, 'мало разных заданий: ' + keys.size + ' из 40 — нужен банк ≥ 15');
      else if (keys.size < 15) warn(les.id + ' L' + level, 'разнообразие невысокое: ' + keys.size + ' разных из 40');
      if (withExplain < n * 0.5) warn(les.id + ' L' + level, 'меньше половины заданий с explain');
      line.push('L' + level + ':' + keys.size);
    }
    console.log('  ' + les.emoji + ' ' + les.title.padEnd(40) + ' ' + line.join('  '));
  });
  console.log('  Типы заданий: ' + JSON.stringify(typeStats));
});

console.log('\nИтого: ошибок ' + errors + ', предупреждений ' + warnings);
process.exit(errors ? 1 : 0);
