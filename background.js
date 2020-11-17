// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    tabs.forEach(function(tab) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", 'https://relay.natwelch.com/hook', true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(`{"url": "${tab}"}`);
    });
  });
});
