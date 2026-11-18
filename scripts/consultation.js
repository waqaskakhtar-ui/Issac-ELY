/**
 * Isaac Ely — Luxury Consultation & Appointment Booking Controller
 * Manages modal dialogs, field validation, accessible focus handling,
 * and elegant confirmation receipts.
 */

export class ConsultationController {
  constructor() {
    this.modal = document.querySelector('#consultation-modal');
    this.modalBackdrop = document.querySelector('#consultation-backdrop');
    this.openButtons = document.querySelectorAll('[data-consultation-open]');
    this.closeButtons = document.querySelectorAll('[data-consultation-close]');
    this.modalForm = document.querySelector('#modal-consultation-form');
    this.inpageForm = document.querySelector('#inpage-consultation-form');
    this.successSection = document.querySelector('#consultation-success-view');

    this.init();
  }

  init() {
    this.bindTriggers();
    this.bindForms();
    this.bindKeyboard();
  }

  bindTriggers() {
    this.openButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const prefillSubject = btn.getAttribute('data-prefill-subject') || '';
        this.openModal(prefillSubject);
      });
    });

    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });

    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', () => this.closeModal());
    }
  }

  openModal(prefillSubject = '') {
    if (!this.modal) return;

    // Reset success state if opened anew
    if (this.successSection && this.modalForm) {
      this.successSection.hidden = true;
      this.modalForm.hidden = false;
      this.modalForm.reset();
    }

    if (prefillSubject) {
      const subjectSelect = this.modal.querySelector('#modal-subject');
      if (subjectSelect) subjectSelect.value = prefillSubject;
    }

    this.modal.classList.add('is-open');
    if (this.modalBackdrop) this.modalBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Focus first input
    const firstInput = this.modal.querySelector('input:not([type="hidden"])');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove('is-open');
    if (this.modalBackdrop) this.modalBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('is-open')) {
        this.closeModal();
      }
    });
  }

  bindForms() {
    if (this.modalForm) {
      this.modalForm.addEventListener('submit', (e) => this.handleSubmit(e, this.modalForm, true));
    }
    if (this.inpageForm) {
      this.inpageForm.addEventListener('submit', (e) => this.handleSubmit(e, this.inpageForm, false));
    }
  }

  handleSubmit(e, form, isModal) {
    e.preventDefault();

    // Check honeypot
    const hp = form.querySelector('input[name="website"]');
    if (hp && hp.value) {
      console.warn('Spam submission detected');
      return;
    }

    const name = form.querySelector('input[name="name"]');
    const email = form.querySelector('input[name="email"]');
    const phone = form.querySelector('input[name="phone"]');
    const subject = form.querySelector('select[name="subject"]');
    const message = form.querySelector('textarea[name="message"]');
    const submitBtn = form.querySelector('button[type="submit"]');

    let isValid = true;

    // Validate Name
    if (!name || !name.value.trim()) {
      this.showFieldError(name, 'Please enter your name.');
      isValid = false;
    } else {
      this.clearFieldError(name);
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.value.trim())) {
      this.showFieldError(email, 'Please enter a valid email address.');
      isValid = false;
    } else {
      this.clearFieldError(email);
    }

    // Validate Subject
    if (!subject || !subject.value) {
      this.showFieldError(subject, 'Please select a subject.');
      isValid = false;
    } else {
      this.clearFieldError(subject);
    }

    // Validate Message
    if (!message || !message.value.trim()) {
      this.showFieldError(message, 'Please provide a message or appointment preference.');
      isValid = false;
    } else {
      this.clearFieldError(message);
    }

    if (!isValid) return;

    // Simulation submission
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="spinner-border" role="status" aria-hidden="true"></span>
      <span>Securing Your Consultation...</span>
    `;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      const receiptId = `IE-${Date.now().toString().slice(-6)}`;
      const clientName = name.value.trim();
      const clientEmail = email.value.trim();

      if (isModal) {
        if (this.modalForm) this.modalForm.hidden = true;
        if (this.successSection) {
          this.successSection.hidden = false;
          const refEl = this.successSection.querySelector('[data-receipt-ref]');
          const nameEl = this.successSection.querySelector('[data-receipt-name]');
          if (refEl) refEl.textContent = receiptId;
          if (nameEl) nameEl.textContent = clientName;
        }
      } else {
        // In-page success notification
        const statusEl = form.querySelector('.form-status-message');
        if (statusEl) {
          statusEl.innerHTML = `
            <div class="luxury-alert-success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B6A58A" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <div>
                <strong>Inquiry Confirmed (Ref: ${receiptId})</strong>
                <p>Thank you, ${clientName}. Isaac Ely will contact you shortly at ${clientEmail} to confirm your appointment time.</p>
              </div>
            </div>
          `;
          form.reset();
        }
      }
    }, 900);
  }

  showFieldError(field, msg) {
    if (!field) return;
    const parent = field.closest('.form-group');
    if (!parent) return;
    parent.classList.add('has-error');
    let errorEl = parent.querySelector('.field-error-text');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'field-error-text';
      parent.appendChild(errorEl);
    }
    errorEl.textContent = msg;
  }

  clearFieldError(field) {
    if (!field) return;
    const parent = field.closest('.form-group');
    if (parent) {
      parent.classList.remove('has-error');
      const errorEl = parent.querySelector('.field-error-text');
      if (errorEl) errorEl.remove();
    }
  }
}
