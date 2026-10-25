# meruem site — reference and implementation audit

Reference: https://www.otherlife.xyz, inspected 25 October 2026.

## Current scope

Implemented separate Home, Work, Company and Careers pages, six full local case-study pages, and a local Senior Designer vacancy page. All four menu entries and project/client links resolve on the current site. The contact panel is shared across pages; the job application button opens it with a role-prefilled subject. Social links remain unset until owner URLs are provided. No navigation, application or form submission goes to Otherlife, MoonPay or an external hiring service.

Home follows the supplied screen recordings, including the latest 38.205-second “Клип #1_4.mp4”: phone/rocks opening film, studio introduction, four featured project planes, eight client tiles and closing film. Company includes the introduction, two founders, five service groups, two office images, testimonial carousel and eight award entries. Careers includes the hiring introduction, perks, four-image gallery, vacancy and contact CTA. All 37 case-study pageBuilder blocks were implemented: media, image rows, media grids, outcomes, quotes, numbered process sections and press citations. Content is from the requested reference, not invented owner/team/job information.

## Sources and browser inspection

Inspected published HTML, Next.js CMS data, Work/header/Company/Careers/Home/case-study JavaScript and CSS. Live desktop/mobile browser inspection used Chromium and the trusted environment proxy CA with TLS verification enabled. The original software-rendered WebGL entrance was slow or stalled on some pages. Its original playOpenAnimationEnd event and GSAP endpoint instrumentation were used for source-assisted captures; the heavy canvas was hidden where needed. For full-page Work captures, its locked scroll container was allowed to flow normally. These assisted screenshots are not proof of identical original WebGL behavior.

The settled Work, Company and Careers pages are white; the initial original loader is gray. Careers' loaded desktop introductory typography and geometry were compared directly. New-page full screenshots and functional reports are in artifacts/pages. Work comparison artifacts are in artifacts/reference and artifacts/comparison (all Git-ignored).

## Media and content

The original six Work banners, wordmark, favicon and Aeonik 300/400/500 plus Tobias regular fonts remain in public/assets. All 125 additional referenced media assets were downloaded locally into public/media. src/data/content.json contains normalized page/section data; content.ts supplies types. Source URLs are retained in media-sources.json and projects.ts. There are no hotlinked display assets.

Images were limited to 1920px and encoded as WebP; Next Image serves responsive variants. All videos were regenerated from original sources at native resolution (up to 1920 × 1080 landscape, 1080 × 1920 portrait) with H.264 CRF 18 / slow instead of the previous 720p / CRF 28 variants. The Artist Accelerator loop retains the original H.264 stream without a lossy re-encode. The unused standalone phone-screen texture was removed from the package; the opening/closing films already include it in their rendered scene. Source frame rates are preserved and faststart allows progressive playback. These optimizations preserve the source content while introducing compression/resizing differences. All referenced assets were found and locally verified; no unrelated stock imagery was substituted.

## Work geometry

The measured heading, divider and first four grid-item rectangles matched source-assisted reference coordinates with 0px difference at these sizes. This measures static geometry, not identical rasterization or animation.

| Viewport | Heading top / size | First image top | Gallery |
| --- | --- | --- | --- |
| 1920 × 1080 | 311 / 96 px | 538.406 px | 2 × 900 px, 20 px gap |
| 1440 × 900 | 311 / 96 px | 538.406 px | 2 × 660 px, 20 px gap |
| 1024 × 768 | 311 / 96 px | 538.406 px | 2 × 452 px, 20 px gap |
| 768 × 1024 | 181 / 96 px | 372.406 px | 1 × 722 px |
| 390 × 844 | 181 / 48 px | 317.203 px | 1 × 344 px |
| 375 × 812 | 181 / 48 px | 317.203 px | 1 × 329 px |

Work uses 16:9 images, 8px corners, desktop/mobile row gaps of 80/60px and 200px bottom padding. Grid text uses Aeonik; list rows and large menu labels use system sans. Hover scale is 1.1 over 300ms and List row hover is violet. Repeated view switching, focus trapping and Escape are tested.

