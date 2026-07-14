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
    "astralBalloon", "astralBalloonBurst", "astralChoiceProgress", "astralChoiceBar"
  ];
  requiredIds.forEach((id) => {
    assert.match(html, new RegExp(`id=["']${id}["']`));
    assert.match(app, new RegExp(`\\$\\(["']${id}["']\\)`));
  });
  assert.match(css, /astral-guardian-cinematic-v1\.png/);
  assert.match(css, /astral-multiplier-gate-v1\.png/);
  assert.match(css, /astral-balloon-ascent-bg-v1\.png/);
  assert.match(css, /\.astral-balloon-flight/);
  assert.match(css, /\.astral-balloon-burst/);
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

test("generated Moon Balloon assets are project-local production PNGs", async () => {
  const background = await readFile(new URL("assets/astral-balloon-ascent-bg-v1.png", root));
  const balloon = await readFile(new URL("assets/astral-balloon-sprite-v1.png", root));
  for (const image of [background, balloon]) {
    assert.deepEqual(Array.from(image.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.ok(image.length > 500_000);
  }
  assert.equal(balloon[25], 6, "the animated balloon must retain RGBA transparency");
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
  assert.match(readme, /viewport-locked desktop, phone, and iPad gameplay/i);
  assert.match(inventory, /no document scrolling/i);
  assert.equal(JSON.parse(packageJson).version, "2.16.1");
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

test("three remembered spin speeds and manual quick-stop are wired", async () => {
  const [html, app, css, inventory] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8"),
    readFile(new URL("GAME_FUNCTIONS.md", root), "utf8")
  ]);
  for (const speed of ["normal", "turbo", "quick"]) assert.match(app, new RegExp(`id: ["']${speed}["']`));
  assert.match(app, /SPIN_SPEED_STORAGE_KEY/);
  assert.match(app, /requestQuickStop/);
  assert.match(app, /waitForSpinDelay/);
  assert.match(html, /id="speedLabel">1×/);
  assert.match(css, /data-speed="quick"/);
  assert.match(css, /can-quick-stop/);
  assert.match(inventory, /Normal 1×, Turbo 2×, and Quick 4×/);
});
