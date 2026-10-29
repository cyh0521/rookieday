from pathlib import Path
p=Path('DEMO/手繪風分檔版')
s=(p/'game.js').read_text(encoding='utf-8-sig')
s=s.replace('SW=1100,SH=740,TX=45,TY=22.5,OX=514,OY=196','SW=2300,SH=1600,TX=38,TY=19,OX=1100,OY=130')
s=s.replace('x:5.1,y:6.8','x:27.5,y:20.8')
a=s.index('const blocks=');b=s.index('function segmentClear',a)
s=s[:a]+'''const world=window.RANGE_WORLD.build(),blocks=world.blocks;
const npcCentre=assets.records.find(a=>a.name==='instructor'),NPC_BODY_RADIUS=.55;
npcCentre.worldX=26.4;npcCentre.worldY=21.3;npcCentre.depth=47.7;
const np=P(npcCentre.worldX,npcCentre.worldY);npcCentre.left=np[0]-npcCentre.anchorX;npcCentre.top=np[1]-npcCentre.anchorY;
function canWalk(x,y){const r=.21;return x>=1&&x<=29&&y>=1&&y<=27.8&&!blocks.some(b=>x>b.x-r&&x<b.x+b.w+r&&y>b.y-r&&y<b.y+b.d+r)&&Math.hypot(x-npcCentre.worldX,y-npcCentre.worldY)>=NPC_BODY_RADIUS-1e-7}
'''+s[b:]
s=s.replace('const step=.2,key=', 'const step=.4,key=').replace('n<4000','n<16000')
s=s.replace("const ground=assets.records[0];c.drawImage(ground.image,ground.left,ground.top,ground.width,ground.height);","world.ground();")
s=s.replace('...assets.records.slice(1)','...world.objects,npcCentre')
s=s.replace("if(!obj.player){if(obj.name==='instructor')", "if(!obj.player){if(obj.render){obj.render();continue;}if(obj.name==='instructor')")
s=s.replace('Math.min(2.2*dt','Math.min(3.6*dt')
s=s.replace('探索這一小片庭院。','探索完整靶場。').replace('請點選庭院中可行走的地面。','請點選靶場中可行走的地面。')
(p/'range-game.js').write_text(s,encoding='utf-8')
html=(p/'小場景.html').read_text(encoding='utf-8-sig').replace('綠蔭裡的見習時光｜手繪風分檔版','靶場見習日｜完整手繪遊戲場景').replace('可移動的手繪等角庭院','可移動的完整靶場等角場景').replace('src="game.js"','src="range-world.js"></script>\n<script src="range-game.js"')
(p/'index.html').write_text(html,encoding='utf-8')
(p/'完整場景說明.txt').write_text('直接開啟 index.html，必須保留整個資料夾。\n方向鍵或 WASD 行走；點擊地面自動尋路。接觸教官觸發原有對話。\n完整靶場由獨立地面、靶位、椅列、棚架、家具、救護車、植栽物件繪製，非全景背景。\n建物家具有碰撞，物件依世界深度排序。走進棚架時屋頂變淡，便於查看人物。\nrange-world.js 管理場景配置；range-game.js 管理人物、尋路及對話。\n原小場景保留於小場景.html。\n',encoding='utf-8')
