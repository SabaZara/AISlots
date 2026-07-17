import assert from "node:assert/strict";
import test from "node:test";

import {
  AUDIO_PROFILES,
  CHARACTER_VOICES,
  WORLD_AMBIENCES,
  audioProfileFor
} from "../experience-engine.js";

test("all four atmospheres have distinct layered audio identities", () => {
  const ids = ["epic", "arcane", "playful", "shadow"];
  assert.deepEqual(Object.keys(AUDIO_PROFILES), ids);
  assert.equal(new Set(ids.map((id) => audioProfileFor(id).root)).size, 4);
  assert.equal(new Set(ids.map((id) => audioProfileFor(id).spin.windFreq)).size, 4);
  assert.equal(new Set(ids.map((id) => audioProfileFor(id).music.bpm)).size, 4);
  assert.equal(new Set(ids.map((id) => audioProfileFor(id).music.perc)).size, 4);
  ids.forEach((id) => {
    const profile = audioProfileFor(id);
    assert.ok(profile.scale.length >= 5, `${id} needs a musical scale`);
    assert.ok(profile.wet >= 0 && profile.wet <= 0.5);
    assert.ok(profile.spin.motorFreq > 20 && profile.spin.subLevel > 0, `${id} needs layered spin voices`);
    assert.equal(profile.music.bass.length, 16);
    assert.equal(profile.music.lead.length, 16);
    assert.ok(profile.music.chords.length >= 4, `${id} needs a chord progression`);
  });
});

test("unknown atmospheres fall back safely to Epic", () => {
  assert.equal(audioProfileFor("missing"), AUDIO_PROFILES.epic);
  assert.equal(audioProfileFor("mystic"), AUDIO_PROFILES.epic);
});

test("every world has a quiet ambience recipe", () => {
  assert.deepEqual(Object.keys(WORLD_AMBIENCES), ["fire", "ice", "nature", "void", "reef", "temple", "eclipse"]);
  Object.values(WORLD_AMBIENCES).forEach((spec) => {
    assert.ok(spec.bed.length > 0);
    assert.ok(spec.events.length > 0);
  });
});

test("every companion has a signature vocalization", () => {
  assert.deepEqual(
    Object.keys(CHARACTER_VOICES),
    ["valkyrie", "dragon", "direwolf", "kraken", "titan", "tiger", "gorilla", "sorceress"]
  );
});
