import {browserActionListener, alarmListener} from "./tabs.js";
import browser from "webextension-polyfill";
import {Auth0Client} from "@auth0/auth0-spa-js";

browser.alarms.create("upload", {periodInMinutes: 2});

// Called when the user clicks on the browser action.
browser.browserAction.onClicked.addListener(browserActionListener);

browser.alarms.onAlarm.addListener(alarmListener);

browser.runtime.onMessage.addListener(async (event) => {
  console.log("message recv", event);
  if (event.type === "authenticate") {
    try {
      const auth0 = new Auth0Client({
        domain: "icco.auth0.com",
        client_id: "36p26vDCvt4RvZKJnGKTzsfyH4pSCsqg",
        cacheLocation: "localstorage",
        useRefreshTokens: true,
        redirect_uri: browser.identity.getRedirectURL(),
      });

      await auth0.loginWithPopup({});
    } catch (error) {
      console.error("auth error", error);
    }
  }
});
