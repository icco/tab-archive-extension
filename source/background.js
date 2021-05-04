import {browserActionListener, alarmListener} from "./tabs.js";
import {Client} from "./auth.js";
import browser from "webextension-polyfill";

browser.alarms.create("upload", {periodInMinutes: 2});

// Called when the user clicks on the browser action.
browser.browserAction.onClicked.addListener(browserActionListener);

browser.alarms.onAlarm.addListener(alarmListener);

browser.runtime.onMessage.addListener(async (event) => {
  console.log("message recv", event);
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
      console.error("auth error", error)
    }
  }
});
