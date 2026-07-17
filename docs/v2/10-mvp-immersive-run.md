# MVP immersive-experience run

This is the autonomous execution contract for moving stories.sh from the
successful Fern proof of concept to the first maintainable MVP architecture.
The run has two inseparable outcomes:

1. retire the superseded POC surface so the active repository describes one
   product and one runtime; and
2. prove a Floema-like layered story scene inside the complete Fern experience,
   using the current Grok Imagine access and a provider-neutral path for a later
   Seedance evaluation.

The run ends with an owner-playable immersive slice, not a production catalog,
Story Studio, deterministic film renderer, Aval integration, or wholesale
regeneration of the Fern story.

## Starting point

- The current branch is `codex/interactive-story-runtime` at the successful Fern
  POC. The working tree is clean and is one local commit ahead of its remote.
- Fern and the Silent Seed Bells plays end to end in Watch and Read-with-me with
  expressive narration, sentence-level media, continuous motion, soundscape,
  one hero interaction, responsive layouts, reverse seeking, and clean QA.
- The active checkout tracks about 257 MB across 962 files.
- Approximately 99 MB belongs to the retired V1 stories and Pip regression
  package, 60 MB is duplicated provider-original media, and 24 MB is rejected
  generation output. Git history already preserves these artifacts.
- The present visual deck is still one flattened opaque video at a time. White
  matte variation reveals the rectangular video surface, so it cannot produce
  the intended layered, spatial scene by itself.
- Grok Imagine is available through the owner's existing signed-in Chrome
  session. Seedance is deliberately unavailable during this run.

## MVP definition of done

The run is complete only when all of the following are true.

### Repository

1. An annotated local `poc-success` tag preserves the starting commit and work
   continues on `codex/mvp-immersive-runtime`. Nothing is pushed.
2. The V1 routes, engine, UI, content, terminal pipeline, POC documents, old
   transcript, and obsolete proof fixtures are removed from the active tree.
3. Pip and the Lantern Seed and the four V1 story packages are removed from the
   active tree. Their history remains reachable through Git.
4. Fern is the sole active story package. It retains its approved performance,
   alignment, runtime delivery media, canonical references, beat board,
   continuity, prompts, and compact provider provenance.
5. Rejected and redundant binary candidates are removed after their provider
   IDs, prompts, hashes, decisions, and rejection reasons are retained in
   manifests. The active tree does not act as a provider-download archive.
6. The authoritative v2 product documents are promoted into a stable MVP
   documentation structure. POC roadmaps and proof reports are removed; useful
   Aval research is retained under research.
7. Project skills describe the provider-neutral MVP workflow and reference only
   live documents and scripts.
8. README, package scripts, imports, links, and default routes describe only the
   current product. The tracked working-tree payload is below 140 MB after new
   MVP media is included.

### Immersive runtime

9. The story schema can describe an ordered scene composition containing a
   background plate, zero or more motion layers, a foreground/effect layer,
   state-shaped clips, responsive anchors, fallback media, and provider-neutral
   source/rendition metadata.
10. The performance clock, reading units, safe stops, continuity ledger, and
    story graph remain the semantic authority. Visual layers never become a
    second story timeline.
11. A reusable layered renderer supports at minimum:
    - opaque plates or video;
    - native alpha WebM motion layers;
    - an opaque/poster fallback when alpha delivery is unsupported;
    - `enter`, alternate living holds, finite action, resolved hold, and exit;
    - latest-intent-wins state changes;
    - first-frame bridging so clip changes do not flash;
    - normalized layer geometry across responsive layouts; and
    - reduced-motion behavior.
12. Resource ownership is bounded. The runtime loads the current composition
    and its likely next state, pauses hidden media, and does not mount or preload
    the entire story's layered library.
13. Runtime code does not mention Grok or Seedance. Provider selection belongs
    to production provenance; accepted delivery renditions are local assets.

### Owner-playable slice

14. Fern still plays completely in both modes. Unconverted beats may retain
    their approved flattened-video presentation during this MVP.
15. At least three meaningful moments use the layered renderer:
    - an opening or establishing living composition;
    - the Pipkin silver-path hero interaction; and
    - a resolved closing composition.
16. Those moments visibly dissolve into the page with no rectangular video
    boundary. At least one uses a genuinely transparent moving layer over an
    independent plate, not only CSS blur or a feathered rectangle.
17. The hero interaction changes the layered visual state. Watch performs the
    same canonical transition; Read-with-me waits for the child and retains its
    soft audio/visual handoff.
18. Desktop may add restrained pointer depth. Touch layouts retain the same
    composition without depending on hover, and reduced motion removes parallax
    and nonessential travel.
