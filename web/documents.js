(function () {
  'use strict';

  const STORAGE_KEY = 'alif_plus_exceptions_v2';

  const CURRENT_SCRIPT_URL = (document.currentScript && document.currentScript.src)
    ? document.currentScript.src
    : new URL('web/documents.js', window.location.href).href;

  function resolveVendorUrl(filename) {
    return new URL('./vendor/' + filename, CURRENT_SCRIPT_URL).href;
  }

  const elDirection = document.getElementById('alifDirection');
  const elOptNg = document.getElementById('alifOptNg');
  const elInput = document.getElementById('alifInput');
  const elOutput = document.getElementById('alifOutput');
  const elInputStats = document.getElementById('alifInputStats');
  const elOutputStats = document.getElementById('alifOutputStats');
  const elStatus = document.getElementById('alifStatusBanner');

  const elDropzone = document.getElementById('alifDropzone');
  const elFileInput = document.getElementById('alifFileInput');
  const elBtnUpload = document.getElementById('alifBtnUpload');

  const elBtnSample = document.getElementById('alifBtnSample');
  const elBtnPaste = document.getElementById('alifBtnPaste');
  const elBtnClear = document.getElementById('alifBtnClear');
  const elBtnSwap = document.getElementById('alifBtnSwap');
  const elBtnCopy = document.getElementById('alifBtnCopy');

  const elExportTxt = document.getElementById('alifExportTxt');
  const elExportDocx = document.getElementById('alifExportDocx');
  const elExportPdf = document.getElementById('alifExportPdf');

  const elBtnExceptions = document.getElementById('alifBtnExceptions');
  const elExcCount = document.getElementById('alifExcCount');
  const elExcModal = document.getElementById('alifExcModal');
  const elExcClose = document.getElementById('alifExcClose');
  const elExcCloseBg = document.getElementById('alifExcCloseBg');
  const elExcForm = document.getElementById('alifExcForm');
  const elExcSrc = document.getElementById('alifExcSrc');
  const elExcDst = document.getElementById('alifExcDst');
  const elExcList = document.getElementById('alifExcList');

  let currentFileName = 'alif-yangi-alifbo';
  let exceptions = loadExceptions();

  function loadExceptions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveExceptions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exceptions));
    } catch (_) {}
    updateExceptionUI();
  }

  function showStatus(msg, isError) {
    if (!elStatus) return;
    if (!msg) {
      elStatus.hidden = true;
      elStatus.textContent = '';
      elStatus.classList.remove('is-error');
      return;
    }
    elStatus.hidden = false;
    elStatus.textContent = msg;
    elStatus.classList.toggle('is-error', Boolean(isError));
  }

  function countChangedChars(a, b) {
    const minLen = Math.min(a.length, b.length);
    let diff = Math.abs(a.length - b.length);
    for (let i = 0; i < minLen; i++) {
      if (a[i] !== b[i]) diff++;
    }
    return diff;
  }

  function runConversion() {
    const src = elInput.value || '';
    const dir = elDirection.value;
    const out = window.Alif.convert(src, dir, {
      ng: elOptNg && elOptNg.checked,
      exceptions: exceptions
    });

    elOutput.value = out;

    const words = src.trim() ? src.trim().split(/\s+/).length : 0;
    const changes = countChangedChars(src, out);
    elInputStats.textContent = `${src.length} belgi • ${words} so‘z`;
    elOutputStats.textContent = `${out.length} belgi • ${changes} o‘zgarish`;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function updateExceptionUI() {
    if (elExcCount) elExcCount.textContent = String(exceptions.length);
    if (!elExcList) return;
    if (exceptions.length === 0) {
      elExcList.innerHTML = '<div style="color:#64748b;font-size:13px;">Hozircha istisnolar qo‘shilmagan.</div>';
      return;
    }
    elExcList.innerHTML = exceptions
      .map((item, idx) => {
        const dstText = item.dst && item.dst.trim() ? item.dst : item.src;
        return `
          <div class="alif-exc-pair">
            <span><strong>${escapeHtml(item.src)}</strong> → ${escapeHtml(dstText)}</span>
            <button type="button" class="alif-mini-btn alif-mini-danger" data-del-exc="${idx}">O‘chirish</button>
          </div>
        `;
      })
      .join('');
  }

  if (elBtnExceptions) {
    elBtnExceptions.addEventListener('click', () => {
      updateExceptionUI();
      elExcModal.hidden = false;
      elExcSrc.focus();
    });
  }

  [elExcClose, elExcCloseBg].forEach((el) => {
    if (el) el.addEventListener('click', () => { elExcModal.hidden = true; });
  });

  if (elExcForm) {
    elExcForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const src = (elExcSrc.value || '').trim();
      const dst = (elExcDst.value || '').trim() || src;
      if (!src) return;
      exceptions.push({ src: src, dst: dst });
      elExcSrc.value = '';
      elExcDst.value = '';
      saveExceptions();
      runConversion();
    });
  }

  if (elExcList) {
    elExcList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-del-exc]');
      if (!btn) return;
      const idx = Number(btn.getAttribute('data-del-exc'));
      exceptions.splice(idx, 1);
      saveExceptions();
      runConversion();
    });
  }

  let jsZipPromise = null;
  function loadJsZip() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    if (jsZipPromise) return jsZipPromise;
    jsZipPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = resolveVendorUrl('jszip.min.js');
      script.onload = () => window.JSZip ? resolve(window.JSZip) : reject(new Error('JSZip topilmadi'));
      script.onerror = () => reject(new Error('web/vendor/jszip.min.js yuklanmadi'));
      document.head.appendChild(script);
    });
    return jsZipPromise;
  }

  let pdfJsPromise = null;
  function loadPdfJs() {
    if (pdfJsPromise) return pdfJsPromise;
    pdfJsPromise = import(resolveVendorUrl('pdf.min.mjs')).then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = resolveVendorUrl('pdf.worker.min.mjs');
      return pdfjsLib;
    });
    return pdfJsPromise;
  }

  function readTxtFile(file) {
    return file.text();
  }

  async function readDocxFile(file) {
    const JSZip = await loadJsZip();
    const buf = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buf);
    const docEntry = zip.file('word/document.xml');
    if (!docEntry) throw new Error('DOCX ichida word/document.xml topilmadi.');

    const xmlText = await docEntry.async('string');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
    const paragraphs = xmlDoc.getElementsByTagName('w:p');
    const lines = [];

    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      let line = '';
      const walker = xmlDoc.createTreeWalker(p, NodeFilter.SHOW_ELEMENT);
      let node = walker.nextNode();
      while (node) {
        if (node.nodeName === 'w:t') {
          line += node.textContent || '';
        } else if (node.nodeName === 'w:br' || node.nodeName === 'w:cr') {
          line += '\n';
        } else if (node.nodeName === 'w:tab') {
          line += '\t';
        }
        node = walker.nextNode();
      }
      lines.push(line);
    }
    return lines.join('\n');
  }

  async function readPdfFile(file) {
    const pdfjsLib = await loadPdfJs();
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const pages = [];

    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      let pageText = '';
      let lastY = null;

      for (let i = 0; i < content.items.length; i++) {
        const item = content.items[i];
        const str = item.str || '';
        const y = item.transform ? item.transform[5] : null;

        if (lastY !== null && y !== null && Math.abs(y - lastY) > 4) {
          pageText += '\n';
        } else if (pageText && !pageText.endsWith(' ') && !pageText.endsWith('\n') && str && !str.startsWith(' ')) {
          pageText += ' ';
        }

        pageText += str;
        if (item.hasEOL) {
          pageText += '\n';
          lastY = null;
        } else if (y !== null) {
          lastY = y;
        }
      }
      pages.push(pageText.trim());
    }
    return pages.join('\n\n');
  }

  async function handleFile(file) {
    if (!file) return;
    const name = file.name || 'hujjat';
    const ext = name.split('.').pop().toLowerCase();
    currentFileName = name.replace(/\.[^.]+$/, '') + '-yangi-alifbo';

    showStatus(`"${name}" o‘qilmoqda...`, false);

    try {
      let extracted = '';
      if (ext === 'txt') {
        extracted = await readTxtFile(file);
      } else if (ext === 'docx') {
        extracted = await readDocxFile(file);
      } else if (ext === 'pdf') {
        extracted = await readPdfFile(file);
      } else {
        throw new Error('Faqat .docx, .pdf va .txt fayllar qo‘llab-quvvatlanadi.');
      }

      elInput.value = extracted;
      runConversion();
      showStatus(`"${name}" muvaffaqiyatli yuklandi va yangi alifboga o‘girildi.`, false);
    } catch (err) {
      showStatus(`Xatolik: ${err && err.message ? err.message : err}`, true);
    }
  }

  function sanitizeXmlText(str) {
    return str
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\uFFFE\uFFFF]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function exportTxt() {
    const text = elOutput.value || '';
    if (!text.trim()) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, `${currentFileName}.txt`);
  }

  async function exportDocx() {
    const text = elOutput.value || '';
    if (!text.trim()) return;

    try {
      const JSZip = await loadJsZip();
      const zip = new JSZip();

      const paragraphsXml = text
        .split(/\r?\n/)
        .map((line) => `<w:p><w:r><w:t xml:space="preserve">${sanitizeXmlText(line)}</w:t></w:r></w:p>`)
        .join('');

      zip.file(
        '[Content_Types].xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
      );

      zip.file(
        '_rels/.rels',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
      );

      zip.file(
        'word/document.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${paragraphsXml}</w:body>
</w:document>`
      );

      const blob = await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      triggerDownload(blob, `${currentFileName}.docx`);
    } catch (err) {
      showStatus(`Word (.docx) yaratishda xatolik: ${err.message}`, true);
    }
  }

  function exportPdf() {
    const text = elOutput.value || '';
    if (!text.trim()) return;

    const win = window.open('', '_blank');
    if (!win) {
      showStatus('Brauzer yangi oynani blokladi. Pop-up ruxsatini yoqing.', true);
      return;
    }

    const safeHtml = escapeHtml(text).replace(/\r?\n/g, '<br/>');
    win.document.open();
    win.document.write(`<!doctype html>
<html lang="uz">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(currentFileName)}</title>
  <style>
    body { font-family: "Segoe UI", Arial, sans-serif; font-size: 13pt; line-height: 1.6; color: #111; padding: 24mm 20mm; }
  </style>
</head>
<body>${safeHtml}</body>
</html>`);
    win.document.close();

    win.onload = function () {
      win.focus();
      win.print();
    };
  }

  elInput.addEventListener('input', runConversion);
  elDirection.addEventListener('change', runConversion);
  if (elOptNg) elOptNg.addEventListener('change', runConversion);

  elBtnSample.addEventListener('click', () => {
    elInput.value =
      "O'zbekiston Respublikasi — Markaziy Osiyodagi go'zal va jadal rivojlanayotgan davlat.\n" +
      "Шаҳар ва қишлоқларда янги мактаблар, кутубхоналар ҳамда илм-фан марказлари очилмоқда.\n" +
      "Chiroyli g'oyalar va sifatli ta'lim kelajak poydevoridir.";
    runConversion();
  });

  elBtnPaste.addEventListener('click', async () => {
    try {
      const clip = await navigator.clipboard.readText();
      elInput.value = clip;
      runConversion();
    } catch (_) {
      elInput.focus();
      showStatus('Brauzer buferga ruxsat bermadi — Ctrl+V (Cmd+V) tugmasini bosing.', true);
    }
  });

  elBtnClear.addEventListener('click', () => {
    elInput.value = '';
    currentFileName = 'alif-yangi-alifbo';
    showStatus('', false);
    runConversion();
  });

  elBtnSwap.addEventListener('click', () => {
    const out = elOutput.value;
    if (!out) return;
    elInput.value = out;
    if (elDirection.value === 'auto2new' || elDirection.value === 'oldlat2new' || elDirection.value === 'cyr2new') {
      elDirection.value = 'new2oldlat';
    } else {
      elDirection.value = 'auto2new';
    }
    runConversion();
  });

  let copyTimer = null;
  elBtnCopy.addEventListener('click', async () => {
    const out = elOutput.value || '';
    if (!out) return;
    try {
      await navigator.clipboard.writeText(out);
    } catch (_) {
      elOutput.select();
      document.execCommand('copy');
    }
    elBtnCopy.textContent = 'Nusxa olindi ✓';
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      elBtnCopy.textContent = 'Nusxa olish';
    }, 1800);
  });

  elBtnUpload.addEventListener('click', (e) => {
    e.stopPropagation();
    elFileInput.click();
  });

  elDropzone.addEventListener('click', () => elFileInput.click());
  elDropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      elFileInput.click();
    }
  });

  elDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elDropzone.classList.add('is-dragover');
  });

  elDropzone.addEventListener('dragleave', () => {
    elDropzone.classList.remove('is-dragover');
  });

  elDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    elDropzone.classList.remove('is-dragover');
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  elFileInput.addEventListener('change', () => {
    const file = elFileInput.files && elFileInput.files[0];
    if (file) handleFile(file);
    elFileInput.value = '';
  });

  elExportTxt.addEventListener('click', exportTxt);
  elExportDocx.addEventListener('click', exportDocx);
  elExportPdf.addEventListener('click', exportPdf);

  updateExceptionUI();
  runConversion();
})();
