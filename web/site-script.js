(function () {
  'use strict';

  var STORAGE_KEY = 'alif_site_script';
  var VALID_MODES = { newlat: 'Yangi', oldlat: 'Eski', cyr: 'Кирилл' };
  var origTextMap = new WeakMap();
  var origAttrMap = new WeakMap();
  var currentMode = 'newlat';
  var observer = null;
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

  function transformText(raw, mode) {
    if (!raw || mode === 'newlat') return raw;
    if (!raw.trim() || !window.AlifCore) return raw;
    var trimmed = raw.trim();
    if (/^(https?:\/\/|www\.|mailto:|[\w.-]+@[\w.-]+|v?\d+\.\d+)/i.test(trimmed)) return raw;

    var asNewLat = window.AlifCore.convert(raw, 'auto2new', { smart: true });
    if (mode === 'oldlat') {
      return window.AlifCore.convert(asNewLat, 'new2oldlat');
    }
    if (mode === 'cyr') {
      var stashed = [];
      var masked = asNewLat.replace(BRAND_RE, function (m) {
        var idx = stashed.length;
        stashed.push(m);
        return '\uE100' + idx + '\uE101';
      });
      var cyr = window.AlifCore.convert(masked, 'new2cyr');
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
    if (!rootNode || !window.AlifCore) return;

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
    document.querySelectorAll('#alifScriptCurrentLabel').forEach(function (el) {
      el.textContent = labelText;
    });
    document.querySelectorAll('[data-site-script]').forEach(function (btn) {
      var active = btn.getAttribute('data-site-script') === mode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function closeDropdown() {
    document.querySelectorAll('.alif-script-dd').forEach(function (dd) {
      dd.classList.remove('is-open');
      var trigger = dd.querySelector('.alif-script-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function revealBody() {
    document.documentElement.classList.remove('alif-script-pending');
  }

  function setSiteScript(mode) {
    if (!VALID_MODES[mode]) mode = 'newlat';
    currentMode = mode;
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}
    document.documentElement.setAttribute('data-site-script', mode);
    updateDropdownUI(mode);
    closeDropdown();

    if (!window.AlifCore) {
      revealBody();
      return;
    }

    isApplying = true;
    try {
      if (origTitle === null) origTitle = document.title;
      document.title = mode === 'newlat' ? origTitle : transformText(origTitle, mode);
      if (document.body) {
        applyToSubtree(document.body, mode);
      }
    } finally {
      isApplying = false;
      revealBody();
    }
  }

  function initSwitcher() {
    var saved = 'newlat';
    try {
      var st = localStorage.getItem(STORAGE_KEY);
      if (st && VALID_MODES[st]) saved = st;
    } catch (e) {}

    // Dropdown ochish / yopish va variant tanlash
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('.alif-script-trigger');
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        var dd = trigger.closest('.alif-script-dd');
        var willOpen = !dd.classList.contains('is-open');
        closeDropdown();
        if (willOpen) {
          dd.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
        return;
      }

      var optBtn = e.target.closest('[data-site-script]');
      if (optBtn) {
        e.preventDefault();
        setSiteScript(optBtn.getAttribute('data-site-script'));
        return;
      }

      if (!e.target.closest('.alif-script-dd')) {
        closeDropdown();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDropdown();
    });

    setSiteScript(saved);

    if (typeof MutationObserver !== 'undefined' && document.body) {
      observer = new MutationObserver(function (mutations) {
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

  window.setAlifSiteScript = setSiteScript;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSwitcher);
  } else {
    initSwitcher();
  }
})();
