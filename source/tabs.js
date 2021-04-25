import browser from "webextension-polyfill";
import {getAccessToken} from "./auth.js";
import {canSync, configKey} from "./config.js";

function saveTab(tab) {
  const data = {
    url: tab.url,
    title: tab.title,
    favicon: tab.favIconUrl,
    seen: new Date().toJSON()
  };

  console.log("saving", data);
  browser.storage.local.set({[tab.url]: data}).then(() => {
    console.log("saved");
  }, onError);
}

async function uploadTab(tab) {
  if (await canSync()) {
    const token = getAccessToken();
    if (token) {
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
    }
  }
}

export function alarmListener(alarm) {
  if (alarm.name !== "upload") {
    return;
  }

  // Get the whole storage
  browser.storage.local.get(null).then((result) => {
    for (const [key, t] of Object.entries(result)) {
      if (key !== configKey) {
        uploadTab(t).then(() => {
          browser.storage.local.remove(key);
        });
      }
    }
  }, onError);
}

export function browserActionListener(_tab) {
  browser.tabs.query({currentWindow: true}).then((tabs) => {
    for (const tab of tabs) {
      saveTab(tab);
      browser.tabs.remove(tab.id);
    }
  });

  browser.tabs
    .create({
      active: true,
      url: "options.html"
    })
    .then((tab) => {
      console.log("Created new tab", tab);
    }, onError);
}

function onError(error) {
  console.error(`Error: ${error}`);
}
