import type { TimedPhrase } from "@/experience/performance/timeline";
import { samplePerformance } from "@/experience/performance/timeline";

export type PerformanceClockSnapshot = {
  time: number;
  duration: number;
  playing: boolean;
  ended: boolean;
  phraseIndex: number;
  sceneIndex: number;
  wordIndex: number;
};

type Listener = (snapshot: PerformanceClockSnapshot) => void;

export class PerformanceClock {
  private animationFrame = 0;
  private destroyed = false;
  private lastPublishedAt = -1;
  private lastSignature = "";
  private listeners = new Set<Listener>();

  constructor(
    private readonly audio: HTMLAudioElement,
    private readonly phrases: readonly TimedPhrase[],
    private readonly configuredDuration: number,
  ) {
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onSeeked = this.onSeeked.bind(this);
    audio.addEventListener("play", this.onPlay);
    audio.addEventListener("pause", this.onPause);
    audio.addEventListener("seeked", this.onSeeked);
    audio.addEventListener("ended", this.onPause);
    this.publish(true);
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  async play() {
    await this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  seek(time: number) {
    this.audio.currentTime = Math.max(0, Math.min(time, this.configuredDuration));
    this.publish(true);
  }

  replay() {
    this.seek(0);
    return this.play();
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.animationFrame);
    this.audio.removeEventListener("play", this.onPlay);
    this.audio.removeEventListener("pause", this.onPause);
    this.audio.removeEventListener("seeked", this.onSeeked);
    this.audio.removeEventListener("ended", this.onPause);
    this.listeners.clear();
  }

  private onPlay() {
    this.publish(true);
    this.schedule();
  }

  private onPause() {
    cancelAnimationFrame(this.animationFrame);
    this.publish(true);
  }

  private onSeeked() {
    this.publish(true);
  }

  private schedule() {
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame(() => {
      this.publish(false);
      if (!this.audio.paused && !this.destroyed) this.schedule();
    });
  }

  private snapshot(): PerformanceClockSnapshot {
    const time = this.audio.currentTime;
    const sample = samplePerformance(this.phrases, time);
    return {
      time,
      duration: this.configuredDuration,
      playing: !this.audio.paused,
      ended: this.audio.ended,
      ...sample,
    };
  }

  private publish(force: boolean) {
    const snapshot = this.snapshot();
    const signature = `${snapshot.playing}:${snapshot.ended}:${snapshot.phraseIndex}:${snapshot.wordIndex}`;
    if (!force && signature === this.lastSignature && snapshot.time - this.lastPublishedAt < 0.1) return;
    this.lastSignature = signature;
    this.lastPublishedAt = snapshot.time;
    this.listeners.forEach((listener) => listener(snapshot));
  }
}
