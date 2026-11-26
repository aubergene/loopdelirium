# loop[delirium]

See README.md for commands, pages and deployment.

- Format with `pnpm format`; check with `pnpm check` and `pnpm build` before committing.
- Deploy with `pnpm release` (builds and pushes `build/` to `gh-pages`), and `git push` `main` too.
- Staying with the Friction artwork data comes from the artists' Google Sheet. Update it with
  `pnpm fetch-artworks`; don't edit `src/lib/data/staying-with-the-friction-artworks.csv` by hand.
  The script keeps only public columns: the sheet's install logistics must not be committed.
- Artwork pages are addressed by sheet id because printed QR codes link to them, so never
  renumber or reuse ids.
