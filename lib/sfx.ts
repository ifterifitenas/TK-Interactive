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
  button: (index: number) => {
    const frequencies = [392, 494, 587, 698];
    tone(frequencies[index] ?? 440, 0, 0.28, "triangle", 0.18);
  },
  correct: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.28, "triangle")),
  wrong: () => {
    tone(300, 0, 0.18, "sine", 0.12);
    tone(240, 0.16, 0.28, "sine", 0.12);
  },
  failure: () => {
    if (isMuted() || typeof window === "undefined") return;
    const a = new Audio("/gagal.mp3");
    a.loop = false;
    a.volume = 0.8;
    void a.play().catch(() => {});
  },
  cheer: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.32, "triangle")),
  spinTick: () => tone(850, 0, 0.03, "square", 0.06),
  fanfare: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.22, "triangle", 0.14)),
  completion: () => {
    if (isMuted() || typeof window === "undefined") return;
    // Hanya mainkan sekali — pastikan tidak loop
    const a = new Audio("/berhasil.mp3");
    a.loop = false;
    a.volume = 0.8;
    void a.play().catch(() => {});
  },
  // ── Tepuk tangan — noise burst dengan bandpass filter, total ~0.6 detik ──────
  clap: () => {
    if (isMuted()) return;
    const c = audio();
    if (!c) return;

    // 4 tepukan dengan jeda makin cepat (seperti tepuk antusias)
    const times = [0, 0.17, 0.32, 0.45];
    times.forEach((offset) => {
      const t = c.currentTime + offset;

      // Noise buffer 110ms — materi mentah tepukan
      const bufLen = Math.floor(c.sampleRate * 0.11);
      const buf = c.createBuffer(1, bufLen, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let j = 0; j < bufLen; j++) {
        // amplop: naik cepat lalu turun exponensial
        const env = Math.exp(-j / (bufLen * 0.25));
        d[j] = (Math.random() * 2 - 1) * env;
      }

      // Bandpass filter: fokus ke rentang tepuk tangan nyata (1–3 kHz)
      const bpf = c.createBiquadFilter();
      bpf.type = "bandpass";
      bpf.frequency.value = 2000;
      bpf.Q.value = 0.7;

      // Highshelf tambahan biar ada "sparkle"
      const shelf = c.createBiquadFilter();
      shelf.type = "highshelf";
      shelf.frequency.value = 3000;
      shelf.gain.value = 6;

      const gain = c.createGain();
      gain.gain.setValueAtTime(0.9, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

      const src = c.createBufferSource();
      src.buffer = buf;
      src.connect(bpf);
      bpf.connect(shelf);
      shelf.connect(gain);
      gain.connect(c.destination);
      src.start(t);
      src.stop(t + 0.13);
    });

    // Jingle kemenangan pendek setelah tepukan selesai (~0.6s)
    [659, 784, 1047, 1319].forEach((f, idx) =>
      tone(f, 0.58 + idx * 0.09, 0.22, "triangle", 0.18)
    );
  },
};
