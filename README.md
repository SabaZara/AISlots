# The Lumen Collection

The Lumen Collection is a dependency-free, responsive suite of four free-play slot games. Each game uses a published 99.00% long-run return model, a separate persistent bonus meter, finite autoplay, shared demo credits, and a SHA-256 commit/reveal receipt.

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

- a compact four-game switcher with progress retained per game;
- bet controls and a maximum-bet shortcut;
- finite 10, 25, or 50-spin autoplay with an always-visible stop control;
- balance, last win, session net, recent result details, and feature progression;
- themed synthesized sound effects, win chords, collection tones, particles, bonus reveals, and big-win motion;
- reduced-motion support and keyboard spinning;
- a single compact fairness button in the top toolbar.

Autoplay is present only for this no-value free-play prototype. Real-money rules differ by jurisdiction, and some markets prohibit online-slot autoplay entirely.

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

All prompts required environment-only compositions, a low-detail center for readable reels, no text or logos, and no recognizable characters or copied game imagery. Symbols and interface graphics are original inline SVG/CSS assets. Any final UFC trademarks, logos, approved typography, fighter likenesses, event names, or sponsor material should come from the license holder's approved brand pack and legal review.

## Render deployment

`render.yaml` defines a Render Static Site. Connect the repository through **New → Blueprint** in Render, select the repository, and apply the `lumen-slot-collection` service. No environment variables or build dependencies are required.

## Real-money production gate

This is a public-shareable free-play prototype, not a licensed cash gambling product. A real-money release still requires jurisdiction-specific licensing, independent RNG/game-math/security certification, audited server-side outcomes, identity and age verification, secure wallet and ledger services, responsible-gambling controls, accessibility and privacy review, monitoring, incident response, and market-specific limits and disclosures.

Do not modify game weights or payouts in a live certified version. Treat every math change as a new version requiring recalculation, regression tests, and certification review.
