(function () {
  var btnSel = document.getElementById('btnSel');
  var btnPage = document.getElementById('btnPage');
  var btnRestore = document.getElementById('btnRestore');
  var chkAuto = document.getElementById('chkAutoType');
  var txtIn = document.getElementById('txtIn');
  var txtOut = document.getElementById('txtOut');
  var btnCopy = document.getElementById('btnCopy');

  function sendActive(type) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs[0] || !tabs[0].id) return;
      chrome.tabs.sendMessage(tabs[0].id, { type: type }, function () {
        if (chrome.runtime.lastError) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['alif-core.js', 'content.js']
          }, function () {
            chrome.tabs.sendMessage(tabs[0].id, { type: type });
          });
        }
      });
    });
  }

  btnSel.addEventListener('click', function () { sendActive('ALIF_CONVERT_SELECTION'); });
  btnPage.addEventListener('click', function () { sendActive('ALIF_CONVERT_PAGE'); });
  btnRestore.addEventListener('click', function () { sendActive('ALIF_RESTORE_PAGE'); });

  chrome.storage.sync.get({ autoTypeEnabled: false }, function (items) {
    chkAuto.checked = Boolean(items.autoTypeEnabled);
  });
  chkAuto.addEventListener('change', function () {
    chrome.storage.sync.set({ autoTypeEnabled: chkAuto.checked });
  });

  txtIn.addEventListener('input', function () {
    txtOut.value = window.AlifCore ? window.AlifCore.convert(txtIn.value, 'auto2new', { smart: true }) : txtIn.value;
  });

  btnCopy.addEventListener('click', function () {
    if (!txtOut.value) return;
    navigator.clipboard.writeText(txtOut.value);
    btnCopy.textContent = '✓ Nusxa olindi';
    setTimeout(function () { btnCopy.textContent = 'Nusxa olish'; }, 1400);
  });
})();
