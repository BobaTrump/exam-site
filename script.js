import { QUESTIONS } from "./questions-data.js";

const statusCard = document.getElementById("status-card");
const statusText = document.getElementById("status-text");
const quizCard = document.getElementById("quiz-card");
const resultCard = document.getElementById("result-card");
const progressText = document.getElementById("progress-text");
const progressBar = document.getElementById("progress-bar");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers");
const feedback = document.getElementById("feedback");
const checkBtn = document.getElementById("check-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const resultCorrect = document.getElementById("result-correct");
const resultPercent = document.getElementById("result-percent");
const fileInput = document.getElementById("pdf-upload");
const themeToggle = document.getElementById("theme-toggle");

const state = {
  questions: [],
  index: 0,
  score: 0,
  answered: false,
  selected: new Set(),
};

let audioCtx = null;

function setStatus(message) {
  statusText.textContent = message;
  statusCard.classList.remove("hidden");
  quizCard.classList.add("hidden");
  resultCard.classList.add("hidden");
}

function normalizeLine(line) {
  return line
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAnswerKey(raw) {
  const digits = [...raw.replace(/[^\d]/g, "")];
  return [...new Set(digits)].sort().join("");
}

function showQuiz() {
  statusCard.classList.add("hidden");
  resultCard.classList.add("hidden");
  quizCard.classList.remove("hidden");
}

function getAudioCtx() {
  if (audioCtx) return audioCtx;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  audioCtx = new AudioCtx();
  return audioCtx;
}

function playTone(ctx, frequency, startAt, duration, type = "sine", gainValue = 0.05) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(gainValue, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration);
}

function playCorrectSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 660, now, 0.18, "sine", 0.05);
  playTone(ctx, 880, now + 0.08, 0.22, "triangle", 0.06);
  playTone(ctx, 990, now + 0.17, 0.24, "sine", 0.045);
}

function playWrongSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 320, now, 0.2, "sawtooth", 0.035);
  playTone(ctx, 220, now + 0.12, 0.25, "triangle", 0.04);
}

function computeIsCorrect(selectedOption, question) {
  if (!question.correct) return null;
  return normalizeAnswerKey(selectedOption) === question.correct;
}

function renderQuestion() {
  const total = state.questions.length;
  const question = state.questions[state.index];
  const percent = (((state.index + 1) / total) * 100).toFixed(2);

  progressText.textContent = `${state.index + 1} / ${total}`;
  progressBar.style.width = `${percent}%`;
  questionText.textContent = question.question;
  answersContainer.innerHTML = "";
  feedback.textContent = "";
  feedback.className = "feedback";
  checkBtn.classList.add("hidden");
  nextBtn.classList.add("hidden");
  state.answered = false;
  state.selected = new Set();

  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-btn";
    button.dataset.key = option.key;
    button.textContent = `${option.key}. ${option.text}`;
    button.addEventListener("click", () => handleOptionClick(button, option.key));
    answersContainer.appendChild(button);
  });

  if ((question.correct || "").length > 1) {
    checkBtn.classList.remove("hidden");
  }
}

function disableAllOptions() {
  [...answersContainer.querySelectorAll(".answer-btn")].forEach((btn) => {
    btn.disabled = true;
  });
}

function revealCorrectOption(question) {
  if (!question.correct) return;
  [...answersContainer.querySelectorAll(".answer-btn")].forEach((btn) => {
    if (question.correct.includes(btn.dataset.key)) {
      btn.classList.add("correct");
    }
  });
}

function handleOptionClick(button, key) {
  if (state.answered) return;
  const question = state.questions[state.index];

  if ((question.correct || "").length > 1) {
    if (state.selected.has(key)) {
      state.selected.delete(key);
      button.classList.remove("selected");
    } else {
      state.selected.add(key);
      button.classList.add("selected");
    }
    return;
  }

  state.selected = new Set([key]);
  checkCurrentAnswer();
}

function checkCurrentAnswer() {
  if (state.answered) return;
  const question = state.questions[state.index];
  const selected = [...state.selected].sort().join("");
  if (!selected) {
    feedback.textContent = "Выбери хотя бы один вариант.";
    return;
  }

  state.answered = true;
  disableAllOptions();
  checkBtn.classList.add("hidden");
  const result = computeIsCorrect(selected, question);

  if (result === true) {
    state.score += 1;
    [...answersContainer.querySelectorAll(".answer-btn")].forEach((btn) => {
      if (selected.includes(btn.dataset.key)) btn.classList.add("correct");
    });
    feedback.textContent = "Ти молодец Анюта❤️";
    feedback.classList.add("correct");
    playCorrectSound();
  } else if (result === false) {
    [...answersContainer.querySelectorAll(".answer-btn")].forEach((btn) => {
      if (selected.includes(btn.dataset.key) && !question.correct.includes(btn.dataset.key)) {
        btn.classList.add("wrong");
      }
    });
    revealCorrectOption(question);
    feedback.textContent = `Неверно. Правильный ответ: ${question.correct}`;
    feedback.classList.add("wrong");
    playWrongSound();
  } else {
    feedback.textContent = "Ответ в источнике не найден.";
  }
  nextBtn.classList.remove("hidden");
}

function showResult() {
  quizCard.classList.add("hidden");
  resultCard.classList.remove("hidden");
  const total = state.questions.length;
  const percent = total > 0 ? Math.round((state.score / total) * 100) : 0;
  resultCorrect.textContent = `Правильных ответов: ${state.score} из ${total}`;
  resultPercent.textContent = `Результат: ${percent}%`;
}

function handleNext() {
  if (state.index + 1 >= state.questions.length) {
    showResult();
    return;
  }
  state.index += 1;
  renderQuestion();
}

function restartQuiz() {
  state.index = 0;
  state.score = 0;
  renderQuestion();
  showQuiz();
}

function loadFromSource() {
  try {
    setStatus("Загружаю вопросы из кода...");
    const questions = QUESTIONS.map((item) => ({
      ...item,
      question: normalizeLine(item.question),
      options: item.options.map((opt) => ({
        key: String(opt.key),
        text: normalizeLine(opt.text),
      })),
      correct: normalizeAnswerKey(item.correct || ""),
    }));

    if (questions.length === 0) {
      throw new Error(
        "Не удалось подготовить вопросы из встроенной базы.",
      );
    }

    state.questions = questions;
    state.index = 0;
    state.score = 0;
    renderQuestion();
    showQuiz();
  } catch (error) {
    setStatus(`Ошибка: ${error.message}`);
  }
}

fileInput.addEventListener("change", (event) => {
  setStatus("В этой версии вопросы уже зашиты в код из PDF.");
});

checkBtn.addEventListener("click", checkCurrentAnswer);
nextBtn.addEventListener("click", handleNext);
restartBtn.addEventListener("click", restartQuiz);

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

loadFromSource();
