/* Звуки (WebAudio, без файлов), тихая музыка и озвучка.
   Озвучка делегируется в js/lib/speech.js — движок перенесён из «Котошколы»:
   нейросеть Piper считает голос прямо на компьютере (папка voice/), системные голоса — запасной вариант. */
(function () {
  const S = window.SCHOOL;
  let ctx = null;
  const settings = () => (S.store ? S.store.settings() : {});
  const enabled = () => settings().sound !== false;
  const ttsEnabled = () => settings().tts !== false;

  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  function tone(freq, start, dur, type, vol, slide) {
    const c = ensure(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, c.currentTime + start);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, c.currentTime + start + dur);
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, c.currentTime + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.05);
  }
  /** Мягкий «колокольчик»: две гармоники с плавным затуханием */
  function bell(freq, start, dur, vol) {
    tone(freq, start, dur, 'sine', vol || 0.16);
    tone(freq * 2, start, dur * 0.55, 'sine', (vol || 0.16) * 0.35);
  }
  /** Короткий шум — для «шуршания» и переходов */
  function noise(start, dur, vol, hz) {
    const c = ensure(); if (!c) return;
    const n = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, n, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = hz || 1800; f.Q.value = 0.8;
    const g = c.createGain(); g.gain.value = vol || 0.08;
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start(c.currentTime + start);
  }
  const SOUNDS = {
    click() { tone(700, 0, 0.05, 'triangle', 0.08); },
    tap() { tone(520, 0, 0.04, 'sine', 0.06); tone(780, 0.03, 0.05, 'sine', 0.05); },
    flip() { tone(500, 0, 0.06, 'triangle', 0.08, 700); },
    pop() { tone(400, 0, 0.07, 'sine', 0.1, 900); },
    swoosh() { noise(0, 0.25, 0.05, 1200); },
    correct() { bell(784, 0, 0.25, 0.18); bell(1047, 0.09, 0.35, 0.16); },
    correctStreak() { [784, 988, 1175, 1568].forEach((f, i) => bell(f, i * 0.07, 0.3, 0.15)); noise(0.05, 0.3, 0.04, 3000); },
    wrong() { tone(300, 0, 0.14, 'sine', 0.1, 200); tone(220, 0.12, 0.2, 'sine', 0.09, 170); },
    done() { [523, 659, 784, 1047].forEach((f, i) => bell(f, i * 0.12, 0.4, 0.17)); bell(1319, 0.52, 0.8, 0.14); },
    star() { bell(1319, 0, 0.3, 0.15); bell(1760, 0.08, 0.35, 0.12); noise(0, 0.2, 0.03, 4000); },
    unlock() { [880, 1108, 1318, 1760].forEach((f, i) => bell(f, i * 0.07, 0.3, 0.14)); },
    levelup() { [392, 523, 659, 784, 1047, 1318, 1568].forEach((f, i) => bell(f, i * 0.09, 0.45, 0.16)); noise(0.1, 0.5, 0.04, 2500); },
    start() { [523, 784, 1047].forEach((f, i) => bell(f, i * 0.08, 0.3, 0.14)); },
    badge() { [659, 784, 988, 1319, 1568].forEach((f, i) => bell(f, i * 0.1, 0.5, 0.15)); },
    tick() { tone(1200, 0, 0.03, 'square', 0.04); }
  };

  /* ---- тихая фоновая музыка: мягкое арпеджио по пентатонике ---- */
  const SCALE = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 784.00];
  const CHORDS = [[0, 2, 4], [1, 3, 5], [2, 4, 6], [0, 3, 5], [3, 5, 7], [1, 4, 6]];
  let musicTimer = null, musicStep = 0, musicGain = null;
  function musicOn() { return settings().music === true; }
  function musicNote(freq, dur, vol) {
    const c = ensure(); if (!c) return;
    if (!musicGain) { musicGain = c.createGain(); musicGain.gain.value = 1; musicGain.connect(c.destination); }
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    const t0 = c.currentTime;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(musicGain);
    o.start(t0); o.stop(t0 + dur + 0.1);
  }
  function musicTick() {
    if (!musicOn()) return stopMusic();
    const chord = CHORDS[Math.floor(musicStep / 4) % CHORDS.length];
    const idx = chord[musicStep % chord.length];
    musicNote(SCALE[idx], 2.4, 0.035);
    if (musicStep % 4 === 0) musicNote(SCALE[chord[0]] / 2, 3.6, 0.03);
    musicStep++;
  }
  function startMusic() {
    if (musicTimer || !musicOn()) return;
    ensure();
    musicTick();
    musicTimer = setInterval(musicTick, 1700);
  }
  function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }

  /* ---- озвучка: движок из «Котошколы» (js/lib/speech.js) ----
     Первые три характера считает нейросеть Piper прямо на компьютере (папка voice/),
     остальные берут системный голос Windows и поднимают ему тон. */
  const SP = () => window.Speech;
  let spInited = false;
  function initSpeech() {
    if (spInited || !SP()) return;
    spInited = true;
    const s = settings();
    SP().init({ voicePreset: s.voicePreset || 'neuro', voice: s.voiceRu || null, speech: s.tts !== false });
    if (SP().onNeuroFallback) SP().onNeuroFallback(id => { settings().voicePreset = id; if (S.store) S.store.save(); });
  }
  const taskTextRaw = html => String(html)
    .replace(/<br\s*\/?>/gi, '. ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, 'и')
    .replace(/·/g, ' умножить на ').replace(/(\d)\s*:\s*(\d)/g, '$1 разделить на $2')
    .replace(/−/g, ' минус ').replace(/(\d)\s*\+\s*(\d)/g, '$1 плюс $2')
    .replace(/\s+/g, ' ').trim();

  /** Озвучить текст. lang: 'ru-RU' (по умолчанию) или 'en-US'. */
  function speak(text, lang, opts) {
    if (!ttsEnabled() || !text || !SP()) return false;
    initSpeech();
    SP().say(text, Object.assign({ lang: lang || 'ru-RU' }, opts || {}));
    return true;
  }

  S.audio = {
    play(name) { if (!enabled()) return; try { (SOUNDS[name] || SOUNDS.click)(); } catch (e) {} },
    unlock() { ensure(); initSpeech(); if (musicOn()) startMusic(); },
    speak,
    /** Озвучить задание, если включено «читать вслух» */
    speakTask(t) {
      if (!settings().readAloud) return false;
      if (t.say && t.autoSay) return false;                 // у задания своя озвучка
      const lang = t.sayLang && t.type !== 'choice' ? t.sayLang : 'ru-RU';
      return speak(taskTextRaw(t.prompt), lang);
    },
    /** Подготовить фразу заранее (нейросетевой голос считает её в фоне) */
    warm(text) { if (SP() && text) try { SP().warm(taskTextRaw(text)); } catch (e) {} },
    taskText: taskTextRaw,
    stop() { try { SP() && SP().stop(); } catch (e) {} },
    /* ---- голоса и характеры ---- */
    get PRESETS() { return SP() ? SP().PRESETS : []; },
    presetById(id) { return SP() ? SP().presetById(id) : null; },
    currentPreset() { return SP() ? SP().presetById(settings().voicePreset) : null; },
    /** Выбрать характер голоса */
    setPreset(id) {
      initSpeech();
      const p = SP() ? SP().setPreset(id) : { id };
      settings().voicePreset = p.id;
      if (S.store) S.store.save();
      if (SP() && SP().isNeuro) SP().warmUpNeuro();
      return p;
    },
    /** Проба характера, не меняя выбранный */
    demo(presetId, text, name) {
      if (!SP()) return false;
      initSpeech();
      SP().demo(presetId, text || ('Привет' + (name ? ', ' + name : '') + '! Теперь я говорю вот так.'));
      return true;
    },
    voicesFor(lang) {
      if (!SP()) return [];
      if (String(lang || '').toLowerCase().startsWith('en')) {
        const n = SP().enVoiceName;
        return n ? [{ name: n }] : [];
      }
      return SP().voiceList().map(v => ({ name: v.name, natural: v.natural, local: v.local }));
    },
    setPreferredVoice(name) { if (SP()) SP().setPreferred(name); settings().voiceRu = name || ''; if (S.store) S.store.save(); },
    currentVoice(lang) {
      if (!SP()) return null;
      const n = String(lang || '').toLowerCase().startsWith('en') ? SP().enVoiceName : SP().voiceName;
      return n ? { name: n } : null;
    },
    voiceForPreset(id) { return SP() ? SP().voiceFor(id) : ''; },
    hasVoice(lang) { return !!this.currentVoice(lang); },
    isNatural(v) { return !!v && /natural|neural|google/i.test(v.name); },
    /** Нейросетевой голос: включён ли характер и загрузилась ли модель */
    neuro() { return { on: !!(SP() && SP().isNeuro), ready: !!(SP() && SP().neuroReady) }; },
    warmUpNeuro() { if (SP()) SP().warmUpNeuro(); },
    setTtsEnabled(on) { if (SP()) SP().setEnabled(on); },
    startMusic, stopMusic,
    musicPlaying() { return !!musicTimer; }
  };
})();
