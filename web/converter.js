/* Shared browser converter. Never sends source text or documents to a server. */
(function(root) {
  const cyr = {'ў':'ö','ғ':'ğ','ш':'ş','ч':'ç','ъ':'’','ь':'','а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'j','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'x','ц':'ts','э':'e','ю':'yu','я':'ya','қ':'q','ҳ':'h'};
  const apos = /['‘’ʻʼ`]/;
  function pair(a,b) {
    if(apos.test(b)) return {o:'ö',O:'Ö',g:'ğ',G:'Ğ'}[a] || null;
    if(b==='h'||b==='H') return {s:'ş',S:'Ş',c:'ç',C:'Ç'}[a] || null;
    return null;
  }
  function latin(s) { return s.replace(/[oOgG]['‘’ʻʼ`]|[sScC][hH]/g,m=>pair(m[0],m[1])).replace(/([\p{L}])['‘ʻʼ`]/gu,'$1’'); }
  function cyrillic(s) {
    const allCaps=s===s.toUpperCase();
    return s.replace(/[а-яёқғҳўьъ]/giu,(ch, offset)=>{
      const lower=ch.toLowerCase();
      let value=cyr[lower];
      // Uzbek е starts with y at a word boundary or after a vowel/sign.
      if(lower==='е' && (offset===0 || /[аеиоуўэёюяьъ]/iu.test(s[offset-1]))) value='ye';
      if(ch===lower) return value;
      return allCaps ? value.toUpperCase() : value.charAt(0).toUpperCase()+value.slice(1);
    });
  }
  function convert(text, mode='auto', exceptions=[]) {
    // URLs, e-mail addresses and user exceptions keep their exact spelling.
    const protectedWords = new Set(exceptions.map(s=>s.toLocaleLowerCase()));
    return text.split(/(https?:\/\/[^\s]+|www\.[^\s]+|[\w.+-]+@[\w.-]+\.[a-z]{2,}|[\p{L}\p{M}'‘’ʻʼ`]+)/giu).map(part=>{
      if(/^(?:https?:\/\/|www\.)/i.test(part)||/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(part)||protectedWords.has(part.toLocaleLowerCase())) return part;
      if(mode==='latin') return latin(part);
      // Never reprocess Cyrillic сҳ as the Latin digraph sh (исҳоқ → ishoq).
      return part.replace(/[а-яёқғҳўьъ]+|[^а-яёқғҳўьъ]+/giu,segment=>
        /^[а-яёқғҳўьъ]/iu.test(segment) ? cyrillic(segment) : mode==='cyrillic' ? segment : latin(segment));
    }).join('');
  }
  root.Alif={convert,pair};
})(typeof window==='undefined'?globalThis:window);
