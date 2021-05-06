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
  const resp = await browser.identity.launchWebAuthFlow({
    url,
    interactive,
  });

  return auth0.handleRedirectCallback(resp);
}

function getAuthClient() {
  const redirectUrl = browser.identity.getRedirectURL();
  console.log("redirect url", redirectUrl);

  // https://auth0.github.io/auth0-spa-js/
  /* eslint-disable camelcase */
  return new Auth0Client({
    domain: "icco.auth0.com",
    client_id: "36p26vDCvt4RvZKJnGKTzsfyH4pSCsqg",
    cacheLocation: "memory",
    useRefreshTokens: true,
    redirect_uri: redirectUrl,
  });
  /* eslint-enable camelcase */
}

export {login, getAccessToken};
