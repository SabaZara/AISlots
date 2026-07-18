# AISlots Audio Guide

Complete reference for the game's sound system: what every piece of music and sound is, where it is used, and how to tune it.

The engine is **hybrid**: by default every sound is synthesized live by the Web Audio engine in [`experience-engine.js`](./experience-engine.js) (oscillators, filtered noise, envelopes, convolution reverb) — zero download weight, infinite variation, always in the atmosphere's key. On top of that, the **licensed sample slot system (section 9)** lets you drop produced audio files into `assets/audio/` for the essential sounds; any filled slot automatically replaces its synthesized version, and the synth remains the fallback for everything else.

---

## 1. Architecture

```
tone / noise / bell / pluck / thump / subImpact / riser / sparkleBurst   (voice builders)
        │
        ▼
┌───────────────── independent buses ─────────────────┐
│ music · ambience · spin · sfx · ui · voice          │──► master ──► compressor ──► speakers
└─────────────────────────────────────────────────────┘
        │ per-voice sends
        ▼
hall reverb (2.6 s) · room reverb (0.7 s) · feedback echo (0.29 s)
```

| Bus | Default gain | Carries |
|---|---|---|
| `music` | 0.72 | adaptive music (all layers) |
| `ambience` | 0.50 | world environment beds + events |
| `spin` | 0.86 | spin loop, reel ticks, launch sounds |
| `sfx` | 1.00 | rewards, reel stops, bonus, jackpot |
| `ui` | 0.66 | interface feedback |
| `voice` | 0.90 | character vocalizations |

Mixing rules baked in: reel stops are deliberately quiet and bright so **reward sounds always sit on top**; big wins duck the music bus; character voices briefly dip the sfx bus.

---

## 2. Atmospheres (the four soundtracks)

Selected in the World Forge "Atmosphere" step (`mood` in `visualConfig`). Swapping atmosphere swaps the entire soundscape: music, spin voices, reel stops, reward tones, UI feedback.

| Atmosphere | Feel | Key / scale | BPM | Signature timbres |
|---|---|---|---|---|
| **Epic** | Viking war march | D minor (hexatonic) | 96 | galloping war drums, shield stomps, chant drones in open fifths, horn-call leads |
| **Arcane** | ancient magical realm | A lydian | 100 | struck bells, long hall shimmer, heartbeat kick |
| **Playful** | joyful, impossible to stop | C major pentatonic | 128 | marimba plucks, square leads, four-on-floor toy kit |
| **Shadow** | dangerous ancient power | E phrygian (hexatonic) | 94 | low saw drones, deep sub kicks, metallic echoes |

Profiles live in `AUDIO_PROFILES` at the top of `experience-engine.js`. Each defines: `root`, `scale`, spin-loop voices (`spin.*`), reel-stop character (`stop.*`), UI base note (`ui.*`), and the full music arrangement (`music.*`).

---

## 3. Adaptive music system

**Where used:** starts when the player enters the game (`startMusic()`), runs continuously, crossfades on atmosphere change (`gameChange()`).

The music is a generative arrangement driven by a look-ahead scheduler (`scheduleMusic` → `playMusicStep`, 16 steps per bar).

### Song structure (why it never feels like a loop)
- **8-bar phrases**: bars 1–4 = section **A** (groove, `music.chords`), bars 5–8 = section **B** (lifted chorus, `music.chordsB` — different progression, melody an octave up, brighter pads, syncopated stabs, denser bass, arps always on).
- **Drum fills** on the last beat of bars 4 and 8 (rising toms + sweep) launch the next section.
- **Section downbeats** land with a crash splash + low boom.
- **Call & response melodies**: `music.lead` (bars 1–2) answers with `music.leadB` (bars 3–4).
- **Swing** on every off-16th (`music.swing`: Playful 0.16 → Shadow 0.04).

### Layers vs. energy
An `energy` value (0–1) gates layers. Events raise it (spin +0.65, wins, bonus = 1); idle decays toward a floor of **0.45** (0.85 in bonus mode) — so the track always keeps its pulse and only sheds top layers when idle.

