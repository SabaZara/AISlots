# AISlots World Forge

AISlots is a dependency-free simulated-credit slot prototype built around one configurable game. Before entering the cabinet, the player chooses a background world, one companion, a mood, and a symbol family in a guided four-step creator.

`7 themes × 8 companions × 4 moods × 6 symbol sets = 1,344 configurations`

Every configuration uses the same deterministic outcome model, exact **99.00% theoretical RTP**, and SHA-256 commit/reveal receipt. Visual choices, sound choices, balance, and play history never change outcome probabilities.

## World Forge catalog

| Layer | Choices |
|---|---|
| Themes | Fire, Ice, Nature, Void, Coral Reef, Golden Temple, Eclipse |
| Companions | Valkyrie, Dragon, Direwolf, Kraken, Titan, Tiger Warrior, Gorilla Warrior, Arcane Sorceress |
| Atmospheres | Epic, Arcane, Playful, Shadow |
| Symbol sets | Inferno, Frostbound, Verdant, Cosmic, Tempest, Coral |

Only one companion is displayed in a game. The eight supplied green-screen masters are converted into edge-cleaned transparent RGBA foreground cutouts with no rectangular image canvas, while the background, atmosphere treatment, and seven-symbol family remain independent layers. Every symbol family is also a true-alpha 4×2 atlas: seven isolated, consistently occupied world-specific silhouettes and one empty cell, with no square artwork background or cross-cell artifacts. During a spin, each of the six reels moves as one continuous vertical strip, without independent tile/block motion; each strip preserves its live offset, decelerates smoothly without a bounce, stops left-to-right, and freezes exactly on its sealed result. The opening creator presents one graphical choice group at a time and starts the game directly from the fourth step without a review page. Its neutral state is completely empty, the live preview gives Atmosphere a full-image treatment and matching light card, and every Relic choice enlarges three representative isolated symbols for quick comparison. Phones show every choice without internal scrolling; the Character step uses a fixed 4×2 grid. The enhanced generation prompts and asset specifications are recorded in [`ASSET_PROMPTS.md`](./ASSET_PROMPTS.md).

## Play features

- six uninterrupted reels, five rows, one continuous reel bed, and 25 fixed left-to-right paylines;
- continuous downward reel travel followed by strictly ordered reel-one-to-reel-six stops; landed reel tracks remain reserved so later animation never crosses them;
- every positive return is shown, including returns smaller than the wager;
- a single Auto–Spin–Speed control row, with direct infinite Auto/Stop on the left and the standalone Normal 1× / Fast 3× toggle on the right;
- persistent 18-Scatter feature progress shown by a compact themed Scatter-art tracker with no circular counter or dot field;
- theme-art Special Bet modes that guarantee +1 or +2 meter progress while preserving 99.00% theoretical RTP;
- theme-art 25×, 50×, and 100× Buy Bonus choices calibrated to the same 99.00% return;
- three themed Sky Runner multiplier flights per bonus; every world has a separately generated launch scene and a compatible transparent plane livery, with multiplier-scaled destination distance, layered parallax depth, and one constant-speed path without a pause or final jump;
- visible distance, altitude, 10,000 m ceiling, multiplier ladder, running multiplier total, and round progress;
- animated win tiers, symbol-to-core fusion threads and bursts, transparent Scatter breakout, particles, cabinet reactions, and large-win cinematics;
- four distinct fully procedural music and event-sound profiles;
- persistent session balance, bonus progress, visual configuration, audio preference, and spin-speed preference;
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

Gameplay and the World Forge creator are viewport-locked with no document scrolling on desktop, phone, or iPad. The creator opens in a neutral state with no environment selected or preloaded; world art is staged only after the player explicitly picks a theme. Phones use a dedicated touch-first composition with a fixed choice grid, portrait preview, safe-area padding, and roomier separation around controls. Rotated phones and tablets retain their own viewport-specific sizing. The cabinet uses a quieter frame and one unified control language; direct infinite Auto/Stop is attached to Spin, and the enlarged 99.00% RTP badge remains visible on narrow screens. On laptops the companion retains a dedicated but balanced right-side stage. The 6×5 board, Scatter tracker, companion, Spin, bet controls, Normal/Fast, Autoplay, Special Bet, and Buy Bonus remain inside the viewport. During a win, transparent symbol art can fuse toward a shared energy core while every underlying reel tile stays still.

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

This build is an **18+ simulated-credit prototype**. A regulated real-money launch still requires jurisdiction-specific licensing, independent math/RNG certification, backend-controlled balances and seeds, secure identity/account services, responsible-gambling controls, approved wallet/payment systems, accessibility review, asset and audio rights review, privacy/security review, telemetry, and operational monitoring.
