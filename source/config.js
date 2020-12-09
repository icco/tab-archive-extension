import browser from "webextension-polyfill";

const configKey = "tab-archive-config";

export async function canSync() {
  const config = await getConfig();
  console.log("got config", config);
  if (!config || config.sync === undefined || config.sync === null) {
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

  if (config[configKey]) {
    delete config[configKey];
  }

  config[key] = value;
  return browser.storage.sync.set({[configKey]: config});
}
