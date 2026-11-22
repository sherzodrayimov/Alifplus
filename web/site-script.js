(function () {
  'use strict';

  var STORAGE_KEY = 'alif_site_script';
  var THEME_KEY = 'alif_theme';
  var VALID_MODES = { newlat: 'Yangi', oldlat: 'Eski', cyr: 'Кирилл' };
  var origTextMap = new WeakMap();
  var origAttrMap = new WeakMap();
  var currentMode = 'newlat';
  var isApplying = false;
  var origTitle = null;

  var SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'KBD', 'SAMP',
    'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'SVG', 'PATH'
  ]);

  var SKIP_SELECTORS = [
    '[data-no-script-switch]',
    '.alif-script-dd',
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

  // Avtonom fallback konverter (AlifCore yuklanmagan taqdirda ham 100% ishlashi uchun)
  function fallbackNewToOld(text) {
    var out = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var next = text[i + 1] || '';
      var nu = next && next !== next.toLowerCase() && next === next.toUpperCase();
      if (ch === 'Ö') out += "O'";
      else if (ch === 'ö') out += "o'";
      else if (ch === 'Ğ') out += "G'";
      else if (ch === 'ğ') out += "g'";
      else if (ch === 'Ş') out += nu ? 'SH' : 'Sh';
      else if (ch === 'ş') out += 'sh';
      else if (ch === 'Ç') out += nu ? 'CH' : 'Ch';
      else if (ch === 'ç') out += 'ch';
      else if (ch === 'Ñ') out += nu ? 'NG' : 'Ng';
      else if (ch === 'ñ') out += 'ng';
      else out += ch;
    }
    return out;
  }

  function fallbackOldToCyr(text) {
    var s = text.replace(/[ʻ’‘ʼ`´]/g, "'");
    var stems = ["ta'lim", "ta'mir", "ta'min", "ta'kid", "ta'sir", "ta'rif", "e'lon", "e'tibor", "she'r", "me'mor", "me'yor", "sa'nat", "san'at", "ma'no", "ma'lum", "ma'naviy", "ma'rifat", "mas'ul", "ma'qul", "mo'jiza", "a'lo", "a'zo", "va'da", "qat'iy"];
    s = s.replace(/\b([A-Za-z']+)/g, function (w) {
      var low = w.toLowerCase();
      for (var k = 0; k < stems.length; k++) {
        if (low.indexOf(stems[k]) === 0) return w.replace("'", '\uE000');
      }
      return w;
    });
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
      if (ch === '\uE000' || ch === "'") { out += 'ъ'; continue; }
      if (ch === 'E' || ch === 'e') {
        var prev = i > 0 ? s[i - 1] : '';
        var atStart = !prev || !/[A-Za-z'\uE000]/.test(prev);
        out += atStart ? (ch === 'E' ? 'Э' : 'э') : (ch === 'E' ? 'Е' : 'е');
        continue;
      }
      out += Object.prototype.hasOwnProperty.call(SINGLE, ch) ? SINGLE[ch] : ch;
    }
    return out;
  }

  function convertSafe(text, dir) {
    if (window.AlifCore && typeof window.AlifCore.convert === 'function') {
      return window.AlifCore.convert(text, dir, { smart: true });
    }
    if (dir === 'auto2new') return text;
    if (dir === 'new2oldlat') return fallbackNewToOld(text);
    if (dir === 'new2cyr') return fallbackOldToCyr(fallbackNewToOld(text));
    return text;
  }

  window.toggleAlifTheme = function () {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  };

  function transformText(raw, mode) {
    if (!raw || mode === 'newlat' || !raw.trim()) return raw;
    var trimmed = raw.trim();
    if (/^(https?:\/\/|www\.|mailto:|[\w.-]+@[\w.-]+|v?\d+\.\d+)/i.test(trimmed)) return raw;

    var asNewLat = convertSafe(raw, 'auto2new');
    if (mode === 'oldlat') {
      return convertSafe(asNewLat, 'new2oldlat');
    }
    if (mode === 'cyr') {
      var stashed = [];
      var masked = asNewLat.replace(BRAND_RE, function (m) {
        var idx = stashed.length;
        stashed.push(m);
        return '\uE100' + idx + '\uE101';
      });
      var cyr = convertSafe(masked, 'new2cyr');
      return cyr.replace(/\uE100(\d+)\uE101/g, function (_m, i) {
        return stashed[Number(i)] || '';
      });
    }
    return raw;
  }

  function isSkippedElement(el) {
    if (!el || el.nodeType !== 1) return true;
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.isContentEditable) return true;
    if (el.closest && el.closest(SKIP_SELECTORS)) return true;
    return false;
  }

  function applyToSubtree(rootNode, mode) {
    if (!rootNode) return;
    var walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      var parent = node.parentElement;
      if (isSkippedElement(parent)) continue;
      if (!origTextMap.has(node)) {
        origTextMap.set(node, node.nodeValue);
      }
      var baseStr = origTextMap.get(node);
      var nextStr = mode === 'newlat' ? baseStr : transformText(baseStr, mode);
      if (node.nodeValue !== nextStr) {
        node.nodeValue = nextStr;
      }
    }

    if (rootNode.querySelectorAll) {
      rootNode.querySelectorAll('input[placeholder], textarea[placeholder], [aria-label]').forEach(function (el) {
        if (el.closest && el.closest('[data-no-script-switch], .alif-script-dd')) return;
        var saved = origAttrMap.get(el);
        if (!saved) {
          saved = {
            placeholder: el.getAttribute('placeholder'),
            ariaLabel: el.getAttribute('aria-label')
          };
          origAttrMap.set(el, saved);
        }
        if (saved.placeholder) {
          el.setAttribute('placeholder', mode === 'newlat' ? saved.placeholder : transformText(saved.placeholder, mode));
        }
        if (saved.ariaLabel) {
          el.setAttribute('aria-label', mode === 'newlat' ? saved.ariaLabel : transformText(saved.ariaLabel, mode));
        }
      });
    }
  }

  function updateDropdownUI(mode) {
    var labelText = VALID_MODES[mode] || 'Yangi';
    var lbl = document.getElementById('alifScriptCurrentLabel');
    if (lbl) lbl.textContent = labelText;
    document.querySelectorAll('[data-site-script]').forEach(function (btn) {
      var active = btn.getAttribute('data-site-script') === mode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function closeDropdown() {
    var dd = document.getElementById('alifScriptDropdown');
    if (dd) dd.classList.remove('is-open');
    var trigger = document.getElementById('alifScriptTriggerBtn');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function setSiteScript(mode) {
    if (!VALID_MODES[mode]) mode = 'newlat';
    currentMode = mode;
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}
    document.documentElement.setAttribute('data-site-script', mode);
    updateDropdownUI(mode);
    closeDropdown();

    isApplying = true;
    try {
      if (origTitle === null) origTitle = document.title;
      document.title = mode === 'newlat' ? origTitle : transformText(origTitle, mode);
      if (document.body) {
        applyToSubtree(document.body, mode);
      }
    } finally {
      isApplying = false;
      document.documentElement.classList.remove('alif-script-pending');
    }
  }

  window.setAlifSiteScript = setSiteScript;

  function bindControls() {
    var themeBtn = document.getElementById('alifThemeToggle');
    if (themeBtn && !themeBtn.dataset.bound) {
      themeBtn.dataset.bound = '1';
      themeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.toggleAlifTheme();
      });
    }

    var triggerBtn = document.getElementById('alifScriptTriggerBtn');
    var dd = document.getElementById('alifScriptDropdown');
    if (triggerBtn && dd && !triggerBtn.dataset.bound) {
      triggerBtn.dataset.bound = '1';
      triggerBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var willOpen = !dd.classList.contains('is-open');
        if (willOpen) {
          dd.classList.add('is-open');
          triggerBtn.setAttribute('aria-expanded', 'true');
        } else {
          closeDropdown();
        }
      });
    }

    // Har bir menyu bandiga ham pointerdown, ham click biriktirish (Safari focus/blur poygasini oldini oladi)
    document.querySelectorAll('[data-site-script]').forEach(function (optBtn) {
      if (optBtn.dataset.bound) return;
      optBtn.dataset.bound = '1';
      var selectMode = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var chosen = optBtn.getAttribute('data-site-script');
        setSiteScript(chosen);
      };
      optBtn.addEventListener('pointerdown', selectMode);
      optBtn.addEventListener('click', selectMode);
    });

    document.addEventListener('pointerdown', function (e) {
      if (!e.target.closest('.alif-script-dd')) {
        closeDropdown();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDropdown();
    });

    var saved = 'newlat';
    try {
      var st = localStorage.getItem(STORAGE_KEY);
      if (st && VALID_MODES[st]) saved = st;
    } catch (e) {}
    setSiteScript(saved);

    if (typeof MutationObserver !== 'undefined' && document.body) {
      var observer = new MutationObserver(function (mutations) {
        if (isApplying || currentMode === 'newlat') return;
        isApplying = true;
        try {
          mutations.forEach(function (m) {
            m.addedNodes.forEach(function (n) {
              if (n.nodeType === 1 && !isSkippedElement(n)) {
                applyToSubtree(n, currentMode);
              }
            });
          });
        } finally {
          isApplying = false;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindControls);
  } else {
    bindControls();
  }
})();
