/**
 * Retro chiptune-style SFX synthesized via the Web Audio API.
 * No external dependencies, no audio file imports.
 *
 * Design notes:
 * - AudioContext is created lazily on the first sound call (browsers block
 *   audio before user interaction).
 * - A single white-noise AudioBuffer is generated on context creation and
 *   reused via fresh AudioBufferSourceNodes for each call.
 * - Master gain is capped at MASTER_GAIN to prevent loud surprises.
 * - Mute state persists in localStorage under the key 'sfx-muted'.
 */

const STORAGE_KEY = 'sfx-muted';
const MASTER_GAIN = 0.3;
const NOISE_DURATION_SECONDS = 1; // Reusable 1-second noise buffer.

type Ctx = AudioContext;

interface AudioState {
  ctx: Ctx;
  master: GainNode;
  noiseBuffer: AudioBuffer;
}

let state: AudioState | null = null;
let muted: boolean = readMutedFromStorage();

function readMutedFromStorage(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeMutedToStorage(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
  } catch {
    /* ignore */
  }
}

function createNoiseBuffer(ctx: Ctx): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * NOISE_DURATION_SECONDS);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Lazily acquire (and resume) the AudioContext + master chain. Returns null
 * if the environment doesn't support Web Audio (e.g. SSR).
 */
function getState(): AudioState | null {
  if (state) {
    if (state.ctx.state === 'suspended') {
      // Fire-and-forget: browsers usually only allow this from a user gesture.
      void state.ctx.resume();
    }
    return state;
  }

  if (typeof window === 'undefined') return null;
  const Ctor: typeof AudioContext | undefined =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;

  const ctx = new Ctor();
  const master = ctx.createGain();
  master.gain.value = MASTER_GAIN;
  master.connect(ctx.destination);

  state = { ctx, master, noiseBuffer: createNoiseBuffer(ctx) };

  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return state;
}

/** Build a short ADSR-shaped gain envelope and connect it to the destination. */
function envelope(
  ctx: Ctx,
  destination: AudioNode,
  start: number,
  attack: number,
  decay: number,
  peak: number,
): GainNode {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.linearRampToValueAtTime(peak, start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
  g.connect(destination);
  return g;
}

/** Fire a one-shot oscillator with an ADSR envelope. */
function playOsc(
  s: AudioState,
  type: OscillatorType,
  startFreq: number,
  endFreq: number,
  startTime: number,
  attack: number,
  decay: number,
  peak: number,
): void {
  const { ctx, master } = s;
  const env = envelope(ctx, master, startTime, attack, decay, peak);
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, startTime);
  if (endFreq !== startFreq) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(endFreq, 0.0001),
      startTime + attack + decay,
    );
  }
  osc.connect(env);
  osc.start(startTime);
  osc.stop(startTime + attack + decay + 0.02);
}

