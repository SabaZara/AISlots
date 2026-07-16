import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("World Forge markup, controls, and one-companion presentation stay connected", async () => {
  const [html, app, css] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8")
  ]);

  for (const id of [
    "astralShowcaseButton", "cinematicOverlay", "astralBonusStage", "astralFlightWorld",
    "astralFlightPlane", "astralDistanceValue", "astralDistanceBar", "astralAltitudeValue",
    "astralAltitudeBar", "astralMultiplierLadder", "bonusExit",
    "specialBetButton", "buyFeatureButton", "featureMarketOverlay", "autoplayOverlay",
    "reels", "spinButton", "fairnessButton", "companionStage", "companionPortrait"
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
    assert.match(app, new RegExp(`\\$\\(["']${id}["']\\)`));
  }

  assert.match(app, /function buildLobby\(\)/);
  assert.match(app, /factory-group-/);
  assert.match(app, /data-randomize-world/);
  assert.match(app, /factory-choice-intro/);
  assert.match(app, /Choose every layer/);
  assert.doesNotMatch(app, /data-world-prompt-form|function applyVisualPrompt|Describe your world/);
  assert.match(app, /resolveVisualConfig/);
  assert.match(app, /--game-characters/);
  assert.match(app, /--symbol-sheet/);
  assert.match(app, /dataset\.motion/);
  assert.match(app, /ui\.companionPortrait\.src = visuals\.companion\.asset/);
  assert.match(css, /\.companion-stage img/);
  assert.match(css, /transparentCompanionBreath/);
  assert.match(css, /\.factory-builder/);
  assert.match(css, /\.factory-preview-companion/);
  assert.match(css, /\.is-lobby-open #appShell \{ visibility: hidden/);
  assert.match(html, /4,320 combinations/);
});

test("runtime contains no payline, near-miss, or reality-check UI", async () => {
  const [html, app, css] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8")
  ]);
  assert.doesNotMatch(html, /paylineOverlay|near-miss-banner|>Almost</i);
  assert.doesNotMatch(html, /realityCheckDialog|lossLimitSelect|sessionNet|sessionTime/i);
  assert.doesNotMatch(app, /renderPaylineOverlay|One symbol short|\bAlmost\b|renderRealityCheck|lossLimit|REALITY_CHECK_INTERVAL/i);
  assert.doesNotMatch(css, /\.payline-overlay|\.reality-check-modal|\.reality-stats/);
});

