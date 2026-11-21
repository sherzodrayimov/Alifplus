(function (root) {
  'use strict';

  function fallbackConvert(s) {
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

  var CASES = [
    // 1. Asosiy 4 harf va turli apostrof belgilari (24 ta)
    ["O'zbekiston", "Özbekiston"], ["o'zbekiston", "özbekiston"],
    ["O‘zbekiston", "Özbekiston"], ["o‘zbekiston", "özbekiston"],
    ["O’zbekiston", "Özbekiston"], ["oʻzbekiston", "özbekiston"],
    ["G'alla", "Ğalla"], ["g'alaba", "ğalaba"],
    ["G‘alla", "Ğalla"], ["g‘alaba", "ğalaba"],
    ["G’alla", "Ğalla"], ["gʻalaba", "ğalaba"],
    ["Shahar", "Şahar"], ["shahar", "şahar"],
    ["SHahar", "Şahar"], ["CHiroq", "Çiroq"],
    ["chiroq", "çiroq"], ["Chiroyli", "Çiroyli"],
    ["qo'shiq", "qöşiq"], ["to'g'ri", "töğri"],
    ["o'qituvchi", "öqituvçi"], ["g'amxo'r", "ğamxör"],
    ["shoshilinch", "şoşilinç"], ["charchoq", "çarçoq"],

    // 2. NG birikmasi o'zgarmasligi (20 ta)
    ["senga", "senga"], ["menga", "menga"], ["unga", "unga"],
    ["teng", "teng"], ["keng", "keng"], ["tong", "tong"],
    ["yangi", "yangi"], ["rang", "rang"], ["jang", "jang"],
    ["ohang", "ohang"], ["boding", "boding"], ["ko'ngil", "köngil"],
    ["o'ng", "öng"], ["so'ng", "söng"], ["toshkentning", "toşkentning"],
    ["maktabning", "maktabning"], ["kitobingiz", "kitobingiz"],
    ["kelajakning", "kelajakning"], ["dengiz", "dengiz"], ["ming", "ming"],

    // 3. Xorijiy, inglizcha va texnik brendlar himoyasi (36 ta)
    ["YouTube", "YouTube"], ["Windows", "Windows"], ["GitHub", "GitHub"],
    ["macOS", "macOS"], ["iPhone", "iPhone"], ["iPad", "iPad"],
    ["Google", "Google"], ["Telegram", "Telegram"], ["Instagram", "Instagram"],
    ["Microsoft", "Microsoft"], ["Apple", "Apple"], ["Python", "Python"],
    ["JavaScript", "JavaScript"], ["shower", "shower"], ["chocolate", "chocolate"],
    ["share", "share"], ["machine", "machine"], ["teacher", "teacher"],
    ["fashion", "fashion"], ["coffee", "coffee"], ["push", "push"],
    ["chat", "chat"], ["check", "check"], ["channel", "channel"],
    ["change", "change"], ["school", "school"], ["screen", "screen"],
    ["search", "search"], ["sheet", "sheet"], ["shop", "shop"],
    ["short", "short"], ["show", "show"], ["switch", "switch"],
    ["watch", "watch"], ["match", "match"], ["branch", "branch"],

    // 4. Kirill -> Yangi lotin (20 ta)
    ["Ўзбекистон", "Özbekiston"], ["ўзбекистон", "özbekiston"],
    ["Шаҳар", "Şahar"], ["шаҳар", "şahar"],
    ["Ғалаба", "Ğalaba"], ["ғалаба", "ğalaba"],
    ["Чироқ", "Çiroq"], ["чироқ", "çiroq"],
    ["Қўшиқ", "Qöşiq"], ["Тўғри", "Töğri"],
    ["Ўқитувчи", "Öqituvçi"], ["Тошкент", "Toşkent"],
    ["Самарқанд", "Samarqand"], ["Бухоро", "Buxoro"],
    ["Фарғона", "Farğona"], ["Андижон", "Andijon"],
    ["Қашқадарё", "Qaşqadaryo"], ["Сурхондарё", "Surxondaryo"],
    ["Хоразм", "Xorazm"], ["Қорақалпоғистон", "Qoraqalpoğiston"],

    // 5. Aralash gaplar va idempotentlik (12 ta)
    ["O'zbekiston va YouTube hamkorligi", "Özbekiston va YouTube hamkorligi"],
    ["Toshkent shahrida Windows dasturi o'rnatildi", "Toşkent şahrida Windows dasturi örnatildi"],
    ["Yangi chiroyli bog'lar va GitHub loyihasi", "Yangi çiroyli boğlar va GitHub loyihasi"],
    ["Özbekiston", "Özbekiston"], ["Ğalla", "Ğalla"],
    ["Şahar", "Şahar"], ["Çiroq", "Çiroq"],
    ["Senga yangi kitob sovg'a qilindi", "Senga yangi kitob sovğa qilindi"],
    ["O'qituvchi teacher so'zini tushuntirdi", "Öqituvçi teacher sözini tuşuntirdi"],
    ["Shokolad va chocolate farqi", "Şokolad va chocolate farqi"],
    ["Mashina va machine tushunchasi", "Maşina va machine tuşunçasi"],
    ["2027-yil 22-aprel — yangi alifbo kuni", "2027-yil 22-aprel — yangi alifbo kuni"]
  ];

  function runAlifTests(customFn) {
    var fn = customFn ||
      (root.AlifSmartEngine && typeof root.AlifSmartEngine.convert === 'function'
        ? function (t) { return root.AlifSmartEngine.convert(t, 'to_new'); }
        : fallbackConvert);

    var passed = 0;
    var failed = [];
    for (var i = 0; i < CASES.length; i++) {
      var inp = CASES[i][0];
      var exp = CASES[i][1];
      var got = fn(inp);
      var twice = fn(got);
      if (got === exp && twice === exp) {
        passed++;
      } else {
        failed.push({ input: inp, expected: exp, got: got, secondPass: twice });
      }
    }
    return {
      total: CASES.length,
      passed: passed,
      failedCount: failed.length,
      failed: failed
    };
  }

  root.runAlifTests = runAlifTests;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAlifTests: runAlifTests, CASES: CASES };
  }
})(typeof window !== 'undefined' ? window : globalThis);
