(function () {
  const el = document.createElement('div');
  el.id = 'cursor';
  document.body.appendChild(el);

  // トレイル生成
  function spawnTrail(x, y) {
    const t = document.createElement('div');
    t.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #fff;
      pointer-events: none;
      z-index: 999998;
      transform: translate(-50%, -50%);
      mix-blend-mode: difference;
      left: ${x}px;
      top: ${y}px;
      opacity: 0.5;
    `;
    document.body.appendChild(t);
    // reflow を強制してからトランジション開始
    t.getBoundingClientRect();
    t.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    t.style.opacity = '0';
    t.style.transform = 'translate(-50%, -50%) scale(0.3)';
    setTimeout(() => t.remove(), 650);
  }

  let lastTrail = 0;
  document.addEventListener('mousemove', e => {
    el.style.left = e.clientX + 'px';
    el.style.top  = e.clientY + 'px';
    const now = Date.now();
    if (now - lastTrail > 30) {
      spawnTrail(e.clientX, e.clientY);
      lastTrail = now;
    }
  });
  document.addEventListener('mouseleave', () => { el.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { el.style.opacity = '1'; });
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, [role="button"]')) el.classList.add('expanded');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, [role="button"]')) el.classList.remove('expanded');
  });
})();

// 画像・動画のドラッグ禁止
document.addEventListener('dragstart', e => {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') e.preventDefault();
});

// Intersection Observer: 動画を画面内のみ再生
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const video = entry.target;
    if (entry.isIntersecting) {
      video.play();
    } else {
      video.pause();
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.video-cell video').forEach(v => {
  v.autoplay = false;
  videoObserver.observe(v);
});
