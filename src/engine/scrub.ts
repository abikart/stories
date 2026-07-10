import { CriticallyDampedSpring } from "./spring";
import type { PageTimeline } from "./timeline";

type FrameFn = (t: number, furthest: number) => void;
type WordFn = (tokenIndex: number) => void;

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
  private completed: boolean[] = [];
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
    }
    for (const fn of this.frameSubs) fn(t, this.furthest);
  }
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
