# CLI Changelog repository

- Preserve the recorded releases in `changelog.json`; `CHANGELOG.md` is generated from that history and must not be edited by hand.
- For setup, review and trust the root `mise.toml`, then run `mise run` (or `mise run bootstrap`) to install the pinned Bun workspace and regenerate the changelog.
- Lake dependencies belong to `.botlake/package.json`; use the root workspace and lockfile rather than a nested install.
