# Bundled woodland models

The nature models are by Quaternius, from Ultimate Stylized Nature. Official pack and CC0 licence: https://quaternius.com/packs/ultimatestylizednature.html . Official download folder: https://drive.google.com/drive/folders/1IV3bXHzkNvuNWFHPi4KPx-G4ghuxIuT- .

Bundled: BirchTree_1.gltf, BirchTree_2.gltf, Bush_Small.gltf and their local .bin/image dependencies, downloaded from the official glTF subfolder. The optional22MB bark normal map was omitted; its bindings were removed and remaining image indices adjusted. Geometry and base colour/foliage textures are unchanged. Trees are approximately5.45m tall, Y-up. Leaves use alpha-test cutouts and remain double-sided.

The renderer captures each actual tree model into a transparent texture for distant forest instances. Those textures are created locally at startup; nearby trees retain their full3D geometry. No new third-party asset is introduced by this optimization.

The previous Quaternius explorer mannequin has been replaced and is no longer bundled. The current human visitor is Mixamo Remy under the Mixamo licence. See HUMAN_ASSET.md for source, terms, optimization and retargeted locomotion. CC0.txt applies to the Quaternius nature assets, not to that character.

Cabin and prop geometry, cloth backpack, plaques and environmental particles are authored in source. Scanned PBR material provenance is documented in ../materials/ASSETS.md.
