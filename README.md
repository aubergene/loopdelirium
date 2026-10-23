# loop[delirium]

Website for the loop[delirium] art collective — [www.loopdelirium.com](https://www.loopdelirium.com).

Built with SvelteKit and prerendered to a static site hosted on GitHub Pages.

## Developing

```bash
pnpm install
pnpm dev          # https://localhost:5173 (self-signed cert)
pnpm dev --host   # also on your network, for testing on a phone
```

Motion sensors on iOS only work over HTTPS, hence the self-signed certificate —
accept the browser warning the first time.

```bash
pnpm check   # type check
pnpm lint    # Prettier check (pnpm format to fix)
pnpm build   # static site into build/
```

## Deploying

```bash
pnpm release
```

Builds the site and pushes `build/` to the `gh-pages` branch, which GitHub Pages
serves at the domain in `static/CNAME`. It doesn't push `main`, so `git push` too.

## Pages

- `/` — home, with the animated logo (tilt on phones, mouse on desktop)
- `/not-yet-but-soon` — the 2024 exhibition; artworks come from
  `src/lib/data/not-yet-but-soon-artworks.csv`
- `/not-yet-but-soon/cards` — printable wall labels with QR codes linking to each artwork
- `/screensaver` — full-screen, audio-reactive logo for exhibitions. Press **H** for
  controls, **F** for fullscreen. The cursor hides when idle and the screen is kept awake.
- `/debug/twist` — design tool for the logo's shape and motion. Settings are saved in
  the browser and shared with `/screensaver`.

## Fonts

The logo is drawn from glyph outlines in `static/fonts/google-sans-light.json`,
generated from the source font with:

```bash
pnpm convert-font scripts/fonts/GoogleSansFlex_36pt-Light.ttf static/fonts/google-sans-light.json
```

Page text uses `static/fonts/google-sans-flex-light.woff2`, a Latin subset of the same font.
