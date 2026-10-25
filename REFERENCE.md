# Otherlife Work — reference and implementation audit

Reference: https://www.otherlife.xyz/work (inspected 25 October 2026).
The initial network block was resolved before implementation.

## Sources and verification

Inspected the live page in Chromium, its published HTML, Next.js page data,
stylesheets, and Work/header JavaScript. The current live data, rather than the
historical Lapa image, determines the six projects and their order.

All six original banners, the current MoonPay-signed wordmark, favicon, Aeonik
300/400/500, and Tobias regular are stored in `public/assets`. There are no
hotlinked media dependencies or replacement stock images. Original image URLs
are recorded alongside project data in `src/data/projects.ts`.

Chromium's software WebGL renderer delayed/stalled the original entrance.
The loader and some menu/contact states were observed without intervention.
For stable comparisons we also dispatched the original runtime's
`playOpenAnimationEnd` event, completed the original GSAP entrance targets, and
hid its heavy canvas. For full-page captures, the original scroll container was
allowed to flow naturally. These are **source-assisted reference screenshots**,
not evidence that the untouched WebGL animation was reproduced.
TLS verification stayed enabled; Chromium used the environment's proxy CA.

## Measured layout

| Viewport | Heading top / size | First image top | Gallery |
| --- | --- | --- | --- |
| 1920 × 1080 | 311 / 96 px | 538.406 px | 2 × 900 px, 20 px gap |
| 1440 × 900 | 311 / 96 px | 538.406 px | 2 × 660 px, 20 px gap |
| 1024 × 768 | 311 / 96 px | 538.406 px | 2 × 452 px, 20 px gap |
| 768 × 1024 | 181 / 96 px | 372.406 px | 1 × 722 px |
| 390 × 844 | 181 / 48 px | 317.203 px | 1 × 344 px |
| 375 × 812 | 181 / 48 px | 317.203 px | 1 × 329 px |

The settled page is white. Images use 16:9 cropping and 8 px corners; row gaps
are 80 px on desktop and 60 px below 1024. Captions, service copy, years, 200 px
bottom spacing, List rows, fixed header positions, and desktop/mobile menu and
contact dimensions follow published source and browser measurements. The grid
uses Aeonik; List rows and large navigation labels inherit system sans.

Verified interactions include image scale 1.1 over 300 ms, green List-row hover,
numbered navigation, a separate mobile menu Contact Us button, and the five-field
contact form. Closing contact restores the menu. Navigation now stays on the local site. Home and Work link to existing routes;
Company and Careers are omitted until their actual pages exist. All six cards
open local project overviews. Original social/profile and MoonPay privacy links
were removed; owner social URLs can be configured in src/data/site.ts.

## Implemented motion and limits

GSAP handles heading/card entrance, staggered view switching, sliding navigation,
contact width/height expansion, staggered fields, and exits. Timelines and
listeners are cleaned up. Reduced motion disables these animations, and touch
devices do not receive desktop image-hover effects.

The original WebGL loader, portal transitions between website pages, and custom
scroll engine have not been ported. This Work implementation uses a lightweight
GSAP entrance and native scrolling. Exact WebGL timing, cursor/portal behavior
during case-study navigation, and scroll feel could not be reliably verified in
headless Chromium. No extra distortion, tilt, cursor, video playback, or list
preview effects were invented. The six current Work banners are still images.
Contact submission validates locally and explicitly confirms that no enquiry
was sent; it never submits to Otherlife or stores the form values.

Next Image creates responsive AVIF/WebP variants; minor compression/rasterization
differences are possible. This is a close reproduction, not a claim of identical
pixels or identical WebGL behavior.

## Validation

`npm run build`, `npm run typecheck`, and the Playwright suite cover both routes,
all six sizes, all images, repeated List/Grid switching, horizontal overflow,
layout stability, menu/focus/Escape, desktop/mobile contact, local validation,
card navigation, hover reset, reduced motion, and browser console errors.
Evidence is generated under `artifacts/qa` (Git-ignored). Reference captures and
geometry comparisons are in `artifacts/reference` and `artifacts/comparison`.
The final comparison found 0 px difference in the measured heading, divider,
and first four grid-item rectangles at all six viewport sizes. This measures
layout endpoints; it does not establish identical image compression or motion.

Use `http://localhost:3000` for development. In this cloud browser, the numeric
`127.0.0.1` hostname caused an HMR WebSocket handshake failure and prevented
hydration; `localhost` and the production server worked. The dev script uses the
verified Webpack mode. Production rendering does not require HMR.

## Navigation correction

The /work/[slug] pages are local image-and-description overviews using the existing
project metadata. They are not full reproductions of the original case studies.
Company, Careers, and a separate original-style Home page are still unimplemented.
No links to those unimplemented pages or original third-party profiles are shown.
