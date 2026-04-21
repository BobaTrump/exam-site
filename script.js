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
const themeToggle = document.getElementById("theme-toggle");
const favoriteBtn = document.getElementById("favorite-btn");
const favoritesModeBtn = document.getElementById("favorites-mode-btn");
const starsBadge = document.getElementById("stars-badge");
const resetProgressBtn = document.getElementById("reset-progress-btn");
const pomodoroPhase = document.getElementById("pomodoro-phase");
const pomodoroTime = document.getElementById("pomodoro-time");
const pomodoroStartBtn = document.getElementById("pomodoro-start");
const pomodoroPauseBtn = document.getElementById("pomodoro-pause");
const pomodoroResetBtn = document.getElementById("pomodoro-reset");
const pomodoroApplyBtn = document.getElementById("pomodoro-apply");
const focusMinutesInput = document.getElementById("focus-minutes");
const breakMinutesInput = document.getElementById("break-minutes");
const kittyPopup = document.getElementById("kitty-popup");

const STORAGE_KEY = "exam-site-progress-v3";

const state = {
  allQuestions: [],
  questions: [],
  index: 0,
  fullCorrect: 0,
  stars: 0,
  answered: false,
  selected: new Set(),
  answeredMap: {},
  favorites: new Set(),
  favoritesMode: false,
};

let audioCtx = null;
const pomodoro = {
  focusSec: 25 * 60,
  breakSec: 5 * 60,
  remainingSec: 25 * 60,
  isBreak: false,
  timerId: null,
  shouldResume: false,
};
const kittyEvent = {
  showTimer: null,
  hideTimer: null,
};

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

function saveProgress() {
  const payload = {
    index: state.index,
    fullCorrect: state.fullCorrect,
    stars: state.stars,
    answeredMap: state.answeredMap,
    favorites: [...state.favorites],
    favoritesMode: state.favoritesMode,
    darkMode: document.body.classList.contains("dark"),
    pomodoro: {
      focusSec: pomodoro.focusSec,
      breakSec: pomodoro.breakSec,
      remainingSec: pomodoro.remainingSec,
      isBreak: pomodoro.isBreak,
      running: Boolean(pomodoro.timerId),
      savedAt: Date.now(),
    },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  state.index = 0;
  state.fullCorrect = 0;
  state.answeredMap = {};
  // Keep stars and favorites after reset, clear only progress/answers.
  refreshQuestionPool();
  renderQuestion();
  showQuiz();
  updateStarsUi();
  updateFavoritesModeUi();
  saveProgress();
}

function refreshQuestionPool() {
  const source = state.favoritesMode
    ? state.allQuestions.filter((q) => state.favorites.has(q.id))
    : state.allQuestions;
  state.questions = source;
  if (state.index >= state.questions.length) state.index = 0;
}

function showQuiz() {
  statusCard.classList.add("hidden");
  resultCard.classList.add("hidden");
  quizCard.classList.remove("hidden");
}

function updateStarsUi() {
  starsBadge.textContent = `Звезды: ${state.stars} ⭐`;
}

function updateFavoritesModeUi() {
  favoritesModeBtn.textContent = `Только избранные: ${state.favoritesMode ? "вкл" : "выкл"}`;
}

function updateFavoriteButton(questionId) {
  const active = state.favorites.has(questionId);
  favoriteBtn.textContent = active ? "★ В избранном" : "☆ В избранное";
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

function playPomodoroBell() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 740, now, 0.14, "triangle", 0.05);
  playTone(ctx, 1040, now + 0.13, 0.18, "sine", 0.05);
  playTone(ctx, 1240, now + 0.27, 0.2, "triangle", 0.045);
}

