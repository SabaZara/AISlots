import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";

if (!globalThis.crypto) globalThis.crypto = webcrypto;

const fairness = await import("../fairness.js");
const model = await import("../game-model.js");

test("SHA-256 commitment matches a public test vector", async () => {
  assert.equal(
    await fairness.sha256Hex("abc"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
  );
});

test("the published configurable game model returns exactly 99.00%", () => {
  assert.deepEqual(Object.keys(model.GAMES), ["astral"]);
  for (const gameId of Object.keys(model.GAMES)) {
    const result = model.theoreticalRtp(gameId);
    assert.ok(Math.abs(result.totalRtp - 0.99) < 1e-12, `${gameId} RTP drifted`);
    assert.ok(result.baseRtp > 0 && result.bonusRtp > 0);
    assert.equal(Math.max(...model.GAMES[gameId].bonusPrizes.map((prize) => prize.multiplier)), 100);
  }
});

test("Astral special bets and feature purchases preserve 99.00% theoretical return", async () => {
  for (const progressBoost of [0, 1, 2]) {
    assert.ok(Math.abs(model.theoreticalSpecialBetRtp("astral", progressBoost) - 0.99) < 1e-12);
  }

  for (const costMultiplier of [25, 50, 100]) {
    const game = model.GAMES.astral;
    const purchasePrizes = model.bonusPurchasePrizeTable("astral", costMultiplier);
    const totalWeight = purchasePrizes.reduce((total, prize) => total + prize.weight, 0);
    const expectedRound = game.bonusDraws * purchasePrizes.reduce(
      (total, prize) => total + prize.weight / totalWeight * prize.multiplier,
      0
    );
    assert.ok(Math.abs(expectedRound / costMultiplier - 0.99) < 1e-12);
    assert.equal(purchasePrizes.every((prize) => Math.abs(prize.multiplier * 100 - Math.round(prize.multiplier * 100)) < 1e-9), true);

    const input = {
      serverSeed: "19".repeat(32),
      clientSeed: "feature-purchase-test",
      nonce: costMultiplier,
      bet: 2,
      costMultiplier,
      progressBefore: 5,
      gameId: "astral"
    };
    assert.deepEqual(await model.simulateBonusPurchase(input), await model.simulateBonusPurchase(input));

    // Purchased flights draw from the natural prize table so every revealed
    // multiplier stays on the 0.25×–100× ladder; the cost is recovered through
    // the scaled flight bet, and the payout is exactly sum(picks) × flightBet.
    const outcome = await model.simulateBonusPurchase(input);
    const picks = outcome.bonusRounds.flat();
    const naturalMultipliers = new Set(game.bonusPrizes.map((prize) => prize.multiplier));
    assert.equal(picks.every((value) => naturalMultipliers.has(value)), true);
    assert.equal(picks.length, game.bonusDraws);
    const expectedWin = picks.reduce((total, value) => total + value, 0) * outcome.flightBet;
    assert.ok(Math.abs(outcome.totalWin - expectedWin) < 1e-9);
    assert.deepEqual(outcome.bonusRoundBets, [outcome.flightBet]);
  }

  // Feature purchases return the target RTP on average across many buys.
  let staked = 0;
  let returned = 0;
  for (let nonce = 0; nonce < 6000; nonce += 1) {
    const outcome = await model.simulateBonusPurchase({
      serverSeed: "5c".repeat(32),
      clientSeed: "purchase-rtp",
      nonce,
      bet: 2,
      costMultiplier: 50,
      gameId: "astral"
    });
    staked += outcome.purchaseCost;
    returned += outcome.totalWin;
  }
  assert.ok(Math.abs(returned / staked - 0.99) < 0.05);
});

test("every game recreates the same complete outcome from the same receipt", async () => {
  for (const gameId of Object.keys(model.GAMES)) {
    const input = {
      serverSeed: "07".repeat(32),
      clientSeed: "player-controlled-seed",
      nonce: 42,
      bet: 5,
      progressBefore: 7,
      gameId
    };
    assert.deepEqual(await model.simulateSpin(input), await model.simulateSpin(input));
  }
});

test("line evaluation pays identical symbols from the leftmost reel only", () => {
  const allLuma = Array.from({ length: model.COLS * model.ROWS }, () => "luma");
  const wins = model.evaluateLines(allLuma, 20, "astral");
  assert.equal(wins.length, model.PAYLINES.length);
  assert.equal(model.COLS, 6);
  assert.equal(model.ROWS, 5);
  assert.equal(model.PAYLINES.every((line) => line.length === model.COLS), true);
  assert.equal(wins.every((win) => win.count === 6), true);
  assert.equal(wins.reduce((total, win) => total + win.amount, 0), 7200);

  const firstReelBreak = allLuma.slice();
  for (let row = 0; row < model.ROWS; row += 1) firstReelBreak[model.cellIndex(0, row)] = "leaf";
  assert.equal(model.evaluateLines(firstReelBreak, 20, "astral").length, 0);
});

test("the Scatter bet bank pays rollovers from banked bets, FIFO, with carry", () => {
  const result = model.advanceScatterBetBank({
    scatterBetBankBefore: [1, 1, 1],
    bet: 20,
    collectorCount: 2,
    progressBoost: 1,
    threshold: 4
  });
  // FIFO round: three banked $1 Scatters + the first new $20 one.
  assert.deepEqual(result.scatterBetsAdded, [20, 20, 20]);
  assert.deepEqual(result.bonusRoundBets, [(1 + 1 + 1 + 20) / 4]);
  // The excess Scatters carry over at the bet that collected them.
  assert.deepEqual(result.scatterBetBankAfter, [20, 20]);
  assert.equal(result.progressAfter, 2);

  const doubleRollover = model.advanceScatterBetBank({
    scatterBetBankBefore: [5, 5],
    bet: 2,
    collectorCount: 7,
    threshold: 4
  });
  assert.deepEqual(doubleRollover.bonusRoundBets, [(5 + 5 + 2 + 2) / 4, 2]);
  assert.deepEqual(doubleRollover.scatterBetBankAfter, [2]);
});

test("bet ramping cannot revalue banked Scatters at the trigger bet", async () => {
  const game = model.GAMES.astral;
  const lowBet = 1;
  const highBet = 20;
  let bank = [];
  let triggersAtHighBet = 0;

  for (let nonce = 0; nonce < 400; nonce += 1) {
    // Exploit strategy: collect cheap, switch to the max bet near the threshold.
    const bet = bank.length >= game.threshold - 3 ? highBet : lowBet;
    const outcome = await model.simulateSpin({
      serverSeed: "c4".repeat(32),
      clientSeed: "ramp-regression",
      nonce,
      bet,
      scatterBetBankBefore: bank,
      gameId: "astral"
    });

    assert.deepEqual(outcome.scatterBetBankBefore, bank);
    const pendingBank = [...bank, ...outcome.scatterBetsAdded];
    outcome.bonusRoundBets.forEach((roundBet, round) => {
      const roundBank = pendingBank.slice(round * game.threshold, (round + 1) * game.threshold);
      const bankedAverage = roundBank.reduce((total, value) => total + value, 0) / game.threshold;
      assert.ok(Math.abs(roundBet - bankedAverage) < 1e-12, "bonus must pay the banked average bet");
      if (bet === highBet && roundBank.includes(lowBet)) {
        triggersAtHighBet += 1;
        assert.ok(roundBet < highBet, "a max-bet trigger must not revalue cheap Scatters");
      }
    });
    const expectedBonusWin = outcome.bonusRounds.reduce(
      (total, round, index) => total + round.reduce((sum, value) => sum + value, 0) * outcome.bonusRoundBets[index],
      0
    );
    assert.ok(Math.abs(outcome.bonusWin - expectedBonusWin) < 1e-9);
    bank = outcome.scatterBetBankAfter;
  }

  assert.ok(triggersAtHighBet >= 5, "the run must actually exercise ramped triggers");
});

test("receipts without a bet bank replay by valuing progress at the receipt bet", async () => {
  const legacyInput = {
    serverSeed: "3f".repeat(32),
    clientSeed: "legacy-receipt",
    nonce: 9,
    bet: 5,
    progressBefore: 7,
    gameId: "astral"
  };
  const outcome = await model.simulateSpin(legacyInput);
  assert.deepEqual(outcome.scatterBetBankBefore, Array.from({ length: 7 }, () => 5));
  assert.deepEqual(await model.simulateSpin(legacyInput), outcome);
});

test("each collection meter rolls over into its configured bonus reveal count", async () => {
  for (const [gameId, game] of Object.entries(model.GAMES)) {
    let found;
    for (let nonce = 0; nonce < 100 && !found; nonce += 1) {
      const outcome = await model.simulateSpin({
        serverSeed: "ab".repeat(32),
        clientSeed: `collector-test-${gameId}`,
        nonce,
        bet: 2,
        progressBefore: game.threshold - 1,
        gameId
      });
      if (outcome.collectorCount > 0) found = outcome;
    }

    assert.ok(found, `${gameId} test should contain a collector`);
    assert.ok(found.bonusRounds.length >= 1);
    assert.equal(found.bonusRounds.every((round) => round.length === game.bonusDraws), true);
    assert.ok(found.progressAfter >= 0 && found.progressAfter < game.threshold);
  }
});
