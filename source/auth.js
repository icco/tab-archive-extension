import browser from "webextension-polyfill";
import {Auth0Client} from "@auth0/auth0-spa-js";

async function getAccessToken() {
  try {
    return await launchAuthFlow(false);
  } catch (error) {
    console.error("async auth error", error);
    return null;
  }
}

async function login() {
  try {
    return await launchAuthFlow(true);
  } catch (error) {
    console.error("sync auth error", error);
    return null;
  }
}

async function launchAuthFlow(interactive) {
  const auth0 = getAuthClient();
  const url = await auth0.buildAuthorizeUrl({});

  return browser.identity.launchWebAuthFlow({
    url,
    interactive,
  });
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
  /* eslint-enable camelcase */
}

export {login, getAccessToken};
