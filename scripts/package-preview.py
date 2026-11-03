"""Validate the static HTML, bundle a standalone preview and package the village."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import quote
from zipfile import ZipFile, ZIP_DEFLATED
import re, base64, mimetypes
p=Path(__file__).resolve().parent.parent
html=(p/'dist/index.html').read_text()
class Validator(HTMLParser):
 def __init__(self):super().__init__();self.stack=[];self.ids=set()
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if 'id' in attrs:
   assert attrs['id'] not in self.ids,'duplicate ID '+attrs['id'];self.ids.add(attrs['id'])
  if tag not in ['meta','link','br','input','img','hr']:self.stack.append(tag)
 def handle_endtag(self,tag):assert self.stack and self.stack.pop()==tag,'unbalanced tag '+tag
v=Validator();v.feed(html);assert not v.stack
sources=['world-map.js','world-scene.js','game.js','movement.js','camera.js','content.js','world-renderer.js','app.js']
code='\n'.join(re.sub(r'^export ', '', re.sub(r'^import [^\n]+;\n','',(p/'dist'/f).read_text(),flags=re.M),flags=re.M) for f in sources)
assert '</script' not in code.lower()
for f in (p/'dist/assets').glob('*'):
 data='data:'+mimetypes.guess_type(f.name)[0]+';base64,'+base64.b64encode(f.read_bytes()).decode()
 code=code.replace('./assets/'+f.name,data)
html=html.replace('<link rel="stylesheet" href="./style.css">','<style>'+(p/'dist/style.css').read_text()+'</style>')
html=html.replace('<script type="module" src="./app.js"></script>','')
html=html.replace('./favicon.svg','data:image/svg+xml,'+quote((p/'dist/favicon.svg').read_text()))
html=html.replace('</body>','<script type="module">'+code+'</script></body>')
(p/'artifacts').mkdir(exist_ok=True)
(p/'artifacts/preview.html').write_text(html)
(p/'artifacts/preview-check.mjs').write_text(code)
with ZipFile(p/'artifacts/sidequest-village.zip','w',ZIP_DEFLATED) as archive:
 for f in (p/'dist').rglob('*'):
  if f.is_file():archive.write(f,f.relative_to(p/'dist'))
print('Validated HTML and packaged standalone preview and deployment ZIP.')
