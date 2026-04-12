// 画像・動画のドラッグ禁止
document.addEventListener('dragstart', e => {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') e.preventDefault();
});

// About モザイクスライドショー
const mosaicCanvas = document.getElementById('mosaic-canvas');
const slides = document.querySelectorAll('.about-slide');

if (mosaicCanvas && slides.length > 0) {
  const mCtx = mosaicCanvas.getContext('2d');
  const SIZE = 180;
  const DISPLAY_SIZE = SIZE * 0.871;
  const isMobileDevice = window.matchMedia('(hover: none)').matches;
  const BLOCKS = isMobileDevice ? 10 : 17;
  const blockSize = DISPLAY_SIZE / BLOCKS;

  // transform親の影響を受けないようにbodyに移動
  document.body.appendChild(mosaicCanvas);

  function resizeCanvas() {
    mosaicCanvas.width  = window.innerWidth;
    mosaicCanvas.height = window.innerHeight;
  }
  resizeCanvas();

  // 各タイルのランダム散乱ベクトル
  const scatterVecs = Array.from({ length: BLOCKS * BLOCKS }, () => ({
    x: (Math.random() - 0.5) * 2,
    y: (Math.random() - 0.5) * 2,
  }));

  // タイルがパッと消える順番（ランダムシャッフル）
  const disappearOrder = Array.from({ length: BLOCKS * BLOCKS }, (_, i) => i)
    .sort(() => Math.random() - 0.5);

  // ピクセル化済みキャンバスのキャッシュ
  const pixelCache = document.createElement('canvas');
  pixelCache.width  = BLOCKS;
  pixelCache.height = BLOCKS;
  const pixCtx = pixelCache.getContext('2d');

  function drawMosaic(img, scatter) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const sw = img.naturalWidth, sh = img.naturalHeight;
    const sq = Math.min(sw, sh);
    const sx = (sw - sq) / 2, sy = (sh - sq) / 2;

    pixCtx.imageSmoothingEnabled = false;
    pixCtx.clearRect(0, 0, BLOCKS, BLOCKS);
    pixCtx.drawImage(img, sx, sy, sq, sq, 0, 0, BLOCKS, BLOCKS);

    mCtx.imageSmoothingEnabled = false;
    mCtx.clearRect(0, 0, mosaicCanvas.width, mosaicCanvas.height);

    const progress  = scatter / 90;
    const maxDist   = Math.max(mosaicCanvas.width, mosaicCanvas.height) * 0.8;
    const homeX     = mosaicCanvas.width  * 0.5 - DISPLAY_SIZE * 0.5;
    const homeY     = mosaicCanvas.height * 0.50 - DISPLAY_SIZE * 0.5;
    const disappearProgress = Math.max(0, (progress - 0.5) * 2);
    const disappearCount    = Math.floor(disappearProgress * BLOCKS * BLOCKS);
    const hiddenSet = new Set(disappearOrder.slice(0, disappearCount));

    for (let row = 0; row < BLOCKS; row++) {
      for (let col = 0; col < BLOCKS; col++) {
        const i = row * BLOCKS + col;
        if (hiddenSet.has(i)) continue;
        const destX = homeX + col * blockSize + scatterVecs[i].x * maxDist * progress;
        const destY = homeY + row * blockSize + scatterVecs[i].y * maxDist * progress;
        mCtx.drawImage(pixelCache, col, row, 1, 1, destX, destY, blockSize, blockSize);
      }
    }
  }

  let current = 0;
  let currentScatter = 0;
  let rafPending = false;
  let lastScrollTime = 0;
  const scrollThrottle = isMobileDevice ? 32 : 0;

  function showSlide(idx) {
    slides.forEach(s => s.classList.remove('active'));
    slides[idx].classList.add('active');
    const img = slides[idx];
    if (img.complete && img.naturalWidth > 0) {
      drawMosaic(img, currentScatter);
    } else {
      img.addEventListener('load', () => drawMosaic(img, currentScatter), { once: true });
    }
  }

  showSlide(current);
  setInterval(() => { current = (current + 1) % slides.length; showSlide(current); }, 1800);
  window.addEventListener('resize', () => { resizeCanvas(); drawMosaic(slides[current], currentScatter); });

  if (!isMobileDevice) {
    window.addEventListener('scroll', () => {
      const now = Date.now();
      if (now - lastScrollTime < scrollThrottle) return;
      lastScrollTime = now;
      currentScatter = Math.min(window.scrollY / window.innerHeight, 1) * 90;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          drawMosaic(slides[current], currentScatter);
          rafPending = false;
        });
      }
    }, { passive: true });
  }

}

