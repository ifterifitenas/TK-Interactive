import { isMuted } from "./sound";

// Efek suara sederhana dibuat langsung dengan Web Audio (tanpa file).
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, at: number, dur: number, type: OscillatorType = "sine", vol = 0.16) {
  if (isMuted()) return;
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  tap: () => tone(660, 0, 0.08, "triangle", 0.1),
  correct: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.28, "triangle")),
  wrong: () => {
    tone(300, 0, 0.18, "sine", 0.12);
    tone(240, 0.16, 0.28, "sine", 0.12);
  },
  cheer: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.32, "triangle")),
};
