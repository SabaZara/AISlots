# AISlots World Forge

AISlots is a dependency-free, free-play slot prototype built around one configurable game. Before entering the cabinet, the player combines a generated background, one companion, a mood, a symbol family, and a reel-motion style.

`6 themes × 6 companions × 4 moods × 6 symbol sets × 5 motion styles = 4,320 configurations`

Every configuration uses the same deterministic outcome model, exact **99.00% theoretical RTP**, and SHA-256 commit/reveal receipt. Visual choices, sound choices, balance, and play history never change outcome probabilities.

## World Forge catalog

| Layer | Choices |
|---|---|
| Themes | Fire, Ice, Nature, Void, Storm, Abyss |
| Companions | Dragon, Valkyrie, Kraken, Phoenix, Direwolf, Titan |
| Moods | Epic, Mystic, Playful, Dark |
| Symbol sets | Inferno, Frostbound, Verdant, Cosmic, Tempest, Abyssal |
| Motion | Cascade, Wave, Impact, Strike, Vortex |

Only one companion is displayed in a game. Each companion is a transparent RGBA foreground cutout with no rectangular image canvas, while the background, mood treatment, and seven-symbol sheet remain independent layers. The opening builder gives the selected companion a larger dedicated preview. The enhanced generation prompts and asset specifications are recorded in [`ASSET_PROMPTS.md`](./ASSET_PROMPTS.md).

## Play features

- six reels, five rows, and 25 fixed left-to-right paylines;
- continuous downward reel travel followed by six sequential stops, with Normal 1× or Fast 3× presentation speed;
- every positive return is shown, including returns smaller than the wager;
- finite 10, 25, or 50-spin autoplay with an always-accessible Stop control;
- persistent 18-symbol Relic Vault meter drawn as a transparent floating gauge with no bitmap background;
- graphic Special Bet modes that guarantee +1 or +2 meter progress while preserving 99.00% theoretical RTP;
- 25×, 50×, and 100× demo-credit Buy Bonus choices calibrated to the same 99.00% return;
- three themed Sky Runner multiplier flights per bonus; Land changes reveal timing only, then the red-and-gold plane follows a continuous path to its pre-sealed result;
- visible running multiplier total and round progress;
- animated win tiers, contained winner pulses, collector-only symbol breakout, particles, cabinet reactions, and large-win cinematics;
- four distinct procedural music/event-sound profiles, with a local high-energy sample layer for Epic;
- persistent demo balance, bonus progress, visual configuration, audio preference, and spin-speed preference;
- game rules, paytable, last-win detail, and a compact top-bar fairness verifier;
- no payline overlay, near-miss copy, loss display, session timer, or reality-check dialog.

## 99.00% return model

The exact analytical split is:

- base line pays: **75.400%**;
- persistent Relic Vault feature: **23.600%**;
- combined theoretical RTP: **99.000%**.

The 99% figure is a long-run mathematical expectation, not a promise for a session. `npm test` asserts the exact value for ordinary spins, both Special Bet modes, and all Buy Bonus prices. `npm run audit:rtp` provides a reproducible simulation audit.

## Provably fair receipts

Before each spin, the client displays `SHA-256(serverSeed)`. The receipt then reveals:

- server seed;
- player-editable client seed;
- nonce;
- wager and prior meter state;
- selected visual configuration;
- complete deterministic outcome.

The built-in verifier recomputes the commitment and outcome. Changing presentation layers does not alter the seeded math.

## Responsive layout

Gameplay is viewport-locked with no document scrolling on desktop, phone, or iPad. It includes dynamic-viewport units, safe-area padding, dedicated portrait controls, a horizontal phone cabinet after rotation, and tablet-specific sizing. The 6×5 board, transparent meter, companion, Spin, bet controls, Normal/Fast, Autoplay, Special Bet, Buy Bonus, and Bonus Demo remain inside the viewport. Autoplay is a viewport-level dialog and remains clickable above the cabinet. Regular winners stay contained in their cells; only the special collector symbol can break out across neighboring cells.

## Run locally

```bash
npm run dev
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

Verification commands:

```bash
npm run check
npm test
npm run audit:rtp
```

## Render deployment

The root [`render.yaml`](./render.yaml) defines a Render static site. Connect the GitHub repository in Render, select the branch containing `render.yaml`, leave Blueprint Path blank or set it to `render.yaml`, and apply the Blueprint. The static publish path is the repository root.

## Production gate

This build is an **18+ free-play prototype** with no deposits, cash value, or prizes. A regulated real-money launch still requires jurisdiction-specific licensing, independent math/RNG certification, backend-controlled balances and seeds, secure identity/account services, responsible-gambling controls, approved wallet/payment systems, accessibility review, asset and audio rights review, privacy/security review, telemetry, and operational monitoring.
