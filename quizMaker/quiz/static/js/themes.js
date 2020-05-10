var home = document.getElementById('themes');
var prev = document.getElementById('prev');
var next = document.getElementById('next');
var pagination = document.getElementById('pagination');
var current_page = document.getElementById('current_page');
const loader = document.getElementById('preloader');
loader.style.display = "flex";
const limit = 4;
current_page.dataset['now'] = 0;
prev.dataset['offset'] = -2 * limit;
next.dataset['offset'] = 0;
function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

var csrftoken = getCookie('csrftoken');
async function postData(data = {}) {
    loader.classList.remove('hidden');
    const url = '/quiz/get-themes/';
    const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data)
  });
  return await response.json();
}
init = (data, lim) =>{
    if(data.themes.length == 0){
        loader.classList.add('hidden');
        return;
    }
    while(home.children.length > 0){
        home.children[0].remove();
    }
    data.themes.forEach(theme => {
        var a = document.createElement('div');
        a.innerHTML = `
        <a href="/quiz/select">
            <div class="single-cool-facts-area text-center margintop wow fadeInUp" data-wow-delay="250ms">
                <div class="icon">
                    <img src="/static/img/core-img/docs.png" alt="">
                </div>
                <h2><span class="counter">${theme.dicts_count}</span></h2>
                <h5>${theme.name}</h5>
            </div>
        </a>`;
        a.onclick = () =>{
            sessionStorage.setItem('theme', theme.id);
            console.log('seke');
            window.location.href = '/quiz/select';
        }
        a.className = 'col-12 col-sm-6 col-lg-3';
        // home.insertBefore(a, home.children[home.children.length - 1]);
        home.appendChild(a);
        });
    loader.classList.add('hidden');
    current_page.dataset['now'] = parseInt(current_page.dataset['now']) + lim / limit;
    current_page.textContent = current_page.dataset['now'];
    prev.dataset['offset'] = parseInt(prev.dataset['offset']) + lim;
    next.dataset['offset'] = parseInt(next.dataset['offset']) + lim;
} 
postData({offset: 0, limit: limit})
.then((data) => init(data, limit));
next.onclick = () =>{
    offset = parseInt(next.dataset['offset'])
    postData({offset: offset, limit: limit})
    .then((data) => init(data, limit));
}
prev.onclick = () =>{
    offset = parseInt(prev.dataset['offset'])
    postData({offset: offset, limit: limit})
    .then((data) => init(data, -limit));
}