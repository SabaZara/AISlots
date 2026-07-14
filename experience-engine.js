export const AUDIO_PROFILES = Object.freeze({
  astral: Object.freeze({
    wave: "triangle",
    spinBase: 196,
    spinFilter: 1450,
    spinNoise: "bandpass",
    tickNotes: [523.25, 659.25, 783.99, 987.77],
    stopBase: 920,
    winBase: 392,
    wet: 0.28,
    music: Object.freeze({
      bpm: 76,
      wave: "sine",
      root: 196,
      lead: [0, 7, 12, 16, 12, 7, 4, 11],
      bass: [-12, null, -7, null, -9, null, -5, null],
      filter: 1900,
      wet: 0.42,
      level: 0.021,
      percussion: "shimmer"
    })
  }),
  neon: Object.freeze({
    wave: "sine",
    spinBase: 132,
    spinFilter: 880,
    spinNoise: "lowpass",
    tickNotes: [329.63, 440, 554.37, 659.25, 880],
    stopBase: 310,
    winBase: 329.63,
    wet: 0.36,
    music: Object.freeze({
      bpm: 92,
      wave: "triangle",
      root: 164.81,
      lead: [0, 4, 7, 11, 14, 11, 7, 4],
      bass: [-12, null, -5, null, -9, null, -7, null],
      filter: 1500,
      wet: 0.5,
      level: 0.019,
      percussion: "bubble"
    })
  }),
  ember: Object.freeze({
    wave: "sawtooth",
    spinBase: 68,
    spinFilter: 520,
    spinNoise: "bandpass",
    tickNotes: [82.41, 98, 110, 123.47],
    stopBase: 92,
    winBase: 164.81,
    wet: 0.16,
    music: Object.freeze({
      bpm: 84,
      wave: "sawtooth",
      root: 82.41,
      lead: [0, 0, 3, 0, 7, 5, 3, -2],
      bass: [-12, null, -12, null, -9, null, -7, null],
      filter: 720,
      wet: 0.12,
      level: 0.017,
      percussion: "forge"
    })
  }),
  ufc: Object.freeze({
    wave: "square",
    spinBase: 108,
    spinFilter: 1120,
    spinNoise: "highpass",
    tickNotes: [146.83, 174.61, 220, 293.66],
    stopBase: 142,
    winBase: 220,
    wet: 0.12,
    music: Object.freeze({
      bpm: 104,
      wave: "square",
      root: 110,
      lead: [0, 7, 10, 7, 12, 10, 7, 5],
      bass: [-12, null, -5, null, -12, null, -2, null],
      filter: 980,
      wet: 0.1,
      level: 0.014,
      percussion: "arena"
    })
  })
});

export function audioProfileFor(gameId) {
  return AUDIO_PROFILES[gameId] ?? AUDIO_PROFILES.astral;
}

export class SlotAudioEngine {
  constructor(getGameId) {
    this.getGameId = getGameId;
    this.enabled = false;
    this.context = null;
    this.graph = null;
    this.spinVoice = null;
    this.spinSample = null;
    this.sampleBuffers = new Map();
    this.samplePromises = new Map();
    this.lastWinVoiceAt = 0;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  profile() {
    return audioProfileFor(this.getGameId());
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopSpinLoop({ immediate: true });
      this.stopMusic();
    }
    if (enabled) {
      const context = this.ensure();
      if (context?.state === "suspended") void context.resume();
      void this.preloadSamples();
      this.startMusic();
    }
  }

