/**
 * Isaac Ely — Signature Scroll-Driven Suit Construction Engine
 * Controls the 151-frame cinematic suit-assembly canvas synchronized directly with scroll progress.
 */

export class HeroCanvasAnimation {
  constructor(options = {}) {
    this.container = document.querySelector(options.container || '#hero-scroll-track');
    this.stickyViewport = document.querySelector(options.stickyViewport || '#hero-sticky-viewport');
    this.canvas = document.querySelector(options.canvas || '#suit-canvas');
    this.initialOverlay = document.querySelector(options.initialOverlay || '#hero-initial-overlay');
    this.finalOverlay = document.querySelector(options.finalOverlay || '#hero-final-overlay');
    this.stitchMeter = document.querySelector(options.stitchMeter || '#stitch-progress-meter');
    this.stitchPercent = document.querySelector(options.stitchPercent || '#stitch-percent-text');
    this.preloader = document.querySelector(options.preloader || '#site-preloader');
    this.preloaderBar = document.querySelector(options.preloaderBar || '#preloader-progress-bar');
    this.preloaderText = document.querySelector(options.preloaderText || '#preloader-progress-text');

    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.totalFrames = 151;
    this.startFrame = options.startFrame !== undefined ? options.startFrame : 20;
    this.images = [];
    this.loadedImagesCount = 0;
    this.isReady = false;

    // Scroll interpolation
    this.targetProgress = 0;
    this.currentProgress = 0;
    this.lastRenderedFrame = -1;
    this.animationFrameId = null;

    this.init();
  }

  init() {
    if (!this.canvas || !this.ctx || !this.container) {
      console.warn('Hero canvas elements not found');
      return;
    }

    this.setupCanvasSize();
    this.bindEvents();
    this.preloadFrames();
  }

  setupCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.stickyViewport.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Scale context to account for DPR
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Re-draw current frame if available
    if (this.isReady) {
      const frameToDraw = this.lastRenderedFrame >= 0 ? this.lastRenderedFrame : this.startFrame;
      this.drawFrame(frameToDraw);
    }
  }

  preloadFrames() {
    const frameBase = 'assets/frames/frame_';
    const pad = (n) => String(n).padStart(6, '0');

    let loaded = 0;
    let unlocked = false;

    const unlockPage = () => {
      if (unlocked) return;
      unlocked = true;
      this.isReady = true;
      this.drawFrame(this.startFrame);
      this.lastRenderedFrame = this.startFrame;

      if (this.preloader) {
        this.preloader.classList.add('preloader--hidden');
        setTimeout(() => {
          this.preloader.style.display = 'none';
        }, 600);
      }
      document.body.classList.remove('loading-locked');
      this.startRenderLoop();
    };

    // Safety fallback: unlock after 1.8s regardless of network delays
    setTimeout(unlockPage, 1800);

    const onFrameLoad = () => {
      loaded++;
      this.loadedImagesCount = loaded;
      const pct = Math.round((loaded / this.totalFrames) * 100);

      if (this.preloaderBar) {
        this.preloaderBar.style.width = `${pct}%`;
      }
      if (this.preloaderText) {
        this.preloaderText.textContent = `${pct}%`;
      }

      // Fast progressive unlock once start frame and initial buffer are ready
      if (this.images[this.startFrame]?.complete && loaded >= 12 && !unlocked) {
        unlockPage();
      }

      if (loaded >= this.totalFrames) {
        this.isReady = true;
      }
    };

    for (let i = 0; i < this.totalFrames; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.onload = onFrameLoad;
      img.onerror = () => {
        console.warn(`Frame ${i} failed to load, substituting`);
        onFrameLoad();
      };
      this.images.push(img);
    }

    // Prioritize loading starting frame first for instant paint
    this.images[this.startFrame].src = `${frameBase}${pad(this.startFrame)}.jpg`;
    for (let i = 0; i < this.totalFrames; i++) {
      if (i !== this.startFrame) {
        this.images[i].src = `${frameBase}${pad(i)}.jpg`;
      }
    }
  }

  onAllFramesLoaded() {
    this.isReady = true;
    this.drawFrame(this.startFrame);

    // Smoothly reveal the page
    setTimeout(() => {
      if (this.preloader) {
        this.preloader.classList.add('preloader--hidden');
        setTimeout(() => {
          this.preloader.style.display = 'none';
        }, 800);
      }
      document.body.classList.remove('loading-locked');
    }, 400);

    // Start RAF rendering loop
    this.startRenderLoop();
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.setupCanvasSize();
      this.onScroll();
    }, { passive: true });

    window.addEventListener('scroll', () => {
      this.onScroll();
    }, { passive: true });

    // Initial check
    this.onScroll();
  }

  onScroll() {
    if (!this.container) return;

    const rect = this.container.getBoundingClientRect();
    const scrollHeight = this.container.offsetHeight - window.innerHeight;

    if (scrollHeight <= 0) return;

    // Calculate progress through hero track: 0.0 to 1.0
    const rawProgress = -rect.top / scrollHeight;
    this.targetProgress = Math.max(0, Math.min(1, rawProgress));
  }

  startRenderLoop() {
    const render = () => {
      // Smooth lerp for liquid-luxury response
      const lerpSpeed = 0.14;
      this.currentProgress += (this.targetProgress - this.currentProgress) * lerpSpeed;

      // Frame mapping:
      // 0% -> Frame startFrame (e.g. 20)
      // 0% - 85% -> Frames startFrame to 150 (stitching & assembly)
      // 85% - 100% -> Frame 150 held for the dramatic final reveal
      const endFrame = this.totalFrames - 1;
      let frameIndex = this.startFrame;
      if (this.currentProgress < 0.85) {
        const assemblyProgress = this.currentProgress / 0.85;
        frameIndex = Math.min(endFrame, Math.floor(this.startFrame + assemblyProgress * (endFrame - this.startFrame)));
      } else {
        frameIndex = endFrame;
      }

      if (frameIndex !== this.lastRenderedFrame && this.images[frameIndex]?.complete) {
        this.drawFrame(frameIndex);
        this.lastRenderedFrame = frameIndex;
      }

      this.updateOverlays(this.currentProgress);

      this.animationFrameId = requestAnimationFrame(render);
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  drawFrame(index) {
    const img = this.images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = this.canvas.width / dpr;
    const canvasHeight = this.canvas.height / dpr;

    // Clear canvas
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Full-bleed edge-to-edge cover calculation (eliminates left/right blank pillarbox bars on all aspect ratios)
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      // Wide viewport: fill 100% width edge-to-edge and center suit + floor signature vertically
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) * 0.44;
    } else {
      // Tall viewport: fill 100% height edge-to-edge and center horizontally
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    }

    // High quality rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  updateOverlays(progress) {
    // 1. Initial State Overlay (0% to ~25% scroll)
    // Visible at 0%, gracefully fades out with subtle upward translate
    if (this.initialOverlay) {
      if (progress <= 0.02) {
        this.initialOverlay.style.opacity = '1';
        this.initialOverlay.style.transform = 'translateY(0px)';
        this.initialOverlay.style.pointerEvents = 'auto';
      } else if (progress < 0.22) {
        const fade = 1 - (progress - 0.02) / 0.18;
        this.initialOverlay.style.opacity = `${Math.max(0, fade)}`;
        this.initialOverlay.style.transform = `translateY(-${(1 - fade) * 40}px)`;
        this.initialOverlay.style.pointerEvents = fade > 0.4 ? 'auto' : 'none';
      } else {
        this.initialOverlay.style.opacity = '0';
        this.initialOverlay.style.pointerEvents = 'none';
      }
    }

    // 2. Final State Overlay (75% to 100% scroll reveal)
    // Refined reveal: "THE ART OF INDIVIDUAL TAILORING."
    if (this.finalOverlay) {
      if (progress >= 0.75) {
        const fade = Math.min(1, (progress - 0.75) / 0.12);
        this.finalOverlay.style.opacity = `${fade}`;
        this.finalOverlay.style.transform = `translateY(${(1 - fade) * 24}px)`;
        this.finalOverlay.style.pointerEvents = fade > 0.5 ? 'auto' : 'none';
      } else {
        this.finalOverlay.style.opacity = '0';
        this.finalOverlay.style.pointerEvents = 'none';
      }
    }

    // 3. Precision Stitch Progress Meter
    if (this.stitchMeter && this.stitchPercent) {
      const displayPct = Math.round(progress * 100);
      this.stitchPercent.textContent = `${displayPct}%`;
      this.stitchMeter.style.setProperty('--stitch-progress', `${progress * 100}%`);

      if (progress > 0.02 && progress < 0.98) {
        this.stitchMeter.classList.add('visible');
      } else {
        this.stitchMeter.classList.remove('visible');
      }
    }
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
