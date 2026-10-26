# meruem — local multipage site

Next.js / React / TypeScript implementation with all site navigation kept local.

## Pages

- `/`: separate Home page with a full-screen owner-supplied laptop scroll sequence, agency introduction, four scroll-driven project planes, eight client tiles and a closing contact frame.
- `/work`: original six-project portfolio with List/Grid modes.
- `/company`: agency introduction, two founders, five service groups, office imagery, testimonial carousel, eight award entries and related work.
- `/careers`: hiring introduction, office gallery, perks and current reference vacancy.
- `/careers/senior-designer`: local vacancy details and a preview application flow.
- Six `/work/[slug]` pages: full reference content blocks, project imagery/video, outcomes, quotes, process steps, press citations and related work.

Project text, people, jobs and media originate from the Otherlife reference; the site-facing agency name is adapted to meruem. The original source URLs remain in the provenance manifest. Social URLs remain unset until owner URLs are supplied. No navigation, job application or case-study link redirects to Otherlife or MoonPay.

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
npm run test:menu -- http://localhost:3000
```

Playwright uses `/usr/bin/chromium` or `CHROMIUM_PATH`. Reports/screenshots are stored in ignored `artifacts/qa`, `artifacts/pages` and `artifacts/motion` directories.

## Wispbyte deployment

[Download the current ready-to-run ZIP](https://github.com/dissimilate322/site-3/raw/refs/heads/codex/wispbyte-download/meruem-wispbyte.zip).

```sh
npm run package:wispbyte -- /path/to/meruem-wispbyte.zip
```

Packaging requires Python 3. It builds the Next.js standalone output and includes runtime dependencies, public assets and static chunks. Extract the ZIP into an empty server root. Use Node.js 24 with startup file **index.js**, or command `node index.js`. Set `PORT` to the allocated host port if `PORT`/`SERVER_PORT` is not injected. No build/install is needed on the host. For an update, stop the old server and replace its entire `.next`, `public` and `node_modules` directories plus root application files before restarting.

## Content and behavior

Content lives in `src/data/content.json`, typed by `content.ts`; project gallery data is in `projects.ts`. Navigation and optional owner social URLs are in `site.ts`. The media provenance manifest is `src/data/media-sources.json`.

125 additional media assets are local in `public/media`, alongside the original Work-page assets. Images are resized to a maximum of 1920px and encoded as WebP; videos are regenerated from their original sources at native resolution, up to 1920 × 1080 (1080 × 1920 for portrait), using H.264 CRF 18 with the slow encoder preset; an already compact original MP4 is remuxed without re-encoding. Native square videos keep their original resolution. Source-refresh utility `scripts/sync-reference.py` requires curl, Python/Pillow and ffmpeg; it is not needed at runtime. Pass `--refresh-videos` to regenerate video files from their sources.

Forms are **previews**: `POST /api/contact` validates without sending or storing enquiries or applications. Apply opens the local contact panel prefilled with the role name. Testimonials support arrows/dots and visibility-aware autoplay. Project films autoplay muted and loop while visible. Play/Pause film buttons are removed. Hidden tabs and offscreen films pause; every visible film starts automatically, including when reduced motion is selected. Home includes word-by-word blur reveals, client-card flips, a following case cursor, and independent two-viewport project tracks. A Three.js renderer reproduces the reference’s 50 × 50 surface mesh, staggered corner bends, optics compensation, radial shutter blur, centred hold and near-white gaps. Wheel, keyboard and touch input use the reference’s frame-time-based inertial scroll curve. Local navigation opens/closes a rounded perspective portal over the splitting wordmark; the incoming page stays live and stationary inside the mask. The Home footer loops back to the opening sequence when scrolling continues. WebGL failure falls back to accessible native video panels. Animations are enabled by default even when the OS reports reduced motion, as requested for this reference recreation. The menu’s **Reduce motion** switch explicitly disables perspective/reveal effects and uses immediate navigation; its setting persists locally across reloads. JavaScript and CSS use the same `data-motion` setting. Videos keep playing automatically in either mode. GSAP timelines, observers and listeners are cleaned up on unmount.

See [REFERENCE.md](REFERENCE.md) for verification details and the remaining differences from the original WebGL experience.

## Site colour palette

The interface on every route uses the requested near-white `#fafafa` background, light grey `#eeeef0` cards/dividers, graphite `#242427` text, violet `#8750f7` buttons/active elements and light violet `#b594fa` graphics/highlights. Hovered button labels use white for contrast. This covers typography, controls, menus/forms, loading portal and scrollbar. Client logos and hover media retain their original colours on the new light-grey card surfaces. All films and posters remain ungraded, with no filter on the video elements, project canvas or native fallback. HD files, playback and animation are unchanged. The site name remains meruem. All routes share the palette. CTA buttons use a light fill and thin graphite border, turning violet on hover.

[Desktop preview](https://raw.githubusercontent.com/dissimilate322/site-3/codex/wispbyte-download/meruem-preview.jpg).

The meruem wordmark stays plain black and unframed across all headers and loading transitions. Form inputs have visible grey underlines, with violet focus on Home. The mobile menu has a light header band so its black wordmark remains readable.

Menu dismissal follows the reference: labels leave downwards, rules collapse from the right, and an opaque panel slides out while header controls stay fixed. Desktop/mobile phase offsets are 0.48/0.55 seconds. The modal releases once the panel clears the viewport; early dismissal, resize and motion-mode interruption are regression-tested.

## Owner-supplied scroll hero

The supplied `upscale 2k.mp4` replaces the opening/closing reference film. The 24 fps source was motion-interpolated to 60 fps and extracted into 237 numbered WebP frames (2569 × 1440, quality 80, 22,512,396 bytes). Original source endpoint frames are retained as the first/last assets. Metadata and source hash are in `src/data/hero-sequence.json`. The uploaded original remains in the workspace attachment; the runtime ships the frames instead of a duplicate video.

Implemented using the user-selected [scroll-video-website skill](https://github.com/musoyangrigor/scroll-video-website-skill), retained with its license under `skills/scroll-video-website`. The stage stays pinned for a 500svh track, reaches the final image at 85% and holds it for contact clicks. The single RAF playhead uses frame-rate-independent smoothing and adjacent-frame crossfade. Frame zero loads first, then distributed anchors, then the remainder; fetches are deduplicated, decoded images have a bounded cache and release on navigation. First paint uses the source poster. An explicit reduced-motion choice holds the final suitable frame with contacts available.

Desktop uses centred cover geometry and contact hit areas aligned with the printed resume, email and Telegram positions. Mobile deliberately retains the full wide composition to keep the laptop visible, with separate 48px touch controls below. This adapts the skill's default mobile cover crop for the text-bearing footage. DPR is capped at 2; canvas transforms reset on resize. Target cadence is 60 fps; actual rendering speed depends on the device and image loading, and optical interpolation can introduce source-dependent artifacts.

Email and Telegram are configured from the supplied final frame. The owner postponed providing the resume link: `src/data/hero-contact.ts` contains an empty `resumeUrl`; until supplied, the resume button displays an honest unpublished message rather than a fake download. Set `resumeUrl` later to activate its download link. Other project films keep their native HD encodes and visibility-aware autoplay.

```sh
npm run test:scroll-hero -- http://localhost:3000
```
