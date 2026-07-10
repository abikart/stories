# Product — feature set & experience

## Audience

- **Primary**: children ages 3–7 (pre-readers through early decoders), on a parent's iPad or laptop, usually with a parent nearby but not required page-by-page (unlike reading.com's script-for-the-adult model — our app carries the instruction itself).
- **Secondary**: the parent — chooses stories, sees progress, feels good about screen time because it's demonstrably *reading*.

## Reading modes

Every story plays in any mode; modes are just different drivers of the same page timeline (see [04-architecture.md](04-architecture.md)).

| Mode | Who drives the timeline | What happens |
|---|---|---|
| **Read it** (interactive) | Child's finger on the Spark | Graphemes highlight under the finger; scene scrubs in sync; word-complete chime per word. Silent by default — the child does the decoding. Tapping a word plays a slow phoneme-by-phoneme sound-out, then the blended word. |
| **Read to me** (read-aloud) | The clock / narration audio | App narrates slowly; words highlight karaoke-style; scene plays through in sync. Fully passive — this is also the YouTube render mode. |
| **Read along** (hybrid) | Child's finger, with audio | As the Spark crosses each word boundary, that word's narration slice plays. The child controls pace; the app supplies the voice. The default recommended mode. |
| **Echo** *(post-POC)* | Child's voice via speech recognition | The app listens; correctly read words light up and advance the scene. |

## The decoding layer (pedagogy)

This is what makes it a reading app and not a cartoon:

- **Grapheme-aware highlighting.** Words are pre-segmented into graphemes, not letters: `sh`, `ch`, `th`, `igh`, `ai` highlight as single units mapped to single phonemes. Sliding through "ship" lights `sh` → `i` → `p`. This is the science-of-reading-correct version of reading.com's letter slider.
- **Tap-a-word sound-out.** Tapping any word opens the slider under it (exactly the reading.com affordance) plus an audio sound-out: each phoneme spoken discretely, then blended.
- **Sight/tricky words** are visually marked (small heart, per "heart words" convention) and pronounced whole rather than segmented.
- **Leveled decodability.** Every story declares a phonics scope (the grapheme–phoneme correspondences it assumes) and a sight-word list. A linter enforces that every word in the story is decodable within scope or explicitly whitelisted (see [06-content-pipeline.md](06-content-pipeline.md)). POC ships two levels; the full ladder follows a standard synthetic-phonics progression (CVC → digraphs → vowel teams → …).
- **Anti-guessing by design.** The dormant-scene mechanic means art never gives the answer away before the child reads — the scene *reacts to* reading rather than *previewing* it.

## The living illustration

Scenes are the star. Three interchangeable backends behind one contract (details in [04-architecture.md](04-architecture.md)):

1. **Coded scenes** — hand-built (or AI-codegen'd) SVG/Canvas scenes. Fully interactive: beyond scrub-sync, they respond to taps (poke the fox, it flicks its tail), have particle effects, physics moments. Flagship stories use these.
2. **Frame-scrub scenes** — pre-rendered frame sequences (AI-generated video → extracted frames, the scroll-world technique) scrubbed by the timeline. Cinematic, cheap to author at scale.
3. **Rig/animation scenes** *(post-POC)* — Rive or Lottie rigs with timeline + state-machine control; middle ground of cost and interactivity.

**Wake-the-world**: every scene supports a dormancy dimension — dormant pages are desaturated/still/quiet; reading progress wakes them (color, motion, ambience). Waking is the reward loop of every single page.

## Delight & reward systems

- **Word-complete**: micro-sparkle on the word + a soft chime; the Spark does a little hop.
- **Page-complete**: the Spark flies into the scene; wake animation; ambient audio bed fades in; 1–2 tappable easter eggs arm themselves.
- **Story-complete**: a sticker themed to the story drops into the child's **sticker book**; words-read counter ticks up.
- **Sound design is first-class**: every story has an ambient bed, per-page cues, and phoneme audio. Mute-narration-keep-sfx is supported.
- **No dark patterns**: no streaks-guilt, no timers, no ads inside the app, no interstitials. Calm exit.

## Accessibility

- Dyslexia-friendly font toggle (e.g., Lexend/OpenDyslexic), adjustable letter spacing and text size.
- `prefers-reduced-motion` honored: scenes degrade to gentle cross-fades; scrub still works.
- Full pointer/touch/keyboard support; the Spark is draggable by mouse, touch, or arrow keys.
- Left-handed mode: scrubber rail ergonomics and any handwriting-adjacent features must not assume right-handedness (a reading.com complaint worth designing against from day one).

## Platform strategy

- **POC / v1**: responsive web app, iPad-Safari-first (that's the real device in the real living room), landscape-primary. Installable PWA.
- **Later**: Capacitor/native wrappers for App Store presence; TV casting for read-aloud mode.

## Monetization (context — not built in POC)

1. **Freemium subscription**: 3–5 stories free forever; ~$6.99/mo or ~$49/yr family plan unlocks the library. Up to 3 child profiles.
2. **YouTube channel**: every story's read-aloud mode renders deterministically to video ([06-content-pipeline.md](06-content-pipeline.md)). Read-along kids' content is a large, evergreen YouTube category; videos are both ad revenue ("made for kids" CPM is lower but volume compounds) and top-of-funnel to the app. End-cards point to stories.sh.
3. **Personalized stories** *(post-POC, high-margin)*: AI pipeline swaps the protagonist's name (kept decodable) and look — "starring Maya." Premium one-time purchase or subscriber perk.
4. **Schools/classrooms** *(later)*: site licenses; the decodability metadata maps cleanly onto curricula.

## What we deliberately are not

- Not a phonics *curriculum* (reading.com's 99-lesson scripted program). We are the **library of living decodable stories** that any curriculum feeds into. Practice and joy, not instruction sequencing.
- Not a gamified app with meta-game currencies. The story is the game.
- Not independent-screen-time slop. But also not reading.com's parent-must-run-everything model — the app itself scaffolds the decoding.
