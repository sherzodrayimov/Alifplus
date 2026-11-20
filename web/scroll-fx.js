(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Yuqori skrol chizig'i
  var bar = document.createElement('div');
  bar.className = 'alif-scroll-bar';
  document.body.appendChild(bar);

  function updateScrollBar() {
    var h = document.documentElement;
    var max = (h.scrollHeight - h.clientHeight) || 1;
    bar.style.width = Math.min(100, Math.max(0, (window.scrollY / max) * 100)) + '%';
  }
  window.addEventListener('scroll', updateScrollBar, { passive: true });
  updateScrollBar();

  // Skrol hikoya blokini Hero ichiga joylash (sayt tartibini buzmasdan)
  var heroContainer = document.querySelector('#alifConverter .alif-container');
  if (heroContainer && !document.getElementById('alifScrollStory')) {
    var box = document.createElement('div');
    box.id = 'alifScrollStory';
    box.className = 'alif-story-showcase';
    box.innerHTML =
      '<div class="alif-story-label">Skrol qilib kuzating · Aqlli morfologiya va filtr</div>' +
      '<p class="alif-story-line" id="alifStoryLine"></p>' +
      '<ul class="alif-story-steps" id="alifStorySteps">' +
        '<li class="is-active"><b>1. Oddiy teriş:</b> Foydalanuvchi odatiy lotin klaviaturasida yozadi.</li>' +
        '<li><b>2. Özbekça sözlar:</b> Boğçada, çoy, gaplaşişdi — avtomatik 28 harfga ötadi.</li>' +
        '<li><b>3. Inglizça istisno:</b> push va chat kabi 10 057 ta xorijiy söz buzilmaydi.</li>' +
      '</ul>';
    heroContainer.appendChild(box);
  }

  var tokens = [
    { raw: "Bog'chada", fin: "Boğçada", type: "uz" },
    { raw: " " },
    { raw: "o'g'il-qizlar", fin: "öğil-qizlar", type: "uz" },
    { raw: " " },
    { raw: "choy", fin: "çoy", type: "uz" },
    { raw: " " },
    { raw: "ichib,", fin: "içib,", type: "uz" },
    { raw: " " },
    { raw: "push", fin: "push", type: "kept" },
    { raw: " " },
    { raw: "va", fin: "va", type: "plain" },
    { raw: " " },
    { raw: "chat", fin: "chat", type: "kept" },
    { raw: " " },
    { raw: "haqida", fin: "haqida", type: "plain" },
    { raw: " " },
    { raw: "gaplashishdi.", fin: "gaplaşişdi.", type: "uz" }
  ];

  var lineEl = document.getElementById('alifStoryLine');
  var stepEls = document.querySelectorAll('#alifStorySteps li');
  var wordRefs = [];

  if (lineEl) {
    tokens.forEach(function (t) {
      if (!t.type) {
        lineEl.appendChild(document.createTextNode(t.raw));
        return;
      }
      var sp = document.createElement('span');
      sp.className = 'alif-story-word';
      sp.textContent = reduce ? t.fin : t.raw;
      if (reduce && t.type === 'uz') sp.classList.add('is-converted');
      if (reduce && t.type === 'kept') sp.classList.add('is-kept');
      var cr = document.createElement('span');
      cr.className = 'alif-story-caret';
      lineEl.appendChild(sp);
      lineEl.appendChild(cr);
      wordRefs.push({ el: sp, caret: cr, data: t });
    });
  }

  function setStep(idx) {
    stepEls.forEach(function (li, i) { li.classList.toggle('is-active', i === idx); });
  }

  function initGSAP() {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger || reduce) return;
    gsap.registerPlugin(ScrollTrigger);

    // 1. Hero ochilish xoreografiyasi
    var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
    intro
      .from('.alif-hero-pill', { opacity: 0, y: 14, duration: 0.7 })
      .from('.alif-hero-title', { opacity: 0, y: 24, duration: 0.9 }, 0.1)
      .from('.alif-hero-sub', { opacity: 0, y: 16, duration: 0.8 }, 0.22)
      .from('.alif-rule-chip', { opacity: 0, y: 12, scale: 0.94, stagger: 0.07, duration: 0.6 }, 0.3)
      .from('.alif-hero-actions > *', { opacity: 0, y: 12, stagger: 0.1, duration: 0.7 }, 0.42)
      .from('.alif-hero-stage', { opacity: 0, y: 26, duration: 1.0 }, 0.35);

    // 2. Skrolga bog'langan jonli jumla (Pinned on desktop, auto-scrub on mobile)
    if (wordRefs.length) {
      var renderProgress = function (p) {
        var total = wordRefs.length;
        var activeIdx = Math.min(total - 1, Math.floor(p * total));
        wordRefs.forEach(function (w, i) {
          w.caret.classList.toggle('is-on', p > 0.01 && p < 0.99 && i === activeIdx);
          if (i <= activeIdx && p > 0.02) {
            w.el.textContent = w.data.fin;
            if (w.data.type === 'uz') w.el.classList.add('is-converted');
            if (w.data.type === 'kept') w.el.classList.add('is-kept');
          } else {
            w.el.textContent = w.data.raw;
            w.el.classList.remove('is-converted', 'is-kept');
          }
        });
        setStep(p < 0.22 ? 0 : p < 0.65 ? 1 : 2);
      };

      var mm = gsap.matchMedia();
      mm.add('(min-width: 960px)', function () {
        ScrollTrigger.create({
          trigger: '#alifScrollStory',
          start: 'center center',
          end: '+=110%',
          pin: true,
          scrub: 0.4,
          onUpdate: function (self) { renderProgress(self.progress); }
        });
      });
      mm.add('(max-width: 959px)', function () {
        ScrollTrigger.create({
          trigger: '#alifScrollStory',
          start: 'top 80%',
          end: 'bottom 25%',
          scrub: 0.3,
          onUpdate: function (self) { renderProgress(self.progress); }
        });
      });
    }

    // 3. Pastdagi barcha bo'limlar uchun ravon skrol ochilishi
    gsap.utils.toArray('main section').forEach(function (sec, idx) {
      if (idx === 0) return;
      gsap.from(sec, {
        opacity: 0,
        y: 32,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sec,
          start: 'top 84%',
          once: true
        }
      });
    });

    // 4. Yuqori menyu havolalarini skrolga qarab faollashtirish
    document.querySelectorAll('.alif-nav-link[href^="#"]').forEach(function (link) {
      var target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      ScrollTrigger.create({
        trigger: target,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: function (self) {
          link.classList.toggle('is-scroll-active', self.isActive);
        }
      });
    });
  }

  if (window.gsap && window.ScrollTrigger) {
    initGSAP();
  } else {
    window.addEventListener('load', initGSAP);
  }
})();
