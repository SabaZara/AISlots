import assert from "node:assert/strict";
import test from "node:test";

import { ASTRAL_SAMPLE_LIBRARY, AUDIO_PROFILES, audioProfileFor } from "../experience-engine.js";

test("all four moods have distinct layered audio identities", () => {
  const ids = ["epic", "mystic", "dark", "playful"];
  assert.deepEqual(Object.keys(AUDIO_PROFILES), ids);
  assert.equal(new Set(ids.map((id) => audioProfileFor(id).wave)).size, 4);
  assert.equal(new Set(ids.map((id) => audioProfileFor(id).spinBase)).size, 4);
  assert.equal(new Set(ids.map((id) => audioProfileFor(id).spinFilter)).size, 4);
  ids.forEach((id) => {
    const profile = audioProfileFor(id);
    assert.ok(profile.tickNotes.length >= 4);
    assert.ok(profile.wet >= 0 && profile.wet <= 0.5);
  });
});

test("unknown audio themes fall back safely to Epic", () => {
  assert.equal(audioProfileFor("missing"), AUDIO_PROFILES.epic);
});

test("Epic sample layer separates all production audio roles", () => {
  assert.deepEqual(Object.keys(ASTRAL_SAMPLE_LIBRARY), ["background", "spinStart", "reelTick", "victory", "bigWin"]);
  Object.values(ASTRAL_SAMPLE_LIBRARY).forEach((path) => assert.match(path, /^\.\/assets\/audio\/wow-astral-.+\.ogg$/));
  assert.equal(new Set(Object.values(ASTRAL_SAMPLE_LIBRARY)).size, 5);
});
