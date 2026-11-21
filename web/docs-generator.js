(function () {
  'use strict';

  var CATEGORIES = [
    { id: 'all', label: 'Barchasi (13)' },
    { id: 'talim', label: "Ta'lim" },
    { id: 'shaxsiy', label: 'Shaxsiy hujjatlar' },
    { id: 'biznes', label: 'Biznes' },
    { id: 'murojaat', label: 'Rasmiy murojaatlar' },
    { id: 'tashkilot', label: 'Tashkilotlar' }
  ];

  function todayStr() {
    var d = new Date();
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var yyyy = d.getFullYear();
    return dd + '.' + mm + '.' + yyyy + '-yil';
  }

  function cleanReason(raw, fallback) {
    var r = (raw || '').trim().replace(/\.+$/, '');
    if (!r) r = fallback || 'oilaviy sharoitim sababli';
    if (/(sababli|tufayli|uchun|bo'yicha|boyicha|munosabati bilan|asosida|maqsadida)$/i.test(r)) {
      return r;
    }
    return r + ' sababli';
  }

  var TEMPLATES = [
    // ── 1. TA'LIM ──
    {
      id: 'oquv-ariza',
      cat: 'talim',
      catName: "Ta'lim",
      title: "O'quv arizasi",
      desc: "Talaba yoki o'quvchi nomidan universitet rahbariyati yoki dekanatga yo'llanadigan rasmiy murojaat.",
      situation: "Akademik ta'til olish, o'qishni ko'chirish, kontrakt to'lovi muddatini uzaytirish yoki ma'lumotnoma olishda ishlatiladi.",
      required: ["Kimga (Rektor / Dekan)", "F.I.Sh.", "Universitet nomi", "Fakultet", "Yo'nalish", "Kurs", "Ariza mazmuni", "Sana"],
      fields: [
        { key: 'to_whom', label: 'Kimga (lavozimi va F.I.Sh.)', placeholder: "Jahon iqtisodiyoti va diplomatiya universiteti rektoriga", shared: 'org_head' },
        { key: 'fullname', label: 'F.I.Sh. (Kimdan)', placeholder: "Aliyev Ali Valiyevich", shared: 'fullname' },
        { key: 'org', label: "Ta'lim muassasasi", placeholder: "Jahon iqtisodiyoti va diplomatiya universiteti", shared: 'org' },
        { key: 'faculty', label: 'Fakultet', placeholder: "Xalqaro munosabatlar", shared: 'dept' },
        { key: 'major', label: "Ta'lim yo'nalishi", placeholder: "Xalqaro iqtisodiyot va menejment", shared: 'major' },
        { key: 'course', label: 'Kurs va guruh', placeholder: "2-kurs, 204-guruh", shared: 'course' },
        { key: 'reason', label: 'Ariza sababi va mazmuni', type: 'textarea', placeholder: "Oilaviy sharoitim sababli kontrakt to'lovini ikki bo'lib to'lashga ruxsat berishingizni" },
        { key: 'date', label: 'Sana', placeholder: todayStr(), defaultVal: todayStr() }
      ],
      build: function (d) {
        var to = d.to_whom || "Universitet rektori nomiga";
        var fn = d.fullname || "Aliyev Ali Valiyevich";
        var org = d.org || "Jahon iqtisodiyoti va diplomatiya universiteti";
        var fac = d.faculty || "Xalqaro munosabatlar";
        var maj = d.major || "Xalqaro munosabatlar";
        var crs = d.course || "2-kurs";
        var rsn = cleanReason(d.reason, "oilaviy sharoitim sababli");
        var dt = d.date || todayStr();
        return {
          rightHeader: [to, org + " " + fac + " fakulteti", maj + " yo'nalishi " + crs + " talabasi", fn + " tomonidan"],
          docTitle: "ARIZA",
          paragraphs: [
            "Men, " + fn + ", " + org + "ning " + fac + " fakulteti (" + maj + " yo'nalishi, " + crs + ") talabasi, " + rsn + " tegishli masalani ko'rib chiqishingizni va ijobiy hal etishingizni so'rayman.",
            "Ilova: tasdiqlovchi hujjatlar nusxasi (mavjud bo'lsa)."
          ],
          footerLeft: "Sana: " + dt,
          footerRight: "Imzo: ___________ / " + fn
        };
      }
    },
    {
      id: 'tushuntirish-xati',
      cat: 'talim',
      catName: "Ta'lim",
      title: "Tushuntirish xati",
      desc: "Dars qoldirish, kechikish yoki belgilangan topshiriq bajarilmagani sabablarini asoslab beruvchi hujjat.",
      situation: "Uzrli yoki uzrsiz sabab bilan mashg'ulotlarda qatnasha olmaganda dekanat yoki rahbariyat talabiga ko'ra yoziladi.",
      required: ["Kimga (Dekan / Rahbar)", "F.I.Sh.", "Muassasa va fakultet", "Holat sanasi", "Sabab tafsiloti", "Sana"],
      fields: [
        { key: 'to_whom', label: 'Kimga', placeholder: "Xalqaro munosabatlar fakulteti dekaniga", shared: 'org_head' },
        { key: 'fullname', label: 'F.I.Sh.', placeholder: "Karimova Madina Rustamovna", shared: 'fullname' },
        { key: 'org', label: "Ta'lim muassasasi / Tashkilot", placeholder: "Jahon iqtisodiyoti va diplomatiya universiteti", shared: 'org' },
        { key: 'faculty', label: "Fakultet / Bo'lim", placeholder: "Xalqaro huquq fakulteti, 2-kurs", shared: 'dept' },
        { key: 'incident_date', label: 'Holat yuz bergan sana', placeholder: "2026-yil 20-noyabr kuni" },
        { key: 'reason', label: 'Sabab tavsifi', type: 'textarea', placeholder: "Sog'lig'im keskin yomonlashib, shifokor ko'rigiga borganligim" },
        { key: 'date', label: 'Hujjat sanasi', placeholder: todayStr(), defaultVal: todayStr() }
      ],
      build: function (d) {
        var to = d.to_whom || "Fakultet dekani nomiga";
        var fn = d.fullname || "Karimova Madina Rustamovna";
        var org = d.org || "Jahon iqtisodiyoti va diplomatiya universiteti";
        var fac = d.faculty || "Xalqaro huquq fakulteti, 2-kurs";
        var idt = d.incident_date || "joriy yilning 20-noyabr kuni";
        var rsn = cleanReason(d.reason, "sog'lig'im yomonlashganligi sababli");
        var dt = d.date || todayStr();
        return {
          rightHeader: [to, org, fac + " talabasi", fn + "dan"],
          docTitle: "TUSHUNTIRISH XATI",
          paragraphs: [
            "Men, " + fn + ", " + idt + " dars mashg'ulotlarida ishtirok eta olmaganligimning sababi shundaki, " + rsn + " mashg'ulotlarga kelish imkonim bo'lmadi.",
            "Kelgusida dars intizomiga qat'iy rioya qilishga va qoldirilgan mavzularni o'z vaqtida o'zlashtirishga va'da beraman."
          ],
          footerLeft: "Sana: " + dt,
          footerRight: "Imzo: ___________ / " + fn
        };
      }
    },
    {
      id: 'tavsiyanoma',
      cat: 'talim',
      catName: "Ta'lim",
      title: "Tavsiyanoma",
      desc: "Talaba, bitiruvchi yoki xodimning bilim darajasi, shaxsiy fazilatlari va yutuqlarini tasdiqlovchi rasmiy xat.",
      situation: "Xalqaro grantlar, magistratura, stajirovka dasturlari yoki nufuzli ish o'rniga hujjat topshirishda kerak bo'ladi.",
      required: ["Nomzod F.I.Sh.", "O'qish / Ish joyi", "Yo'nalish / Lavozim", "Yutuq va fazilatlar", "Tavsiya beruvchi F.I.Sh. va unvoni", "Sana"],
      fields: [
        { key: 'candidate', label: 'Tavsiya etiluvchi F.I.Sh.', placeholder: "Abdullayev Sardor Bahodirovich", shared: 'fullname' },
        { key: 'org', label: "Ta'lim muassasasi / Tashkilot", placeholder: "Jahon iqtisodiyoti va diplomatiya universiteti", shared: 'org' },
        { key: 'faculty', label: "Fakultet / Yo'nalish", placeholder: "Xalqaro iqtisodiyot va menejment fakulteti, 2-kurs", shared: 'dept' },
        { key: 'achievements', label: 'Asosiy yutuqlar va fazilatlar', type: 'textarea', placeholder: "a'lo baholarga o'qishi, debat klubi asoschisi ekanligi, python va veb-dasturlash bo'yicha loyihalar yaratgani hamda mas'uliyatliligi" },
        { key: 'recommender', label: 'Tavsiya beruvchi F.I.Sh. va lavozimi', placeholder: "prof. A. Xolmatov, Kafedra mudiri" },
        { key: 'date', label: 'Sana', placeholder: todayStr(), defaultVal: todayStr() }
      ],
      build: function (d) {
        var cand = d.candidate || "Abdullayev Sardor Bahodirovich";
        var org = d.org || "Jahon iqtisodiyoti va diplomatiya universiteti";
        var fac = d.faculty || "Xalqaro iqtisodiyot va menejment fakulteti";
        var ach = (d.achievements || "o'qishdagi yuqori natijalari, tashabbuskorligi va jamoada ishlash qobiliyati").trim().replace(/\.+$/, '');
        var rec = d.recommender || "prof. A. Xolmatov, Kafedra mudiri";
        var dt = d.date || todayStr();
        return {
          rightHeader: ["So'ralgan joyga taqdim etish uchun"],
          docTitle: "TAVSIYANOMA",
          paragraphs: [
            "Ushbu tavsiyanoma " + org + "ning " + fac + " talabasi " + cand + "ga berildi.",
            cand + " o'qish davomida o'zini bilimli, tirishqoq va intizomli talaba sifatida namoyon etdi. Xususan, " + ach + " bilan tengdoshlari orasida alohida ajralib turadi.",
            "Yuqoridagilarni inobatga olgan holda, " + cand + "ni tanlov / grant / amaliyot dasturida ishtirok etish uchun tavsiya etamiz."
          ],
          footerLeft: "Sana: " + dt,
          footerRight: rec + " ___________"
        };
      }
    },


    // ── 3. SHAXSIY HUJJATLAR ──
    {
      id: 'tilxat',
      cat: 'shaxsiy',
      catName: 'Shaxsiy hujjatlar',
      title: 'Tilxat',
      desc: "Bir shaxs boshqa shaxsdan ma'lum miqdordagi pul mablag'i yoki moddiy buyumni olganligini tasdiqlovchi hujjat.",
      situation: "Qarz berish-olishda, avans to'lovida yoki qimmatbaho buyumni vaqtincha topshirishda moliyaviy xavfsizlik uchun yoziladi.",
      required: ["Oluvchi F.I.Sh.", "Pasport ma'lumoti va manzil", "Beruvchi F.I.Sh.", "Pul miqdori / Buyum", "Qaytarish muddati", "Sana"],
      fields: [
        { key: 'receiver', label: 'Pul / buyum oluvchi F.I.Sh.', placeholder: "Tursunov Jamshid Otabekovich", shared: 'fullname' },
        { key: 'passport', label: 'Oluvchi pasporti va manzili', placeholder: "AD 1234567, Toshkent shahri, Yunusobod tumani" },
        { key: 'giver', label: 'Pul / buyum beruvchi F.I.Sh.', placeholder: "Qodirov Sardor Akmalovich" },
        { key: 'amount', label: 'Pul miqdori (raqam va so‘z bilan) yoki buyum', placeholder: "5 000 000 (besh million) so'm" },
        { key: 'deadline', label: 'Qaytarish muddati', placeholder: "2026-yil 31-dekabrga qadar" },
        { key: 'date', label: 'Sana', placeholder: todayStr(), defaultVal: todayStr() }
      ],
      build: function (d) {
        var rcv = d.receiver || "Tursunov Jamshid Otabekovich";
        var psp = d.passport || "AD 1234567, Toshkent shahri";
        var gvr = d.giver || "Qodirov Sardor Akmalovich";
        var amt = d.amount || "5 000 000 (besh million) so'm";
        var ddl = d.deadline || "2026-yil 31-dekabrga qadar";
        var dt = d.date || todayStr();
        return {
          rightHeader: [],
          docTitle: "TILXAT",
          paragraphs: [
            "Men, " + rcv + " (pasport: " + psp + "), fuqaro " + gvr + "dan " + amt + " miqdoridagi pul mablag'ini (buyumni) to'liq sanab oldim.",
            "Ushbu mablag'ni (buyumni) " + ddl + " hech qanday e'tirozsiz va to'liq hajmda qaytarib berish majburiyatini o'z zimmamga olaman.",
            "Tilxat o'z qo'lim bilan yozildi va imzolandi."
          ],
          footerLeft: "Sana: " + dt,
          footerRight: "Oluvchi imzosi: ___________ / " + rcv
        };
      }
    },
    {
      id: 'ishonchnoma',
      cat: 'shaxsiy',
      catName: 'Shaxsiy hujjatlar',
      title: 'Ishonchnoma loyihasi',
      desc: "Bir shaxs boshqa shaxsga o'z nomidan hujjat topshirish, olish yoki vakillik qilish huquqini beruvchi hujjat.",
      situation: "O'zingiz shaxsan bora olmagan holatda diplom, ma'lumotnoma, jo'natma yoki to'lovni ishonchli vakil orqali olishda qo'llaniladi.",
      required: ["Ishonch bildiruvchi F.I.Sh.", "Pasport va manzil", "Vakil F.I.Sh.", "Vakolat mazmuni", "Amal qilish muddati", "Sana"],
      fields: [
        { key: 'principal', label: 'Ishonch bildiruvchi F.I.Sh.', placeholder: "Sobirov Dilshod Anvarovich", shared: 'fullname' },
        { key: 'principal_info', label: 'Ishonch bildiruvchi pasporti va manzili', placeholder: "AC 7654321, Toshkent shahri, Mirzo Ulug'bek tumani" },
        { key: 'agent', label: 'Vakil (ishonchli shaxs) F.I.Sh.', placeholder: "Sobirova Nilufar Anvarovna" },
        { key: 'agent_info', label: 'Vakil pasport ma’lumotlari', placeholder: "AD 9876543" },
        { key: 'scope', label: 'Berilayotgan vakolat mazmuni', type: 'textarea', placeholder: "Universitet arxividan diplom va ilovasining asl nusxasini olish hamda tegishli hujjatlarga imzo qo'yish" },
        { key: 'valid_until', label: 'Amal qilish muddati', placeholder: "3 (uch) oy muddatga" },
        { key: 'date', label: 'Sana', placeholder: todayStr(), defaultVal: todayStr() }
      ],
      build: function (d) {
        var prn = d.principal || "Sobirov Dilshod Anvarovich";
        var pInf = d.principal_info || "AC 7654321, Toshkent shahri";
        var agn = d.agent || "Sobirova Nilufar Anvarovna";
        var aInf = d.agent_info || "AD 9876543";
        var scp = (d.scope || "tegishli muassasadan hujjatlarni olish va imzo qo'yish").trim().replace(/\.+$/, '');
        var val = d.valid_until || "3 (uch) oy muddatga";
        var dt = d.date || todayStr();
        return {
          rightHeader: [],
          docTitle: "ISHONCHNOMA",
          paragraphs: [
            "Men, " + prn + " (pasport: " + pInf + "), ushbu ishonchnoma bilan fuqaro " + agn + "ga (pasport: " + aInf + ") mening nomimdan " + scp + " vakolatini beraman.",
            "Mazkur vakolatni amalga oshirish doirasida " + agn + " mening nomimdan arizalar topshirish, ma'lumotnomalar olish va zarur hujjatlarga imzo qo'yish huquqiga ega.",
            "Ishonchnoma " + val + " berildi."
          ],
          footerLeft: "Sana: " + dt,
          footerRight: "Ishonch bildiruvchi: ___________ / " + prn
        };
      }
    },

    // ── 4. BIZNES ──
    {
      id: 'tijorat-taklifi',
      cat: 'biznes',
      catName: 'Biznes',
      title: 'Tijorat taklifi',
      desc: "Potensial mijoz yoki hamkor tashkilotga mahsulot, xizmat va hamkorlik shartlarini taqdim etuvchi biznes xat.",
      situation: "Yangi mijozlarni jalb qilish, tender yoki B2B hamkorlikni yo'lga qo'yishda rasmiy elektron xat yoki PDF sifatida yuboriladi.",
      required: ["Kompaniya nomi", "Mijoz / Hamkor nomi", "Xizmat / Mahsulot tavsifi", "Afzallik va narx shartlari", "Aloqa mas'uli", "Sana"],
      fields: [
        { key: 'sender_org', label: 'Taklif yuboruvchi kompaniya', placeholder: "«AlifTech Solutions» MChJ", shared: 'org' },
        { key: 'client_org', label: 'Mijoz / Hamkor tashkilot', placeholder: "«Kelajak Ta'lim» o'quv markazi rahbariyatiga" },
        { key: 'offer_item', label: 'Taklif etilayotgan xizmat yoki mahsulot', type: 'textarea', placeholder: "hujjat aylanishini avtomatlashtirish va yangi alifbo konverteri tizimini joriy etish" },
        { key: 'terms', label: 'Asosiy afzalliklar va narx shartlari', placeholder: "14 kunlik bepul sinov davri, texnik qo'llab-quvvatlash va moslashuvchan oylik tarif" },
        { key: 'contact', label: "Mas'ul shaxs va telefon", placeholder: "S. Abdullayev, +998 90 123-45-67", shared: 'contact' },
        { key: 'date', label: 'Sana', placeholder: todayStr(), defaultVal: todayStr() }
      ],
      build: function (d) {
        var snd = d.sender_org || "«AlifTech Solutions» MChJ";
        var cln = d.client_org || "Hamkor tashkilot rahbariyatiga";
        var itm = (d.offer_item || "raqamli xizmatlar va dasturiy yechimlarni joriy etish").trim().replace(/\.+$/, '');
        var trm = d.terms || "qulay narxlar, tezkor o'rnatish va doimiy texnik yordam";
        var cnt = d.contact || "+998 90 123-45-67";
        var dt = d.date || todayStr();
        return {
          rightHeader: [cln, snd + " tomonidan"],
          docTitle: "TIJORAT TAKLIFI",
          paragraphs: [
            "Hurmatli hamkorlar!",
            snd + " sizga o'z hurmatini bildirgan holda, tashkilotingiz faoliyati samaradorligini oshirish maqsadida " + itm + " bo'yicha hamkorlikni taklif etadi.",
            "Bizning taklifimiz afzalliklari: " + trm + ".",
            "Hamkorlik shartlarini batafsil muhokama qilish va taqdimot o'tkazish uchun quyidagi raqam orqali bog'lanishingiz mumkin: " + cnt + "."
          ],
          footerLeft: "Sana: " + dt,
          footerRight: snd + " rahbariyati ___________"
        };
      }
    },
    {
      id: 'xizmat-shartnomasi',
      cat: 'biznes',
      catName: 'Biznes',
      title: 'Xizmat shartnomasi loyihasi',
      desc: "Buyurtmachi va ijrochi o'rtasida xizmat ko'rsatish hajmi, muddati va to'lov tartibini belgilovchi shartnoma matni.",
      situation: "Frilans loyihalar, IT xizmatlari, dizayn, tarjima yoki konsalting ishlarini rasmiylashtirishda asos sifatida ishlatiladi.",
      required: ["Shartnoma raqami", "Buyurtmachi", "Ijrochi", "Xizmat predmeti", "Summa va muddat", "Sana"],
      fields: [
        { key: 'contract_no', label: 'Shartnoma raqami', placeholder: "№ 14/2026" },
        { key: 'customer', label: 'Buyurtmachi (Tashkilot / F.I.Sh.)', placeholder: "«Global Trade» MChJ direktori A. Karimov" },
        { key: 'executor', label: 'Ijrochi (Tashkilot / F.I.Sh.)', placeholder: "YaTT Abdullayev Sardor Bahodirovich", shared: 'fullname' },
        { key: 'subject', label: 'Xizmat predmeti (nima bajariladi)', type: 'textarea', placeholder: "korporativ veb-sayt va hujjatlar konverteri modulini ishlab chiqish" },
        { key: 'price', label: 'Xizmat narxi va bajarish muddati', placeholder: "10 000 000 so'm, 15 ish kuni davomida" },
        { key: 'date', label: 'Sana', placeholder: todayStr(), defaultVal: todayStr() }
      ],
      build: function (d) {
        var no = d.contract_no || "№ 01/2026";
        var cst = d.customer || "«Buyurtmachi» MChJ";
        var exc = d.executor || "«Ijrochi»";
        var sbj = (d.subject || "kelishilgan texnik topshiriq asosida xizmat ko'rsatish").trim().replace(/\.+$/, '');
        var prc = d.price || "kelishilgan summa, 15 ish kuni ichida";
        var dt = d.date || todayStr();
        return {
          rightHeader: ["Toshkent shahri"],
          docTitle: "XIZMAT KO'RSATISH SHARTNOMASI " + no,
          paragraphs: [
            "Bir tomondan «Buyurtmachi» deb ataluvchi " + cst + " va ikkinchi tomondan «Ijrochi» deb ataluvchi " + exc + " ushbu shartnomani quyidagilar haqida tuzdilar:",
            "1. SHARTNOMA PREDMETI: Ijrochi Buyurtmachining topshirig'iga binoan " + sbj + " majburiyatini oladi, Buyurtmachi esa xizmatlarni qabul qilish va haqini to'lash majburiyatini oladi.",
            "2. NARX VA MUDDAT: Xizmatlar qiymati va bajarish muddati — " + prc + ". To'lovlar tomonlar kelishuviga muvofiq naqd pulsiz yoki naqd shaklda amalga oshiriladi.",
            "3. YAKUNIY QOIDALAR: Shartnoma ikki nusxada tuzildi va imzolangan kundan kuchga kiradi."
          ],
          footerLeft: "Buyurtmachi: ___________\nSana: " + dt,
          footerRight: "Ijrochi: ___________"
        };
      }
    },

    // ── 5. RASMIY MUROJAATLAR ──
    {
      id: 'rasmiy-ariza',
      cat: 'murojaat',
      catName: 'Rasmiy murojaatlar',
      title: 'Rasmiy ariza',
      desc: "Davlat idorasi, hokimiyat, mahalla yoki tashkilot rahbariga qonuniy huquq va manfaatlarni amalga oshirish uchun yoziladigan murojaat.",
      situation: "Ruxsatnoma olish, ishga kirish, ijtimoiy yordam yoki tashkilot rahbariyatidan rasmiy qaror so'rashda qo'llaniladi.",
      required: ["Idora / Rahbar (Kimga)", "F.I.Sh.", "Manzil va telefon", "Murojaat mazmuni", "Sana"],
      fields: [
        { key: 'to_whom', label: 'Kimga (Idora va rahbar)', placeholder: "Toshkent shahar Mirzo Ulug'bek tumani hokimiga" },
        { key: 'fullname', label: 'Ariza beruvchi F.I.Sh.', placeholder: "Xolmatov Bobur Erkinovich", shared: 'fullname' },
        { key: 'address', label: 'Yashash manzili va telefon', placeholder: "Mirzo Ulug'bek tumani, Buyuk Ipak Yo'li 12-uy, +998 90 123-45-67", shared: 'contact' },
        { key: 'content', label: 'Murojaat mazmuni va iltimos', type: 'textarea', placeholder: "mahallamiz hududida yoshlar uchun bepul kutubxona va o'quv markazi tashkil etishga bino ajratish masalasini ko'rib chiqishingizni" },
        { key: 'date', label: 'Sana', placeholder: todayStr(), defaultVal: todayStr() }
      ],
      build: function (d) {
        var to = d.to_whom || "Tashkilot rahbari nomiga";
        var fn = d.fullname || "Xolmatov Bobur Erkinovich";
        var adr = d.address || "Toshkent shahri";
        var cnt = (d.content || "tegishli masalani qonunchilik doirasida ko'rib chiqishingizni").trim().replace(/\.+$/, '');
        var dt = d.date || todayStr();
        return {
          rightHeader: [to, "Manzil: " + adr, fn + "dan"],
          docTitle: "ARIZA",
          paragraphs: [
            "Men, " + fn + ", ushbu ariza orqali Sizdan " + cnt + " so'rayman.",
            "Murojaatim natijasi haqida belgilangan tartibda yozma yoki elektron javob berishingizni iltimos qilaman."
          ],
          footerLeft: "Sana: " + dt,
          footerRight: "Imzo: ___________ / " + fn
        };
      }
    },
    {
      id: 'shikoyat-xati',
      cat: 'murojaat',
      catName: 'Rasmiy murojaatlar',
      title: 'Shikoyat xati',
      desc: "Buzilgan huquqlar, sifatsiz xizmat yoki mas'ul shaxslarning harakatsizligi yuzasidan yuqori turuvchi organga yoziladigan rasmiy e'tiroz.",
      situation: "Iste'molchi huquqlari buzilganda, shartnoma shartlari bajarilmaganda yoki rasmiy idoradan asosli chora talab qilinganda yoziladi.",
      required: ["Ko'rib chiquvchi idora", "Murojaatchi F.I.Sh.", "Manzil va telefon", "Muammo tafsiloti", "Talab qilinayotgan chora", "Sana"],
      fields: [
        { key: 'to_whom', label: "Kimga (Idora / Rahbar)", placeholder: "Raqobatni rivojlantirish va iste'molchilar huquqlarini himoya qilish qo'mitasiga" },
        { key: 'fullname', label: 'Murojaatchi F.I.Sh.', placeholder: "Nazarova Dilnoza Komilovna", shared: 'fullname' },
        { key: 'address', label: 'Manzil va telefon', placeholder: "Toshkent shahri, Chilonzor tumani, +998 90 123-45-67", shared: 'contact' },
        { key: 'issue', label: 'Holat va qonunbuzarlik tafsiloti', type: 'textarea', placeholder: "2026-yil 15-noyabr kuni xarid qilingan texnika nosoz chiqqani hamda sotuvchi tomonidan almashtirib berilmayotgani" },
        { key: 'demand', label: 'Talab qilinayotgan chora', placeholder: "holatni o'rganib chiqib, sifatsiz mahsulotni almashtirish yoki mablag'ni qaytarishda amaliy yordam berishingizni" },
        { key: 'date', label: 'Sana', placeholder: todayStr(), defaultVal: todayStr() }
      ],
      build: function (d) {
        var to = d.to_whom || "Tegishli nazorat idorasiga";
        var fn = d.fullname || "Nazarova Dilnoza Komilovna";
        var adr = d.address || "Toshkent shahri";
        var iss = (d.issue || "huquqlarim buzilganligi holati").trim().replace(/\.+$/, '');
        var dem = (d.demand || "qonuniy chora ko'rishingizni").trim().replace(/\.+$/, '');
        var dt = d.date || todayStr();
        return {
          rightHeader: [to, "Manzil: " + adr, fn + "dan"],
          docTitle: "SHIKOYAT XATI",
          paragraphs: [
            "Ushbu xat orqali " + iss + " yuzasidan rasmiy e'tiroz bildiraman.",
            "Yuqoridagi holatni atroflicha o'rganib chiqib, " + dem + " so'rayman.",
            "Ilova: chek, shartnoma va tasdiqlovchi dalillar nusxasi."
          ],
          footerLeft: "Sana: " + dt,
          footerRight: "Imzo: ___________ / " + fn
        };
      }
    },
    {
      id: 'taklif-xati',
      cat: 'murojaat',
      catName: 'Rasmiy murojaatlar',
      title: 'Taklif xati',
      desc: "Tashkilot, universitet yoki davlat idorasi faoliyatini takomillashtirish bo'yicha tashabbus va g'oyalarni taqdim etuvchi xat.",
      situation: "Yangi loyiha, tadbir, raqamli yechim yoki hamkorlik tashabbusini rahbariyatga rasman kiritishda ishlatiladi.",
      required: ["Kimga (Tashkilot / Rahbar)", "Tashabbuskor F.I.Sh.", "Aloqa ma'lumoti", "Taklif mazmuni va foydasi", "Sana"],
      fields: [
        { key: 'to_whom', label: 'Kimga', placeholder: "Yoshlar ishlari agentligi direktoriga" },
        { key: 'fullname', label: 'Tashabbuskor F.I.Sh. / Jamoa', placeholder: "Abdullayev Sardor, «Alif+» loyihasi jamoasi", shared: 'fullname' },
        { key: 'contact', label: 'Aloqa ma’lumotlari', placeholder: "+998 90 123-45-67 | info@alifplus.uz", shared: 'contact' },
        { key: 'proposal', label: 'Taklif g‘oyasi va kutilayotgan natija', type: 'textarea', placeholder: "talabalar va yoshlar o'rtasida savodxonlikni oshirish uchun bepul raqamli hujjatlar va imlo platformasini keng joriy etish" },
        { key: 'date', label: 'Sana', placeholder: todayStr(), defaultVal: todayStr() }
      ],
      build: function (d) {
        var to = d.to_whom || "Tashkilot rahbariyatiga";
        var fn = d.fullname || "Abdullayev Sardor";
        var cnt = d.contact || "+998 90 123-45-67";
        var prp = (d.proposal || "faoliyat samaradorligini oshiruvchi yangi loyihani joriy etish").trim().replace(/\.+$/, '');
        var dt = d.date || todayStr();
        return {
          rightHeader: [to, "Aloqa: " + cnt, fn + "dan"],
          docTitle: "TAKLIF XATI",
          paragraphs: [
            "Hurmatli rahbariyat!",
            "Faoliyat sifatini yanada oshirish va zamonaviy yechimlarni tatbiq etish maqsadida " + prp + " bo'yicha o'z taklifimizni taqdim etamiz.",
            "Ushbu tashabbus amaliyotga joriy etilgan taqdirda vaqt sarfi qisqarishi va foydalanuvchilar uchun qulay muhit yaratilishi kutilmoqda. Loyiha taqdimotini o'tkazishga tayyormiz."
          ],
          footerLeft: "Sana: " + dt,
          footerRight: "Tashabbuskor: ___________ / " + fn
        };
      }
    },

    // ── 6. TASHKILOTLAR ──
    {
      id: 'bayonnoma',
      cat: 'tashkilot',
      catName: 'Tashkilotlar',
      title: 'Bayonnoma',
      desc: "Yig'ilish, majlis yoki kengash muhokamasi, kun tartibi va qabul qilingan qarorlarni rasman qayd etuvchi hujjat.",
      situation: "Tashkilot yig'ilishlari, talabalar kengashi majlislari yoki komissiya qarorlarini hujjatlashtirishda ishlatiladi.",
      required: ["Tashkilot nomi", "Bayonnoma raqami", "Rais va Kotib", "Qatnashchilar", "Kun tartibi", "Qabul qilingan qaror", "Sana"],
      fields: [
        { key: 'org', label: 'Tashkilot / Kengash nomi', placeholder: "«Grand Debate Club» tashkiliy qo'mitasi", shared: 'org' },
        { key: 'proto_no', label: 'Bayonnoma raqami', placeholder: "№ 05" },
        { key: 'chair', label: 'Yig‘ilish raisi F.I.Sh.', placeholder: "S. Abdullayev", shared: 'fullname' },
        { key: 'secretary', label: 'Kotib F.I.Sh.', placeholder: "M. Karimova" },
        { key: 'attendees', label: 'Qatnashchilar', placeholder: "Qo'mita a'zolari (jami 12 nafar)" },
        { key: 'agenda', label: 'Kun tartibi', placeholder: "Respublika turniriga tayyorgarlik va hakamlar hay'atini tasdiqlash" },
        { key: 'decision', label: 'Qabul qilingan qaror', type: 'textarea', placeholder: "Turnirni 2026-yil 5-dekabr kuni o'tkazish hamda ro'yxatdan o'tish platformasini ishga tushirish tasdiqlansin" },
        { key: 'date', label: 'Sana', placeholder: todayStr(), defaultVal: todayStr() }
      ],
      build: function (d) {
        var org = d.org || "Tashkilot yig'ilishi";
        var no = d.proto_no || "№ 01";
        var chr = d.chair || "S. Abdullayev";
        var sec = d.secretary || "M. Karimova";
        var att = d.attendees || "Barcha a'zolar";
        var agn = d.agenda || "Joriy tashkiliy masalalar";
        var dec = (d.decision || "kun tartibidagi masala ma'qullansin").trim().replace(/\.+$/, '');
        var dt = d.date || todayStr();
        return {
          rightHeader: [org],
          docTitle: "YIG'ILISH BAYONNOMASI " + no,
          paragraphs: [
            "Yig'ilish raisi: " + chr + " | Kotib: " + sec + " | Qatnashdilar: " + att + ".",
            "KUN TARTIBI: " + agn + ".",
            "ESHITILDI: Kun tartibidagi masala yuzasidan yig'ilish raisi " + chr + "ning axboroti tinglandi va muhokama qilindi.",
            "QAROR QILINDI: " + dec + "."
          ],
          footerLeft: "Rais: ___________ (" + chr + ")\nSana: " + dt,
          footerRight: "Kotib: ___________ (" + sec + ")"
        };
      }
    },
    {
      id: 'buyruq-loyihasi',
      cat: 'tashkilot',
      catName: 'Tashkilotlar',
      title: 'Buyruq loyihasi',
      desc: "Tashkilot rahbari nomidan ishga qabul qilish, ta'til berish, xizmat safari yoki vazifa yuklash bo'yicha farmoyish hujjati.",
      situation: "Kadrlar harakati yoki tashkilot ichki boshqaruv qarorlarini rasmiylashtirishda rahbar imzosiga tayyorlanadi.",
      required: ["Tashkilot nomi", "Buyruq raqami", "Buyruq mazmuni", "Asos", "Rahbar lavozimi va F.I.Sh.", "Sana"],
      fields: [
        { key: 'org', label: 'Tashkilot nomi', placeholder: "«AlifTech» MChJ", shared: 'org' },
        { key: 'order_no', label: 'Buyruq raqami', placeholder: "№ 24-K" },
        { key: 'topic', label: 'Buyruq sarlavhasi', placeholder: "Xodimni ishga qabul qilish to'g'risida" },
        { key: 'body', label: 'Buyruq matni (BUYURAMAN)', type: 'textarea', placeholder: "1. Karimov Jasur Rustamovich 2026-yil 25-noyabrdan loyiha menejeri lavozimiga ishga qabul qilinsin.\n2. Buxgalteriya bo'limiga shtat jadvaliga muvofiq ish haqi to'lash yuklatilsin." },
        { key: 'basis', label: 'Asos', placeholder: "J. Karimovning arizasi va mehnat shartnomasi" },
        { key: 'director', label: 'Rahbar lavozimi va F.I.Sh.', placeholder: "Direktor S. Abdullayev", shared: 'fullname' },
        { key: 'date', label: 'Sana', placeholder: todayStr(), defaultVal: todayStr() }
      ],
      build: function (d) {
        var org = d.org || "«Tashkilot» MChJ";
        var no = d.order_no || "№ 01";
        var top = d.topic || "Tashkiliy masala to'g'risida";
        var bdy = d.body || "1. Belgilangan vazifalar o'z muddatida ijro etilsin.";
        var bas = d.basis || "Rahbariyat qarori";
        var dir = d.director || "Direktor S. Abdullayev";
        var dt = d.date || todayStr();
        return {
          rightHeader: [org],
          docTitle: "BUYRUQ " + no + "\n" + top,
          paragraphs: [
            "Ish faoliyatini samarali tashkil etish maqsadida BUYURAMAN:",
            bdy,
            "Asos: " + bas + "."
          ],
          footerLeft: "Sana: " + dt,
          footerRight: dir + " ___________"
        };
      }
    },
    {
      id: 'dalolatnoma',
      cat: 'tashkilot',
      catName: 'Tashkilotlar',
      title: 'Dalolatnoma',
      desc: "Komissiya yoki mas'ul shaxslar ishtirokida biror voqea, jihozni topshirish-qabul qilish yoki tekshiruv faktini tasdiqlovchi hujjat.",
      situation: "Texnika/jihozlarni topshirish-qabul qilishda, inventarizatsiyada yoki biror texnik nosozlikni qayd etishda tuziladi.",
      required: ["Tashkilot nomi", "Dalolatnoma raqami", "Komissiya a'zolari", "Tasdiqlanayotgan holat / obyekt", "Xulosa", "Sana"],
      fields: [
        { key: 'org', label: 'Tashkilot nomi', placeholder: "«AlifTech» MChJ", shared: 'org' },
        { key: 'act_no', label: 'Dalolatnoma raqami', placeholder: "№ 08" },
        { key: 'commission', label: 'Komissiya raisi va a’zolari', placeholder: "Rais: S. Abdullayev; A'zolar: A. Valiyev, D. Sobirova" },
        { key: 'fact', label: 'Tasdiqlanayotgan holat yoki topshirilgan mulk', type: 'textarea', placeholder: "5 dona noutbuk va 2 dona proyektor to'liq ishchi holatda o'quv xonasiga topshirilganligi" },
        { key: 'conclusion', label: 'Komissiya xulosasi', placeholder: "Jihozlar nuqsonsiz qabul qilindi va foydalanishga yaroqli deb topildi" },
        { key: 'date', label: 'Sana', placeholder: todayStr(), defaultVal: todayStr() }
      ],
      build: function (d) {
        var org = d.org || "«Tashkilot» MChJ";
        var no = d.act_no || "№ 01";
        var com = d.commission || "Rais: S. Abdullayev; A'zolar: A. Valiyev";
        var fct = (d.fact || "belgilangan moddiy boyliklar ko'zdan kechirilganligi").trim().replace(/\.+$/, '');
        var cnc = (d.conclusion || "holat rasman tasdiqlandi").trim().replace(/\.+$/, '');
        var dt = d.date || todayStr();
        return {
          rightHeader: [org],
          docTitle: "DALOLATNOMA " + no,
          paragraphs: [
            "Ushbu dalolatnoma " + dt + " kuni quyidagi tarkibdagi komissiya tomonidan tuzildi: " + com + ".",
            "Komissiya tomonidan " + fct + " holati tekshirildi va qayd etildi.",
            "XULOSA: " + cnc + ". Dalolatnoma ikki nusxada tuzilib, imzolandi."
          ],
          footerLeft: "Sana: " + dt,
          footerRight: "Komissiya a'zolari imzolari: ___________"
        };
      }
    }
  ];

  var PROFILE_KEY = 'alif_doc_builder_profile_v1';
  var profile = {};
  try {
    profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') || {};
  } catch (e) { profile = {}; }

  function saveProfile() {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (e) {}
  }

  function convertScript(text, scriptMode) {
    if (!text) return '';
    if (window.Alif && typeof window.Alif.convert === 'function') {
      if (scriptMode === 'oldlat') {
        var asNew = window.Alif.convert(text, 'auto2new', { smart: false });
        return window.Alif.convert(asNew, 'new2oldlat', { smart: false });
      }
      if (scriptMode === 'cyr') {
        var asNew2 = window.Alif.convert(text, 'auto2new', { smart: false });
        return window.Alif.convert(asNew2, 'new2cyr', { smart: false });
      }
      return window.Alif.convert(text, 'auto2new', { smart: false });
    }
    // Fallback agar converter.js yuklanmagan bo'lsa
    return text
      .replace(/([Oo])['ʻ’‘ʼ`]/g, function (_, c) { return c === 'O' ? 'Ö' : 'ö'; })
      .replace(/([Gg])['ʻ’‘ʼ`]/g, function (_, c) { return c === 'G' ? 'Ğ' : 'ğ'; })
      .replace(/([Ss])[Hh]/g, function (_, c) { return c === 'S' ? 'Ş' : 'ş'; })
      .replace(/([Cc])[Hh]/g, function (_, c) { return c === 'C' ? 'Ç' : 'ç'; });
  }

  function initSmartDocBuilder() {
    var catBar = document.getElementById('alifDocCatBar');
    var gridEl = document.getElementById('alifDocCardsGrid');
    var searchEl = document.getElementById('alifDocSearch');
    var builderSection = document.getElementById('alifSmartBuilder');
    var formTitleEl = document.getElementById('alifBuilderTitle');
    var formSubEl = document.getElementById('alifBuilderSub');
    var formFieldsEl = document.getElementById('alifBuilderFields');
    var paperEl = document.getElementById('alifDocPaper');
    if (!catBar || !gridEl || !formFieldsEl || !paperEl) return;

    var activeCat = 'all';
    var activeTpl = TEMPLATES[0];
    var scriptMode = 'newlat'; // newlat | oldlat | cyr
    var formValues = {};

    function loadTplValues(tpl) {
      formValues = {};
      tpl.fields.forEach(function (f) {
        if (f.shared && profile[f.shared]) {
          formValues[f.key] = profile[f.shared];
        } else if (f.defaultVal) {
          formValues[f.key] = f.defaultVal;
        } else {
          formValues[f.key] = '';
        }
      });
    }

    function escapeHtml(s) {
      return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function renderCategories() {
      catBar.innerHTML = CATEGORIES.map(function (c) {
        var cls = 'alif-doc-cat-btn' + (c.id === activeCat ? ' is-active' : '');
        return '<button type="button" class="' + cls + '" data-cat="' + c.id + '">' + c.label + '</button>';
      }).join('');
    }

    function renderCards() {
      var q = (searchEl && searchEl.value || '').trim().toLowerCase();
      var list = TEMPLATES.filter(function (t) {
        var matchCat = activeCat === 'all' || t.cat === activeCat;
        if (!matchCat) return false;
        if (!q) return true;
        var hay = (t.title + ' ' + t.catName + ' ' + t.desc + ' ' + t.situation + ' ' + t.required.join(' ')).toLowerCase();
        return hay.indexOf(q) !== -1;
      });

      if (!list.length) {
        gridEl.innerHTML = '<div class="alif-doc-empty">Qidiruv bo‘yicha hujjat topilmadi. Boshqa kalit so‘z kiritib ko‘ring.</div>';
        return;
      }

      gridEl.innerHTML = list.map(function (t) {
        var isSelected = t.id === activeTpl.id;
        var reqTags = t.required.map(function (r) {
          return '<span class="alif-doc-req-tag">' + escapeHtml(r) + '</span>';
        }).join('');
        return '<article class="alif-doc-card' + (isSelected ? ' is-selected' : '') + '" data-tpl="' + t.id + '">' +
          '<div class="alif-doc-card-top">' +
            '<span class="alif-doc-badge">' + escapeHtml(t.catName) + '</span>' +
            (isSelected ? '<span class="alif-doc-active-dot">Tanlangan</span>' : '') +
          '</div>' +
          '<h3 class="alif-doc-card-title">' + escapeHtml(t.title) + '</h3>' +
          '<p class="alif-doc-card-desc">' + escapeHtml(t.desc) + '</p>' +
          '<div class="alif-doc-card-sit"><strong>Qachon ishlatiladi:</strong> ' + escapeHtml(t.situation) + '</div>' +
          '<div class="alif-doc-card-req"><strong>Kerakli ma’lumotlar:</strong><div class="alif-doc-req-list">' + reqTags + '</div></div>' +
          '<button type="button" class="alif-btn alif-btn-primary alif-doc-open-btn" data-open-tpl="' + t.id + '">Tayyorlash va eksport qilish →</button>' +
        '</article>';
      }).join('');
    }

    function getCompiledDoc() {
      var rawDoc = activeTpl.build(formValues);
      return {
        rightHeader: rawDoc.rightHeader.map(function (line) { return convertScript(line, scriptMode); }),
        docTitle: convertScript(rawDoc.docTitle, scriptMode),
        paragraphs: rawDoc.paragraphs.map(function (p) { return convertScript(p, scriptMode); }),
        footerLeft: convertScript(rawDoc.footerLeft, scriptMode),
        footerRight: convertScript(rawDoc.footerRight, scriptMode)
      };
    }

    function getPlainTextDoc() {
      var d = getCompiledDoc();
      var lines = [];
      if (d.rightHeader.length) {
        lines.push(d.rightHeader.join('\n'));
        lines.push('');
      }
      lines.push(d.docTitle);
      lines.push('');
      d.paragraphs.forEach(function (p) {
        lines.push(p);
        lines.push('');
      });
      lines.push(d.footerLeft + '          ' + d.footerRight);
      return lines.join('\n');
    }

    var sheetEl = document.getElementById('alifDocSheet');
    var headerSlotEl = document.getElementById('alifPaperHeaderSlot');
    var footerSlotEl = document.getElementById('alifPaperFooterSlot');
    var manualBadgeEl = document.getElementById('alifManualEditBadge');
    var resetTplBtn = document.getElementById('alifDocResetTplBtn');
    var addRowBtn = document.getElementById('alifDocAddTableRow');

    var editorState = {
      fontFamily: 'Times New Roman',
      fontSize: '14pt',
      lineSpacing: '1.5',
      margins: 'standard',
      headerText: '',
      footerText: '',
      pageNumbering: false,
      isManual: false
    };

    var undoStack = [];
    var redoStack = [];
    var snapTimer = null;

    function updateHistoryButtons() {
      var uBtn = document.getElementById('alifDocUndoBtn');
      var rBtn = document.getElementById('alifDocRedoBtn');
      if (uBtn) uBtn.disabled = undoStack.length <= 1;
      if (rBtn) rBtn.disabled = redoStack.length === 0;
    }

    function pushSnapshot() {
      var cur = paperEl.innerHTML;
      if (undoStack.length && undoStack[undoStack.length - 1] === cur) return;
      undoStack.push(cur);
      if (undoStack.length > 50) undoStack.shift();
      redoStack = [];
      updateHistoryButtons();
    }

    function scheduleSnapshot() {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(pushSnapshot, 320);
    }

    function setManualMode(flag) {
      editorState.isManual = flag;
      if (manualBadgeEl) manualBadgeEl.hidden = !flag;
      if (resetTplBtn) resetTplBtn.hidden = !flag;
    }

    function syncTableControls() {
      if (addRowBtn) {
        addRowBtn.hidden = !paperEl.querySelector('table');
      }
    }

    function applySheetStyles() {
      if (!sheetEl) return;
      var fontStack = editorState.fontFamily === 'Times New Roman'
        ? '"Times New Roman", Georgia, serif'
        : '"' + editorState.fontFamily + '", -apple-system, BlinkMacSystemFont, sans-serif';
      sheetEl.style.fontFamily = fontStack;
      paperEl.style.fontSize = editorState.fontSize;
      paperEl.style.lineHeight = editorState.lineSpacing;

      var padMap = {
        standard: '34px 36px',
        wide: '48px 52px',
        narrow: '20px 22px'
      };
      sheetEl.style.padding = padMap[editorState.margins] || padMap.standard;

      var hTxt = convertScript(editorState.headerText.trim(), scriptMode);
      if (headerSlotEl) {
        if (hTxt) {
          headerSlotEl.hidden = false;
          headerSlotEl.textContent = hTxt;
        } else {
          headerSlotEl.hidden = true;
          headerSlotEl.textContent = '';
        }
      }

      var fTxt = convertScript(editorState.footerText.trim(), scriptMode);
      var pgTxt = editorState.pageNumbering ? convertScript('1-bet', scriptMode) : '';
      if (footerSlotEl) {
        if (fTxt || pgTxt) {
          footerSlotEl.hidden = false;
          footerSlotEl.innerHTML = '<span>' + escapeHtml(fTxt) + '</span><span>' + escapeHtml(pgTxt) + '</span>';
        } else {
          footerSlotEl.hidden = true;
          footerSlotEl.innerHTML = '';
        }
      }
    }

    function renderPreview(forceReset) {
      if (forceReset) {
        setManualMode(false);
      }
      if (!editorState.isManual) {
        var d = getCompiledDoc();
        var rhHtml = d.rightHeader.length
          ? '<div class="alif-paper-right">' + d.rightHeader.map(escapeHtml).join('<br>') + '</div>'
          : '';
        var titleHtml = '<div class="alif-paper-title">' + escapeHtml(d.docTitle).replace(/\n/g, '<br>') + '</div>';
        var bodyHtml = d.paragraphs.map(function (p) {
          return '<p class="alif-paper-p">' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>';
        }).join('');
        var footHtml = '<div class="alif-paper-foot">' +
          '<div>' + escapeHtml(d.footerLeft).replace(/\n/g, '<br>') + '</div>' +
          '<div style="text-align:right;">' + escapeHtml(d.footerRight).replace(/\n/g, '<br>') + '</div>' +
        '</div>';

        paperEl.innerHTML = rhHtml + titleHtml + bodyHtml + footHtml;
        undoStack = [paperEl.innerHTML];
        redoStack = [];
        updateHistoryButtons();
      }
      applySheetStyles();
      syncTableControls();
    }

    function renderForm() {
      if (formTitleEl) formTitleEl.textContent = activeTpl.title;
      if (formSubEl) formSubEl.textContent = activeTpl.situation;

      formFieldsEl.innerHTML = activeTpl.fields.map(function (f) {
        var val = escapeHtml(formValues[f.key] || '');
        var ph = escapeHtml(f.placeholder || '');
        if (f.type === 'textarea') {
          return '<div class="alif-b-field">' +
            '<label for="bf_' + f.key + '">' + escapeHtml(f.label) + '</label>' +
            '<textarea id="bf_' + f.key + '" data-fkey="' + f.key + '" rows="3" placeholder="' + ph + '">' + val + '</textarea>' +
          '</div>';
        }
        return '<div class="alif-b-field">' +
          '<label for="bf_' + f.key + '">' + escapeHtml(f.label) + '</label>' +
          '<input type="text" id="bf_' + f.key + '" data-fkey="' + f.key + '" value="' + val + '" placeholder="' + ph + '" />' +
        '</div>';
      }).join('');

      renderPreview(true);
    }

    function selectTemplate(tplId, scrollIntoView) {
      var found = TEMPLATES.find(function (t) { return t.id === tplId; });
      if (!found) return;
      activeTpl = found;
      loadTplValues(activeTpl);
      renderCards();
      renderForm();
      if (scrollIntoView && builderSection) {
        builderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Jonli tahrirlash kuzatuvi
    paperEl.addEventListener('input', function () {
      setManualMode(true);
      syncTableControls();
      scheduleSnapshot();
    });

    paperEl.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          doRedo();
        } else {
          doUndo();
        }
      }
    });

    function doUndo() {
      if (undoStack.length <= 1) return;
      var current = undoStack.pop();
      redoStack.push(current);
      paperEl.innerHTML = undoStack[undoStack.length - 1];
      setManualMode(true);
      syncTableControls();
      updateHistoryButtons();
    }

    function doRedo() {
      if (!redoStack.length) return;
      var next = redoStack.pop();
      undoStack.push(next);
      paperEl.innerHTML = next;
      setManualMode(true);
      syncTableControls();
      updateHistoryButtons();
    }

    var undoBtn = document.getElementById('alifDocUndoBtn');
    var redoBtn = document.getElementById('alifDocRedoBtn');
    if (undoBtn) undoBtn.addEventListener('click', doUndo);
    if (redoBtn) redoBtn.addEventListener('click', doRedo);

    if (resetTplBtn) {
      resetTplBtn.addEventListener('click', function () {
        renderPreview(true);
      });
    }

    // Toolbar: Bold / Italic (mousedown selectionni saqlab qoladi)
    document.querySelectorAll('[data-exec]').forEach(function (btn) {
      btn.addEventListener('mousedown', function (e) {
        e.preventDefault();
        paperEl.focus();
        document.execCommand(btn.dataset.exec, false, null);
        setManualMode(true);
        pushSnapshot();
      });
    });

    // Toolbar: 4-way Text Alignment
    document.querySelectorAll('[data-align]').forEach(function (btn) {
      btn.addEventListener('mousedown', function (e) {
        e.preventDefault();
        var al = btn.dataset.align;
        var cmdMap = { left: 'justifyLeft', center: 'justifyCenter', right: 'justifyRight', justify: 'justifyFull' };
        paperEl.focus();
        document.execCommand(cmdMap[al], false, null);
        var sel = window.getSelection();
        if (sel && sel.anchorNode) {
          var el = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
          var block = el && el.closest('p, div.alif-paper-title, div.alif-paper-right, td, th');
          if (block && paperEl.contains(block)) {
            block.style.textAlign = al;
          }
        }
        setManualMode(true);
        pushSnapshot();
      });
    });

    // Font family, size, line spacing, margins
    var ffSel = document.getElementById('alifDocFontFamily');
    var fsSel = document.getElementById('alifDocFontSize');
    var lsSel = document.getElementById('alifDocLineSpacing');
    var mgSel = document.getElementById('alifDocMargins');

    if (ffSel) ffSel.addEventListener('change', function () { editorState.fontFamily = ffSel.value; applySheetStyles(); });
    if (fsSel) fsSel.addEventListener('change', function () { editorState.fontSize = fsSel.value; applySheetStyles(); });
    if (lsSel) lsSel.addEventListener('change', function () { editorState.lineSpacing = lsSel.value; applySheetStyles(); });
    if (mgSel) mgSel.addEventListener('change', function () { editorState.margins = mgSel.value; applySheetStyles(); });

    // Jadval qo'shish va qator qo'shish
    var insTblBtn = document.getElementById('alifDocInsertTable');
    if (insTblBtn) {
      insTblBtn.addEventListener('click', function () {
        var tbl = document.createElement('table');
        tbl.className = 'alif-paper-table';
        tbl.innerHTML =
          '<thead><tr><th>№</th><th>Nomi / Ko‘rsatkich</th><th>Miqdori / Izoh</th></tr></thead>' +
          '<tbody>' +
            '<tr><td>1</td><td>...</td><td>...</td></tr>' +
            '<tr><td>2</td><td>...</td><td>...</td></tr>' +
          '</tbody>';
        var foot = paperEl.querySelector('.alif-paper-foot');
        if (foot) {
          paperEl.insertBefore(tbl, foot);
        } else {
          paperEl.appendChild(tbl);
        }
        setManualMode(true);
        syncTableControls();
        pushSnapshot();
      });
    }

    if (addRowBtn) {
      addRowBtn.addEventListener('click', function () {
        var tables = paperEl.querySelectorAll('table');
        if (!tables.length) return;
        var lastTbl = tables[tables.length - 1];
        var tbody = lastTbl.querySelector('tbody') || lastTbl;
        var rows = tbody.querySelectorAll('tr');
        var colCount = rows.length ? rows[0].children.length : 3;
        var tr = document.createElement('tr');
        for (var c = 0; c < colCount; c++) {
          var td = document.createElement('td');
          td.textContent = c === 0 ? String(rows.length + 1) : '...';
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
        setManualMode(true);
        pushSnapshot();
      });
    }

    // Header / Footer & Page Numbering
    var toggleHFBtn = document.getElementById('alifDocToggleHF');
    var hfPanel = document.getElementById('alifDocHFPanel');
    var headerInp = document.getElementById('alifDocHeaderInput');
    var footerInp = document.getElementById('alifDocFooterInput');
    var pageNumChk = document.getElementById('alifDocPageNumCheck');

    if (toggleHFBtn && hfPanel) {
      toggleHFBtn.addEventListener('click', function () {
        hfPanel.hidden = !hfPanel.hidden;
        toggleHFBtn.classList.toggle('is-active', !hfPanel.hidden);
      });
    }
    if (headerInp) headerInp.addEventListener('input', function () { editorState.headerText = headerInp.value; applySheetStyles(); });
    if (footerInp) footerInp.addEventListener('input', function () { editorState.footerText = footerInp.value; applySheetStyles(); });
    if (pageNumChk) pageNumChk.addEventListener('change', function () { editorState.pageNumbering = pageNumChk.checked; applySheetStyles(); });

    catBar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cat]');
      if (!btn) return;
      activeCat = btn.dataset.cat;
      renderCategories();
      renderCards();
    });

    if (searchEl) {
      searchEl.addEventListener('input', renderCards);
    }

    gridEl.addEventListener('click', function (e) {
      var openBtn = e.target.closest('[data-open-tpl]');
      var card = e.target.closest('[data-tpl]');
      if (openBtn) {
        selectTemplate(openBtn.dataset.openTpl, true);
      } else if (card) {
        selectTemplate(card.dataset.tpl, true);
      }
    });

    formFieldsEl.addEventListener('input', function (e) {
      var el = e.target.closest('[data-fkey]');
      if (!el) return;
      var k = el.dataset.fkey;
      formValues[k] = el.value;
      var fDef = activeTpl.fields.find(function (x) { return x.key === k; });
      if (fDef && fDef.shared) {
        profile[fDef.shared] = el.value;
        saveProfile();
      }
      renderPreview(true);
    });

    // Yozuv rejimi (Yangi lotin / Eski lotin / Kirill)
    document.querySelectorAll('[data-doc-script]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        scriptMode = btn.dataset.docScript;
        document.querySelectorAll('[data-doc-script]').forEach(function (b) {
          b.classList.toggle('is-active', b.dataset.docScript === scriptMode);
        });
        if (editorState.isManual) {
          // Qo'lda tahrirlangan matnni ham tanlangan alifboga o'girish
          var walker = document.createTreeWalker(paperEl, NodeFilter.SHOW_TEXT, null, false);
          var n;
          while ((n = walker.nextNode())) {
            if (n.nodeValue && n.nodeValue.trim()) {
              n.nodeValue = convertScript(n.nodeValue, scriptMode);
            }
          }
          applySheetStyles();
          pushSnapshot();
        } else {
          renderPreview(false);
        }
      });
    });

    var fillDemoBtn = document.getElementById('alifDocFillDemo');
    if (fillDemoBtn) {
      fillDemoBtn.addEventListener('click', function () {
        activeTpl.fields.forEach(function (f) {
          formValues[f.key] = f.placeholder || '';
        });
        renderForm();
      });
    }

    var clearFormBtn = document.getElementById('alifDocClearForm');
    if (clearFormBtn) {
      clearFormBtn.addEventListener('click', function () {
        profile = {};
        saveProfile();
        activeTpl.fields.forEach(function (f) {
          formValues[f.key] = f.defaultVal || '';
        });
        renderForm();
      });
    }

    function getLivePlainText() {
      var parts = [];
      if (headerSlotEl && !headerSlotEl.hidden && headerSlotEl.textContent.trim()) {
        parts.push(headerSlotEl.textContent.trim());
        parts.push('----------------------------------------');
      }
      parts.push(paperEl.innerText.trim());
      if (footerSlotEl && !footerSlotEl.hidden && footerSlotEl.innerText.trim()) {
        parts.push('----------------------------------------');
        parts.push(footerSlotEl.innerText.trim());
      }
      return parts.join('\n\n');
    }

    var copyBtn = document.getElementById('alifDocCopyBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var txt = getLivePlainText();
        if (navigator.clipboard) navigator.clipboard.writeText(txt);
        var old = copyBtn.textContent;
        copyBtn.textContent = '✓ Nusxa olindi';
        setTimeout(function () { copyBtn.textContent = old; }, 1500);
      });
    }

    function downloadBlob(blob, filename) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 250);
    }

    var txtBtn = document.getElementById('alifDocTxtBtn');
    if (txtBtn) {
      txtBtn.addEventListener('click', function () {
        downloadBlob(new Blob([getLivePlainText()], { type: 'text/plain;charset=utf-8' }), activeTpl.id + '_alifplus.txt');
      });
    }

    // ── HIGH-FIDELITY .DOCX EXPORT (JONLI DOM + JADVAL + KOLONTITUL + SAHIFA RAQAMI) ──
    var docxBtn = document.getElementById('alifDocDocxBtn');
    if (docxBtn) {
      docxBtn.addEventListener('click', async function () {
        if (!window.JSZip) {
          downloadBlob(new Blob([getLivePlainText()], { type: 'text/plain;charset=utf-8' }), activeTpl.id + '_alifplus.txt');
          return;
        }

        var esc = function (s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
        var fontName = editorState.fontFamily || 'Times New Roman';
        var ptNum = parseInt(editorState.fontSize, 10) || 14;
        var halfPt = ptNum * 2;
        var lineTwips = Math.round(parseFloat(editorState.lineSpacing || '1.5') * 240);
        var marginMap = { standard: 1134, wide: 1701, narrow: 680 };
        var pgMar = marginMap[editorState.margins] || 1134;

        function buildRunsFromNode(node, inheritedBold, inheritedItalic, customHalfPt) {
          var sz = customHalfPt || halfPt;
          if (node.nodeType === 3) {
            var raw = node.nodeValue || '';
            if (!raw) return '';
            var lines = raw.split(/\n/);
            return lines.map(function (ln, idx) {
              var rPr = '<w:rPr><w:rFonts w:ascii="' + esc(fontName) + '" w:hAnsi="' + esc(fontName) + '"/><w:sz w:val="' + sz + '"/>' +
                        (inheritedBold ? '<w:b/>' : '') + (inheritedItalic ? '<w:i/>' : '') + '</w:rPr>';
              return (idx > 0 ? '<w:r><w:br/></w:r>' : '') +
                     '<w:r>' + rPr + '<w:t xml:space="preserve">' + esc(ln) + '</w:t></w:r>';
            }).join('');
          }
          if (node.nodeType !== 1) return '';
          var tag = node.tagName.toUpperCase();
          if (tag === 'BR') return '<w:r><w:br/></w:r>';
          var b = inheritedBold || tag === 'B' || tag === 'STRONG' || (node.style && node.style.fontWeight === 'bold');
          var it = inheritedItalic || tag === 'I' || tag === 'EM' || (node.style && node.style.fontStyle === 'italic');
          var out = '';
          node.childNodes.forEach(function (ch) {
            out += buildRunsFromNode(ch, b, it, sz);
          });
          return out;
        }

        function mapAlign(el, fallback) {
          var ta = (el && el.style && el.style.textAlign) || fallback || 'left';
          if (ta === 'justify') return 'both';
          if (ta === 'center' || ta === 'right' || ta === 'left') return ta;
          return 'left';
        }

        var bodyXml = [];
        Array.from(paperEl.children).forEach(function (el) {
          var tag = el.tagName.toUpperCase();
          if (tag === 'TABLE') {
            var trs = Array.from(el.querySelectorAll('tr')).map(function (tr, rIdx) {
              var tcs = Array.from(tr.children).map(function (cell) {
                var isHead = rIdx === 0 || cell.tagName.toUpperCase() === 'TH';
                var runs = buildRunsFromNode(cell, isHead, false, halfPt - 2);
                return '<w:tc><w:tcPr><w:tcBorders><w:top w:val="single" w:sz="6" w:color="333333"/><w:left w:val="single" w:sz="6" w:color="333333"/><w:bottom w:val="single" w:sz="6" w:color="333333"/><w:right w:val="single" w:sz="6" w:color="333333"/></w:tcBorders></w:tcPr>' +
                       '<w:p><w:pPr><w:spacing w:after="40"/></w:pPr>' + runs + '</w:p></w:tc>';
              }).join('');
              return '<w:tr>' + tcs + '</w:tr>';
            }).join('');
            bodyXml.push('<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="6" w:color="333333"/><w:left w:val="single" w:sz="6" w:color="333333"/><w:bottom w:val="single" w:sz="6" w:color="333333"/><w:right w:val="single" w:sz="6" w:color="333333"/><w:insideH w:val="single" w:sz="4" w:color="666666"/><w:insideV w:val="single" w:sz="4" w:color="666666"/></w:tblBorders></w:tblPr>' + trs + '</w:tbl><w:p/>');
          } else if (el.classList.contains('alif-paper-right')) {
            var jcR = mapAlign(el, 'right');
            bodyXml.push('<w:p><w:pPr><w:jc w:val="' + jcR + '"/><w:spacing w:after="160" w:line="' + lineTwips + '" w:lineRule="auto"/></w:pPr>' + buildRunsFromNode(el, false, false, halfPt) + '</w:p>');
          } else if (el.classList.contains('alif-paper-title')) {
            var jcT = mapAlign(el, 'center');
            bodyXml.push('<w:p><w:pPr><w:jc w:val="' + jcT + '"/><w:spacing w:before="200" w:after="200"/></w:pPr>' + buildRunsFromNode(el, true, false, halfPt + 2) + '</w:p>');
          } else if (el.classList.contains('alif-paper-foot')) {
            var cols = el.children;
            var leftRuns = cols[0] ? buildRunsFromNode(cols[0], false, false, halfPt) : '';
            var rightRuns = cols[1] ? buildRunsFromNode(cols[1], false, false, halfPt) : '';
            bodyXml.push('<w:p><w:pPr><w:spacing w:before="260"/></w:pPr>' + leftRuns + '<w:r><w:t xml:space="preserve">          </w:t></w:r>' + rightRuns + '</w:p>');
          } else {
            var jcP = mapAlign(el, el.classList.contains('alif-paper-p') ? 'justify' : 'left');
            var ind = el.classList.contains('alif-paper-p') ? '<w:ind w:firstLine="560"/>' : '';
            bodyXml.push('<w:p><w:pPr><w:jc w:val="' + jcP + '"/>' + ind + '<w:spacing w:after="140" w:line="' + lineTwips + '" w:lineRule="auto"/></w:pPr>' + buildRunsFromNode(el, false, false, halfPt) + '</w:p>');
          }
        });

        var hasHeader = Boolean(editorState.headerText.trim());
        var hasFooter = Boolean(editorState.footerText.trim() || editorState.pageNumbering);
        var sectRefs = '';
        if (hasHeader) sectRefs += '<w:headerReference w:type="default" r:id="rId1"/>';
        if (hasFooter) sectRefs += '<w:footerReference w:type="default" r:id="rId2"/>';

        bodyXml.push('<w:sectPr>' + sectRefs + '<w:pgMar w:top="' + pgMar + '" w:right="' + pgMar + '" w:bottom="' + pgMar + '" w:left="' + pgMar + '" w:header="567" w:footer="567"/></w:sectPr>');

        var zip = new window.JSZip();
        var ctOverrides = '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>';
        var docRels = '';

        if (hasHeader) {
          ctOverrides += '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>';
          docRels += '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>';
          var hVal = esc(convertScript(editorState.headerText.trim(), scriptMode));
          zip.file('word/header1.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="' + esc(fontName) + '" w:hAnsi="' + esc(fontName) + '"/><w:sz w:val="20"/><w:color w:val="666666"/></w:rPr><w:t xml:space="preserve">' + hVal + '</w:t></w:r></w:p></w:hdr>');
        }

        if (hasFooter) {
          ctOverrides += '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>';
          docRels += '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>';
          var fVal = esc(convertScript(editorState.footerText.trim(), scriptMode));
          var pgXml = editorState.pageNumbering
            ? '<w:r><w:rPr><w:rFonts w:ascii="' + esc(fontName) + '" w:hAnsi="' + esc(fontName) + '"/><w:sz w:val="20"/><w:color w:val="666666"/></w:rPr><w:t xml:space="preserve">' + (fVal ? '   |   ' : '') + '</w:t></w:r><w:fldSimple w:instr="PAGE"/><w:r><w:rPr><w:rFonts w:ascii="' + esc(fontName) + '" w:hAnsi="' + esc(fontName) + '"/><w:sz w:val="20"/><w:color w:val="666666"/></w:rPr><w:t xml:space="preserve">' + esc(convertScript('-bet', scriptMode)) + '</w:t></w:r>'
            : '';
          zip.file('word/footer1.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="' + esc(fontName) + '" w:hAnsi="' + esc(fontName) + '"/><w:sz w:val="20"/><w:color w:val="666666"/></w:rPr><w:t xml:space="preserve">' + fVal + '</w:t></w:r>' + pgXml + '</w:p></w:ftr>');
        }

        zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' + ctOverrides + '</Types>');
        zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
        if (docRels) {
          zip.file('word/_rels/document.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + docRels + '</Relationships>');
        }
        zip.file('word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>' + bodyXml.join('') + '</w:body></w:document>');

        var blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        downloadBlob(blob, activeTpl.id + '_alifplus.docx');
      });
    }

    // ── HIGH-FIDELITY .PDF EXPORT (JONLI HTML + MARGIN + HEADER/FOOTER + JADVAL) ──
    var pdfBtn = document.getElementById('alifDocPdfBtn');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', function () {
        var w = window.open('', '_blank', 'width=860,height=740');
        if (!w) return;
        var marginMm = { standard: '20mm', wide: '30mm', narrow: '12mm' }[editorState.margins] || '20mm';
        var fFam = editorState.fontFamily === 'Times New Roman'
          ? '"Times New Roman", Georgia, serif'
          : '"' + editorState.fontFamily + '", Arial, sans-serif';
        var hHtml = (headerSlotEl && !headerSlotEl.hidden)
          ? '<div style="text-align:right;font-size:10pt;color:#6b7280;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin-bottom:16px;">' + escapeHtml(headerSlotEl.textContent) + '</div>'
          : '';
        var fHtml = (footerSlotEl && !footerSlotEl.hidden)
          ? '<div style="display:flex;justify-content:space-between;font-size:10pt;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:26px;">' + footerSlotEl.innerHTML + '</div>'
          : '';

        w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>' + escapeHtml(activeTpl.title) + '</title>' +
          '<style>' +
            '@page { margin: ' + marginMm + '; }' +
            'body { font-family: ' + fFam + '; font-size: ' + editorState.fontSize + '; line-height: ' + editorState.lineSpacing + '; color: #111827; margin: 0; padding: 12px; }' +
            '.alif-paper-right { margin-left: auto; width: 56%; margin-bottom: 20px; }' +
            '.alif-paper-title { text-align: center; font-weight: 700; font-size: 1.12em; margin: 14px 0 18px; }' +
            '.alif-paper-p { margin: 0 0 12px; text-indent: 26px; text-align: justify; }' +
            '.alif-paper-foot { display: flex; justify-content: space-between; margin-top: 30px; }' +
            'table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 0.92em; }' +
            'th, td { border: 1px solid #374151; padding: 6px 8px; text-align: left; }' +
            'th { background: #f3f4f6; font-weight: 700; }' +
          '</style></head><body>' +
          hHtml + paperEl.innerHTML + fHtml +
        '</body></html>');
        w.document.close();
        w.focus();
        setTimeout(function () { w.print(); }, 250);
      });
    }

    loadTplValues(activeTpl);
    renderCategories();
    renderCards();
    renderForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmartDocBuilder);
  } else {
    initSmartDocBuilder();
  }
})();
