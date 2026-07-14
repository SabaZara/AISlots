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
- a four-game lobby reachable from the top-left brand, with progress retained per game;
- four generated bonus HUDs with real progress lights: Astral moonstone constellation, Neon pearl-and-coral current, Ember black-steel forge, and UFC red/gold arena frame;
- four distinct reel-motion systems: celestial cascade, underwater wave, heavy forge slam, and left-to-right fight strike;
- permanent per-game ledgers showing total credits won, spins played, and each title's biggest win;
- reel-stop anticipation for strong collector results and feature triggers;
- animated win count-ups, highlighted winning symbols, collection bursts, and themed bonus reveals;
- tiered Nice, Big, Mega, and Epic win presentation, including full-screen celebrations from 10× bet;
- themed reel-start, reel-stop, anticipation, collection, payout, bonus, and celebration sound cues;
- four sealed bonus presentations: Moonwell Multiplier Gate, Pearl Cluster Cascade, Crown Multiplier Forge, and Championship Hold & Win;
- a clean balance, RTP, and free-play header without session-loss or elapsed-time readouts;
- honest partial-return messaging: any returned credits stay prominent, while a return below the bet does not receive a win celebration;
- high-contrast generated reel symbols with distinct silhouettes and per-symbol color coding;
- winning-symbol animation without drawn payline overlays;
- larger spin, autoplay, bet, navigation, and win-presentation controls on desktop and mobile;
- four distinct continuous spin-tick patterns plus themed reel-stop cues instead of one shared generic tick;
- four original opt-in ambient music motifs—Astral lunar pulse, underwater pulse, forge ostinato, and arena rhythm—generated live by Web Audio rather than copied music;
- a layered Web Audio production engine with stereo reel motion, compression, synthesized room reverb, continuous spin beds, themed impact landings, anticipation risers, payout cues, payout-count notes, and bonus reveal hits;
- synchronized premium motion staging: speed-stream overlays, per-reel impact flashes, machine shake, collector highlights, dancing winning symbols, staged bonus reveals, and multi-phase big-win scenes;
- an Astral Bloom cinematic showcase with an original generated Moonwell guardian and multiplier apparatus, a full-screen awakening transition, individually locking X prizes, a persistent total-X readout, staged award counting, and a clearly labeled no-wager **Bonus demo** button at the top of the game;
- Astral-only **Special bet** modes that guarantee +1 or +2 meter Blooms per spin at mathematically calibrated wager multipliers while preserving 99.00% theoretical RTP;
- Astral-only 25×, 50×, and 100× **Buy bonus** options using demo credits only; each deterministic purchase preserves 99.00% theoretical RTP and produces a commit/reveal receipt;
- a graphic Moonwell feature market with concise Special Bet and Buy Bonus explanations, plus a generated multiplier-gate scene that shows live candidate X values, passed values, the selected X, and overall round progress;
- an image-led Astral cabinet with two original animated world characters, a low-text interface, a larger icon-only spin control, jumping result typography, turbo timing, and visibly dancing winning symbols;
- opt-in licensed Astral audio samples for the reel wheel and “you win” voice, with source and license records in `assets/audio/LICENSES.md`;
- bet controls and a maximum-bet shortcut;
- an Astral-only Autoplay dock below the main controls while the other games retain their original inline Autoplay placement;
- finite 10, 25, or 50-spin autoplay with an always-visible stop control;
- balance, last return, recent result details, and feature progression, including a persistent Astral return badge that compares credits returned with the current bet;
- themed synthesized sound effects, win chords, collection tones, particles, bonus reveals, and big-win motion;
- reduced-motion support and keyboard spinning;
- viewport-locked desktop, phone, and iPad gameplay with no page scrolling, dynamic-viewport sizing, safe-area padding, compact portrait controls, and a dedicated horizontal cabinet after rotation;
- overflow-safe winning-symbol breakouts on phones, plus a compact portrait HUD that replaces the redundant machine title so character faces stay unobstructed;
- a no-scroll responsive lobby that uses a 2×2 chooser in portrait and a four-card row in landscape;
- a single compact fairness button in the top toolbar.

Responsive QA covers 320×568, 360×740, and 390×844 phone portraits; 667×375 and 844×390 phone landscapes; 768×1024 iPad portrait; 1024×768 iPad landscape; and desktop cabinets. The document remains exactly viewport-sized at each breakpoint.

Autoplay is present only for this no-value free-play prototype. Real-money rules differ by jurisdiction, and some markets prohibit online-slot autoplay entirely.

