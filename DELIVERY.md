# Cabin archive verification · Edition 08

The portfolio reading surface is now a bound woodland archive: a forest-green chapter spine, warm paper, brass rules, a botanical sprig and generous serif headings. The index, diary, project folio, tool ledger and calling card each have their own content composition. The map and controls guide share the same forest-and-paper palette. Project previews use root-relative asset paths, declared dimensions and an explicit unavailable-image state. Native dialogs preserve Escape, focus containment and return to the original world trigger across chapter changes.

## Archive delivery gate

- Hard gate PASS: the focused Chromium run opened every chapter, exercised index/next/browser-back navigation and build notes, decoded both real project images, checked the real email/GitHub/LinkedIn destinations, and verified a deliberately failed image displays its fallback. Keyboard containment, Escape and original-trigger focus return pass. No page or content overflow at 320, 390, 768 and 1280px. Paper/ink contrast is 9.35:1; small secondary labels use AA contrast, including the dark spine. No new personal claims, statistics or testimonials were added.
- Purpose gate PASS: binding shadows establish the archive as a physical cabin object; the fine paper grain gives the pages a quiet material surface; mounted previews distinguish references from prose. Serif diary text, a ruled evidence ledger and the calling card express the objects that open them. The botanical sprig connects the archive to the surrounding woods. Reasons are recorded in DESIGN.md.
- Liveliness PASS: archive ENERGY 2 / RHYTHM 3 / MOTION 1. The brass accent, numbered chapters and repeated initials establish identity. Page compositions vary with their content. Chapter changes are immediate and the forest pauses during reading. The surrounding world retains its existing motion controls and dials.
- Craftsmanship PASS within recorded coverage: desktop and phone screenshots were visually reviewed; the chapter strip adapts to a compact phone header, evidence and profile links stack, and close controls remain visible while pages scroll. The production build and all eleven existing Node tests pass. The focused browser run records no runtime errors.

The archive checks live in scripts/panels-qa.mjs (`npm run test:panels`), with screenshots under artifacts/archive-*.png. This edition changes the reading interface; the complete 3D walkthrough recorded below belongs to Edition 07 and was not repeated for this panel-only update.

## Retained woodland refinement · Edition 07

The character is now a textured, realistically proportioned adult male visitor (Mixamo Remy), with visible skin, face, hair, casual clothes and shoes. Native idle and retargeted walk/run replace the neutral mannequin's locomotion. The cloth backpack, straps, pocket, buckles and zip follow the upper-spine bone. This generic avatar is not an assumed likeness of the-builder.

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
