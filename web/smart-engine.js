(function (root) {
  'use strict';
  var APOSTROPHES = /[ʻ’‘ʼ`´‛′]/g;
  var rejectSet = null;
  var lexSet = null;
  var suffixes = ["larning","larimiz","laringiz","larni","larga","larda","lardan","lari","lar","ning","miz","ingiz","dagi","gacha","lik","chi","dan","ga","da","ni","im","ing","si","di","gan","yapti","ish","uv"];

  function norm(s) { return (s || '').replace(APOSTROPHES, "'"); }
  function isUpper(c) { return c !== c.toLowerCase() && c === c.toUpperCase(); }

  function hasPattern(w) {
    var s = norm(w).toLowerCase();
    for (var i = 0; i < s.length - 1; i++) {
      if ((s[i] === 's' || s[i] === 'c') && s[i + 1] === "'" && s[i + 2] === 'h') { i += 2; continue; }
      if ((s[i] === 's' || s[i] === 'c') && s[i + 1] === 'h') return true;
      if ((s[i] === 'o' || s[i] === 'g') && s[i + 1] === "'") return true;
    }
    return false;
  }

  function convertWordRaw(w) {
    var s = norm(w), out = '';
    for (var i = 0; i < s.length; i++) {
      var lo = s[i].toLowerCase(), nx = s[i + 1] || '', nxLo = nx.toLowerCase();
      if ((lo === 's' || lo === 'c') && nx === "'" && (s[i + 2] || '').toLowerCase() === 'h') {
        out += s[i] + s[i + 2]; i += 2; continue;
      }
      if ((lo === 's' || lo === 'c') && nxLo === 'h') { out += isUpper(s[i]) ? 'Ş' : 'ş'; i++; continue; }
      if ((lo === 'o' || lo === 'g') && nx === "'") {
        out += lo === 'o' ? (isUpper(s[i]) ? 'Ö' : 'ö') : (isUpper(s[i]) ? 'Ğ' : 'ğ');
        i++; continue;
      }
      out += s[i];
    }
    return out;
  }

  function findMorphStem(low) {
    if (!lexSet) return null;
    if (lexSet.has(low)) return { stem: low, suffix: '' };
    for (var i = 0; i < suffixes.length; i++) {
      var suf = suffixes[i];
      if (low.length > suf.length + 1 && low.endsWith(suf)) {
        var stem = low.slice(0, -suf.length);
        if (lexSet.has(stem)) return { stem: stem, suffix: '-' + suf };
      }
    }
    return null;
  }

  function analyzeWord(rawWord) {
    var m = rawWord.match(/^([^A-Za-z'ʻ’‘ʼ`´]*)(.*?)([^A-Za-z'ʻ’‘ʼ`´]*)$/);
    var pre = m ? m[1] : '', core = m ? m[2] : rawWord, post = m ? m[3] : '';
    var low = norm(core).toLowerCase();
    if (low.length < 2 || !hasPattern(low)) {
      return { input: rawWord, output: rawWord, convert: false, stage: 'naqsh', reason: "O'zgartiriladigan naqsh (sh, ch, o', g') yo'q." };
    }
    var parts = low.split('-');
    var rejected = (rejectSet && rejectSet.has(low)) || parts.some(function (p) {
      return p.length > 1 && p !== 'chi' && rejectSet && rejectSet.has(p);
    });
    if (rejected) {
      return { input: rawWord, output: rawWord, convert: false, stage: 'filtr', reason: "Xorijiy / IT istisno filtrida topildi — tegilmadi." };
    }
    var morph = findMorphStem(low);
    var converted = pre + convertWordRaw(core) + post;
    if (morph) {
      return {
        input: rawWord,
        output: converted,
        convert: true,
        stage: morph.suffix ? 'morfologiya' : 'lugat',
        stem: morph.stem,
        suffix: morph.suffix,
        reason: morph.suffix
          ? "Morfologiya tahlili: «" + morph.stem + "» o'zagi + «" + morph.suffix + "» qo'shimchasi."
          : "O'zbekcha lug'at bazasida tasdiqlandi."
      };
    }
    return { input: rawWord, output: converted, convert: true, stage: 'qoida', reason: "Fonetik imlo qoidasi bo'yicha o'girildi." };
  }

  function smartConvertText(text) {
    if (!text) return text;
    return text.replace(/[A-Za-z'ʻ’‘ʼ`´-]+/g, function (tok) {
      return analyzeWord(tok).output;
    });
  }

  var basePath = document.currentScript && document.currentScript.src.indexOf('/web/') !== -1 ? 'data/' : 'web/data/';
  var readyPromise = Promise.all([
    fetch(basePath + 'english_reject.txt').then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; }),
    fetch(basePath + 'uzbek_lexicon.txt').then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; }),
    fetch(basePath + 'suffixes.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
  ]).then(function (res) {
    if (res[0]) {
      rejectSet = new Set();
      res[0].split(/\r?\n/).forEach(function (w) { w = norm(w.trim()).toLowerCase(); if (w) rejectSet.add(w); });
    }
    if (res[1]) {
      lexSet = new Set();
      res[1].split(/\r?\n/).forEach(function (w) { w = norm(w.trim()).toLowerCase(); if (w) lexSet.add(w); });
    }
    if (Array.isArray(res[2]) && res[2].length) suffixes = res[2];
    return { rejectCount: rejectSet ? rejectSet.size : 0, lexCount: lexSet ? lexSet.size : 0, suffixCount: suffixes.length };
  });

  root.AlifSmartEngine = {
    analyzeWord: analyzeWord,
    smartConvertText: smartConvertText,
    convertWordRaw: convertWordRaw,
    ready: function () { return readyPromise; },
    getLexicon: function () { return lexSet ? Array.from(lexSet) : []; }
  };
})(window);
