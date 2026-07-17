# Session handoff

Last updated: 2026-07-17

## Read first

- Branch: `codex/mvp-immersive-runtime`
- Preserved baseline: annotated local tag `poc-success`
- Execution contract: `docs/mvp/immersive-run.md`
- Product index: `docs/README.md`
- Decision log: `docs/DECISIONS.md`

## Current state

- The Fern POC is preserved at `poc-success`; the immersive MVP is complete on
  `codex/mvp-immersive-runtime` and has not been pushed.
- V1/Pip content, superseded routes and engine code, obsolete proofs/scripts,
  rejected binaries, and historical POC documents are absent from the active
  tree. Git history remains their archive.
- Fern is the sole active package. Its expressive performance, alignment,
  Read-with-me units, continuity, soundscape, interaction, and full flattened
  presentation remain intact.
- The runtime now accepts provider-neutral ordered compositions with plates,
  native or packed-alpha layers, normalized geometry, and opaque fallbacks. It
  mounts only the current and likely-next composition.
- Three story moments use real moving transparency: the opening, the complete
  silver-path hero interaction, and the emotional close. Eight alpha renditions
  were compiled from approved media; no new Grok generation was necessary.
- Owner playtesting established the standard scene-blending treatment: one
  exact solid `stage.backdrop.color` shared by source media and the page. Fern
  uses `#FFFFFF`; the poster atmosphere, accent gradient, blur, and opacity wash
  have been removed from the standard runtime path.
- Dialogue identity and placement are now package content. Fern's four scenes
  currently use `top-left`; narrated lines have no visible label, Fern/Pipkin
  speech uses canonical watercolor portraits, and constrained layouts dock the
  same copy safely.
- The active checkout is 139 files / 103,098,739 bytes. Fern is 84 files /
  78,864,822 bytes, including eight alpha videos totaling 10,771,186 bytes.

## Owner playtest

Open <http://localhost:3000/experience/fern-and-the-silent-seed-bells>, then:

1. In Watch, play from the beginning and notice the moving watercolor edge has
   no rectangular video boundary.
2. Let the story reach the silver path; confirm the guide interaction changes
   the layered visual state and Watch completes the same action automatically.
3. Switch to Read-with-me, complete one child passage, and feel the soft
   ambience/visual wait and resume.
4. Resize to phone portrait and desktop landscape. Confirm the whole 4:3 art,
   dialogue, and controls remain usable without horizontal scrolling.
5. Replay the ending and drag the hidden test seek control only through the QA
   harness if reverse-settlement behavior needs inspection.

Subjective approval should focus on alpha-edge cleanliness, whether the plate
and motion feel like one illustration, transition softness, and whether the
silver-path action feels meaningfully more immersive than the flattened beats.

## Validation record

- `pnpm typecheck` — pass
- `pnpm lint:experiences` — pass; 55 referenced assets
- `pnpm build` — pass
- `pnpm qa:experience -- fern-and-the-silent-seed-bells` — pass: Watch,
  Read-with-me, hero completion, reverse scrub, ending, reduced motion, and six
  responsive presets
- Native-alpha files — eight VP9 WebMs with `ALPHA_MODE=1`; representative
  composite and mask inspected against a contrasting plate
- Browser console — no page error or unhandled rejection during forward state
  settlement
- Solid-matte regression — computed page, stage, media, and active-layer colors
  all equal `stage.backdrop.color`; no runtime background image, filter, opacity
  wash, pseudo-atmosphere, or atmosphere DOM element

## Seedance gate

Do not migrate providers by default. When access is worthwhile, regenerate only
the silver-path hero state family with the same references and semantic start /
hold / action / resolve contract. Adopt Seedance only if a side-by-side review
shows a material improvement in character/prop continuity, matched state
handoffs, transparent or mask-ready delivery, or accepted output per hour. The
runtime and package schema require no provider-specific changes.
