import { randomSeed, sha256Hex } from "./fairness.js";
import { SlotAudioEngine } from "./experience-engine.js";
import {
  COLS,
  DEFAULT_GAME_ID,
  GAMES,
  PAYLINES,
  ROWS,
  cellIndex,
  getGame,
  theoreticalRtp,
  simulateSpin
} from "./game-model.js";
import { emptyGameStats, naturalNearMissFor, outcomeClassFor, recordGameResult, winTierFor } from "./presentation.js";

const BET_OPTIONS = [1, 2, 5, 10, 20];
const MIN_RESULT_DISPLAY_MS = 2500;
const INITIAL_BALANCE = 1000;
const REALITY_CHECK_INTERVAL_MINUTES = 15;
const SYMBOL_SHEET_INDEX = { luma: 0, orbit: 1, nova: 2, comet: 3, dew: 4, leaf: 5, petal: 6 };

const $ = (id) => document.getElementById(id);
const ui = {
  balance: $("balance"),
  sessionNet: $("sessionNet"),
  sessionTime: $("sessionTime"),
  sessionClockButton: $("sessionClockButton"),
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
  paylineOverlay: $("paylineOverlay"),
  nearMissBanner: $("nearMissBanner"),
  nearMissCopy: $("nearMissCopy"),
  resultStatus: $("resultStatus"),
  winBanner: $("winBanner"),
  winBannerAmount: $("winBannerAmount"),
  winBannerLabel: $("winBannerLabel"),
  winBannerMultiplier: $("winBannerMultiplier"),
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
  turboButton: $("turboButton"),
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
  astralBonusStage: $("astralBonusStage"),
  astralBonusGrid: $("astralBonusGrid"),
  astralFreeSpinLabel: $("astralFreeSpinLabel"),
  astralCascadeLabel: $("astralCascadeLabel"),
  astralRoundAward: $("astralRoundAward"),
  lossLimitSelect: $("lossLimitSelect"),
  lossLimitStatus: $("lossLimitStatus"),
  realityCheckDialog: $("realityCheckDialog"),
  realityTime: $("realityTime"),
  realitySpins: $("realitySpins"),
  realityWagered: $("realityWagered"),
  realityWon: $("realityWon"),
  realityNet: $("realityNet"),
  realityLimit: $("realityLimit"),
  continueSession: $("continueSession"),
  realityChooseGame: $("realityChooseGame")
};

