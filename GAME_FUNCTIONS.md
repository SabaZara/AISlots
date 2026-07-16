# AISlots World Forge — Function Inventory

Version reviewed: **3.2.0**

This file is the team-review checklist for the current free-play build. Runtime publication contains one configurable slot, not several reskinned games.

## Configuration system

| Function | Status | Behavior |
|---|---|---|
| First-screen game builder | Implemented | The site opens on World Forge before gameplay, with a larger foreground preview of the selected companion. |
| Theme selection | Implemented | Fire, Ice, Nature, Void, Storm, or Abyss changes the 16:9 environment. |
| One companion | Implemented | Dragon, Valkyrie, Kraken, Phoenix, Direwolf, or Titan; exactly one transparent standalone cutout is displayed. |
| Mood selection | Implemented | Epic, Mystic, Playful, or Dark changes lighting treatment and audio profile. |
| Symbol selection | Implemented | Six generated seven-symbol families with distinct collector icons and names. |
| Motion selection | Implemented | Cascade, Wave, Impact, Strike, or Vortex changes spin presentation timing/animation only. |
| Surprise me | Implemented | Randomly chooses all five visual layers, then updates the preview. |
| Saved configuration | Implemented | The browser restores the player’s previous World Forge choices. |
| Combination count | Implemented | 6 × 6 × 4 × 6 × 5 = 4,320 configurations. |

## Core play

| Function | Status | Behavior |
|---|---|---|
| Reel grid | Implemented | Six reels × five rows remain visible throughout a spin. |
| Paylines | Implemented | 25 fixed lines; three or more identical paying symbols connect from reel one. Lines are calculated but not drawn over the art. |
| Bet controls | Implemented | Minus, plus, and Max with balance-aware limits. |
| Spin | Implemented | Wager is sealed before the presentation begins; symbols travel downward continuously and reels settle in six visible phases. |
| Normal/Fast | Implemented | Separate 1× and 3× presentation choices next to Spin; neither changes the result. |
| Autoplay | Implemented | Finite 10, 25, or 50 spins. Stop remains accessible and autoplay stops on insufficient demo balance. |
| Positive-return display | Implemented | Every positive payout receives an animated numeric result, even when it is smaller than the wager. |
| Win celebrations | Implemented | Win, Nice, Big, Mega, and Epic tiers scale the banner, particles, cabinet reaction, audio, and cinematic treatment. |
| Winner animation | Implemented | Normal winners pulse inside their cells. Only the special collector art jumps beyond its cell; the tile never moves. |
| Result history | Implemented | Total won, spins, best win, and last-win details are available without showing session loss. |

## Persistent feature and bonus

| Function | Status | Behavior |
|---|---|---|
| Relic Vault meter | Implemented | Every collector symbol anywhere on the board advances a persistent 18-step meter. Overflow carries into the next meter. The gauge is CSS-rendered without a rectangular background image. |
| Dynamic collector art | Implemented | The collector name and art come from the selected symbol family. |
| Special Bet | Implemented | Standard, guaranteed +1 collector, or guaranteed +2 collectors. Costs are mathematically calibrated to preserve 99.00% theoretical RTP. |
| Buy Bonus | Implemented | 25×, 50×, or 100× demo-credit purchases with separately calibrated prize tables at 99.00% theoretical RTP. |
| Bonus demo | Implemented | Top-of-machine no-wager preview. It does not spend credits, change progress, or create a fairness receipt. |
| Sky Runner flights | Implemented | Three aviation rounds use an original red-and-gold plane. The plane takes off, climbs continuously, and eases to the sealed multiplier when the player presses Land. |
| Land integrity | Implemented | Land affects reveal timing only. It cannot reroll, improve, or worsen the precomputed result. Flight duration and destination reflect the sealed result. |
| Theme matching | Implemented | The selected environment artwork, accent, and secondary color also style the bonus sky, trail, frame, route, and multiplier locks. |
| Round clarity | Implemented | Current flight, live X, landed multipliers, total X, flight progress, and final credit award stay visible. |
| Preview replay | Implemented | The no-wager Bonus Demo ends with Play Again and Back to game controls. |

## Visual and sound systems

- 23 active project-local generated raster assets: six backgrounds, six transparent companion cutouts, four mood overlays, six symbol sheets, and one transparent red Sky Runner plane.
- Backgrounds keep the central reel area low-detail; companion PNGs use true alpha transparency; symbol sheets use a fixed 4×2 atlas with the last cell empty.
- One larger companion is layered independently from the selected background and receives dedicated cabinet space instead of a black portrait rectangle.
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
- Themes, companions, moods, symbol art, animation choice, balance, and session history never change weights or RNG input.

## Responsive and usability review

- No document scrolling during gameplay on desktop, mobile portrait, rotated phone landscape, or iPad/tablet layouts.
- `100dvh` sizing and safe-area insets account for mobile browser chrome and notches.
- Mobile controls are rearranged rather than reduced into overlapping desktop positions.
- Spin, bet, Normal/Fast, Autoplay, Special Bet, Buy Bonus, and Bonus Demo remain clickable.
- Autoplay opens as a viewport-level dialog that cannot be clipped by the cabinet.
- The 6×5 board and transparent companion are resized/repositioned on narrow screens without covering interactive controls.
- Regular winner art remains square and contained. Only the special collector can animate outside its cell; interactive controls remain inside their safe regions.
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
