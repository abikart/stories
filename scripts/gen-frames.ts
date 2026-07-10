/**
 * Procedural frame-sequence generator (docs/06 fallback for the frames
 * backend): shader-style per-pixel rendering in pure JS, piped through
 * ffmpeg to WebP frames. AI-generated video drops into the same
 * directory format later (docs/04).
 *
 *   pnpm gen-frames the-ship-in-the-rain
 *
 * Scene programs are story-specific BY DESIGN here in the script — the
 * runtime FramesScene stays generic.
 */
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";

const W = 640;
const H = 360;
const FRAMES = 48;
const CONTENT = path.join(process.cwd(), "content");

type RGB = [number, number, number];
type PageProgram = (u: number, v: number, t: number) => RGB;

/* ---------- tiny shader stdlib ---------- */
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const mix = (a: number, b: number, f: number) => a + (b - a) * clamp01(f);
const mixc = (a: RGB, b: RGB, f: number): RGB => [
  mix(a[0], b[0], f),
  mix(a[1], b[1], f),
  mix(a[2], b[2], f),
];
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const hash = (a: number, b: number) => {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
};
const fract = (x: number) => x - Math.floor(x);

/* ---------- palette (docs/08 candy, sea-shifted) ---------- */
const STORM_TOP: RGB = [96, 108, 126];
const STORM_BOT: RGB = [156, 165, 172];
const CLEAR_TOP: RGB = [176, 214, 235];
const CLEAR_BOT: RGB = [255, 250, 224];
const SEA_DEEP: RGB = [31, 74, 158];
const SEA_MID: RGB = [39, 96, 200];
const SEA_LIGHT: RGB = [125, 176, 196];
const HULL: RGB = [88, 71, 65];
const HULL_RAIL: RGB = [122, 99, 88];
const SAIL: RGB = [255, 254, 241];
const CABIN: RGB = [242, 205, 15];
const FLAG: RGB = [204, 29, 49];
const CLOUD_DARK: RGB = [120, 128, 140];
const CLOUD_LIGHT: RGB = [252, 252, 248];
const SUN: RGB = [242, 205, 15];
const RAIN_C: RGB = [205, 220, 232];
const FISH_C: RGB = [157, 199, 200];
const FISH_DARK: RGB = [96, 148, 152];

const HORIZON = 0.62;

interface WorldParams {
  storm: number; // 0 clear .. 1 storm
  rain: number; // streak intensity
  rock: number; // ship roll amplitude (radians)
  shipU: number;
  shipScale: number;
  cloudGap: number; // how far clouds have parted
  rays: boolean;
  sparkle: boolean;
}

