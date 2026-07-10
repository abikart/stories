import type { PageTimeline } from "./timeline";
import type { WordTimestamps } from "./types";

/**
 * A page's narration: one decoded AudioBuffer + word timestamps.
 * Plays whole (Read to me), or as per-word slices (Read along, tap-a-word).
 * audioTimeToT maps the narration clock onto the page timeline so
 * highlights and the scene follow the voice.
 */
export class PageNarration {
  private source: AudioBufferSourceNode | null = null;
  private startedAt = 0;
  private playingAll = false;

  private constructor(
    readonly buffer: AudioBuffer,
    readonly words: WordTimestamps,
    private ctx: AudioContext,
  ) {}

  static async load(ctx: AudioContext, audioUrl: string, wordsUrl: string): Promise<PageNarration> {
    const [audioData, words] = await Promise.all([
      fetch(audioUrl).then((r) => {
        if (!r.ok) throw new Error(`narration audio ${r.status}`);
        return r.arrayBuffer();
      }),
      fetch(wordsUrl).then((r) => {
        if (!r.ok) throw new Error(`narration words ${r.status}`);
        return r.json() as Promise<WordTimestamps>;
      }),
    ]);
    const buffer = await ctx.decodeAudioData(audioData);
    return new PageNarration(buffer, words, ctx);
  }

  get isPlaying(): boolean {
    return this.playingAll;
  }

  /** Narration-clock position in seconds while playing whole. */
  get position(): number {
    return this.playingAll ? this.ctx.currentTime - this.startedAt : 0;
  }

  playAll(onEnded?: () => void) {
    this.stop();
    const s = this.ctx.createBufferSource();
    s.buffer = this.buffer;
    s.connect(this.ctx.destination);
    s.onended = () => {
      if (this.source === s) {
        this.playingAll = false;
        this.source = null;
        onEnded?.();
      }
    };
    this.startedAt = this.ctx.currentTime;
    s.start();
    this.source = s;
    this.playingAll = true;
  }

  /** Play one word's slice (small head/tail pads soften the cut). */
  playWord(tokenIndex: number): boolean {
    const w = this.words.find((w) => w.i === tokenIndex);
    if (!w) return false;
    const s = this.ctx.createBufferSource();
    s.buffer = this.buffer;
    s.connect(this.ctx.destination);
    const start = Math.max(0, w.start - 0.015);
    s.start(this.ctx.currentTime, start, w.end - start + 0.05);
    return true;
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop();
      } catch {
        // already stopped
      }
      this.source = null;
    }
    this.playingAll = false;
  }

  /**
   * Piecewise-linear map: narration seconds → timeline t. Inside word k it
   * interpolates across token k's t-range; silences interpolate between
   * neighbors, so the Spark glides through gaps instead of teleporting.
   */
  audioTimeToT(at: number, timeline: PageTimeline): number {
    const words = this.words;
    if (words.length === 0) return 0;
    const seg = (a0: number, a1: number, t0: number, t1: number) =>
      a1 <= a0 ? t1 : t0 + ((at - a0) / (a1 - a0)) * (t1 - t0);

    const first = words[0];
    const firstTok = timeline.tokens[first.i];
    if (at < first.start) return seg(0, first.start, 0, firstTok?.start ?? 0);

    for (let k = 0; k < words.length; k++) {
      const w = words[k];
      const tok = timeline.tokens[w.i];
      if (!tok) continue;
      if (at <= w.end) {
        if (at >= w.start) return seg(w.start, w.end, tok.start, tok.end);
        // in the gap before word k
        const prev = words[k - 1];
        const prevTok = prev ? timeline.tokens[prev.i] : null;
        return seg(prev?.end ?? 0, w.start, prevTok?.end ?? 0, tok.start);
      }
    }
    return 1;
  }
}
