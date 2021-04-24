import browser from "webextension-polyfill";
import {Client} from "./auth.js";

const AUTH0_CLIENT_ID = "36p26vDCvt4RvZKJnGKTzsfyH4pSCsqg";
const AUTH0_DOMAIN = "icco.auth0.com";

browser.runtime.onMessage.addListener((event) => {
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

    new Client(env.AUTH0_DOMAIN, env.AUTH0_CLIENT_ID)
      .authenticate(options)
      .then((authResult) => {
        localStorage.authResult = JSON.stringify(authResult);
      })
      .catch((error) => {
        browser.notifications.create({
          type: "basic",
          title: "Login Failed",
          message: error.message,
          iconUrl: "icons/icon128.png"
        });
      });
  }
});
