chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", 'https://tab-archive.app/archive', true);
  xhr.responseType = 'json';
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  xhr.addEventListener("load", function() {
    let ul = document.getElementById('list');
    const resp = xhr.response;

    ul.append(resp.tabs.map(createLink))
  });
});

function createLink(obj) {
  let li = document.createElement("li");
  li.setAttribute("class", "pv2");

  let a = document.createElement("a")
  a.setAttribute("href", obj.url)
  a.setAttribute("class", "link blue lh-title")

  let spanTitle = document.createElement("span")
  spanTitle.setAttribute("class", "fw7 underline-hover")
  spanTitle.append(obj.title)

  let spanSub = document.createElement("span")
  spanSub.setAttribute("class", "db black-60")
  spanSub.append(obj.seen)

  a.append(spanTitle, spanSub)
  li.append(a)

  return li
}
