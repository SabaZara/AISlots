import { randomSeed, sha256Hex } from "./fairness.js";
import { SlotAudioEngine } from "./experience-engine.js";
import {
  COLS,
  DEFAULT_GAME_ID,
  GAMES,
  ROWS,
  cellIndex,
  getGame,
  simulateBonusPurchase,
  theoreticalRtp,
  specialBetCostMultiplier,
  simulateSpin
} from "./game-model.js";
import { emptyGameStats, outcomeClassFor, recordGameResult, winTierFor } from "./presentation.js";

const BET_OPTIONS = [1, 2, 5, 10, 20];
const MIN_RESULT_DISPLAY_MS = 2500;
const INITIAL_BALANCE = 1000;
const SPIN_SPEED_STORAGE_KEY = "aislots-spin-speed";
const AUDIO_PREFERENCE_STORAGE_KEY = "aislots-audio-preference";
const SPIN_SPEEDS = Object.freeze([
  Object.freeze({ id: "normal", name: "Normal", label: "1×", resultDisplayMs: MIN_RESULT_DISPLAY_MS, settleScale: 1, shuffleScale: 1, autoplayGapMs: 650 }),
  Object.freeze({ id: "fast", name: "Fast", label: "3×", resultDisplayMs: 780, settleScale: 0.4, shuffleScale: 0.58, autoplayGapMs: 140 })
]);
const SYMBOL_SHEET_INDEX = { luma: 0, orbit: 1, nova: 2, comet: 3, dew: 4, leaf: 5, petal: 6 };

const $ = (id) => document.getElementById(id);
const ui = {
  balance: $("balance"),
  betAmount: $("betAmount"),
  betDown: $("betDown"),
  betUp: $("betUp"),
  spinButton: $("spinButton"),
  lastWin: $("lastWin"),
  lastMultiplier: $("lastMultiplier"),
  reels: $("reels"),
  reelViewport: document.querySelector(".reel-viewport"),
  reelImpactLayer: $("reelImpactLayer"),
  anticipationCallout: $("anticipationCallout"),
  anticipationCopy: $("anticipationCopy"),
  resultStatus: $("resultStatus"),
  winBanner: $("winBanner"),
  winBannerAmount: $("winBannerAmount"),
  winBannerLabel: $("winBannerLabel"),
  winBannerMultiplier: $("winBannerMultiplier"),
  returnChip: $("returnChip"),
  returnAmount: $("returnAmount"),
  returnComparison: $("returnComparison"),
  featureCard: $("featureCard"),
  featureVisual: $("featureVisual"),
  petalMeter: $("petalMeter"),
  petalCountLarge: $("petalCountLarge"),
  meterMessage: $("meterMessage"),
  meterThreshold: $("meterThreshold"),
  fullCommitment: $("fullCommitment"),
  reelCommitment: $("reelCommitment"),
  clientSeedInput: $("clientSeedInput"),
  saveClientSeed: $("saveClientSeed"),
  receiptStatus: $("receiptStatus"),
  receiptServerSeed: $("receiptServerSeed"),
  receiptServerHash: $("receiptServerHash"),
  receiptClientSeed: $("receiptClientSeed"),
  receiptNonce: $("receiptNonce"),
  receiptPetals: $("receiptPetals"),
  receiptOutcome: $("receiptOutcome"),
  verifyButton: $("verifyButton"),
  copyReceiptButton: $("copyReceiptButton"),
  verifyResult: $("verifyResult"),
  lastWinButton: $("lastWinButton"),
  winDetailsContent: $("winDetailsContent"),
  soundButton: $("soundButton"),
  bonusOverlay: $("bonusOverlay"),
  constellationPicks: $("constellationPicks"),
  bonusTotal: $("bonusTotal"),
  bonusTotalLabel: $("bonusTotalLabel"),
  bonusAction: $("bonusAction"),
  bonusEyebrow: $("bonusEyebrow"),
  bonusCopy: $("bonusCopy"),
  bonusMechanicName: $("bonusMechanicName"),
  bonusMechanicProgress: $("bonusMechanicProgress"),
  bonusMechanicBar: $("bonusMechanicBar"),
  autoButton: $("autoButton"),
  spinOptions: $("spinOptions"),
  spinLabel: $("spinLabel"),
  showcaseRow: $("showcaseRow"),
  speedButtons: document.querySelectorAll("[data-spin-speed]"),
  autoplayMenu: $("autoplayMenu"),
  maxBetButton: $("maxBetButton"),
  lobbyOverlay: $("lobbyOverlay"),
  lobbyGames: $("lobbyGames"),
  currentGameWon: $("currentGameWon"),
  currentGameSpins: $("currentGameSpins"),
  currentGameBest: $("currentGameBest"),
  celebrationOverlay: $("celebrationOverlay"),
  celebrationTitle: $("celebrationTitle"),
  celebrationAmount: $("celebrationAmount"),
  celebrationMultiplier: $("celebrationMultiplier"),
  celebrationGame: $("celebrationGame"),
  celebrationKicker: $("celebrationKicker"),
  celebrationCollect: $("celebrationCollect"),
  cinematicOverlay: $("cinematicOverlay"),
  cinematicTitle: $("cinematicTitle"),
  cinematicCopy: $("cinematicCopy"),
  cinematicAward: $("cinematicAward"),
  astralShowcaseButton: $("astralShowcaseButton"),
  specialBetButton: $("specialBetButton"),
  specialBetState: $("specialBetState"),
  buyFeatureButton: $("buyFeatureButton"),
  featureMarketOverlay: $("featureMarketOverlay"),
  closeFeatureMarket: $("closeFeatureMarket"),
  astralBonusStage: $("astralBonusStage"),
  astralLockedMultipliers: $("astralLockedMultipliers"),
  astralMultiplierDial: $("astralMultiplierDial"),
  astralFreeSpinLabel: $("astralFreeSpinLabel"),
  astralCascadeLabel: $("astralCascadeLabel"),
  astralRoundAward: $("astralRoundAward"),
  astralTotalMultiplier: $("astralTotalMultiplier"),
  astralCaseTrack: $("astralCaseTrack"),
  astralCaseMarker: $("astralCaseMarker"),
  astralChoiceProgress: $("astralChoiceProgress"),
  astralChoiceBar: $("astralChoiceBar")
};

const state = {
  balance: INITIAL_BALANCE,
  betIndex: 1,
  gameId: DEFAULT_GAME_ID,
  progress: Object.fromEntries(Object.keys(GAMES).map((gameId) => [gameId, 0])),
  gameStats: Object.fromEntries(Object.keys(GAMES).map((gameId) => [gameId, emptyGameStats()])),
  nonce: 0,
  serverSeed: "",
  serverHash: "",
  clientSeed: `garden-${randomSeed(6)}`,
  isSpinning: false,
  autoActive: false,
  autoRemaining: 0,
  autoStopRequested: false,
  ageConfirmed: false,
  soundEnabled: false,
  soundPreference: null,
  speedIndex: 0,
  specialBetBoost: 0,
  lastOutcome: null,
  lastReceipt: null
};

const audio = new SlotAudioEngine(() => state.gameId);

function currentGame() {
  return getGame(state.gameId);
}

function currentSymbols() {
  return currentGame().symbols;
}

function formatCredits(value) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function currentBaseBet() {
  return BET_OPTIONS[state.betIndex];
}

function currentSpecialBetMultiplier() {
  return state.gameId === "astral" ? specialBetCostMultiplier("astral", state.specialBetBoost) : 1;
}

function currentSpinWager() {
  return currentBaseBet() * currentSpecialBetMultiplier();
}

