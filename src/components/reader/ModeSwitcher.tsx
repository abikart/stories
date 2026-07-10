"use client";

export type ReadingMode = "read-it" | "read-along" | "read-to-me";

export const MODES: Array<{ id: ReadingMode; label: string }> = [
  { id: "read-it", label: "Read it" },
  { id: "read-along", label: "Read along" },
  { id: "read-to-me", label: "Read to me" },
];

export function ModeSwitcher({
  mode,
  onChange,
}: {
  mode: ReadingMode;
  onChange: (m: ReadingMode) => void;
}) {
  return (
    <div className="mode-pill" role="group" aria-label="reading mode">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          aria-pressed={mode === m.id}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
