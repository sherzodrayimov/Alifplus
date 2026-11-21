(function () {
  'use strict';
  document.documentElement.removeAttribute('data-design');
  try { localStorage.removeItem('alif_design_variant'); } catch (e) {}

  function initVisualFX() {
    // 1. Sokin mikro-nuqtali orqa fon va suzuvchi nur auralari
    if (!document.getElementById('alifAmbientBg')) {
      var bg = document.createElement('div');
      bg.id = 'alifAmbientBg';
      bg.className = 'alif-ambient-bg';
      bg.setAttribute('aria-hidden', 'true');
      bg.innerHTML =
        '<div class="alif-ambient-orb alif-ambient-orb--1"></div>' +
        '<div class="alif-ambient-orb alif-ambient-orb--2"></div>' +
        '<div class="alif-ambient-orb alif-ambient-orb--3"></div>';
      document.body.insertBefore(bg, document.body.firstChild);
    }

    // 2. Barcha tugmalarda bosilgan joydan tarqaluvchi Ripple to'lqini
    document.addEventListener('pointerdown', function (e) {
      var btn = e.target.closest('button, .alif-hero-btn-primary, .alif-hero-btn-secondary, .alif-doc-tab, .alif-doc-sbtn, .alif-doc-scbtn, #alifDesktopApp a');
      if (!btn) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement('span');
      ripple.className = 'alif-ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 600);
    }, { passive: true });

    // 3. GSAP orqali qo'shimcha ravon kartochka va tugma animatsiyalari
    if (window.gsap && window.ScrollTrigger && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.gsap.utils.toArray('.alif-doc-form-card, .alif-doc-preview-card, .alif-bm-card').forEach(function (card) {
        window.gsap.from(card, {
          opacity: 0,
          y: 22,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 86%',
            once: true
          }
        });
      });
    }
  }

  if (document.body) initVisualFX();
  else window.addEventListener('DOMContentLoaded', initVisualFX);

  // 4. Bosh sahifadagi tezkor mini-konverter + Konverter sahifasidagi Visual Diff + Mashq rekordlari
  function initPageEnhancements() {
    function quickConvert(s) {
      if (window.AlifSmartEngine && typeof window.AlifSmartEngine.convert === 'function') {
        return (window.AlifSmartEngine.convert || window.AlifSmartEngine.smartConvertText)(s, 'to_new');
      }
      var cyr = {'Ё':'Yo','ё':'yo','Ю':'Yu','ю':'yu','Я':'Ya','я':'ya','Ц':'Ts','ц':'ts','Щ':'Ş','щ':'ş','Ш':'Ş','ш':'ş','Ч':'Ç','ч':'ç','Ў':'Ö','ў':'ö','Қ':'Q','қ':'q','Ғ':'Ğ','ғ':'ğ','Ҳ':'H','ҳ':'h','А':'A','а':'a','Б':'B','б':'b','В':'V','в':'v','Г':'G','г':'g','Д':'D','д':'d','Е':'E','е':'e','Ж':'J','ж':'j','З':'Z','з':'z','И':'I','и':'i','Й':'Y','й':'y','К':'K','к':'k','Л':'L','л':'l','М':'M','м':'m','Н':'N','н':'n','О':'O','о':'o','П':'P','п':'p','Р':'R','р':'r','С':'S','с':'s','Т':'T','т':'t','У':'U','у':'u','Ф':'F','ф':'f','Х':'X','х':'x','Ъ':'’','ъ':'’','Ь':'','ь':'','Э':'E','э':'e'};
      s = s.replace(/([Oo])['ʻ’‘ʼ`]/g, function(_, c) { return c === 'O' ? 'Ö' : 'ö'; })
           .replace(/([Gg])['ʻ’‘ʼ`]/g, function(_, c) { return c === 'G' ? 'Ğ' : 'ğ'; })
           .replace(/S[Hh]/g, 'Ş').replace(/sh/g, 'ş')
           .replace(/C[Hh]/g, 'Ç').replace(/ch/g, 'ç');
      if (/[А-Яа-яЎўҚқҒғҲҳЁё]/.test(s)) {
        s = s.replace(/(^|[\s("«])([Ее])/g, function(_, p, e) { return p + (e === 'Е' ? 'Ye' : 'ye'); })
             .replace(/[А-Яа-яЎўҚқҒғҲҳЁёЪъЬь]/g, function(ch) { return cyr[ch] !== undefined ? cyr[ch] : ch; });
      }
      return s;
    }

    // Bosh sahifa tezkor konverter
    var qIn = document.getElementById('alifQuickInput');
    var qOut = document.getElementById('alifQuickOutput');
    if (qIn && qOut) {
      qIn.addEventListener('input', function () { qOut.value = quickConvert(qIn.value); });
      var qSample = document.getElementById('alifQuickSample');
      if (qSample) {
        qSample.addEventListener('click', function () {
          qIn.value = "O'zbekiston Respublikasida yangi alifbo 2027-yil 22-apreldan kuchga kiradi. Toshkent shahri va tog'li hududlar haqida YouTube orqali video tayyorlandi.";
          qOut.value = quickConvert(qIn.value);
        });
      }
      var qCopy = document.getElementById('alifQuickCopy');
      if (qCopy) {
        qCopy.addEventListener('click', function () {
          if (!qOut.value) return;
          if (navigator.clipboard) navigator.clipboard.writeText(qOut.value);
          var prev = qCopy.textContent;
          qCopy.textContent = '✓ Nusxalandi';
          setTimeout(function () { qCopy.textContent = prev; }, 1400);
        });
      }
    }

    // Konverter sahifasi Visual Diff
    var cIn = document.getElementById('alifInput');
    var cOut = document.getElementById('alifOutput');
    var diffBox = document.getElementById('alifVisualDiffBox');
    var diffSum = document.getElementById('alifDiffSummary');
    if (cIn && cOut && diffBox) {
      function escHtml(t) {
        return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
      function renderDiff() {
        var raw = cIn.value || '';
        var out = cOut.value || '';
        if (!out.trim()) {
          diffBox.textContent = 'Matn kiritilganda natija tahlili şu yerda körinadi...';
          if (diffSum) diffSum.textContent = 'Matn kiriting — özgarğan harflar rang bilan ajratiladi';
          return;
        }
        var changedCount = 0;
        var keptCount = 0;
        var tokens = out.split(/(\s+)/);
        var html = tokens.map(function (tok) {
          if (!tok || /^\s+$/.test(tok)) return tok;
          if (/[ÖöĞğŞşÇç]/.test(tok)) {
            changedCount++;
            return escHtml(tok).replace(/([ÖöĞğŞşÇç])/g, '<mark class="alif-diff-ch">$1</mark>');
          }
          if (/[sh|ch|w|x|q]/i.test(tok) && /^[A-Za-z0-9'-]+$/.test(tok) && /(sh|ch|th|tion|oo|ee|w)/i.test(tok) && raw.indexOf(tok) !== -1) {
            keptCount++;
            return '<span class="alif-diff-kept" title="Xorijiy/istisno söz saqlandi">' + escHtml(tok) + '</span>';
          }
          return escHtml(tok);
        }).join('');
        diffBox.innerHTML = html;
        if (diffSum) {
          diffSum.textContent = changedCount + ' ta sözda yangi harf qöllandi' + (keptCount ? ' · ' + keptCount + ' ta xorijiy söz himoyalandi' : '');
        }
      }
      cIn.addEventListener('input', function () { setTimeout(renderDiff, 30); });
      var obs = new MutationObserver(renderDiff);
      obs.observe(cOut, { attributes: true, childList: true, characterData: true });
      setInterval(function () {
        if (diffBox.dataset.lastVal !== cOut.value) {
          diffBox.dataset.lastVal = cOut.value;
          renderDiff();
        }
      }, 450);
    }

    // Mashq sahifasi shaxsiy rekordlar
    var bestEl = document.getElementById('alifBestWpm');
    if (bestEl) {
      function loadRecs() {
        var best = parseInt(localStorage.getItem('alif_tr_best') || '0', 10);
        var last = parseInt(localStorage.getItem('alif_tr_last') || '0', 10);
        var runs = parseInt(localStorage.getItem('alif_tr_runs') || '0', 10);
        bestEl.textContent = best + ' WPM';
        var lastEl = document.getElementById('alifLastWpm');
        var runsEl = document.getElementById('alifTotalRuns');
        if (lastEl) lastEl.textContent = last + ' WPM';
        if (runsEl) runsEl.textContent = runs;
      }
      loadRecs();
      setInterval(function () {
        var wpmNode = document.querySelector('#alifTrainer [id*="Wpm"], #alifTrainer .alif-tr-wpm');
        if (wpmNode) {
          var val = parseInt(wpmNode.textContent, 10);
          var resModal = document.querySelector('#alifTrainer [id*="Result"]:not([hidden])');
          if (resModal && val > 0 && resModal.dataset.counted !== '1') {
            resModal.dataset.counted = '1';
            var best = Math.max(val, parseInt(localStorage.getItem('alif_tr_best') || '0', 10));
            var runs = parseInt(localStorage.getItem('alif_tr_runs') || '0', 10) + 1;
            localStorage.setItem('alif_tr_best', String(best));
            localStorage.setItem('alif_tr_last', String(val));
            localStorage.setItem('alif_tr_runs', String(runs));
            loadRecs();
          }
        }
      }, 900);
    }
  }

  if (document.body) initPageEnhancements();
  else window.addEventListener('DOMContentLoaded', initPageEnhancements);


  // 5. Mobil menyu tugmasi (Hamburger Drawer) + Bosh sahifada Lazy Load
  function initMobileAndLazy() {
    var topbar = document.querySelector('.alif-topbar');
    var nav = document.querySelector('.alif-nav');
    if (topbar && nav && !document.getElementById('alifMobileMenuBtn')) {
      var mBtn = document.createElement('button');
      mBtn.type = 'button';
      mBtn.id = 'alifMobileMenuBtn';
      mBtn.className = 'alif-mobile-menu-btn';
      mBtn.setAttribute('aria-expanded', 'false');
      mBtn.setAttribute('aria-label', 'Menyuni ochish');
      mBtn.innerHTML = '<span>☰</span><span>Menyu</span>';
      nav.parentNode.insertBefore(mBtn, nav);

      mBtn.addEventListener('click', function () {
        var open = topbar.classList.toggle('is-menu-open');
        mBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        mBtn.innerHTML = open ? '<span>✕</span><span>Yopish</span>' : '<span>☰</span><span>Menyu</span>';
      });
    }

    // Bosh sahifadagi tezkor konverterga foydalanuvchi kirgandagina smart-engine.js ni Lazy Load qilish
    var qIn = document.getElementById('alifQuickInput');
    if (qIn && !window.AlifSmartEngine) {
      var loaded = false;
      function loadEngineOnce() {
        if (loaded) return;
        loaded = true;
        var s = document.createElement('script');
        s.src = 'web/smart-engine.js';
        s.onload = function () {
          if (qIn.value && window.AlifSmartEngine) {
            var qOut = document.getElementById('alifQuickOutput');
            if (qOut) qOut.value = (window.AlifSmartEngine.convert || window.AlifSmartEngine.smartConvertText)(qIn.value, 'to_new');
          }
        };
        document.body.appendChild(s);
      }
      qIn.addEventListener('focus', loadEngineOnce, { once: true });
      qIn.addEventListener('input', loadEngineOnce, { once: true });
      var qSample = document.getElementById('alifQuickSample');
      if (qSample) qSample.addEventListener('click', loadEngineOnce, { once: true });
    }

    // Konverter sahifasida avtomatik test natijasini ko'rsatish
    var diffSum = document.getElementById('alifDiffSummary');
    if (diffSum && typeof window.runAlifTests === 'function') {
      var rep = window.runAlifTests();
      if (rep.failedCount === 0) {
        diffSum.textContent = '✓ ' + rep.passed + '/' + rep.total + ' ta avtomatik imlo va istisno testidan ötdi';
      }
    }
  }

  if (document.body) initMobileAndLazy();
  else window.addEventListener('DOMContentLoaded', initMobileAndLazy);

})();

  // Global xavfsiz nusxa olish (Promise + fallback + screen reader xabari)
  window.alifCopySafe = async function (text, triggerBtn) {
    var msg = '';
    var ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch (err) {
      ok = false;
    }
    msg = ok ? '✓ Nusxa olindi' : '✕ Nusxalab bo‘lmadi';
    var live = document.getElementById('alifAriaLive');
    if (live) live.textContent = ok ? 'Matn buferga nusxalandi.' : 'Matnni nusxalashda xatolik yuz berdi.';
    if (triggerBtn) {
      var prev = triggerBtn.dataset.origText || triggerBtn.textContent;
      triggerBtn.dataset.origText = prev;
      triggerBtn.textContent = msg;
      setTimeout(function () { triggerBtn.textContent = prev; }, 1600);
    }
    return ok;
  };