function updateAstralFeatureUi(controlsLocked = false) {
  const multiplier = specialBetCostMultiplier("astral", state.specialBetBoost);
  const boostLabel = state.specialBetBoost > 0 ? `+${state.specialBetBoost} Bloom${state.specialBetBoost === 1 ? "" : "s"}` : "Standard";
  ui.specialBetState.textContent = `${boostLabel} · ${multiplier.toFixed(2)}×`;
  ui.specialBetButton.classList.toggle("is-active", state.specialBetBoost > 0);
  ui.specialBetButton.setAttribute("aria-pressed", String(state.specialBetBoost > 0));
  ui.specialBetButton.disabled = controlsLocked || state.gameId !== "astral";
  ui.buyFeatureButton.disabled = controlsLocked || state.gameId !== "astral";

  document.querySelectorAll("[data-progress-boost]").forEach((button) => {
    const selected = Number(button.dataset.progressBoost) === state.specialBetBoost;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  document.querySelectorAll("[data-buy-feature]").forEach((button) => {
    const costMultiplier = Number(button.dataset.buyFeature);
    const cost = currentBaseBet() * costMultiplier;
    const price = button.querySelector(`[data-buy-price="${costMultiplier}"]`);
    if (price) price.textContent = `${formatCredits(cost)} CR`;
    button.disabled = controlsLocked || state.balance < cost;
    button.setAttribute("aria-label", `Buy ${costMultiplier} times bet Moonwell bonus for ${formatCredits(cost)} demo credits`);
  });
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function currentSpinSpeed() {
  return SPIN_SPEEDS[state.speedIndex] ?? SPIN_SPEEDS[0];
}

function waitForSpinDelay(milliseconds) {
  return delay(Math.max(0, milliseconds));
}

function saveSpinSpeed() {
  try { window.localStorage.setItem(SPIN_SPEED_STORAGE_KEY, currentSpinSpeed().id); } catch { /* local storage is optional */ }
}

function restoreSpinSpeed() {
  try {
    const stored = window.localStorage.getItem(SPIN_SPEED_STORAGE_KEY);
    const saved = stored === "turbo" || stored === "quick" ? "fast" : stored;
    const savedIndex = SPIN_SPEEDS.findIndex((speed) => speed.id === saved);
    if (savedIndex >= 0) state.speedIndex = savedIndex;
  } catch { /* local storage is optional */ }
}

function selectSpinSpeed(speedId) {
  if (state.isSpinning || state.autoActive) return;
  const selectedIndex = SPIN_SPEEDS.findIndex((speed) => speed.id === speedId);
  if (selectedIndex < 0 || selectedIndex === state.speedIndex) return;
  state.speedIndex = selectedIndex;
  saveSpinSpeed();
  updateUi();
  const speed = currentSpinSpeed();
  setStatus(`${speed.name} reel speed selected`);
  playTone(speed.id === "fast" ? 1120 : 620, .12, "triangle");
}

function jumpText(element) {
  if (!element) return;
  element.classList.remove("is-jumping");
  void element.offsetWidth;
  element.classList.add("is-jumping");
}

function symbolSvg(id) {
  const common = 'viewBox="0 0 100 100" role="img" focusable="false"';
  if (state.gameId === "ufc") {
    const fightSvgs = {
      luma: `<svg ${common} aria-label="Championship Belt symbol"><path d="M4 38c16-7 30-10 46-10s30 3 46 10v24c-16 7-30 10-46 10S20 69 4 62Z" fill="#3b1720" stroke="#f5c45c" stroke-width="4"/><path d="m50 18 21 11 7 21-10 23-18 9-18-9-10-23 7-21Z" fill="#f5c45c"/><path d="m50 28 13 8 4 15-7 14-10 6-10-6-7-14 4-15Z" fill="#fff2ad"/><path d="m50 35 4 10 11 1-8 7 3 11-10-6-10 6 3-11-8-7 11-1Z" fill="#a71f27"/></svg>`,
      orbit: `<svg ${common} aria-label="Octagon symbol"><path d="m31 8 38 0 23 23v38L69 92H31L8 69V31Z" fill="#1b1b22" stroke="#ff5148" stroke-width="7"/><path d="m36 24 28 0 12 12v28L64 76H36L24 64V36Z" fill="none" stroke="#f4d27a" stroke-width="4"/><path d="M24 36h52M24 64h52M36 24v52M64 24v52" stroke="#d5d8de" stroke-width="2" opacity=".5"/></svg>`,
      nova: `<svg ${common} aria-label="Main Event Star symbol"><path d="m50 5 11 29 31 2-24 20 8 31-26-17-26 17 8-31L8 36l31-2Z" fill="#f5f5f2" stroke="#ff493f" stroke-width="4"/><path d="m50 25 7 17 18 1-14 12 4 18-15-10-15 10 4-18-14-12 18-1Z" fill="#f2c35b"/></svg>`,
      comet: `<svg ${common} aria-label="Power Strike symbol"><path d="M15 63c19-3 33-14 45-34l13 9C59 59 42 71 19 76Z" fill="#ff493f" opacity=".45"/><path d="m57 7 29 29-20 7 9 17-38 33 12-36-19-8Z" fill="#f2c35b" stroke="#fff2b5" stroke-width="3"/><path d="m58 27 11 10-15 5 5 10-9 9 4-18-9-3Z" fill="#ff493f"/></svg>`,
      dew: `<svg ${common} aria-label="Round Clock symbol"><circle cx="50" cy="52" r="38" fill="#171a21" stroke="#f4f4f1" stroke-width="6"/><path d="M50 15V7M39 7h22" stroke="#ff493f" stroke-width="6" stroke-linecap="round"/><path d="M50 52V27M50 52l18 11" stroke="#f2c35b" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="52" r="6" fill="#ff493f"/><path d="M20 52h8M72 52h8M50 22v8M50 74v8" stroke="#fff" stroke-width="3"/></svg>`,
      leaf: `<svg ${common} aria-label="Fight Glove symbol"><path d="M30 15c7-7 18-4 21 4 7-7 18-2 18 7 8-4 17 3 14 12 8 0 13 9 8 16L70 82c-8 11-24 14-35 6L20 77c-8-6-10-18-5-27Z" fill="#d92f35" stroke="#ff8a78" stroke-width="4"/><path d="M24 70c17 8 33 7 49-1l-3 13c-8 11-24 14-35 6Z" fill="#f2c35b"/><path d="M29 31c10 5 18 13 23 25M51 19c4 8 5 16 4 25M69 27c1 8-1 14-5 20" fill="none" stroke="#ffb0a3" stroke-width="3" stroke-linecap="round"/></svg>`,
      petal: `<svg ${common} aria-label="Fight Token collection symbol"><path d="m31 6 38 0 25 25v38L69 94H31L6 69V31Z" fill="#f2c35b" stroke="#fff0a8" stroke-width="5"/><path d="m36 22 28 0 14 14v28L64 78H36L22 64V36Z" fill="#9c1f27" stroke="#351115" stroke-width="4"/><path d="m50 29 6 14 16 2-12 10 4 16-14-8-14 8 4-16-12-10 16-2Z" fill="#fff2b5"/></svg>`
    };
    return fightSvgs[id] ?? fightSvgs.leaf;
  }
  const svgs = {
    luma: `<svg ${common} aria-label="Luma symbol" style="color:#ffe6a1"><circle cx="50" cy="50" r="17" fill="currentColor"/><g fill="currentColor" opacity=".88"><path d="M46 5h8l-2 27h-4zM46 95h8l-2-27h-4zM5 46v8l27-2v-4zM95 46v8l-27-2v-4zM18 14l6-5 15 23-4 3zM82 86l-6 5-15-23 4-3zM86 18l5 6-23 15-3-4zM14 82l-5-6 23-15 3 4z"/></g><circle cx="44" cy="43" r="5" fill="#fff8d8" opacity=".9"/><circle cx="50" cy="50" r="27" fill="none" stroke="#ffe8a8" stroke-width="2" opacity=".4"/></svg>`,
    orbit: `<svg ${common} aria-label="Orbit symbol" style="color:#9eeaff"><circle cx="48" cy="50" r="23" fill="currentColor" opacity=".92"/><circle cx="41" cy="42" r="7" fill="#e8fdff" opacity=".75"/><ellipse cx="50" cy="52" rx="43" ry="14" fill="none" stroke="#d7f9ff" stroke-width="5" transform="rotate(-12 50 52)"/><path d="M13 58c14 7 54 9 76-10" fill="none" stroke="#665bd0" stroke-width="3" opacity=".75"/></svg>`,
    nova: `<svg ${common} aria-label="Nova symbol" style="color:#d9b6ff"><path d="m50 4 9 29 27-12-19 25 29 8-30 5 17 26-26-15-7 26-7-26-26 15 17-26-30-5 29-8-19-25 27 12Z" fill="currentColor"/><path d="m50 25 7 18 18 7-18 7-7 18-7-18-18-7 18-7Z" fill="#f8edff"/><circle cx="50" cy="50" r="7" fill="#8771e9"/></svg>`,
    comet: `<svg ${common} aria-label="Comet symbol" style="color:#ff9fd5"><path d="M25 76 65 26l12 12-50 40Z" fill="currentColor" opacity=".35"/><path d="M12 70 61 30l9 9-50 42Z" fill="#8cecff" opacity=".55"/><path d="m70 13 19 19-14 29-30-11-5-29Z" fill="currentColor"/><path d="m70 24 9 9-7 15-15-5-2-14Z" fill="#fff0fa" opacity=".9"/></svg>`,
    dew: `<svg ${common} aria-label="Dewdrop symbol" style="color:#73e4ff"><path d="M50 7C40 25 23 41 23 60a27 27 0 0 0 54 0C77 41 60 25 50 7Z" fill="currentColor"/><path d="M39 36c-8 11-11 19-9 28 2 8 8 13 14 15-5-12-2-25 7-41 3-6-6-8-12-2Z" fill="#ecfdff" opacity=".65"/><path d="M63 57c4 8 1 16-6 21" fill="none" stroke="#315dcc" stroke-width="4" stroke-linecap="round" opacity=".55"/></svg>`,
    leaf: `<svg ${common} aria-label="Moonleaf symbol" style="color:#84efc6"><path d="M48 82C23 79 11 62 15 35c25-4 42 8 45 34-5 6-8 10-12 13Z" fill="currentColor"/><path d="M51 82c2-28 13-46 35-55 5 25-4 43-29 53Z" fill="#70d9de"/><path d="M31 48c11 9 19 20 24 35M72 45C61 56 56 68 53 85" fill="none" stroke="#e2fff8" stroke-width="3" stroke-linecap="round" opacity=".72"/><circle cx="52" cy="84" r="5" fill="#eefeff"/></svg>`,
    petal: `<svg ${common} aria-label="Bloom collection symbol" style="color:#d99cff"><path d="M50 81C22 69 18 42 31 18c12 6 19 16 19 29 0-13 7-23 19-29 13 24 9 51-19 63Z" fill="currentColor"/><path d="M50 81C30 72 24 55 28 38c12 1 19 7 22 18 3-11 10-17 22-18 4 17-2 34-22 43Z" fill="#8be9ff" opacity=".88"/><path d="M50 29v52" stroke="#f7edff" stroke-width="3" stroke-linecap="round" opacity=".78"/><circle cx="50" cy="52" r="7" fill="#fff7ff"/><circle cx="50" cy="52" r="19" fill="none" stroke="#e9ceff" stroke-width="2" opacity=".5"/></svg>`
  };
  return svgs[id] ?? svgs.leaf;
}

function symbolGlow(id) {
  const base = {
    luma: "rgba(255, 222, 132, .55)",
    orbit: "rgba(103, 225, 255, .55)",
    nova: "rgba(197, 137, 255, .58)",
    comet: "rgba(255, 126, 201, .5)",
    dew: "rgba(91, 214, 255, .5)",
    leaf: "rgba(95, 226, 188, .45)",
    petal: "rgba(198, 112, 255, .66)"
  }[id];
  if (state.gameId === "neon") return id === "petal" ? "rgba(82, 242, 255, .72)" : base;
  if (state.gameId === "ember") return id === "petal" ? "rgba(255, 117, 61, .75)" : base;
  if (state.gameId === "ufc") {
    return {
      luma: "rgba(245, 196, 92, .7)", orbit: "rgba(255, 73, 63, .58)", nova: "rgba(255, 255, 245, .62)",
      comet: "rgba(255, 134, 57, .62)", dew: "rgba(225, 239, 255, .5)", leaf: "rgba(255, 73, 63, .58)", petal: "rgba(245, 196, 92, .76)"
    }[id];
  }
  return base;
}

function symbolGraphic(id) {
  const index = SYMBOL_SHEET_INDEX[id];
  const game = currentGame();
  if (game.symbolSheet && Number.isInteger(index)) {
    return `<span class="generated-symbol symbol-sheet-${index}" style="--symbol-sheet:url('${game.symbolSheet}')" aria-hidden="true"></span>`;
  }
  return symbolSvg(id);
}

function renderGrid(grid, {
  shuffling = false,
  settling = false,
  winnerCells = new Set(),
  shufflingColumns = new Set(),
  settlingColumn = -1,
  settledColumns = new Set()
} = {}) {
  const fragment = document.createDocumentFragment();
  const settleScale = currentSpinSpeed().settleScale;
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const index = cellIndex(col, row);
      const id = grid[index];
      const cell = document.createElement("div");
      cell.className = "symbol-cell";
      if (shuffling || shufflingColumns.has(col)) cell.classList.add("is-shuffling");
      if (settling || settlingColumn === col) cell.classList.add("is-settling");
      if (settledColumns.has(col)) cell.classList.add("is-reel-settled");
      if (winnerCells.has(index)) cell.classList.add("is-winner");
      if (id === "petal") cell.classList.add("is-scatter");
      cell.dataset.index = String(index);
      cell.dataset.symbol = id;
      cell.dataset.col = String(col);
      cell.dataset.row = String(row);
      cell.style.gridColumn = String(col + 1);
      cell.style.gridRow = String(row + 1);
      cell.style.setProperty("--delay", `${col * 65 + row * 22}ms`);
      cell.style.setProperty("--col", String(col));
      cell.style.setProperty("--row", String(row));
      cell.style.setProperty("--motion-delay", `${-(col * 48 + row * 24)}ms`);
      const stopDelay = settlingColumn >= 0 ? row * 18 : col * currentGame().reelStopGap + row * 18;
      cell.style.setProperty("--stop-delay", `${Math.round(stopDelay * settleScale)}ms`);
      cell.style.setProperty("--symbol-glow", symbolGlow(id));
      const symbolName = currentSymbols().find((symbol) => symbol.id === id)?.name ?? id;
      cell.setAttribute("aria-label", symbolName);
      cell.innerHTML = `${symbolGraphic(id)}<span class="symbol-name-tag">${symbolName}</span>`;
      fragment.append(cell);
    }
  }
  ui.reels.classList.toggle("has-winners", winnerCells.size > 0);
  ui.reels.replaceChildren(fragment);
}

function renderReelStopFrame(outcomeGrid, reel, shuffleTick) {
  const cosmetic = cosmeticGrid(shuffleTick);
  const frameGrid = outcomeGrid.map((id, index) => Math.floor(index / ROWS) <= reel ? id : cosmetic[index]);
  const shufflingColumns = new Set(Array.from({ length: COLS - reel - 1 }, (_, index) => reel + index + 1));
  const settledColumns = new Set(Array.from({ length: reel }, (_, index) => index));
  renderGrid(frameGrid, { shufflingColumns, settlingColumn: reel, settledColumns });
}

function revealWinningCells(winnerCells) {
  ui.reels.querySelectorAll(".symbol-cell").forEach((cell) => {
    cell.classList.toggle("is-winner", winnerCells.has(Number(cell.dataset.index)));
  });
  ui.reels.classList.toggle("has-winners", winnerCells.size > 0);
}

function initialGrid() {
  const ids = currentSymbols().map((symbol) => symbol.id).reverse();
  return Array.from({ length: COLS * ROWS }, (_, index) => ids[(index * 3 + Math.floor(index / 4)) % ids.length]);
}

function renderPetalMeter() {
  const game = currentGame();
  const progress = state.progress[state.gameId];
  const fill = game.threshold > 0 ? progress / game.threshold * 100 : 0;
  ui.petalCountLarge.textContent = progress;
  ui.featureCard.style.setProperty("--meter-fill", `${fill}%`);
  ui.petalMeter.setAttribute("aria-valuenow", String(progress));
  ui.petalMeter.setAttribute("aria-valuemax", String(game.threshold));
  ui.petalMeter.setAttribute("aria-label", `${game.collectionPlural} collected`);
  Array.from(ui.petalMeter.children).forEach((pip, index) => {
    pip.classList.toggle("is-filled", index < progress);
  });
  const remaining = game.threshold - progress;
  const label = remaining === 1 ? game.collectionName : game.collectionPlural;
  ui.meterMessage.innerHTML = `<strong>${remaining} ${label} to go</strong><span>${game.meterCarryCopy}</span>`;
}

function renderGameStats() {
  const stats = state.gameStats[state.gameId];
  ui.currentGameWon.textContent = `${formatCredits(stats.totalWon)} CR`;
  ui.currentGameSpins.textContent = String(stats.spins);
  ui.currentGameBest.textContent = `${formatCredits(stats.biggestWin)} CR`;
  ui.lastWin.textContent = formatCredits(stats.lastWin);
  ui.lastMultiplier.textContent = stats.lastWin > 0 ? `${stats.lastMultiplier.toFixed(2)}× bet` : "—";
  document.querySelectorAll("[data-game-won]").forEach((item) => {
    item.textContent = formatCredits(state.gameStats[item.dataset.gameWon].totalWon);
  });
  document.querySelectorAll("[data-lobby-won]").forEach((item) => {
    item.textContent = `${formatCredits(state.gameStats[item.dataset.lobbyWon].totalWon)} CR won`;
  });
}

function setStatus(message) {
  ui.resultStatus.lastElementChild.textContent = message;
  jumpText(ui.resultStatus);
}

function updateUi() {
  const bet = currentBaseBet();
  const spinWager = currentSpinWager();
  const speed = currentSpinSpeed();
  ui.balance.textContent = formatCredits(state.balance);
  ui.betAmount.textContent = formatCredits(bet);
  ui.spinButton.setAttribute("aria-label", `${currentGame().actionLabel} spin for ${formatCredits(spinWager)} credits${state.gameId === "astral" && state.specialBetBoost ? ` with ${state.specialBetBoost} bonus meter boost` : ""}`);
  const controlsLocked = state.isSpinning || state.autoActive;
  ui.betDown.disabled = controlsLocked || state.betIndex === 0;
  ui.betUp.disabled = controlsLocked || state.betIndex === BET_OPTIONS.length - 1;
  ui.maxBetButton.disabled = controlsLocked || state.betIndex === BET_OPTIONS.length - 1;
  ui.spinButton.disabled = controlsLocked;
  ui.spinLabel.textContent = currentGame().actionLabel;
  ui.astralShowcaseButton.disabled = controlsLocked || state.gameId !== "astral";
  updateAstralFeatureUi(controlsLocked);
  ui.saveClientSeed.disabled = controlsLocked;
  ui.clientSeedInput.disabled = controlsLocked;
  ui.autoButton.disabled = state.isSpinning && !state.autoActive;
  ui.autoButton.classList.toggle("is-running", state.autoActive);
  ui.autoButton.setAttribute("aria-label", state.autoActive ? `Stop autoplay after the current spin · ${state.autoRemaining} remaining` : "Open autoplay options");
  ui.autoButton.innerHTML = state.autoActive
    ? `<span aria-hidden="true">■</span><strong>${state.autoRemaining}</strong>`
    : `<span aria-hidden="true">↻</span><strong>10 · 25 · 50</strong>`;
  ui.speedButtons.forEach((button) => {
    const selected = button.dataset.spinSpeed === speed.id;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    button.disabled = controlsLocked;
  });
  $("game").dataset.speed = speed.id;
  document.querySelectorAll(".game-choice").forEach((button) => { button.disabled = controlsLocked; });

  renderPetalMeter();
  renderGameStats();
}

function updateCommitmentUi() {
  ui.fullCommitment.textContent = state.serverHash || "Preparing cryptographic seed…";
  ui.reelCommitment.textContent = `${currentGame().shortName} · RTP 99.00%`;
}

async function rotateServerSeed() {
  state.serverSeed = randomSeed(32);
  state.serverHash = await sha256Hex(state.serverSeed);
  updateCommitmentUi();
}

function createPips() {
  const game = currentGame();
  const fragment = document.createDocumentFragment();
  ui.petalMeter.style.setProperty("--meter-columns", String(game.meterColumns));
  for (let index = 0; index < game.threshold; index += 1) {
    const pip = document.createElement("span");
    pip.className = "petal-pip";
    pip.dataset.step = String(index + 1);
    pip.textContent = game.meterMode === "fightcard" ? String(index + 1) : game.meterGlyph;
    pip.setAttribute("aria-hidden", "true");
    fragment.append(pip);
  }
  ui.petalMeter.replaceChildren(fragment);
}

function buildPaytable() {
  const payingSymbols = currentSymbols().filter((symbol) => symbol.id !== "petal");
  const fragment = document.createDocumentFragment();
  payingSymbols.forEach((symbol) => {
    const row = document.createElement("div");
    row.className = "paytable-row";
    row.innerHTML = `${symbolGraphic(symbol.id)}<div><strong>${symbol.name} · ${(symbol.weight / 100).toFixed(1)}% per cell</strong><div class="paytable-values"><span>3× <b>${Number(symbol.payouts[3].toFixed(2))}</b></span><span>4× <b>${symbol.payouts[4]}</b></span><span>5× <b>${symbol.payouts[5]}</b></span></div></div>`;
    fragment.append(row);
  });
  $("paytable").replaceChildren(fragment);
}

function buildRules() {
  const game = currentGame();
  const rtp = theoreticalRtp(game.id);
  $("rulesTitle").textContent = `How ${game.name} works`;
  $("rulesThreshold").textContent = String(game.threshold);
  $("rulesCollectorLabel").textContent = `${game.collectionPlural} to bonus`;
  $("rulesFeatureTitle").textContent = `${game.featureName} bonus`;
  $("rulesFeatureCopy").textContent = `${game.collectionPlural} do not pay on lines. Every ${game.collectionName} anywhere on the grid fills one permanent meter position. At ${game.threshold}, ${game.bonusMechanicCopy} The meter then rolls over.`;
  $("prizeOddsTitle").textContent = `${game.featureName} prize odds`;
  $("prizeOddsCopy").textContent = `${game.bonusDraws} prizes are drawn from this table. Values are multiplied by the total bet and added together.`;

  const prizeFragment = document.createDocumentFragment();
  const totalWeight = game.bonusPrizes.reduce((total, prize) => total + prize.weight, 0);
  game.bonusPrizes.forEach((prize) => {
    const item = document.createElement("span");
    item.innerHTML = `<b>${prize.multiplier}×</b><small>${(prize.weight / totalWeight * 100).toFixed(1).replace(".0", "")}%</small>`;
    prizeFragment.append(item);
  });
  $("bonusPrizeTable").replaceChildren(prizeFragment);

  const baseShare = rtp.baseRtp / rtp.totalRtp * 100;
  $("baseRtpPart").style.setProperty("--part", `${baseShare}%`);
  $("bonusRtpPart").style.setProperty("--part", `${100 - baseShare}%`);
  $("baseRtpValue").textContent = `${(rtp.baseRtp * 100).toFixed(3)}%`;
  $("bonusRtpValue").textContent = `${(rtp.bonusRtp * 100).toFixed(3)}%`;
}

function buildLobby() {
  const fragment = document.createDocumentFragment();
  Object.values(GAMES).forEach((game) => {
    const button = document.createElement("button");
    button.className = `lobby-game lobby-game-${game.id}`;
    button.type = "button";
    button.dataset.lobbyGameId = game.id;
    button.style.setProperty("--lobby-accent", game.accent);
    button.innerHTML = `
      <span class="lobby-game-art" aria-hidden="true"><img class="lobby-game-image" src="${game.background}" alt="" ${game.id === "astral" ? "fetchpriority=\"high\"" : "loading=\"lazy\""}></span>
      <span class="lobby-game-shade" aria-hidden="true"></span>
      <span class="lobby-game-content">
        <span class="lobby-game-kicker">${game.lobbyTag}</span>
        <strong>${game.name}</strong>
        <span class="lobby-game-meta"><b>99%</b><i>${game.bonusDraws}× bonus</i></span>
        <span class="lobby-game-won" data-lobby-won="${game.id}">0.00 CR</span>
        <span class="lobby-game-action"><span>Play</span><b>→</b></span>
      </span>`;
    fragment.append(button);
  });
  ui.lobbyGames.replaceChildren(fragment);
}

function openLobby() {
  if (state.isSpinning || state.autoActive) return;
  ui.lobbyOverlay.hidden = false;
  ui.lobbyOverlay.setAttribute("aria-hidden", "false");
  $("appShell").inert = true;
  document.body.classList.add("is-lobby-open");
  window.requestAnimationFrame(() => ui.lobbyGames.querySelector("button")?.focus());
}

function chooseLobbyGame(gameId) {
  if (!GAMES[gameId]) return;
  enableSoundFromGesture();
  state.ageConfirmed = true;
  try { window.sessionStorage.setItem("lumen-collection-age-confirmed", "true"); } catch { /* storage may be unavailable */ }
  if (gameId !== state.gameId) switchGame(gameId);
  ui.lobbyOverlay.hidden = true;
  ui.lobbyOverlay.setAttribute("aria-hidden", "true");
  $("appShell").inert = false;
  document.body.classList.remove("is-lobby-open");
  ui.spinButton.focus();
}

function applyGameTheme({ resetGrid = false } = {}) {
  const game = currentGame();
  const titleParts = game.name.split(" ");
  const firstWord = titleParts.shift();
  const gameStage = $("game");
  gameStage.dataset.game = game.id;
  const autoplayHome = game.id === "astral" ? ui.showcaseRow : ui.spinOptions;
  if (ui.autoButton.parentElement !== autoplayHome) autoplayHome.append(ui.autoButton);
  ui.autoplayMenu.hidden = true;
  ui.autoButton.setAttribute("aria-expanded", "false");
  ui.featureCard.dataset.game = game.id;
  ui.featureVisual.dataset.meter = game.meterMode;
  ui.reels.dataset.motion = game.reelMotion;
  gameStage.style.setProperty("--game-bg", `url("${game.background}")`);
  gameStage.style.setProperty("--game-characters", `url("${game.characterLayer}")`);
  gameStage.style.setProperty("--bonus-bar-art", `url("${game.bonusBarArt}")`);
  gameStage.style.setProperty("--game-accent", game.accent);
  gameStage.style.setProperty("--game-secondary", game.secondary);
  ui.celebrationOverlay.style.setProperty("--game-accent", game.accent);
  ui.bonusOverlay.style.setProperty("--game-accent", game.accent);
  document.title = `${game.name} · Lumen Collection`;
  $("brandName").textContent = game.name;
  $("brandSubtitle").textContent = game.subtitle;
  $("featureEyebrow").textContent = game.featureEyebrow;
  $("moonwellTitle").textContent = game.featureName;
  $("featureCopy").textContent = game.featureCopy;
  $("meterThreshold").textContent = `/${game.threshold}`;
  $("gameIntro").textContent = game.intro;
  $("gameTitle").innerHTML = `${firstWord} <span>${titleParts.join(" ")}</span>`;
  $("spinLabel").textContent = game.actionLabel;
  ui.winBannerLabel.textContent = `${game.shortName} win`;
  ui.winBanner.dataset.tier = "win";
  ui.bonusOverlay.dataset.game = game.id;
  ui.bonusEyebrow.textContent = `${game.featureName} feature`;
  $("bonusTitle").textContent = game.bonusTitle;
  ui.bonusCopy.textContent = game.bonusCopy;

  const stepFragment = document.createDocumentFragment();
  game.featureSteps.forEach((value, index) => {
    const step = document.createElement("div");
    step.innerHTML = `<span>${value}</span><p>${game.featureStepLabels[index]}</p>`;
    stepFragment.append(step);
  });
  $("featureSteps").replaceChildren(stepFragment);

  document.querySelectorAll(".game-choice").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.gameId === game.id);
    button.setAttribute("aria-current", button.dataset.gameId === game.id ? "true" : "false");
  });
  createPips();
  buildPaytable();
  buildRules();
  updateCommitmentUi();
  if (resetGrid) renderGrid(initialGrid());
}

