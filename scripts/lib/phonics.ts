/**
 * Shared phonics utilities for the content pipeline (docs/06).
 * Segmentation is SCOPE-DRIVEN: a word segments greedily against the
 * story's declared graphemes (longest match first), so "ship" is only
 * (sh)(i)(p) if the story teaches "sh". Case is preserved in output —
 * the reader renders graphemes, so g.join("") must equal the word.
 */

/** Multi-letter graphemes ordered longest-first for greedy matching. */
export const MULTI_GRAPHEMES = [
  "tch", "igh", "air", "ear",
  "sh", "ch", "th", "ck", "ng", "qu", "ph", "wh",
  "ai", "ay", "ee", "ea", "oa", "oo", "or", "ar", "er", "ow", "ou", "oi", "oy", "ue", "ew", "ie",
];

export interface SegmentResult {
  ok: boolean;
  graphemes: string[];
  /** On failure: the position and remainder that couldn't be matched. */
  failedAt?: number;
  remainder?: string;
}

export function segmentWord(word: string, scopeGraphemes: string[]): SegmentResult {
  const scope = new Set(scopeGraphemes.map((g) => g.toLowerCase()));
  const multi = MULTI_GRAPHEMES.filter((g) => scope.has(g)).sort((a, b) => b.length - a.length);
  const out: string[] = [];
  let i = 0;
  const lower = word.toLowerCase();
  while (i < lower.length) {
    const hit = multi.find((g) => lower.startsWith(g, i));
    if (hit) {
      out.push(word.slice(i, i + hit.length));
      i += hit.length;
      continue;
    }
    if (scope.has(lower[i])) {
      out.push(word.slice(i, i + 1));
      i += 1;
      continue;
    }
    return { ok: false, graphemes: out, failedAt: i, remainder: word.slice(i) };
  }
  return { ok: true, graphemes: out };
}

/** Small decodable word bank for linter suggestions, tagged by graphemes used. */
export const WORD_BANK: string[] = [
  "sat", "sit", "sun", "sad", "set", "six", "tap", "top", "tin", "ten", "tug",
  "pat", "pet", "pit", "pot", "pig", "pin", "pup", "pop", "pan", "nap", "net",
  "not", "nut", "map", "mat", "men", "mud", "mum", "dad", "dig", "dog", "dot",
  "gap", "get", "got", "gum", "cat", "cot", "cup", "can", "kid", "kit", "red",
  "run", "rat", "rug", "hat", "hen", "hip", "hot", "hug", "bat", "bed", "big",
  "bug", "box", "bun", "fan", "fit", "fox", "fun", "leg", "lip", "log", "lot",
  "jam", "jet", "jog", "jug", "wax", "web", "wig", "van", "vet", "yes", "zip",
  "ship", "shop", "shut", "fish", "dish", "chip", "chat", "chin", "much", "such",
  "thin", "that", "this", "moth", "deck", "duck", "kick", "lock", "pack", "rock",
  "rain", "sail", "tail", "wait", "main", "seed", "feet", "keep", "week", "tree",
];

export function suggestWords(scopeGraphemes: string[], count = 6): string[] {
  return WORD_BANK.filter((w) => segmentWord(w, scopeGraphemes).ok).slice(0, count);
}
