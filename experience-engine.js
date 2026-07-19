// AISlots premium audio engine.
//
// Every sound has a live synthesized version, while owned/licensed sample files
// can replace the essential slots through assets/audio/manifest.json. Each
// gameplay moment (spin, reel stop, win, bonus, jackpot) mixes layered voices —
// mechanical movement, magical energy, wind, sub bass, particles and momentum
// — with weighted random variation in pitch, timing, stereo position and
// layer choice so no action repeats exactly.
//
// The four atmosphere profiles (Epic, Arcane, Playful, Shadow) swap the entire
// soundscape — music, ambient loops, spin voices, reward tones, UI feedback —
// while gameplay logic stays untouched. Music, ambience, spin, gameplay SFX,
// UI and character vocalizations run through independent buses so each family
// can be mixed, ducked and EQ'd without masking the others.

export const AUDIO_PROFILES = Object.freeze({
  // "I am marching to war with a Viking horde." — galloping war drums, shield
  // stomps, low chant drones in open fifths, and horn-call melodies. Martial
  // and driving, never euro-pop.
  epic: Object.freeze({
    label: "Epic",
    wave: "triangle",
    root: 146.83, // D3
    scale: Object.freeze([0, 2, 3, 5, 7, 10]), // D natural minor hexatonic — heroic
    sparkleBase: 1174.66,
    wet: 0.24,
    echo: 0.06,
    spin: Object.freeze({
      motorFreq: 82, motorWave: "triangle", motorLevel: 0.015,
      windFreq: 1350, windType: "bandpass",
      subFreq: 50, subLevel: 0.015, tickRate: 16
    }),
    stop: Object.freeze({ thumpFreq: 170, toneFreq: 392, sparkle: 0.8, ringRatio: 1.5 }),
    ui: Object.freeze({ base: 523.25, wave: "triangle" }),
    music: Object.freeze({
      bpm: 96,
      padWave: "sawtooth", bassWave: "sawtooth", leadWave: "sawtooth",
      // Open-fifth chant drones instead of pop chords: D5 — D5 — C5 — Bb5.
      chords: Object.freeze([
        Object.freeze([0, 7, 12]),
        Object.freeze([0, 7, 12]),
        Object.freeze([-2, 5, 10]),
        Object.freeze([-4, 3, 10])
      ]),
      // B section: the drone rises — F5 — G5 — C5 — D5, a war band cresting.
      chordsB: Object.freeze([
        Object.freeze([3, 10, 15]),
        Object.freeze([5, 12, 17]),
        Object.freeze([-2, 5, 10]),
        Object.freeze([0, 7, 12])
      ]),
      // Galloping 3-3-2 longboat-oar bassline.
      bass: Object.freeze([0, null, null, 0, null, null, 0, null, 0, null, null, 0, null, null, 0, 0]),
      // Horn-call phrases: long, narrow-range signals — not a synth hook.
      lead: Object.freeze([0, null, null, null, 2, null, 3, null, null, null, 2, null, 0, null, null, null]),
      leadB: Object.freeze([4, null, null, 3, null, 2, null, null, 3, null, 2, null, 0, null, null, null]),
      leadChance: 0.8,
      swing: 0.02,
      perc: "warDrum",
      level: 0.026,
      filter: 1600,
      wet: 0.34
    })
  }),
  // "I entered an ancient magical realm." — crystal chimes, mystical bells,
  // enchanted wind, shimmering textures. Magical, never scary.
  arcane: Object.freeze({
    label: "Arcane",
    wave: "sine",
    root: 220, // A3
    scale: Object.freeze([0, 2, 4, 6, 7, 9, 11]), // A lydian — pure wonder
    sparkleBase: 1760,
    wet: 0.4,
    echo: 0.16,
    spin: Object.freeze({
      motorFreq: 110, motorWave: "triangle", motorLevel: 0.011,
      windFreq: 900, windType: "lowpass",
      subFreq: 55, subLevel: 0.01, tickRate: 15
    }),
    stop: Object.freeze({ thumpFreq: 210, toneFreq: 660, sparkle: 1, ringRatio: 2 }),
    ui: Object.freeze({ base: 880, wave: "sine" }),
    music: Object.freeze({
      bpm: 100,
      padWave: "triangle", bassWave: "sine", leadWave: "sine",
      // Open, suspended shapes that shimmer instead of resolving hard.
      chords: Object.freeze([
        Object.freeze([0, 7, 11, 16]),
        Object.freeze([2, 9, 14, 18]),
        Object.freeze([-3, 4, 9, 16]),
        Object.freeze([-5, 2, 7, 14])
      ]),
      // B section: the suspensions climb a step, opening the ceiling.
      chordsB: Object.freeze([
        Object.freeze([4, 11, 16, 21]),
        Object.freeze([2, 9, 14, 18]),
        Object.freeze([7, 14, 19, 23]),
        Object.freeze([0, 7, 12, 19])
      ]),
      bass: Object.freeze([0, null, 7, null, 0, null, 7, 12, 0, null, 7, null, 0, 12, 7, null]),
      lead: Object.freeze([4, null, 2, 6, null, 5, null, 7, 3, null, 5, 1, null, 4, 6, null]),
      leadB: Object.freeze([6, null, 4, null, 7, null, 5, 4, null, 6, null, 8, null, 7, null, 5]),
      leadChance: 0.75,
      swing: 0.1,
      perc: "bellTick",
      level: 0.022,
      filter: 3400,
      wet: 0.46
    })
  }),
  // "This is joyful and impossible to stop playing." — marimba plucks, toy
  // percussion, satisfying pops. Nintendo polish, never shrill.
  playful: Object.freeze({
    label: "Playful",
    wave: "triangle",
    root: 261.63, // C4
    scale: Object.freeze([0, 2, 4, 7, 9]), // C major pentatonic — always friendly
    sparkleBase: 1568,
    wet: 0.14,
    echo: 0.04,
    spin: Object.freeze({
      motorFreq: 130, motorWave: "triangle", motorLevel: 0.013,
      windFreq: 1650, windType: "highpass",
      subFreq: 65, subLevel: 0.009, tickRate: 18
    }),
    stop: Object.freeze({ thumpFreq: 240, toneFreq: 523.25, sparkle: 0.9, ringRatio: 1.25 }),
    ui: Object.freeze({ base: 659.25, wave: "triangle" }),
    music: Object.freeze({
      bpm: 128,
      padWave: "triangle", bassWave: "triangle", leadWave: "square",
      // I — vi — IV — V, the bounciest progression there is.
      chords: Object.freeze([
        Object.freeze([0, 4, 7, 12]),
        Object.freeze([-3, 0, 4, 9]),
        Object.freeze([-7, -3, 0, 5]),
        Object.freeze([-5, -1, 2, 7])
      ]),
      // B section: IV — V — iii — ii lifted voicings, pure singalong chorus.
      chordsB: Object.freeze([
        Object.freeze([5, 9, 12, 16]),
        Object.freeze([7, 11, 14, 17]),
        Object.freeze([4, 7, 12, 16]),
        Object.freeze([2, 5, 9, 14])
      ]),
      bass: Object.freeze([0, 12, null, 0, 7, 12, null, 7, 0, 12, null, 0, 5, 12, 7, null]),
      lead: Object.freeze([0, null, 2, 4, null, 4, null, 3, null, 2, null, 1, 2, null, 0, null]),
      leadB: Object.freeze([4, null, 3, 2, 4, null, 2, null, 1, 2, null, 4, null, 3, 2, 0]),
      leadChance: 0.9,
      swing: 0.16,
      perc: "toyPop",
      level: 0.021,
      filter: 2800,
      wet: 0.14
    })
  }),
  // "I am playing with dangerous ancient power." — low drones, deep bass,
  // metallic echoes, ominous pulses. Premium dark, never horror.
  shadow: Object.freeze({
    label: "Shadow",
    wave: "sawtooth",
    root: 82.41, // E2
    scale: Object.freeze([0, 1, 3, 5, 7, 8]), // E phrygian hexatonic — ancient menace
    sparkleBase: 987.77,
    wet: 0.2,
    echo: 0.24,
    spin: Object.freeze({
      motorFreq: 62, motorWave: "sawtooth", motorLevel: 0.013,
      windFreq: 480, windType: "bandpass",
      subFreq: 41, subLevel: 0.017, tickRate: 13
    }),
    stop: Object.freeze({ thumpFreq: 120, toneFreq: 220, sparkle: 0.45, ringRatio: 1.5 }),
    ui: Object.freeze({ base: 329.63, wave: "triangle" }),
    music: Object.freeze({
      bpm: 94,
      padWave: "sawtooth", bassWave: "sine", leadWave: "triangle",
      // Dark modal shapes driven by a relentless pedal-tone pulse.
      chords: Object.freeze([
        Object.freeze([0, 7, 12, 15]),
        Object.freeze([0, 5, 12, 13]),
        Object.freeze([-4, 3, 8, 15]),
        Object.freeze([0, 7, 10, 14])
      ]),
      // B section: the pedal tone tilts to the flat second — deeper menace.
      chordsB: Object.freeze([
        Object.freeze([0, 7, 13, 15]),
        Object.freeze([1, 8, 13, 20]),
        Object.freeze([-4, 3, 10, 15]),
        Object.freeze([3, 8, 12, 19])
      ]),
      bass: Object.freeze([0, null, 0, null, 0, 0, null, 12, 0, null, 0, null, 0, 0, 12, null]),
      lead: Object.freeze([null, null, 3, null, null, null, 1, null, null, null, 0, null, null, 5, null, 2]),
      leadB: Object.freeze([5, null, null, 3, null, null, 2, null, null, 1, null, null, 0, null, 3, null]),
      leadChance: 0.6,
      swing: 0.04,
      perc: "darkMetal",
      level: 0.023,
      filter: 1100,
      wet: 0.24
    })
  })
});

export function audioProfileFor(atmosphereId) {
  return AUDIO_PROFILES[atmosphereId] ?? AUDIO_PROFILES.epic;
}

// Quiet environmental beds per world. These stay far below gameplay sounds.
export const WORLD_AMBIENCES = Object.freeze({
  fire: Object.freeze({ bed: "embers", events: Object.freeze(["crackle", "rumble"]) }),
  ice: Object.freeze({ bed: "coldWind", events: Object.freeze(["iceCrack"]) }),
  nature: Object.freeze({ bed: "leaves", events: Object.freeze(["bird"]) }),
  void: Object.freeze({ bed: "cosmicDrone", events: Object.freeze(["voidSweep"]) }),
  reef: Object.freeze({ bed: "lagoon", events: Object.freeze(["bubble", "waterChime"]) }),
  temple: Object.freeze({ bed: "sanctum", events: Object.freeze(["gong", "bird"]) }),
  eclipse: Object.freeze({ bed: "solarHum", events: Object.freeze(["flare", "deepPulse"]) })
});

// Signature vocalization recipes per companion. Played rarely (see
// characterMoment) so they stay exciting, layered into reward audio.
export const CHARACTER_VOICES = Object.freeze({
  valkyrie: "battle-cry",
  dragon: "roar",
  direwolf: "howl",
  kraken: "ocean-call",
  titan: "stone-steps",
  tiger: "roar-slash",
  gorilla: "chest-beat",
  sorceress: "spell-cast"
});

// Licensed sample slots — the essential sounds worth replacing with produced
// audio files. Drop licensed files into assets/audio/ and list them in
// assets/audio/manifest.json; any filled slot automatically replaces the
// synthesized version of that event, and the synth remains the fallback for
// every empty slot. A slot can also be atmosphere-specific by suffixing the
// manifest key with the atmosphere id (e.g. "music_base_epic").
export const SAMPLE_SLOTS = Object.freeze({
  music_base: Object.freeze({ bus: "music", loop: true, volume: 0.5, replaces: "adaptive base music" }),
  music_bonus: Object.freeze({ bus: "music", loop: true, volume: 0.55, replaces: "bonus-mode music" }),
  ambience: Object.freeze({ bus: "ambience", loop: true, volume: 0.5, replaces: "world ambience bed (ambience_<world> overrides per world)" }),
  spin_loop: Object.freeze({ bus: "spin", loop: true, volume: 0.5, replaces: "motor + tick-train spin loop" }),
  spin_start: Object.freeze({ bus: "spin", volume: 0.6, replaces: "spin launch" }),
  reel_stop: Object.freeze({ bus: "sfx", volume: 0.5, replaces: "mechanism reel stops (variants recommended)" }),
  scatter_land: Object.freeze({ bus: "sfx", volume: 0.7, replaces: "escalating scatter landings (_1.._n = escalation steps)" }),
  anticipation: Object.freeze({ bus: "sfx", volume: 0.6, replaces: "final-reel anticipation" }),
  line_win: Object.freeze({ bus: "sfx", volume: 0.55, replaces: "line win reveals (variants recommended)" }),
  win_count_end: Object.freeze({ bus: "sfx", volume: 0.6, replaces: "count-up closing sting" }),
  wintier_big: Object.freeze({ bus: "sfx", volume: 0.7, replaces: "big win fanfare" }),
  wintier_mega: Object.freeze({ bus: "sfx", volume: 0.75, replaces: "mega win fanfare" }),
  wintier_epic: Object.freeze({ bus: "sfx", volume: 0.8, replaces: "epic win / jackpot sequence" }),
  bonus_trigger: Object.freeze({ bus: "sfx", volume: 0.75, replaces: "bonus entry sequence" }),
  bonus_reveal: Object.freeze({ bus: "sfx", volume: 0.65, replaces: "multiplier ladder reveals (_1.._n = ladder steps)" }),
  coin_rain: Object.freeze({ bus: "sfx", volume: 0.5, replaces: "celebration coin rain" }),
  ui_click: Object.freeze({ bus: "ui", volume: 0.4, replaces: "select/confirm clicks" })
});