function switchGame(gameId) {
  if (state.isSpinning || state.autoActive || gameId === state.gameId) return;
  state.gameId = gameId;
  state.lastOutcome = null;
  ui.lastWinButton.disabled = true;
  ui.winBanner.classList.remove("is-visible");
  hideReturnChip();
  audio.stopSpinLoop({ immediate: true });
  setAnticipationUi(false);
  ui.reelViewport.classList.remove("is-spinning", "is-stopping");
  ui.reelImpactLayer.replaceChildren();
  applyGameTheme({ resetGrid: true });
  updateUi();
  setStatus(`${currentGame().name} ready · collect ${currentGame().collectionPlural} to unlock the feature`);
  playGameChangeSound();
}

function cosmeticGrid(tick) {
  const ids = currentSymbols().map((symbol) => symbol.id);
  return Array.from({ length: COLS * ROWS }, (_, index) => ids[(tick + index * 2 + Math.floor(index / ROWS)) % ids.length]);
}

function winningCells(outcome) {
  return new Set(outcome.wins.flatMap((win) => win.cells));
}

function playTone(frequency, duration = 0.12, type = "sine", delaySeconds = 0) {
  audio.tone(frequency, duration, { type, delay: delaySeconds });
}

function playWinChord() {
  audio.lineWin(0, 8);
  window.setTimeout(() => audio.lineWin(1, 14), 90);
}

