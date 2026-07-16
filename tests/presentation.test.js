import assert from "node:assert/strict";
import test from "node:test";

import { cellIndex, GAMES, PAYLINES } from "../game-model.js";
import { ANIMATION_STYLES } from "../asset-catalog.js";
import { emptyGameStats, naturalNearMissFor, outcomeClassFor, recordGameResult, winTierFor } from "../presentation.js";

test("win presentation tiers follow bet multipliers", () => {
  assert.equal(winTierFor(0, 2).id, "none");
  assert.equal(winTierFor(4, 2).id, "win");
  assert.equal(winTierFor(10, 2).id, "nice");
  assert.equal(winTierFor(20, 2).id, "big");
  assert.equal(winTierFor(50, 2).id, "mega");
  assert.equal(winTierFor(100, 2).id, "epic");
});

test("per-game result statistics accumulate wins and preserve the best result", () => {
  const first = recordGameResult(emptyGameStats(), 12, 2);
  const second = recordGameResult(first, 4, 2);
  assert.deepEqual(second, {
    spins: 2,
    totalWon: 16,
    biggestWin: 12,
    lastWin: 4,
    lastMultiplier: 2
  });
});

test("the single slot exposes five distinct reel-motion presentations", () => {
  assert.deepEqual(Object.keys(GAMES), ["astral"]);
  assert.equal(new Set(ANIMATION_STYLES.map((style) => style.id)).size, 5);
  assert.equal(new Set(ANIMATION_STYLES.map((style) => `${style.reelStopGap}:${style.spinInterval}`)).size, 5);
  const game = GAMES.astral;
  assert.ok(game.meterCarryCopy.length > 0);
  assert.ok(game.winLabels.big && game.winLabels.mega && game.winLabels.epic);
  assert.ok(game.bonusMechanicName && game.bonusMechanicCopy && game.bonusStartLabel);
});

test("partial returns are not classified as wins", () => {
  assert.equal(outcomeClassFor(0, 2), "loss");
  assert.equal(outcomeClassFor(1.5, 2), "partial-return");
  assert.equal(outcomeClassFor(2, 2), "break-even");
  assert.equal(outcomeClassFor(2.01, 2), "net-win");
});

test("near-miss tracing reports only a natural two-symbol connection", () => {
  const grid = Array(20).fill("dew");
  grid[cellIndex(0, 0)] = "luma";
  grid[cellIndex(1, 0)] = "luma";
  grid[cellIndex(2, 0)] = "orbit";
  const result = naturalNearMissFor(grid, PAYLINES, cellIndex);
  assert.equal(result.line, 1);
  assert.equal(result.symbolId, "luma");
  assert.equal(result.breakSymbolId, "orbit");
  assert.deepEqual(result.matchCells, [cellIndex(0, 0), cellIndex(1, 0)]);
});
