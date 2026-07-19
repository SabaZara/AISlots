import { createFairRng } from "./fairness.js";

export const COLS = 6;
export const ROWS = 5;
export const DEFAULT_GAME_ID = "astral";
export const TARGET_RTP = 0.99;

const BASE_SYMBOLS = [
  { id: "luma", weight: 1200, payouts: { 3: 36, 4: 108, 5: 360, 6: 360 } },
  { id: "orbit", weight: 1300, payouts: { 3: 30, 4: 84, 5: 270, 6: 270 } },
  { id: "nova", weight: 1400, payouts: { 3: 24, 4: 72, 5: 216, 6: 216 } },
  { id: "comet", weight: 1600, payouts: { 3: 18, 4: 54, 5: 168, 6: 168 } },
  { id: "dew", weight: 1800, payouts: { 3: 15, 4: 42, 5: 120, 6: 120 } },
  { id: "leaf", weight: 2300, payouts: { 3: 12, 4: 30, 5: 72, 6: 72 } },
  { id: "petal", weight: 400, payouts: {} }
];

function symbolsFor(names, leafThreePayout) {
  return BASE_SYMBOLS.map((symbol) => ({
    ...symbol,
    name: names[symbol.id],
    payouts: symbol.id === "leaf"
      ? { ...symbol.payouts, 3: leafThreePayout }
      : { ...symbol.payouts }
  }));
}

const GAME_TEMPLATES = {
  astral: {
    id: "astral",
    name: "Fire Dragon",
    shortName: "Fire",
    subtitle: "Epic · Inferno Relics",
    intro: "Build a world, then ignite the reels",
    accent: "#ff8a32",
    secondary: "#ff3d57",
    background: "./assets/factory/theme-fire-v2.png",
    characterLayer: "./assets/factory/companion-dragon-cutout-v3.png",
    symbolSheet: "./assets/factory/symbols-inferno-transparent-v3.png",
    scatterAsset: "./assets/factory/scatter-inferno-v1.png",
    bonusLoadingArt: "./assets/factory/bonus-loading-fire-v1.jpg",
    planeAsset: "./assets/factory/plane-fire-cutout-v1.png",
    bonusBarArt: "./assets/factory/mood-epic-v1.jpg",
    actionLabel: "Ignite",
    lobbyTag: "1,344 world combinations",
    volatility: "Balanced",
    lobbyCopy: "One independently configurable slot with seven themes, eight companions, four moods, and six symbol sets.",
    meterMode: "scatter",
    meterGlyph: "✦",
    meterColumns: 4,
    meterCarryCopy: "Every Scatter stays between spins",
    reelMotion: "cascade",
    reelStopGap: 90,
    spinInterval: 165,
    anticipationCopy: "The relic vault is aligning…",
    winLabels: { big: "Power Win", mega: "Mythic Win", epic: "World Fortune" },
    featureName: "Scatter Flight",
    featureEyebrow: "Scatter collection",
    featureCopy: "Every Scatter symbol counts. Collect 18 to launch three sealed multiplier flights.",
    collectionName: "Inferno Scatter",
    collectionPlural: "Inferno Scatters",
    threshold: 18,
    featureSteps: [6, 12, 18],
    featureStepLabels: ["Vault stirs", "Power rises", "Flights launch"],
    bonusTitle: "The relic vault awakens.",
    bonusCopy: "Three flight multipliers are sealed into your receipt. Launch each flight and press Land to reveal its predetermined X.",
    bonusMode: "aviator-flight",
    bonusMechanicName: "Sky Runner Flights",
    bonusCardLabel: "Flight",
    bonusStartLabel: "Launch 3 flights",
    bonusProgressLabel: "Flights landed",
    bonusMechanicCopy: "The meter awards three sealed aviation flights. Land controls reveal timing only; every predetermined X is added to the total.",
    bonusDraws: 3,
    bonusPrizes: [
      { multiplier: 0.25, weight: 3000 },
      { multiplier: 0.5, weight: 2500 },
      { multiplier: 1, weight: 2000 },
      { multiplier: 2, weight: 1200 },
      { multiplier: 3, weight: 800 },
      { multiplier: 5, weight: 400 },
      { multiplier: 10, weight: 90 },
      { multiplier: 100, weight: 10 }
    ],
    symbols: symbolsFor({
      luma: "Sunsteel Coin", orbit: "Horned Ring", nova: "Flame Crystal", comet: "Ember Blade",
      dew: "Magma Drop", leaf: "Dragon Scale", petal: "Flame Crown"
    }, 12.967838362016055)
  },
};

