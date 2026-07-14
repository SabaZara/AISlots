import assert from "node:assert/strict";
import test from "node:test";

import { AUDIO_PROFILES, audioProfileFor } from "../experience-engine.js";

test("all four games have distinct layered audio identities", () => {
  const ids = ["astral", "neon", "ember", "ufc"];
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

test("unknown audio themes fall back safely to Astral", () => {
  assert.equal(audioProfileFor("missing"), AUDIO_PROFILES.astral);
});
