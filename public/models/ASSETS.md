# Bundled 3D assets

## Nature

Author: Quaternius. Pack: Ultimate Stylized Nature. Official pack and CC0 licence notice: https://quaternius.com/packs/ultimatestylizednature.html

Official download folder linked by the pack: https://drive.google.com/drive/folders/1IV3bXHzkNvuNWFHPi4KPx-G4ghuxIuT-

Bundled: BirchTree_1.gltf, BirchTree_2.gltf, Bush_Small.gltf and their .bin/image dependencies, downloaded from the official glTF subfolder. The optional 22MB bark normal map was omitted; its normalTexture bindings were removed and remaining image indices adjusted. Geometry and base colour/foliage textures are unchanged.

Trees are approximately 5.45 metres tall at scale 1. Bush is grounded at Y=0. These are Y-up assets. Leaves use alpha material and should remain double-sided as exported.

## Explorer mannequin and animations

Author: Quaternius. Pack: Universal Animation Library (Standard).
Official pack: https://quaternius.com/packs/universalanimationlibrary.html
CC0 glTF distribution: https://github.com/J-Ponzo/gltf-universal-animation-library

Source files: glTF/AnimationLibrary_Godot_Standard.gltf and .bin. CC0 licence copied to CC0.txt from the distribution's LICENSE.

Bundled explorer.glb repacks the source geometry, skin, buffer and selected animation clips as a single binary glTF. Retained clips: Idle_Loop, Walk_Loop, Jog_Fwd_Loop, Sprint_Loop, Interact. No third-party runtime URLs are required.

Mannequin dimensions in bind pose: X -0.972..0.972 (arms extended), Y 0.00046..1.829, Z -0.164..0.205. Y-up, expected forward +Z. One SkinnedMesh node named Mannequin, with material names M_Main (orange) and M_Joints (purple), intended for application recolouring. Bone names use DEF-* (head: DEF-head). This is a neutral humanoid mannequin; clothing and backpack can be attached by the application.

All included visual assets are CC0. Attribution is retained here for provenance.
