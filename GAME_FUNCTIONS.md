# AISlots World Forge — Function Inventory

Version reviewed: **4.3.0**

This file is the team-review checklist for the current free-play build. Runtime publication contains one configurable slot, not several reskinned games.

## Configuration system

| Function | Status | Behavior |
|---|---|---|
| First-screen game creator | Implemented | The site opens on a true edge-to-edge guided creator. One graphical choice group appears at a time and a cinematic preview stays centered below. The cabinet remains hidden until play starts. |
| Explicit layer choices | Implemented | World, Character, Mood, and Relics are four ordered steps. Selecting an option automatically opens the next step; Back revisits the previous step. |
| Theme selection | Implemented | Graphical choices select Fire, Ice, Nature, Void, Storm, or Abyss. The selected world immediately updates the preview and creator accent. |
| One companion | Implemented | Valkyrie, Dragon, Direwolf, Kraken, Titan, Tiger Warrior, Gorilla Warrior, or Arcane Sorceress; exactly one transparent standalone cutout is displayed. |
| Mood selection | Implemented | Epic, Mystic, Playful, or Dark changes lighting treatment and audio profile. |
| Symbol selection | Implemented | Six newly generated seven-symbol RGBA families use distinct silhouettes, color palettes, value tiers, and world-specific coins, feathers, eggs/orbs, weapons, temples, wings, and rebirth crests. |
| Surprise me | Implemented | Randomly chooses all four player-facing visual layers, updates the preview, and advances directly to review. |
| Saved configuration | Implemented | The browser restores the player’s previous World Forge choices. |
| Combination count | Implemented | 6 × 8 × 4 × 6 = 1,152 configurations. |

## Core play

| Function | Status | Behavior |
|---|---|---|
| Reel grid | Implemented | Six reels × five rows remain visible throughout a spin. |
| Paylines | Implemented | 25 fixed lines; three or more identical paying symbols connect from reel one. Lines are calculated but not drawn over the art. |
| Bet controls | Implemented | Minus, plus, and Max with balance-aware limits. |
| Spin | Implemented | Wager is sealed before the presentation begins; symbols travel downward continuously and reels settle in six visible phases. |
| Normal/Fast | Implemented | Separate 1× and 3× presentation choices next to Spin; neither changes the result. |
| Autoplay | Implemented | Finite 10, 25, or 50 spins. The button sits directly beside Spin, becomes Stop while active, and stops on insufficient free-play balance. |
| Positive-return display | Implemented | Every positive payout receives an animated numeric result, even when it is smaller than the wager. |
| Win celebrations | Implemented | Win, Nice, Big, Mega, and Epic tiers scale the banner, particles, cabinet reaction, audio, and cinematic treatment. |
| Winner animation | Implemented | Winning symbol art pulls toward a shared energy core, connects with themed light threads, bursts, and settles into a readable pulse. Reel tiles never move or stretch; only transparent art animates. |
| Result history | Implemented | Total won, spins, best win, and last-win details are available without showing session loss. |

## Persistent feature and bonus

| Function | Status | Behavior |
|---|---|---|
| Scatter tracker | Implemented | Every Scatter anywhere on the board advances persistent 18-step progress. Overflow carries into the next tracker. The old circular counter and dot field are removed. |
| Dynamic Scatter art | Implemented | Each selected family supplies a transparent rebirth/Scatter crest in its reel atlas plus a dedicated transparent tracker cutout. |
| Special Bet | Implemented | The selected world image and Scatter art theme both the cabinet control and market panel. Standard, guaranteed +1 Scatter, or guaranteed +2 Scatters remain calibrated to 99.00% theoretical RTP. |
| Buy Bonus | Implemented | The selected launch scene and plane art theme both the cabinet control and market panel. 25×, 50×, or 100× free-play purchases use separately calibrated 99.00% prize tables. |
| Bonus demo | Implemented | Top-of-machine no-wager preview. It does not change balance, progress, or create a fairness receipt. |
| World-connected opening | Implemented | Fire, Ice, Nature, Void, Storm, and Abyss each use a separately generated launch-gate loading scene. The loading cinematic shows only the environment—no companion layer. The opening runs once. |
| Sky Runner flights | Implemented | Each world uses its own transparent plane livery. Multiplier determines destination distance: 0.25× lands just beyond takeoff, then 0.5×, 1×, 2×, 5×, and 10× stop at increasingly distant route points. The aircraft keeps one linear speed with no pause or last-frame jump. |
| Flight depth | Implemented | Generated launch scenery, far haze, midground motes, near silhouettes, speed streaks, aircraft scale, and three parallax rates create visible foreground/midground/background separation. |
| Land integrity | Implemented | Land affects reveal timing only. It cannot reroll, improve, or worsen the precomputed result. Flight duration and destination reflect the sealed result. |
| Theme matching | Implemented | The selected environment artwork, accent, and secondary color also style the bonus sky, trail, frame, route, and multiplier locks. |
| Flight telemetry | Implemented | Distance in kilometres, altitude in metres, a 10,000 m ceiling, route bars, and a 0.25×–10× multiplier ladder update continuously. |
| Round clarity | Implemented | Current flight, live X, labelled landed multipliers, total X, flight progress, and final dollar award stay visible. |
| Preview replay | Implemented | The no-wager Bonus Demo ends with Play Again and Back to game controls. |

