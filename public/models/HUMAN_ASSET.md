# Human visitor: Remy

Selected model: Adobe Mixamo Remy, a realistically proportioned adult male visitor with short hair, visible face, a black casual T-shirt, grey hiking shorts and trainers. This is a generic visitor avatar, not a claimed likeness of the builder.

## Source and licence

- Distribution manifest: https://three.ws/api/avatars/library
- Distribution documentation: https://github.com/nirholas/three.ws/blob/main/public/avatars/mixamo/README.md
- Original GLB: https://pub-2534e921bf9c4314addcd4d8a6e98b7b.r2.dev/avatars/mixamo/glb/remy.glb
- The distribution manifest records `source: "mixamo"`, `license: "Mixamo"`.
- Adobe's official Mixamo FAQ permits royalty-free personal, commercial and nonprofit use of characters and animations, including games: https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html

This asset is bundled within the interactive portfolio application, not offered as a standalone character library. Mixamo assets are not CC0; the Three.js engine's MIT licence should not be described as the character's licence.

Original SHA-256: `bd55d6f028cf5c3a79d0441a89b5dba7a33581e3568ac8fe319fe7e3f1aad06c`.
Bundled optimized GLB SHA-256: `201984518aa160696aec62a9a30b427b9f54bc1f272c944824aa8998e3d8a9d1`.

## Web optimization

`human/remy/remy.glb` retains the original geometry, rig, effective materials and native standing-idle animation. Body textures are limited to 1024px, clothing/shoe/hair textures to 512px. Edition 09 removes embedded texture images that no material referenced, then deduplicates the referenced body image. The six referenced diffuse textures retain their exact image bytes. The original 20,566,060-byte GLB was previously reduced to 4,408,884 bytes; it is now 2,006,444 bytes without a decoder extension. `scripts/optimize-character.mjs` performs the reference pruning and buffer repack.

## Integration

- Forward +Z; Y up.
- Default world-space bounds: min `[-1.933528, 0.000073, -0.319377]`, max `[1.960455, 3.784920, 0.403590]`. Default bind height is **3.784847** units. Uniformly scale the scene by `1.8 / 3.784847` for a 1.8m avatar, and ground it using the bound minimum.
- Seven skinned meshes: `Shoes`, `Tops`, `Bottoms`, `Hair`, `Body`, `Eyes`, `Eyelashes`; approximately 21.5k vertices total.
- Sanitized bone names include `mixamorigHips`, `mixamorigSpine`, `mixamorigSpine1`, `mixamorigSpine2`, `mixamorigHead`.
- Native idle clip name: **`mixamo.com`**, duration **8.333333s**. Use this as Idle directly; do not duplicate it in another download.
- Additional clip files: **`human/remy/walk.json`** (`Walk`) and **`human/remy/run.json`** (`Run`). Parse via `THREE.AnimationClip.parse()` and play through an `AnimationMixer(gltf.scene)`.
- Use metallic=0 and high roughness for natural skin and cloth. Height-band recolouring from the old mannequin is unnecessary. The delivered material definitions reference diffuse maps only; the unused embedded normal and roughness images did not affect rendering.

The controller uses the shared floor heights for ground, the first step, the porch and the threshold. A small set of extrema from 2cm shoe cells follows the animated skin rather than treating foot joints as soles. This keeps heel and toe geometry above the walking surface during idle, walk, run and crossfades. A soft local contact shadow follows the visitor while static world shadows are cached.

## Locomotion source and retarget

Source Walk and Run clips: official Three.js `Soldier.glb` (Adobe Mixamo Vanguard), https://github.com/mrdoob/three.js/blob/dev/examples/models/gltf/Soldier.glb . The official animation example identifies its model as Mixamo: https://threejs.org/examples/webgl_animation_skinning_blending.html . Source SHA-256: `dfb230fc1f942f259dd00281a1186953ad602fc5d69067ce63e24b2aa439736b`.

The retarget captures source TPose world rotations and Remy's skin bind rotations. A 180° Y-axis alignment conjugates source rotation deltas because Vanguard faces -Z while Remy faces +Z. Desired rotations are converted to local rotations parent-before-child. Target bone translations are retained, so the application's controller owns movement and the target's proportions remain intact. The Vanguard donor is not bundled as a runtime character.

Native Idle, retargeted Walk and retargeted Run have been visually verified in the installed Three.js renderer. All show upright anatomy, coherent arm/leg posture, flat shoes and forward +Z orientation.
