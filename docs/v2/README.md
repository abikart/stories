# stories.sh v2 — interactive story films

This directory is the authoritative product and engineering specification for
the next stories.sh proof of concept. The original POC remains documented in
`docs/01-*` through `docs/09-*`; it is a useful mechanics prototype, but its
page-normalized scrub timeline is not the foundation for v2.

## Start here

1. [Product charter](01-product-charter.md) — product promise, experience modes,
   scope, and quality bar.
2. [Experience format](02-experience-format.md) — the story graph and production
   package shared by web and film outputs.
3. [Responsive stage](03-responsive-stage.md) — the one-master-video contract,
   safe areas, presets, anchors, and device behavior.
4. [Runtime architecture](04-runtime-architecture.md) — performance clock,
   media state machine, overlays, interactions, and rendering.
5. [Production system](05-production-system.md) — audio/visual workflow and the
   path to a sustainable 12-story first season.
6. [POC roadmap](06-poc-roadmap.md) — ordered milestones and acceptance gates.
7. [Aval assessment](07-aval-assessment.md) — deferred evaluation of Aval's
   compiled motion runtime, applicable paradigms, integration boundaries, and
   post-M7 experiment gate.
8. [Lanternleaf layout proof](08-lanternleaf-layout-proof.md) — candidate 4:3
   media contract, responsive page/film compositions, and measured QA. This is
   a review artifact and does not yet supersede the responsive-stage contract.
9. [Session handoff](HANDOFF.md) — current branch, completed work, known facts,
   and the exact next action. Update it at the end of every substantial session.

## Decision hierarchy

When documents disagree, use this order:

1. `docs/v2/` over the original POC docs.
2. Later explicit entries in `docs/v2/DECISIONS.md` over earlier v2 prose.
3. The simplest implementation that preserves expressive performance,
   responsive composition, and one package producing web plus film.

## Core sentence

> An original animated story performance that waits for the child, follows
> their pace, and lets them help the story happen.
