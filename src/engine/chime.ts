/**
 * Word-complete chime — synthesized, no asset (docs/03 M1). Pentatonic
 * steps rise per word so finishing a sentence plays a tiny melody.
 * Full audio architecture (narration, phoneme bank, layers) arrives at M3.
 */

let ctx: AudioContext | null = null;

/** Call from the first user gesture — Web Audio unlock. */
export function unlockAudio() {
  if (typeof window === "undefined") return;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
}

const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.0]; // C5 D5 E5 G5 A5

export function chime(step = 0) {
  if (!ctx || ctx.state !== "running") return;
  const t0 = ctx.currentTime;
  const freq = PENTATONIC[step % PENTATONIC.length];
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(0.09, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(1e-4, t0 + 0.38);
  gain.connect(ctx.destination);

  for (const [mult, level] of [
    [1, 1],
    [2, 0.35],
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq * mult;
    const g = ctx.createGain();
    g.gain.value = level;
    osc.connect(g).connect(gain);
    osc.start(t0);
    osc.stop(t0 + 0.4);
  }
}
