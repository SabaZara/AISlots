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
    "astralBonusStage", "astralBonusGrid", "astralFreeSpinLabel", "astralRoundAward"
  ];
  requiredIds.forEach((id) => {
    assert.match(html, new RegExp(`id=["']${id}["']`));
    assert.match(app, new RegExp(`\\$\\(["']${id}["']\\)`));
  });
  assert.match(css, /astral-guardian-cinematic-v1\.png/);
  assert.match(css, /\.astral-bonus-cell\.is-cascade-win/);
  assert.match(css, /@media \(max-width: 560px\)/);
  assert.match(app, /no wager/i);
  assert.match(app, /no credits or feature progress changed/i);
});

test("generated Astral guardian asset is a project-local PNG", async () => {
  const image = await readFile(new URL("assets/astral-guardian-cinematic-v1.png", root));
  assert.deepEqual(Array.from(image.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.ok(image.length > 500_000);
});

test("Astral symbols and bonus chamber are project-local", async () => {
  const paths = [
    "assets/symbols-astral-v4.png",
    "assets/astral-bonus-chamber-v1.png"
  ];
  for (const path of paths) {
    const image = await readFile(new URL(path, root));
    assert.deepEqual(Array.from(image.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.ok(image.length > 500_000, `${path} should retain production detail`);
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
  assert.doesNotMatch(app, /renderPaylineOverlay|One symbol short|reel three breaks/i);
  assert.doesNotMatch(css, /astral-cabinet-two-guardians-v1\.png|\.payline-overlay/);
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
  assert.match(css, /grid-template-columns: clamp\(56px, 9vw, 70px\) minmax\(0, 1fr\)/);
  assert.match(readme, /viewport-locked phone and iPad gameplay/i);
  assert.match(inventory, /no document scrolling/i);
  assert.equal(JSON.parse(packageJson).version, "2.10.0");
});

test("licensed Astral spin and win samples include source attribution", async () => {
  const [spin, voice, licenses, audioEngine] = await Promise.all([
    readFile(new URL("assets/audio/mixkit-slot-machine-random-wheel-1930.mp3", root)),
    readFile(new URL("assets/audio/astral-you-win-mrstokes302.mp3", root)),
    readFile(new URL("assets/audio/LICENSES.md", root), "utf8"),
    readFile(new URL("experience-engine.js", root), "utf8")
  ]);
  assert.ok(spin.length > 50_000);
  assert.ok(voice.length > 50_000);
  assert.match(licenses, /Pixabay Content License/);
  assert.match(licenses, /Mixkit Sound Effects Free License/);
  assert.match(audioEngine, /astralWinVoice/);
  assert.match(audioEngine, /astralSpin/);
});
