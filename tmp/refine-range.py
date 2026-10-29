from pathlib import Path
p=Path('DEMO/手繪風分檔版')
s=(p/'range-world.js').read_text(encoding='utf-8-sig')
s=s.replace('width:30,height:29','width:40,height:29')
a=s.index(' const chair=');b=s.index(' const sprite=',a)
s=s[:a]+''' const chair=(x,y)=>{sprite('range-chair',x+.25,y+.25,.65);w.blocks.push({x,y,w:.5,d:.5})};
'''+s[b:]
a=s.index(' const tent=');b=s.index(' w.ground=',a)
s=s[:a]+''' const tent=(x,y,width,depth,title,roof,medical=false)=>{w.zones.push({name:title,x,y,width,depth});
 sprite('range-table',x+.7,y+depth/2,.85);w.blocks.push({x:x+.3,y:y+.5,w:1,d:depth-1});
 add(x+width,y+depth,()=>{const src=assets.records.find(a=>a.name===(title==='安全規定區'?'range-safety':'range-canopy'));const q=P(x+width/2,y+depth/2);const widthPx=title==='安全規定區'?290:245,heightPx=widthPx*src.height/src.width;c.save();if(player.x>x-1&&player.x<x+width+1&&player.y>y-1&&player.y<y+depth+1)c.globalAlpha=.25;c.drawImage(src.image,q[0]-widthPx/2,q[1]-heightPx+35,widthPx,heightPx);c.restore();label(x+width/2,y+depth/2,130,title)});
 for(const [a,b]of [[0,0],[width,0],[0,depth],[width,depth]])w.blocks.push({x:x+a-.12,y:y+b-.12,w:.24,d:.24});
 };
'''+s[b:]
s=s.replace('rect(0,0,30,29','rect(0,0,40,29').replace('rect(1,1,28,27','rect(1,1,38,27')
s=s.replace("rect(17,21.8,12,1.3,0,'#c8c5a9');for(let x=17;x<29;x+=1)line([x,21.8],[x,23.1],'#a8ae963f',1);", "rect(28,1,11,27,0,'#dfd7b4');for(let x=28;x<39;x+=1.5)for(let y=1;y<28;y+=1.5){rect(x,y,1.43,1.43,0,(Math.round(x+y)%3)?'#e6dcb9':'#eee3c5')}rect(28,1,1.4,27,0,'#c7c7a2');")
a=s.index(' for(let i=0;i<5;i++){const y=3+i*4;w.lanes.push');b=s.index(' for(let y=1;y<28;',a)
s=s[:a]+''' for(let i=0;i<5;i++){const y=3+i*4;w.lanes.push({target:{x:2.4,y},mat:{x:16.8,y}});sprite('range-target',2.4,y,.9);w.blocks.push({x:2.1,y:y-.6,w:.6,d:1.2});add(2.4,y,()=>label(2.4,y,111,String(i+1)));chair(15.1,y-.25);for(const x of [20,22,24,26])chair(x,y-.25)}
'''+s[b:]
a=s.index(' tent(5,');b=s.index(' return w;',a)
s=s[:a]+''' tent(31,2,3.3,3.5,'指揮臺','#668e81');tent(31,7,3.3,3.5,'預備槍管制區','#688b9a');tent(31,12,3.3,3.5,'彈藥管制區','#6f8e91');tent(31,17,3.3,3.5,'急救站','#ae6253',true);tent(31,22,4,4.7,'安全規定區','#ba9360');
 sprite('board',30.2,24.5,.8);w.blocks.push({x:29.9,y:23.9,w:.5,d:1.1});
 sprite('range-ambulance',36.8,19,.95);w.blocks.push({x:35.8,y:17.8,w:2,d:2.8});
 for(let y=2;y<28;y+=4){sprite('planter-left',38.5,y,.9);w.blocks.push({x:38.1,y:y-.4,w:.8,d:.8})}
'''+s[b:]
(p/'range-world.js').write_text(s,encoding='utf-8')
s=(p/'range-game.js').read_text(encoding='utf-8-sig').replace('SW=2300,SH=1600','SW=2700,SH=1750').replace('x:27.5,y:20.8','x:29.8,y:21.8').replace('npcCentre.worldX=26.4;npcCentre.worldY=21.3;npcCentre.depth=47.7','npcCentre.worldX=30.3;npcCentre.worldY=22.5;npcCentre.depth=52.8').replace('x<=29&&','x<=39&&')
(p/'range-game.js').write_text(s,encoding='utf-8')
s=(p/'index.html').read_text(encoding='utf-8').replace('<script src="range-world.js">','<script src="range-assets.js"></script>\n<script src="range-world.js">')
(p/'index.html').write_text(s,encoding='utf-8')
