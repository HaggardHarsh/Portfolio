# The Woodland Cabin's village portfolio

Edition 05 replaces the monochrome ASCII scene with an authored daylight village. Four destinations introduce the-builder, selected projects, technologies, and his GitHub profile. Keyboard movement and click-to-walk share collision geometry with the visible buildings. On phones the camera follows the visitor; the Walk to controls select destinations outside the viewport.

## Run

`npm start` serves the static application at http://localhost:4173. No runtime dependencies or build step are needed. `npm install` installs the browser QA development dependency.

`npm test` runs 22 movement, navigation, migration, camera, and content checks. `npm run test:browser` requires a Playwright Chromium installation (`npx playwright install chromium`) or `SIDEQUEST_BROWSER_PATH` pointing to an existing Chromium executable. Start the preview server first; `SIDEQUEST_QA_URL` overrides its default address.

`python scripts/generate-village.py` regenerates the shared scene definition and collision mask (Pillow required). `python scripts/package-preview.py` validates the HTML and creates `artifacts/preview.html`, a browser-openable standalone preview, and `artifacts/sidequest-village.zip`, a deployable static package.

## Content and art

`dist/content.js` holds verified project summaries, source links, and skills evidence. `dist/index.html` includes a no-JavaScript reading view. Keep its fallback text in sync when content changes. The current contact destination links to GitHub; no email address, formal job title, employment history, or résumé has been supplied. Those fields are omitted rather than fabricated.

`dist/world-renderer.js` draws and caches the code-authored scenery. `dist/world-scene.js` and `dist/world-map.js` are generated together. `dist/camera.js` owns camera coordinate conversions. Buildings can be selected through their artwork, their labels, or the mobile walking controls. Header navigation opens content directly.

Saved discoveries and sound preferences remain in the visitor's browser. Edition 04 positions reset to the new safe spawn. Old monochrome settings are no longer exposed. There are no third-party runtime scripts or web fonts.

The old local edition and hosting identity were preserved under ignored `artifacts/backups/`. The old Sites project could not be found in the connected account, so the user-authorized replacement Site identity is recorded in `.openai/hosting.json`.

## Sources

Project copy and screenshots were checked against the public READMEs of [SinceLastTime](https://github.com/portfolio-owner/SinceLastTime), [Project Blob](https://github.com/portfolio-owner/ProjectBlob), and [HumanResumeFilter](https://github.com/portfolio-owner/HumanResumeFilter). The screenshots are repository assets, not fabricated project mockups. Personal name supplied by the owner. No performance or project outcome metrics are claimed.
