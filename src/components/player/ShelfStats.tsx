"use client";

import { useEffect, useState } from "react";
import { Sticker } from "./stickers";

/** Library shelf: words-read counter + earned stickers (localStorage). */
export function ShelfStats() {
  const [words, setWords] = useState<number | null>(null);
  const [stickers, setStickers] = useState<string[]>([]);

  useEffect(() => {
    try {
      setWords(Number(localStorage.getItem("stories:wordsRead") ?? 0));
      const s: Array<{ storyId: string }> = JSON.parse(
        localStorage.getItem("stories:stickers") ?? "[]",
      );
      setStickers(s.map((x) => x.storyId));
    } catch {
      setWords(0);
    }
  }, []);

  if (words === null || (words === 0 && stickers.length === 0)) return null;
  return (
    <div className="flex items-center justify-center gap-4" data-testid="shelf-stats">
      <span className="rounded-full bg-paper-deep px-4 py-2 text-sm font-semibold tabular-nums text-ink">
        ⭐ {words} words read
      </span>
      {stickers.map((id) => (
        <span key={id} title={`${id} sticker`}>
          <Sticker storyId={id} size={44} />
        </span>
      ))}
    </div>
  );
}
