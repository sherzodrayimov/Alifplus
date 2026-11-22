(function () {
  'use strict';
  if (window.__alifExtLoaded) return;
  window.__alifExtLoaded = true;

  var autoTypeEnabled = false;
  var savedNodes = new WeakMap();
  var modifiedNodes = [];

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get({ autoTypeEnabled: false }, function (items) {
      autoTypeEnabled = Boolean(items.autoTypeEnabled);
    });
    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area === 'sync' && changes.autoTypeEnabled) {
        autoTypeEnabled = Boolean(changes.autoTypeEnabled.newValue);
      }
    });
  }

  function showToast(msg) {
    var old = document.getElementById('alif-ext-toast');
    if (old) old.remove();
    var el = document.createElement('div');
    el.id = 'alif-ext-toast';
    el.textContent = msg;
    Object.assign(el.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '2147483647',
      padding: '10px 16px',
      borderRadius: '12px',
      background: '#0f172a',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: '13px',
      fontWeight: '600',
      boxShadow: '0 10px 25px rgba(15, 23, 42, 0.25)',
      border: '1px solid rgba(255,255,255,0.14)'
    });
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2200);
  }

  function convertSelection() {
    if (!window.AlifCore) return { ok: false, count: 0 };
    var active = document.activeElement;

    // 1. Input / Textarea ichidagi tanlangan matn
    if (active && (active.tagName === 'TEXTAREA' || (active.tagName === 'INPUT' && /^(text|search|url|email|tel)$/i.test(active.type || 'text')))) {
      var start = active.selectionStart;
      var end = active.selectionEnd;
      if (typeof start === 'number' && typeof end === 'number' && end > start) {
        var orig = active.value.slice(start, end);
        var conv = window.AlifCore.convert(orig, 'auto2new', { smart: true });
        active.focus();
        if (!document.execCommand('insertText', false, conv)) {
          active.setRangeText(conv, start, end, 'select');
          active.dispatchEvent(new Event('input', { bubbles: true }));
        }
        showToast('✓ Tanlangan matn o‘girildi');
        return { ok: true, count: 1 };
      }
    }

    // 2. Oddiy sahifa yoki contenteditable tanlovi
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      showToast('Avval biror matnni belgilang');
      return { ok: false, count: 0 };
    }
    var range = sel.getRangeAt(0);
    var selectedText = sel.toString();
    if (!selectedText.trim()) return { ok: false, count: 0 };
    var converted = window.AlifCore.convert(selectedText, 'auto2new', { smart: true });

    if (active && active.isContentEditable) {
      document.execCommand('insertText', false, converted);
    } else {
      range.deleteContents();
      range.insertNode(document.createTextNode(converted));
      sel.removeAllRanges();
    }
    showToast('✓ Tanlangan matn o‘girildi');
    return { ok: true, count: 1 };
  }

  function convertFullPage() {
    if (!window.AlifCore) return { ok: false, count: 0 };
    var skipTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'KBD', 'SAMP', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION']);
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    var changed = 0;
    while ((node = walker.nextNode())) {
      var parent = node.parentElement;
      if (!parent || skipTags.has(parent.tagName) || parent.isContentEditable) continue;
      var val = node.nodeValue;
      if (!val || val.trim().length < 2) continue;
      if (/^(https?:\/\/|www\.|[\w.-]+@[\w.-]+)/i.test(val.trim())) continue;
      var conv = window.AlifCore.convert(val, 'auto2new', { smart: true });
      if (conv !== val) {
        if (!savedNodes.has(node)) {
          savedNodes.set(node, val);
          modifiedNodes.push(node);
        }
        node.nodeValue = conv;
        changed++;
      }
    }
    showToast('✓ Sahifadagi ' + changed + ' ta matn bo‘lagi o‘girildi');
    return { ok: true, count: changed };
  }

  function restoreFullPage() {
    var restored = 0;
    modifiedNodes.forEach(function (node) {
      if (savedNodes.has(node)) {
        node.nodeValue = savedNodes.get(node);
        savedNodes.delete(node);
        restored++;
      }
    });
    modifiedNodes = [];
    showToast('↺ Sahifa asl holatiga qaytarildi');
    return { ok: true, count: restored };
  }

  // Ixtiyoriy jonli yozishda avto-almashtirish (bo'shliq yoki tinish belgisi bosilganda)
  document.addEventListener('input', function (e) {
    if (!autoTypeEnabled || !window.AlifCore) return;
    var el = e.target;
    if (!el) return;
    if (el.tagName === 'INPUT' && el.type === 'password') return;
    if (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && /^(text|search)$/i.test(el.type || 'text'))) {
      var pos = el.selectionStart;
      if (typeof pos !== 'number' || pos < 3) return;
      var val = el.value;
      var lastCh = val[pos - 1];
      if (!/[\s.,!?;:)"'\]]/.test(lastCh)) return;
      var before = val.slice(0, pos - 1);
      var m = before.match(/([A-Za-z'ʻ’‘ʼ`]+)$/);
      if (!m) return;
      var rawWord = m[1];
      var convWord = window.AlifCore.convert(rawWord, 'oldlat2new', { smart: true });
      if (convWord !== rawWord) {
        var wordStart = pos - 1 - rawWord.length;
        el.setSelectionRange(wordStart, pos - 1);
        if (!document.execCommand('insertText', false, convWord)) {
          el.setRangeText(convWord, wordStart, pos - 1, 'end');
        }
        el.setSelectionRange(wordStart + convWord.length + 1, wordStart + convWord.length + 1);
      }
    }
  }, true);

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(function (msg, _sender, sendResponse) {
      if (!msg || !msg.type) return;
      if (msg.type === 'ALIF_CONVERT_SELECTION') sendResponse(convertSelection());
      else if (msg.type === 'ALIF_CONVERT_PAGE') sendResponse(convertFullPage());
      else if (msg.type === 'ALIF_RESTORE_PAGE') sendResponse(restoreFullPage());
    });
  }
})();