const SAMPLE_BASE_PATH = "./assets/audio/";

const rand = (min, max) => min + Math.random() * (max - min);
const chance = (probability) => Math.random() < probability;
const pickFrom = (list) => list[Math.floor(Math.random() * list.length)];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
// Weighted random pitch variation in cents so repeated events never sound identical.
const varyFreq = (frequency, cents = 22) => frequency * 2 ** (rand(-cents, cents) / 1200);

export class SlotAudioEngine {
  constructor(getVisualConfig) {
    this.getVisualConfig = getVisualConfig;
    this.enabled = false;
    this.context = null;
    this.graph = null;
    this.spinVoice = null;
    this.lastWinVoiceAt = 0;
    this.lastVoiceMomentAt = 0;
    this.lastUiHoverAt = 0;
    this.lastParticleAt = 0;
    this.fastSpin = false;
    // Adaptive music state.
    this.musicTimer = null;
    this.musicStep = 0;
    this.nextStepAt = 0;
    this.energy = 0.2;
    this.bonusMode = false;
    // Ambience state.
    this.ambience = null;
    // Licensed sample library (assets/audio/manifest.json); null until loaded.
    this.samples = null;
    this.samplePromise = null;
    this.musicSampleVoice = null;
    this.sampleRevision = Date.now().toString(36);
  }

  config() {
    const raw = typeof this.getVisualConfig === "function" ? this.getVisualConfig() : {};
    if (typeof raw === "string") return { mood: raw, theme: "fire", companion: "dragon" };
    return { mood: raw?.mood ?? "epic", theme: raw?.theme ?? "fire", companion: raw?.companion ?? "dragon" };
  }

  profile() {
    return audioProfileFor(this.config().mood);
  }