19. Dialogue, highlighting, title, modes, and transport remain accessible DOM
    UI floating within the scene rather than pixels baked into motion media.

### Validation and handoff

20. Experience lint, typecheck, production build, and real-browser playback QA
    pass after cleanup and after immersive integration.
21. Forward playback, reverse seeking, mode changes, hero completion, replay,
    Read-with-me dwell/resume, media failure fallback, and reduced motion produce
    no page error or unhandled rejection.
22. The 390x844, 430x932, 768x1024, 1024x768, 1440x900, and exact 1920x1080
    compositions have no horizontal overflow, retain complete semantic action,
    and keep controls at least 44px.
23. Beginning, midpoint, ending, alpha edge, and state-handoff frames are
    inspected for halos, dirty matte, continuity drift, flashes, and loops that
    repeat a transformation.
24. The dev server is left running on the Fern route and the handoff contains a
    short owner playtest checklist plus an explicit Seedance next-step gate.

## Target architecture

```text
performance clock + reading units + continuity
                     |
                     v
              semantic media state
                     |
                     v
            layered scene composition
       +-------------+-------------+
       |             |             |
  plate/atmosphere  actor/prop   effect/foreground
  opaque media      alpha state  alpha or DOM/canvas
       +-------------+-------------+
                     |
                     v
            responsive scene canvas
                     |
           accessible DOM story UI
```

The renderer is a delivery mechanism. It does not replace the narration-led
timeline or authorize generated clips to invent story state.

## Cleanup contract

Do cleanup as its own validated phase before changing the renderer. Use Git
history as the archive; do not create a new `archive/` directory inside the
repository.

### Keep and promote

- `content/fern-and-the-silent-seed-bells/` runtime deliveries, performance,
  alignment, canonical references, story contracts, and compact provenance;
- `docs/universe/` and the project-owned production skills;
- `/experience/[storyId]`, the byte-range content route, and `/dev/viewport`;
- `src/experience/` components required by the production player;
- performance narration, soundscape, experience ingest, lint, and playback QA
  scripts; and
- the useful product, format, responsive, runtime, production, and Aval research
  conclusions from `docs/v2/`.

### Remove after reachability review

- `content/fox-on-the-box`, `pop-pop-pop`, `the-boat-in-the-mist`,
  `the-ship-in-the-rain`, and `pip-and-the-lantern-seed`;
- `/read`, `/render`, the old library homepage, `src/components`, `src/engine`,
  and `src/lib/stories.ts`;
- V1-only authoring, grapheme, frame, ingest, prompt, and render scripts;
- `/dev/scrubber` and completed proof routes/components that have no production
  caller;
- `docs/01-*` through `docs/09-*`, the old decision log, the Claude transcript,
  completed POC roadmaps, and completed layout/playable-loop reports;
- the unused Fern planning placeholder;
- rejected provider binaries, unselected narration binaries, redundant mix
  previews, and duplicate provider originals after manifest compaction; and
- stale `.claude` project configuration if nothing live consumes it.

### Documentation destination

The cleanup should leave a compact structure similar to:

```text
docs/
  README.md
  HANDOFF.md
  DECISIONS.md
  product/
    charter.md
    experience-format.md
    responsive-stage.md
    runtime-architecture.md
    production-system.md
  mvp/
    immersive-run.md
  research/
    aval.md
    floema-motion-pattern.md
  universe/
```

Update every live path in skills, scripts, and documents atomically. Run the
baseline gates before deletion and again after each cleanup commit.

## Execution phases

### Phase 0 — Preserve and baseline

1. Verify the clean worktree and current HEAD.
2. Run the current typecheck, story lint, experience lint, and build.
3. Create the local POC tag and MVP branch; do not push either.
4. Record exact tracked file/byte counts and the retained Fern asset matrix.

Commit: `chore(repo): mark successful poc baseline`

### Phase 1 — Retire deprecated product surfaces

Remove V1 content, routes, engine/UI, scripts, docs, and unused proof routes as
one dependency-aware sequence. Replace the homepage with a minimal MVP entrance
that opens Fern rather than recreating a catalog. Repair imports, package scripts,
the viewport default, README, and lints until the production build is clean.

Commit in bounded units such as:

- `chore(repo): retire v1 poc surface`
- `docs(mvp): promote active product architecture`
- `chore(content): slim active Fern package`

### Phase 2 — Specify layered delivery

Add the smallest schema extension that can represent layered compositions and
state-shaped motion without hard-coding Fern. Preserve backwards parsing only
where the still-active Fern fallback needs it. Add linter checks for:

