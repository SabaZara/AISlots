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
  }
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
  assert.equal(wins.every((win) => win.count === 5), true);
  assert.equal(wins.reduce((total, win) => total + win.amount, 0), 7200);

  const firstReelBreak = allLuma.slice();
  for (let row = 0; row < model.ROWS; row += 1) firstReelBreak[model.cellIndex(0, row)] = "leaf";
  assert.equal(model.evaluateLines(firstReelBreak, 20, "astral").length, 0);
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