## Visual and sound systems

- 42 active project-local generated raster assets: six backgrounds, eight transparent companion cutouts, four mood overlays, six transparent symbol atlases, six transparent Scatter tracker cutouts, six bonus launch scenes, and six transparent themed planes.
- Backgrounds keep the central reel area low-detail; companion and symbol PNGs use true alpha transparency; symbol atlases use a fixed 4×2 layout with the last cell empty and no square art canvas.
- The cabinet uses one display typeface and one interface typeface. Frames, tiles, and control panels use a restrained single-border system so symbols, Spin, RTP, and wins dominate the hierarchy.
- Dollar formatting replaces the legacy unit suffix throughout balance, bet, returns, bonus awards, receipts, and win details; the 99.00% RTP badge is enlarged and remains visible on phones.
- One larger companion is layered independently from the selected background and receives dedicated cabinet space instead of a black portrait rectangle, including an expanded laptop stage.
- The top navigation, control deck, feature buttons, feature market, and bonus telemetry inherit the selected theme's artwork, accent, and secondary colors.
- Four mood-linked procedural music identities use different tempo, waveform, melody, ambience, and percussion behavior.
- Reel roll, reel stop, button, meter collection, flight launch, flight landing, victory, and big-win events have separate sound roles.
- Epic can layer the local WOW Sound files documented in `assets/audio/LICENSES.md`; music and event sound are both controlled by the single top-bar sound button.

## Fairness and return

- Exact combined theoretical RTP: **99.000%** for every configuration.
- Exact split: **75.400% base paylines + 23.600% Relic Vault**.
- Special Bet modes and 25×/50×/100× Buy Bonus tables are independently asserted at 99.00%.
- SHA-256 server-seed commitment is visible before a wager.
- Server seed, client seed, nonce, bet, prior progress, configuration, and deterministic outcome are revealed afterward.
- The client seed is editable before play.
- The verifier recomputes both the commitment and complete result.
- Themes, companions, moods, symbol art, presentation animation, balance, and session history never change weights or RNG input.

## Responsive and usability review

- No document scrolling during gameplay on desktop, mobile portrait, rotated phone landscape, or iPad/tablet layouts.
- World Forge starts neutral on every visit: no environment is selected or applied until the player chooses a theme.
- Phone World Forge uses fixed two-row choice grids with no internal scrolling; the eight-character step uses a 4×2 grid beside a dedicated portrait preview.
- Phone Spin, bet, win, and feature controls use larger responsive gaps to reduce accidental taps.
- `100dvh` sizing and safe-area insets account for mobile browser chrome and notches.
- Mobile controls are rearranged rather than reduced into overlapping desktop positions.
- Spin, bet, Normal/Fast, Autoplay, Special Bet, Buy Bonus, and Bonus Demo remain clickable.
- Autoplay opens as a viewport-level dialog that cannot be clipped by the cabinet.
- The 6×5 board and transparent companion are resized/repositioned on narrow screens without covering interactive controls.
- Winning transparent art can pull inward and pulse beyond its tile during the fusion effect. Tiles remain stationary; controls stay inside their safe regions.
- Reduced-motion preferences shorten or remove nonessential movement without changing game timing integrity.

## Deliberately absent

- no old multi-game lobby;
- no second companion in a cabinet;
- no payline drawing overlay;
- no manufactured “almost win” or “one short” copy;
- no session-loss total or session timer;
- no reality-check popup in this free-play prototype;
- no real-money deposit, withdrawal, payment, or cash prize function.

## Production gate

Before real-money release, require independent math/RNG certification, jurisdiction and platform approval, server-authoritative outcomes and wallets, identity/age controls, responsible-gambling functionality, secure account and payment services, accessibility testing, privacy/security review, complete asset/audio licensing records, analytics/monitoring, incident response, and release sign-off.
