/**
 * Ambient bed — synthesized, no asset (docs/06 fallback): looped brown
 * noise through a slowly-wandering lowpass reads as soft wind. Sits under
 * reading at a whisper, swells briefly when a page wakes.
 */
export class AmbientBed {
  private gain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private nodes: AudioNode[] = [];
  private level = 0;
  private muted = false;

  constructor(private ctx: AudioContext) {}

  start() {
    if (this.gain) return;
    const ctx = this.ctx;
    const seconds = 4;
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02; // brown noise
      data[i] = last * 3.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 320;
    this.filter.Q.value = 0.4;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 110;
    lfo.connect(lfoGain).connect(this.filter.frequency);

    this.gain = ctx.createGain();
    this.gain.gain.value = 0;

    src.connect(this.filter).connect(this.gain).connect(ctx.destination);
    src.start();
    lfo.start();
    this.nodes = [src, lfo, lfoGain, this.filter, this.gain];
  }

  /** 0..1 — mapped to a whisper-quiet range. */
  setLevel(level: number) {
    this.level = level;
    this.apply(1.2);
  }

  /** Brief swell (page wake), then settle back. */
  swell() {
    if (!this.gain || this.muted) return;
    const g = this.gain.gain;
    const now = this.ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setTargetAtTime(this.target() * 2.2, now, 0.4);
    g.setTargetAtTime(this.target(), now + 1.6, 0.8);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.apply(0.3);
  }

  get isMuted(): boolean {
    return this.muted;
  }

  private target(): number {
    return this.muted ? 0 : this.level * 0.035;
  }

  private apply(tc: number) {
    if (!this.gain) return;
    const now = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setTargetAtTime(this.target(), now, tc);
  }

  dispose() {
    for (const n of this.nodes) {
      try {
        if (n instanceof AudioBufferSourceNode || n instanceof OscillatorNode) n.stop();
      } catch {}
      n.disconnect();
    }
    this.nodes = [];
    this.gain = null;
    this.filter = null;
  }
}
