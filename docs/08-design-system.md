# Design system — "Warm paper & candy"

Modeled on board.fun's design language (tokens extracted from their live CSS on 2026-07-10): warm cream paper instead of stark white, off-black ink, a saturated candy accent palette, geometric toy-like display type, generous breathing room. Adapted here for early readers. This doc is the authority for M0 setup (tokens go into Tailwind/CSS custom properties from day one) and the M8 polish pass.

## Mood

Storybook-warm, not neon-casino. The page is paper; the scene is the window; color comes from the candy accents and the artwork, never from loud chrome. UI recedes; words and world lead. Big friendly shapes, soft depth, springy motion.

## Color tokens

```css
:root {
  /* paper & ink (board.fun: cream/darkcream/gray/offblack) */
  --paper:      #fffef1;   /* app background — warm cream */
  --paper-deep: #f2f1e5;   /* cards, wells, scrubber rail */
  --paper-edge: #ededde;   /* hairline borders, dividers */
  --ink:        #272831;   /* primary text */
  --ink-soft:   #6f7066;   /* secondary text (warm gray) */

  /* candy accents (board.fun palette, verbatim) */
  --green:  #32c992;
  --blue:   #2760f6;
  --purple: #6d13ec;
  --orange: #f48813;
  --yellow: #f2cd0f;
  --red:    #cc1d31;
  --teal:   #9dc7c8;

  /* semantic */
  --spark:        var(--yellow);  /* the Spark's glow + active grapheme */
  --read:         var(--green);   /* completed words/pages, progress */
  --accent:       var(--purple);  /* per-story override, see below */
  --sight-word:   var(--teal);    /* heart-word marker */
}
```

- **Per-story accent**: each story sets `--accent` from the candy set and it tints buttons, page dots, celebration confetti, sticker frame. Fox on the Box → `--orange`; Ship in the Rain → `--blue`; Pop! Pop! Pop! → `--yellow` (Spark shifts to `--orange` there for contrast).
- **Reading text is always `--ink` on `--paper`** — accents never colorize prose except the highlight states below.
- **Grapheme highlight states**: future = `--ink` at 35% opacity; active = `--ink` on a `--spark` rounded underlay (glow via box-shadow, not text color); read = `--ink` full with a 2px `--read` underline that fades in.
- **Dormant scene treatment**: `filter: saturate(0.15) brightness(0.92)` + frozen; wake animates the filter off over ~600ms as ambience fades in.

## Typography

board.fun pairs ITC Kabel (geometric toy display) with Neue Haas Grotesk (body). Free equivalents, all via `next/font/google`:

| Role | Font | Notes |
|---|---|---|
| Display (titles, celebrations, landing hero) | **Quicksand** 600/700 | closest free match to Kabel's rounded geometry |
| UI (buttons, labels, parent-facing text) | **Inter** 400/500/600 | board.fun already uses Inter in-page |
| **Reading text (the prose kids decode)** | **Lexend** 500 | designed for reading proficiency; the dyslexia-friendly toggle bumps to Lexend 600 + wider `letter-spacing` and `word-spacing` |

Reading text sizing: min 28px on tablet, ~36px on desktop, `line-height: 1.6`, `letter-spacing: 0.01em`, one line per sentence where it fits. Display sizes are big and unafraid (clamp 2.5–5rem on landing). Weights do the hierarchy work — no italics for kid-facing text.

## Shape, depth, spacing

- **Radii**: `--radius-sm: 0.25rem` (chips, underlays), `--radius-xl: 0.75rem` (cards, buttons) — board.fun's scale — plus `--radius-round: 999px` for the Spark, page dots, and pill buttons.
- **Depth**: soft and sparse. Cards: `0 2px 8px rgb(39 40 49 / 0.06), 0 8px 24px rgb(39 40 49 / 0.08)`. No hard borders except 1px `--paper-edge` hairlines on wells. The scene window gets the strongest shadow on the page; UI stays flatter than the art.
- **Spacing**: generous vertical rhythm (sections breathe; 8px base grid). The reader layout is: scene window (dominant, ~60–70% height) → prose line → scrubber rail, centered, max-width ~52rem, fat margins.

## Motion

Springy and physical, never linear (`ease-out`/spring for enters, short `ease-in` exits). Signature moves:

- **Spark**: idle bob (subtle, 2s loop); attaches to finger with critically-damped spring; hop + squash on word-complete; arcs into the scene on page-complete.
- **Word celebrations**: 150–250ms — felt, not watched. Page wake: ~600ms desaturation lift. Story celebration: up to 1.5s, confetti in story accent.
- **Page turns**: scene slides/crossfades; incoming page visibly dormant.
- `prefers-reduced-motion`: crossfades only, no confetti, Spark still functions (static handle).

## Component recipes

- **Buttons**: pill (`--radius-round`), Quicksand 600, chunky (min 48px tall — kid fingers), `--accent` fill with white text for primary, `--paper-deep` fill with `--ink` for secondary. Press = scale 0.96 + shadow drop, spring back.
- **Scrubber rail**: full prose width, 12px tall well in `--paper-deep`, inset hairline; fill trail in `--read`; Spark is a 44px+ hit-target glowing `--spark` circle riding the rail.
- **Mode switcher**: three-segment pill with icons + short labels ("Read it / Read to me / Read along"), selected segment in `--accent`.
- **Library cards** (landing): cover art on `--paper-deep` card, `--radius-xl`, level chip (candy color by level), title in Quicksand.
- **Sticker book / celebration**: stickers as die-cut art with white 6px sticker border + soft shadow, dropped in with spring + slight random rotation.

## Voice & copy

Kid-facing copy is short, warm, second-person ("You read the whole page!"). Parent-facing copy is plain and confident, board.fun-style ("Board game feel. Video game magic." energy — ours: "Stories you can touch."). Never gamified-manipulative ("streak lost!" is banned).
