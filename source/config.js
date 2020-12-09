import browser from "webextension-polyfill";

const configKey = "tab-archive-config";

export async function canSync() {
  const config = await getConfig();
  console.log("got config", config);
  if (!config || !config[configKey] || !config[configKey].sync) {
    setConfigOption("sync", false);
    return false;
  }

  return config[configKey].sync;
}

export async function getConfig() {
  return browser.storage.sync.get(configKey);
}

export async function setConfigOption(key, value) {
  let config = await getConfig();
  if (!config) {
    config = {};
  }

  if (!config[configKey]) {
    config[configKey] = {};
  }

  config[configKey][key] = value;
  return browser.storage.sync.set(config);
}
