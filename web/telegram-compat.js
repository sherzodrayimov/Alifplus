(function () {
  'use strict';

  var ua = navigator.userAgent || '';
  var isTelegram = /Telegram/i.test(ua) || !!(window.TelegramWebviewProxy || window.Telegram);
  if (isTelegram) {
    document.documentElement.classList.add('is-telegram-webview');
  }

  // 1) Telegram iOS/Android WebView ichida blob: fayl yuklab olish bloklanganda foydalanuvchiga aniq yo'l ko'rsatish
  var origCreateObjectURL = URL.createObjectURL;
  if (typeof origCreateObjectURL === 'function') {
    URL.createObjectURL = function (obj) {
      var url = origCreateObjectURL.apply(this, arguments);
      if (isTelegram && obj && obj.type) {
        setTimeout(function () {
          var notice = document.getElementById('alifTgDownloadNotice');
          if (!notice) {
            notice = document.createElement('div');
            notice.id = 'alifTgDownloadNotice';
            notice.style.cssText =
              'position:fixed;left:12px;right:12px;bottom:14px;z-index:2147483645;' +
              'padding:14px 16px;border-radius:14px;background:#111827;color:#ffffff;' +
              'box-shadow:0 14px 34px rgba(0,0,0,0.35);font-size:13.5px;line-height:1.45;' +
              'display:flex;align-items:center;justify-content:space-between;gap:10px;';
            notice.innerHTML =
              '<span><b>Telegram brauzer cheklovi:</b> Faylni saqlash uchun yuqori o\'ng burchakdagi <b>•••</b> menyusidan <b>«Safari / Chrome’da ochish»</b> ni bosing.</span>' +
              '<button type="button" style="border:none;background:rgba(255,255,255,0.18);color:#fff;padding:6px 10px;border-radius:8px;font-weight:700;cursor:pointer;" onclick="this.parentElement.remove()">✕</button>';
            document.body.appendChild(notice);
          }
        }, 250);
      }
      return url;
    };
  }

  // 2) Telegram WebView ichida tashqi havolalar (target="_blank") bloklanmasligi uchun
  document.addEventListener('click', function (e) {
    if (!isTelegram) return;
    var a = e.target.closest('a[target="_blank"]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
    // Telegram linklari (t.me) o'z ilovasida ochiladi, tashqi saytlar joriy oynada ochilsin
    if (!/t\.me\//i.test(href)) {
      e.preventDefault();
      window.location.href = href;
    }
  });
})();
