(function () {
  var SPECIAL_WB = [
    "şamol", "öqituvçilik", "ğalaba", "köça", "boğçalar", "işonçli", "töğrilik",
    "çiroyli", "yaşil", "qöşiqçilik", "mağrurlik", "öyinçoqlar", "taşakkurnoma",
    "çörakxona", "soğlomlaştiriş", "yönalişlar", "ğildiraklar", "şirinlik", "qöçqor",
    "uçqun", "maşğulotlar", "köprik", "ağdarilmoq", "beşavqatlik", "çumoli", "ösimlikşunoslik",
    "doğ", "quş", "sözlaşuv", "ğişt", "keça", "uluğvorlik", "şifokor", "tölqinlanmoq",
    "yağmurgir", "öçirğiç", "haşarotşunos", "çöntak", "muğombirlik", "quyöş", "taşvişlanmoq",
    "qisqiçbaqa", "bağir", "ötmiş", "şon-şuhrat", "çuçvara", "eğilmoq", "köriniş", "oşxona",
    "ğayratli", "töppa-töğri", "yaşamoq", "qöşniçilik", "buğdoyzor", "işçilar",
    "söroq", "çaraqlamoq", "lağmon", "şovqin-suron", "öquvçilik", "boğbonçilik", "peşona",
    "ğurur", "köngilçan", "aşulaçi", "tösiqlar", "çoynak", "tuğilmoq", "naqşinkor", "böri",
    "soğliqni", "şaharsozlik", "ölkaşunoslik", "ğazablanmoq", "keşikçi", "qölqop", "muşkullik",
    "bağri", "yöqolmoq", "taşqi", "ğizillamoq", "bölinma", "şoir", "çeçak", "oğirlik",
    "örmonçilik", "duşmançilik", "çin", "uğur", "şarqşunoslik", "kötarmoq", "ğamginlik",
    "işora", "qiliçbozlik", "böşliq", "çağirmoq", "tuşunçalar", "şaxsiyat", "öçmoq",
    "dağallik", "eşik", "çana", "yoğdu", "köçmançi", "haşar", "sönmoq", "çiroq",
    "mağlubiyat", "şubhalanmoq", "örganmoq", "buğlama", "oşpazlik", "çöp", "ğariblik",
    "yölak", "işlamoq", "böyinboğ", "çoğ", "şar", "öyin", "iğvogarlik", "pişirmoq",
    "qörqmoq", "töliq", "laşkarboşi", "çamanzor", "oğri", "özbekçilik", "nişon", "çoy",
    "ğoyaviy", "közgu", "baxşida", "çiqmoq", "soğ", "ösmoq", "şer", "çang-tözon", "toğ",
    "qişloq", "böy", "iştiyoq", "çizmoq", "ğoz", "töy", "paşşa", "çöl", "buğ", "ördak",
    "maşhur", "oğuz", "qöy", "çala", "ğam", "kömir", "aşyo", "çoçmoq", "boğlam", "şirin",
    "öqimoq", "ğazalxonlik", "kuçli", "söz", "naşriyot", "baliğ", "öş", "hoş", "kölak",
    "maşq", "toş", "öy", "raşq", "boğliq", "örin", "ğalat", "köz", "iş", "çap", "tuğ",
    "töla", "öç", "yoğ", "qöymoq", "maşinasozlik", "ölçaş", "duş", "bölak", "xursandçilik",
    "kömaklaşmoq", "beş", "uğurli", "töğriçilik", "ğayratşijoat", "şarqona", "çörakçi",
    "Özbekiston", "Ğalaba", "Şahar", "Çiroyli", "Töğri", "Qöşiq"
  ];

  var GENERAL_WB = SPECIAL_WB.concat([
    "kitob", "maktab", "talaba", "kelajak", "vatan", "bilim", "ilm", "fan", "madaniyat",
    "tarix", "adabiyot", "matematika", "dastur", "kompyuter", "internet", "texnologiya",
    "taraqqiyot", "hamkorlik", "dustlik", "tinchlik", "mehnat", "harakat", "natija",
    "senga", "menga", "teng", "keng", "tong", "yangi", "rang", "dengiz", "ming",
    "universitet", "diplomatiya", "iqtisodiyot", "xalqaro", "aloqa", "loyiha", "tizim"
  ]);

  var mode = "time";
  var focusMode = "special";
  var targetVal = 30;
  var words = [];
  var typedWords = [];
  var curIdx = 0;
  var startedAt = null;
  var timerId = null;
  var finished = false;
  var bestWpm = parseInt(localStorage.getItem("alif_best_wpm") || "0", 10) || 0;
  var charErrors = {};
  try {
    charErrors = JSON.parse(localStorage.getItem("alif_tr_char_errors") || "{}") || {};
  } catch (e) { charErrors = {}; }

  function saveCharErrors() {
    try { localStorage.setItem("alif_tr_char_errors", JSON.stringify(charErrors)); } catch (e) {}
  }

  function renderCharErrors() {
    var box = document.getElementById("alifCharErrorList");
    if (!box) return;
    var entries = Object.keys(charErrors)
      .map(function (ch) { return { ch: ch, count: charErrors[ch] }; })
      .filter(function (x) { return x.count > 0; })
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, 8);

    if (entries.length === 0) {
      box.innerHTML = '<span style="color:var(--muted); font-size:13px;">Hali xatolar qayd etilmagan — maşqni boşlang!</span>';
      return;
    }
    var maxCnt = entries[0].count || 1;
    box.innerHTML = entries.map(function (it) {
      var isSpecial = /[ÖöĞğŞşÇç]/.test(it.ch);
      var pct = Math.max(14, Math.round((it.count / maxCnt) * 100));
      return '<div class="alif-err-pill' + (isSpecial ? ' is-special-err' : '') + '">' +
        '<div class="alif-err-top"><strong>' + it.ch + '</strong><span>' + it.count + ' xato</span></div>' +
        '<div class="alif-err-bar"><i style="width:' + pct + '%"></i></div>' +
      '</div>';
    }).join("");
  }

  function conv(v) {
    return v
      .replace(/([Oo])['ʻ’‘ʼ`]/g, function (_, c) { return c === "O" ? "Ö" : "ö"; })
      .replace(/([Gg])['ʻ’‘ʼ`]/g, function (_, c) { return c === "G" ? "Ğ" : "ğ"; })
      .replace(/([Ss])[Hh]/g, function (_, c) { return c === "S" ? "Ş" : "ş"; })
      .replace(/([Cc])[Hh]/g, function (_, c) { return c === "C" ? "Ç" : "ç"; });
  }

  function pick(n) {
    var pool = GENERAL_WB;
    if (focusMode === "special") {
      pool = SPECIAL_WB;
    } else if (focusMode === "errors") {
      var topChars = Object.keys(charErrors)
        .filter(function (k) { return charErrors[k] > 0; })
        .sort(function (a, b) { return charErrors[b] - charErrors[a]; })
        .slice(0, 4);
      if (topChars.length > 0) {
        var filtered = GENERAL_WB.filter(function (w) {
          var lw = w.toLowerCase();
          return topChars.some(function (ch) { return lw.indexOf(ch) !== -1; });
        });
        if (filtered.length >= 8) pool = filtered;
      } else {
        pool = SPECIAL_WB;
      }
    }
    var out = [];
    for (var i = 0; i < n; i++) {
      out.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return out;
  }

  function updBest() {
    var e = document.getElementById("trBest");
    if (e) e.textContent = bestWpm > 0 ? bestWpm + " WPM" : "—";
    var b2 = document.getElementById("alifBestWpm");
    if (b2) b2.textContent = bestWpm + " WPM";
  }

  function updCnt() {
    var e = document.getElementById("trCounter");
    if (!e) return;
    if (mode === "time") {
      var el = startedAt ? (Date.now() - startedAt) / 1000 : 0;
      e.textContent = Math.max(0, Math.ceil(targetVal - el)) + "s";
    } else {
      e.textContent = Math.min(curIdx, targetVal) + " / " + targetVal;
    }
  }

  function stats() {
    var sec = startedAt ? Math.max((Date.now() - startedAt) / 1000, 0.4) : 0;
    var ok = 0;
    var tot = 0;
    for (var i = 0; i <= curIdx && i < words.length; i++) {
      var t = words[i];
      var y = typedWords[i] || "";
      tot += y.length + (i < curIdx ? 1 : 0);
      for (var c = 0; c < Math.min(t.length, y.length); c++) {
        if (y[c] === t[c]) ok++;
      }
      if (i < curIdx && y === t) ok++;
    }
    var acc = tot > 0 ? Math.round((ok / tot) * 100) : 100;
    var wpm = sec > 0 ? Math.round((ok / 5) / (sec / 60)) : 0;
    var wEl = document.getElementById("trWpm");
    var aEl = document.getElementById("trAcc");
    if (wEl) wEl.textContent = wpm + " WPM";
    if (aEl) aEl.textContent = acc + "%";
    return { wpm: wpm, acc: acc, sec: sec };
  }

  function render() {
    var b = document.getElementById("trWords");
    if (!b) return;
    var h = [];
    for (var i = 0; i < words.length; i++) {
      var t = words[i];
      var y = typedWords[i] || "";
      var cur = i === curIdx && !finished;
      var err = i < curIdx && y !== t;
      var ls = [];
      for (var j = 0; j < Math.max(t.length, y.length); j++) {
        if (cur && j === y.length) ls.push('<span class="mt-caret"></span>');
        if (j < t.length) {
          var cls = "mt-ch" + (j < y.length ? (y[j] === t[j] ? " is-ok" : " is-err") : "");
          ls.push('<span class="' + cls + '">' + t[j] + "</span>");
        } else {
          ls.push('<span class="mt-ch is-extra">' + y[j] + "</span>");
        }
      }
      if (cur && y.length >= t.length) ls.push('<span class="mt-caret"></span>');
      h.push('<span class="mt-word' + (cur ? " is-active" : "") + (err ? " is-word-err" : "") + '">' + ls.join("") + "</span>");
    }
    b.innerHTML = h.join(" ");
    var a = b.querySelector(".mt-word.is-active");
    if (a) b.style.transform = "translateY(-" + Math.max(0, a.offsetTop - (a.offsetHeight || 38)) + "px)";
  }

  function recordWordErrors(expected, actual) {
    for (var i = 0; i < expected.length; i++) {
      var expCh = expected[i].toLowerCase();
      var gotCh = actual[i] ? actual[i].toLowerCase() : "";
      if (gotCh !== expCh && /[a-zöüğşç]/.test(expCh)) {
        charErrors[expCh] = (charErrors[expCh] || 0) + 1;
      }
    }
    saveCharErrors();
    renderCharErrors();
  }

  function finish() {
    if (finished) return;
    finished = true;
    clearInterval(timerId);
    var inp = document.getElementById("trHiddenInput");
    if (inp) inp.disabled = true;
    updCnt();
    render();
    var s = stats();
    if (s.acc >= 70 && s.wpm > bestWpm) {
      bestWpm = s.wpm;
      localStorage.setItem("alif_best_wpm", String(bestWpm));
    }
    var runs = (parseInt(localStorage.getItem("alif_tr_runs") || "0", 10) || 0) + 1;
    localStorage.setItem("alif_tr_runs", String(runs));
    localStorage.setItem("alif_tr_last", String(s.wpm));
    updBest();
    var lastEl = document.getElementById("alifLastWpm");
    var runsEl = document.getElementById("alifTotalRuns");
    if (lastEl) lastEl.textContent = s.wpm + " WPM";
    if (runsEl) runsEl.textContent = runs;

    var rt = document.getElementById("trResultText");
    var rb = document.getElementById("trResultBanner");
    if (rt) rt.innerHTML = "<strong>Natija:</strong> <b>" + s.wpm + " WPM</b> · Aniqlik: <b>" + s.acc + "%</b> (" + s.sec.toFixed(1) + "s)";
    if (rb) rb.hidden = false;
  }

  window.focusAlifTrainer = function () {
    var i = document.getElementById("trHiddenInput");
    if (i && !i.disabled) i.focus();
  };

  window.setAlifTrFocus = function (f) {
    focusMode = f;
    document.querySelectorAll(".alif-mt-opt[data-focus]").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.focus === f);
    });
    window.resetAlifTrainer();
  };

  window.setAlifTrMode = function (m) {
    mode = m;
    document.querySelectorAll(".alif-mt-opt[data-mode]").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.mode === m);
    });
    var tOpts = document.getElementById("alifTrTimeOpts");
    var wOpts = document.getElementById("alifTrWordOpts");
    if (tOpts) tOpts.hidden = m !== "time";
    if (wOpts) wOpts.hidden = m !== "words";
    targetVal = 30;
    document.querySelectorAll(".alif-mt-opt[data-val]").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.val === "30");
    });
    window.resetAlifTrainer();
  };

  window.setAlifTrVal = function (v) {
    targetVal = v;
    var box = document.getElementById(mode === "time" ? "alifTrTimeOpts" : "alifTrWordOpts");
    if (box) {
      box.querySelectorAll(".alif-mt-opt").forEach(function (b) {
        b.classList.toggle("is-active", parseInt(b.dataset.val, 10) === v);
      });
    }
    window.resetAlifTrainer();
  };

  window.resetAlifTrainer = function () {
    clearInterval(timerId);
    startedAt = null;
    finished = false;
    curIdx = 0;
    words = pick(mode === "words" ? targetVal : 65);
    typedWords = [""];
    var b = document.getElementById("trWords");
    var inp = document.getElementById("trHiddenInput");
    var rb = document.getElementById("trResultBanner");
    if (b) b.style.transform = "translateY(0)";
    if (rb) rb.hidden = true;
    if (inp) {
      inp.disabled = false;
      inp.value = "";
    }
    var wEl = document.getElementById("trWpm");
    var aEl = document.getElementById("trAcc");
    if (wEl) wEl.textContent = "0 WPM";
    if (aEl) aEl.textContent = "100%";
    updBest();
    updCnt();
    render();
    renderCharErrors();
    if (inp) inp.focus();
  };

  function boot() {
    var inp = document.getElementById("trHiddenInput");
    var st = document.getElementById("trStage");
    if (!inp || !st) return;

    var clearErrBtn = document.getElementById("alifResetCharErrors");
    if (clearErrBtn) {
      clearErrBtn.addEventListener("click", function () {
        charErrors = {};
        saveCharErrors();
        renderCharErrors();
      });
    }

    inp.addEventListener("focus", function () { st.classList.add("is-focused"); });
    inp.addEventListener("blur", function () { st.classList.remove("is-focused"); });

    inp.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        e.preventDefault();
        window.resetAlifTrainer();
      }
      if (!finished && e.key === "Backspace" && inp.value === "" && curIdx > 0 && typedWords[curIdx - 1] !== words[curIdx - 1]) {
        e.preventDefault();
        curIdx--;
        inp.value = typedWords[curIdx];
        render();
      }
    });

    inp.addEventListener("input", function () {
      if (finished) return;
      if (!startedAt) {
        startedAt = Date.now();
        timerId = setInterval(function () {
          updCnt();
          stats();
          if (mode === "time" && (Date.now() - startedAt) / 1000 >= targetVal) finish();
        }, 200);
      }
      var r = inp.value;
      if (r.endsWith(" ")) {
        var w = conv(r.trim());
        if (!w) {
          inp.value = "";
          return;
        }
        typedWords[curIdx] = w;
        if (w !== words[curIdx]) {
          recordWordErrors(words[curIdx], w);
        }
        curIdx++;
        inp.value = "";
        if (mode === "words" && curIdx >= targetVal) {
          finish();
          return;
        }
        if (mode === "time" && words.length - curIdx < 35) {
          words = words.concat(pick(40));
        }
        typedWords[curIdx] = "";
        updCnt();
        stats();
        render();
        return;
      }
      inp.value = conv(r);
      typedWords[curIdx] = inp.value;
      if (mode === "words" && curIdx === targetVal - 1 && typedWords[curIdx] === words[curIdx]) {
        curIdx++;
        finish();
        return;
      }
      stats();
      render();
    });

    window.resetAlifTrainer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
