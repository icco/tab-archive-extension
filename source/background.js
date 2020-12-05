import {browserActionListener, alarmListener} from "./tabs.js"
import browser from "webextension-polyfill"

browser.alarms.create("upload", {periodInMinutes: 2});

// Called when the user clicks on the browser action.
browser.browserAction.onClicked.addListener(browserActionListener);

browser.alarms.onAlarm.addListener(alarmListener);
