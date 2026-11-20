(function () {
  var WB = [
    "özbekiston","şahar","toğ","çiroyli","örganuv","birikkanlik","romantik",
    "gulduros","samar","şumoyoq","aytgançalik","töğri","yoziş","öqiş","ğalaba",
    "şirin","çoğ","vaqt","kitob","maktab","talaba","bilim","ilhom","kelajak",
    "işonç","mehnat","tabiat","bahor","yomğir","quyosh","şabada","daryo",
    "vodiysi","farğona","şahrisabz","samarqand","buxoro","navoiy","xorazm",
    "qarşi","termiz","namangan","andijon","jizzax","guliston","nukus","köprik",
    "yöl","manzil","safar","döstlik","hurmat","fazilat","muhim","qulay","oson",
    "tezlik","aniqlik","natija","harakat","maqsad","orzu","umid","quvonç",
    "baxt","tinçlik","obod","yurt","xalq","tarix","madaniyat","sanat","musiqa",
    "asar","hikoya","maqola","gazeta","jurnal","sahifa","matn","hujjat",
    "alifbo","harf","tovuş","söz","gap","fikr","savol","javob","yeçim","usul",
    "tajriba","amaliyot","dastur","kompyuter","klaviatura","ekran","tugma",
    "oyna","tizim","tarmoq","xavfsiz"
  ];

  var mode = "time";
  var targetVal = 30;
  var words = [];
  var typedWords = [];
  var curIdx = 0;
  var startedAt = null;
  var timerId = null;
  var finished = false;
  var bestWpm = parseInt(localStorage.getItem("alif_best_wpm") || "0", 10) || 0;

  function conv(v) {
    return v
      .replace(/([Oo])['ʻ’‘ʼ`]/g, function (_, c) { return c === "O" ? "Ö" : "ö"; })
      .replace(/([Gg])['ʻ’‘ʼ`]/g, function (_, c) { return c === "G" ? "Ğ" : "ğ"; })
      .replace(/([Ss])[Hh]/g, function (_, c) { return c === "S" ? "Ş" : "ş"; })
      .replace(/([Cc])[Hh]/g, function (_, c) { return c === "C" ? "Ç" : "ç"; });
  }

  function pick(n) {
    var out = [];
    for (var i = 0; i < n; i++) {
      out.push(WB[Math.floor(Math.random() * WB.length)]);
    }
    return out;
  }

  function updBest() {
    var e = document.getElementById("trBest");
    if (e) e.textContent = bestWpm > 0 ? bestWpm + " WPM" : "—";
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

  function finish() {
    if (finished) return;
    finished = true;
    clearInterval(timerId);
    var inp = document.getElementById("trHiddenInput");
    if (inp) inp.disabled = true;
    updCnt();
    render();
    var s = stats();
    if (s.acc >= 75 && s.wpm > bestWpm) {
      bestWpm = s.wpm;
      localStorage.setItem("alif_best_wpm", String(bestWpm));
      updBest();
    }
    var rt = document.getElementById("trResultText");
    var rb = document.getElementById("trResultBanner");
    if (rt) rt.innerHTML = "<strong>Natija:</strong> <b>" + s.wpm + " WPM</b> · Aniqlik: <b>" + s.acc + "%</b> (" + s.sec.toFixed(1) + "s)";
    if (rb) rb.hidden = false;
  }

  window.focusAlifTrainer = function () {
    var i = document.getElementById("trHiddenInput");
    if (i && !i.disabled) i.focus();
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
    if (inp) inp.focus();
  };

  function boot() {
    var inp = document.getElementById("trHiddenInput");
    var st = document.getElementById("trStage");
    if (!inp || !st) return;

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
