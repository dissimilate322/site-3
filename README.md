# Otherlife Work

A Next.js / React / TypeScript reproduction of the current Otherlife Work page.
The page is available at `/work` and `/`.

```sh
npm ci
npm run dev
```

Open **http://localhost:3000/work**. Use `localhost` for development in this cloud
environment; the numeric loopback hostname can fail the HMR WebSocket handshake.
Node.js 24 and npm 11 were used. Next.js requires Node 20.9 or newer.
The project-local npm cache keeps installation writable in cloud sandboxes.

```sh
npm run typecheck
npm run build
npm start
```

With a server running, `npm run test:ui -- http://localhost:3000` runs Playwright
at all six requested viewport sizes and saves screenshots/results to
`artifacts/qa`. Chromium is preinstalled at `/usr/bin/chromium` in this cloud
environment; set `CHROMIUM_PATH` to another installed executable elsewhere.

Project content and asset provenance are in `src/data/projects.ts`; all media
and fonts are served locally. CSS Modules contain the measured layouts.

`POST /api/contact` is a local preview handler. It validates the required name,
email, and idea, returns `{ ok: true, mode: "preview", sent: false }`, and neither
sends nor stores enquiries. The form makes the preview state explicit after
submission. Otherlife's form endpoint is never called.

See [REFERENCE.md](REFERENCE.md) for inspection, measurements, source-assisted
screenshot methodology, and remaining animation differences.

Navigation is configured in `src/data/site.ts`. Only implemented local pages are
listed; social links are hidden until owner URLs are supplied. Project cards open
local `/work/[slug]` overview pages. These are summaries, not full original cases.
