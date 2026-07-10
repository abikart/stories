/**
 * Decodability linter (docs/06) — the authority on whether a story is
 * honestly readable at its declared level.
 *
 *   pnpm lint:stories            # all stories in content/
 *   pnpm lint:stories <story-id> # one story
 *
 * Errors fail the build; warnings inform. Checks:
 *  - schema-shape basics (tokens either sight or segmented, never both)
 *  - g.join("") === w exactly (case included — the reader renders graphemes)
 *  - every grapheme within the declared phonics scope
 *  - every non-sight word re-segmentable within scope (greedy check)
 *  - sight words used ⊆ declared (error) and declared ⊆ used (warning)
 *  - text === tokens reconstruction (w + punct joined by spaces)
 *  - cue token indices in range
 *  - page word-count budget by level (warning)
 *  - narration files present (warning until narrated)
 *  - frames dirs contain frame_0001.<ext> (error)
 * On failure, suggests in-scope words from the word bank.
 */
import { promises as fs } from "fs";
import path from "path";
import { segmentWord, suggestWords } from "./lib/phonics";

const CONTENT = path.join(process.cwd(), "content");

interface Issue {
  level: "error" | "warn";
  where: string;
  msg: string;
}

async function lintStory(storyId: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  const err = (where: string, msg: string) => issues.push({ level: "error", where, msg });
  const warn = (where: string, msg: string) => issues.push({ level: "warn", where, msg });

  const dir = path.join(CONTENT, storyId);
  let story;
  try {
    story = JSON.parse(await fs.readFile(path.join(dir, "story.json"), "utf8"));
  } catch (e) {
    err(storyId, `story.json unreadable: ${(e as Error).message}`);
    return issues;
  }

  const scope: string[] = story.phonicsScope?.graphemes ?? [];
  const sightDeclared = new Set<string>(
    (story.phonicsScope?.sightWords ?? []).map((w: string) => w.toLowerCase()),
  );
  const sightUsed = new Set<string>();
  const wordBudget = story.level <= 1 ? 9 : 12;

  for (const page of story.pages ?? []) {
    const where = `${storyId}/${page.id}`;

    // token structure + decodability
    for (const token of page.tokens ?? []) {
      const w = token.w as string;
      if (token.sight && token.g) err(where, `"${w}": both sight and segmented`);
      if (!token.sight && !token.g) err(where, `"${w}": neither sight nor segmented — run pnpm segment`);
      if (token.sight) {
        sightUsed.add(w.toLowerCase());
        if (!sightDeclared.has(w.toLowerCase())) {
          err(where, `sight word "${w}" not declared in phonicsScope.sightWords`);
        }
      }
      if (token.g) {
        const joined = token.g.join("");
        if (joined !== w) {
          err(where, `"${w}": graphemes join to "${joined}" — case/spelling must match exactly`);
        }
        for (const g of token.g) {
          if (!scope.some((s) => s.toLowerCase() === g.toLowerCase())) {
            err(where, `"${w}": grapheme "${g}" outside phonics scope`);
          }
        }
        const re = segmentWord(w, scope);
        if (!re.ok) {
          err(
            where,
            `"${w}" not decodable in scope (stuck at "${re.remainder}") — in-scope ideas: ${suggestWords(scope).join(", ")}`,
          );
        }
      }
    }

    // text reconstruction
    const rebuilt = (page.tokens ?? []).map((t: { w: string; punct?: string }) => t.w + (t.punct ?? "")).join(" ");
    if (rebuilt !== page.text) {
      err(where, `text mismatch:\n      text:   "${page.text}"\n      tokens: "${rebuilt}"`);
    }

    // cues
    for (const cue of page.scene?.cues ?? []) {
      if (cue.atWord < 0 || cue.atWord >= (page.tokens?.length ?? 0)) {
        err(where, `cue "${cue.cue}" points at token ${cue.atWord} (page has ${page.tokens.length})`);
      }
    }

    // budget
    if ((page.tokens?.length ?? 0) > wordBudget) {
      warn(where, `${page.tokens.length} words exceeds the level-${story.level} budget of ${wordBudget}`);
    }

    // narration
    if (!page.narration) {
      warn(where, "no narration yet — run pnpm narrate");
    } else {
      for (const f of [page.narration.audio, page.narration.words]) {
        try {
          await fs.access(path.join(dir, f));
        } catch {
          err(where, `narration file missing: ${f}`);
        }
      }
    }

    // frames presence
    if (page.scene?.backend === "frames") {
      const ext = page.scene.frames.ext ?? "png";
      const first = path.join(dir, page.scene.frames.dir, `frame_0001.${ext}`);
      try {
        await fs.access(first);
      } catch {
        err(where, `frames missing: ${path.relative(dir, first)} — run pnpm gen-frames`);
      }
    }
  }

  for (const s of sightDeclared) {
    if (!sightUsed.has(s)) warn(storyId, `declared sight word "${s}" never used`);
  }
  return issues;
}

async function main() {
  const only = process.argv[2];
  const ids = only
    ? [only]
    : (await fs.readdir(CONTENT, { withFileTypes: true }))
        .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
        .map((e) => e.name);

  let errors = 0;
  let warnings = 0;
  for (const id of ids.sort()) {
    const issues = await lintStory(id);
    const e = issues.filter((i) => i.level === "error");
    const w = issues.filter((i) => i.level === "warn");
    errors += e.length;
    warnings += w.length;
    console.log(`${e.length === 0 ? "✓" : "✗"} ${id} — ${e.length} error(s), ${w.length} warning(s)`);
    for (const i of issues) {
      console.log(`    ${i.level === "error" ? "✗" : "⚠"} [${i.where}] ${i.msg}`);
    }
  }
  console.log(`\n${ids.length} story(ies): ${errors} error(s), ${warnings} warning(s)`);
  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
