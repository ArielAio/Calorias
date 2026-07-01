export const QUOTES_PER_DAY = 3;
export const RECENT_QUOTE_DAYS = 30;

// Adicione, remova ou ajuste as frases aqui. Mantenha cada id unico.
export const MOTIVATIONAL_QUOTES = [
  { id: "ritmo-01", text: "Um dia de cada vez. Hoje conta." },
  { id: "ritmo-02", text: "A vontade passa. A conquista fica." },
  { id: "ritmo-03", text: "Você não precisa vencer a semana inteira agora. Vença este momento." },
  { id: "ritmo-04", text: "Cada escolha firme deixa a próxima um pouco mais fácil." },
  { id: "ritmo-05", text: "Você está treinando constância, não perfeição." },
  { id: "ritmo-06", text: "Mais um dia é uma prova silenciosa de força." },
  { id: "ritmo-07", text: "Quando bater a vontade, lembre do motivo." },
  { id: "ritmo-08", text: "Seu compromisso com você também merece respeito." },
  { id: "ritmo-09", text: "A disciplina de hoje protege o resultado de amanhã." },
  { id: "ritmo-10", text: "Você já começou. Agora é só continuar." },
  { id: "ritmo-11", text: "A melhor escolha nem sempre é fácil, mas sempre soma." },
  { id: "ritmo-12", text: "Um não dito agora pode virar muito orgulho depois." },
  { id: "ritmo-13", text: "Não negocie com uma vontade passageira." },
  { id: "ritmo-14", text: "O progresso aparece quando você repete o simples." },
  { id: "ritmo-15", text: "Você está construindo uma versão mais forte de si." },
  { id: "ritmo-16", text: "Hoje também pode entrar para a sua sequência." },
  { id: "ritmo-17", text: "Respire, espere um pouco e escolha com calma." },
  { id: "ritmo-18", text: "A meta é continuar, mesmo em dias comuns." },
  { id: "ritmo-19", text: "Você não precisa provar nada para ninguém, só cumprir com você." },
  { id: "ritmo-20", text: "Pequenas vitórias repetidas mudam o jogo." },
  { id: "ritmo-21", text: "O impulso passa mais rápido do que parece." },
  { id: "ritmo-22", text: "Firme no básico. É assim que o resultado cresce." },
  { id: "ritmo-23", text: "Cada dia sem açúcar reforça sua confiança." },
  { id: "ritmo-24", text: "Você está escolhendo saúde antes do automático." },
  { id: "ritmo-25", text: "Não quebre por impulso o que você vem construindo com cuidado." },
  { id: "ritmo-26", text: "Hoje é mais uma chance de manter o ritmo." },
  { id: "ritmo-27", text: "A consistência não faz barulho, mas transforma." },
  { id: "ritmo-28", text: "O próximo acerto começa na próxima decisão." },
  { id: "ritmo-29", text: "Você consegue atravessar essa vontade sem obedecer a ela." },
  { id: "ritmo-30", text: "Continue pequeno, continue firme, continue." },
  { id: "ritmo-31", text: "O que você evita hoje pode virar energia amanhã." },
  { id: "ritmo-32", text: "Escolha o orgulho de continuar." },
  { id: "ritmo-33", text: "Seu futuro agradece esse cuidado de agora." },
  { id: "ritmo-34", text: "A sequência cresce quando você protege o dia de hoje." },
  { id: "ritmo-35", text: "A melhor recompensa é perceber que você consegue." },
  { id: "ritmo-36", text: "O corpo aprende quando você insiste com gentileza." },
  { id: "ritmo-37", text: "Você não está se privando; está se escolhendo." },
  { id: "ritmo-38", text: "Seguir firme também é uma forma de carinho próprio." },
  { id: "ritmo-39", text: "A decisão mais importante é a próxima." },
  { id: "ritmo-40", text: "Mantenha o combinado só por hoje." },
  { id: "ritmo-41", text: "A vontade não manda quando o motivo é maior." },
  { id: "ritmo-42", text: "Você está ficando bom em não desistir." },
  { id: "ritmo-43", text: "Hoje pode ser simples e ainda assim ser vitória." },
  { id: "ritmo-44", text: "Foque no dia, não na distância." },
  { id: "ritmo-45", text: "Mais uma escolha certa. Mais um pouco de confiança." },
];

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeMotivationState(value) {
  return {
    seed: typeof value?.seed === "string" ? value.seed : "",
    todayKey: typeof value?.todayKey === "string" ? value.todayKey : "",
    todayIds: Array.isArray(value?.todayIds) ? value.todayIds.filter((id) => typeof id === "string") : [],
    seen: value?.seen && typeof value.seen === "object" ? value.seen : {},
  };
}

export function selectDailyQuotes(quotes, savedState = {}, todayKey = localDateKey(), seed = "default") {
  const source = normalizeQuotes(quotes);
  const state = normalizeMotivationState(savedState);
  const validIds = new Set(source.map((quote) => quote.id));
  const todayIds = state.todayIds.filter((id) => validIds.has(id)).slice(0, QUOTES_PER_DAY);

  if (state.todayKey === todayKey && todayIds.length === Math.min(QUOTES_PER_DAY, source.length)) {
    return { ...state, seed: state.seed || seed, todayIds };
  }

  const activeSeed = state.seed || seed;
  const recentIds = new Set(
    Object.entries(state.seen)
      .filter(([id, seenKey]) => validIds.has(id) && daysBetween(seenKey, todayKey) < RECENT_QUOTE_DAYS)
      .map(([id]) => id)
  );
  let pool = source.filter((quote) => !recentIds.has(quote.id));

  if (pool.length < QUOTES_PER_DAY) {
    pool = source.slice().sort((a, b) => (state.seen[a.id] || "").localeCompare(state.seen[b.id] || ""));
  }

  const selectedIds = rankQuotes(pool, todayKey, activeSeed)
    .slice(0, Math.min(QUOTES_PER_DAY, source.length))
    .map((quote) => quote.id);
  const seen = Object.fromEntries(
    Object.entries(state.seen).filter(([id, seenKey]) => validIds.has(id) && daysBetween(seenKey, todayKey) <= RECENT_QUOTE_DAYS)
  );

  for (const id of selectedIds) seen[id] = todayKey;

  return { seed: activeSeed, todayKey, todayIds: selectedIds, seen };
}

export function quotesById(quotes, ids) {
  const source = normalizeQuotes(quotes);
  const byId = new Map(source.map((quote) => [quote.id, quote]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

function normalizeQuotes(quotes) {
  const seen = new Set();
  return quotes.filter((quote) => {
    if (!quote?.id || !quote?.text || seen.has(quote.id)) return false;
    seen.add(quote.id);
    return true;
  });
}

function rankQuotes(quotes, todayKey, seed) {
  return quotes
    .map((quote) => ({ quote, score: hash(`${seed}:${todayKey}:${quote.id}`) }))
    .sort((a, b) => a.score - b.score)
    .map(({ quote }) => quote);
}

function daysBetween(fromKey, toKey) {
  const from = keyToUtcTime(fromKey);
  const to = keyToUtcTime(toKey);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return Number.POSITIVE_INFINITY;
  return Math.floor((to - from) / 86400000);
}

function keyToUtcTime(key) {
  const [year, month, day] = String(key).split("-").map(Number);
  if (!year || !month || !day) return Number.NaN;
  return Date.UTC(year, month - 1, day);
}

function hash(value) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}
