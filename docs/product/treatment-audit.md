# Surface treatment audit

Last audited: 2026-07-19

This is the complete treatment decision matrix for the active product tree.
Each visible surface has one outcome: solid, Light Glass, atmospheric glow,
spotlight glow, static sheen, animated sheen, or no treatment. “Solid” includes
story-local opaque fills where the reusable neutral solid token would be the
wrong color; those variants must still avoid backdrop blur.

## Product routes

| Route / feature | Purpose | Decision | Implementation or guardrail |
| --- | --- | --- | --- |
| `/` page shell | Minimal entrance to the only active story | No treatment | The white paper/page is content ground, not an elevated surface. |
| `/` story title and description | Identify and explain the story | No treatment | Semantic text remains directly on the page. |
| `/` Enter the story action | Primary navigation action | Solid | Story-green opaque fill; native link focus remains explicit. |
| `/experience/[storyId]` story matte | Dissolve authored 4:3 media into the page | No treatment | Must equal `stage.backdrop.color`; never receives glow, gradient, blur, or translucency. |
| `/content/[storyId]/…` | Byte-range media delivery | No treatment | Nonvisual route. |
| `/dev/viewport` shell and iframe | Exact-size QA harness | No treatment | Diagnostic framing is intentionally plain and does not enter product styling. |
| `/dev/design-system` page ground | Inspect portable recipes | No treatment | Neutral catalog ground keeps treatment comparisons honest. |
| Catalog fixture frames and contract cards | Bound and explain examples | Solid | Plain neutral diagnostic containers; they are not examples of temporary elevation. |
| Catalog Light Glass fixture | Prove the exact recipe over contrast | Light Glass | Exact source-backed recipe. |
| Catalog fallback fixture | Prove no-backdrop-filter readability | Light Glass fallback | Explicit opaque diagnostic branch with no backdrop filter. |
| Catalog Atmospheric Glow fixture | Show broad first-look orientation | Atmospheric glow | Provisional source-guided recipe; no production use in Fern. |
| Catalog Spotlight Glow fixture | Show one local directional target | Spotlight glow | Provisional source-guided recipe. |
| Catalog sheen fixtures | Show priority and transformation states | Static / animated sheen | Provisional; animated example stops under reduced motion. |
| Catalog solid fixture | Show durable neutral chrome | Solid | Stories-native stable token, not claimed as a copied Figma recipe. |

## Story player

| Feature | Purpose | Decision | Implementation or guardrail |
| --- | --- | --- | --- |
| Media deck, plates, motion layers, posters | Present the authored illustration and fallback media | No treatment | No CSS filter, opacity wash, vignette, or design-system effect. |
| Hidden media state badge and action-safe guide | Developer diagnostics | No treatment | Hidden in the product player; existing dev styling is not product chrome. |
| Story title island | Persistent identity | Solid | Neutral design-system solid; no backdrop filter. |
| Watch / Read-with-me group | Persistent mode navigation | Solid | Neutral design-system solid; native buttons and `aria-pressed`. |
| Active mode indicator | Communicate the selected persistent mode | Solid | Opaque story-accent tint; interruptible transform, stopped under reduced motion. |
| Live narration / dialogue | Temporary synchronized reading content over media | Light Glass | Exact recipe on the outer semantic content surface only. |
| Retained Read-with-me passage | Temporary child-priority reading surface | Light Glass | Reuses the same outer surface; lines are not nested glass. |
| Character portraits | Identify speaking characters | No treatment | Authored imagery with a neutral outline; never blurred or refracted. |
| Word states and active word highlight | Expose reading synchronization | No treatment | Semantic color/highlight treatment, not a container surface. |
| Start interruption | Ask for the initial playback decision | Light Glass | Temporary modal-like layer; the nested action remains solid. |
| Begin story action | Start narration | Solid | Opaque story-accent button inside one glass parent; no nested glass. |
| Transport island | Persistent replay and play/pause/continue controls | Solid | Neutral design-system solid; no backdrop filter. |
| Replay and play/pause/continue actions | Control the performance clock | Solid | Story-local opaque/transparent button states inside the solid island. |
| Visually clipped seek input | Preserve QA/recovery seeking | No treatment | Remains accessible to the harness and absent from visible product chrome. |
| Playback error alert | Report an actionable failure | Solid | Opaque high-contrast error fill; no backdrop blur. |
| Performance and soundscape audio | Authoritative synchronized playback | No treatment | Nonvisual semantic media elements. |

## Drag-to-guide interaction

| Feature | Purpose | Decision | Implementation or guardrail |
| --- | --- | --- | --- |
| Full-stage interaction layer | Own pointer, touch, and keyboard interaction | No treatment | Transparent semantic interaction plane; it must not tint the authored matte. |
| Authored path | Explain direction | No treatment | Story-world line work, not a container or design-system effect. |
| Goal ring | Establish the one intended target | Spotlight glow | Reusable local field mapped to Fern gold; does not replace the visible ring or focus. |
| Prompt | Explain the current action | Solid | Opaque dark story-local pill; no backdrop blur. |
| Draggable light token | Represent Pipkin’s guide light | No treatment | Its glow is authored object appearance, not surface hierarchy. |
| Token keyboard focus | Show current keyboard target | No treatment | Explicit high-contrast outline remains independent of Spotlight Glow. |
| Completion announcement | Announce success | No treatment | Visually hidden semantic `output` with polite live region. |

## Explicit non-selections

- Atmospheric glow has no current production surface: Fern’s exact white matte
  and watercolor media already provide atmosphere.
- Static sheen has no current production surface: no existing feature needs a
  novelty or priority edge beyond its present hierarchy.
- Animated sheen has no current production surface: media loading is handled by
  posters and recovery state, and a decorative sweep would imply progress the
  runtime cannot measure.
- No button, portrait, word, nested passage line, or persistent control receives
  Light Glass.
