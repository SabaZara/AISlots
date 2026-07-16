import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  ANIMATION_STYLES,
  COMPANIONS,
  DEFAULT_VISUAL_CONFIG,
  MOODS,
  resolveVisualConfig,
  SYMBOL_SETS,
  THEMES,
  VISUAL_COMBINATION_COUNT
} from "../asset-catalog.js";

const root = new URL("../", import.meta.url);

test("World Forge publishes all 4,320 independent combinations", () => {
  assert.equal(THEMES.length, 6);
  assert.equal(COMPANIONS.length, 6);
  assert.equal(MOODS.length, 4);
  assert.equal(SYMBOL_SETS.length, 6);
  assert.equal(ANIMATION_STYLES.length, 5);
  assert.equal(VISUAL_COMBINATION_COUNT, 6 * 6 * 4 * 6 * 5);
  assert.equal(VISUAL_COMBINATION_COUNT, 4320);
});

test("each generated raster asset is local and production-sized", async () => {
  const items = [...THEMES, ...COMPANIONS, ...MOODS, ...SYMBOL_SETS];
  assert.equal(new Set(items.map((item) => item.asset)).size, 22);
  for (const item of items) {
    assert.match(item.asset, /^\.\/assets\/factory\/.+\.(?:jpg|png)$/);
    const image = await readFile(new URL(item.asset.slice(2), root));
    if (item.asset.endsWith(".png")) {
      assert.deepEqual(Array.from(image.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
      assert.match(item.asset, /companion-.+-cutout-v2\.png$/);
    } else {
      assert.deepEqual(Array.from(image.subarray(0, 3)), [255, 216, 255]);
    }
    assert.ok(image.length > 75_000, `${item.asset} should retain production detail`);
  }
});

test("each symbol family has a dedicated transparent Scatter cutout", async () => {
  assert.equal(new Set(SYMBOL_SETS.map((set) => set.scatterAsset)).size, 6);
  for (const set of SYMBOL_SETS) {
    assert.match(set.scatterAsset, /^\.\/assets\/factory\/scatter-.+-v1\.png$/);
    assert.match(set.collector, /Scatter$/);
    const image = await readFile(new URL(set.scatterAsset.slice(2), root));
    assert.deepEqual(Array.from(image.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.ok(image.length > 150_000, `${set.scatterAsset} should retain transparent production detail`);
  }
});

test("invalid saved choices resolve safely to the published default", () => {
  const resolved = resolveVisualConfig({
    theme: "missing",
    companion: "missing",
    mood: "missing",
    symbols: "missing",
    animation: "missing"
  });
  assert.equal(resolved.theme.id, DEFAULT_VISUAL_CONFIG.theme);
  assert.equal(resolved.companion.id, DEFAULT_VISUAL_CONFIG.companion);
  assert.equal(resolved.mood.id, DEFAULT_VISUAL_CONFIG.mood);
  assert.equal(resolved.symbols.id, DEFAULT_VISUAL_CONFIG.symbols);
  assert.equal(resolved.animation.id, DEFAULT_VISUAL_CONFIG.animation);
});

test("each symbol family exposes exactly seven distinct game labels", () => {
  for (const set of SYMBOL_SETS) {
    assert.equal(Object.keys(set.names).length, 7);
    assert.equal(new Set(Object.values(set.names)).size, 7);
    assert.ok(Object.values(set.names).includes(set.collector));
  }
});