| Layer | Plays when |
|---|---|
| bass + sub-octave double | always |
| pads (chord swells) | always (extra mid-bar swell when energy > 0.5) |
| percussion (atmosphere kit) | energy > 0.08 (i.e. effectively always) |
| lead melody (detuned ×2) | energy > 0.12, per-note `leadChance` |
| chord stabs | energy > 0.3 |
| arp topper | B section always; A section when energy > 0.5 |

### Percussion kits (`music.perc`)
- `warDrum` (Epic) — Viking kit: galloping 3-3-2 tom pattern (row-stroke rhythm), shield-stomp cracks on the backbeats, low chant barks on phrase accents, extra oar-stroke doubles when excited — deliberately no bright hats
- `bellTick` (Arcane) — heartbeat kick + high bell accents
- `toyPop` (Playful) — four-on-floor pop kick, offbeat hats, excited shaker
- `darkMetal` (Shadow) — relentless deep kicks, clanging metallic backbeats

### Bonus mode
`bonusSceneStart()` / `bonusSceneEnd()` (called when the bonus overlay opens/closes) raise the energy floor, lift tempo +6 %, add a 9th to pad voicings, and push the lead up an octave.

---

## 4. Gameplay events — what fires when

| Engine method | Fired from (app.js) | Moment | Sound |
|---|---|---|---|
| `gameIntro()` | `chooseLobbyGame()` | entering your world from the forge | signature chord bloom + sparkles + sub; 60 % chance of companion welcome |
| `spinStart({fast})` | `spin()` | spin button pressed | clunk-engage + thump + rising zip + sub impact; starts the spin loop. Fast mode = shorter, snappier, quicker clacker |
| spin loop (`startSpinLoop`) | (internal) | while reels roll | detuned motor hum + overtone through resonant filter, mechanical tick-train (tk-tk-tk), sub bed; motor pitch rises with momentum |
| `spinTick(tick)` | shuffle timer | every reel tick | hard micro-clacks + pitched scale blips, randomized pan/pitch/accent |
| `reelStop(i, isFinal)` | `settleOutcome()` | each reel lands | one of 4 mechanism recipes (wood/metal/clunk/latch) + in-key resonance ring + tiny sparkle; loop winds down stepwise; reel 5 adds a tension riser; final reel adds sub impact + resolving chime |
| `scatterLand(count)` | `settleOutcome()` | a scatter lands on a stopped reel | escalating sting per scatter this spin: 1 = dramatic hit, 2 = +higher chord & riser, 3+ = detonation (sub impact + short music duck) |
| `anticipation()` | `spin()` | bonus-triggering spin, before reels settle | heartbeat sub pulses + long riser + climbing scale notes + sparkles |
| `lineWin(i, ratio)` | `sequenceLineWinSounds()` | each winning line reveals | two-note harmonic pluck/bell/tone (atmosphere-dependent), pitch lifts with amount |
| `payoutTick(p, tier)` | `animateCreditValue()` | win counter counting up | rising scale tick, brightens with progress |
| `winCountEnd(ratio)` | `showWinBanner()` | win counter finishes | below bet = soft resolve · profit = bright resolve · 10×+ = triumphant close with sub |
| `winVoice()` | `showWinBanner()` | net-win banner appears | short fanfare + sparkles (rate-limited, 1 per 2.8 s) |
| `winTier(tier)` / `bigWin(tier)` | `showCelebration()` | big / mega / epic celebration | impact + riser + rising fanfare runs + coin rain + sustained chord tail (5 s feel) |
| `jackpotSequence()` | via `winTier("epic")` | epic-tier win | 4-second staged progression: breath of silence → impact → riser → 3 rising chord stacks → detuned choir pad → sparkle rain + cascading coins |
| `collect(count, progress)` | after spin resolves | collector symbols counted into meter | escalating update-sweep: pitch/urgency scale with meter fill; near threshold adds sub pulse + shimmer |
| `bonusStart()` | cinematic transition | bonus entry | silence → energy gathering riser → magic swell → deep impact → sparkle bloom |
| `bonusReveal(i, mult)` | flight landing / card flip | each bonus multiplier reveals | escalating ladder (like a 10-step multi ladder): louder, longer, thicker per step; 5×+ adds sub impact |
| `coinRain(strength)` | inside win tiers/jackpot | celebrations | cluster of small metallic pings across the stereo field |
| `nearMiss()` | (available) | near-miss moment | gentle falling triad |
| `gameChange()` | `switchGame()` | world/config change | music crossfade + confirm flourish |
| `interfaceOn()` | sound toggled on | — | three-note welcome bloom |

