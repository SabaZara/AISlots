import assert from "node:assert/strict";
import test from "node:test";

import { GAMES } from "../game-model.js";
import { emptyGameStats, outcomeClassFor, recordGameResult, winTierFor } from "../presentation.js";

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

test("every slot has a unique meter and reel-motion presentation", () => {
  const games = Object.values(GAMES);
  assert.equal(new Set(games.map((game) => game.meterMode)).size, games.length);
  assert.equal(new Set(games.map((game) => game.reelMotion)).size, games.length);
  assert.equal(new Set(games.map((game) => game.bonusMode)).size, games.length);
  games.forEach((game) => {
    assert.ok(game.meterCarryCopy.length > 0);
    assert.ok(game.winLabels.big && game.winLabels.mega && game.winLabels.epic);
    assert.ok(game.reelStopGap > 0 && game.spinInterval > 0);
    assert.ok(game.bonusMechanicName && game.bonusMechanicCopy && game.bonusStartLabel);
  });
});

test("partial returns are not classified as wins", () => {
  assert.equal(outcomeClassFor(0, 2), "loss");
  assert.equal(outcomeClassFor(1.5, 2), "partial-return");
  assert.equal(outcomeClassFor(2, 2), "break-even");
  assert.equal(outcomeClassFor(2.01, 2), "net-win");
});
