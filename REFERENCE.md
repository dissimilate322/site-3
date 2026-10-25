# Otherlife site — reference and implementation audit

Reference: https://www.otherlife.xyz, inspected 25 October 2026.

## Current scope

Implemented separate Home, Work, Company and Careers pages, six full local case-study pages, and a local Senior Designer vacancy page. All four menu entries and project/client links resolve on the current site. The contact panel is shared across pages; the job application button opens it with a role-prefilled subject. Social links remain unset until owner URLs are provided. No navigation, application or form submission goes to Otherlife, MoonPay or an external hiring service.

Home includes four featured project panels, original video loops, studio description, showreel and eight client tiles. Company includes the introduction, two founders, five service groups, two office images, testimonial carousel and eight award entries. Careers includes the hiring introduction, perks, four-image gallery, vacancy and contact CTA. All 37 case-study pageBuilder blocks were implemented: media, image rows, media grids, outcomes, quotes, numbered process sections and press citations. Content is from the requested reference, not invented owner/team/job information.

## Sources and browser inspection

Inspected published HTML, Next.js CMS data, Work/header/Company/Careers/Home/case-study JavaScript and CSS. Live desktop/mobile browser inspection used Chromium and the trusted environment proxy CA with TLS verification enabled. The original software-rendered WebGL entrance was slow or stalled on some pages. Its original playOpenAnimationEnd event and GSAP endpoint instrumentation were used for source-assisted captures; the heavy canvas was hidden where needed. For full-page Work captures, its locked scroll container was allowed to flow normally. These assisted screenshots are not proof of identical original WebGL behavior.

The settled Work, Company and Careers pages are white; the initial original loader is gray. Careers' loaded desktop introductory typography and geometry were compared directly. New-page full screenshots and functional reports are in artifacts/pages. Work comparison artifacts are in artifacts/reference and artifacts/comparison (all Git-ignored).

## Media and content

The original six Work banners, wordmark, favicon and Aeonik 300/400/500 plus Tobias regular fonts remain in public/assets. All 122 additional referenced media assets were downloaded locally into public/media. src/data/content.json contains normalized page/section data; content.ts supplies types. Source URLs are retained in media-sources.json and projects.ts. There are no hotlinked display assets.

Images were limited to 1920px and encoded as WebP; Next Image serves responsive variants. Video was transcoded to H.264 MP4 at up to 1280px wide. These optimizations preserve the source content while introducing compression/resizing differences. All referenced assets were found and locally verified; no unrelated stock imagery was substituted.

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

Work uses 16:9 images, 8px corners, desktop/mobile row gaps of 80/60px and 200px bottom padding. Grid text uses Aeonik; list rows and large menu labels use system sans. Hover scale is 1.1 over 300ms and List row hover is green. Repeated view switching, focus trapping and Escape are tested.

## Motion, interactions and remaining differences

GSAP handles page/section entrances, reveal timing, service-image scroll masks, menu/contact expansion and exits. Testimonials support previous/next buttons, dots and visibility-aware autoplay. Related-work entries have desktop hover previews. Local video has playback controls; hero loops play only while visible, and reduced motion prevents automatic playback. Timelines, observers, event listeners and timers are cleaned up on unmount.

The original WebGL loader, portal distortion, custom scroll/cursor engine, pinned homepage transitions and bespoke video UI were not ported exactly. This implementation uses the published DOM fallback's section sequence, native scrolling, GSAP reveals and accessible standard video controls. New-page typography, spacing and content follow available source measurements; no pixel-perfect claim is made for the full site. Press citations and awards are displayed without external article/profile links.

Contact and application forms are explicitly local previews: /api/contact validates required fields but never sends or stores enquiries. The vacancy page uses the description available on the original Careers page rather than an externally hosted ATS application system.

## Validation and delivery

npm run build and npm run typecheck pass. npm run test:pages covers all 11 routes at 1440px and 390px, loaded images, zero external anchors, local menus, horizontal overflow, testimonial controls, application prefilling/submission, hero/back/logo navigation and video metadata. Home/Company/Careers are also checked at 1920, 1024, 768 and 375px. npm run test:ui covers the existing Work interactions and six requested viewports. The standalone ZIP was extracted into a separate directory and tested directly without source dependencies or a build step.

Build a Wispbyte archive with npm run package:wispbyte. Use Node.js 24, startup index.js and the allocated PORT (or SERVER_PORT). All page code, runtime dependencies, static chunks, images, video and fonts are bundled. Source code and the downloadable archive are maintained in the corresponding GitHub branches.
