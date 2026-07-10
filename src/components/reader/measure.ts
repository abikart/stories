import { PageTimeline, type CellRange, type TokenRange } from "@/engine/timeline";

export interface ProseMeasurement {
  timeline: PageTimeline;
  cellEls: HTMLElement[];
  tokenEls: HTMLElement[];
  /** Rail geometry relative to the prose container: px. */
  railLeft: number;
  railWidth: number;
}

/**
 * Build the page timeline from the *rendered* prose: each [data-g] span's
 * pixel range (extended to gap midpoints for continuous coverage) becomes
 * its slice of t, so the Spark is always under the letters it lights.
 * Level-1 pages are single-line by design (docs/05 word limits).
 */
export function measureProse(container: HTMLElement): ProseMeasurement | null {
  const tokenEls = Array.from(container.querySelectorAll<HTMLElement>("[data-tok]"));
  if (tokenEls.length === 0) return null;

  const cellEls: HTMLElement[] = [];
  const cellToken: number[] = [];
  const cellGrapheme: number[] = [];
  tokenEls.forEach((tokEl, ti) => {
    const gs = Array.from(tokEl.querySelectorAll<HTMLElement>("[data-g]"));
    gs.forEach((g, gi) => {
      cellEls.push(g);
      cellToken.push(ti);
      cellGrapheme.push(gi);
    });
  });
  if (cellEls.length === 0) return null;

  const rects = cellEls.map((el) => el.getBoundingClientRect());
  if (rects.some((r) => r.width === 0)) return null; // not laid out yet

  const tops = rects.map((r) => r.top);
  if (Math.max(...tops) - Math.min(...tops) > rects[0].height * 0.6) {
    console.warn("stories.sh: prose wrapped to multiple lines — scrub mapping assumes one line");
  }

  const left = Math.min(...rects.map((r) => r.left));
  const right = Math.max(...rects.map((r) => r.right));
  const width = right - left;
  if (width <= 0) return null;
  const norm = (x: number) => (x - left) / width;

  const cells: CellRange[] = rects.map((r, i) => ({
    tokenIndex: cellToken[i],
    graphemeIndex: cellGrapheme[i],
    start: norm(r.left),
    end: norm(r.right),
  }));
  // continuous coverage: split inter-word gaps at their midpoint
  for (let i = 0; i < cells.length - 1; i++) {
    const mid = (cells[i].end + cells[i + 1].start) / 2;
    cells[i].end = mid;
    cells[i + 1].start = mid;
  }
  cells[0].start = 0;
  cells[cells.length - 1].end = 1;

  const tokens: TokenRange[] = tokenEls.map((el, ti) => {
    const own = cells.filter((c) => c.tokenIndex === ti);
    return {
      start: own[0]?.start ?? 0,
      end: own[own.length - 1]?.end ?? 0,
      sight: el.hasAttribute("data-sight"),
    };
  });

  const crect = container.getBoundingClientRect();
  return {
    timeline: new PageTimeline(cells, tokens),
    cellEls,
    tokenEls,
    railLeft: left - crect.left,
    railWidth: width,
  };
}

/**
 * Per-frame highlight painter — attribute writes only, no layout reads.
 * States (docs/08): dim (unread) / active (under the Spark) / lit (behind
 * it); tokens gain data-read (green underline) once furthest-t passes them.
 */
export class HighlightPainter {
  private lastActive = -2;
  private lastRead = -2;

  constructor(
    private cellEls: HTMLElement[],
    private tokenEls: HTMLElement[],
    private timeline: PageTimeline,
  ) {}

  paint(t: number, furthest: number) {
    const active = this.timeline.cellIndexAt(t);
    if (active !== this.lastActive) {
      for (let i = 0; i < this.cellEls.length; i++) {
        this.cellEls[i].dataset.state = i < active ? "lit" : i === active ? "active" : "dim";
      }
      this.lastActive = active;
    }
    const read = this.timeline.lastTokenEndedBy(furthest);
    if (read !== this.lastRead) {
      for (let i = 0; i < this.tokenEls.length; i++) {
        this.tokenEls[i].toggleAttribute("data-read", i <= read);
      }
      this.lastRead = read;
    }
  }
}
