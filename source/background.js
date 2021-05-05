import {getAuthClient} from "./auth.js";
import {browserActionListener, alarmListener} from "./tabs.js";
import browser from "webextension-polyfill";

browser.alarms.create("upload", {periodInMinutes: 2});

// Called when the user clicks on the browser action.
browser.browserAction.onClicked.addListener(browserActionListener);

browser.alarms.onAlarm.addListener(alarmListener);

browser.runtime.onMessage.addListener(async (event) => {
  console.log("message recv", event);
  if (event.type === "authenticate") {
    try {
      const auth0 = getAuthClient();
      await auth0.loginWithPopup({});
    } catch (error) {
      console.error("auth error", error);
    }
  }
});
