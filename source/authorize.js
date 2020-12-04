/* exported getAccessToken */

const REDIRECT_URL = browser.identity.getRedirectURL();
const CLIENT_ID =
  "172305384164-btta42bf23h342eo59p5h9r3gdrhckcj.apps.googleusercontent.com";
const SCOPES = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email"
];
const AUTH_URL = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
  REDIRECT_URL
)}&scope=${encodeURIComponent(SCOPES.join(" "))}`;
const VALIDATION_BASE_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo";

function extractAccessToken(redirectUri) {
  const m = redirectUri.match(/[#?](.*)/);
  if (!m || m.length === 0) return null;
  const parameters = new URLSearchParams(m[1].split("#")[0]);
  return parameters.get("access_token");
}

/**
Validate the token contained in redirectURL.
This follows essentially the process here:
https://developers.google.com/identity/protocols/OAuth2UserAgent#tokeninfo-validation
- make a GET request to the validation URL, including the access token
- if the response is 200, and contains an "aud" property, and that property
matches the clientID, then the response is valid
- otherwise it is not valid

Note that the Google page talks about an "audience" property, but in fact
it seems to be "aud".
*/
function validate(redirectURL) {
  const accessToken = extractAccessToken(redirectURL);
  if (!accessToken) {
    throw "Authorization failure";
  }

  const validationURL = `${VALIDATION_BASE_URL}?access_token=${accessToken}`;
  const validationRequest = new Request(validationURL, {
    method: "GET"
  });

  function checkResponse(response) {
    return new Promise((resolve, reject) => {
      if (response.status !== 200) {
        reject("Token validation error");
      }

      response.json().then((json) => {
        if (json.aud && json.aud === CLIENT_ID) {
          resolve(accessToken);
        } else {
          reject("Token validation error");
        }
      });
    });
  }

  return fetch(validationRequest).then(checkResponse);
}

/**
Authenticate and authorize using browser.identity.launchWebAuthFlow().
If successful, this resolves with a redirectURL string that contains
an access token.
*/
function authorize() {
  return browser.identity.launchWebAuthFlow({
    interactive: true,
    url: AUTH_URL
  });
}

export function getAccessToken() {
  return authorize().then(validate);
}
