/* Котошкола — свой нейросетевой голос, работает прямо на компьютере, без интернета и без оплаты.
   Движок: Piper (модель VITS ru_RU-irina-medium) + espeak-ng для разбора слов на звуки, всё в папке voice/.

   Детский тембр получается честно, без «ускоренной плёнки»: речь синтезируется замедленной
   (length_scale), а проигрывается быстрее во столько же раз. Темп остаётся нормальным,
   а голос и форманты поднимаются — так звучит ребёнок, а не ускоренная запись взрослого. */
window.TTS = (function () {
  'use strict';
  const DIR = 'voice/';
  const MODEL = 'ru_RU-irina-medium';
  const S = { ready: false, loading: null, cfg: null, session: null, ort: null, phon: null, ctx: null, cache: new Map(), src: null, volume: 1 };

  const semitoneRatio = st => Math.pow(2, st / 12);

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = () => rej(new Error('не загрузился ' + src));
      document.head.appendChild(s);
    });
  }

  /** Загрузка движка и модели. onProgress(0..1) — для показа полосы загрузки. */
  function init(onProgress) {
    if (S.ready) return Promise.resolve(true);
    if (S.loading) return S.loading;
    const step = (p, msg) => { if (onProgress) onProgress(p, msg); };
    S.loading = (async () => {
      step(0.02, 'движок');
      if (!window.ort) await loadScript(DIR + 'ort.min.js');
      S.ort = window.ort;
      S.ort.env.wasm.wasmPaths = DIR;
      S.ort.env.wasm.numThreads = 1;          // один поток: без SharedArrayBuffer работает везде
      S.ort.env.logLevel = 'error';
      step(0.1, 'разбор слов');
      if (!window.createPiperPhonemize) await loadScript(DIR + 'piper_phonemize.js');
      step(0.2, 'настройки голоса');
      S.cfg = await (await fetch(DIR + MODEL + '.onnx.json')).json();
      step(0.25, 'модель голоса');
      // модель большая: показываем ход загрузки
      const resp = await fetch(DIR + MODEL + '.onnx');
      const total = Number(resp.headers.get('content-length')) || 63200000;
      const reader = resp.body.getReader();
      const chunks = []; let got = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); got += value.length;
        step(0.25 + 0.6 * Math.min(1, got / total), 'модель голоса');
      }
      const bytes = new Uint8Array(got); let off = 0;
      chunks.forEach(c => { bytes.set(c, off); off += c.length; });
      step(0.88, 'запуск');
      S.session = await S.ort.InferenceSession.create(bytes, { executionProviders: ['wasm'] });
      S.ready = true;
      step(1, 'готово');
      return true;
    })();
    S.loading.catch(() => { S.loading = null; });
    return S.loading;
  }

  /** Текст → идентификаторы звуков (фонем) через espeak-ng. */
  function phonemize(text) {
    return new Promise((resolve, reject) => {
      const input = JSON.stringify([{ text: String(text).trim() }]);
      window.createPiperPhonemize({
        print: line => { try { resolve(JSON.parse(line).phoneme_ids); } catch (e) { reject(e); } },
        printErr: e => reject(new Error(String(e))),
        locateFile: f => f.endsWith('.wasm') ? DIR + 'piper_phonemize.wasm' : f.endsWith('.data') ? DIR + 'piper_phonemize.data' : DIR + f,
      }).then(mod => mod.callMain(['-l', S.cfg.espeak.voice, '--input', input, '--espeak_data', '/espeak-ng-data']));
    });
  }

  /** Синтез: возвращает Float32Array со звуком (частота дискретизации из настроек модели). */
  async function synth(text, lengthScale) {
    const ids = await phonemize(text);
    const inf = S.cfg.inference;
    const feeds = {
      input: new S.ort.Tensor('int64', BigInt64Array.from(ids.map(BigInt)), [1, ids.length]),
      input_lengths: new S.ort.Tensor('int64', BigInt64Array.from([BigInt(ids.length)])),
      scales: new S.ort.Tensor('float32', Float32Array.from([inf.noise_scale, lengthScale, inf.noise_w])),
    };
    if (S.cfg.speaker_id_map && Object.keys(S.cfg.speaker_id_map).length) feeds.sid = new S.ort.Tensor('int64', BigInt64Array.from([0n]));
    const out = await S.session.run(feeds);
    return out.output.data;
  }

  function ctx() {
    if (!S.ctx) { const AC = window.AudioContext || window.webkitAudioContext; S.ctx = new AC(); }
    if (S.ctx.state === 'suspended') S.ctx.resume();
    return S.ctx;
  }

  /** Проиграть звук с подъёмом тона: играем быстрее ровно во столько, во сколько замедлили синтез. */
  function playPcm(pcm, sampleRate, speed) {
    return new Promise(resolve => {
      const c = ctx();
      const buf = c.createBuffer(1, pcm.length, sampleRate);
      buf.copyToChannel(pcm instanceof Float32Array ? pcm : Float32Array.from(pcm), 0);
      const src = c.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = speed;
      const g = c.createGain(); g.gain.value = S.volume;
      src.connect(g); g.connect(c.destination);
      src.onended = () => { if (S.src === src) S.src = null; resolve(true); };
      stop();
      S.src = src;
      src.start();
    });
  }
  function stop() { if (S.src) { try { S.src.onended = null; S.src.stop(); } catch (e) { /* noop */ } S.src = null; } }

  /**
   * Сказать фразу.
   * opts.semitones — на сколько полутонов поднять голос (0 — как есть, 5–7 — детский),
   * opts.rate — скорость речи (1 — обычная), opts.cache — запоминать синтез фразы.
   */
  async function speak(text, opts) {
    opts = opts || {};
    if (!S.ready) await init();
    const semis = opts.semitones == null ? 0 : opts.semitones;
    const rate = opts.rate || 1;
    const shift = semitoneRatio(semis);              // во столько раз поднимаем тон
    const lengthScale = shift / rate;                // синтезируем медленнее ровно во столько же
    const key = `${semis}|${rate}|${text}`;
    let pcm = opts.cache === false ? null : S.cache.get(key);
    const t0 = performance.now();
    if (!pcm) {
      pcm = await synth(text, lengthScale);
      if (opts.cache !== false) { if (S.cache.size > 120) S.cache.clear(); S.cache.set(key, pcm); }
    }
    const sr = S.cfg.audio.sample_rate;
    const gen = performance.now() - t0;
    const seconds = pcm.length / sr / shift;
    await playPcm(pcm, sr, shift);
    return { seconds, genMs: Math.round(gen), wav: toWav(pcm, sr, shift) };
  }

  /** Подготовить фразу заранее (без звука), чтобы потом сказать мгновенно. */
  async function warm(text, opts) {
    opts = opts || {};
    if (!S.ready) await init();
    const semis = opts.semitones == null ? 0 : opts.semitones, rate = opts.rate || 1;
    const key = `${semis}|${rate}|${text}`;
    if (S.cache.has(key)) return false;
    const pcm = await synth(text, semitoneRatio(semis) / rate);
    if (S.cache.size > 120) S.cache.clear();
    S.cache.set(key, pcm);
    return true;
  }

  /** Сборка WAV (для кнопки «скачать» на странице пробы). */
  function toWav(pcm, sampleRate, speed) {
    const sr = Math.round(sampleRate * (speed || 1));
    const n = pcm.length, buf = new ArrayBuffer(44 + n * 2), view = new DataView(buf);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); view.setUint32(4, 36 + n * 2, true); str(8, 'WAVEfmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, sr, true); view.setUint32(28, sr * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    str(36, 'data'); view.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) { const s = Math.max(-1, Math.min(1, pcm[i])); view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
    return buf;
  }

  return {
    init, speak, warm, stop, toWav,
    get ready() { return S.ready; },
    get cached() { return S.cache.size; },
    clearCache() { S.cache.clear(); },
    setVolume(v) { S.volume = v; },
    /** Проверить, лежат ли файлы голоса рядом с приложением. */
    async available() {
      try { const r = await fetch(DIR + MODEL + '.onnx.json', { method: 'HEAD' }); return r.ok; } catch (e) { return false; }
    },
  };
})();
