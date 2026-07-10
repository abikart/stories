import type { ScrubEngine } from "./scrub";

/**
 * Clock driver (docs/04): a time source drives the timeline instead of the
 * finger. Read-to-me passes the narration clock; the render route (M7)
 * passes a fixed-timestep clock for deterministic capture.
 */
export class ClockDriver {
  private raf = 0;
  private on = false;

  constructor(
    private engine: ScrubEngine,
    private position: () => number,
    private map: (audioTime: number) => number,
  ) {}

  start() {
    if (this.on) return;
    this.on = true;
    const loop = () => {
      if (!this.on) return;
      this.engine.setTarget(this.map(this.position()));
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    this.on = false;
    cancelAnimationFrame(this.raf);
  }

  get running(): boolean {
    return this.on;
  }
}
