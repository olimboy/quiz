const lang = sessionStorage.getItem('lang');
const question = document.getElementById("question");
const question_title = document.getElementById("question_title");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const choices_pref = Array.from(document.getElementsByClassName("choice-prefix"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");
const loader = document.getElementById("loader");
const game = document.getElementById("game");
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
// var xhttp = new XMLHttpRequest();
// xhttp.onreadystatechange = function() {
//   if (this.readyState == 4 && this.status == 200) {
//    document.getElementById("demo").innerHTML = this.responseText;
//   }
// }
// xhttp.open('POST', '/quiz/get/', true);
// xhttp.send("is_new=true");
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

      // console.log('reader.result:', reader.result);

      // 1: play the base64 encoded data directly works
      // audioControl.src = reader.result;

      // 2: Serialize the data to localStorage and read it back then play...
      var base64FileData = reader.result.toString();
      localStorage.setItem('voice', base64FileData);
      // var mediaFile = {
      //   fileUrl: 'http://quiz.test/quiz/tts/',
      //   size: blob.size,
      //   type: blob.type,
      //   src: base64FileData
      // };

      // // save the file info to localStorage
      // localStorage.setItem('myTest', JSON.stringify(mediaFile));

      // // read out the file info from localStorage again
      // var reReadItem = JSON.parse(localStorage.getItem('myTest'));

      audioControl.src = base64FileData;
      audioControl.play();
      // var audio = document.createElement('audio');
      // // audio.style.display = "none";
      // audio.src = reReadItem.src;
      // audio.autoplay = true;
      // audio.onended = function(){
      //   audio.remove() //Remove when played.
      // };
      // document.body.appendChild(audio);

    });

    reader.readAsDataURL(blob);

  });
  // console.log(response.body);
  // console.log(response.blob());
  // console.log(response.data);
  // var audio = new Audio();
  // audio.pause();
  // audio.src = URL.createObjectURL(response.blob());
  // audio.play();
  return await response.body; // parses JSON response into native JavaScript objects
}

postData('/quiz/get/', { start: true, theme: theme })
  .then((data) => {
    MAX_QUESTIONS = data.total;
    console.log(data);
    startG(); // JSON data parsed by `response.json()` call
  });
startG = () =>{
  questionCounter = 0;
  score = 0;
  getQues();
}
getQues = () =>{
  loader.classList.remove("hidden");
  l = sessionStorage.getItem('lang');
  postData('/quiz/get/', { lang: l})
    .then(json => {
      console.log(json);
      init(json);
    });
  }  
init = (data) =>{
  if (data.finish || questionCounter >= MAX_QUESTIONS) {
    game.classList.add("hidden");
    loader.classList.remove("hidden");
    localStorage.setItem("mostRecentScore", score);
    //go to the end page
    if(MAX_QUESTIONS == 0){
      alert("Questions not found!\nSavollar mavjud emas!");
    }
    return window.location.assign("/quiz/end");
  }
  // tts(data.question.ques);
  audioControl.src = data.voice;
  audioControl.play();
  localStorage.setItem('voice', data.voice);
  game.classList.remove("hidden");
  loader.classList.add("hidden");
  questionCounter++;
  progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
  //Update the progress bar
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;
  question.addEventListener('click', (e) =>{
    ogg = localStorage.getItem('voice');
    if(ogg == null){
      return;
    }
    audioControl.src = ogg;
    audioControl.play();
  });
  question.innerHTML = `${data.question.ques}`;
  question_title.innerHTML = `&nbsp${data.question.title}`;
  i = 0;
  choices.forEach(choice => {
    choice.dataset['value'] = data.variant[choices_pref[i].textContent.toLowerCase()];
    choice.innerHTML = data.variant[choices_pref[i].textContent.toLowerCase()];
    i++;
  });

  acceptingAnswers = true;
  initClick(data);  
  // startG();
}
initClick = (data) =>{
  choices.forEach(choice => {
    choice.addEventListener("click", e => {
      // alert(data.question.ques);
      if (!acceptingAnswers || data.question.ques !== question.textContent) return;
      acceptingAnswers = false;
      const selectedChoice = e.target;
      const selectedAnswer = selectedChoice.dataset["value"];
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

        selectedChoice.parentElement.classList.add(classToApply);
        setTimeout(() => {
          selectedChoice.parentElement.classList.remove(classToApply);
          getQues();
        }, 700);
      });
    });
  });
}
// var request = new Request(
//   '/quiz/get/',
//   {
//     headers: {'X-CSRFToken': csrftoken},
//     // body: JSON.stringify({'is_new': true})
//   },
// );
// fetch(request, {
//   method: 'POST',
//   mode: 'same-origin'  // Do not send CSRF token to another domain.
// }).then(function(response) {
//   console.log(response);
// });
// fetch("/static/dict.json")
//   .then(response => response.json())
//   .then(json => questions = json)
//   .then(questions => {
//     console.log(questions),
//     dict = [...questions],
//     CORRECT_BONUS = 10,
//     MAX_QUESTIONS = questions.length,
//     startGame()}
//     )
//   .catch(err => {
//         console.error(err);
//       });
// fetch(
//   // "https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple"
//   "http://localhost/quiz/questions.json"
// )
//   .then(res => {
//     return res.json();
//   })
//   .then(loadedQuestions => {
//     console.log(loadedQuestions.results);
//     questions = loadedQuestions.results.map(loadedQuestion => {
//       const formattedQuestion = {
//         question: loadedQuestion.question
//       };
//       console.log(formattedQuestion);

//       const answerChoices = [...loadedQuestion.incorrect_answers];
//       formattedQuestion.answer = Math.floor(Math.random() * 3) + 1;
//       answerChoices.splice(
//         formattedQuestion.answer - 1,
//         0,
//         loadedQuestion.correct_answer
//       );
//       console.log(formattedQuestion);

//       answerChoices.forEach((choice, index) => {
//         formattedQuestion["choice" + (index + 1)] = choice;
//       });
//       console.log(formattedQuestion);
//       return formattedQuestion;
//     });

//     startGame();
//   })
//   .catch(err => {
//     console.error(err);
//   });

//CONSTANTS


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

// getNewQuestion = () => {
//   if (availableQuesions.length === 0 || questionCounter >= MAX_QUESTIONS) {
//     localStorage.setItem("mostRecentScore", score);
//     //go to the end page
//     return window.location.assign("/quiz/end.html");
//   }
//   questionCounter++;
//   progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
//   //Update the progress bar
//   progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

//   const questionIndex = Math.floor(Math.random() * availableQuesions.length);
//   currentQuestion = availableQuesions[questionIndex];
//   question.innerHTML = currentQuestion.question;
  
//   choices.forEach(choice => {
//     const number = choice.dataset["number"];
//     choice.innerHTML = currentQuestion["choice" + number];
//   });

//   availableQuesions.splice(questionIndex, 1);
//   acceptingAnswers = true;
// };

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