function formatClock(totalSec) {
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function renderPomodoro() {
  pomodoroPhase.textContent = pomodoro.isBreak ? "Перерыв" : "Фокус";
  pomodoroTime.textContent = formatClock(pomodoro.remainingSec);
}

function switchPomodoroPhase() {
  pomodoro.isBreak = !pomodoro.isBreak;
  pomodoro.remainingSec = pomodoro.isBreak ? pomodoro.breakSec : pomodoro.focusSec;
  playPomodoroBell();
  renderPomodoro();
  saveProgress();
}

function startPomodoro() {
  if (pomodoro.timerId) return;
  pomodoro.timerId = window.setInterval(() => {
    if (pomodoro.remainingSec <= 0) {
      switchPomodoroPhase();
      return;
    }
    pomodoro.remainingSec -= 1;
    renderPomodoro();
    if (pomodoro.remainingSec % 5 === 0) saveProgress();
  }, 1000);
  saveProgress();
}

function pausePomodoro() {
  if (!pomodoro.timerId) return;
  clearInterval(pomodoro.timerId);
  pomodoro.timerId = null;
  saveProgress();
}

function resetPomodoro() {
  pausePomodoro();
  pomodoro.isBreak = false;
  pomodoro.remainingSec = pomodoro.focusSec;
  renderPomodoro();
  saveProgress();
}

function applyPomodoroMinutes() {
  const focusMin = Number(focusMinutesInput.value);
  const breakMin = Number(breakMinutesInput.value);
  if (!Number.isFinite(focusMin) || !Number.isFinite(breakMin) || focusMin < 1 || breakMin < 1) {
    alert("Введите корректные значения минут.");
    return;
  }
  pomodoro.focusSec = Math.min(180, focusMin) * 60;
  pomodoro.breakSec = Math.min(60, breakMin) * 60;
  pomodoro.isBreak = false;
  pomodoro.remainingSec = pomodoro.focusSec;
  renderPomodoro();
  saveProgress();
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function scheduleKittyPopup() {
  if (kittyEvent.showTimer) clearTimeout(kittyEvent.showTimer);
  if (kittyEvent.hideTimer) clearTimeout(kittyEvent.hideTimer);
  kittyPopup.classList.add("hidden");
  const delayMs = randomInt(60, 300) * 1000;
  kittyEvent.showTimer = window.setTimeout(() => {
    const maxX = Math.max(20, window.innerWidth - 200);
    const maxY = Math.max(120, window.innerHeight - 220);
    kittyPopup.style.left = `${randomInt(20, maxX)}px`;
    kittyPopup.style.top = `${randomInt(80, maxY)}px`;
    kittyPopup.style.right = "auto";
    kittyPopup.style.bottom = "auto";
    kittyPopup.classList.remove("hidden");
    const visibleMs = randomInt(10, 15) * 1000;
    kittyEvent.hideTimer = window.setTimeout(() => {
      kittyPopup.classList.add("hidden");
      scheduleKittyPopup();
    }, visibleMs);
  }, delayMs);
}

function computeIsCorrect(selectedOption, question) {
  if (!question.correct) return null;
  return normalizeAnswerKey(selectedOption) === question.correct;
}

function calculateStars(question, selectedSet) {
  const correctSet = new Set((question.correct || "").split(""));
  let hitCount = 0;
  for (const key of selectedSet) {
    if (correctSet.has(key)) hitCount += 1;
  }
  return Math.min(3, hitCount);
}

function renderQuestion() {
  if (state.questions.length === 0) {
    setStatus("В избранном пока нет вопросов.");
    return;
  }

  const total = state.questions.length;
  const question = state.questions[state.index];
  const percent = (((state.index + 1) / total) * 100).toFixed(2);
  const saved = state.answeredMap[question.id];

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
  updateFavoriteButton(question.id);

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

  if (saved) {
    state.selected = new Set(saved.selected || []);
    state.answered = true;
    disableAllOptions();
    [...answersContainer.querySelectorAll(".answer-btn")].forEach((btn) => {
      const key = btn.dataset.key;
      if (question.correct.includes(key)) btn.classList.add("correct");
      if (saved.result === false && state.selected.has(key) && !question.correct.includes(key)) {
        btn.classList.add("wrong");
      }
      if (!state.answered && state.selected.has(key)) btn.classList.add("selected");
    });
    if (saved.result === true) {
      feedback.textContent = `Ти молодец Анюта❤️ +${saved.stars ?? 0} ⭐`;
      feedback.classList.add("correct");
    } else if (saved.result === false) {
      feedback.textContent = `Ничего страшного, получится в следующий раз. Правильный ответ: ${question.correct}. Получено: ${saved.stars ?? 0} ⭐`;
      feedback.classList.add("wrong");
    }
    nextBtn.classList.remove("hidden");
    checkBtn.classList.add("hidden");
  }
  updateStarsUi();
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
  const earnedStars = calculateStars(question, state.selected);
  state.stars += earnedStars;

  if (result === true) {
    state.fullCorrect += 1;
    [...answersContainer.querySelectorAll(".answer-btn")].forEach((btn) => {
      if (selected.includes(btn.dataset.key)) btn.classList.add("correct");
    });
    feedback.textContent = `Ти молодец Анюта❤️ +${earnedStars} ⭐`;
    feedback.classList.add("correct");
    playCorrectSound();
  } else if (result === false) {
    [...answersContainer.querySelectorAll(".answer-btn")].forEach((btn) => {
      if (selected.includes(btn.dataset.key) && !question.correct.includes(btn.dataset.key)) {
        btn.classList.add("wrong");
      }
    });
    revealCorrectOption(question);
    feedback.textContent = `Ничего страшного, получится в следующий раз. Правильный ответ: ${question.correct}. Получено: ${earnedStars} ⭐`;
    feedback.classList.add("wrong");
    playWrongSound();
  } else {
    feedback.textContent = "Ответ в источнике не найден.";
  }
  state.answeredMap[question.id] = {
    selected: [...state.selected],
    result,
    stars: earnedStars,
  };
  updateStarsUi();
  saveProgress();
  nextBtn.classList.remove("hidden");
}

function showResult() {
  quizCard.classList.add("hidden");
  resultCard.classList.remove("hidden");
  const total = state.questions.length;
  const percent = total > 0 ? Math.round((state.fullCorrect / total) * 100) : 0;
  const maxStars = total * 3;
  resultCorrect.textContent = `Полностью правильных ответов: ${state.fullCorrect} из ${total}`;
  resultPercent.textContent = `Звезды: ${state.stars} из ${maxStars} • Точность: ${percent}%`;
}

function handleNext() {
  if (state.index + 1 >= state.questions.length) {
    showResult();
    return;
  }
  state.index += 1;
  saveProgress();
  renderQuestion();
}

function restartQuiz() {
  state.index = 0;
  state.answeredMap = {};
  state.fullCorrect = 0;
  state.stars = 0;
  renderQuestion();
  showQuiz();
  saveProgress();
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

    state.allQuestions = questions;
    const saved = loadProgress();
    if (saved) {
      state.index = saved.index || 0;
      state.fullCorrect = saved.fullCorrect || 0;
      state.stars = saved.stars || 0;
      state.answeredMap = saved.answeredMap || {};
      state.favorites = new Set(saved.favorites || []);
      state.favoritesMode = Boolean(saved.favoritesMode);
      document.body.classList.toggle("dark", Boolean(saved.darkMode));
      if (saved.pomodoro) {
        pomodoro.focusSec = saved.pomodoro.focusSec || pomodoro.focusSec;
        pomodoro.breakSec = saved.pomodoro.breakSec || pomodoro.breakSec;
        pomodoro.isBreak = Boolean(saved.pomodoro.isBreak);
        pomodoro.remainingSec = saved.pomodoro.remainingSec || pomodoro.focusSec;
        pomodoro.shouldResume = Boolean(saved.pomodoro.running);
        if (saved.pomodoro.running && saved.pomodoro.savedAt) {
          const elapsed = Math.floor((Date.now() - saved.pomodoro.savedAt) / 1000);
          pomodoro.remainingSec = Math.max(0, pomodoro.remainingSec - elapsed);
        }
      }
    } else {
      state.index = 0;
      state.fullCorrect = 0;
      state.stars = 0;
      state.answeredMap = {};
      state.favorites = new Set();
      state.favoritesMode = false;
      pomodoro.shouldResume = false;
    }
    refreshQuestionPool();
    if (state.questions.length === 0) {
      state.favoritesMode = false;
      refreshQuestionPool();
    }
    updateFavoritesModeUi();
    updateStarsUi();
    focusMinutesInput.value = String(Math.round(pomodoro.focusSec / 60));
    breakMinutesInput.value = String(Math.round(pomodoro.breakSec / 60));
    renderQuestion();
    showQuiz();
    saveProgress();
    if (pomodoro.shouldResume) {
      startPomodoro();
    }
  } catch (error) {
    setStatus(`Ошибка: ${error.message}`);
  }
}

checkBtn.addEventListener("click", checkCurrentAnswer);
nextBtn.addEventListener("click", handleNext);
restartBtn.addEventListener("click", restartQuiz);

favoriteBtn.addEventListener("click", () => {
  if (state.questions.length === 0) return;
  const question = state.questions[state.index];
  if (state.favorites.has(question.id)) {
    state.favorites.delete(question.id);
  } else {
    state.favorites.add(question.id);
  }
  updateFavoriteButton(question.id);
  if (state.favoritesMode) {
    const activeId = question.id;
    refreshQuestionPool();
    state.index = Math.max(0, state.questions.findIndex((q) => q.id === activeId));
    if (state.questions.length === 0) {
      setStatus("В избранном пока нет вопросов.");
      saveProgress();
      return;
    }
  }
  saveProgress();
});

favoritesModeBtn.addEventListener("click", () => {
  state.favoritesMode = !state.favoritesMode;
  state.index = 0;
  // Entering favorites mode starts a fresh retry for favorite questions.
  if (state.favoritesMode) {
    const favoriteIds = new Set(state.favorites);
    Object.keys(state.answeredMap).forEach((id) => {
      if (favoriteIds.has(Number(id))) {
        delete state.answeredMap[id];
      }
    });
  }
  refreshQuestionPool();
  updateFavoritesModeUi();
  renderQuestion();
  showQuiz();
  saveProgress();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  saveProgress();
});

resetProgressBtn.addEventListener("click", () => {
  const ok = confirm("Сбросить прогресс и ответы, но оставить звезды и избранное?");
  if (ok) resetProgress();
});

pomodoroStartBtn.addEventListener("click", startPomodoro);
pomodoroPauseBtn.addEventListener("click", pausePomodoro);
pomodoroResetBtn.addEventListener("click", resetPomodoro);
pomodoroApplyBtn.addEventListener("click", applyPomodoroMinutes);
kittyPopup.addEventListener("click", () => {
  state.stars += 1;
  updateStarsUi();
  kittyPopup.classList.add("hidden");
  if (kittyEvent.hideTimer) clearTimeout(kittyEvent.hideTimer);
  saveProgress();
  scheduleKittyPopup();
});

renderPomodoro();
loadFromSource();
scheduleKittyPopup();
