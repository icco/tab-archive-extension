import browser from "webextension-polyfill";
import {canSync, setConfigOption, configKey} from "./config.js";
import {getAccessToken} from "./auth.js";
import {syncAll} from "./tabs.js";

async function collectConsent() {
  try {
    const syncElement = document.querySelector("#sync");
    const checked = await canSync();
    if (checked !== null) {
      syncElement.checked = checked;
    }

    syncElement.addEventListener("change", async (event) => {
      console.log(event.target);
      setConfigOption("sync", event.target.checked);
      await getAccessToken();
    });
  } catch (error) {
    console.error(error);
  }
}

async function forceSync() {
  try {
    const forceElement = document.querySelector("#force");

    forceElement.addEventListener("click", async (_event) => {
      const checked = await canSync();
      if (!checked) {
        console.error("sync not enabled");
        return;
      }

      await getAccessToken();
      await syncAll();
    });
  } catch (error) {
    console.error(error);
  }
}

async function showLinks() {
  const ul = document.querySelector("#list");
  try {
    const result = await browser.storage.local.get(null);
    console.log("got from storage", result);
    for (const [key, t] of Object.entries(result)) {
      if (key !== configKey) {
        const element = createLink(t);
        ul.append(element);
      }
    }

    if (await canSync()) {
      const token = await getAccessToken();
      console.log("tok", token);

      if (!token) {
        console.error("not logged in");
        await browser.runtime.sendMessage({type: "authenticate"});
        return;
      }

      console.log("got token", token);
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "https://tab-archive.app/archive", true);
      xhr.responseType = "json";
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.addEventListener("load", () => {
        const resp = xhr.response;
        if (resp.error) {
          console.error(resp.error);
          return;
        }

        for (const element of resp.tabs.map((t) => {
          return createLink(t);
        })) {
          ul.append(element);
        }
      });
      xhr.send();
    }
  } catch (error) {
    console.error("show links error", error);
  }
}

function createLink(object) {
  const li = document.createElement("li");
  li.setAttribute("class", "pv2");

  const a = document.createElement("a");
  a.setAttribute("href", object.url);
  a.setAttribute("class", "link blue lh-title");

  const spanTitle = document.createElement("span");
  spanTitle.setAttribute("class", "fw7 underline-hover");
  spanTitle.append(object.title);

  const spanSub = document.createElement("span");
  spanSub.setAttribute("class", "db black-60");
  spanSub.insertAdjacentText("afterbegin", object.seen);
  spanSub.insertAdjacentHTML("afterbegin", ` &middot; `);
  spanSub.insertAdjacentText("afterbegin", object.url);

  a.append(spanTitle, spanSub);
  li.append(a);

  return li;
}

function onLoad() {
  collectConsent();
  forceSync();
  showLinks();
}

document.addEventListener("DOMContentLoaded", onLoad);
