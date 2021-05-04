import Url from "url-parse";
import browser from "webextension-polyfill";

function getAccessToken() {
  const authResult = JSON.parse(localStorage.authResult || "{}");
  return authResult.access_token;
}

class Client {
  async getAuthResult(url, interactive) {
    return new Promise((resolve, reject) => {
      browser.identity.launchWebAuthFlow({url, interactive}, (callbackURL) => {
        if (browser.runtime.lastError) {
          return reject(new Error(browser.runtime.lastError.message));
        }

        resolve(callbackURL);
      });
    });
  }

  getRedirectURL() {
    return browser.identity.getRedirectURL("auth0");
  }

  // These params will never change
  constructor(domain, clientId) {
    this.domain = domain;
    this.clientId = clientId;
  }

  async exchangeCodeForToken(code, verifier) {
    const {domain, clientId} = this;
    const body = JSON.stringify({
      redirect_uri: this.getRedirectURL(),
      grant_type: "authorization_code",
      code_verifier: verifier,
      client_id: clientId,
      code
    });
    const result = await fetch(`https://${domain}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body
    });

    if (result.ok) return result.json();

    throw new Error(result.statusText);
  }

  extractCode(resultUrl) {
    const response = new Url(resultUrl, true).query;

    if (response.error) {
      throw new Error(response.error_description || response.error);
    }

    return response.code;
  }

  async authenticate(options = {}, interactive = true) {
    const {domain, clientId} = this;
    const {secret, hashed} = generateRandomChallengePair();

    Object.assign(options, {
      client_id: clientId,
      code_challenge: hashed,
      redirect_uri: this.getRedirectURL(),
      code_challenge_method: "S256",
      response_type: "code"
    });

    const url = `https://${domain}/authorize?${Url.qs.stringify(options)}`;
    const resultUrl = await this.getAuthResult(url, interactive);
    const code = this.extractCode(resultUrl);
    return this.exchangeCodeForToken(code, secret);
  }
}

export {Client, getAccessToken};
