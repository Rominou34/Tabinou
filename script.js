var url_user_repos ='https://api.github.com/users/'+config.username+'/repos?sort=pushed';
var url_org_repos ='https://api.github.com/orgs/'+config.organization+'/repos?sort=pushed';
var url_star_repos = 'https://api.github.com/users/'+config.username+'/starred';

var git_global_container, git_user_repos, git_org_repos, git_events, google;

window.onload = function() {
  git_global_container = document.querySelector("#github_container");

  google = document.querySelector("#google");
  google.addEventListener("submit", function(e) {
    e.preventDefault();
    var search = google.querySelector("#search");
    googleSearch(search.value);
  });

  for(var o in config.organizations) {
    var block = document.createElement("div");
    block.classList.add("github_repos");
    block.classList.add("org_repos");
    git_global_container.appendChild(block);
    parseOrgsRepos(block, org, config.organizations[o]);
  }

  var req_user = new XMLHttpRequest();
  var url = 'https://api.github.com/users/'+
  config.user+'/repos?sort=pushed&per_page='+
  config.user_repos_count;
  req_user.onreadystatechange = function() {
      if (req_user.readyState == 4 && req_user.status == 200) {
        var block = document.createElement("div");
        block.classList.add("github_repos");
        block.classList.add("user_repos");
        git_global_container.appendChild(block);
        parseOrgsRepos(block, JSON.parse(req_user.responseText), config.user);
      }
  };
  req_user.open("GET", url, true);
  req_user.send();


  /*var req_user = new XMLHttpRequest();
  req_user.onreadystatechange = function() {
      if (req_user.readyState == 4 && req_user.status == 200) {
        parseUserRepos(JSON.parse(req_user.responseText));
      }
  };
  req_user.open("GET", url_user_repos, true);
  req_user.send();

  var req_org = new XMLHttpRequest();
  req_org.onreadystatechange = function() {
      if (req_org.readyState == 4 && req_org.status == 200) {
        parseUserRepos(JSON.parse(req_org.responseText));
      }
  };
  req_org.open("GET", url_org_repos, true);
  req_org.send();*/

  parseEvents(events);
}

/*
* Parse user repos
*/
function parseUserRepos(cont, resp, login) {
  var title = document.createElement("div");
  title.innerHTML = login;
  cont.appendChild(title);
  for(var r in resp) {
    if(r == config.user_repos_count) { break; }
    var repo_elem = document.createElement("a");
    repo_elem.classList.add("git_repo");
    repo_elem.href = resp[r].html_url;
    cont.appendChild(repo_elem);

    var repo_title = document.createElement("div");
    repo_elem.appendChild(repo_title);
    repo_title.innerHTML = resp[r].full_name;

    var repo_commit = document.createElement("div");
    repo_elem.appendChild(repo_commit);
    repo_commit.innerHTML = "Last push " + cleanDate(resp[r].pushed_at);
  }
}

/*
* Parse an organization's repos
*/
function parseOrgsRepos(cont, resp, owner) {
  var title = document.createElement("div");
  title.innerHTML = owner;
  cont.appendChild(title);
  for(var r in resp) {
    if(r == config.org_repos_count) { break; }
    var repo_elem = document.createElement("a");
    repo_elem.classList.add("git_repo");
    repo_elem.href = resp[r].html_url;
    cont.appendChild(repo_elem);

    var repo_title = document.createElement("div");
    repo_elem.appendChild(repo_title);
    repo_title.innerHTML = resp[r].full_name;

    var repo_commit = document.createElement("div");
    repo_elem.appendChild(repo_commit);
    repo_commit.innerHTML = "Last push " + cleanDate(resp[r].pushed_at);
  }
}

/*
* Parse the events
*/
function parseEvents(resp) {
  var event_container = document.createElement("div");
  event_container.classList.add("github_repos");
  event_container.classList.add("git_events");
  git_global_container.appendChild(event_container);

  var title = document.createElement("div");
  title.innerHTML = "News";
  event_container.appendChild(title);
  var count=0;
  for(var r in resp) {
    if(count >= config.news_count) { break; }
    if(resp[r].type == 'WatchEvent' || resp[r].type == 'CreateEvent') {
      var ev = document.createElement("div");
      var link1 = '<a href="' + resp[r].actor.url + '">' + resp[r].actor.login + '</a>';
      var link2 = '<a href="' + resp[r].repo.url + '">' + resp[r].repo.name + '</a>';
      if(resp[r].type == 'WatchEvent' && config.follow_watch) {
        ev.innerHTML = cleanLink(link1) + " watched " + cleanLink(link2);
        count++;
      }
      if(resp[r].type == 'CreateEvent' && config.follow_create) {
        ev.innerHTML = cleanLink(link1) + " created " + cleanLink(link2);
        count++;
      }
      event_container.appendChild(ev);
    }
  }
}

/*
* Searches a query on Google
*/
function googleSearch(query) {
  var s = query.replace(/ /g,"%20");
  location.assign("http://www.google.com/search?q="+s);
}

function cleanDate(date) {
  var d = date.replace(/T/g," at ");
  return d.slice(0,19);
}

function cleanLink(link) {
  var l = link.replace('api.','');
  var l1 = l.replace('users/','');
  return l1.replace('repos/','');
}