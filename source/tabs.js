import browser from "webextension-polyfill";
import {getAccessToken} from "./authorize";

function saveTab(tab) {
  const data = {
    url: tab.url,
    title: tab.title,
    favicon: tab.favIconUrl,
    seen: new Date().toJSON()
  };

  browser.storage.local.set({[tab.url]: data}).then(() => {
    console.log("saved");
  });
}

function uploadTab(tab) {
  getAccessToken().then((token) => {
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

export function alarmListener(alarm) {
  if (alarm.name !== "upload") {
    return;
  }

  // Get the whole storage
  browser.storage.local.get(null).then((result) => {
    for (const [key, t] of Object.entries(result)) {
      uploadTab(t);

      browser.storage.local.remove(key);
    }
  });
}

export function browserActionListener(_tab) {
  browser.tabs.query({currentWindow: true}).then((tabs) => {
    tabs.forEach((tab) => {
      saveTab(tab);
      browser.tabs.remove(tab.id);
    });
  });

  browser.runtime.openOptionsPage();
}