function playNoise(duration = 0.22, volume = 0.05) {
  audio.noise(duration, { volume });
}

function playSpinSound() {
  audio.spinStart();
}

function playSpinTick(tick) {
  audio.spinTick(tick);
}

function playCollectSound(count = 1) {
  audio.collect(count);
}

function playGameChangeSound() {
  audio.gameChange();
}

function playBonusSting() {
  audio.bonusStart();
}

function playReelStopSound(reelIndex) {
  audio.reelStop(reelIndex, reelIndex === COLS - 1);
}

function playAnticipationSound() {
  audio.anticipation();
}

function playWinTierSound(tierId) {
  audio.bigWin(tierId);
}

function setAnticipationUi(active, copy = currentGame().anticipationCopy) {
  ui.reels.classList.toggle("is-anticipating", active);
  ui.reelViewport.classList.toggle("is-anticipating", active);
  ui.anticipationCallout.hidden = !active;
  ui.anticipationCallout.setAttribute("aria-hidden", String(!active));
  ui.anticipationCopy.textContent = copy;
}

function flashReelStop(reelIndex, { collector = false, final = false } = {}) {
  const impact = document.createElement("span");
  impact.className = `reel-impact${collector ? " is-collector" : ""}${final ? " is-final" : ""}`;
  impact.style.setProperty("--impact-left", `${(reelIndex + .5) / COLS * 100}%`);
  impact.innerHTML = "<i></i><b></b><em></em>";
  ui.reelImpactLayer.append(impact);
  const machine = document.querySelector(".machine");
  machine?.style.setProperty("--impact-direction", reelIndex % 2 ? "-1" : "1");
  machine?.classList.remove("is-reel-impact");
  void machine?.offsetWidth;
  machine?.classList.add("is-reel-impact");
  window.setTimeout(() => impact.remove(), 920);
  window.setTimeout(() => machine?.classList.remove("is-reel-impact"), 260);
}

function sequenceLineWinSounds(outcome, bet) {
  outcome.wins.slice(0, 6).forEach((win, index) => {
    window.setTimeout(() => audio.lineWin(index, win.amount / bet), 220 + index * 240);
  });
}

function burstParticles(count = 18, intensity = 1) {
  const layer = $("fxLayer");
  const colors = [currentGame().accent, currentGame().secondary, "#ffffff", "#f5d899"];
  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = (70 + Math.random() * 170) * intensity;
    particle.className = index % 7 === 0 ? "fx-particle is-coin" : index % 4 === 0 ? "fx-particle is-star" : "fx-particle is-spark";
    particle.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--fall", `${45 + Math.random() * 130}px`);
    particle.style.setProperty("--c", colors[index % colors.length]);
    particle.style.setProperty("--r", `${Math.random() * 320}deg`);
    particle.style.setProperty("--scale", `${.65 + Math.random() * .9}`);
    particle.style.animationDelay = `${Math.random() * 110}ms`;
    particle.style.animationDuration = `${820 + Math.random() * 520}ms`;
    layer.append(particle);
    window.setTimeout(() => particle.remove(), 1650);
  }
}

function animateCreditValue(element, amount, duration = 900, { sound = false, tierId = "nice" } = {}) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || duration <= 0) {
    element.textContent = `${formatCredits(amount)} CR`;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const start = performance.now();
    let lastSoundAt = -100;
    const draw = (now) => {
      const progress = Math.max(0, Math.min(1, (now - start) / duration));
      const eased = 1 - (1 - progress) ** 3;
      element.textContent = `${formatCredits(amount * eased)} CR`;
      if (sound && now - lastSoundAt >= 82) {
        lastSoundAt = now;
        audio.payoutTick(eased, tierId);
      }
      if (progress < 1) window.requestAnimationFrame(draw);
      else resolve();
    };
    window.requestAnimationFrame(draw);
  });
}

function showWinBanner(amount, bet, { outcomeClass = outcomeClassFor(amount, bet), total = false } = {}) {
  const tier = winTierFor(amount, bet);
  ui.winBanner.dataset.tier = tier.id;
  if (outcomeClass === "partial-return") ui.winBannerLabel.textContent = `${currentGame().shortName} payout`;
  else if (outcomeClass === "break-even") ui.winBannerLabel.textContent = `${currentGame().shortName} bet returned`;
  else if (total) ui.winBannerLabel.textContent = `${currentGame().shortName} total win`;
  else ui.winBannerLabel.textContent = tier.id === "nice" ? `Nice ${currentGame().shortName} win` : `${currentGame().shortName} win`;
  ui.winBannerMultiplier.textContent = `${(amount / bet).toFixed(2)}× bet`;
  ui.winBannerAmount.textContent = "0.00 CR";
  ui.winBanner.classList.add("is-visible");
  jumpText(ui.winBannerLabel);
  jumpText(ui.winBannerAmount);
  if (outcomeClass === "net-win") audio.winVoice();
  else audio.payoutTick(1, "win");
  const amountAnimation = animateCreditValue(ui.winBannerAmount, amount, tier.id === "nice" ? 1050 : 720, { sound: true, tierId: tier.id })
    .then(() => jumpText(ui.winBannerAmount));
  window.setTimeout(() => ui.winBanner.classList.remove("is-visible"), tier.id === "nice" ? 2100 : 1650);
  return amountAnimation;
}

function hideReturnChip() {
  ui.returnChip.hidden = true;
  ui.returnChip.setAttribute("aria-hidden", "true");
  ui.returnChip.classList.remove("is-partial", "is-profit");
}

function showReturnChip(amount, wager) {
  if (state.gameId !== "astral" || amount <= 0 || wager <= 0) {
    hideReturnChip();
    return;
  }
  ui.returnAmount.textContent = `${formatCredits(amount)} CR`;
  ui.returnComparison.textContent = `${(amount / wager).toFixed(2)}× · ${formatCredits(amount)} of ${formatCredits(wager)} CR bet`;
  ui.returnChip.classList.toggle("is-partial", amount < wager);
  ui.returnChip.classList.toggle("is-profit", amount > wager);
  ui.returnChip.hidden = false;
  ui.returnChip.setAttribute("aria-hidden", "false");
  jumpText(ui.returnAmount);
}

function showCelebration(amount, bet, { autoAdvance = false } = {}) {
  const tier = winTierFor(amount, bet);
  if (!["big", "mega", "epic"].includes(tier.id)) return Promise.resolve();
  const game = currentGame();
  return new Promise((resolve) => {
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      audio.stopBigWin();
      ui.celebrationOverlay.classList.remove("is-entering", "is-counting", "is-resolved");
      ui.celebrationOverlay.hidden = true;
      ui.celebrationOverlay.setAttribute("aria-hidden", "true");
      $("appShell").inert = false;
      resolve();
    };
    ui.celebrationOverlay.dataset.game = game.id;
    ui.celebrationOverlay.dataset.tier = tier.id;
    ui.celebrationTitle.textContent = game.winLabels[tier.id];
    ui.celebrationKicker.textContent = tier.id === "big" ? "10× bet or more" : tier.id === "mega" ? "25× bet or more" : "50× bet or more";
    ui.celebrationAmount.textContent = "0.00 CR";
    ui.celebrationMultiplier.textContent = `${(amount / bet).toFixed(2)}× bet`;
    ui.celebrationGame.textContent = game.name;
    ui.celebrationCollect.textContent = `Collect ${formatCredits(amount)} CR`;
    ui.celebrationCollect.onclick = close;
    ui.celebrationOverlay.hidden = false;
    ui.celebrationOverlay.setAttribute("aria-hidden", "false");
    ui.celebrationOverlay.classList.add("is-entering");
    $("appShell").inert = true;
    ui.celebrationCollect.focus();
    playWinTierSound(tier.id);
    burstParticles(tier.id === "epic" ? 90 : tier.id === "mega" ? 68 : 50, tier.id === "epic" ? 1.8 : 1.4);
    window.setTimeout(() => {
      ui.celebrationOverlay.classList.remove("is-entering");
      ui.celebrationOverlay.classList.add("is-counting");
    }, 540);
    void animateCreditValue(ui.celebrationAmount, amount, tier.id === "epic" ? 2600 : tier.id === "mega" ? 2100 : 1600, { sound: true, tierId: tier.id }).then(() => {
      if (closed) return;
      ui.celebrationOverlay.classList.remove("is-counting");
      ui.celebrationOverlay.classList.add("is-resolved");
      burstParticles(tier.id === "epic" ? 60 : 36, tier.id === "epic" ? 1.6 : 1.15);
      audio.lineWin(2, amount / bet);
    });
    if (autoAdvance) window.setTimeout(close, tier.id === "epic" ? 3200 : 2600);
  });
}

