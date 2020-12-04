function bootStrap() {
  chrome.windows.getCurrent((currentWindow) => {
    currentWindowId = currentWindow.id;
    chrome.windows.getLastFocused((focusedWindow) => {
      focusedWindowId = focusedWindow.id;
      loadWindowList();
    });
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log(tabs);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bootStrap();
});
