function bootStrap() {
  chrome.windows.getCurrent(function (currentWindow) {
    currentWindowId = currentWindow.id;
    chrome.windows.getLastFocused(function (focusedWindow) {
      focusedWindowId = focusedWindow.id;
      loadWindowList();
    });
  });

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    console.log(tabs);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  bootStrap();
});