const state = {
  balance: INITIAL_BALANCE,
  sessionNet: 0,
  betIndex: 1,
  gameId: DEFAULT_GAME_ID,
  progress: Object.fromEntries(Object.keys(GAMES).map((gameId) => [gameId, 0])),
  gameStats: Object.fromEntries(Object.keys(GAMES).map((gameId) => [gameId, emptyGameStats()])),
  sessionStartedAt: Date.now(),
  sessionSpins: 0,
  sessionWagered: 0,
  sessionWon: 0,
  lossLimit: 100,
  lastRealityCheckMinute: 0,
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
  turboMode: false,
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

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function jumpText(element) {
  if (!element) return;
  element.classList.remove("is-jumping");
  void element.offsetWidth;
  element.classList.add("is-jumping");
}

function formatElapsed(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function sessionLoss() {
  return Math.max(0, -state.sessionNet);
}

function updateSessionSafetyUi() {
  const elapsed = Date.now() - state.sessionStartedAt;
  ui.sessionTime.textContent = formatElapsed(elapsed);
  ui.lossLimitStatus.textContent = `${formatCredits(sessionLoss())} of ${formatCredits(state.lossLimit)} CR net loss`;
  ui.lossLimitStatus.classList.toggle("is-close", sessionLoss() >= state.lossLimit * .75);
}

function renderRealityCheck() {
  ui.realityTime.textContent = formatElapsed(Date.now() - state.sessionStartedAt);
  ui.realitySpins.textContent = String(state.sessionSpins);
  ui.realityWagered.textContent = `${formatCredits(state.sessionWagered)} CR`;
  ui.realityWon.textContent = `${formatCredits(state.sessionWon)} CR`;
  const sign = state.sessionNet > 0 ? "+" : "";
  ui.realityNet.textContent = `${sign}${formatCredits(state.sessionNet)} CR`;
  ui.realityNet.className = state.sessionNet > 0 ? "positive" : state.sessionNet < 0 ? "negative" : "neutral";
  ui.realityLimit.textContent = `${formatCredits(state.lossLimit)} CR`;
  if (!ui.realityCheckDialog.open) ui.realityCheckDialog.showModal();
}

function tickSessionClock() {
  updateSessionSafetyUi();
  const elapsedMinutes = Math.floor((Date.now() - state.sessionStartedAt) / 60000);
  const scheduledMinute = state.lastRealityCheckMinute + REALITY_CHECK_INTERVAL_MINUTES;
  const overlayOpen = !ui.lobbyOverlay.hidden || !ui.bonusOverlay.hidden || !ui.celebrationOverlay.hidden;
  const otherDialogOpen = Boolean(document.querySelector("dialog[open]:not(#realityCheckDialog)"));
  if (elapsedMinutes >= scheduledMinute && !state.isSpinning && !overlayOpen && !otherDialogOpen && !ui.realityCheckDialog.open) {
    state.lastRealityCheckMinute = elapsedMinutes;
    renderRealityCheck();
  }
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

function renderGrid(grid, { shuffling = false, settling = false, winnerCells = new Set(), nearMiss = null } = {}) {
  const fragment = document.createDocumentFragment();
  const nearMatchCells = new Set(nearMiss?.matchCells ?? []);
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const index = cellIndex(col, row);
      const id = grid[index];
      const cell = document.createElement("div");
      cell.className = "symbol-cell";
      if (shuffling) cell.classList.add("is-shuffling");
      if (settling) cell.classList.add("is-settling");
      if (winnerCells.has(index)) cell.classList.add("is-winner");
      if (nearMatchCells.has(index)) cell.classList.add("is-near-match");
      if (nearMiss?.breakCell === index) cell.classList.add("is-line-break");
      if (id === "petal") cell.classList.add("is-scatter");
      cell.dataset.symbol = id;
      cell.dataset.col = String(col);
      cell.dataset.row = String(row);
      cell.style.gridColumn = String(col + 1);
      cell.style.gridRow = String(row + 1);
      cell.style.setProperty("--delay", `${col * 65 + row * 22}ms`);
      cell.style.setProperty("--col", String(col));
      cell.style.setProperty("--row", String(row));
      cell.style.setProperty("--motion-delay", `${-(col * 48 + row * 24)}ms`);
      cell.style.setProperty("--stop-delay", `${col * currentGame().reelStopGap + row * 18}ms`);
      cell.style.setProperty("--symbol-glow", symbolGlow(id));
      const symbolName = currentSymbols().find((symbol) => symbol.id === id)?.name ?? id;
      cell.setAttribute("aria-label", symbolName);
      cell.innerHTML = `${symbolGraphic(id)}<span class="symbol-name-tag">${symbolName}</span>`;
      fragment.append(cell);
    }
  }
  ui.reels.replaceChildren(fragment);
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
  const bet = BET_OPTIONS[state.betIndex];
  ui.balance.textContent = formatCredits(state.balance);
  ui.betAmount.textContent = formatCredits(bet);
  ui.spinButton.setAttribute("aria-label", `${currentGame().actionLabel} spin for ${formatCredits(bet)} credits`);
  const controlsLocked = state.isSpinning || state.autoActive;
  ui.betDown.disabled = controlsLocked || state.betIndex === 0;
  ui.betUp.disabled = controlsLocked || state.betIndex === BET_OPTIONS.length - 1;
  ui.maxBetButton.disabled = controlsLocked || state.betIndex === BET_OPTIONS.length - 1;
  ui.spinButton.disabled = controlsLocked;
  ui.astralShowcaseButton.disabled = controlsLocked || state.gameId !== "astral";
  ui.saveClientSeed.disabled = controlsLocked;
  ui.clientSeedInput.disabled = controlsLocked;
  ui.autoButton.disabled = state.isSpinning && !state.autoActive;
  ui.autoButton.classList.toggle("is-running", state.autoActive);
  ui.autoButton.innerHTML = state.autoActive
    ? `<span aria-hidden="true">■</span><strong>${state.autoRemaining}</strong>`
    : `<span aria-hidden="true">↻</span><strong>10 · 25 · 50</strong>`;
  ui.turboButton.classList.toggle("is-active", state.turboMode);
  ui.turboButton.setAttribute("aria-pressed", String(state.turboMode));
  ui.turboButton.setAttribute("aria-label", state.turboMode ? "Turn turbo spins off" : "Turn turbo spins on");
  ui.turboButton.disabled = controlsLocked;
  document.querySelectorAll(".game-choice").forEach((button) => { button.disabled = controlsLocked; });

  const sign = state.sessionNet > 0 ? "+" : "";
  ui.sessionNet.textContent = `${sign}${formatCredits(state.sessionNet)} CR`;
  ui.sessionNet.className = state.sessionNet > 0 ? "positive" : state.sessionNet < 0 ? "negative" : "neutral";
  renderPetalMeter();
  renderGameStats();
  updateSessionSafetyUi();
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
    const lobbyBackground = game.id === "astral" ? "./assets/astral-cabinet-two-guardians-v1.png" : game.background;
    button.style.setProperty("--lobby-bg", `url("${lobbyBackground}")`);
    button.style.setProperty("--lobby-accent", game.accent);
    button.innerHTML = `
      <span class="lobby-game-art" aria-hidden="true"></span>
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
  ui.featureCard.dataset.game = game.id;
  ui.featureVisual.dataset.meter = game.meterMode;
  ui.reels.dataset.motion = game.reelMotion;
  gameStage.style.setProperty("--game-bg", `url("${game.background}")`);
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
  audio.stopSpinLoop({ immediate: true });
  setAnticipationUi(false);
  ui.reelViewport.classList.remove("is-spinning", "is-stopping");
  ui.reelImpactLayer.replaceChildren();
  renderPaylineOverlay();
  ui.nearMissBanner.hidden = true;
  ui.nearMissBanner.classList.remove("is-visible");
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

function findNaturalNearMiss(outcome) {
  if (outcome.wins.length > 0) return null;
  const nearMiss = naturalNearMissFor(outcome.grid, PAYLINES, cellIndex);
  if (!nearMiss) return null;
  return {
    ...nearMiss,
    symbolName: currentSymbols().find((symbol) => symbol.id === nearMiss.symbolId)?.name ?? nearMiss.symbolId,
    breakName: currentSymbols().find((symbol) => symbol.id === nearMiss.breakSymbolId)?.name ?? nearMiss.breakSymbolId
  };
}

function paylinePoints(rows, count = COLS) {
  return rows.slice(0, count).map((row, col) => `${col * 100 + 50},${row * 100 + 50}`).join(" ");
}

function renderPaylineOverlay(outcome = null, nearMiss = null) {
  if (!outcome) {
    ui.paylineOverlay.replaceChildren();
    return;
  }
  const palette = ["#6be4ff", "#f5d899", "#ff8fda", "#89f3c1", "#ff755f"];
  const winLines = outcome.wins.slice(0, 6).map((win, index) => {
    const rows = PAYLINES[win.line - 1];
    const color = palette[index % palette.length];
    const lineDelay = index * 240;
    const nodes = rows.slice(0, win.count).map((row, col) => `<circle class="payline-win-node" style="--line-color:${color};--line-delay:${lineDelay}ms" cx="${col * 100 + 50}" cy="${row * 100 + 50}" r="8"></circle>`).join("");
    return `<polyline class="payline-shadow" style="--line-delay:${lineDelay}ms" points="${paylinePoints(rows, win.count)}"></polyline><polyline class="payline-win" style="--line-color:${color};--line-delay:${lineDelay}ms" points="${paylinePoints(rows, win.count)}"></polyline>${nodes}<text class="payline-label" style="--line-delay:${lineDelay}ms" x="${Math.min(win.count * 100 - 42, 440)}" y="${rows[Math.min(win.count - 1, rows.length - 1)] * 100 + 42}">L${win.line} · ${formatCredits(win.amount)} CR</text>`;
  }).join("");
  let nearLine = "";
  if (nearMiss) {
    const breakX = 250;
    const breakY = nearMiss.rows[2] * 100 + 50;
    nearLine = `<polyline class="payline-near" points="${paylinePoints(nearMiss.rows, 3)}"></polyline><circle class="payline-node" cx="50" cy="${nearMiss.rows[0] * 100 + 50}" r="10"></circle><circle class="payline-node" cx="150" cy="${nearMiss.rows[1] * 100 + 50}" r="10"></circle><path class="payline-break" d="M${breakX - 10} ${breakY - 10}L${breakX + 10} ${breakY + 10}M${breakX + 10} ${breakY - 10}L${breakX - 10} ${breakY + 10}"></path><text class="payline-label near-label" x="270" y="${Math.max(24, breakY - 15)}">LINE ${nearMiss.line} · NO PAYOUT</text>`;
  }
  ui.paylineOverlay.innerHTML = winLines || nearLine;
}

function showNaturalNearMiss(nearMiss) {
  if (!nearMiss) return;
  ui.nearMissCopy.textContent = `Line ${nearMiss.line}: two ${nearMiss.symbolName} symbols connected, then ${nearMiss.breakName} broke the line on reel 3.`;
  ui.nearMissBanner.hidden = false;
  ui.nearMissBanner.setAttribute("aria-hidden", "false");
  ui.nearMissBanner.classList.add("is-visible");
  playNearMissCue();
  window.setTimeout(() => {
    ui.nearMissBanner.classList.remove("is-visible");
    ui.nearMissBanner.hidden = true;
    ui.nearMissBanner.setAttribute("aria-hidden", "true");
  }, 3200);
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

function playNearMissCue() {
  audio.nearMiss();
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
  audio.winTier(tierId);
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
      const progress = Math.min(1, (now - start) / duration);
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

function showWinBanner(amount, bet) {
  const tier = winTierFor(amount, bet);
  ui.winBanner.dataset.tier = tier.id;
  ui.winBannerLabel.textContent = tier.id === "nice" ? `Nice ${currentGame().shortName} win` : `${currentGame().shortName} win`;
  ui.winBannerMultiplier.textContent = `${(amount / bet).toFixed(2)}× bet`;
  ui.winBannerAmount.textContent = "0.00 CR";
  ui.winBanner.classList.add("is-visible");
  jumpText(ui.winBannerLabel);
  jumpText(ui.winBannerAmount);
  audio.winVoice();
  void animateCreditValue(ui.winBannerAmount, amount, tier.id === "nice" ? 1050 : 720, { sound: true, tierId: tier.id })
    .then(() => jumpText(ui.winBannerAmount));
  window.setTimeout(() => ui.winBanner.classList.remove("is-visible"), tier.id === "nice" ? 2100 : 1650);
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

async function settleOutcome(outcome, nearMiss = null) {
  const game = currentGame();
  setAnticipationUi(false);
  audio.stopSpinLoop();
  ui.reelViewport.classList.remove("is-spinning");
  ui.reelViewport.classList.add("is-stopping");
  if (state.gameId === "astral") {
    ui.reels.classList.add("is-board-clearing");
    await cinematicDelay(280);
  }
  renderGrid(outcome.grid, { settling: true, winnerCells: winningCells(outcome), nearMiss });
  ui.reels.classList.remove("is-board-clearing");
  if (state.gameId === "astral") ui.reels.classList.add("is-cinematic-drop");
  renderPaylineOverlay();
  for (let reel = 0; reel < COLS; reel += 1) {
    const collector = Array.from({ length: ROWS }, (_, row) => outcome.grid[cellIndex(reel, row)]).includes("petal");
    window.setTimeout(() => {
      playReelStopSound(reel);
      flashReelStop(reel, { collector, final: reel === COLS - 1 });
    }, reel * game.reelStopGap);
  }
  await delay(game.reelStopGap * (COLS - 1) + 620);
  ui.reels.classList.remove("is-cinematic-drop");
  ui.reelViewport.classList.remove("is-stopping");
  renderPaylineOverlay(outcome, nearMiss);
  sequenceLineWinSounds(outcome, BET_OPTIONS[state.betIndex]);
}

function receiptOutcomeLabel(outcome) {
  const resultHash = outcome.grid.map((id) => id[0].toUpperCase()).join("");
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
    progressBefore: outcome.progressBefore,
    progressAfter: outcome.progressAfter,
    petalsBefore: outcome.petalsBefore,
    petalsAfter: outcome.petalsAfter,
    bonusRounds: outcome.bonusRounds,
    baseWin: outcome.baseWin,
    bonusMultiplier: outcome.bonusMultiplier,
    bonusWin: outcome.bonusWin,
    totalWin: outcome.totalWin
  });
}

async function verifyLastSpin() {
  if (!state.lastReceipt) return;
  ui.verifyButton.disabled = true;
  ui.verifyResult.className = "verify-result";
  ui.verifyResult.textContent = "Replaying SHA-256 stream and game mapping…";
  const receipt = state.lastReceipt;
  const [hash, replayed] = await Promise.all([
    sha256Hex(receipt.serverSeed),
    simulateSpin(receipt)
  ]);
  const hashMatches = hash === receipt.serverHash;
  const outcomeMatches = stableOutcome(replayed) === stableOutcome(receipt.outcome);
  const valid = hashMatches && outcomeMatches;
  ui.verifyResult.className = `verify-result ${valid ? "is-valid" : "is-invalid"}`;
  ui.verifyResult.textContent = valid
    ? `✓ Verified. The pre-spin hash matches, and all 20 symbols, line wins, feature progress, and bonus prizes replay exactly.`
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
  const lines = outcome.wins.length
    ? outcome.wins.map((win) => `<div class="win-line-item"><span>Line ${win.line} · <b>${win.count}× ${win.symbolName}</b></span><strong>${formatCredits(win.amount)} CR</strong></div>`).join("")
    : `<div class="win-line-item"><span>No line wins on this result</span><strong>0.00 CR</strong></div>`;
  const bonus = outcome.bonusWin > 0
    ? `<div class="win-line-item"><span>${game.featureName} · <b>${outcome.bonusMultiplier}× total bet</b></span><strong>${formatCredits(outcome.bonusWin)} CR</strong></div>`
    : "";
  ui.winDetailsContent.innerHTML = `<div class="win-summary"><div><span>${game.name} total</span><strong>${formatCredits(outcome.totalWin)} CR</strong></div><div><span>${game.collectionPlural} landed</span><strong>${outcome.collectorCount}</strong></div></div><div class="win-line-list">${lines}${bonus}</div>`;
}

function cinematicDelay(milliseconds) {
  return delay(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? Math.min(80, milliseconds) : milliseconds);
}

async function runAstralCinematicTransition({ preview = false } = {}) {
  ui.cinematicOverlay.dataset.phase = "sleeping";
  ui.cinematicTitle.textContent = preview ? "Preview" : "Awaken";
  ui.cinematicCopy.textContent = preview ? "No wager" : "Moonwell opening";
  ui.cinematicAward.textContent = preview ? "SHOWCASE" : "3 SPINS";
  ui.cinematicOverlay.hidden = false;
  ui.cinematicOverlay.setAttribute("aria-hidden", "false");
  $("appShell").inert = true;
  audio.bonusStart();
  await cinematicDelay(120);
  ui.cinematicOverlay.dataset.phase = "emerging";
  await cinematicDelay(1050);
  ui.cinematicOverlay.dataset.phase = "awakened";
  ui.cinematicTitle.textContent = "Moonwell";
  ui.cinematicCopy.textContent = preview ? "No payout" : "Sealed prizes";
  ui.cinematicAward.textContent = "3 SPINS";
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

function astralBonusLayout(roundIndex, variant = 0) {
  const ids = ["luma", "orbit", "nova", "comet", "dew", "leaf"];
  return Array.from({ length: COLS * ROWS }, (_, index) => {
    const col = Math.floor(index / ROWS);
    const row = index % ROWS;
    return ids[(index * 3 + col + roundIndex * 2 + variant * 5 + row) % ids.length];
  });
}

function astralCascadeCells(roundIndex) {
  const patterns = [
    [0, 5, 10, 15],
    [3, 6, 9, 12, 15],
    [1, 4, 7, 10, 13, 16]
  ];
  return patterns[roundIndex % patterns.length];
}

function renderAstralBonusGrid(roundIndex, variant = 0) {
  const fragment = document.createDocumentFragment();
  const layout = astralBonusLayout(roundIndex, variant);
  layout.forEach((symbolId, index) => {
    const col = Math.floor(index / ROWS);
    const row = index % ROWS;
    const cell = document.createElement("div");
    const symbolName = currentSymbols().find((symbol) => symbol.id === symbolId)?.name ?? symbolId;
    cell.className = "astral-bonus-cell is-dropping";
    cell.dataset.symbol = symbolId;
    cell.dataset.index = String(index);
    cell.style.setProperty("--drop-delay", `${col * 85 + row * 42}ms`);
    cell.style.gridColumn = String(col + 1);
    cell.style.gridRow = String(row + 1);
    cell.setAttribute("aria-label", symbolName);
    cell.innerHTML = symbolGraphic(symbolId);
    fragment.append(cell);
  });
  ui.astralBonusGrid.replaceChildren(fragment);
}

async function playAstralFreeSpin(roundIndex, multiplier, bet, multiplierTotal) {
  ui.astralFreeSpinLabel.textContent = `${roundIndex + 1} / 3`;
  ui.astralCascadeLabel.textContent = "↓";
  ui.astralRoundAward.textContent = "0.00×";
  ui.astralBonusGrid.classList.remove("is-cascade-impact", "is-refilling");
  ui.astralBonusGrid.classList.add("is-clearing-board");
  await cinematicDelay(roundIndex === 0 ? 120 : 360);
  renderAstralBonusGrid(roundIndex, 0);
  ui.astralBonusGrid.classList.remove("is-clearing-board");
  await cinematicDelay(920);

  const winningIndexes = astralCascadeCells(roundIndex);
  ui.astralCascadeLabel.textContent = `${multiplier.toFixed(2)}×`;
  jumpText(ui.astralCascadeLabel);
  winningIndexes.forEach((index) => ui.astralBonusGrid.querySelector(`[data-index="${index}"]`)?.classList.add("is-cascade-win"));
  ui.astralBonusGrid.classList.add("is-cascade-impact");
  audio.bonusReveal(roundIndex, multiplier);
  burstParticles(22, .78);
  await cinematicDelay(620);

  winningIndexes.forEach((index) => ui.astralBonusGrid.querySelector(`[data-index="${index}"]`)?.classList.add("is-clearing"));
  await cinematicDelay(430);
  ui.astralBonusGrid.classList.remove("is-cascade-impact");
  ui.astralBonusGrid.classList.add("is-refilling");
  const refill = astralBonusLayout(roundIndex, 1);
  winningIndexes.forEach((index, refillIndex) => {
    const cell = ui.astralBonusGrid.querySelector(`[data-index="${index}"]`);
    if (!cell) return;
    const symbolId = refill[(index + refillIndex) % refill.length];
    cell.className = "astral-bonus-cell is-refill";
    cell.dataset.symbol = symbolId;
    cell.innerHTML = symbolGraphic(symbolId);
  });
  await cinematicDelay(650);
  ui.astralRoundAward.textContent = `${multiplier.toFixed(2)}×`;
  jumpText(ui.astralRoundAward);
  ui.bonusMechanicProgress.textContent = `${roundIndex + 1} / 3`;
  ui.bonusMechanicBar.style.width = `${(roundIndex + 1) / 3 * 100}%`;
  void animateCreditValue(ui.bonusTotal, multiplierTotal * bet, 520, { sound: true, tierId: multiplier >= 5 ? "big" : "nice" });
  await cinematicDelay(620);
}

async function showAstralBonus(bonusRounds, bet, { autoAdvance = false, preview = false } = {}) {
  const picks = bonusRounds.flat().slice(0, 3);
  await runAstralCinematicTransition({ preview });
  return new Promise((resolve) => {
    ui.bonusOverlay.dataset.mode = "cinematic-free-spins";
    ui.bonusEyebrow.textContent = preview ? "Preview" : "Bonus";
    $("bonusTitle").textContent = "Moonwell";
    ui.bonusCopy.textContent = preview ? "No wager · no payout" : "3 sealed spins";
    ui.bonusTotalLabel.textContent = preview ? "Preview" : "Win";
    ui.bonusTotal.textContent = "0.00 CR";
    ui.bonusMechanicName.textContent = "3 Spins";
    ui.bonusMechanicProgress.textContent = `0 / ${picks.length}`;
    ui.bonusMechanicBar.style.width = "0%";
    ui.astralBonusStage.hidden = false;
    ui.constellationPicks.hidden = true;
    ui.constellationPicks.replaceChildren();
    ui.bonusAction.textContent = preview ? "Start" : `Start ${picks.length}`;
    ui.bonusAction.disabled = false;
    ui.bonusOverlay.hidden = false;
    ui.bonusOverlay.setAttribute("aria-hidden", "false");
    ui.bonusOverlay.classList.remove("is-playing", "is-resolved");
    ui.bonusOverlay.classList.add("is-entering");
    $("appShell").inert = true;
    ui.bonusAction.focus();
    let completed = false;

    const close = () => {
      ui.bonusOverlay.classList.remove("is-entering", "is-playing", "is-resolved");
      ui.bonusOverlay.hidden = true;
      ui.bonusOverlay.setAttribute("aria-hidden", "true");
      ui.astralBonusStage.hidden = true;
      ui.constellationPicks.hidden = false;
      $("appShell").inert = false;
      resolve();
    };

    ui.bonusAction.onclick = async () => {
      if (completed) {
        close();
        return;
      }
      completed = true;
      ui.bonusOverlay.classList.remove("is-entering");
      ui.bonusOverlay.classList.add("is-playing");
      ui.bonusAction.disabled = true;
      let multiplierTotal = 0;
      for (let index = 0; index < picks.length; index += 1) {
        multiplierTotal += picks[index];
        await playAstralFreeSpin(index, picks[index], bet, multiplierTotal);
      }
      ui.bonusOverlay.classList.remove("is-playing");
      ui.bonusOverlay.classList.add("is-resolved");
      ui.astralCascadeLabel.textContent = preview ? "Done" : "Complete";
      jumpText(ui.astralCascadeLabel);
      playWinChord();
      burstParticles(54, 1.45);
      ui.bonusAction.textContent = preview ? "Close" : `+${formatCredits(multiplierTotal * bet)} CR`;
      ui.bonusAction.disabled = false;
      ui.bonusAction.focus();
    };

    if (autoAdvance) {
      void (async () => {
        await cinematicDelay(650);
        await ui.bonusAction.onclick();
        await cinematicDelay(900);
        await ui.bonusAction.onclick();
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

async function runAstralShowcasePreview() {
  if (state.gameId !== "astral" || state.isSpinning || state.autoActive || !state.ageConfirmed || !ui.lobbyOverlay.hidden) return;
  state.isSpinning = true;
  ui.astralShowcaseButton.disabled = true;
  updateUi();
  setStatus(state.soundEnabled ? "Astral cinematic preview · no wager · no payout" : "Astral cinematic preview · turn sound on afterward to hear the full mix");
  try {
    await showAstralBonus([[0.5, 1, 3]], 1, { autoAdvance: true, preview: true });
    setStatus("Astral cinematic preview complete · no credits or feature progress changed");
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
  const bet = BET_OPTIONS[state.betIndex];
  if (sessionLoss() >= state.lossLimit) {
    setStatus(`Session loss limit reached at ${formatCredits(state.lossLimit)} CR. Review the session before continuing.`);
    state.autoStopRequested = true;
    renderRealityCheck();
    return false;
  }
  if (state.balance < bet) {
    setStatus("Not enough demo credits. Reset the free-play balance below.");
    playTone(170, .2, "square");
    state.autoStopRequested = true;
    return false;
  }

  state.isSpinning = true;
  state.balance -= bet;
  state.sessionNet -= bet;
  state.sessionSpins += 1;
  state.sessionWagered += bet;
  updateUi();
  ui.spinButton.classList.add("is-spinning");
  setAnticipationUi(false);
  ui.reelViewport.classList.remove("is-stopping");
  ui.reelViewport.classList.add("is-spinning");
  ui.winBanner.classList.remove("is-visible");
  renderPaylineOverlay();
  ui.nearMissBanner.hidden = true;
  ui.nearMissBanner.classList.remove("is-visible");
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
    gameId: state.gameId
  });

  let shuffleTick = 0;
  renderGrid(cosmeticGrid(shuffleTick), { shuffling: true });
  const shuffleTimer = window.setInterval(() => {
    shuffleTick += 1;
    renderGrid(cosmeticGrid(shuffleTick), { shuffling: true });
    playSpinTick(shuffleTick);
  }, game.spinInterval);

  const outcome = await outcomePromise;
  const nearMiss = outcome.bonusRounds.length === 0 ? findNaturalNearMiss(outcome) : null;
  const resultDisplayMs = state.turboMode ? 900 : MIN_RESULT_DISPLAY_MS;
  const remainingDelay = Math.max(0, resultDisplayMs - (performance.now() - startedAt));
  const anticipation = outcome.bonusRounds.length > 0;
  if (anticipation && remainingDelay > 760) {
    await delay(remainingDelay - 760);
    setAnticipationUi(true, game.anticipationCopy);
    setStatus(game.anticipationCopy);
    playAnticipationSound();
    await delay(760);
  } else {
    await delay(remainingDelay);
  }
  window.clearInterval(shuffleTimer);

  await settleOutcome(outcome, nearMiss);
  if (nearMiss) showNaturalNearMiss(nearMiss);
  state.progress[state.gameId] = outcome.progressAfter;
  state.lastOutcome = outcome;
  state.balance += outcome.baseWin;
  state.sessionNet += outcome.baseWin;
  updateUi();
  const baseOutcomeClass = outcomeClassFor(outcome.baseWin, bet);

  if (outcome.collectorCount > 0) {
    const collectorLabel = outcome.collectorCount === 1 ? game.collectionName : game.collectionPlural;
    setStatus(`${outcome.collectorCount} ${collectorLabel} collected · ${state.progress[state.gameId]}/${game.threshold} charged`);
    playCollectSound(outcome.collectorCount);
    burstParticles(8 + outcome.collectorCount * 3, .55);
  } else if (baseOutcomeClass === "net-win") {
    setStatus(`${outcome.wins.length} line win${outcome.wins.length === 1 ? "" : "s"} illuminated`);
  } else if (baseOutcomeClass === "break-even") {
    setStatus(`Bet returned exactly · ${formatCredits(outcome.baseWin)} CR returned on ${formatCredits(bet)} CR bet`);
  } else if (baseOutcomeClass === "partial-return") {
    setStatus(`Partial return ${formatCredits(outcome.baseWin)} CR · net result −${formatCredits(bet - outcome.baseWin)} CR`);
  } else {
    setStatus(`No win this spin. ${game.featureName} keeps your progress.`);
  }

  if (baseOutcomeClass === "net-win") {
    showWinBanner(outcome.baseWin, bet);
    playWinChord();
    burstParticles(outcome.baseWin >= bet * 10 ? 42 : 18, outcome.baseWin >= bet * 10 ? 1.25 : .75);
    if (outcome.baseWin >= bet * 10) document.querySelector(".machine").classList.add("is-big-win");
    window.setTimeout(() => document.querySelector(".machine")?.classList.remove("is-big-win"), 900);
  }

  if (outcome.bonusRounds.length > 0) {
    setStatus(`${game.featureName} complete · bonus unlocked`);
    await delay(650);
    await showBonus(outcome.bonusRounds, bet, { autoAdvance: fromAuto });
    state.balance += outcome.bonusWin;
    state.sessionNet += outcome.bonusWin;
    updateUi();
  }

  state.sessionWon += outcome.totalWin;
  state.gameStats[state.gameId] = recordGameResult(state.gameStats[state.gameId], outcome.totalWin, bet);
  updateUi();
  const totalOutcomeClass = outcomeClassFor(outcome.totalWin, bet);
  if (outcome.bonusWin > 0 && totalOutcomeClass === "net-win") showWinBanner(outcome.totalWin, bet);
  await showCelebration(outcome.totalWin, bet, { autoAdvance: fromAuto });

  state.lastReceipt = {
    serverSeed: spinServerSeed,
    serverHash: spinServerHash,
    clientSeed: spinClientSeed,
    nonce: spinNonce,
    bet,
    gameId: state.gameId,
    progressBefore,
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

  if (totalOutcomeClass === "net-win") setStatus(`Net win +${formatCredits(outcome.totalWin - bet)} CR · ${formatCredits(outcome.totalWin)} CR returned · receipt ready`);
  else if (totalOutcomeClass === "break-even") setStatus(`Break-even result · ${formatCredits(outcome.totalWin)} CR returned · receipt ready`);
  else if (nearMiss && totalOutcomeClass === "partial-return") setStatus(`Line ${nearMiss.line}: two ${nearMiss.symbolName} connected, reel 3 broke the line · partial return ${formatCredits(outcome.totalWin)} CR`);
  else if (nearMiss) setStatus(`Line ${nearMiss.line}: two ${nearMiss.symbolName} connected, reel 3 broke the line · no payout`);
  else if (totalOutcomeClass === "partial-return") setStatus(`Partial return ${formatCredits(outcome.totalWin)} CR · net −${formatCredits(bet - outcome.totalWin)} CR · receipt ready`);
  else setStatus(`No return · net −${formatCredits(bet)} CR · receipt ready`);
  if (sessionLoss() >= state.lossLimit) {
    state.autoStopRequested = true;
    renderRealityCheck();
  }
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
    if (state.autoRemaining > 0 && state.autoActive && !state.autoStopRequested) await delay(state.turboMode ? 180 : 650);
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

function bindEvents() {
  ui.sessionClockButton.addEventListener("click", renderRealityCheck);
  ui.lossLimitSelect.addEventListener("change", () => {
    state.lossLimit = Number(ui.lossLimitSelect.value);
    updateSessionSafetyUi();
    setStatus(`Session loss limit set to ${formatCredits(state.lossLimit)} CR`);
  });
  ui.continueSession.addEventListener("click", () => ui.realityCheckDialog.close());
  ui.realityChooseGame.addEventListener("click", () => {
    ui.realityCheckDialog.close();
    openLobby();
  });
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
  ui.spinButton.addEventListener("click", () => spin());
  ui.turboButton.addEventListener("click", () => {
    if (state.isSpinning || state.autoActive) return;
    state.turboMode = !state.turboMode;
    updateUi();
    setStatus(state.turboMode ? "Turbo on" : "Turbo off");
    playTone(state.turboMode ? 880 : 440, .12, "triangle");
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
    state.soundEnabled = !state.soundEnabled;
    audio.setEnabled(state.soundEnabled);
    ui.soundButton.setAttribute("aria-pressed", String(state.soundEnabled));
    ui.soundButton.setAttribute("aria-label", state.soundEnabled ? "Turn sound off" : "Turn sound on");
    if (state.soundEnabled) audio.interfaceOn();
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
    state.sessionNet = 0;
    state.progress = Object.fromEntries(Object.keys(GAMES).map((gameId) => [gameId, 0]));
    state.gameStats = Object.fromEntries(Object.keys(GAMES).map((gameId) => [gameId, emptyGameStats()]));
    state.sessionStartedAt = Date.now();
    state.sessionSpins = 0;
    state.sessionWagered = 0;
    state.sessionWon = 0;
    state.lastRealityCheckMinute = 0;
    state.lastOutcome = null;
    ui.lastWinButton.disabled = true;
    audio.stopSpinLoop({ immediate: true });
    setAnticipationUi(false);
    ui.reelViewport.classList.remove("is-spinning", "is-stopping");
    ui.reelImpactLayer.replaceChildren();
    renderPaylineOverlay();
    ui.nearMissBanner.hidden = true;
    setStatus("Demo balance reset. All four feature meters start anew.");
    updateUi();
  });

  window.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || event.repeat) return;
    const activeTag = document.activeElement?.tagName;
    const dialogOpen = Boolean(document.querySelector("dialog[open]"));
    if (["INPUT", "BUTTON", "TEXTAREA"].includes(activeTag) || dialogOpen || !ui.bonusOverlay.hidden || !state.ageConfirmed || !ui.lobbyOverlay.hidden) return;
    event.preventDefault();
    spin();
  });
}

async function init() {
  applyGameTheme({ resetGrid: true });
  buildLobby();
  ui.clientSeedInput.value = state.clientSeed;
  bindEvents();
  updateUi();
  tickSessionClock();
  window.setInterval(tickSessionClock, 1000);
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
