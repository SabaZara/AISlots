# AISlots function inventory

Version reviewed: **2.19.0**
Product state: **shareable free-play prototype; not a real-money gambling system**

This is the team-review checklist for the current build. “Implemented” means the function exists in the browser prototype. It does not mean the function has completed gambling-regulator certification.

## Player flow and controls

| Function | Status | Current behavior |
| --- | --- | --- |
| First-entry game lobby | Implemented | Opens before gameplay and presents all four worlds as large image cards. |
| World selection | Implemented | Astral Bloom, Neon Tides, Ember Crown, and UFC Octagon Gold can be selected from the lobby. The top-left game brand returns to the lobby. |
| Free-play age gate | Implemented | The lobby confirms 18+ free-play entry for the browser session. |
| Spin | Implemented | Large central button starts one committed RNG result. Spacebar also starts a spin when no dialog or form control has focus. The button remains locked until the presentation completes. |
| Bet decrease / increase | Implemented | Large `−` and `+` buttons select 1, 2, 5, 10, or 20 CR. Controls lock while a result is resolving. |
| Maximum bet | Implemented | `MAX` selects 20 CR. There is no real-money purchase or deposit path. |
| Spin speed | Implemented | Clearly labeled Normal 1× and Fast 3× choices sit beside the main Spin control. The selection persists between visits and Fast changes reel/presentation timing only; outcome generation and RTP are unchanged. |
| Finite autoplay | Implemented | Player can choose 10, 25, or 50 spins. It can be stopped at any time and stops for insufficient credits or a feature presentation. |
| Astral special bets | Implemented | Standard, +1 guaranteed Bloom, and +2 guaranteed Blooms are selected from a graphic feature panel. The panel explains that the higher price guarantees meter progress; exact cost multipliers are calibrated so each mode retains 99.00% theoretical RTP. |
| Astral buy bonus | Implemented | 25×, 50×, or 100× the selected bet opens three sealed Celestial Case rolls immediately using demo credits only. Each case is stopped separately; purchase prizes remain scaled to 99.00% theoretical RTP and receive a fairness receipt. |
| Sound | Implemented | The first game-selection tap unlocks and starts sound in a browser-compliant user gesture. The top-bar button then remains a persistent explicit mute/unmute preference. |
| Last result | Implemented | Info button shows total returned, collector count, individual base-game payouts, and bonus payout. No paylines are drawn over the reels. |
| Reset demo | Implemented | Resets demo credits, progress, statistics, and receipt state. |

## Shared game math

| Function | Status | Current behavior |
| --- | --- | --- |
| Grid | Implemented | 5 reels × 4 rows, for 20 visible symbols. |
| Base evaluation | Implemented | 20 fixed left-to-right mathematical paylines. Matching starts on reel one and requires at least three adjacent identical symbols. The routes are used for math but are not drawn on screen. |
| Total bet | Implemented | The selected total bet is divided equally across all 20 mathematical paylines. |
| Published RTP | Implemented and tested | Every world has an exact theoretical combined RTP of 99.00%. RTP is a long-run average, never a promise for one spin or session. |
| Weighted symbol mapping | Implemented | Each game uses the same audited mapping structure with game-specific display names and calibrated low-symbol payout. |
| Collection symbol | Implemented | The special collector does not pay as a base symbol. Each occurrence advances that world’s persistent meter. |
| Partial-return presentation | Implemented | A return smaller than the bet stays visibly labeled as credits returned, including the amount and bet comparison, but does not receive a net-win celebration. |
| Outcome classes | Implemented | No return, partial return, break-even, net win, and tiered large-win presentation are separated. |

## World-specific design

| World | Character layer | Reel motion | Meter | Trigger | Bonus presentation |
| --- | --- | --- | --- | ---: | --- |
| Astral Bloom | Moon-garden oracle + crystal-antler sentinel | Celestial cascade | 12-star constellation Moonwell | 12 Blooms | Three or more multiplier cases roll horizontally beneath a center marker. The player presses Stop, the pre-sealed X lands, and every locked multiplier joins the running total. |
| Neon Tides | Pearl-current navigator + deep-sea guardian | Underwater wave | 10-step pearl current | 10 Pearl Keys | Four Pearl Cluster Cascade reveals added into one bonus total. |
| Ember Crown | Forge queen + obsidian furnace warden | Heavy forge slam | 15-rune forge heat | 15 Crown Runes | Two higher-volatility Multiplier Forge strikes added into one bonus total. |
| UFC Octagon Gold | Two original fictional MMA champions | Fast left-to-right strike | 10-step fight card | 10 Fight Tokens | Three Championship Hold & Win cards combined into the final purse. |

All characters are transparent foreground cutouts placed independently over environment-only backgrounds. The UFC prototype does not include real-fighter likenesses, sponsor marks, or an official brand pack.

## Reel and outcome presentation

