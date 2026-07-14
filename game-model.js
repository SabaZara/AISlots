import { createFairRng } from "./fairness.js";

export const COLS = 5;
export const ROWS = 4;
export const DEFAULT_GAME_ID = "astral";

const BASE_SYMBOLS = [
  { id: "luma", weight: 1200, payouts: { 3: 36, 4: 108, 5: 360 } },
  { id: "orbit", weight: 1300, payouts: { 3: 30, 4: 84, 5: 270 } },
  { id: "nova", weight: 1400, payouts: { 3: 24, 4: 72, 5: 216 } },
  { id: "comet", weight: 1600, payouts: { 3: 18, 4: 54, 5: 168 } },
  { id: "dew", weight: 1800, payouts: { 3: 15, 4: 42, 5: 120 } },
  { id: "leaf", weight: 2300, payouts: { 3: 12, 4: 30, 5: 72 } },
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

export const GAMES = {
  astral: {
    id: "astral",
    name: "Astral Bloom",
    shortName: "Astral",
    subtitle: "Moonwell edition",
    intro: "Enter the moonlit conservatory",
    accent: "#6be4ff",
    secondary: "#a77cff",
    background: "./assets/astral-bloom-bg.jpg",
    symbolSheet: "./assets/symbols-astral-v4.png",
    actionLabel: "Bloom",
    lobbyTag: "Celestial collector",
    volatility: "Balanced",
    lobbyCopy: "A serene moon garden where every Bloom stays in your Moonwell until three constellation prizes open.",
    meterMode: "constellation",
    meterGlyph: "✦",
    meterColumns: 4,
    meterCarryCopy: "Each Bloom lights a permanent star",
    reelMotion: "cascade",
    reelStopGap: 90,
    spinInterval: 165,
    anticipationCopy: "The constellation is aligning…",
    winLabels: { big: "Starfall Win", mega: "Cosmic Win", epic: "Celestial Fortune" },
    featureName: "Moonwell Bloom",
    featureEyebrow: "Persistent feature",
    featureCopy: "Every Bloom symbol is yours to keep. Collect 12 to open the constellation bonus.",
    collectionName: "Bloom",
    collectionPlural: "Blooms",
    threshold: 12,
    featureSteps: [4, 8, 12],
    featureStepLabels: ["Moonwell stirs", "Starlight rises", "Bonus opens"],
    bonusTitle: "The garden remembers.",
    bonusCopy: "Three constellations are sealed into your spin receipt. Reveal their light.",
    bonusMode: "free-spins",
    bonusMechanicName: "Moonwell Free Spins",
    bonusCardLabel: "Free spin",
    bonusStartLabel: "Start 3 free spins",
    bonusProgressLabel: "Free spins resolved",
    bonusMechanicCopy: "The meter awards three sealed free spins. Each spin resolves one independently weighted prize multiplier and all three prizes are added together.",
    bonusDraws: 3,
    bonusPrizes: [
      { multiplier: 0.25, weight: 3000 },
      { multiplier: 0.5, weight: 2500 },
      { multiplier: 1, weight: 2000 },
      { multiplier: 2, weight: 1200 },
      { multiplier: 3, weight: 800 },
      { multiplier: 5, weight: 400 },
      { multiplier: 10, weight: 100 }
    ],
    symbols: symbolsFor({
      luma: "Luma", orbit: "Orbit", nova: "Nova", comet: "Comet",
      dew: "Dewdrop", leaf: "Moonleaf", petal: "Bloom"
    }, 14.889152028213422)
  },
  neon: {
    id: "neon",
    name: "Neon Tides",
    shortName: "Tides",
    subtitle: "Pearl current",
    intro: "Descend into the sapphire treasury",
    accent: "#59f1ff",
    secondary: "#ff8fda",
    background: "./assets/neon-tides-bg.jpg",
    symbolSheet: "./assets/symbols-neon-v2.png",
    actionLabel: "Dive",
    lobbyTag: "Four-orb current",
    volatility: "Flowing",
    lobbyCopy: "A luminous ocean treasury with faster 10-key pacing and four pearl-orb reveals in every feature.",
    meterMode: "current",
    meterGlyph: "●",
    meterColumns: 5,
    meterCarryCopy: "The pearl current never drains",
    reelMotion: "wave",
    reelStopGap: 72,
    spinInterval: 205,
    anticipationCopy: "A pearl surge is approaching…",
    winLabels: { big: "Tidal Win", mega: "Pearl Storm", epic: "Ocean Fortune" },
    featureName: "Pearl Current",
    featureEyebrow: "Flowing collection",
    featureCopy: "Every Pearl Key joins the current. Collect 10 to release four tidal prize orbs.",
    collectionName: "Pearl Key",
    collectionPlural: "Pearl Keys",
    threshold: 10,
    featureSteps: [3, 6, 10],
    featureStepLabels: ["Current wakes", "Pearls align", "Vault opens"],
    bonusTitle: "The tide has turned.",
    bonusCopy: "Four pearl currents are sealed into your receipt. Release them into the treasury.",
    bonusMode: "cluster-cascade",
    bonusMechanicName: "Pearl Cluster Cascade",
    bonusCardLabel: "Cascade",
    bonusStartLabel: "Release 4 cascades",
    bonusProgressLabel: "Clusters cleared",
    bonusMechanicCopy: "Four sealed pearl clusters burst in sequence. Every cleared cluster adds its displayed multiplier to the cascade total.",
    bonusDraws: 4,
    bonusPrizes: [
      { multiplier: 0.1, weight: 2500 },
      { multiplier: 0.25, weight: 2500 },
      { multiplier: 0.5, weight: 2200 },
      { multiplier: 1, weight: 1600 },
      { multiplier: 2, weight: 800 },
      { multiplier: 3, weight: 350 },
      { multiplier: 5, weight: 50 }
    ],
    symbols: symbolsFor({
      luma: "Royal Pearl", orbit: "Tide Ring", nova: "Starfish Gem", comet: "Coral Spear",
      dew: "Aqua Drop", leaf: "Seashell", petal: "Pearl Key"
    }, 17.963253894129203)
  },
  ember: {
    id: "ember",
    name: "Ember Crown",
    shortName: "Ember",
    subtitle: "Skyforge edition",
    intro: "Claim the throne of the celestial forge",
    accent: "#ffb052",
    secondary: "#ff5c7c",
    background: "./assets/ember-crown-bg.jpg",
    symbolSheet: "./assets/symbols-ember-v2.png",
    actionLabel: "Forge",
    lobbyTag: "High-heat seals",
    volatility: "High",
    lobbyCopy: "An obsidian sky forge with a longer 15-rune charge and two heavier, high-volatility fire seals.",
    meterMode: "forge",
    meterGlyph: "◆",
    meterColumns: 3,
    meterCarryCopy: "Every rune raises the forge heat",
    reelMotion: "slam",
    reelStopGap: 132,
    spinInterval: 235,
    anticipationCopy: "Critical heat — the forge is shaking…",
    winLabels: { big: "Forge Win", mega: "Inferno Win", epic: "Crown Fortune" },
    featureName: "Crown Forge",
    featureEyebrow: "Forged collection",
    featureCopy: "Every Crown Rune heats the forge. Collect 15 to strike two high-volatility fire seals.",
    collectionName: "Crown Rune",
    collectionPlural: "Crown Runes",
    threshold: 15,
    featureSteps: [5, 10, 15],
    featureStepLabels: ["Coals ignite", "Anvil charged", "Crown forged"],
    bonusTitle: "The crown is forged.",
    bonusCopy: "Two fire seals are locked into your receipt. Strike them to reveal their power.",
    bonusMode: "multiplier-forge",
    bonusMechanicName: "Crown Multiplier Forge",
    bonusCardLabel: "Forge strike",
    bonusStartLabel: "Strike 2 multipliers",
    bonusProgressLabel: "Multipliers forged",
    bonusMechanicCopy: "Two sealed forge strikes reveal weighted multipliers. Both multipliers are added before the Crown Forge prize is awarded.",
    bonusDraws: 2,
    bonusPrizes: [
      { multiplier: 0.5, weight: 2500 },
      { multiplier: 1, weight: 2600 },
      { multiplier: 2, weight: 2400 },
      { multiplier: 3, weight: 1300 },
      { multiplier: 5, weight: 800 },
      { multiplier: 10, weight: 350 },
      { multiplier: 25, weight: 50 }
    ],
    symbols: symbolsFor({
      luma: "Sunsteel Seal", orbit: "Forge Ring", nova: "Star Anvil", comet: "Ember Spear",
      dew: "Magma Drop", leaf: "Dragon Scale", petal: "Crown Rune"
    }, 15.828460931687681)
  },
  ufc: {
    id: "ufc",
    name: "UFC Octagon Gold",
    shortName: "UFC",
    subtitle: "Fight Night edition",
    intro: "Step into championship fight night",
    accent: "#ff493f",
    secondary: "#f2c35b",
    background: "./assets/ufc-octagon-bg.jpg",
    symbolSheet: "./assets/symbols-ufc-v2.png",
    actionLabel: "Fight",
    lobbyTag: "Fight-night cards",
    volatility: "Punchy",
    lobbyCopy: "A championship arena where 10 Fight Tokens unlock three main-event prize cards.",
    meterMode: "fightcard",
    meterGlyph: "•",
    meterColumns: 5,
    meterCarryCopy: "Every token advances the fight card",
    reelMotion: "strike",
    reelStopGap: 108,
    spinInterval: 145,
    anticipationCopy: "Championship moment — final reel…",
    winLabels: { big: "Knockout Win", mega: "Main Event Win", epic: "Championship Fortune" },
    featureName: "Fight Card Frenzy",
    featureEyebrow: "Main-event collection",
    featureCopy: "Every Fight Token fills the card. Collect 10 to reveal three championship prizes.",
    collectionName: "Fight Token",
    collectionPlural: "Fight Tokens",
    threshold: 10,
    featureSteps: [3, 6, 10],
    featureStepLabels: ["Prelims set", "Main card ready", "Title fight"],
    bonusTitle: "The main event is live.",
    bonusCopy: "Three championship cards are sealed into your receipt. Reveal the fight-night prizes.",
    bonusMode: "hold-and-win",
    bonusMechanicName: "Championship Hold & Win",
    bonusCardLabel: "Fight card",
    bonusStartLabel: "Lock 3 fight cards",
    bonusProgressLabel: "Cards locked",
    bonusMechanicCopy: "Three pre-sealed fight cards lock into the octagon. Each card holds one weighted multiplier and the final purse combines all three.",
    bonusDraws: 3,
    bonusPrizes: [
      { multiplier: 0.25, weight: 2500 },
      { multiplier: 0.5, weight: 2500 },
      { multiplier: 1, weight: 2200 },
      { multiplier: 2, weight: 1500 },
      { multiplier: 3, weight: 800 },
      { multiplier: 5, weight: 400 },
      { multiplier: 10, weight: 100 }
    ],
    symbols: symbolsFor({
      luma: "Championship Belt", orbit: "Octagon", nova: "Main Event Star", comet: "Power Strike",
      dew: "Round Clock", leaf: "Fight Glove", petal: "Fight Token"
    }, 8.121858337273801)
  }
};

export const PAYLINES = [
  [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [2, 2, 2, 2, 2], [3, 3, 3, 3, 3],
  [0, 1, 2, 3, 2], [3, 2, 1, 0, 1], [0, 1, 0, 1, 0], [1, 0, 1, 0, 1],
  [2, 3, 2, 3, 2], [3, 2, 3, 2, 3], [0, 1, 2, 1, 0], [3, 2, 1, 2, 3],
  [1, 2, 3, 2, 1], [2, 1, 0, 1, 2], [0, 0, 1, 0, 0], [3, 3, 2, 3, 3],
  [1, 1, 0, 1, 1], [2, 2, 3, 2, 2], [0, 2, 0, 2, 0], [3, 1, 3, 1, 3]
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

export async function simulateSpin({
  serverSeed,
  clientSeed,
  nonce,
  bet,
  progressBefore,
  petalsBefore,
  gameId = DEFAULT_GAME_ID
}) {
  const game = getGame(gameId);
  const startingProgress = progressBefore ?? petalsBefore ?? 0;
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
  const collectedTotal = startingProgress + collectorCount;
  const bonusRoundCount = Math.floor(collectedTotal / game.threshold);
  const progressAfter = collectedTotal % game.threshold;
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
  const bonusWin = bonusMultiplier * bet;

  return {
    gameId,
    grid,
    wins,
    collectorCount,
    scatterCount: collectorCount,
    progressBefore: startingProgress,
    progressAfter,
    petalsBefore: startingProgress,
    petalsAfter: progressAfter,
    bonusRounds,
    baseWin,
    bonusMultiplier,
    bonusWin,
    totalWin: baseWin + bonusWin
  };
}

export function theoreticalRtp(gameId = DEFAULT_GAME_ID) {
  const game = getGame(gameId);
  const totalSymbolWeight = game.symbols.reduce((total, symbol) => total + symbol.weight, 0);
  const totalPrizeWeight = game.bonusPrizes.reduce((total, prize) => total + prize.weight, 0);
  const payingSymbols = game.symbols.filter((symbol) => symbol.id !== "petal");
  const baseRtp = payingSymbols.reduce((total, symbol) => {
    const probability = symbol.weight / totalSymbolWeight;
    return total
      + probability ** 3 * (1 - probability) * symbol.payouts[3]
      + probability ** 4 * (1 - probability) * symbol.payouts[4]
      + probability ** 5 * symbol.payouts[5];
  }, 0);

  const expectedPrize = game.bonusPrizes.reduce(
    (total, prize) => total + (prize.weight / totalPrizeWeight) * prize.multiplier,
    0
  );
  const collectorProbability = game.symbols.find((symbol) => symbol.id === "petal").weight / totalSymbolWeight;
  const bonusRtp = (collectorProbability * COLS * ROWS / game.threshold) * game.bonusDraws * expectedPrize;
  return { baseRtp, bonusRtp, totalRtp: baseRtp + bonusRtp };
}
