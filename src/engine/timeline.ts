/**
 * Page timeline — the single t ∈ [0,1] that text, scene, and audio all
 * render from (docs/04). Built from *measured* grapheme positions so the
 * Spark sits directly under the letters it lights: t is the horizontal
 * fraction across the prose line, and each cell (grapheme, or whole sight
 * word) owns a contiguous slice.
 */

export interface CellRange {
  tokenIndex: number;
  graphemeIndex: number;
  start: number;
  end: number;
}

export interface TokenRange {
  start: number;
  end: number;
  sight: boolean;
}

export class PageTimeline {
  constructor(
    readonly cells: CellRange[],
    readonly tokens: TokenRange[],
  ) {}

  /** Index of the cell under t, or -1 when t is at rest (≤ 0). */
  cellIndexAt(t: number): number {
    if (t <= 0) return -1;
    for (let i = this.cells.length - 1; i >= 0; i--) {
      if (t >= this.cells[i].start) return i;
    }
    return -1;
  }

  tokenIndexAt(t: number): number {
    const c = this.cellIndexAt(t);
    return c === -1 ? -1 : this.cells[c].tokenIndex;
  }

  /** Highest token index whose end lies at or before t, or -1. */
  lastTokenEndedBy(t: number): number {
    let last = -1;
    for (let i = 0; i < this.tokens.length; i++) {
      if (t >= this.tokens[i].end - 1e-4) last = i;
      else break;
    }
    return last;
  }

  tokenStart(i: number): number {
    return this.tokens[i]?.start ?? 0;
  }

  /** Keyboard step: one cell. */
  get step(): number {
    return 1 / Math.max(this.cells.length, 1);
  }
}
