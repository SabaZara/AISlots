import { webcrypto } from "node:crypto";

if (!globalThis.crypto) globalThis.crypto = webcrypto;

const { GAMES, simulateSpin, theoreticalRtp } = await import("../game-model.js");
const spins = Number.parseInt(process.argv[2] ?? "100000", 10);
if (!Number.isSafeInteger(spins) || spins < 1) throw new Error("Spin count must be a positive integer.");

const reports = {};
for (const [gameId, game] of Object.entries(GAMES)) {
  const bet = 20;
  let bank = [];
  let baseReturned = 0;
  let bonusReturned = 0;
  let collectors = 0;
  let bonusRounds = 0;

  for (let index = 0; index < spins; index += 1) {
    const outcome = await simulateSpin({
      serverSeed: (index + 1_000_000).toString(16).padStart(64, "0"),
      clientSeed: `lumen-audit-${gameId}`,
      nonce: index,
      bet,
      scatterBetBankBefore: bank,
      gameId
    });
    bank = outcome.scatterBetBankAfter;
    baseReturned += outcome.baseWin;
    bonusReturned += outcome.bonusWin;
    collectors += outcome.collectorCount;
    bonusRounds += outcome.bonusRounds.length;
  }

  const wagered = spins * bet;
  reports[gameId] = {
    name: game.name,
    spins,
    observed: {
      baseRtp: baseReturned / wagered,
      bonusRtp: bonusReturned / wagered,
      totalRtp: (baseReturned + bonusReturned) / wagered
    },
    theoretical: theoreticalRtp(gameId),
    collectors,
    bonusRounds,
    endingMeter: `${bank.length}/${game.threshold}`
  };
}

console.log(JSON.stringify(reports, null, 2));
