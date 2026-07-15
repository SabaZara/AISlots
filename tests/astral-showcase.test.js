import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Astral cinematic showcase markup and styles stay fully connected", async () => {
  const [html, app, css] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8")
  ]);
  const requiredIds = [
    "astralShowcaseButton", "cinematicOverlay", "cinematicTitle", "cinematicAward",
    "astralBonusStage", "astralLockedMultipliers", "astralMultiplierDial", "astralFreeSpinLabel",
    "astralRoundAward", "astralTotalMultiplier", "specialBetButton", "buyFeatureButton",
    "featureMarketOverlay", "returnChip", "returnAmount", "returnComparison",
    "astralCaseTrack", "astralCaseMarker", "astralChoiceProgress", "astralChoiceBar"
  ];
  requiredIds.forEach((id) => {
    assert.match(html, new RegExp(`id=["']${id}["']`));
    assert.match(app, new RegExp(`\\$\\(["']${id}["']\\)`));
  });
  assert.match(css, /astral-guardian-cinematic-v1\.png/);
  assert.match(css, /astral-multiplier-gate-v1\.png/);
  assert.match(css, /astral-case-machine-v1\.png/);
  assert.match(css, /\.astral-case-track/);
  assert.match(css, /\.astral-case-marker/);
  assert.match(css, /\.return-chip/);
  assert.match(css, /\.feature-market-overlay/);
  assert.match(css, /@media \(max-width: 560px\)/);
  assert.match(app, /no wager/i);
  assert.match(app, /no credits or feature progress changed/i);
  assert.match(html, /Bonus demo/i);
  assert.match(html, /without spending credits or changing progress/i);
  assert.match(html, /machine-top-actions[\s\S]*?astralShowcaseButton/);
  assert.match(app, /game\.id === "astral" \? ui\.showcaseRow : ui\.spinOptions/);
});

