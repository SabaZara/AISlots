# AISlots World Forge — Function Inventory

Version reviewed: **4.5.5**

This file is the team-review checklist for the current simulated-credit build. Runtime publication contains one configurable slot, not several reskinned games.

## Configuration system

| Function | Status | Behavior |
|---|---|---|
| First-screen game creator | Implemented | The site opens on a true edge-to-edge guided creator. One graphical choice group appears at a time and a cinematic preview stays centered below. The cabinet remains hidden until play starts. |
| Explicit layer choices | Implemented | World, Character, Mood, and Relics are four ordered steps. A selection stays on its current step until the player clicks Next; Back revisits the previous step. The fourth button starts the game directly, with no review page. |
| Theme selection | Implemented | Graphical choices select Fire, Ice, Nature, Void, Storm, or Abyss. The selected world immediately updates the preview and creator accent. |
| One companion | Implemented | Valkyrie, Dragon, Direwolf, Kraken, Titan, Tiger Warrior, Gorilla Warrior, or Arcane Sorceress; exactly one static transparent cutout uses the original right-side cabinet layout. |
| Atmosphere selection | Implemented | Epic, Arcane, Playful, or Shadow swaps the entire layered soundscape (music, ambience, spin, rewards, UI) and complements it with a matching lighting treatment. The live preview shows a dedicated color-coded Mood badge and matching light treatment. |
| Symbol selection | Implemented | Six generated seven-symbol RGBA families use distinct silhouettes, color palettes, value tiers, and world-specific coins, weapons, and scatter crests. Creator cards show all six paying relics plus the dedicated Scatter cutout without dark artwork backing tiles. |
| Surprise me | Implemented | Randomly chooses all four player-facing visual layers, updates the preview, and moves to the final Relics step ready to start. |
| Saved configuration | Implemented | The browser restores the player’s previous World Forge choices. |
| Combination count | Implemented | 6 × 8 × 4 × 6 = 1,152 configurations. |

## Core play

| Function | Status | Behavior |
|---|---|---|
| Reel grid | Implemented | Six reels × five rows remain visible on one uninterrupted reel bed without a surrounding cabinet border. A stopped reel keeps its track reserved, so later rolling reels can never slide over it. |
| Paylines | Implemented | 25 fixed lines; three or more identical paying symbols connect from reel one. Lines are calculated but not drawn over the art. |
| Bet controls | Implemented | Minus, plus, and Max with balance-aware limits. |
| Spin | Implemented | Wager is sealed before the presentation begins; symbols travel downward continuously and the result lands strictly from reel one through reel six. |
| Normal/Fast | Implemented | One standalone Speed button toggles between 1× and 3× presentation timing immediately to the right of Spin; it never changes the result. |
| Autoplay | Implemented | One click starts continuous infinite autoplay. The same standalone button immediately becomes Stop; clicking it ends the sequence after the active spin. Insufficient balance also stops it safely. |
| Positive-return display | Implemented | Every positive payout receives one centered animated numeric result, even when it is smaller than the wager. Duplicate reel-bottom, big-win-bottom, and control-deck readouts are removed. |
| Win celebrations | Implemented | Win, Nice, Big, Mega, and Epic tiers scale the banner, particles, cabinet reaction, audio, and cinematic treatment. |
| Winner animation | Implemented | Winning symbol art pulls toward a shared energy core, connects with themed light threads, bursts, and settles into a readable pulse. Reel tiles never move or stretch; only transparent art animates. |
| Result history | Implemented | Last-win details remain available from the information control without a permanent statistics block in the cabinet. |

## Persistent feature and bonus