## Motion, interactions and remaining differences

GSAP handles page/section entrances, reveal timing, service-image scroll masks, menu/contact expansion and exits. Testimonials support previous/next buttons, dots and visibility-aware autoplay. Related-work entries have desktop hover previews. Every film automatically plays muted and loops while visible; hidden tabs and offscreen media pause. There are no Play/Pause film buttons; automatic playback also runs with reduced motion. Timelines, observers, event listeners and timers are cleaned up on unmount.

The latest recording was inspected at 60 fps and cropped to its 1920 × 936 browser viewport. Home’s project animation now runs on a real Three.js/WebGL surface, using the published source’s perspective camera (65°, z = 5), 50 × 50 geometry, Catmull–Rom corner bending, staggered entry/exit phases, 1.1 overscan, optics compensation and 16-sample radial shutter blur. Each project occupies a two-viewport track; adjoining outgoing/incoming surfaces leave the recorded white space. Native videos supply the textures and pause outside the view. WebGL creation/context failure retains accessible native media and case links. The signed-distance mask uses a nonzero derivative interval to prevent a transparent seam on symmetric mobile pixel quads; opaque interior samples are tested at each project hold.

Wheel, keyboard and touch movement use the original controller’s time-based easing: each frame approaches the target by cubic-bezier(0,0,.58,1)(deltaSeconds × 3). Native document scrolling preserves focus, Back restoration, deep links and nested scrolling. The reference-style fading scrollbar follows that position. Continuing past the Home footer returns to its opening film; the hero/footer share playback time.

The page transition was corrected from rotating the whole page to rotating a rounded portal mask over stationary content. Original Theatre keyframes, Bézier handles, Euler rotation, 1.5 playback rate, split-logo assets and perspective projection drive its opening/closing. Incoming films continue playing through the aperture. Outgoing snapshots copy both video frames and the WebGL canvas. Browser Back, local menu links, explicit motion-mode changes and the body/focus locks are covered by regression checks.

At 19.75s in the supplied recording, the incoming Onramper top edge was measured at x = 192,384,…,1728: y = 408,406,404,402,400,398,396,395,392. At the corresponding scroll phase, the rendered surface matches those nine samples within 1px; its outgoing neighbour’s lower edge is approximately y = 40, leaving about 360px of space at the viewport centre (now near-white under the requested Home colour theme). A second Artist entry frame at 16s also matches the sampled top boundary within 1px. These measurements validate the projected outline, not identical movie frames or all page pixels. The automated regression allows 3px for browser rasterization.

The opening/closing scene uses the reference’s native-resolution rendered film, rather than its interactive 3D lighting/camera implementation. New-page typography, spacing and content follow available source measurements; no pixel-perfect claim is made for the full site. Press citations and awards are displayed without external article/profile links.

Contact and application forms are explicitly local previews: /api/contact validates required fields but never sends or stores enquiries. The vacancy page uses the description available on the original Careers page rather than an externally hosted ATS application system.

## Validation and delivery

npm run build and npm run typecheck pass. npm run test:pages covers all 11 routes at 1440px and 390px, loaded images, zero external anchors, local menus, horizontal overflow, testimonial controls, application prefilling/submission, hero/back/logo navigation and video metadata. Home/Company/Careers are also checked at 1920, 1024, 768 and 375px. npm run test:ui covers the existing Work interactions and six requested viewports. The standalone ZIP was extracted into a separate directory and tested directly without source dependencies or a build step.

Build a Wispbyte archive with npm run package:wispbyte. Use Node.js 24, startup index.js and the allocated PORT (or SERVER_PORT). All page code, runtime dependencies, static chunks, images, video and fonts are bundled. Source code and the downloadable archive are maintained in the corresponding GitHub branches.

