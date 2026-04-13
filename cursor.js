(function () {
  const el = document.createElement('div');
  el.id = 'cursor';
  document.body.appendChild(el);


  // トレイル生成
  function spawnTrail(x, y) {
    const t = document.createElement('div');
    t.dataset.trail = '1';
    t.style.cssText = `position:fixed;width:10px;height:10px;border-radius:50%;background:#000;pointer-events:none;z-index:10000000;transform:translate(-50%,-50%);left:${x}px;top:${y}px;opacity:0.5;`;
    document.body.appendChild(t);
    t.getBoundingClientRect();
    t.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    t.style.opacity = '0';
    t.style.transform = 'translate(-50%,-50%) scale(0.3)';
    setTimeout(() => t.remove(), 650);
  }

  let lastTrail = 0;
  let prevX = 0, prevY = 0;
  document.addEventListener('mousemove', e => {
    el.style.left = e.clientX + 'px';
    el.style.top  = e.clientY + 'px';
    const now = Date.now();
    if (now - lastTrail > 30 && !el.classList.contains('expanded')) {
      if (prevX || prevY) spawnTrail(prevX, prevY);
      lastTrail = now;
    }
    prevX = e.clientX;
    prevY = e.clientY;
  });
  document.addEventListener('mouseleave', () => { el.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { el.style.opacity = '1'; });

  // iframe内のmousemoveを親カーソルに転送
  window._attachIframeCursor = function attachIframeCursor(iframe) {
    try {
      const iwin = iframe.contentWindow;
      let iPrevX = 0, iPrevY = 0;
      iwin.addEventListener('mousemove', e => {
        const rect = iframe.getBoundingClientRect();
        const x = e.clientX + rect.left;
        const y = e.clientY + rect.top;
        el.style.left = x + 'px';
        el.style.top  = y + 'px';
        el.style.opacity = '1';
        const now = Date.now();
        if (now - lastTrail > 30 && !el.classList.contains('expanded')) {
          if (iPrevX || iPrevY) spawnTrail(iPrevX, iPrevY);
          lastTrail = now;
        }
        iPrevX = x;
        iPrevY = y;
      });
      iwin.addEventListener('mouseleave', () => { el.style.opacity = '0'; });
    } catch (e) {}
  }

  document.querySelectorAll('iframe').forEach(iframe => {
    iframe.addEventListener('load', () => window._attachIframeCursor(iframe));
  });
  document.addEventListener('mouseover', e => {
    const isInteractive = e.target.closest('a, button, [role="button"]');
    const isFilterBtn   = e.target.closest('.filter-btn');
    const isWorkItem    = e.target.closest('.featured-item, .work-item');
    if (isInteractive && !isFilterBtn) {
      el.classList.add('expanded');
      document.querySelectorAll('[data-trail]').forEach(t => t.remove());
    }
    if (isWorkItem) el.classList.add('show-detail');
  });
  document.addEventListener('mouseout', e => {
    const isInteractive = e.target.closest('a, button, [role="button"]');
    const isFilterBtn   = e.target.closest('.filter-btn');
    const isWorkItem    = e.target.closest('.featured-item, .work-item');
    if (isInteractive && !isFilterBtn) el.classList.remove('expanded');
    if (isWorkItem) el.classList.remove('show-detail');
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