// アイコン動画
const iconVideo = document.getElementById('icon-video');

function showIconVideo(show) {
  if (!iconVideo) return;
  iconVideo.classList.toggle('visible', show);
}

if (iconVideo) {
  iconVideo.addEventListener('click', () => {
    // 03のループを停止して02を再生
    iconVideo.loop = false;
    iconVideo.src = 'icon/02.webm';
    iconVideo.play();
  });

  iconVideo.addEventListener('ended', () => {
    // 02再生終了 → 03ループに戻す
    iconVideo.loop = true;
    iconVideo.src = 'icon/03.webm';
    iconVideo.play();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) iconVideo.pause();
    else iconVideo.play();
  });
}

// イントロ映像
const intro = document.getElementById('intro');
const introVideo = document.getElementById('intro-video');
const introPoster = document.getElementById('intro-poster');

function hideIntro() {
  sessionStorage.setItem('introPlayed', '1');
  intro.classList.add('hidden');
  setTimeout(() => { intro.style.display = 'none'; }, 600);
}

if (intro && introVideo) {
  if (sessionStorage.getItem('introPlayed')) {
    intro.style.display = 'none';
  } else {
    const isMobileIntro = window.matchMedia('(hover: none)').matches;
    if (isMobileIntro) {
      // モバイル：静止画を1秒表示
      introVideo.style.display = 'none';
      if (introPoster) introPoster.style.display = '';
      setTimeout(hideIntro, 2000);
    } else {
      introVideo.addEventListener('ended', hideIntro);
      introVideo.addEventListener('error', () => { intro.style.display = 'none'; });
      introVideo.play().catch(() => {});
    }
  }
}

// カスタムカーソル
const cursor = document.getElementById('cursor');


function spawnTrail(x, y) {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;width:10px;height:10px;border-radius:50%;background:#fff;pointer-events:none;z-index:999998;transform:translate(-50%,-50%);left:${x}px;top:${y}px;opacity:0.5;`;
  document.body.appendChild(t);
  requestAnimationFrame(() => {
    t.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    t.style.opacity = '0';
    t.style.transform = 'translate(-50%,-50%) scale(0.3)';
  });
  setTimeout(() => t.remove(), 650);
}

let lastTrail = 0;
let prevX = 0, prevY = 0;

if (cursor) {
  let idleTimer;

  function resetIdle() {
    cursor.style.opacity = '1';
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      cursor.style.opacity = '0';
    }, 2000);
  }

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    resetIdle();
    const now = Date.now();
    if (now - lastTrail > 30 && !cursor.classList.contains('expanded')) {
      spawnTrail(prevX, prevY);
      lastTrail = now;
    }
    prevX = e.clientX;
    prevY = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });

  // iframe 上ではカーソルと残像を非表示
  document.querySelectorAll('iframe').forEach(iframe => {
    iframe.addEventListener('mouseenter', () => {
      cursor.style.opacity = '0';
      cursor.classList.remove('expanded');
    });
    iframe.addEventListener('mouseleave', () => {
      cursor.style.opacity = '1';
    });
  });
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('.work-item, .featured-item, a, button, [role="button"]');
    if (t && !t.classList.contains('bio-link') && !t.classList.contains('filter-btn')) cursor.classList.add('expanded');
  });
  document.addEventListener('mouseout', e => {
    const t = e.target.closest('.work-item, .featured-item, a, button, [role="button"]');
    if (t && !t.classList.contains('bio-link') && !t.classList.contains('filter-btn')) cursor.classList.remove('expanded');
  });
}