/** Fire a one-shot noise burst, optionally through a lowpass filter sweep. */
function playNoise(
  s: AudioState,
  startTime: number,
  duration: number,
  peak: number,
  filter?: { startHz: number; endHz: number; q?: number },
): void {
  const { ctx, master, noiseBuffer } = s;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, startTime);
  env.gain.linearRampToValueAtTime(peak, startTime + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  let head: AudioNode = env;
  if (filter) {
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = filter.q ?? 1;
    lp.frequency.setValueAtTime(filter.startHz, startTime);
    lp.frequency.exponentialRampToValueAtTime(
      Math.max(filter.endHz, 0.0001),
      startTime + duration,
    );
    src.connect(lp);
    lp.connect(env);
    head = env;
  } else {
    src.connect(env);
  }
  head.connect(master);

  src.start(startTime);
  src.stop(startTime + duration + 0.02);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sounds
// ─────────────────────────────────────────────────────────────────────────────

function swordSwing(): void {
  if (muted) return;
  const s = getState();
  if (!s) return;
  const t = s.ctx.currentTime;
  // Filtered noise sweep 4kHz → 500Hz, ~130ms.
  playNoise(s, t, 0.13, 0.6, { startHz: 4000, endHz: 500, q: 2 });
}

function hit(): void {
  if (muted) return;
  const s = getState();
  if (!s) return;
  const t = s.ctx.currentTime;
  // Low-pitch square thump + short noise crack.
  playOsc(s, 'square', 80, 50, t, 0.002, 0.078, 0.5);
  playNoise(s, t, 0.05, 0.4, { startHz: 3000, endHz: 200, q: 1 });
}

function critical(): void {
  if (muted) return;
  const s = getState();
  if (!s) return;
  const t = s.ctx.currentTime;
  // Heavier thud (sawtooth + low square).
  playOsc(s, 'square', 60, 35, t, 0.004, 0.296, 0.6);
  playOsc(s, 'sawtooth', 120, 60, t, 0.004, 0.2, 0.35);
  // Ascending chime layered on top, slightly delayed.
  playOsc(s, 'square', 800, 1200, t + 0.04, 0.005, 0.22, 0.35);
  playOsc(s, 'square', 1200, 1600, t + 0.12, 0.005, 0.18, 0.25);
  // Extra noise impact.
  playNoise(s, t, 0.18, 0.45, { startHz: 5000, endHz: 300, q: 1.2 });
}

function hurt(): void {
  if (muted) return;
  const s = getState();
  if (!s) return;
  const { ctx, master } = s;
  const t = ctx.currentTime;
  const dur = 0.2;

  // Square wave 400Hz → 200Hz with vibrato via an LFO on a detune param.
  const env = envelope(ctx, master, t, 0.005, dur - 0.005, 0.45);
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(400, t);
  osc.frequency.exponentialRampToValueAtTime(200, t + dur);

  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 18;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 25; // cents of vibrato
  lfo.connect(lfoGain);
  lfoGain.connect(osc.detune);

  osc.connect(env);
  osc.start(t);
  lfo.start(t);
  osc.stop(t + dur + 0.02);
  lfo.stop(t + dur + 0.02);
}

function victory(): void {
  if (muted) return;
  const s = getState();
  if (!s) return;
  const { ctx, master } = s;
  const t = ctx.currentTime;

  // Light "reverb" via a feedback delay tap, fed off a sub-bus.
  const wet = ctx.createGain();
  wet.gain.value = 0.25;
  const delay = ctx.createDelay(0.5);
  delay.delayTime.value = 0.13;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.32;
  wet.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(master);

  // C5, E5, G5 arpeggio.
  const notes: Array<{ freq: number; offset: number }> = [
    { freq: 523.25, offset: 0.0 },
    { freq: 659.25, offset: 0.12 },
    { freq: 783.99, offset: 0.24 },
  ];

  for (const n of notes) {
    const start = t + n.offset;
    const dur = 0.22;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.linearRampToValueAtTime(0.5, start + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(n.freq, start);
    osc.connect(env);
    env.connect(master);
    env.connect(wet); // also send to reverb bus
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  // Final ringing top note for the fanfare tail.
  const tailStart = t + 0.32;
  const tailDur = 0.18;
  const tailEnv = ctx.createGain();
  tailEnv.gain.setValueAtTime(0.0001, tailStart);
  tailEnv.gain.linearRampToValueAtTime(0.45, tailStart + 0.005);
  tailEnv.gain.exponentialRampToValueAtTime(0.0001, tailStart + tailDur);
  const tail = ctx.createOscillator();
  tail.type = 'square';
  tail.frequency.setValueAtTime(1046.5, tailStart); // C6
  tail.connect(tailEnv);
  tailEnv.connect(master);
  tailEnv.connect(wet);
  tail.start(tailStart);
  tail.stop(tailStart + tailDur + 0.02);
}

function defeat(): void {
  if (muted) return;
  const s = getState();
  if (!s) return;
  const { ctx, master } = s;
  const t = ctx.currentTime;

  // Slow descending minor-feeling sequence: C5, Bb4, Ab4, G4.
  const notes = [523.25, 466.16, 415.3, 392.0];
  const stepDur = 0.2;
  for (let i = 0; i < notes.length; i++) {
    const start = t + i * stepDur;
    const dur = stepDur * 0.95;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.linearRampToValueAtTime(0.42, start + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(notes[i], start);
    // Slight downward bend on the last note for sad effect.
    if (i === notes.length - 1) {
      osc.frequency.exponentialRampToValueAtTime(notes[i] * 0.85, start + dur);
    }
    osc.connect(env);
    env.connect(master);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
}

function select(): void {
  if (muted) return;
  const s = getState();
  if (!s) return;
  const t = s.ctx.currentTime;
  // Tiny 800Hz square blip, ~50ms.
  playOsc(s, 'square', 800, 800, t, 0.002, 0.048, 0.4);
}

/** Play a stack of oscillators sharing a start time + envelope shape (chord stab). */
function playChord(
  s: AudioState,
  type: OscillatorType,
  freqs: number[],
  startTime: number,
  attack: number,
  decay: number,
  peak: number,
): void {
  for (const f of freqs) {
    playOsc(s, type, f, f, startTime, attack, decay, peak);
  }
}

function brutal(): void {
  if (muted) return;
  const s = getState();
  if (!s) return;
  const t = s.ctx.currentTime;
  // Layered sub thud + body + mid grit, ~400ms total.
  playOsc(s, 'square', 50, 30, t, 0.004, 0.396, 0.55); // 50Hz sub-bass thud, long decay
  playOsc(s, 'sawtooth', 100, 55, t, 0.004, 0.32, 0.4); // 100Hz body
  playOsc(s, 'square', 200, 110, t, 0.004, 0.25, 0.3); // 200Hz mid
  // Dirty noise burst with filter sweep 6kHz -> 300Hz.
  playNoise(s, t, 0.25, 0.5, { startHz: 6000, endHz: 300, q: 1.4 });
}

function overkill(): void {
  if (muted) return;
  const s = getState();
  if (!s) return;
  const { ctx, master } = s;
  const t = ctx.currentTime;
  // Power-chord-ish stack: square + sawtooth at 55, 110, 165, 220, 330 Hz.
  const fundamentals = [55, 110, 165, 220, 330];
  playChord(s, 'square', fundamentals, t, 0.005, 0.55, 0.32);
  playChord(s, 'sawtooth', fundamentals, t, 0.005, 0.5, 0.22);
  // Noise explosion underneath.
  playNoise(s, t, 0.4, 0.55, { startHz: 7000, endHz: 200, q: 1.2 });
  // Delayed metallic chime tail (high square notes through a small reverb bus).
  const wet = ctx.createGain();
  wet.gain.value = 0.3;
  const delay = ctx.createDelay(0.5);
  delay.delayTime.value = 0.11;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.35;
  wet.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(master);

  const chimeStart = t + 0.18;
  const chimeNotes = [1318.5, 1760, 2093]; // E6, A6, C7
  for (let i = 0; i < chimeNotes.length; i++) {
    const start = chimeStart + i * 0.05;
    const dur = 0.25;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.linearRampToValueAtTime(0.32, start + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(chimeNotes[i], start);
    osc.connect(env);
    env.connect(master);
    env.connect(wet);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
}

function gibSplat(): void {
  if (muted) return;
  const s = getState();
  if (!s) return;
  const { ctx, master, noiseBuffer } = s;
  const t = ctx.currentTime;
  // Bandpass-swept noise burst (300Hz peak) for the wet meat splat.
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 3;
  bp.frequency.setValueAtTime(900, t);
  bp.frequency.exponentialRampToValueAtTime(300, t + 0.18);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.linearRampToValueAtTime(0.55, t + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  src.connect(bp);
  bp.connect(env);
  env.connect(master);
  src.start(t);
  src.stop(t + 0.2);

  // Low square thump 60Hz, 80ms.
  playOsc(s, 'square', 60, 40, t, 0.003, 0.077, 0.45);

  // Liquid-y aftertail: a delayed second noise burst at lower freq for the "drip".
  playNoise(s, t + 0.09, 0.16, 0.28, { startHz: 600, endHz: 120, q: 2 });
}

function bloodSplat(): void {
  if (muted) return;
  const s = getState();
  if (!s) return;
  const { ctx, master, noiseBuffer } = s;
  const t = ctx.currentTime;
  // Lighter, shorter splat: bandpass sweep at 1kHz peak, ~120ms.
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 2.5;
  bp.frequency.setValueAtTime(2000, t);
  bp.frequency.exponentialRampToValueAtTime(1000, t + 0.1);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.linearRampToValueAtTime(0.32, t + 0.004);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  src.connect(bp);
  bp.connect(env);
  env.connect(master);
  src.start(t);
  src.stop(t + 0.14);

  // Tiny higher thump for body.
  playOsc(s, 'square', 90, 70, t, 0.002, 0.05, 0.22);
}

function comboTick(level: number): void {
  if (muted) return;
  const s = getState();
  if (!s) return;
  const t = s.ctx.currentTime;
  // 600Hz at level 1, +80Hz per level, capped at 1600Hz (level >= 13).
  const safeLevel = Math.max(1, Math.floor(level));
  const freq = Math.min(1600, 600 + (safeLevel - 1) * 80);
  playOsc(s, 'square', freq, freq, t, 0.002, 0.038, 0.32);
}

function feverStart(): void {
  if (muted) return;
  const s = getState();
  if (!s) return;
  const { ctx, master } = s;
  const t = ctx.currentTime;

  // Feedback delay reverb bus (same pattern as victory()).
  const wet = ctx.createGain();
  wet.gain.value = 0.3;
  const delay = ctx.createDelay(0.5);
  delay.delayTime.value = 0.11;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.36;
  wet.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(master);

  // Sparkle: high noise burst at 8kHz at the very start.
  playNoise(s, t, 0.06, 0.35, { startHz: 9000, endHz: 6000, q: 2 });

  // 8-note ascending arpeggio: C5, E5, G5, C6, E6, G6, C7, E7.
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568.0, 2093.0, 2637.0];
  const step = 0.06;
  for (let i = 0; i < notes.length; i++) {
    const start = t + i * step;
    const dur = 0.18;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.linearRampToValueAtTime(0.42, start + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(notes[i], start);
    osc.connect(env);
    env.connect(master);
    env.connect(wet);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
}

function feverEnd(): void {
  if (muted) return;
  const s = getState();
  if (!s) return;
  const t = s.ctx.currentTime;
  // Filtered noise sweep 8kHz -> 200Hz over 200ms.
  playNoise(s, t, 0.2, 0.32, { startHz: 8000, endHz: 200, q: 1 });
}

function setMuted(value: boolean): void {
  muted = value;
  writeMutedToStorage(value);
}

function isMuted(): boolean {
  return muted;
}

export const sfx = {
  swordSwing,
  hit,
  critical,
  hurt,
  victory,
  defeat,
  select,
  brutal,
  overkill,
  gibSplat,
  bloodSplat,
  comboTick,
  feverStart,
  feverEnd,
  setMuted,
  isMuted,
};