  ensure() {
    if (this.context) return this.context;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    const context = new AudioContext();
    const master = context.createGain();
    const compressor = context.createDynamicsCompressor();
    const reverb = context.createConvolver();
    const reverbGain = context.createGain();
    const dryBus = context.createGain();
    const spinBus = context.createGain();
    const musicBus = context.createGain();

    master.gain.value = 0.68;
    compressor.threshold.value = -20;
    compressor.knee.value = 16;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.24;
    reverbGain.gain.value = 0.2;
    spinBus.gain.value = 0.86;
    musicBus.gain.value = 0.72;

    reverb.buffer = this.makeImpulse(context, 1.35, 2.7);
    dryBus.connect(master);
    spinBus.connect(master);
    musicBus.connect(master);
    reverb.connect(reverbGain).connect(master);
    master.connect(compressor).connect(context.destination);
    this.context = context;
    this.graph = { master, compressor, reverb, reverbGain, dryBus, spinBus, musicBus };
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

  connectVoice(node, { pan = 0, wet = this.profile().wet, spin = false, music = false } = {}) {
    const context = this.context;
    const panner = context.createStereoPanner ? context.createStereoPanner() : context.createGain();
    if (panner.pan) panner.pan.value = Math.max(-1, Math.min(1, pan));
    node.connect(panner);
    panner.connect(music ? this.graph.musicBus : spin ? this.graph.spinBus : this.graph.dryBus);
    if (!spin && wet > 0) {
      const reverbSend = context.createGain();
      reverbSend.gain.value = Math.max(0, Math.min(0.65, wet));
      panner.connect(reverbSend).connect(this.graph.reverb);
    }
    return panner;
  }

  async loadSample(name, url) {
    if (this.sampleBuffers.has(name)) return this.sampleBuffers.get(name);
    if (this.samplePromises.has(name)) return this.samplePromises.get(name);
    const promise = (async () => {
      const context = this.ensure();
      if (!context) return null;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Audio sample failed: ${response.status}`);
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      this.sampleBuffers.set(name, buffer);
      return buffer;
    })().catch((error) => {
      console.warn(`Optional audio sample “${name}” was unavailable.`, error);
      return null;
    });
    this.samplePromises.set(name, promise);
    return promise;
  }

  preloadSamples() {
    if (!this.enabled) return Promise.resolve([]);
    return Promise.all([
      this.loadSample("astralSpin", "./assets/audio/mixkit-slot-machine-random-wheel-1930.mp3"),
      this.loadSample("astralWinVoice", "./assets/audio/astral-you-win-mrstokes302.mp3")
    ]);
  }

  playSample(name, { volume = 0.2, rate = 1, pan = 0, wet = 0, spin = false } = {}) {
    if (!this.enabled) return null;
    const context = this.ensure();
    const buffer = this.sampleBuffers.get(name);
    if (!context || !buffer) {
      void this.preloadSamples();
      return null;
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    gain.gain.value = volume;
    source.connect(gain);
    this.connectVoice(gain, { pan, wet, spin });
    source.start();
    return { source, gain };
  }

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
      wet,
      frequencyEnd = frequency,
      filter = 0,
      filterEnd = filter,
      detune = 0,
      music = false
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
    this.connectVoice(gain, { pan, wet, music });
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
      wet = 0.08,
      filterType = this.profile().spinNoise,
      frequency = this.profile().spinFilter,
      frequencyEnd = frequency,
      music = false
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
    filter.frequency.setValueAtTime(Math.max(60, frequency), start);
    filter.frequency.exponentialRampToValueAtTime(Math.max(60, frequencyEnd), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + Math.min(0.012, duration / 4));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.buffer = buffer;
    source.connect(filter).connect(gain);
    this.connectVoice(gain, { pan, wet, music });
    source.start(start);
    return source;
  }

  musicFrequency(root, semitones) {
    return root * 2 ** (semitones / 12);
  }

  playMusicStep() {
    if (!this.enabled) return;
    const music = this.profile().music;
    if (!music) return;
    const step = this.musicStep % music.lead.length;
    const lead = music.lead[step];
    const bass = music.bass[step];
    const beatSeconds = 60 / (music.bpm * 2);

    if (Number.isFinite(lead)) {
      this.tone(this.musicFrequency(music.root, lead), beatSeconds * 1.35, {
        type: music.wave,
        volume: music.level,
        attack: 0.025,
        pan: Math.sin(step * 1.7) * 0.34,
        wet: music.wet,
        filter: music.filter,
        filterEnd: music.filter * 0.72,
        music: true
      });
    }

    if (Number.isFinite(bass)) {
      this.tone(this.musicFrequency(music.root, bass), beatSeconds * 1.7, {
        type: music.percussion === "forge" ? "sawtooth" : "triangle",
        volume: music.level * 1.35,
        attack: 0.012,
        pan: 0,
        wet: music.wet * 0.4,
        filter: Math.max(260, music.filter * 0.42),
        filterEnd: Math.max(180, music.filter * 0.26),
        music: true
      });
    }

    if (music.percussion === "arena" && (step === 0 || step === 4)) {
      this.noise(0.12, { volume: 0.018, wet: 0.04, filterType: "lowpass", frequency: 220, frequencyEnd: 74, music: true });
    } else if (music.percussion === "forge" && step % 2 === 0) {
      this.noise(0.09, { volume: 0.009, wet: 0.03, filterType: "bandpass", frequency: 680, frequencyEnd: 210, music: true });
    } else if (music.percussion === "bubble" && (step === 2 || step === 6)) {
      this.tone(this.musicFrequency(music.root, lead + 19), 0.16, { type: "sine", volume: 0.009, frequencyEnd: this.musicFrequency(music.root, lead + 24), wet: 0.55, music: true });
    } else if (music.percussion === "shimmer" && step === 7) {
      this.noise(0.22, { volume: 0.006, wet: 0.54, filterType: "highpass", frequency: 2600, frequencyEnd: 5200, music: true });
    }
    this.musicStep += 1;
  }

  startMusic() {
    this.stopMusic();
    if (!this.enabled || !this.ensure()) return;
    const music = this.profile().music;
    if (!music) return;
    this.musicStep = 0;
    this.playMusicStep();
    const stepMilliseconds = Math.round(60000 / (music.bpm * 2));
    this.musicTimer = window.setInterval(() => this.playMusicStep(), stepMilliseconds);
  }

  stopMusic() {
    if (this.musicTimer !== null) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
    this.musicStep = 0;
  }

  restartMusic() {
    if (this.enabled) this.startMusic();
  }

  startSpinLoop() {
    if (!this.enabled) return;
    this.stopSpinLoop({ immediate: true });
    const context = this.ensure();
    if (!context) return;
    const profile = this.profile();
    const frames = Math.floor(context.sampleRate * 0.7);
    const buffer = context.createBuffer(1, frames, context.sampleRate);
    const data = buffer.getChannelData(0);
    let previous = 0;
    for (let index = 0; index < frames; index += 1) {
      previous = previous * 0.62 + (Math.random() * 2 - 1) * 0.38;
      data[index] = previous;
    }
    const wind = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const windGain = context.createGain();
    const motor = context.createOscillator();
    const motorFilter = context.createBiquadFilter();
    const motorGain = context.createGain();
    const panner = context.createStereoPanner ? context.createStereoPanner() : context.createGain();
    const now = context.currentTime;

    wind.buffer = buffer;
    wind.loop = true;
    filter.type = profile.spinNoise;
    filter.Q.value = profile.spinNoise === "bandpass" ? 2.4 : 0.8;
    filter.frequency.value = profile.spinFilter;
    windGain.gain.setValueAtTime(0.0001, now);
    const windLevel = this.getGameId() === "astral" ? 0.012 : this.getGameId() === "ember" ? 0.052 : 0.034;
    windGain.gain.exponentialRampToValueAtTime(windLevel, now + 0.14);
    motor.type = profile.wave;
    motor.frequency.value = profile.spinBase;
    motorFilter.type = "lowpass";
    motorFilter.frequency.value = Math.max(240, profile.spinFilter * 0.72);
    motorGain.gain.setValueAtTime(0.0001, now);
    motorGain.gain.exponentialRampToValueAtTime(this.getGameId() === "ufc" ? 0.022 : 0.014, now + 0.12);
    wind.connect(filter).connect(windGain).connect(panner);
    motor.connect(motorFilter).connect(motorGain).connect(panner);
    panner.connect(this.graph.spinBus);
    wind.start(now);
    motor.start(now);
    this.spinVoice = { wind, filter, windGain, motor, motorFilter, motorGain, panner };
  }

  updateSpin(tick, anticipation = false) {
    if (!this.spinVoice || !this.context) return;
    const profile = this.profile();
    const now = this.context.currentTime;
    const energy = anticipation ? 1.5 : 1 + Math.sin(tick * 0.35) * 0.08;
    this.spinVoice.filter.frequency.setTargetAtTime(profile.spinFilter * energy, now, 0.035);
    this.spinVoice.motor.frequency.setTargetAtTime(profile.spinBase * (anticipation ? 1.35 : 1 + tick % 4 * 0.025), now, 0.03);
    if (this.spinVoice.panner.pan) this.spinVoice.panner.pan.setTargetAtTime(Math.sin(tick * 0.47) * 0.48, now, 0.06);
  }

  stopSpinLoop({ immediate = false } = {}) {
    if (!this.context) return;
    const now = this.context.currentTime;
    const end = now + (immediate ? 0.025 : 0.16);
    if (this.spinVoice) {
      const voice = this.spinVoice;
      voice.windGain.gain.cancelScheduledValues(now);
      voice.motorGain.gain.cancelScheduledValues(now);
      voice.windGain.gain.setTargetAtTime(0.0001, now, immediate ? 0.004 : 0.035);
      voice.motorGain.gain.setTargetAtTime(0.0001, now, immediate ? 0.004 : 0.035);
      try { voice.wind.stop(end + 0.03); } catch { /* already stopped */ }
      try { voice.motor.stop(end + 0.03); } catch { /* already stopped */ }
    }
    if (this.spinSample) {
      this.spinSample.gain.gain.setTargetAtTime(0.0001, now, immediate ? 0.004 : 0.04);
      try { this.spinSample.source.stop(end + 0.05); } catch { /* already stopped */ }
    }
    this.spinVoice = null;
    this.spinSample = null;
  }

  spinStart() {
    const profile = this.profile();
    this.noise(0.42, { volume: 0.075, frequency: profile.spinFilter * 0.55, frequencyEnd: profile.spinFilter * 1.8, wet: 0.12 });
    this.tone(profile.spinBase * 0.7, 0.26, { frequencyEnd: profile.spinBase * 1.25, volume: 0.055, filter: profile.spinFilter * 0.55, filterEnd: profile.spinFilter });
    this.startSpinLoop();
    if (this.getGameId() === "astral") {
      this.spinSample = this.playSample("astralSpin", { volume: 0.3, spin: true });
    }
  }

  winVoice() {
    if (this.getGameId() !== "astral") return;
    const now = Date.now();
    if (now - this.lastWinVoiceAt < 2800) return;
    this.lastWinVoiceAt = now;
    this.playSample("astralWinVoice", { volume: 0.42, wet: 0.08 });
  }

  spinTick(tick) {
    this.updateSpin(tick);
    if (tick % 2 !== 0) return;
    const profile = this.profile();
    const note = profile.tickNotes[Math.floor(tick / 2) % profile.tickNotes.length];
    this.tone(note, 0.055, { volume: 0.018, pan: (tick % 10) / 5 - 1, wet: profile.wet * 0.65, filter: note * 2.4 });
  }

  reelStop(reelIndex, isFinal = false) {
    const profile = this.profile();
    const pan = reelIndex / 2 - 1;
    const thud = this.getGameId() === "ember" || this.getGameId() === "ufc";
    this.noise(thud ? 0.15 : 0.09, { volume: thud ? 0.075 : 0.042, pan, wet: 0.08, frequency: thud ? 260 : 1450, frequencyEnd: thud ? 90 : 720, filterType: thud ? "lowpass" : "bandpass" });
    this.tone(profile.stopBase + reelIndex * (this.getGameId() === "astral" ? -58 : 18), thud ? 0.21 : 0.16, {
      volume: thud ? 0.075 : 0.055,
      pan,
      wet: profile.wet,
      frequencyEnd: thud ? profile.stopBase * 0.62 : profile.stopBase + reelIndex * 30,
      filter: thud ? 620 : 2600,
      filterEnd: thud ? 260 : 1500
    });
    if (isFinal) {
      this.tone(profile.winBase * 2, 0.34, { delay: 0.035, volume: 0.05, wet: profile.wet + 0.12, pan: 0 });
    }
  }

  anticipation() {
    const profile = this.profile();
    this.updateSpin(0, true);
    this.noise(0.8, { volume: 0.055, frequency: profile.spinFilter * 0.65, frequencyEnd: profile.spinFilter * 2.3, wet: profile.wet });
    for (let index = 0; index < 7; index += 1) {
      this.tone(profile.winBase * (1 + index * 0.13), 0.18, { delay: index * 0.105, volume: 0.045 + index * 0.004, pan: index / 3 - 1, wet: profile.wet, filter: profile.winBase * 4 });
    }
  }

  lineWin(lineIndex, amountRatio = 1) {
    const profile = this.profile();
    const lift = Math.min(2.2, 1 + Math.log2(Math.max(1, amountRatio)) * 0.1);
    this.tone(profile.winBase * lift, 0.23, { volume: 0.05, pan: lineIndex % 2 ? 0.35 : -0.35, wet: profile.wet });
    this.tone(profile.winBase * 1.5 * lift, 0.26, { delay: 0.055, volume: 0.035, pan: lineIndex % 2 ? -0.2 : 0.2, wet: profile.wet + 0.08 });
  }

  payoutTick(progress, tierId = "nice") {
    const profile = this.profile();
    const tierLift = { nice: 1, big: 1.2, mega: 1.45, epic: 1.7 }[tierId] ?? 1;
    const scale = [1, 1.125, 1.25, 1.5, 1.68, 2];
    const note = scale[Math.min(scale.length - 1, Math.floor(progress * scale.length))];
    this.tone(profile.winBase * note * tierLift, 0.07, { volume: 0.028 + progress * 0.018, wet: profile.wet, pan: Math.sin(progress * 18) * 0.28 });
  }

  winTier(tierId) {
    const profile = this.profile();
    const strength = { big: 1, mega: 2, epic: 3 }[tierId] ?? 0;
    if (!strength) return;
    this.noise(0.6 + strength * 0.18, { volume: 0.065 + strength * 0.015, frequency: 320, frequencyEnd: 2600, wet: profile.wet + 0.08 });
    for (let run = 0; run <= strength; run += 1) {
      [1, 1.25, 1.5, 2].forEach((ratio, index) => {
        this.tone(profile.winBase * ratio, 0.5, { delay: run * 0.29 + index * 0.055, volume: 0.065, wet: profile.wet + 0.1, pan: index / 1.5 - 1 });
      });
    }
  }

  collect(count = 1) {
    const profile = this.profile();
    for (let index = 0; index < Math.min(count, 5); index += 1) {
      this.tone(profile.winBase * (1.5 + index * 0.22), 0.3, { delay: index * 0.07, volume: 0.052, wet: profile.wet + 0.1, pan: index / 2 - 1 });
    }
  }

  bonusStart() {
    const profile = this.profile();
    this.noise(0.75, { volume: 0.085, frequency: 180, frequencyEnd: 3200, wet: profile.wet + 0.14 });
    [1, 1.5, 2, 2.5, 3].forEach((ratio, index) => {
      this.tone(profile.winBase * ratio, 0.64, { delay: index * 0.075, volume: 0.068, wet: profile.wet + 0.15, pan: index / 2 - 1 });
    });
  }

  bonusReveal(index, multiplier) {
    const profile = this.profile();
    const lift = 1 + Math.min(1.2, Math.log2(Math.max(1, multiplier)) * 0.16);
    this.noise(0.18, { volume: 0.045, frequency: 760, frequencyEnd: 2200, pan: index % 2 ? 0.45 : -0.45, wet: profile.wet });
    this.tone(profile.winBase * (1.5 + index * 0.18) * lift, 0.42, { volume: 0.065, wet: profile.wet + 0.1, pan: index % 2 ? 0.35 : -0.35 });
  }

  nearMiss() {
    const profile = this.profile();
    [1.35, 1.08, 0.78].forEach((ratio, index) => {
      this.tone(profile.winBase * ratio, 0.19, { delay: index * 0.13, volume: 0.045, wet: profile.wet, frequencyEnd: profile.winBase * ratio * 0.92 });
    });
  }

  gameChange() {
    const profile = this.profile();
    this.restartMusic();
    [1, 1.5, 2.25].forEach((ratio, index) => this.tone(profile.winBase * ratio, 0.28, { delay: index * 0.055, volume: 0.045, wet: profile.wet + 0.08 }));
  }

  interfaceOn() {
    this.tone(660, 0.12, { volume: 0.035, wet: 0.18 });
    this.tone(990, 0.18, { delay: 0.055, volume: 0.04, wet: 0.25 });
  }
}
