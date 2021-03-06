import browser from "webextension-polyfill";
import {getAccessToken} from "./authorize.js";
import {canSync, setConfigOption, configKey} from "./config.js";

async function collectConsent() {
  try {
    const syncElement = document.querySelector("#sync");
    const checked = await canSync();
    if (checked !== null) {
      syncElement.checked = checked;
    }

    syncElement.addEventListener("change", (event) => {
      console.log(event.target);
      setConfigOption("sync", event.target.checked);
      getAccessToken(true)
    });
  } catch (error) {
    console.error(error);
  }
}

async function showLinks() {
  const ul = document.querySelector("#list");
  browser.storage.local.get(null).then((result) => {
    console.log("got from storage", result);
    for (const [key, t] of Object.entries(result)) {
      if (key !== configKey) {
        const element = createLink(t);
        ul.append(element);
      }
    }
  });

  if (await canSync()) {
    getAccessToken(false).then((token) => {
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
    });
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
  showLinks();
}

document.addEventListener("DOMContentLoaded", onLoad);
