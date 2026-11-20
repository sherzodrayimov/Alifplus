(function () {
  var docType = "tilxat", scriptMode = "yangi";
  var DOCS_META = {
    tilxat: { title: "Tilxat Yoziş", sub: "Qarz tilxatini töldiring — summa avtomatik söz bilan yoziladi, hujjat 3 xil yozuvda tayyor.", note: "Imzo har doim qölda qöyiladi. Böş maydonlar çiziq bölib çiqadi." },
    ishdan: { title: "İşdan Böşaş Arizasi", sub: "Arizani töldiring — oxirgi iş kuni MK 160-moddasi böyiça özi hisoblanadi.", note: "Imzo har doim qölda qöyiladi. Arizani ikki nusxada tayyorlang." },
    tatil: { title: "Ta’til Arizasi", sub: "Mehnat ta’tili arizasini töldiring — tugaş sanasi özi hisoblanadi.", note: "Imzo har doim qölda qöyiladi. Yillik ta’til kamida 21 kalendar kun." },
    tushuntirish: { title: "Tuşuntiriş Xati", sub: "İş joyiga beriladigan tuşuntiriş xatini töldiring — yakuniy jumlani özingiz tanlaysiz.", note: "Imzo har doim qölda qöyiladi. Xatni ikki nusxada tayyorlang." },
    tavsifnoma: { title: "Tavsifnoma Yoziş", sub: "Xodim yoki talaba/öquvçi uçun rasmiy tavsifnoma — 3 xil yozuvda tayyor.", note: "Tavsifnoma taşkilot blankasida çop etiladi, rahbar imzosi va muhr bilan tasdiqlanadi." },
    buyruq: { title: "Buyruq Çiqariş", sub: "Taşkilot rahbarining rasmiy buyruği — bandlar, asos va tanışiş imzosi bilan.", note: "Buyruq rahbar tomonidan imzolanib muhrlanadi va xodimga imzo qöydirib tanıştıriladi." }
  };
  var SAMPLES = {
    tilxat: { bName:"Aliyev Vali Salimovich",bPass:"AB 1234567",bPin:"30412900123456",bAddr:"Toshkent shahri, Chilonzor tumani, 12-mavze, 4-uy",lName:"Karimov Anvar Alisherovich",lPass:"AD 7654321",lPin:"31205880543210",lAddr:"Toshkent shahri, Yunusobod tumani, 7-mavze, 18-uy",amount:"5 000 000",method:"naqd pul ko'rinishida",givenDate:"2026-11-20",dueDate:"2027-02-20",city:"Toshkent shahri",interestFree:true,w1:"",w2:"" },
    ishdan: { org:"«Alifplus» MChJ",bossRole:"direktori",bossName:"Aliyev Anvar Alisherovich",empName:"Salimov Olim Qobiljonovich",empRole:"dasturchi",cat:"14",appDate:"2026-11-20",reason:"o'qishga kirganim sababli" },
    tatil: { org:"«Alifplus» MChJ",bossRole:"direktori",bossName:"Aliyev Anvar Alisherovich",empName:"Salimov Olim Qobiljonovich",empRole:"dasturchi",leaveType:"navbatdagi yillik mehnat ta'tilini",startDate:"2026-12-01",days:"21",appDate:"2026-11-20" },
    tushuntirish: { org:"«Alifplus» MChJ",bossRole:"direktori",bossName:"Aliyev Anvar Alisherovich",empName:"Salimov Olim Qobiljonovich",empRole:"dasturchi",incidentDate:"2026-11-20",appDate:"2026-11-20",what:"ish kunining boshlanishiga 40 daqiqa kechikib kelganim",why:"O'sha kuni ertalab yo'lda tirbandlik yuz berdi va jamoat transporti to'xtab qoldi.",ending:"Holat yuz berganini tan olaman, biroq u yuqorida ko'rsatilgan uzrli sabab tufayli sodir bo'ldi. Shuni inobatga olishingizni so'rayman." },
    tavsifnoma: { org:"Jahon iqtisodiyoti va diplomatiya universiteti",role:"2-kurs talabasi",fullName:"Salimov Olim Qobiljonovich",shortName:"O.Q.Salimov",birthDate:"2006-05-14",birthPlace:"Qashqadaryo viloyati, Shahrisabz tumani",nation:"o'zbek",isStudent:true,eduLevel:"oliy",gradYear:"",uniName:"",spec:"",since:"2025-yil sentabr oyi",traits:"mas'uliyatli, intizomli, tashabbuskor va tirishqoq",achievements:"Xalqaro munozara klubini tashkil etdi, dasturlash va tilshunoslik loyihalarida faol qatnashib kelmoqda.",family:"Oilali emas.",target:"so'ralgan joyga",bossRole:"Fakultet dekani",bossName:"Karimov B.T.",docDate:"2026-11-20" },
    buyruq: { org:"«Alifplus» MAS'ULIYATI CHEKLANGAN JAMIYATI",docDate:"2026-11-20",num:"48-K",city:"Toshkent shahri",subject:"Ishga qabul qilish to'g'risida",basisClause:"Ishlab chiqarish zaruriyati munosabati bilan hamda O'zbekiston Respublikasi Mehnat kodeksining 104-moddasiga muvofiq",p1:"Salimov Olim Qobiljonovich 2026-yil 23-noyabrdan boshlab dasturchi lavozimiga 3 oylik sinov muddati bilan ishga qabul qilinsin.",p2:"Buxgalteriya bo'limi (M.Sobirova) shtat jadvaliga muvofiq oylik ish haqi to'lovlarini amalga oshirsin.",control:"kadrlar bo'limi boshlig'i D.Karimova zimmasiga yuklatilsin",reasonDoc:"O.Salimovning 2026-yil 20-noyabrdagi arizasi va mehnat shartnomasi",bossRole:"Direktor",bossName:"A.A. Aliyev",empName:"O.Q.Salimov" }
  };
  var state = { tilxat:{}, ishdan:{}, tatil:{}, tushuntirish:{}, tavsifnoma:{}, buyruq:{} };
  function toYangi(s){return String(s||"").replace(/([Oo])['ʻ’‘ʼ`]/g,function(_,c){return c==="O"?"Ö":"ö"}).replace(/([Gg])['ʻ’‘ʼ`]/g,function(_,c){return c==="G"?"Ğ":"ğ"}).replace(/S[Hh]/g,"Ş").replace(/sh/g,"ş").replace(/C[Hh]/g,"Ç").replace(/ch/g,"ç")}
  function toEski(s){return String(s||"").replace(/Ö/g,"O‘").replace(/ö/g,"o‘").replace(/Ğ/g,"G‘").replace(/ğ/g,"g‘").replace(/Ş/g,"Sh").replace(/ş/g,"sh").replace(/Ç/g,"Ch").replace(/ç/g,"ch")}
  function toKirill(s){var t=toEski(s).replace(/O‘/g,"Ў").replace(/o‘/g,"ў").replace(/G‘/g,"Ғ").replace(/g‘/g,"ғ").replace(/Sh/g,"Ш").replace(/SH/g,"Ш").replace(/sh/g,"ш").replace(/Ch/g,"Ч").replace(/CH/g,"Ч").replace(/ch/g,"ч").replace(/Yo/g,"Ё").replace(/YO/g,"Ё").replace(/yo/g,"ё").replace(/Yu/g,"Ю").replace(/YU/g,"Ю").replace(/yu/g,"ю").replace(/Ya/g,"Я").replace(/YA/g,"Я").replace(/ya/g,"я").replace(/(^|[\s("«])Ye/g,"$1Е").replace(/(^|[\s("«])ye/g,"$1е").replace(/(^|[\s("«])E/g,"$1Э").replace(/(^|[\s("«])e/g,"$1э");var m={A:"А",a:"а",B:"Б",b:"б",D:"Д",d:"д",E:"Е",e:"е",F:"Ф",f:"ф",G:"Г",g:"г",H:"Ҳ",h:"ҳ",I:"И",i:"и",J:"Ж",j:"ж",K:"К",k:"к",L:"Л",l:"л",M:"М",m:"м",N:"Н",n:"н",O:"О",o:"о",P:"П",p:"п",Q:"Қ",q:"қ",R:"Р",r:"р",S:"С",s:"с",T:"Т",t:"т",U:"У",u:"у",V:"В",v:"в",X:"Х",x:"х",Y:"Й",y:"й",Z:"З",z:"з","’":"ъ","'":"ъ"};return t.replace(/[A-Za-z’']/g,function(c){return m[c]!==undefined?m[c]:c})}
  function tr(s){return scriptMode==="kirill"?toKirill(s):(scriptMode==="eski"?toEski(s):toYangi(s))}
  function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
  function blank(v,w){v=(v||"").trim();return v?"<strong>"+esc(tr(v))+"</strong>":'<span class="alif-doc-blank" style="min-width:'+(w||115)+'px"></span>'}
  function fmtDateUz(iso){if(!iso)return"";var p=iso.split("-");if(p.length!==3)return iso;var m=["yanvar","fevral","mart","aprel","may","iyun","iyul","avgust","sentabr","oktabr","noyabr","dekabr"];return p[0]+"-yil "+parseInt(p[2],10)+"-"+(m[parseInt(p[1],10)-1]||p[1])}
  function addDays(iso,d){if(!iso)return"";var x=new Date(iso+"T00:00:00");if(isNaN(x.getTime()))return"";x.setDate(x.getDate()+(parseInt(d,10)||0));return x.toISOString().slice(0,10)}
  function numToUzWords(ns){var n=parseInt(String(ns||"").replace(/\D/g,""),10);if(!n||n<=0)return"";if(n>999999999999)return String(n);var o=["","bir","ikki","uch","to'rt","besh","olti","yetti","sakkiz","to'qqiz"],t=["","o'n","yigirma","o'ttiz","qirq","ellik","oltmish","yetmish","sakson","to'qson"],sc=["","ming","million","milliard"],pt=[],ix=0;while(n>0){var r=n%1000;if(r>0){var a=[],h=Math.floor(r/100),tn=Math.floor((r%100)/10),on=r%10;if(h)a.push(o[h]+" yuz");if(tn)a.push(t[tn]);if(on)a.push(o[on]);pt.unshift(sc[ix]?(a.join(" ")+" "+sc[ix]):a.join(" "))}n=Math.floor(n/1000);ix++}return pt.join(" ")}
  function renderForm() {
    var box = document.getElementById("alifDocFormBody"); if (!box) return;
    var s = state[docType];
    if (docType === "tilxat") {
      box.innerHTML = '<div class="alif-doc-group-title">Qarz oluvchi</div><div class="alif-doc-field"><label>F.I.Ş.</label><input data-k="bName" value="'+esc(s.bName)+'"></div><div class="alif-doc-row2"><div class="alif-doc-field"><label>Pasport</label><input data-k="bPass" value="'+esc(s.bPass)+'"></div><div class="alif-doc-field"><label>JŞŞIR</label><input data-k="bPin" value="'+esc(s.bPin)+'"></div></div><div class="alif-doc-field"><label>Manzil</label><input data-k="bAddr" value="'+esc(s.bAddr)+'"></div><div class="alif-doc-group-title">Qarz beruvçi</div><div class="alif-doc-field"><label>F.I.Ş.</label><input data-k="lName" value="'+esc(s.lName)+'"></div><div class="alif-doc-row2"><div class="alif-doc-field"><label>Pasport</label><input data-k="lPass" value="'+esc(s.lPass)+'"></div><div class="alif-doc-field"><label>JŞŞIR</label><input data-k="lPin" value="'+esc(s.lPin)+'"></div></div><div class="alif-doc-field"><label>Manzil</label><input data-k="lAddr" value="'+esc(s.lAddr)+'"></div><div class="alif-doc-group-title">Qarz şartlari</div><div class="alif-doc-field"><label>Summa (sömda)</label><input data-k="amount" value="'+esc(s.amount)+'"></div><div class="alif-doc-field"><label>Beriliş usuli</label><select data-k="method"><option value="naqd pul ko\'rinishida"'+(s.method!=="bank kartasiga o'tkazish yo'li bilan"?" selected":"")+'>Naqd pul bilan</option><option value="bank kartasiga o\'tkazish yo\'li bilan"'+(s.method==="bank kartasiga o'tkazish yo'li bilan"?" selected":"")+'>Bank kartasiga ötkaziş</option></select></div><div class="alif-doc-row2"><div class="alif-doc-field"><label>Berilgan sana</label><input type="date" data-k="givenDate" value="'+esc(s.givenDate)+'"></div><div class="alif-doc-field"><label>Qaytariş muddati</label><input type="date" data-k="dueDate" value="'+esc(s.dueDate)+'"></div></div><div class="alif-doc-field"><label>Şahar</label><input data-k="city" value="'+esc(s.city)+'"></div><label class="alif-doc-check"><input type="checkbox" data-k="interestFree"'+(s.interestFree!==false?" checked":"")+'> Qarz foizsiz berildi</label><div class="alif-doc-row2"><div class="alif-doc-field"><label>1-guvoh</label><input data-k="w1" value="'+esc(s.w1)+'"></div><div class="alif-doc-field"><label>2-guvoh</label><input data-k="w2" value="'+esc(s.w2)+'"></div></div>';
    } else if (docType === "ishdan") {
      var ld = s.appDate ? addDays(s.appDate, parseInt(s.cat || "14", 10)) : "";
      box.innerHTML = '<div class="alif-doc-group-title">Kimga</div><div class="alif-doc-field"><label>Taşkilot</label><input data-k="org" value="'+esc(s.org)+'"></div><div class="alif-doc-row2"><div class="alif-doc-field"><label>Rahbar lavozimi</label><input data-k="bossRole" value="'+esc(s.bossRole)+'"></div><div class="alif-doc-field"><label>Rahbar F.I.Ş.</label><input data-k="bossName" value="'+esc(s.bossName)+'"></div></div><div class="alif-doc-group-title">Kimdan</div><div class="alif-doc-field"><label>F.I.Ş.</label><input data-k="empName" value="'+esc(s.empName)+'"></div><div class="alif-doc-field"><label>Lavozim</label><input data-k="empRole" value="'+esc(s.empRole)+'"></div><div class="alif-doc-field"><label>Toifa</label><select data-k="cat"><option value="14"'+((s.cat||"14")==="14"?" selected":"")+'>Oddiy xodim — 14 kun</option><option value="3"'+(s.cat==="3"?" selected":"")+'>Sinov muddati — 3 kun</option><option value="30"'+(s.cat==="30"?" selected":"")+'>Rahbar / buxgalter — 30 kun</option></select></div><div class="alif-doc-row2"><div class="alif-doc-field"><label>Ariza sanasi</label><input type="date" data-k="appDate" value="'+esc(s.appDate)+'"></div><div class="alif-doc-field"><label>Oxirgi iş kuni</label><input type="date" value="'+esc(ld)+'" readonly></div></div><div class="alif-doc-field"><label>Sabab (ixtiyoriy)</label><input data-k="reason" value="'+esc(s.reason)+'"></div>';
    } else if (docType === "tatil") {
      var ed = (s.startDate && s.days) ? addDays(s.startDate, Math.max(0, (parseInt(s.days, 10) || 21) - 1)) : "";
      box.innerHTML = '<div class="alif-doc-group-title">Kimga</div><div class="alif-doc-field"><label>Taşkilot</label><input data-k="org" value="'+esc(s.org)+'"></div><div class="alif-doc-row2"><div class="alif-doc-field"><label>Rahbar lavozimi</label><input data-k="bossRole" value="'+esc(s.bossRole)+'"></div><div class="alif-doc-field"><label>Rahbar F.I.Ş.</label><input data-k="bossName" value="'+esc(s.bossName)+'"></div></div><div class="alif-doc-group-title">Kimdan</div><div class="alif-doc-field"><label>F.I.Ş.</label><input data-k="empName" value="'+esc(s.empName)+'"></div><div class="alif-doc-field"><label>Lavozim</label><input data-k="empRole" value="'+esc(s.empRole)+'"></div><div class="alif-doc-field"><label>Ta’til turi</label><select data-k="leaveType"><option value="navbatdagi yillik mehnat ta\'tilini"'+(String(s.leaveType||"").indexOf("ish haqi")===-1?" selected":"")+'>Yillik mehnat ta’tili</option><option value="ish haqi saqlanmagan holdagi ta\'tilni"'+(String(s.leaveType||"").indexOf("ish haqi")!==-1?" selected":"")+'>Öz hisobidan ta’til</option></select></div><div class="alif-doc-row2"><div class="alif-doc-field"><label>Boşlaniş sanasi</label><input type="date" data-k="startDate" value="'+esc(s.startDate)+'"></div><div class="alif-doc-field"><label>Kun soni</label><input type="number" min="1" max="60" data-k="days" value="'+esc(s.days||"21")+'"></div></div>'+(ed?'<div class="alif-doc-field"><small>Tugaş sanasi: <strong>'+fmtDateUz(ed)+'</strong></small></div>':'')+'<div class="alif-doc-field"><label>Ariza sanasi</label><input type="date" data-k="appDate" value="'+esc(s.appDate)+'"></div>';
    } else if (docType === "tushuntirish") {
      box.innerHTML = '<div class="alif-doc-group-title">Kimga</div><div class="alif-doc-field"><label>Taşkilot</label><input data-k="org" value="'+esc(s.org)+'"></div><div class="alif-doc-row2"><div class="alif-doc-field"><label>Rahbar lavozimi</label><input data-k="bossRole" value="'+esc(s.bossRole)+'"></div><div class="alif-doc-field"><label>Rahbar F.I.Ş.</label><input data-k="bossName" value="'+esc(s.bossName)+'"></div></div><div class="alif-doc-group-title">Kimdan</div><div class="alif-doc-field"><label>F.I.Ş.</label><input data-k="empName" value="'+esc(s.empName)+'"></div><div class="alif-doc-field"><label>Lavozim</label><input data-k="empRole" value="'+esc(s.empRole)+'"></div><div class="alif-doc-row2"><div class="alif-doc-field"><label>Holat sanasi</label><input type="date" data-k="incidentDate" value="'+esc(s.incidentDate)+'"></div><div class="alif-doc-field"><label>Xat sanasi</label><input type="date" data-k="appDate" value="'+esc(s.appDate)+'"></div></div><div class="alif-doc-field"><label>Nima yuz berdi</label><input data-k="what" value="'+esc(s.what)+'"></div><div class="alif-doc-field"><label>Izoh</label><textarea data-k="why">'+esc(s.why)+'</textarea></div><div class="alif-doc-field"><label>Yakuniy jumla</label><select data-k="ending"><option value="Holat yuz berganini tan olaman, biroq u yuqorida ko\'rsatilgan uzrli sabab tufayli sodir bo\'ldi. Shuni inobatga olishingizni so\'rayman.">Holatni tan olaman, uzrli sabab bölgan</option><option value="Holat yuz berganini tan olaman va kelgusida bunday holatga yo\'l qo\'ymaslikka va\'da beraman.">Holatni tan olaman, takrorlamayman</option><option value="Mazkur holat mening aybim bilan sodir bo\'lmaganligini ma\'lum qilaman va buni inobatga olishingizni so\'rayman.">Mening aybim bilan sodir bölmagan</option></select></div>';
    } else if (docType === "tavsifnoma") {
      box.innerHTML = '<div class="alif-doc-group-title">Muassasa va Şaxs</div><div class="alif-doc-field"><label>Taşkilot / öquv muassasasi nomi</label><input data-k="org" value="'+esc(s.org)+'"></div><div class="alif-doc-row2"><div class="alif-doc-field"><label>Lavozimi / guruhi / sinfi</label><input data-k="role" value="'+esc(s.role)+'"></div><div class="alif-doc-field"><label>Qisqa ism-şarifi (A.B. Karimov)</label><input data-k="shortName" value="'+esc(s.shortName)+'"></div></div><div class="alif-doc-field"><label>F.I.Ş. (töliq)</label><input data-k="fullName" value="'+esc(s.fullName)+'"></div><div class="alif-doc-row2"><div class="alif-doc-field"><label>Tuğilgan sanasi</label><input type="date" data-k="birthDate" value="'+esc(s.birthDate)+'"></div><div class="alif-doc-field"><label>Millati</label><input data-k="nation" value="'+esc(s.nation)+'" placeholder="özbek"></div></div><div class="alif-doc-field"><label>Tuğilgan joyi</label><input data-k="birthPlace" value="'+esc(s.birthPlace)+'"></div><label class="alif-doc-check"><input type="checkbox" data-k="isStudent"'+(s.isStudent?" checked":"")+'> Talaba / öquvçi (tamomlagan OTM qatori yopiladi)</label>' +
        (!s.isStudent ? ('<div class="alif-doc-row2"><div class="alif-doc-field"><label>Ma’lumoti</label><select data-k="eduLevel"><option value="oliy">Oliy</option><option value="o\'rta maxsus">Örta maxsus</option><option value="o\'rta">Örta</option></select></div><div class="alif-doc-field"><label>Bitirgan yili</label><input data-k="gradYear" value="'+esc(s.gradYear)+'" placeholder="2024"></div></div><div class="alif-doc-row2"><div class="alif-doc-field"><label>Öquv yurti nomi</label><input data-k="uniName" value="'+esc(s.uniName)+'"></div><div class="alif-doc-field"><label>Mutaxassisligi</label><input data-k="spec" value="'+esc(s.spec)+'"></div></div>') : '') +
        '<div class="alif-doc-group-title">Faoliyat va Fazilatlar</div><div class="alif-doc-field"><label>Qaçondan buyon faoliyat yuritadi / öqiydi</label><input data-k="since" value="'+esc(s.since)+'" placeholder="2025-yil sentabr oyi"></div><div class="alif-doc-field"><label>Şaxsiy fazilatlari</label><input data-k="traits" value="'+esc(s.traits)+'"></div><div class="alif-doc-field"><label>Yutuqlari, loyihalari va natijalari</label><textarea data-k="achievements">'+esc(s.achievements)+'</textarea></div><div class="alif-doc-row2"><div class="alif-doc-field"><label>Oilaviy holati</label><input data-k="family" value="'+esc(s.family)+'" placeholder="Oilali emas"></div><div class="alif-doc-field"><label>Qayerga taqdim etiladi</label><input data-k="target" value="'+esc(s.target)+'" placeholder="söralgan joyga"></div></div><div class="alif-doc-row2"><div class="alif-doc-field"><label>Rahbar lavozimi</label><input data-k="bossRole" value="'+esc(s.bossRole)+'"></div><div class="alif-doc-field"><label>Rahbar F.I.Ş.</label><input data-k="bossName" value="'+esc(s.bossName)+'"></div></div><div class="alif-doc-field"><label>Sana</label><input type="date" data-k="docDate" value="'+esc(s.docDate)+'"></div>';
    } else {
      box.innerHTML = '<div class="alif-doc-group-title">Buyruq rekvizitlari</div><div class="alif-doc-field"><label>Taşkilot yoki muassasa nomi</label><input data-k="org" value="'+esc(s.org)+'"></div><div class="alif-doc-row2"><div class="alif-doc-field"><label>Buyruq sanasi</label><input type="date" data-k="docDate" value="'+esc(s.docDate)+'"></div><div class="alif-doc-field"><label>Buyruq raqami (№)</label><input data-k="num" value="'+esc(s.num)+'" placeholder="48-K"></div></div><div class="alif-doc-field"><label>Şahar / tuman nomi</label><input data-k="city" value="'+esc(s.city)+'"></div><div class="alif-doc-field"><label>Qisqaça mazmuni (sarlavha)</label><input data-k="subject" value="'+esc(s.subject)+'" placeholder="İşga qabul qiliş töğrisida"></div><div class="alif-doc-field"><label>Buyruq çiqarişga asos bölgan sabab / modda</label><textarea data-k="basisClause">'+esc(s.basisClause)+'</textarea></div><div class="alif-doc-group-title">BUYURAMAN bandlari</div><div class="alif-doc-field"><label>1-band (asosiy qaror)</label><textarea data-k="p1">'+esc(s.p1)+'</textarea></div><div class="alif-doc-field"><label>2-band (buxgalteriya / kadrlar)</label><textarea data-k="p2">'+esc(s.p2)+'</textarea></div><div class="alif-doc-field"><label>3-band (ijro nazorati kimning zimmasida)</label><input data-k="control" value="'+esc(s.control)+'"></div><div class="alif-doc-field"><label>Asos (hujjat nomi va sanasi)</label><input data-k="reasonDoc" value="'+esc(s.reasonDoc)+'"></div><div class="alif-doc-row2"><div class="alif-doc-field"><label>Rahbar lavozimi</label><input data-k="bossRole" value="'+esc(s.bossRole)+'"></div><div class="alif-doc-field"><label>Rahbar F.I.Ş.</label><input data-k="bossName" value="'+esc(s.bossName)+'"></div></div><div class="alif-doc-field"><label>Tanışgan xodim F.I.Ş.</label><input data-k="empName" value="'+esc(s.empName)+'"></div>';
    }
    box.querySelectorAll("[data-k]").forEach(function (el) {
      var k = el.getAttribute("data-k");
      var fn = function () { state[docType][k] = el.type === "checkbox" ? el.checked : el.value; if ((docType==="ishdan"&&(k==="appDate"||k==="cat"))||(docType==="tatil"&&(k==="startDate"||k==="days"))||(docType==="tavsifnoma"&&k==="isStudent")) renderForm(); renderPaper(); };
      el.addEventListener("input", fn); el.addEventListener("change", fn);
    });
  }
  function renderPaper() {
    var paper = document.getElementById("alifDocPaper"); if (!paper) return;
    var s = state[docType];
    if (docType === "tilxat") {
      var ca = String(s.amount || "").replace(/\D/g, ""), fa = ca ? ca.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "", wa = numToUzWords(ca);
      var bp = (s.bPin||"").trim() ? (", "+tr("JSHSHIR")+" "+esc(s.bPin.trim())) : "";
      var lp = (s.lPin||"").trim() ? (", "+tr("JSHSHIR")+" "+esc(s.lPin.trim())) : "";
      var ic = (s.interestFree !== false) ? (" " + esc(tr("Qarz foizsiz berildi."))) : "";
      var wh = ((s.w1||"").trim()||(s.w2||"").trim()) ? ('<p class="no-indent" style="margin-top:16px;">'+esc(tr("Guvohlar:"))+"<br>"+((s.w1||"").trim()?("1. "+esc(tr(s.w1))+" — ________________<br>"):"")+((s.w2||"").trim()?("2. "+esc(tr(s.w2))+" — ________________"):"")+"</p>") : "";
      paper.innerHTML = '<div class="alif-doc-paper-title">'+esc(tr("TILXAT"))+'</div><p>'+esc(tr("Men,"))+' '+blank(s.bName,160)+', '+esc(tr("pasport"))+' '+blank(s.bPass,90)+bp+', '+blank(s.bAddr,170)+' '+esc(tr("manzilida yashovchi,"))+' '+blank(s.lName,160)+' ('+esc(tr("pasport"))+' '+blank(s.lPass,90)+lp+', '+blank(s.lAddr,170)+' '+esc(tr("manzilida yashovchi"))+')'+esc(tr("dan"))+' '+blank(fmtDateUz(s.givenDate),110)+' '+esc(tr("kuni"))+' '+esc(tr(s.method||"naqd pul ko'rinishida"))+' '+blank(fa,90)+' ('+blank(wa,140)+') '+esc(tr("so'm miqdorida pul mablag'ini qarzga oldim."))+'</p><p>'+esc(tr("Mazkur summani"))+' '+blank(fmtDateUz(s.dueDate),115)+esc(tr("gacha to'liq qaytarib berish majburiyatini o'z zimmamga olaman."))+ic+'</p><p class="no-indent" style="margin-top:20px;">'+blank(s.city,120)+', '+blank(fmtDateUz(s.givenDate),110)+'</p><p class="no-indent" style="margin-top:22px;">'+esc(tr("Qarz oluvchi:"))+' <span class="alif-doc-blank" style="min-width:120px"></span> '+blank(s.bName,140)+'</p>'+wh;
    } else if (docType === "ishdan") {
      var ld = s.appDate ? addDays(s.appDate, parseInt(s.cat || "14", 10)) : "";
      var rp = (s.reason||"").trim() ? (" ("+esc(tr(s.reason.trim()))+")") : "";
      paper.innerHTML = '<div class="alif-doc-paper-addr">'+blank(s.org,115)+' <strong>'+esc(tr(s.bossRole||"direktori"))+'</strong><br>'+blank(s.bossName,135)+esc(tr("ga"))+'<br>'+blank(s.empRole,90)+' '+blank(s.empName,115)+esc(tr("dan"))+'</div><div class="alif-doc-paper-title">'+esc(tr("ARIZA"))+'</div><p>'+esc(tr("Meni o'z xohishimga ko'ra egallab turgan"))+' '+blank(s.empRole,125)+' '+esc(tr("lavozimidan"))+' '+blank(fmtDateUz(ld),110)+' '+esc(tr("kunidan ozod qilishingizni so'rayman"))+rp+'.</p><p>'+esc(tr("Asos: O'zbekiston Respublikasi Mehnat kodeksining 160-moddasi."))+'</p><div class="alif-doc-sign-row"><span>'+blank(fmtDateUz(s.appDate),110)+'</span><span><span class="alif-doc-blank" style="min-width:95px"></span> '+blank(s.empName,135)+'</span></div>';
    } else if (docType === "tatil") {
      paper.innerHTML = '<div class="alif-doc-paper-addr">'+blank(s.org,115)+' <strong>'+esc(tr(s.bossRole||"direktori"))+'</strong><br>'+blank(s.bossName,135)+esc(tr("ga"))+'<br>'+blank(s.empRole,90)+' '+blank(s.empName,115)+esc(tr("dan"))+'</div><div class="alif-doc-paper-title">'+esc(tr("ARIZA"))+'</div><p>'+esc(tr("Menga"))+' '+blank(fmtDateUz(s.startDate),110)+esc(tr("dan boshlab"))+' <strong>'+esc(s.days||"21")+'</strong> '+esc(tr("kalendar kun muddatga"))+' '+esc(tr(s.leaveType||"navbatdagi yillik mehnat ta'tilini"))+' '+esc(tr("berishingizni so'rayman."))+'</p><div class="alif-doc-sign-row"><span>'+blank(fmtDateUz(s.appDate),110)+'</span><span><span class="alif-doc-blank" style="min-width:95px"></span> '+blank(s.empName,135)+'</span></div>';
    } else if (docType === "tushuntirish") {
      var et = s.ending || "Holat yuz berganini tan olaman, biroq u yuqorida ko'rsatilgan uzrli sabab tufayli sodir bo'ldi. Shuni inobatga olishingizni so'rayman.";
      var wh2 = (s.why||"").trim() ? ("<p>"+esc(tr(s.why.trim())).replace(/\n/g,"</p><p>")+"</p>") : '<p class="no-indent"><span class="alif-doc-blank" style="width:100%"></span><br><span class="alif-doc-blank" style="width:100%"></span></p>';
      paper.innerHTML = '<div class="alif-doc-paper-addr">'+blank(s.org,115)+' <strong>'+esc(tr(s.bossRole||"direktori"))+'</strong><br>'+blank(s.bossName,135)+esc(tr("ga"))+'<br>'+blank(s.empRole,90)+' '+blank(s.empName,115)+esc(tr("dan"))+'</div><div class="alif-doc-paper-title">'+esc(tr("TUSHUNTIRISH XATI"))+'</div><p>'+esc(tr("Men,"))+' '+blank(s.empName,145)+', '+blank(fmtDateUz(s.incidentDate),105)+' '+esc(tr("kuni"))+' '+blank(s.what,160)+' '+esc(tr("yuzasidan quyidagilarni ma'lum qilaman."))+'</p>'+wh2+'<p>'+esc(tr(et))+'</p><div class="alif-doc-sign-row"><span>'+blank(fmtDateUz(s.appDate),110)+'</span><span><span class="alif-doc-blank" style="min-width:95px"></span> '+blank(s.empName,135)+'</span></div>';
    } else if (docType === "tavsifnoma") {
      var eduPart = s.isStudent ? "" : (" "+esc(tr("Ma'lumoti —"))+" "+blank(s.eduLevel||"oliy",75)+", "+blank(s.gradYear,55)+esc(tr("-yilda"))+" "+blank(s.uniName,140)+esc(tr("ni"))+" "+blank(s.spec,115)+" "+esc(tr("yo'nalishi bo'yicha tamomlagan.")));
      var roleWord = s.isStudent ? "talaba (o'quvchi)" : "xodim";
      var actWord = s.isStudent ? "o'qib kelmoqda" : "faoliyat yuritib kelmoqda";
      var peerWord = s.isStudent ? "kursdoshlar (sinfdoshlar)" : "jamoa";
      var achHtml = (s.achievements||"").trim() ? (" "+esc(tr(s.achievements.trim()))) : (' <span class="alif-doc-blank" style="min-width:220px"></span>.');
      paper.innerHTML = '<div class="alif-doc-paper-title" style="margin-top:4px;">'+esc(tr("TAVSIFNOMA"))+'</div><p class="no-indent" style="text-align:center;font-weight:700;margin-bottom:4px;">'+blank(s.org,220)+'</p><p class="no-indent" style="text-align:center;margin-bottom:14px;">'+blank(s.role,120)+' '+blank(s.fullName,170)+esc(tr("ga"))+'</p><p>'+blank(s.fullName,170)+' '+blank(fmtDateUz(s.birthDate),115)+esc(tr("da"))+' '+blank(s.birthPlace,170)+esc(tr("da tug'ilgan."))+' '+esc(tr("Millati —"))+' '+blank(s.nation,80)+'.'+eduPart+'</p><p>'+blank(s.shortName,115)+' '+blank(s.since,125)+esc(tr("dan buyon"))+' '+blank(s.org,165)+esc(tr("da"))+' '+blank(s.role,110)+' '+esc(tr("sifatida"))+' '+esc(tr(actWord))+'. '+esc(tr("O'tgan davr mobaynida u o'zini"))+' '+blank(s.traits,160)+' '+esc(tr(roleWord+" sifatida namoyon etdi."))+'</p><p>'+esc(tr("O'z vazifalarini o'z vaqtida va sifatli bajaradi."))+achHtml+' '+esc(tr("Sohaga oid bilimlarni va zamonaviy texnologiyalarni yaxshi o'zlashtirgan, doimiy ravishda o'z ustida ishlaydi."))+'</p><p>'+esc(tr("Jamoa"))+' ('+esc(tr(peerWord))+') '+esc(tr("orasida samimiyligi, xushmuomalaligi va odobi bilan hurmat qozongan."))+'</p><p>'+blank(s.family,140)+'</p><p>'+esc(tr("Tavsifnoma"))+' '+blank(s.target,140)+' '+esc(tr("taqdim etish uchun berildi."))+'</p><div class="alif-doc-sign-row"><span>'+blank(s.bossRole,125)+'</span><span><span class="alif-doc-blank" style="min-width:95px"></span> '+blank(s.bossName,130)+'</span></div><p class="no-indent" style="font-size:12.5px;color:#4b5563;margin-top:6px;">('+esc(tr("Muhr o'rni"))+')</p><p class="no-indent" style="margin-top:10px;">'+esc(tr("Sana:"))+' '+blank(fmtDateUz(s.docDate),125)+'</p>';
    } else {
      paper.innerHTML = '<p class="no-indent" style="text-align:center;font-weight:700;letter-spacing:0.04em;margin-bottom:4px;">'+blank(s.org,240)+'</p><div class="alif-doc-paper-title" style="margin:10px 0 12px;">'+esc(tr("BUYRUQ"))+'</div><div class="alif-doc-sign-row" style="margin:0 0 14px;"><span>'+blank(fmtDateUz(s.docDate),115)+'</span><span>№ '+blank(s.num,65)+'</span><span>'+blank(s.city,115)+'</span></div><p class="no-indent" style="font-weight:700;margin-bottom:10px;">'+blank(s.subject,220)+'</p><p>'+blank(s.basisClause,240)+',</p><p class="no-indent" style="font-weight:700;letter-spacing:0.12em;margin:10px 0;">'+esc(tr("BUYURAMAN:"))+'</p><p>1. '+blank(s.p1,260)+'</p><p>2. '+blank(s.p2,260)+'</p><p>3. '+esc(tr("Ushbu buyruqning ijrosini nazorat qilish"))+' '+blank(s.control,210)+'.</p><p class="no-indent" style="margin-top:12px;"><strong>'+esc(tr("Asos:"))+'</strong> '+blank(s.reasonDoc,230)+'.</p><div class="alif-doc-sign-row"><span>'+blank(s.bossRole,120)+'</span><span><span class="alif-doc-blank" style="min-width:95px"></span> '+blank(s.bossName,130)+'</span></div><p class="no-indent" style="font-size:12.5px;color:#4b5563;margin-top:4px;">('+esc(tr("Tashkilot muhri"))+')</p><p class="no-indent" style="margin-top:16px;font-weight:700;">'+esc(tr("Buyruq bilan tanishdim:"))+'</p><div class="alif-doc-sign-row" style="margin-top:8px;"><span><span class="alif-doc-blank" style="min-width:95px"></span> '+blank(s.empName,140)+'</span><span>'+blank(fmtDateUz(s.docDate),110)+'</span></div>';
    }
  }
  window.selectAlifDoc = function (t) { docType = t; document.querySelectorAll(".alif-doc-tab").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-doc") === t); }); var m = DOCS_META[t]; document.getElementById("alifDocTitle").textContent = m.title; document.getElementById("alifDocSub").textContent = m.sub; document.getElementById("alifDocNote").textContent = m.note; renderForm(); renderPaper(); };
  window.setAlifDocScript = function (sc) { scriptMode = sc; document.querySelectorAll(".alif-doc-scbtn").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-sc") === sc); }); renderPaper(); };
  window.fillAlifDocSample = function () { state[docType] = Object.assign({}, SAMPLES[docType]); renderForm(); renderPaper(); };
  window.clearAlifDocForm = function () { state[docType] = {}; renderForm(); renderPaper(); };
  window.copyAlifDocText = function (btn) { var p = document.getElementById("alifDocPaper"); if (p) navigator.clipboard.writeText(p.innerText).then(function () { var o = btn.textContent; btn.textContent = "✓ Nusxalandi"; setTimeout(function () { btn.textContent = o; }, 1800); }); };
  function crc32(bytes) {
    var c, table = crc32.t;
    if (!table) {
      table = crc32.t = new Uint32Array(256);
      for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        table[n] = c;
      }
    }
    c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = table[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function makeDocxBlob(paperEl) {
    var enc = new TextEncoder();
    function xmlEsc(s) {
      return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
    var bodyXml = [];
    var children = paperEl.children;
    for (var i = 0; i < children.length; i++) {
      var el = children[i];
      var cls = el.className || "";
      var style = el.getAttribute("style") || "";
      if (cls.indexOf("alif-doc-paper-addr") !== -1) {
        var lines = el.innerText.split(/\n+/);
        for (var l = 0; l < lines.length; l++) {
          if (!lines[l].trim()) continue;
          bodyXml.push('<w:p><w:pPr><w:ind w:left="4200"/><w:spacing w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="28"/></w:rPr><w:t xml:space="preserve">' + xmlEsc(lines[l].trim()) + '</w:t></w:r></w:p>');
        }
        continue;
      }
      if (cls.indexOf("alif-doc-sign-row") !== -1) {
        var spans = el.querySelectorAll("span");
        var leftTxt = spans[0] ? (spans[0].innerText.trim() || "________________") : "________________";
        var rightTxt = spans[1] ? (spans[1].innerText.trim() || "________________") : "________________";
        bodyXml.push('<w:p><w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="28"/></w:rPr><w:t xml:space="preserve">' + xmlEsc(leftTxt + "                    " + rightTxt) + '</w:t></w:r></w:p>');
        continue;
      }
      var clone = el.cloneNode(true);
      clone.querySelectorAll(".alif-doc-blank").forEach(function (b) { b.textContent = "____________________"; });
      var txt = clone.innerText.replace(/\s+/g, " ").trim();
      if (!txt) continue;
      var isTitle = cls.indexOf("alif-doc-paper-title") !== -1;
      var isCenter = isTitle || style.indexOf("text-align:center") !== -1;
      var isBold = isTitle || style.indexOf("font-weight:700") !== -1;
      var noIndent = isCenter || cls.indexOf("no-indent") !== -1;
      var pPr = '<w:pPr><w:spacing w:after="140" w:line="340" w:lineRule="auto"/>' +
        (isCenter ? '<w:jc w:val="center"/>' : '<w:jc w:val="both"/>') +
        (!noIndent ? '<w:ind w:firstLine="720"/>' : '') + '</w:pPr>';
      var rPr = '<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="' + (isTitle ? '30' : '28') + '"/>' + (isBold ? '<w:b/>' : '') + '</w:rPr>';
      bodyXml.push('<w:p>' + pPr + '<w:r>' + rPr + '<w:t xml:space="preserve">' + xmlEsc(txt) + '</w:t></w:r></w:p>');
    }

    var files = [
      { name: "[Content_Types].xml", data: enc.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>') },
      { name: "_rels/.rels", data: enc.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>') },
      { name: "word/document.xml", data: enc.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + bodyXml.join("") + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1701"/></w:sectPr></w:body></w:document>') }
    ];

    var localChunks = [], centralChunks = [], offset = 0;
    for (var f = 0; f < files.length; f++) {
      var nameBytes = enc.encode(files[f].name);
      var content = files[f].data;
      var crc = crc32(content);
      var lh = new Uint8Array(30 + nameBytes.length);
      var lv = new DataView(lh.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, content.length, true);
      lv.setUint32(22, content.length, true);
      lv.setUint16(26, nameBytes.length, true);
      lh.set(nameBytes, 30);
      localChunks.push(lh, content);

      var ch = new Uint8Array(46 + nameBytes.length);
      var cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, content.length, true);
      cv.setUint32(24, content.length, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint32(42, offset, true);
      ch.set(nameBytes, 46);
      centralChunks.push(ch);
      offset += lh.length + content.length;
    }
    var cdSize = centralChunks.reduce(function (s, a) { return s + a.length; }, 0);
    var eocd = new Uint8Array(22);
    var ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, offset, true);
    return new Blob(localChunks.concat(centralChunks, [eocd]), {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
  }

  window.downloadAlifDocWord = function () {
    var p = document.getElementById("alifDocPaper");
    if (!p) return;
    var blob = makeDocxBlob(p);
    var u = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = u;
    a.download = docType + "-alifplus.docx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
  };
  window.printAlifDoc = function () { var p = document.getElementById("alifDocPaper"); if (!p) return; var w = window.open("", "_blank", "width=800,height=900"); if (!w) { window.print(); return; } w.document.write('<html><head><title>Alif+ Hujjat</title><style>body{font-family:"Times New Roman",serif;font-size:14pt;line-height:1.7;padding:20mm 22mm;color:#000;}p{text-indent:1.25cm;text-align:justify;}.no-indent{text-indent:0;}.alif-doc-paper-title{text-align:center;font-weight:bold;letter-spacing:3pt;margin:16pt 0;}.alif-doc-paper-addr{margin-left:50%;margin-bottom:16pt;}.alif-doc-sign-row{display:flex;justify-content:space-between;margin-top:24pt;}.alif-doc-blank{display:inline-block;border-bottom:1px solid #000;min-width:100px;height:1em;}</style></head><body>'+p.innerHTML+'</body></html>'); w.document.close(); w.focus(); setTimeout(function () { w.print(); w.close(); }, 250); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { if (document.getElementById("alifDocsSection")) window.selectAlifDoc("tilxat"); });
  else if (document.getElementById("alifDocsSection")) window.selectAlifDoc("tilxat");
})();
