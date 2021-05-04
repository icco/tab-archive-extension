import browser from "webextension-polyfill";
import {Auth0Client} from "@auth0/auth0-spa-js";

async function getAccessToken() {
  try {
    const redirectUrl = browser.identity.getRedirectURL();
    console.log("redirect url", redirectUrl);
    const auth0 = new Auth0Client({
      domain: "icco.auth0.com",
      client_id: "36p26vDCvt4RvZKJnGKTzsfyH4pSCsqg",
      cacheLocation: "localstorage",
      useRefreshTokens: true,
      redirect_uri: redirectUrl,
    });
    return await auth0.getTokenSilently({});
  } catch (error) {
    console.error("auth error", error);
    return null;
  }
}

export {getAccessToken};
