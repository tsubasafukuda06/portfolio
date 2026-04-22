// 動画の遅延再生（IntersectionObserver）
const supportsWebm = document.createElement('video').canPlayType('video/webm') !== '';

document.querySelectorAll('video[data-src]').forEach(video => {
  const webmSrc = video.dataset.src;
  const videoSrc = supportsWebm ? webmSrc : webmSrc.replace('.webm', '.mp4');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.src = videoSrc;
        video.load();
        video.addEventListener('canplay', () => {
          video.play().catch(() => {});
        }, { once: true });
        observer.disconnect();
      }
    });
  }, { threshold: 0.1 });
  observer.observe(video);
});

// ハンバーガーメニュー
const menuToggle = document.getElementById('menu-toggle');
const menuNav    = document.getElementById('menu-nav');
if (menuToggle && menuNav) {
  menuToggle.addEventListener('click', () => {
    const open = menuNav.classList.toggle('open');
    menuToggle.classList.toggle('open', open);
  });
}

