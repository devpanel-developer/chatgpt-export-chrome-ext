const checkbox = document.querySelector('#local-only');
chrome.storage.sync.get(['localOnlyMode'], (items) => { checkbox.checked = Boolean(items.localOnlyMode); });
checkbox.addEventListener('change', ()=> chrome.storage.sync.set({ localOnlyMode: checkbox.checked }));
