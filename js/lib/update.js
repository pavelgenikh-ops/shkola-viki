/* Обновление приложения на телефоне и планшете.
   Регистрирует service worker, следит за новой версией и показывает плашку «Обновить».
   Прогресс (localStorage) при обновлении не трогается — он привязан к адресу сайта, а не к кэшу. */
(function () {
  const S = window.SCHOOL || (window.SCHOOL = {});
  if (!('serviceWorker' in navigator)) { S.update = { supported: false, check() {} }; return; }
  if (location.protocol === 'file:') { S.update = { supported: false, check() {} }; return; }

  /* версия берётся из адреса этого же файла: update.js?v=<версия> */
  const me = document.currentScript || [...document.querySelectorAll('script[src*="update.js"]')].pop();
  const VERSION = (me && new URL(me.src, location.href).searchParams.get('v')) || 'dev';

  let reg = null, waiting = null, reloading = false;

  function bar(text, btnText, onClick) {
    let b = document.getElementById('update-bar');
    if (!b) {
      b = document.createElement('div');
      b.id = 'update-bar';
      b.className = 'update-bar';
      document.body.appendChild(b);
    }
    b.innerHTML = '<span class="ub-text"></span>' + (btnText ? '<button class="btn btn-primary" type="button">' + btnText + '</button>' : '');
    b.querySelector('.ub-text').textContent = text;
    const btn = b.querySelector('button');
    if (btn) btn.onclick = onClick;
    requestAnimationFrame(() => b.classList.add('show'));
    return b;
  }
  function hideBar() { const b = document.getElementById('update-bar'); if (b) b.classList.remove('show'); }

  function offerUpdate(sw) {
    waiting = sw;
    bar('Появилась новая версия приложения', 'Обновить', () => {
      hideBar();
      if (S.audio) S.audio.play('click');
      applyUpdate();
    });
  }
  function applyUpdate() {
    if (!waiting) { location.reload(); return; }
    reloading = true;
    waiting.postMessage('skip-waiting');
    /* если браузер не пришлёт controllerchange — перезагрузим сами */
    setTimeout(() => { if (reloading) location.reload(); }, 2500);
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;                       // уже перезагружаемся по кнопке
    reloading = true;
    location.reload();
  });

  function watch(r) {
    reg = r;
    if (r.waiting && navigator.serviceWorker.controller) offerUpdate(r.waiting);
    r.addEventListener('updatefound', () => {
      const sw = r.installing;
      if (!sw) return;
      sw.addEventListener('statechange', () => {
        /* новая версия готова и это не первая установка — предлагаем обновиться */
        if (sw.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(sw);
      });
    });
  }

  /** Проверить обновление вручную (кнопка в «Родителям» или при возврате на вкладку) */
  function check(loud) {
    if (!reg) return Promise.resolve(false);
    return reg.update().then(() => {
      const has = !!reg.waiting;
      if (!has && loud) bar('Установлена самая свежая версия', 'Хорошо', hideBar);
      return has;
    }).catch(() => false);
  }

  navigator.serviceWorker.register('sw.js?v=' + VERSION).then(watch).catch(() => {});

  /* проверяем при возврате к приложению и раз в 15 минут */
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(false); });
  setInterval(() => check(false), 15 * 60 * 1000);

  S.update = { supported: true, check, version: VERSION };
})();
