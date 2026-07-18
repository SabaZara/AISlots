import { randomSeed, sha256Hex } from "./fairness.js";
import { SlotAudioEngine } from "./experience-engine.js?v=4.8.11";
import {
  COLS,
  DEFAULT_GAME_ID,
  GAMES,
  PAYLINES,
  ROWS,
  cellIndex,
  getGame,
  simulateBonusPurchase,
  theoreticalRtp,
  specialBetCostMultiplier,
  simulateSpin
} from "./game-model.js";
import { emptyGameStats, outcomeClassFor, recordGameResult, winTierFor } from "./presentation.js";
import {
  COMPANIONS,
  DEFAULT_VISUAL_CONFIG,
  MOODS,
  SYMBOL_SETS,
  THEMES,
  resolveVisualConfig,
  visualConfigLabel
} from "./asset-catalog.js?v=4.8.11";

const BET_OPTIONS = [1, 2, 5, 10, 20];
const MIN_RESULT_DISPLAY_MS = 2500;
const INITIAL_BALANCE = 1000;
const SPIN_SPEED_STORAGE_KEY = "aislots-spin-speed";
const AUDIO_PREFERENCE_STORAGE_KEY = "aislots-audio-preference";
const VISUAL_CONFIG_STORAGE_KEY = "aislots-visual-config";
const ASTRAL_FLIGHT_PROGRESS_PER_MS = 0.00038;
const FACTORY_STEPS = Object.freeze([
  Object.freeze({ key: "theme", label: "World", prompt: "World" }),
  Object.freeze({ key: "companion", label: "Character", prompt: "Character" }),
  Object.freeze({ key: "mood", label: "Atmosphere", prompt: "Atmosphere" }),
  Object.freeze({ key: "symbols", label: "Relics", prompt: "Relics" })
]);
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
  featureCard: $("featureCard"),
  companionStage: $("companionStage"),
  companionPortrait: $("companionPortrait"),
  featureVisual: $("featureVisual"),
  scatterMeterArt: $("scatterMeterArt"),
  petalMeter: $("petalMeter"),
  petalCountLarge: $("petalCountLarge"),
  meterMessage: $("meterMessage"),
  meterThreshold: $("meterThreshold"),
  fullCommitment: $("fullCommitment"),
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
  spinCenter: $("spinCenter"),
  spinLabel: $("spinLabel"),
  showcaseRow: $("showcaseRow"),
  speedToggleButton: $("speedToggleButton"),
  speedToggleValue: $("speedToggleValue"),
  maxBetButton: $("maxBetButton"),
  lobbyOverlay: $("lobbyOverlay"),
  lobbyGames: $("lobbyGames"),
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
  astralFlightWorld: $("astralFlightWorld"),
  astralFlightPlane: $("astralFlightPlane"),
  astralFlightPlaneImage: $("astralFlightPlaneImage"),
  astralDistanceValue: $("astralDistanceValue"),
  astralDistanceBar: $("astralDistanceBar"),
  astralAltitudeValue: $("astralAltitudeValue"),
  astralAltitudeBar: $("astralAltitudeBar"),
  astralMultiplierLadder: $("astralMultiplierLadder"),
  astralChoiceProgress: $("astralChoiceProgress"),
  astralChoiceBar: $("astralChoiceBar"),
  bonusExit: $("bonusExit")
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
  autoStopRequested: false,
  ageConfirmed: false,
  soundEnabled: false,
  soundPreference: null,
  speedIndex: 0,
  specialBetBoost: 0,
  lobbyStep: 0,
  lobbyChoices: Object.fromEntries(FACTORY_STEPS.map((step) => [step.key, false])),
  visualConfig: { ...DEFAULT_VISUAL_CONFIG },
  lastOutcome: null,
  lastReceipt: null
};

const audio = new SlotAudioEngine(() => state.visualConfig);

function currentGame() {
  return getGame(state.gameId);
}

function currentVisuals() {
  return resolveVisualConfig(state.visualConfig);
}