export const GAMES = Object.freeze({ astral: GAME_TEMPLATES.astral });

export const PAYLINES = [
  [0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1], [2, 2, 2, 2, 2, 2],
  [3, 3, 3, 3, 3, 3], [4, 4, 4, 4, 4, 4],
  [0, 1, 2, 3, 4, 3], [4, 3, 2, 1, 0, 1], [0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0], [3, 4, 3, 4, 3, 4], [4, 3, 4, 3, 4, 3],
  [0, 1, 2, 1, 0, 1], [4, 3, 2, 3, 4, 3], [1, 2, 3, 2, 1, 2],
  [3, 2, 1, 2, 3, 2], [0, 0, 1, 0, 0, 1], [4, 4, 3, 4, 4, 3],
  [1, 1, 0, 1, 1, 0], [3, 3, 4, 3, 3, 4], [0, 2, 0, 2, 0, 2],
  [4, 2, 4, 2, 4, 2], [0, 2, 4, 2, 0, 2], [4, 2, 0, 2, 4, 2],
  [1, 2, 1, 2, 1, 2], [3, 2, 3, 2, 3, 2]
];

export function getGame(gameId = DEFAULT_GAME_ID) {
  const game = GAMES[gameId];
  if (!game) throw new Error(`Unknown game: ${gameId}`);
  return game;
}

function weightedItem(ticket, items) {
  let cursor = 0;
  for (const item of items) {
    cursor += item.weight;
    if (ticket < cursor) return item;
  }
  return items.at(-1);
}

export function cellIndex(col, row) {
  return col * ROWS + row;
}

export function evaluateLines(grid, totalBet, gameId = DEFAULT_GAME_ID) {
  const game = getGame(gameId);
  const lineBet = totalBet / PAYLINES.length;
  const wins = [];

  PAYLINES.forEach((rows, lineIndex) => {
    const firstId = grid[cellIndex(0, rows[0])];
    if (firstId === "petal") return;
    let count = 1;
    while (count < COLS && grid[cellIndex(count, rows[count])] === firstId) count += 1;
    if (count < 3) return;

    const symbol = game.symbols.find((item) => item.id === firstId);
    const payoutMultiplier = symbol.payouts[count];
    const amount = lineBet * payoutMultiplier;
    wins.push({
      line: lineIndex + 1,
      symbol: firstId,
      symbolName: symbol.name,
      count,
      payoutMultiplier,
      amount,
      cells: Array.from({ length: count }, (_, col) => cellIndex(col, rows[col]))
    });
  });

  return wins;
}

export function advanceScatterBetBank({
  scatterBetBankBefore,
  progressBefore = scatterBetBankBefore?.length ?? 0,
  bet,
  collectorCount = 0,
  progressBoost = 0,
  threshold
}) {
  if (!Number.isInteger(progressBefore) || progressBefore < 0) throw new Error("Scatter progress must be a non-negative integer");
  if (!Number.isFinite(bet) || bet <= 0) throw new Error("Bet must be a positive number");
  if (!Number.isInteger(collectorCount) || collectorCount < 0) throw new Error("Scatter count must be a non-negative integer");
  if (!Number.isInteger(progressBoost) || progressBoost < 0) throw new Error("Progress boost must be a non-negative integer");
  if (!Number.isInteger(threshold) || threshold < 1) throw new Error("Scatter threshold must be a positive integer");

  // Receipts created before bet banking did not include the ledger. Treat their
  // existing progress as having been collected at the receipt's bet so they
  // remain replayable, while all new receipts carry the exact FIFO bank.
  const startingBank = scatterBetBankBefore === undefined
    ? Array.from({ length: progressBefore }, () => bet)
    : [...scatterBetBankBefore];
  if (startingBank.length !== progressBefore) throw new Error("Scatter bet bank must match progress before the spin");
  if (startingBank.some((bankedBet) => !Number.isFinite(bankedBet) || bankedBet <= 0)) {
    throw new Error("Every banked Scatter bet must be a positive number");
  }

  const scatterBetsAdded = Array.from({ length: collectorCount + progressBoost }, () => bet);
  const pendingBank = [...startingBank, ...scatterBetsAdded];
  const bonusRoundCount = Math.floor(pendingBank.length / threshold);
  const bonusRoundBets = Array.from({ length: bonusRoundCount }, (_, round) => {
    const roundBank = pendingBank.slice(round * threshold, (round + 1) * threshold);
    return roundBank.reduce((total, bankedBet) => total + bankedBet, 0) / threshold;
  });
  const scatterBetBankAfter = pendingBank.slice(bonusRoundCount * threshold);

  return {
    scatterBetBankBefore: startingBank,
    scatterBetsAdded,
    scatterBetBankAfter,
    bonusRoundBets,
    progressAfter: scatterBetBankAfter.length
  };
}

