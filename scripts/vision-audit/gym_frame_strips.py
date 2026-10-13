import json, os
from PIL import Image, ImageDraw, ImageFont
M=os.path.join(os.path.dirname(__file__),"../../apps/web/public/exercise-media")
d=json.load(open('/tmp/gt-audit-work/gym-matrix.json'))['rows']
order=[]; info={}
for r in d:
    if r['id'] not in info:
        order.append(r['id']); info[r['id']]={'name':r['name'],'rows':[]}
    info[r['id']]['rows'].append(r['n'])
T=200; PER=7
f=ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf",17)
idx={}
for si in range(0,len(order),PER):
    chunk=order[si:si+PER]; sh=Image.new('RGB',(T*4,T*len(chunk)),'white'); dr=ImageDraw.Draw(sh)
    for ri,i in enumerate(chunk):
        im=Image.open(f'{M}/{i}.webp'); n=getattr(im,'n_frames',1)
        for c,fr in enumerate([0,n//4,n//2,3*n//4]):
            im.seek(fr); sh.paste(im.convert('RGB').resize((T,T)),(c*T,ri*T))
        lab=f"{si+ri+1}. {i} {info[i]['name']}"[:70]
        dr.rectangle([0,ri*T,dr.textlength(lab,font=f)+8,ri*T+22],fill='black'); dr.text((4,ri*T+2),lab,font=f,fill='white')
        idx[i]=si+ri+1
    sh.save(f'/tmp/gt-audit-work/s{si//PER+1:02d}.jpg',quality=85)
json.dump({'order':order,'info':info},open('/tmp/gt-audit-work/strip-index.json','w'),indent=1)
print(len(order),'ids ->',(len(order)+PER-1)//PER,'strips')