async function settleOutcome(outcome) {
  const game = currentGame();
  const speed = currentSpinSpeed();
  const reelGap = Math.max(20, Math.round(game.reelStopGap * speed.settleScale));
  const settleTail = Math.max(140, Math.round(620 * speed.settleScale));
  setAnticipationUi(false);
  ui.reelViewport.classList.remove("is-spinning");
  ui.reelViewport.classList.add("is-stopping");
  if (state.gameId === "astral") ui.reels.classList.add("is-cinematic-drop");
  for (let reel = 0; reel < COLS; reel += 1) {
    if (reel > 0) await waitForSpinDelay(reelGap);
    renderReelStopFrame(outcome.grid, reel, reel * 7 + 3);
    const collector = Array.from({ length: ROWS }, (_, row) => outcome.grid[cellIndex(reel, row)]).includes("petal");
    playReelStopSound(reel);
    flashReelStop(reel, { collector, final: reel === COLS - 1 });
  }
  audio.stopSpinLoop();
  await waitForSpinDelay(settleTail);
  revealWinningCells(winningCells(outcome));
  ui.reels.classList.remove("is-cinematic-drop");
  ui.reelViewport.classList.remove("is-stopping");
  updateUi();
  sequenceLineWinSounds(outcome, BET_OPTIONS[state.betIndex]);
}

function receiptOutcomeLabel(outcome) {
  const resultHash = outcome.grid.length ? outcome.grid.map((id) => id[0].toUpperCase()).join("") : "FEATURE BUY";
  return `${resultHash} · ${formatCredits(outcome.totalWin)} CR`;
}

function renderReceipt() {
  const receipt = state.lastReceipt;
  if (!receipt) return;
  ui.receiptServerSeed.textContent = receipt.serverSeed;
  ui.receiptServerHash.textContent = receipt.serverHash;
  ui.receiptClientSeed.textContent = receipt.clientSeed;
  ui.receiptNonce.textContent = String(receipt.nonce);
  ui.receiptPetals.textContent = `${receipt.progressBefore}/${getGame(receipt.gameId).threshold} · ${getGame(receipt.gameId).name}`;
  ui.receiptOutcome.textContent = receiptOutcomeLabel(receipt.outcome);
  ui.receiptStatus.textContent = "Ready to verify";
  ui.receiptStatus.classList.remove("is-valid");
  ui.verifyButton.disabled = false;
  ui.copyReceiptButton.disabled = false;
  ui.verifyResult.className = "verify-result";
  ui.verifyResult.textContent = "Receipt revealed. Recompute the commitment and complete outcome whenever you like.";
}

function stableOutcome(outcome) {
  return JSON.stringify({
    gameId: outcome.gameId,
    grid: outcome.grid,
    wins: outcome.wins,
    collectorCount: outcome.collectorCount,
    scatterCount: outcome.scatterCount,
    progressBoost: outcome.progressBoost,
    progressBefore: outcome.progressBefore,
    progressAfter: outcome.progressAfter,
    petalsBefore: outcome.petalsBefore,
    petalsAfter: outcome.petalsAfter,
    bonusRounds: outcome.bonusRounds,
    baseWin: outcome.baseWin,
    bonusMultiplier: outcome.bonusMultiplier,
    bonusWin: outcome.bonusWin,
    totalWin: outcome.totalWin,
    mode: outcome.mode ?? "spin",
    costMultiplier: outcome.costMultiplier ?? null,
    payoutScale: outcome.payoutScale ?? null,
    purchaseCost: outcome.purchaseCost ?? null
  });
}

async function verifyLastSpin() {
  if (!state.lastReceipt) return;
  ui.verifyButton.disabled = true;
  ui.verifyResult.className = "verify-result";
  ui.verifyResult.textContent = "Replaying SHA-256 stream and game mapping…";
  const receipt = state.lastReceipt;
  const replay = receipt.mode === "feature-buy" ? simulateBonusPurchase(receipt) : simulateSpin(receipt);
  const [hash, replayed] = await Promise.all([
    sha256Hex(receipt.serverSeed),
    replay
  ]);
  const hashMatches = hash === receipt.serverHash;
  const outcomeMatches = stableOutcome(replayed) === stableOutcome(receipt.outcome);
  const valid = hashMatches && outcomeMatches;
  ui.verifyResult.className = `verify-result ${valid ? "is-valid" : "is-invalid"}`;
  ui.verifyResult.textContent = valid
    ? receipt.mode === "feature-buy"
      ? `✓ Verified. The pre-purchase hash matches and all three sealed multiplier prizes replay exactly.`
      : `✓ Verified. The pre-spin hash matches, and all 20 symbols, base-game wins, feature progress, and bonus prizes replay exactly.`
    : `Verification failed. ${hashMatches ? "The commitment matches, but the outcome differs." : "The revealed seed does not match the pre-spin commitment."}`;
  ui.receiptStatus.textContent = valid ? "Cryptographically verified" : "Verification failed";
  ui.receiptStatus.classList.toggle("is-valid", valid);
  ui.verifyButton.disabled = false;
}

async function copyReceipt() {
  if (!state.lastReceipt) return;
  const payload = JSON.stringify(state.lastReceipt, null, 2);
  try {
    await navigator.clipboard.writeText(payload);
    ui.copyReceiptButton.textContent = "Copied";
    window.setTimeout(() => { ui.copyReceiptButton.textContent = "Copy receipt JSON"; }, 1200);
  } catch {
    ui.verifyResult.className = "verify-result is-invalid";
    ui.verifyResult.textContent = "Clipboard access is unavailable in this browser. The complete receipt remains visible in this verifier.";
  }
}

function renderWinDetails() {
  const outcome = state.lastOutcome;
  if (!outcome) return;
  const game = getGame(outcome.gameId);
  const wins = outcome.wins.length
    ? outcome.wins.map((win, index) => `<div class="win-line-item"><span>Payout ${index + 1} · <b>${win.count}× ${win.symbolName}</b></span><strong>${formatCredits(win.amount)} CR</strong></div>`).join("")
    : `<div class="win-line-item"><span>No base-game payout</span><strong>0.00 CR</strong></div>`;
  const bonus = outcome.bonusWin > 0
    ? `<div class="win-line-item"><span>${game.featureName} · <b>${outcome.bonusMultiplier}× total bet</b></span><strong>${formatCredits(outcome.bonusWin)} CR</strong></div>`
    : "";
  ui.winDetailsContent.innerHTML = `<div class="win-summary"><div><span>${game.name} total</span><strong>${formatCredits(outcome.totalWin)} CR</strong></div><div><span>${game.collectionPlural} landed</span><strong>${outcome.collectorCount}</strong></div></div><div class="win-line-list">${wins}${bonus}</div>`;
}

function cinematicDelay(milliseconds) {
  return delay(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? Math.min(80, milliseconds) : milliseconds);
}

async function runAstralCinematicTransition({ preview = false, multiplierCount = 3 } = {}) {
  ui.cinematicOverlay.dataset.phase = "sleeping";
  ui.cinematicTitle.textContent = preview ? "Demo" : "Awaken";
  ui.cinematicCopy.textContent = preview ? "No wager" : "Case vault opening";
  ui.cinematicAward.textContent = `${multiplierCount} CASES`;
  ui.cinematicOverlay.hidden = false;
  ui.cinematicOverlay.setAttribute("aria-hidden", "false");
  $("appShell").inert = true;
  audio.bonusStart();
  await cinematicDelay(120);
  ui.cinematicOverlay.dataset.phase = "emerging";
  await cinematicDelay(1050);
  ui.cinematicOverlay.dataset.phase = "awakened";
  ui.cinematicTitle.textContent = "Case Vault";
  ui.cinematicCopy.textContent = preview ? "No payout" : "Sealed multiplier rolls";
  ui.cinematicAward.textContent = `${multiplierCount} CASES`;
  jumpText(ui.cinematicTitle);
  jumpText(ui.cinematicAward);
  burstParticles(70, 1.65);
  audio.winTier("big");
  await cinematicDelay(1450);
  ui.cinematicOverlay.dataset.phase = "departing";
  await cinematicDelay(520);
  ui.cinematicOverlay.hidden = true;
  ui.cinematicOverlay.setAttribute("aria-hidden", "true");
  $("appShell").inert = false;
}

function formatMultiplier(value) {
  return `${Number(value).toFixed(2)}×`;
}

const ASTRAL_CASE_VALUES = Object.freeze([0.25, 0.5, 1, 2, 3, 5, 10]);

function astralCaseRarity(multiplier) {
  if (multiplier >= 10) return "jackpot";
  if (multiplier >= 5) return "legendary";
  if (multiplier >= 2) return "epic";
  if (multiplier >= 1) return "rare";
  return "common";
}

function setAstralCaseItemValue(item, multiplier, { target = false } = {}) {
  const rarity = astralCaseRarity(multiplier);
  item.className = `astral-case-item rarity-${rarity}${target ? " is-target" : ""}`;
  item.dataset.multiplier = String(multiplier);
  item.innerHTML = `<img src="./assets/${multiplier >= 5 ? "astral-case-capsule-legendary-v1.png" : "astral-case-capsule-blue-v1.png"}" alt=""><strong>${formatMultiplier(multiplier)}</strong><small>${rarity}</small>`;
}

function buildAstralCaseTrack(roundIndex) {
  const itemCount = 72;
  const fragment = document.createDocumentFragment();
  const items = [];
  for (let index = 0; index < itemCount; index += 1) {
    const cosmeticValue = ASTRAL_CASE_VALUES[(index * 3 + roundIndex * 2 + Math.floor(index / 5)) % ASTRAL_CASE_VALUES.length];
    const item = document.createElement("span");
    setAstralCaseItemValue(item, cosmeticValue);
    items.push(item);
    fragment.append(item);
  }
  ui.astralCaseTrack.replaceChildren(fragment);
  return items;
}

function astralCaseStopProfile(multiplier) {
  if (multiplier >= 10) return { duration: 1550, minimumSteps: 12 };
  if (multiplier >= 5) return { duration: 1250, minimumSteps: 10 };
  if (multiplier >= 2) return { duration: 980, minimumSteps: 8 };
  if (multiplier >= 1) return { duration: 760, minimumSteps: 6 };
  return { duration: 620, minimumSteps: 5 };
}

function astralBrakeProgress(time, initialVelocityRatio) {
  const t = Math.max(0, Math.min(1, time));
  const velocity = Math.max(.2, Math.min(2.6, initialVelocityRatio));
  return (-2 + velocity) * t ** 3 + (3 - 2 * velocity) * t ** 2 + velocity * t;
}

function animateAstralCaseBrake(track, { from, to, duration, rollSpeed, reducedMotion }) {
  track.style.transform = `translate3d(${from}px,0,0)`;
  if (reducedMotion) {
    track.style.transform = `translate3d(${to}px,0,0)`;
    return delay(duration);
  }
  const distance = to - from;
  const velocityRatio = Math.abs(distance) > 0 ? rollSpeed * duration / 1000 / Math.abs(distance) : 1;
  track.dataset.brakeVelocityRatio = velocityRatio.toFixed(3);
  return new Promise((resolve) => {
    let startedAt = null;
    let drewFirstFrame = false;
    const draw = (now) => {
      if (startedAt === null) startedAt = now;
      const time = Math.min(1, (now - startedAt) / duration);
      const progress = astralBrakeProgress(time, velocityRatio);
      const position = from + distance * progress;
      track.style.transform = `translate3d(${position}px,0,0)`;
      track.dataset.brakeProgress = time.toFixed(3);
      if (!drewFirstFrame) {
        drewFirstFrame = true;
        track.dataset.firstBrakePosition = position.toFixed(3);
        track.dataset.firstBrakeElapsed = (now - startedAt).toFixed(3);
      }
      if (time < 1) {
        window.requestAnimationFrame(draw);
      } else {
        resolve();
      }
    };
    window.requestAnimationFrame(draw);
  });
}

