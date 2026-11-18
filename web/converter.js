(function (global) {
  'use strict';

  const APOSTROPHE_RE = /[ʻ’‘ʼ`´]/g;
  const CYR_RE = /[\u0400-\u04FF]/;
  const NEW_LAT_RE = /[ÖöĞğŞşÇçÑñ]/;

  const VOWEL_HARD_SIGN_STEMS = [
    "ta'lim", "ta'mir", "ta'min", "ta'kid", "ta'sir", "ta'rif", "ta'zim", "ta'qiq", "ta'til", "ta'b",
    "e'lon", "e'tibor", "e'tirof", "e'tiroz", "e'tiqod", "e'zoz",
    "she'r", "me'mor", "me'yor", "me'da", "ne'mat", "fe'l",
    "sa'nat", "san'at", "ma'no", "ma'lum", "ma'naviy", "ma'rifat", "ma'sul", "mas'ul", "ma'qul", "ma'mur",
    "mo'tabar", "mo'tadil", "mo'jaz", "mo'jiza",
    "a'lo", "a'zo", "ra'y", "da'vo", "va'da", "qa'r", "ta'na", "shu'la", "jur'at", "sur'at", "qat'iy"
  ];

  function normalizeApostrophes(str) {
    return str.replace(APOSTROPHE_RE, "'");
  }

  function isUpper(ch) {
    return ch !== ch.toLowerCase() && ch === ch.toUpperCase();
  }

  function isCyrVowel(ch) {
    return /^[аеёиоуўэюяАЕЁИОУЎЭЮЯ]$/.test(ch);
  }

  function isCyrConsonant(ch) {
    return /^[бвгғджзйклмнпрстфхҳцчшщБВГҒДЖЗЙКЛМНПРСТФХҲЦЧШЩ]$/.test(ch);
  }

  function oldLatToNewLat(text, opts) {
    let s = normalizeApostrophes(text);

    s = s.replace(/O'/g, 'Ö').replace(/o'/g, 'ö');
    s = s.replace(/G'/g, 'Ğ').replace(/g'/g, 'ğ');
    s = s.replace(/SH/g, 'Ş').replace(/Sh/g, 'Ş').replace(/sh/g, 'ş');
    s = s.replace(/S'H/g, 'SH').replace(/S'h/g, 'Sh').replace(/s'h/g, 'sh');
    s = s.replace(/CH/g, 'Ç').replace(/Ch/g, 'Ç').replace(/ch/g, 'ç');
    return s;
  }

  function newLatToOldLat(text) {
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1] || '';
      const nextIsUpper = next && isUpper(next);

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
    const CYR_MAP = {
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

    let out = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const prev = text[i - 1] || '';
      const next = text[i + 1] || '';
      const nextIsUpper = next && isUpper(next);

      if (ch === 'Е' || ch === 'е') {
        const atWordStart = !prev || !/[А-Яа-яЁёЎўҚқҒғҲҳ]/.test(prev);
        const afterVowelOrSign = isCyrVowel(prev) || prev === 'ъ' || prev === 'Ъ' || prev === 'ь' || prev === 'Ь';
        if (atWordStart || afterVowelOrSign) {
          out += ch === 'Е' ? (nextIsUpper ? 'YE' : 'Ye') : 'ye';
        } else {
          out += ch === 'Е' ? 'E' : 'e';
        }
        continue;
      }
      if (ch === 'Ё' || ch === 'ё') { out += ch === 'Ё' ? (nextIsUpper ? 'YO' : 'Yo') : 'yo'; continue; }
      if (ch === 'Ю' || ch === 'ю') { out += ch === 'Ю' ? (nextIsUpper ? 'YU' : 'Yu') : 'yu'; continue; }
      if (ch === 'Я' || ch === 'я') { out += ch === 'Я' ? (nextIsUpper ? 'YA' : 'Ya') : 'ya'; continue; }
      if (ch === 'Ч' || ch === 'ч') { out += ch === 'Ч' ? (nextIsUpper ? 'CH' : 'Ch') : 'ch'; continue; }
      if (ch === 'Ш' || ch === 'ш') { out += ch === 'Ш' ? (nextIsUpper ? 'SH' : 'Sh') : 'sh'; continue; }
      if (ch === 'Щ' || ch === 'щ') { out += ch === 'Щ' ? (nextIsUpper ? 'SHCH' : 'Shch') : 'shch'; continue; }
      if (ch === 'Ц' || ch === 'ц') {
        const betweenVowels = isCyrVowel(prev) && isCyrVowel(next);
        if (betweenVowels) {
          out += ch === 'Ц' ? (nextIsUpper ? 'TS' : 'Ts') : 'ts';
        } else {
          out += ch === 'Ц' ? 'S' : 's';
        }
        continue;
      }
      if (ch === 'Ь' || ch === 'ь') {
        if (next === 'о' || next === 'О') {
          out += next === 'О' ? 'Y' : 'y';
        }
        continue;
      }

      out += Object.prototype.hasOwnProperty.call(CYR_MAP, ch) ? CYR_MAP[ch] : ch;
    }
    return out;
  }

  function oldLatToCyr(text) {
    let s = normalizeApostrophes(text);

    s = s.replace(/\b([A-Za-z']+)/g, function (word) {
      const low = word.toLowerCase();
      for (let i = 0; i < VOWEL_HARD_SIGN_STEMS.length; i++) {
        if (low.startsWith(VOWEL_HARD_SIGN_STEMS[i])) {
          return word.replace("'", '\uE000');
        }
      }
      return word;
    });

    const SINGLE = {
      'A': 'А', 'a': 'а', 'B': 'Б', 'b': 'б', 'D': 'Д', 'd': 'д',
      'F': 'Ф', 'f': 'ф', 'G': 'Г', 'g': 'г', 'H': 'Ҳ', 'h': 'ҳ',
      'I': 'И', 'i': 'и', 'J': 'Ж', 'j': 'ж', 'K': 'К', 'k': 'к',
      'L': 'Л', 'l': 'л', 'M': 'М', 'm': 'м', 'N': 'Н', 'n': 'н',
      'O': 'О', 'o': 'о', 'P': 'П', 'p': 'п', 'Q': 'Қ', 'q': 'қ',
      'R': 'Р', 'r': 'р', 'S': 'С', 's': 'с', 'T': 'Т', 't': 'т',
      'U': 'У', 'u': 'у', 'V': 'В', 'v': 'в', 'X': 'Х', 'x': 'х',
      'Y': 'Й', 'y': 'й', 'Z': 'З', 'z': 'з', 'C': 'Ц', 'c': 'ц'
    };

    let out = '';
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      const next = s[i + 1] || '';
      const pairLow = (ch + next).toLowerCase();

      if (ch === '\uE000') { out += 'ъ'; continue; }
      if (pairLow === "o'") { out += ch === 'O' ? 'Ў' : 'ў'; i++; continue; }
      if (pairLow === "g'") { out += ch === 'G' ? 'Ғ' : 'ғ'; i++; continue; }
      if (pairLow === 'sh') { out += ch === 'S' ? 'Ш' : 'ш'; i++; continue; }
      if (pairLow === 'ch') { out += ch === 'C' ? 'Ч' : 'ч'; i++; continue; }
      if (pairLow === 'yo') { out += ch === 'Y' ? 'Ё' : 'ё'; i++; continue; }
      if (pairLow === 'yu') { out += ch === 'Y' ? 'Ю' : 'ю'; i++; continue; }
      if (pairLow === 'ya') { out += ch === 'Y' ? 'Я' : 'я'; i++; continue; }
      if (pairLow === 'ye') { out += ch === 'Y' ? 'Е' : 'е'; i++; continue; }

      if (ch === 'E' || ch === 'e') {
        const prevOut = out[out.length - 1] || '';
        const atStart = !prevOut || !/[А-Яа-яЁёЎўҚқҒғҲҳ]/.test(prevOut);
        if (atStart || isCyrVowel(prevOut)) {
          out += ch === 'E' ? 'Э' : 'э';
        } else {
          out += ch === 'E' ? 'Е' : 'е';
        }
        continue;
      }

      if (ch === "'") {
        const prevOut = out[out.length - 1] || '';
        if (prevOut && (isCyrConsonant(prevOut) || isCyrVowel(prevOut))) {
          out += 'ъ';
        }
        continue;
      }

      out += Object.prototype.hasOwnProperty.call(SINGLE, ch) ? SINGLE[ch] : ch;
    }

    return out;
  }

  function detectScript(text) {
    if (!text) return 'empty';
    const cyrCount = (text.match(/[\u0400-\u04FF]/g) || []).length;
    const latCount = (text.match(/[A-Za-zÖöĞğŞşÇçÑñ]/g) || []).length;
    if (cyrCount > latCount) return 'cyr';
    if (NEW_LAT_RE.test(text)) return 'newlat';
    return 'oldlat';
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function applyExceptionsWithPlaceholders(text, exceptions) {
    if (!Array.isArray(exceptions) || exceptions.length === 0) {
      return { text: text, tokens: [] };
    }
    const tokens = [];
    let working = text;

    const sorted = exceptions
      .filter((item) => item && item.src && item.src.trim())
      .slice()
      .sort((a, b) => b.src.length - a.src.length);

    sorted.forEach((item) => {
      const srcNorm = normalizeApostrophes(item.src.trim());
      const dstVal = item.dst && item.dst.trim() ? item.dst.trim() : item.src.trim();
      const pattern = new RegExp(escapeRegExp(srcNorm), 'g');
      working = working.replace(pattern, function () {
        const idx = tokens.length;
        tokens.push(dstVal);
        return '\uF000' + idx + '\uF001';
      });
    });

    return { text: working, tokens: tokens };
  }

  function restoreExceptions(text, tokens) {
    if (!tokens || tokens.length === 0) return text;
    return text.replace(/\uF000(\d+)\uF001/g, function (_, idxStr) {
      const idx = Number(idxStr);
      return tokens[idx] !== undefined ? tokens[idx] : '';
    });
  }

  function convert(text, direction, options) {
    if (!text) return '';
    const opts = options || {};
    const prepared = applyExceptionsWithPlaceholders(normalizeApostrophes(text), opts.exceptions);
    let result = prepared.text;

    switch (direction) {
      case 'oldlat2new':
        result = oldLatToNewLat(result, opts);
        break;
      case 'cyr2new':
        result = oldLatToNewLat(cyrToOldLat(result), opts);
        break;
      case 'new2oldlat':
        result = newLatToOldLat(result);
        break;
      case 'new2cyr':
        result = oldLatToCyr(newLatToOldLat(result));
        break;
      case 'cyr2oldlat':
        result = cyrToOldLat(result);
        break;
      case 'oldlat2cyr':
        result = oldLatToCyr(result);
        break;
      case 'auto2new':
      default:
        if (CYR_RE.test(result)) {
          result = cyrToOldLat(result);
        }
        result = oldLatToNewLat(result, opts);
        break;
    }

    return restoreExceptions(result, prepared.tokens);
  }

  global.Alif = {
    convert: convert,
    detectScript: detectScript,
    normalizeApostrophes: normalizeApostrophes
  };
})(window);
