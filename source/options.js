import browser from "webextension-polyfill";
import {Client, getAccessToken} from "./auth.js";
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
      getAccessToken();
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
      const token = getAccessToken();

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
    console.error(error);
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

browser.runtime.onMessage.addListener(async (event) => {
  if (event.type === "authenticate") {
    // Scope
    //  - openid if you want an id_token returned
    //  - offline_access if you want a refresh_token returned
    // device
    //  - required if requesting the offline_access scope.
    const options = {
      scope: "openid offline_access",
      device: "browser-extension"
    };

    try {
      const c = new Client(
        "icco.auth0.com",
        "36p26vDCvt4RvZKJnGKTzsfyH4pSCsqg"
      );
      const authResult = await c.authenticate(options);
      localStorage.authResult = JSON.stringify(authResult);
      console.log("authed!");
    } catch (error) {
      await browser.notifications.create({
        type: "basic",
        title: "Login Failed",
        message: error.message,
        iconUrl: "icons/icon128.png"
      });
    }
  }
});

function onLoad() {
  collectConsent();
  showLinks();
}

document.addEventListener("DOMContentLoaded", onLoad);
