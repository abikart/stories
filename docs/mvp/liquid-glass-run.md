# Liquid glass feature run

Status: implemented and owner-playable on 2026-07-17

Owner target: `/experience/fern-and-the-silent-seed-bells`

## Delivered

- Aave-style portable displacement refraction over MediaDeck's live layered
  media; the rejected extruded React Bits material experiment remains in Git
  history only.
- One stage WebGL context, no duplicate video elements, cached portable lens
  profiles, source-only refraction targets, DPR cap, and demand rendering.
- Reusable title, dialogue, mode, start, and transport surfaces with semantic
  DOM content above the canvas.
- CSS initialization/context-loss fallback and in-place restoration.
- `/dev/glass` grid/still/video fixture with pill, rectangle, circle, controls,
  and renderer diagnostics.
- Chromium and Playwright WebKit displaced-pixel/recovery QA plus native Safari
  inspection and the full Fern story regression matrix.

## Gate commands

```sh
pnpm test:glass
pnpm qa:glass
pnpm typecheck
pnpm lint:experiences
pnpm qa:experience -- fern-and-the-silent-seed-bells
pnpm build
```

Architecture and acceptance details are durable in
[`docs/product/glass-surfaces.md`](../product/glass-surfaces.md). Evidence is in
`docs/evidence/liquid-glass/`. The rejected custom optics remain available only
in Git history before `revert(glass): remove rejected optics pass`; they are not
part of the active implementation.
