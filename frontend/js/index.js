// =========================================================================
// 1. EFEITO DE CONFETES / PICADINHO CAINDO NA TELA (COMEMORAÇÃO)
// =========================================================================
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');
let confettiParticles = [];
let confettiAnimationId = null;

const confettiColors = [
  '#ff85c2',
  '#f472b6',
  '#ec4899',
  '#fbcfe8',
  '#ffffff',
  '#db2777'
];

function getViewportSize() {
  if (window.visualViewport) {
    return {
      width: Math.round(window.visualViewport.width),
      height: Math.round(window.visualViewport.height)
    };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

function resizeConfettiCanvas() {
  const vp = getViewportSize();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  confettiCanvas.width = vp.width * dpr;
  confettiCanvas.height = vp.height * dpr;
  confettiCanvas.style.width = `${vp.width}px`;
  confettiCanvas.style.height = `${vp.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resizeConfettiCanvas, { passive: true });
window.addEventListener('orientationchange', () => {
  setTimeout(resizeConfettiCanvas, 180);
}, { passive: true });
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', resizeConfettiCanvas, { passive: true });
}
resizeConfettiCanvas();

function spawnConfetti(count = 95, originX = null, originY = -12) {
  const vp = getViewportSize();
  const scaleFactor = vp.width < 420 ? 0.72 : 1;
  const total = Math.max(35, Math.round(count * scaleFactor));

  for (let i = 0; i < total; i++) {
    const startX =
      originX !== null
        ? originX + (Math.random() - 0.5) * 90
        : Math.random() * vp.width;
    const startY =
      originY >= 0
        ? originY + (Math.random() - 0.5) * 30
        : -10 - Math.random() * 140;

    confettiParticles.push({
      x: startX,
      y: startY,
      w: 6 + Math.random() * 7,
      h: 4 + Math.random() * 5,
      vx: (Math.random() - 0.5) * 3.4,
      vy: 1.8 + Math.random() * 3.6,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.16,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.03 + Math.random() * 0.04,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      alpha: 1
    });
  }

  if (!confettiAnimationId) {
    animateConfetti();
  }
}

function animateConfetti() {
  const vp = getViewportSize();
  ctx.clearRect(0, 0, vp.width, vp.height);

  confettiParticles.forEach((p) => {
    p.swayPhase += p.swaySpeed;
    p.x += p.vx + Math.sin(p.swayPhase) * 0.7;
    p.y += p.vy;
    p.rotation += p.vRot;

    if (p.y > vp.height * 0.78) {
      p.alpha = Math.max(0, p.alpha - 0.022);
    }

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });

  confettiParticles = confettiParticles.filter(
    (p) => p.y < vp.height + 30 && p.alpha > 0.02
  );

  if (confettiParticles.length > 0) {
    confettiAnimationId = requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, vp.width, vp.height);
    confettiAnimationId = null;
  }
}

const heroConfettiBtn = document.getElementById('heroConfettiBtn');
if (heroConfettiBtn) {
  heroConfettiBtn.addEventListener('click', (e) => {
    const rect = heroConfettiBtn.getBoundingClientRect();
    const cx = e.clientX || rect.left + rect.width / 2;
    const cy = e.clientY || rect.top + rect.height / 2;
    spawnConfetti(105, cx, cy);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => spawnConfetti(80), 250);
});

// =========================================================================
// 2. CAIXINHAS CENTRALIZADAS, LOOP DE 3 E GRADE PARADA DE 6 MÍDIAS
// =========================================================================
const soloMediaStyle =
  'margin:auto;width:100%;max-width:100%;height:auto;max-height:75dvh;object-fit:contain;object-position:center center;display:block;';

const gridMediaStyle =
  'margin:auto;width:100%;height:100%;object-fit:cover;object-position:center center;display:block;';

function detectMediaType(url, explicitType) {
  if (explicitType === 'video' || explicitType === 'image') {
    return explicitType;
  }
  const cleanUrl = (url || '').split('?')[0].split('#')[0].toLowerCase();
  if (/\.(mp4|mov|webm|m4v|ogg)$/i.test(cleanUrl)) {
    return 'video';
  }
  return 'image';
}

function getCleanHref(el) {
  if (!el) return '';
  const rawAttr = (el.getAttribute('href') || '').trim();
  if (!rawAttr || rawAttr === '#' || rawAttr.startsWith('javascript:')) return '';
  return rawAttr;
}

function pauseAllInlineVideos(exceptVideo = null) {
  document.querySelectorAll('video').forEach((vid) => {
    if (vid !== exceptVideo && !vid.closest('#lightboxMediaContainer')) {
      vid.pause();
    }
  });
}

// Faz os Boomerangs / vídeos da caixinha rodarem sozinhos, em loop e sem som
function configureAutoplayBoomerang(videoEl, src) {
  if (!videoEl) return;
  videoEl.src = src;
  videoEl.muted = true;
  videoEl.defaultMuted = true;
  videoEl.volume = 0;
  videoEl.loop = true;
  videoEl.autoplay = true;
  videoEl.playsInline = true;
  videoEl.controls = false;
  videoEl.preload = 'auto';
  videoEl.setAttribute('muted', '');
  videoEl.setAttribute('loop', '');
  videoEl.setAttribute('autoplay', '');
  videoEl.setAttribute('playsinline', '');

  const tryPlay = () => {
    videoEl.muted = true;
    videoEl.volume = 0;
    const playPromise = videoEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  };

  videoEl.addEventListener('loadedmetadata', tryPlay, { once: true });
  videoEl.addEventListener('canplay', tryPlay, { once: true });
  tryPlay();
}

function replayAllGridBoomerangs() {
  document.querySelectorAll('#loopingThreeGrid video, #fixedSixGrid video').forEach((vid) => {
    vid.muted = true;
    vid.defaultMuted = true;
    vid.volume = 0;
    vid.loop = true;
    const playPromise = vid.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  });
}

function attachPlayButtonToVideo(frameEl, videoEl, label = 'Vídeo', compact = false) {
  if (!frameEl || !videoEl) return;

  const existingBtn = frameEl.querySelector('.play-toggle-btn');
  if (existingBtn) existingBtn.remove();

  videoEl.muted = false;
  videoEl.defaultMuted = false;
  videoEl.volume = 1.0;
  videoEl.playsInline = true;
  videoEl.setAttribute('playsinline', '');

  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = compact ? 'play-toggle-btn is-compact' : 'play-toggle-btn';
  playBtn.textContent = 'Play';
  playBtn.setAttribute('aria-label', `Reproduzir ${label} com som`);

  const syncButtonLabel = () => {
    if (videoEl.paused || videoEl.ended) {
      playBtn.textContent = 'Play';
      playBtn.setAttribute('aria-label', `Reproduzir ${label} com som`);
    } else {
      playBtn.textContent = 'Pausar';
      playBtn.setAttribute('aria-label', `Pausar ${label}`);
    }
  };

  playBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (videoEl.paused || videoEl.ended) {
      pauseAllInlineVideos(videoEl);
      videoEl.muted = false;
      videoEl.defaultMuted = false;
      videoEl.volume = 1.0;
      const playPromise = videoEl.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          videoEl.muted = false;
        });
      }
    } else {
      videoEl.pause();
    }
    syncButtonLabel();
  });

  videoEl.addEventListener('play', syncButtonLabel);
  videoEl.addEventListener('pause', syncButtonLabel);
  videoEl.addEventListener('ended', syncButtonLabel);

  frameEl.appendChild(playBtn);
}

function createGridMediaElement(item) {
  if (item.type === 'video') {
    return `<video playsinline preload="auto" muted loop autoplay style="${gridMediaStyle}"></video>`;
  }
  return `<img src="${item.href}" alt="${item.label}" style="${gridMediaStyle}" />`;
}

// Primeira caixinha centralizada (somente vídeo) e segunda caixinha (foto ou vídeo)
function initSoloAnchorFrame(frameId, fallbackLabel) {
  const anchor = document.getElementById(frameId);
  if (!anchor) return;

  const href = getCleanHref(anchor);
  const imgEl = anchor.querySelector('img.media-img');
  const videoEl = anchor.querySelector('video.media-video');
  const sourceEl = videoEl ? videoEl.querySelector('source') : null;
  const placeholderEl = anchor.querySelector('.media-placeholder');

  if (imgEl) imgEl.style.cssText = soloMediaStyle;
  if (videoEl) videoEl.style.cssText = soloMediaStyle;

  if (!href) {
    anchor.classList.remove('has-media');
    if (placeholderEl) placeholderEl.hidden = false;
    anchor.addEventListener('click', (e) => e.preventDefault());
    return;
  }

  anchor.classList.add('has-media');

  if (placeholderEl) {
    placeholderEl.hidden = true;
    placeholderEl.remove();
  }

  const isVideoOnly = frameId === 'frame-solo-1';
  const type = isVideoOnly
    ? 'video'
    : detectMediaType(href, anchor.getAttribute('data-media-type'));

  if (type === 'video' && videoEl) {
    if (imgEl) imgEl.hidden = true;
    videoEl.hidden = false;
    if (sourceEl) {
      sourceEl.setAttribute('href', href);
      sourceEl.setAttribute('src', href);
    }
    videoEl.src = href;
    videoEl.load();
    attachPlayButtonToVideo(anchor, videoEl, fallbackLabel, false);
  } else if (imgEl) {
    if (videoEl) videoEl.hidden = true;
    imgEl.hidden = false;
    imgEl.src = href;
    imgEl.alt = fallbackLabel;
  }

  const openItem = (e) => {
    if (e.target.closest('.play-toggle-btn')) return;
    e.preventDefault();
    if (type === 'video' && videoEl) {
      videoEl.pause();
    }
    openLightbox(type, href, fallbackLabel);
  };

  anchor.addEventListener('click', openItem);
  anchor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (type === 'video' && videoEl) {
        videoEl.pause();
      }
      openLightbox(type, href, fallbackLabel);
    }
  });
}

// Faixa de 3 mídias com looping infinito (foto ou vídeo / Boomerang sem som)
let loopStartIndex = 0;

function readLoopItemsFromDom() {
  const container = document.getElementById('loopMediaSources');
  if (!container) return [];
  const anchors = Array.from(container.querySelectorAll('a'));
  return anchors.map((anchor, i) => ({
    href: getCleanHref(anchor),
    type: detectMediaType(getCleanHref(anchor), anchor.getAttribute('data-media-type')),
    label: anchor.getAttribute('data-label') || anchor.textContent.trim() || `Momento ${i + 1}`
  }));
}

function renderLoopGrid() {
  const grid = document.getElementById('loopingThreeGrid');
  const status = document.getElementById('loopStatus');
  const items = readLoopItemsFromDom();
  const total = items.length;

  if (!grid || total === 0) return;
  grid.innerHTML = '';

  for (let offset = 0; offset < 3; offset++) {
    const idx = (loopStartIndex + offset) % total;
    const item = items[idx];

    const slotWrapper = document.createElement('div');
    slotWrapper.className = 'mini-slot';

    const frame = document.createElement('a');
    frame.className = 'mini-frame';
    frame.setAttribute('href', item.href || '#');
    frame.setAttribute('aria-label', item.label);

    if (item.href) {
      frame.innerHTML = createGridMediaElement(item);
      const vid = frame.querySelector('video');
      if (vid) {
        configureAutoplayBoomerang(vid, item.href);
      }
      frame.addEventListener('click', (e) => {
        e.preventDefault();
        if (vid) vid.pause();
        openLightbox(item.type, item.href, item.label);
      });
    } else {
      frame.innerHTML = `<div class="mini-placeholder">${item.label}<br/>Foto/Vídeo</div>`;
      frame.addEventListener('click', (e) => e.preventDefault());
    }

    slotWrapper.appendChild(frame);
    grid.appendChild(slotWrapper);
  }

  const currentPos = (loopStartIndex % total) + 1;
  if (status) {
    status.textContent = `Início ${currentPos} de ${total} (Loop)`;
  }
}

const prevLoopBtn = document.getElementById('prevLoopBtn');
const nextLoopBtn = document.getElementById('nextLoopBtn');

if (prevLoopBtn) {
  prevLoopBtn.addEventListener('click', () => {
    const items = readLoopItemsFromDom();
    const total = items.length;
    if (!total) return;
    loopStartIndex = (loopStartIndex - 1 + total) % total;
    renderLoopGrid();
  });
}

if (nextLoopBtn) {
  nextLoopBtn.addEventListener('click', () => {
    const items = readLoopItemsFromDom();
    const total = items.length;
    if (!total) return;
    loopStartIndex = (loopStartIndex + 1) % total;
    renderLoopGrid();
  });
}

// Grade de 6 mídias paradas (mesmo estilo das 3, sem looping/carrossel)
function readSixItemsFromDom() {
  const container = document.getElementById('sixMediaSources');
  if (!container) return [];
  const anchors = Array.from(container.querySelectorAll('a'));
  return anchors.map((anchor, i) => ({
    href: getCleanHref(anchor),
    type: detectMediaType(getCleanHref(anchor), anchor.getAttribute('data-media-type')),
    label: anchor.getAttribute('data-label') || anchor.textContent.trim() || `Lembrança ${i + 1}`
  }));
}

function renderSixGrid() {
  const grid = document.getElementById('fixedSixGrid');
  const items = readSixItemsFromDom();
  if (!grid) return;
  grid.innerHTML = '';

  items.forEach((item) => {
    const slotWrapper = document.createElement('div');
    slotWrapper.className = 'mini-slot';

    const frame = document.createElement('a');
    frame.className = 'mini-frame';
    frame.setAttribute('href', item.href || '#');
    frame.setAttribute('aria-label', item.label);

    if (item.href) {
      frame.innerHTML = createGridMediaElement(item);
      const vid = frame.querySelector('video');
      if (vid) {
        configureAutoplayBoomerang(vid, item.href);
      }
      frame.addEventListener('click', (e) => {
        e.preventDefault();
        if (vid) vid.pause();
        openLightbox(item.type, item.href, item.label);
      });
    } else {
      frame.innerHTML = `<div class="mini-placeholder">${item.label}<br/>Foto/Vídeo</div>`;
      frame.addEventListener('click', (e) => e.preventDefault());
    }

    slotWrapper.appendChild(frame);
    grid.appendChild(slotWrapper);
  });
}

// =========================================================================
// 2B. MÚSICA DO SITE TODO + TROCA APENAS NA PARTE DAS TRÊS MÍDIAS EM LOOP
// =========================================================================
const siteAudio = document.getElementById('siteAudio');
const momentosSection =
  document.getElementById('nossosMomentosSection') ||
  (document.getElementById('loopingThreeGrid')
    ? document.getElementById('loopingThreeGrid').closest('section')
    : null);
const momentosAudio = document.getElementById('momentosAudio');

let hasUserInteracted = false;
let isHoveringLoopSection = false;
let isViewingLoopSection = false;
let isLightboxOpen = false;

async function startAudioIfNeeded(audioEl) {
  if (!audioEl || !hasUserInteracted) return;
  audioEl.muted = false;
  audioEl.volume = 1.0;
  if (audioEl.paused) {
    try {
      await audioEl.play();
    } catch (err) {
      // Ignora bloqueio temporário do navegador
    }
  }
}

async function pauseAudioIfPlaying(audioEl) {
  if (audioEl && !audioEl.paused) {
    audioEl.pause();
  }
}

async function syncSiteAndLoopMusic() {
  if (!siteAudio && !momentosAudio) return;

  if (document.hidden || isLightboxOpen) {
    await pauseAudioIfPlaying(siteAudio);
    await pauseAudioIfPlaying(momentosAudio);
    return;
  }

  if (!hasUserInteracted) return;

  const inLoopPart = isHoveringLoopSection || isViewingLoopSection;

  if (inLoopPart && momentosAudio) {
    await pauseAudioIfPlaying(siteAudio);
    await startAudioIfNeeded(momentosAudio);
  } else {
    await pauseAudioIfPlaying(momentosAudio);
    await startAudioIfNeeded(siteAudio);
  }
}

if (siteAudio) {
  siteAudio.addEventListener('error', () => {
    console.warn('Não foi possível carregar a música principal do site:', siteAudio.currentSrc);
  });
}

if (momentosAudio) {
  momentosAudio.addEventListener('error', () => {
    console.warn('Não foi possível carregar a música da parte das 3 mídias:', momentosAudio.currentSrc);
  });
}

if (momentosSection) {
  momentosSection.addEventListener('mouseenter', () => {
    isHoveringLoopSection = true;
    syncSiteAndLoopMusic();
  });

  momentosSection.addEventListener('pointermove', () => {
    isHoveringLoopSection = true;
    syncSiteAndLoopMusic();
  });

  momentosSection.addEventListener('mouseleave', () => {
    isHoveringLoopSection = false;
    syncSiteAndLoopMusic();
  });

  if ('IntersectionObserver' in window) {
    const loopSectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isViewingLoopSection = entry.isIntersecting && entry.intersectionRatio >= 0.35;
          syncSiteAndLoopMusic();
        });
      },
      { threshold: [0, 0.35, 0.6] }
    );
    loopSectionObserver.observe(momentosSection);
  }
}

['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach((evtName) => {
  window.addEventListener(
    evtName,
    () => {
      hasUserInteracted = true;
      replayAllGridBoomerangs();
      syncSiteAndLoopMusic();
    },
    { passive: true }
  );
});

document.addEventListener('visibilitychange', () => {
  replayAllGridBoomerangs();
  syncSiteAndLoopMusic();
});

// =========================================================================
// 3. LIGHTBOX PARA FOTO COMPLETA OU VÍDEO COM SOM
// =========================================================================
const lightbox = document.getElementById('lightbox');
const lightboxBadge = document.getElementById('lightboxBadge');
const lightboxMediaContainer = document.getElementById('lightboxMediaContainer');
const closeLightboxBtn = document.getElementById('closeLightboxBtn');

function openLightbox(type, url, label = '') {
  if (!url) return;
  isLightboxOpen = true;
  pauseAllInlineVideos();
  syncSiteAndLoopMusic();
  lightboxMediaContainer.innerHTML = '';

  if (type === 'video') {
    lightboxBadge.textContent = label ? `${label} • Com Som` : 'Vídeo com Som';
    const videoEl = document.createElement('video');
    videoEl.src = url;
    videoEl.controls = true;
    videoEl.autoplay = true;
    videoEl.muted = false;
    videoEl.defaultMuted = false;
    videoEl.volume = 1.0;
    videoEl.playsInline = true;
    videoEl.setAttribute('playsinline', '');
    lightboxMediaContainer.appendChild(videoEl);

    const playPromise = videoEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        videoEl.muted = false;
      });
    }
  } else {
    lightboxBadge.textContent = label ? `${label} • Foto Completa` : 'Foto Completa';
    const imgEl = document.createElement('img');
    imgEl.src = url;
    imgEl.alt = label || 'Foto completa';
    lightboxMediaContainer.appendChild(imgEl);
  }

  lightbox.classList.add('open');
}

function closeLightbox() {
  const activeVideo = lightboxMediaContainer.querySelector('video');
  if (activeVideo) {
    activeVideo.pause();
    activeVideo.src = '';
  }
  isLightboxOpen = false;
  lightbox.classList.remove('open');
  lightboxMediaContainer.innerHTML = '';
  replayAllGridBoomerangs();
  syncSiteAndLoopMusic();
}

closeLightboxBtn.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('open')) {
    closeLightbox();
  }
});

initSoloAnchorFrame('frame-solo-1', 'Vídeo 1');
initSoloAnchorFrame('frame-solo-2', 'Mídia 2');
renderLoopGrid();
renderSixGrid();