| Function | Status | Behavior |
|---|---|---|
| Scatter tracker | Implemented | Every Scatter anywhere on the board advances persistent 18-step progress. Overflow carries into the next tracker. The old circular counter and dot field are removed. |
| Dynamic Scatter art | Implemented | Each selected family supplies one dedicated transparent Scatter cutout shared by the reel cells, creator card, collection tracker, and feature panels. |
| Special Bet | Implemented | The selected world image and Scatter art theme both the cabinet control and market panel. Standard, guaranteed +1 Scatter, or guaranteed +2 Scatters remain calibrated to 99.00% theoretical RTP. |
| Buy Bonus | Implemented | The selected launch scene and plane art theme both the cabinet control and market panel. 25×, 50×, or 100× purchases use separately calibrated 99.00% prize tables. |
| World-connected opening | Implemented | Fire, Ice, Nature, Void, Storm, and Abyss each use a separately generated launch-gate loading scene. The loading cinematic shows only the environment—no companion layer. The opening runs once. |
| Sky Runner flights | Implemented | Each world uses its own transparent plane livery. Multiplier determines destination distance: 0.25× lands just beyond takeoff, then 0.5×, 1×, 2×, 5×, and 10× stop at increasingly distant route points. The aircraft keeps one linear speed with no pause or last-frame jump. |
| Flight depth | Implemented | Generated launch scenery, far haze, midground motes, near silhouettes, speed streaks, aircraft scale, and three parallax rates create visible foreground/midground/background separation. |
| Land integrity | Implemented | Land affects reveal timing only. It cannot reroll, improve, or worsen the precomputed result. Flight duration and destination reflect the sealed result. |
| Theme matching | Implemented | The selected environment artwork, accent, and secondary color also style the bonus sky, trail, frame, route, and multiplier locks. |
| Flight telemetry | Implemented | Distance in kilometres, altitude in metres, a 10,000 m ceiling, route bars, and a 0.25×–10× multiplier ladder update continuously. |
| Round clarity | Implemented | Current flight, live X, labelled landed multipliers, total X, flight progress, and final dollar award stay visible. |

## Visual and sound systems

- 42 active project-local generated raster assets: six backgrounds, eight transparent companion cutouts, four mood overlays, six transparent symbol atlases, six transparent Scatter tracker cutouts, six bonus launch scenes, and six transparent themed planes.
- Backgrounds keep the central reel area low-detail; companion and symbol PNGs use true alpha transparency. Version-three symbol atlases normalize occupied area, glow strength, and centering; long weapons use a diagonal presentation without stretching, the final atlas cell stays empty, and cross-cell fragments are removed. The catalog module is versioned with the release so deployed browsers cannot reuse obsolete atlas mappings.
- The cabinet uses one display typeface and one interface typeface. Frames, tiles, and control panels use a restrained single-border system so symbols, Spin, RTP, and wins dominate the hierarchy.
- Dollar formatting replaces the legacy unit suffix throughout balance, bet, returns, bonus awards, receipts, and win details; the 99.00% RTP badge is enlarged and remains visible on phones.
- One larger static companion is layered independently from the selected background in the original right-side cabinet position.
- The Bet, Auto, Spin, and Speed controls float directly on the world art without a dark control-deck block.
- The top navigation, control deck, feature buttons, feature market, and bonus telemetry inherit the selected theme's artwork, accent, and secondary colors.
- Four mood-linked procedural music identities use different tempo, waveform, melody, ambience, and percussion behavior.
- Reel roll, reel stop, button, meter collection, flight launch, flight landing, victory, and big-win events have separate sound roles.
- Spins use six continuous vertical reel strips. Symbols move together within each reel and clip only at the outer reel window; the previous independent per-tile block shuffle is not used. Every reel keeps its exact live pixel offset, continues at matched speed, decelerates monotonically without overshoot, and freezes on the sealed result before the next win effect begins.
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
- World Forge starts neutral on every visit: no environment is selected or applied until the player chooses a theme, and the unloaded preview contains no ambient dots or rings.
- Phone World Forge uses fixed two-row choice grids with no internal scrolling; the eight-character step uses a 4×2 grid beside a dedicated portrait preview.
- Phone Spin, bet, win, and feature controls use larger responsive gaps to reduce accidental taps.
- `100dvh` sizing and safe-area insets account for mobile browser chrome and notches.
- Mobile controls are rearranged rather than reduced into overlapping desktop positions.
- Spin, bet, Normal/Fast, Autoplay, Special Bet, and Buy Bonus remain clickable.
- Infinite Autoplay starts directly from its cabinet button with no menu or clipped overlay; the same button becomes Stop.
- The 6×5 board and transparent companion are resized/repositioned on narrow screens without covering interactive controls.
- Winning transparent art can pull inward and pulse beyond its tile during the fusion effect. Tiles remain stationary; controls stay inside their safe regions.
- Reduced-motion preferences shorten or remove nonessential movement without changing game timing integrity.

## Deliberately absent

- no old multi-game lobby;
- no second companion in a cabinet;
- no payline drawing overlay;
- no manufactured “almost win” or “one short” copy;
- no session-loss total or session timer;
- no reality-check popup in this simulated-credit prototype;
- no real-money deposit, withdrawal, payment, or cash prize function.

## Production gate

Before real-money release, require independent math/RNG certification, jurisdiction and platform approval, server-authoritative outcomes and wallets, identity/age controls, responsible-gambling functionality, secure account and payment services, accessibility testing, privacy/security review, complete asset/audio licensing records, analytics/monitoring, incident response, and release sign-off.
