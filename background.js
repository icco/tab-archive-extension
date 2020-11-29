function saveTab(tab) {
  var data = {
    url: tab.url,
    title: tab.title,
    favicon: tab.favIconUrl,
    seen: new Date().toJSON(),
  };

  chrome.storage.local.set({ [tab.url]: data }, function () {
    console.log("saved");
  });
}

function uploadTab(tab) {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://tab-archive.app/hook", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.addEventListener("load", function () {
      const resp = xhr.response;
      if (resp.error) {
        console.error(resp.error);
        return;
      }
      console.log("uploaded", resp)
    });
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

  // Get the whole storage
  chrome.storage.local.get(null, function (result) {
    console.log(result);
    for (const [key, t] of Object.entries(result)) {
      uploadTab(t);

      chrome.storage.local.remove(key);
    }
  });
});
