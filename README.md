# stories.sh

**Stories you can touch. Words that wake worlds.**

stories.sh is a web-first storybook app for kids learning to read (ages 3–7). Every story is a living, animated world — but the world only comes alive when the child reads. One gesture — sliding a finger under the words — simultaneously decodes the text (grapheme-by-grapheme highlighting), speaks it, and drives the illustration's animation timeline. Reading *is* the game controller.

## Documents

| Doc | What it covers |
|---|---|
| [docs/01-vision.md](docs/01-vision.md) | The evolved concept, the magic loop, brand identity |
| [docs/02-product.md](docs/02-product.md) | Feature set, reading modes, pedagogy, delight, monetization |
| [docs/03-poc-requirements.md](docs/03-poc-requirements.md) | **POC scope, milestones M0–M8, acceptance criteria, guardrails — the charter for the build loop** |
| [docs/04-architecture.md](docs/04-architecture.md) | Tech stack, reader engine, timeline model, Scene Contract |
| [docs/05-story-format.md](docs/05-story-format.md) | The Storyspec schema — how a story is described as data |
| [docs/06-content-pipeline.md](docs/06-content-pipeline.md) | AI authoring workflow, decodability linter, TTS, video render, YouTube |
| [docs/07-poc-stories.md](docs/07-poc-stories.md) | Page-by-page briefs for the three POC stories |
| [docs/08-design-system.md](docs/08-design-system.md) | Design tokens, type, motion — modeled on board.fun |
| [docs/09-video-scenes.md](docs/09-video-scenes.md) | AI-video scene workflow: prompt packs → Grok Imagine → ingest |

## Authoring a story (the terminal is the CMS)

```bash
pnpm new-story my-story --title "The ..." --level 1   # scaffold with the level's phonics scope
# edit content/my-story/story.json: pages, texts, tokens ({w, punct?, sight?}), cues, scenes
pnpm segment my-story        # fills tokens[].g from the scope (greedy, longest-first, case-preserving)
pnpm lint:stories my-story   # decodability gate — fix until ✓ (suggests in-scope words)
pnpm narrate my-story        # ElevenLabs (or say fallback) → audio + word timestamps
pnpm gen-frames my-story     # only for frames-backend pages (procedural renderer)
pnpm video-prompts my-story --style ghibli   # prompt pack for AI video (Grok Imagine etc.)
pnpm ingest-video my-story   # explode delivered clips in video-drops/ into scrub scenes
pnpm dev                     # read it end-to-end in the browser
```

Coded scenes are TS modules in [src/engine/scenes/](src/engine/scenes/) implementing the Scene contract, registered in [scene.ts](src/engine/scene.ts). The linter is the pedagogical authority: every word must be decodable within the story's declared `phonicsScope` or listed as a sight word.

## Status

The POC charter is complete: milestones M0–M8 of [docs/03-poc-requirements.md](docs/03-poc-requirements.md) are implemented and verified. The app includes four playable stories, three reading modes with synchronized narration, coded and frame-based interactive scenes, celebrations and stickers, the terminal-based content pipeline, deterministic YouTube-ready video rendering, and the polished story library landing page.

Post-POC work is focused on replacing procedural or empty scene art with generated video. **The Boat in the Mist** is the first video-ready story: its five-page prompt pack, narration, ingestion tooling, and scene metadata are complete; generated clips can be dropped in and converted to slider-scrubbable frame sequences using the workflow in [docs/09-video-scenes.md](docs/09-video-scenes.md).
