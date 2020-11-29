function showLinks() {
  let ul = document.getElementById("list");
  chrome.storage.local.get(null, function (result) {
    console.log("got from storage", result);
    for (const [key, t] of Object.entries(result)) {
      let el = createLink(t);
      ul.append(el);
    }
  });

  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    console.log("got token", token);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://tab-archive.app/archive", true);
    xhr.responseType = "json";
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.addEventListener("load", function () {
      const resp = xhr.response;
      if (resp.error) {
        console.error(resp.error);
        return;
      }

      resp.tabs.map(createLink).forEach(function (el) {
        ul.append(el);
      });
    });
    xhr.send();
  });
}

function createLink(obj) {
  let li = document.createElement("li");
  li.setAttribute("class", "pv2");

  let a = document.createElement("a");
  a.setAttribute("href", obj.url);
  a.setAttribute("class", "link blue lh-title");

  let spanTitle = document.createElement("span");
  spanTitle.setAttribute("class", "fw7 underline-hover");
  spanTitle.append(obj.title);

  let spanSub = document.createElement("span");
  spanSub.setAttribute("class", "db black-60");
  spanSub.append(`${obj.seen} &middot; ${obj.url}`);

  a.append(spanTitle, spanSub);
  li.append(a);

  return li;
}

document.addEventListener("DOMContentLoaded", showLinks);
document.addEventListener("focus", showLinks);