function beginAstralCaseRoll(roundIndex, multiplier, bet, multiplierTotal, totalRounds) {
  const items = buildAstralCaseTrack(roundIndex);
  const track = ui.astralCaseTrack;
  const firstItem = track.firstElementChild;
  const itemWidth = firstItem?.getBoundingClientRect().width || 120;
  const trackStyles = window.getComputedStyle(track);
  const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap) || 10;
  const step = itemWidth + gap;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rollSpeed = reducedMotion ? 2600 : 1480 + roundIndex * 90;
  let offset = 0;
  let lastFrame = performance.now();
  let lastTickOffset = 0;
  let frame = 0;
  let stopRequested = false;
  let resolveFinished;
  const finished = new Promise((resolve) => { resolveFinished = resolve; });

  ui.astralMultiplierDial.classList.remove("is-decelerating", "is-locked");
  ui.astralMultiplierDial.classList.add("is-rolling");
  ui.astralCaseMarker.classList.remove("is-locked");
  ui.astralFreeSpinLabel.textContent = `Case ${roundIndex + 1} / ${totalRounds}`;
  ui.astralCascadeLabel.textContent = "Rolling";
  ui.astralRoundAward.textContent = "?×";
  ui.astralChoiceProgress.textContent = `Case ${roundIndex + 1} of ${totalRounds} · press stop`;
  track.style.transform = "translate3d(0,0,0)";

  const roll = (now) => {
    const elapsed = Math.min(40, now - lastFrame);
    lastFrame = now;
    offset -= rollSpeed * elapsed / 1000;
    track.style.transform = `translate3d(${offset}px,0,0)`;
    if (Math.abs(offset - lastTickOffset) >= step) {
      lastTickOffset = offset;
      playTone(980 + Math.abs(Math.round(offset / step)) % 5 * 115, .045, "triangle");
    }
    frame = window.requestAnimationFrame(roll);
  };
  frame = window.requestAnimationFrame(roll);

  let automaticStop = 0;
  const stop = async () => {
    if (stopRequested) return finished;
    stopRequested = true;
    window.clearTimeout(automaticStop);
    window.cancelAnimationFrame(frame);
    ui.bonusAction.disabled = true;
    ui.astralCascadeLabel.textContent = "Slowing";
    ui.astralMultiplierDial.classList.remove("is-rolling");
    ui.astralMultiplierDial.classList.add("is-decelerating");
    const profile = astralCaseStopProfile(multiplier);
    const duration = reducedMotion ? 80 : profile.duration;
    const markerIndex = Math.max(0, Math.ceil((-offset - itemWidth / 2) / step));
    const naturalTravel = rollSpeed * duration / 1000 / 1.5;
    const stepsAhead = Math.max(profile.minimumSteps, Math.round(naturalTravel / step));
    const landingIndex = Math.min(items.length - 3, markerIndex + stepsAhead);
    const target = items[landingIndex];
    setAstralCaseItemValue(target, multiplier, { target: true });
    const finalOffset = -(landingIndex * step + itemWidth / 2);
    track.dataset.stopFrom = offset.toFixed(3);
    track.dataset.stopTo = finalOffset.toFixed(3);
    track.dataset.stopDuration = String(duration);
    track.dataset.landingIndex = String(landingIndex);
    let stopTick = 0;
    const stopTicks = window.setInterval(() => {
      playTone(720 + stopTick % 4 * 110, .055, "triangle");
      stopTick += 1;
    }, reducedMotion ? 40 : Math.max(76, Math.round(duration / (stepsAhead + 2))));
    await animateAstralCaseBrake(track, { from: offset, to: finalOffset, duration, rollSpeed, reducedMotion });
    window.clearInterval(stopTicks);
    track.style.transform = `translate3d(${finalOffset}px,0,0)`;
    ui.astralMultiplierDial.classList.remove("is-decelerating");
    ui.astralMultiplierDial.classList.add("is-locked");
    ui.astralCaseMarker.classList.add("is-locked");
    target?.classList.add("is-winning");
    ui.astralCascadeLabel.textContent = "Locked";
    ui.astralRoundAward.textContent = formatMultiplier(multiplier);
    ui.astralChoiceProgress.textContent = `Case ${roundIndex + 1} of ${totalRounds} · locked`;
    ui.astralChoiceBar.style.width = `${(roundIndex + 1) / totalRounds * 100}%`;
    const lock = ui.astralLockedMultipliers.children[roundIndex];
    if (lock) {
      lock.textContent = formatMultiplier(multiplier);
      lock.classList.add("is-locked", `rarity-${astralCaseRarity(multiplier)}`);
    }
    ui.astralTotalMultiplier.textContent = formatMultiplier(multiplierTotal);
    jumpText(ui.astralRoundAward);
    jumpText(ui.astralTotalMultiplier);
    audio.bonusReveal(roundIndex, multiplier);
    burstParticles(multiplier >= 5 ? 58 : 32, multiplier >= 5 ? 1.42 : .9);
    ui.bonusMechanicProgress.textContent = `${roundIndex + 1} / ${totalRounds}`;
    ui.bonusMechanicBar.style.width = `${(roundIndex + 1) / totalRounds * 100}%`;
    await animateCreditValue(ui.bonusTotal, multiplierTotal * bet, 620, { sound: true, tierId: multiplier >= 5 ? "big" : "nice" });
    await cinematicDelay(420);
    resolveFinished();
    return finished;
  };
  automaticStop = window.setTimeout(() => void stop(), reducedMotion ? 180 : 2400);
  return { finished, stop };
}

async function showAstralBonus(bonusRounds, bet, { autoAdvance = false, preview = false, purchased = false } = {}) {
  const picks = bonusRounds.flat();
  await runAstralCinematicTransition({ preview, multiplierCount: picks.length });
  return new Promise((resolve) => {
    ui.bonusOverlay.dataset.mode = "astral-case-roll";
    ui.bonusEyebrow.textContent = preview ? "Demo" : purchased ? "Feature buy" : "Bonus";
    $("bonusTitle").textContent = "Case Vault";
    ui.bonusCopy.textContent = preview ? "No wager · no payout" : `${picks.length} sealed multiplier cases`;
    ui.bonusTotalLabel.textContent = preview ? "Demo" : "Win";
    ui.bonusTotal.textContent = "0.00 CR";
    ui.bonusMechanicName.textContent = "Celestial Case Roll";
    ui.bonusMechanicProgress.textContent = `0 / ${picks.length}`;
    ui.bonusMechanicBar.style.width = "0%";
    ui.astralBonusStage.hidden = false;
    ui.astralLockedMultipliers.replaceChildren(...picks.map(() => {
      const lock = document.createElement("span");
      lock.textContent = "—";
      return lock;
    }));
    ui.astralRoundAward.textContent = "0.00×";
    ui.astralTotalMultiplier.textContent = "0.00×";
    ui.astralCascadeLabel.textContent = "Ready";
    ui.astralMultiplierDial.classList.remove("is-rolling", "is-decelerating", "is-locked");
    ui.astralCaseMarker.classList.remove("is-locked");
    ui.astralCaseTrack.replaceChildren();
    ui.astralChoiceProgress.textContent = `Case 1 of ${picks.length}`;
    ui.astralChoiceBar.style.width = "0%";
    ui.constellationPicks.hidden = true;
    ui.constellationPicks.replaceChildren();
    ui.bonusAction.textContent = preview ? "Open demo case" : `Open case 1 / ${picks.length}`;
    ui.bonusAction.disabled = false;
    ui.bonusOverlay.hidden = false;
    ui.bonusOverlay.setAttribute("aria-hidden", "false");
    ui.bonusOverlay.classList.remove("is-playing", "is-resolved");
    ui.bonusOverlay.classList.add("is-entering");
    $("appShell").inert = true;
    ui.bonusAction.focus();
    let completed = false;
    let animating = false;
    let roundIndex = 0;
    let multiplierTotal = 0;
    let activeRound = null;

    const close = () => {
      ui.bonusOverlay.classList.remove("is-entering", "is-playing", "is-resolved");
      ui.bonusOverlay.hidden = true;
      ui.bonusOverlay.setAttribute("aria-hidden", "true");
      ui.astralBonusStage.hidden = true;
      ui.constellationPicks.hidden = false;
      ui.bonusAction.classList.remove("is-stop");
      $("appShell").inert = false;
      resolve();
    };

    ui.bonusAction.onclick = async () => {
      if (completed) {
        close();
        return;
      }
      if (animating && activeRound) {
        await activeRound.stop();
        return;
      }
      if (animating) return;
      animating = true;
      ui.bonusOverlay.classList.remove("is-entering");
      ui.bonusOverlay.classList.add("is-playing");
      ui.bonusAction.textContent = "STOP";
      ui.bonusAction.classList.add("is-stop");
      ui.bonusAction.disabled = false;
      const nextTotal = multiplierTotal + picks[roundIndex];
      activeRound = beginAstralCaseRoll(roundIndex, picks[roundIndex], bet, nextTotal, picks.length);
      await activeRound.finished;
      activeRound = null;
      multiplierTotal = nextTotal;
      roundIndex += 1;
      animating = false;
      ui.bonusAction.classList.remove("is-stop");
      if (roundIndex < picks.length) {
        ui.bonusOverlay.classList.remove("is-playing");
        ui.astralFreeSpinLabel.textContent = `Case ${roundIndex + 1} / ${picks.length}`;
        ui.astralCascadeLabel.textContent = "Ready";
        ui.astralChoiceProgress.textContent = `Case ${roundIndex + 1} of ${picks.length}`;
        ui.bonusAction.textContent = `Open case ${roundIndex + 1} / ${picks.length}`;
        ui.bonusAction.disabled = false;
        ui.bonusAction.focus();
        return;
      }
      completed = true;
      ui.bonusOverlay.classList.remove("is-playing");
      ui.bonusOverlay.classList.add("is-resolved");
      ui.astralCascadeLabel.textContent = preview ? "Done" : "Complete";
      ui.astralChoiceProgress.textContent = `${picks.length} cases locked`;
      ui.astralChoiceBar.style.width = "100%";
      jumpText(ui.astralCascadeLabel);
      playWinChord();
      burstParticles(54, 1.45);
      ui.bonusAction.textContent = preview ? "Close" : `Collect ${formatCredits(multiplierTotal * bet)} CR`;
      ui.bonusAction.disabled = false;
      ui.bonusAction.focus();
    };

    if (autoAdvance) {
      void (async () => {
        await cinematicDelay(650);
        while (!completed) {
          ui.bonusAction.click();
          await cinematicDelay(820);
          if (activeRound) await activeRound.stop();
          while (animating) await cinematicDelay(40);
          await cinematicDelay(260);
        }
        await cinematicDelay(900);
        ui.bonusAction.click();
      })();
    }
  });
}

