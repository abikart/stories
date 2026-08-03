# Repository agent notes

- Treat active documentation and world-bible assets as the current source of
  truth, not a process archive.
- Keep docs high-signal and current-state only. Do not retain chat transcripts
  or links, discarded alternatives, iteration histories, rejected prompts,
  superseded asset copies, or version-suffixed files after a replacement is
  accepted.
- Use Git history as the archive. When replacing a document or asset, remove the
  superseded active copy and update all references in the same change.
- Keep worldbuilding decisions in the current world documents; do not duplicate
  them as dated decision-log or handoff history.
- Keep production provenance only when it is required to reproduce or audit a
  release asset; exploratory worldbuilding does not need provider or chat
  history.
- Prefer stable descriptive filenames such as `geography-map.png` over `v1` or
  `v2` filenames for current assets.
