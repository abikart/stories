/**
 * Reward stickers — die-cut style (white border + soft shadow, docs/08).
 * Art per story, derived from its scene; generic star fallback.
 */
export function Sticker({ storyId, size = 160 }: { storyId: string; size?: number }) {
  const art = STICKER_ART[storyId] ?? <StarArt />;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="story sticker"
      style={{ filter: "drop-shadow(0 4px 10px rgb(39 40 49 / 0.25))" }}
    >
      <circle cx="60" cy="60" r="56" fill="#fff" />
      <circle cx="60" cy="60" r="49" fill="#fdf3d9" />
      {art}
    </svg>
  );
}

const STICKER_ART: Record<string, React.ReactNode> = {
  "fox-on-the-box": (
    <g>
      {/* tipped box */}
      <g transform="rotate(8 60 78)">
        <rect x="28" y="62" width="64" height="34" rx="4" fill="#d9a15e" />
        <rect x="28" y="62" width="64" height="9" fill="#c08c4a" opacity="0.6" />
      </g>
      {/* fox head peeking */}
      <g transform="translate(46 34)">
        <polygon points="-12,-8 -4,10 -18,8" fill="#f48813" />
        <polygon points="24,-10 30,10 14,8" fill="#f48813" />
        <circle cx="8" cy="14" r="18" fill="#f48813" />
        <ellipse cx="18" cy="20" rx="10" ry="7.5" fill="#fffef1" />
        <circle cx="25" cy="19" r="3" fill="#272831" />
        <circle cx="3" cy="11" r="2.6" fill="#272831" />
        <circle cx="14" cy="10" r="2.6" fill="#272831" />
      </g>
      {/* bug buddy */}
      <g transform="translate(80 42)">
        <ellipse cx="0" cy="0" rx="7" ry="5.6" fill="#cc1d31" />
        <circle cx="-6.5" cy="-3" r="3.4" fill="#272831" />
        <ellipse cx="3" cy="-6" rx="4.6" ry="2.6" fill="#9dc7c8" transform="rotate(-16 3 -6)" />
      </g>
    </g>
  ),
  "pop-pop-pop": (
    <g>
      {/* popcorn pile */}
      {[[42, 82, 11], [60, 88, 12], [78, 82, 11], [52, 72, 10], [68, 72, 10], [60, 63, 10]].map(
        ([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill="#fffef1" />
            <circle cx={x - r * 0.6} cy={y + r * 0.3} r={r * 0.7} fill="#fdf6e0" />
            <circle cx={x + r * 0.6} cy={y + r * 0.3} r={r * 0.7} fill="#fff8d6" />
          </g>
        ),
      )}
      {/* Pip peeking from the pile */}
      <ellipse cx="60" cy="46" rx="20" ry="18" fill="#f2cd0f" />
      <circle cx="54" cy="42" r="2.6" fill="#272831" />
      <circle cx="66" cy="42" r="2.6" fill="#272831" />
      <path d="M 55 50 Q 60 54 65 50" stroke="#272831" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  "the-ship-in-the-rain": (
    <g>
      {/* sea */}
      <path d="M14 78 Q30 72 46 78 T78 78 T106 78 L106 96 A56 56 0 0 1 14 96 Z" fill="#2760f6" opacity="0.85" />
      {/* hull */}
      <path d="M38 66 L82 66 L74 80 L46 80 Z" fill="#584741" />
      {/* mast + sail */}
      <rect x="58" y="30" width="3" height="36" fill="#584741" />
      <path d="M61 32 L61 62 L82 62 Z" fill="#fffef1" />
      <path d="M56 34 L44 56 L56 58 Z" fill="#f2cd0f" />
      {/* rainbow */}
      <path d="M22 56 A38 38 0 0 1 98 56" fill="none" stroke="#cc1d31" strokeWidth="4" strokeLinecap="round" />
      <path d="M28 56 A32 32 0 0 1 92 56" fill="none" stroke="#f2cd0f" strokeWidth="4" strokeLinecap="round" />
      <path d="M34 56 A26 26 0 0 1 86 56" fill="none" stroke="#32c992" strokeWidth="4" strokeLinecap="round" />
    </g>
  ),
};

function StarArt() {
  return (
    <path
      d="M60 26 L69 48 L93 50 L75 66 L81 89 L60 76 L39 89 L45 66 L27 50 L51 48 Z"
      fill="#f2cd0f"
      stroke="#e0b90d"
      strokeWidth="2"
    />
  );
}