The game does not engineer near-misses, amplify losses disguised as wins, fabricate winner feeds, accept money, send re-engagement notifications, or change demo odds. Special bets and feature buys use free-play credits only, keep 99.00% theoretical RTP, and seal every result in a fairness receipt before animation starts.

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

The player can change the client seed. After a spin, the secret is revealed and the verifier recreates the selected game, all 20 symbols, base-game wins, persistent progress, and feature prizes. Four-byte values use rejection sampling before weighted mapping to avoid modulo bias.

This static demo holds the unrevealed seed in browser memory. A real-money implementation must move seeds, nonce control, account state, balance updates, and signed receipts to audited server infrastructure.

## Original artwork

The project-bound world art was generated with the built-in OpenAI image-generation tool. Each world now uses a transparent character plate independently layered over its environment:

- `assets/astral-characters-cutout-v1.png` — an original moon-garden oracle and crystal-antler sentinel.
- `assets/neon-characters-cutout-v1.png` — an original pearl-current navigator and deep-sea guardian.
- `assets/ember-characters-cutout-v1.png` — an original forge queen and obsidian furnace warden.
- `assets/ufc-characters-cutout-v1.png` — two original fictional MMA champions with no real-fighter likenesses or sponsor marks.

Astral also includes three feature presentation plates:

- `assets/astral-bonus-chamber-v1.png` — a three-portal Moonwell bonus chamber.
- `assets/astral-guardian-cinematic-v1.png` — the full-screen Moonwell awakening guardian.
- `assets/astral-multiplier-gate-v1.png` — the original lunar multiplier apparatus used by the feature market and bonus round.

The four original background plates remain available as optimized 1672×941 JPEG assets:

- `assets/astral-bloom-bg.jpg` — an enchanted celestial greenhouse with a calm central play area.
- `assets/neon-tides-bg.jpg` — a bioluminescent underwater pearl treasury with shell architecture.
- `assets/ember-crown-bg.jpg` — a monumental obsidian sky forge with molten channels and a crown furnace.
- `assets/ufc-octagon-bg.jpg` — a cinematic logo-free mixed-martial-arts arena with an illuminated octagonal cage.

Each game also has a dedicated 1774×887 raster symbol sheet generated with the same built-in image tool:

- `assets/symbols-astral-transparent-v5.png` — transparent-background high-contrast moonflower, orbit crystal, crown gem, comet lantern, dewdrop, leaf shield, and petal rosette icons; only the icon artwork moves on Astral wins.
- `assets/symbols-neon-v2.png` — pearl, tide ring, starfish gem, coral spear, shell, and Pearl Key.
- `assets/symbols-ember-v2.png` — sunsteel seal, forge ring, star anvil, ember spear, scale, and Crown Rune.
- `assets/symbols-ufc-v2.png` — logo-free championship belt, octagon, event star, strike, clock, glove, and Fight Token.

Each persistent collection meter now uses a dedicated transparent generated HUD plate with a live HTML count and deterministic progress lights layered over it:

- `assets/astral-bonusbar-frame-v1.png` — silver moonstone and constellation frame.
- `assets/neon-bonusbar-frame-v1.png` — pearl shell, coral, and sapphire current frame.
- `assets/ember-bonusbar-frame-v1.png` — blackened steel, bronze, and molten rune frame.
- `assets/ufc-bonusbar-frame-v1.png` — original logo-free red, black, and gold combat-arena frame.

The background prompts required environment-only compositions, a low-detail center for readable reels, no text or logos, and no recognizable characters or copied game imagery. The symbol prompts required seven isolated glossy 3D game icons on a removable chroma background. Any final UFC trademarks, logos, approved typography, fighter likenesses, event names, or sponsor material should come from the license holder's approved brand pack and legal review.

See `GAME_FUNCTIONS.md` for the team-review inventory of controls, math, bonuses, presentation, audio, fairness, accessibility, and remaining production gates.

## Render deployment

`render.yaml` defines the `aislots` Render Static Site. Connect the repository through **New → Blueprint** in Render, select the repository, and apply the Blueprint. No environment variables or build dependencies are required.

## Real-money production gate

This is a public-shareable free-play prototype, not a licensed cash gambling product. A real-money release still requires jurisdiction-specific licensing, independent RNG/game-math/security certification, audited server-side outcomes, identity and age verification, secure wallet and ledger services, responsible-gambling controls, accessibility and privacy review, monitoring, incident response, and market-specific limits and disclosures.

Do not modify game weights or payouts in a live certified version. Treat every math change as a new version requiring recalculation, regression tests, and certification review.
