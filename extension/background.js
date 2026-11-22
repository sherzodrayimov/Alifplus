chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'alifplus-convert-selection',
      title: "Alif+ bilan yangi alifboga o‘girish (Ö, Ğ, Ş, Ç)",
      contexts: ['selection', 'editable']
    });
  });
});

function sendToTab(tabId, message) {
  if (!tabId) return;
  chrome.tabs.sendMessage(tabId, message).catch(() => {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['alif-core.js', 'content.js']
    }).then(() => {
      chrome.tabs.sendMessage(tabId, message).catch(() => {});
    }).catch(() => {});
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'alifplus-convert-selection' && tab && tab.id) {
    sendToTab(tab.id, { type: 'ALIF_CONVERT_SELECTION' });
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'convert-selection') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        sendToTab(tabs[0].id, { type: 'ALIF_CONVERT_SELECTION' });
      }
    });
  }
});