- unique layer IDs and deterministic z-order;
- valid plate, motion, poster, and rendition paths;
- legal motion roles and transition policies;
- alpha media with an explicit opaque fallback;
- stable geometry and responsive anchors; and
- no narrative transformation inside a declared living hold.

Document a source-master versus web-rendition boundary so Grok and a future
Seedance pass can feed the same contract.

Commit: `feat(experience): define layered scene delivery`

### Phase 3 — Build the alpha production and playback proof

Start from existing approved Fern media so progress does not depend on a cloud
generation succeeding. Extend the border-connected matte approach to motion:

1. decode a candidate clip into RGBA frames;
2. remove only neutral near-white regions connected to the frame boundary;
3. feather the connected edge without erasing internal white details;
4. encode a native VP9 alpha WebM rendition;
5. retain the current MP4/poster as fallback; and
6. inspect real beginning, middle, end, and edge pixels.

Build the reusable renderer with active/standby ownership and a brief canvas
bridge between video states. Prefer native browser alpha for this MVP. Treat a
packed-alpha H.264/WebGL rendition as a bounded stretch experiment, not a reason
to vendor Aval or delay the working native-alpha slice.

Commit in two units:

- `feat(media): add connected-matte alpha pipeline`
- `feat(media): render layered motion states`

### Phase 4 — Produce the three-moment Fern slice

Use existing approved plates and clips first. Use the signed-in Grok Imagine
session only when a purpose-built source materially improves one of the three
moments. Ask Grok for fixed-camera native-4:3 motion on a clean, textureless
white surround with the complete watercolor island clear of the frame edge.
Generate from canonical Fern, Pipkin, bell, and location references.

Prioritize this order:

1. **Silver path:** independent plate plus Pipkin/route action and resolved
   state, because it proves child-controlled visual state.
2. **Opening:** quiet environment with a restrained living foreground or
   atmosphere layer.
3. **Closing:** resolved friends/bells motion over a stable morning plate.

Two candidates are enough where selection matters. Stop a repair chain after
three targeted attempts. If Grok cannot produce a cleanly matteable source,
continue with an honest derived-alpha version of an approved existing clip and
record the limitation; lack of a new Grok asset is not a blocker for the runtime
proof.

Commit each accepted moment independently with exact prompt, URL/card ID, source
hash, matte settings, delivery hashes, and acceptance/rejection reason.

### Phase 5 — Make the scene feel spatial

Integrate the three layered moments into the real Fern route. Add only subtle,
story-serving depth:

- 1–2 percent pointer parallax on eligible desktop layers;
- calm idle variation rather than synchronized looping;
- soft foreground occlusion or watercolor-wash handoffs;
- canvas/frame bridging across state clips;
- ambience and living motion during Read-with-me waits; and
- touch/reduced-motion equivalents that preserve meaning.

Do not add game-like camera motion, ornamental particles everywhere, or a new
interaction recipe merely to demonstrate the renderer.

Commit: `feat(experience): add immersive Fern story slice`

### Phase 6 — Harden and hand off

Run strict gates and the browser matrix. Measure which media is mounted and
transferred at the opening, hero, and closing states. Reverse-seek repeatedly
across layered and flattened boundaries. Exercise fallback by making an alpha
source unavailable in a controlled fixture. Repair the earliest responsible
layer and repeat until the definition of done passes.

Leave the clean dev server running at:

`http://localhost:3000/experience/fern-and-the-silent-seed-bells`

Commit: `test(experience): validate immersive MVP slice`

## Seedance boundary

Do not request, simulate, or block on Seedance access during this run. The
runtime and manifests must remain ready for it through provider-neutral source
metadata and separate delivery renditions.

After owner approval of the MVP, run one controlled provider comparison using
the same hero beat, references, duration, and acceptance rubric. Seedance adds
value only if it materially improves at least one of:

- character/prop consistency across state clips;
- use of multiple image/video/audio references;
- matched entrance/idle/action/resolved handoffs;
- clean-plate or isolated-subject generation for matting;
- camera and action adherence; or
- production time per accepted beat.

Do not migrate providers because of a feature list alone. Compare accepted
output, retries, cleanup labor, and web-delivery quality.

## Autonomous loop and blockers

At every automatic continuation:

1. read the current handoff and this contract;
2. inspect Git and the live package/status matrix;
3. select the earliest dependency-unblocked phase or failed acceptance gate;
4. implement or generate the smallest complete unit;
5. inspect, integrate, validate, document, and commit it; and
6. immediately continue until every terminal condition passes.

Do not stop at a commit boundary, after a generation finishes, because a check
fails, or to report routine progress. Diagnose and continue.