- Every world has its own generated raster symbol sheet and symbol names.
- Reel start, continuous movement, anticipation, and five true sequential reel stops are animated. The entire 5×4 board remains visible during every stop: each landed column reveals its sealed symbols while all later columns continue moving.
- Reel motion changes by world: cascade, wave, slam, or strike.
- Collector landings receive a different impact treatment from standard symbol landings.
- Winning symbols animate and remain visually readable without a drawn payline.
- Settled winners put the reel board into an overflow-safe breakout state, allowing the symbol art to jump beyond its cell without being clipped on phones.
- Returned credits count upward with synchronized payout notes.
- Nice, Big, Mega, and Epic tiers use different labels, timing, particles, scale, lighting, and full-screen celebration intensity.
- Feature prizes are sealed before any bonus choice or reveal animation begins; selections are presentation only.
- Astral includes a clearly labeled no-wager **Bonus demo** for manually starting and stopping the full Celestial Case Roll sequence. It does not spend credits, award credits, advance the meter, or replace the real triggered bonus.
- Astral places **Bonus demo** in the upper-right game area and gives **Autoplay** its own centered utility dock below the main controls; short landscape layouts keep the Autoplay dock visible as a compact floating control.
- Astral winning tiles remain stationary and transparent while only the isolated symbol artwork jumps. The other three games retain their existing winner treatment.
- Astral removes the near-miss callout and the visible narration row below the reels. Result details remain available from the compact info control and fairness receipt.
- Astral’s graphic **Special bet** and **Buy bonus** controls are isolated to the first game and sit below the character faces. Phone and iPad portrait reserve a dedicated second row inside the control deck so these buttons never cover bet, spin, Normal/Fast, or Autoplay controls. Neon, Ember, and UFC retain their existing cabinets.

## Persistent meters and bonuses

- Progress is stored separately for each world during the session.
- Meter progress survives world switching and ordinary losing spins.
- Every collector symbol advances the active meter one position.
- Multiple collectors in one spin add multiple positions.
- Crossing the threshold can resolve one or more complete bonus rounds, with remainder progress carried forward.
- Each bonus uses its own draw count, prize weights, presentation name, sound sequence, and visual meter.
- Each world uses a transparent generated HUD frame with a live count and one deterministic progress light per required collector.
- Bonus payout equals the sum of the pre-sealed prize multipliers multiplied by the spin’s total bet.
- The Astral Celestial Case Roll presents every sealed multiplier as its own interactive horizontal capsule reel with rarity colors, a bright center marker, deceleration, impact glow, and a persistent total X.
- Players open cases one at a time and press Stop to begin a fast deceleration. The capsule belt now runs at casino pace and locks in about one second after Stop; a 2.4-second fallback keeps autoplay moving. A global case-progress bar shows the current case and total completion; Stop changes reveal timing only—the sealed prize is unchanged by the animation.
- Special-bet progress boosts participate in the same meter rollover logic as natural Blooms. The higher wager is derived from the feature’s exact expected value so all three Astral wager modes remain at 99.00% theoretical RTP.
- Feature purchases draw the same three sealed Astral prize values, scale them for the selected 25×, 50×, or 100× demo-credit cost, and preserve 99.00% theoretical RTP at each tier.

## Audio and effects

- Web Audio engine with separate profiles for Astral, Neon, Ember, and UFC.
- Astral uses a licensed, high-energy WOW Sound cinematic track in looping playback; Neon, Ember, and UFC retain their original synthesized underwater, forge, and arena motifs. Switching worlds restarts the matching soundtrack; disabling sound stops it.
- Per-world spin-start, spin-bed, tick rhythm, reel-stop, anticipation, collection, win, payout-count, bonus-start, bonus-reveal, and celebration cues.
- Stereo movement, dynamics compression, synthesized room/reverb treatment, impact noise, musical win chords, particles, reel flashes, cabinet shake, and screen-level big-win scenes.
- Astral uses locally stored WOW Sound layers for background music, spin launch, reel ticks, regular victories, and a 13-second cinematic big-win cue. Bright casino sparkle runs, high-pass risers, stereo coin-like ticks, and upper-register fanfare chords are synthesized around the unmodified licensed recordings. The background automatically ducks during the big-win cue and returns after the cue or Collect action. Source, credit, and license records are stored in `assets/audio/LICENSES.md`.
- Audio is unlocked and starts from the first game-selection tap so hosted Render builds produce sound without violating browser autoplay rules. A remembered explicit mute remains off until the player turns sound back on.

## Provable fairness

| Function | Status | Current behavior |
| --- | --- | --- |
| Pre-spin commitment | Implemented | Browser shows `SHA-256(serverSeed)` before the spin. |
| Deterministic stream | Implemented | Outcome bytes come from `SHA-256(serverSeed:clientSeed:nonce:counter)`. |
| Client seed | Implemented | Player can replace the client seed before a spin. |
| Seed reveal | Implemented | The secret server seed is revealed in the completed receipt. |
| Receipt verification | Implemented | Verifier replays ordinary spins plus Astral special-bet meter boosts and feature purchases, including all symbols, payouts, meter changes, cost tier, and sealed multiplier prizes. |
| Unbiased mapping | Implemented | Four-byte values use rejection sampling before weighted selection to avoid modulo bias. |
| Server authority | Production gate | The static prototype keeps the pending seed in browser memory. A cash product must move seeds, nonce, balance, and signed receipts to audited server services. |

