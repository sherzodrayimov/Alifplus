(function () {
  'use strict';

  function initKonverterPro() {
    var inputEl = document.getElementById('alifInput');
    var outputEl = document.getElementById('alifOutput');
    var dirEl = document.getElementById('alifDirection');
    var dropzone = document.getElementById('alifDropzone');
    var fileInput = document.getElementById('alifFileInput');
    if (!inputEl || !outputEl || !dirEl) return;

    // ── A. AVTOMATIK YOZUVNI ANIQLASH ──
    var badgeEl = document.getElementById('alifDetectedBadge');
    var SCRIPT_NAMES = {
      cyr: 'Aniqlangan: Kirill → Yangi alifbo',
      oldlat: 'Aniqlangan: Eski lotin → Yangi alifbo',
      newlat: 'Matn allaqachon yangi alifboda (Ö, Ğ, Ş, Ç)'
    };

    function updateScriptDetection() {
      if (!badgeEl) return;
      var txt = inputEl.value || '';
      if (!txt.trim()) {
        badgeEl.hidden = true;
        badgeEl.classList.remove('is-warn');
        return;
      }
      var det = (window.Alif && typeof window.Alif.detectScript === 'function')
        ? window.Alif.detectScript(txt)
        : (/[\u0400-\u04FF]/.test(txt) ? 'cyr' : (/[ÖöĞğŞşÇç]/.test(txt) ? 'newlat' : 'oldlat'));

      badgeEl.hidden = false;
      if (det === 'newlat' && (dirEl.value === 'auto2new' || dirEl.value === 'oldlat2new')) {
        badgeEl.classList.add('is-warn');
        badgeEl.innerHTML = 'Matn yangi alifboda · <button type="button" id="alifSwitchToOldBtn" class="alif-inline-link-btn">Eski lotinga qaytarish?</button>';
        var swBtn = document.getElementById('alifSwitchToOldBtn');
        if (swBtn) {
          swBtn.onclick = function () {
            dirEl.value = 'new2oldlat';
            dirEl.dispatchEvent(new Event('change', { bubbles: true }));
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          };
        }
      } else {
        badgeEl.classList.remove('is-warn');
        badgeEl.textContent = SCRIPT_NAMES[det] || 'Aniqlangan: Avtomatik';
      }
    }

    // ── B. HARFLAR KESIMIDAGI MINI-STATISTIKA ──
    var elO = document.getElementById('statCntO');
    var elG = document.getElementById('statCntG');
    var elS = document.getElementById('statCntS');
    var elC = document.getElementById('statCntC');
    var elF = document.getElementById('statCntForeign');

    function updateLetterStats() {
      var raw = inputEl.value || '';
      var out = outputEl.value || '';
      if (elO) elO.textContent = (out.match(/[Öö]/g) || []).length;
      if (elG) elG.textContent = (out.match(/[Ğğ]/g) || []).length;
      if (elS) elS.textContent = (out.match(/[Şş]/g) || []).length;
      if (elC) elC.textContent = (out.match(/[Çç]/g) || []).length;

      if (elF) {
        var kept = 0;
        var tokens = out.split(/\s+/);
        for (var i = 0; i < tokens.length; i++) {
          var tok = tokens[i].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '');
          if (!tok || tok.length < 3) continue;
          if (/^[A-Za-z0-9'-]+$/.test(tok) && /(sh|ch|th|tion|oo|ee|w|ph|ck)/i.test(tok) && raw.indexOf(tok) !== -1) {
            kept++;
          }
        }
        elF.textContent = kept;
      }
    }

    // ── C. UNDO / REDO TARIXI ──
    var undoBtn = document.getElementById('alifBtnUndo');
    var redoBtn = document.getElementById('alifBtnRedo');
    var historyStack = [{ val: inputEl.value || '', dir: dirEl.value }];
    var historyIdx = 0;
    var isRestoring = false;
    var typingTimer = null;

    function syncUndoRedoBtns() {
      if (undoBtn) undoBtn.disabled = historyIdx <= 0;
      if (redoBtn) redoBtn.disabled = historyIdx >= historyStack.length - 1;
    }

    function pushHistory(immediate) {
      if (isRestoring) return;
      clearTimeout(typingTimer);
      var commit = function () {
        var curVal = inputEl.value || '';
        var curDir = dirEl.value;
        var top = historyStack[historyIdx];
        if (top && top.val === curVal && top.dir === curDir) return;
        historyStack = historyStack.slice(0, historyIdx + 1);
        historyStack.push({ val: curVal, dir: curDir });
        if (historyStack.length > 45) historyStack.shift();
        historyIdx = historyStack.length - 1;
        syncUndoRedoBtns();
      };
      if (immediate) commit();
      else typingTimer = setTimeout(commit, 320);
    }

    function applyHistoryAt(idx) {
      if (idx < 0 || idx >= historyStack.length) return;
      isRestoring = true;
      historyIdx = idx;
      var snap = historyStack[historyIdx];
      inputEl.value = snap.val;
      if (snap.dir) dirEl.value = snap.dir;
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      syncUndoRedoBtns();
      setTimeout(function () { isRestoring = false; }, 20);
    }

    if (undoBtn) undoBtn.addEventListener('click', function () { applyHistoryAt(historyIdx - 1); });
    if (redoBtn) redoBtn.addEventListener('click', function () { applyHistoryAt(historyIdx + 1); });

    // Tozalash, Almashtirish, Qo'yish, Namuna tugmalari bosilishidan oldin joriy matnni saqlab qolish
    ['alifBtnClear', 'alifBtnSwap', 'alifBtnPaste', 'alifBtnSample'].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) {
        b.addEventListener('click', function () {
          pushHistory(true);
          setTimeout(function () { pushHistory(true); }, 60);
        }, true);
      }
    });

    inputEl.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) applyHistoryAt(historyIdx + 1);
        else applyHistoryAt(historyIdx - 1);
      }
    });

    inputEl.addEventListener('input', function () {
      pushHistory(false);
      updateScriptDetection();
      setTimeout(updateLetterStats, 15);
    });

    dirEl.addEventListener('change', function () {
      pushHistory(true);
      updateScriptDetection();
      setTimeout(updateLetterStats, 25);
    });

    // ── D. KENGAYTIRILGAN DRAG & DROP (BIR VA KO'P FAYLLI BATCH) ──
    var batchPanel = document.getElementById('alifBatchPanel');
    var batchTitle = document.getElementById('alifBatchTitle');
    var batchList = document.getElementById('alifBatchList');
    var batchResults = [];

    function escapeXml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function createDocxBlob(text) {
      if (!window.JSZip) return new Blob([text], { type: 'text/plain;charset=utf-8' });
      var zip = new window.JSZip();
      var paras = text.split(/\r?\n/).map(function (line) {
        return '<w:p><w:r><w:t xml:space="preserve">' + escapeXml(line) + '</w:t></w:r></w:p>';
      }).join('');
      var docXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
        paras + '</w:body></w:document>';
      var contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
        '</Types>';
      var rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
        '</Relationships>';
      zip.file('[Content_Types].xml', contentTypes);
      zip.file('_rels/.rels', rels);
      zip.file('word/document.xml', docXml);
      return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    }

    function triggerDownload(blob, filename) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 250);
    }

    async function extractFileText(file) {
      var name = file.name.toLowerCase();
      if (name.endsWith('.docx') && window.JSZip) {
        var buf = await file.arrayBuffer();
        var zip = await window.JSZip.loadAsync(buf);
        var docFile = zip.file('word/document.xml');
        if (!docFile) return '';
        var xmlStr = await docFile.async('string');
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(xmlStr, 'application/xml');
        var paras = xmlDoc.getElementsByTagName('w:p');
        var lines = [];
        for (var i = 0; i < paras.length; i++) {
          var texts = paras[i].getElementsByTagName('w:t');
          var line = '';
          for (var j = 0; j < texts.length; j++) {
            line += texts[j].textContent || '';
          }
          lines.push(line);
        }
        return lines.join('\n');
      }
      if (name.endsWith('.pdf')) {
        try {
          var pdfjs = window.pdfjsLib || await import('./vendor/pdf.min.mjs');
          if (pdfjs.GlobalWorkerOptions) {
            pdfjs.GlobalWorkerOptions.workerSrc = 'web/vendor/pdf.worker.min.mjs';
          }
          var arr = await file.arrayBuffer();
          var pdf = await pdfjs.getDocument({ data: arr }).promise;
          var pages = [];
          for (var p = 1; p <= pdf.numPages; p++) {
            var page = await pdf.getPage(p);
            var content = await page.getTextContent();
            pages.push(content.items.map(function (it) { return it.str; }).join(' '));
          }
          return pages.join('\n\n');
        } catch (err) {
          return '[PDF o‘qishda xatolik: ' + file.name + ']';
        }
      }
      return await file.text();
    }

    function renderBatchList() {
      if (!batchPanel || !batchList) return;
      if (batchResults.length === 0) {
        batchPanel.hidden = true;
        return;
      }
      batchPanel.hidden = false;
      if (batchTitle) batchTitle.textContent = batchResults.length + ' ta hujjat tayyor';
      batchList.innerHTML = batchResults.map(function (item, idx) {
        var baseName = item.name.replace(/\.[^.]+$/, '');
        return '<div class="alif-batch-item">' +
          '<div class="alif-batch-info">' +
            '<strong>' + baseName + '_alifplus</strong>' +
            '<span>' + item.changes + ' ta yangi harf · ' + item.converted.length + ' belgi</span>' +
          '</div>' +
          '<div class="alif-batch-item-btns">' +
            '<button type="button" class="alif-mini-btn" data-bidx="' + idx + '" data-bact="preview">Ko‘rish</button>' +
            '<button type="button" class="alif-mini-btn" data-bidx="' + idx + '" data-bact="txt">.TXT</button>' +
            '<button type="button" class="alif-mini-btn alif-mini-primary" data-bidx="' + idx + '" data-bact="docx">.DOCX</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    async function processMultipleFiles(files) {
      var list = Array.from(files).slice(0, 15);
      if (list.length === 0) return;
      batchResults = [];
      if (batchPanel) batchPanel.hidden = false;
      if (batchTitle) batchTitle.textContent = list.length + ' ta fayl qayta ishlanmoqda...';
      if (batchList) batchList.innerHTML = '';

      for (var i = 0; i < list.length; i++) {
        var f = list[i];
        var raw = await extractFileText(f);
        var conv = (window.Alif && typeof window.Alif.convert === 'function')
          ? window.Alif.convert(raw, dirEl.value, { smart: false })
          : raw;
        var changes = (conv.match(/[ÖöĞğŞşÇç]/g) || []).length;
        batchResults.push({ name: f.name, raw: raw, converted: conv, changes: changes });
      }

      // Birinchi faylni asosiy oynada ham ko'rsatish
      if (batchResults[0]) {
        pushHistory(true);
        inputEl.value = batchResults[0].raw;
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        pushHistory(true);
      }
      renderBatchList();
    }

    if (batchList) {
      batchList.addEventListener('click', async function (e) {
        var btn = e.target.closest('button[data-bidx]');
        if (!btn) return;
        var item = batchResults[parseInt(btn.dataset.bidx, 10)];
        if (!item) return;
        var baseName = item.name.replace(/\.[^.]+$/, '') + '_alifplus';
        var act = btn.dataset.bact;
        if (act === 'preview') {
          pushHistory(true);
          inputEl.value = item.raw;
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (act === 'txt') {
          triggerDownload(new Blob([item.converted], { type: 'text/plain;charset=utf-8' }), baseName + '.txt');
        } else if (act === 'docx') {
          var blob = await createDocxBlob(item.converted);
          triggerDownload(blob, baseName + '.docx');
        }
      });
    }

    var zipBtn = document.getElementById('alifBatchDownloadZip');
    if (zipBtn) {
      zipBtn.addEventListener('click', async function () {
        if (!batchResults.length || !window.JSZip) return;
        var zip = new window.JSZip();
        for (var i = 0; i < batchResults.length; i++) {
          var it = batchResults[i];
          var bName = it.name.replace(/\.[^.]+$/, '') + '_alifplus';
          zip.file(bName + '.txt', it.converted);
          var dBlob = await createDocxBlob(it.converted);
          zip.file(bName + '.docx', dBlob);
        }
        var archive = await zip.generateAsync({ type: 'blob' });
        triggerDownload(archive, 'AlifPlus_Hujjatlar.zip');
      });
    }

    var mergedBtn = document.getElementById('alifBatchDownloadMerged');
    if (mergedBtn) {
      mergedBtn.addEventListener('click', async function () {
        if (!batchResults.length) return;
        var combined = batchResults.map(function (it) {
          return '=== ' + it.name + ' ===\n\n' + it.converted;
        }).join('\n\n────────────────────────\n\n');
        var blob = await createDocxBlob(combined);
        triggerDownload(blob, 'AlifPlus_Umumiy_Hujjat.docx');
      });
    }

    var clearBatchBtn = document.getElementById('alifBatchClear');
    if (clearBatchBtn) {
      clearBatchBtn.addEventListener('click', function () {
        batchResults = [];
        renderBatchList();
      });
    }

    // Multi-file selection or drop intercept (capture phase)
    if (fileInput) {
      fileInput.addEventListener('change', function (e) {
        if (fileInput.files && fileInput.files.length > 1) {
          e.stopImmediatePropagation();
          processMultipleFiles(fileInput.files);
        } else if (fileInput.files && fileInput.files.length === 1) {
          pushHistory(true);
          setTimeout(function () {
            pushHistory(true);
            updateScriptDetection();
            updateLetterStats();
          }, 250);
        }
      }, true);
    }

    // Butun sahifa bo'ylab Drag & Drop glow (is-dragover)
    var dragDepth = 0;
    window.addEventListener('dragenter', function (e) {
      if (!e.dataTransfer || !Array.from(e.dataTransfer.types || []).includes('Files')) return;
      dragDepth++;
      if (dropzone) dropzone.classList.add('is-dragover');
    });
    window.addEventListener('dragover', function (e) {
      if (!e.dataTransfer || !Array.from(e.dataTransfer.types || []).includes('Files')) return;
      e.preventDefault();
      if (dropzone) dropzone.classList.add('is-dragover');
    });
    window.addEventListener('dragleave', function () {
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0 && dropzone) dropzone.classList.remove('is-dragover');
    });
    window.addEventListener('drop', function (e) {
      dragDepth = 0;
      if (dropzone) dropzone.classList.remove('is-dragover');
      var files = e.dataTransfer && e.dataTransfer.files;
      if (!files || !files.length) return;
      e.preventDefault();
      if (files.length > 1) {
        e.stopImmediatePropagation();
        processMultipleFiles(files);
      } else if (!dropzone || !dropzone.contains(e.target)) {
        // Dropzone tashqarisiga 1 ta fayl tashlansa, uni fileInput ga uzatish
        e.stopImmediatePropagation();
        processMultipleFiles(files);
      }
    }, true);

    updateScriptDetection();
    updateLetterStats();
    syncUndoRedoBtns();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKonverterPro);
  } else {
    initKonverterPro();
  }
})();
