// AISlots premium audio engine.
//
// Every sound is synthesized live — there are no sample files. Each gameplay
// moment (spin, reel stop, win, bonus, jackpot) mixes several layered voices —
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
  // "I am embarking on an epic legendary adventure." — orchestral warmth,
  // brass-like saw stacks, cinematic drum thumps, deep impacts, heroic rises.
  epic: Object.freeze({
    label: "Epic",
    wave: "triangle",
    root: 146.83, // D3
    scale: Object.freeze([0, 2, 3, 5, 7, 10]), // D natural minor hexatonic — heroic
    sparkleBase: 1174.66,
    wet: 0.24,
    echo: 0.06,
    spin: Object.freeze({
      motorFreq: 98, motorWave: "triangle", motorLevel: 0.02,
      windFreq: 1350, windType: "bandpass", windLevel: 0.034,
      subFreq: 55, subLevel: 0.02, shimmerLevel: 0.011
    }),
    stop: Object.freeze({ thumpFreq: 170, toneFreq: 392, sparkle: 0.8, ringRatio: 1.5 }),
    ui: Object.freeze({ base: 523.25, wave: "triangle" }),
    music: Object.freeze({
      bpm: 96,
      padWave: "sawtooth", bassWave: "triangle", leadWave: "triangle",
      // Dm — Bb — F — C: a classic heroic minor progression.
      chords: Object.freeze([
        Object.freeze([0, 3, 7, 12]),
        Object.freeze([-4, 0, 3, 8]),
        Object.freeze([3, 7, 10, 15]),
        Object.freeze([-2, 2, 5, 10])
      ]),
      bass: Object.freeze([0, null, null, 0, null, null, 7, null, 0, null, null, 0, 5, null, 7, null]),
      lead: Object.freeze([0, null, 2, null, 4, null, 5, 4, null, 2, null, 0, null, 1, null, null]),
      leadChance: 0.8,
      perc: "warDrum",
      level: 0.017,
      filter: 2100,
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
      motorFreq: 110, motorWave: "sine", motorLevel: 0.013,
      windFreq: 900, windType: "lowpass", windLevel: 0.028,
      subFreq: 55, subLevel: 0.013, shimmerLevel: 0.017
    }),
    stop: Object.freeze({ thumpFreq: 210, toneFreq: 660, sparkle: 1, ringRatio: 2 }),
    ui: Object.freeze({ base: 880, wave: "sine" }),
    music: Object.freeze({
      bpm: 78,
      padWave: "triangle", bassWave: "sine", leadWave: "sine",
      // Open, suspended shapes that shimmer instead of resolving hard.
      chords: Object.freeze([
        Object.freeze([0, 7, 11, 16]),
        Object.freeze([2, 9, 14, 18]),
        Object.freeze([-3, 4, 9, 16]),
        Object.freeze([-5, 2, 7, 14])
      ]),
      bass: Object.freeze([0, null, null, null, null, null, null, 7, null, null, 0, null, null, null, null, null]),
      lead: Object.freeze([4, null, null, 6, null, 5, null, null, 3, null, null, 1, null, null, 4, null]),
      leadChance: 0.55,
      perc: "bellTick",
      level: 0.016,
      filter: 3400,
      wet: 0.52
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
      motorFreq: 130, motorWave: "triangle", motorLevel: 0.016,
      windFreq: 1650, windType: "highpass", windLevel: 0.02,
      subFreq: 65, subLevel: 0.012, shimmerLevel: 0.013
    }),
    stop: Object.freeze({ thumpFreq: 240, toneFreq: 523.25, sparkle: 0.9, ringRatio: 1.25 }),
    ui: Object.freeze({ base: 659.25, wave: "triangle" }),
    music: Object.freeze({
      bpm: 112,
      padWave: "triangle", bassWave: "triangle", leadWave: "square",
      // I — vi — IV — V, the bounciest progression there is.
      chords: Object.freeze([
        Object.freeze([0, 4, 7, 12]),
        Object.freeze([-3, 0, 4, 9]),
        Object.freeze([-7, -3, 0, 5]),
        Object.freeze([-5, -1, 2, 7])
      ]),
      bass: Object.freeze([0, null, 12, null, 0, null, 7, null, 0, null, 12, null, 7, null, 5, null]),
      lead: Object.freeze([0, null, 2, 4, null, 4, null, 3, null, 2, null, 1, 2, null, 0, null]),
      leadChance: 0.85,
      perc: "toyPop",
      level: 0.014,
      filter: 2600,
      wet: 0.16
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
      motorFreq: 62, motorWave: "sawtooth", motorLevel: 0.014,
      windFreq: 480, windType: "bandpass", windLevel: 0.04,
      subFreq: 41, subLevel: 0.026, shimmerLevel: 0.006
    }),
    stop: Object.freeze({ thumpFreq: 120, toneFreq: 220, sparkle: 0.45, ringRatio: 1.5 }),
    ui: Object.freeze({ base: 329.63, wave: "triangle" }),
    music: Object.freeze({
      bpm: 70,
      padWave: "sawtooth", bassWave: "sine", leadWave: "triangle",
      // Slow-shifting dark modal shapes over a deep pedal tone.
      chords: Object.freeze([
        Object.freeze([0, 7, 12, 15]),
        Object.freeze([0, 5, 12, 13]),
        Object.freeze([-4, 3, 8, 15]),
        Object.freeze([0, 7, 10, 14])
      ]),
      bass: Object.freeze([0, null, null, null, null, null, null, null, 0, null, null, null, null, null, 0, null]),
      lead: Object.freeze([null, null, 3, null, null, null, 1, null, null, null, 0, null, null, null, null, 2]),
      leadChance: 0.45,
      perc: "darkMetal",
      level: 0.016,
      filter: 900,
      wet: 0.26
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
  storm: Object.freeze({ bed: "stormWind", events: Object.freeze(["thunder", "rain"]) }),
  abyss: Object.freeze({ bed: "deepWater", events: Object.freeze(["pressurePulse", "echoPing"]) })
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
    // Adaptive music state.
    this.musicTimer = null;
    this.musicStep = 0;
    this.nextStepAt = 0;
    this.energy = 0.2;
    this.bonusMode = false;
    // Ambience state.
    this.ambience = null;
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
    this.musicStep = 0;
    this.nextStepAt = context.currentTime + 0.08;
    const bus = this.graph.buses.music;
    bus.gain.cancelScheduledValues(context.currentTime);
    bus.gain.setValueAtTime(0.0001, context.currentTime);
    bus.gain.setTargetAtTime(0.72, context.currentTime, 0.5);
    this.musicTimer = window.setInterval(() => this.scheduleMusic(), 90);
    this.startAmbience();
  }

  stopMusic() {
    if (this.musicTimer !== null) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
    this.musicStep = 0;
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
    // Idle sessions drift calmer; excitement decays gently toward a floor.
    const floor = this.bonusMode ? 0.75 : 0.12;
    this.energy += (floor - this.energy) * 0.012;
    while (this.nextStepAt < context.currentTime + 0.24) {
      this.playMusicStep(this.musicStep, Math.max(0, this.nextStepAt - context.currentTime));
      this.musicStep += 1;
      this.nextStepAt += this.stepSeconds();
    }
  }

  playMusicStep(step, delay) {
    const profile = this.profile();
    const music = profile.music;
    const stepInBar = step % 16;
    const bar = Math.floor(step / 16);
    const chord = music.chords[bar % music.chords.length];
    const beat = this.stepSeconds();
    const root = profile.root;
    const freq = (semitones, octave = 0) => root * 2 ** ((semitones + octave * 12) / 12);

    // Pad layer — always on, swelling chords once per bar (twice when excited).
    if (stepInBar === 0 || (stepInBar === 8 && this.energy > 0.55)) {
      const tones = this.bonusMode ? [...chord, chord[1] + 12] : chord;
      tones.forEach((semitone, index) => {
        this.tone(varyFreq(freq(semitone), 5), beat * 14, {
          type: music.padWave,
          volume: music.level * (0.5 + this.energy * 0.32),
          attack: beat * 4,
          delay,
          pan: (index / (tones.length - 1) - 0.5) * 0.7,
          wet: music.wet,
          filter: music.filter * (0.8 + this.energy * 0.5),
          filterEnd: music.filter * 0.6,
          music: true
        });
      });
    }

    // Bass layer — always on, following the chord root.
    const bassOffset = music.bass[stepInBar];
    if (Number.isFinite(bassOffset)) {
      this.tone(freq(chord[0] + bassOffset, -1), beat * 1.8, {
        type: music.bassWave,
        volume: music.level * 1.5,
        attack: 0.012,
        delay,
        wet: music.wet * 0.25,
        filter: Math.max(220, music.filter * 0.4),
        filterEnd: Math.max(150, music.filter * 0.24),
        music: true
      });
    }

    // Lead layer — joins with activity; melody notes are skipped or lifted an
    // octave with weighted randomness so the line never loops identically.
    const leadDegree = music.lead[stepInBar];
    if (Number.isFinite(leadDegree) && this.energy > 0.18 && chance(music.leadChance)) {
      const octave = (this.bonusMode ? 2 : 1) + (chance(0.14) ? 1 : 0);
      this.tone(varyFreq(this.scaleFreq(leadDegree, octave), 7), beat * rand(1.4, 2.4), {
        type: music.leadWave,
        volume: music.level * (0.62 + this.energy * 0.36),
        attack: 0.02,
        delay,
        pan: Math.sin(step * 0.9) * 0.36,
        wet: music.wet,
        echo: profile.echo * 0.6,
        filter: music.filter,
        filterEnd: music.filter * 0.7,
        music: true
      });
    }

    // Arp topper — excitement layer of high chord tones.
    if (this.energy > 0.55 && stepInBar % 2 === 0) {
      const semitone = chord[(stepInBar / 2) % chord.length];
      this.tone(varyFreq(freq(semitone, 2), 9), beat * 1.1, {
        type: "sine",
        volume: music.level * 0.4 * this.energy,
        attack: 0.008,
        delay,
        pan: Math.sin(step * 1.7) * 0.6,
        wet: music.wet + 0.1,
        music: true
      });
    }

    // Percussion layer — atmosphere-specific character, joins with activity.
    if (this.energy > 0.24) this.playPercussion(music.perc, stepInBar, delay);
  }

  playPercussion(kind, stepInBar, delay) {
    const excited = this.energy > 0.55 || this.bonusMode;
    if (kind === "warDrum") {
      if (stepInBar === 0 || stepInBar === 8 || (excited && (stepInBar === 6 || stepInBar === 12))) {
        this.tone(varyFreq(74, 20), 0.22, { type: "sine", volume: 0.02, delay, frequencyEnd: 46, music: true, attack: 0.004 });
        this.noise(0.12, { volume: 0.012, delay, music: true, filterType: "lowpass", frequency: 300, frequencyEnd: 80, wetShort: 0.2 });
      }
      if (excited && stepInBar % 4 === 2) {
        this.noise(0.03, { volume: 0.005, delay, music: true, filterType: "highpass", frequency: 8200, frequencyEnd: 9800 });
      }
    } else if (kind === "bellTick") {
      if (stepInBar === 4 || (excited && stepInBar === 12)) {
        this.bell(varyFreq(2093, 26), 0.5, { volume: 0.006, delay, pan: rand(-0.5, 0.5), wet: 0.5, bus: "music" });
      }
    } else if (kind === "toyPop") {
      if (stepInBar % 4 === 0) {
        this.noise(0.05, { volume: 0.012, delay, music: true, filterType: "bandpass", frequency: 620, frequencyEnd: 240, wetShort: 0.1 });
      }
      if (stepInBar % 4 === 2 || (excited && stepInBar % 2 === 0)) {
        this.noise(0.025, { volume: 0.005, delay, music: true, filterType: "highpass", frequency: 7400, frequencyEnd: 9200 });
      }
    } else if (kind === "darkMetal") {
      if (stepInBar === 0 || (excited && stepInBar === 10)) {
        this.tone(varyFreq(52, 14), 0.5, { type: "sine", volume: 0.02, delay, frequencyEnd: 38, music: true, attack: 0.006 });
      }
      if (stepInBar === 6 && chance(0.7)) {
        this.noise(0.09, { volume: 0.007, delay, music: true, filterType: "bandpass", frequency: 860, frequencyEnd: 480, echo: 0.4 });
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
    const spec = WORLD_AMBIENCES[themeId] ?? WORLD_AMBIENCES.fire;
    const nodes = [];
    const context = this.context;

    const bed = this.buildAmbienceBed(spec.bed);
    if (bed) nodes.push(...bed);

    const eventTimer = window.setInterval(() => {
      if (!this.enabled) return;
      spec.events.forEach((event) => this.playAmbienceEvent(event));
    }, 900);

    const busGain = this.graph.buses.ambience;
    busGain.gain.cancelScheduledValues(context.currentTime);
    busGain.gain.setValueAtTime(0.0001, context.currentTime);
    busGain.gain.setTargetAtTime(0.5, context.currentTime, 1.2);
    this.ambience = { themeId, nodes, eventTimer, running: true };
  }

  stopAmbience() {
    if (!this.ambience) return;
    const { nodes, eventTimer } = this.ambience;
    window.clearInterval(eventTimer);
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
    if (bed === "stormWind") {
      return [
        ...this.ambientLoopNoise({ filterType: "bandpass", frequency: 520, q: 1.2, level: 0.013, lfoRate: 0.13, lfoDepth: 260 }),
        ...this.ambientLoopNoise({ filterType: "highpass", frequency: 5600, level: 0.004 })
      ];
    }
    if (bed === "deepWater") {
      return [
        ...this.ambientLoopNoise({ filterType: "lowpass", frequency: 260, level: 0.015, lfoRate: 0.06, lfoDepth: 70 }),
        ...this.ambientDrone(42, 0.007, 0.4)
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
    } else if (event === "thunder" && chance(0.05)) {
      this.noise(rand(1.2, 2), { volume: rand(0.01, 0.016), bus: "ambience", filterType: "lowpass", frequency: 220, frequencyEnd: 60, attack: 0.35, wet: 0.3, pan: rand(-0.6, 0.6) });
    } else if (event === "rain" && chance(0.9)) {
      this.noise(1, { volume: 0.003, bus: "ambience", filterType: "highpass", frequency: 6800, frequencyEnd: 6800, attack: 0.4 });
    } else if (event === "pressurePulse" && chance(0.09)) {
      this.tone(varyFreq(44, 40), rand(1.4, 2.2), { type: "sine", volume: 0.009, bus: "ambience", attack: 0.7, frequencyEnd: 38 });
    } else if (event === "echoPing" && chance(0.05)) {
      this.tone(varyFreq(520, 60), 0.4, { type: "sine", volume: 0.005, bus: "ambience", wet: 0.55, echo: 0.5, pan: rand(-0.7, 0.7) });
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
    const spin = this.profile().spin;
    const frames = Math.floor(context.sampleRate * 0.7);
    const buffer = context.createBuffer(1, frames, context.sampleRate);
    const data = buffer.getChannelData(0);
    let previous = 0;
    for (let index = 0; index < frames; index += 1) {
      previous = previous * 0.62 + (Math.random() * 2 - 1) * 0.38;
      data[index] = previous;
    }
    const now = context.currentTime;
    const lift = this.bonusMode ? 1.18 : 1;

    // Layer 3+6: wind with momentum build.
    const wind = context.createBufferSource();
    wind.buffer = buffer;
    wind.loop = true;
    const windFilter = context.createBiquadFilter();
    windFilter.type = spin.windType;
    windFilter.Q.value = spin.windType === "bandpass" ? 2.2 : 0.8;
    windFilter.frequency.setValueAtTime(spin.windFreq * 0.72, now);
    windFilter.frequency.exponentialRampToValueAtTime(spin.windFreq * 1.12, now + 2.6);
    const windGain = context.createGain();
    windGain.gain.setValueAtTime(0.0001, now);
    windGain.gain.exponentialRampToValueAtTime(spin.windLevel * lift, now + 0.16);

    // Layer 1: mechanical motor with a gentle wobble LFO.
    const motor = context.createOscillator();
    motor.type = spin.motorWave;
    motor.frequency.value = spin.motorFreq;
    const motorLfo = context.createOscillator();
    const motorLfoGain = context.createGain();
    motorLfo.frequency.value = rand(4.6, 6.2);
    motorLfoGain.gain.value = spin.motorFreq * 0.016;
    motorLfo.connect(motorLfoGain).connect(motor.frequency);
    const motorFilter = context.createBiquadFilter();
    motorFilter.type = "lowpass";
    motorFilter.frequency.value = Math.max(240, spin.windFreq * 0.7);
    const motorGain = context.createGain();
    motorGain.gain.setValueAtTime(0.0001, now);
    motorGain.gain.exponentialRampToValueAtTime(spin.motorLevel * lift, now + 0.13);

    // Layer 4: subtle sub bass bed.
    const sub = context.createOscillator();
    sub.type = "sine";
    sub.frequency.value = spin.subFreq;
    const subGain = context.createGain();
    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.exponentialRampToValueAtTime(spin.subLevel, now + 0.4);

    // Layer 2: magical energy shimmer.
    const shimmer = context.createBufferSource();
    shimmer.buffer = buffer;
    shimmer.loop = true;
    shimmer.playbackRate.value = 1.7;
    const shimmerFilter = context.createBiquadFilter();
    shimmerFilter.type = "highpass";
    shimmerFilter.frequency.value = 5200;
    const shimmerGain = context.createGain();
    shimmerGain.gain.setValueAtTime(0.0001, now);
    shimmerGain.gain.exponentialRampToValueAtTime(spin.shimmerLevel * lift, now + 0.5);

    const panner = context.createStereoPanner ? context.createStereoPanner() : context.createGain();
    wind.connect(windFilter).connect(windGain).connect(panner);
    motor.connect(motorFilter).connect(motorGain).connect(panner);
    sub.connect(subGain).connect(panner);
    shimmer.connect(shimmerFilter).connect(shimmerGain).connect(panner);
    panner.connect(this.graph.buses.spin);
    wind.start(now);
    motor.start(now);
    motorLfo.start(now);
    sub.start(now);
    shimmer.start(now);
    this.spinVoice = { wind, windFilter, windGain, motor, motorLfo, motorFilter, motorGain, sub, subGain, shimmer, shimmerGain, panner, stops: 0 };
  }

  updateSpin(tick, anticipation = false) {
    if (!this.spinVoice || !this.context) return;
    const spin = this.profile().spin;
    const now = this.context.currentTime;
    const energy = anticipation ? 1.5 : 1 + Math.sin(tick * 0.35) * 0.08;
    this.spinVoice.windFilter.frequency.setTargetAtTime(spin.windFreq * energy, now, 0.035);
    this.spinVoice.motor.frequency.setTargetAtTime(spin.motorFreq * (anticipation ? 1.35 : 1 + tick % 4 * 0.025), now, 0.03);
    if (this.spinVoice.panner.pan) this.spinVoice.panner.pan.setTargetAtTime(Math.sin(tick * 0.47) * 0.48, now, 0.06);
  }

  stopSpinLoop({ immediate = false } = {}) {
    if (!this.context) return;
    const now = this.context.currentTime;
    const end = now + (immediate ? 0.025 : 0.16);
    if (this.spinVoice) {
      const voice = this.spinVoice;
      [voice.windGain, voice.motorGain, voice.subGain, voice.shimmerGain].forEach((gain) => {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setTargetAtTime(0.0001, now, immediate ? 0.004 : 0.035);
      });
      [voice.wind, voice.motor, voice.motorLfo, voice.sub, voice.shimmer].forEach((node) => {
        try { node.stop(end + 0.03); } catch { /* already stopped */ }
      });
    }
    this.spinVoice = null;
  }

  spinStart() {
    const profile = this.profile();
    const spin = profile.spin;
    this.bumpEnergy(0.4);
    // Launch impact: mechanical engage + energy swell + wind burst + soft sub.
    this.noise(0.4, { volume: 0.06, spin: true, filterType: spin.windType, frequency: spin.windFreq * 0.55, frequencyEnd: spin.windFreq * 1.7, wet: 0.1 });
    this.tone(varyFreq(spin.motorFreq * 0.7, 26), 0.26, { spin: true, frequencyEnd: spin.motorFreq * 1.3, volume: 0.045, filter: spin.windFreq * 0.6, filterEnd: spin.windFreq });
    this.thump(spin.motorFreq * 1.6, { volume: 0.03, duration: 0.12, bus: "spin" });
    this.tone(this.scaleFreq(0, 2), 0.3, { type: "sine", volume: 0.02, wet: profile.wet, spin: true, frequencyEnd: this.scaleFreq(2, 2), attack: 0.05 });
    this.startSpinLoop();
    if (chance(0.5)) this.sparkleBurst({ strength: 0.4, count: 4, delay: 0.05, bus: "spin" });
  }

  spinTick(tick) {
    this.updateSpin(tick);
    if (tick % 2 !== 0) return;
    const context = this.context;
    if (!context) return;
    // Layer 5: small particles — throttled, randomized in pitch/pan/choice.
    const nowMs = performance.now();
    if (nowMs - this.lastParticleAt < 70) return;
    this.lastParticleAt = nowMs;
    const profile = this.profile();
    const pan = (tick % 10) / 5 - 1;
    const degree = Math.floor(tick / 2) % profile.scale.length;
    this.tone(varyFreq(this.scaleFreq(degree, 2), 14), rand(0.04, 0.07), {
      volume: rand(0.014, 0.022), pan, wet: 0.08, filter: 10800, filterEnd: 7600, spin: true
    });
    if (chance(0.3)) {
      this.noise(0.04, { volume: 0.008, pan: -pan * 0.6, wet: 0.05, spin: true, filterType: "highpass", frequency: 6200, frequencyEnd: 9600 });
    }
  }

  // Every reel landing: soft impact + low thump + tiny sparkle + resonant ring
  // with micro reverb. Reel 5 triggers a tension riser for the final reel, and
  // the final reel gets extra weight and a resolving chime.
  reelStop(reelIndex, isFinal = false) {
    const profile = this.profile();
    const stop = profile.stop;
    const pan = reelIndex / 2.5 - 1;
    if (this.spinVoice && this.context) {
      // Wind down the loop stepwise so deceleration is audible.
      this.spinVoice.stops += 1;
      const remaining = clamp(1 - this.spinVoice.stops * 0.16, 0.2, 1);
      const now = this.context.currentTime;
      this.spinVoice.windGain.gain.setTargetAtTime(profile.spin.windLevel * remaining, now, 0.09);
      this.spinVoice.motorGain.gain.setTargetAtTime(profile.spin.motorLevel * remaining, now, 0.09);
    }
    // Soft impact + low thump.
    this.thump(varyFreq(stop.thumpFreq, 24), { volume: isFinal ? 0.075 : 0.055, pan, duration: isFinal ? 0.24 : 0.17 });
    // Magical resonance ring.
    const ringFreq = varyFreq(stop.toneFreq * (1 + reelIndex * 0.06), 12);
    this.tone(ringFreq, isFinal ? 0.2 : 0.13, { volume: isFinal ? 0.05 : 0.038, pan, wetShort: 0.2, wet: profile.wet * 0.6, frequencyEnd: ringFreq * 1.12, filter: 9000, filterEnd: 6800 });
    this.tone(ringFreq * stop.ringRatio, 0.16, { delay: 0.02, volume: 0.024, pan: -pan * 0.4, wet: profile.wet, filter: 10000, filterEnd: 7400 });
    // Tiny sparkle.
    if (stop.sparkle > 0 && chance(0.85)) {
      this.sparkleBurst({ strength: stop.sparkle * (isFinal ? 0.6 : 0.32), count: isFinal ? 4 : 2, delay: 0.015 });
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

  // Rising fanfare runs, scaled per tier. The epic tier unfolds as a full
  // jackpot progression: impact → rise → chords → choir pad → celebration.
  winTier(tierId) {
    const profile = this.profile();
    const strength = { big: 1, mega: 2, epic: 3 }[tierId] ?? 0;
    if (!strength) return;
    this.bumpEnergy(0.6 + strength * 0.13);
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
    this.noise(0.7 + strength * 0.2, { volume: 0.02 + strength * 0.008, wet: 0.2, filterType: "highpass", frequency: 3600, frequencyEnd: 11000, delay: 0.15 });
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
    // Celebration sparkle rain, spaced so it breathes.
    [2.2, 2.9, 3.6].forEach((delay, index) => {
      this.sparkleBurst({ delay, strength: 1.1 - index * 0.2, count: 8 - index * 2 });
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

  collect(count = 1) {
    const profile = this.profile();
    this.bumpEnergy(0.5);
    for (let index = 0; index < Math.min(count, 5); index += 1) {
      const frequency = varyFreq(this.scaleFreq(index + 2, 1), 10);
      if (this.config().mood === "playful") {
        this.pluck(frequency, 0.26, { volume: 0.046, delay: index * rand(0.06, 0.09), pan: index / 2 - 1, wet: profile.wet });
      } else {
        this.tone(frequency, 0.28, { volume: 0.046, delay: index * rand(0.06, 0.09), wet: profile.wet + 0.08, pan: index / 2 - 1 });
      }
    }
    if (count >= 2) this.sparkleBurst({ delay: 0.1, strength: 0.5 + count * 0.08, count: 4 + count });
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
  }

  bonusSceneEnd() {
    this.bonusMode = false;
    this.energy = Math.min(this.energy, 0.5);
  }

  bonusReveal(index, multiplier) {
    const profile = this.profile();
    const lift = Math.floor(clamp(Math.log2(Math.max(1, multiplier)) * 1.4, 0, 5));
    this.bumpEnergy(0.7 + lift * 0.05);
    this.noise(0.16, { volume: 0.04, filterType: "bandpass", frequency: 760, frequencyEnd: 2200, pan: index % 2 ? 0.45 : -0.45, wet: profile.wet });
    const frequency = varyFreq(this.scaleFreq(2 + index + lift, 1), 8);
    if (this.config().mood === "arcane") {
      this.bell(frequency, 0.9, { volume: 0.05, pan: index % 2 ? 0.35 : -0.35, wet: profile.wet + 0.1, echo: profile.echo });
    } else {
      this.tone(frequency, 0.4, { volume: 0.058, wet: profile.wet + 0.1, pan: index % 2 ? 0.35 : -0.35 });
    }
    this.thump(varyFreq(140, 20), { volume: 0.04, pan: index % 2 ? 0.3 : -0.3 });
    this.sparkleBurst({ strength: clamp(0.6 + lift * 0.14, 0.5, 1.3), count: 5 + lift, delay: 0.05 });
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
    const probability = { bigWin: 0.07, bonus: 0.09, jackpot: 0.45 }[eventKind] ?? 0.06;
    const now = Date.now();
    if (now - this.lastVoiceMomentAt < 18000 && eventKind !== "jackpot") return;
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
    const ui = this.profile().ui;
    const frequency = varyFreq(ui.base * 2 ** (this.profile().scale[variant % this.profile().scale.length] / 12), 10);
    this.tone(frequency, 0.09, { type: ui.wave, volume: 0.028, wet: 0.14, bus: "ui" });
    this.noise(0.03, { volume: 0.008, bus: "ui", filterType: "highpass", frequency: 5200, frequencyEnd: 8600 });
  }

  uiConfirm() {
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
