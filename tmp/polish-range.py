from pathlib import Path
p=Path('DEMO/手繪風分檔版/range-world.js');s=p.read_text(encoding='utf-8-sig')
at=s.index(' const chair=')
s=s[:at]+''' // Deterministic painted details: the same palette, fine outlines and warm tile edges as the original courtyard.
 const detail=(x,y,dx,dy,color,width=1)=>line([x,y],[x+dx,y+dy],color,width);
 const tuft=(x,y)=>{for(let k=0;k<4;k++)line([x+k*.045,y],[x+k*.045-.035,y,5+k%3*2],'#7d9d6a',1)};
 const wood=(x,y,w,d,z)=>{for(let i=.15;i<d;i+=.25)line([x+.08,y+i,z],[x+w-.08,y+i,z],'#ab8c574d',.8)};
 const stoneWall=(x,y)=>{poly([[x,y,0],[x,y+1.9,0],[x,y+1.9,64],[x,y,64]],'#9fac92');for(let z=16;z<64;z+=16){line([x,y,z],[x,y+1.9,z],'#6f816b',1);line([x,y,z+2],[x,y+1.9,z+2],'#c5cbb0',1);for(let yy=y+(z%32?.45:0);yy<y+1.9;yy+=.9)line([x,yy,z-15],[x,yy,z],'#6f816b',1)}rect(x-.14,y-.03,.35,1.96,65,'#d2d2b5');line([x-.14,y,67],[x-.14,y+1.9,67],'#f2e7c4',1.5)};
'''+s[at:]
a=s.index(' const chair=');b=s.index(' const sprite=',a)
s=s[:a]+''' const chair=(x,y)=>{add(x+.25,y+.25,()=>{shadow(x+.25,y+.25,20,9);for(const [a,b]of [[0,0],[.55,0],[0,.55],[.55,.55]]){line([x+a,y+b,0],[x+a,y+b,17],'#657860',2.4);line([x+a+.02,y+b,1],[x+a+.02,y+b,16],'#c9d1b0',.7)}line([x,y,2],[x+.55,y+.55,17],'#6b7b64',1.4);line([x+.55,y+.55,2],[x,y,17],'#6b7b64',1.4);rect(x,y,.55,.55,17,'#a8b78b');line([x+.55,y,18],[x+.55,y+.55,18],'#d4d9b7',1.3);poly([[x,y,17],[x,y+.55,17],[x,y+.55,38],[x,y,38]],'#a3b487');line([x,y,35],[x,y+.55,35],'#d7dfb9',1.4);line([x,y,21],[x,y+.55,21],'#7e956d',.8);for(const yy of [y+.06,y+.49]){const q=P(x,yy,29);ellipse(q[0],q[1],1.3,1.3,'#e0dbb6')}},{x,y,w:.55,d:.55})};
'''+s[b:]
s=s.replace("ellipse(q[0],q[1],4,8,'#c5956a')", "ellipse(q[0],q[1],4,8,'#c5956a');for(const yy of [y-.52,y+.52]){const v=P(x,yy,93);ellipse(v[0],v[1],1.6,1.6,'#b39d6b')}for(let i=0;i<4;i++)line([x,y-.44+i*.2,29],[x,y-.39+i*.2,32],'#ccbd9170',.8)")
s=s.replace("sprite('range-table',x+.7,y+depth/2,.85);", "sprite('range-table',x+.7,y+depth/2,.85);if(title==='安全規定區'){sprite('bench',x+2.3,y+2,.95);w.blocks.push({x:x+2,y:y+1.3,w:.5,d:1.6})}if(title==='指揮臺'||title==='彈藥管制區')add(x+1,y+1,()=>{box(x+.7,y+.6,.55,.55,27,'#8c9f79');rect(x+.68,y+.58,.59,.59,29,'#acb893');line([x+.7,y+.86,30],[x+1.25,y+.86,30],'#6f8467',1.5)});")
s=s.replace("c.restore();label(x+width/2,y+depth/2,180,title)", "for(const xx of [x-.2,x+width+.2]){line([xx,y-.2,116],[xx,y+depth+.2,116],'#5e755d',2);line([xx,y-.2,109],[xx,y+depth+.2,109],'#8a9b76',2)}for(const a of [0,width])for(const b of [0,depth]){const q=P(x+a,y+b);ellipse(q[0],q[1],5,2.5,'#7f8a70');line([x+a,y+b,12],[x+a,y+b,112],'#e7e1bd',.8)}line([x+width/2,y-.2,151],[x+width/2,y+depth+.2,151],'#f1e8c2',1.6);c.restore();label(x+width/2,y+depth/2,180,title)")
s=s.replace("rect(0,0,40,29,0,'#c1d2a4');", "poly([[0,29,0],[40,29,0],[40,29,-16],[0,29,-16]],'#698e6c');poly([[40,0,0],[40,29,0],[40,29,-16],[40,0,-16]],'#567e60');rect(0,0,40,29,0,'#a9c18a');")
a=s.index(" rect(28,1,11,27");b=s.index(' for(const [x,color]',a)
s=s[:a]+''' rect(28,1,11,27,0,'#91ad7e');for(let x=28.2;x<38.7;x+=1.5)for(let y=1.2;y<27.7;y+=1.5){const tone=(Math.round(x*10+y*10)%4);rect(x,y,1.39,1.39,0,['#e6d7a8','#efe1b7','#dfd4a8','#d2cda7'][tone]);line([x,y,.7],[x+1.39,y,.7],'#fff4cf',2);line([x,y,.7],[x,y+1.39,.7],'#fff4cf',2);line([x+1.39,y],[x+1.39,y+1.39],'#b7a26b',1.2);for(let k=0;k<3;k++)detail(x+.2+k*.29,y+.3+(k%2)*.7,.16,.015,'#b9a36c40',.8)}
 for(let i=0;i<220;i++){const x=.2+((i*97)%390)/10,y=i%2?.55:28.45;tuft(x,y)}for(let y=1;y<28;y+=.65)tuft(39.45,y);
 // Narrow grass borders and limestone curb tie the large map to the courtyard.
 for(let y=1;y<28;y+=1.5){rect(27.65,y,.3,1.45,2,'#d5d5b2');line([27.65,y,3],[27.95,y,3],'#f5ebcb',1)}
'''+s[b:]
s=s.replace("rect(16,y-.7,1.7,1.4,0,'#6eaaa8');line([16,y-.7],[17.7,y-.7],'#b2d4c8',2)", "rect(15.96,y-.74,1.78,1.48,0,'#536f6545');rect(16,y-.7,1.7,1.4,1,'#7eaaa0');rect(16.06,y-.64,1.58,1.28,1,'#91b5a6');for(let t=0;t<10;t++){const xx=16.1+t*.15;line([xx,y-.6,2],[xx,y+.6,2],'#bdd1b32d',.7)}line([16.07,y-.63,2],[17.63,y-.63,2],'#d5e0c1',1);line([16.07,y+.63,2],[17.63,y+.63,2],'#5e8a7c',1);for(const xx of [16.1,17.6])for(const yy of [y-.59,y+.59]){const q=P(xx,yy,2);ellipse(q[0],q[1],1.3,1,'#d3d5b0')}")
s=s.replace("()=>box(.2,y,0.5,1.9,65,'#b0aa8e')","()=>stoneWall(.5,y)")
s=s.replace("for(let y=2;y<28;y+=4){sprite('planter-left'", "for(let y=2;y<28;y+=4){sprite('bush-right',39.3,y+1,.8);sprite('planter-left'")
# Reuse the original courtyard's railings and plant assets, beyond the firing line.
s=s.replace(' return w;', " for(const y of [2,10,18,26]){sprite('fence-left',39.2,y,.9);w.blocks.push({x:38.9,y:y-.7,w:.3,d:1.4})}sprite('tree-right',39,27,1);sprite('tree-left',39,1,1);\n return w;")
p.write_text(s,encoding='utf-8')
