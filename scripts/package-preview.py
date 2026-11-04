"""Package the built woodland as a static ZIP (serve over HTTP, not file://)."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
p=Path(__file__).resolve().parent.parent
assert (p/'dist/index.html').exists(), 'Run npm run build:static first'
manifest=json.loads((p/'dist/models/manifest.json').read_text())
assert (p/'dist'/manifest['character'].removeprefix('./')).exists(), 'Built character is missing'
(p/'artifacts').mkdir(exist_ok=True)
with ZipFile(p/'artifacts/woodland-static.zip','w',ZIP_DEFLATED) as archive:
 for file in (p/'dist').rglob('*'):
  if file.is_file():archive.write(file,file.relative_to(p/'dist'))
print('Packaged artifacts/woodland-static.zip. Serve its contents over HTTP.')
