import { QUESTIONS } from "./questions-data.js";
import { ECONOMICS_QUESTIONS } from "./economics-questions-data.js";

const statusCard = document.getElementById("status-card");
const statusText = document.getElementById("status-text");
const quizCard = document.getElementById("quiz-card");
const resultCard = document.getElementById("result-card");
const progressText = document.getElementById("progress-text");
const progressBar = document.getElementById("progress-bar");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers");
const feedback = document.getElementById("feedback");
const explanationToggleBtn = document.getElementById("explanation-toggle-btn");
const explanationText = document.getElementById("explanation-text");
const checkBtn = document.getElementById("check-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const resultCorrect = document.getElementById("result-correct");
const resultPercent = document.getElementById("result-percent");
const menuOpenBtn = document.getElementById("menu-open-btn");
const menuCloseBtn = document.getElementById("menu-close-btn");
const menuOverlay = document.getElementById("menu-overlay");
const menuDrawer = document.getElementById("menu-drawer");
const themeToggle = document.getElementById("theme-toggle");
const favoriteBtn = document.getElementById("favorite-btn");
const favoritesModeBtn = document.getElementById("favorites-mode-btn");
const starsBadge = document.getElementById("stars-badge");
const starsCount = document.getElementById("stars-count");
const resetProgressBtn = document.getElementById("reset-progress-btn");
const randomCountInput = document.getElementById("random-count");
const randomTestBtn = document.getElementById("random-test-btn");
const allTestBtn = document.getElementById("all-test-btn");
const personalizationOpenBtn = document.getElementById("personalization-open-btn");
const testSectionOpenBtn = document.getElementById("test-section-open-btn");
const notesOpenBtn = document.getElementById("notes-open-btn");
const userNameInput = document.getElementById("user-name-input");
const userNameBadge = document.getElementById("user-name-badge");
const userAvatarInput = document.getElementById("user-avatar-input");
const userAvatarPreview = document.getElementById("user-avatar-preview");
const userAvatarModalPreview = document.getElementById("user-avatar-modal-preview");
const personalizationNameHint = document.getElementById("personalization-name-hint");
const uiColorSelect = document.getElementById("ui-color-select");
const subjectSelect = document.getElementById("subject-select");
const topicSelect = document.getElementById("topic-select");
const activeSectionText = document.getElementById("active-section-text");
const pomodoroPhase = document.getElementById("pomodoro-phase");
const pomodoroTime = document.getElementById("pomodoro-time");
const pomodoroStartBtn = document.getElementById("pomodoro-start");
const pomodoroPauseBtn = document.getElementById("pomodoro-pause");
const pomodoroResetBtn = document.getElementById("pomodoro-reset");
const pomodoroApplyBtn = document.getElementById("pomodoro-apply");
const pomodoroVideoFrame = document.getElementById("pomodoro-video-frame");
const pomodoroVideoSelect = document.getElementById("pomodoro-video-select");
const pomodoroVideoUrl = document.getElementById("pomodoro-video-url");
const pomodoroVideoApply = document.getElementById("pomodoro-video-apply");
const focusMinutesInput = document.getElementById("focus-minutes");
const breakMinutesInput = document.getElementById("break-minutes");
const kittyPopup = document.getElementById("kitty-popup");
const notesUpload = document.getElementById("notes-upload");
const notesList = document.getElementById("notes-list");
const notesSearch = document.getElementById("notes-search");
const notesTagFilter = document.getElementById("notes-tag-filter");
const pdfViewerModal = document.getElementById("pdf-viewer-modal");
const pdfViewerFrame = document.getElementById("pdf-viewer-frame");
const pdfViewerClose = document.getElementById("pdf-viewer-close");
const notesEditorModal = document.getElementById("notes-editor-modal");
const notesEditorClose = document.getElementById("notes-editor-close");
const notesEditorName = document.getElementById("notes-editor-name");
const notesEditorTags = document.getElementById("notes-editor-tags");
const notesEditorSave = document.getElementById("notes-editor-save");
const notesEditorCancel = document.getElementById("notes-editor-cancel");
const testSectionModal = document.getElementById("test-section-modal");
const testSectionCloseBtn = document.getElementById("test-section-close-btn");
const notesModal = document.getElementById("notes-modal");
const notesCloseBtn = document.getElementById("notes-close-btn");
const personalizationModal = document.getElementById("personalization-modal");
const personalizationCloseBtn = document.getElementById("personalization-close-btn");
const toastStack = document.getElementById("toast-stack");
const fxLayer = document.getElementById("fx-layer");
const notesMiniToggle = document.getElementById("notes-mini-toggle");
const notesMiniPanel = document.getElementById("notes-mini-panel");
const notesMiniClose = document.getElementById("notes-mini-close");
const notesMiniText = document.getElementById("notes-mini-text");

const STORAGE_KEY = "exam-site-progress-v4";
const MINI_NOTES_KEY = "exam-site-mini-notes-v1";
const MINI_NOTES_OPEN_KEY = "exam-site-mini-notes-open-v1";
const LEGACY_STORAGE_KEY = "exam-site-progress-v3";
const DEFAULT_USER_NAME = "Анюта ❤️";
const DEFAULT_AVATAR_SRC = "./star-kitten.png";
const POMODORO_CHANNEL_ID = "UCJbWkLQ560sIKxgwdTsWEFA";

const TEST_SECTIONS = {
  "Обществознание": {
    Социология: QUESTIONS,
    Экономика: ECONOMICS_QUESTIONS,
  },
};

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
  randomQuestionIds: null,
  currentSubject: "Обществознание",
  currentTopic: "Социология",
  profileName: DEFAULT_USER_NAME,
  profileAvatar: "",
  uiColor: "dawn",
  pomodoroVideoId: "jfKfPfyJRdk",
  pomodoroVideoCustomUrl: "",
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
let notesDb = null;
let notesCache = [];
let notesEditorCurrentId = null;
let notesFilterText = "";
let notesFilterTag = "";
let isExplanationOpen = false;

function openMenu() {
  menuOverlay.classList.remove("hidden");
  menuDrawer.classList.remove("hidden");
  menuOverlay.setAttribute("aria-hidden", "false");
}

function closeMenu() {
  menuOverlay.classList.add("hidden");
  menuDrawer.classList.add("hidden");
  menuOverlay.setAttribute("aria-hidden", "true");
}

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
    randomQuestionIds: state.randomQuestionIds,
    currentSubject: state.currentSubject,
    currentTopic: state.currentTopic,
    profileName: state.profileName,
    profileAvatar: state.profileAvatar,
    uiColor: state.uiColor,
    pomodoroVideoId: state.pomodoroVideoId,
    pomodoroVideoCustomUrl: state.pomodoroVideoCustomUrl,
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

function normalizeYouTubeToEmbed(urlOrId) {
  const raw = String(urlOrId || "").trim();
  if (!raw) return "";
  if (/^[A-Za-z0-9_-]{8,}$/.test(raw) && !raw.includes("http")) {
    return `https://www.youtube.com/embed/${raw}`;
  }
  try {
    const u = new URL(raw);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const m = u.pathname.match(/\/embed\/([^/?]+)/);
      if (m) return `https://www.youtube.com/embed/${m[1]}`;
    }
    return "";
  } catch (_e) {
    return "";
  }
}

