function showLinks() {
  const ul = document.querySelector("#list");
  browser.storage.local.get(null).then((result) => {
    console.log("got from storage", result);
    for (const [key, t] of Object.entries(result)) {
      const el = createLink(t);
      ul.append(el);
    }
  });

  getAccessToken().then((token) => {
    console.log("got token", token);
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://tab-archive.app/archive", true);
    xhr.responseType = "json";
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.addEventListener("load", () => {
      const resp = xhr.response;
      if (resp.error) {
        console.error(resp.error);
        return;
      }

      resp.tabs.map(createLink).forEach((el) => {
        ul.append(el);
      });
    });
    xhr.send();
  });
}

function createLink(obj) {
  const li = document.createElement("li");
  li.setAttribute("class", "pv2");

  const a = document.createElement("a");
  a.setAttribute("href", obj.url);
  a.setAttribute("class", "link blue lh-title");

  const spanTitle = document.createElement("span");
  spanTitle.setAttribute("class", "fw7 underline-hover");
  spanTitle.append(obj.title);

  const spanSub = document.createElement("span");
  spanSub.setAttribute("class", "db black-60");
  spanSub.insertAdjacentHTML("afterbegin", `${obj.seen} &middot; ${obj.url}`);

  a.append(spanTitle, spanSub);
  li.append(a);

  return li;
}

document.addEventListener("DOMContentLoaded", showLinks);
document.addEventListener("focus", showLinks);
