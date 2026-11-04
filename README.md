# The Woodland Cabin · The Woodland Cabin

A third-person 3D forest portfolio with a first-person camera and a coloured ASCII rendering mode. Walk through the woods to one cabin. The workbench opens Projects, the diary opens About, the calling card opens Contact, and the tool wall opens Skills.

## Development

Run `npm install`, then `npm run dev` (http://localhost:4174). `npm run build` creates the static deployment in `dist/`. Three.js powers the scene; Vite packages local models, scripts, styles and project images. No external runtime asset host, account, database or API is required.

`npm test` checks navigation, capsule-foot clearance, shared object geometry, closed/open door routing, collision sweeps, preferences and location transitions. `npm run test:browser` requires a Playwright Chromium installation or `SIDEQUEST_BROWSER_PATH` pointing to an existing executable. Start the dev server first. `SIDEQUEST_QA_URL` can target another preview URL. `npm run test:panels` checks the archive chapters, navigation, image loading and failure state, contact destinations, keyboard focus, and layouts from 320px to 1280px.

`npm run test:experience` uses the Vite dev server. It holds back the character download to verify the portfolio remains usable, checks that reading stops rendering, samples animated shoe geometry on the ground/step/porch/cabin surfaces, and runs into a rendered rock with real mouse and keyboard input. It records its measurements in `artifacts/experience-qa.json`. Automatic graphics is the default; explicit Low, Balanced and High settings remain in the field guide.

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
