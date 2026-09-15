/* Конфетти на canvas. SCHOOL.confetti.burst({count, duration}) */
(function () {
  const S = window.SCHOOL;
  const COLORS = ['#ff5c6c', '#ffc531', '#2ecc71', '#6c5ce7', '#00cec9', '#fd79a8', '#74b9ff', '#fdcb6e'];
  let canvas = null, ctx = null, parts = [], raf = null, endAt = 0;

  function ensure() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:999;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
  }
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  function spawn(count, origin) {
    const w = canvas.width, h = canvas.height;
    for (let i = 0; i < count; i++) {
      const fromSide = origin === 'sides';
      parts.push({
        x: fromSide ? (i % 2 ? w + 10 : -10) : w / 2 + (Math.random() - .5) * w * 0.4,
        y: fromSide ? h * (0.3 + Math.random() * 0.4) : h * 0.35,
        vx: fromSide ? (i % 2 ? -1 : 1) * (4 + Math.random() * 8) : (Math.random() - .5) * 16,
        vy: -(6 + Math.random() * 12),
        g: 0.35 + Math.random() * 0.2,
        w: 6 + Math.random() * 8, hgt: 8 + Math.random() * 10,
        rot: Math.random() * Math.PI, vr: (Math.random() - .5) * 0.3,
        color: COLORS[i % COLORS.length], shape: Math.random() < 0.25 ? 'circle' : 'rect', a: 1
      });
    }
  }
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();
    parts.forEach(p => {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.rot += p.vr;
      if (now > endAt - 700) p.a = Math.max(0, (endAt - now) / 700);
      ctx.save(); ctx.globalAlpha = p.a; ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
      if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.hgt / 2, p.w, p.hgt);
      ctx.restore();
    });
    parts = parts.filter(p => p.y < canvas.height + 40 && p.a > 0);
    if (parts.length && now < endAt + 200) raf = requestAnimationFrame(frame);
    else { raf = null; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }
  S.confetti = {
    burst(opts) {
      opts = opts || {};
      ensure(); resize();
      endAt = Date.now() + (opts.duration || 2800);
      spawn(opts.count || 160, opts.origin || 'center');
      if (!raf) raf = requestAnimationFrame(frame);
    }
  };
})();