## Session safety and accessibility

- Clearly marked 18+ free-play prototype with no deposits, real-money purchases, or cash value. Astral feature buys spend demo credits only.
- Visible balance, current bet, last return, per-world wins, spin count, and biggest win. Astral also keeps any positive return visible over the reel frame, even when it is smaller than the bet.
- The compact header shows balance, RTP, and free-play status without session-loss or elapsed-time readouts.
- Reduced-motion media query support.
- Keyboard operation, focus states, ARIA labels, live result status, and dialog close controls.
- Responsive desktop, tablet, and phone layouts, including touch-sized spin, bet, Normal/Fast speed, autoplay, sound, lobby, and verification controls. Narrow phones use a smaller spin button and separate collision-free rows for core and feature actions.
- Desktop, phone, and iPad gameplay is locked to the dynamic viewport with no document scrolling. Portrait keeps the cabinet centered with the generated bonus HUD floating in the character-safe center; short landscape rotation places the HUD above the horizontal reels-and-controls cabinet.
- Phone portrait removes the redundant in-cabinet title while retaining the game name in the top bar, preventing title text from covering character faces.
- Safe-area insets protect controls around notches and home indicators. The lobby fits as a 2×2 portrait chooser or a four-card landscape row without page scrolling.

### Responsive verification matrix

| Device class | Viewport | Orientation | Page scrolling | Cabinet containment |
| --- | ---: | --- | --- | --- |
| Small phone | 320×568 | Portrait | None | Header, meter, reels, bet controls, spin, and autoplay stay inside the viewport. |
| Phone | 360×740 | Portrait | None | Full portrait cabinet and compact responsible-play footer fit. |
| Modern phone | 390×844 | Portrait | None | Full portrait cabinet, floating feature meter, and footer fit. |
| Small phone rotated | 667×375 | Landscape | None | Horizontal meter–reels–controls cabinet fits with feature actions below the shortened reel board. |
| Modern phone rotated | 844×390 | Landscape | None | Horizontal meter–reels–controls cabinet fits with every action fully clickable. |
| iPad | 768×1024 | Portrait | None | Centered full cabinet, meter, controls, and footer fit. |
| iPad rotated | 1024×768 | Landscape | None | Compact landscape cabinet, meter, controls, and footer fit. |
| Desktop | 1440×900 and larger | Landscape | None | Header, cabinet, bonus HUD, controls, Bonus demo row, and footer remain inside the viewport. |

The same rotation checks verify that the four-card lobby stays inside its shell: 2×2 in portrait and one row in landscape.

## Data and persistence

- Age confirmation is stored only in session storage.
- Gameplay balance, progress, statistics, and receipts are browser-memory demo state and reset on refresh.
- No account, cloud save, wallet, payment, analytics, tracking pixel, social feed, or real-player leaderboard is included.

## Explicitly excluded behavior

- No adaptive or player-specific odds.
- No engineered or forced near misses.
- No loss disguised as a win celebration.
- No fabricated winner feed or fake online activity.
- No real-money feature purchase, deposit, or payment path; the Astral bonus-buy prototype uses replenishable demo credits only.
- No re-engagement notifications.
- No deposits, withdrawals, cash prizes, or token purchase.
- No claim that 99% RTP predicts a short session.

## Production gate before real-money release

The visual prototype is deployable as a static free-play site. A real-money version is **not production-ready** until the license holder completes all applicable legal and technical work, including:

1. Jurisdiction and market approval, legal review, and game-rule disclosures.
2. Independent RNG, game-math, RTP, volatility, and source-code certification.
3. Audited server-side outcomes, signed receipts, wallet, double-entry ledger, and idempotent transaction handling.
4. Identity, age, sanctions, geolocation, self-exclusion, affordability, deposit/loss/time limits, and market-specific autoplay controls.
5. Approved UFC brand assets, trademarks, copy, fighter likeness rights, sponsor rules, and licensor sign-off.
6. Security review, privacy compliance, accessibility audit, monitoring, fraud controls, incident response, backups, and disaster recovery.
7. Versioned certified math. Any symbol weight or payout change must trigger recalculation, regression testing, and recertification.

## Main implementation files

| File | Responsibility |
| --- | --- |
| `game-model.js` | Game definitions, symbols, paylines, bonus tables, deterministic spin mapping, and theoretical RTP. |
| `fairness.js` | Random seeds, SHA-256, deterministic counter stream, and rejection sampling. |
| `presentation.js` | Win tiers, outcome classes, per-world statistics, and shared presentation helpers. |
| `experience-engine.js` | Per-world audio profiles and layered Web Audio effects. |
| `app.js` | State, controls, spin lifecycle, autoplay, meters, receipts, dialogs, and presentations. |
| `styles.css` | Responsive cabinets, character layers, world meters, symbols, reel motion, and celebrations. |
| `tests/` | Math, exact RTP, presentation, audio profile, visual-asset wiring, and fairness regression tests. |
| `render.yaml` | Render Static Site Blueprint. |
