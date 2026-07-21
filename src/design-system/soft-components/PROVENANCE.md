# Soft components provenance

This directory contains a local, maintainable copy of Jelly UI v1.1.0 for
the Stories design system. The compatibility namespace remains `jelly-*` so
the published API and examples stay mechanically portable. Applications must
load either this local implementation or the hosted implementation, never both.

## Authoritative upstream

- Repository: <https://github.com/jelly-org/ui>
- Pinned commit: `8e39a8e61b5a43a562ae85e4b01191d333d5b121`
- Package version: `1.1.0`
- Retrieved: 2026-07-20 (America/Los_Angeles)
- Author metadata: Baldvin Mar Smarason `<bmson@bmson.com>`
- License: MIT, `Copyright (c) 2026 bmson`

The pinned commit was rebuilt with `npm ci && npm run build`. Its generated
bundle, source map, declarations, and docs data match the hosted artifacts
byte-for-byte. The checked-in `src/` and co-located browser tests are the
readable maintenance source; `dist/` is the exact hosted build used as the
initial compatibility baseline.

## Hosted artifact snapshot

| Artifact | Source URL | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| Public entry | <https://jelly-ui.com/package.js> | 295 | `b62c4e0247d812ce883cc42e03a2e45c2ea9794b43f9e664b14bbef65e73e080` |
| Bundle | <https://jelly-ui.com/dist/jelly.js> | 318426 | `68af6000710c7b8bd22d3ed8e337308fb20d767511483d1458f27288d34950ef` |
| Source map | <https://jelly-ui.com/dist/jelly.js.map> | 629418 | `51c23050586f52fc55f1108b681c154a28e0355a11f8cba887b36f74ee64df7c` |
| Declarations | <https://jelly-ui.com/dist/jelly.d.ts> | 14181 | `1004cad04d5548661ffb9ad1eb29e59bc7627e948281222cb48fa0904093a22a` |
| API data | <https://jelly-ui.com/docs/content/data.js> | 143800 | `c7a6e72a9c943465371045a1fb67d4ffe3dc19802d720c6be0aeb86729865e99` |
| Local manifest | generated from pinned source | 260859 | `df1a8a133fd3e5f767c669d497c9f525cd187a5e8c4d97a1a35e7c54f07c8134` |

## Upstream baseline verification

The untouched pinned source passes its real-browser suite in Chromium:

- 40 test files passed;
- 114 tests passed; and
- the generated API data matches the hosted API data exactly.

Stories-authored changes must remain visibly separated from this baseline in
presets, integration modules, documentation, or later commits. Do not remove
the upstream MIT notice when copying or extracting this package.
