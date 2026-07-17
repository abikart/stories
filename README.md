# stories.sh

An expressive, interactive story-film experience for children. A continuous
narration performance drives word highlighting, living illustrations, sound,
responsive composition, and child-paced Read-with-me pauses.

The active story is **Fern and the Silent Seed Bells**.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), or go directly to
`/experience/fern-and-the-silent-seed-bells`.

## Working map

- `content/fern-and-the-silent-seed-bells/` — the active production package
- `src/experience/` — reusable performance-led runtime
- `docs/README.md` — product and architecture index
- `docs/HANDOFF.md` — current state and next action
- `docs/mvp/immersive-run.md` — active MVP execution contract
- `.codex/skills/` — project-owned story and visual production workflows

## Validation

```bash
pnpm typecheck
pnpm lint:experiences
pnpm build
pnpm qa:experience -- fern-and-the-silent-seed-bells
```

The successful pre-MVP POC is preserved by the local `poc-success` tag. Git
history, not a parallel archive directory, holds retired POC code and media.
