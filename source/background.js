function saveTab(tab) {
  const data = {
    url: tab.url,
    title: tab.title,
    favicon: tab.favIconUrl,
    seen: new Date().toJSON(),
  };

  chrome.storage.local.set({ [tab.url]: data }, () => {
    console.log("saved");
  });
}

function uploadTab(tab) {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://tab-archive.app/hook", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.addEventListener("load", () => {
      const resp = xhr.response;
      if (resp.error) {
        console.error(resp.error);
        return;
      }

      console.log("uploaded", resp);
    });
    xhr.send(JSON.stringify(tab));
  });
}

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener((tab) => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    tabs.forEach((tab) => {
      saveTab(tab);
      chrome.tabs.remove(tab.id);
    });
  });

  chrome.runtime.openOptionsPage();
});

chrome.alarms.create("upload", { periodInMinutes: 2 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name != "upload") {
    return;
  }

  // Get the whole storage
  chrome.storage.local.get(null, (result) => {
    for (const [key, t] of Object.entries(result)) {
      uploadTab(t);

      chrome.storage.local.remove(key);
    }
  });
});
