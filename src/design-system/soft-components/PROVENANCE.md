# Soft components provenance

This directory contains a local, maintainable copy of Jelly UI 1.1.0
for the Stories design system. The compatibility namespace remains `jelly-*` so
the published API and examples stay mechanically portable. Applications must
load either this local implementation or the hosted implementation, never both.

## Authoritative upstream

- Repository: <https://github.com/jelly-org/ui>
- Requested ref: `8e39a8e61b5a43a562ae85e4b01191d333d5b121`
- Pinned commit: `8e39a8e61b5a43a562ae85e4b01191d333d5b121`
- Package version: `1.1.0`
- Retrieved: 2026-07-20 (America/Los_Angeles)
- Author metadata: `Baldvin Mar Smarason <bmson@bmson.com>`
- License: MIT, `Copyright (c) 2026 bmson`

The updater verified a clean detached checkout with the upstream typecheck,
browser tests, build, and documentation generation. Stories source extensions
were then three-way merged over that checkout and the candidate was rebuilt and
verified before any project files were replaced.

## Pinned artifact snapshot

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `upstream/api-data.js` | 143800 | `c7a6e72a9c943465371045a1fb67d4ffe3dc19802d720c6be0aeb86729865e99` |
| `upstream/custom-elements.json` | 260859 | `df1a8a133fd3e5f767c669d497c9f525cd187a5e8c4d97a1a35e7c54f07c8134` |
| `upstream/jelly.d.ts` | 14181 | `1004cad04d5548661ffb9ad1eb29e59bc7627e948281222cb48fa0904093a22a` |
| `upstream/package.js` | 295 | `b62c4e0247d812ce883cc42e03a2e45c2ea9794b43f9e664b14bbef65e73e080` |

Machine-readable metadata is in [upstream/baseline.json](./upstream/baseline.json).
The most recent public-surface comparison is in
[upstream/UPDATE_REPORT.md](./upstream/UPDATE_REPORT.md).

## Update policy

Run `npm run update:soft-components -- --ref <tag-or-commit>`. Public API
changes require `--accept-api-changes`; the updater otherwise stops without
touching the worktree. Stories-authored source changes are reapplied with a
three-way merge. A conflict stops the update for manual review instead of
discarding either side. Presets and integration modules remain separate and
are never replaced. Review and commit the resulting Git diff.

Do not remove the upstream MIT notice when copying or extracting this package.