---

## 5. World ambience (per world, always quiet)

**Where used:** starts with the music (`startAmbience()`), keyed by the selected **World**. Runs on the `ambience` bus far below gameplay sounds.

| World | Bed | Random events |
|---|---|---|
| Fire | ember noise + low drone | crackles, rare rumble swells |
| Ice | swaying cold wind | ice cracks + glassy pings |
| Nature | leaf rustle | bird chirps (2–4 note warbles) |
| Void | deep beating drone + cosmic hiss | slow descending sweeps |
| Coral Reef | sunlit water flow + high sparkle | rising bubbles, water chimes |
| Golden Temple | warm sacred drone + faint foliage | distant gongs, jungle birds |
| Eclipse | beating solar hum + corona shimmer | slow flare sweeps, deep pulses |

Defined in `WORLD_AMBIENCES` + `buildAmbienceBed()` + `playAmbienceEvent()`.

---

## 6. Character vocalizations

**Where used:** `characterMoment(kind)` — layered into reward audio, never interrupting it. Rare on purpose: bigWin 7 %, bonus 9 %, jackpot 45 %, welcome 60 % (on game intro), with an 18 s cooldown. SFX bus dips ~30 % while a voice plays.

| Companion | Signature |
|---|---|
| Valkyrie | rising battle-cry fifths + wing flutter |
| Dragon | deep growling roar + fire-breath wash |
| Direwolf | full howl (glide up, hold, fall) |
| Kraken | deep beating ocean call + splash |
| Titan | two stone footsteps + earth rumble |
| Tiger | roar burst + fast slash |
| Gorilla | five chest beats + low grunt |
| Arcane Sorceress | rising bell arp + whisper + magic pulse |

---

## 7. UI sounds

All drawn from the active atmosphere's scale (`profile.ui.base`), so the interface always harmonizes with the music.

| Method | Used for |
|---|---|
| `uiHover()` | any button hover (throttled, very quiet) |
| `uiSelect(i)` | picking a forge option (pitch varies by position) |
| `uiConfirm()` | Next, max bet, boost select |
| `uiBack()` | back, close market, close dialogs |
| `uiOpen()` | opening market / rules / fairness / win details |
| `uiToggle(on)` | speed toggle |
| `uiDeny()` | insufficient balance |
| `uiSurprise()` | "Surprise me" flourish |

---

## 8. Reference library (not used by the app)

`tmp/hacksaw-reference/` holds **1,108 mp4 sounds from 12 production Hacksaw Gaming slots**, downloaded for design study only. They are **copyrighted, gitignored, and must never ship** in the product. The app plays none of them.

They shaped our synth designs:

| Reference family | Our equivalent |
|---|---|
| `music_level_0..3`, `music_bonus_level_*` | adaptive layered music + bonus mode |
| `mechanism_stop_1..5` | `reelStop()` mechanism variants |
| `roulette_wheel_spin` / `_turbo` | spin loop + fast-mode variant |
| `bonus_landed_1..4` | `scatterLand()` escalation |
| `multi_1..10` | `bonusReveal()` ladder |
| `wintier_1..4` | `winTier()` long fanfares |
| `win_end_bet_low/over` | `winCountEnd()` |
| `update_sweep_1..6` | `collect()` progress sweeps |
| `coin_spam_1..4` | `coinRain()` |
| `intro` + welcome vox | `gameIntro()` + welcome `characterMoment` |
| `ambience_1` | world ambience beds |

Measured reference targets we mix to: reel stops ≈ −32 dB RMS (quiet, ~3.8 kHz bright), spin bed ≈ −26 dB (~6 kHz ticking), rewards loudest ≈ −13…−19 dB, win stings 5–6 s long.

---

## 9. Licensed sample slots (how to ship real audio files)

The essential sounds are exposed as **slots**. Put licensed files (webm/mp3/ogg) in `assets/audio/` and list them in `assets/audio/manifest.json`; the engine loads them when sound is enabled. Filled slot → the produced file plays (through the correct bus, with pitch variation on one-shots). Empty slot → the synth plays. No code changes needed.

