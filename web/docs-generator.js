(function () {
  var docType = "tilxat", scriptMode = "yangi";
  var DOCS_META = {
    tilxat: { title: "Tilxat Yoziş", sub: "Qarz tilxatini töldiring — summa avtomatik söz bilan yoziladi, hujjat 3 xil yozuvda tayyor.", note: "Imzo har doim qölda qöyiladi. Böş maydonlar çiziq bölib çiqadi." },
    ishdan: { title: "İşdan Böşaş Arizasi", sub: "Arizani töldiring — oxirgi iş kuni MK 160-moddasi böyiça özi hisoblanadi.", note: "Imzo har doim qölda qöyiladi. Arizani ikki nusxada tayyorlang." },
    tatil: { title: "Ta’til Arizasi", sub: "Mehnat ta’tili arizasini töldiring — tugaş sanasi özi hisoblanadi.", note: "Imzo har doim qölda qöyiladi. Yillik ta’til kamida 21 kalendar kun." },
    tushuntirish: { title: "Tuşuntiriş Xati", sub: "İş joyiga beriladigan tuşuntiriş xatini töldiring — yakuniy jumlani özingiz tanlaysiz.", note: "Imzo har doim qölda qöyiladi. Xatni ikki nusxada tayyorlang." }
  };
  var SAMPLES = {
    tilxat: { bName:"Aliyev Vali Salimovich",bPass:"AB 1234567",bPin:"30412900123456",bAddr:"Toshkent shahri, Chilonzor tumani, 12-mavze, 4-uy",lName:"Karimov Anvar Alisherovich",lPass:"AD 7654321",lPin:"31205880543210",lAddr:"Toshkent shahri, Yunusobod tumani, 7-mavze, 18-uy",amount:"5 000 000",method:"naqd pul ko'rinishida",givenDate:"2026-11-20",dueDate:"2027-02-20",city:"Toshkent shahri",interestFree:true,w1:"",w2:"" },
    ishdan: { org:"«Webiston» MChJ",bossRole:"direktori",bossName:"Aliyev Anvar Alisherovich",empName:"Rayimov Sherzod Bahodirovich",empRole:"dasturchi",cat:"14",appDate:"2026-11-20",reason:"o'qishga kirganim sababli" },
    tatil: { org:"«Webiston» MChJ",bossRole:"direktori",bossName:"Aliyev Anvar Alisherovich",empName:"Rayimov Sherzod Bahodirovich",empRole:"dasturchi",leaveType:"navbatdagi yillik mehnat ta'tilini",startDate:"2026-12-01",days:"21",appDate:"2026-11-20" },
    tushuntirish: { org:"«Webiston» MChJ",bossRole:"direktori",bossName:"Aliyev Anvar Alisherovich",empName:"Rayimov Sherzod Bahodirovich",empRole:"dasturchi",incidentDate:"2026-11-20",appDate:"2026-11-20",what:"ish kunining boshlanishiga 40 daqiqa kechikib kelganim",why:"O'sha kuni ertalab yo'lda tirbandlik yuz berdi va jamoat transporti to'xtab qoldi.",ending:"Holat yuz berganini tan olaman, biroq u yuqorida ko'rsatilgan uzrli sabab tufayli sodir bo'ldi. Shuni inobatga olishingizni so'rayman." }
  };
  var state = { tilxat:{}, ishdan:{}, tatil:{}, tushuntirish:{} };
  function toYangi(s){return String(s||"").replace(/([Oo])['ʻ’‘ʼ`]/g,function(_,c){return c==="O"?"Ö":"ö"}).replace(/([Gg])['ʻ’‘ʼ`]/g,function(_,c){return c==="G"?"Ğ":"ğ"}).replace(/S[Hh]/g,"Ş").replace(/sh/g,"ş").replace(/C[Hh]/g,"Ç").replace(/ch/g,"ç")}
  function toEski(s){return String(s||"").replace(/Ö/g,"O‘").replace(/ö/g,"o‘").replace(/Ğ/g,"G‘").replace(/ğ/g,"g‘").replace(/Ş/g,"Sh").replace(/ş/g,"sh").replace(/Ç/g,"Ch").replace(/ç/g,"ch")}
  function toKirill(s){var t=toEski(s).replace(/O‘/g,"Ў").replace(/o‘/g,"ў").replace(/G‘/g,"Ғ").replace(/g‘/g,"ғ").replace(/Sh/g,"Ш").replace(/sh/g,"ш").replace(/Ch/g,"Ч").replace(/ch/g,"ч").replace(/Yo/g,"Ё").replace(/yo/g,"ё").replace(/Yu/g,"Ю").replace(/yu/g,"ю").replace(/Ya/g,"Я").replace(/ya/g,"я").replace(/(^|[\s("«])Ye/g,"$1Е").replace(/(^|[\s("«])ye/g,"$1е").replace(/(^|[\s("«])E/g,"$1Э").replace(/(^|[\s("«])e/g,"$1э");var m={A:"А",a:"а",B:"Б",b:"б",D:"Д",d:"д",E:"Е",e:"е",F:"Ф",f:"ф",G:"Г",g:"г",H:"Ҳ",h:"ҳ",I:"И",i:"и",J:"Ж",j:"ж",K:"К",k:"к",L:"Л",l:"л",M:"М",m:"м",N:"Н",n:"н",O:"О",o:"о",P:"П",p:"п",Q:"Қ",q:"қ",R:"Р",r:"р",S:"С",s:"с",T:"Т",t:"т",U:"У",u:"у",V:"В",v:"в",X:"Х",x:"х",Y:"Й",y:"й",Z:"З",z:"з","’":"ъ","'":"ъ"};return t.replace(/[A-Za-z’']/g,function(c){return m[c]!==undefined?m[c]:c})}
  function tr(s){return scriptMode==="kirill"?toKirill(s):(scriptMode==="eski"?toEski(s):toYangi(s))}
  function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
  function blank(v,w){v=(v||"").trim();return v?"<strong>"+esc(tr(v))+"</strong>":'<span class="alif-doc-blank" style="min-width:'+(w||120)+'px"></span>'}
  function fmtDateUz(iso){if(!iso)return"";var p=iso.split("-");if(p.length!==3)return iso;var m=["yanvar","fevral","mart","aprel","may","iyun","iyul","avgust","sentabr","oktabr","noyabr","dekabr"];return p[0]+"-yil "+parseInt(p[2],10)+"-"+(m[parseInt(p[1],10)-1]||p[1])}
  function addDays(iso,d){if(!iso)return"";var x=new Date(iso+"T00:00:00");if(isNaN(x.getTime()))return"";x.setDate(x.getDate()+(parseInt(d,10)||0));return x.toISOString().slice(0,10)}
  function numToUzWords(ns){var n=parseInt(String(ns||"").replace(/\D/g,""),10);if(!n||n<=0)return"";if(n>999999999999)return String(n);var o=["","bir","ikki","uch","to'rt","besh","olti","yetti","sakkiz","to'qqiz"],t=["","o'n","yigirma","o'ttiz","qirq","ellik","oltmish","yetmish","sakson","to'qson"],sc=["","ming","million","milliard"],pt=[],ix=0;while(n>0){var r=n%1000;if(r>0){var a=[],h=Math.floor(r/100),tn=Math.floor((r%100)/10),on=r%10;if(h)a.push(o[h]+" yuz");if(tn)a.push(t[tn]);if(on)a.push(o[on]);pt.unshift(sc[ix]?(a.join(" ")+" "+sc[ix]):a.join(" "))}n=Math.floor(n/1000);ix++}return pt.join(" ")}
  function renderForm() {
    var box = document.getElementById("alifDocFormBody"); if (!box) return;
    var s = state[docType];
    if (docType === "tilxat") {
      box.innerHTML = '<div class="alif-doc-group-title">Qarz oluvchi</div>' +
        '<div class="alif-doc-field"><label>F.I.Ş. (töliq)</label><input data-k="bName" value="'+esc(s.bName)+'"></div>' +
        '<div class="alif-doc-row2"><div class="alif-doc-field"><label>Pasport</label><input data-k="bPass" value="'+esc(s.bPass)+'"></div><div class="alif-doc-field"><label>JŞŞIR</label><input data-k="bPin" value="'+esc(s.bPin)+'"></div></div>' +
        '<div class="alif-doc-field"><label>Yaşaş manzili</label><input data-k="bAddr" value="'+esc(s.bAddr)+'"></div>' +
        '<div class="alif-doc-group-title">Qarz beruvçi</div>' +
        '<div class="alif-doc-field"><label>F.I.Ş. (töliq)</label><input data-k="lName" value="'+esc(s.lName)+'"></div>' +
        '<div class="alif-doc-row2"><div class="alif-doc-field"><label>Pasport</label><input data-k="lPass" value="'+esc(s.lPass)+'"></div><div class="alif-doc-field"><label>JŞŞIR</label><input data-k="lPin" value="'+esc(s.lPin)+'"></div></div>' +
        '<div class="alif-doc-field"><label>Yaşaş manzili</label><input data-k="lAddr" value="'+esc(s.lAddr)+'"></div>' +
        '<div class="alif-doc-group-title">Qarz şartlari</div>' +
        '<div class="alif-doc-field"><label>Qarz summasi (sömda)</label><input data-k="amount" value="'+esc(s.amount)+'"></div>' +
        '<div class="alif-doc-field"><label>Pul qanday berildi</label><select data-k="method"><option value="naqd pul ko\'rinishida"'+(s.method!=="bank kartasiga o'tkazish yo'li bilan"?" selected":"")+'>Naqd pul bilan</option><option value="bank kartasiga o\'tkazish yo\'li bilan"'+(s.method==="bank kartasiga o'tkazish yo'li bilan"?" selected":"")+'>Bank kartasiga ötkaziş</option></select></div>' +
        '<div class="alif-doc-row2"><div class="alif-doc-field"><label>Berilgan sana</label><input type="date" data-k="givenDate" value="'+esc(s.givenDate)+'"></div><div class="alif-doc-field"><label>Qaytariş muddati</label><input type="date" data-k="dueDate" value="'+esc(s.dueDate)+'"></div></div>' +
        '<div class="alif-doc-field"><label>Tuzilgan joy</label><input data-k="city" value="'+esc(s.city)+'"></div>' +
        '<label class="alif-doc-check"><input type="checkbox" data-k="interestFree"'+(s.interestFree!==false?" checked":"")+'> Qarz foizsiz berildi</label>' +
        '<div class="alif-doc-row2"><div class="alif-doc-field"><label>1-guvoh</label><input data-k="w1" value="'+esc(s.w1)+'"></div><div class="alif-doc-field"><label>2-guvoh</label><input data-k="w2" value="'+esc(s.w2)+'"></div></div>';
    } else if (docType === "ishdan") {
      var ld = s.appDate ? addDays(s.appDate, parseInt(s.cat || "14", 10)) : "";
      box.innerHTML = '<div class="alif-doc-group-title">Ariza kimga beriladi</div>' +
        '<div class="alif-doc-field"><label>Taşkilot nomi</label><input data-k="org" value="'+esc(s.org)+'"></div>' +
        '<div class="alif-doc-row2"><div class="alif-doc-field"><label>Rahbar lavozimi</label><input data-k="bossRole" value="'+esc(s.bossRole)+'"></div><div class="alif-doc-field"><label>Rahbar F.I.Ş.</label><input data-k="bossName" value="'+esc(s.bossName)+'"></div></div>' +
        '<div class="alif-doc-group-title">Ariza beruvçi</div>' +
        '<div class="alif-doc-field"><label>F.I.Ş.</label><input data-k="empName" value="'+esc(s.empName)+'"></div>' +
        '<div class="alif-doc-field"><label>Lavozimingiz</label><input data-k="empRole" value="'+esc(s.empRole)+'"></div>' +
        '<div class="alif-doc-group-title">Böşaş şartlari</div>' +
        '<div class="alif-doc-field"><label>Xodim toifasi</label><select data-k="cat"><option value="14"'+((s.cat||"14")==="14"?" selected":"")+'>Oddiy xodim — 14 kun</option><option value="3"'+(s.cat==="3"?" selected":"")+'>Sinov muddati — 3 kun</option><option value="30"'+(s.cat==="30"?" selected":"")+'>Rahbar / buxgalter — 30 kun</option></select></div>' +
        '<div class="alif-doc-row2"><div class="alif-doc-field"><label>Ariza sanasi</label><input type="date" data-k="appDate" value="'+esc(s.appDate)+'"></div><div class="alif-doc-field"><label>Oxirgi iş kuni</label><input type="date" value="'+esc(ld)+'" readonly></div></div>' +
        '<div class="alif-doc-field"><label>Sabab (ixtiyoriy)</label><input data-k="reason" value="'+esc(s.reason)+'"></div>';
    } else if (docType === "tatil") {
      var ed = (s.startDate && s.days) ? addDays(s.startDate, Math.max(0, (parseInt(s.days, 10) || 21) - 1)) : "";
      box.innerHTML = '<div class="alif-doc-group-title">Ariza kimga beriladi</div>' +
        '<div class="alif-doc-field"><label>Taşkilot nomi</label><input data-k="org" value="'+esc(s.org)+'"></div>' +
        '<div class="alif-doc-row2"><div class="alif-doc-field"><label>Rahbar lavozimi</label><input data-k="bossRole" value="'+esc(s.bossRole)+'"></div><div class="alif-doc-field"><label>Rahbar F.I.Ş.</label><input data-k="bossName" value="'+esc(s.bossName)+'"></div></div>' +
        '<div class="alif-doc-group-title">Ariza beruvçi</div>' +
        '<div class="alif-doc-field"><label>F.I.Ş.</label><input data-k="empName" value="'+esc(s.empName)+'"></div>' +
        '<div class="alif-doc-field"><label>Lavozimingiz</label><input data-k="empRole" value="'+esc(s.empRole)+'"></div>' +
        '<div class="alif-doc-group-title">Ta’til</div>' +
        '<div class="alif-doc-field"><label>Ta’til turi</label><select data-k="leaveType"><option value="navbatdagi yillik mehnat ta\'tilini"'+(String(s.leaveType||"").indexOf("ish haqi")===-1?" selected":"")+'>Yillik mehnat ta’tili</option><option value="ish haqi saqlanmagan holdagi ta\'tilni"'+(String(s.leaveType||"").indexOf("ish haqi")!==-1?" selected":"")+'>Öz hisobidan ta’til</option></select></div>' +
        '<div class="alif-doc-row2"><div class="alif-doc-field"><label>Boşlaniş sanasi</label><input type="date" data-k="startDate" value="'+esc(s.startDate)+'"></div><div class="alif-doc-field"><label>Kalendar kun</label><input type="number" min="1" max="60" data-k="days" value="'+esc(s.days||"21")+'"></div></div>' +
        (ed?'<div class="alif-doc-field"><small>Tugaş sanasi: <strong>'+fmtDateUz(ed)+'</strong></small></div>':'') +
        '<div class="alif-doc-field"><label>Ariza sanasi</label><input type="date" data-k="appDate" value="'+esc(s.appDate)+'"></div>';
    } else {
      box.innerHTML = '<div class="alif-doc-group-title">Xat kimga beriladi</div>' +
        '<div class="alif-doc-field"><label>Taşkilot nomi</label><input data-k="org" value="'+esc(s.org)+'"></div>' +
        '<div class="alif-doc-row2"><div class="alif-doc-field"><label>Rahbar lavozimi</label><input data-k="bossRole" value="'+esc(s.bossRole)+'"></div><div class="alif-doc-field"><label>Rahbar F.I.Ş.</label><input data-k="bossName" value="'+esc(s.bossName)+'"></div></div>' +
        '<div class="alif-doc-group-title">Xat beruvçi</div>' +
        '<div class="alif-doc-field"><label>F.I.Ş.</label><input data-k="empName" value="'+esc(s.empName)+'"></div>' +
        '<div class="alif-doc-field"><label>Lavozimingiz</label><input data-k="empRole" value="'+esc(s.empRole)+'"></div>' +
        '<div class="alif-doc-group-title">Holat va izoh</div>' +
        '<div class="alif-doc-row2"><div class="alif-doc-field"><label>Holat sanasi</label><input type="date" data-k="incidentDate" value="'+esc(s.incidentDate)+'"></div><div class="alif-doc-field"><label>Xat sanasi</label><input type="date" data-k="appDate" value="'+esc(s.appDate)+'"></div></div>' +
        '<div class="alif-doc-field"><label>Nima yuz berdi</label><input data-k="what" value="'+esc(s.what)+'"></div>' +
        '<div class="alif-doc-field"><label>Izoh</label><textarea data-k="why">'+esc(s.why)+'</textarea></div>' +
        '<div class="alif-doc-field"><label>Yakuniy jumla</label><select data-k="ending"><option value="Holat yuz berganini tan olaman, biroq u yuqorida ko\'rsatilgan uzrli sabab tufayli sodir bo\'ldi. Shuni inobatga olishingizni so\'rayman.">Holatni tan olaman, uzrli sabab bölgan</option><option value="Holat yuz berganini tan olaman va kelgusida bunday holatga yo\'l qo\'ymaslikka va\'da beraman.">Holatni tan olaman, takrorlamayman</option><option value="Mazkur holat mening aybim bilan sodir bo\'lmaganligini ma\'lum qilaman va buni inobatga olishingizni so\'rayman.">Mening aybim bilan sodir bölmagan</option></select></div>';
    }
    box.querySelectorAll("[data-k]").forEach(function (el) {
      var k = el.getAttribute("data-k");
      var fn = function () { state[docType][k] = el.type === "checkbox" ? el.checked : el.value; if ((docType==="ishdan"&&(k==="appDate"||k==="cat"))||(docType==="tatil"&&(k==="startDate"||k==="days"))) renderForm(); renderPaper(); };
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
      var wh = ((s.w1||"").trim()||(s.w2||"").trim()) ? ('<p class="no-indent" style="margin-top:18px;">'+esc(tr("Guvohlar:"))+"<br>"+((s.w1||"").trim()?("1. "+esc(tr(s.w1))+" — ________________<br>"):"")+((s.w2||"").trim()?("2. "+esc(tr(s.w2))+" — ________________"):"")+"</p>") : "";
      paper.innerHTML = '<div class="alif-doc-paper-title">'+esc(tr("TILXAT"))+'</div><p>'+esc(tr("Men,"))+' '+blank(s.bName,160)+', '+esc(tr("pasport"))+' '+blank(s.bPass,90)+bp+', '+blank(s.bAddr,170)+' '+esc(tr("manzilida yashovchi,"))+' '+blank(s.lName,160)+' ('+esc(tr("pasport"))+' '+blank(s.lPass,90)+lp+', '+blank(s.lAddr,170)+' '+esc(tr("manzilida yashovchi"))+')'+esc(tr("dan"))+' '+blank(fmtDateUz(s.givenDate),110)+' '+esc(tr("kuni"))+' '+esc(tr(s.method||"naqd pul ko'rinishida"))+' '+blank(fa,90)+' ('+blank(wa,140)+') '+esc(tr("so'm miqdorida pul mablag'ini qarzga oldim."))+'</p><p>'+esc(tr("Mazkur summani"))+' '+blank(fmtDateUz(s.dueDate),115)+esc(tr("gacha to'liq qaytarib berish majburiyatini o'z zimmamga olaman."))+ic+'</p><p class="no-indent" style="margin-top:20px;">'+blank(s.city,120)+', '+blank(fmtDateUz(s.givenDate),110)+'</p><p class="no-indent" style="margin-top:22px;">'+esc(tr("Qarz oluvchi:"))+' <span class="alif-doc-blank" style="min-width:120px"></span> '+blank(s.bName,140)+'</p>'+wh;
    } else if (docType === "ishdan") {
      var ld = s.appDate ? addDays(s.appDate, parseInt(s.cat || "14", 10)) : "";
      var rp = (s.reason||"").trim() ? (" ("+esc(tr(s.reason.trim()))+")") : "";
      paper.innerHTML = '<div class="alif-doc-paper-addr">'+blank(s.org,115)+' <strong>'+esc(tr(s.bossRole||"direktori"))+'</strong><br>'+blank(s.bossName,135)+esc(tr("ga"))+'<br>'+blank(s.empRole,90)+' '+blank(s.empName,115)+esc(tr("dan"))+'</div><div class="alif-doc-paper-title">'+esc(tr("ARIZA"))+'</div><p>'+esc(tr("Meni o'z xohishimga ko'ra egallab turgan"))+' '+blank(s.empRole,125)+' '+esc(tr("lavozimidan"))+' '+blank(fmtDateUz(ld),110)+' '+esc(tr("kunidan ozod qilishingizni so'rayman"))+rp+'.</p><p>'+esc(tr("Asos: O'zbekiston Respublikasi Mehnat kodeksining 160-moddasi."))+'</p><div class="alif-doc-sign-row"><span>'+blank(fmtDateUz(s.appDate),110)+'</span><span><span class="alif-doc-blank" style="min-width:95px"></span> '+blank(s.empName,135)+'</span></div>';
    } else if (docType === "tatil") {
      paper.innerHTML = '<div class="alif-doc-paper-addr">'+blank(s.org,115)+' <strong>'+esc(tr(s.bossRole||"direktori"))+'</strong><br>'+blank(s.bossName,135)+esc(tr("ga"))+'<br>'+blank(s.empRole,90)+' '+blank(s.empName,115)+esc(tr("dan"))+'</div><div class="alif-doc-paper-title">'+esc(tr("ARIZA"))+'</div><p>'+esc(tr("Menga"))+' '+blank(fmtDateUz(s.startDate),110)+esc(tr("dan boshlab"))+' <strong>'+esc(s.days||"21")+'</strong> '+esc(tr("kalendar kun muddatga"))+' '+esc(tr(s.leaveType||"navbatdagi yillik mehnat ta'tilini"))+' '+esc(tr("berishingizni so'rayman."))+'</p><div class="alif-doc-sign-row"><span>'+blank(fmtDateUz(s.appDate),110)+'</span><span><span class="alif-doc-blank" style="min-width:95px"></span> '+blank(s.empName,135)+'</span></div>';
    } else {
      var et = s.ending || "Holat yuz berganini tan olaman, biroq u yuqorida ko'rsatilgan uzrli sabab tufayli sodir bo'ldi. Shuni inobatga olishingizni so'rayman.";
      var wh2 = (s.why||"").trim() ? ("<p>"+esc(tr(s.why.trim())).replace(/\n/g,"</p><p>")+"</p>") : '<p class="no-indent"><span class="alif-doc-blank" style="width:100%"></span><br><span class="alif-doc-blank" style="width:100%"></span></p>';
      paper.innerHTML = '<div class="alif-doc-paper-addr">'+blank(s.org,115)+' <strong>'+esc(tr(s.bossRole||"direktori"))+'</strong><br>'+blank(s.bossName,135)+esc(tr("ga"))+'<br>'+blank(s.empRole,90)+' '+blank(s.empName,115)+esc(tr("dan"))+'</div><div class="alif-doc-paper-title">'+esc(tr("TUSHUNTIRISH XATI"))+'</div><p>'+esc(tr("Men,"))+' '+blank(s.empName,145)+', '+blank(fmtDateUz(s.incidentDate),105)+' '+esc(tr("kuni"))+' '+blank(s.what,160)+' '+esc(tr("yuzasidan quyidagilarni ma'lum qilaman."))+'</p>'+wh2+'<p>'+esc(tr(et))+'</p><div class="alif-doc-sign-row"><span>'+blank(fmtDateUz(s.appDate),110)+'</span><span><span class="alif-doc-blank" style="min-width:95px"></span> '+blank(s.empName,135)+'</span></div>';
    }
  }
  window.selectAlifDoc = function (t) { docType = t; document.querySelectorAll(".alif-doc-tab").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-doc") === t); }); var m = DOCS_META[t]; document.getElementById("alifDocTitle").textContent = m.title; document.getElementById("alifDocSub").textContent = m.sub; document.getElementById("alifDocNote").textContent = m.note; renderForm(); renderPaper(); };
  window.setAlifDocScript = function (sc) { scriptMode = sc; document.querySelectorAll(".alif-doc-scbtn").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-sc") === sc); }); renderPaper(); };
  window.fillAlifDocSample = function () { state[docType] = Object.assign({}, SAMPLES[docType]); renderForm(); renderPaper(); };
  window.clearAlifDocForm = function () { state[docType] = {}; renderForm(); renderPaper(); };
  window.copyAlifDocText = function (btn) { var p = document.getElementById("alifDocPaper"); if (p) navigator.clipboard.writeText(p.innerText).then(function () { var o = btn.textContent; btn.textContent = "✓ Nusxalandi"; setTimeout(function () { btn.textContent = o; }, 1800); }); };
  window.downloadAlifDocWord = function () { var p = document.getElementById("alifDocPaper"); if (!p) return; var h = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><style>body{font-family:"Times New Roman",serif;font-size:14pt;line-height:1.6;}p{text-indent:1.25cm;text-align:justify;}.no-indent{text-indent:0;}.alif-doc-paper-title{text-align:center;font-weight:bold;letter-spacing:3pt;margin:18pt 0;}.alif-doc-paper-addr{margin-left:50%;margin-bottom:18pt;}</style></head><body>'+p.innerHTML+'</body></html>'; var u = URL.createObjectURL(new Blob(["\ufeff", h], { type: "application/msword;charset=utf-8" })); var a = document.createElement("a"); a.href = u; a.download = docType + "-alifplus.doc"; a.click(); URL.revokeObjectURL(u); };
  window.printAlifDoc = function () { var p = document.getElementById("alifDocPaper"); if (!p) return; var w = window.open("", "_blank", "width=800,height=900"); if (!w) { window.print(); return; } w.document.write('<html><head><title>Alif+ Hujjat</title><style>body{font-family:"Times New Roman",serif;font-size:14pt;line-height:1.7;padding:20mm 22mm;color:#000;}p{text-indent:1.25cm;text-align:justify;}.no-indent{text-indent:0;}.alif-doc-paper-title{text-align:center;font-weight:bold;letter-spacing:3pt;margin:18pt 0;}.alif-doc-paper-addr{margin-left:50%;margin-bottom:18pt;}.alif-doc-sign-row{display:flex;justify-content:space-between;margin-top:28pt;}.alif-doc-blank{display:inline-block;border-bottom:1px solid #000;min-width:100px;height:1em;}</style></head><body>'+p.innerHTML+'</body></html>'); w.document.close(); w.focus(); setTimeout(function () { w.print(); w.close(); }, 250); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { if (document.getElementById("alifDocsSection")) window.selectAlifDoc("tilxat"); });
  else if (document.getElementById("alifDocsSection")) window.selectAlifDoc("tilxat");
})();
