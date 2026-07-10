import { CriticallyDampedSpring } from "./spring";
import type { PageTimeline } from "./timeline";
import type { Cue } from "./types";

type FrameFn = (t: number, furthest: number) => void;
type WordFn = (tokenIndex: number) => void;
type CueFn = (name: string) => void;

/**
 * The scrub engine (docs/04): one smoothed timeline value, many consumers.
 * Drivers set the target (finger now; narration clock at M3); subscribers
 * repaint from the spring-smoothed t each frame. Word completions are
 * furthest-t based and latched, so scrub jitter can never double-fire.
 */
export class ScrubEngine {
  private spring = new CriticallyDampedSpring();
  private frameSubs: FrameFn[] = [];
  private wordSubs: WordFn[] = [];
  private cueSubs: CueFn[] = [];
  private completed: boolean[] = [];
  private cues: Cue[] = [];
  private firedCues: boolean[] = [];
  private raf = 0;
  private running = false;
  private last = 0;
  timeline: PageTimeline | null = null;
  furthest = 0;

  get t(): number {
    return this.spring.value;
  }

  /** Where the spring is heading — step keyboard moves from here so rapid presses accumulate. */
  get target(): number {
    return this.spring.target;
  }

  setTimeline(tl: PageTimeline) {
    const first = this.timeline === null;
    this.timeline = tl;
    this.completed = tl.tokens.map(() => false);
    if (first) {
      // fresh page: rest state
      this.furthest = 0;
      this.spring.snap(0);
    }
    // re-measure (font load, resize): keep t, ranges just moved
    this.emit();
  }

  /** Pointer/keyboard driver: spring glides toward the target. */
  setTarget(t: number) {
    this.spring.target = clamp01(t);
    this.wake();
  }

  onFrame(fn: FrameFn): () => void {
    this.frameSubs.push(fn);
    return () => {
      this.frameSubs = this.frameSubs.filter((f) => f !== fn);
    };
  }

  onWordComplete(fn: WordFn): () => void {
    this.wordSubs.push(fn);
    return () => {
      this.wordSubs = this.wordSubs.filter((f) => f !== fn);
    };
  }

  /** Page scene beats — fired (latched) when furthest-t crosses INTO the cue's token. */
  setCues(cues: Cue[]) {
    this.cues = cues;
    this.firedCues = cues.map(() => false);
  }

  onCue(fn: CueFn): () => void {
    this.cueSubs.push(fn);
    return () => {
      this.cueSubs = this.cueSubs.filter((f) => f !== fn);
    };
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.running = false;
    this.frameSubs = [];
    this.wordSubs = [];
  }

  private wake() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  private loop = (now: number) => {
    const dt = Math.min((now - this.last) / 1000, 0.032);
    this.last = now;
    this.tick(dt);
    if (this.spring.settled) {
      this.running = false;
      return;
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  /**
   * Deterministic step outside the rAF loop — the render route's fixed
   * timestep clock (M7) and headless tests drive the engine with this.
   */
  tick(dt: number) {
    this.spring.step(dt);
    if (this.spring.settled) this.spring.snap(this.spring.target);
    this.emit();
  }

  private emit() {
    const t = this.spring.value;
    if (t > this.furthest && this.timeline) {
      this.furthest = t;
      for (let i = 0; i < this.timeline.tokens.length; i++) {
        if (!this.completed[i] && this.furthest >= this.timeline.tokens[i].end - 1e-4) {
          this.completed[i] = true;
          for (const fn of this.wordSubs) fn(i);
        }
      }
      for (let ci = 0; ci < this.cues.length; ci++) {
        if (this.firedCues[ci]) continue;
        const tok = this.timeline.tokens[this.cues[ci].atWord];
        if (tok && this.furthest > tok.start + 1e-4) {
          this.firedCues[ci] = true;
          for (const fn of this.cueSubs) fn(this.cues[ci].cue);
        }
      }
    }
    for (const fn of this.frameSubs) fn(t, this.furthest);
  }
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