function getPomodoroEmbedSrc() {
  if (state.pomodoroVideoId === "live") {
    return `https://www.youtube.com/embed/live_stream?channel=${POMODORO_CHANNEL_ID}`;
  }
  if (state.pomodoroVideoId === "custom") {
    const embed = normalizeYouTubeToEmbed(state.pomodoroVideoCustomUrl);
    return embed || `https://www.youtube.com/embed/jfKfPfyJRdk`;
  }
  return `https://www.youtube.com/embed/${state.pomodoroVideoId}`;
}

function applyPomodoroVideoUi() {
  pomodoroVideoSelect.value = state.pomodoroVideoId || "jfKfPfyJRdk";
  pomodoroVideoUrl.value = state.pomodoroVideoCustomUrl || "";
  pomodoroVideoUrl.classList.toggle("hidden", pomodoroVideoSelect.value !== "custom");
  pomodoroVideoFrame.src = getPomodoroEmbedSrc();
}

const UI_COLOR_KEYS = new Set(["dawn", "blush", "sea", "mist"]);
const UI_COLOR_LEGACY = { pink: "dawn", peach: "blush", lilac: "mist", ocean: "sea" };

function normalizeUiColor(raw) {
  const v = String(raw || "dawn").toLowerCase();
  if (UI_COLOR_KEYS.has(v)) return v;
  if (UI_COLOR_LEGACY[v]) return UI_COLOR_LEGACY[v];
  return "dawn";
}

