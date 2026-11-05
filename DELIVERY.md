# Calling card · Edition 11

The calling card uses the archive's existing leather, warm paper, serif headings and brass rules. ENERGY 2 / RHYTHM 3 / MOTION 1 remain unchanged. The name and email form the card's focal point; the separate ruled LinkedIn row signals a destination outside the cabin. No new visual assets or animation were added.

Contact is restored in the navigation, chapter index and no-JavaScript view. Public name, email and LinkedIn values come from hosting build variables. The committed defaults contain no personal values. Invalid email addresses and non-HTTPS or unrelated profile URLs are omitted, names are HTML-escaped, and LinkedIn links use `noopener noreferrer`. An unconfigured build has an explicit empty state with a working project link.

## Calling card delivery gate

- Hard gate PASS within coverage: 27 Node tests and the static build pass. The panel browser checks verify configured destinations, the no-JavaScript contact view, keyboard containment and focus return, image failure states and layouts at 320, 390, 768 and 1280px. The Chromium launch checks pass desktop, iPhone and Android profiles with the existing CSP. No contact values appear in tracked or non-ignored source files.
- Purpose gate PASS: the paper border and binding shadow retain the calling-card metaphor; the serif owner name establishes the hierarchy; the single external arrow identifies the LinkedIn destination. No unrelated decoration or controls were introduced.
- Liveliness PASS: the existing fern motif, green binding, paper surface and brass accent remain the identity. The email card and ruled profile row have distinct compositions. The contact page adds no motion.
- Craftsmanship PASS within coverage: desktop and phone contact screenshots were reviewed. Email text wraps within its card; both links have usable touch areas and visible keyboard focus. Card text contrast measures 9.48:1 for the name, 7.01:1 for links, 5.65:1 for body copy and 5.08:1 for the footer. The existing archive supplies empty, image-error and loading states. The link destinations were verified without sending a message.

## Retained movement and performance verification · Edition 09

Rendered rocks and movement collision now share one seeded layout. Circular rock clearance applies to manual movement and automatic routes. Porch rails, the chair and the plant block movement; the fallen log's blocker covers its rotated footprint. Ground, first step, porch, threshold and cabin height come from shared surface data. The avatar samples animated shoe extrema to keep the actual sole geometry above those surfaces while idle, walking, running and blending between clips. The camera uses the same floor height.

The initial portfolio entry is now 36.06 kB / 14.71 kB gzip, down from 703.74 kB / 188.01 kB gzip. The 3D engine loads in separate chunks after the first UI paint. The loader is a compact status rather than a blocking screen, with a 102,732-byte preview of the actual woodland behind it. Model/material downloads run concurrently. Static world shadows are cached, the visitor has a following contact shadow, static furnishings batch across groups, and the distant forest retains captured tree silhouettes. Adaptive graphics reduces detail and pixel ratio after sustained slow frames; manual quality choices remain available. The ASCII world pass now samples two pixels per glyph cell instead of a full-size scene texture. Reading stops rendering, hidden tabs skip scene work, and unchanged HUD/minimap values no longer cause repeated writes.

Public assets fall from 11,910,391 to 6,116,535 bytes, a net reduction of 5,793,856 bytes (48.6%) including the new preview. The character loses only unreferenced embedded texture data and a duplicate body image; geometry, rig, animation and effective diffuse images remain intact. Smaller material maps and the birch bark delivery texture account for the other savings. Provenance and dimensions are recorded with the assets.

## Movement and performance delivery gate

- Hard gate PASS within coverage: all sixteen Node tests pass, including every rock, swept movement, indexed/full collision parity, route detours, floor heights and adaptive quality. Real mouse/keyboard input runs into a rendered rock without entering its clearance boundary. A deliberately held-back character download does not prevent opening About. Existing contact links, keyboard navigation, phone layouts and image error states pass the archive checks. No new personal or performance claims appear in product copy.
- Purpose gate PASS: shared physical data removes mismatches between scene and controller; the preview is a capture of the actual woodland, and the smaller loading status keeps portfolio content accessible. Cached world shadows and a local contact shadow preserve grounding at lower recurring cost. Existing material families, archive compositions and identity are retained. Reasons are recorded in DESIGN.md.
- Liveliness PASS: world ENERGY 3 / RHYTHM 2 / MOTION 2 and archive ENERGY 2 / RHYTHM 3 / MOTION 1 remain appropriate. The character, trees, birds, smoke and water retain their motion, with existing pause/reduced-motion controls. Reading suspends the world instead of spending GPU time behind a dialog.
- Craftsmanship PASS within coverage: the full Chromium walk covers manual movement, both cameras/renderers, interruption, porch/door, all four interior objects, real contact links, preferences, mobile controls and no-JavaScript content. Dedicated checks sample 96 animation frames for each idle/walk/run mode on all four floor surfaces; sampled shoe minima remain above the surface. The archive run passes at 320/390/768/1280px. The production build verifies split chunks, all quality choices, project images, camera/renderer switching and rendering suspension, with no recorded page or shader errors.

## Measurements and limits

In one cold local production run at 960×700 under Chromium software WebGL, the portfolio-ready mark was 50.4ms and the world-ready mark was 1,579.6ms. These are local measurements, not visitor-network promises. In the same software-rendered viewport, the earlier balanced default reported 628,694 triangles and 159 draw calls; the new automatic mode settled at 125,113 triangles and 84 calls with reduced resolution. Observed browser animation-frame median fell from about 916.6ms to 199.9ms in these software runs. This environment still cannot establish smooth physical-device frame rates, and zero dropped frames across all devices is not claimed. Phone GPU performance and Safari remain unverified.