test("generated Astral guardian asset is a project-local PNG", async () => {
  const image = await readFile(new URL("assets/astral-guardian-cinematic-v1.png", root));
  assert.deepEqual(Array.from(image.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.ok(image.length > 500_000);
});

test("generated Astral multiplier gate is a project-local production PNG", async () => {
  const image = await readFile(new URL("assets/astral-multiplier-gate-v1.png", root));
  assert.deepEqual(Array.from(image.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.ok(image.length > 500_000);
});

test("generated Celestial Case Roll assets are project-local production PNGs", async () => {
  const machine = await readFile(new URL("assets/astral-case-machine-v1.png", root));
  const blueCapsule = await readFile(new URL("assets/astral-case-capsule-blue-v1.png", root));
  const legendaryCapsule = await readFile(new URL("assets/astral-case-capsule-legendary-v1.png", root));
  for (const image of [machine, blueCapsule, legendaryCapsule]) {
    assert.deepEqual(Array.from(image.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.ok(image.length > 500_000);
  }
  assert.equal(blueCapsule[25], 6, "the blue reward capsule must retain RGBA transparency");
  assert.equal(legendaryCapsule[25], 6, "the legendary reward capsule must retain RGBA transparency");
});

test("Astral case Stop changes presentation timing but lands on the sealed multiplier", async () => {
  const [app, model, html] = await Promise.all([
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("game-model.js", root), "utf8"),
    readFile(new URL("index.html", root), "utf8")
  ]);
  assert.match(app, /const targetIndex = 45/);
  assert.match(app, /index === targetIndex[\s\S]*?\? multiplier/);
  assert.match(app, /activeRound\.stop\(\)/);
  assert.match(app, /ui\.bonusAction\.textContent = "STOP"/);
  assert.match(model, /Stop controls reveal timing only/);
  assert.match(html, /Horizontal multiplier case roller/);
});

test("transparent Astral symbols and bonus chamber are project-local", async () => {
  const paths = [
    "assets/symbols-astral-transparent-v5.png",
    "assets/astral-bonus-chamber-v1.png"
  ];
  for (const path of paths) {
    const image = await readFile(new URL(path, root));
    assert.deepEqual(Array.from(image.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.ok(image.length > 500_000, `${path} should retain production detail`);
    if (path.includes("transparent")) assert.equal(image[25], 6, `${path} must use RGBA PNG color type 6`);
  }
});

test("every world has a transparent standalone character layer", async () => {
  const paths = [
    "assets/astral-characters-cutout-v1.png",
    "assets/neon-characters-cutout-v1.png",
    "assets/ember-characters-cutout-v1.png",
    "assets/ufc-characters-cutout-v1.png"
  ];
  for (const path of paths) {
    const image = await readFile(new URL(path, root));
    assert.deepEqual(Array.from(image.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(image[25], 6, `${path} must use RGBA PNG color type 6`);
    assert.ok(image.length > 500_000, `${path} should retain production detail`);
  }
});

test("runtime uses character cutouts and contains no payline overlay", async () => {
  const [html, app, model, css, inventory] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("game-model.js", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8"),
    readFile(new URL("GAME_FUNCTIONS.md", root), "utf8")
  ]);
  assert.doesNotMatch(html, /paylineOverlay/);
  assert.doesNotMatch(html, /near-miss-banner|>Almost</i);
  assert.doesNotMatch(html, /realityCheckDialog|lossLimitSelect|Open session reality check/i);
  assert.doesNotMatch(app, /renderPaylineOverlay|One symbol short|reel three breaks|\bAlmost\b/i);
  assert.doesNotMatch(app, /renderRealityCheck|lossLimit|REALITY_CHECK_INTERVAL/i);
  assert.doesNotMatch(html, /sessionNet|sessionTime/);
  assert.doesNotMatch(app, /sessionNet|sessionTime|sessionStartedAt|tickSessionClock/);
  assert.doesNotMatch(css, /astral-cabinet-two-guardians-v1\.png|\.payline-overlay/);
  assert.doesNotMatch(css, /\.reality-check-modal|\.reality-stats|\.loss-limit-control/);
  assert.match(app, /lobby-game-image/);
  assert.match(app, /--game-characters/);
  assert.match(css, /background-image: var\(--game-characters\)/);
  for (const game of ["astral", "neon", "ember", "ufc"]) {
    assert.match(model, new RegExp(`${game}-characters-cutout-v1\\.png`));
  }
  assert.match(inventory, /Production gate/);
});

test("phone rotation and iPad viewport-fit rules remain documented", async () => {
  const [css, readme, inventory, packageJson] = await Promise.all([
    readFile(new URL("styles.css", root), "utf8"),
    readFile(new URL("README.md", root), "utf8"),
    readFile(new URL("GAME_FUNCTIONS.md", root), "utf8"),
    readFile(new URL("package.json", root), "utf8")
  ]);
  assert.match(css, /height: 100dvh/);
  assert.match(css, /env\(safe-area-inset-top\)/);
  assert.match(css, /orientation: landscape/);
  assert.match(css, /grid-template-rows: 56px minmax\(0, 1fr\)/);
  assert.match(css, /2\.18\.1 mobile portrait control collision fix/);
  assert.match(css, /padding: 5px 6px 44px/);
  assert.match(css, /bottom: 38px/);
  assert.match(css, /width: 118px/);
  assert.match(css, /min-width: 561px[\s\S]*?max-width: 820px[\s\S]*?padding: 6px 12px 52px/);
  assert.match(css, /height: calc\(100% - 40px\)/);
  assert.match(readme, /viewport-locked desktop, phone, and iPad gameplay/i);
  assert.match(inventory, /no document scrolling/i);
  assert.match(inventory, /never cover bet, spin, Normal\/Fast, or Autoplay controls/i);
  assert.equal(JSON.parse(packageJson).version, "2.19.0");
});

test("the complete reel board stays visible through five real stop phases", async () => {
  const [app, css] = await Promise.all([
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8")
  ]);
  assert.match(app, /function renderReelStopFrame/);
  assert.match(app, /Math\.floor\(index \/ ROWS\) <= reel \? id : cosmetic\[index\]/);
  assert.match(app, /for \(let reel = 0; reel < COLS; reel \+= 1\)[\s\S]*?renderReelStopFrame/);
  assert.match(app, /revealWinningCells\(winningCells\(outcome\)\)/);
  assert.doesNotMatch(app, /is-board-clearing/);
  assert.match(css, /symbol-cell\.is-reel-settled/);
  assert.doesNotMatch(css, /astralBoardClear/);
});

test("case rolls use fast presentation timing without changing the sealed target", async () => {
  const app = await readFile(new URL("app.js", root), "utf8");
  assert.match(app, /rollSpeed = reducedMotion \? 2600 : 1480 \+ roundIndex \* 90/);
  assert.match(app, /duration = reducedMotion \? 80 : 980/);
  assert.match(app, /reducedMotion \? 180 : 2400/);
  assert.match(app, /finalOffset = -\(targetIndex \* step \+ itemWidth \/ 2\)/);
});

test("hosted audio unlocks from game selection and keeps an explicit preference", async () => {
  const [app, html] = await Promise.all([
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("index.html", root), "utf8")
  ]);
  assert.match(app, /function chooseLobbyGame\(gameId\)[\s\S]*?enableSoundFromGesture\(\)/);
  assert.match(app, /AUDIO_PREFERENCE_STORAGE_KEY/);
  assert.match(app, /audio\.setEnabled\(state\.soundEnabled\)/);
  assert.match(html, /data-audio-state="off"/);
});

test("generated bonus HUDs and unclipped winner state are wired for every world", async () => {
  const [model, app, css] = await Promise.all([
    readFile(new URL("game-model.js", root), "utf8"),
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8")
  ]);
  const paths = [
    "assets/astral-bonusbar-frame-v1.png",
    "assets/neon-bonusbar-frame-v1.png",
    "assets/ember-bonusbar-frame-v1.png",
    "assets/ufc-bonusbar-frame-v1.png"
  ];
  for (const path of paths) {
    assert.match(model, new RegExp(path.replaceAll("/", "\\/").replace(".png", "\\.png")));
    const image = await readFile(new URL(path, root));
    assert.deepEqual(Array.from(image.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(image[25], 6, `${path} must use RGBA PNG color type 6`);
    assert.ok(image.length > 500_000);
  }
  assert.match(app, /--bonus-bar-art/);
  assert.match(app, /classList\.toggle\("has-winners"/);
  assert.match(css, /\.reels\.has-winners/);
  assert.match(css, /winningSymbolBreakout/);
  assert.match(css, /symbol-cell\.is-winner \{[\s\S]*?animation: none !important/);
  assert.match(css, /data-game="astral"\] \.control-deck/);
});

test("all audio profiles provide distinct music identities", async () => {
  const audioEngine = await readFile(new URL("experience-engine.js", root), "utf8");
  assert.match(audioEngine, /playMusicStep\(\)/);
  assert.match(audioEngine, /startMusic\(\)/);
  assert.match(audioEngine, /restartMusic\(\)/);
  assert.match(audioEngine, /wowAstralBackground/);
  assert.match(audioEngine, /wowAstralBigWin/);
  assert.match(audioEngine, /casinoSparkles/);
  assert.match(audioEngine, /frequencyEnd: 11800/);
  for (const percussion of ["moonpulse", "bubble", "forge", "arena"]) {
    assert.match(audioEngine, new RegExp(`percussion: ["']${percussion}["']`));
  }
});

test("licensed WOW Sound Astral layers include source attribution", async () => {
  const paths = [
    "assets/audio/wow-astral-background-modern-edgy.ogg",
    "assets/audio/wow-astral-spin-start.ogg",
    "assets/audio/wow-astral-reel-tick.ogg",
    "assets/audio/wow-astral-victory-sting.ogg",
    "assets/audio/wow-astral-big-win-cinematic.ogg"
  ];
  const [files, licensePdf, licenses, audioEngine, html] = await Promise.all([
    Promise.all(paths.map((path) => readFile(new URL(path, root)))),
    readFile(new URL("assets/audio/wow-sound-starter-pack-license.pdf", root)),
    readFile(new URL("assets/audio/LICENSES.md", root), "utf8"),
    readFile(new URL("experience-engine.js", root), "utf8"),
    readFile(new URL("index.html", root), "utf8")
  ]);
  files.forEach((file) => assert.ok(file.length > 5_000));
  assert.ok(licensePdf.length > 100_000);
  assert.match(licenses, /WOW Sound Starter Pack/);
  assert.match(licenses, /Creative Commons Attribution-NoDerivs 3\.0/);
  assert.match(audioEngine, /ASTRAL_SAMPLE_LIBRARY/);
  assert.match(audioEngine, /wowAstralVictory/);
  assert.match(html, /Astral music and sound effects by[\s\S]*?WOW Sound/);
});

test("explicit remembered Normal and Fast spin choices are wired", async () => {
  const [html, app, css, inventory] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8"),
    readFile(new URL("GAME_FUNCTIONS.md", root), "utf8")
  ]);
  for (const speed of ["normal", "fast"]) assert.match(app, new RegExp(`id: ["']${speed}["']`));
  assert.match(app, /SPIN_SPEED_STORAGE_KEY/);
  assert.match(app, /selectSpinSpeed/);
  assert.match(app, /waitForSpinDelay/);
  assert.match(html, /data-spin-speed="normal"/);
  assert.match(html, /data-spin-speed="fast"/);
  assert.match(css, /data-speed="fast"/);
  assert.doesNotMatch(app, /requestQuickStop/);
  assert.match(inventory, /Normal 1× and Fast 3×/);
});

test("every positive payout receives a visible animated amount", async () => {
  const app = await readFile(new URL("app.js", root), "utf8");
  assert.match(app, /if \(outcome\.baseWin > 0\)/);
  assert.match(app, /await showWinBanner\(outcome\.baseWin/);
  assert.match(app, /outcomeClass === "partial-return"/);
  assert.match(app, /shortName} payout/);
  assert.match(app, /if \(outcome\.bonusWin > 0 && outcome\.totalWin > 0\)/);
});
