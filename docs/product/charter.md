# Product charter

## The product

stories.sh creates original illustrated story films for children, then lets a
child step inside those same performances to watch, read along, or help the
story unfold. The benchmark is the emotional quality of a professionally read
picture book, combined with the responsiveness of an authored web experience.

The film is not a by-product of a reading exercise. A directed performance is
the source of truth; the interactive reader is another way to experience it.

## The magic loop

1. A scene establishes a living world.
2. An expressive narrator or character performs a short story beat.
3. The experience waits at an authored safe point.
4. The child reads, traces, taps, drags, or chooses.
5. Their action releases a visual and narrative payoff.
6. The story flows into the next beat without exposing media boundaries.

## Experience modes

### Watch

A continuous story film with expressive narration, dialogue, music, ambience,
sound effects, and an automatic director's path through interactive beats. This
is also the canonical YouTube output.

### Read with me

The same final performance and scene direction, with phrase-sized text,
word-level highlighting, and pauses at authored safe points. The child affects
when the story advances, but narration is never reconstructed from chopped word
audio.

### I'll read (post-golden-POC)

The child reads or traces a phrase without continuous narration. Completing the
phrase plays the full expressive sentence as a model and releases the scene's
payoff. Isolated word help is a separate instructional audio system.

### Play (later)

A lighter-text replay mode emphasizing exploration and signature interactions.

## Product principles

- **Performance first.** Generate and select continuous expressive passages;
  align words only after the final audio exists.
- **Agency without broken speech.** Gestures select states, release beats, or
  influence bounded pacing. They do not arbitrarily splice narration.
- **Authored restraint.** Quiet living illustrations make hero interactions
  feel special. Not every scene needs full animation.
- **One grammar, many stories.** Stories bind assets to standard scene and
  interaction recipes rather than adding engine code.
- **One package, two outputs.** Interactive web and linear film share final
  audio, media, timing, transitions, and story structure.
- **Responsive by contract.** One 4:3 creative master per shot remains complete
  across phone, tablet, desktop, and film while responsive DOM content changes
  from a stack to an editorial row.
- **Series over one-offs.** Recurring casts and worlds amortize character,
  location, voice, sound, and motion assets.

## Golden POC scope

The next proof is one original 60–90 second sequence, not a library migration:

- four or five scenes;
- one narrator and at most one character voice;
- expressive continuous narration selected from multiple candidates;
- three or four polished key illustrations;
- two regular motion shots;
- one multi-state hero interaction;
- Watch and Read with me modes;
- phone, tablet, desktop, and 1080p film from one production package.

The existing Boat in the Mist clips may be temporary runtime fixtures. They are
not the creative quality gate for the golden story.

## Explicit non-goals for the golden POC

- A general animation editor
- Custom WebGL worlds per story
- Accounts, payments, analytics, or personalization
- Speech recognition
- Branching plots beyond a cosmetic variation
- More than one bespoke-feeling interaction
- Migrating all original POC stories
- Fully autonomous creative approval

## Quality gate

Do not scale content production until the golden sequence:

- feels like a story world rather than a webpage containing videos;
- contains a warm, emotionally intentional performance;
- hides transitions between media states;
- reads clearly at 390×844, 768×1024, 1024×768, and 1440×900;
- uses the same creative video masters at every viewport;
- keeps text synchronized to the final performance;
- lets the child perform a narratively meaningful action;
- renders a plausible 1080p story film from the same package.