  // ─── Graph & buses ────────────────────────────────────────────────────────

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopSpinLoop({ immediate: true });
      this.stopBigWin({ immediate: true });
      this.stopMusic();
      return;
    }
    const context = this.ensure();
    if (context?.state === "suspended") void context.resume();
    this.startMusic();
    void this.loadSampleLibrary().then((loaded) => {
      // If a music or ambience sample just became available, restart the
      // scene so the produced loops take over from the synth.
      if (loaded && this.enabled) this.restartMusic();
    });
  }

  // ─── Licensed sample library ──────────────────────────────────────────────
  // assets/audio/manifest.json maps slot names to files inside assets/audio/:
  //   { "reel_stop": ["reel-stop-1.webm", "reel-stop-2.webm"],
  //     "music_base": "main-theme.webm", "music_base_shadow": "dark-theme.webm" }
  // Any filled slot replaces the synthesized event; missing slots fall back to
  // the synth automatically. Numbered arrays double as escalation ladders.

  sampleAssetUrl(file) {
    const url = new URL(file, new URL(SAMPLE_BASE_PATH, import.meta.url));
    url.searchParams.set("music", this.sampleRevision);
    return url.href;
  }

  loadSampleLibrary() {
    if (this.samplePromise) return this.samplePromise;
    this.samplePromise = (async () => {
      const context = this.ensure();
      if (!context) return false;
      let manifest;
      try {
        const response = await fetch(this.sampleAssetUrl("manifest.json"), { cache: "no-store" });
        if (!response.ok) return false;
        manifest = await response.json();
      } catch {
        return false; // no manifest — fully synthesized soundscape
      }
      const library = new Map();
      await Promise.all(Object.entries(manifest).map(async ([slot, files]) => {
        const list = Array.isArray(files) ? files : [files];
        const buffers = [];
        for (const file of list) {
          try {
            const response = await fetch(this.sampleAssetUrl(file), { cache: "no-store" });
            if (!response.ok) continue;
            buffers.push(await context.decodeAudioData(await response.arrayBuffer()));
          } catch (error) {
            console.warn(`Audio sample "${file}" for slot "${slot}" could not be loaded.`, error);
          }
        }
        if (buffers.length) library.set(slot, buffers);
      }));
      this.samples = library;
      return library.size > 0;
    })();
    return this.samplePromise;
  }

  // Buffers for a slot, preferring an atmosphere-specific override
  // ("<slot>_<mood>") over the generic entry.
  slotBuffers(slot) {
    if (!this.samples) return null;
    return this.samples.get(`${slot}_${this.config().mood}`) ?? this.samples.get(slot) ?? null;
  }

  // Play a filled slot. Returns the playing voice, or null when the slot is
  // empty (callers then fall back to the synthesized version). `variant`
  // indexes escalation ladders; otherwise a random variant is chosen. `key`
  // names a preferred manifest entry tried before the slot's own lookup.
  playSlot(slot, { volume = 1, pan = 0, rate = null, variant = null, delay = 0, key = null } = {}) {
    if (!this.enabled) return null;
    const buffers = (key ? this.samples?.get(key) : null) ?? this.slotBuffers(slot);
    if (!buffers) return null;
    const context = this.ensure();
    if (!context) return null;
    const spec = SAMPLE_SLOTS[slot] ?? { bus: "sfx", volume: 0.6, loop: false };
    const buffer = variant === null
      ? pickFrom(buffers)
      : buffers[clamp(variant, 0, buffers.length - 1)];
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = Boolean(spec.loop);
    source.playbackRate.value = rate ?? (spec.loop ? 1 : rand(0.97, 1.04));
    gain.gain.value = spec.volume * volume;
    source.connect(gain);
    this.connectVoice(gain, { pan, bus: spec.bus });
    source.start(context.currentTime + delay);
    return { source, gain };
  }

  stopSampleVoice(voice, { immediate = false } = {}) {
    if (!voice || !this.context) return;
    const now = this.context.currentTime;
    voice.gain.gain.setTargetAtTime(0.0001, now, immediate ? 0.004 : 0.12);
    try { voice.source.stop(now + (immediate ? 0.02 : 0.4)); } catch { /* already stopped */ }
  }

  ensure() {
    if (this.context) return this.context;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    const context = new AudioContext();
    const master = context.createGain();
    const compressor = context.createDynamicsCompressor();
    // Independent buses so ambience, music, spin, gameplay SFX, UI and
    // character voices are separately mixable and never mask each other.
    const buses = {
      music: context.createGain(),
      ambience: context.createGain(),
      spin: context.createGain(),
      sfx: context.createGain(),
      ui: context.createGain(),
      voice: context.createGain()
    };
    buses.music.gain.value = 0.72;
    buses.ambience.gain.value = 0.5;
    buses.spin.gain.value = 0.86;
    buses.sfx.gain.value = 1;
    buses.ui.gain.value = 0.66;
    buses.voice.gain.value = 0.9;

    master.gain.value = 0.68;
    compressor.threshold.value = -20;
    compressor.knee.value = 16;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.24;

    // Two reverb spaces: a short room for mechanical sounds and a long hall
    // for magical/reward shimmer — plus a filtered feedback echo for Shadow
    // metallic tails and Arcane trails.
    const hall = context.createConvolver();
    hall.buffer = this.makeImpulse(context, 2.6, 2.9);
    const hallGain = context.createGain();
    hallGain.gain.value = 0.2;
    const room = context.createConvolver();
    room.buffer = this.makeImpulse(context, 0.7, 2.1);
    const roomGain = context.createGain();
    roomGain.gain.value = 0.24;
    const echo = context.createDelay(1);
    echo.delayTime.value = 0.29;
    const echoFeedback = context.createGain();
    echoFeedback.gain.value = 0.34;
    const echoFilter = context.createBiquadFilter();
    echoFilter.type = "lowpass";
    echoFilter.frequency.value = 1900;
    const echoGain = context.createGain();
    echoGain.gain.value = 0.5;
    echo.connect(echoFilter).connect(echoFeedback).connect(echo);
    echoFilter.connect(echoGain).connect(master);
    hall.connect(hallGain).connect(master);
    room.connect(roomGain).connect(master);

    Object.values(buses).forEach((bus) => bus.connect(master));
    master.connect(compressor).connect(context.destination);
    this.context = context;
    this.graph = { master, compressor, buses, hall, room, echo };
    return context;
  }

  makeImpulse(context, seconds, decay) {
    const length = Math.floor(context.sampleRate * seconds);
    const impulse = context.createBuffer(2, length, context.sampleRate);
    for (let channelIndex = 0; channelIndex < 2; channelIndex += 1) {
      const channel = impulse.getChannelData(channelIndex);
      for (let index = 0; index < length; index += 1) {
        channel[index] = (Math.random() * 2 - 1) * (1 - index / length) ** decay;
      }
    }
    return impulse;
  }

  connectVoice(node, { pan = 0, wet = 0, wetShort = 0, echo = 0, bus = "sfx" } = {}) {
    const context = this.context;
    const panner = context.createStereoPanner ? context.createStereoPanner() : context.createGain();
    if (panner.pan) panner.pan.value = clamp(pan, -1, 1);
    node.connect(panner);
    panner.connect(this.graph.buses[bus] ?? this.graph.buses.sfx);
    if (wet > 0) {
      const send = context.createGain();
      send.gain.value = clamp(wet, 0, 0.65);
      panner.connect(send).connect(this.graph.hall);
    }
    if (wetShort > 0) {
      const send = context.createGain();
      send.gain.value = clamp(wetShort, 0, 0.65);
      panner.connect(send).connect(this.graph.room);
    }
    if (echo > 0) {
      const send = context.createGain();
      send.gain.value = clamp(echo, 0, 0.6);
      panner.connect(send).connect(this.graph.echo);
    }
    return panner;
  }

  // ─── Core synth voices ────────────────────────────────────────────────────

  tone(frequency, duration = 0.12, options = {}) {
    if (!this.enabled) return null;
    const context = this.ensure();
    if (!context) return null;
    if (context.state === "suspended") void context.resume();
    const {
      type = this.profile().wave,
      delay = 0,
      volume = 0.085,
      attack = 0.009,
      pan = 0,
      wet = 0,
      wetShort = 0,
      echo = 0,
      frequencyEnd = frequency,
      filter = 0,
      filterEnd = filter,
      detune = 0,
      music = false,
      spin = false,
      bus = music ? "music" : spin ? "spin" : "sfx"
    } = options;
    const start = context.currentTime + delay;
    const stop = start + Math.max(0.03, duration);
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filterNode = filter > 0 ? context.createBiquadFilter() : null;
    oscillator.type = type;
    oscillator.detune.value = detune;
    oscillator.frequency.setValueAtTime(Math.max(20, frequency), start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, frequencyEnd), stop);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + Math.min(attack, duration / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, stop);
    if (filterNode) {
      filterNode.type = "lowpass";
      filterNode.Q.value = 1.4;
      filterNode.frequency.setValueAtTime(filter, start);
      filterNode.frequency.exponentialRampToValueAtTime(Math.max(50, filterEnd), stop);
      oscillator.connect(filterNode).connect(gain);
    } else {
      oscillator.connect(gain);
    }
    this.connectVoice(gain, { pan, wet, wetShort, echo, bus });
    oscillator.start(start);
    oscillator.stop(stop + 0.03);
    return oscillator;
  }

  noise(duration = 0.2, options = {}) {
    if (!this.enabled) return null;
    const context = this.ensure();
    if (!context) return null;
    const {
      delay = 0,
      volume = 0.035,
      pan = 0,
      wet = 0.06,
      wetShort = 0,
      echo = 0,
      filterType = "bandpass",
      frequency = this.profile().spin.windFreq,
      frequencyEnd = frequency,
      attack = 0.012,
      music = false,
      spin = false,
      bus = music ? "music" : spin ? "spin" : "sfx"
    } = options;
    const start = context.currentTime + delay;
    const frames = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, frames, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < frames; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / frames) ** 0.45;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    filter.type = filterType;
    filter.Q.value = filterType === "bandpass" ? 2.1 : 0.7;
    filter.frequency.setValueAtTime(Math.max(40, frequency), start);
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, frequencyEnd), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + Math.min(attack, duration / 4));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.buffer = buffer;
    source.connect(filter).connect(gain);
    this.connectVoice(gain, { pan, wet, wetShort, echo, bus });
    source.start(start);
    return source;
  }

  // A struck-metal bell: fundamental plus two inharmonic partials with faster
  // decay. The heart of the Arcane atmosphere and reel-stop resonance.
  bell(frequency, duration = 0.8, { volume = 0.03, delay = 0, pan = 0, wet = 0.3, echo = 0, bus = "sfx" } = {}) {
    this.tone(frequency, duration, { type: "sine", volume, delay, pan, wet, echo, bus, attack: 0.004 });
    this.tone(frequency * 2.756, duration * 0.45, { type: "sine", volume: volume * 0.34, delay, pan: pan * 0.6, wet, echo, bus, attack: 0.003 });
    this.tone(frequency * 5.404, duration * 0.2, { type: "sine", volume: volume * 0.14, delay, pan: -pan * 0.4, wet: wet * 0.7, bus, attack: 0.002 });
  }

  // A marimba/pluck: short triangle with a soft attack click. Playful's voice.
  pluck(frequency, duration = 0.22, { volume = 0.04, delay = 0, pan = 0, wet = 0.12, bus = "sfx" } = {}) {
    this.tone(frequency, duration, { type: "triangle", volume, delay, pan, wet, bus, attack: 0.003, filter: frequency * 6, filterEnd: frequency * 2.2 });
    this.tone(frequency * 4, 0.03, { type: "sine", volume: volume * 0.3, delay, pan, bus, attack: 0.001 });
  }

  // A soft physical impact: filtered noise knock over a dropping sine body.
  thump(frequency = 150, { volume = 0.055, delay = 0, pan = 0, duration = 0.18, bus = "sfx" } = {}) {
    this.tone(frequency, duration, { type: "sine", volume, delay, pan, bus, attack: 0.004, frequencyEnd: frequency * 0.55 });
    this.noise(duration * 0.6, { volume: volume * 0.5, delay, pan, bus, filterType: "lowpass", frequency: frequency * 2.4, frequencyEnd: frequency, wetShort: 0.14 });
  }

  // A deep cinematic sub hit for major moments.
  subImpact({ volume = 0.08, delay = 0, frequency = 46, bus = "sfx" } = {}) {
    this.tone(frequency * 1.4, 0.7, { type: "sine", volume, delay, bus, attack: 0.005, frequencyEnd: frequency });
    this.noise(0.3, { volume: volume * 0.4, delay, bus, filterType: "lowpass", frequency: 160, frequencyEnd: 55, wetShort: 0.2 });
  }

  // A rising energy sweep used for anticipation, bonus gathering and jackpots.
  riser(duration = 0.8, { volume = 0.045, delay = 0, from = 400, to = 3600, bus = "sfx", wet = 0.2 } = {}) {
    this.noise(duration, { volume, delay, bus, filterType: "bandpass", frequency: from, frequencyEnd: to, wet, attack: duration * 0.5 });
    this.tone(from * 0.5, duration, { type: "sine", volume: volume * 0.5, delay, bus, frequencyEnd: to * 0.5, wet: wet * 0.8, attack: duration * 0.4 });
  }

  // A cascade of tiny magical particles, randomized in pitch, spacing and
  // stereo position each time.
  sparkleBurst({ delay = 0, strength = 1, count = 7, base = this.profile().sparkleBase, bus = "sfx" } = {}) {
    const profile = this.profile();
    const steps = profile.scale;
    for (let index = 0; index < count; index += 1) {
      const degree = steps[Math.floor(rand(0, steps.length))];
      const octave = chance(0.35) ? 2 : 1;
      const note = varyFreq(base * 2 ** ((degree + octave * 12) / 12) / 2, 16);
      this.tone(note, rand(0.07, 0.12) + strength * 0.05, {
        type: chance(0.34) ? "triangle" : "sine",
        delay: delay + index * rand(0.02, 0.05),
        volume: (0.011 + index / Math.max(1, count - 1) * 0.011) * strength,
        pan: Math.sin(index * 1.9 + rand(0, 2)) * 0.72,
        wet: profile.wet + strength * 0.08,
        echo: profile.echo * 0.5,
        filter: 9800,
        filterEnd: 6200,
        bus
      });
    }
    this.noise(0.16 + strength * 0.14, {
      delay, volume: 0.008 + strength * 0.008, wet: 0.16, bus,
      filterType: "highpass", frequency: 4200, frequencyEnd: 9800
    });
  }

  scaleFreq(degreeIndex, octave = 0) {
    const profile = this.profile();
    const steps = profile.scale;
    const wrapped = ((degreeIndex % steps.length) + steps.length) % steps.length;
    const lift = Math.floor(degreeIndex / steps.length);
    return profile.root * 2 ** ((steps[wrapped] + (octave + lift) * 12) / 12);
  }

  bumpEnergy(target) {
    this.energy = clamp(Math.max(this.energy, target), 0, 1);
  }

  // ─── Adaptive music ───────────────────────────────────────────────────────
  // A look-ahead scheduler drives a generative arrangement. Layers fade in and
  // out with an "energy" value that events raise and idle time decays: bass
  // and pads always play, leads join with activity, percussion and arps join
  // during excitement, and bonus mode elevates the whole arrangement.

  startMusic() {
    this.stopMusic();
    if (!this.enabled || !this.ensure()) return;
    const context = this.context;
    const bus = this.graph.buses.music;
    bus.gain.cancelScheduledValues(context.currentTime);
    bus.gain.setValueAtTime(0.0001, context.currentTime);
    bus.gain.setTargetAtTime(0.72, context.currentTime, 0.5);
    // A licensed music loop takes over from the generative arrangement when
    // the matching slot is filled (music_bonus during bonus scenes).
    const musicSlot = this.bonusMode && this.slotBuffers("music_bonus") ? "music_bonus" : "music_base";
    const sampleVoice = this.playSlot(musicSlot);
    if (sampleVoice) {
      this.musicSampleVoice = sampleVoice;
    } else {
      this.musicStep = 0;
      this.nextStepAt = context.currentTime + 0.08;
      this.musicTimer = window.setInterval(() => this.scheduleMusic(), 90);
    }
    this.startAmbience();
  }

  stopMusic() {
    if (this.musicTimer !== null) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
    this.musicStep = 0;
    if (this.musicSampleVoice) {
      this.stopSampleVoice(this.musicSampleVoice);
      this.musicSampleVoice = null;
    }
    this.stopAmbience();
  }

  restartMusic() {
    if (this.enabled) this.startMusic();
  }

  stepSeconds() {
    const music = this.profile().music;
    const bpm = music.bpm * (this.bonusMode ? 1.06 : 1);
    return 60 / bpm / 4;
  }

  scheduleMusic() {
    const context = this.context;
    if (!context || !this.enabled) return;
    // Excitement decays toward a driving baseline — the arrangement always
    // keeps its pulse, it only sheds the top layers when idle.
    const floor = this.bonusMode ? 0.85 : 0.45;
    this.energy += (floor - this.energy) * 0.012;
    while (this.nextStepAt < context.currentTime + 0.24) {
      this.playMusicStep(this.musicStep, Math.max(0, this.nextStepAt - context.currentTime));
      this.musicStep += 1;
      this.nextStepAt += this.stepSeconds();
    }
  }

  // The arrangement is a real song, not a looping bar: 8-bar phrases split
  // into an A section and a lifted B section (its own chords, answering
  // melody, octave lift), with drum fills into every section change, a crash
  // on each section downbeat, swing on the off-16ths, and call-and-response
  // melodies — so the track keeps moving instead of treading water.
  playMusicStep(step, delay) {
    const profile = this.profile();
    const music = profile.music;
    const stepInBar = step % 16;
    const bar = Math.floor(step / 16);
    const barInPhrase = bar % 8;
    const inB = barInPhrase >= 4;
    const fillBar = barInPhrase === 3 || barInPhrase === 7;
    const beat = this.stepSeconds();
    const chords = inB && music.chordsB ? music.chordsB : music.chords;
    const chord = chords[barInPhrase % 4 % chords.length];
    const root = profile.root;
    const freq = (semitones, octave = 0) => root * 2 ** ((semitones + octave * 12) / 12);
    // Swing: every off-16th lands late, giving the groove a human push.
    const when = delay + (stepInBar % 2 === 1 ? beat * (music.swing ?? 0.1) : 0);

    // Section downbeat: a warm mid splash and low boom announce each section
    // (reference music carries almost nothing above 2 kHz, so no bright crash).
    if (stepInBar === 0 && (barInPhrase === 0 || barInPhrase === 4)) {
      this.noise(0.45, { volume: music.level * 0.5, delay, music: true, filterType: "bandpass", frequency: 2600, frequencyEnd: 1200, wet: 0.3, attack: 0.004 });
      this.tone(freq(chord[0], -2), 0.4, { type: "sine", volume: music.level * 1.4, delay, frequencyEnd: Math.max(30, freq(chord[0], -2) * 0.7), music: true, attack: 0.005 });
    }

    // Pad layer — chord swell at bar start; the B section voices it brighter.
    if (stepInBar === 0 || (stepInBar === 8 && this.energy > 0.5)) {
      const tones = inB || this.bonusMode ? [...chord, chord[1] + 12] : chord;
      tones.forEach((semitone, index) => {
        this.tone(varyFreq(freq(semitone), 5), beat * 14, {
          type: music.padWave,
          volume: music.level * (0.5 + this.energy * 0.32),
          attack: beat * 4,
          delay,
          pan: (index / (tones.length - 1) - 0.5) * 0.7,
          wet: music.wet,
          // Reference pads live in the 120–400 Hz warmth band — keep the
          // filter low so the bed stays dark and full, never fizzy.
          filter: music.filter * (inB ? 0.55 : 0.45) * (0.8 + this.energy * 0.4),
          filterEnd: music.filter * 0.3,
          music: true
        });
      });
    }

    // Rhythmic chord stabs — off-beat hits in A, syncopated 16ths-feel in B.
    const stabSteps = inB ? [2, 6, 10, 14] : [4, 12];
    if (stabSteps.includes(stepInBar) && this.energy > 0.3) {
      chord.slice(0, 3).forEach((semitone, index) => {
        this.tone(varyFreq(freq(semitone), 6), beat * 1.6, {
          type: music.padWave,
          volume: music.level * (inB ? 0.48 : 0.58),
          attack: 0.006,
          delay: when,
          pan: (index - 1) * 0.4,
          wet: music.wet * 0.6,
          filter: music.filter * 0.7,
          filterEnd: music.filter * 0.4,
          music: true
        });
      });
    }

    // Bass layer — driving pattern with a sub-octave double; the B section
    // fills the gaps into relentless eighths.
    let bassOffset = music.bass[stepInBar];
    if (!Number.isFinite(bassOffset) && inB && stepInBar % 2 === 0) bassOffset = 0;
    if (Number.isFinite(bassOffset)) {
      const bassFreq = freq(chord[0] + bassOffset, -1);
      this.tone(bassFreq, beat * 1.4, {
        type: music.bassWave,
        volume: music.level * 2.1,
        attack: 0.008,
        delay: when,
        wet: music.wet * 0.2,
        filter: Math.max(260, music.filter * 0.45),
        filterEnd: Math.max(170, music.filter * 0.26),
        music: true
      });
      // Sub-octave double — the reference's top intensity level is over half
      // sub-bass, so this layer swells hard with excitement.
      this.tone(bassFreq / 2, beat * 1.2, { type: "sine", volume: music.level * (1.1 + this.energy * 1.6), attack: 0.008, delay: when, music: true });
    }

    // Lead layer — call (bars 0-1) and response (bars 2-3), then both again an
    // octave up in the B section. Two detuned voices thicken the line, and
    // weighted randomness keeps repeats from ever being identical.
    const leadPattern = Math.floor(bar / 2) % 2 === 1 && music.leadB ? music.leadB : music.lead;
    const leadDegree = leadPattern[stepInBar];
    if (Number.isFinite(leadDegree) && this.energy > 0.12 && chance(music.leadChance)) {
      const octave = 1 + (inB || this.bonusMode ? 1 : 0) + (chance(0.1) ? 1 : 0);
      const leadFreq = varyFreq(this.scaleFreq(leadDegree, octave), 6);
      [-6, 6].forEach((cents) => {
        this.tone(leadFreq, beat * rand(1.4, 2.2), {
          type: music.leadWave,
          detune: cents,
          volume: music.level * (0.38 + this.energy * 0.22),
          attack: 0.02,
          delay: when,
          pan: Math.sin(step * 0.9) * 0.36 + cents * 0.02,
          wet: music.wet,
          echo: profile.echo * 0.6,
          filter: music.filter,
          filterEnd: music.filter * 0.7,
          music: true
        });
      });
    }

    // Arp topper — reserved for real excitement, and kept an octave lower
    // than before so the bed never turns fizzy (reference music is dark).
    if ((inB && this.energy > 0.55) || this.energy > 0.7) {
      if (stepInBar % 2 === 0) {
        const semitone = chord[(stepInBar / 2) % chord.length];
        this.tone(varyFreq(freq(semitone, 1), 9), beat * 1.1, {
          type: "sine",
          volume: music.level * 0.3 * Math.max(0.6, this.energy),
          attack: 0.008,
          delay: when,
          pan: Math.sin(step * 1.7) * 0.6,
          wet: music.wet + 0.1,
          music: true
        });
      }
    }

    // Fill bar: the last beat becomes a rising drum fill, with a sweep that
    // launches the next section.
    if (fillBar && stepInBar === 8) {
      this.noise(beat * 8, { volume: music.level * 0.7, delay, music: true, filterType: "bandpass", frequency: 700, frequencyEnd: 3600, wet: 0.24, attack: beat * 5 });
    }
    if (fillBar && stepInBar >= 12) {
      const fillStep = stepInBar - 12;
      this.tone(varyFreq(190 - fillStep * 28, 16), 0.1, { type: "sine", volume: music.level * (0.8 + fillStep * 0.25), delay: when, frequencyEnd: 70, music: true, attack: 0.003 });
      this.noise(0.05, { volume: music.level * (0.5 + fillStep * 0.2), delay: when, music: true, filterType: "bandpass", frequency: 1700 + fillStep * 350, frequencyEnd: 900, wetShort: 0.2 });
      return;
    }

    // Percussion layer — atmosphere-specific character, always driving.
    if (this.energy > 0.08) this.playPercussion(music.perc, stepInBar, delay);
  }

  playPercussion(kind, stepInBar, delay) {
    const excited = this.energy > 0.55 || this.bonusMode;
    const onBeat = stepInBar % 4 === 0;
    const offBeat = stepInBar % 4 === 2;
    if (kind === "warDrum") {
      // Viking war drums: a galloping 3-3-2 tom pattern (row-stroke rhythm),
      // deep hall-heavy hits, shield-stomp cracks on the backbeats and a low
      // chant bark on the phrase accents. No bright hats — nothing euro.
      const gallop = [0, 3, 6, 8, 11, 14];
      if (gallop.includes(stepInBar)) {
        const accent = stepInBar === 0 || stepInBar === 8 ? 1 : 0.68;
        this.tone(varyFreq(62, 18), 0.3, { type: "sine", volume: 0.028 * accent, delay, frequencyEnd: 40, music: true, attack: 0.005 });
        this.noise(0.16, { volume: 0.016 * accent, delay, music: true, filterType: "lowpass", frequency: 260, frequencyEnd: 70, wetShort: 0.3, wet: 0.12 });
      }
      if (stepInBar === 4 || stepInBar === 12) {
        // Shield stomp: a woody crack with body.
        this.noise(0.07, { volume: 0.013, delay, music: true, filterType: "bandpass", frequency: 1200, frequencyEnd: 550, wetShort: 0.28 });
        this.thump(varyFreq(120, 16), { volume: 0.016, delay, duration: 0.09, bus: "music" });
      }
      if (stepInBar === 8 && (excited || chance(0.4))) {
        // Chant bark ("HUH!"): a short vocal-shaped saw grunt.
        this.tone(varyFreq(105, 30), 0.14, { type: "sawtooth", volume: 0.014, delay, frequencyEnd: 82, filter: 620, filterEnd: 300, music: true, attack: 0.01, wetShort: 0.24 });
        this.noise(0.08, { volume: 0.007, delay, music: true, filterType: "bandpass", frequency: 700, frequencyEnd: 400 });
      }
      if (excited && (stepInBar === 2 || stepInBar === 10)) {
        // Extra oar-stroke double when the horde is excited.
        this.tone(varyFreq(70, 18), 0.16, { type: "sine", volume: 0.014, delay, frequencyEnd: 46, music: true, attack: 0.004 });
      }
    } else if (kind === "bellTick") {
      // Pulsing magical percussion: soft heartbeat kick under sparkling bells.
      if (stepInBar === 0 || stepInBar === 8) {
        this.tone(varyFreq(68, 18), 0.18, { type: "sine", volume: 0.017, delay, frequencyEnd: 48, music: true, attack: 0.005 });
      }
      if (stepInBar === 4 || stepInBar === 12) {
        this.bell(varyFreq(2093, 26), 0.5, { volume: 0.007, delay, pan: rand(-0.5, 0.5), wet: 0.5, bus: "music" });
      }
      if (offBeat && excited) {
        this.tone(varyFreq(3136, 30), 0.05, { type: "sine", volume: 0.004, delay, pan: rand(-0.6, 0.6), wet: 0.3, music: true });
      }
    } else if (kind === "toyPop") {
      // Four-on-the-floor toy kit: pop kick, offbeat hats, excited shaker.
      if (onBeat) {
        this.noise(0.05, { volume: 0.015, delay, music: true, filterType: "bandpass", frequency: 620, frequencyEnd: 240, wetShort: 0.1 });
        this.tone(varyFreq(160, 20), 0.07, { type: "sine", volume: 0.01, delay, frequencyEnd: 90, music: true, attack: 0.003 });
      }
      if (offBeat) {
        this.noise(0.025, { volume: 0.007, delay, music: true, filterType: "highpass", frequency: 7400, frequencyEnd: 9200 });
      }
      if (excited && stepInBar % 2 === 1) {
        this.noise(0.02, { volume: 0.004, delay, music: true, filterType: "highpass", frequency: 9000, frequencyEnd: 11000, pan: rand(-0.5, 0.5) });
      }
    } else if (kind === "darkMetal") {
      // Relentless dark pulse: deep kicks with clanging metallic backbeats.
      if (onBeat) {
        const accent = stepInBar === 0 || stepInBar === 8 ? 1 : 0.65;
        this.tone(varyFreq(52, 14), 0.3, { type: "sine", volume: 0.023 * accent, delay, frequencyEnd: 38, music: true, attack: 0.005 });
      }
      if (stepInBar === 6 || stepInBar === 14) {
        this.noise(0.09, { volume: 0.008, delay, music: true, filterType: "bandpass", frequency: 860, frequencyEnd: 480, echo: 0.4 });
      }
      if (excited && stepInBar % 2 === 1) {
        this.noise(0.02, { volume: 0.004, delay, music: true, filterType: "highpass", frequency: 6800, frequencyEnd: 8800 });
      }
    }
  }

  // ─── World ambience ───────────────────────────────────────────────────────
  // Each world contributes a quiet looping bed plus occasional one-shot
  // events, mixed on their own bus far below gameplay audio.

  startAmbience() {
    const themeId = this.config().theme;
    if (this.ambience?.themeId === themeId && this.ambience?.running) return;
    this.stopAmbience();
    if (!this.enabled || !this.ensure()) return;
    const context = this.context;
    const busGain = this.graph.buses.ambience;
    busGain.gain.cancelScheduledValues(context.currentTime);
    busGain.gain.setValueAtTime(0.0001, context.currentTime);
    busGain.gain.setTargetAtTime(0.5, context.currentTime, 1.2);

    // A licensed ambience loop replaces the synthesized bed and events; the
    // per-world manifest key ("ambience_<world>") wins over the generic one.
    const ambientSample = this.playSlot("ambience", { key: `ambience_${themeId}` });
    if (ambientSample) {
      this.ambience = { themeId, nodes: [], eventTimer: 0, sampleVoice: ambientSample, running: true };
      return;
    }

    const spec = WORLD_AMBIENCES[themeId] ?? WORLD_AMBIENCES.fire;
    const nodes = [];
    const bed = this.buildAmbienceBed(spec.bed);
    if (bed) nodes.push(...bed);

    const eventTimer = window.setInterval(() => {
      if (!this.enabled) return;
      spec.events.forEach((event) => this.playAmbienceEvent(event));
    }, 900);
    this.ambience = { themeId, nodes, eventTimer, running: true };
  }

  stopAmbience() {
    if (!this.ambience) return;
    const { nodes, eventTimer, sampleVoice } = this.ambience;
    window.clearInterval(eventTimer);
    if (sampleVoice) this.stopSampleVoice(sampleVoice);
    nodes.forEach((node) => {
      try { node.stop?.(); } catch { /* already stopped */ }
      try { node.disconnect?.(); } catch { /* already disconnected */ }
    });
    this.ambience = null;
  }

  ambientLoopNoise({ filterType, frequency, q = 0.8, level, lfoRate = 0, lfoDepth = 0 }) {
    const context = this.context;
    const frames = Math.floor(context.sampleRate * 2.8);
    const buffer = context.createBuffer(1, frames, context.sampleRate);
    const data = buffer.getChannelData(0);
    let previous = 0;
    for (let index = 0; index < frames; index += 1) {
      previous = previous * 0.58 + (Math.random() * 2 - 1) * 0.42;
      data[index] = previous;
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = filterType;
    filter.Q.value = q;
    filter.frequency.value = frequency;
    const gain = context.createGain();
    gain.gain.value = level;
    source.connect(filter).connect(gain).connect(this.graph.buses.ambience);
    const created = [source, filter, gain];
    if (lfoRate > 0) {
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      lfo.frequency.value = lfoRate;
      lfoGain.gain.value = lfoDepth;
      lfo.connect(lfoGain).connect(filter.frequency);
      lfo.start();
      created.push(lfo, lfoGain);
    }
    source.start();
    return created;
  }

  ambientDrone(frequency, level, detune = 0.7) {
    const context = this.context;
    const created = [];
    [0, detune].forEach((offset) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency + offset;
      gain.gain.value = level;
      oscillator.connect(gain).connect(this.graph.buses.ambience);
      oscillator.start();
      created.push(oscillator, gain);
    });
    return created;
  }

  buildAmbienceBed(bed) {
    if (bed === "embers") {
      return [
        ...this.ambientLoopNoise({ filterType: "lowpass", frequency: 320, level: 0.014, lfoRate: 0.09, lfoDepth: 90 }),
        ...this.ambientDrone(48, 0.006)
      ];
    }
    if (bed === "coldWind") {
      return this.ambientLoopNoise({ filterType: "bandpass", frequency: 760, q: 1.6, level: 0.012, lfoRate: 0.07, lfoDepth: 320 });
    }
    if (bed === "leaves") {
      return this.ambientLoopNoise({ filterType: "highpass", frequency: 3400, level: 0.006, lfoRate: 0.11, lfoDepth: 600 });
    }
    if (bed === "cosmicDrone") {
      return [
        ...this.ambientDrone(55, 0.009, 0.5),
        ...this.ambientLoopNoise({ filterType: "highpass", frequency: 6200, level: 0.003, lfoRate: 0.05, lfoDepth: 900 })
      ];
    }
    if (bed === "lagoon") {
      // Sun-lit shallows: gently swaying watery flow with a soft sparkle above.
      return [
        ...this.ambientLoopNoise({ filterType: "lowpass", frequency: 420, level: 0.013, lfoRate: 0.14, lfoDepth: 160 }),
        ...this.ambientLoopNoise({ filterType: "highpass", frequency: 7200, level: 0.002, lfoRate: 0.09, lfoDepth: 800 })
      ];
    }
    if (bed === "sanctum") {
      // Warm sacred hall: a low golden drone under faint jungle foliage.
      return [
        ...this.ambientDrone(65.41, 0.007, 0.6),
        ...this.ambientLoopNoise({ filterType: "highpass", frequency: 3800, level: 0.004, lfoRate: 0.08, lfoDepth: 500 })
      ];
    }
    if (bed === "solarHum") {
      // Held breath of a darkened sun: beating low hum with a corona shimmer.
      return [
        ...this.ambientDrone(49, 0.009, 0.35),
        ...this.ambientLoopNoise({ filterType: "bandpass", frequency: 3100, q: 2.4, level: 0.003, lfoRate: 0.04, lfoDepth: 1100 })
      ];
    }
    return null;
  }

  playAmbienceEvent(event) {
    if (event === "crackle" && chance(0.5)) {
      this.noise(rand(0.02, 0.05), {
        volume: rand(0.004, 0.009), bus: "ambience", filterType: "highpass",
        frequency: rand(1800, 3600), frequencyEnd: rand(4200, 7000), pan: rand(-0.7, 0.7)
      });
    } else if (event === "rumble" && chance(0.06)) {
      this.noise(rand(0.8, 1.4), { volume: 0.008, bus: "ambience", filterType: "lowpass", frequency: 140, frequencyEnd: 60, attack: 0.5 });
    } else if (event === "iceCrack" && chance(0.07)) {
      this.noise(rand(0.05, 0.1), { volume: 0.008, bus: "ambience", filterType: "highpass", frequency: 2600, frequencyEnd: 7400, pan: rand(-0.8, 0.8) });
      this.tone(varyFreq(2200, 90), 0.3, { type: "sine", volume: 0.004, bus: "ambience", wet: 0.4, pan: rand(-0.6, 0.6) });
    } else if (event === "bird" && chance(0.12)) {
      const base = rand(2300, 3600);
      const chirps = Math.floor(rand(2, 5));
      for (let index = 0; index < chirps; index += 1) {
        this.tone(base * rand(0.94, 1.1), rand(0.04, 0.08), {
          type: "sine", volume: rand(0.003, 0.006), bus: "ambience",
          delay: index * rand(0.07, 0.13), frequencyEnd: base * rand(1.1, 1.3), pan: rand(-0.8, 0.8), wet: 0.2
        });
      }
    } else if (event === "voidSweep" && chance(0.05)) {
      this.tone(rand(180, 300), rand(2, 3.4), {
        type: "sine", volume: 0.005, bus: "ambience", attack: 1.1,
        frequencyEnd: rand(90, 150), wet: 0.5, pan: rand(-0.5, 0.5)
      });
    } else if (event === "bubble" && chance(0.16)) {
      const bubbles = Math.floor(rand(1, 4));
      for (let index = 0; index < bubbles; index += 1) {
        const base = rand(340, 720);
        this.tone(base, rand(0.06, 0.12), {
          type: "sine", volume: rand(0.003, 0.006), bus: "ambience",
          delay: index * rand(0.09, 0.2), frequencyEnd: base * rand(1.6, 2.4), pan: rand(-0.7, 0.7), wet: 0.2
        });
      }
    } else if (event === "waterChime" && chance(0.05)) {
      this.tone(varyFreq(1320, 80), 0.5, { type: "sine", volume: 0.004, bus: "ambience", wet: 0.5, echo: 0.3, pan: rand(-0.6, 0.6) });
    } else if (event === "gong" && chance(0.04)) {
      const base = varyFreq(196, 30);
      this.tone(base, rand(1.8, 2.6), { type: "sine", volume: 0.007, bus: "ambience", attack: 0.02, wet: 0.55, pan: rand(-0.4, 0.4) });
      this.tone(base * 2.756, rand(0.9, 1.3), { type: "sine", volume: 0.003, bus: "ambience", attack: 0.02, wet: 0.5 });
    } else if (event === "flare" && chance(0.05)) {
      this.noise(rand(1.6, 2.6), {
        volume: 0.005, bus: "ambience", filterType: "bandpass",
        frequency: rand(700, 1100), frequencyEnd: rand(2600, 4200), attack: 0.9, wet: 0.4, pan: rand(-0.5, 0.5)
      });
    } else if (event === "deepPulse" && chance(0.08)) {
      this.tone(varyFreq(46, 30), rand(1.2, 2), { type: "sine", volume: 0.008, bus: "ambience", attack: 0.6, frequencyEnd: 40 });
    }
  }

  // ─── Spin audio ───────────────────────────────────────────────────────────
  // Six simultaneous layers make spinning feel physically satisfying:
  //  1 mechanical motor  2 magical energy shimmer  3 wind  4 subtle sub bass
  //  5 particle ticks (scheduled from spinTick)  6 a slow momentum build that
  //  opens the wind filter over the first seconds of the spin.

  startSpinLoop() {
    if (!this.enabled) return;
    this.stopSpinLoop({ immediate: true });
    const context = this.ensure();
    if (!context) return;
    // A licensed spin loop replaces the whole synthesized loop; fast mode
    // prefers a dedicated "spin_loop_fast" entry, else speeds the loop up.
    const sampleVoice = this.playSlot("spin_loop", {
      key: this.fastSpin ? "spin_loop_fast" : null,
      rate: this.fastSpin && !this.samples?.get("spin_loop_fast") ? 1.15 : 1
    });
    if (sampleVoice) {
      this.spinVoice = { sampleVoice, stops: 0 };
      return;
    }
    const spin = this.profile().spin;
    const now = context.currentTime;
    const lift = this.bonusMode ? 1.18 : 1;

    // Layer 1: a rich mechanical motor — two detuned oscillators plus a bright
    // overtone through a resonant lowpass, with a gentle wobble LFO and a slow
    // momentum pitch rise. Purely tonal, so nothing sounds like rushing water.
    const motor = context.createOscillator();
    motor.type = spin.motorWave;
    motor.frequency.setValueAtTime(spin.motorFreq, now);
    motor.frequency.exponentialRampToValueAtTime(spin.motorFreq * 1.07, now + 2.6);
    const motorB = context.createOscillator();
    motorB.type = spin.motorWave;
    motorB.detune.value = 9;
    motorB.frequency.setValueAtTime(spin.motorFreq, now);
    motorB.frequency.exponentialRampToValueAtTime(spin.motorFreq * 1.07, now + 2.6);
    const harm = context.createOscillator();
    harm.type = "triangle";
    harm.frequency.setValueAtTime(spin.motorFreq * 3, now);
    harm.frequency.exponentialRampToValueAtTime(spin.motorFreq * 3.21, now + 2.6);
    const harmGain = context.createGain();
    harmGain.gain.value = 0.3;
    const motorLfo = context.createOscillator();
    const motorLfoGain = context.createGain();
    motorLfo.frequency.value = rand(4.6, 6.2);
    motorLfoGain.gain.value = spin.motorFreq * 0.014;
    motorLfo.connect(motorLfoGain);
    motorLfoGain.connect(motor.frequency);
    motorLfoGain.connect(motorB.frequency);
    const motorFilter = context.createBiquadFilter();
    motorFilter.type = "lowpass";
    motorFilter.Q.value = 2.6;
    motorFilter.frequency.setValueAtTime(spin.motorFreq * 4, now);
    motorFilter.frequency.exponentialRampToValueAtTime(spin.motorFreq * 6, now + 2.6);
    const motorGain = context.createGain();
    motorGain.gain.setValueAtTime(0.0001, now);
    motorGain.gain.exponentialRampToValueAtTime(spin.motorLevel * lift, now + 0.12);

    // Layer 2: mechanical tick-train — a low-frequency pulse wave highpassed
    // down to its edge transients, leaving a fast reel clacker: tk-tk-tk.
    // (Reference wheels center around ~6 kHz, so the filter sits high.)
    // Reference wheels ratchet at ~16 ticks/s (~18 turbo, a ×1.15 lift) with
    // most energy at 2–6 kHz — so the clacker leads the mix, not the hum.
    const tickRate = spin.tickRate * (this.fastSpin ? 1.15 : 1);
    const ticker = context.createOscillator();
    ticker.type = "square";
    ticker.frequency.setValueAtTime(tickRate, now);
    ticker.frequency.exponentialRampToValueAtTime(tickRate * 1.12, now + (this.fastSpin ? 1.2 : 2.6));
    const tickerFilter = context.createBiquadFilter();
    tickerFilter.type = "highpass";
    tickerFilter.Q.value = 1.4;
    tickerFilter.frequency.value = 2800;
    const tickerGain = context.createGain();
    tickerGain.gain.setValueAtTime(0.0001, now);
    tickerGain.gain.exponentialRampToValueAtTime(0.026 * lift, now + 0.2);

    // Layer 3: subtle sub bass bed for physical weight.
    const sub = context.createOscillator();
    sub.type = "sine";
    sub.frequency.value = spin.subFreq;
    const subGain = context.createGain();
    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.exponentialRampToValueAtTime(spin.subLevel, now + 0.4);

    const panner = context.createStereoPanner ? context.createStereoPanner() : context.createGain();
    motor.connect(motorFilter);
    motorB.connect(motorFilter);
    harm.connect(harmGain).connect(motorFilter);
    motorFilter.connect(motorGain).connect(panner);
    ticker.connect(tickerFilter).connect(tickerGain).connect(panner);
    sub.connect(subGain).connect(panner);
    panner.connect(this.graph.buses.spin);
    [motor, motorB, harm, motorLfo, ticker, sub].forEach((node) => node.start(now));
    this.spinVoice = { motor, motorB, harm, harmGain, motorLfo, motorFilter, motorGain, ticker, tickerFilter, tickerGain, sub, subGain, panner, stops: 0 };
  }

  updateSpin(tick, anticipation = false) {
    if (!this.spinVoice || !this.context) return;
    if (this.spinVoice.sampleVoice) {
      if (anticipation) this.spinVoice.sampleVoice.source.playbackRate.setTargetAtTime(1.18, this.context.currentTime, 0.1);
      return;
    }
    const spin = this.profile().spin;
    const now = this.context.currentTime;
    const target = spin.motorFreq * (anticipation ? 1.35 : 1 + tick % 4 * 0.02);
    this.spinVoice.motor.frequency.setTargetAtTime(target, now, 0.03);
    this.spinVoice.motorB.frequency.setTargetAtTime(target, now, 0.03);
    this.spinVoice.ticker.frequency.setTargetAtTime(spin.tickRate * (anticipation ? 1.3 : 1.08), now, 0.05);
    if (anticipation) this.spinVoice.motorFilter.frequency.setTargetAtTime(spin.motorFreq * 8, now, 0.06);
    if (this.spinVoice.panner.pan) this.spinVoice.panner.pan.setTargetAtTime(Math.sin(tick * 0.47) * 0.42, now, 0.06);
  }

  stopSpinLoop({ immediate = false } = {}) {
    if (!this.context) return;
    const now = this.context.currentTime;
    const end = now + (immediate ? 0.025 : 0.16);
    if (this.spinVoice) {
      const voice = this.spinVoice;
      if (voice.sampleVoice) {
        this.stopSampleVoice(voice.sampleVoice, { immediate });
      } else {
        [voice.motorGain, voice.tickerGain, voice.subGain].forEach((gain) => {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setTargetAtTime(0.0001, now, immediate ? 0.004 : 0.035);
        });
        [voice.motor, voice.motorB, voice.harm, voice.motorLfo, voice.ticker, voice.sub].forEach((node) => {
          try { node.stop(end + 0.03); } catch { /* already stopped */ }
        });
      }
    }
    this.spinVoice = null;
  }

  spinStart({ fast = false } = {}) {
    const profile = this.profile();
    const spin = profile.spin;
    // Fast mode gets the "_faster/_turbo" treatment: shorter, snappier layers.
    this.fastSpin = fast;
    const pace = fast ? 0.6 : 1;
    this.bumpEnergy(0.65);
    if (this.playSlot("spin_start", { key: fast ? "spin_start_fast" : null })) {
      this.startSpinLoop();
      return;
    }
    // Launch: mechanical clunk-engage + punchy thump + rising energy zip.
    this.thump(varyFreq(spin.motorFreq * 1.6, 20), { volume: 0.05, duration: 0.13 * pace, bus: "spin" });
    this.noise(0.03, { volume: 0.03, spin: true, filterType: "highpass", frequency: 2600, frequencyEnd: 5200 });
    this.tone(varyFreq(spin.motorFreq * 0.7, 26), 0.24 * pace, { spin: true, frequencyEnd: spin.motorFreq * 1.4, volume: 0.05, filter: spin.motorFreq * 4, filterEnd: spin.motorFreq * 7 });
    this.tone(this.scaleFreq(0, 1), 0.22 * pace, { type: profile.wave, volume: 0.032, wet: profile.wet * 0.7, spin: true, frequencyEnd: this.scaleFreq(4, 2), attack: 0.02 * pace });
    this.subImpact({ volume: 0.035, frequency: spin.subFreq, bus: "spin" });
    this.startSpinLoop();
    if (chance(0.5)) this.sparkleBurst({ strength: 0.45, count: fast ? 3 : 4, delay: 0.05, bus: "spin" });
  }

  spinTick(tick) {
    this.updateSpin(tick);
    const context = this.context;
    if (!context) return;
    // Layer 5: reel clacks and energy particles — throttled, randomized in
    // pitch, pan and accent so the roll feels mechanical, never washy.
    const nowMs = performance.now();
    if (nowMs - this.lastParticleAt < 60) return;
    this.lastParticleAt = nowMs;
    const profile = this.profile();
    const pan = (tick % 10) / 5 - 1;
    const accent = tick % 4 === 0;
    // Mechanical clack: a hard, very short click.
    this.noise(rand(0.008, 0.014), {
      volume: accent ? 0.02 : 0.012, pan, spin: true, attack: 0.001,
      filterType: "bandpass", frequency: rand(2400, 3400), frequencyEnd: rand(1600, 2200), wetShort: 0.1
    });
    // Pitched energy blip riding the atmosphere's scale.
    if (accent || chance(0.4)) {
      const degree = Math.floor(tick / 2) % profile.scale.length;
      this.tone(varyFreq(this.scaleFreq(degree, 2), 14), rand(0.03, 0.05), {
        volume: rand(0.012, 0.02), pan: -pan * 0.6, wet: 0.06, filter: 10800, filterEnd: 7600, spin: true, attack: 0.002
      });
    }
  }

  // Every reel landing plays one of four distinct "mechanism stop" recipes
  // (reference: production slots ship mechanism_stop_1..5 variants) — a bright
  // mechanical click leading, modest low weight underneath, quiet relative to
  // reward audio so wins always sit on top. Reel 5 triggers a tension riser,
  // and the final reel gets extra weight and a resolving chime.
  reelStop(reelIndex, isFinal = false) {
    const profile = this.profile();
    const stop = profile.stop;
    const pan = reelIndex / 2.5 - 1;
    if (this.spinVoice && this.context) {
      // Wind down the loop stepwise so deceleration is audible.
      this.spinVoice.stops += 1;
      const remaining = clamp(1 - this.spinVoice.stops * 0.16, 0.2, 1);
      const now = this.context.currentTime;
      if (this.spinVoice.sampleVoice) {
        this.spinVoice.sampleVoice.gain.gain.setTargetAtTime((SAMPLE_SLOTS.spin_loop.volume ?? 0.5) * remaining, now, 0.09);
      } else {
        this.spinVoice.motorGain.gain.setTargetAtTime(profile.spin.motorLevel * remaining, now, 0.09);
        this.spinVoice.tickerGain.gain.setTargetAtTime(0.026 * remaining, now, 0.09);
        this.spinVoice.ticker.frequency.setTargetAtTime(profile.spin.tickRate * (0.5 + remaining * 0.6), now, 0.12);
      }
    }
    // A licensed reel-stop replaces the mechanism recipes; the loop wind-down
    // above and the penultimate tension riser below still apply.
    if (this.playSlot("reel_stop", { pan, volume: isFinal ? 1.25 : 1 })) {
      if (reelIndex === 4 && !isFinal) {
        this.riser(0.5, { volume: 0.024, from: profile.spin.windFreq * 0.8, to: profile.spin.windFreq * 2.4, bus: "spin", wet: profile.wet });
      }
      return;
    }
    // One of four mechanism characters, weighted-random per landing.
    const mechanism = pickFrom(["wood", "metal", "clunk", "latch"]);
    const loud = isFinal ? 1.3 : 1;
    if (mechanism === "wood") {
      this.noise(0.02, { volume: 0.026 * loud, pan, attack: 0.001, filterType: "bandpass", frequency: varyFreq(2800, 40), frequencyEnd: 1400, wetShort: 0.16 });
      this.thump(varyFreq(stop.thumpFreq, 24), { volume: 0.04 * loud, pan, duration: 0.14 });
    } else if (mechanism === "metal") {
      this.noise(0.016, { volume: 0.024 * loud, pan, attack: 0.001, filterType: "highpass", frequency: varyFreq(4200, 40), frequencyEnd: 2600, wetShort: 0.2 });
      this.tone(varyFreq(stop.thumpFreq * 2.2, 30), 0.07, { volume: 0.02 * loud, pan, attack: 0.002, frequencyEnd: stop.thumpFreq * 1.4 });
      this.thump(varyFreq(stop.thumpFreq * 0.9, 20), { volume: 0.034 * loud, pan, duration: 0.13 });
    } else if (mechanism === "clunk") {
      this.thump(varyFreq(stop.thumpFreq * 0.75, 20), { volume: 0.05 * loud, pan, duration: 0.18 });
      this.noise(0.024, { volume: 0.018 * loud, pan, attack: 0.001, filterType: "bandpass", frequency: varyFreq(1900, 40), frequencyEnd: 950, wetShort: 0.14 });
    } else {
      this.noise(0.012, { volume: 0.022 * loud, pan, attack: 0.001, filterType: "highpass", frequency: varyFreq(3400, 40), frequencyEnd: 5200 });
      this.noise(0.02, { volume: 0.02 * loud, pan, delay: 0.035, attack: 0.001, filterType: "bandpass", frequency: varyFreq(2400, 40), frequencyEnd: 1300, wetShort: 0.18 });
      this.thump(varyFreq(stop.thumpFreq, 24), { volume: 0.032 * loud, pan, delay: 0.035, duration: 0.12 });
    }
    // Musical resonance ring keeps stops in the atmosphere's key.
    const ringFreq = varyFreq(stop.toneFreq * (1 + reelIndex * 0.06), 12);
    this.tone(ringFreq, isFinal ? 0.2 : 0.12, { volume: isFinal ? 0.045 : 0.03, pan, wetShort: 0.2, wet: profile.wet * 0.6, frequencyEnd: ringFreq * 1.12, filter: 9000, filterEnd: 6800 });
    // Tiny sparkle.
    if (stop.sparkle > 0 && chance(0.8)) {
      this.sparkleBurst({ strength: stop.sparkle * (isFinal ? 0.6 : 0.3), count: isFinal ? 4 : 2, delay: 0.015 });
    }
    // Penultimate reel: build tension into the final landing.
    if (reelIndex === 4 && !isFinal) {
      this.riser(0.5, { volume: 0.024, from: profile.spin.windFreq * 0.8, to: profile.spin.windFreq * 2.4, bus: "spin", wet: profile.wet });
    }
    if (isFinal) {
      this.subImpact({ volume: 0.05, frequency: 44 });
      this.tone(this.scaleFreq(0, 2), 0.36, { delay: 0.04, volume: 0.042, wet: profile.wet + 0.1, pan: 0, type: "sine" });
      this.sparkleBurst({ delay: 0.05, strength: 0.5, count: 4 });
    }
  }

  anticipation() {
    const profile = this.profile();
    this.bumpEnergy(0.72);
    this.updateSpin(0, true);
    if (this.playSlot("anticipation")) return;
    // Heartbeat sub pulses under a long shimmer riser.
    [0, 0.38, 0.72].forEach((delay) => {
      this.tone(50, 0.2, { type: "sine", delay, volume: 0.032, attack: 0.01, frequencyEnd: 40 });
    });
    this.riser(0.9, { volume: 0.045, from: profile.spin.windFreq * 0.7, to: profile.spin.windFreq * 2.6, wet: profile.wet });
    for (let index = 0; index < 8; index += 1) {
      const frequency = varyFreq(this.scaleFreq(index, 1), 10);
      this.tone(frequency, 0.15, {
        delay: index * rand(0.07, 0.1), frequencyEnd: frequency * 1.1,
        volume: 0.026 + index * 0.002, pan: index / 3.5 - 1, wet: profile.wet + 0.08, filter: 9800, filterEnd: 7200
      });
    }
    this.sparkleBurst({ delay: 0.55, strength: 0.8, count: 6 });
  }

  // ─── Wins & rewards ───────────────────────────────────────────────────────

  lineWin(lineIndex, amountRatio = 1) {
    const profile = this.profile();
    this.bumpEnergy(clamp(0.4 + amountRatio * 0.04, 0, 0.85));
    if (this.playSlot("line_win", { pan: lineIndex % 2 ? 0.3 : -0.3 })) return;
    const lift = Math.floor(clamp(Math.log2(Math.max(1, amountRatio)), 0, 3));
    const degrees = pickFrom([[0, 2], [0, 3], [2, 4], [1, 3]]);
    degrees.forEach((degree, index) => {
      const frequency = varyFreq(this.scaleFreq(degree + lift, 1), 10);
      if (this.config().mood === "playful") {
        this.pluck(frequency, 0.24, { volume: 0.045, delay: index * rand(0.05, 0.08), pan: lineIndex % 2 ? 0.35 : -0.35, wet: profile.wet });
      } else if (this.config().mood === "arcane") {
        this.bell(frequency, 0.7, { volume: 0.032, delay: index * rand(0.05, 0.09), pan: lineIndex % 2 ? 0.3 : -0.3, wet: profile.wet, echo: profile.echo });
      } else {
        this.tone(frequency, 0.24, { volume: 0.045, delay: index * 0.055, pan: (lineIndex % 2 ? 0.35 : -0.35) * (index ? -0.6 : 1), wet: profile.wet });
      }
    });
    if (amountRatio >= 4 || chance(0.4)) {
      this.sparkleBurst({ delay: 0.04, strength: clamp(0.4 + amountRatio * 0.04, 0.3, 1.1), count: 4 + lift });
    }
  }

  payoutTick(progress, tierId = "nice") {
    const profile = this.profile();
    const tierLift = { nice: 0, big: 1, mega: 2, epic: 3 }[tierId] ?? 0;
    const degree = Math.floor(progress * profile.scale.length * 1.6) + tierLift;
    this.tone(varyFreq(this.scaleFreq(degree, 1), 8), 0.06, {
      volume: 0.024 + progress * 0.016, wet: profile.wet * 0.7, pan: Math.sin(progress * 18) * 0.3
    });
    if (chance(0.35)) {
      this.tone(varyFreq(this.scaleFreq(degree, 2), 10), 0.05, {
        type: "sine", volume: 0.012 + progress * 0.012, wet: 0.12, pan: -Math.sin(progress * 18) * 0.45, filter: 11800, filterEnd: 8400
      });
    }
  }

  // The count-up's closing sting, scaled by how the win compares to the bet
  // (reference: win_end_bet_low / high / over). Below-bet returns resolve
  // softly; profits resolve brightly; 10×+ gets a triumphant close.
  winCountEnd(ratio = 1) {
    const profile = this.profile();
    // With variants, the ladder maps below-bet / profit / 10×+ to files 1/2/3.
    if (this.playSlot("win_count_end", { variant: ratio < 1 ? 0 : ratio < 10 ? 1 : 2 })) return;
    if (ratio < 1) {
      this.tone(varyFreq(this.scaleFreq(2, 1), 8), 0.2, { volume: 0.028, wet: profile.wet * 0.7 });
      this.tone(varyFreq(this.scaleFreq(0, 1), 8), 0.28, { delay: 0.09, volume: 0.024, wet: profile.wet * 0.7 });
      return;
    }
    if (ratio < 10) {
      [0, 4].forEach((degree, index) => {
        this.tone(varyFreq(this.scaleFreq(degree, 1), 8), 0.3, { delay: index * 0.07, volume: 0.04, wet: profile.wet, pan: index ? 0.3 : -0.3 });
      });
      this.tone(varyFreq(this.scaleFreq(0, 2), 8), 0.4, { delay: 0.14, volume: 0.034, wet: profile.wet + 0.08 });
      this.sparkleBurst({ strength: 0.5, count: 4, delay: 0.12 });
      return;
    }
    this.subImpact({ volume: 0.05 });
    [0, 2, 4].forEach((degree, index) => {
      this.tone(varyFreq(this.scaleFreq(degree, 1), 8), 0.5, { delay: index * 0.08, volume: 0.05, wet: profile.wet + 0.1, pan: index / 1.5 - 0.65 });
    });
    this.tone(varyFreq(this.scaleFreq(0, 2), 6), 0.7, { delay: 0.24, volume: 0.042, wet: profile.wet + 0.12 });
    this.sparkleBurst({ strength: 0.9, count: 8, delay: 0.2 });
  }

  // Rising fanfare runs, scaled per tier. The epic tier unfolds as a full
  // jackpot progression: impact → rise → chords → choir pad → celebration.
  winTier(tierId) {
    const profile = this.profile();
    const strength = { big: 1, mega: 2, epic: 3 }[tierId] ?? 0;
    if (!strength) return;
    this.bumpEnergy(0.6 + strength * 0.13);
    // A licensed win-tier sting replaces the whole fanfare (and the jackpot
    // sequence for the epic tier), ducking the music underneath it.
    const tierVoice = this.playSlot(`wintier_${tierId}`);
    if (tierVoice) {
      if (this.context && this.graph) {
        const duration = tierVoice.source.buffer?.duration ?? 3;
        const music = this.graph.buses.music;
        music.gain.setTargetAtTime(0.16, this.context.currentTime, 0.08);
        music.gain.setTargetAtTime(0.72, this.context.currentTime + Math.min(duration, 8), 0.4);
      }
      return;
    }
    if (strength >= 3) {
      this.jackpotSequence();
      return;
    }
    this.subImpact({ volume: 0.05 + strength * 0.02 });
    this.riser(0.5, { volume: 0.04, from: 500, to: 3200, wet: profile.wet });
    for (let run = 0; run < strength + 1; run += 1) {
      [0, 2, 4, 5].forEach((degree, index) => {
        const frequency = varyFreq(this.scaleFreq(degree + run, 1), 8);
        this.tone(frequency, 0.45, {
          delay: 0.15 + run * rand(0.26, 0.32) + index * rand(0.05, 0.07),
          volume: 0.055, wet: profile.wet + 0.1, pan: index / 1.5 - 1
        });
      });
    }
    this.sparkleBurst({ strength: 0.9 + strength * 0.2, count: 9 + strength * 3, delay: 0.2 });
    this.coinRain(0.7 + strength * 0.25, 0.9 + strength * 0.3);
    this.noise(0.7 + strength * 0.2, { volume: 0.02 + strength * 0.008, wet: 0.2, filterType: "highpass", frequency: 3600, frequencyEnd: 11000, delay: 0.15 });
    // Sustained celebratory tail — reference win-tier stings run 5+ seconds,
    // so the fanfare resolves into a held chord that decays gracefully.
    const tailStart = 0.5 + strength * 0.32;
    [0, 4, 7].forEach((semitone, index) => {
      this.tone(profile.root * 2 ** ((semitone + 12) / 12), 1.6 + strength * 0.5, {
        type: profile.music.padWave, delay: tailStart, volume: 0.02 + strength * 0.005,
        attack: 0.3, wet: profile.wet + 0.14, pan: (index - 1) * 0.5,
        filter: profile.music.filter, filterEnd: profile.music.filter * 0.45
      });
    });
    this.sparkleBurst({ strength: 0.6, count: 5, delay: tailStart + 0.8 });
  }

  // Jackpot audio unfolds over several seconds with dynamic pacing rather than
  // a wall of noise: impact → music rise → chord stacks → choir → sparkles.
  jackpotSequence() {
    const profile = this.profile();
    this.bumpEnergy(1);
    if (this.context && this.graph) {
      // A breath of near-silence before the impact makes it land harder.
      const music = this.graph.buses.music;
      music.gain.setTargetAtTime(0.1, this.context.currentTime, 0.05);
      music.gain.setTargetAtTime(0.72, this.context.currentTime + 1.4, 0.5);
    }
    this.subImpact({ volume: 0.095, delay: 0.12 });
    this.thump(90, { volume: 0.06, delay: 0.12, duration: 0.3 });
    this.riser(1.1, { volume: 0.05, delay: 0.3, from: 300, to: 4200, wet: profile.wet + 0.1 });
    // Three rising chord stacks.
    [0, 1, 2].forEach((stack) => {
      [0, 2, 4].forEach((degree, index) => {
        const frequency = varyFreq(this.scaleFreq(degree + stack * 2, 1), 6);
        this.tone(frequency, 0.7, {
          delay: 0.7 + stack * 0.55 + index * 0.05,
          volume: 0.05 + stack * 0.008, wet: profile.wet + 0.14, pan: index - 1
        });
      });
    });
    // Choir-like detuned pad swell.
    [0, 4, 7, 12].forEach((semitone, index) => {
      const frequency = profile.root * 2 ** ((semitone + 12) / 12);
      [-7, 7].forEach((cents) => {
        this.tone(frequency, 2.6, {
          type: "sawtooth", detune: cents, delay: 1.6, volume: 0.012,
          attack: 0.8, wet: 0.4, pan: (index - 1.5) * 0.4, filter: 1900, filterEnd: 1100
        });
      });
    });
    // Celebration sparkle rain and cascading coins, spaced so it breathes.
    [2.2, 2.9, 3.6].forEach((delay, index) => {
      this.sparkleBurst({ delay, strength: 1.1 - index * 0.2, count: 8 - index * 2 });
    });
    [1.9, 2.8].forEach((delay, index) => {
      window.setTimeout(() => this.coinRain(1.2 - index * 0.3, 1), delay * 1000);
    });
    this.characterMoment("jackpot");
  }

  bigWin(tierId) {
    // Give the celebration room: duck the music under the fanfare, then let
    // it swell back in as the sequence resolves.
    if (this.context && this.graph) {
      const music = this.graph.buses.music;
      const holdSeconds = { big: 2, mega: 2.8, epic: 4 }[tierId] ?? 2;
      music.gain.setTargetAtTime(0.22, this.context.currentTime, 0.08);
      music.gain.setTargetAtTime(0.72, this.context.currentTime + holdSeconds, 0.5);
    }
    this.winTier(tierId);
    this.characterMoment(tierId === "epic" ? "jackpot" : "bigWin");
  }

  restoreMusicLevel() {
    if (!this.context || !this.graph) return;
    this.graph.buses.music.gain.setTargetAtTime(0.72, this.context.currentTime, 0.12);
  }

  stopBigWin() {
    this.restoreMusicLevel();
  }

  winVoice() {
    const now = Date.now();
    if (now - this.lastWinVoiceAt < 2800) return;
    this.lastWinVoiceAt = now;
    this.bumpEnergy(0.6);
    const profile = this.profile();
    this.sparkleBurst({ strength: 1, count: 8 });
    [0, 2, 4].forEach((degree, index) => {
      this.tone(varyFreq(this.scaleFreq(degree, 2), 8), 0.44, {
        delay: index * rand(0.05, 0.08), volume: 0.042, wet: profile.wet, pan: index / 1.5 - 1, filter: 9200, filterEnd: 6800
      });
    });
    this.characterMoment("bigWin");
  }

  // Meter progress as an escalating "update sweep" (reference:
  // update_sweep_1..6): the fuller the feature meter, the higher, brighter and
  // more dramatic the sweep — collecting near the threshold feels imminent.
  collect(count = 1, progress = 0) {
    const profile = this.profile();
    const charge = clamp(progress, 0, 1);
    this.bumpEnergy(0.5 + charge * 0.3);
    // Rising sweep whose reach climbs with meter progress.
    this.riser(0.4 + charge * 0.3, {
      volume: 0.03 + charge * 0.02,
      from: 500 + charge * 500,
      to: 2200 + charge * 3200,
      wet: profile.wet
    });
    // Stepped pickup notes that start higher up the scale as the meter fills.
    const baseDegree = 2 + Math.floor(charge * profile.scale.length);
    for (let index = 0; index < Math.min(count, 5); index += 1) {
      const frequency = varyFreq(this.scaleFreq(baseDegree + index, 1), 10);
      if (this.config().mood === "playful") {
        this.pluck(frequency, 0.24, { volume: 0.046, delay: 0.08 + index * rand(0.06, 0.09), pan: index / 2 - 1, wet: profile.wet });
      } else {
        this.tone(frequency, 0.26, { volume: 0.046, delay: 0.08 + index * rand(0.06, 0.09), wet: profile.wet + 0.08, pan: index / 2 - 1 });
      }
    }
    // Near the threshold, add urgency: a soft sub pulse and a bright shimmer.
    if (charge > 0.7) {
      this.subImpact({ volume: 0.03 + charge * 0.02, delay: 0.05 });
      this.sparkleBurst({ delay: 0.16, strength: 0.6 + charge * 0.4, count: 5 + count });
    } else if (count >= 2) {
      this.sparkleBurst({ delay: 0.14, strength: 0.5 + count * 0.08, count: 4 + count });
    }
  }

  // Escalating scatter-landing stings (reference: bonus_landed_1..4). Each
  // additional trigger symbol landing in the same spin hits harder — the third
  // is the bonus trigger, so it detonates.
  scatterLand(countSoFar = 1) {
    const profile = this.profile();
    const step = clamp(countSoFar, 1, 4);
    this.bumpEnergy(0.5 + step * 0.15);
    if (this.playSlot("scatter_land", { variant: step - 1 })) {
      if (step >= 3 && this.context && this.graph) {
        const music = this.graph.buses.music;
        music.gain.setTargetAtTime(0.2, this.context.currentTime, 0.05);
        music.gain.setTargetAtTime(0.72, this.context.currentTime + 0.7, 0.3);
      }
      return;
    }
    const baseFreq = this.scaleFreq(step * 2, 1);
    // Dramatic hit that grows with each landed scatter.
    this.thump(varyFreq(110 - step * 10, 18), { volume: 0.045 + step * 0.012, duration: 0.16 + step * 0.05 });
    [0, 7].concat(step >= 2 ? [12] : []).concat(step >= 3 ? [16] : []).forEach((semitone, layer) => {
      this.tone(varyFreq(baseFreq * 2 ** (semitone / 12), 8), 0.35 + step * 0.1, {
        volume: (0.05 + step * 0.008) * (layer === 0 ? 1 : 0.55),
        delay: layer * 0.045,
        wet: profile.wet + 0.1 + step * 0.02,
        pan: (layer - 1) * 0.4
      });
    });
    this.sparkleBurst({ strength: 0.5 + step * 0.2, count: 3 + step * 2, delay: 0.06 });
    if (step >= 2) {
      this.riser(0.5, { volume: 0.03 + step * 0.008, from: 400 + step * 150, to: 2800 + step * 500, wet: profile.wet });
    }
    if (step >= 3) {
      // The trigger moment: sub detonation and a short music duck for impact.
      this.subImpact({ volume: 0.07, delay: 0.05 });
      if (this.context && this.graph) {
        const music = this.graph.buses.music;
        music.gain.setTargetAtTime(0.2, this.context.currentTime, 0.05);
        music.gain.setTargetAtTime(0.72, this.context.currentTime + 0.7, 0.3);
      }
    }
  }

  // Coin-rain celebration texture (reference: coin_spam_1..4): a cluster of
  // small metallic pings scattered across the stereo field.
  coinRain(strength = 1, duration = 0.8) {
    if (this.playSlot("coin_rain", { volume: clamp(strength, 0.4, 1.3) })) return;
    const pings = Math.floor(6 + strength * 10);
    for (let index = 0; index < pings; index += 1) {
      const when = rand(0, duration);
      const base = rand(2200, 5200);
      this.tone(base, rand(0.03, 0.06), {
        type: "sine", volume: rand(0.008, 0.02) * strength, delay: when,
        frequencyEnd: base * rand(0.82, 0.94), pan: rand(-0.8, 0.8), wetShort: 0.2, attack: 0.001
      });
      if (chance(0.5)) {
        this.noise(rand(0.006, 0.012), {
          volume: rand(0.006, 0.014) * strength, delay: when, attack: 0.001,
          filterType: "highpass", frequency: rand(5200, 7800), frequencyEnd: rand(8200, 10500), pan: rand(-0.7, 0.7)
        });
      }
    }
  }

  // Game-load intro sting (reference: intro / music_intro): a short signature
  // bloom when the player's world opens, with a chance of a companion welcome.
  gameIntro() {
    const profile = this.profile();
    this.bumpEnergy(0.7);
    this.subImpact({ volume: 0.05 });
    [0, 2, 4].forEach((degree, index) => {
      this.tone(varyFreq(this.scaleFreq(degree, 1), 6), 0.5, {
        delay: 0.08 + index * 0.09, volume: 0.048, wet: profile.wet + 0.1, pan: index / 1.5 - 0.65
      });
    });
    this.tone(this.scaleFreq(0, 2), 0.8, { delay: 0.34, volume: 0.036, wet: profile.wet + 0.14, type: "sine" });
    this.sparkleBurst({ delay: 0.3, strength: 0.8, count: 7 });
    this.characterMoment("welcome");
  }

  nearMiss() {
    const profile = this.profile();
    [4, 2, 0].forEach((degree, index) => {
      const frequency = this.scaleFreq(degree, 1);
      this.tone(frequency, 0.18, { delay: index * 0.13, volume: 0.04, wet: profile.wet, frequencyEnd: frequency * 0.94 });
    });
  }

  // ─── Bonus & feature audio ────────────────────────────────────────────────
  // Bonus entry sequence: a breath of silence → energy gathering → magic swell
  // → deep impact → sparkle bloom, then the elevated bonus soundscape.

  bonusStart() {
    const profile = this.profile();
    this.bumpEnergy(1);
    if (this.context && this.graph) {
      const music = this.graph.buses.music;
      music.gain.setTargetAtTime(0.06, this.context.currentTime, 0.06);
      music.gain.setTargetAtTime(0.72, this.context.currentTime + 1.5, 0.4);
    }
    if (this.playSlot("bonus_trigger")) {
      this.characterMoment("bonus");
      return;
    }
    // Energy gathering.
    this.riser(0.85, { volume: 0.05, delay: 0.16, from: 240, to: 3400, wet: profile.wet + 0.1 });
    [0, 1, 2, 3, 4].forEach((degree, index) => {
      this.tone(varyFreq(this.scaleFreq(degree, 1), 8), 0.3, {
        delay: 0.2 + index * 0.11, volume: 0.03 + index * 0.005, pan: index / 2 - 1, wet: profile.wet + 0.1, attack: 0.03
      });
    });
    // Magic swell into deep impact.
    this.tone(this.scaleFreq(0, 0), 0.9, { type: "sine", delay: 0.5, volume: 0.04, attack: 0.4, frequencyEnd: this.scaleFreq(0, 1), wet: 0.3 });
    this.subImpact({ volume: 0.09, delay: 1.05 });
    this.thump(110, { volume: 0.055, delay: 1.05, duration: 0.26 });
    // Transition bloom into the new ambience.
    this.sparkleBurst({ delay: 1.15, strength: 1.2, count: 10 });
    this.characterMoment("bonus");
  }

  bonusSceneStart() {
    this.bonusMode = true;
    this.bumpEnergy(1);
    // With licensed music loops, entering the bonus swaps to the bonus track.
    if (this.musicSampleVoice && this.slotBuffers("music_bonus")) this.restartMusic();
  }

  bonusSceneEnd() {
    this.bonusMode = false;
    this.energy = Math.min(this.energy, 0.5);
    if (this.musicSampleVoice) this.restartMusic();
  }

  // Multiplier ladder: each reveal escalates like the reference multi_1..10
  // family — later and larger steps get louder, longer, and thicker, not just
  // higher-pitched.
  bonusReveal(index, multiplier) {
    const profile = this.profile();
    const lift = Math.floor(clamp(Math.log2(Math.max(1, multiplier)) * 1.4, 0, 5));
    const step = clamp(index + lift, 0, 9);
    const grow = step / 9; // 0 → 1 across the ladder
    this.bumpEnergy(0.7 + grow * 0.3);
    if (this.playSlot("bonus_reveal", { variant: step, pan: index % 2 ? 0.3 : -0.3 })) return;
    this.noise(0.16, { volume: 0.04, filterType: "bandpass", frequency: 760, frequencyEnd: 2200, pan: index % 2 ? 0.45 : -0.45, wet: profile.wet });
    // Stacked chord tones — the stack deepens as the ladder climbs.
    const stack = [0, 4, 7, 12].slice(0, 2 + Math.floor(grow * 2.2));
    const baseFreq = this.scaleFreq(2 + step, 1);
    stack.forEach((semitone, layer) => {
      const frequency = varyFreq(baseFreq * 2 ** (semitone / 12), 8);
      const duration = (0.4 + grow * 0.7) * (layer === 0 ? 1 : 0.7);
      if (this.config().mood === "arcane") {
        this.bell(frequency, duration + 0.4, { volume: (0.05 + grow * 0.02) * (layer === 0 ? 1 : 0.5), delay: layer * 0.04, pan: index % 2 ? 0.35 : -0.35, wet: profile.wet + 0.1, echo: profile.echo });
      } else {
        this.tone(frequency, duration, { volume: (0.058 + grow * 0.022) * (layer === 0 ? 1 : 0.5), delay: layer * 0.04, wet: profile.wet + 0.1, pan: index % 2 ? 0.35 : -0.35 });
      }
    });
    this.thump(varyFreq(140 - grow * 30, 20), { volume: 0.04 + grow * 0.025, pan: index % 2 ? 0.3 : -0.3 });
    if (multiplier >= 5) this.subImpact({ volume: 0.05 + grow * 0.03, delay: 0.03 });
    this.sparkleBurst({ strength: clamp(0.6 + grow * 0.7, 0.5, 1.4), count: 5 + step, delay: 0.05 });
  }

  gameChange() {
    const profile = this.profile();
    if (this.context && this.graph) {
      // Crossfade: dip the whole music bus, restart the scene, fade back in.
      this.graph.buses.music.gain.setTargetAtTime(0.0001, this.context.currentTime, 0.18);
    }
    window.setTimeout(() => this.restartMusic(), 420);
    [0, 2, 4].forEach((degree, index) => {
      this.tone(varyFreq(this.scaleFreq(degree, 1), 6), 0.26, { delay: index * 0.055, volume: 0.04, wet: profile.wet + 0.08 });
    });
  }

  // ─── Character vocalizations ──────────────────────────────────────────────
  // Rare synthesized reactions layered into reward audio (never interrupting
  // it). Roughly a 5–10% roll after significant events, with a cooldown, so
  // hearing your companion stays special. Jackpots roll much higher.

  characterMoment(eventKind = "bigWin") {
    if (!this.enabled) return;
    // "welcome" greets the player as their world opens (reference: the
    // per-character welcome vox most Hacksaw games play on load) — likelier
    // than reward reactions and exempt from the cooldown since it leads.
    const probability = { bigWin: 0.07, bonus: 0.09, jackpot: 0.45, welcome: 0.6 }[eventKind] ?? 0.06;
    const now = Date.now();
    if (now - this.lastVoiceMomentAt < 18000 && eventKind !== "jackpot" && eventKind !== "welcome") return;
    if (!chance(probability)) return;
    this.lastVoiceMomentAt = now;
    // Let the voice sit clearly on top: dip gameplay SFX slightly, briefly.
    if (this.context && this.graph) {
      const sfx = this.graph.buses.sfx;
      sfx.gain.setTargetAtTime(0.7, this.context.currentTime, 0.06);
      sfx.gain.setTargetAtTime(1, this.context.currentTime + 1.4, 0.3);
    }
    const companion = this.config().companion;
    const delay = 0.35; // arrive just after the reward impact, not on top of it
    if (companion === "valkyrie") {
      // Heroic battle cry: stacked fifths rising, plus a wing-flutter tail.
      [0, 7, 12].forEach((semitone, index) => {
        this.tone(392 * 2 ** (semitone / 12), 0.5, { type: "sawtooth", delay: delay + index * 0.09, volume: 0.024, attack: 0.05, frequencyEnd: 392 * 2 ** ((semitone + 2) / 12), filter: 2600, filterEnd: 1600, wet: 0.3, bus: "voice" });
      });
      for (let flap = 0; flap < 4; flap += 1) {
        this.noise(0.07, { delay: delay + 0.5 + flap * 0.11, volume: 0.016, bus: "voice", filterType: "bandpass", frequency: 900, frequencyEnd: 500, pan: flap % 2 ? 0.4 : -0.4 });
      }
    } else if (companion === "dragon") {
      // Deep roar with growl modulation, then a fire-breath wash.
      this.tone(88, 1.1, { type: "sawtooth", delay, volume: 0.038, attack: 0.09, frequencyEnd: 60, filter: 700, filterEnd: 280, wet: 0.2, bus: "voice" });
      this.tone(66, 1.1, { type: "square", delay: delay + 0.04, volume: 0.02, attack: 0.1, frequencyEnd: 46, filter: 420, filterEnd: 200, bus: "voice" });
      this.noise(0.9, { delay: delay + 0.55, volume: 0.02, bus: "voice", filterType: "bandpass", frequency: 1400, frequencyEnd: 2600, attack: 0.3, wet: 0.2 });
    } else if (companion === "direwolf") {
      // Howl: long sine glide up, hold with vibrato, fall away.
      this.tone(392, 1.5, { type: "sine", delay, volume: 0.03, attack: 0.28, frequencyEnd: 585, wet: 0.4, bus: "voice" });
      this.tone(587, 0.8, { type: "sine", delay: delay + 1.1, volume: 0.022, attack: 0.1, frequencyEnd: 392, wet: 0.4, bus: "voice" });
    } else if (companion === "kraken") {
      // Deep ocean call with detuned beating, plus a tentacle splash.
      this.tone(72, 1.6, { type: "sine", delay, volume: 0.036, attack: 0.4, frequencyEnd: 58, wet: 0.35, bus: "voice" });
      this.tone(74.5, 1.6, { type: "sine", delay, volume: 0.026, attack: 0.4, frequencyEnd: 60, wet: 0.35, bus: "voice" });
      this.noise(0.35, { delay: delay + 1.1, volume: 0.022, bus: "voice", filterType: "lowpass", frequency: 900, frequencyEnd: 240, wet: 0.2 });
    } else if (companion === "titan") {
      // Heavy stone footsteps and earth rumble.
      [0, 0.5].forEach((stepDelay) => {
        this.thump(64, { volume: 0.055, delay: delay + stepDelay, duration: 0.3, bus: "voice" });
        this.noise(0.2, { delay: delay + stepDelay, volume: 0.02, bus: "voice", filterType: "lowpass", frequency: 340, frequencyEnd: 90, wetShort: 0.25 });
      });
      this.noise(1.1, { delay: delay + 0.9, volume: 0.014, bus: "voice", filterType: "lowpass", frequency: 130, frequencyEnd: 50, attack: 0.4 });
    } else if (companion === "tiger") {
      // Powerful roar burst and a fast slash.
      this.tone(180, 0.7, { type: "sawtooth", delay, volume: 0.032, attack: 0.05, frequencyEnd: 110, filter: 1300, filterEnd: 500, wet: 0.18, bus: "voice" });
      this.noise(0.55, { delay: delay + 0.02, volume: 0.02, bus: "voice", filterType: "bandpass", frequency: 800, frequencyEnd: 350, attack: 0.06 });
      this.noise(0.12, { delay: delay + 0.75, volume: 0.024, bus: "voice", filterType: "highpass", frequency: 2400, frequencyEnd: 7600, pan: 0.5 });
    } else if (companion === "gorilla") {
      // Rapid chest beats, then a low grunt.
      for (let hit = 0; hit < 5; hit += 1) {
        this.thump(110, { volume: 0.04, delay: delay + hit * 0.13, duration: 0.1, pan: hit % 2 ? 0.3 : -0.3, bus: "voice" });
      }
      this.tone(95, 0.32, { type: "sawtooth", delay: delay + 0.75, volume: 0.026, frequencyEnd: 66, filter: 500, filterEnd: 220, bus: "voice" });
    } else if (companion === "sorceress") {
      // Spell cast: rising arcane arp, a whisper of air, a magic pulse.
      [0, 2, 4, 6].forEach((degree, index) => {
        this.bell(varyFreq(880 * 2 ** (degree / 12), 8), 0.5, { volume: 0.02, delay: delay + index * 0.09, pan: (index - 1.5) * 0.4, wet: 0.45, echo: 0.3, bus: "voice" });
      });
      this.noise(0.7, { delay, volume: 0.012, bus: "voice", filterType: "highpass", frequency: 3600, frequencyEnd: 8600, attack: 0.3, wet: 0.3 });
      this.tone(220, 0.5, { type: "sine", delay: delay + 0.45, volume: 0.024, frequencyEnd: 440, wet: 0.4, bus: "voice" });
    }
  }

  // ─── UI audio ─────────────────────────────────────────────────────────────
  // Every interaction gets subtle premium feedback with its own contour, all
  // drawn from the atmosphere's scale so UI never clashes with the music.

  uiHover() {
    const now = performance.now();
    if (now - this.lastUiHoverAt < 90) return;
    this.lastUiHoverAt = now;
    const ui = this.profile().ui;
    this.tone(varyFreq(ui.base * 1.5, 30), 0.045, { type: ui.wave, volume: 0.008, wet: 0.1, bus: "ui", pan: rand(-0.2, 0.2) });
  }

  uiSelect(variant = 0) {
    if (this.playSlot("ui_click")) return;
    const ui = this.profile().ui;
    const frequency = varyFreq(ui.base * 2 ** (this.profile().scale[variant % this.profile().scale.length] / 12), 10);
    this.tone(frequency, 0.09, { type: ui.wave, volume: 0.028, wet: 0.14, bus: "ui" });
    this.noise(0.03, { volume: 0.008, bus: "ui", filterType: "highpass", frequency: 5200, frequencyEnd: 8600 });
  }

  uiConfirm() {
    if (this.playSlot("ui_click", { rate: rand(1.02, 1.08) })) return;
    const ui = this.profile().ui;
    this.tone(varyFreq(ui.base, 8), 0.1, { type: ui.wave, volume: 0.026, wet: 0.14, bus: "ui" });
    this.tone(varyFreq(ui.base * 1.5, 8), 0.16, { type: ui.wave, delay: 0.06, volume: 0.03, wet: 0.2, bus: "ui" });
  }

  uiBack() {
    const ui = this.profile().ui;
    this.tone(varyFreq(ui.base * 0.75, 8), 0.09, { type: ui.wave, volume: 0.022, wet: 0.1, bus: "ui" });
    this.tone(varyFreq(ui.base * 0.5, 8), 0.12, { type: ui.wave, delay: 0.05, volume: 0.02, wet: 0.12, bus: "ui" });
  }

  uiOpen() {
    const ui = this.profile().ui;
    [1, 1.25, 2].forEach((ratio, index) => {
      this.tone(varyFreq(ui.base * ratio, 8), 0.12, { type: ui.wave, delay: index * 0.045, volume: 0.022, wet: 0.18, bus: "ui", pan: (index - 1) * 0.3 });
    });
  }

  uiDeny() {
    const ui = this.profile().ui;
    this.tone(ui.base * 0.5, 0.16, { type: "square", volume: 0.02, bus: "ui", frequencyEnd: ui.base * 0.42, filter: 1400, filterEnd: 700 });
  }

  uiToggle(on = true) {
    const ui = this.profile().ui;
    this.tone(varyFreq(ui.base * (on ? 1.5 : 0.75), 10), 0.08, { type: ui.wave, volume: 0.024, wet: 0.12, bus: "ui" });
  }

  uiSurprise() {
    const profile = this.profile();
    [0, 2, 4, 6, 8].forEach((degree, index) => {
      this.tone(varyFreq(this.scaleFreq(degree, 1), 10), 0.1, {
        delay: index * 0.05, volume: 0.024, wet: profile.wet, bus: "ui", pan: Math.sin(index * 2) * 0.5
      });
    });
    this.sparkleBurst({ delay: 0.2, strength: 0.6, count: 5, bus: "ui" });
  }

  interfaceOn() {
    const profile = this.profile();
    this.tone(this.scaleFreq(0, 1), 0.14, { volume: 0.03, wet: 0.2, bus: "ui" });
    this.tone(this.scaleFreq(2, 1), 0.2, { delay: 0.07, volume: 0.032, wet: 0.26, bus: "ui" });
    this.tone(this.scaleFreq(0, 2), 0.26, { delay: 0.14, volume: 0.026, wet: profile.wet + 0.1, bus: "ui" });
  }
}
