/**
 * Isaac Ely — Luxury Service & Anatomy Viewer Drawer
 * Dynamically renders full audited client content, garment anatomy,
 * fabric choices, and FAQs for all 14 bespoke categories.
 */

import { servicesData } from './services-data.js';

export class ServiceViewerController {
  constructor() {
    this.drawer = document.querySelector('#service-viewer-drawer');
    this.backdrop = document.querySelector('#service-viewer-backdrop');
    this.container = document.querySelector('#service-viewer-content');
    this.closeBtn = document.querySelector('#service-viewer-close');
    this.triggers = document.querySelectorAll('[data-service-key]');

    this.init();
  }

  init() {
    this.bindTriggers();
    this.bindClose();
  }

  bindTriggers() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-service-key]');
      if (trigger) {
        e.preventDefault();
        const key = trigger.getAttribute('data-service-key');
        this.openService(key);
      }
    });
  }

  bindClose() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeDrawer());
    }
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.closeDrawer());
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.drawer && this.drawer.classList.contains('is-open')) {
        this.closeDrawer();
      }
    });
  }

  openService(key) {
    const data = servicesData[key];
    if (!data || !this.drawer || !this.container) return;

    this.renderServiceContent(data);
    this.drawer.classList.add('is-open');
    if (this.backdrop) this.backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Scroll drawer to top
    this.drawer.scrollTop = 0;
  }

  closeDrawer() {
    if (!this.drawer) return;
    this.drawer.classList.remove('is-open');
    if (this.backdrop) this.backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  renderServiceContent(data) {
    const paragraphsHtml = data.paragraphs.map(p => `<p class="editorial-drawer__para">${p}</p>`).join('');

    const featuresHtml = data.features && data.features.length > 0
      ? `
        <div class="editorial-drawer__features">
          <h4 class="editorial-drawer__section-title">Distinguishing Craft & Details</h4>
          <div class="features-grid">
            ${data.features.map(f => `
              <div class="feature-item">
                <span class="feature-gold-dash"></span>
                <div>
                  <h5 class="feature-title">${f.title}</h5>
                  <p class="feature-desc">${f.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `
      : '';

    const faqsHtml = data.faqs && data.faqs.length > 0
      ? `
        <div class="editorial-drawer__faqs">
          <h4 class="editorial-drawer__section-title">Frequently Considered Questions</h4>
          <div class="faqs-accordion">
            ${data.faqs.map((faq, idx) => `
              <details class="faq-item" ${idx === 0 ? 'open' : ''}>
                <summary class="faq-question">
                  <span>${faq.q}</span>
                  <span class="faq-icon" aria-hidden="true">+</span>
                </summary>
                <div class="faq-answer">
                  <p>${faq.a}</p>
                </div>
              </details>
            `).join('')}
          </div>
        </div>
      `
      : '';

    this.container.innerHTML = `
      <article class="editorial-drawer-body">
        <header class="editorial-drawer__header">
          <span class="editorial-eyebrow">${data.eyebrow}</span>
          <h2 class="editorial-drawer__title">${data.title}</h2>
          <p class="editorial-drawer__subtitle">${data.subtitle}</p>
        </header>

        <div class="editorial-drawer__media">
          <img src="${data.heroImage}" alt="${data.title}" class="editorial-drawer__img" loading="eager" />
        </div>

        <div class="editorial-drawer__lead-block">
          <p class="editorial-drawer__lead">${data.lead}</p>
        </div>

        <div class="editorial-drawer__copy">
          ${paragraphsHtml}
        </div>

        ${featuresHtml}
        ${faqsHtml}

        <footer class="editorial-drawer__cta-block">
          <div class="editorial-drawer__cta-inner">
            <span class="editorial-eyebrow">Start With A Conversation</span>
            <h3 class="editorial-drawer__cta-heading">Ready to Experience Individual Fit?</h3>
            <p>Every commission begins with a private conversation to understand your physique, posture, and lifestyle.</p>
            <button class="btn btn-gold" data-consultation-open data-prefill-subject="consultation" onclick="document.querySelector('#service-viewer-close').click();">
              Book a Private Consultation
            </button>
          </div>
        </footer>
      </article>
    `;
  }
}
