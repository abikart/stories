/**
 * Critically-damped spring — the smoothing behind the Spark.
 * Follows a moving target with no overshoot; settles in ~150–200ms at ω≈22.
 */
export class CriticallyDampedSpring {
  value = 0;
  velocity = 0;
  target = 0;

  constructor(readonly omega = 22) {}

  step(dt: number) {
    const x = this.value - this.target;
    const b = this.velocity + this.omega * x;
    const e = Math.exp(-this.omega * dt);
    this.value = this.target + (x + b * dt) * e;
    this.velocity = (this.velocity - this.omega * b * dt) * e;
  }

  get settled(): boolean {
    return (
      Math.abs(this.value - this.target) < 5e-4 && Math.abs(this.velocity) < 5e-3
    );
  }

  snap(v: number) {
    this.value = this.target = v;
    this.velocity = 0;
  }
}
