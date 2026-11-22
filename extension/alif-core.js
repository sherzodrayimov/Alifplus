(function (global) {
  'use strict';

  var APOSTROPHE_RE = /[ʻ’‘ʼ`´]/g;
  var CYR_RE = /[\u0400-\u04FF]/;
  var NEW_LAT_RE = /[ÖöĞğŞşÇçÑñ]/;

  var VOWEL_HARD_SIGN_STEMS = [
    "ta'lim", "ta'mir", "ta'min", "ta'kid", "ta'sir", "ta'rif", "ta'zim", "ta'qiq", "ta'til", "ta'b",
    "e'lon", "e'tibor", "e'tirof", "e'tiroz", "e'tiqod", "e'zoz",
    "she'r", "me'mor", "me'yor", "me'da", "ne'mat", "fe'l",
    "sa'nat", "san'at", "ma'no", "ma'lum", "ma'naviy", "ma'rifat", "ma'sul", "mas'ul", "ma'qul", "ma'mur",
    "mo'tabar", "mo'tadil", "mo'jaz", "mo'jiza",
    "a'lo", "a'zo", "ra'y", "da'vo", "va'da", "qa'r", "ta'na", "shu'la", "jur'at", "sur'at", "qat'iy"
  ];

  var UZ_TRUE_SET = new Set([
    "choy", "choyxona", "chol", "cho'l", "chiroyli", "chiroq", "chiq", "chiqmoq",
    "achchiq", "ochiq", "kichik", "yaxshi", "ish", "ishonch", "tush", "tushun",
    "qush", "bosh", "boshqa", "yosh", "go'sht", "o'zbekiston", "o'zbek", "to'g'ri",
    "qo'shiq", "qishloq", "bog'cha", "shoir", "shifokor", "shokolad", "mashina",
    "qish", "shoshilinch", "shuhrat", "ruchka", "osh", "tosh", "qosh", "tashqi",
    "ichki", "kecha", "ko'cha", "uchun", "necha", "qancha", "eshik", "shkaf",
    "shtab", "shlang", "shrift", "shlem", "yeyish", "yemoq", "shamol", "sharq",
    "shaxs", "shakl", "shahmat", "shayton", "shashlik", "shurpa", "shuba", "shahar",
    "shahri", "shart", "sher", "shox", "shoh", "shol", "shon", "shor", "sho'r",
    "shunday", "shunaqa", "shuncha", "chin", "chop", "chora", "chorak", "chiz",
    "chiziq", "chegara", "chek", "chelak", "chamasi", "chana", "chang", "chap",
    "chaqir", "charchoq", "chashma", "shirin", "shisha", "shovqin", "shoshil",
    "shoxobcha", "shug'ullan", "shum", "shunga", "shuning", "shunchaki", "sharoit",
    "o'quvchi", "o'qituvchi", "o'qish", "o'g'il", "ko'ngil", "so'z", "ko'z", "yo'l"
  ]);

  var CORE_EN_SET = new Set([
    "chat", "chats", "chatted", "chatting", "chatbot", "chatbots",
    "channel", "channels", "change", "changes", "changed", "changing",
    "chart", "charts", "charter", "check", "checks", "checked", "checking",
    "chill", "chills", "chilled", "chilling", "chip", "chips", "choice",
    "choose", "chosen", "chrome", "church", "share", "shares", "shared",
    "sharing", "shake", "shampoo", "shape", "sharp", "she", "sheet", "shell",
    "shift", "shine", "ship", "shirt", "shock", "shoe", "shoes", "shop",
    "shopping", "short", "shot", "should", "shoulder", "show", "shows",
    "showed", "shown", "shower", "shut", "shy", "youtube", "google", "apple",
    "windows", "iphone", "ipad", "macbook", "whatsapp", "telegram", "instagram",
    "facebook", "twitter", "tiktok", "linkedin", "github", "microsoft", "excel",
    "word", "powerpoint", "photoshop", "english", "russian", "spanish",
    "cache", "sketch", "match", "watch", "switch", "pitch", "batch", "patch",
    "edge", "browser", "extension", "software", "hardware", "online", "offline"
  ]);

  var UZ_SUFFIXES = [
    "larimizning", "larimizdan", "larimizga", "larimizni", "larimizda",
    "laringizning", "laringizdan", "laringizga", "laringizni", "laringizda",
    "larining", "laridan", "lariga", "larini", "larida",
    "imizning", "imizdan", "imizga", "imizni", "imizda",
    "ingizning", "ingizdan", "ingizga", "ingizni", "ingizda",
    "chilik", "liklar", "dagi", "niki", "ning", "lar", "dan", "ga", "ka", "qa",
    "da", "ni", "miz", "ngiz", "si", "chi", "lik", "siz", "li", "gi", "ki", "qi",
    "moq", "yap", "di", "gan", "ajak", "ar", "mas", "ish", "uv", "im", "ing", "i"
  ];

  var dynamicUzSet = null;
  var dynamicRejectSet = null;

  function setDictionaries(uzIterable, rejectIterable) {
    if (uzIterable) dynamicUzSet = new Set(uzIterable);
    if (rejectIterable) dynamicRejectSet = new Set(rejectIterable);
  }

  function normalizeApostrophes(str) {
    return String(str || '').replace(APOSTROPHE_RE, "'");
  }

  function isUpper(ch) {
    return ch !== ch.toLowerCase() && ch === ch.toUpperCase();
  }

  function isCyrVowel(ch) {
    return /^[аеёиоуўэюяАЕЁИОУЎЭЮЯ]$/.test(ch);
  }

  function inUzLexicon(w) {
    if (UZ_TRUE_SET.has(w) || (dynamicUzSet && dynamicUzSet.has(w))) return true;
    if ((w.endsWith('kk') || w.endsWith('qq')) && inUzLexicon(w.slice(0, -1))) return true;
    if (w.endsWith('g') && inUzLexicon(w.slice(0, -1) + 'k')) return true;
    if (w.endsWith("g'") && inUzLexicon(w.slice(0, -2) + 'q')) return true;
    return false;
  }

  function analyzeWord(rawWord, customExceptions) {
    var clean = normalizeApostrophes(rawWord).trim();
    var low = clean.toLowerCase().replace(/^'+|'+$/g, '');
    if (low.length < 2) {
      return { convert: false, layer: 'short', reason: "Juda qisqa belgi" };
    }
    if (customExceptions && Object.prototype.hasOwnProperty.call(customExceptions, low)) {
      var val = customExceptions[low];
      return {
        convert: Boolean(val),
        customReplacement: typeof val === 'string' && val ? val : null,
        layer: 'user-exception',
        reason: "Foydalanuvchi istisno ro'yxati"
      };
    }
    if (low.indexOf("o'") !== -1 || low.indexOf("g'") !== -1) {
      return { convert: true, layer: 'uz-apostrophe', reason: "O'zbekcha o'/g' tutuq belgisi aniqlandi" };
    }
    if (inUzLexicon(low)) {
      return { convert: true, layer: 'uz-lexicon', reason: "O'zbek tilining asosiy lug'atida tasdiqlangan" };
    }

    // 4 bosqichli morfologik tahlil
    var cur = low;
    for (var step = 0; step < 4; step++) {
      var dims = ['qina', 'gina', 'kina'];
      for (var d = 0; d < dims.length; d++) {
        var dm = dims[d];
        if (cur.length > dm.length + 2 && cur.endsWith(dm)) {
          var st = cur.slice(0, -dm.length);
          if (inUzLexicon(st) || (st.length >= 2 && st[st.length - 1] === st[st.length - 2] && inUzLexicon(st.slice(0, -1)))) {
            return { convert: true, layer: 'uz-morphology', reason: "O'zbekcha o'zak + -" + dm + " qo'shimchasi" };
          }
        }
      }
      var peeled = false;
      for (var i = 0; i < UZ_SUFFIXES.length; i++) {
        var suf = UZ_SUFFIXES[i];
        if (cur.length > suf.length + 1 && cur.endsWith(suf)) {
          var nxt = cur.slice(0, -suf.length);
          if (inUzLexicon(nxt)) {
            return { convert: true, layer: 'uz-morphology', reason: "O'zbekcha o'zak (" + nxt + ") + -" + suf + " qo'shimchasi" };
          }
          if (nxt.length >= 3) {
            cur = nxt;
            peeled = true;
            break;
          }
        }
      }
      if (!peeled) break;
    }

    if (CORE_EN_SET.has(low) || (dynamicRejectSet && dynamicRejectSet.has(low))) {
      return { convert: false, layer: 'foreign-lexicon', reason: "Inglizcha / xalqaro atamalar bazasida himoyalangan" };
    }

    var engSufs = ['ers', 'ing', 'tion', 'sion', 'ment', 'ness', 'able', 'ible', 'ship', 'hood', 'ware', 'ed', 'er', 'es', 'ly', 's'];
    for (var e = 0; e < engSufs.length; e++) {
      var es = engSufs[e];
      if (low.length > es.length + 2 && low.endsWith(es)) {
        var rt = low.slice(0, -es.length);
        if (CORE_EN_SET.has(rt) || CORE_EN_SET.has(rt + 'e') || (dynamicRejectSet && (dynamicRejectSet.has(rt) || dynamicRejectSet.has(rt + 'e')))) {
          return { convert: false, layer: 'foreign-morphology', reason: "Inglizcha o'zak (" + rt + ") + -" + es + " qo'shimchasi" };
        }
      }
    }

    if (/(w|th|wh|ck|qu|tch|dge|ght|sch|chr|chl|shr)/.test(low) || /(ll|ss|ff|zz|nge)$/.test(low) || /^(chart|charg|chanc|chant|chasm|chalk|champ|chapt|charl)/.test(low)) {
      return { convert: false, layer: 'phonotactic', reason: "O'zbek tiliga xos bo'lmagan harf birikmasi (fonotaktik himoya)" };
    }

    return { convert: true, layer: 'default-uz', reason: "O'zbekcha imlo qoidasi bo'yicha o'giriladi" };
  }

  function convertOldLatToken(tok) {
    return tok
      .replace(/O'/g, 'Ö').replace(/o'/g, 'ö')
      .replace(/G'/g, 'Ğ').replace(/g'/g, 'ğ')
      .replace(/SH/g, 'Ş').replace(/Sh/g, 'Ş').replace(/sh/g, 'ş')
      .replace(/S'H/g, 'SH').replace(/S'h/g, 'Sh').replace(/s'h/g, 'sh')
      .replace(/CH/g, 'Ç').replace(/Ch/g, 'Ç').replace(/ch/g, 'ç');
  }

  function oldLatToNewLat(text, opts) {
    var smartOn = !opts || opts.smart !== false;
    var customEx = (opts && opts.exceptions) || null;
    var s = normalizeApostrophes(text);
    if (!smartOn) {
      return convertOldLatToken(s);
    }
    return s.replace(/[A-Za-z']+/g, function (tok) {
      var res = analyzeWord(tok, customEx);
      if (res.customReplacement) return res.customReplacement;
      if (!res.convert) return tok;
      return convertOldLatToken(tok);
    });
  }

  function newLatToOldLat(text) {
    var out = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var next = text[i + 1] || '';
      var nextIsUpper = next && isUpper(next);
      switch (ch) {
        case 'Ö': out += "O'"; break;
        case 'ö': out += "o'"; break;
        case 'Ğ': out += "G'"; break;
        case 'ğ': out += "g'"; break;
        case 'Ş': out += nextIsUpper ? 'SH' : 'Sh'; break;
        case 'ş': out += 'sh'; break;
        case 'Ç': out += nextIsUpper ? 'CH' : 'Ch'; break;
        case 'ç': out += 'ch'; break;
        case 'Ñ': out += nextIsUpper ? 'NG' : 'Ng'; break;
        case 'ñ': out += 'ng'; break;
        default: out += ch;
      }
    }
    return out;
  }

  function cyrToOldLat(text) {
    var CYR_MAP = {
      'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v',
      'Г': 'G', 'г': 'g', 'Д': 'D', 'д': 'd', 'Ж': 'J', 'ж': 'j',
      'З': 'Z', 'з': 'z', 'И': 'I', 'и': 'i', 'Й': 'Y', 'й': 'y',
      'К': 'K', 'к': 'k', 'Л': 'L', 'л': 'l', 'М': 'M', 'м': 'm',
      'Н': 'N', 'н': 'n', 'О': 'O', 'о': 'o', 'П': 'P', 'п': 'p',
      'Р': 'R', 'р': 'r', 'С': 'S', 'с': 's', 'Т': 'T', 'т': 't',
      'У': 'U', 'у': 'u', 'Ф': 'F', 'ф': 'f', 'Х': 'X', 'х': 'x',
      'Ҳ': 'H', 'ҳ': 'h', 'Қ': 'Q', 'қ': 'q', 'Ғ': "G'", 'ғ': "g'",
      'Ў': "O'", 'ў': "o'", 'Ы': 'I', 'ы': 'i', 'Э': 'E', 'э': 'e',
      'Ъ': "'", 'ъ': "'"
    };
    var out = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var prev = text[i - 1] || '';
      var next = text[i + 1] || '';
      var nextIsUpper = next && isUpper(next);
      if (ch === 'Е' || ch === 'е') {
        var atWordStart = !prev || !/[А-Яа-яЁёЎўҚқҒғҲҳ]/.test(prev);
        var afterVowelOrSign = isCyrVowel(prev) || prev === 'ъ' || prev === 'Ъ' || prev === 'ь' || prev === 'Ь';
        out += (atWordStart || afterVowelOrSign)
          ? (ch === 'Е' ? (nextIsUpper ? 'YE' : 'Ye') : 'ye')
          : (ch === 'Е' ? 'E' : 'e');
        continue;
      }
      if (ch === 'Ё' || ch === 'ё') { out += ch === 'Ё' ? (nextIsUpper ? 'YO' : 'Yo') : 'yo'; continue; }
      if (ch === 'Ю' || ch === 'ю') { out += ch === 'Ю' ? (nextIsUpper ? 'YU' : 'Yu') : 'yu'; continue; }
      if (ch === 'Я' || ch === 'я') { out += ch === 'Я' ? (nextIsUpper ? 'YA' : 'Ya') : 'ya'; continue; }
      if (ch === 'Ч' || ch === 'ч') { out += ch === 'Ч' ? (nextIsUpper ? 'CH' : 'Ch') : 'ch'; continue; }
      if (ch === 'Ш' || ch === 'ш') { out += ch === 'Ш' ? (nextIsUpper ? 'SH' : 'Sh') : 'sh'; continue; }
      if (ch === 'Щ' || ch === 'щ') { out += ch === 'Щ' ? (nextIsUpper ? 'SHCH' : 'Shch') : 'shch'; continue; }
      if (ch === 'Ц' || ch === 'ц') {
        out += (isCyrVowel(prev) && isCyrVowel(next))
          ? (ch === 'Ц' ? (nextIsUpper ? 'TS' : 'Ts') : 'ts')
          : (ch === 'Ц' ? 'S' : 's');
        continue;
      }
      if (ch === 'Ь' || ch === 'ь') {
        if (next === 'о' || next === 'О') out += next === 'О' ? 'Y' : 'y';
        continue;
      }
      out += Object.prototype.hasOwnProperty.call(CYR_MAP, ch) ? CYR_MAP[ch] : ch;
    }
    return out;
  }

  function oldLatToCyr(text) {
    var s = normalizeApostrophes(text);
    s = s.replace(/\b([A-Za-z']+)/g, function (word) {
      var low = word.toLowerCase();
      for (var i = 0; i < VOWEL_HARD_SIGN_STEMS.length; i++) {
        if (low.startsWith(VOWEL_HARD_SIGN_STEMS[i])) return word.replace("'", '\uE000');
      }
      return word;
    });
    var SINGLE = {
      'A': 'А', 'a': 'а', 'B': 'Б', 'b': 'б', 'D': 'Д', 'd': 'д',
      'F': 'Ф', 'f': 'ф', 'G': 'Г', 'g': 'г', 'H': 'Ҳ', 'h': 'ҳ',
      'I': 'И', 'i': 'и', 'J': 'Ж', 'j': 'ж', 'K': 'К', 'k': 'к',
      'L': 'Л', 'l': 'л', 'M': 'М', 'm': 'м', 'N': 'Н', 'n': 'н',
      'O': 'О', 'o': 'о', 'P': 'П', 'p': 'п', 'Q': 'Қ', 'q': 'қ',
      'R': 'Р', 'r': 'р', 'S': 'С', 's': 'с', 'T': 'Т', 't': 'т',
      'U': 'У', 'u': 'у', 'V': 'В', 'v': 'в', 'X': 'Х', 'x': 'х',
      'Y': 'Й', 'y': 'й', 'Z': 'З', 'z': 'з', 'C': 'Ц', 'c': 'ц'
    };
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      var next = s[i + 1] || '';
      var pairLow = (ch + next).toLowerCase();
      if (pairLow === "o'") { out += ch === 'O' ? 'Ў' : 'ў'; i++; continue; }
      if (pairLow === "g'") { out += ch === 'G' ? 'Ғ' : 'ғ'; i++; continue; }
      if (pairLow === 'sh') { out += ch === 'S' ? 'Ш' : 'ш'; i++; continue; }
      if (pairLow === 'ch') { out += ch === 'C' ? 'Ч' : 'ч'; i++; continue; }
      if (pairLow === 'yo') { out += ch === 'Y' ? 'Ё' : 'ё'; i++; continue; }
      if (pairLow === 'yu') { out += ch === 'Y' ? 'Ю' : 'ю'; i++; continue; }
      if (pairLow === 'ya') { out += ch === 'Y' ? 'Я' : 'я'; i++; continue; }
      if (pairLow === 'ye') { out += ch === 'Y' ? 'Е' : 'е'; i++; continue; }
      if (pairLow === 'ts') { out += ch === 'T' ? 'Ц' : 'ц'; i++; continue; }
      if (ch === '\uE000' || ch === "'") { out += 'ъ'; continue; }
      if (ch === 'E' || ch === 'e') {
        var prev = i > 0 ? s[i - 1] : '';
        var atStart = !prev || !/[A-Za-z'\uE000]/.test(prev);
        out += atStart ? (ch === 'E' ? 'Э' : 'э') : (ch === 'E' ? 'Е' : 'е');
        continue;
      }
      out += Object.prototype.hasOwnProperty.call(SINGLE, ch) ? SINGLE[ch] : ch;
    }
    return out;
  }

  function detectScript(text) {
    if (!text) return 'oldlat';
    if (CYR_RE.test(text)) return 'cyr';
    if (NEW_LAT_RE.test(text)) return 'newlat';
    return 'oldlat';
  }

  function convert(text, dir, opts) {
    if (!text) return '';
    var d = dir || 'auto2new';
    if (d === 'auto2new') {
      var scr = detectScript(text);
      if (scr === 'cyr') return oldLatToNewLat(cyrToOldLat(text), { smart: false });
      return oldLatToNewLat(text, opts);
    }
    if (d === 'oldlat2new') return oldLatToNewLat(text, opts);
    if (d === 'cyr2new') return oldLatToNewLat(cyrToOldLat(text), { smart: false });
    if (d === 'new2oldlat') return newLatToOldLat(text);
    if (d === 'new2cyr') return oldLatToCyr(newLatToOldLat(text));
    if (d === 'cyr2oldlat') return cyrToOldLat(text);
    if (d === 'oldlat2cyr') return oldLatToCyr(text);
    return oldLatToNewLat(text, opts);
  }

  var api = {
    version: '2.0.0',
    convert: convert,
    detectScript: detectScript,
    analyzeWord: analyzeWord,
    shouldConvertWord: function (w) { return analyzeWord(w).convert; },
    setDictionaries: setDictionaries
  };

  global.AlifCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
