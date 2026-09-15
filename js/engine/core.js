/* Ядро: пространство имён SCHOOL и реестр предметов.
   Загружается первым. Работает и в браузере, и в node (для _dev/check.js: global.window = global). */
(function () {
  const root = typeof window !== 'undefined' ? window : globalThis;
  const S = (root.SCHOOL = root.SCHOOL || {});
  S.subjects = S.subjects || [];
  S.VERSION = '1.0.0';

  S.registerSubject = function (subj) {
    if (!subj || !subj.id || !subj.title || !Array.isArray(subj.sections)) {
      throw new Error('registerSubject: нужны id, title, sections[]');
    }
    if (S.subjects.some(s => s.id === subj.id)) {
      throw new Error('registerSubject: предмет с id "' + subj.id + '" уже зарегистрирован');
    }
    subj.lessons = [];
    subj.sections.forEach((sec, si) => {
      if (!sec || !Array.isArray(sec.lessons)) throw new Error('Раздел #' + si + ' предмета ' + subj.id + ' без lessons[]');
      sec.lessons.forEach(les => {
        if (!les.id || !les.title || typeof les.gen !== 'function') {
          throw new Error('Урок без id/title/gen в предмете ' + subj.id + ': ' + JSON.stringify(les && les.id));
        }
        if (subj.lessons.some(l => l.id === les.id)) throw new Error('Дубль id урока: ' + les.id);
        les.subjectId = subj.id;
        les.sectionTitle = sec.title;
        subj.lessons.push(les);
      });
    });
    S.subjects.push(subj);
    return subj;
  };

  S.getSubject = id => S.subjects.find(s => s.id === id);
  S.getLesson = (subjectId, lessonId) => {
    const s = S.getSubject(subjectId);
    return s ? s.lessons.find(l => l.id === lessonId) : undefined;
  };
  S.allLessons = () => S.subjects.flatMap(s => s.lessons);

  /* Ключ задания для отсеивания повторов внутри одной сессии */
  S.taskKey = function (t) {
    const core = {
      p: t.prompt, a: t.answer, an: t.answers, i: t.items, pr: t.pairs, g: t.groups,
      w: t.word, x: t.a, y: t.b, o: t.options, tx: t.text
    };
    return t.type + '|' + JSON.stringify(core);
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = S;
})();
