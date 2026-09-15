/* Озвучка (движок перенесён из «Котошколы», js/speech.js: нейросеть Piper + системные голоса). Схема та же, что в «НейроКвесте» (js/lib/audio.js):
   Порядок предпочтения: нейросетевые голоса Edge («Светлана», «Дмитрий» Natural) →
   сетевой «Google русский» в Chrome → остальные женские → что есть.
   Локальные «Ирина»/«Павел» (SAPI) звучат механически — их берём в последнюю очередь.
   Речь режем на предложения: Chrome обрывает длинные реплики, короткие звучат естественнее. */
window.Speech = (function () {
  'use strict';
  const has = 'speechSynthesis' in window;
  const st = { voice: true, voiceName: '', rate: 0.92, pitch: 1.0, preset: 'kitten' };

  /* Характеры голоса: системный голос звучит тяжеловато, поэтому поднимаем высоту тона
     и подбираем темп — получается мультяшно. Пол голоса подбирается автоматически. */
  /* local: true — характеру нужен системный голос Windows. Причина: «естественные»
     онлайн-голоса Microsoft (Natural/Online) игнорируют высоту тона, и характер не слышен.
     wobble — лёгкое покачивание тона между фразами, чтобы речь была живее, а не ровной. */
  const PRESETS = [
    { id: 'neuro', name: 'Живой котёнок', e: '🐾', pitch: 1.0, rate: 1.0, gender: 'f', local: false, wobble: 0, neuro: true, semitones: 5.5, hint: 'Нейросеть прямо на компьютере — самый живой голос' },
    { id: 'neurokid', name: 'Малышка', e: '👶', pitch: 1.0, rate: 1.02, gender: 'f', local: false, wobble: 0, neuro: true, semitones: 8, hint: 'Та же нейросеть, но голос совсем детский' },
    { id: 'neurosoft', name: 'Тёплый голос', e: '🌸', pitch: 1.0, rate: 0.96, gender: 'f', local: false, wobble: 0, neuro: true, semitones: 2.5, hint: 'Нейросеть, мягкий девичий голос' },
    { id: 'kitten', name: 'Котёнок', e: '🐱', pitch: 1.8, rate: 0.95, gender: 'f', local: true, wobble: 0.1, hint: 'Звонкий и мультяшный — как котёнок из мультика' },
    { id: 'mouse', name: 'Мышонок', e: '🐭', pitch: 2.0, rate: 1.05, gender: 'f', local: true, wobble: 0.06, hint: 'Самый тоненький и смешной' },
    { id: 'fairy', name: 'Фея', e: '🧚', pitch: 1.5, rate: 0.85, gender: 'f', local: true, wobble: 0.08, hint: 'Мягкий, нежный, неторопливый' },
    { id: 'bunny', name: 'Зайка', e: '🐰', pitch: 1.65, rate: 1.1, gender: 'f', local: true, wobble: 0.12, hint: 'Быстрый и весёлый' },
    { id: 'wizard', name: 'Волшебник', e: '🧙', pitch: 1.25, rate: 0.84, gender: 'm', local: true, wobble: 0.07, hint: 'Добрый сказочник, говорит медленно' },
    { id: 'bear', name: 'Медвежонок', e: '🐻', pitch: 0.55, rate: 0.84, gender: 'm', local: true, wobble: 0.05, hint: 'Низкий и добродушный, как медведь' },
    { id: 'natural', name: 'Живой голос', e: '🎙️', pitch: 1.0, rate: 0.95, gender: 'f', local: false, wobble: 0, hint: 'Самый человеческий (нужен интернет и Edge), но без мультяшности' },
  ];
  const presetById = id => PRESETS.find(p => p.id === id) || PRESETS[0];

  let voices = [], voicesEn = [];
  function loadVoices() {
    if (!has) return;
    const all = speechSynthesis.getVoices();
    voices = all.filter(v => /^ru/i.test(v.lang));
    voicesEn = all.filter(v => /^en/i.test(v.lang));
  }
  if (has) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }

  const MALE = /Dmitry|Pavel|Artemiy|Maxim|Yuri|Guy|Mark|David/i;
  const FEMALE = /Svetlana|Irina|Dariya|Ekaterina|Alena|Milena|Tatyana|Aria|Jenny|Zira|Michelle|Ana\b/i;
  /** Пол голоса: женский по умолчанию (у «Google русский» женский тембр). */
  function genderOf(v) { return MALE.test(v.name) ? 'm' : FEMALE.test(v.name) ? 'f' : 'f'; }
  function genderBonus(v, want) {
    if (!want) return 0;
    return genderOf(v) === want ? 45 : -25;
  }
  function voiceScore(v, want) {
    const n = v.name;
    let s = 0;
    if (/natural|neural/i.test(n)) s += 100;
    if (/Svetlana/i.test(n)) s += 30;
    if (/Dmitry/i.test(n)) s += 20;
    if (/Google/i.test(n)) s += 60;
    if (/Dariya|Ekaterina|Alena|Yandex/i.test(n)) s += 25;
    if (/Irina/i.test(n)) s += 5;
    if (/Pavel/i.test(n)) s += 2;
    if (/Desktop/i.test(n)) s -= 3;
    return s + genderBonus(v, want);
  }
  function voiceScoreEn(v) {
    const n = v.name;
    let s = 0;
    if (/natural|neural/i.test(n)) s += 100;
    if (/Google/i.test(n)) s += 60;
    if (/Aria|Jenny|Michelle|Ana\b/i.test(n)) s += 25;
    if (/Zira/i.test(n)) s += 5;
    if (/David|Mark/i.test(n)) s += 2;
    if (/Desktop/i.test(n)) s -= 3;
    return s;
  }
  /** Голос слушается высоты тона? Онлайн-голоса Microsoft (Natural/Online) — нет. */
  const obeysPitch = v => !!v && v.localService && !/natural|neural|online/i.test(v.name);

  function pickVoice(en, presetId) {
    const p = presetById(presetId || st.preset);
    let list = en ? voicesEn : voices;
    if (!list.length) { loadVoices(); list = en ? voicesEn : voices; }
    // характеру нужен голос, который меняет высоту тона — иначе «мультяшность» не слышна
    if (p.local) {
      const able = list.filter(obeysPitch);
      if (able.length) list = able;
    }
    if (!en && st.voiceName) { const v = list.find(x => x.name === st.voiceName); if (v) return v; }
    const want = p.gender;
    let best = null, bs = -1;
    list.forEach(v => { const s = en ? voiceScoreEn(v) : voiceScore(v, want); if (s > bs) { bs = s; best = v; } });
    return best;
  }

  let neuroLoading = false, onFallback = null;
  /** Тихо подгрузить нейросетевой движок в фоне (один раз). */
  function warmUpNeuro() {
    if (neuroLoading || !window.TTS || TTS.ready) return;
    if (location.protocol === 'file:') return;   // нужен локальный сервер
    neuroLoading = true;
    /* если файлов модели нет (например, приложение открыто с сайта без папки voice),
       молча переходим на мультяшный системный голос — ребёнок не остаётся без озвучки */
    TTS.init().catch(() => {
      neuroLoading = false;
      if (presetById(st.preset).neuro) { setPreset('kitten'); if (typeof onFallback === 'function') onFallback('kitten'); }
    });
  }

  let gen = 0, speaking = false;
  const listeners = [];
  function setState(on) { if (speaking === on) return; speaking = on; listeners.forEach(cb => { try { cb(on); } catch (e) { /* noop */ } }); }
  function onState(cb) { listeners.push(cb); }

  function splitText(text) {
    const parts = String(text).replace(/\s+/g, ' ').trim().split(/(?<=[.!?…])\s+(?=[«"А-ЯЁA-Za-z0-9])/);
    const out = [];
    parts.forEach(p => { if (p.length <= 160) { out.push(p); return; } p.split(/(?<=[,;:—])\s+/).forEach(x => out.push(x)); });
    return out.filter(Boolean);
  }

  /** Озвучить текст. Promise выполняется, когда фраза договорена (или сразу, если озвучка выключена). */
  function speak(text, opts) {
    opts = opts || {};
    const pr = presetById(st.preset);
    // нейросетевой голос, который считается прямо на компьютере
    if (st.voice && pr.neuro && window.TTS && !/^en/i.test(opts.lang || '') && text) {
      if (!TTS.ready) {
        // движок ещё грузится: не молчим — говорим системным голосом, а модель тянется в фоне
        warmUpNeuro();
        return speakSynth(text, Object.assign({ pitch: 1.7, rate: 0.95, wobble: 0.1 }, opts));
      }
      gen++; if (has) speechSynthesis.cancel();
      const my = gen;
      setState(true);
      return TTS.speak(text, { semitones: opts.semitones != null ? opts.semitones : pr.semitones, rate: opts.rate || pr.rate })
        .then(() => { if (my === gen) setState(false); }, () => { if (my === gen) { setState(false); return speakSynth(text, opts); } });
    }
    return speakSynth(text, opts);
  }
  function speakSynth(text, opts) {
    opts = opts || {};
    return new Promise(resolve => {
      if (!st.voice || !has || !text) { setTimeout(resolve, 40); return; }
      if (opts.interrupt !== false) { speechSynthesis.cancel(); gen++; }
      const my = gen;
      const en = /^en/i.test(opts.lang || '');
      const chunks = splitText(text);
      const finishAll = () => { if (!speechSynthesis.speaking && !speechSynthesis.pending) setState(false); resolve(); };
      const run = () => {
        if (my !== gen) { resolve(); return; }
        const v = pickVoice(en);
        let i = 0;
        const next = () => {
          if (my !== gen) { resolve(); return; }
          if (i >= chunks.length) { finishAll(); return; }
          const part = chunks[i++];
          const u = new SpeechSynthesisUtterance(part);
          if (v) u.voice = v;
          u.lang = opts.lang || 'ru-RU';
          u.rate = opts.rate || (en ? 0.85 : st.rate);
          const basePitch = opts.pitch || st.pitch;
          // лёгкое покачивание тона между фразами: речь звучит живее, а не ровно-механически
          const wob = opts.wobble != null ? opts.wobble : presetById(st.preset).wobble || 0;
          const jitter = wob ? (Math.random() * 2 - 1) * wob + (/[?!]\s*$/.test(part) ? wob : 0) : 0;
          u.pitch = Math.max(0.1, Math.min(2, basePitch + jitter));
          u.volume = 1;
          let ended = false;
          const done = () => { if (ended) return; ended = true; clearTimeout(guard); setTimeout(next, 60); };
          const guard = setTimeout(done, 2500 + u.text.length * 110);
          u.onstart = () => setState(true);
          u.onend = done; u.onerror = done;
          speechSynthesis.speak(u);
        };
        next();
      };
      /* голоса в Chrome подгружаются асинхронно — ждём, чтобы не улететь в системный «робот» */
      if (!voices.length) loadVoices();
      if (!voices.length) { let tries = 0; const w = setInterval(() => { loadVoices(); tries++; if (voices.length || tries > 15) { clearInterval(w); run(); } }, 80); }
      else setTimeout(run, opts.interrupt !== false ? 70 : 0);   /* пауза после cancel(): иначе Chrome иногда глотает фразу */
    });
  }

  async function sayAll(list, opts) {
    opts = opts || {};
    gen++; if (has) speechSynthesis.cancel();
    const my = gen;
    for (const item of list) {
      if (my !== gen) return;
      const o = Object.assign({}, opts, typeof item === 'object' ? item : {}, { interrupt: false });
      if (o.before) { try { o.before(); } catch (e) { /* noop */ } }
      await speak(typeof item === 'string' ? item : item.text, o);
      if (o.gap) await new Promise(r => setTimeout(r, o.gap));
    }
  }
  const sayEn = (text, opts) => speak(text, Object.assign({ lang: 'en-US' }, opts || {}));
  function stop() { gen++; if (has) speechSynthesis.cancel(); if (window.TTS) TTS.stop(); setState(false); }

  function letterName(ch) { const L = String(ch).toUpperCase(); return (window.DATA && DATA.LETTER_NAMES[L]) || L.toLowerCase(); }
  function word(w) { return String(w).toLowerCase(); }

  function init(settings) {
    if (settings) {
      if (settings.voicePreset) setPreset(settings.voicePreset);
      if (settings.voice) st.voiceName = settings.voice;
      if (settings.rate) st.rate = settings.rate;   // ползунок темпа поверх характера
      if (settings.speech === false) st.voice = false;
    }
    if (presetById(st.preset).neuro) setTimeout(warmUpNeuro, 600);
    if (!has) return;
    loadVoices();
    setTimeout(loadVoices, 300); setTimeout(loadVoices, 1500); setTimeout(loadVoices, 4000);
  }
  function whenReady() { return new Promise(res => { loadVoices(); if (voices.length || !has) { res(); return; } let t = 0; const w = setInterval(() => { loadVoices(); if (voices.length || ++t > 15) { clearInterval(w); res(); } }, 80); }); }
  function voiceList() { loadVoices(); return voices.slice().sort((a, b) => voiceScore(b) - voiceScore(a)).map(v => ({ name: v.name, lang: v.lang, score: voiceScore(v), local: v.localService, natural: voiceScore(v) >= 60 })); }
  const cur = () => pickVoice(false);

  /** Выбрать характер голоса: меняет высоту тона и темп, подбирает подходящий голос. */
  function setPreset(id) {
    const p = presetById(id);
    st.preset = p.id; st.pitch = p.pitch; st.rate = p.rate;
    return p;
  }

  return {
    init, say: speak, onNeuroFallback(cb) { onFallback = cb; }, sayAll, sayEn, stop, onState, letterName, word, whenReady, voiceList,
    PRESETS, setPreset, presetById, warmUpNeuro,
    get neuroReady() { return !!(window.TTS && TTS.ready); },
    /** Нужен ли текущему характеру нейросетевой движок. */
    get isNeuro() { return !!presetById(st.preset).neuro; },
    /** Прогреть фразу заранее, чтобы она прозвучала без паузы. */
    warm(text) {
      const p = presetById(st.preset);
      if (!st.voice || !p.neuro || !window.TTS || !text) return Promise.resolve(false);
      return TTS.warm(text, { semitones: p.semitones, rate: p.rate }).catch(() => false);
    },
    setPreferred(name) { st.voiceName = name || ''; },
    setRate(r) { st.rate = r; },
    setEnabled(on) { st.voice = !!on; if (!on) stop(); },
    hasRussian() { loadVoices(); return voices.length > 0; },
    supported() { return has; },
    isEdge() { return /Edg\//.test(navigator.userAgent); },
    /** Проба голоса с конкретным характером, не меняя текущие настройки. */
    demo(presetId, text) {
      const p = presetById(presetId);
      const keep = st.preset;
      st.preset = p.id;                                   // чтобы подобрался подходящий голос
      const done = () => { st.preset = keep; };
      return speak(text || 'Привет! Теперь я говорю вот так. Давай учиться!', { pitch: p.pitch, rate: p.rate, wobble: p.wobble }).then(done, done);
    },
    /** Какой голос реально зазвучит при этом характере. */
    voiceFor(presetId) { const v = pickVoice(false, presetId); return v ? v.name : ''; },
    obeysPitch() { return obeysPitch(pickVoice(false)); },
    get enabled() { return st.voice; },
    get rate() { return st.rate; },
    get pitch() { return st.pitch; },
    get preset() { return st.preset; },
    get presetName() { return presetById(st.preset).name; },
    get voiceName() { const v = cur(); return v ? v.name : ''; },
    get voiceIsNatural() { const v = cur(); return !!(v && voiceScore(v) >= 60); },
    get enVoiceName() { const v = pickVoice(true); return v ? v.name : ''; },
  };
})();
