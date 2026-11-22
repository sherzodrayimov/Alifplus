(function () {
  'use strict';

  var STORAGE_KEY = 'alif_site_script';
  var THEME_KEY = 'alif_theme';
  var VALID_MODES = { oldlat: 'Eski lotin', newlat: 'Yangi lotin', cyr: 'Кирилл' };
  var SHORT_LABELS = { oldlat: 'Eski', newlat: 'Yangi', cyr: 'Кирилл' };
  var origTextMap = new WeakMap();
  var origAttrMap = new WeakMap();
  var currentMode = 'oldlat';
  var origTitle = null;

  var SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'KBD', 'SAMP',
    'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'SVG', 'PATH'
  ]);

  var SKIP_SELECTORS = [
    '[data-no-script-switch]',
    '.alif-script-dd',
    '.alif-drawer-script-box',
    '#alifDocPaper',
    '#alifQuickInput',
    '#alifQuickOutput',
    '#alifInput',
    '#alifOutput',
    '#trustWordResult',
    '.alif-kbd-demo',
    '.alif-hero-kbd',
    '.alif-letter-card',
    '[data-sample-w]',
    '[data-doc-script]'
  ].join(',');

  var BRAND_RE = /(Alif\+|macOS|Windows|iOS|Android|Chrome|Edge|GitHub|Telegram|Instagram|YouTube|Word|Excel|PDF|DOCX|TXT|ZIP|HTML|CSS|JSON|Smart Document Builder|Developer mode|Load unpacked|Alt\+Shift\+A|Ctrl\+Z|Cmd\+Z|v2\.0)/g;

  window.toggleAlifTheme = function () {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  };

  function oldToNew(text) {
    var out = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var next = text[i + 1] || '';
      var pair = (ch + next).toLowerCase();
      if (pair === "o'" || pair === "o‘" || pair === "oʻ" || pair === "o’") {
        out += ch === 'O' ? 'Ö' : 'ö'; i++; continue;
      }
      if (pair === "g'" || pair === "g‘" || pair === "gʻ" || pair === "g’") {
        out += ch === 'G' ? 'Ğ' : 'ğ'; i++; continue;
      }
      if (pair === 'sh') {
        var a = text[i + 2] || '';
        var up = ch === 'S' && (next === 'H' || (a && a === a.toUpperCase() && a !== a.toLowerCase()));
        out += up ? 'Ş' : (ch === 'S' ? 'Ş' : 'ş'); i++; continue;
      }
      if (pair === 'ch') {
        var b = text[i + 2] || '';
        var up2 = ch === 'C' && (next === 'H' || (b && b === b.toUpperCase() && b !== b.toLowerCase()));
        out += up2 ? 'Ç' : (ch === 'C' ? 'Ç' : 'ç'); i++; continue;
      }
      out += ch;
    }
    return out;
  }

  function oldToCyr(text) {
    var s = text.replace(/[ʻ’‘ʼ`´]/g, "'");
    var SINGLE = {
      'A': 'А', 'a': 'а', 'B': 'Б', 'b': 'б', 'D': 'Д', 'd': 'д', 'F': 'Ф', 'f': 'ф',
      'G': 'Г', 'g': 'г', 'H': 'Ҳ', 'h': 'ҳ', 'I': 'И', 'i': 'и', 'J': 'Ж', 'j': 'ж',
      'K': 'К', 'k': 'к', 'L': 'Л', 'l': 'л', 'M': 'М', 'm': 'м', 'N': 'Н', 'n': 'н',
      'O': 'О', 'o': 'о', 'P': 'П', 'p': 'п', 'Q': 'Қ', 'q': 'қ', 'R': 'Р', 'r': 'р',
      'S': 'С', 's': 'с', 'T': 'Т', 't': 'т', 'U': 'У', 'u': 'у', 'V': 'В', 'v': 'в',
      'X': 'Х', 'x': 'х', 'Y': 'Й', 'y': 'й', 'Z': 'З', 'z': 'з', 'C': 'Ц', 'c': 'ц'
    };
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      var next = s[i + 1] || '';
      var pair = (ch + next).toLowerCase();
      if (pair === "o'") { out += ch === 'O' ? 'Ў' : 'ў'; i++; continue; }
      if (pair === "g'") { out += ch === 'G' ? 'Ғ' : 'ғ'; i++; continue; }
      if (pair === 'sh') { out += ch === 'S' ? 'Ш' : 'ш'; i++; continue; }
      if (pair === 'ch') { out += ch === 'C' ? 'Ч' : 'ч'; i++; continue; }
      if (pair === 'yo') { out += ch === 'Y' ? 'Ё' : 'ё'; i++; continue; }
      if (pair === 'yu') { out += ch === 'Y' ? 'Ю' : 'ю'; i++; continue; }
      if (pair === 'ya') { out += ch === 'Y' ? 'Я' : 'я'; i++; continue; }
      if (pair === 'ye') { out += ch === 'Y' ? 'Е' : 'е'; i++; continue; }
      if (pair === 'ts') { out += ch === 'T' ? 'Ц' : 'ц'; i++; continue; }
      if (ch === "'") { out += 'ъ'; continue; }
      if (ch === 'E' || ch === 'e') {
        var prev = i > 0 ? s[i - 1] : '';
        var atStart = !prev || !/[A-Za-z']/.test(prev);
        out += atStart ? (ch === 'E' ? 'Э' : 'э') : (ch === 'E' ? 'Е' : 'е');
        continue;
      }
      out += Object.prototype.hasOwnProperty.call(SINGLE, ch) ? SINGLE[ch] : ch;
    }
    return out;
  }

  function transformText(raw, mode) {
    if (!raw || mode === 'oldlat' || !raw.trim()) return raw;
    var trimmed = raw.trim();
    if (/^(https?:\/\/|www\.|mailto:|[\w.-]+@[\w.-]+|v?\d+\.\d+)/i.test(trimmed)) return raw;

    var stashed = [];
    var masked = raw.replace(BRAND_RE, function (m) {
      var idx = stashed.length;
      stashed.push(m);
      return '\uE100' + idx + '\uE101';
    });

    var converted = mode === 'newlat'
      ? (window.AlifCore && window.AlifCore.convert ? window.AlifCore.convert(masked, 'oldlat2new') : oldToNew(masked))
      : (window.AlifCore && window.AlifCore.convert ? window.AlifCore.convert(masked, 'oldlat2cyr') : oldToCyr(masked));

    return converted.replace(/\uE100(\d+)\uE101/g, function (_m, i) {
      return stashed[Number(i)] || '';
    });
  }

  function isSkippedElement(el) {
    if (!el || el.nodeType !== 1) return true;
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.isContentEditable) return true;
    if (el.closest && el.closest(SKIP_SELECTORS)) return true;
    return false;
  }

  function applyScriptToDOM(mode) {
    if (!document.body) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      var parent = node.parentElement;
      if (isSkippedElement(parent)) continue;
      if (!origTextMap.has(node)) {
        origTextMap.set(node, node.nodeValue);
      }
      var baseStr = origTextMap.get(node);
      var nextStr = mode === 'oldlat' ? baseStr : transformText(baseStr, mode);
      if (node.nodeValue !== nextStr) {
        node.nodeValue = nextStr;
      }
    }

    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function (el) {
      if (el.closest && el.closest('[data-no-script-switch]')) return;
      var saved = origAttrMap.get(el);
      if (!saved) {
        saved = { placeholder: el.getAttribute('placeholder') };
        origAttrMap.set(el, saved);
      }
      if (saved.placeholder) {
        el.setAttribute('placeholder', mode === 'oldlat' ? saved.placeholder : transformText(saved.placeholder, mode));
      }
    });
  }

  function updateScriptButtons(mode) {
    var lbl = document.getElementById('alifScriptCurrentLabel');
    if (lbl) lbl.textContent = SHORT_LABELS[mode] || 'Eski';
    document.querySelectorAll('[data-site-script]').forEach(function (btn) {
      var active = btn.getAttribute('data-site-script') === mode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function setSiteScript(mode) {
    if (!VALID_MODES[mode]) mode = 'oldlat';
    currentMode = mode;
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}
    document.documentElement.setAttribute('data-site-script', mode);
    updateScriptButtons(mode);
    if (origTitle === null) origTitle = document.title;
    document.title = mode === 'oldlat' ? origTitle : transformText(origTitle, mode);
    applyScriptToDOM(mode);
  }

  window.setAlifSiteScript = setSiteScript;

  function initNavigation() {
    var menuBtn = document.getElementById('alifMobileMenuBtn');
    var nav = document.getElementById('alifPrimaryNav');
    var closeBtn = document.getElementById('alifDrawerCloseBtn');
    var dd = document.getElementById('alifScriptDropdown');
    var ddTrigger = document.getElementById('alifScriptTriggerBtn');

    function isMobileViewport() {
      return window.innerWidth <= 860;
    }

    function openDrawer() {
      if (!nav || !menuBtn) return;
      nav.classList.add('is-drawer-open');
      nav.setAttribute('aria-hidden', 'false');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', 'Menyuni yopish');
      var labelSpan = menuBtn.querySelector('.alif-menu-btn-text');
      var iconSpan = menuBtn.querySelector('.alif-menu-btn-icon');
      if (iconSpan) iconSpan.textContent = '✕';
      if (labelSpan) labelSpan.textContent = 'Yopish';
      document.documentElement.classList.add('alif-drawer-locked');
      document.body.classList.add('alif-drawer-locked');
      if (closeBtn) {
        setTimeout(function () { closeBtn.focus(); }, 20);
      }
    }

    function closeDrawer(restoreFocus) {
      if (!nav || !menuBtn) return;
      nav.classList.remove('is-drawer-open');
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
      document.documentElement.classList.remove('alif-drawer-locked');
      document.body.classList.remove('alif-drawer-locked');
      if (restoreFocus) {
        menuBtn.focus();
      }
    }

    function syncViewportAria() {
      if (!nav) return;
      if (isMobileViewport()) {
        if (!nav.classList.contains('is-drawer-open')) {
          nav.setAttribute('aria-hidden', 'true');
        }
      } else {
        nav.classList.remove('is-drawer-open');
        nav.removeAttribute('aria-hidden');
        document.documentElement.classList.remove('alif-drawer-locked');
        document.body.classList.remove('alif-drawer-locked');
        if (menuBtn) {
          menuBtn.setAttribute('aria-expanded', 'false');
          var ls = menuBtn.querySelector('.alif-menu-btn-text');
          var ic = menuBtn.querySelector('.alif-menu-btn-icon');
          if (ic) ic.textContent = '☰';
          if (ls) ls.textContent = 'Menyu';
        }
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

      // Klaviatura focus trap (Tab / Shift+Tab ochiq menyu ichida aylanadi)
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
      if (e.key === 'Escape') {
        if (nav && nav.classList.contains('is-drawer-open')) {
          closeDrawer(true);
        }
        if (dd) {
          dd.classList.remove('is-open');
          if (ddTrigger) ddTrigger.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // Desktop script dropdown
    if (ddTrigger && dd) {
      ddTrigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var willOpen = !dd.classList.contains('is-open');
        dd.classList.toggle('is-open', willOpen);
        ddTrigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
      document.addEventListener('pointerdown', function (e) {
        if (!e.target.closest('#alifScriptDropdown')) {
          dd.classList.remove('is-open');
          ddTrigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Yozuv tanlash tugmalari (ham desktop dropdown, ham mobil menyu ichida)
    document.querySelectorAll('[data-site-script]').forEach(function (btn) {
      var handler = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var mode = btn.getAttribute('data-site-script');
        setSiteScript(mode);
        if (dd) {
          dd.classList.remove('is-open');
          if (ddTrigger) ddTrigger.setAttribute('aria-expanded', 'false');
        }
      };
      btn.addEventListener('pointerdown', handler);
      btn.addEventListener('click', handler);
    });

    window.addEventListener('resize', syncViewportAria);
    window.addEventListener('pageshow', function () { closeDrawer(false); syncViewportAria(); });
    syncViewportAria();

    var saved = 'oldlat';
    try {
      var st = localStorage.getItem(STORAGE_KEY);
      if (st && VALID_MODES[st]) saved = st;
    } catch (e) {}
    setSiteScript(saved);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();
