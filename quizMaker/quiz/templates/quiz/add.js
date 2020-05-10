const en = document.getElementById("en");
const uz = document.getElementById("uz");
const saveNewWord = document.getElementById("saveNewWord");

en.addEventListener("keyup", () => {
  saveNewWord.disabled = !en.value || !uz.value;
});
uz.addEventListener("keyup", () => {
  saveNewWord.disabled = !en.value || !uz.value;
});

saveWord = e => {
  e.preventDefault();
  if(!uz || !en){
    alert("Ma'lumotlarni to'liq to'ldirilmagan!");
    return;
  }
  else{
    fetch("dict.json")
    .then(response => response.json())
    .then(json => dict = json)
    .then(dict => {
      console.log(dict);
      }
      )
    .catch(err => {
          console.error(err);
        });
  }
};
