/* Школа Вики — работа без интернета и тихое обновление.
   Версия берётся из адреса регистрации: sw.js?v=<версия>. Когда версия меняется
   (её меняет _dev/bump.js при каждой правке), браузер видит новый файл, ставит его
   рядом и приложение предлагает обновиться. Прогресс лежит в localStorage —
   его не трогает ни установка, ни очистка кэша. */
const VERSION = new URL(self.location).searchParams.get('v') || 'dev';
const CACHE = 'shkola-viki-' + VERSION;

/* Что положить в кэш сразу. Остальное (файлы голоса) кэшируется по мере запросов. */
const CORE = [
  './', './index.html', './manifest.webmanifest', './телефон.html',
  './css/style.css', './js/engine/core.js', './js/lib/util.js', './js/lib/vis.js',
  './js/lib/store.js', './js/lib/tts.js', './js/lib/speech.js', './js/lib/audio.js',
  './js/lib/confetti.js', './js/lib/qrcode.js', './js/engine/game.js', './js/engine/tasks.js',
  './js/data/math.js', './js/data/russian.js', './js/data/reading.js',
  './js/data/world.js', './js/data/english.js', './js/data/logic.js',
  './js/ui/games.js', './js/ui/diploma.js', './js/ui/app.js',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    /* каждый файл с текущей версией, чтобы не подтянуть старое из HTTP-кэша */
    await Promise.allSettled(CORE.map(f => {
      const url = f.endsWith('/') || f.endsWith('.png') ? f : f + '?v=' + VERSION;
      return c.add(new Request(url, { cache: 'reload' }));
    }));
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE && k.startsWith('shkola-viki-')).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

/** Сначала сеть, при неудаче — кэш. Для страницы: чтобы новая версия подхватывалась сразу. */
async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    throw e;
  }
}
/** Сначала кэш — для файлов с версией в адресе: они не меняются в пределах версии. */
async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req) || await cache.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.ok && req.method === 'GET') cache.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;                  // чужие адреса не трогаем
  if (url.pathname.endsWith('/sw.js')) return;                 // сам служебный скрипт всегда из сети
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
  e.respondWith(isPage ? networkFirst(req) : cacheFirst(req));
});

/* Команда от приложения: применить обновление немедленно. */
self.addEventListener('message', e => {
  if (e.data === 'skip-waiting' || (e.data && e.data.type === 'skip-waiting')) self.skipWaiting();
});