function applyUiColor(color) {
  state.uiColor = normalizeUiColor(color);
  document.body.classList.remove("bg-dawn", "bg-blush", "bg-sea", "bg-mist", "bg-peach", "bg-lilac", "ui-ocean");
  document.body.classList.add(`bg-${state.uiColor}`);
  uiColorSelect.value = state.uiColor;
}

function applyProfileUi() {
  const safeName = (state.profileName || DEFAULT_USER_NAME).trim();
  state.profileName = safeName || DEFAULT_USER_NAME;
  userNameBadge.textContent = state.profileName;
  personalizationNameHint.textContent = `Сейчас: ${state.profileName}`;
  userNameInput.value = state.profileName;
  const avatarSrc = state.profileAvatar || DEFAULT_AVATAR_SRC;
  userAvatarPreview.src = avatarSrc;
  userAvatarModalPreview.src = avatarSrc;
  applyUiColor(state.uiColor);
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) return JSON.parse(legacyRaw);
    return null;
  } catch (_error) {
    return null;
  }
}

function getTopicQuestions(subject, topic) {
  return TEST_SECTIONS[subject]?.[topic] || [];
}

function fillSubjectOptions() {
  subjectSelect.innerHTML = "";
  Object.keys(TEST_SECTIONS).forEach((subject) => {
    const opt = document.createElement("option");
    opt.value = subject;
    opt.textContent = subject;
    subjectSelect.appendChild(opt);
  });
}

function fillTopicOptions(subject) {
  topicSelect.innerHTML = "";
  const topics = Object.keys(TEST_SECTIONS[subject] || {});
  topics.forEach((topic) => {
    const opt = document.createElement("option");
    opt.value = topic;
    opt.textContent = topic;
    topicSelect.appendChild(opt);
  });
}

function updateActiveSectionUi() {
  activeSectionText.textContent = `${state.currentSubject} • ${state.currentTopic}`;
}

function applySectionSelection({ resetSession = false } = {}) {
  const source = getTopicQuestions(state.currentSubject, state.currentTopic);
  const sectionKey = `${state.currentSubject}:${state.currentTopic}`;
  const questions = source.map((item) => ({
    ...item,
    rawId: item.id,
    id: `${sectionKey}:${item.id}`,
    question: normalizeLine(item.question),
    options: item.options.map((opt) => ({
      key: String(opt.key),
      text: normalizeLine(opt.text),
    })),
    correct: normalizeAnswerKey(item.correct || ""),
  }));
  state.allQuestions = questions;
  updateQuestionControlsUi();

  if (resetSession) {
    state.index = 0;
    state.fullCorrect = 0;
    state.answeredMap = {};
    state.randomQuestionIds = null;
    state.favoritesMode = false;
  }

  refreshQuestionPool();
  if (state.questions.length === 0) {
    setStatus("В этом разделе пока нет вопросов.");
    saveProgress();
    return;
  }
  updateFavoritesModeUi();
  updateActiveSectionUi();
  renderQuestion();
  showQuiz();
  saveProgress();
}

function syncSectionSelectors() {
  subjectSelect.value = state.currentSubject;
  fillTopicOptions(state.currentSubject);
  if (!Object.keys(TEST_SECTIONS[state.currentSubject] || {}).includes(state.currentTopic)) {
    state.currentTopic = Object.keys(TEST_SECTIONS[state.currentSubject] || {})[0] || "";
  }
  topicSelect.value = state.currentTopic;
  updateActiveSectionUi();
}

function initSectionsUi() {
  fillSubjectOptions();
  syncSectionSelectors();
}

