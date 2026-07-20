# Stories design system

## Scope

Stories now has a small code-first design system for product tokens and
purposeful surface treatments. The source of truth is:

- CSS tokens and portable classes in `src/design-system/treatments.css`;
- typed class names and usage contracts in `src/design-system/treatments.ts`;
- the live catalog at `/dev/design-system`; and
- this document for selection rules and provenance.

The system is intentionally lean. It does not wrap semantic HTML in a custom
component merely to add an effect. Product markup keeps its native buttons,
headings, groups, labels, focus order, and assistive text, then opts into one
class-backed treatment.

## Figma source audit

The treatment model comes from Cisco's
[1D Guardrails](https://www.figma.com/design/VPpFDRaovwQeHrSM86fcSv/1D-Guardrails?node-id=313-50940),
adapted to Stories rather than copied as product chrome. The source defines an
important semantic split:

| Family | Meaning | Portable pattern | Stories rule |
| --- | --- | --- | --- |
| Glass | elevation and focus | temporary translucent layer with real backdrop blur | Use only for content that matters now. |
| Atmospheric glow | trust, atmosphere, broad orientation | large diffused field positioned behind a region | Never add it as an ambient Fern stage background. |
| Spotlight glow | directional guidance | smaller, tighter, higher-contrast local field | One target at a time; it cannot replace focus styling. |
| Static sheen | priority or novelty | bounded gradient edge without travel | Use when a plain border is insufficient. |
| Animated sheen | active change or transformation | one directional gradient travel | Tie it to a state change and stop it under reduced motion. |
| Solid surface | durable chrome | opaque or nearly opaque neutral surface | Default for persistent controls and labels. |

### Light Glass recipe

Node `313:50940` is the stable production recipe:

- white fill at 60%;
- white 1px border at 60%;
- 10px backdrop blur;
- inset white highlight `0 0 24px 1px` at 80%; and
- soft black shadows `0 1px 2px` and `0 4px 16px`, both at 4%.

There is no decorative color wash, chromatic rim, fake refraction, or large
ambient shadow in this recipe. The shape owns its radius; the treatment owns
only material properties. Browsers without backdrop filtering receive a more
opaque neutral fallback.

### Glass selection guardrails

Use Light Glass when a temporary layer overlays content and needs separation:
dialogue, a retained Read-with-me passage, a modal interruption, or a
contextual decision. Do not use it for static background panels, persistent
title/mode/transport chrome, every container, nested buttons, or purely
decorative layering. Busy imagery that defeats clarity should receive a solid
surface or authored relocation instead.

### Glow patterns

Glow communicates trust, intelligence, guidance, or atmosphere; it is not a
glass substitute. Atmospheric glow stays large and diffused and may originate
from the top, top-left, or bottom of a broad target region. The source uses 40%
gradient strength in light environments and 100% in dark environments.
Spotlight glow is the secondary, restrained form: smaller, tighter, and higher
contrast around one decision or action.

The portable spectrum preserves the source stops (`#0A60FF`, `#02C8FF`,
`#FF007F`, `#FF9000`) as design-system primitives. Product features may map
those primitives to a world palette only when the semantic role remains clear.
Fern deliberately uses none of them as stage atmosphere because its solid
`#FFFFFF` matte is an authored media contract.

### Sheen patterns

Sheen communicates movement, progression, transformation, direction, priority,
urgent attention, or a new feature. Static and animated variants are available
as bounded, shape-aware gradient edges. The animated form makes one directional
travel and becomes static under `prefers-reduced-motion`.

The source file exposes separate Static Sheen and Animated Sheen guidance
frames. Their portable implementations remain `provisional`: the Figma Starter
MCP limit was reached after the structural inventory and sheen-purpose frame,
before the two detailed recipe frames could be extracted. Do not claim exact
pixel parity for their speed or edge thickness until those nodes are audited.

## Fern application

| Existing feature | Treatment | Reason |
| --- | --- | --- |
| Live dialogue and narration | Light Glass | Temporary content overlays live media and needs focus. |
| Read-with-me retained passage | Light Glass | Temporary priority and containment while narration waits. |
| Start interruption | Light Glass | A short modal-like decision before playback. |
| Story title | Solid surface | Persistent identity, not temporary elevation. |
| Watch / Read-with-me switch | Solid surface + solid active selection | Persistent navigation; glass would weaken affordance. |
| Replay / transport | Solid surface | Persistent controls and buttons must remain unambiguous. |
| Stage background | None | The exact solid story matte remains authoritative. |

## Accessibility and motion

- Effects never contain or distort semantic content.
- Keyboard focus remains an explicit outline, independent of glow or sheen.
- Minimum touch targets and native controls remain unchanged.
- Animated sheen stops under `prefers-reduced-motion`.
- Light Glass uses a solid fallback when backdrop filtering is unavailable.
- Treatment strength never overrides readable contrast or authored media focus.
