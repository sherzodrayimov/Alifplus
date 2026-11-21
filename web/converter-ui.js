(function () {
  'use strict';

  function initConverterUI() {
    var inputEl = document.getElementById('alifInput');
    var outputEl = document.getElementById('alifOutput');
    var dirEl = document.getElementById('alifDirection');
    if (!inputEl || !outputEl || !dirEl) return;

    var inStats = document.getElementById('alifInputStats');
    var outStats = document.getElementById('alifOutputStats');
    var statusBanner = document.getElementById('alifStatusBanner');
    var fileInput = document.getElementById('alifFileInput');
    var btnUpload = document.getElementById('alifBtnUpload');
    var dropzone = document.getElementById('alifDropzone');

    var EXC_KEY = 'alif_custom_exceptions_v1';
    var exceptions = [];
    try {
      exceptions = JSON.parse(localStorage.getItem(EXC_KEY) || '[]');
      if (!Array.isArray(exceptions)) exceptions = [];
    } catch (e) { exceptions = []; }

    function saveExceptions() {
      try { localStorage.setItem(EXC_KEY, JSON.stringify(exceptions)); } catch (e) {}
      var cntEl = document.getElementById('alifExcCount');
      if (cntEl) cntEl.textContent = String(exceptions.length);
    }

    function showStatus(msg, isErr) {
      if (!statusBanner) return;
      statusBanner.textContent = msg;
      statusBanner.hidden = false;
      statusBanner.style.color = isErr ? 'var(--coral)' : 'var(--indigo)';
      clearTimeout(statusBanner._t);
      statusBanner._t = setTimeout(function () { statusBanner.hidden = true; }, 3500);
    }

    function countWords(s) {
      var m = (s || '').trim().match(/\S+/g);
      return m ? m.length : 0;
    }

    function runConversion() {
      var raw = inputEl.value || '';
      var dir = dirEl.value || 'auto2new';
      var out = (window.Alif && typeof window.Alif.convert === 'function')
        ? window.Alif.convert(raw, dir, { exceptions: exceptions })
        : raw;
      outputEl.value = out;

      if (inStats) inStats.textContent = raw.length + ' belgi • ' + countWords(raw) + ' söz';
      if (outStats) {
        var changes = (out.match(/[ÖöĞğŞşÇç]/g) || []).length;
        outStats.textContent = out.length + ' belgi • ' + changes + ' özgariş';
      }
    }

    inputEl.addEventListener('input', runConversion);
    dirEl.addEventListener('change', runConversion);

    var btnSample = document.getElementById('alifBtnSample');
    if (btnSample) {
      btnSample.addEventListener('click', function () {
        inputEl.value = "O'zbekiston Respublikasida yangi lotin alifbosi 2027-yil 22-apreldan kuchga kiradi.\nToshkent shahri, Samarqand va tog'li qishloqlar haqida chiroyli maqola tayyorlandi.\nTexnik so'zlar saqlanadi: YouTube, Windows, GitHub, shower, chocolate.";
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }

    var btnPaste = document.getElementById('alifBtnPaste');
    if (btnPaste) {
      btnPaste.addEventListener('click', async function () {
        try {
          var clip = await navigator.clipboard.readText();
          if (clip) {
            inputEl.value = clip;
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          }
        } catch (e) {
          inputEl.focus();
          showStatus('Brauzer ruxsati cheklangan — Cmd+V / Ctrl+V bilan qöying.', true);
        }
      });
    }

    var btnClear = document.getElementById('alifBtnClear');
    if (btnClear) {
      btnClear.addEventListener('click', function () {
        inputEl.value = '';
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }

    var btnSwap = document.getElementById('alifBtnSwap');
    if (btnSwap) {
      btnSwap.addEventListener('click', function () {
        if (!outputEl.value) return;
        inputEl.value = outputEl.value;
        dirEl.value = (dirEl.value === 'auto2new' || dirEl.value === 'oldlat2new' || dirEl.value === 'cyr2new') ? 'new2oldlat' : 'auto2new';
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }

    var btnCopy = document.getElementById('alifBtnCopy');
    if (btnCopy) {
      btnCopy.addEventListener('click', function () {
        if (!outputEl.value) return;
        if (navigator.clipboard) navigator.clipboard.writeText(outputEl.value);
        var oldTxt = btnCopy.textContent;
        btnCopy.textContent = '✓ Nusxalandi';
        setTimeout(function () { btnCopy.textContent = oldTxt; }, 1400);
      });
    }

    function downloadBlob(blob, filename) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 250);
    }

    var btnTxt = document.getElementById('alifExportTxt');
    if (btnTxt) {
      btnTxt.addEventListener('click', function () {
        if (!outputEl.value.trim()) return;
        downloadBlob(new Blob([outputEl.value], { type: 'text/plain;charset=utf-8' }), 'AlifPlus_natija.txt');
      });
    }

    var btnDocx = document.getElementById('alifExportDocx');
    if (btnDocx) {
      btnDocx.addEventListener('click', async function () {
        var text = outputEl.value;
        if (!text.trim()) return;
        if (!window.JSZip) {
          downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), 'AlifPlus_natija.txt');
          return;
        }
        var zip = new window.JSZip();
        var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
        var paras = text.split(/\r?\n/).map(function (line) {
          return '<w:p><w:r><w:t xml:space="preserve">' + esc(line) + '</w:t></w:r></w:p>';
        }).join('');
        zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
        zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
        zip.file('word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + paras + '</w:body></w:document>');
        var blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        downloadBlob(blob, 'AlifPlus_natija.docx');
      });
    }

    var btnPdf = document.getElementById('alifExportPdf');
    if (btnPdf) {
      btnPdf.addEventListener('click', function () {
        var text = outputEl.value;
        if (!text.trim()) return;
        var w = window.open('', '_blank', 'width=820,height=680');
        if (!w) { showStatus('Brauzerda pop-up oynaga ruxsat bering.', true); return; }
        var esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Alif+ PDF</title><style>body{font-family:system-ui,-apple-system,sans-serif;padding:36px;line-height:1.65;font-size:14pt;white-space:pre-wrap;color:#111;}</style></head><body>' + esc + '</body></html>');
        w.document.close();
        w.focus();
        setTimeout(function () { w.print(); }, 250);
      });
    }

    async function readSingleFile(file) {
      var name = file.name.toLowerCase();
      if (name.endsWith('.docx') && window.JSZip) {
        var buf = await file.arrayBuffer();
        var zip = await window.JSZip.loadAsync(buf);
        var docXml = zip.file('word/document.xml');
        if (!docXml) return '';
        var xml = new DOMParser().parseFromString(await docXml.async('string'), 'application/xml');
        var ps = xml.getElementsByTagName('w:p');
        var out = [];
        for (var i = 0; i < ps.length; i++) {
          var ts = ps[i].getElementsByTagName('w:t');
          var line = '';
          for (var j = 0; j < ts.length; j++) line += ts[j].textContent || '';
          out.push(line);
        }
        return out.join('\n');
      }
      if (name.endsWith('.pdf') && window.pdfjsLib) {
        var arr = await file.arrayBuffer();
        var pdf = await window.pdfjsLib.getDocument({ data: arr }).promise;
        var pages = [];
        for (var p = 1; p <= pdf.numPages; p++) {
          var page = await pdf.getPage(p);
          var tc = await page.getTextContent();
          pages.push(tc.items.map(function (it) { return it.str; }).join(' '));
        }
        return pages.join('\n\n');
      }
      return await file.text();
    }

    if (btnUpload && fileInput) {
      btnUpload.addEventListener('click', function (e) { e.stopPropagation(); fileInput.click(); });
    }
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', function (e) { if (!e.target.closest('button')) fileInput.click(); });
    }
    if (fileInput) {
      fileInput.addEventListener('change', async function () {
        if (!fileInput.files || fileInput.files.length !== 1) return;
        var f = fileInput.files[0];
        showStatus('Yuklanmoqda: ' + f.name + '...');
        try {
          var txt = await readSingleFile(f);
          inputEl.value = txt;
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          showStatus('✓ Fayl ögirildi: ' + f.name);
        } catch (err) {
          showStatus('Faylni öqishda xatolik yuz berdi.', true);
        }
        fileInput.value = '';
      });
    }

    var excModal = document.getElementById('alifExcModal');
    var btnExc = document.getElementById('alifBtnExceptions');
    var excClose = document.getElementById('alifExcClose');
    var excCloseBg = document.getElementById('alifExcCloseBg');
    var excForm = document.getElementById('alifExcForm');
    var excList = document.getElementById('alifExcList');

    function renderExceptions() {
      saveExceptions();
      if (!excList) return;
      if (!exceptions.length) {
        excList.innerHTML = '<div style="color:var(--muted); font-size:13px; padding:8px 0;">Hozircha maxsus istisno qöşilmagan.</div>';
        return;
      }
      excList.innerHTML = exceptions.map(function (item, i) {
        return '<div style="display:flex; justify-content:space-between; align-items:center; padding:6px 10px; border:1px solid var(--border); border-radius:8px; margin-bottom:6px;">' +
          '<span><code>' + item.src + '</code> → <strong>' + (item.dst || item.src) + '</strong></span>' +
          '<button type="button" class="alif-mini-btn alif-mini-danger" data-del-exc="' + i + '">✕</button>' +
        '</div>';
      }).join('');
    }

    if (btnExc && excModal) btnExc.addEventListener('click', function () { renderExceptions(); excModal.hidden = false; });
    [excClose, excCloseBg].forEach(function (el) { if (el && excModal) el.addEventListener('click', function () { excModal.hidden = true; }); });
    if (excForm) {
      excForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var srcIn = document.getElementById('alifExcSrc');
        var dstIn = document.getElementById('alifExcDst');
        var sVal = (srcIn && srcIn.value || '').trim();
        var dVal = (dstIn && dstIn.value || '').trim() || sVal;
        if (!sVal) return;
        exceptions.push({ src: sVal, dst: dVal });
        if (srcIn) srcIn.value = '';
        if (dstIn) dstIn.value = '';
        renderExceptions();
        runConversion();
      });
    }
    if (excList) {
      excList.addEventListener('click', function (e) {
        var del = e.target.closest('[data-del-exc]');
        if (!del) return;
        exceptions.splice(parseInt(del.dataset.delExc, 10), 1);
        renderExceptions();
        runConversion();
      });
    }

    saveExceptions();
    runConversion();
    window.addEventListener('alif-smart-ready', function () {
      if (inputEl.value) runConversion();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initConverterUI);
  else initConverterUI();
})();
