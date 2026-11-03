"""Author village geometry once for navigation and scene rendering."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
import json, math, random
p=Path(__file__).resolve().parent.parent
W,H=1600,920
land=[(100,360),(200,220),(430,130),(730,120),(1050,140),(1360,230),(1510,420),(1500,680),(1320,820),(1040,880),(700,890),(380,840),(160,720),(90,540)]
river=[(850,135),(810,280),(830,420),(800,540),(830,660),(780,865)]
bridge=[(735,535),(895,535),(895,610),(735,610)]
places={'campfire':{'x':420,'y':730,'label':'About'},'workshop':{'x':430,'y':438,'label':'Projects'},'observatory':{'x':1120,'y':430,'label':'Skills'},'signal':{'x':1200,'y':755,'label':'Contact'}}
objects=[];obstacles=[]
def add(id,kind,x,y,w,h,**extras):
 obj={'id':id,'kind':kind,'x':x,'y':y,'w':w,'h':h,**extras};objects.append(obj)
 points=[(x-w/2,y-h),(x+w/2,y-h),(x+w/2,y),(x-w/2,y)]
 obstacles.append({'id':id,'points':points})
add('workshop','house',430,408,210,95,roof='#b45d48',destination='workshop')
add('campfire','house',420,700,180,85,roof='#ca9a46',destination='campfire')
add('observatory','studio',1120,400,190,90,roof='#537eaa',destination='observatory')
add('signal','post',1200,725,170,85,roof='#69835b',destination='signal')
for x,y in [(170,365),(225,270),(310,235),(535,210),(635,200),(965,220),(1255,245),(1350,310),(1430,420),(1450,560),(1380,675),(1050,795),(620,785),(260,690),(185,555),(290,465),(560,550),(1020,565)]:add(f'tree-{x}-{y}','tree',x,y,34,24)
for x,y in [(250,570),(610,340),(980,700),(1340,520)]:add(f'rock-{x}-{y}','rock',x,y,35,22)
roads=[[(800,770),(740,670),(600,620),(420,730)],[(740,670),(660,530),(540,470),(430,438)],[(740,580),(900,570),(1010,480),(1120,430)],[(900,570),(1010,670),(1200,755)]]
walk=Image.new('L',(W,H));d=ImageDraw.Draw(walk);d.polygon(land,fill=255);d.line(river,fill=0,width=85,joint='curve');d.polygon(bridge,fill=255)
for o in obstacles:d.polygon(o['points'],fill=0)
walk=ImageOps.invert(ImageOps.invert(walk).filter(ImageFilter.MaxFilter(15)))
mask=walk.resize((W//4,H//4),Image.Resampling.BOX);rows=[]
for y in range(H//4):
 row=''
 for x in range(0,W//4,4):
  bits=0
  for j in range(4):bits=(bits<<1)|int(mask.getpixel((x+j,y))==255)
  row+=format(bits,'x')
 rows.append(row)
world={'width':W,'height':H,'cell':4,'columns':W//4,'rows':H//4,'mask':rows,'obstacles':obstacles,'objects':objects}
(p/'dist/world-map.js').write_text('export const WORLD_MAP='+json.dumps(world,separators=(',',':'))+';\n')
scene={'land':land,'river':river,'bridge':bridge,'roads':roads,'objects':objects,'places':places}
(p/'dist/world-scene.js').write_text('export const SCENE='+json.dumps(scene,separators=(',',':'))+';\n')
print('Generated shared village scene and collision map:',len(objects),'objects')
