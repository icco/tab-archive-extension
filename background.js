// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.query({currentWindow: true}, function(tabs) {
    tabs.forEach(function(tab) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", 'https://tab-archive.app/hook', true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.addEventListener("load", function() {
        chrome.tabs.highlight({
          "tabs": tab.index
        })
      });

      xhr.send(JSON.stringify({
        "url": tab.url,
        "title": tab.title,
        "favicon": tab.favIconUrl,
        "seen": new Date().toJSON()
      }));
    });
  });
});