// メニュートグル
const menuToggle = document.getElementById('menu-toggle');
const menuNav    = document.getElementById('menu-nav');
if (menuToggle && menuNav) {
  menuToggle.addEventListener('click', () => {
    const open = menuNav.classList.toggle('open');
    menuToggle.classList.toggle('open', open);
  });
}

// ページ切り替え
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-links [data-page]');
const contactIframe  = document.querySelector('.contact-iframe');
const contactFallback = document.getElementById('contact-fallback');
const hasWebGPU = !!navigator.gpu;

function switchPage(target, pushState = true) {
  if (target === 'contact') {
    if (hasWebGPU) {
      if (contactIframe && !contactIframe.src.includes('study-007')) {
        contactIframe.src = contactIframe.dataset.src;
      }
    } else {
      if (contactIframe) contactIframe.style.display = 'none';
      if (contactFallback) contactFallback.style.display = 'flex';
    }
  } else {
    if (contactIframe) contactIframe.src = 'about:blank';
  }

  pages.forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + target).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (mosaicCanvas) mosaicCanvas.style.display = target === 'main' ? '' : 'none';

  navLinks.forEach(l => {
    l.classList.toggle('active', l.dataset.page === target);
    if (l.dataset.page === 'main') {
      l.parentElement.style.display = target === 'main' ? 'none' : '';
    }
  });

  // メニューを閉じる
  if (menuNav && menuToggle) {
    menuNav.classList.remove('open');
    menuToggle.classList.remove('open');
  }

  // ブラウザ履歴を更新
  if (pushState) {
    const hash = target === 'main' ? '' : '#' + target;
    history.pushState({ page: target }, '', location.pathname + hash);
  }
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    switchPage(link.dataset.page);
  });
});

// ブラウザの戻る/進むボタン対応
window.addEventListener('popstate', e => {
  const target = e.state?.page || location.hash.replace('#', '') || 'main';
  switchPage(target, false);
});

// URLハッシュでWORK/PLAYページを直接開く（back-link対応）
const hash = location.hash.replace('#', '');
const validPages = ['work', 'play', 'contact', 'bio'];
const initialPage = validPages.includes(hash) ? hash : 'main';
history.replaceState({ page: initialPage }, '', location.href);
if (initialPage !== 'main') switchPage(initialPage, false);

// 初期表示：AboutページではAboutリンクを非表示
const aboutLink = document.querySelector('.nav-links [data-page="main"]');
if (aboutLink) aboutLink.parentElement.style.display = initialPage === 'main' ? 'none' : '';

showIconVideo(true);

const filterPanel = document.getElementById('work-filters');

// フィルター適用
function applyFilter(filter) {
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === filter);
  });

  // 現在表示中のページのcoming-soonを特定
  const activePage = document.querySelector('.page.active');
  const comingSoon = activePage ? activePage.querySelector('.coming-soon') : null;

  let hasVisible = false;
  document.querySelectorAll('.work-item').forEach(item => {
    if (!activePage || !activePage.contains(item)) return;
    const cats = (item.dataset.category || '').split(' ');
    const match = filter === 'all' || cats.includes(filter);
    item.style.display = match ? '' : 'none';
    if (match) hasVisible = true;
  });

  if (comingSoon) comingSoon.style.display = !hasVisible ? '' : 'none';
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  applyFilter(btn.dataset.filter);
});


// Aboutテキストのキーワードクリック
document.addEventListener('click', e => {
  const link = e.target.closest('.about-link, [data-page]');
  if (!link) return;

  // data-page があれば別ページへ
  if (link.dataset.page) {
    switchPage(link.dataset.page);
    return;
  }

  // data-filter があれば Work ページ＋フィルター
  const filter = link.dataset.filter;
  switchPage('work');
  applyFilter(filter);
});

