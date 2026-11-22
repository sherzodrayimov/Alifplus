(function () {
  'use strict';

  var STORAGE_KEY = 'alif_site_script';
  var VALID_MODES = { newlat: true, oldlat: true, cyr: true };
  var origTextMap = new WeakMap();
  var origAttrMap = new WeakMap();
  var currentMode = 'newlat';
  var observer = null;
  var isApplying = false;

  var SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'KBD', 'SAMP',
    'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'SVG', 'PATH'
  ]);

  var SKIP_SELECTORS = [
    '[data-no-script-switch]',
    '.alif-script-switcher',
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

  // Kirillchaga o'tganda texnik va brend atamalarni saqlab qolish
  var BRAND_RE = /(Alif\+|macOS|Windows|iOS|Android|Chrome|Edge|GitHub|Telegram|Instagram|YouTube|Word|Excel|PDF|DOCX|TXT|ZIP|HTML|CSS|JSON|Smart Document Builder|Developer mode|Load unpacked|Alt\+Shift\+A|Ctrl\+Z|Cmd\+Z|v2\.0)/g;

  function transformText(raw, mode) {
    if (!raw || !raw.trim() || !window.AlifCore) return raw;
    var trimmed = raw.trim();
    if (/^(https?:\/\/|www\.|mailto:|[\w.-]+@[\w.-]+|v?\d+\.\d+)/i.test(trimmed)) return raw;

    // 1-bosqich: asl matnni aniq Yangi lotinga keltirish (chat, YouTube himoyalangan holda)
    var asNewLat = window.AlifCore.convert(raw, 'auto2new', { smart: true });
    if (mode === 'newlat') {
      return asNewLat;
    }
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

    // Text tugunlari
    var walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      var parent = node.parentElement;
      if (isSkippedElement(parent)) continue;
      if (!origTextMap.has(node)) {
        origTextMap.set(node, node.nodeValue);
      }
      var baseStr = origTextMap.get(node);
      var nextStr = transformText(baseStr, mode);
      if (node.nodeValue !== nextStr) {
        node.nodeValue = nextStr;
      }
    }

    // Placeholder va aria-label atributlari
    if (rootNode.querySelectorAll) {
      rootNode.querySelectorAll('input[placeholder], textarea[placeholder], [aria-label]').forEach(function (el) {
        if (el.closest && el.closest('.alif-script-switcher')) return;
        var saved = origAttrMap.get(el);
        if (!saved) {
          saved = {
            placeholder: el.getAttribute('placeholder'),
            ariaLabel: el.getAttribute('aria-label')
          };
          origAttrMap.set(el, saved);
        }
        if (saved.placeholder) {
          el.setAttribute('placeholder', transformText(saved.placeholder, mode));
        }
        if (saved.ariaLabel) {
          el.setAttribute('aria-label', transformText(saved.ariaLabel, mode));
        }
      });
    }
  }

  var origTitle = null;
  function updateButtons(mode) {
    document.querySelectorAll('[data-site-script]').forEach(function (btn) {
      var active = btn.getAttribute('data-site-script') === mode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function setSiteScript(mode) {
    if (!VALID_MODES[mode]) mode = 'newlat';
    currentMode = mode;
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}
    document.documentElement.setAttribute('data-site-script', mode);
    updateButtons(mode);

    if (!window.AlifCore) return;
    isApplying = true;
    try {
      if (origTitle === null) origTitle = document.title;
      document.title = transformText(origTitle, mode);
      if (document.body) {
        applyToSubtree(document.body, mode);
      }
    } finally {
      isApplying = false;
    }
  }

  function initSwitcher() {
    var saved = 'newlat';
    try {
      var st = localStorage.getItem(STORAGE_KEY);
      if (st && VALID_MODES[st]) saved = st;
    } catch (e) {}

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-site-script]');
      if (!btn) return;
      setSiteScript(btn.getAttribute('data-site-script'));
    });

    if (saved !== 'newlat') {
      setSiteScript(saved);
    } else {
      updateButtons('newlat');
    }

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
