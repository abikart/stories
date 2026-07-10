import type { Scene } from "../scene";

/**
 * FramesScene — the generic frame-sequence backend (docs/04): a WebP
 * sequence preloaded into ImageBitmaps and scrubbed on a canvas by t.
 * Story beats live IN the frames (they're positions on the timeline);
 * cue() is just a subtle flash accent. Same dormancy contract as coded
 * scenes: saturation filter driven by --awake.
 */
const CSS = `
.scene-frames { width: 100%; height: 100%; position: relative;
  filter: saturate(calc(0.18 + var(--awake, 0) * 0.35)) brightness(0.96);
  transition: filter 0.7s ease-out; }
.scene-frames[data-awake="full"] { filter: none; }
.scene-frames canvas { width: 100%; height: 100%; display: block; }
.scene-frames .frames-flash { position: absolute; inset: 0; background: #fff;
  opacity: 0; pointer-events: none; }
.scene-frames[data-pulse] .frames-flash { animation: frames-pulse 0.28s ease-out; }
@keyframes frames-pulse { 20% { opacity: 0.28; } 100% { opacity: 0; } }
.scene-frames[data-reduced] * { animation: none !important; transition-duration: 0.01s !important; }
`;

export function createFramesScene(frames: { dir: string; count: number; ext?: string }): Scene {
  let root: HTMLDivElement | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let g: CanvasRenderingContext2D | null = null;
  let bitmaps: (ImageBitmap | null)[] = [];
  let lastDrawn = -1;

  const draw = (idx: number) => {
    if (!g || !canvas) return;
    const bmp = bitmaps[idx];
    if (!bmp || idx === lastDrawn) return;
    g.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    lastDrawn = idx;
  };

  return {
    async mount(host, ctx) {
      root = document.createElement("div");
      root.className = "scene-frames";
      if (ctx.reducedMotion) root.setAttribute("data-reduced", "");
      const style = document.createElement("style");
      style.textContent = CSS;
      root.appendChild(style);
      canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      root.appendChild(canvas);
      const flash = document.createElement("div");
      flash.className = "frames-flash";
      root.appendChild(flash);
      host.appendChild(root);
      g = canvas.getContext("2d");

      bitmaps = new Array(frames.count).fill(null);
      const url = (i: number) =>
        `/content/${ctx.storyId}/${frames.dir}/frame_${String(i + 1).padStart(4, "0")}.${frames.ext ?? "png"}`;
      // first frame synchronously-ish for instant paint, rest in parallel batches
      const load = async (i: number) => {
        const res = await fetch(url(i));
        if (!res.ok) throw new Error(`frame ${i + 1} ${res.status}`);
        bitmaps[i] = await createImageBitmap(await res.blob());
      };
      await load(0);
      draw(0);
      const rest = Array.from({ length: frames.count - 1 }, (_, k) => k + 1);
      const BATCH = 8;
      for (let b = 0; b < rest.length; b += BATCH) {
        await Promise.all(rest.slice(b, b + BATCH).map(load));
      }
    },
    seek(t) {
      draw(Math.round(t * (frames.count - 1)));
    },
    cue() {
      if (!root) return;
      root.removeAttribute("data-pulse");
      void root.offsetWidth;
      root.setAttribute("data-pulse", "");
    },
    setAwake(a) {
      if (!root) return;
      root.style.setProperty("--awake", a.toFixed(3));
      if (a >= 0.999) root.setAttribute("data-awake", "full");
    },
    destroy() {
      for (const b of bitmaps) b?.close();
      bitmaps = [];
      root?.remove();
      root = canvas = null;
      g = null;
    },
  };
}
