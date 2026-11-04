# The Woodland Cabin · The Woodland Cabin

A third-person 3D forest portfolio with a first-person camera and a coloured ASCII rendering mode. Walk through the woods to one cabin. The workbench opens Projects, the diary opens About, the calling card opens Contact, and the tool wall opens Skills.

## Development

Run `npm install`, then `npm run dev` (http://localhost:4174). `npm run build` creates the static deployment in `dist/`. Three.js powers the scene; Vite packages local models, scripts, styles and project images. No external runtime asset host, account, database or API is required.

The source repository is https://github.com/portfolio-owner/Portfolio. The primary domain is `https://portfolio.example`; its DNS and certificate must be verified before announcing it. [DNS-SETUP.md](DNS-SETUP.md) contains the exact Namify records and dashboard instructions. The existing Sites URL remains available during setup.

`npm test` checks navigation, capsule-foot clearance, shared object geometry, closed/open door routing, collision sweeps, preferences and location transitions. `npm run test:browser` requires a Playwright Chromium installation or `SIDEQUEST_BROWSER_PATH` pointing to an existing executable. Start the dev server first. `SIDEQUEST_QA_URL` can target another preview URL. `npm run test:panels` checks the archive chapters, navigation, image loading and failure state, contact destinations, keyboard focus, and layouts from 320px to 1280px.

`npm run test:experience` uses the Vite dev server. It holds back the character download to verify the portfolio remains usable, checks that reading stops rendering, samples animated shoe geometry on the ground/step/porch/cabin surfaces, and runs into a rendered rock with real mouse and keyboard input. It records its measurements in `artifacts/experience-qa.json`. Automatic graphics is the default; explicit Low, Balanced and High settings remain in the field guide.

## Production launch checks

Run `npm ci`, `npm test`, `npm audit --audit-level=high`, then `npm run build`. Start `npm exec vite preview -- --host 127.0.0.1 --port 4175` and run `npm run test:launch`. Install Playwright Chromium first, or set `SIDEQUEST_BROWSER_PATH` to an existing Chromium executable. `SIDEQUEST_BROWSER=webkit npm run test:launch` uses the WebKit engine when its system dependencies are installed. The workflow in `.github/workflows/checks.yml` runs both engines on Ubuntu. Phone profiles emulate viewport, touch and browser conditions; they do not replace physical iPhone/Android testing.

`config/launch.mjs` holds the canonical origin and security policy. Set the build-time `SITE_URL` to a different HTTPS origin when changing hosts; `.env.example` documents the field. The build generates the CSP meta fallback, canonical/Open Graph/social-card tags, `robots.txt`, `sitemap.xml` and `_headers`. `vercel.json` provides equivalent response headers on Vercel. Verify headers on the final host because an HTML meta tag cannot implement every security header. See [SECURITY.md](SECURITY.md).

The social preview is a 1200×630 JPEG built from the actual woodland preview and the existing cabin typography. `npm run generate:share` regenerates it with Playwright. It is committed so a normal build does not require a browser. The preview is loaded by link-sharing services, not added to the page's startup downloads.

Personal content lives in `src/content.js`. The résumé field remains empty until a real file or URL is supplied; no professional employment title or résumé has been invented. Enable two-factor authentication directly in your GitHub, hosting and registrar accounts; the project cannot enable it for you.

## Controls

Enter the woods, then use WASD to walk and Shift to run. Mouse look uses pointer lock after a deliberate user action; Escape releases the cursor. With the cursor released, drag to look and click reachable ground to walk there. E interacts with a nearby door or portfolio object. V switches cameras. M opens the interactive map. The mobile joystick moves; drag the scene to look and use Interact/View buttons. Header links open content directly.

The cabin door is an explicit interaction. Choose Cabin porch on the map for automatic walking, open the door, then choose any interior object. Manual movement cancels the route. Opening a dialog releases the mouse and pauses movement; closing it leaves the cursor free until the visitor selects Mouse look.

Rendering, camera, audio, ambient-motion and discovery preferences are stored locally. Position starts at the forest trail each visit. Normal 3D is the default. Sound starts off. Reduced-motion preferences turn off ambient motion by default and disable walking animations and eased camera following. Low/Balanced/High quality controls affect render resolution, shadows and the number of detailed trees; distant silhouettes preserve forest density.

## Source layout

`src/world.js` is the shared collision/navigation/interaction manifest. `src/scene.js` authors the cabin and furniture and batches local forest models. `src/main.js` coordinates fixed-step movement, cameras, doors, pointer/touch controls, dialogs and state. The avatar, GPU ASCII pass, minimap and optional audio are separate modules. `src/content.js` contains the verified portfolio content. `index.html` includes the no-JavaScript reading view.

## Assets and evidence

The nature models are CC0 assets from Quaternius. The realistically proportioned human visitor is Adobe Mixamo Remy, with a native idle and retargeted walking/running clips, used under the Mixamo licence. See `public/models/ASSETS.md` and `public/models/HUMAN_ASSET.md` for exact sources and terms. This generic visitor is not a portrait of the-builder.

Weathered wood, slate, mossy rock, forest floor and dirt-path PBR maps are CC0 scans from Poly Haven. Their colour, normal, roughness and ambient-occlusion maps are bundled locally; `public/materials/ASSETS.md` records sources and optimization. `src/materials.js` loads these surfaces and applies metre-scaled UVs. The cabin geometry, props, backpack, glyph atlas, cloth weave and environmental effects are authored in code.

The backpack follows the upper-body bone rather than floating independently of the walking rig. Detailed nearby trees transition to renderer-captured images of the same models in the distance, replacing the previous geometric canopy placeholders. Grass uses fine curved blades and the trail keeps large rocks clear of its walking corridor.

Project copy and images are grounded in the-builder's public repositories: [SinceLastTime](https://github.com/portfolio-owner/SinceLastTime), [Project Blob](https://github.com/portfolio-owner/ProjectBlob), and [HumanResumeFilter](https://github.com/portfolio-owner/HumanResumeFilter). Name, email and LinkedIn were supplied by the owner. No employment history, résumé, project ownership split, or outcome metrics have been invented.

The previous village and initial woodland editions are backed up in ignored `artifacts/backups/` and remain recoverable in Git. The existing public Site identity is preserved in `.openai/hosting.json`.