function currentAnimation() {
  return currentVisuals().animation;
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

function formatMoney(value) {
  return `$${formatCredits(value)}`;
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
  const game = currentGame();
  const boostLabel = state.specialBetBoost > 0
    ? `+${state.specialBetBoost} ${state.specialBetBoost === 1 ? game.collectionName : game.collectionPlural}`
    : "Standard";
  const costPart = state.specialBetBoost > 0 ? ` · ${formatMoney(currentBaseBet() * multiplier)}/spin` : "";
  ui.specialBetState.textContent = `${boostLabel} · ${multiplier.toFixed(2)}×${costPart}`;
  ui.specialBetButton.classList.toggle("is-active", state.specialBetBoost > 0);
  ui.specialBetButton.setAttribute("aria-pressed", String(state.specialBetBoost > 0));
  ui.specialBetButton.disabled = controlsLocked || state.gameId !== "astral";
  ui.buyFeatureButton.disabled = controlsLocked || state.gameId !== "astral";

  document.querySelectorAll("[data-progress-boost]").forEach((button) => {
    const selected = Number(button.dataset.progressBoost) === state.specialBetBoost;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    const price = button.querySelector("[data-boost-price]");
    if (price) price.textContent = `${specialBetCostMultiplier("astral", Number(button.dataset.progressBoost)).toFixed(2)}×`;
  });

  document.querySelectorAll("[data-buy-feature]").forEach((button) => {
    const costMultiplier = Number(button.dataset.buyFeature);
    const cost = currentBaseBet() * costMultiplier;
    const price = button.querySelector(`[data-buy-price="${costMultiplier}"]`);
    if (price) price.textContent = formatMoney(cost);
    button.disabled = controlsLocked || state.balance < cost;
    button.setAttribute("aria-label", `Buy ${costMultiplier} times bet ${game.featureName} bonus for ${formatMoney(cost)}`);
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

async function waitForAutoplayResult(milliseconds, fromAuto) {
  let remaining = Math.max(0, milliseconds);
  if (!fromAuto) return waitForSpinDelay(remaining);
  while (remaining > 0 && !state.autoStopRequested) {
    const slice = Math.min(32, remaining);
    await delay(slice);
    remaining -= slice;
  }
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
  audio.uiToggle(speed.id === "fast");
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
    luma: "rgba(255, 222, 132, .34)",
    orbit: "rgba(103, 225, 255, .34)",
    nova: "rgba(197, 137, 255, .34)",
    comet: "rgba(255, 126, 201, .34)",
    dew: "rgba(91, 214, 255, .34)",
    leaf: "rgba(95, 226, 188, .34)",
    petal: "rgba(198, 112, 255, .48)"
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
  if (id === "petal" && game.scatterAsset) {
    return `<img class="scatter-symbol" src="${game.scatterAsset}" alt="" aria-hidden="true">`;
  }
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
      const stopDelay = settlingColumn >= 0 ? row * 18 : col * currentAnimation().reelStopGap + row * 18;
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

// Set by settleOutcome() before each column lands so stopSpinReelColumn(reel) can read
// the sealed outcome grid for its column without widening its pinned single-arg call.
let settlingOutcomeGrid = null;

function clearSpinReelLayer() {
  ui.reelViewport.querySelector(".reel-spin-layer")?.remove();
  ui.reelViewport.classList.remove("has-spin-reels");
}

function makeReelSpinItem(id) {
  const item = document.createElement("div");
  item.className = "reel-spin-item";
  item.dataset.symbol = id;
  item.style.setProperty("--symbol-glow", symbolGlow(id));
  item.innerHTML = symbolGraphic(id);
  return item;
}

function startSpinReelLayer(seed = 0) {
  clearSpinReelLayer();
  const ids = currentSymbols().map((symbol) => symbol.id);
  const layer = document.createElement("div");
  layer.className = "reel-spin-layer";
  layer.setAttribute("aria-hidden", "true");

  for (let col = 0; col < COLS; col += 1) {
    const column = document.createElement("div");
    column.className = "reel-spin-column";
    column.dataset.col = String(col);
    column.style.setProperty("--reel-phase", `${-(col * 43)}ms`);
    column.style.setProperty("--reel-start-delay", `${col * 70}ms`);
    const strip = document.createElement("div");
    strip.className = "reel-spin-strip";
    const sequence = Array.from({ length: ROWS }, (_, row) => ids[(seed + col * 2 + row * 3) % ids.length]);

    [...sequence, ...sequence].forEach((id) => strip.append(makeReelSpinItem(id)));
    column.append(strip);
    layer.append(column);
  }

  ui.reelViewport.append(layer);
  ui.reelViewport.classList.add("has-spin-reels");
}

// Mutates only the target column's 5 existing .symbol-cell elements in place with the
// sealed outcome for that reel — no full-grid rebuild, so the other five columns' cells
// (and any animation state on them) are left completely untouched.
function renderReelStopFrame(outcomeGrid, reel) {
  const symbolName = (id) => currentSymbols().find((symbol) => symbol.id === id)?.name ?? id;
  ui.reels.querySelectorAll(`.symbol-cell[data-col="${reel}"]`).forEach((cell) => {
    const row = Number(cell.dataset.row);
    const index = cellIndex(reel, row);
    const id = outcomeGrid[index];
    cell.dataset.symbol = id;
    cell.classList.toggle("is-scatter", id === "petal");
    cell.classList.remove("is-shuffling", "is-settling");
    cell.classList.add("is-reel-settled");
    cell.style.setProperty("--symbol-glow", symbolGlow(id));
    const name = symbolName(id);
    cell.setAttribute("aria-label", name);
    cell.innerHTML = `${symbolGraphic(id)}<span class="symbol-name-tag">${name}</span>`;
  });
}

// Stops a column the way a physical reel does: the strip is frozen at its exact
// current pixel offset (no waiting for a loop boundary), its content is rebuilt in
// place so the sealed outcome sits just above the currently visible symbols, and one
// decelerating Web Animation scrolls the outcome into view without overshoot.
// The rebuild reproduces the current frame pixel-for-pixel, so the stop begins the
// instant it is requested with no jump and no extra full-speed rolling.
async function stopSpinReelColumn(reel) {
  const outcomeGrid = settlingOutcomeGrid;
  const column = ui.reelViewport.querySelector(`.reel-spin-column[data-col="${reel}"]`);
  const finalize = () => {
    renderReelStopFrame(outcomeGrid, reel);
    // Keep the transparent column in its original grid track until every reel has
    // landed. Removing it here would reflow later animated reels over settled ones.
    column?.classList.add("is-landed");
  };
  const strip = column?.querySelector(".reel-spin-strip");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!strip || reducedMotion || typeof strip.animate !== "function") {
    finalize();
    return;
  }

  const columnHeight = column.clientHeight;
  const itemHeight = columnHeight / ROWS;
  if (!(itemHeight > 0)) {
    finalize();
    return;
  }

  // Freeze the loop at its exact current offset. The loop translates 0 → columnHeight
  // and the two strip halves are identical, so the visual state is periodic in
  // columnHeight — normalize into [0, columnHeight).
  const computedTransform = getComputedStyle(strip).transform;
  let rawY = 0;
  if (computedTransform && computedTransform !== "none") {
    const matrix = new DOMMatrix(computedTransform);
    if (Number.isFinite(matrix.m42)) rawY = matrix.m42;
  }
  const offsetY = ((rawY % columnHeight) + columnHeight) % columnHeight;
  const wholeItems = Math.floor(offsetY / itemHeight);
  const fraction = offsetY - wholeItems * itemHeight;

  const oldSymbols = Array.from(strip.children, (item) => item.dataset.symbol);
  const oldAt = (index) => oldSymbols[((index % oldSymbols.length) + oldSymbols.length) % oldSymbols.length] ?? oldSymbols[0];

  // Rebuild as 11 fixed-height rows: sealed outcome on top, then the six items that
  // currently intersect the viewport (top partial first), preserving the fractional
  // scroll offset so the swap frame matches the frozen frame exactly.
  const rebuilt = [];
  for (let row = 0; row < ROWS; row += 1) rebuilt.push(outcomeGrid[cellIndex(reel, row)]);
  rebuilt.push(oldAt(4 - wholeItems));
  for (let step = 0; step < ROWS; step += 1) rebuilt.push(oldAt(5 - wholeItems + step));

  const startY = fraction - itemHeight;
  const endY = columnHeight;
  strip.style.animation = "none";
  strip.style.transform = `translate3d(0, ${startY}px, 0)`;
  strip.style.height = `${rebuilt.length * itemHeight}px`;
  strip.style.gridTemplateRows = `repeat(${rebuilt.length}, ${itemHeight}px)`;
  strip.replaceChildren(...rebuilt.map((id) => makeReelSpinItem(id)));

  // Give the browser one frame to promote and lay out the rebuilt strip before
  // its compositor-only deceleration begins. This avoids a main-thread layout
  // hitch on the first stopping frame without changing the visible position.
  await new Promise((resolve) => window.requestAnimationFrame(resolve));

  const fast = currentSpinSpeed().id === "fast";
  const loopDuration = fast ? 235 : 420;
  const livePixelsPerMs = columnHeight / loopDuration;
  const landingDistance = endY - startY;
  const velocityMatch = 0.30 / 0.18;
  const naturalDuration = landingDistance / livePixelsPerMs * velocityMatch;
  const landDuration = Math.round(Math.max(fast ? 360 : 640, Math.min(fast ? 470 : 840, naturalDuration)));
  column.classList.add("is-decelerating");
  const landing = strip.animate(
    [
      { transform: `translate3d(0, ${startY}px, 0)` },
      { transform: `translate3d(0, ${endY}px, 0)` }
    ],
    { duration: landDuration, easing: "cubic-bezier(.18,.30,.38,1)", fill: "forwards" }
  );

  await Promise.race([
    landing.finished.catch(() => {}),
    delay(landDuration + 250)
  ]);
  finalize();
}

function revealWinningCells(winnerCells) {
  ui.reels.querySelectorAll(".symbol-cell").forEach((cell) => {
    cell.classList.toggle("is-winner", winnerCells.has(Number(cell.dataset.index)));
  });
  ui.reels.classList.toggle("has-winners", winnerCells.size > 0);
  ui.reelViewport.classList.toggle("has-winners", winnerCells.size > 0);
}

function revealSpecialCollectors(collectorCount) {
  if (collectorCount <= 0) return;
  ui.reels.querySelectorAll('.symbol-cell[data-symbol="petal"]').forEach((cell) => {
    cell.classList.add("is-special-hit");
    window.setTimeout(() => cell.classList.remove("is-special-hit"), 1180);
  });
}

function initialGrid() {
  const ids = currentSymbols().map((symbol) => symbol.id).reverse();
  return Array.from({ length: COLS * ROWS }, (_, index) => ids[(index * 3 + Math.floor(index / ROWS)) % ids.length]);
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
  document.querySelectorAll("[data-game-won]").forEach((item) => {
    item.textContent = formatCredits(state.gameStats[item.dataset.gameWon].totalWon);
  });
  document.querySelectorAll("[data-lobby-won]").forEach((item) => {
    item.textContent = `${formatMoney(state.gameStats[item.dataset.lobbyWon].totalWon)} won`;
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
  const autoplayStopping = state.autoActive && state.autoStopRequested;
  ui.spinButton.setAttribute("aria-label", state.autoActive
    ? autoplayStopping ? "Autoplay stopping now" : "Stop autoplay now"
    : `${currentGame().actionLabel} spin for ${formatMoney(spinWager)}${state.gameId === "astral" && state.specialBetBoost ? ` with ${state.specialBetBoost} bonus meter boost` : ""}`);
  const controlsLocked = state.isSpinning || state.autoActive;
  ui.betDown.disabled = controlsLocked || state.betIndex === 0;
  ui.betUp.disabled = controlsLocked || state.betIndex === BET_OPTIONS.length - 1;
  ui.maxBetButton.disabled = controlsLocked || state.betIndex === BET_OPTIONS.length - 1;
  ui.spinButton.disabled = (state.isSpinning && !state.autoActive) || autoplayStopping;
  ui.spinButton.classList.toggle("is-autoplay-stop", state.autoActive);
  ui.spinLabel.textContent = state.autoActive ? "Stop" : currentGame().actionLabel;
  const spinIcon = ui.spinButton.querySelector(".spin-icon");
  if (spinIcon) spinIcon.textContent = state.autoActive ? "■" : "↻";
  updateAstralFeatureUi(controlsLocked);
  ui.saveClientSeed.disabled = controlsLocked;
  ui.clientSeedInput.disabled = controlsLocked;
  ui.autoButton.disabled = (state.isSpinning && !state.autoActive) || autoplayStopping;
  ui.autoButton.classList.toggle("is-running", state.autoActive);
  ui.autoButton.setAttribute("aria-label", state.autoActive
    ? autoplayStopping ? "Autoplay stopping now" : "Stop infinite autoplay now"
    : "Start infinite autoplay");
  ui.autoButton.innerHTML = state.autoActive
    ? `<span aria-hidden="true">STOP</span>`
    : `<span aria-hidden="true">AUTO</span><strong>∞</strong>`;
  ui.speedToggleButton.disabled = controlsLocked;
  ui.speedToggleButton.classList.toggle("is-fast", speed.id === "fast");
  ui.speedToggleButton.setAttribute("aria-label", speed.id === "fast" ? "Switch to Normal 1× spin" : "Switch to Fast 3× spin");
  ui.speedToggleValue.textContent = speed.label;
  $("game").dataset.speed = speed.id;
  document.querySelectorAll(".game-choice").forEach((button) => { button.disabled = controlsLocked; });

  renderPetalMeter();
  renderGameStats();
}

function updateCommitmentUi() {
  ui.fullCommitment.textContent = state.serverHash || "Preparing cryptographic seed…";
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
  $("rulesPaylineCount").textContent = String(PAYLINES.length);
  $("rulesPaylineCopyCount").textContent = String(PAYLINES.length);
  const payingSymbols = currentSymbols().filter((symbol) => symbol.id !== "petal");
  const fragment = document.createDocumentFragment();
  payingSymbols.forEach((symbol) => {
    const row = document.createElement("div");
    row.className = "paytable-row";
    row.innerHTML = `${symbolGraphic(symbol.id)}<div><strong>${symbol.name} · ${(symbol.weight / 100).toFixed(1)}% per cell</strong><div class="paytable-values"><span>3× <b>${Number(symbol.payouts[3].toFixed(2))}</b></span><span>4× <b>${symbol.payouts[4]}</b></span><span>5× <b>${symbol.payouts[5]}</b></span><span>6× <b>${symbol.payouts[6]}</b></span></div></div>`;
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
  const group = (label, key, items, stepIndex) => `
    <section class="factory-group factory-group-${key}" data-factory-step="${stepIndex}" aria-labelledby="factory-${key}-label"${stepIndex === 0 ? "" : " hidden"}>
      <div class="factory-group-head"><strong id="factory-${key}-label">${label}</strong><span>${items.length}</span></div>
      <div class="factory-options" style="--option-count:${items.length}" role="group" aria-label="Choose ${label.toLowerCase()}">
        ${items.map((item) => {
          const art = item.asset ? ` style="--choice-art:url('${item.asset}')${item.scatterAsset ? `;--scatter-choice-art:url('${item.scatterAsset}')` : ""}"` : "";
          const artMarkup = key === "symbols"
            ? `<i class="factory-symbol-showcase"${art} aria-hidden="true">${Array.from({ length: 6 }, (_, index) => `<b class="symbol-sheet-${index}"></b>`).join("")}<b class="factory-scatter-choice"></b></i>`
            : key === "mood"
              ? `<i class="factory-option-art factory-mood-showcase"${art} aria-hidden="true"><small>${item.description}</small></i>`
              : `<i class="factory-option-art"${art} aria-hidden="true"></i>`;
          return `<button type="button" data-config-group="${key}" data-config-id="${item.id}" aria-pressed="false" aria-label="${item.name}">${artMarkup}<span>${item.name}</span></button>`;
        }).join("")}
      </div>
    </section>`;

  ui.lobbyGames.className = "factory-builder";
  ui.lobbyGames.setAttribute("aria-label", "Choose slot world layers");
  ui.lobbyGames.innerHTML = `
    <div class="factory-controls">
      <div class="factory-choice-intro">
        <button type="button" data-factory-back aria-label="Return to the previous choice" disabled>← Back</button>
        <div><span id="factoryStepCount">Step 1 of ${FACTORY_STEPS.length}</span><strong id="factoryStepPrompt">${FACTORY_STEPS[0].prompt}</strong></div>
        <button type="button" data-randomize-world>Surprise me</button>
      </div>
      <div class="factory-step-track" aria-label="World creation progress">
        ${FACTORY_STEPS.map((step, index) => `<i data-factory-progress="${index}"><span>${index + 1}</span><b>${step.label}</b></i>`).join("")}
      </div>
      ${group("World", "theme", THEMES, 0)}
      ${group("Character", "companion", COMPANIONS, 1)}
      ${group("Atmosphere", "mood", MOODS, 2)}
      ${group("Relics", "symbols", SYMBOL_SETS, 3)}
      <div class="factory-actions">
        <button class="primary-button" type="button" data-factory-next disabled>Next →</button>
      </div>
    </div>
    <section class="factory-preview" id="factoryPreview" aria-label="Visual preview">
      <div class="factory-preview-world" id="factoryPreviewWorld"></div>
      <div class="factory-preview-mood" id="factoryPreviewMood"></div>
      <img class="factory-preview-companion" id="factoryPreviewCompanion" alt="" hidden>
      <div class="factory-preview-mood-badge" id="factoryPreviewMoodBadge" hidden><i aria-hidden="true"></i><strong id="factoryPreviewMoodName"></strong><small id="factoryPreviewMoodDescription"></small></div>
    </section>`;
  updateLobbyPreview();
  updateLobbyStep();
}

function updateLobbyStep() {
  const stepIndex = Math.max(0, Math.min(FACTORY_STEPS.length - 1, state.lobbyStep));
  const step = FACTORY_STEPS[stepIndex];
  state.lobbyStep = stepIndex;
  ui.lobbyGames.dataset.factoryStep = step.key;
  ui.lobbyGames.querySelectorAll("[data-factory-step]").forEach((group) => {
    group.hidden = Number(group.dataset.factoryStep) !== stepIndex;
  });
  ui.lobbyGames.querySelectorAll("[data-factory-progress]").forEach((marker) => {
    const markerIndex = Number(marker.dataset.factoryProgress);
    marker.classList.toggle("is-current", markerIndex === stepIndex);
    marker.classList.toggle("is-complete", markerIndex < stepIndex);
  });
  const counter = $("factoryStepCount");
  const prompt = $("factoryStepPrompt");
  const actions = ui.lobbyGames.querySelector(".factory-actions");
  const back = ui.lobbyGames.querySelector("[data-factory-back]");
  if (counter) counter.textContent = `Step ${stepIndex + 1} of ${FACTORY_STEPS.length}`;
  if (prompt) prompt.textContent = step.prompt;
  if (actions) actions.hidden = false;
  if (back) back.disabled = stepIndex === 0;
  const next = ui.lobbyGames.querySelector("[data-factory-next]");
  if (next) {
    next.hidden = false;
    next.disabled = !state.lobbyChoices[step.key];
    const allChosen = FACTORY_STEPS.every((factoryStep) => state.lobbyChoices[factoryStep.key]);
    next.textContent = stepIndex === FACTORY_STEPS.length - 1 && allChosen ? "Start →" : "Next →";
  }
  window.requestAnimationFrame(() => {
    const focusTarget = ui.lobbyGames.querySelector(`[data-factory-step="${stepIndex}"] [data-config-group]`);
    focusTarget?.focus({ preventScroll: true });
  });
}

function updateLobbyPreview() {
  const preview = $("factoryPreview");
  if (!preview) return;
  const hasTheme = state.lobbyChoices.theme;
  ui.lobbyGames.classList.toggle("is-awaiting-theme", !hasTheme);
  ui.lobbyOverlay.classList.toggle("is-awaiting-theme", !hasTheme);

  if (!hasTheme) {
    ui.lobbyGames.style.setProperty("--builder-accent", "#8fa7c7");
    ui.lobbyGames.style.setProperty("--builder-secondary", "#526781");
    ui.lobbyOverlay.style.setProperty("--builder-accent", "#8fa7c7");
    ui.lobbyOverlay.style.setProperty("--builder-secondary", "#526781");
    ui.lobbyOverlay.style.setProperty("--builder-world-art", "none");
    preview.removeAttribute("data-mood");
    $("factoryPreviewWorld").style.backgroundImage = "none";
    $("factoryPreviewMood").style.backgroundImage = "none";
    $("factoryPreviewCompanion").removeAttribute("src");
    $("factoryPreviewCompanion").alt = "";
    $("factoryPreviewCompanion").hidden = true;
    $("factoryPreviewMoodBadge").hidden = true;
    $("factoryPreviewMoodName").textContent = "";
    $("factoryPreviewMoodDescription").textContent = "";
    ui.lobbyGames.querySelectorAll("[data-config-group]").forEach((button) => {
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
    });
    return;
  }

  const visuals = currentVisuals();
  ui.lobbyGames.style.setProperty("--builder-accent", visuals.theme.accent);
  ui.lobbyGames.style.setProperty("--builder-secondary", visuals.theme.secondary);
  ui.lobbyOverlay.style.setProperty("--builder-accent", visuals.theme.accent);
  ui.lobbyOverlay.style.setProperty("--builder-secondary", visuals.theme.secondary);
  ui.lobbyOverlay.style.setProperty("--builder-world-art", `url("${visuals.theme.asset}")`);
  if (state.lobbyChoices.mood) preview.dataset.mood = visuals.mood.id;
  else preview.removeAttribute("data-mood");
  $("factoryPreviewWorld").style.backgroundImage = `url("${visuals.theme.asset}")`;
  $("factoryPreviewMood").style.backgroundImage = state.lobbyChoices.mood ? `url("${visuals.mood.asset}")` : "none";
  if (state.lobbyChoices.companion) {
    $("factoryPreviewCompanion").src = visuals.companion.asset;
    $("factoryPreviewCompanion").alt = `${visuals.companion.name} companion`;
    $("factoryPreviewCompanion").hidden = false;
  } else {
    $("factoryPreviewCompanion").removeAttribute("src");
    $("factoryPreviewCompanion").alt = "";
    $("factoryPreviewCompanion").hidden = true;
  }
  $("factoryPreviewMoodBadge").hidden = !state.lobbyChoices.mood;
  $("factoryPreviewMoodName").textContent = state.lobbyChoices.mood ? visuals.mood.name : "";
  $("factoryPreviewMoodDescription").textContent = state.lobbyChoices.mood ? visuals.mood.description : "";
  const allChosen = FACTORY_STEPS.every((step) => state.lobbyChoices[step.key]);
  ui.lobbyGames.querySelectorAll("[data-config-group]").forEach((button) => {
    const selected = state.lobbyChoices[button.dataset.configGroup]
      && state.visualConfig[button.dataset.configGroup] === button.dataset.configId;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  const next = ui.lobbyGames.querySelector("[data-factory-next]");
  if (next) {
    next.disabled = !state.lobbyChoices[FACTORY_STEPS[state.lobbyStep].key];
    next.textContent = state.lobbyStep === FACTORY_STEPS.length - 1 && allChosen ? "Start →" : "Next →";
  }
}

function setVisualConfigChoice(group, id) {
  const catalogs = { theme: THEMES, companion: COMPANIONS, mood: MOODS, symbols: SYMBOL_SETS };
  if (!catalogs[group]?.some((item) => item.id === id)) return;
  state.visualConfig[group] = id;
  state.lobbyChoices[group] = true;
  updateLobbyPreview();
}

function randomizeVisualConfig() {
  const pick = (items) => items[Math.floor(Math.random() * items.length)].id;
  state.visualConfig = {
    theme: pick(THEMES),
    companion: pick(COMPANIONS),
    mood: pick(MOODS),
    symbols: pick(SYMBOL_SETS),
    animation: DEFAULT_VISUAL_CONFIG.animation
  };
  Object.keys(state.lobbyChoices).forEach((group) => { state.lobbyChoices[group] = true; });
  state.lobbyStep = FACTORY_STEPS.length - 1;
  updateLobbyPreview();
  updateLobbyStep();
}

function saveVisualConfig() {
  try { window.localStorage.setItem(VISUAL_CONFIG_STORAGE_KEY, JSON.stringify(state.visualConfig)); } catch { /* local storage is optional */ }
}

function restoreVisualConfig() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(VISUAL_CONFIG_STORAGE_KEY) || "null");
    if (stored && typeof stored === "object") {
      // The Mystic and Dark atmospheres became Arcane and Shadow.
      stored.mood = { mystic: "arcane", dark: "shadow" }[stored.mood] ?? stored.mood;
      stored.theme = { storm: "reef", abyss: "reef" }[stored.theme] ?? stored.theme;
      stored.symbols = { abyssal: "coral" }[stored.symbols] ?? stored.symbols;
      const resolved = resolveVisualConfig(stored);
      state.visualConfig = {
        theme: resolved.theme.id,
        companion: resolved.companion.id,
        mood: resolved.mood.id,
        symbols: resolved.symbols.id,
        animation: DEFAULT_VISUAL_CONFIG.animation
      };
    }
  } catch { /* local storage is optional */ }
}

function openLobby() {
  if (state.isSpinning || state.autoActive) return;
  ui.lobbyOverlay.hidden = false;
  ui.lobbyOverlay.setAttribute("aria-hidden", "false");
  $("appShell").inert = true;
  document.body.classList.add("is-lobby-open");
  state.lobbyStep = 0;
  state.visualConfig.theme = DEFAULT_VISUAL_CONFIG.theme;
  Object.keys(state.lobbyChoices).forEach((group) => { state.lobbyChoices[group] = group === "theme"; });
  updateLobbyPreview();
  updateLobbyStep();
}

function chooseLobbyGame() {
  const missingStep = FACTORY_STEPS.findIndex((step) => !state.lobbyChoices[step.key]);
  if (missingStep >= 0) {
    state.lobbyStep = missingStep;
    updateLobbyStep();
    return;
  }
  enableSoundFromGesture();
  state.ageConfirmed = true;
  try { window.sessionStorage.setItem("lumen-collection-age-confirmed", "true"); } catch { /* storage may be unavailable */ }
  saveVisualConfig();
  applyGameTheme({ resetGrid: true });
  updateUi();
  if (state.soundEnabled) {
    audio.startMusic();
    audio.gameIntro();
  }
  ui.lobbyOverlay.hidden = true;
  ui.lobbyOverlay.setAttribute("aria-hidden", "true");
  $("appShell").inert = false;
  document.body.classList.remove("is-lobby-open");
  ui.spinButton.focus();
}

function applyGameTheme({ resetGrid = false } = {}) {
  const game = currentGame();
  const visuals = currentVisuals();
  game.name = `${visuals.theme.name} ${visuals.companion.name}`;
  game.shortName = visuals.theme.name;
  game.subtitle = `${visuals.mood.name} · ${visuals.symbols.name}`;
  game.intro = `${visuals.animation.name} motion · ${visuals.companion.name} companion`;
  game.accent = visuals.theme.accent;
  game.secondary = visuals.theme.secondary;
  game.background = visuals.theme.asset;
  game.characterLayer = visuals.companion.asset;
  game.symbolSheet = visuals.symbols.asset;
  game.scatterAsset = visuals.symbols.scatterAsset;
  game.bonusLoadingArt = visuals.theme.bonusLoading;
  game.planeAsset = visuals.theme.planeAsset;
  game.bonusBarArt = "none";
  game.actionLabel = visuals.theme.action;
  game.reelMotion = visuals.animation.id;
  game.reelStopGap = visuals.animation.reelStopGap;
  game.spinInterval = visuals.animation.spinInterval;
  game.collectionName = visuals.symbols.collector;
  game.collectionPlural = `${visuals.symbols.collector}s`;
  game.featureName = `${visuals.theme.name} Scatter Flight`;
  game.featureEyebrow = "Scatter collection";
  game.featureCopy = `Every ${game.collectionName} counts. Collect ${game.threshold} to launch ${game.bonusDraws} sealed multiplier flights.`;
  game.meterCarryCopy = `Every ${game.collectionName} stays between spins`;
  game.anticipationCopy = `${visuals.theme.name} energy is charging the final reel…`;
  game.bonusTitle = `${visuals.theme.name} vault awakened.`;
  game.bonusCopy = `${game.bonusDraws} flight multipliers are sealed into your fairness receipt. Landing changes reveal timing only.`;
  game.bonusMechanicName = `${visuals.theme.name} Sky Runner`;
  game.symbols.forEach((symbol) => { symbol.name = visuals.symbols.names[symbol.id]; });
  const gameStage = $("game");
  gameStage.dataset.game = game.id;
  gameStage.dataset.theme = visuals.theme.id;
  gameStage.dataset.mood = visuals.mood.id;
  gameStage.dataset.animation = visuals.animation.id;
  const spinCenterRow = ui.spinCenter.querySelector(".spin-center-row");
  if (spinCenterRow && ui.autoButton.parentElement !== spinCenterRow) spinCenterRow.prepend(ui.autoButton);
  ui.featureCard.dataset.game = game.id;
  ui.featureVisual.dataset.meter = game.meterMode;
  ui.scatterMeterArt.src = game.scatterAsset;
  ui.scatterMeterArt.alt = game.collectionName;
  ui.reels.dataset.motion = game.reelMotion;
  gameStage.style.setProperty("--game-bg", `url("${game.background}")`);
  gameStage.style.setProperty("--game-characters", `url("${game.characterLayer}")`);
  gameStage.style.setProperty("--bonus-bar-art", "none");
  gameStage.style.setProperty("--mood-overlay", `url("${visuals.mood.asset}")`);
  gameStage.style.setProperty("--game-accent", game.accent);
  gameStage.style.setProperty("--game-secondary", game.secondary);
  gameStage.style.setProperty("--feature-world-art", `url("${game.background}")`);
  gameStage.style.setProperty("--feature-bonus-art", `url("${game.bonusLoadingArt}")`);
  gameStage.style.setProperty("--feature-symbol-art", `url("${game.scatterAsset}")`);
  gameStage.style.setProperty("--feature-plane-art", `url("${game.planeAsset}")`);
  document.documentElement.style.setProperty("--topbar-art", `url("${game.background}")`);
  document.documentElement.style.setProperty("--topbar-accent", game.accent);
  document.documentElement.style.setProperty("--topbar-secondary", game.secondary);
  ui.featureMarketOverlay.style.setProperty("--market-world-art", `url("${game.background}")`);
  ui.featureMarketOverlay.style.setProperty("--market-bonus-art", `url("${game.bonusLoadingArt}")`);
  ui.featureMarketOverlay.style.setProperty("--market-symbol-art", `url("${game.scatterAsset}")`);
  ui.featureMarketOverlay.style.setProperty("--market-plane-art", `url("${game.planeAsset}")`);
  ui.featureMarketOverlay.style.setProperty("--game-accent", game.accent);
  ui.featureMarketOverlay.style.setProperty("--game-secondary", game.secondary);
  ui.celebrationOverlay.style.setProperty("--game-accent", game.accent);
  ui.celebrationOverlay.style.setProperty("--celebration-bg", `url("${game.bonusLoadingArt}")`);
  ui.celebrationOverlay.style.setProperty("--celebration-mood", `url("${visuals.mood.asset}")`);
  ui.winBanner.style.setProperty("--win-world-art", `url("${game.background}")`);
  ui.winBanner.style.setProperty("--win-mood-art", `url("${visuals.mood.asset}")`);
  ui.bonusOverlay.style.setProperty("--game-accent", game.accent);
  ui.bonusOverlay.style.setProperty("--game-secondary", game.secondary);
  ui.bonusOverlay.style.setProperty("--bonus-bg", `url("${game.bonusLoadingArt}")`);
  ui.bonusOverlay.dataset.theme = visuals.theme.id;
  ui.bonusOverlay.dataset.mood = visuals.mood.id;
  ui.cinematicOverlay.style.setProperty("--cinematic-world", `url("${visuals.theme.asset}")`);
  ui.cinematicOverlay.style.setProperty("--cinematic-loading", `url("${game.bonusLoadingArt}")`);
  ui.cinematicOverlay.style.setProperty("--cinematic-accent", visuals.theme.accent);
  ui.astralFlightPlaneImage.src = game.planeAsset;
  ui.companionPortrait.src = visuals.companion.asset;
  document.title = `${visualConfigLabel(state.visualConfig)} · AISlots`;
  $("featureEyebrow").textContent = game.featureEyebrow;
  $("moonwellTitle").textContent = game.featureName;
  $("featureCopy").textContent = game.featureCopy;
  $("meterThreshold").textContent = `/${game.threshold}`;
  $("spinLabel").textContent = game.actionLabel;
  ui.winBannerLabel.textContent = `${game.shortName} win`;
  ui.winBanner.dataset.tier = "win";
  ui.bonusOverlay.dataset.game = game.id;
  ui.bonusEyebrow.textContent = `${game.featureName} feature`;
  $("bonusTitle").textContent = game.bonusTitle;
  ui.bonusCopy.textContent = game.bonusCopy;

  const featureHeading = $("featureMarketTitle");
  if (featureHeading) featureHeading.textContent = `${visuals.theme.name} vault features`;
  document.querySelectorAll("[data-progress-boost]").forEach((button) => {
    const boost = Number(button.dataset.progressBoost);
    const small = button.querySelector("small");
    if (small && boost > 0) small.textContent = `+${boost} ${boost === 1 ? game.collectionName : game.collectionPlural} every spin`;
  });

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
  audio.stopSpinLoop({ immediate: true });
  setAnticipationUi(false);
  ui.reelViewport.classList.remove("is-spinning", "is-stopping");
  clearSpinReelLayer();
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
  audio.spinStart({ fast: currentSpinSpeed().id === "fast" });
}

function playSpinTick(tick) {
  audio.spinTick(tick);
}

function playCollectSound(count = 1) {
  const game = currentGame();
  audio.collect(count, game.threshold > 0 ? state.progress[state.gameId] / game.threshold : 0);
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

function flashReelStop() {
  // Intentionally static: reel-impact rings, particles, and forced-layout shake
  // caused the scored-grid hitch shown in the phone/desktop result state.
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

async function playSymbolFusion(outcome) {
  const winnerIndexes = [...winningCells(outcome)];
  if (winnerIndexes.length < 2) return;
  const cells = winnerIndexes
    .map((index) => ui.reels.querySelector(`.symbol-cell[data-index="${index}"]`))
    .filter(Boolean);
  if (cells.length < 2) return;

  const viewportRect = ui.reelViewport.getBoundingClientRect();
  const points = cells.map((cell) => {
    const rect = cell.getBoundingClientRect();
    return { cell, x: rect.left - viewportRect.left + rect.width / 2, y: rect.top - viewportRect.top + rect.height / 2 };
  });
  const center = points.reduce((point, current) => ({ x: point.x + current.x, y: point.y + current.y }), { x: 0, y: 0 });
  center.x /= points.length;
  center.y /= points.length;

  const effects = [];
  points.forEach((point, index) => {
    point.cell.style.setProperty("--fusion-x", `${(center.x - point.x) * .22}px`);
    point.cell.style.setProperty("--fusion-y", `${(center.y - point.y) * .22}px`);
    point.cell.style.setProperty("--fusion-delay", `${index * 24}ms`);
    point.cell.classList.add("is-fusing");
    const thread = document.createElement("span");
    const distance = Math.hypot(center.x - point.x, center.y - point.y);
    const angle = Math.atan2(center.y - point.y, center.x - point.x) * 180 / Math.PI;
    thread.className = "symbol-fusion-thread";
    thread.style.setProperty("--thread-x", `${point.x}px`);
    thread.style.setProperty("--thread-y", `${point.y}px`);
    thread.style.setProperty("--thread-length", `${distance}px`);
    thread.style.setProperty("--thread-angle", `${angle}deg`);
    thread.style.setProperty("--thread-delay", `${index * 24}ms`);
    ui.reelImpactLayer.append(thread);
    effects.push(thread);
  });
  const burst = document.createElement("span");
  burst.className = "symbol-fusion-burst";
  burst.style.setProperty("--burst-x", `${center.x}px`);
  burst.style.setProperty("--burst-y", `${center.y}px`);
  burst.innerHTML = "<i></i><b></b>";
  ui.reelImpactLayer.append(burst);
  effects.push(burst);
  playWinChord();
  window.setTimeout(() => burstParticles(Math.min(32, 10 + cells.length * 2), .65), 260);
  const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : currentSpinSpeed().id === "fast" ? 380 : 680;
  await delay(duration);
  cells.forEach((cell) => {
    cell.classList.remove("is-fusing");
    cell.style.removeProperty("--fusion-x");
    cell.style.removeProperty("--fusion-y");
    cell.style.removeProperty("--fusion-delay");
  });
  effects.forEach((effect) => effect.remove());
}

function animateCreditValue(element, amount, duration = 900, { sound = false, tierId = "nice" } = {}) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || duration <= 0) {
    element.textContent = formatMoney(amount);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const start = performance.now();
    let lastSoundAt = -100;
    const draw = (now) => {
      const progress = Math.max(0, Math.min(1, (now - start) / duration));
      const eased = 1 - (1 - progress) ** 3;
      element.textContent = formatMoney(amount * eased);
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
  if (outcomeClass === "partial-return") ui.winBannerLabel.textContent = `${currentGame().shortName} win`;
  else if (outcomeClass === "break-even") ui.winBannerLabel.textContent = `${currentGame().shortName} win`;
  else if (total) ui.winBannerLabel.textContent = `${currentGame().shortName} total win`;
  else ui.winBannerLabel.textContent = tier.id === "nice" ? `Nice ${currentGame().shortName} win` : `${currentGame().shortName} win`;
  ui.winBannerMultiplier.textContent = `${(amount / bet).toFixed(2)}× bet`;
  ui.winBannerAmount.textContent = "$0.00";
  ui.winBanner.classList.add("is-visible");
  jumpText(ui.winBannerLabel);
  jumpText(ui.winBannerAmount);
  if (outcomeClass === "net-win") audio.winVoice();
  else audio.payoutTick(1, "win");
  const amountAnimation = animateCreditValue(ui.winBannerAmount, amount, tier.id === "nice" ? 1050 : 720, { sound: true, tierId: tier.id })
    .then(() => {
      jumpText(ui.winBannerAmount);
      audio.winCountEnd(amount / bet);
    });
  window.setTimeout(() => ui.winBanner.classList.remove("is-visible"), tier.id === "nice" ? 2100 : 1650);
  return amountAnimation;
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
    ui.celebrationAmount.textContent = "$0.00";
    ui.celebrationMultiplier.textContent = `${(amount / bet).toFixed(2)}× bet`;
    ui.celebrationGame.textContent = game.name;
    ui.celebrationCollect.textContent = `Collect ${formatMoney(amount)}`;
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
  // A later reel must never finish before an earlier one. The landing duration is
  // offset-dependent, so this gap is intentionally larger than its maximum variance
  // while the six decelerations still overlap like a physical slot cabinet.
  const orderedLandingGap = speed.id === "fast" ? 130 : 225;
  const reelGap = Math.max(orderedLandingGap, Math.round(game.reelStopGap * speed.settleScale));
  const settleTail = speed.id === "fast" ? 40 : 90;
  setAnticipationUi(false);
  ui.reelViewport.classList.remove("is-spinning");
  ui.reelViewport.classList.add("is-stopping");
  if (state.gameId === "astral") ui.reels.classList.add("is-cinematic-drop");
  settlingOutcomeGrid = outcome.grid;
  const landings = [];
  let landedScatters = 0;
  for (let reel = 0; reel < COLS; reel += 1) {
    if (reel > 0) await waitForSpinDelay(reelGap);
    // stopSpinReelColumn() awaits the strip's landing animation, then calls
    // renderReelStopFrame() to mutate this column's cells to the sealed outcome
    // before removing the spin-layer column on the same frame. Initiations are
    // staggered by reelGap while the decelerations overlap, so reels land
    // left-to-right at a real-slot cadence instead of one full landing at a time.
    const columnScatters = Array.from({ length: ROWS }, (_, row) => outcome.grid[cellIndex(reel, row)]).filter((id) => id === "petal").length;
    const collector = columnScatters > 0;
    landings.push(stopSpinReelColumn(reel).then(() => {
      playReelStopSound(reel);
      if (collector) {
        landedScatters += columnScatters;
        audio.scatterLand(landedScatters);
      }
      flashReelStop(reel, { collector, final: reel === COLS - 1 });
    }));
  }
  await Promise.all(landings);
  settlingOutcomeGrid = null;
  clearSpinReelLayer();
  audio.stopSpinLoop();
  await waitForSpinDelay(settleTail);
  revealWinningCells(winningCells(outcome));
  if (winningCells(outcome).size > 1) playWinChord();
  revealSpecialCollectors(outcome.collectorCount);
  ui.reels.classList.remove("is-cinematic-drop");
  ui.reelViewport.classList.remove("is-stopping");
  updateUi();
  sequenceLineWinSounds(outcome, BET_OPTIONS[state.betIndex]);
}

function receiptOutcomeLabel(outcome) {
  const resultHash = outcome.grid.length ? outcome.grid.map((id) => id[0].toUpperCase()).join("") : "FEATURE BUY";
  return `${resultHash} · ${formatMoney(outcome.totalWin)}`;
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
      : `✓ Verified. The pre-spin hash matches, and all ${COLS * ROWS} symbols, base-game wins, feature progress, and bonus prizes replay exactly.`
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
    ? outcome.wins.map((win, index) => `<div class="win-line-item"><span>Payout ${index + 1} · <b>${win.count}× ${win.symbolName}</b></span><strong>${formatMoney(win.amount)}</strong></div>`).join("")
    : `<div class="win-line-item"><span>No base-game payout</span><strong>$0.00</strong></div>`;
  const bonus = outcome.bonusWin > 0
    ? `<div class="win-line-item"><span>${game.featureName} · <b>${outcome.bonusMultiplier}× total bet</b></span><strong>${formatMoney(outcome.bonusWin)}</strong></div>`
    : "";
  ui.winDetailsContent.innerHTML = `<div class="win-summary"><div><span>${game.name} total</span><strong>${formatMoney(outcome.totalWin)}</strong></div><div><span>${game.collectionPlural} landed</span><strong>${outcome.collectorCount}</strong></div></div><div class="win-line-list">${wins}${bonus}</div>`;
}

function cinematicDelay(milliseconds) {
  return delay(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? Math.min(80, milliseconds) : milliseconds);
}

async function runAstralCinematicTransition({ preview = false, multiplierCount = 3 } = {}) {
  const game = currentGame();
  ui.cinematicOverlay.dataset.mode = "world-awakening";
  ui.cinematicOverlay.dataset.phase = "sleeping";
  ui.cinematicTitle.textContent = game.name;
  ui.cinematicCopy.textContent = preview ? "Your world opens" : `${game.featureName} awakens`;
  ui.cinematicAward.textContent = `${multiplierCount} FLIGHTS`;
  ui.cinematicOverlay.hidden = false;
  ui.cinematicOverlay.setAttribute("aria-hidden", "false");
  $("appShell").inert = true;
  audio.bonusStart();
  await cinematicDelay(120);
  ui.cinematicOverlay.dataset.phase = "emerging";
  await cinematicDelay(1050);
  ui.cinematicOverlay.dataset.phase = "awakened";
  ui.cinematicTitle.textContent = game.featureName;
  ui.cinematicCopy.textContent = preview ? "World preview" : "Three sealed multiplier flights";
  ui.cinematicAward.textContent = `${multiplierCount} FLIGHTS`;
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

function buildAstralFlightLocks(count) {
  return Array.from({ length: count }, (_, index) => {
    const lock = document.createElement("span");
    lock.innerHTML = `<small>Flight ${index + 1}</small><strong>—</strong>`;
    return lock;
  });
}

function astralFlightRarity(multiplier) {
  if (multiplier >= 10) return "jackpot";
  if (multiplier >= 5) return "legendary";
  if (multiplier >= 2) return "epic";
  if (multiplier >= 1) return "rare";
  return "common";
}

function astralFlightProfile(multiplier) {
  if (multiplier >= 10) return { progress: .96 };
  if (multiplier >= 5) return { progress: .84 };
  if (multiplier >= 2) return { progress: .68 };
  if (multiplier >= 1) return { progress: .53 };
  if (multiplier >= .5) return { progress: .38 };
  return { progress: .22 };
}

function setAstralFlightPosition(progress) {
  const clamped = Math.max(0, Math.min(1, progress));
  const x = 18 + clamped * 68;
  const arc = Math.sin(clamped * Math.PI) * 9;
  const y = 73 - clamped * 47 - arc;
  const tilt = -9 + clamped * 8;
  const scale = 1 - clamped * .2;
  ui.astralFlightPlane.style.setProperty("--flight-x", x.toFixed(2) + "%");
  ui.astralFlightPlane.style.setProperty("--flight-y", y.toFixed(2) + "%");
  ui.astralFlightPlane.style.setProperty("--flight-tilt", tilt.toFixed(2) + "deg");
  ui.astralFlightPlane.style.setProperty("--flight-scale", scale.toFixed(3));
  ui.astralFlightWorld.style.setProperty("--flight-progress", (clamped * 100).toFixed(2) + "%");
  ui.astralFlightWorld.style.setProperty("--depth-far-x", (-clamped * 3).toFixed(2) + "%");
  ui.astralFlightWorld.style.setProperty("--depth-mid-x", (-clamped * 8).toFixed(2) + "%");
  ui.astralFlightWorld.style.setProperty("--depth-near-x", (-clamped * 16).toFixed(2) + "%");
}

function updateAstralFlightHud(progress, multiplier = 0) {
  const routeProgress = Math.max(0, Math.min(1, (progress - .04) / .9));
  const distance = Math.round(routeProgress * 120);
  const altitude = Math.round(routeProgress * 10000 / 50) * 50;
  ui.astralDistanceValue.textContent = distance + " km";
  ui.astralAltitudeValue.textContent = altitude.toLocaleString() + " m";
  ui.astralDistanceBar.style.width = routeProgress * 100 + "%";
  ui.astralAltitudeBar.style.width = routeProgress * 100 + "%";
  ui.astralFlightWorld.style.setProperty("--route-progress", routeProgress.toFixed(3));
  ui.astralFlightWorld.dataset.distance = String(distance);
  ui.astralFlightWorld.dataset.altitude = String(altitude);
  const ladderSteps = [...ui.astralMultiplierLadder.querySelectorAll("[data-multiplier-step]")];
  ladderSteps.forEach((step) => step.classList.toggle("is-reached", Number(step.dataset.multiplierStep) <= multiplier));
  const next = ladderSteps
    .filter((step) => Number(step.dataset.multiplierStep) > multiplier)
    .sort((a, b) => Number(a.dataset.multiplierStep) - Number(b.dataset.multiplierStep))[0];
  ladderSteps.forEach((step) => step.classList.toggle("is-next", step === next));
}

function animateAstralFlightLanding({ fromProgress, toProgress, fromMultiplier, toMultiplier, duration, reducedMotion }) {
  if (reducedMotion) {
    setAstralFlightPosition(toProgress);
    updateAstralFlightHud(toProgress, toMultiplier);
    ui.astralRoundAward.textContent = formatMultiplier(toMultiplier);
    return delay(80);
  }
  return new Promise((resolve) => {
    let startedAt = null;
    const draw = (now) => {
      if (startedAt === null) startedAt = now;
      const time = Math.min(1, (now - startedAt) / duration);
      const progress = fromProgress + (toProgress - fromProgress) * time;
      const displayedMultiplier = fromMultiplier + (toMultiplier - fromMultiplier) * time;
      setAstralFlightPosition(progress);
      updateAstralFlightHud(progress, displayedMultiplier);
      ui.astralRoundAward.textContent = formatMultiplier(displayedMultiplier);
      ui.astralFlightWorld.dataset.flightProgress = progress.toFixed(3);
      if (time < 1) window.requestAnimationFrame(draw);
      else resolve();
    };
    window.requestAnimationFrame(draw);
  });
}

function beginAstralFlight(roundIndex, multiplier, bet, multiplierTotal, totalRounds) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const profile = astralFlightProfile(multiplier);
  const cruiseCeiling = Math.min(profile.progress - .08, .32);
  const liveMultiplierCeiling = Math.max(.03, multiplier * .58);
  let currentProgress = .04;
  let currentMultiplier = .01;
  let startedAt = null;
  let frame = 0;
  let landRequested = false;
  let resolveFinished;
  const finished = new Promise((resolve) => { resolveFinished = resolve; });

  ui.astralMultiplierDial.classList.remove("is-landing", "is-landed");
  ui.astralMultiplierDial.classList.add("is-flying");
  ui.astralFreeSpinLabel.textContent = "Flight " + (roundIndex + 1) + " / " + totalRounds;
  ui.astralCascadeLabel.textContent = "Climbing";
  ui.astralRoundAward.textContent = "0.01×";
  ui.astralChoiceProgress.textContent = "Flight " + (roundIndex + 1) + " of " + totalRounds + " · press Play when ready";
  ui.astralFlightWorld.dataset.rarity = astralFlightRarity(multiplier);
  ui.astralFlightWorld.dataset.flightTarget = profile.progress.toFixed(2);
  setAstralFlightPosition(currentProgress);
  updateAstralFlightHud(currentProgress, 0);

  const fly = (now) => {
    if (startedAt === null) startedAt = now;
    const elapsed = now - startedAt;
    currentProgress = Math.min(cruiseCeiling, .04 + elapsed * ASTRAL_FLIGHT_PROGRESS_PER_MS);
    const cruiseRatio = Math.max(0, Math.min(1, (currentProgress - .04) / Math.max(.001, cruiseCeiling - .04)));
    currentMultiplier = .01 + (liveMultiplierCeiling - .01) * cruiseRatio;
    setAstralFlightPosition(currentProgress);
    updateAstralFlightHud(currentProgress, currentMultiplier);
    ui.astralRoundAward.textContent = formatMultiplier(currentMultiplier);
    ui.astralFlightWorld.dataset.flightProgress = currentProgress.toFixed(3);
    frame = window.requestAnimationFrame(fly);
  };
  frame = window.requestAnimationFrame(fly);

  let automaticLand = 0;
  const land = async () => {
    if (landRequested) return finished;
    landRequested = true;
    window.clearTimeout(automaticLand);
    window.cancelAnimationFrame(frame);
    ui.bonusAction.disabled = true;
    ui.astralCascadeLabel.textContent = multiplier >= 5 ? "Afterburner" : "Revealing";
    ui.astralMultiplierDial.classList.remove("is-flying");
    ui.astralMultiplierDial.classList.add("is-landing");
    const remainingDistance = Math.max(0, profile.progress - currentProgress);
    const travelDuration = Math.max(180, remainingDistance / ASTRAL_FLIGHT_PROGRESS_PER_MS);
    await animateAstralFlightLanding({
      fromProgress: currentProgress,
      toProgress: profile.progress,
      fromMultiplier: currentMultiplier,
      toMultiplier: multiplier,
      duration: travelDuration,
      reducedMotion
    });
    ui.astralMultiplierDial.classList.remove("is-landing");
    ui.astralMultiplierDial.classList.add("is-landed");
    ui.astralCascadeLabel.textContent = "Revealed";
    ui.astralRoundAward.textContent = formatMultiplier(multiplier);
    updateAstralFlightHud(profile.progress, multiplier);
    ui.astralChoiceProgress.textContent = "Flight " + (roundIndex + 1) + " of " + totalRounds + " · revealed";
    ui.astralChoiceBar.style.width = (roundIndex + 1) / totalRounds * 100 + "%";
    const lock = ui.astralLockedMultipliers.children[roundIndex];
    if (lock) {
      lock.querySelector("strong").textContent = formatMultiplier(multiplier);
      lock.classList.add("is-locked", "rarity-" + astralFlightRarity(multiplier));
    }
    ui.astralTotalMultiplier.textContent = formatMultiplier(multiplierTotal);
    audio.bonusReveal(roundIndex, multiplier);
    burstParticles(multiplier >= 5 ? 18 : 8, .55);
    ui.bonusMechanicProgress.textContent = (roundIndex + 1) + " / " + totalRounds;
    ui.bonusMechanicBar.style.width = (roundIndex + 1) / totalRounds * 100 + "%";
    await animateCreditValue(ui.bonusTotal, multiplierTotal * bet, 620, { sound: true, tierId: multiplier >= 5 ? "big" : "nice" });
    await cinematicDelay(420);
    resolveFinished();
    return finished;
  };
  const automaticLandDelay = Math.max(160, (cruiseCeiling - .04) / ASTRAL_FLIGHT_PROGRESS_PER_MS);
  automaticLand = window.setTimeout(() => void land(), reducedMotion ? 180 : automaticLandDelay);
  return { finished, land };
}

async function showAstralBonus(bonusRounds, bet, { autoAdvance = false, preview = false, purchased = false } = {}) {
  const game = currentGame();
  const picks = bonusRounds.flat();
  await runAstralCinematicTransition({ preview, multiplierCount: picks.length });
  audio.bonusSceneStart();
  return new Promise((resolve) => {
    ui.bonusOverlay.dataset.mode = "astral-aviator";
    ui.bonusEyebrow.textContent = preview ? "Demo" : purchased ? "Feature buy" : "Bonus";
    $("bonusTitle").textContent = game.featureName;
    ui.bonusCopy.textContent = preview ? "Preview flight" : picks.length + " sealed multiplier flights";
    ui.bonusTotalLabel.textContent = preview ? "Demo" : "Win";
    ui.bonusTotal.textContent = "$0.00";
    ui.bonusMechanicName.textContent = game.bonusMechanicName;
    ui.bonusMechanicProgress.textContent = "0 / " + picks.length;
    ui.bonusMechanicBar.style.width = "0%";
    ui.astralBonusStage.hidden = false;
    ui.astralLockedMultipliers.replaceChildren(...buildAstralFlightLocks(picks.length));
    ui.astralRoundAward.textContent = "0.00×";
    ui.astralTotalMultiplier.textContent = "0.00×";
    ui.astralCascadeLabel.textContent = "Ready";
    ui.astralMultiplierDial.classList.remove("is-flying", "is-landing", "is-landed");
    ui.astralChoiceProgress.textContent = "Flight 1 of " + picks.length;
    ui.astralChoiceBar.style.width = "0%";
    setAstralFlightPosition(.04);
    updateAstralFlightHud(.04, 0);
    ui.constellationPicks.hidden = true;
    ui.constellationPicks.replaceChildren();
    ui.bonusAction.textContent = preview ? "Play" : "Play · flight 1 / " + picks.length;
    ui.bonusAction.disabled = false;
    ui.bonusExit.hidden = true;
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
      audio.bonusSceneEnd();
      ui.bonusOverlay.classList.remove("is-entering", "is-playing", "is-resolved");
      ui.bonusOverlay.hidden = true;
      ui.bonusOverlay.setAttribute("aria-hidden", "true");
      ui.astralBonusStage.hidden = true;
      ui.constellationPicks.hidden = false;
      ui.bonusAction.classList.remove("is-stop");
      ui.bonusExit.hidden = true;
      $("appShell").inert = false;
      resolve();
    };

    const resetFlights = () => {
      completed = false;
      animating = false;
      roundIndex = 0;
      multiplierTotal = 0;
      activeRound = null;
      ui.astralLockedMultipliers.replaceChildren(...buildAstralFlightLocks(picks.length));
      ui.astralRoundAward.textContent = "0.00×";
      ui.astralTotalMultiplier.textContent = "0.00×";
      ui.bonusTotal.textContent = "$0.00";
      ui.bonusMechanicProgress.textContent = "0 / " + picks.length;
      ui.bonusMechanicBar.style.width = "0%";
      ui.astralChoiceBar.style.width = "0%";
      ui.astralChoiceProgress.textContent = "Flight 1 of " + picks.length;
      ui.astralFreeSpinLabel.textContent = "Flight 1 / " + picks.length;
      ui.astralCascadeLabel.textContent = "Ready";
      ui.astralMultiplierDial.classList.remove("is-flying", "is-landing", "is-landed");
      ui.bonusOverlay.classList.remove("is-playing", "is-resolved");
      ui.bonusOverlay.classList.add("is-entering");
      ui.bonusAction.textContent = "Play";
      ui.bonusAction.disabled = false;
      ui.bonusExit.hidden = true;
      setAstralFlightPosition(.04);
      updateAstralFlightHud(.04, 0);
    };

    ui.bonusExit.onclick = close;
    ui.bonusAction.onclick = async () => {
      if (completed) {
        if (preview) {
          resetFlights();
          ui.bonusAction.focus();
        } else close();
        return;
      }
      if (animating && activeRound) {
        await activeRound.land();
        return;
      }
      if (animating) return;
      animating = true;
      ui.bonusOverlay.classList.remove("is-entering");
      ui.bonusOverlay.classList.add("is-playing");
      ui.bonusAction.textContent = "PLAY";
      ui.bonusAction.classList.add("is-stop");
      ui.bonusAction.disabled = false;
      const nextTotal = multiplierTotal + picks[roundIndex];
      activeRound = beginAstralFlight(roundIndex, picks[roundIndex], bet, nextTotal, picks.length);
      await activeRound.finished;
      activeRound = null;
      multiplierTotal = nextTotal;
      roundIndex += 1;
      animating = false;
      ui.bonusAction.classList.remove("is-stop");
      if (roundIndex < picks.length) {
        ui.bonusOverlay.classList.remove("is-playing");
        ui.astralFreeSpinLabel.textContent = "Flight " + (roundIndex + 1) + " / " + picks.length;
        ui.astralCascadeLabel.textContent = "Ready";
        ui.astralChoiceProgress.textContent = "Flight " + (roundIndex + 1) + " of " + picks.length;
        ui.bonusAction.textContent = "Play · flight " + (roundIndex + 1) + " / " + picks.length;
        ui.bonusAction.disabled = false;
        ui.bonusAction.focus();
        return;
      }
      completed = true;
      ui.bonusOverlay.classList.remove("is-playing");
      ui.bonusOverlay.classList.add("is-resolved");
      ui.astralCascadeLabel.textContent = preview ? "Done" : "Complete";
      ui.astralChoiceProgress.textContent = picks.length + " flights revealed";
      ui.astralChoiceBar.style.width = "100%";
      jumpText(ui.astralCascadeLabel);
      playWinChord();
      burstParticles(54, 1.45);
      ui.bonusAction.textContent = preview ? "Play again" : "Collect " + formatMoney(multiplierTotal * bet);
      ui.bonusExit.hidden = !preview;
      ui.bonusAction.disabled = false;
      ui.bonusAction.focus();
    };

    if (autoAdvance) {
      void (async () => {
        await cinematicDelay(650);
        while (!completed) {
          ui.bonusAction.click();
          await cinematicDelay(820);
          if (activeRound) await activeRound.land();
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
    ui.bonusTotal.textContent = "$0.00";
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
    audio.bonusSceneStart();
    burstParticles(28, 1.15);
    let revealed = false;

    ui.bonusAction.onclick = async () => {
      if (revealed) {
        audio.bonusSceneEnd();
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
      ui.bonusAction.textContent = `Collect ${formatMoney(multiplierTotal * bet)}`;
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
  audio.uiOpen();
  const focusTarget = panel === "buy"
    ? ui.featureMarketOverlay.querySelector("[data-buy-feature]")
    : ui.featureMarketOverlay.querySelector(`[data-progress-boost="${state.specialBetBoost}"]`);
  window.requestAnimationFrame(() => focusTarget?.focus());
}

function closeFeatureMarket({ returnFocus = true } = {}) {
  const returnTarget = ui.featureMarketOverlay.dataset.panel === "buy" ? ui.buyFeatureButton : ui.specialBetButton;
  if (!ui.featureMarketOverlay.hidden) audio.uiBack();
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
    visualConfig: { ...state.visualConfig },
    progressBefore,
    outcome
  };
  state.nonce += 1;
  ui.lastWinButton.disabled = false;
  renderReceipt();
  await rotateServerSeed();
  state.isSpinning = false;
  updateUi();
  setStatus(`${costMultiplier}× feature · ${formatMultiplier(outcome.bonusMultiplier)} · won ${formatMoney(outcome.totalWin)}`);
  ui.buyFeatureButton.focus();
}

async function spin({ fromAuto = false } = {}) {
  if (state.isSpinning || (state.autoActive && !fromAuto)) return false;
  const game = currentGame();
  const bet = currentBaseBet();
  const wager = currentSpinWager();
  if (state.balance < wager) {
    setStatus("Balance too low. Reset it below.");
    audio.uiDeny();
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
  ui.reelViewport.classList.remove("has-winners");
  ui.winBanner.classList.remove("is-visible");
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
  startSpinReelLayer(shuffleTick);
  const shuffleTimer = window.setInterval(() => {
    shuffleTick += 1;
    playSpinTick(shuffleTick);
  }, Math.max(58, Math.round(currentAnimation().spinInterval * currentSpinSpeed().shuffleScale * .72)));

  const outcome = await outcomePromise;
  const resultDisplayMs = currentSpinSpeed().resultDisplayMs;
  const remainingDelay = Math.max(0, resultDisplayMs - (performance.now() - startedAt));
  const anticipation = outcome.bonusRounds.length > 0;
  if (anticipation && remainingDelay > 760 && !state.autoStopRequested) {
    await waitForAutoplayResult(remainingDelay - 760, fromAuto);
    if (!state.autoStopRequested) {
      setAnticipationUi(true, game.anticipationCopy);
      setStatus(game.anticipationCopy);
      playAnticipationSound();
      await waitForAutoplayResult(760, fromAuto);
    }
  } else {
    await waitForAutoplayResult(remainingDelay, fromAuto);
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
    setStatus(`Won ${formatMoney(outcome.baseWin)} · ${formatMoney(wager)} bet`);
  } else if (baseOutcomeClass === "partial-return") {
    setStatus(`Won ${formatMoney(outcome.baseWin)} · ${formatMoney(wager)} bet`);
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
    visualConfig: { ...state.visualConfig },
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

  if (totalOutcomeClass === "net-win") setStatus(`Won ${formatMoney(outcome.totalWin)} · ${formatMoney(wager)} bet · receipt ready`);
  else if (totalOutcomeClass === "break-even") setStatus(`Won ${formatMoney(outcome.totalWin)} · receipt ready`);
  else if (totalOutcomeClass === "partial-return") setStatus(`Won ${formatMoney(outcome.totalWin)} · ${formatMoney(wager)} bet · receipt ready`);
  else setStatus("No win · receipt ready");
  if (!fromAuto) ui.spinButton.focus();
  return true;
}

function stopAutoplay(message = "Autoplay stopped") {
  state.autoStopRequested = true;
  if (!state.isSpinning) state.autoActive = false;
  updateUi();
  if (!state.isSpinning) setStatus(message);
}

async function startAutoplay() {
  if (state.isSpinning || state.autoActive) return;
  state.autoActive = true;
  state.autoStopRequested = false;
  updateUi();
  setStatus("Infinite autoplay started · press either Stop control at any time");

  while (state.autoActive && !state.autoStopRequested) {
    const completed = await spin({ fromAuto: true });
    if (!completed) break;
    if (state.autoActive && !state.autoStopRequested) await delay(currentSpinSpeed().autoplayGapMs);
  }

  state.autoActive = false;
  state.autoStopRequested = false;
  updateUi();
  setStatus("Autoplay stopped");
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
  // Subtle premium hover feedback on every interactive control. The engine
  // throttles and randomizes it so it never becomes noise.
  let lastHoveredButton = null;
  document.addEventListener("pointerover", (event) => {
    const button = event.target.closest("button");
    if (!button || button.disabled) {
      lastHoveredButton = null;
      return;
    }
    if (button === lastHoveredButton) return;
    lastHoveredButton = button;
    audio.uiHover();
  });
  $("brandLink").addEventListener("click", (event) => {
    event.preventDefault();
    openLobby();
  });
  ui.lobbyGames.addEventListener("click", (event) => {
    const option = event.target.closest("[data-config-group]");
    if (option) {
      setVisualConfigChoice(option.dataset.configGroup, option.dataset.configId);
      audio.uiSelect([...option.parentElement.children].indexOf(option));
      return;
    }
    if (event.target.closest("[data-factory-next]")) {
      const step = FACTORY_STEPS[state.lobbyStep];
      if (step && state.lobbyChoices[step.key]) {
        if (state.lobbyStep === FACTORY_STEPS.length - 1) chooseLobbyGame();
        else {
          state.lobbyStep += 1;
          updateLobbyStep();
          updateLobbyPreview();
        }
        audio.uiConfirm();
      }
      return;
    }
    if (event.target.closest("[data-factory-back]")) {
      state.lobbyStep = Math.max(0, state.lobbyStep - 1);
      updateLobbyStep();
      updateLobbyPreview();
      audio.uiBack();
      return;
    }
    if (event.target.closest("[data-randomize-world]")) {
      randomizeVisualConfig();
      audio.uiSurprise();
      return;
    }
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
    audio.uiConfirm();
  });
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
      const game = currentGame();
      setStatus(state.specialBetBoost
        ? `Special bet active · +${state.specialBetBoost} guaranteed ${state.specialBetBoost === 1 ? game.collectionName : game.collectionPlural}`
        : "Standard bet active");
      audio.uiConfirm();
    });
  });
  document.querySelectorAll("[data-buy-feature]").forEach((button) => {
    button.addEventListener("click", () => buyAstralFeature(Number(button.dataset.buyFeature)));
  });
  ui.spinButton.addEventListener("click", () => {
    if (state.autoActive) {
      stopAutoplay("Stopping autoplay…");
      return;
    }
    spin();
  });
  ui.speedToggleButton.addEventListener("click", () => {
    selectSpinSpeed(currentSpinSpeed().id === "fast" ? "normal" : "fast");
  });
  ui.autoButton.addEventListener("click", () => {
    if (state.autoActive) {
      stopAutoplay("Stopping autoplay…");
      return;
    }
    startAutoplay();
  });
  ui.soundButton.addEventListener("click", () => {
    setSoundEnabled(!state.soundEnabled, { remember: true, cue: true });
  });

  $("rulesButton").addEventListener("click", () => {
    audio.uiOpen();
    openDialog("rulesDialog");
  });
  $("fairnessButton").addEventListener("click", () => {
    audio.uiOpen();
    openDialog("fairnessDialog");
  });
  ui.lastWinButton.addEventListener("click", () => {
    renderWinDetails();
    audio.uiOpen();
    openDialog("winDetailsDialog");
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      audio.uiBack();
      $(button.dataset.closeDialog)?.close();
    });
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
    audio.stopSpinLoop({ immediate: true });
    setAnticipationUi(false);
    ui.reelViewport.classList.remove("is-spinning", "is-stopping");
    ui.reelImpactLayer.replaceChildren();
    setStatus("Balance reset. All four feature meters start anew.");
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
  restoreVisualConfig();
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
