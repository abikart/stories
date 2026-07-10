import type { Scene, SceneCtx, SceneFactory } from "../scene";

/**
 * "The Fox on the Box" — flagship coded scene (docs/07). One continuous
 * world across all 8 pages: base pose per page via [data-page], story
 * beats via latched [data-cue-*] attributes, continuous scrub motion in
 * seek(), dormancy as a saturation filter driven by --awake, and a
 * firefly dusk when a page fully wakes.
 */

const SVG = `
<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g id="fb-zoom">
    <rect x="0" y="0" width="800" height="450" fill="#fdf8dc"/>
    <circle id="fb-sun" cx="678" cy="86" r="40" fill="#f2cd0f"/>
    <g id="fb-clouds" fill="#ffffff" opacity="0.9">
      <g><ellipse cx="140" cy="78" rx="52" ry="18"/><ellipse cx="178" cy="66" rx="34" ry="14"/></g>
      <g><ellipse cx="520" cy="52" rx="44" ry="15"/><ellipse cx="552" cy="42" rx="26" ry="11"/></g>
    </g>
    <rect x="0" y="378" width="800" height="72" fill="#779555"/>
    <rect x="0" y="378" width="800" height="8" fill="#688348"/>
    <g id="fb-stack">
      <g id="fb-box">
        <rect x="290" y="198" width="220" height="24" rx="4" fill="#8a6134"/>
        <polygon points="270,222 250,180 330,196 310,222" fill="#e6b171"/>
        <polygon points="530,222 550,180 470,196 490,222" fill="#dda964"/>
        <rect x="270" y="220" width="260" height="152" rx="6" fill="#d9a15e"/>
        <rect x="270" y="220" width="260" height="30" fill="#c08c4a" opacity="0.55"/>
        <rect x="384" y="220" width="8" height="152" fill="#b9834a" opacity="0.6"/>
      </g>
      <g id="fb-fox">
        <path id="fb-tail" d="M -34 -30 C -78 -18 -92 -52 -76 -70 C -66 -80 -50 -74 -46 -60 C -60 -62 -64 -50 -52 -44 C -44 -40 -38 -38 -34 -38 Z" fill="#f48813"/>
        <path d="M -74 -66 C -70 -76 -58 -78 -52 -72 C -58 -64 -66 -62 -74 -66 Z" fill="#fffef1"/>
        <ellipse cx="0" cy="-36" rx="46" ry="33" fill="#f48813"/>
        <ellipse cx="16" cy="-28" rx="19" ry="21" fill="#fffef1"/>
        <rect x="-20" y="-16" width="9" height="16" rx="4" fill="#e07708"/>
        <rect x="22" y="-16" width="9" height="16" rx="4" fill="#e07708"/>
        <g id="fb-head">
          <polygon points="-16,-88 -6,-64 -24,-66" fill="#f48813"/>
          <polygon points="30,-90 36,-64 16,-68" fill="#f48813"/>
          <polygon points="-14,-82 -8,-68 -20,-70" fill="#cc4a2a"/>
          <polygon points="28,-84 32,-68 18,-70" fill="#cc4a2a"/>
          <circle cx="8" cy="-52" r="26" fill="#f48813"/>
          <ellipse cx="24" cy="-44" rx="15" ry="11" fill="#fffef1"/>
          <circle cx="34" cy="-46" r="4.5" fill="#272831"/>
          <circle cx="2" cy="-56" r="3.4" fill="#272831"/>
          <circle cx="18" cy="-54" r="3.4" fill="#272831"/>
        </g>
      </g>
      <g id="fb-bug">
        <ellipse cx="0" cy="-2" rx="10" ry="8" fill="#cc1d31"/>
        <circle cx="-9" cy="-6" r="5" fill="#272831"/>
        <circle cx="-2" cy="-5" r="1.6" fill="#272831"/>
        <circle cx="4" cy="-3" r="1.6" fill="#272831"/>
        <ellipse cx="4" cy="-11" rx="7" ry="4" fill="#9dc7c8" opacity="0.85" transform="rotate(-18 4 -11)"/>
      </g>
      <g id="fb-boxfront">
        <rect x="270" y="220" width="260" height="152" rx="6" fill="#d9a15e"/>
        <rect x="270" y="220" width="260" height="30" fill="#c08c4a" opacity="0.55"/>
      </g>
    </g>
    <g id="fb-fireflies" fill="#f2cd0f">
      <circle class="fb-fly" cx="200" cy="180" r="4"/>
      <circle class="fb-fly" cx="620" cy="150" r="3.4"/>
      <circle class="fb-fly" cx="420" cy="110" r="3"/>
      <circle class="fb-fly" cx="560" cy="250" r="3.6"/>
    </g>
  </g>
  <rect id="fb-dusk" x="0" y="0" width="800" height="450" fill="#6d13ec" opacity="0"/>
</svg>`;

