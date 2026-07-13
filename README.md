# The Lumen Collection

The Lumen Collection is a dependency-free, responsive suite of four free-play slot games. It opens on a full-screen game chooser, then gives each title its own generated symbol art, reel treatment, spin action, persistent bonus rhythm, and sound palette. Every game uses a published 99.00% long-run return model, finite autoplay, shared demo credits, and a SHA-256 commit/reveal receipt.

## Included games

| Game | Persistent feature | Trigger | Reveals | Theoretical RTP |
| --- | --- | ---: | ---: | ---: |
| Astral Bloom | Moonwell Bloom | 12 Blooms | 3 | 99.00% |
| Neon Tides | Pearl Current | 10 Pearl Keys | 4 | 99.00% |
| Ember Crown | Crown Forge | 15 Crown Runes | 2 | 99.00% |
| UFC Octagon Gold | Fight Card Frenzy | 10 Fight Tokens | 3 | 99.00% |

All four use a 5×4 grid and 20 fixed left-to-right paylines. Their feature pacing and prize tables differ, and `theoreticalRtp(gameId)` derives the exact base/feature split for each title.

## Run and test

```bash
npm test
npm run check
npm run audit:rtp
npm run dev
```

Open `http://localhost:4173`.

The interface includes:

- a first-entry four-game lobby that also performs the 18+ free-play confirmation;
- a compact four-game switcher with progress retained per game;
- four distinct bonus-meter machines: Astral constellation orbit, Neon pearl-current tank, Ember forge-heat chamber, and UFC ten-step fight card;
- four distinct reel-motion systems: celestial cascade, underwater wave, heavy forge slam, and left-to-right fight strike;
- permanent per-game ledgers showing total credits won, spins played, and each title's biggest win;
- reel-stop anticipation for strong collector results and feature triggers;
- animated win count-ups, highlighted winning symbols, collection bursts, and themed bonus reveals;
- tiered Nice, Big, Mega, and Epic win presentation, including full-screen celebrations from 10× bet;
- themed reel-start, reel-stop, anticipation, collection, line-win, bonus, and celebration sound cues;
- four sealed bonus presentations: Moonwell Free Spins, Pearl Cluster Cascade, Crown Multiplier Forge, and Championship Hold & Win;
- a visible session timer, configurable net-loss limit, 15-minute reality checks, and wagered/returned/net summaries;
- honest partial-return messaging: a payout below the bet is shown as a net loss and never receives a win celebration;
- bet controls and a maximum-bet shortcut;
- finite 10, 25, or 50-spin autoplay with an always-visible stop control;
- balance, last win, session net, recent result details, and feature progression;
- themed synthesized sound effects, win chords, collection tones, particles, bonus reveals, and big-win motion;
- reduced-motion support and keyboard spinning;
- a single compact fairness button in the top toolbar.

Autoplay is present only for this no-value free-play prototype. Real-money rules differ by jurisdiction, and some markets prohibit online-slot autoplay entirely.

The game does not engineer near-misses, amplify losses disguised as wins, fabricate winner feeds, sell bonus access, send re-engagement notifications, or change demo odds. Bonus choices are presentation controls only: every result and prize is sealed in the fairness receipt before the reveal animation starts.

## Published 99% return

Every game has a combined long-run theoretical RTP of exactly `0.99`:

- Astral Bloom: 75.400% base + 23.600% Moonwell
- Neon Tides: 78.280% base + 20.720% Pearl Current
- Ember Crown: 76.280% base + 22.720% Crown Forge
- UFC Octagon Gold: 69.060% base + 29.940% Fight Card Frenzy

The exact calculation is asserted for all four games in `tests/game-model.test.js`. `npm run audit:rtp` runs a reproducible simulation across every title. Sampling results naturally vary around the exact mathematical value.

RTP is a long-run average, not a promise for a player, spin, autoplay session, or short test sample.

## Fairness receipt

Before each spin, the game commits to `SHA-256(serverSeed)`. The deterministic outcome stream is:

```text
SHA-256(serverSeed:clientSeed:nonce:counter)
```

The player can change the client seed. After a spin, the secret is revealed and the verifier recreates the selected game, all 20 symbols, line wins, persistent progress, and feature prizes. Four-byte values use rejection sampling before weighted mapping to avoid modulo bias.

This static demo holds the unrevealed seed in browser memory. A real-money implementation must move seeds, nonce control, account state, balance updates, and signed receipts to audited server infrastructure.

## Original artwork

The four project-bound background plates were generated with the built-in OpenAI image-generation tool, then converted to optimized 1672×941 JPEG assets:

- `assets/astral-bloom-bg.jpg` — an enchanted celestial greenhouse with a calm central play area.
- `assets/neon-tides-bg.jpg` — a bioluminescent underwater pearl treasury with shell architecture.
- `assets/ember-crown-bg.jpg` — a monumental obsidian sky forge with molten channels and a crown furnace.
- `assets/ufc-octagon-bg.jpg` — a cinematic logo-free mixed-martial-arts arena with an illuminated octagonal cage.

Each game also has a dedicated transparent 1774×887 raster symbol sheet generated with the same built-in image tool:

- `assets/symbols-astral-v3.png` — celestial orbs, comet, dewdrop, moonleaf, and Bloom.
- `assets/symbols-neon-v2.png` — pearl, tide ring, starfish gem, coral spear, shell, and Pearl Key.
- `assets/symbols-ember-v2.png` — sunsteel seal, forge ring, star anvil, ember spear, scale, and Crown Rune.
- `assets/symbols-ufc-v2.png` — logo-free championship belt, octagon, event star, strike, clock, glove, and Fight Token.

The background prompts required environment-only compositions, a low-detail center for readable reels, no text or logos, and no recognizable characters or copied game imagery. The symbol prompts required seven isolated glossy 3D game icons on a removable chroma background. Any final UFC trademarks, logos, approved typography, fighter likenesses, event names, or sponsor material should come from the license holder's approved brand pack and legal review.

## Render deployment

`render.yaml` defines the `aislots` Render Static Site. Connect the repository through **New → Blueprint** in Render, select the repository, and apply the Blueprint. No environment variables or build dependencies are required.

## Real-money production gate

This is a public-shareable free-play prototype, not a licensed cash gambling product. A real-money release still requires jurisdiction-specific licensing, independent RNG/game-math/security certification, audited server-side outcomes, identity and age verification, secure wallet and ledger services, responsible-gambling controls, accessibility and privacy review, monitoring, incident response, and market-specific limits and disclosures.

Do not modify game weights or payouts in a live certified version. Treat every math change as a new version requiring recalculation, regression tests, and certification review.
