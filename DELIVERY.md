# Woodland cabin verification

Edition 06 replaces the overhead village with one three-dimensional forest and cabin. Normal 3D is the default; the same world can be rendered as coloured ASCII. Third-person shoulder view and first-person view share movement, collisions, content and maps.

## Design gate

- Hard gate: PASS within the recorded browser checks. All four real portfolio destinations work through interior objects and direct links. Content is readable HTML, independent of ASCII resolution. Keyboard controls, dialog focus containment, touch cancellation, reduced motion, environmental pause, optional audio and graphics quality controls are implemented. There are no invented personal credentials, outcomes, contacts or résumé downloads.
- Purpose gate: PASS. Tree silhouettes, a clear path, warm porch lights, layered foliage, haze and material families establish an inhabited forest. Character animation communicates controlled travel. First-person view and camera collision support exploration. ASCII is an explicit presentation option rather than a filter applied to portfolio text. Shadows establish depth; the minimap gives orientation.
- Liveliness: PASS. ENERGY 3 / RHYTHM 2 / MOTION 2. Forest movement, drifting particles, chimney smoke, birds, stream highlights, footsteps, idle/walk/jog animations, the animated door and furnished room serve the chosen woodland concept. Ambient motion has a pause control, including in mobile settings.
- Craftsmanship: PASS within coverage below. One room contains a workbench, diary, calling card and tool board. Shared world data drives obstacles, routes, interaction anchors and map markers. Detailed nearby trees and simpler distant silhouettes limit rendering work. All models, textures, code and screenshots are bundled locally.

## Verification

Nine Node tests pass: forest-to-porch routing; closed/open door navigation; every interior destination pair; swept wall and door collision; wall sliding; invalid destinations; preference validation; location transitions; legacy discovery migration. The production build passes and the static archive is about 2.9 MB compressed.

Chromium browser checks pass for manual movement, first/third-person cameras, both renderers, automatic walking and manual interruption, the porch and door, all four interior objects, project expansion, dialog focus, contact links, saved preferences, phone layout and touch cancellation. The main browser run records no runtime or shader errors. Additional production checks pass for no-JavaScript reading, WebGL initialization failure, direct contact links, normal/ASCII/phone layouts, reduced motion, and mobile audio settings.

Reading-panel colour pairs were measured: body text 10.28:1, secondary text 5.32:1, light text on dark controls 7.91:1. Solid panels keep text contrast independent of the scene. Screenshots are retained in artifacts/.

## Practical limits

The controller follows authored ground and floor levels with swept capsule-foot clearance; this portfolio does not include jumping, climbing or general rigid-body physics. The avatar is a recoloured, rigged neutral explorer with a backpack, not an assumed likeness of the-builder. The frame-rate goals on physical desktop and mid-range phone hardware remain unverified; browser automation here uses software WebGL. No measured real-device frame-rate, field performance or Safari claim is made.

No formal job title, employment history, résumé or project contribution breakdown was supplied. Existing public repository descriptions and images are used; contact information was supplied by the owner. Asset provenance is documented in public/models/ASSETS.md.
