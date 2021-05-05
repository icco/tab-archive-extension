import browser from "webextension-polyfill";
import {Auth0Client} from "@auth0/auth0-spa-js";

async function getAccessToken() {
  try {
    const auth0 = getAuthClient()
    return await auth0.getTokenSilently({});
  } catch (error) {
    console.error("auth error", error);
    return null;
  }
}

function getAuthClient() {
    const redirectUrl = browser.identity.getRedirectURL();
    console.log("redirect url", redirectUrl);

    /* eslint-disable camelcase */
    return new Auth0Client({
      domain: "icco.auth0.com",
      client_id: "36p26vDCvt4RvZKJnGKTzsfyH4pSCsqg",
      cacheLocation: "localstorage",
      useRefreshTokens: true,
      redirect_uri: redirectUrl,
    });
}

export {getAuthClient, getAccessToken};
