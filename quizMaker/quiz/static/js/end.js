const theme_name = document.getElementById('theme_name');
const main_table = document.getElementById('main_table');
const end = document.getElementById('end');
const result = JSON.parse(localStorage.getItem('result'));
if(result == null){
  window.location.assign("/quiz/themes");
}
theme_name.innerText = result.theme;
var i = 0;
var cnt = 0;
result.question.forEach(question => {
  i++;
  var tr = document.createElement('tr');
  var td1 = document.createElement('td');
  td1.innerText = i;
  tr.appendChild(td1);
  var td2 = document.createElement('td');
  td2.innerText = question.ques;
  tr.appendChild(td2);
  var td3 = document.createElement('td');
  td3.innerText = question.answer;
  tr.appendChild(td3);
  var td4 = document.createElement('td');
  td4.innerText = question.correct;
  tr.appendChild(td4);
  var td5 = document.createElement('td');
  td5.innerHTML = question.correct == question.answer ? `<span class="fa fa-check-circle" style="font-size: x-large; color: green"></span>` : `<span class="fa fa-times-circle" style="font-size: x-large; color: red"></span>`;
  tr.appendChild(td5);
  var status = question.correct == question.answer ? 'table-primary' : 'table-danger';
  tr.classList.add(status);
  main_table.appendChild(tr);
  cnt += (question.correct == question.answer ? 1 : 0);
});
end.innerText = `Siz jami ${i} ta savoldan ${cnt} tasiga to'gri javob berdingiz!`
localStorage.setItem('result', null);