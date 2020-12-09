import browser from "webextension-polyfill";

const configKey = "tab-archive-config";

export async function canSync() {
  const config = await getConfig();
  console.log("got config", config);
  if (!config || config.sync === undefined) {
    setConfigOption("sync", false);
    return false;
  }

  return config.sync;
}

export async function getConfig() {
  return browser.storage.sync.get(configKey);
}

export async function setConfigOption(key, value) {
  let config = await getConfig();
  if (!config) {
    config = {};
  }

  config[key] = value;
  browser.storage.sync.set({[configKey]: config}).then(() => {
    console.log("saved config");
  });
}
