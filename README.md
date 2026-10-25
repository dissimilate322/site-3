# Otherlife — local multipage site

Next.js / React / TypeScript implementation with all site navigation kept local.

## Pages

- `/`: separate Home page with a full-screen phone/rocks film, agency introduction, four pinned project planes, eight client tiles and a closing film.
- `/work`: original six-project portfolio with List/Grid modes.
- `/company`: agency introduction, two founders, five service groups, office imagery, testimonial carousel, eight award entries and related work.
- `/careers`: hiring introduction, office gallery, perks and current reference vacancy.
- `/careers/senior-designer`: local vacancy details and a preview application flow.
- Six `/work/[slug]` pages: full reference content blocks, project imagery/video, outcomes, quotes, process steps, press citations and related work.

All project text, people, jobs and media are reference content from Otherlife, not newly invented owner information. Social URLs remain unset until owner URLs are supplied. No navigation, job application or case-study link redirects to Otherlife or MoonPay.

## Development

```sh
npm ci
npm run dev
```

Use **http://localhost:3000** (and `/work` for the portfolio). Node.js 24 is recommended; minimum Node 20.9. Use `localhost` rather than `127.0.0.1` for development HMR in this cloud environment. The project uses a local npm cache and verified Webpack development mode.

```sh
npm run typecheck
npm run build
npm start
npm run test:ui -- http://localhost:3000
npm run test:pages -- http://localhost:3000
npm run test:motion -- http://localhost:3000
```

Playwright uses `/usr/bin/chromium` or `CHROMIUM_PATH`. Reports/screenshots are stored in ignored `artifacts/qa` and `artifacts/pages` directories.

## Wispbyte deployment

```sh
npm run package:wispbyte -- /path/to/otherlife-wispbyte-full.zip
```

Packaging requires Python 3. It builds the Next.js standalone output and includes runtime dependencies, public assets and static chunks. Extract the ZIP into an empty server root. Use Node.js 24 with startup file **index.js**, or command `node index.js`. Set `PORT` to the allocated host port if `PORT`/`SERVER_PORT` is not injected. No build/install is needed on the host. For an update, stop the old server and replace its entire `.next`, `public` and `node_modules` directories plus root application files before restarting.

## Content and behavior

Content lives in `src/data/content.json`, typed by `content.ts`; project gallery data is in `projects.ts`. Navigation and optional owner social URLs are in `site.ts`. The media provenance manifest is `src/data/media-sources.json`.

126 additional media assets are local in `public/media`, alongside the original Work-page assets. Images are resized to a maximum of 1920px and encoded as WebP; video is encoded to H.264 MP4, up to 1280px wide (1920px for the desktop opening film). Source-refresh utility `scripts/sync-reference.py` requires curl, Python/Pillow and ffmpeg; it is not needed at runtime.

Forms are **previews**: `POST /api/contact` validates without sending or storing enquiries or applications. Apply opens the local contact panel prefilled with the role name. Testimonials support arrows/dots and visibility-aware autoplay. All films autoplay muted and loop while visible. Pause/Play remains available, hidden tabs and offscreen films pause, and reduced motion prevents automatic playback. Home includes word-by-word blur reveals, client-card flips, a following case cursor, and scroll-driven perspective changes between pinned projects. Local navigation shrinks/turns the outgoing page over a grey wordmark, then expands the incoming page. Reduced motion uses the normal document flow and immediate navigation. GSAP timelines, observers and listeners are cleaned up on unmount.

See [REFERENCE.md](REFERENCE.md) for verification details and the remaining differences from the original WebGL experience.
