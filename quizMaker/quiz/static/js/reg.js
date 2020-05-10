var login = document.getElementById('login');
var password1 = document.getElementById('password1');
var password2 = document.getElementById('password2');
var regBtn = document.getElementById('regBtn');
regBtn.addEventListener("mouseover", () =>{
  regBtn.disabled = !login.value || !password1.value || !password2.value || password1.value != password2.value;
});
login.addEventListener("keyup", () => {
  regBtn.disabled = !login.value || !password1.value || !password2.value;
});
password1.addEventListener("keyup", () => {
  regBtn.disabled = !login.value || !password1.value || !password2.value || password1.value != password2.value;
});
password2.addEventListener("keyup", () => {
  regBtn.disabled = !login.value || !password1.value || !password2.value || password1.value != password2.value;
});
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
regBtn.addEventListener("click", () =>{
  if(password1.value != password2.value){
    alert("Password not confirmed? Please write correctly!\nParol tasdiqlanmadi? To'g'ri kiriting!");
    return;
  }
});