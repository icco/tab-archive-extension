// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    tabs.forEach(function (tab) {
      saveTab(tab);
      chrome.tabs.remove(tab.id);
    });
  });

  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );
  if (request.greeting == "hello") sendResponse({ farewell: "goodbye" });
});

function saveTab(tab) {
  var data = {
    url: tab.url,
    title: tab.title,
    favicon: tab.favIconUrl,
    seen: new Date().toJSON(),
  };
  chrome.storage.local.set({ [tab.url]: data }, function () {
    chrome.runtime.sendMessage({ action: "set" }, function (response) {
      console.log(response);
    });
  });
}

function uploadTab(tab) {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://tab-archive.app/hook", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(JSON.stringify(tab));
  });
}
