const en = document.getElementById("en");
const uz = document.getElementById("uz");
const saveNewWord = document.getElementById("saveNewWord");
const themes = document.getElementById("themes");
const min_ask = document.getElementById('min_ask');
const main = document.getElementById('main');
var theme = sessionStorage.getItem('theme');
saveNewWord.disabled = !en.value || !uz.value || !min_ask.value;
if(theme == null){
  theme = 1;
}
theme = parseInt(theme);
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
async function postData(url, data = {}) {
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
en.addEventListener("keyup", () => {
  saveNewWord.disabled = !en.value || !uz.value || !min_ask.value;
});
uz.addEventListener("keyup", () => {
  saveNewWord.disabled = !en.value || !uz.value || !min_ask.value;
});
min_ask.addEventListener("keyup", () => {
  saveNewWord.disabled = !en.value || !uz.value || !min_ask.value;
});

saveNewWord.addEventListener('click',  (e) => {
  e.preventDefault();
  if(!uz.value || !en.value || !min_ask.value){
    alert("Ma'lumotlarni to'liq to'ldirilmagan!");
    return;
  }
  theme = sessionStorage.getItem('theme');
  postData('/quiz/dict-add/', {theme: parseInt(theme), en: en.value, uz: uz.value, min_ask: parseInt(min_ask.value)});
  en.value = '';
  uz.value = '';
  min_ask.value = 10;
  var div = document.createElement('div');
  div.innerHTML = `
  <button type="button" class="close" data-dismiss="alert">&times;</button>
  <strong>Muvafaqiyatli Qo'shildi!</strong>`;
  div.className = "alert alert-success alert-dismissible";
  main.insertBefore(div, main.firstChild);
});

postData('/quiz/get-themes/', {offset: 0, limit: 10000000})
.then(data =>{
  data.themes.forEach(theme =>{
    var option = document.createElement("option");
    option.value=theme.id;
    option.text = theme.name;
    option.onclick = (e) =>{
      sessionStorage.setItem('theme', e.target.value);
    }
    if(theme.id == globalThis.theme){
      option.selected = true;
    }
    themes.options.add(option);
  });
})