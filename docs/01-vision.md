# Vision — stories.sh

## The one-line pitch

A storybook app where the illustration is alive, but dormant — and **reading is what wakes it up**. The child's finger sliding under the words is one gesture that does three things at once: highlights the letters so they can decode, speaks the sounds, and scrubs the animated scene forward. Words make the world move.

## Where this comes from

Reading.com proved the mechanics of the slider-under-words interaction: kids drag through a word, letters highlight in sequence, and decoding gets dramatically easier. But in that app the slider is a *utility* bolted under static pages — the illustration is a reward you look at, not a thing you affect.

scroll-world (the Higgsfield fly-through skill) and floema.com prove the other half: a scrub gesture can drive a cinematic, continuous media timeline — video frames, connected scenes, camera moves — and it feels magical even to adults.

**stories.sh fuses these.** The reading slider and the scene timeline are the *same* timeline. Nobody has built this. Every existing kids' reading app treats text and illustration as separate layers; we make the text the control surface for the illustration.

## The magic loop

1. A page opens **dormant**: the scene is muted, desaturated, frozen — a world asleep. The prose sits below it.
2. The child drags the **Spark** (a small glowing wisp that lives under the words) across the text. As it passes under each grapheme, the letters light up and sound out. As it crosses each word, the scene scrubs forward: *"The fox **jumps**"* — and the fox jumps, exactly on that word.
3. When the last word is read, the Spark flies up into the illustration and the page **wakes fully**: color floods in, the ambient loop starts, characters idle, tappable surprises activate.
4. Page turn. The next world is asleep, waiting to be read awake.

This loop is intrinsically motivating (the story literally will not move unless you read), pedagogically sound (it inverts the picture-guessing problem — reading.com *hides* pictures to stop kids guessing words from art; we keep the art on stage but make it *follow* the text, so the words remain the source of truth), and unlike anything else in the category.

## Brand

- **Domain**: stories.sh. Lean into the `.sh` wink for grown-ups — stories are authored by an AI pipeline in the terminal, the format is open data, the vibe is "hacker-crafted storybooks." Kids never see this layer.
- **Mascot / cursor**: the **Spark** — the glowing wisp the child drags. It is simultaneously the scrubber handle, the reading guide, and a character with personality (it wiggles when idle, cheers on word completion, flies into scenes).
- **Tagline candidates**: "Stories you can touch." / "Slide to read." / "Every word makes a spark."
- **Tone**: warm, painterly, quiet confidence. Not the neon casino aesthetic of most kids' apps. Think Monument Valley / Sago Mini production values, floema-grade art direction.

## Why now / why us

- AI image + video generation makes scrub-able animated scenes authorable at scale for the cost of a prompt pipeline (scroll-world already demonstrates the asset pipeline: stills → dive-in clips → connector clips → frame-extracted scrub assets).
- AI TTS with word-level timestamps makes narration + karaoke alignment nearly free.
- An AI authoring pipeline with a **decodability linter** can mass-produce stories that are *pedagogically valid* at each phonics level — the bottleneck that keeps decodable-book libraries small and ugly.
- The same deterministic timeline that powers the app renders read-aloud videos headlessly → a YouTube channel becomes a zero-marginal-cost marketing funnel and revenue stream.

## North-star experience (18 months out, context only)

A library of hundreds of leveled, living stories; a speech mode where the child reads aloud and the world responds to their voice; personalized stories starring the child's name and likeness; classroom licensing; native apps. None of this is POC scope — see [03-poc-requirements.md](03-poc-requirements.md) for what is.
