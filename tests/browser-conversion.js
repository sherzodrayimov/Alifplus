const assert = require('node:assert/strict');
require('../web/converter.js');
const cases = [
  ["O'zbek G‘ayrat sh Sh SH ch Ch CH ma'no", 'Özbek Ğayrat ş Ş Ş ç Ç Ç ma’no'],
  ['oʻzbek gʼayrat sH cH', 'özbek ğayrat ş ç'],
  ["0'", "0'"],
  ['Ўзбекистон Шаҳар ЧИРОЙЛИ ЯНГИ', 'Özbekiston Şahar ÇIROYLI YANGI'],
  ['Исҳоқ етук ЕР', 'Ishoq yetuk YER'],
  ['ш сҳ ч ц', 'ş sh ç ts'],
  ['https://school.uz/chat check@example.com', 'https://school.uz/chat check@example.com'],
];
for (const [source, expected] of cases) assert.equal(Alif.convert(source), expected, source);
assert.equal(Alif.convert('school chat check shorts shahar','auto',['school','chat','check','shorts']), 'school chat check shorts şahar');
assert.equal(Alif.convert('Шаҳар shahar','cyrillic'), 'Şahar shahar');
assert.equal(Alif.convert('Шаҳар shahar','latin'), 'Шаҳар şahar');
for (const [,result] of cases.slice(0,4)) assert.equal(Alif.convert(result), result, 'new alphabet is unchanged');
console.log('Browser conversion passed');
