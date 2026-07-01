import assert from "node:assert/strict";
import test from "node:test";
import { celebrationKind, clampDays, countdownDays, daysFromStartedAt, normalizeDays, plural } from "../app.js";
import { localDateKey, quotesById, selectDailyQuotes } from "../motivational-quotes.js";

test("limita dias a um número inteiro válido", () => {
  assert.equal(clampDays("4.8"), 4);
  assert.equal(clampDays("-2"), 0);
  assert.equal(clampDays("x"), 0);
  assert.equal(clampDays(12000), 9999);
});

test("migra estado antigo baseado em data de início", () => {
  const start = Date.UTC(2026, 6, 1, 12, 25);
  const now = start + 3 * 24 * 60 * 60 * 1000;

  assert.equal(daysFromStartedAt(new Date(start).toISOString(), now), 3);
  assert.equal(normalizeDays([{ startedAt: new Date(start).toISOString() }], now), 3);
});

test("usa plural correto em português", () => {
  assert.equal(plural(1, "dia", "dias"), "1 dia");
  assert.equal(plural(2, "dia", "dias"), "2 dias");
});

test("seleciona celebrações progressivas por marco", () => {
  assert.equal(celebrationKind(1), "daily");
  assert.equal(celebrationKind(5), "first-milestone");
  assert.equal(celebrationKind(10), "decade");
  assert.equal(celebrationKind(50), "gold");
  assert.equal(celebrationKind(100), "century");
});

test("calcula contagem regressiva do recomeço", () => {
  assert.equal(countdownDays(100, 0), 100);
  assert.equal(countdownDays(100, 0.5), 13);
  assert.equal(countdownDays(100, 1), 0);
});

test("seleciona tres frases motivacionais por dia", () => {
  const quotes = [
    { id: "a", text: "A" },
    { id: "b", text: "B" },
    { id: "c", text: "C" },
    { id: "d", text: "D" },
  ];

  const state = selectDailyQuotes(quotes, {}, "2026-07-01", "seed");

  assert.equal(state.todayKey, "2026-07-01");
  assert.equal(state.todayIds.length, 3);
  assert.equal(quotesById(quotes, state.todayIds).length, 3);
});

test("mantem as mesmas frases no mesmo dia", () => {
  const quotes = [
    { id: "a", text: "A" },
    { id: "b", text: "B" },
    { id: "c", text: "C" },
    { id: "d", text: "D" },
  ];
  const firstState = selectDailyQuotes(quotes, {}, "2026-07-01", "seed");
  const secondState = selectDailyQuotes(quotes, firstState, "2026-07-01", "other-seed");

  assert.deepEqual(secondState.todayIds, firstState.todayIds);
});

test("evita frases vistas recentemente", () => {
  const quotes = [
    { id: "a", text: "A" },
    { id: "b", text: "B" },
    { id: "c", text: "C" },
    { id: "d", text: "D" },
    { id: "e", text: "E" },
  ];
  const state = selectDailyQuotes(
    quotes,
    { seen: { a: "2026-07-01", b: "2026-07-01" } },
    "2026-07-02",
    "seed"
  );

  assert.equal(state.todayIds.length, 3);
  assert.ok(!state.todayIds.includes("a"));
  assert.ok(!state.todayIds.includes("b"));
});

test("gera chave de data local", () => {
  assert.equal(localDateKey(new Date(2026, 6, 1)), "2026-07-01");
});
