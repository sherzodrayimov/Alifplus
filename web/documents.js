(function() {
  const $=id=>document.getElementById(id), input=$('convert-input'), output=$('convert-output');
  let busy=false, revision=0, filename='AlifPlus';
  const say=msg=>{$('document-status').textContent=msg;};
  function exclusions(){return $('exceptions').value.split(/[\n,]+/).map(x=>x.trim()).filter(Boolean);}
  function update(){
    output.value=Alif.convert(input.value,$('source-script').value,exclusions());
    $('input-count').textContent=Array.from(input.value).length+' belgi';
    $('export-word').disabled=busy||!output.value; $('copy-result').disabled=!output.value;
  }
  input.addEventListener('input',()=>{revision++;update();});
  $('source-script').addEventListener('change',update);
  try{$('exceptions').value=localStorage.getItem('alif-exceptions')||'';}catch(_){}
  $('exceptions').addEventListener('input',()=>{try{localStorage.setItem('alif-exceptions',$('exceptions').value);}catch(_){}update();});
  $('sample-latin').onclick=()=>{revision++;input.value="O'zbekiston — go'zal yurt. Shahar, CHIROYLI, ma'no va g'ayrat.";update();};
  $('sample-cyrillic').onclick=()=>{revision++;input.value='Ўзбекистон — гўзал юрт. Шаҳар, ЧИРОЙЛИ, маъно ва ғайрат.';update();};
  $('clear-converter').onclick=()=>{revision++;input.value='';output.value='';say('');update();};
  $('paste-converter').onclick=async()=>{try{revision++;input.value=await navigator.clipboard.readText();update();}catch(_){say('Joylash uchun matn maydonida Ctrl+V yoki ⌘V bosing.');}};
  $('copy-result').onclick=async()=>{try{await navigator.clipboard.writeText(output.value);say('Natija nusxalandi.');}catch(_){output.focus();output.select();say('Nusxalash uchun Ctrl+C yoki ⌘C bosing.');}};
  document.querySelectorAll('[data-converter-tab]').forEach(button=>button.onclick=()=>{
    document.querySelectorAll('[data-converter-tab]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-selected',String(b===button));});
    $('document-picker').hidden=button.dataset.converterTab!=='document';
  });
  async function loadZip(){
    if(window.JSZip) return window.JSZip;
    await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='web/vendor/jszip.min.js';s.onload=resolve;s.onerror=()=>{s.remove();reject(Error('Word moduli yuklanmadi. Sahifani yangilab qayta urinib ko‘ring.'));};document.head.appendChild(s);});
    return window.JSZip;
  }
  async function readDocument(file){
    const ext=file.name.split('.').pop().toLowerCase();
    if(ext==='txt')return file.text();
    if(ext==='doc')throw Error('Eski .doc formatini Word orqali .docx qilib saqlang va qayta tanlang.');
    if(ext==='docx'){
      const Zip=await loadZip(), zip=await Zip.loadAsync(await file.arrayBuffer());
      const part=zip.file('word/document.xml');
      if(!part)throw Error('Word hujjati buzilgan yoki qo‘llab-quvvatlanmaydi.');
      const xml=new DOMParser().parseFromString(await part.async('string'),'application/xml');
      if(xml.querySelector('parsererror'))throw Error('Word hujjatining matnini o‘qib bo‘lmadi.');
      const ns='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
      return Array.from(xml.getElementsByTagNameNS(ns,'p')).map(p=>Array.from(p.getElementsByTagName('*')).map(n=>n.localName==='t'?n.textContent:n.localName==='tab'?'\t':n.localName==='br'?'\n':'').join('')).join('\n');
    }
    if(ext==='pdf'){
      const pdfjs=await import('./vendor/pdf.min.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdf.worker.min.mjs',document.currentScript?.src||new URL('web/documents.js',location.href)).href;
      const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false,useSystemFonts:true});
      let pdf;
      try{
        pdf=await task.promise; const pages=[];
        for(let i=1;i<=pdf.numPages;i++){
          say('PDF o‘qilmoqda: '+i+' / '+pdf.numPages);
          const page=await pdf.getPage(i), content=await page.getTextContent();
          pages.push(content.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join(''));
          page.cleanup();
        }
        const text=pages.join('\n\n');
        if(!text.trim())throw Error('Bu PDF’da ajratib olinadigan matn yo‘q. Skanerlangan sahifalar uchun OCR kerak.');
        return text;
      }finally{await task.destroy();}
    }
    throw Error('DOCX, PDF yoki TXT fayl tanlang.');
  }
  $('document-file').onchange=async event=>{
    const file=event.target.files[0];if(!file||busy)return;
    const ticket=++revision;busy=true;update();say('Hujjat brauzerda o‘qilmoqda…');
    try{const text=await readDocument(file);if(ticket!==revision)return;filename=file.name.replace(/\.[^.]+$/,'');input.value=text;update();say('Tayyor: '+file.name+'. Matn o‘girildi; asl maket va rasmlar saqlanmaydi.');}
    catch(error){say('Xatolik: '+(error.message||'Hujjatni o‘qib bo‘lmadi.'));}
    finally{busy=false;event.target.value='';update();}
  };
  $('export-word').onclick=async()=>{
    busy=true;update();
    try{
      const Zip=await loadZip(), zip=new Zip();
      const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'');
      zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
      zip.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
      zip.file('word/document.xml','<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+output.value.split('\n').map(line=>'<w:p><w:r><w:t xml:space="preserve">'+esc(line)+'</w:t></w:r></w:p>').join('')+'<w:sectPr/></w:body></w:document>');
      const blob=await zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename+'-AlifPlus.docx';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);say('Word fayl tayyor.');
    }catch(error){say('Word fayl yaratilmadi: '+error.message);}finally{busy=false;update();}
  };
  update();
})();
