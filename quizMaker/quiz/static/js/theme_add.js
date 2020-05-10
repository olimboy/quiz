const theme_name = document.getElementById("theme_name");
const saveTheme = document.getElementById("saveTheme");
const private = document.getElementById("private");
const main = document.getElementById('main');
saveTheme.disabled = !theme_name.value;
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
    const url = '/quiz/theme-add/';
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
theme_name.addEventListener("keyup", () => {
  saveTheme.disabled = !theme_name.value;
});
saveTheme.addEventListener('click',  (e) => {
  e.preventDefault();
  postData({name: theme_name.value, type: parseInt(document.querySelector('input[name="theme_type"]:checked').value)});
  theme_name.value = "";
  saveTheme.disabled = true;
  private.checked = true;
  var div = document.createElement('div');
  div.innerHTML = `
  <button type="button" class="close" data-dismiss="alert">&times;</button>
  <strong>Muvafaqiyatli Qo'shildi!</strong>`;
  div.className = "alert alert-success alert-dismissible";
  main.insertBefore(div, main.firstChild);
});