function showCardBonus(bonusRounds, bet, { autoAdvance = false } = {}) {
  return new Promise((resolve) => {
    const game = currentGame();
    const picks = bonusRounds.flat();
    ui.bonusOverlay.dataset.mode = game.bonusMode;
    ui.astralBonusStage.hidden = true;
    ui.constellationPicks.hidden = false;
    ui.bonusTotalLabel.textContent = "Bonus win";
    ui.constellationPicks.replaceChildren();
    ui.bonusTotal.textContent = "0.00 CR";
    ui.bonusMechanicName.textContent = game.bonusMechanicName;
    ui.bonusMechanicProgress.textContent = `0 / ${picks.length}`;
    ui.bonusMechanicBar.style.width = "0%";
    ui.bonusAction.textContent = game.bonusStartLabel;
    ui.bonusAction.disabled = false;

    picks.forEach((multiplier, index) => {
      const card = document.createElement("div");
      card.className = "constellation-pick";
      card.innerHTML = `<small>${game.bonusCardLabel} ${index + 1}</small><span>${multiplier}×</span>`;
      ui.constellationPicks.append(card);
    });

    ui.bonusOverlay.hidden = false;
    ui.bonusOverlay.setAttribute("aria-hidden", "false");
    ui.bonusOverlay.classList.remove("is-playing", "is-resolved");
    ui.bonusOverlay.classList.add("is-entering");
    $("appShell").inert = true;
    ui.bonusAction.focus();
    playBonusSting();
    burstParticles(28, 1.15);
    let revealed = false;

    ui.bonusAction.onclick = async () => {
      if (revealed) {
        ui.bonusOverlay.classList.remove("is-entering", "is-playing", "is-resolved");
        ui.bonusOverlay.hidden = true;
        ui.bonusOverlay.setAttribute("aria-hidden", "true");
        $("appShell").inert = false;
        resolve();
        return;
      }

      revealed = true;
      ui.bonusOverlay.classList.remove("is-entering");
      ui.bonusOverlay.classList.add("is-playing");
      ui.bonusAction.disabled = true;
      let multiplierTotal = 0;
      const cards = Array.from(ui.constellationPicks.children);
      for (let index = 0; index < cards.length; index += 1) {
        await delay(index === 0 ? 160 : 430);
        multiplierTotal += picks[index];
        cards[index].classList.add("is-revealed");
        const bonusScene = ui.bonusOverlay.querySelector(".bonus-scene");
        bonusScene.classList.remove("is-bonus-impact");
        void bonusScene.offsetWidth;
        bonusScene.classList.add("is-bonus-impact");
        ui.bonusMechanicProgress.textContent = `${index + 1} / ${picks.length} · ${game.bonusProgressLabel}`;
        ui.bonusMechanicBar.style.width = `${(index + 1) / picks.length * 100}%`;
        void animateCreditValue(ui.bonusTotal, multiplierTotal * bet, 320);
        audio.bonusReveal(index, picks[index]);
        burstParticles(12, .68);
      }
      await delay(300);
      playWinChord();
      ui.bonusOverlay.classList.remove("is-playing");
      ui.bonusOverlay.classList.add("is-resolved");
      burstParticles(34, 1.15);
      ui.bonusAction.textContent = `Collect ${formatCredits(multiplierTotal * bet)} CR`;
      ui.bonusAction.disabled = false;
      ui.bonusAction.focus();
    };

    if (autoAdvance) {
      void (async () => {
        await delay(700);
        await ui.bonusAction.onclick();
        await delay(600);
        await ui.bonusAction.onclick();
      })();
    }
  });
}

function showBonus(bonusRounds, bet, options = {}) {
  return state.gameId === "astral"
    ? showAstralBonus(bonusRounds, bet, options)
    : showCardBonus(bonusRounds, bet, options);
}

function openFeatureMarket(panel = "special") {
  if (state.gameId !== "astral" || state.isSpinning || state.autoActive || !state.ageConfirmed || !ui.lobbyOverlay.hidden) return;
  updateAstralFeatureUi(false);
  ui.featureMarketOverlay.dataset.panel = panel;
  ui.featureMarketOverlay.hidden = false;
  ui.featureMarketOverlay.setAttribute("aria-hidden", "false");
  $("appShell").inert = true;
  document.body.classList.add("is-feature-market-open");
  playTone(panel === "buy" ? 392 : 523.25, .18, "triangle");
  const focusTarget = panel === "buy"
    ? ui.featureMarketOverlay.querySelector("[data-buy-feature]")
    : ui.featureMarketOverlay.querySelector(`[data-progress-boost="${state.specialBetBoost}"]`);
  window.requestAnimationFrame(() => focusTarget?.focus());
}

function closeFeatureMarket({ returnFocus = true } = {}) {
  const returnTarget = ui.featureMarketOverlay.dataset.panel === "buy" ? ui.buyFeatureButton : ui.specialBetButton;
  ui.featureMarketOverlay.hidden = true;
  ui.featureMarketOverlay.setAttribute("aria-hidden", "true");
  $("appShell").inert = false;
  document.body.classList.remove("is-feature-market-open");
  if (returnFocus) returnTarget.focus();
}

async function buyAstralFeature(costMultiplier) {
  if (state.gameId !== "astral" || state.isSpinning || state.autoActive) return;
  const bet = currentBaseBet();
  const purchaseCost = bet * costMultiplier;
  if (state.balance < purchaseCost) return;

  const serverSeed = state.serverSeed;
  const serverHash = state.serverHash;
  const clientSeed = state.clientSeed;
  const nonce = state.nonce;
  const progressBefore = state.progress.astral;
  closeFeatureMarket({ returnFocus: false });
  state.isSpinning = true;
  hideReturnChip();
  state.balance -= purchaseCost;
  updateUi();

  const outcome = await simulateBonusPurchase({
    serverSeed,
    clientSeed,
    nonce,
    bet,
    costMultiplier,
    progressBefore,
    gameId: "astral"
  });
  state.lastOutcome = outcome;
  await showAstralBonus(outcome.bonusRounds, bet, { purchased: true });
  state.balance += outcome.totalWin;
  state.gameStats.astral = recordGameResult(state.gameStats.astral, outcome.totalWin, purchaseCost);
  updateUi();
  showReturnChip(outcome.totalWin, purchaseCost);

  const outcomeClass = outcomeClassFor(outcome.totalWin, purchaseCost);
  if (outcome.totalWin > 0) await showWinBanner(outcome.totalWin, purchaseCost, { outcomeClass, total: true });
  await showCelebration(outcome.totalWin, purchaseCost);

  state.lastReceipt = {
    mode: "feature-buy",
    serverSeed,
    serverHash,
    clientSeed,
    nonce,
    bet,
    wager: purchaseCost,
    costMultiplier,
    gameId: "astral",
    progressBefore,
    outcome
  };
  state.nonce += 1;
  ui.lastWinButton.disabled = false;
  renderReceipt();
  await rotateServerSeed();
  state.isSpinning = false;
  updateUi();
  setStatus(`${costMultiplier}× feature · ${formatMultiplier(outcome.bonusMultiplier)} · ${formatCredits(outcome.totalWin)} CR returned`);
  ui.buyFeatureButton.focus();
}

async function runAstralShowcasePreview() {
  if (state.gameId !== "astral" || state.isSpinning || state.autoActive || !state.ageConfirmed || !ui.lobbyOverlay.hidden) return;
  state.isSpinning = true;
  ui.astralShowcaseButton.disabled = true;
  updateUi();
  setStatus("Moonwell bonus demo · no wager · no payout");
  try {
    await showAstralBonus([[0.5, 1, 3]], 1, { preview: true });
    setStatus("Moonwell bonus demo complete · no credits or feature progress changed");
  } finally {
    state.isSpinning = false;
    ui.astralShowcaseButton.disabled = false;
    updateUi();
    ui.astralShowcaseButton.focus();
  }
}

async function spin({ fromAuto = false } = {}) {
  if (state.isSpinning || (state.autoActive && !fromAuto)) return false;
  const game = currentGame();
  const bet = currentBaseBet();
  const wager = currentSpinWager();
  if (state.balance < wager) {
    setStatus("Not enough demo credits. Reset the free-play balance below.");
    playTone(170, .2, "square");
    state.autoStopRequested = true;
    return false;
  }

  state.isSpinning = true;
  state.balance -= wager;
  updateUi();
  ui.spinButton.classList.add("is-spinning");
  setAnticipationUi(false);
  ui.reelViewport.classList.remove("is-stopping");
  ui.reelViewport.classList.add("is-spinning");
  ui.winBanner.classList.remove("is-visible");
  hideReturnChip();
  ui.lastWinButton.disabled = true;
  setStatus(`${game.name} is aligning…`);
  playSpinSound();

  const startedAt = performance.now();
  const spinServerSeed = state.serverSeed;
  const spinServerHash = state.serverHash;
  const spinClientSeed = state.clientSeed;
  const spinNonce = state.nonce;
  const progressBefore = state.progress[state.gameId];
  const outcomePromise = simulateSpin({
    serverSeed: spinServerSeed,
    clientSeed: spinClientSeed,
    nonce: spinNonce,
    bet,
    progressBefore,
    progressBoost: state.gameId === "astral" ? state.specialBetBoost : 0,
    gameId: state.gameId
  });

  let shuffleTick = 0;
  renderGrid(cosmeticGrid(shuffleTick), { shuffling: true });
  const shuffleTimer = window.setInterval(() => {
    shuffleTick += 1;
    renderGrid(cosmeticGrid(shuffleTick), { shuffling: true });
    playSpinTick(shuffleTick);
  }, Math.max(45, Math.round(game.spinInterval * currentSpinSpeed().shuffleScale)));

  const outcome = await outcomePromise;
  const resultDisplayMs = currentSpinSpeed().resultDisplayMs;
  const remainingDelay = Math.max(0, resultDisplayMs - (performance.now() - startedAt));
  const anticipation = outcome.bonusRounds.length > 0;
  if (anticipation && remainingDelay > 760) {
    await waitForSpinDelay(remainingDelay - 760);
    setAnticipationUi(true, game.anticipationCopy);
    setStatus(game.anticipationCopy);
    playAnticipationSound();
    await waitForSpinDelay(760);
  } else {
    await waitForSpinDelay(remainingDelay);
  }
  window.clearInterval(shuffleTimer);

  await settleOutcome(outcome);
  state.progress[state.gameId] = outcome.progressAfter;
  state.lastOutcome = outcome;
  state.balance += outcome.baseWin;
  updateUi();
  const baseOutcomeClass = outcomeClassFor(outcome.baseWin, wager);

  if (outcome.collectorCount > 0 || outcome.progressBoost > 0) {
    const collectorLabel = outcome.collectorCount === 1 ? game.collectionName : game.collectionPlural;
    const boostCopy = outcome.progressBoost > 0 ? ` + ${outcome.progressBoost} special` : "";
    setStatus(`${outcome.collectorCount} ${collectorLabel}${boostCopy} · ${state.progress[state.gameId]}/${game.threshold} charged`);
    playCollectSound(Math.max(1, outcome.collectorCount + outcome.progressBoost));
    burstParticles(8 + (outcome.collectorCount + outcome.progressBoost) * 3, .55);
  } else if (baseOutcomeClass === "net-win") {
    setStatus(`${outcome.wins.length} payout${outcome.wins.length === 1 ? "" : "s"} illuminated`);
  } else if (baseOutcomeClass === "break-even") {
    setStatus(`Bet returned exactly · ${formatCredits(outcome.baseWin)} CR returned on ${formatCredits(wager)} CR bet`);
  } else if (baseOutcomeClass === "partial-return") {
    setStatus(`${formatCredits(outcome.baseWin)} CR returned on ${formatCredits(wager)} CR bet`);
  } else {
    setStatus(`No win this spin. ${game.featureName} keeps your progress.`);
  }

  if (outcome.baseWin > 0) {
    await showWinBanner(outcome.baseWin, wager, { outcomeClass: baseOutcomeClass });
  }

  if (baseOutcomeClass === "net-win") {
    playWinChord();
    burstParticles(outcome.baseWin >= wager * 10 ? 42 : 18, outcome.baseWin >= wager * 10 ? 1.25 : .75);
    if (outcome.baseWin >= wager * 10) document.querySelector(".machine").classList.add("is-big-win");
    window.setTimeout(() => document.querySelector(".machine")?.classList.remove("is-big-win"), 900);
  }

  if (outcome.bonusRounds.length > 0) {
    setStatus(`${game.featureName} complete · bonus unlocked`);
    await delay(650);
    await showBonus(outcome.bonusRounds, bet, { autoAdvance: fromAuto });
    state.balance += outcome.bonusWin;
    updateUi();
  }

  state.gameStats[state.gameId] = recordGameResult(state.gameStats[state.gameId], outcome.totalWin, wager);
  updateUi();
  showReturnChip(outcome.totalWin, wager);
  const totalOutcomeClass = outcomeClassFor(outcome.totalWin, wager);
  if (outcome.bonusWin > 0 && outcome.totalWin > 0) {
    await showWinBanner(outcome.totalWin, wager, { outcomeClass: totalOutcomeClass, total: true });
  }
  await showCelebration(outcome.totalWin, wager, { autoAdvance: fromAuto });

  state.lastReceipt = {
    serverSeed: spinServerSeed,
    serverHash: spinServerHash,
    clientSeed: spinClientSeed,
    nonce: spinNonce,
    bet,
    wager,
    gameId: state.gameId,
    progressBefore,
    progressBoost: outcome.progressBoost,
    petalsBefore: progressBefore,
    outcome
  };
  state.nonce += 1;
  ui.lastWinButton.disabled = false;
  renderReceipt();
  await rotateServerSeed();
  ui.spinButton.classList.remove("is-spinning");
  state.isSpinning = false;
  updateUi();

  if (totalOutcomeClass === "net-win") setStatus(`${formatCredits(outcome.totalWin)} CR returned on ${formatCredits(wager)} CR bet · receipt ready`);
  else if (totalOutcomeClass === "break-even") setStatus(`Break-even result · ${formatCredits(outcome.totalWin)} CR returned · receipt ready`);
  else if (totalOutcomeClass === "partial-return") setStatus(`${formatCredits(outcome.totalWin)} CR returned on ${formatCredits(wager)} CR bet · receipt ready`);
  else setStatus("No return · receipt ready");
  if (!fromAuto) ui.spinButton.focus();
  return true;
}

