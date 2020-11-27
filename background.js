// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      tabs.forEach(function (tab) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://tab-archive.app/hook", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.addEventListener("load", function () {
          chrome.tabs.remove(tab.id);
        });

        xhr.send(
          JSON.stringify({
            url: tab.url,
            title: tab.title,
            favicon: tab.favIconUrl,
            seen: new Date().toJSON(),
          })
        );
      });
    });

    chrome.runtime.openOptionsPage();
  });
});