test("the complete 6×5 reel board stays visible through six real stop phases", async () => {
  const [app, css] = await Promise.all([
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8")
  ]);
  assert.match(app, /function renderReelStopFrame/);
  assert.match(app, /Math\.floor\(index \/ ROWS\) <= reel \? id : cosmetic\[index\]/);
  assert.match(app, /for \(let reel = 0; reel < COLS; reel \+= 1\)[\s\S]*?renderReelStopFrame/);
  assert.match(app, /revealWinningCells\(winningCells\(outcome\)\)/);
  assert.match(css, /symbol-cell\.is-reel-settled/);
  assert.match(css, /grid-template-columns: repeat\(6/);
  assert.match(css, /grid-template-rows: repeat\(5/);
  assert.match(css, /naturalReelRoll/);
});

test("Sky Runner Land continuously follows the sealed flight result", async () => {
  const [app, model, html, css] = await Promise.all([
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("game-model.js", root), "utf8"),
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8")
  ]);
  assert.match(app, /function astralFlightProfile\(multiplier\)/);
  assert.match(app, /function animateAstralFlightLanding/);
  assert.match(app, /const progress = fromProgress \+ \(toProgress - fromProgress\) \* eased/);
  assert.match(app, /setAstralFlightPosition\(progress\)/);
  assert.match(app, /activeRound = beginAstralFlight/);
  assert.match(app, /ui\.bonusAction\.textContent = "LAND NOW"/);
  assert.match(app, /ui\.bonusOverlay\.dataset\.mode = "astral-aviator"/);
  assert.match(app, /ui\.cinematicOverlay\.dataset\.mode = "world-awakening"/);
  assert.match(app, /function updateAstralFlightHud/);
  assert.match(app, /10_000|10000/);
  assert.match(app, /ui\.bonusAction\.textContent = preview \? "Play again"/);
  assert.match(model, /Land controls reveal timing only/);
  assert.match(html, /Themed aviation multiplier flight/);
  assert.match(html, /sky-runner-plane-cutout-v1\.png/);
  assert.match(css, /var\(--bonus-bg\) center \/ cover no-repeat/);
  assert.match(css, /\.astral-flight-plane img[\s\S]*?object-fit: contain/);
  assert.match(css, /\.astral-flight-telemetry/);
  assert.match(css, /\.astral-multiplier-ladder/);
  assert.doesNotMatch(css, /flightLandedFlash/);
  assert.doesNotMatch(app, /jumpText\(ui\.astralRoundAward\)/);
});

test("normal wins stay contained while only collector art breaks out", async () => {
  const [app, css] = await Promise.all([
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8")
  ]);
  assert.match(app, /function revealSpecialCollectors\(collectorCount\)/);
  assert.match(app, /revealSpecialCollectors\(outcome\.collectorCount\)/);
  assert.match(css, /\.reels\.has-winners,[\s\S]*?overflow: hidden/);
  assert.match(css, /containedWinnerPulse/);
  assert.match(css, /\.symbol-cell\.is-special-hit \.generated-symbol/);
  assert.match(css, /collectorBreakout/);
  assert.match(css, /width: min\(88cqw, 88cqh\)/);
});

test("autoplay, Normal/Fast spin, and every positive payout remain visible", async () => {
  const [html, app, css] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8")
  ]);
  assert.match(html, /id="autoplayOverlay"[\s\S]*?id="autoplayMenu"[\s\S]*?aria-modal="true"/);
  assert.match(app, /function setAutoplayMenuOpen/);
  assert.match(css, /\.autoplay-overlay \{[\s\S]*?position: fixed;[\s\S]*?inset: 0/);
  for (const speed of ["normal", "fast"]) assert.match(app, new RegExp(`id: ["']${speed}["']`));
  assert.match(app, /SPIN_SPEED_STORAGE_KEY/);
  assert.match(app, /selectSpinSpeed/);
  assert.doesNotMatch(app, /requestQuickStop/);
  assert.match(app, /if \(outcome\.baseWin > 0\)/);
  assert.match(app, /await showWinBanner\(outcome\.baseWin/);
  assert.match(app, /outcomeClass === "partial-return"/);
});

test("viewport lock and safe-area layouts cover desktop, phone, rotation, and iPad", async () => {
  const [css, readme, inventory, packageJson] = await Promise.all([
    readFile(new URL("styles.css", root), "utf8"),
    readFile(new URL("README.md", root), "utf8"),
    readFile(new URL("GAME_FUNCTIONS.md", root), "utf8"),
    readFile(new URL("package.json", root), "utf8")
  ]);
  assert.match(css, /height: 100dvh/);
  assert.match(css, /env\(safe-area-inset-top\)/);
  assert.match(css, /orientation: landscape/);
  assert.match(css, /max-width: 560px/);
  assert.match(css, /min-width: 561px[\s\S]*?max-width: 820px/);
  assert.match(readme, /desktop, phone, or iPad/i);
  assert.match(inventory, /no document scrolling/i);
  assert.equal(JSON.parse(packageJson).version, "3.4.0");
});

test("four mood profiles provide distinct music identities and licensed files stay local", async () => {
  const [engine, licenses] = await Promise.all([
    readFile(new URL("experience-engine.js", root), "utf8"),
    readFile(new URL("assets/audio/LICENSES.md", root), "utf8")
  ]);
  assert.match(engine, /playMusicStep\(\)/);
  assert.match(engine, /startMusic\(\)/);
  assert.match(engine, /restartMusic\(\)/);
  for (const percussion of ["moonpulse", "bubble", "forge", "arena"]) {
    assert.match(engine, new RegExp(`percussion: ["']${percussion}["']`));
  }
  for (const path of [
    "assets/audio/wow-astral-background-modern-edgy.ogg",
    "assets/audio/wow-astral-spin-start.ogg",
    "assets/audio/wow-astral-reel-tick.ogg",
    "assets/audio/wow-astral-victory-sting.ogg",
    "assets/audio/wow-astral-big-win-cinematic.ogg"
  ]) {
    const file = await readFile(new URL(path, root));
    assert.ok(file.length > 5_000);
  }
  assert.match(licenses, /WOW Sound Starter Pack/);
});