function migrateFavoriteIds(favorites = []) {
  const sectionPrefix = `${state.currentSubject}:${state.currentTopic}:`;
  const byLegacyId = new Map(state.allQuestions.map((q) => [String(q.rawId), q.id]));
  return favorites
    .map((id) => {
      const asString = String(id);
      if (asString.includes(":")) return asString;
      return byLegacyId.get(asString) || `${sectionPrefix}${asString}`;
    })
    .filter(Boolean);
}

function restoreStateFromSave(saved) {
  state.currentSubject = saved.currentSubject || "Обществознание";
  state.currentTopic = saved.currentTopic || "Социология";
  state.profileName = saved.profileName || DEFAULT_USER_NAME;
  state.profileAvatar = saved.profileAvatar || "";
  state.uiColor = normalizeUiColor(saved.uiColor);
  state.pomodoroVideoId = saved.pomodoroVideoId || "jfKfPfyJRdk";
  state.pomodoroVideoCustomUrl = saved.pomodoroVideoCustomUrl || "";
  state.index = saved.index || 0;
  state.fullCorrect = saved.fullCorrect || 0;
  state.stars = saved.stars || 0;
  state.answeredMap = saved.answeredMap || {};
  state.favorites = new Set(migrateFavoriteIds(saved.favorites || []));
  state.favoritesMode = Boolean(saved.favoritesMode);
  state.randomQuestionIds = Array.isArray(saved.randomQuestionIds)
    ? saved.randomQuestionIds
    : null;
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
  let source = state.favoritesMode
    ? state.allQuestions.filter((q) => state.favorites.has(q.id))
    : state.allQuestions;
  if (Array.isArray(state.randomQuestionIds) && state.randomQuestionIds.length > 0) {
    const allow = new Set(state.randomQuestionIds);
    source = source.filter((q) => allow.has(q.id));
  }
  state.questions = source;
  if (state.index >= state.questions.length) state.index = 0;
}

function showQuiz() {
  statusCard.classList.add("hidden");
  resultCard.classList.add("hidden");
  quizCard.classList.remove("hidden");
}

function updateStarsUi() {
  if (starsCount) {
    starsCount.textContent = String(state.stars);
    starsBadge.classList.remove("bump");
    void starsBadge.offsetWidth;
    starsBadge.classList.add("bump");
  } else {
    starsBadge.textContent = `Звезды: ${state.stars}`;
  }
}

function showToast(text, ms = 2000) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = text;
  toastStack.appendChild(t);
  setTimeout(() => {
    t.classList.add("hide");
    setTimeout(() => t.remove(), 250);
  }, ms);
}

function animateStarsGain(gain = 1) {
  const rect = starsBadge.getBoundingClientRect();
  for (let i = 0; i < Math.max(1, gain); i += 1) {
    const star = document.createElement("span");
    star.className = "star-pop";
    star.textContent = "⭐";
    const jitterX = randomInt(-14, 14);
    const jitterY = randomInt(-8, 8);
    star.style.left = `${rect.left + rect.width / 2 + jitterX}px`;
    star.style.top = `${rect.top + rect.height / 2 + jitterY}px`;
    fxLayer.appendChild(star);
    setTimeout(() => star.remove(), 850);
  }
}

function updateFavoritesModeUi() {
  favoritesModeBtn.textContent = `Только избранные: ${state.favoritesMode ? "вкл" : "выкл"}`;
}