function stopAutoplay(message = "Autoplay stopped") {
  state.autoStopRequested = true;
  state.autoActive = false;
  ui.autoplayMenu.hidden = true;
  ui.autoButton.setAttribute("aria-expanded", "false");
  updateUi();
  if (!state.isSpinning) setStatus(message);
}

async function startAutoplay(count) {
  if (state.isSpinning || state.autoActive) return;
  state.autoActive = true;
  state.autoStopRequested = false;
  state.autoRemaining = count;
  ui.autoplayMenu.hidden = true;
  ui.autoButton.setAttribute("aria-expanded", "false");
  updateUi();
  setStatus(`Autoplay started · ${count} finite spins`);

  while (state.autoActive && !state.autoStopRequested && state.autoRemaining > 0) {
    const completed = await spin({ fromAuto: true });
    if (!completed) break;
    state.autoRemaining -= 1;
    updateUi();
    if (state.autoRemaining > 0 && state.autoActive && !state.autoStopRequested) await delay(currentSpinSpeed().autoplayGapMs);
  }

  const completedAll = state.autoRemaining === 0;
  state.autoActive = false;
  state.autoStopRequested = false;
  state.autoRemaining = 0;
  updateUi();
  setStatus(completedAll ? "Autoplay session complete · choose another limit or spin manually" : "Autoplay stopped");
  ui.autoButton.focus();
}

function openDialog(id) {
  const dialog = $(id);
  if (dialog && !dialog.open) dialog.showModal();
}

function updateSoundControl() {
  ui.soundButton.setAttribute("aria-pressed", String(state.soundEnabled));
  ui.soundButton.setAttribute("aria-label", state.soundEnabled ? "Turn sound off" : "Turn sound on");
  ui.soundButton.dataset.audioState = state.soundEnabled ? "on" : "off";
}

function setSoundEnabled(enabled, { remember = true, cue = true } = {}) {
  state.soundEnabled = Boolean(enabled);
  if (remember) {
    state.soundPreference = state.soundEnabled;
    try { window.localStorage.setItem(AUDIO_PREFERENCE_STORAGE_KEY, state.soundEnabled ? "on" : "off"); } catch { /* local storage is optional */ }
  }
  audio.setEnabled(state.soundEnabled);
  updateSoundControl();
  if (state.soundEnabled && cue) audio.interfaceOn();
}

function restoreSoundPreference() {
  try {
    const stored = window.localStorage.getItem(AUDIO_PREFERENCE_STORAGE_KEY);
    if (stored === "on") state.soundPreference = true;
    if (stored === "off") state.soundPreference = false;
  } catch { /* local storage is optional */ }
  updateSoundControl();
}

function enableSoundFromGesture() {
  if (state.soundEnabled || state.soundPreference === false) return;
  setSoundEnabled(true, { remember: true, cue: true });
}

function bindEvents() {
  $("brandLink").addEventListener("click", (event) => {
    event.preventDefault();
    openLobby();
  });
  document.querySelectorAll("[data-lobby-game-id]").forEach((button) => {
    button.addEventListener("click", () => chooseLobbyGame(button.dataset.lobbyGameId));
  });
  ui.betDown.addEventListener("click", () => {
    if (state.betIndex > 0) state.betIndex -= 1;
    updateUi();
  });
  ui.betUp.addEventListener("click", () => {
    if (state.betIndex < BET_OPTIONS.length - 1) state.betIndex += 1;
    updateUi();
  });
  ui.maxBetButton.addEventListener("click", () => {
    state.betIndex = BET_OPTIONS.length - 1;
    updateUi();
    playTone(520, .14, "triangle");
  });
  ui.astralShowcaseButton.addEventListener("click", runAstralShowcasePreview);
  ui.specialBetButton.addEventListener("click", () => openFeatureMarket("special"));
  ui.buyFeatureButton.addEventListener("click", () => openFeatureMarket("buy"));
  ui.closeFeatureMarket.addEventListener("click", () => closeFeatureMarket());
  ui.featureMarketOverlay.addEventListener("click", (event) => {
    if (event.target === ui.featureMarketOverlay) closeFeatureMarket();
  });
  document.querySelectorAll("[data-progress-boost]").forEach((button) => {
    button.addEventListener("click", () => {
      state.specialBetBoost = Number(button.dataset.progressBoost);
      updateUi();
      setStatus(state.specialBetBoost ? `Special bet active · +${state.specialBetBoost} guaranteed Bloom${state.specialBetBoost === 1 ? "" : "s"}` : "Standard bet active");
      playTone(state.specialBetBoost ? 880 + state.specialBetBoost * 160 : 520, .18, "triangle");
    });
  });
  document.querySelectorAll("[data-buy-feature]").forEach((button) => {
    button.addEventListener("click", () => buyAstralFeature(Number(button.dataset.buyFeature)));
  });
  ui.spinButton.addEventListener("click", () => spin());
  ui.speedButtons.forEach((button) => {
    button.addEventListener("click", () => selectSpinSpeed(button.dataset.spinSpeed));
  });
  ui.autoButton.addEventListener("click", () => {
    if (state.autoActive) {
      stopAutoplay("Autoplay will stop after the current spin");
      return;
    }
    ui.autoplayMenu.hidden = !ui.autoplayMenu.hidden;
    ui.autoButton.setAttribute("aria-expanded", String(!ui.autoplayMenu.hidden));
  });
  $("closeAutoplay").addEventListener("click", () => {
    ui.autoplayMenu.hidden = true;
    ui.autoButton.setAttribute("aria-expanded", "false");
  });
  document.querySelectorAll("[data-auto-count]").forEach((button) => {
    button.addEventListener("click", () => startAutoplay(Number(button.dataset.autoCount)));
  });
  document.querySelectorAll(".game-choice").forEach((button) => {
    button.addEventListener("click", () => switchGame(button.dataset.gameId));
  });
  ui.soundButton.addEventListener("click", () => {
    setSoundEnabled(!state.soundEnabled, { remember: true, cue: true });
  });

  $("rulesButton").addEventListener("click", () => openDialog("rulesDialog"));
  $("fairnessButton").addEventListener("click", () => openDialog("fairnessDialog"));
  ui.lastWinButton.addEventListener("click", () => {
    renderWinDetails();
    openDialog("winDetailsDialog");
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => $(button.dataset.closeDialog)?.close());
  });
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  ui.saveClientSeed.addEventListener("click", () => {
    const seed = ui.clientSeedInput.value.trim();
    if (seed.length < 3) {
      ui.verifyResult.className = "verify-result is-invalid";
      ui.verifyResult.textContent = "Use a client seed with at least three characters.";
      return;
    }
    state.clientSeed = seed;
    ui.verifyResult.className = "verify-result is-valid";
    ui.verifyResult.textContent = "Client seed applied to the next spin.";
  });
  ui.verifyButton.addEventListener("click", verifyLastSpin);
  ui.copyReceiptButton.addEventListener("click", copyReceipt);

  $("resetSession").addEventListener("click", () => {
    if (state.isSpinning) return;
    stopAutoplay();
    state.balance = INITIAL_BALANCE;
    state.progress = Object.fromEntries(Object.keys(GAMES).map((gameId) => [gameId, 0]));
    state.gameStats = Object.fromEntries(Object.keys(GAMES).map((gameId) => [gameId, emptyGameStats()]));
    state.specialBetBoost = 0;
    state.lastOutcome = null;
    ui.lastWinButton.disabled = true;
    hideReturnChip();
    audio.stopSpinLoop({ immediate: true });
    setAnticipationUi(false);
    ui.reelViewport.classList.remove("is-spinning", "is-stopping");
    ui.reelImpactLayer.replaceChildren();
    setStatus("Demo balance reset. All four feature meters start anew.");
    updateUi();
  });

  window.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || event.repeat) return;
    const activeTag = document.activeElement?.tagName;
    const dialogOpen = Boolean(document.querySelector("dialog[open]"));
    const overlayOpen = dialogOpen || !ui.featureMarketOverlay.hidden || !ui.bonusOverlay.hidden || !state.ageConfirmed || !ui.lobbyOverlay.hidden;
    if (["INPUT", "BUTTON", "TEXTAREA"].includes(activeTag) || overlayOpen) return;
    event.preventDefault();
    spin();
  });
}

async function init() {
  restoreSpinSpeed();
  restoreSoundPreference();
  applyGameTheme({ resetGrid: true });
  buildLobby();
  ui.clientSeedInput.value = state.clientSeed;
  bindEvents();
  updateUi();
  try {
    state.ageConfirmed = window.sessionStorage.getItem("lumen-collection-age-confirmed") === "true"
      || window.sessionStorage.getItem("astral-bloom-age-confirmed") === "true";
  } catch { /* session storage is optional */ }
  openLobby();

  try {
    await rotateServerSeed();
    setStatus(`Collect ${currentGame().collectionPlural}. Unlock ${currentGame().featureName}.`);
  } catch (error) {
    console.error(error);
    setStatus("A secure browser context is required for the fairness engine.");
    ui.spinButton.disabled = true;
  }
}

init();
