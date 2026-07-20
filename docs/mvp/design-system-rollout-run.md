# Design-system rollout run

Use this prompt for a future autonomous audit that expands the code-first
design system across existing and newly added features without turning effects
into decoration.

```text
/goal Owner-deliver the Stories design-system rollout defined by
docs/product/design-system.md. Run as a long-lived autonomous loop across
automatic continuations until every terminal gate is genuinely satisfied.

Treat the Figma 1D Guardrails file as the visual and semantic source:
https://www.figma.com/design/VPpFDRaovwQeHrSM86fcSv/1D-Guardrails?node-id=313-50940
Reuse the existing code primitives in src/design-system before creating new
ones. Preserve semantic DOM, native controls, explicit focus, minimum touch
targets, accessible text, reduced motion, the exact story matte, active media
compositions, Read-with-me behavior, synchronization, fallback media, reverse
settlement, and responsive presets.

At every continuation, read docs/HANDOFF.md and take the earliest failed or
unblocked checkpoint. Audit one bounded feature family at a time. For every
surface, record its product purpose first, then choose exactly one outcome:
solid surface, Light Glass, atmospheric glow, spotlight glow, static sheen,
animated sheen, or no treatment. Light Glass is only temporary elevation and
focus; never use it for persistent chrome, static background panels, every
container, nested actions, or decoration. Glow orients attention and must not
simulate glass. Atmospheric glow is broad and diffused; spotlight glow is
local, tighter, and single-target. Sheen communicates priority or active
transformation; animated sheen must correspond to a real state change and stop
under reduced motion. Do not add atmosphere behind Fern's solid-white stage.

For each checkpoint: inspect the relevant Figma node and current code, update
the treatment registry and tokens only when a reusable gap exists, implement
the smallest coherent feature unit, add or update the /dev/design-system
fixture, inspect desktop and phone renderings, verify keyboard and touch
behavior, run proportional automated checks, update design-system analysis and
handoff diagnostics, and commit with a Conventional Commit message. Continue
immediately after each commit; do not stop for routine choices, a status report,
the first failed approach, or a commit boundary. Do not push, buy services,
change story content, weaken accessibility, or hide media seams with effects.

Complete only when every existing feature has a documented treatment decision,
stable treatments have exact source-backed recipes, provisional treatments are
either audited against their detailed Figma frames or explicitly retained as
provisional, the catalog demonstrates all supported states and fallbacks,
Chromium and WebKit/Safari have been visually inspected, reduced-motion and
backdrop-filter failure paths pass, all story QA and design-system QA pass, six
responsive presets are clean, before/after evidence and architecture/handoff
docs are current, Git is clean, and a dev server is running with both
/dev/design-system and /experience/fern-and-the-silent-seed-bells ready for
owner playtest. If Figma access or another true blocker remains, exhaust three
materially different in-scope approaches, preserve the isolated evidence, and
report the exact smallest owner action needed without weakening the gates.
```
