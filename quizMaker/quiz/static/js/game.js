const lang = sessionStorage.getItem('lang');
const question = document.getElementById("question");
const question_title = document.getElementById("question_title");
const choices = Array.from(document.getElementsByName("variant"));
const choices_pref = Array.from(document.getElementsByClassName("choice-prefix"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBar");
const loader = document.getElementById("preloader");
const radiogroup = Array.from(document.getElementsByClassName('radiogroup'));
const theme_name = document.getElementById('theme_name');
loader.style.display = "flex";
let result = {};
let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuesions = [];
let questions = [], dict = [];
let CORRECT_BONUS = 1;
let theme = sessionStorage.getItem('theme');
theme = theme == null ? 1 : theme;
var audioControl = new Audio();
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
async function postData(url = '', data = {}, json = true) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  if(!json){
    console.log(response.body)
    return response.data;
  }
  return await response.json(); // parses JSON response into native JavaScript objects
}
async function tts(text) {
  url = 'http://quiz.test/quiz/tts/';
  data = {text: text}  
// Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    responseType: 'blob',
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  
  response.blob().then(function(blob) {

    var reader = new FileReader();
    reader.addEventListener("loadend", function() {

      var base64FileData = reader.result.toString();
      localStorage.setItem('voice', base64FileData);
      audioControl.src = base64FileData;
      audioControl.play();

    });

    reader.readAsDataURL(blob);

  });
  return await response.body; // parses JSON response into native JavaScript objects
}

postData('/quiz/get/', { start: true, theme: theme })
  .then((data) => {
    MAX_QUESTIONS = data.total;
    result = {theme: null, question: []}
    console.log(data);
    startG(); // JSON data parsed by `response.json()` call
  });
startG = () =>{
  questionCounter = 0;
  score = 0;
  getQues();
}
getQues = () =>{
  loader.style.display = "flex";
  l = sessionStorage.getItem('lang');
  postData('/quiz/get/', { lang: l})
    .then(json => {
      console.log(json);
      init(json);
    });
  }  
init = (data) =>{
  if (data.finish || questionCounter >= MAX_QUESTIONS) {
    localStorage.setItem('result', JSON.stringify(result));
    //go to the end page
    if(MAX_QUESTIONS == 0){
      alert("Questions not found!\nSavollar mavjud emas!");
      return window.location.assign("/quiz/themes");
    }
    return window.location.assign("/quiz/end");
  }
  // tts(data.question.ques);
  if(data.voice){
    audioControl.src = data.voice;
    audioControl.play();
  }
  theme_name.innerText = data.question.theme;
  result.theme = data.question.theme;
  result.question.push({ques: data.question.ques})
  localStorage.setItem('voice', data.voice);
  questionCounter++;
  progressText.innerText = `${questionCounter}/${MAX_QUESTIONS}`;
  //Update the progress bar
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;
  progressBarFull.innerText = `${parseInt(questionCounter / MAX_QUESTIONS * 100)}%`;
  document.getElementById('question_block').addEventListener('click', (e) =>{
    ogg = localStorage.getItem('voice');
    if(ogg == null || ogg == "false"){
      return;
    }
    audioControl.src = ogg;
    audioControl.play();
  });
  question.innerHTML = ` ${data.question.ques}`;
  question_title.innerHTML = `&nbsp${data.question.title}`;
  choices.forEach(choice => {
    choice.dataset['value'] = data.variant[choice.dataset['prefix'].toLowerCase()];
    choice.labels[0].innerText = choice.dataset['value'];
    choice.checked = false;
  });

  acceptingAnswers = true;
  loader.style.display = "none";
  initClick(data);  
  // startG();
}
initClick = (data) =>{
  radiogroup.forEach(choice => {
    choice.addEventListener("click", e => {
      // alert(data.question.ques);
      if (!acceptingAnswers || data.question.ques !== question.textContent.trim()) return;
      acceptingAnswers = false;
      const selectedAnswer = e.target.innerText;
      console.log(selectedAnswer);
      // const selectedAnswer = selectedChoice.dataset["value"];
      l = sessionStorage.getItem('lang');
      res = {};
      postData('/quiz/post/', {
        id: data.question.id, 
        lang: l, 
        question: data.question.ques,
        answer: selectedAnswer
      })
      .then(data => {
        console.log(data);
        const classToApply = data.answer;

        if (classToApply === "correct") {
          incrementScore(CORRECT_BONUS);
        }
        e.target.parentElement.classList.add(classToApply);
        setTimeout(() => {
          e.target.parentElement.classList.remove(classToApply);
          result.question[result.question.length - 1].answer = selectedAnswer;
          result.question[result.question.length - 1].correct = data.correct;
          getQues();
        }, 700);
      });
    });
  });
}


startGame = () => {
  questionCounter = 0;
  score = 0;
  availableQuesions = [...questions];
  getNewRandomQuestion();
  game.classList.remove("hidden");
  loader.classList.add("hidden");
};

getNewRandomQuestion = () => {
  if (dict.length === 0 || questionCounter >= MAX_QUESTIONS) {
    localStorage.setItem("mostRecentScore", score);
    //go to the end page
    return window.location.assign("/quiz/end");
  }
  postData('/quiz/get/', { is_new: true, theme: 1 })
  .then((data) => {
    console.log(data); // JSON data parsed by `response.json()` call
  });
  questionCounter++;
  progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
  //Update the progress bar
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  const questionIndex = Math.floor(Math.random() * dict.length);
  currentQuestion = dict[questionIndex];
  if(lang == 'en'){
    question.innerHTML = `${currentQuestion.en}`;
    question_title.innerHTML = "&nbsp o'zbek tilida qanday?";
  }
  else{
    question.innerHTML = `${currentQuestion.uz}`;
    question_title.innerHTML = "&nbsp translate to Uzbek";
  }
  var variants = new Set();
  if(lang == 'en'){
    variants.add(currentQuestion.uz);
  }
  else{
    variants.add(currentQuestion.en);
  }
  loop = 3
  while(loop > 0){
    loop--;
    sz = variants.size;
    i = Math.floor(Math.random() * questions.length);
    ques = questions[i];
    if(lang == 'en'){
      variants.add(ques.uz);
    }
    else{
      variants.add(ques.en);
    }
    while (sz === variants.size) {
      i = Math.floor(Math.random() * questions.length);
      ques = questions[i];
      if(lang == 'en'){
        variants.add(ques.uz);
      }
      else{
        variants.add(ques.en);
      }
    }
  }
  vs = [...variants];
  choices.forEach(choice => {
    i = Math.floor(Math.random() * vs.length);
    choice.dataset['value'] = vs[i];
    choice.innerHTML = vs[i];
    vs.splice(i, 1);
  });

  dict.splice(questionIndex, 1);
  acceptingAnswers = true;
};


fu = () =>{
  choices.forEach(choice => {
  choice.addEventListener("click", e => {
    if (!acceptingAnswers) return;

    acceptingAnswers = false;
    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset["value"];
    console.log(selectedChoice.dataset);
    ans = lang == 'en' ? currentQuestion.uz : currentQuestion.en
    const classToApply =
      selectedAnswer == ans ? "correct" : "incorrect";

    if (classToApply === "correct") {
      incrementScore(CORRECT_BONUS);
    }

    selectedChoice.parentElement.classList.add(classToApply);

    setTimeout(() => {
      selectedChoice.parentElement.classList.remove(classToApply);
      getNewRandomQuestion();
    }, 500);
  });
});
}
incrementScore = num => {
  score += num;
  scoreText.innerText = score;
};
