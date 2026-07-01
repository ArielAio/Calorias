const STORAGE_KEY = "contagem-pwa:v1";
const DAY = 24 * 60 * 60 * 1000;
const MAX_DAYS = 9999;
const RESET_DURATION = 650;
const CONFETTI_COLORS = ["#266b55", "#f4b83f", "#fff6db", "#174b3b"];
const GOLD_COLORS = ["#f4b83f", "#ffd76a", "#fff6db", "#9a6512"];

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

export function celebrationKind(days) {
  const value = clampDays(days);
  if (value > 0 && value % 100 === 0) return "century";
  if (value > 0 && value % 50 === 0) return "gold";
  if (value > 0 && value % 10 === 0) return "decade";
  if (value === 5) return "first-milestone";
  return "daily";
}

export function countdownDays(startDays, progress) {
  const start = clampDays(startDays);
  const safeProgress = Math.min(1, Math.max(0, Number(progress) || 0));
  return Math.ceil(start * (1 - safeProgress) ** 3);
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
  const dayBump = document.querySelector("#dayBump");
  const addButton = document.querySelector("#addDayButton");
  const resetButton = document.querySelector("#resetButton");
  const installButton = document.querySelector("#installButton");
  let installPrompt = null;
  let celebrationTimer = null;
  let resetFrame = null;

  const updateText = () => {
    state.days = clampDays(state.days);
    daysInput.dataset.digits = String(String(state.days).length);
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

  const setResetting = (isResetting) => {
    daysInput.disabled = isResetting;
    addButton.disabled = isResetting;
    resetButton.disabled = isResetting;
    daysInput.classList.toggle("is-resetting", isResetting);
  };

  const fireConfetti = (options, delay = 0) => {
    setTimeout(() => globalThis.confetti?.({ disableForReducedMotion: true, ...options }), delay);
  };

  const launchConfetti = (days) => {
    if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const kind = celebrationKind(days);

    if (kind === "century") {
      fireConfetti({ particleCount: 90, spread: 110, startVelocity: 42, scalar: 1.05, ticks: 170, origin: { y: 0.64 }, colors: GOLD_COLORS });
      fireConfetti({ particleCount: 44, angle: 60, spread: 70, startVelocity: 48, origin: { x: 0, y: 0.72 }, colors: CONFETTI_COLORS }, 180);
      fireConfetti({ particleCount: 44, angle: 120, spread: 70, startVelocity: 48, origin: { x: 1, y: 0.72 }, colors: CONFETTI_COLORS }, 180);
      fireConfetti({ particleCount: 36, spread: 360, startVelocity: 28, gravity: 0.6, ticks: 120, shapes: ["star"], colors: GOLD_COLORS }, 360);
      return;
    }

    if (kind === "gold") {
      fireConfetti({ particleCount: 72, spread: 95, startVelocity: 38, scalar: 1, ticks: 140, origin: { y: 0.68 }, shapes: ["star", "circle"], colors: GOLD_COLORS });
      fireConfetti({ particleCount: 24, spread: 360, startVelocity: 24, gravity: 0.7, ticks: 100, shapes: ["star"], colors: GOLD_COLORS }, 180);
      return;
    }

    if (kind === "decade") {
      const variant = Math.floor(days / 10) % 3;
      if (variant === 1) {
        fireConfetti({ particleCount: 34, angle: 60, spread: 62, startVelocity: 38, origin: { x: 0, y: 0.72 }, colors: CONFETTI_COLORS });
        fireConfetti({ particleCount: 34, angle: 120, spread: 62, startVelocity: 38, origin: { x: 1, y: 0.72 }, colors: CONFETTI_COLORS });
        return;
      }

      if (variant === 2) {
        fireConfetti({ particleCount: 46, spread: 360, startVelocity: 28, gravity: 0.75, ticks: 105, shapes: ["star", "circle"], colors: GOLD_COLORS });
        fireConfetti({ particleCount: 18, spread: 70, startVelocity: 36, origin: { y: 0.7 }, colors: CONFETTI_COLORS }, 120);
        return;
      }

      fireConfetti({ particleCount: 1, spread: 120, startVelocity: 0, ticks: 90, gravity: 0.55, scalar: 0.72, origin: { x: 0.2, y: 0 }, colors: CONFETTI_COLORS });
      fireConfetti({ particleCount: 1, spread: 120, startVelocity: 0, ticks: 90, gravity: 0.55, scalar: 0.72, origin: { x: 0.8, y: 0 }, colors: GOLD_COLORS }, 70);
      fireConfetti({ particleCount: 42, spread: 80, startVelocity: 30, origin: { y: 0.72 }, colors: CONFETTI_COLORS }, 140);
      return;
    }

    if (kind === "first-milestone") {
      fireConfetti({ particleCount: 48, spread: 74, startVelocity: 34, scalar: 0.9, ticks: 115, origin: { y: 0.72 }, colors: CONFETTI_COLORS });
      return;
    }

    fireConfetti({ particleCount: 34, spread: 58, startVelocity: 30, scalar: 0.82, ticks: 90, origin: { y: 0.76 }, colors: CONFETTI_COLORS });
  };

  const celebrate = () => {
    clearTimeout(celebrationTimer);
    dayBump.classList.remove("is-visible");
    daysInput.classList.remove("is-celebrating");
    setTimeout(() => {
      launchConfetti(state.days);
      dayBump.classList.add("is-visible");
      daysInput.classList.add("is-celebrating");
      celebrationTimer = setTimeout(() => {
        dayBump.classList.remove("is-visible");
        daysInput.classList.remove("is-celebrating");
      }, 950);
    });
  };

  const finishReset = () => {
    resetFrame = null;
    state.days = 0;
    render();
    setResetting(false);
  };

  const resetWithCountdown = () => {
    const startDays = state.days;
    saveDays(0);
    clearTimeout(celebrationTimer);
    dayBump.classList.remove("is-visible");
    daysInput.classList.remove("is-celebrating");

    if (resetFrame) cancelAnimationFrame(resetFrame);
    if (!startDays || globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      finishReset();
      return;
    }

    setResetting(true);
    const startedAt = performance.now();

    const tick = (now) => {
      state.days = countdownDays(startDays, (now - startedAt) / RESET_DURATION);
      render();

      if (state.days > 0) {
        resetFrame = requestAnimationFrame(tick);
        return;
      }

      finishReset();
    };

    resetFrame = requestAnimationFrame(tick);
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
    if (resetFrame) return;
    state.days += 1;
    persist();
    celebrate();
  });

  resetButton.addEventListener("click", () => {
    resetWithCountdown();
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
