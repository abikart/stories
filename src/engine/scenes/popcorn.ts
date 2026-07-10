import type { Scene, SceneCtx, SceneFactory } from "../scene";

/**
 * "Pop! Pop! Pop!" — coded scene with the tightest word→world feedback:
 * each `pop` cue launches one kernel (WAAPI arc) that lands in a pile
 * that PERSISTS ACROSS PAGES (module-level state, reset on p1 mount).
 * Post-wake, tapping the scene pops bonus kernels.
 */

let pilePersist = 0; // kernels landed so far, across pages

const SVG = `
<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="0" y="0" width="800" height="450" fill="#fbf3dd"/>
  <rect x="0" y="330" width="800" height="120" fill="#e7d9b8"/>
  <rect x="0" y="330" width="800" height="10" fill="#d9c8a2"/>
  <g id="pc-window">
    <rect x="580" y="60" width="150" height="120" rx="10" fill="#c5f7f0"/>
    <rect x="580" y="60" width="150" height="120" rx="10" fill="none" stroke="#e7d9b8" stroke-width="10"/>
    <circle id="pc-winsun" cx="700" cy="95" r="22" fill="#f2cd0f"/>
  </g>
  <g id="pc-stove">
    <rect x="270" y="322" width="260" height="14" rx="7" fill="#8a8378"/>
    <ellipse cx="400" cy="326" rx="96" ry="10" fill="#5c564d"/>
  </g>
  <g id="pc-heatwaves" opacity="0">
    <path d="M340 300 q6 -14 0 -28 q-6 -14 0 -28" stroke="#f48813" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M400 306 q6 -14 0 -28 q-6 -14 0 -28" stroke="#f48813" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M460 300 q6 -14 0 -28 q-6 -14 0 -28" stroke="#f48813" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>
  <g id="pc-pot">
    <path d="M310 240 L490 240 L478 322 L322 322 Z" fill="#cc1d31"/>
    <path d="M310 240 L490 240 L487 262 L313 262 Z" fill="#a81527"/>
    <rect x="286" y="244" width="28" height="10" rx="5" fill="#8a1220"/>
    <rect x="486" y="244" width="28" height="10" rx="5" fill="#8a1220"/>
    <g id="pc-lid">
      <ellipse cx="400" cy="238" rx="92" ry="14" fill="#e2e2e2"/>
      <rect x="392" y="214" width="16" height="14" rx="7" fill="#8a8378"/>
    </g>
  </g>
  <g id="pc-pip">
    <ellipse cx="0" cy="-26" rx="34" ry="30" fill="#f2cd0f"/>
    <ellipse cx="0" cy="-18" rx="22" ry="14" fill="#fffef1"/>
    <circle cx="-9" cy="-34" r="4" fill="#272831"/>
    <circle cx="9" cy="-34" r="4" fill="#272831"/>
    <path d="M -7 -25 Q 0 -19 7 -25" stroke="#272831" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="-13" cy="-2" rx="8" ry="5" fill="#e0b90d"/>
    <ellipse cx="13" cy="-2" rx="8" ry="5" fill="#e0b90d"/>
    <path id="pc-pip-arm" d="M 24 -30 Q 42 -34 50 -46" stroke="#e0b90d" stroke-width="7" fill="none" stroke-linecap="round"/>
  </g>
  <g id="pc-pile"></g>
  <g id="pc-air"></g>
  <g id="pc-steam" opacity="0">
    <path d="M370 200 q8 -18 0 -36 q-8 -18 0 -36" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.7"/>
    <path d="M430 206 q8 -18 0 -36 q-8 -18 0 -36" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.7"/>
  </g>
</svg>`;

const CSS = `
.scene-popcorn { width: 100%; height: 100%;
  filter: saturate(calc(0.18 + var(--awake, 0) * 0.35)) brightness(0.97);
  transition: filter 0.7s ease-out; }
.scene-popcorn[data-awake="full"] { filter: none; }
.scene-popcorn svg { width: 100%; height: 100%; display: block; }
.scene-popcorn g { transform-box: fill-box; }

#pc-pip { transform: translate(220px, 330px); transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
#pc-lid { transform-origin: 400px 238px; }
#pc-heatwaves { transition: opacity 0.6s ease-out; }

[data-cue-pat] #pc-pip { transform: translate(248px, 330px); }
[data-cue-pat] #pc-pip-arm { animation: pc-pat 0.6s ease-out; }
@keyframes pc-pat { 40% { transform: translateY(8px); } 100% { transform: none; } }

[data-cue-heat] #pc-heatwaves { opacity: 1; }
[data-cue-heat] #pc-pot { animation: pc-hot-glow 1.2s ease-out forwards; }
@keyframes pc-hot-glow { to { filter: drop-shadow(0 0 18px rgb(244 136 19 / 0.7)); } }

[data-cue-flop] #pc-pip { transform: translate(400px, 300px) rotate(-8deg); }

[data-awake="full"] #pc-steam { opacity: 1; }
[data-awake="full"] #pc-winsun { animation: pc-sun-pulse 3s ease-in-out infinite alternate; }
@keyframes pc-sun-pulse { to { transform: scale(1.12); } }

[data-reduced] * { animation-duration: 0.01s !important; transition-duration: 0.01s !important; }
`;

