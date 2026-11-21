(function () {
  'use strict';
  document.documentElement.removeAttribute('data-design');
  try { localStorage.removeItem('alif_design_variant'); } catch (e) {}

  function initVisualFX() {
    // 1. Sokin mikro-nuqtali orqa fon va suzuvchi nur auralari
    if (!document.getElementById('alifAmbientBg')) {
      var bg = document.createElement('div');
      bg.id = 'alifAmbientBg';
      bg.className = 'alif-ambient-bg';
      bg.setAttribute('aria-hidden', 'true');
      bg.innerHTML =
        '<div class="alif-ambient-orb alif-ambient-orb--1"></div>' +
        '<div class="alif-ambient-orb alif-ambient-orb--2"></div>' +
        '<div class="alif-ambient-orb alif-ambient-orb--3"></div>';
      document.body.insertBefore(bg, document.body.firstChild);
    }

    // 2. Barcha tugmalarda bosilgan joydan tarqaluvchi Ripple to'lqini
    document.addEventListener('pointerdown', function (e) {
      var btn = e.target.closest('button, .alif-hero-btn-primary, .alif-hero-btn-secondary, .alif-doc-tab, .alif-doc-sbtn, .alif-doc-scbtn, #alifDesktopApp a');
      if (!btn) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement('span');
      ripple.className = 'alif-ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 600);
    }, { passive: true });

    // 3. GSAP orqali qo'shimcha ravon kartochka va tugma animatsiyalari
    if (window.gsap && window.ScrollTrigger && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.gsap.utils.toArray('.alif-doc-form-card, .alif-doc-preview-card, .alif-bm-card').forEach(function (card) {
        window.gsap.from(card, {
          opacity: 0,
          y: 22,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 86%',
            once: true
          }
        });
      });
    }
  }

  if (document.body) initVisualFX();
  else window.addEventListener('DOMContentLoaded', initVisualFX);
})();
