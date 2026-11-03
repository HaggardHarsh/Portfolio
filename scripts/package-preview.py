"""Package the built woodland as a static ZIP (serve over HTTP, not file://)."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
p=Path(__file__).resolve().parent.parent
assert (p/'dist/index.html').exists(), 'Run npm run build first'
assert (p/'dist/models/explorer.glb').exists(), 'Built character is missing'
(p/'artifacts').mkdir(exist_ok=True)
with ZipFile(p/'artifacts/woodland-static.zip','w',ZIP_DEFLATED) as archive:
 for file in (p/'dist').rglob('*'):
  if file.is_file():archive.write(file,file.relative_to(p/'dist'))
print('Packaged artifacts/woodland-static.zip. Serve its contents over HTTP.')
