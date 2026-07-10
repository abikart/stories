# Content pipeline — the AI-native CMS

There is no CMS UI. The CMS is a set of scripts plus Claude Code skills operating on `content/` — stories are authored in the terminal by an AI workflow, reviewed as diffs, versioned in git. (This is the `.sh` in stories.sh.)

## Authoring flow

```
idea ──▶ write ──▶ lint ──▶ segment ──▶ narrate ──▶ scene assets ──▶ play it
         (LLM)   (script)   (script)    (script)    (script/LLM)     (browser)
```

1. **`scripts/new-story.ts <id>`** — scaffolds `content/<id>/story.json` from a template with the chosen phonics scope.
2. **Write** — an LLM (or human) drafts title, page texts, cue placement, scene briefs. The prompt embeds the phonics scope and the decodability rules so drafts start near-valid.
3. **`scripts/lint-story.ts <id>`** — the gatekeeper (below). Rewrite until clean.
4. **`scripts/segment.ts <id>`** — fills `tokens[].g` via the grapheme–phoneme table; flags ambiguous words for manual override.
5. **`scripts/narrate.ts <id>`** — per page: TTS at a slow, warm read → `audio/pN.mp3` + `pN.words.json`. Adapters: **elevenlabs** (character timestamps → word timestamps) when a key exists; **macos-say** fallback (timestamps estimated proportionally, refined by silence detection). The POC must produce acceptable results from the fallback alone.
6. **Scene assets** — per page, one of:
   - **coded**: an LLM writes/edits a scene module against the Scene Contract; iterated in the browser.
   - **frames**: `scripts/gen-frames.ts` (procedural Canvas renderer → WebP sequence) for POC; post-POC, AI video generation à la scroll-world (still → dive-in clip → connector clips → ffmpeg frame extraction) drops into the same directory format.
7. **Play it** — human (or agent with preview tools) reads the story end-to-end in all modes before it ships.

Post-POC this flow becomes Claude Code skills (`/new-story`, `/narrate`, `/lint-stories`) so authoring is conversational; the scripts are the substrate either way.

## The decodability linter (the crown jewel)

`scripts/lint-story.ts` enforces that a story is honestly readable at its declared level:

- Every non-sight token must segment fully into graphemes within `phonicsScope.graphemes`, with each grapheme's *phoneme in this word* being the scope's taught correspondence (the table maps grapheme→phonemes; "o" taught as /ŏ/ doesn't license "cold").
- Sight words used must be declared in `phonicsScope.sightWords`; declared-but-unused ones warn.
- Structural checks: every token segmented-or-sight; cues reference valid token indices; page word counts within level limits; narration/timestamp files present (warning pre-narration, error at build).
- Output: per-word pass/fail with the reason and suggested in-scope alternatives (from a small in-scope word list per level), so an LLM can self-repair drafts in a loop.

This is what lets AI mass-produce stories without producing pedagogically fraudulent ones — the linter, not the model, is the authority.

## Render-to-video (YouTube leg)

`scripts/render-video.ts <id>`:

1. Launch Playwright → `/render/<id>` — a chrome-free 16:9 layout playing Read-to-me mode on a **fixed-timestep clock** (deterministic; not wall time).
2. Capture frames at 30fps (step clock → screenshot, or CDP screencast), pipe to ffmpeg.
3. Mux with the narration + ambient mix (ffmpeg audio filtergraph from the same timestamp data) → `out/<id>.mp4`, 1080p.

Same route later renders Shorts (9:16 crop, one page per short) and 4K. Upload/packaging (titles, thumbnails, "made for kids" flagging, end-cards to stories.sh) is a manual checklist in the POC — automation is post-POC.

## Asset inventory per story

| Asset | Source | POC fallback |
|---|---|---|
| Page texts + cues | LLM + linter loop | — (no external dep) |
| Grapheme segmentation | GPC table script | manual override in spec |
| Narration + timestamps | ElevenLabs | macOS `say` + estimation |
| Phoneme bank (shared) | recorded once via TTS | `say` per phoneme |
| Coded scenes | LLM-written TS modules | — |
| Frame sequences | AI video → frames | procedural generator |
| Ambient/sfx | freesound/generated | Web Audio synthesis |
| Sticker + cover art | AI image gen | derived from scene render |