`npm run test:experience` records its checks in artifacts/experience-qa.json. Production measurements are in artifacts/performance-production.json; screenshots include performance-production.png, performance-ascii.png and rock-collision.png. The Edition 09 full walkthrough supersedes the earlier walkthrough coverage described below.

## Retained cabin archive · Edition 08

The portfolio reading surface is now a bound woodland archive: a forest-green chapter spine, warm paper, brass rules, a botanical sprig and generous serif headings. The index, diary, project folio, tool ledger and calling card each have their own content composition. The map and controls guide share the same forest-and-paper palette. Project previews use root-relative asset paths, declared dimensions and an explicit unavailable-image state. Native dialogs preserve Escape, focus containment and return to the original world trigger across chapter changes.

## Archive delivery gate

- Hard gate PASS: the focused Chromium run opened every chapter, exercised index/next/browser-back navigation and build notes, decoded both real project images, checked the real email/GitHub/LinkedIn destinations, and verified a deliberately failed image displays its fallback. Keyboard containment, Escape and original-trigger focus return pass. No page or content overflow at 320, 390, 768 and 1280px. Paper/ink contrast is 9.35:1; small secondary labels use AA contrast, including the dark spine. No new personal claims, statistics or testimonials were added.
- Purpose gate PASS: binding shadows establish the archive as a physical cabin object; the fine paper grain gives the pages a quiet material surface; mounted previews distinguish references from prose. Serif diary text, a ruled evidence ledger and the calling card express the objects that open them. The botanical sprig connects the archive to the surrounding woods. Reasons are recorded in DESIGN.md.
- Liveliness PASS: archive ENERGY 2 / RHYTHM 3 / MOTION 1. The brass accent, numbered chapters and repeated initials establish identity. Page compositions vary with their content. Chapter changes are immediate and the forest pauses during reading. The surrounding world retains its existing motion controls and dials.
- Craftsmanship PASS within recorded coverage: desktop and phone screenshots were visually reviewed; the chapter strip adapts to a compact phone header, evidence and profile links stack, and close controls remain visible while pages scroll. The production build and all eleven existing Node tests pass. The focused browser run records no runtime errors.

The archive checks live in scripts/panels-qa.mjs (`npm run test:panels`), with screenshots under artifacts/archive-*.png. This edition changes the reading interface; the complete 3D walkthrough recorded below belongs to Edition 07 and was not repeated for this panel-only update.

## Retained woodland refinement · Edition 07

The character is now a textured, realistically proportioned adult male visitor (Mixamo Remy), with visible skin, face, hair, casual clothes and shoes. Native idle and retargeted walk/run replace the neutral mannequin's locomotion. The cloth backpack, straps, pocket, buckles and zip follow the upper-spine bone. This generic avatar is not an assumed likeness of the builder.

The cabin uses scanned weathered wood and slate with colour, OpenGL normal, roughness and ambient-occlusion maps. Metre-scaled UVs preserve grain scale across boards and beams. Timber ceiling boards, wood-clad gables, roof fascia, stone footings and a stone chimney improve the building's construction detail. The woodland has scanned leaf litter, a worn dirt path with soft edges, mossy stone, fine curved grass and more neutral daylight. Distant forest instances use renderer captures of the actual tree models instead of geometric canopy placeholders.

## Anti Slop delivery gate

- Hard gate: PASS within recorded browser coverage. Existing content remains real and readable HTML; all four cabin objects and direct links work. Camera switching, ASCII mode, optional sound, motion pause, reduced motion, focus containment and phone controls remain available. No invented personal credentials or project outcomes.
- Purpose gate: PASS. Human anatomy, clothing textures and skeletal movement establish a recognizable visitor. Scanned surfaces distinguish material age and roughness. Softer daylight reveals relief; warm lamps retain the cabin's focal hierarchy. Tree impostors preserve the detailed silhouettes at lower rendering cost.
- Liveliness: PASS. ENERGY 3 / RHYTHM 2 / MOTION 2. Controlled walking/running, breathing idle, a torso-following backpack, foliage, smoke, birds and water support the woodland narrative. Ambient motion remains optional.
- Craftsmanship: PASS within coverage. Asset paths and animation bone bindings are validated. Locomotion clips have been visually checked for upright anatomy, natural arms and foot orientation. Shared world geometry, navigation and portfolio content are retained. All new runtime assets are locally bundled.

## Validation

Eleven Node tests pass, covering existing routes/collision/state plus PBR asset completeness and human animation-to-rig bone bindings. The full Chromium walkthrough passes: manual walking, both cameras/renderers, automatic routing and interruption, the door and all four interior objects, content focus, real contact links, preferences, phone layout, touch cancellation and no-JavaScript content. No runtime or shader errors were recorded in that run. The production build passes. Additional checks verify the character's front view and running clip under real keyboard input, first-person ASCII, production no-JavaScript/WebGL fallback, direct contact links, reduced motion and audio settings. Screenshots are retained under artifacts/.

Mixamo human asset provenance and licensing are in public/models/HUMAN_ASSET.md. CC0 Poly Haven material provenance and web optimization are in public/materials/ASSETS.md. The superseded mannequin is preserved in Git and the ignored local backup rather than downloaded by the new application.

## Limits

This is a browser-rendered woodland with a more realistic material and character treatment, not a claim of photorealism. Performance on physical desktop/phone hardware and Safari remains unverified; automated rendering here uses software WebGL. The controller still follows authored floor levels with swept footprint clearance rather than general rigid-body physics. No employment history, résumé or personal portrait has been fabricated.