const PUFF_COLORS = ["#fffef1", "#fdf6e0", "#fff8d6"];

const createPopcornScene: SceneFactory = (): Scene => {
  let root: HTMLDivElement | null = null;
  let pile: SVGGElement | null = null;
  let air: SVGGElement | null = null;
  let lid: SVGGElement | null = null;
  let popped = 0;
  let awakeFull = false;

  const puffAt = (x: number, y: number, r: number): SVGGElement => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const dots: Array<[number, number, number]> = [
      [0, 0, r], [-r * 0.7, r * 0.25, r * 0.72], [r * 0.7, r * 0.25, r * 0.72], [0, -r * 0.55, r * 0.66],
    ];
    for (const [dx, dy, dr] of dots) {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", String(x + dx));
      c.setAttribute("cy", String(y + dy));
      c.setAttribute("r", String(dr));
      c.setAttribute("fill", PUFF_COLORS[Math.abs((x | 0) + (y | 0)) % PUFF_COLORS.length]);
      g.appendChild(c);
    }
    return g;
  };

  /** Deterministic landing slot for kernel n: fills the counter around the pot. */
  const slot = (n: number): [number, number] => {
    const side = n % 2 === 0 ? 1 : -1;
    const k = Math.floor(n / 2);
    const x = 400 + side * (120 + (k % 5) * 42 + ((n * 37) % 17));
    const y = 322 - Math.floor(k / 5) * 20 - ((n * 53) % 9);
    return [Math.max(40, Math.min(760, x)), y];
  };

  const launchKernel = () => {
    if (!air || !pile) return;
    const n = pilePersist;
    pilePersist++;
    popped++;
    const [lx, ly] = slot(n);
    const puff = puffAt(0, 0, 11);
    air.appendChild(puff);
    const apexX = 400 + (lx - 400) * 0.4;
    const anim = puff.animate(
      [
        { transform: `translate(400px, 225px) scale(0.4)` },
        { transform: `translate(${apexX}px, ${120 - (n % 4) * 18}px) scale(1.15)`, offset: 0.45 },
        { transform: `translate(${lx}px, ${ly}px) scale(1)` },
      ],
      { duration: 620, easing: "cubic-bezier(0.3, 0, 0.55, 1)", fill: "forwards" },
    );
    // lid hop
    lid?.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(-14px) rotate(3deg)" }, { transform: "translateY(0)" }],
      { duration: 300, easing: "ease-out" },
    );
    // land via onfinish, with a timer fallback — WAAPI pauses in hidden
    // tabs and the kernel must ALWAYS reach the pile
    let landed = false;
    const land = () => {
      if (landed) return;
      landed = true;
      puff.remove();
      pile?.appendChild(puffAt(lx, ly, 11));
    };
    anim.onfinish = land;
    setTimeout(land, 750);
  };

  return {
    mount(host, ctx: SceneCtx) {
      if (ctx.pageId === "p1") pilePersist = 0; // fresh read-through
      root = document.createElement("div");
      root.className = "scene-popcorn";
      root.dataset.page = ctx.pageId;
      if (ctx.reducedMotion) root.setAttribute("data-reduced", "");
      const style = document.createElement("style");
      style.textContent = CSS;
      root.appendChild(style);
      root.insertAdjacentHTML("beforeend", SVG);
      host.appendChild(root);
      pile = root.querySelector("#pc-pile");
      air = root.querySelector("#pc-air");
      lid = root.querySelector("#pc-lid");
      // restore the persisted pile
      for (let n = 0; n < pilePersist; n++) {
        const [lx, ly] = slot(n);
        pile?.appendChild(puffAt(lx, ly, 11));
      }
      // p5: pile is the star — Pip will flop into it
      if (ctx.pageId === "p5" && pilePersist < 8) {
        for (let n = pilePersist; n < 8; n++) {
          const [lx, ly] = slot(n);
          pile?.appendChild(puffAt(lx, ly, 11));
        }
        pilePersist = Math.max(pilePersist, 8);
      }
    },
    seek(t) {
      // heat shimmer + lid jitter ride the scrub once things are cooking
      if (!root) return;
      const heat = root.hasAttribute("data-cue-heat") || root.dataset.page !== "p1";
      if (heat && lid) {
        lid.style.transform = `rotate(${(Math.sin(t * Math.PI * 6) * 1.6).toFixed(2)}deg)`;
      }
    },
    cue(name) {
      if (!root) return;
      if (name === "pop") {
        launchKernel();
        return;
      }
      if (name === "fountain") {
        for (let i = 0; i < 6; i++) setTimeout(launchKernel, i * 90);
        return;
      }
      root.setAttribute(`data-cue-${name}`, "");
    },
    setAwake(a) {
      if (!root) return;
      root.style.setProperty("--awake", a.toFixed(3));
      if (a >= 0.999 && !awakeFull) {
        awakeFull = true;
        root.setAttribute("data-awake", "full");
      }
    },
    event(name) {
      // post-wake tap: bonus pops
      if (name === "tap" && awakeFull) {
        for (let i = 0; i < 3; i++) setTimeout(launchKernel, i * 110);
      }
    },
    destroy() {
      root?.remove();
      root = pile = air = null;
      lid = null;
    },
  };
};

export default createPopcornScene;
