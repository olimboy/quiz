const lang = sessionStorage.getItem('lang');
const question = document.getElementById("question");
const question_title = document.getElementById("question_title");
const choices = Array.from(document.getElementsByName("variant"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBar");
const loader = document.getElementById("preloader");
const game = document.getElementById("game");
let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuesions = [];
let questions = [], dict = [];
fetch("/quiz/get")
  .then(response => response.json())
  .then(json => questions = json)
  .then(questions => {
    console.log(questions),
    dict = [...questions],
    CORRECT_BONUS = 10,
    MAX_QUESTIONS = questions.length,
    startGame()}
    )
  .catch(err => {
        console.error(err);
      });
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

incrementScore = num => {
  score += num;
  scoreText.innerText = score;
};
