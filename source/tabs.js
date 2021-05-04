import browser from "webextension-polyfill";
import {getAccessToken} from "./auth.js";
import {canSync, configKey} from "./config.js";

async function saveTab(tab) {
  const data = {
    url: tab.url,
    title: tab.title,
    favicon: tab.favIconUrl,
    seen: new Date().toJSON()
  };

  console.log("saving", data);
  try {
    const resp = await browser.storage.local.set({[tab.url]: data});
    console.log("saved", resp);
  } catch (error) {
    onError(error);
  }
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

export async function alarmListener(alarm) {
  if (alarm.name !== "upload") {
    return;
  }

  // Get the whole storage
  try {
    const result = await browser.storage.local.get(null);
    const results = [];
    for (const [key, t] of Object.entries(result)) {
      if (key !== configKey) {
        results.push(uploadTab(t), browser.storage.local.remove(key));
      }
    }

    await Promise.all(results);
  } catch (error) {
    onError(error);
  }
}

export async function browserActionListener(_tab) {
  try {
    const tabs = await browser.tabs.query({currentWindow: true});
    for (const tab of tabs) {
      saveTab(tab);
      browser.tabs.remove(tab.id);
    }

    const tab = await browser.tabs.create({
      active: true,
      url: "options.html"
    });
    console.log("Created new tab", tab);
  } catch (error) {
    onError(error);
  }
}

function onError(error) {
  console.error(`Error: ${error}`);
}
