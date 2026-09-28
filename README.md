# LUXEWEAR — The Jersey Archive

## Run

Needs [Node.js](https://nodejs.org) 16+. No `npm install` required.

```
node server.js        # or: npm start
```

Open **http://localhost:3000** and **scroll** — the first screen is intentionally just drifting dust;
the jersey forms as you scroll. Once formed, drag left/right to rotate it.

## Structure

```
luxewear/
├── server.js               static server (outside public/, serves only public/)
├── package.json
└── public/
    ├── index.html
    ├── css/style.css
    └── js/
        ├── app.js          the scene (unchanged logic)
        └── vendor/three.min.js   Three.js r128, self-hosted (CDN used only as a fallback)
```

## What was fixed

1. **Page stuck on the first frame (root cause).** `html,body{height:100%;overflow-x:hidden}` made `<body>`
   its own scroll container, so `window.scrollY` was always 0 and nothing ever advanced. Overflow now lives
   on `<html>` only.
2. `.spacer` (1100vh) sat on top of the canvas and swallowed pointer/touch input, so touch drag-to-rotate
   could not work. It is now `pointer-events:none`.
3. Three.js is served locally (`js/vendor/`) instead of relying solely on a CDN; CSS uses `color-scheme:dark`
   so the scrollbar matches the page; a blank favicon stops the `/favicon.ico` 404.
4. All asset URLs are relative, so it also works when hosted under a sub-path.
