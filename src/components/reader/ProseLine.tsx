"use client";

import { forwardRef } from "react";
import type { Token } from "@/engine/types";

/**
 * The prose, pre-wrapped for the painter: every token is a [data-tok]
 * wrapper; every highlightable unit is a [data-g] span — one per grapheme,
 * or one for the whole word when it's a sight word. Static per page; all
 * highlight state is applied imperatively (no re-renders on scrub).
 */
export const ProseLine = forwardRef<
  HTMLParagraphElement,
  { tokens: Token[]; onWordTap?: (tokenIndex: number) => void }
>(function ProseLine({ tokens, onWordTap }, ref) {
  return (
    <p
      ref={ref}
      className="prose-line font-reading select-none text-3xl font-medium sm:text-4xl"
      onClick={(e) => {
        const tok = (e.target as HTMLElement).closest?.("[data-tok]");
        if (tok) onWordTap?.(Number((tok as HTMLElement).dataset.tok));
      }}
    >
      {tokens.map((token, i) => (
        <span
          key={i}
          data-tok={i}
          data-sight={token.sight ? "" : undefined}
          className="prose-token"
        >
          {token.sight ? (
            <span data-g data-state="dim" className="prose-cell">
              {token.w}
            </span>
          ) : (
            token.g!.map((grapheme, gi) => (
              <span key={gi} data-g data-state="dim" className="prose-cell">
                {grapheme}
              </span>
            ))
          )}
          {token.punct && <span className="prose-punct">{token.punct}</span>}
        </span>
      ))}
    </p>
  );
});
