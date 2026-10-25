# Otherlife — local multipage site

Next.js / React / TypeScript implementation with all site navigation kept local.

## Pages

- `/`: separate Home page with a full-screen phone/rocks film, agency introduction, four scroll-driven project planes, eight client tiles and a closing film.
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

Playwright uses `/usr/bin/chromium` or `CHROMIUM_PATH`. Reports/screenshots are stored in ignored `artifacts/qa`, `artifacts/pages` and `artifacts/motion` directories.

## Wispbyte deployment

[Download the current ready-to-run ZIP](https://github.com/dissimilate322/site-3/raw/refs/heads/codex/wispbyte-download/otherlife-wispbyte-reference-motion.zip).

```sh
npm run package:wispbyte -- /path/to/otherlife-wispbyte-full.zip
```

Packaging requires Python 3. It builds the Next.js standalone output and includes runtime dependencies, public assets and static chunks. Extract the ZIP into an empty server root. Use Node.js 24 with startup file **index.js**, or command `node index.js`. Set `PORT` to the allocated host port if `PORT`/`SERVER_PORT` is not injected. No build/install is needed on the host. For an update, stop the old server and replace its entire `.next`, `public` and `node_modules` directories plus root application files before restarting.

## Content and behavior

Content lives in `src/data/content.json`, typed by `content.ts`; project gallery data is in `projects.ts`. Navigation and optional owner social URLs are in `site.ts`. The media provenance manifest is `src/data/media-sources.json`.

125 additional media assets are local in `public/media`, alongside the original Work-page assets. Images are resized to a maximum of 1920px and encoded as WebP; videos are regenerated from their original sources at native resolution, up to 1920 × 1080 (1080 × 1920 for portrait), using H.264 CRF 18 with the slow encoder preset; an already compact original MP4 is remuxed without re-encoding. Native square videos keep their original resolution. Source-refresh utility `scripts/sync-reference.py` requires curl, Python/Pillow and ffmpeg; it is not needed at runtime. Pass `--refresh-videos` to regenerate video files from their sources.

Forms are **previews**: `POST /api/contact` validates without sending or storing enquiries or applications. Apply opens the local contact panel prefilled with the role name. Testimonials support arrows/dots and visibility-aware autoplay. All films autoplay muted and loop while visible. Play/Pause film buttons are removed. Hidden tabs and offscreen films pause; every visible film starts automatically, including when reduced motion is selected. Home includes word-by-word blur reveals, client-card flips, a following case cursor, and independent two-viewport project tracks. A Three.js renderer reproduces the reference’s 50 × 50 surface mesh, staggered corner bends, optics compensation, radial shutter blur, centred hold and white gaps. Wheel, keyboard and touch input use the reference’s frame-time-based inertial scroll curve. Local navigation opens/closes a rounded perspective portal over the splitting grey wordmark; the incoming page stays live and stationary inside the mask. The Home footer loops back to the opening scene when scrolling continues. WebGL failure falls back to accessible native video panels. Animations are enabled by default even when the OS reports reduced motion, as requested for this reference recreation. The menu’s **Reduce motion** switch explicitly disables perspective/reveal effects and uses immediate navigation; its setting persists locally across reloads. JavaScript and CSS use the same `data-motion` setting. Videos keep playing automatically in either mode. GSAP timelines, observers and listeners are cleaned up on unmount.

See [REFERENCE.md](REFERENCE.md) for verification details and the remaining differences from the original WebGL experience.
