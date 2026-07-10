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
