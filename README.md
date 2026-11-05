# The Woodland Cabin · The Woodland Cabin

A third-person 3D forest portfolio with a first-person camera and a coloured ASCII rendering mode. Walk through the woods to one cabin. The workbench opens Projects, the diary opens About, the calling card opens Contact, and the tool wall opens Skills.

## Development

Run `npm install`, then `npm run dev` (http://localhost:4174). `npm run build:static` creates a static deployment in `dist/`. `npm run build` packages those same assets into a single-file Sites Worker at `dist/server/index.js`, which sends security headers directly. Three.js powers the scene; Vite packages local models, scripts, styles and project images. No external runtime asset host, account, database or API is required.

The public demo omits personal contact details, profile links, and account-specific domain setup data. [DNS-SETUP.md](DNS-SETUP.md) describes deployment configuration without identifying the owner.

## AWS Amplify Hosting

Connect this repository and branch to Amplify. The root `amplify.yml` installs dependencies with `npm ci`, runs `npm run build:static`, and publishes **only `dist/`**. Amplify uses this file instead of its saved console build settings. Use Node.js 22.12 or newer; the project's CI uses Node.js 24.

The source `index.html` imports `/src/main.js`, which Vite compiles into JavaScript and CSS under `/assets/`. Publishing the repository root skips that compilation and leaves the page unstyled, with missing images and models. `npm run build` creates a Sites-specific Worker bundle; Amplify needs `npm run build:static` instead.

Set the build-time `SITE_URL` environment variable in Amplify to the deployed HTTPS origin for canonical and sharing links, then redeploy. `customHttp.yml` applies the existing security headers using Amplify's supported configuration format. See [AWS build settings](https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html) and [custom headers](https://docs.aws.amazon.com/amplify/latest/userguide/custom-header-YAML-format.html).

Navigation uses fragments such as `/#projects`, so this site needs no catch-all rewrite to `index.html`. Remove an unconditional `/<*>` → `/index.html` 200 rewrite if one was added; it can return HTML when a script or model file is missing.

`npm test` checks navigation, capsule-foot clearance, shared object geometry, closed/open door routing, collision sweeps, preferences and location transitions. `npm run test:browser` requires a Playwright Chromium installation or `SIDEQUEST_BROWSER_PATH` pointing to an existing executable. Start the dev server first. `SIDEQUEST_QA_URL` can target another preview URL. `npm run test:panels` checks the archive chapters, navigation, image loading and failure state, contact destinations, keyboard focus, and layouts from 320px to 1280px.

`npm run test:experience` uses the Vite dev server. It holds back the character download to verify the portfolio remains usable, checks that reading stops rendering, samples animated shoe geometry on the ground/step/porch/cabin surfaces, and runs into a rendered rock with real mouse and keyboard input. It records its measurements in `artifacts/experience-qa.json`. Automatic graphics is the default; explicit Low, Balanced and High settings remain in the field guide.

## Production launch checks

Run `npm ci`, `npm test`, `npm audit --audit-level=high`, then `npm run build:static`. Start `npm exec vite preview -- --host 127.0.0.1 --port 4175` and run `npm run test:launch`. For the Sites response path, run `npm run build`, start `npm run preview:worker`, and run `SIDEQUEST_QA_URL=http://127.0.0.1:4176 npm run test:launch`. Install Playwright Chromium first, or set `SIDEQUEST_BROWSER_PATH` to an existing Chromium executable. `SIDEQUEST_BROWSER=webkit npm run test:launch` uses the WebKit engine when its system dependencies are installed. The workflow in `.github/workflows/checks.yml` runs both response paths in both engines on Ubuntu 24.04. Phone profiles emulate viewport, touch and browser conditions; they do not replace physical iPhone/Android testing.

`config/launch.mjs` holds the canonical origin and security policy. Set the build-time `SITE_URL` to a different HTTPS origin when changing hosts; `.env.example` documents the field. The client build generates the CSP meta fallback, canonical/Open Graph/social-card tags, `robots.txt`, `sitemap.xml` and `_headers`. `vercel.json` uses `build:static` and provides equivalent response headers on Vercel. Sites uses the Worker because its static delivery path did not apply `_headers`. The Worker embeds the existing client bytes at build time, serves only GET/HEAD, returns 404 for unknown files, and supports ETags/304 responses. It adds no runtime binding or third-party asset dependency. Verify headers on the final host because an HTML meta tag cannot implement every security header. See [SECURITY.md](SECURITY.md).

The social preview is a 1200×630 JPEG built from the actual woodland preview and the existing cabin typography. `npm run generate:share` regenerates it with Playwright. It is committed so a normal build does not require a browser. The preview is loaded by link-sharing services, not added to the page's startup downloads.

Personal content lives in `src/content.js`. The résumé field remains empty until a real file or URL is supplied; no professional employment title or résumé has been invented. Enable two-factor authentication directly in your GitHub, hosting and registrar accounts; the project cannot enable it for you.

## Controls

Enter the woods, then use WASD to walk and Shift to run. Mouse look uses pointer lock after a deliberate user action; Escape releases the cursor. With the cursor released, drag to look and click reachable ground to walk there. E interacts with a nearby door or portfolio object. V switches cameras. M opens the interactive map. The mobile joystick moves; drag the scene to look and use Interact/View buttons. Header links open content directly.

The cabin door is an explicit interaction. Choose Cabin porch on the map for automatic walking, open the door, then choose any interior object. Manual movement cancels the route. Opening a dialog releases the mouse and pauses movement; closing it leaves the cursor free until the visitor selects Mouse look.

Rendering, camera, audio, ambient-motion and discovery preferences are stored locally. Position starts at the forest trail each visit. Normal 3D is the default. Sound starts off. Reduced-motion preferences turn off ambient motion by default and disable walking animations and eased camera following. Low/Balanced/High quality controls affect render resolution, shadows and the number of detailed trees; distant silhouettes preserve forest density.

## Source layout

`src/world.js` is the shared collision/navigation/interaction manifest. `src/scene.js` authors the cabin and furniture and batches local forest models. `src/main.js` coordinates fixed-step movement, cameras, doors, pointer/touch controls, dialogs and state. The avatar, GPU ASCII pass, minimap and optional audio are separate modules. `src/content.js` contains the verified portfolio content. `index.html` includes the no-JavaScript reading view.

## Assets and evidence

The nature models are CC0 assets from Quaternius. The realistically proportioned human visitor is Adobe Mixamo Remy, with a native idle and retargeted walking/running clips, used under the Mixamo licence. See `public/models/ASSETS.md` and `public/models/HUMAN_ASSET.md` for exact sources and terms. This generic visitor is not a portrait of the builder.

Weathered wood, slate, mossy rock, forest floor and dirt-path PBR maps are CC0 scans from Poly Haven. Their colour, normal, roughness and ambient-occlusion maps are bundled locally; `public/materials/ASSETS.md` records sources and optimization. `src/materials.js` loads these surfaces and applies metre-scaled UVs. The cabin geometry, props, backpack, glyph atlas, cloth weave and environmental effects are authored in code.

The backpack follows the upper-body bone rather than floating independently of the walking rig. Detailed nearby trees transition to renderer-captured images of the same models in the distance, replacing the previous geometric canopy placeholders. Grass uses fine curved blades and the trail keeps large rocks clear of its walking corridor.

The examples describe a community board, a desktop companion, and a retrieval application. Personal identifiers, profile links, and images containing user names are omitted from this public build.
