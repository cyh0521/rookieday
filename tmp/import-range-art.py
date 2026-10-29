from PIL import Image
from pathlib import Path
import json,shutil
p=Path('DEMO/手繪風分檔版'); dest=p/'images/range';dest.mkdir(exist_ok=True)
src=Path('C:/Users/YOUTH259/.codex/generated_images/01a17ff8-7c03-71e1-b6a7-987f1df17dab/exec-fd3f28a6-24a0-40d6-8b79-d4f6a1628e19.png')
shutil.copyfile(src,dest/'source-sheet.png');im=Image.open(src)
items=[('canopy',(35,40,490,490),245),('safety',(540,30,1080,490),290),('chair',(1170,130,1480,490),48),('ambulance',(10,495,590,995),180),('target',(650,500,980,995),80),('table',(990,520,1536,995),155)]
records=[]
for name,box,width in items:
    out=im.crop(box); alpha=out.getchannel('A'); alpha=alpha.point(lambda a:0 if a<15 else a);out.putalpha(alpha);out=out.crop(alpha.getbbox());out.save(dest/(name+'.png'))
    records.append(dict(name='range-'+name,src='images/range/'+name+'.png',width=width,height=width*out.height/out.width,left=0,top=0,depth=0))
(p/'range-assets.js').write_text('window.HANDDRAWN_ASSETS.records.push(...'+json.dumps(records)+');',encoding='utf-8')
(dest/'製作說明.txt').write_text('內建 image_gen 生成六件獨立透明素材，以原小場景 table.png 與 tree-left.png 作為風格參考。\n提示：手繪等角、橄欖綠與暖米色、圓潤線條、布料接縫、木紋、磨損與柔和陰影。空棚架、簡報棚、折椅、救護車、靶架、器材桌；無人物、無文字、透明背景。\n來源保留 source-sheet.png；各素材獨立裁切存檔，以 range-assets.js 對照尺寸。\n',encoding='utf-8')