const CSS = `
.scene-fox-box { width: 100%; height: 100%;
  filter: saturate(calc(0.18 + var(--awake, 0) * 0.35)) brightness(0.96);
  transition: filter 0.7s ease-out; }
.scene-fox-box[data-awake="full"] { filter: none; }
.scene-fox-box svg { width: 100%; height: 100%; display: block; }
.scene-fox-box g, .scene-fox-box path, .scene-fox-box rect { transform-box: fill-box; }

#fb-zoom { transform-origin: 400px 280px; transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1); }
#fb-stack { transform-origin: 400px 372px; }
#fb-fox { transform: translate(392px, 218px); transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1); }
#fb-head { transform-origin: 8px -52px; transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
#fb-tail { transform-origin: -34px -34px; }
#fb-bug { visibility: hidden; transition: transform 1.2s linear; }
#fb-boxfront { visibility: hidden; }
#fb-fireflies .fb-fly { opacity: 0; }
#fb-dusk { pointer-events: none; transition: opacity 1.2s ease-out; }
#fb-sun { transition: transform 1.2s ease-out, fill 1.2s ease-out; }

/* ---- page base poses ---- */
[data-page="p1"] #fb-fox { transform: translate(392px, 206px); }
[data-page="p1"][data-cue-sit] #fb-fox { transform: translate(392px, 218px) scale(1, 0.93); }

[data-page="p2"] #fb-zoom { transform: scale(1.24); }
[data-page="p2"][data-cue-reveal] #fb-zoom { transform: scale(1); }

[data-page="p3"] #fb-bug { visibility: visible; transform: translate(150px, 408px); }
[data-page="p3"][data-cue-crawl] #fb-bug { transform: translate(262px, 260px) rotate(-14deg); }

[data-page="p4"] #fb-bug { visibility: visible; transform: translate(300px, 206px); }
[data-page="p4"][data-cue-lean] #fb-head { transform: rotate(22deg); }

[data-page="p5"] #fb-bug { visibility: visible; transform: translate(330px, 206px); }
[data-page="p5"] #fb-head { transform: rotate(14deg); }
[data-page="p5"][data-cue-hop] #fb-bug { animation: fb-bug-hop 0.7s cubic-bezier(0.3, 0, 0.4, 1) forwards; }
@keyframes fb-bug-hop {
  0% { transform: translate(330px, 206px); }
  50% { transform: translate(368px, 128px) rotate(10deg); }
  100% { transform: translate(408px, 150px); }
}

[data-page="p6"] #fb-bug { visibility: visible; transform: translate(408px, 150px); }
[data-page="p6"][data-cue-jump] #fb-fox { animation: fb-fox-jump 0.58s cubic-bezier(0.3, 0, 0.4, 1); }
@keyframes fb-fox-jump {
  0% { transform: translate(392px, 218px); }
  42% { transform: translate(392px, 150px) scale(0.97, 1.08); }
  100% { transform: translate(392px, 218px) scale(1.02, 0.94); }
}
[data-page="p6"][data-cue-land] #fb-box { animation: fb-box-squash 0.45s ease-out; }
[data-page="p6"][data-cue-land] #fb-bug { animation: fb-bug-bounce 0.45s ease-out; }
@keyframes fb-box-squash {
  35% { transform: scale(1.015, 0.96); }
  100% { transform: none; }
}
@keyframes fb-bug-bounce {
  35% { transform: translate(408px, 142px); }
  100% { transform: translate(408px, 150px); }
}
#fb-box { transform-origin: 400px 372px; }

[data-page="p7"] #fb-bug { visibility: visible; transform: translate(408px, 150px); }
[data-page="p7"][data-cue-wobble] #fb-stack { animation: fb-stack-rock 1.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards; }
@keyframes fb-stack-rock {
  0% { transform: rotate(0deg); }
  22% { transform: rotate(-5deg); }
  50% { transform: rotate(6deg); }
  74% { transform: rotate(-3deg); }
  100% { transform: rotate(10deg) translate(4px, 8px); }
}

[data-page="p8"] #fb-stack { transform: rotate(10deg) translate(4px, 8px); }
[data-page="p8"] #fb-boxfront { visibility: visible; }
[data-page="p8"] #fb-fox { transform: translate(360px, 322px) scale(0.9); transition-duration: 0.7s; }
[data-page="p8"] #fb-bug { visibility: visible; transform: translate(300px, 296px); transition-duration: 0.7s; }
[data-page="p8"][data-cue-peek] #fb-fox { transform: translate(360px, 276px) scale(0.9); }
[data-page="p8"][data-cue-peek] #fb-bug { transform: translate(300px, 246px); }

/* ---- full wake: dusk + fireflies + drifting clouds ---- */
[data-awake="full"] #fb-dusk { opacity: 0.16; }
[data-awake="full"] #fb-sun { transform: translate(0, 22px); fill: #f48813; }
[data-awake="full"] .fb-fly { animation: fb-fly-pulse 2.4s ease-in-out infinite alternate; }
[data-awake="full"] .fb-fly:nth-child(2) { animation-delay: 0.6s; }
[data-awake="full"] .fb-fly:nth-child(3) { animation-delay: 1.1s; }
[data-awake="full"] .fb-fly:nth-child(4) { animation-delay: 1.7s; }
@keyframes fb-fly-pulse {
  from { opacity: 0.15; transform: translateY(0); }
  to { opacity: 1; transform: translateY(-14px); }
}

[data-reduced] * { animation-duration: 0.01s !important; transition-duration: 0.01s !important; }
`;