Pause only for a CAPTCHA/human verification screen, an unrecoverable signed-out
provider session, exhausted quota or purchase/upgrade request, missing secret or
OS permission, a destructive action outside this repository, or three genuinely
different failures of the same essential asset with no honest fallback. A Grok
failure is not an essential-asset blocker while an existing approved Fern clip
can prove the renderer.

## Goal prompt

```text
Take stories.sh from its successful Fern proof of concept to the owner-playable
immersive MVP slice defined in docs/v2/10-mvp-immersive-run.md. Treat that file
as the execution contract. Use the project-owned author-story-film and
create-lanternleaf-scenes skills, the existing signed-in Grok Imagine session in
Chrome when purpose-built media is valuable, and the current local tooling. I do
not have Seedance access for this run: do not request it, simulate it, or block
on it. Keep the runtime and manifests provider-neutral so we can evaluate
Seedance later.

Run as a long-lived autonomous loop across automatic continuations. Start by
verifying the clean POC baseline, create an annotated local poc-success tag and
the branch codex/mvp-immersive-runtime, and do not push. Then complete the phases
in dependency order: retire deprecated V1/Pip code, content, scripts, docs, and
proof fixtures; promote the surviving MVP documentation; slim redundant and
rejected binaries while retaining compact provenance; define layered scene
delivery; build the connected-matte alpha pipeline and reusable layered renderer;
integrate at least the opening, silver-path interaction, and closing Fern moments;
polish their spatial behavior; and complete release QA and owner handoff.

Use Git history as the archive—do not create an archive directory. Preserve the
approved Fern performance, word alignment, reading units, safe stops, beat board,
continuity, canonical references, final runtime media, and useful provider
metadata. Before deleting a binary candidate, retain its prompt, provider ID or
URL, hash, decision, and rejection reason in a compact manifest. Keep docs/universe
and both project skills, but update all live links and make the story-film skill
provider-neutral. The active tracked working tree should finish below 140 MB,
including new MVP media.

Do not redesign the story timeline. The expressive performance clock, reading
units, safe stops, and continuity remain authoritative. The layered renderer is
only a visual delivery mechanism. It must support independent plates and alpha
motion states, enter/idle/action/resolved/exit roles, latest-intent-wins changes,
first-frame bridging, bounded current/next resource ownership, responsive
geometry, reduced motion, and an opaque/poster fallback. Runtime code must not
mention Grok or Seedance.

Make the complete Fern story continue to work in Watch and Read-with-me. At
least three meaningful moments must use the layered renderer, at least one must
contain a genuinely transparent moving layer over an independent plate, and the
silver-path child interaction must change the layered visual state in Read mode
and follow the same canonical outcome in Watch. Unconverted beats may retain
their approved flattened videos during this MVP. Use restrained pointer depth
only on desktop; touch and reduced-motion behavior must preserve meaning.

Use existing approved Fern media first so progress does not depend on Grok.
When Grok can materially improve a target moment, generate fixed-camera native
4:3 motion from the canonical references on a clean textureless white surround,
preserve exact provenance, inspect beginning/middle/end frames, and derive alpha
with the connected-border matte pipeline. Use two candidates when selection
matters and at most three targeted repairs per chain. If Grok cannot produce a
cleanly matteable clip, use an honest derived-alpha version of an existing
approved clip and continue; do not weaken continuity or invent story action.

At each continuation, resume from the durable handoff and on-disk manifests,
take the earliest dependency-unblocked phase or failed gate, complete the
smallest coherent unit, inspect it, integrate it, run proportional checks,
update documentation/provenance, commit with a Conventional Commit message, and
continue immediately. Do not stop for routine reports, after one generation,
at a commit boundary, or because a test failed. Do not buy credits, upgrade a
plan, bypass human verification, expose secrets, push, start Story Studio, vendor
Aval, build deterministic film output, or attempt a full Fern regeneration.

The goal is complete only when every MVP definition-of-done item in the contract
passes: cleanup is coherent; the active tree is below the size target; the
layered schema, alpha pipeline, renderer, fallbacks, and resource ownership are
working; the three Fern moments are immersive with no rectangular boundary;
the hero interaction and both reading modes work; strict experience lint,
typecheck, build, and real-browser QA pass; forward/reverse playback, replay,
Read-with-me waits, media failure, and reduced motion are error-free; all six
responsive compositions are clean; and the handoff records a Seedance comparison
gate and short owner playtest checklist. Then leave a clean dev server running
and the Fern route open for me to play.

Pause only for the legitimate blockers in the contract. If one occurs, record
the exact state, attempts, URL/file, and smallest user action needed. Otherwise
keep going until the terminal condition is genuinely satisfied.
```
