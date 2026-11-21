(function () {
  'use strict';
  document.documentElement.setAttribute('data-design', 'obsidian');
  try { localStorage.removeItem('alif_design_variant'); } catch (e) {}

  function mountGirih() {
    if (document.getElementById('alifGirihBg')) return;
    var bg = document.createElement('div');
    bg.id = 'alifGirihBg';
    bg.className = 'alif-girih-bg';
    bg.setAttribute('aria-hidden', 'true');

    var vig = document.createElement('div');
    vig.className = 'alif-girih-vignette';
    vig.setAttribute('aria-hidden', 'true');

    document.body.insertBefore(vig, document.body.firstChild);
    document.body.insertBefore(bg, document.body.firstChild);

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            var y = (window.scrollY * -0.08) % 160;
            bg.style.transform = 'translate3d(0, ' + y.toFixed(1) + 'px, 0)';
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  }

  if (document.body) mountGirih();
  else window.addEventListener('DOMContentLoaded', mountGirih);
})();
