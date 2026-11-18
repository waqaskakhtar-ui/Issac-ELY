/**
 * Isaac Ely — Unified VERO Single-Scroll Engine
 * Powers:
 *  0. Local Lenis weighted luxury smooth scrolling (exact VERO easing & feel)
 *  1. Adaptive Editorial Header (dark glass over Hero/Wipe <-> warm alabaster over light sections)
 *  2. Intro top-veil parallax
 *  3. Essence expanding portal -> full-bleed 3-stage right-to-left wipe
 *  4. 5-Column museum gallery symmetrical scroll-velocity arch parallax & sticky pill morph
 *  5. Monumental 5-line bespoke quote + 3D extruded rotating Isaac Ely medallion parting text
 *  6. Studio newsletter form micro-feedback
 */

import Lenis from './lenis.js';

const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export class EditorialScrollController {
  constructor() {
    this.lenis = null;
    this.essenceIsFullBleed = false;

    this.initLenis();
    this.initAdaptiveHeader();
    this.initIntroParallax();
    this.initEssenceShowcase();
    this.initGalleryParallax();
    this.initQuoteCoin();
    this.initFooterNewsletter();
  }

  /* ------------------------------------------------------------------------
     0. Local Lenis Weighted Luxury Smooth Scrolling (Exact VERO Physics)
     ------------------------------------------------------------------------ */
  initLenis() {
    try {
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.92,
      });

      this.lenis = lenis;
      window.__ieLenis = lenis;

      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);

      // Pause Lenis cleanly while modals/drawers lock body scroll
      const syncOverflowLock = () => {
        const locked =
          document.body.classList.contains('loading-locked') ||
          document.body.style.overflow === 'hidden';
        if (locked) lenis.stop();
        else lenis.start();
      };

      const observer = new MutationObserver(syncOverflowLock);
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'style'],
      });
      syncOverflowLock();

      // Upgrade in-page anchor navigation to Lenis weighted glide
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
          const href = anchor.getAttribute('href');
          if (!href || href === '#' || href === '#private-consultation') return;
          const target = document.querySelector(href);
          if (!target) return;
          e.preventDefault();
          e.stopImmediatePropagation();
          lenis.scrollTo(target, { offset: 0, duration: 1.35 });
        }, true);
      });
    } catch (err) {
      console.warn('Lenis smooth scroll fallback:', err);
    }
  }

  /* ------------------------------------------------------------------------
     1. Adaptive Header Theme (Dark over Hero / Full-Bleed Wipe, Alabaster over Light)
     ------------------------------------------------------------------------ */
  initAdaptiveHeader() {
    const header = document.getElementById('site-header');
    const hero = document.getElementById('hero-scroll-track');
    if (!header || !hero) return;

    let rafId = null;
    const update = () => {
      rafId = null;
      const heroRect = hero.getBoundingClientRect();
      const overHero = heroRect.bottom > 64;
      const onLight = !overHero && !this.essenceIsFullBleed;
      header.classList.toggle('header--on-light', onLight);
    };

    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    this._syncHeaderTheme = update;
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
  }

  /* ------------------------------------------------------------------------
     2. Intro Top Veil Parallax
     ------------------------------------------------------------------------ */
  initIntroParallax() {
    const img = document.getElementById('ie-intro-veil-img');
    if (!img) return;
    let rafId = null;

    const update = () => {
      rafId = null;
      const rect = img.parentElement.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;
      const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      img.style.transform = `translate3d(0, ${(progress - 0.5) * 30}px, 0)`;
    };

    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
  }

  /* ------------------------------------------------------------------------
     3. Essence Expanding Portal -> Pinned 3-Stage Right-to-Left Wipe
     ------------------------------------------------------------------------ */
  initEssenceShowcase() {
    const track = document.getElementById('services');
    const header = document.getElementById('ie-essence-header');
    const portal = document.getElementById('ie-essence-portal');
    const slide2 = document.getElementById('ie-essence-slide-2');
    const slide3 = document.getElementById('ie-essence-slide-3');
    const dotsWrap = document.getElementById('ie-essence-dots');
    const caption = document.getElementById('ie-essence-caption');
    const scrim = document.getElementById('ie-essence-scrim');
    if (!track || !portal) return;

    const dotBtns = Array.from(document.querySelectorAll('.ie-essence-dot-btn'));
    const phrases = Array.from(document.querySelectorAll('.ie-essence-phrase'));
    let activeStage = -1;
    let rafId = null;

    const setStage = (stage) => {
      if (stage === activeStage) return;
      activeStage = stage;
      dotBtns.forEach((b, i) => b.classList.toggle('is-active', i === stage));
      phrases.forEach((p, i) => p.classList.toggle('is-active', i === stage));
    };

    const jumpToStage = (stageIdx) => {
      const trackTop = track.getBoundingClientRect().top + window.scrollY;
      const scrollable = track.offsetHeight - window.innerHeight;
      const fractions = [0.32, 0.61, 0.92];
      const targetY = trackTop + scrollable * fractions[stageIdx];
      if (this.lenis) {
        this.lenis.scrollTo(targetY, { duration: 1.25 });
      } else {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    };

    dotBtns.forEach((btn, i) => btn.addEventListener('click', () => jumpToStage(i)));
    phrases.forEach((el, i) => el.addEventListener('click', () => jumpToStage(i)));

    const update = () => {
      rafId = null;
      const rect = track.getBoundingClientRect();
      const scrollable = track.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const p = clamp(-rect.top / scrollable, 0, 1);

      // Phase 1: Expanding portal (0.0 -> 0.28)
      const expandT = easeInOutCubic(clamp(p / 0.28, 0, 1));
      const topInset = 64 * (1 - expandT);
      const sideInset = 43.5 * (1 - expandT);
      const bottomInset = 11 * (1 - expandT);
      portal.style.clipPath = `inset(${topInset.toFixed(3)}% ${sideInset.toFixed(3)}% ${bottomInset.toFixed(3)}% ${sideInset.toFixed(3)}%)`;

      // Inform adaptive header whether full-bleed dark photography is behind top bar
      const inFullBleed = expandT > 0.86 && rect.bottom > 64;
      if (inFullBleed !== this.essenceIsFullBleed) {
        this.essenceIsFullBleed = inFullBleed;
        if (this._syncHeaderTheme) this._syncHeaderTheme();
      }

      if (header) {
        const headerFade = 1 - clamp((expandT - 0.55) / 0.35, 0, 1);
        header.style.opacity = `${headerFade}`;
        header.style.transform = `translate3d(0, ${(-expandT * 26).toFixed(2)}px, 0)`;
      }

      // Chrome fade-in (dots, caption, scrim) once full-bleed
      const chromeT = easeOutCubic(clamp((p - 0.26) / 0.07, 0, 1));
      if (dotsWrap) dotsWrap.style.opacity = `${chromeT}`;
      if (scrim) scrim.style.opacity = `${chromeT}`;
      if (caption) {
        caption.style.opacity = `${chromeT}`;
        caption.style.transform = `translate3d(0, ${((1 - chromeT) * 28).toFixed(2)}px, 0)`;
      }

      // Phase 2: Right-to-left wipe of BASTED FITTING over PATTERN (0.37 -> 0.58)
      const wipe1 = easeInOutCubic(clamp((p - 0.37) / 0.21, 0, 1));
      if (slide2) {
        slide2.style.clipPath = `inset(0% 0% 0% ${((1 - wipe1) * 100).toFixed(3)}%)`;
      }

      // Phase 3: Right-to-left wipe of BESPOKE GARMENT over BASTED FITTING (0.67 -> 0.88)
      const wipe2 = easeInOutCubic(clamp((p - 0.67) / 0.21, 0, 1));
      if (slide3) {
        slide3.style.clipPath = `inset(0% 0% 0% ${((1 - wipe2) * 100).toFixed(3)}%)`;
      }

      const nextStage = wipe2 > 0.22 ? 2 : wipe1 > 0.22 ? 1 : 0;
      setStage(nextStage);
    };

    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
  }

  /* ------------------------------------------------------------------------
     4. 5-Column Museum Gallery Symmetrical Arch Parallax & Sticky Pill
     ------------------------------------------------------------------------ */
  initGalleryParallax() {
    const stage = document.getElementById('ie-gallery-stage');
    const pill = document.getElementById('ie-gallery-pill');
    const cols = Array.from(document.querySelectorAll('.ie-gallery-col'));
    if (!stage || cols.length === 0) return;

    const weights = [0, 0.5, 1.0, 0.5, 0];
    let lastY = window.scrollY;
    let smoothVel = 0;
    let rafId = null;

    const tick = () => {
      const y = window.scrollY;
      const rawVel = y - lastY;
      lastY = y;

      smoothVel += (rawVel - smoothVel) * 0.12;
      const offset = Math.max(-34, Math.min(34, smoothVel * 0.92));

      cols.forEach((col, i) => {
        const w = weights[i] ?? 0;
        col.style.transform = `translate3d(0, ${(-offset * w).toFixed(2)}px, 0)`;
      });

      if (pill) {
        const rect = stage.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = (vh * 0.5 - rect.top) / Math.max(1, rect.height);
        let state = 'blank';
        if (progress >= 0.88) state = 'brand';
        else if (progress >= 0.14) state = 'explore';
        if (pill.dataset.state !== state) pill.dataset.state = state;
      }

      if (Math.abs(smoothVel) > 0.05) {
        rafId = requestAnimationFrame(tick);
      } else {
        cols.forEach((col) => {
          col.style.transform = 'translate3d(0, 0px, 0)';
        });
        rafId = null;
      }
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------------
     5. Monumental Bespoke Poem + 3D Rotating Medallion Parting Text
     ------------------------------------------------------------------------ */
  initQuoteCoin() {
    const stage = document.getElementById('ie-quote-coin-stage');
    const coinLayer = document.getElementById('ie-coin-layer');
    const coin3d = document.getElementById('ie-coin-3d');
    const sheenFront = document.getElementById('ie-coin-sheen-front');
    const sheenBack = document.getElementById('ie-coin-sheen-back');
    const lines = Array.from(document.querySelectorAll('.ie-poem-line'));
    if (!stage || !coinLayer || !coin3d || lines.length === 0) return;

    let rafId = null;

    const update = () => {
      rafId = null;
      const rect = stage.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const stageH = rect.height;

      const p = clamp((vh * 0.62 - rect.top) / (stageH + vh * 0.24), 0, 1);
      const coinH = coin3d.offsetHeight || 240;

      const minY = -coinH * 0.45;
      const maxY = stageH - coinH * 0.55;
      const coinCenterY = minY + p * (maxY - minY) + coinH * 0.5;
      const coinTopY = coinCenterY - coinH * 0.5;

      coinLayer.style.transform = `translate3d(-50%, ${coinTopY.toFixed(2)}px, 0)`;

      const rotY = -98 + p * 392;
      const rotX = Math.sin(p * Math.PI * 2) * 7;
      const rotZ = Math.cos(p * Math.PI * 1.5) * 4;
      coin3d.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg)`;

      const sheenAngle = 115 + Math.sin((rotY * Math.PI) / 180) * 55;
      const sheenGrad = `linear-gradient(${sheenAngle.toFixed(1)}deg, transparent 22%, rgba(255,255,255,0.5) 48%, transparent 72%)`;
      if (sheenFront) sheenFront.style.background = sheenGrad;
      if (sheenBack) sheenBack.style.background = sheenGrad;

      const maxHalfGap = clamp(vw * 0.125, 76, 205);
      const edgeFactor = 0.72 + 0.28 * Math.abs(Math.cos((rotY * Math.PI) / 180));
      const sigma = Math.max(125, coinH * 0.72);

      lines.forEach((lineEl) => {
        const lineCenterY = lineEl.offsetTop + lineEl.offsetHeight * 0.5;
        const dy = coinCenterY - lineCenterY;
        const influence = Math.exp(-(dy * dy) / (2 * sigma * sigma));
        const shift = maxHalfGap * edgeFactor * influence;

        const leftHalf = lineEl.querySelector('.ie-poem-half--left');
        const rightHalf = lineEl.querySelector('.ie-poem-half--right');
        if (leftHalf) leftHalf.style.transform = `translate3d(${(-shift).toFixed(2)}px, 0, 0)`;
        if (rightHalf) rightHalf.style.transform = `translate3d(${shift.toFixed(2)}px, 0, 0)`;
      });
    };

    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
  }

  /* ------------------------------------------------------------------------
     6. Footer Atelier Newsletter Micro-Feedback
     ------------------------------------------------------------------------ */
  initFooterNewsletter() {
    const form = document.getElementById('ie-footer-newsletter-form');
    const input = document.getElementById('ie-footer-email');
    const thanks = document.getElementById('ie-footer-thanks');
    if (!form || !input || !thanks) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!input.value.trim()) return;
      thanks.hidden = false;
      input.value = '';
    });
  }
}
