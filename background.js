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
      console.log("saved");
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

chrome.alarms.create("upload", { periodInMinutes: 2 });

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name != "upload") {
    return;
  }

  var uploaded = [];
  chrome.storage.local.get([key], function (result) {
    console.log(result);
    result.forEach(function (t) {
      uploadTab(t);
      uploaded.push(t);
    });

    var difference = result.filter((x) => !uploaded.includes(x));
    chrome.storage.local.set({ [key]: difference });
  });
});
