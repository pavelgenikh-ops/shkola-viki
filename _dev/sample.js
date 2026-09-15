/* Образец файла контента (для проверки валидатора). Не подключается в приложение. */
(function () {
  const S = window.SCHOOL;
  const U = S.util;
  const V = S.vis;

  const WORDS = ['жираф', 'машина', 'шина', 'лыжи', 'ужи', 'ежи', 'мыши', 'камыши', 'жизнь', 'ширина',
    'чашка', 'чайка', 'роща', 'туча', 'пища', 'дача', 'щука', 'чудо', 'чулок', 'щуриться'];

  function wrong(word) {
    return word.replace(/жи/, 'жы').replace(/ши/, 'шы').replace(/ча/, 'чя').replace(/ща/, 'щя').replace(/чу/, 'чю').replace(/щу/, 'щю');
  }

  S.registerSubject({
    id: 'sample', title: 'Образец', emoji: '🧪', color: '#888', desc: 'Проверка валидатора',
    sections: [{
      title: 'Тест', lessons: [{
        id: 'sample-zhi-shi', title: 'Жи-ши', emoji: '🐍', rule: 'ЖИ-ШИ пиши с <b>И</b>.',
        gen(level) {
          const w = U.pick(WORDS);
          if (level === 1) {
            return { type: 'choice', prompt: 'Какое слово написано верно?', options: U.shuffle([w, wrong(w)]), answer: w,
              hint: 'Вспомни правило про ЖИ-ШИ', explain: 'Правильно: ' + w };
          }
          if (level === 2) {
            const m = w.match(/(ж|ш|ч|щ)(и|а|у)/);
            const idx = m.index + 1;
            const text = w.slice(0, idx) + '_' + w.slice(idx + 1);
            const ans = w[idx];
            const alt = { и: 'ы', а: 'я', у: 'ю' }[ans];
            return { type: 'gap', prompt: 'Вставь букву', text, answers: [ans], options: U.shuffle([ans, alt]), explain: 'Пишем ' + w };
          }
          const ws = U.pickN(WORDS, 3);
          return { type: 'sort', prompt: 'Разложи слова', groups: [
            { name: 'ЖИ-ШИ', items: ws.filter(x => /жи|ши/.test(x)).concat(['ножи']) },
            { name: 'ЧА-ЩА / ЧУ-ЩУ', items: ws.filter(x => !/жи|ши/.test(x)).concat(['чаща']) }
          ], visual: V.big('🐍'), explain: 'ЖИ-ШИ с И, ЧА-ЩА с А, ЧУ-ЩУ с У.' };
        }
      }]
    }]
  });
})();