The audio engine and every manifest/sample request are cache-busted. After an audio change is committed and pushed to `main`, a newly opened or refreshed game requests the current engine, manifest, and sound files from Render—even when a replacement keeps the same filename. An already-open game keeps its decoded audio until the page is refreshed.

> Only use audio you own or have licensed for distribution (purchased packs, commissioned work, CC0). The Hacksaw reference files in `tmp/hacksaw-reference/` are **not** licensed and must never be placed in `assets/audio/`.

### manifest.json format

```json
{
  "music_base": "main-theme.webm",
  "music_base_shadow": "dark-theme.webm",
  "music_bonus": "bonus-theme.webm",
  "spin_loop": "reel-roll.webm",
  "spin_start": ["spin-launch-1.webm", "spin-launch-2.webm"],
  "reel_stop": ["stop-1.webm", "stop-2.webm", "stop-3.webm"],
  "scatter_land": ["scatter-1.webm", "scatter-2.webm", "scatter-3.webm"],
  "wintier_big": "big-win.webm",
  "ambience_fire": "embers-loop.webm"
}
```

- A **string** = one file; an **array** = variants (picked at random — or used as an **escalation ladder** for `scatter_land`, `bonus_reveal`, `win_count_end`).
- Suffix a slot with an **atmosphere id** (`music_base_shadow`) or a **world id** (`ambience_fire`) for context-specific overrides; the generic entry is the fallback.
- `spin_loop_fast` / `spin_start_fast` are optional turbo variants for fast mode (otherwise the normal loop plays 15 % faster).

### The slots

| Slot | Replaces | Loop | Bus | Notes |
|---|---|---|---|---|
| `music_base` | adaptive generative music | ✓ | music | per-atmosphere via `music_base_<atmosphere>` |
| `music_bonus` | bonus-mode music | ✓ | music | swapped in/out when the bonus opens/closes |
| `ambience` | world ambience bed + events | ✓ | ambience | per-world via `ambience_<world>` |
| `spin_loop` | motor + tick-train loop | ✓ | spin | gain steps down as each reel lands |
| `spin_start` | spin launch | | spin | `spin_start_fast` optional |
| `reel_stop` | mechanism stop recipes | | sfx | give 3–5 variants; final reel plays 25 % louder |
| `scatter_land` | scatter-landing escalation | | sfx | array = steps 1..n; trigger still ducks music |
| `anticipation` | final-reel tension riser | | sfx | |
| `line_win` | line win reveals | | sfx | variants recommended |
| `win_count_end` | count-up closing sting | | sfx | array of 3 = below-bet / profit / 10×+ |
| `wintier_big` / `_mega` / `_epic` | win fanfares & jackpot sequence | | sfx | music ducks for the sting's duration |
| `bonus_trigger` | bonus entry sequence | | sfx | character reaction still rolls |
| `bonus_reveal` | multiplier ladder | | sfx | array = ladder steps 1..n |
| `coin_rain` | celebration coin rain | | sfx | volume scales with celebration strength |
| `ui_click` | select/confirm clicks | | ui | confirm plays slightly pitched up |

What stays synthesized even with samples: UI hover/back/open tones, character vocalizations, sparkle accents, payout count ticks, the game intro, and the penultimate-reel tension riser — these carry the atmosphere identity and always retune to the selected key.

Defined in `SAMPLE_SLOTS` / `loadSampleLibrary()` / `playSlot()` in `experience-engine.js`.

---

## 10. Tuning cheat-sheet

| Want to change… | Edit |
|---|---|
| overall loudness | `master.gain` (0.68) in `ensure()` |
| one family's loudness | bus gains in `ensure()` |
| a soundtrack's tempo/key/melody | that profile's `music` block in `AUDIO_PROFILES` |
| how fast music calms down | energy floor + decay in `scheduleMusic()` |
| spin loop character | that profile's `spin` block + `startSpinLoop()` |
| reel stop feel | `stop` block + mechanism recipes in `reelStop()` |
| how rare character voices are | probability table in `characterMoment()` |
| ambience volume | `ambience` bus gain or per-bed `level` values |
