# Scanned PBR materials

These locally bundled materials are original Poly Haven scans, licensed CC0. Official licence: https://polyhaven.com/license . No attribution is required; provenance is retained here.

| Manifest key | Asset | Author(s) | Physical tile coverage |
| --- | --- | --- | --- |
| wood | https://polyhaven.com/a/weathered_brown_planks | Dimitrios Savva (photography), Rico Cilliers (processing) | 1.8 × 1.8 metres |
| ground | https://polyhaven.com/a/forest_floor | eye-candy.xyz | 2.14 × 2.14 metres |
| roof | https://polyhaven.com/a/roof_slates_02 | Rob Tuytel | 3 × 3 metres |
| rock | https://polyhaven.com/a/mossy_rock | Rob Tuytel | 3 × 3 metres |
| path | https://polyhaven.com/a/brown_mud_02 | Rob Tuytel | 1.3 × 1.3 metres |

Files were obtained from each asset's official `https://api.polyhaven.com/files/<asset-id>` response and downloaded from `dl.polyhaven.org`. All four sets include diffuse/albedo, OpenGL normal (`nor_gl`, not DirectX), scalar roughness and ambient occlusion maps. The source maps were downloaded at 1024 × 1024 pixels before the delivery optimizations below.

For web delivery, diffuse maps remain 1024 × 1024 at JPEG quality 88 and normals remain 1024 × 1024 at JPEG quality 93 with 4:4:4 sampling. Scalar roughness and AO maps were reduced to 512 × 512 using Lanczos and saved as quality-88 grayscale JPEG. Each image was decoded and validated after saving. The texture content and OpenGL normal convention are unchanged. Diffuse maps should use sRGB; normal, roughness and AO maps should remain linear/non-colour data. No displacement map is bundled.

`manifest.json` maps application material names to relative same-origin paths. Material UV scale should follow the physical tile coverage above rather than stretching one full texture over each mesh.

The path set uses the Brown Mud 02 scan, with compact soil, small stones and sticks rather than the forest floor's heavier leaf litter. Its diffuse, OpenGL normal and roughness maps were downloaded at 1K and resized to 512 × 512 with Lanczos; JPEG quality 88 is used for colour/roughness and 93 with 4:4:4 sampling for normal. This additional set is about 479 KB and has no AO file.
