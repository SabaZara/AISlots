import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("World Forge markup, controls, and one-companion presentation stay connected", async () => {
  const [html, app, css, packageJson] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8"),
    readFile(new URL("package.json", root), "utf8")
  ]);
  const version = JSON.parse(packageJson).version;
  const versionPattern = version.replaceAll(".", "\\.");

  for (const id of [
    "cinematicOverlay", "astralBonusStage", "astralFlightWorld",
    "astralFlightPlane", "astralDistanceValue", "astralDistanceBar", "astralAltitudeValue",
    "astralAltitudeBar", "astralMultiplierLadder", "bonusExit",
    "specialBetButton", "buyFeatureButton", "featureMarketOverlay",
    "reels", "spinButton", "spinCenter", "speedToggleButton", "speedToggleValue", "fairnessButton", "companionStage", "companionPortrait",
    "scatterMeterArt", "featureVisual"
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
    assert.match(app, new RegExp(`\\$\\(["']${id}["']\\)`));
  }

  assert.match(app, /function buildLobby\(\)/);
  assert.match(app, /factory-group-/);
  assert.match(app, /data-randomize-world/);
  assert.match(app, /data-factory-next/);
  assert.match(app, /state\.lobbyChoices\[step\.key\]/);
  assert.doesNotMatch(app, /choiceStep \+ 1/);
  assert.match(app, /factory-choice-intro/);
  assert.match(app, /FACTORY_STEPS/);
  assert.match(app, /function updateLobbyStep\(\)/);
  assert.match(app, /data-factory-step/);
  assert.match(app, /factory-option-art/);
  assert.match(app, /factory-symbol-showcase/);
  assert.match(app, /factory-preview-mood-badge/);
  assert.match(app, /Start →/);
  assert.doesNotMatch(app, /factoryReview|data-build-play|is-reviewing|Review →/);
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
  assert.match(css, /\.factory-step-track/);
  assert.match(css, /--feature-world-art/);
  assert.match(css, /--market-bonus-art/);
  assert.match(css, /--topbar-art/);
  assert.match(css, /\.is-lobby-open #appShell \{ visibility: hidden/);
  assert.match(css, /\.lobby-shell \{[\s\S]*?width: 100vw;[\s\S]*?height: 100dvh/);
  assert.match(html, /1,344 combinations/);
  assert.match(html, new RegExp(`app\\.js\\?v=${versionPattern}`));
  assert.match(html, new RegExp(`styles\\.css\\?v=${versionPattern}`));
  assert.match(app, new RegExp(`asset-catalog\\.js\\?v=${versionPattern}`));
  assert.match(app, /factoryPreviewCompanion"\)\.hidden = true/);
  assert.match(app, /factoryPreviewCompanion"\)\.hidden = false/);
  assert.match(css, /\.factory-preview-companion:not\(\[src\]\) \{ display: none !important; \}/);
  assert.doesNotMatch(app, /group\("Motion", "animation"/);
  assert.doesNotMatch(html, /astralShowcaseButton|Bonus demo/i);
  assert.doesNotMatch(app, /astralShowcaseButton|runAstralShowcasePreview/);
  assert.doesNotMatch(html, /Free play|Free-play|no cash value|No deposits/i);
  assert.doesNotMatch(html, /id="gameTitle"|class="machine-title"/);
  assert.doesNotMatch(html, /id="reelCommitment"|FIRE · RTP 99\.00%/i);
  assert.match(css, /moltenWinnerPulse/);
  assert.match(css, /reels\.has-winners \.symbol-cell:not\(\.is-winner\)/);
  assert.match(css, /factory-step-track \{ grid-template-columns: repeat\(4/);
  assert.match(css, /\.factory-symbol-showcase b[\s\S]*?background-size: 400% 200%/);
  assert.match(app, /Array\.from\(\{ length: 6 \}[\s\S]*?symbol-sheet-\$\{index\}[\s\S]*?factory-scatter-choice/);
  assert.match(app, /if \(id === "petal" && game\.scatterAsset\)/);
  assert.doesNotMatch(app, /game\.scatterAsset && !game\.symbolSheet/);
  assert.match(css, /\.factory-symbol-showcase \.factory-scatter-choice[\s\S]*?var\(--scatter-choice-art\)/);
  assert.doesNotMatch(app, /factoryPreviewName|factoryPreviewMeta|brandName"\)\.textContent/);
  assert.doesNotMatch(html, /brandSubtitle|Create your slot world|Exact 99\.00% RTP|Returned/i);
  assert.match(app, /--celebration-bg/);
  assert.match(css, /var\(--celebration-bg\) center \/ cover no-repeat/);
  assert.doesNotMatch(html, /return-chip|class="win-panel"|celebration-bottom-win|game-performance/);
  assert.doesNotMatch(app, /showReturnChip|hideReturnChip|celebrationBottomAmount|ui\.lastWin\b|ui\.lastMultiplier\b/);
  assert.match(css, /\.factory-preview-mood-badge/);
  assert.match(css, /\.lobby-overlay\.is-awaiting-theme[\s\S]*?background-image: none/);
  assert.doesNotMatch(app + css, /factory-preview-sparkles|worldSparkle/);
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
  assert.match(app, /\.symbol-cell\[data-col="\$\{reel\}"\]/);
  assert.match(app, /for \(let reel = 0; reel < COLS; reel \+= 1\)[\s\S]*?renderReelStopFrame/);
  assert.match(app, /revealWinningCells\(winningCells\(outcome\)\)/);
  assert.match(css, /symbol-cell\.is-reel-settled/);
  assert.match(css, /grid-template-columns: repeat\(6/);
  assert.match(css, /grid-template-rows: repeat\(5/);
  assert.match(css, /continuous reel bed/);
  assert.match(css, /\.symbol-cell\[data-col="5"\] \{ border-right: 0/);
  assert.match(app, /function startSpinReelLayer/);
  assert.match(app, /stopSpinReelColumn\(reel\)/);
  assert.match(app, /strip\.style\.transform = `translate3d\(0, \$\{startY\}px, 0\)`/);
  assert.match(app, /velocityMatch = 0\.30 \/ 0\.18/);
  assert.match(app, /orderedLandingGap = speed\.id === "fast" \? 130 : 225/);
  assert.match(app, /column\?\.classList\.add\("is-landed"\)/);
  assert.doesNotMatch(app, /column\?\.remove\(\)/);
  assert.match(app, /requestAnimationFrame\(resolve\)/);
  assert.match(app, /easing: "cubic-bezier\(\.18,\.30,\.38,1\)"/);
  assert.match(css, /@keyframes continuousReelStrip[\s\S]*?translate3d/);
  assert.doesNotMatch(app, /endY \+ overshoot|reelStripLand/);
  assert.match(css, /@keyframes continuousReelStrip/);
  assert.match(css, /reel-spin-column\.is-decelerating/);
  assert.match(css, /reel-spin-column\.is-landed[\s\S]*?visibility: hidden/);
  assert.match(css, /real reel strips replace independent tile\/block shuffling/);
  assert.match(css, /the stopped result is stationary/);
  assert.match(css, /reel-viewport\.is-stopping[\s\S]*?animation: none !important/);
});

test("Sky Runner Land continuously follows the sealed flight result", async () => {
  const [app, model, html, css] = await Promise.all([
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("game-model.js", root), "utf8"),
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8")
  ]);
  assert.match(app, /function astralFlightProfile\(multiplier\)/);
  assert.match(app, /multiplier >= 10\) return \{ progress: \.96 \}/);
  assert.match(app, /multiplier >= 5\) return \{ progress: \.84 \}/);
  assert.match(app, /multiplier >= 2\) return \{ progress: \.68 \}/);
  assert.match(app, /multiplier >= 1\) return \{ progress: \.53 \}/);
  assert.match(app, /multiplier >= \.5\) return \{ progress: \.38 \}/);
  assert.match(app, /return \{ progress: \.22 \}/);
  assert.match(app, /function animateAstralFlightLanding/);
  assert.match(app, /const progress = fromProgress \+ \(toProgress - fromProgress\) \* time/);
  assert.match(app, /remainingDistance \/ ASTRAL_FLIGHT_PROGRESS_PER_MS/);
  assert.match(app, /automaticLandDelay = Math\.max\(160, \(cruiseCeiling - \.04\) \/ ASTRAL_FLIGHT_PROGRESS_PER_MS\)/);
  assert.doesNotMatch(app, /Math\.pow\(1 - time, 3\)/);
  assert.match(app, /setAstralFlightPosition\(progress\)/);
  assert.match(app, /activeRound = beginAstralFlight/);
  assert.match(app, /ui\.bonusAction\.textContent = "PLAY"/);
  assert.doesNotMatch(app, /LAND NOW/);
  assert.match(app, /ui\.bonusOverlay\.dataset\.mode = "astral-aviator"/);
  assert.match(app, /ui\.cinematicOverlay\.dataset\.mode = "world-awakening"/);
  assert.doesNotMatch(app, /--cinematic-companion/);
  assert.match(app, /function updateAstralFlightHud/);
  assert.match(app, /10_000|10000/);
  assert.match(app, /ui\.bonusAction\.textContent = preview \? "Play again"/);
  assert.match(model, /Land controls reveal timing only/);
  assert.match(html, /Themed aviation multiplier flight/);
  assert.match(html, /plane-fire-cutout-v1\.png/);
  assert.match(html, /astral-flight-depth is-far/);
  assert.match(html, /astral-flight-speed-lines/);
  assert.equal((app.match(/await runAstralCinematicTransition\(/g) ?? []).length, 1);
  assert.match(css, /var\(--bonus-bg\) center \/ cover no-repeat/);
  assert.match(css, /\.astral-flight-plane img[\s\S]*?object-fit: contain/);
  assert.match(css, /\.astral-flight-telemetry/);
  assert.match(css, /\.astral-multiplier-ladder/);
  assert.match(css, /flightDepthRush/);
  assert.match(css, /--flight-scale/);
  assert.doesNotMatch(css, /flightLandedFlash/);
  assert.doesNotMatch(app, /jumpText\(ui\.astralRoundAward\)/);
});

test("scored symbols remain static while reel tiles stay stationary", async () => {
  const [app, css] = await Promise.all([
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8")
  ]);
  assert.match(app, /function revealSpecialCollectors\(collectorCount\)/);
  assert.match(app, /revealSpecialCollectors\(outcome\.collectorCount\)/);
  assert.doesNotMatch(app, /await playSymbolFusion\(outcome\)/);
  assert.match(css, /4\.7\.4 — scored reel symbols stay completely static/);
  assert.match(css, /\.reels\.has-winners \.symbol-cell\.is-winner[\s\S]*?animation: none !important/);
  assert.match(css, /\.symbol-fusion-thread[\s\S]*?display: none !important/);
  assert.match(css, /\.symbol-cell\.is-winner[\s\S]*?transform: none/);
  assert.match(app, /return `<img class="scatter-symbol" src="\$\{game\.scatterAsset\}"/);
  assert.match(css, /mix-blend-mode: normal/);
});

test("reel stops do not create the laggy ring, orbiting dots, or machine shake", async () => {
  const [app, css] = await Promise.all([
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8")
  ]);
  assert.match(app, /function flashReelStop\(\) \{[\s\S]*?Intentionally static/);
  assert.doesNotMatch(app, /impact\.innerHTML = "<i><\/i><b><\/b><em><\/em>"/);
  assert.doesNotMatch(app, /void machine\?\.offsetWidth/);
  assert.match(css, /4\.7\.6 — remove the reel-stop ring, orbiting dots, flash, and machine shake/);
  assert.match(css, /\.reel-impact b,[\s\S]*?display: none !important[\s\S]*?animation: none !important/);
  assert.match(css, /\.machine\.is-reel-impact[\s\S]*?animation: none !important[\s\S]*?transform: none !important/);
});

test("separate autoplay and speed buttons plus every positive payout remain visible", async () => {
  const [html, app, css] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("app.js", root), "utf8"),
    readFile(new URL("styles.css", root), "utf8")
  ]);
  assert.match(html, /id="spinCenter"[\s\S]*?id="autoButton"[\s\S]*?id="spinButton"[\s\S]*?id="speedToggleButton"/);
  assert.match(html, /id="autoButton"[\s\S]*?Start infinite autoplay[\s\S]*?∞/);
  assert.doesNotMatch(html, /spin-speed-selector|data-spin-speed|autoplayOverlay|data-auto-count/);
  assert.match(app, /async function startAutoplay\(\)/);
  assert.match(app, /while \(state\.autoActive && !state\.autoStopRequested\)/);
  assert.match(app, /Stop infinite autoplay now/);
  assert.match(app, /async function waitForAutoplayResult\(milliseconds, fromAuto\)/);
  assert.match(app, /while \(remaining > 0 && !state\.autoStopRequested\)/);
  assert.match(app, /spinButton\.classList\.toggle\("is-autoplay-stop", state\.autoActive\)/);
  assert.match(app, /if \(state\.autoActive\)[\s\S]*?stopAutoplay\("Stopping autoplay…"\)/);
  assert.match(app, /state\.autoActive \? "■" : "↻"/);
  assert.match(app, /state\.autoActive[\s\S]*?`<span aria-hidden="true">STOP<\/span>`/);
  assert.doesNotMatch(app, /STOP<\/span><strong[^>]*>■/);
  assert.match(css, /spin-button\.is-autoplay-stop \.spin-icon[\s\S]*?color: #ff3347/);
  assert.doesNotMatch(css, /spin-button\.is-autoplay-stop \{[\s\S]*?background:/);
  assert.doesNotMatch(css, /companionCinematicIdle/);
  assert.match(css, /machine > \.companion-stage[\s\S]*?right: clamp\(-150px, -10vw, -82px\)[\s\S]*?width: clamp\(380px, 36vw, 500px\)/);
  assert.match(css, /\.companion-stage img[\s\S]*?animation: none !important/);
  assert.match(css, /\.factory-symbol-showcase \{[\s\S]*?grid-template-columns: repeat\(4[\s\S]*?grid-template-rows: repeat\(2/);
  assert.match(css, /\.factory-symbol-showcase b \{[\s\S]*?background-color: transparent/);
  assert.match(css, /factory-options button > \.factory-symbol-showcase \{ border: 0; \}/);
  assert.match(css, /game-stage\[data-game="astral"\] \.control-deck \{[\s\S]*?border: 0;[\s\S]*?background: transparent;[\s\S]*?box-shadow: none/);
  assert.match(html, /class="control-deck"[\s\S]*?id="featureCard"[\s\S]*?class="bet-control"[\s\S]*?id="spinCenter"[\s\S]*?id="astralFeatureDock"/);
  assert.match(css, /grid-template-columns: 112px minmax\(195px, 1fr\) 200px minmax\(185px, 1fr\)/);
  assert.match(css, /padding-left: clamp\(142px, 13\.6vw, 190px\)[\s\S]*?padding-right: clamp\(142px, 13\.6vw, 190px\)/);
  assert.match(css, /grid-template-areas:[\s\S]*?"bet bet spin"[\s\S]*?"scatter features features"/);
  assert.match(css, /feature-market-overlay \.buy-feature-options button[\s\S]*?var\(--market-bonus-art\)/);
  assert.match(css, /--feature-option-color: var\(--game-secondary\)/);
  assert.match(css, /game-stage\[data-mood="epic"\] \.mood-overlay \{ opacity: \.14/);
  assert.match(css, /game-stage\[data-mood="shadow"\] \.mood-overlay \{ opacity: \.16/);
  assert.match(css, /factory-preview-mood[\s\S]*?mix-blend-mode: soft-light; opacity: \.2/);
  assert.match(css, /factory-symbol-showcase b,[\s\S]*?factory-symbol-showcase \.factory-scatter-choice[\s\S]*?aspect-ratio: 1 \/ 1 !important/);
  assert.match(css, /factory-group-symbols \.factory-options[\s\S]*?repeat\(3[\s\S]*?repeat\(2/);
  assert.match(css, /control-deck > \.feature-card,[\s\S]*?control-deck > \.astral-feature-dock[\s\S]*?position: relative !important/);
  assert.match(app, /--win-world-art/);
  assert.match(css, /var\(--win-world-art\) center \/ cover no-repeat/);
  assert.doesNotMatch(app, /autoRemaining|setAutoplayMenuOpen/);
  assert.match(app, /speedToggleButton\.addEventListener/);
  assert.match(app, /const settleTail = speed\.id === ["']fast["'] \? 40 : 90/);
  assert.match(css, /\.reel-spin-item \.generated-symbol,[\s\S]*?filter: none;/);
  assert.match(css, /\.reel-spin-column \{ contain: layout paint; \}/);
  for (const speed of ["normal", "fast"]) assert.match(app, new RegExp(`id: ["']${speed}["']`));
  assert.match(app, /SPIN_SPEED_STORAGE_KEY/);
  assert.match(app, /selectSpinSpeed/);
  assert.doesNotMatch(app, /requestQuickStop/);
  assert.match(app, /if \(outcome\.baseWin > 0\)/);
  assert.match(app, /await showWinBanner\(outcome\.baseWin/);
  assert.match(app, /outcomeClass === "partial-return"/);
  assert.match(html, /class="win-banner" id="winBanner"/);
  assert.doesNotMatch(html, /<span>Won<\/span>|id="lastWin"|id="returnAmount"/);
  assert.doesNotMatch(app, /returned on|No return|bet returned/i);
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
  assert.match(JSON.parse(packageJson).version, /^\d+\.\d+\.\d+$/);
});

test("phone spin, bet sizing, and feature controls stay visible without RTP or MAX clutter", async () => {
  const css = await readFile(new URL("styles.css", root), "utf8");
  assert.match(css, /4\.7\.5 — centered phone spin, equal bet controls, and persistent feature access/);
  assert.match(css, /4\.7\.9 — clear short-phone HUD[\s\S]*?topbar \.session-strip \.rtp-pill[\s\S]*?display: none !important[\s\S]*?visibility: hidden !important/);
  assert.match(css, /#maxBetButton \{[\s\S]*?display: none !important/);
  assert.match(css, /\.result-status,[\s\S]*?#lastWinButton,[\s\S]*?#winDetailsDialog[\s\S]*?display: none !important/);
  assert.match(css, /4\.7\.10 — dedicated rotated-phone character bay[\s\S]*?#featureCard #featureVisual\.scatter-tracker[\s\S]*?width: 120px/);
  assert.match(css, /#buyFeatureButton \.feature-button-orb[\s\S]*?var\(--feature-bonus-art\) center \/ cover no-repeat/);
  assert.match(css, /orientation: landscape[\s\S]*?max-height: 520px[\s\S]*?\.reel-frame[\s\S]*?width: calc\(100% - clamp\(104px, 14vw, 122px\)\)/);
  assert.match(css, /4\.7\.11 — rotated-phone action cluster[\s\S]*?left: -108px !important[\s\S]*?grid-template-columns: 42px 62px 42px/);
  assert.match(css, /4\.8\.6 final phone override[\s\S]*?brand > \.brand-mark[\s\S]*?display: grid !important/);
  assert.match(css, /4\.8\.6 final phone override[\s\S]*?#maxBetButton[\s\S]*?display: none !important/);
  assert.match(css, /4\.8\.6 final phone override[\s\S]*?#autoButton[\s\S]*?pointer-events: auto !important/);
  assert.match(css, /4\.8\.6 final phone override[\s\S]*?#betDown:hover:not\(:disabled\)[\s\S]*?transform: none !important/);
  assert.match(css, /4\.8\.6 final phone override[\s\S]*?phoneReelStartLeftToRight[\s\S]*?animation-delay: var\(--reel-start-delay/);
  assert.match(css, /4\.8\.6 final phone override[\s\S]*?grid-template-columns: minmax\(0, 1fr\)[\s\S]*?left: -112px !important/);
  assert.match(css, /4\.8\.6 final phone override[\s\S]*?#autoButton[\s\S]*?left: calc\(50% \+ 32px\) !important/);
  assert.match(css, /astral-locked-multipliers[\s\S]*?left: auto !important[\s\S]*?width: auto !important/);
  assert.match(css, /orientation: landscape[\s\S]*?max-height: 520px[\s\S]*?\.reel-frame[\s\S]*?height: 100%[\s\S]*?\.reel-footer[\s\S]*?display: none !important/);
  assert.match(css, /min-width: 361px[\s\S]*?max-width: 600px[\s\S]*?orientation: portrait[\s\S]*?#specialBetButton[\s\S]*?bottom: -8px !important/);
  assert.match(css, /stepper button:not\(\.mini-action\),[\s\S]*?stepper strong[\s\S]*?width: 44px[\s\S]*?height: 44px/);
  assert.match(css, /control-deck \.spin-center \{[\s\S]*?grid-column: 1 \/ -1 !important/);
  assert.match(css, /#spinButton \{[\s\S]*?left: 50%[\s\S]*?transform: translateX\(-50%\) !important/);
  assert.match(css, /#specialBetButton,[\s\S]*?#buyFeatureButton,[\s\S]*?display: grid !important[\s\S]*?opacity: 1 !important/);
});

test("four atmosphere profiles provide distinct adaptive procedural music identities", async () => {
  const engine = await readFile(new URL("experience-engine.js", root), "utf8");
  assert.match(engine, /scheduleMusic\(\)/);
  assert.match(engine, /startMusic\(\)/);
  assert.match(engine, /restartMusic\(\)/);
  assert.match(engine, /startAmbience\(\)/);
  assert.match(engine, /characterMoment\(/);
  for (const percussion of ["warDrum", "bellTick", "toyPop", "darkMetal"]) {
    assert.match(engine, new RegExp(`perc: ["']${percussion}["']`));
  }
});