const createFoxBoxScene: SceneFactory = (): Scene => {
  let root: HTMLDivElement | null = null;
  let tail: SVGElement | null = null;
  let clouds: SVGElement | null = null;

  return {
    mount(host, ctx: SceneCtx) {
      root = document.createElement("div");
      root.className = "scene-fox-box";
      root.dataset.page = ctx.pageId;
      if (ctx.reducedMotion) root.setAttribute("data-reduced", "");
      const style = document.createElement("style");
      style.textContent = CSS;
      root.appendChild(style);
      root.insertAdjacentHTML("beforeend", SVG);
      host.appendChild(root);
      tail = root.querySelector("#fb-tail");
      clouds = root.querySelector("#fb-clouds");
    },
    seek(t) {
      // continuous life while scrubbing: tail sway + cloud drift ride t
      if (tail) tail.style.transform = `rotate(${(-10 + t * 22).toFixed(2)}deg)`;
      if (clouds) clouds.style.transform = `translate(${(t * 26).toFixed(2)}px, 0)`;
    },
    cue(name) {
      root?.setAttribute(`data-cue-${name}`, "");
    },
    setAwake(a) {
      if (!root) return;
      root.style.setProperty("--awake", a.toFixed(3));
      if (a >= 0.999) root.setAttribute("data-awake", "full");
    },
    destroy() {
      root?.remove();
      root = tail = clouds = null;
    },
  };
};

export default createFoxBoxScene;