function updateQuestionControlsUi() {
  const total = state.allQuestions.length;
  randomCountInput.max = String(Math.max(1, total));
  if (Number(randomCountInput.value) > total) {
    randomCountInput.value = String(total || 1);
  }
  allTestBtn.textContent = `Все ${total}`;
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

function openNotesDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("notes-pdf-db", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function dbPut(record) {
  return new Promise((resolve, reject) => {
    const tx = notesDb.transaction("files", "readwrite");
    tx.objectStore("files").put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function dbDelete(id) {
  return new Promise((resolve, reject) => {
    const tx = notesDb.transaction("files", "readwrite");
    tx.objectStore("files").delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function dbGetAll() {
  return new Promise((resolve, reject) => {
    const tx = notesDb.transaction("files", "readonly");
    const req = tx.objectStore("files").getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function normalizeTags(text) {
  return text
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .filter((t, idx, arr) => arr.indexOf(t) === idx);
}

function buildTagsIndex(files) {
  const tags = new Set();
  files.forEach((f) => (f.tags || []).forEach((t) => tags.add(t)));
  return [...tags].sort((a, b) => a.localeCompare(b, "ru"));
}

function renderTagFilter(files) {
  const tags = buildTagsIndex(files);
  const current = notesTagFilter.value;
  notesTagFilter.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = "";
  optAll.textContent = "Все теги";
  notesTagFilter.appendChild(optAll);
  tags.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    notesTagFilter.appendChild(opt);
  });
  notesTagFilter.value = tags.includes(current) ? current : "";
}

function openNotesEditor(file) {
  notesEditorCurrentId = file.id;
  notesEditorName.value = file.name || "";
  notesEditorTags.value = (file.tags || []).join(", ");
  notesEditorModal.classList.remove("hidden");
  notesEditorName.focus();
}

function closeNotesEditor() {
  notesEditorCurrentId = null;
  notesEditorName.value = "";
  notesEditorTags.value = "";
  notesEditorModal.classList.add("hidden");
}

function filteredNotes(files) {
  const q = notesFilterText.trim().toLowerCase();
  return files.filter((f) => {
    const okText = !q || (f.name || "").toLowerCase().includes(q);
    const okTag = !notesFilterTag || (f.tags || []).includes(notesFilterTag);
    return okText && okTag;
  });
}

function renderNotes(files) {
  notesList.innerHTML = "";
  const list = filteredNotes(files);
  renderTagFilter(files);

  if (!list.length) {
    const empty = document.createElement("p");
    empty.textContent = "Пока нет загруженных конспектов.";
    empty.style.margin = "0";
    empty.style.color = "var(--muted)";
    notesList.appendChild(empty);
    return;
  }

  const groups = new Map();
  list.forEach((file) => {
    const tags = (file.tags || []).length ? file.tags : ["без тегов"];
    tags.forEach((t) => {
      if (!groups.has(t)) groups.set(t, []);
      groups.get(t).push(file);
    });
  });

  const groupNames = [...groups.keys()].sort((a, b) => {
    if (a === "без тегов") return 1;
    if (b === "без тегов") return -1;
    return a.localeCompare(b, "ru");
  });

  groupNames.forEach((groupName) => {
    const title = document.createElement("div");
    title.className = "notes-group-title";
    title.textContent = groupName;
    notesList.appendChild(title);
    groups
      .get(groupName)
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach((file) => {
      const row = document.createElement("div");
      row.className = "notes-item";
      const left = document.createElement("div");
      left.className = "notes-item-left";
      const name = document.createElement("div");
      name.className = "notes-item-name";
      name.textContent = file.name;
      const tags = document.createElement("div");
      tags.className = "notes-tags";
      (file.tags || []).slice(0, 6).forEach((t) => {
        const pill = document.createElement("span");
        pill.className = "tag-pill";
        pill.textContent = t;
        tags.appendChild(pill);
      });
      left.append(name, tags);
      const actions = document.createElement("div");
      actions.className = "notes-item-actions";
      const openBtn = document.createElement("button");
      openBtn.className = "tiny-btn";
      openBtn.textContent = "Открыть";
      openBtn.addEventListener("click", () => {
        const url = URL.createObjectURL(file.blob);
        pdfViewerFrame.src = url;
        pdfViewerModal.classList.remove("hidden");
        pdfViewerModal.dataset.url = url;
      });
      const editBtn = document.createElement("button");
      editBtn.className = "tiny-btn";
      editBtn.textContent = "Редактировать";
      editBtn.addEventListener("click", () => openNotesEditor(file));
      const delBtn = document.createElement("button");
      delBtn.className = "tiny-btn";
      delBtn.textContent = "Удалить";
      delBtn.addEventListener("click", async () => {
        await dbDelete(file.id);
        await refreshNotes();
      });
      actions.append(openBtn, editBtn, delBtn);
      row.append(left, actions);
      notesList.appendChild(row);
    });
  });
}

async function refreshNotes() {
  if (!notesDb) return;
  const files = (await dbGetAll()).map((f) => ({
    ...f,
    tags: Array.isArray(f.tags) ? f.tags : [],
  }));
  notesCache = files;
  renderNotes(notesCache);
}

async function initNotes() {
  try {
    notesDb = await openNotesDb();
    await refreshNotes();
  } catch (_error) {
    notesList.textContent = "Не удалось открыть локальное хранилище PDF.";
  }
}

function pickRandomQuestionIds(count) {
  const ids = state.allQuestions.map((q) => q.id);
  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, count);
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
  explanationText.textContent = "";
  closeExplanation();
  explanationToggleBtn.classList.add("hidden");
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
      feedback.textContent = `Ти молодец Анюта❤️ +${saved.stars ?? 0} зв.`;
      feedback.classList.add("correct");
    } else if (saved.result === false) {
      feedback.textContent = `Ничего страшного, получится в следующий раз. Правильный ответ: ${question.correct}. Получено: ${saved.stars ?? 0} зв.`;
      feedback.classList.add("wrong");
    }
    if (question.explanation) {
      explanationText.textContent = question.explanation;
    }
    syncExplanationUi(question);
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

function closeExplanation() {
  isExplanationOpen = false;
  explanationText.classList.remove("visible");
  explanationToggleBtn.textContent = "Показать пояснение";
}

function syncExplanationUi(question) {
  const hasExplanation = Boolean(question?.explanation);
  explanationToggleBtn.classList.toggle("hidden", !hasExplanation || !state.answered);
  if (!hasExplanation) {
    explanationText.textContent = "";
    closeExplanation();
  }
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
    feedback.textContent = `Ти молодец Анюта❤️ +${earnedStars} зв.`;
    feedback.classList.add("correct");
    playCorrectSound();
    animateStarsGain(earnedStars);
    showToast(`Класс! +${earnedStars} звезды`);
  } else if (result === false) {
    [...answersContainer.querySelectorAll(".answer-btn")].forEach((btn) => {
      if (selected.includes(btn.dataset.key) && !question.correct.includes(btn.dataset.key)) {
        btn.classList.add("wrong");
      }
    });
    revealCorrectOption(question);
    feedback.textContent = `Ничего страшного, получится в следующий раз. Правильный ответ: ${question.correct}. Получено: ${earnedStars} зв.`;
    feedback.classList.add("wrong");
    playWrongSound();
    if (earnedStars > 0) {
      animateStarsGain(earnedStars);
      showToast(`Есть прогресс: +${earnedStars} звезды`);
    } else {
      showToast("Не страшно, следующая попытка получится!");
    }
  } else {
    feedback.textContent = "Ответ в источнике не найден.";
    showToast("Проверка недоступна для этого вопроса");
  }
  if (question.explanation) {
    explanationText.textContent = question.explanation;
  }
  syncExplanationUi(question);
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
    setStatus("Загружаю разделы тестов...");
    const saved = loadProgress();
    if (saved) {
      state.currentSubject = saved.currentSubject || "Обществознание";
      state.currentTopic = saved.currentTopic || "Социология";
      state.profileName = saved.profileName || DEFAULT_USER_NAME;
      state.profileAvatar = saved.profileAvatar || "";
      state.uiColor = normalizeUiColor(saved.uiColor);
      state.pomodoroVideoId = saved.pomodoroVideoId || "jfKfPfyJRdk";
      state.pomodoroVideoCustomUrl = saved.pomodoroVideoCustomUrl || "";
    }
    initSectionsUi();
    if (!TEST_SECTIONS[state.currentSubject]) {
      state.currentSubject = "Обществознание";
    }
    if (!TEST_SECTIONS[state.currentSubject]?.[state.currentTopic]) {
      state.currentTopic = "Социология";
    }
    syncSectionSelectors();
    applySectionSelection();

    if (state.allQuestions.length === 0) {
      throw new Error("Не удалось подготовить вопросы из выбранного раздела.");
    }

    if (saved) {
      restoreStateFromSave(saved);
      syncSectionSelectors();
      applySectionSelection();
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
      state.randomQuestionIds = null;
      state.currentSubject = "Обществознание";
      state.currentTopic = "Социология";
      state.profileName = DEFAULT_USER_NAME;
      state.profileAvatar = "";
      state.uiColor = "dawn";
      state.pomodoroVideoId = "jfKfPfyJRdk";
      state.pomodoroVideoCustomUrl = "";
      syncSectionSelectors();
      applySectionSelection();
      pomodoro.shouldResume = false;
    }

    applyProfileUi();
    applyPomodoroVideoUi();

    const sectionPrefix = `${state.currentSubject}:${state.currentTopic}:`;
    state.answeredMap = Object.fromEntries(
      Object.entries(state.answeredMap).filter(([id]) => id.startsWith(sectionPrefix)),
    );
    state.randomQuestionIds = Array.isArray(state.randomQuestionIds)
      ? state.randomQuestionIds.filter((id) => String(id).startsWith(sectionPrefix))
      : null;

    refreshQuestionPool();
    updateFavoritesModeUi();
    updateActiveSectionUi();
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
    showToast("Убрано из избранного");
  } else {
    state.favorites.add(question.id);
    showToast("Добавлено в избранное");
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

randomTestBtn.addEventListener("click", () => {
  const requested = Number(randomCountInput.value);
  const total = state.allQuestions.length;
  if (!Number.isFinite(requested) || requested < 1) {
    alert("Введите корректное количество вопросов.");
    return;
  }
  const count = Math.min(total, Math.floor(requested));
  state.randomQuestionIds = pickRandomQuestionIds(count);
  state.index = 0;
  state.answeredMap = {};
  state.fullCorrect = 0;
  refreshQuestionPool();
  renderQuestion();
  showQuiz();
  showToast(`Собран случайный тест: ${count} вопросов`);
  saveProgress();
});

allTestBtn.addEventListener("click", () => {
  state.randomQuestionIds = null;
  state.index = 0;
  state.answeredMap = {};
  state.fullCorrect = 0;
  refreshQuestionPool();
  renderQuestion();
  showQuiz();
  showToast("Возврат к полному тесту");
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
  showToast(`Режим избранного: ${state.favoritesMode ? "включен" : "выключен"}`);
  saveProgress();
});

subjectSelect.addEventListener("change", () => {
  state.currentSubject = subjectSelect.value;
  fillTopicOptions(state.currentSubject);
  state.currentTopic = topicSelect.value;
  applySectionSelection({ resetSession: true });
  showToast(`Раздел: ${state.currentSubject} • ${state.currentTopic}`);
});

userNameInput.addEventListener("input", () => {
  state.profileName = (userNameInput.value || "").trim() || DEFAULT_USER_NAME;
  userNameBadge.textContent = state.profileName;
  personalizationNameHint.textContent = `Сейчас: ${state.profileName}`;
  saveProgress();
});

uiColorSelect.addEventListener("change", () => {
  applyUiColor(uiColorSelect.value);
  saveProgress();
});

userAvatarInput.addEventListener("change", () => {
  const file = userAvatarInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.profileAvatar = typeof reader.result === "string" ? reader.result : "";
    const avatarSrc = state.profileAvatar || DEFAULT_AVATAR_SRC;
    userAvatarPreview.src = avatarSrc;
    userAvatarModalPreview.src = avatarSrc;
    saveProgress();
    showToast("Аватар обновлен");
  };
  reader.readAsDataURL(file);
  userAvatarInput.value = "";
});

topicSelect.addEventListener("change", () => {
  state.currentTopic = topicSelect.value;
  applySectionSelection({ resetSession: true });
  showToast(`Тема: ${state.currentTopic}`);
});

menuOpenBtn.addEventListener("click", openMenu);
menuCloseBtn.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", closeMenu);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

testSectionOpenBtn.addEventListener("click", () => {
  testSectionModal.classList.remove("hidden");
  closeMenu();
});

testSectionCloseBtn.addEventListener("click", () => {
  testSectionModal.classList.add("hidden");
});

notesOpenBtn.addEventListener("click", () => {
  notesModal.classList.remove("hidden");
  closeMenu();
});

notesCloseBtn.addEventListener("click", () => {
  notesModal.classList.add("hidden");
});

personalizationOpenBtn.addEventListener("click", () => {
  applyProfileUi();
  personalizationModal.classList.remove("hidden");
  closeMenu();
});

personalizationCloseBtn.addEventListener("click", () => {
  personalizationModal.classList.add("hidden");
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
pomodoroVideoSelect.addEventListener("change", () => {
  state.pomodoroVideoId = pomodoroVideoSelect.value;
  pomodoroVideoUrl.classList.toggle("hidden", state.pomodoroVideoId !== "custom");
  applyPomodoroVideoUi();
  saveProgress();
});

pomodoroVideoApply.addEventListener("click", () => {
  if (pomodoroVideoSelect.value === "custom") {
    state.pomodoroVideoId = "custom";
    state.pomodoroVideoCustomUrl = pomodoroVideoUrl.value || "";
  }
  applyPomodoroVideoUi();
  saveProgress();
  showToast("Видео Pomodoro обновлено");
});
kittyPopup.addEventListener("click", () => {
  state.stars += 1;
  updateStarsUi();
  animateStarsGain(1);
  showToast("+1 звезда за котёнка");
  kittyPopup.classList.add("hidden");
  if (kittyEvent.hideTimer) clearTimeout(kittyEvent.hideTimer);
  saveProgress();
  scheduleKittyPopup();
});

renderPomodoro();
loadFromSource();
scheduleKittyPopup();
initNotes();

notesUpload.addEventListener("change", async (event) => {
  const files = [...(event.target.files || [])].filter((f) => f.type === "application/pdf");
  for (const file of files) {
    await dbPut({
      id: crypto.randomUUID(),
      name: file.name,
      blob: file,
      tags: [],
      createdAt: Date.now(),
    });
  }
  event.target.value = "";
  await refreshNotes();
  if (files.length) showToast(`Добавлено PDF: ${files.length}`);
});

pdfViewerClose.addEventListener("click", () => {
  const url = pdfViewerModal.dataset.url;
  if (url) URL.revokeObjectURL(url);
  pdfViewerFrame.src = "";
  pdfViewerModal.classList.add("hidden");
  pdfViewerModal.dataset.url = "";
});

notesSearch.addEventListener("input", (e) => {
  notesFilterText = e.target.value || "";
  renderNotes(notesCache);
});

notesTagFilter.addEventListener("change", (e) => {
  notesFilterTag = e.target.value || "";
  renderNotes(notesCache);
});

notesEditorClose.addEventListener("click", closeNotesEditor);
notesEditorCancel.addEventListener("click", closeNotesEditor);
notesEditorSave.addEventListener("click", async () => {
  if (!notesEditorCurrentId) return;
  const file = notesCache.find((f) => f.id === notesEditorCurrentId);
  if (!file) return;
  const next = {
    ...file,
    name: (notesEditorName.value || file.name).trim() || file.name,
    tags: normalizeTags(notesEditorTags.value || ""),
  };
  await dbPut(next);
  closeNotesEditor();
  await refreshNotes();
  showToast("Конспект обновлен");
});

notesMiniToggle.addEventListener("click", () => {
  notesMiniPanel.classList.toggle("hidden");
  const isOpen = !notesMiniPanel.classList.contains("hidden");
  localStorage.setItem(MINI_NOTES_OPEN_KEY, isOpen ? "1" : "0");
});

notesMiniClose.addEventListener("click", () => {
  notesMiniPanel.classList.add("hidden");
  localStorage.setItem(MINI_NOTES_OPEN_KEY, "0");
});

function persistMiniNotes() {
  localStorage.setItem(MINI_NOTES_KEY, notesMiniText.value || "");
}

notesMiniText.addEventListener("input", persistMiniNotes);
notesMiniText.addEventListener("change", persistMiniNotes);
notesMiniText.addEventListener("blur", persistMiniNotes);
window.addEventListener("beforeunload", persistMiniNotes);
window.addEventListener("pagehide", persistMiniNotes);

explanationToggleBtn.addEventListener("click", () => {
  isExplanationOpen = !isExplanationOpen;
  explanationText.classList.toggle("visible", isExplanationOpen);
  explanationToggleBtn.textContent = isExplanationOpen ? "Скрыть пояснение" : "Показать пояснение";
});

const savedMiniNotes = localStorage.getItem(MINI_NOTES_KEY);
if (savedMiniNotes !== null) notesMiniText.value = savedMiniNotes;
if (localStorage.getItem(MINI_NOTES_OPEN_KEY) === "1") {
  notesMiniPanel.classList.remove("hidden");
}
