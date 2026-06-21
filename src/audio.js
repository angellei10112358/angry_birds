// WebAudio synthesized sound effects — no external dependencies.
let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.15, ramp = true) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    if (ramp) gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* fail silently */ }
}

function playNoise(duration, volume = 0.08) {
  try {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  } catch (e) { /* fail silently */ }
}

export function playLaunch() {
  playTone(200, 0.15, 'sine', 0.1);
  setTimeout(() => playTone(400, 0.1, 'sine', 0.08), 50);
}

export function playHit() {
  playTone(100, 0.12, 'square', 0.12);
  playNoise(0.06, 0.06);
}

export function playBreak() {
  playNoise(0.15, 0.1);
  playTone(300, 0.08, 'sawtooth', 0.06);
}

export function playPigDeath() {
  playTone(500, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(300, 0.15, 'sine', 0.08), 80);
  playNoise(0.1, 0.05);
}

export function playWin() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.3, 'sine', 0.12), i * 120);
  });
}

export function playLose() {
  playTone(400, 0.2, 'sine', 0.1);
  setTimeout(() => playTone(300, 0.25, 'sine', 0.08), 200);
  setTimeout(() => playTone(200, 0.4, 'sine', 0.06), 450);
}
