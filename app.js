const STORAGE_KEY = "contagem-pwa:v1";
const DAY = 24 * 60 * 60 * 1000;
const MAX_DAYS = 9999;

export function clampDays(value) {
  const days = Math.trunc(Number(value));
  if (!Number.isFinite(days)) return 0;
  return Math.min(MAX_DAYS, Math.max(0, days));
}

export function daysFromStartedAt(startedAt, now = Date.now()) {
  const start = new Date(startedAt).getTime();
  return Number.isFinite(start) ? clampDays(Math.floor(Math.max(0, now - start) / DAY)) : 0;
}

export function normalizeDays(value, now = Date.now()) {
  if (Array.isArray(value)) return daysFromStartedAt(value[0]?.startedAt, now);
  if (value && typeof value === "object" && "days" in value) return clampDays(value.days);
  return clampDays(value);
}

export function plural(value, singular, pluralLabel) {
  return `${value} ${value === 1 ? singular : pluralLabel}`;
}

function readDays() {
  try {
    return normalizeDays(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return 0;
  }
}

function saveDays(days) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ days: clampDays(days) }));
}

function initApp() {
  const state = { days: readDays() };
  const daysInput = document.querySelector("#daysInput");
  const dayLabel = document.querySelector("#dayLabel");
  const summary = document.querySelector("#summary");
  const addButton = document.querySelector("#addDayButton");
  const resetButton = document.querySelector("#resetButton");
  const installButton = document.querySelector("#installButton");
  let installPrompt = null;

  const updateText = () => {
    state.days = clampDays(state.days);
    dayLabel.textContent = state.days === 1 ? "dia" : "dias";
    summary.textContent = `${plural(state.days, "dia", "dias")} sem consumir açúcar`;
  };

  const render = () => {
    updateText();
    daysInput.value = String(state.days);
  };

  const persist = () => {
    saveDays(state.days);
    render();
  };

  daysInput.addEventListener("input", () => {
    state.days = clampDays(daysInput.value);
    saveDays(state.days);
    updateText();
  });

  daysInput.addEventListener("change", () => {
    state.days = clampDays(daysInput.value);
    persist();
  });

  addButton.addEventListener("click", () => {
    state.days += 1;
    persist();
  });

  resetButton.addEventListener("click", () => {
    state.days = 0;
    persist();
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }

  render();
}

if (typeof document !== "undefined") {
  initApp();
}