export async function simulateSpin({
  serverSeed,
  clientSeed,
  nonce,
  bet,
  progressBefore,
  petalsBefore,
  scatterBetBankBefore,
  progressBoost = 0,
  gameId = DEFAULT_GAME_ID
}) {
  const game = getGame(gameId);
  const startingProgress = progressBefore ?? petalsBefore ?? scatterBetBankBefore?.length ?? 0;
  const symbolWeight = game.symbols.reduce((total, symbol) => total + symbol.weight, 0);
  const prizeWeight = game.bonusPrizes.reduce((total, prize) => total + prize.weight, 0);
  const rng = await createFairRng(serverSeed, clientSeed, nonce);
  const grid = [];

  for (let index = 0; index < COLS * ROWS; index += 1) {
    const ticket = await rng.int(symbolWeight);
    grid.push(weightedItem(ticket, game.symbols).id);
  }

  const wins = evaluateLines(grid, bet, gameId);
  const collectorCount = grid.filter((symbol) => symbol === "petal").length;
  const bank = advanceScatterBetBank({
    scatterBetBankBefore,
    progressBefore: startingProgress,
    bet,
    collectorCount,
    progressBoost,
    threshold: game.threshold
  });
  const bonusRoundCount = bank.bonusRoundBets.length;
  const bonusRounds = [];

  for (let round = 0; round < bonusRoundCount; round += 1) {
    const picks = [];
    for (let pick = 0; pick < game.bonusDraws; pick += 1) {
      const ticket = await rng.int(prizeWeight);
      picks.push(weightedItem(ticket, game.bonusPrizes).multiplier);
    }
    bonusRounds.push(picks);
  }

  const baseWin = wins.reduce((total, win) => total + win.amount, 0);
  const bonusMultiplier = bonusRounds.flat().reduce((total, value) => total + value, 0);
  const bonusRoundWins = bonusRounds.map((round, index) => (
    round.reduce((total, value) => total + value, 0) * bank.bonusRoundBets[index]
  ));
  const bonusWin = bonusRoundWins.reduce((total, value) => total + value, 0);

  return {
    gameId,
    grid,
    wins,
    collectorCount,
    scatterCount: collectorCount,
    progressBoost,
    progressBefore: startingProgress,
    progressAfter: bank.progressAfter,
    petalsBefore: startingProgress,
    petalsAfter: bank.progressAfter,
    scatterBetBankBefore: bank.scatterBetBankBefore,
    scatterBetsAdded: bank.scatterBetsAdded,
    scatterBetBankAfter: bank.scatterBetBankAfter,
    bonusRounds,
    bonusRoundBets: bank.bonusRoundBets,
    bonusRoundWins,
    baseWin,
    bonusMultiplier,
    bonusWin,
    totalWin: baseWin + bonusWin
  };
}

function expectedBonusRoundMultiplier(game) {
  const totalPrizeWeight = game.bonusPrizes.reduce((total, prize) => total + prize.weight, 0);
  const expectedPrize = game.bonusPrizes.reduce(
    (total, prize) => total + (prize.weight / totalPrizeWeight) * prize.multiplier,
    0
  );
  return expectedPrize * game.bonusDraws;
}

export function specialBetCostMultiplier(gameId = DEFAULT_GAME_ID, progressBoost = 0) {
  const game = getGame(gameId);
  const boostValue = expectedBonusRoundMultiplier(game) / game.threshold * Math.max(0, progressBoost);
  return 1 + boostValue / TARGET_RTP;
}

export function theoreticalSpecialBetRtp(gameId = DEFAULT_GAME_ID, progressBoost = 0) {
  const game = getGame(gameId);
  const standardReturn = theoreticalRtp(gameId).totalRtp;
  const boostValue = expectedBonusRoundMultiplier(game) / game.threshold * Math.max(0, progressBoost);
  const wagerMultiplier = specialBetCostMultiplier(gameId, progressBoost);
  return (standardReturn + boostValue) / wagerMultiplier;
}

