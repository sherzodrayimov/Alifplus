(function () {
  'use strict';

  var THEME_KEY = 'alif_theme';

  // Eski keshlangan yozuv sozlamasini tozalash
  try { localStorage.removeItem('alif_site_script'); } catch (e) {}
  document.documentElement.removeAttribute('data-site-script');
  document.documentElement.classList.remove('alif-script-pending');

  window.toggleAlifTheme = function () {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  };

  function initNavigation() {
    // Agar eski skriptlar qo'shimcha burger tugma qo'shgan bo'lsa, o'chirib tashlash
    document.querySelectorAll('.alif-nav-burger-label, .alif-burger, [data-legacy-burger]').forEach(function (el) {
      el.remove();
    });

    var menuBtn = document.getElementById('alifMobileMenuBtn');
    var nav = document.getElementById('alifPrimaryNav');
    var closeBtn = document.getElementById('alifDrawerCloseBtn');
    var headerEl = document.querySelector('.alif-topbar');
    var navPlaceholder = document.createComment('alif-nav-anchor');

    if (nav && nav.parentNode) {
      nav.parentNode.insertBefore(navPlaceholder, nav);
    }

    function isMobileViewport() {
      return window.innerWidth <= 860;
    }

    function mountNavToBody() {
      if (nav && nav.parentNode !== document.body) {
        document.body.appendChild(nav);
      }
    }

    function restoreNavToHeader() {
      if (nav && navPlaceholder.parentNode && nav.parentNode !== navPlaceholder.parentNode) {
        navPlaceholder.parentNode.insertBefore(nav, navPlaceholder.nextSibling);
      }
    }

    function openDrawer() {
      if (!nav || !menuBtn) return;
      mountNavToBody();
      nav.classList.add('is-drawer-open');
      nav.setAttribute('aria-hidden', 'false');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', 'Menyuni yopish');
      var labelSpan = menuBtn.querySelector('.alif-menu-btn-text');
      var iconSpan = menuBtn.querySelector('.alif-menu-btn-icon');
      if (iconSpan) iconSpan.textContent = '✕';
      if (labelSpan) labelSpan.textContent = 'Yopish';
      if (headerEl) headerEl.classList.add('is-menu-open');
      document.documentElement.classList.add('alif-drawer-locked');
      document.body.classList.add('alif-drawer-locked');
      if (closeBtn) {
        setTimeout(function () { closeBtn.focus(); }, 20);
      }
    }

    function closeDrawer(restoreFocus) {
      if (!nav || !menuBtn) return;
      nav.classList.remove('is-drawer-open');
      if (headerEl) headerEl.classList.remove('is-menu-open');
      document.documentElement.classList.remove('alif-drawer-locked');
      document.body.classList.remove('alif-drawer-locked');
      restoreNavToHeader();

      if (isMobileViewport()) {
        nav.setAttribute('aria-hidden', 'true');
      } else {
        nav.removeAttribute('aria-hidden');
      }
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Menyuni ochish');
      var labelSpan = menuBtn.querySelector('.alif-menu-btn-text');
      var iconSpan = menuBtn.querySelector('.alif-menu-btn-icon');
      if (iconSpan) iconSpan.textContent = '☰';
      if (labelSpan) labelSpan.textContent = 'Menyu';

      if (restoreFocus) {
        menuBtn.focus();
      }
    }

    function syncViewport() {
      if (!nav) return;
      if (isMobileViewport()) {
        if (!nav.classList.contains('is-drawer-open')) {
          restoreNavToHeader();
          nav.setAttribute('aria-hidden', 'true');
        }
      } else {
        closeDrawer(false);
        nav.removeAttribute('aria-hidden');
      }
    }

    if (menuBtn && nav) {
      menuBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (nav.classList.contains('is-drawer-open')) {
          closeDrawer(false);
        } else {
          openDrawer();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        closeDrawer(true);
      });
    }

    if (nav) {
      nav.querySelectorAll('.alif-nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
          closeDrawer(false);
        });
      });

      nav.addEventListener('keydown', function (e) {
        if (!nav.classList.contains('is-drawer-open')) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          closeDrawer(true);
          return;
        }
        if (e.key === 'Tab') {
          var focusables = Array.prototype.slice.call(
            nav.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
          );
          if (!focusables.length) return;
          var first = focusables[0];
          var last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav && nav.classList.contains('is-drawer-open')) {
        closeDrawer(true);
      }
    });

    window.addEventListener('resize', syncViewport);
    window.addEventListener('pageshow', function () {
      closeDrawer(false);
      syncViewport();
    });
    syncViewport();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();
