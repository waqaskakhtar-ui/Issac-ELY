/**
 * Isaac Ely — Luxury Navigation & Mega-Menu System
 * Controls glassmorphic elevation, desktop mega-panels, and mobile offcanvas drawer.
 */

export class NavigationController {
  constructor() {
    this.header = document.querySelector('#site-header');
    this.navLinks = document.querySelectorAll('.nav-link, .mobile-link');
    this.megaToggles = document.querySelectorAll('[data-mega-toggle]');
    this.mobileToggle = document.querySelector('#mobile-menu-toggle');
    this.mobileClose = document.querySelector('#mobile-menu-close');
    this.mobileDrawer = document.querySelector('#mobile-drawer');
    this.mobileBackdrop = document.querySelector('#mobile-backdrop');
    this.mobileSubToggles = document.querySelectorAll('[data-mobile-sub]');
    this.mobileBackButtons = document.querySelectorAll('[data-mobile-back]');

    this.init();
  }

  init() {
    this.bindScroll();
    this.bindDesktopMegaMenus();
    this.bindMobileDrawer();
    this.bindSmoothScroll();
  }

  bindScroll() {
    if (!this.header) return;

    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > 60) {
        this.header.classList.add('header--scrolled');
      } else {
        this.header.classList.remove('header--scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  bindDesktopMegaMenus() {
    this.megaToggles.forEach(toggle => {
      const targetId = toggle.getAttribute('data-mega-toggle');
      const panel = document.getElementById(targetId);
      const parent = toggle.closest('.nav-item--has-mega');

      if (!panel || !parent) return;

      let timeoutId = null;

      const openMenu = () => {
        clearTimeout(timeoutId);
        // Close others
        document.querySelectorAll('.mega-panel.is-active').forEach(p => {
          if (p !== panel) p.classList.remove('is-active');
        });
        document.querySelectorAll('.nav-item--has-mega.is-open').forEach(item => {
          if (item !== parent) item.classList.remove('is-open');
        });

        panel.classList.add('is-active');
        parent.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      };

      const closeMenu = () => {
        timeoutId = setTimeout(() => {
          panel.classList.remove('is-active');
          parent.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }, 150);
      };

      parent.addEventListener('mouseenter', openMenu);
      parent.addEventListener('mouseleave', closeMenu);

      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = panel.classList.contains('is-active');
        if (isOpen) {
          panel.classList.remove('is-active');
          parent.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        } else {
          openMenu();
        }
      });
    });

    // Close mega panels when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-item--has-mega') && !e.target.closest('.mega-panel')) {
        document.querySelectorAll('.mega-panel.is-active').forEach(p => p.classList.remove('is-active'));
        document.querySelectorAll('.nav-item--has-mega.is-open').forEach(i => i.classList.remove('is-open'));
      }
    });
  }

  bindMobileDrawer() {
    if (!this.mobileDrawer || !this.mobileToggle) return;

    const openDrawer = () => {
      this.mobileDrawer.classList.add('is-open');
      if (this.mobileBackdrop) this.mobileBackdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      this.mobileToggle.setAttribute('aria-expanded', 'true');
    };

    const closeDrawer = () => {
      this.mobileDrawer.classList.remove('is-open');
      if (this.mobileBackdrop) this.mobileBackdrop.classList.remove('is-open');
      document.body.style.overflow = '';
      this.mobileToggle.setAttribute('aria-expanded', 'false');

      // Reset sub-views
      document.querySelectorAll('.mobile-sub-view').forEach(view => {
        view.classList.remove('is-active');
      });
      const rootView = document.querySelector('#mobile-root-view');
      if (rootView) rootView.classList.add('is-active');
    };

    this.mobileToggle.addEventListener('click', openDrawer);
    if (this.mobileClose) this.mobileClose.addEventListener('click', closeDrawer);
    if (this.mobileBackdrop) this.mobileBackdrop.addEventListener('click', closeDrawer);

    // Mobile sub-menus
    this.mobileSubToggles.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetViewId = btn.getAttribute('data-mobile-sub');
        const targetView = document.getElementById(targetViewId);
        const rootView = document.querySelector('#mobile-root-view');

        if (targetView && rootView) {
          rootView.classList.remove('is-active');
          targetView.classList.add('is-active');
        }
      });
    });

    this.mobileBackButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentView = btn.closest('.mobile-sub-view');
        const rootView = document.querySelector('#mobile-root-view');
        if (currentView && rootView) {
          currentView.classList.remove('is-active');
          rootView.classList.add('is-active');
        }
      });
    });

    // Close on navigation link click
    this.mobileDrawer.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });
  }

  bindSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#' || href === '#private-consultation') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerHeight = this.header ? this.header.offsetHeight : 0;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}