function world(u: number, v: number, t: number, p: WorldParams, actors?: (u: number, v: number, t: number, base: RGB) => RGB | null): RGB {
  const clear = 1 - p.storm;
  let c: RGB;

  if (v < HORIZON) {
    // sky
    c = mixc(
      mixc(STORM_TOP, CLEAR_TOP, clear),
      mixc(STORM_BOT, CLEAR_BOT, clear),
      v / HORIZON,
    );
    // sun + rays
    const su = 0.80, sv = 0.20;
    const d = Math.hypot((u - su) * 1.2, v - sv);
    if (clear > 0.25) {
      if (p.rays) {
        const ang = Math.atan2(v - sv, u - su);
        const sector = fract((ang / (Math.PI * 2)) * 9 + t * 0.5);
        if (sector < 0.5) c = mixc(c, SUN, 0.16 * clear * smooth(0.55, 0.1, d));
      }
      c = mixc(c, SUN, clear * smooth(0.075, 0.055, d));
      c = mixc(c, SUN, 0.25 * clear * smooth(0.16, 0.06, d));
    }
    // clouds: three drifting blobs, parting by cloudGap
    const drift = t * 0.03;
    let blob = 0;
    const blobs: Array<[number, number, number]> = [
      [0.22 - p.cloudGap * 0.12 + drift, 0.16, 0.10],
      [0.52, 0.10, 0.085],
      [0.80 + p.cloudGap * 0.12 + drift * 0.6, 0.24, 0.075],
    ];
    for (const [bu, bv, br] of blobs) {
      const dd = Math.hypot((u - bu) * 1.1, (v - bv) * 2.2);
      blob += Math.exp((-dd * dd) / (br * br));
    }
    const cloudAmt = smooth(0.55, 1.0, blob) * mix(0.9, 0.55, clear);
    c = mixc(c, mixc(CLOUD_DARK, CLOUD_LIGHT, clear), cloudAmt);
  } else {
    // sea: three parallax bands with sine-displaced edges
    const depth = (v - HORIZON) / (1 - HORIZON);
    const w1 = Math.sin(u * 22 + t * Math.PI * 2 * 1.0) * 0.006;
    const w2 = Math.sin(u * 14 - t * Math.PI * 2 * 0.7 + 2) * 0.009;
    c = mixc(SEA_LIGHT, SEA_MID, smooth(0.06 + w1, 0.30 + w1, depth));
    c = mixc(c, SEA_DEEP, smooth(0.35 + w2, 0.95 + w2, depth));
    if (p.sparkle) {
      const gi = Math.floor(u * 90), gj = Math.floor(v * 46);
      const hsh = hash(gi, gj);
      const tw = Math.sin(t * Math.PI * 2 * 2 + hsh * 40);
      if (hsh > 0.965 && tw > 0.4) c = mixc(c, [255, 255, 240], 0.75 * tw);
    }
  }

  // ship (over sea/sky near deck)
  const roll = Math.sin(t * Math.PI * 2 * 1.6) * p.rock;
  const deckV = HORIZON + 0.035;
  const dx = (u - p.shipU) / p.shipScale;
  const dy = (v - deckV) / p.shipScale;
  const lx = Math.cos(roll) * dx + Math.sin(roll) * dy;
  const ly = -Math.sin(roll) * dx + Math.cos(roll) * dy;
  const shipPix = ((): RGB | null => {
    // hull
    if (ly >= 0 && ly <= 0.085) {
      const half = 0.155 * (1 - ly * 6.5) + 0.055;
      if (Math.abs(lx) < half) return ly < 0.014 ? HULL_RAIL : HULL;
    }
    // cabin
    if (ly >= -0.05 && ly < 0 && Math.abs(lx - 0.075) < 0.038) {
      const win = Math.hypot(lx - 0.085, ly + 0.028);
      return win < 0.011 ? FISH_C : CABIN;
    }
    // mast
    if (ly >= -0.30 && ly < 0 && Math.abs(lx + 0.02) < 0.0055) return HULL;
    // sail: triangle (mast top → mast base → boom tip), gentle billow
    if (ly >= -0.285 && ly <= -0.062) {
      const f = (-ly - 0.062) / 0.223; // 0 at boom, 1 at top
      const edge = mix(0.135, -0.014, f) + Math.sin(f * Math.PI) * 0.012;
      if (lx > -0.014 && lx < edge) return SAIL;
    }
    // flag
    if (ly >= -0.325 && ly < -0.295) {
      const flap = Math.sin(t * Math.PI * 2 * 3) * 0.008;
      if (lx > -0.02 && lx < 0.035 + flap) return FLAG;
    }
    return null;
  })();
  if (shipPix) c = shipPix;

  // page actors (drips, fish, splash) — over ship, under rain
  if (actors) {
    const a = actors(u, v, t, c);
    if (a) c = a;
  }

  // rain streaks over everything
  if (p.rain > 0.01) {
    const su2 = u + (v - 0.5) * 0.12;
    const col = Math.floor(su2 * 110);
    const row = Math.floor((v + t * 2.4) * 7 + hash(col, 7) * 7);
    const seg = fract((v + t * 2.4) * 7 + hash(col, 7) * 7);
    if (seg < 0.22 && hash(col, row) < p.rain) c = mixc(c, RAIN_C, 0.4);
  }

  // vignette
  const vin = smooth(0.95, 0.45, Math.hypot((u - 0.89) * 0.9, (v - 0.5) * 1.4));
  return mixc(mixc(c, [30, 34, 44], 0.10), c, vin);
}

/* ---------- page programs: the-ship-in-the-rain ---------- */

const ripple = (u: number, v: number, cu: number, cv: number, prog: number, base: RGB): RGB | null => {
  if (prog <= 0 || prog >= 1) return null;
  const r = prog * 0.05;
  const d = Math.hypot(u - cu, (v - cv) * 2.6);
  if (Math.abs(d - r) < 0.005) return mixc(base, [255, 255, 255], 0.6 * (1 - prog));
  return null;
};

