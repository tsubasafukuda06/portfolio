// 動画の遅延再生（IntersectionObserver）/ モバイルは静止画に置換
const isMobile = window.matchMedia('(hover: none)').matches;

document.querySelectorAll('.video-cell video[data-src]').forEach(video => {
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

// アイコン動画
const iconVideo = document.getElementById('icon-video');
if (iconVideo) {
  iconVideo.classList.add('visible');
  iconVideo.addEventListener('click', () => {
    iconVideo.loop = false;
    iconVideo.src = '../icon/02.webm';
    iconVideo.play();
  });
  iconVideo.addEventListener('ended', () => {
    iconVideo.loop = true;
    iconVideo.src = '../icon/03.webm';
    iconVideo.play();
  });

  // ページ非表示時に動画を停止
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) iconVideo.pause();
    else iconVideo.play();
  });
}
