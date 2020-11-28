var key = "urls_to_upload";

function saveTab(tab) {
  var data = {
    url: tab.url,
    title: tab.title,
    favicon: tab.favIconUrl,
    seen: new Date().toJSON(),
  };

  chrome.storage.local.get([key], function (result) {
    var list = result.push(data);
    chrome.storage.local.set({ [key]: list }, function () {
      chrome.runtime.sendMessage({ action: "set" });
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
  if (request.action == "set") {
    chrome.storage.local.get([key], function (result) {
      result.forEach(function (t) {
        uploadTab(t);
      });
    });
  }
});