The motion regression suite (`npm run test:motion`) checks the first film and automatic playback, all four project holds, case/menu/back/logo transitions, released body/focus locks, explicit reduced-motion selection and persistence, WebGL outline agreement with the recording, visible near-white pixels in all three project gaps, a monotonic inertial wheel trajectory, absent film controls and automatic playback of every case film at desktop and mobile sizes.

The animation failure was reproduced by emulating `prefers-reduced-motion: reduce`: it bypassed the original scroll timelines, page transitions and CSS sticky tracks. The deployed host served its JS chunks successfully and animated with no OS reduction. Full motion is now the requested default, independently of that OS signal. An explicit Reduce motion menu control persists the visitor’s choice and drives both CSS and GSAP. Regression checks cover full-motion scroll/transitions with the OS flag set, deliberate reduction, persistence, and re-enabling animation. The HTML build marker is `meruem-site-palette-20261026`.

Quality spot check: on the first three seconds of the Onramper loop, compared at 1920 × 1080 against the original, SSIM improved from 0.967921 for the previous 720p encode (upscaled for comparison) to 0.992148 for the new 1080p encode. Both opening-film orientations retain the original 60 fps. Video URLs carry the HQ revision so an older cached encode is not reused.

## Requested site palette

The latest site palette uses the five exact requested colours: near-white `#fafafa` for the background, light grey `#eeeef0` for client-card surfaces and dividers, graphite `#242427` for headings and text, violet `#8750f7` for buttons and active elements, and light violet `#b594fa` for graphic highlights. White labels keep violet buttons readable. It covers the header, contact/menu panels, text, buttons, scroll gaps, portal and custom scrollbar. The palette is applied to all routes; all routes use the meruem name.

Video grading remains removed at the owner’s request. Hero/closing films, featured project surfaces, posters and native fallback display the original media colours. The original neutral black video scrim and matching hero/closing-film backdrops stay in place. Client logos and hover media also remain unfiltered; only the card surfaces/dividers follow the new light-grey palette. HD assets, autoplay and animation timing have not changed.

The site-facing name is meruem across the header, mobile menu wordmark, split loader, favicon, visible text, alt/ARIA labels, metadata and package/startup labels. The outlined wordmarks use the existing Tobias font. The MoonPay affiliation subtitle has been removed from the site logo; MoonPay remains where it names a reference client. Reference source URLs and the existing motion-setting storage key remain intact.

The final wordmark correction removes Home backing/shadows and colour filters, uses black SVG glyphs in the split loader, and keeps header wordmarks black on every route. Form field rules use #85858b for visible separation on light-grey panels; focused fields remain violet. A light mobile-menu header band preserves black-wordmark contrast.

Menu exit follows the original published module 7420, inspected again against the live reference on 26 October 2026. Labels move down 100% with a 0.5s power1.out tween and per-row stagger; rules collapse from the right. Desktop visible-label/rule offsets are 0.16/0.20s because the original global selectors include hidden mobile elements. The opaque desktop panel begins at 0.48s, travels to its original 200vw position with a 2.5s power1.out tween; mobile begins at 0.55s with a 1s tween and separate logo/contact fading. Controls stay fixed and the hamburger reverses when dismissal starts. The modal releases focus/scroll after the panel clears the viewport, avoiding an offscreen interaction delay. Entrance cancellation, repeated Escape, resizing and explicit motion changes during exit are covered by regression checks.

The final CTA style uses a near-white fill, one-pixel graphite border and 10px corners, with violet fill and white text on hover. This covers header/contact, editorial/job CTAs and project case buttons. The five-colour interface palette now applies to Work, Company, Careers, the job page and every case study, including menus, forms, dots, list hover, dividers, loaders and scrollbars. Media retain their original colours.

Reference comparison used the original HTML/JS/CSS through verified curl-backed browser routing, with the introduction advanced to its settled state and heavy media hidden. Only the menu timeline was sampled at normal speed; desktop starting text/rule states were explicitly settled before capture. The comparison validates motion values and timing, not palette or identical whole-page rendering. `artifacts/menu` records checks against the sampled quadratic trajectories, label offsets and rule stagger.
