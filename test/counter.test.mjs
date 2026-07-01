import assert from "node:assert/strict";
import test from "node:test";
import { celebrationKind, clampDays, countdownDays, daysFromStartedAt, normalizeDays, plural } from "../app.js";

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