const SHIP_PAGES: Record<string, PageProgram> = {
  p1: (u, v, t) =>
    world(u, v, t, { storm: 0.85, rain: 0.8, rock: 0.06, shipU: 0.42, shipScale: 1, cloudGap: 0, rays: false, sparkle: false }),

  p2: (u, v, t) =>
    world(
      u, v, t,
      { storm: 0.6, rain: 0.32, rock: 0.035, shipU: 0.42, shipScale: 1, cloudGap: 0.1, rays: false, sparkle: false },
      (u2, v2, t2, base) => {
        // three drips from the boom tip, then deck ripples
        const tipU = 0.42 + 0.115, tipV = HORIZON + 0.035 - 0.055;
        for (const t0 of [0.2, 0.45, 0.7]) {
          const fall = (t2 - t0) / 0.1;
          if (fall > 0 && fall < 1) {
            const dv = tipV + fall * 0.08;
            if (Math.hypot((u2 - tipU) * 1.4, v2 - dv) < 0.009) return mixc(base, RAIN_C, 0.9);
          }
          const rip = ripple(u2, v2, tipU, tipV + 0.085, (t2 - t0 - 0.1) / 0.22, base);
          if (rip) return rip;
        }
        return null;
      },
    ),

  p3: (u, v, t) =>
    world(
      u, v, t,
      { storm: 0.35, rain: 0.12, rock: 0.02, shipU: 0.46, shipScale: 0.95, cloudGap: 0.3, rays: false, sparkle: false },
      (u2, v2, t2, base) => {
        const s = (t2 - 0.30) / 0.36;
        if (s > 0 && s < 1) {
          const fu = mix(0.70, 0.86, s);
          const fv = HORIZON + 0.05 - Math.sin(s * Math.PI) * 0.20;
          const ang = -Math.cos(s * Math.PI) * 0.9;
          const rx = Math.cos(ang) * (u2 - fu) + Math.sin(ang) * (v2 - fv);
          const ry = -Math.sin(ang) * (u2 - fu) + Math.cos(ang) * (v2 - fv);
          if ((rx / 0.024) ** 2 + (ry / 0.013) ** 2 < 1) return rx < -0.012 ? FISH_DARK : FISH_C;
          if (rx < -0.018 && rx > -0.034 && Math.abs(ry) < (Math.abs(rx) - 0.014) * 0.9) return FISH_DARK;
        }
        const rip = ripple(u2, v2, 0.86, HORIZON + 0.06, (t2 - 0.66) / 0.26, base);
        if (rip) return rip;
        return null;
      },
    ),

  p4: (u, v, t) =>
    world(u, v, t, {
      storm: mix(0.55, 0.08, t),
      rain: mix(0.4, 0, smooth(0, 0.7, t)),
      rock: 0.02,
      shipU: 0.44,
      shipScale: 0.95,
      cloudGap: mix(0.2, 1, t),
      rays: false,
      sparkle: false,
    }),

  p5: (u, v, t) =>
    world(u, v, t, {
      storm: 0.04,
      rain: 0,
      rock: 0.015,
      shipU: mix(0.46, 0.30, t),
      shipScale: mix(0.95, 0.8, t),
      cloudGap: 1,
      rays: true,
      sparkle: true,
    }),
};

const PROGRAMS: Record<string, Record<string, PageProgram>> = {
  "the-ship-in-the-rain": SHIP_PAGES,
};

/* ---------- render + encode ---------- */

async function renderPage(storyId: string, pageId: string, program: PageProgram) {
  const outDir = path.join(CONTENT, storyId, "scenes", pageId);
  await fs.mkdir(outDir, { recursive: true });

  const ff = spawn("ffmpeg", [
    "-y", "-loglevel", "error",
    "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${W}x${H}`, "-r", "24",
    "-i", "pipe:0",
    // this ffmpeg build has no WebP encoder — PNG, same directory format
    path.join(outDir, "frame_%04d.png"),
  ]);
  ff.stderr.pipe(process.stderr);

  const frame = Buffer.alloc(W * H * 3);
  for (let f = 0; f < FRAMES; f++) {
    const t = f / (FRAMES - 1);
    let o = 0;
    for (let y = 0; y < H; y++) {
      const v = y / H;
      for (let x = 0; x < W; x++) {
        const [r, g, b] = program(x / W, v, t);
        frame[o++] = r; frame[o++] = g; frame[o++] = b;
      }
    }
    if (!ff.stdin.write(frame)) await new Promise((r) => ff.stdin.once("drain", r));
  }
  ff.stdin.end();
  await new Promise<void>((resolve, reject) => {
    ff.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
  });
  console.log(`  ${pageId}: ${FRAMES} frames → ${path.relative(process.cwd(), outDir)}`);
}

async function main() {
  const storyId = process.argv[2];
  const programs = storyId ? PROGRAMS[storyId] : undefined;
  if (!programs) {
    console.error(`usage: pnpm gen-frames <story-id> — known: ${Object.keys(PROGRAMS).join(", ")}`);
    process.exit(1);
  }
  console.log(`rendering frames for ${storyId} (${W}x${H}, ${FRAMES}/page)`);
  for (const [pageId, program] of Object.entries(programs)) {
    await renderPage(storyId, pageId, program);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
