(function (root) {
  'use strict';

  var APOSTROPHES = /[ʻ’‘ʼ`´‛′]/g;
  var rejectSet = null;
  var lexSet = null;

  var suffixes = [
    "laringizning","larimizning","laringizdan","chilarning","larimizdan",
    "laringizga","laringizni","larimizga","larimizni","chilarni",
    "laringiz","larining","yaptilar","dagidan","dagilar","laridan",
    "larimiz","larning","chilar","chilik","dagiga","dagini","ishgan",
    "lardan","lariga","larini","likdan","liklar","roqdan","roqlar",
    "ingiz","likka","likni","moqchi","roqni","roqqa","yapti","yapman",
    "yapsan","yapmiz","yapsiz","dagi","dosh","gacha","gina","imiz",
    "kina","lari","lash","moqda","ning","qina","xona","cha","chi",
    "dan","gan","ing","kor","lan","lar","lik","man","miz","moq",
    "roq","san","siz","zor","da","di","ga","ib","im","ka","la",
    "li","ma","ni","qa","si","yap","ish","uv","i"
  ];

  var UZBEK_PROTECTED = new Set([
    "shunday","shunaqa","shuncha","shahar","shahri","choy","choyxona","chol","cho'l",
    "chiroyli","chiroq","chiq","chiqmoq","achchiq","ochiq","kichik","yaxshi",
    "ish","ishonch","tush","tushun","qush","bosh","boshqa","yosh","go'sht",
    "o'zbekiston","o'zbek","to'g'ri","qo'shiq","qishloq","bog'cha","shoir",
    "shifokor","shokolad","mashina","qish","shoshilinch","shuhrat","ruchka",
    "osh","tosh","qosh","tashqi","ichki","kecha","ko'cha","uchun","necha","qancha",
    "eshik","shkaf","shtab","shlang","shrift","shlem","yeyish","yemoq"
  ]);

  var EN_CONTEXT_WORDS = new Set([
    "the","is","are","was","were","am","to","and","or","in","on","at","for","with","from",
    "of","a","an","this","that","it","its","let's","lets","just","very","so","too","my",
    "your","his","her","our","their","we","you","they","he","she","can","will","would",
    "should","could","have","has","had","do","does","did","not","no","yes","out","up",
    "down","off","over","under","watch","eat","drink","play","work","love","like","want","need"
  ]);

  var UZ_CONTEXT_WORDS = new Set([
    "va","bilan","uchun","ekan","qilib","bo'lib","ham","esa","lekin","ammo","biroq",
    "chunki","agar","yoki","yoxud","deya","deb","edi","emas","bor","yo'q","kerak","mumkin",
    "bu","shu","o'sha","men","sen","u","biz","siz","ular","nima","qanday","limon","mastava"
  ]);

  var EN_PHONOTACTIC_RE = /(w|th|wh|ck|qu|tch|dge|ght|sch|chr|chl|shr|(ll|ss|ff|zz|nge)$|^cha(rt|rg|nc|nt|sm|lk|mp|pt|rl)|^(bl|br|cl|cr|dr|fl|fr|gl|gr|pl|pr|sc|scr|sk|sl|sm|sn|sp|spl|spr|sq|st|str|sw|tr|tw)|((sh|ch).*(ea|ee|oo|ou|ow|ai|ay|oa|ie|ue|ui|au|aw|ew|ey))|((ea|ee|oo|ou|ow|ai|ay|oa|ie|ue|ui|au|aw|ew|ey).*(sh|ch))|(ate|ine|ive|ous|ble|ful|less|ment|tion|sion|ture|sure|age|ize|ise)$)/;

  var UZ_TRIGRAMS = ["lar","nin","ing","day","chi","liq","loq","shi","cha","g'i","o'q","o'z","shl","chl","qish","osh","ish","uch","cho","sha","tog","bog"];
  var EN_TRIGRAMS = ["ill","ell","all","ull","tch","ack","eck","ick","ock","uck","ash","esh","ush","ine","ate","ake","ore","ive","ous","ble","ful","chr","shr","whi","tha","the"];

  function deconvert(s) {
    return s.replace(/Ş/g, 'Sh').replace(/ş/g, 'sh')
            .replace(/Ç/g, 'Ch').replace(/ç/g, 'ch')
            .replace(/Ö/g, "O'").replace(/ö/g, "o'")
            .replace(/Ğ/g, "G'").replace(/ğ/g, "g'");
  }

  function norm(s) {
    return (s || '').replace(APOSTROPHES, "'");
  }

  function isUpper(c) {
    return c !== c.toLowerCase() && c === c.toUpperCase();
  }

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
      if (lo === 's' && nxLo === 'h') { out += isUpper(s[i]) ? 'Ş' : 'ş'; i++; continue; }
      if (lo === 'c' && nxLo === 'h') { out += isUpper(s[i]) ? 'Ç' : 'ç'; i++; continue; }
      if ((lo === 'o' || lo === 'g') && nx === "'") {
        out += lo === 'o' ? (isUpper(s[i]) ? 'Ö' : 'ö') : (isUpper(s[i]) ? 'Ğ' : 'ğ');
        i++; continue;
      }
      out += s[i];
    }
    return out;
  }

  function isKnownUzbekRoot(w) {
    return UZBEK_PROTECTED.has(w) || (lexSet !== null && lexSet.has(w));
  }

  // 1-QATLAM: Ko'p bosqichli o'zbekcha morfologik stemmer (4 bosqichgacha)
  function iterativeUzbekStem(low) {
    if (isKnownUzbekRoot(low)) return { stem: low, suffixes: [] };
    var cur = low;
    var peeled = [];

    for (var step = 0; step < 4; step++) {
      if (isKnownUzbekRoot(cur)) return { stem: cur, suffixes: peeled };

      // Kichraytirish-erkalash qo'shimchalari: achchiqqina -> achchiq
      var dims = ["qina", "gina", "kina"];
      for (var d = 0; d < dims.length; d++) {
        var dm = dims[d];
        if (cur.length > dm.length + 2 && cur.endsWith(dm)) {
          var st = cur.slice(0, -dm.length);
          if (isKnownUzbekRoot(st)) {
            peeled.push("-" + dm);
            return { stem: st, suffixes: peeled };
          }
          if (st.length >= 2 && st[st.length - 1] === st[st.length - 2] && isKnownUzbekRoot(st.slice(0, -1))) {
            peeled.push("-" + dm);
            return { stem: st.slice(0, -1), suffixes: peeled };
          }
        }
      }

      var matched = false;
      for (var i = 0; i < suffixes.length; i++) {
        var suf = suffixes[i];
        if (cur.length > suf.length + 1 && cur.endsWith(suf)) {
          var nxt = cur.slice(0, -suf.length);
          var cands = [nxt];
          if (nxt.endsWith("kk") || nxt.endsWith("qq")) cands.push(nxt.slice(0, -1));
          if (nxt.endsWith("g'")) cands.push(nxt.slice(0, -2) + "q");
          if (nxt.endsWith("g")) cands.push(nxt.slice(0, -1) + "k");

          for (var c = 0; c < cands.length; c++) {
            if (isKnownUzbekRoot(cands[c])) {
              peeled.push("-" + suf);
              return { stem: cands[c], suffixes: peeled };
            }
          }
          if (nxt.length >= 3) {
            peeled.push("-" + suf);
            cur = nxt;
            matched = true;
            break;
          }
        }
      }
      if (!matched) break;
    }

    return isKnownUzbekRoot(cur) ? { stem: cur, suffixes: peeled } : null;
  }

  // 2-QATLAM: Inglizcha lug'at va fonotaktik detector
  function isForeignWord(low) {
    if (rejectSet && rejectSet.has(low)) return true;
    var parts = low.split('-');
    if (parts.some(function (p) { return p.length > 1 && p !== 'chi' && rejectSet && rejectSet.has(p); })) return true;
    if (low.indexOf("o'") === -1 && low.indexOf("g'") === -1 && EN_PHONOTACTIC_RE.test(low)) return true;
    if (rejectSet) {
      var enSufs = ["ers","ing","tion","sion","ment","ness","able","ible","ship","hood","ware","ed","er","es","ly","s"];
      for (var i = 0; i < enSufs.length; i++) {
        var sf = enSufs[i];
        if (low.length > sf.length + 2 && low.endsWith(sf)) {
          var rt = low.slice(0, -sf.length);
          if (rejectSet.has(rt) || rejectSet.has(rt + 'e')) return true;
        }
      }
    }
    return false;
  }

  // 4-QATLAM: Trigram ehtimollik baholagichi
  function trigramScore(low) {
    var score = 0;
    for (var i = 0; i < UZ_TRIGRAMS.length; i++) {
      if (low.indexOf(UZ_TRIGRAMS[i]) !== -1) score += 1;
    }
    for (var j = 0; j < EN_TRIGRAMS.length; j++) {
      if (low.indexOf(EN_TRIGRAMS[j]) !== -1) score -= 1.2;
    }
    return score;
  }

  function analyzeWord(rawWord, contextNeighbors) {
    var m = rawWord.match(/^([^A-Za-zÖöĞğŞşÇç'ʻ’‘ʼ`´]*)(.*?)([^A-Za-zÖöĞğŞşÇç'ʻ’‘ʼ`´]*)$/);
    var pre = m ? m[1] : '', core = m ? m[2] : rawWord, post = m ? m[3] : '';
    var restoredCore = deconvert(core);
    var low = norm(restoredCore).toLowerCase();

    if (low.length < 2 || !hasPattern(low)) {
      return { input: rawWord, output: rawWord, convert: false, stage: 'naqsh', reason: "O'zgartiriladigan naqsh (sh, ch, o', g') yo'q." };
    }

    // 1. O'zbekcha lug'at va ko'p bosqichli morfologiya ustuvorligi
    var morph = iterativeUzbekStem(low);
    var converted = pre + convertWordRaw(restoredCore) + post;
    if (morph) {
      return {
        input: rawWord,
        output: converted,
        convert: true,
        stage: morph.suffixes.length ? 'morfologiya' : 'lugat',
        stem: morph.stem,
        suffix: morph.suffixes.join(''),
        reason: morph.suffixes.length
          ? "Ko'p bosqichli tahlil: «" + morph.stem + "» + «" + morph.suffixes.join('') + "»."
          : "O'zbekcha lug'at bazasida tasdiqlandi."
      };
    }

    // 2. Xorijiy so'zlar va fonotaktika filtri
    if (isForeignWord(low)) {
      return { input: rawWord, output: pre + restoredCore + post, convert: false, stage: 'filtr', reason: "Xorijiy so'zlar bazasi yoki fonotaktik qoida orqali himoyalandi." };
    }

    // 3. Gap konteksti oynasi (Sliding Window)
    if (Array.isArray(contextNeighbors) && contextNeighbors.length > 0) {
      var enHits = 0, uzHits = 0;
      for (var k = 0; k < contextNeighbors.length; k++) {
        var nb = contextNeighbors[k];
        if (EN_CONTEXT_WORDS.has(nb)) enHits++;
        if (UZ_CONTEXT_WORDS.has(nb)) uzHits++;
      }
      if (enHits > 0 && uzHits === 0) {
        return { input: rawWord, output: pre + restoredCore + post, convert: false, stage: 'kontekst', reason: "Inglizcha jumla konteksti aniqlandi — o'z holida qoldirildi." };
      }
    }

    // 4. Trigram ehtimollik tekshiruvi
    if (low.indexOf("o'") === -1 && low.indexOf("g'") === -1 && trigramScore(low) < 0) {
      return { input: rawWord, output: pre + restoredCore + post, convert: false, stage: 'trigram', reason: "Trigram ehtimollik modeli xorijiy tuzilishni aniqladi." };
    }

    return { input: rawWord, output: converted, convert: true, stage: 'qoida', reason: "Fonetik imlo qoidasi bo'yicha o'girildi." };
  }

  function smartConvertText(text) {
    if (!text) return text;
    var parts = text.split(/([A-Za-zÖöĞğŞşÇç'ʻ’‘ʼ`´-]+)/);
    var wordPositions = [];
    var wordLows = [];

    for (var i = 0; i < parts.length; i++) {
      if (parts[i] && /^[A-Za-zÖöĞğŞşÇç'ʻ’‘ʼ`´-]+$/.test(parts[i])) {
        wordPositions.push(i);
        wordLows.push(norm(deconvert(parts[i])).toLowerCase());
      }
    }

    for (var pos = 0; pos < wordPositions.length; pos++) {
      var idx = wordPositions[pos];
      var tok = parts[idx];
      if (!hasPattern(deconvert(tok))) continue;
      var neighbors = [];
      for (var d = -2; d <= 2; d++) {
        if (d !== 0 && pos + d >= 0 && pos + d < wordLows.length) {
          neighbors.push(wordLows[pos + d]);
        }
      }
      parts[idx] = analyzeWord(tok, neighbors).output;
    }

    return parts.join('');
  }

  var scriptSrc = document.currentScript ? document.currentScript.src : '';
  var basePath = scriptSrc.indexOf('/web/') !== -1 ? 'data/' : 'web/data/';
  var readyPromise = Promise.all([
    fetch(basePath + 'english_reject.txt').then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; }),
    fetch(basePath + 'uzbek_lexicon.txt').then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; }),
    fetch(basePath + 'suffixes.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
  ]).then(function (res) {
    if (res[0]) {
      rejectSet = new Set();
      res[0].split(/\r?\n/).forEach(function (w) {
        w = norm(w.trim()).toLowerCase();
        if (w && !UZBEK_PROTECTED.has(w)) rejectSet.add(w);
      });
    }
    if (res[1]) {
      lexSet = new Set();
      res[1].split(/\r?\n/).forEach(function (w) {
        w = norm(w.trim()).toLowerCase();
        if (w) lexSet.add(w);
      });
    }
    if (Array.isArray(res[2]) && res[2].length) {
      suffixes = res[2];
    }
    var info = {
      rejectCount: rejectSet ? rejectSet.size : 0,
      lexCount: lexSet ? lexSet.size : 0,
      suffixCount: suffixes.length
    };
    if (typeof root.dispatchEvent === 'function') {
      root.dispatchEvent(new CustomEvent('alif-smart-ready', { detail: info }));
    }
    return info;
  });

  root.AlifSmartEngine = {
    analyzeWord: analyzeWord,
    smartConvertText: smartConvertText,
    convertWordRaw: convertWordRaw,
    ready: function () { return readyPromise; },
    getLexicon: function () { return lexSet ? Array.from(lexSet) : []; }
  };
})(window);
