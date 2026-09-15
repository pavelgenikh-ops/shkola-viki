/* Хранилище: профили учеников и прогресс в localStorage. */
(function () {
  const S = window.SCHOOL;
  const KEY = 'schoolvika.v1';

  const today = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  const def = () => ({ profiles: {}, current: null, settings: { sound: true, tts: true, readAloud: true, music: true, voicePreset: 'neuro', voiceV: 2 } });
  let data = def();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        data = Object.assign(def(), p);
        data.settings = Object.assign(def().settings, p.settings || {});
        /* переход на нейросетевой голос: старый выбор характера заменяем один раз */
        if ((p.settings || {}).voiceV !== 2) { data.settings.voicePreset = 'neuro'; data.settings.voiceRu = ''; data.settings.voiceV = 2; }
        Object.values(data.profiles).forEach(migrate);
      }
    } catch (e) { console.warn('store load', e); data = def(); }
    return data;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { console.warn('store save', e); }
  }
  function freshProfile(id, name, avatar, mascot) {
    return {
      id, name, avatar, mascot, created: today(),
      xp: 0, stars: 0, lessons: {}, log: [], badges: {}, stickers: [], seenStickers: [], games: {},
      streak: { count: 0, last: null, days: {} }, daily: { date: null, done: false },
      tasksTotal: 0, correctTotal: 0, secsTotal: 0, lessonsDone: 0, perfectCount: 0, dailyCount: 0
    };
  }
  function migrate(p) {
    const f = freshProfile(p.id, p.name, p.avatar, p.mascot);
    Object.keys(f).forEach(k => { if (p[k] === undefined) p[k] = f[k]; });
  }
  function newProfile(name, avatar, mascot) {
    const id = 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
    data.profiles[id] = freshProfile(id, name, avatar, mascot);
    data.current = id;
    save();
    return data.profiles[id];
  }

  S.store = {
    load, save, today,
    get data() { return data; },
    settings() { return data.settings; },
    profile() { return data.current ? data.profiles[data.current] || null : null; },
    profiles() { return Object.values(data.profiles); },
    setCurrent(id) { data.current = id; save(); },
    newProfile,
    updateProfile(id, patch) { Object.assign(data.profiles[id], patch); save(); },
    deleteProfile(id) { delete data.profiles[id]; if (data.current === id) data.current = null; save(); },
    resetProfile(id) {
      const p = data.profiles[id]; if (!p) return;
      data.profiles[id] = freshProfile(id, p.name, p.avatar, p.mascot); save();
    },
    lessonState(profile, lessonId) { return profile.lessons[lessonId] || null; },
    levelState(profile, lessonId, level) {
      const l = profile.lessons[lessonId];
      return l && l.levels && l.levels[level] ? l.levels[level] : null;
    },
    exportJSON() { return JSON.stringify(data, null, 2); },
    importJSON(txt) {
      const p = JSON.parse(txt);
      if (!p || typeof p.profiles !== 'object') throw new Error('Это не файл прогресса «Школы Вики»');
      data = Object.assign(def(), p);
      Object.values(data.profiles).forEach(migrate);
      save();
    }
  };
})();
