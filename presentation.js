export const WIN_TIERS = Object.freeze([
  { id: "none", minimum: 0 },
  { id: "win", minimum: Number.EPSILON },
  { id: "nice", minimum: 5 },
  { id: "big", minimum: 10 },
  { id: "mega", minimum: 25 },
  { id: "epic", minimum: 50 }
]);

export function winTierFor(totalWin, bet) {
  const multiplier = bet > 0 ? totalWin / bet : 0;
  return [...WIN_TIERS].reverse().find((tier) => multiplier >= tier.minimum) ?? WIN_TIERS[0];
}

export function emptyGameStats() {
  return { spins: 0, totalWon: 0, biggestWin: 0, lastWin: 0, lastMultiplier: 0 };
}

export function recordGameResult(stats, totalWin, bet) {
  const safeWin = Math.max(0, Number(totalWin) || 0);
  const multiplier = bet > 0 ? safeWin / bet : 0;
  return {
    spins: stats.spins + 1,
    totalWon: stats.totalWon + safeWin,
    biggestWin: Math.max(stats.biggestWin, safeWin),
    lastWin: safeWin,
    lastMultiplier: multiplier
  };
}
