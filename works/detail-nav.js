// 動画の遅延再生（IntersectionObserver）/ モバイルは静止画に置換
const isMobile = window.matchMedia('(hover: none)').matches;

document.querySelectorAll('video[data-src]').forEach(video => {
  if (isMobile) {
    const poster = video.poster;
    if (poster) {
      const img = document.createElement('img');
      img.src = poster;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      video.replaceWith(img);
    }
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.src = video.dataset.src;
          video.play();
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(video);
  }
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