export function bonusPurchasePayoutScale(gameId = DEFAULT_GAME_ID, costMultiplier = 50) {
  const game = getGame(gameId);
  return costMultiplier * TARGET_RTP / expectedBonusRoundMultiplier(game);
}

export function bonusPurchasePrizeTable(gameId = DEFAULT_GAME_ID, costMultiplier = 50) {
  const game = getGame(gameId);
  const totalWeight = game.bonusPrizes.reduce((total, prize) => total + prize.weight, 0);
  const payoutScale = bonusPurchasePayoutScale(gameId, costMultiplier);
  const table = game.bonusPrizes.map((prize) => ({
    weight: prize.weight,
    multiplierCents: Math.round(prize.multiplier * payoutScale * 100)
  }));
  const targetWeightedCents = Math.round(costMultiplier * TARGET_RTP / game.bonusDraws * 100 * totalWeight);
  const currentWeightedCents = table.reduce(
    (total, prize) => total + prize.multiplierCents * prize.weight,
    0
  );
  const correctionIndex = table.length - 1;
  const correctionWeight = table[correctionIndex].weight;
  const correctionCents = (targetWeightedCents - currentWeightedCents) / correctionWeight;
  if (!Number.isInteger(correctionCents)) throw new Error("Feature purchase table cannot be calibrated to two decimal places");
  table[correctionIndex].multiplierCents += correctionCents;
  return table.map((prize) => ({ weight: prize.weight, multiplier: prize.multiplierCents / 100 }));
}

export async function simulateBonusPurchase({
  serverSeed,
  clientSeed,
  nonce,
  bet,
  costMultiplier = 50,
  progressBefore = 0,
  gameId = DEFAULT_GAME_ID
}) {
  const game = getGame(gameId);
  const purchasePrizes = bonusPurchasePrizeTable(gameId, costMultiplier);
  const prizeWeight = purchasePrizes.reduce((total, prize) => total + prize.weight, 0);
  const rng = await createFairRng(serverSeed, clientSeed, nonce);
  const payoutScale = bonusPurchasePayoutScale(gameId, costMultiplier);
  const picks = [];

  for (let pick = 0; pick < game.bonusDraws; pick += 1) {
    const ticket = await rng.int(prizeWeight);
    picks.push(weightedItem(ticket, purchasePrizes).multiplier);
  }

  const bonusMultiplier = picks.reduce((total, value) => total + value, 0);
  const bonusWin = bonusMultiplier * bet;
  const purchaseCost = bet * costMultiplier;

  return {
    mode: "feature-buy",
    gameId,
    grid: [],
    wins: [],
    collectorCount: 0,
    scatterCount: 0,
    progressBoost: 0,
    progressBefore,
    progressAfter: progressBefore,
    petalsBefore: progressBefore,
    petalsAfter: progressBefore,
    bonusRounds: [picks],
    baseWin: 0,
    bonusMultiplier,
    bonusWin,
    totalWin: bonusWin,
    costMultiplier,
    payoutScale,
    purchaseCost
  };
}

export function theoreticalRtp(gameId = DEFAULT_GAME_ID) {
  const game = getGame(gameId);
  const totalSymbolWeight = game.symbols.reduce((total, symbol) => total + symbol.weight, 0);
  const totalPrizeWeight = game.bonusPrizes.reduce((total, prize) => total + prize.weight, 0);
  const payingSymbols = game.symbols.filter((symbol) => symbol.id !== "petal");
  const baseRtp = payingSymbols.reduce((total, symbol) => {
    const probability = symbol.weight / totalSymbolWeight;
    const symbolReturn = Array.from({ length: COLS - 2 }, (_, index) => index + 3)
      .reduce((returnTotal, count) => {
        const exactMatchProbability = probability ** count * (count === COLS ? 1 : 1 - probability);
        return returnTotal + exactMatchProbability * symbol.payouts[count];
      }, 0);
    return total + symbolReturn;
  }, 0);

  const expectedPrize = game.bonusPrizes.reduce(
    (total, prize) => total + (prize.weight / totalPrizeWeight) * prize.multiplier,
    0
  );
  const collectorProbability = game.symbols.find((symbol) => symbol.id === "petal").weight / totalSymbolWeight;
  const bonusRtp = (collectorProbability * COLS * ROWS / game.threshold) * game.bonusDraws * expectedPrize;
  return { baseRtp, bonusRtp, totalRtp: baseRtp + bonusRtp };
}
