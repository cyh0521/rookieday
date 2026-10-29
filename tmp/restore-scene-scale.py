from pathlib import Path
p=Path('DEMO/手繪風分檔版')
s=(p/'range-game.js').read_text(encoding='utf-8-sig').replace('SW=2700,SH=1750,TX=38,TY=19','SW=1100,SH=740,TX=45,TY=22.5')
s=s.replace('let ready=false;','let ready=false;const camera={x:0,y:0};')
s=s.replace('shadow(5,4.3,460,230);','const focus=P(player.x,player.y);camera.x=focus[0]-SW/2;camera.y=focus[1]-SH*.62;c.save();c.translate(-camera.x,-camera.y);')
s=s.replace('drawNPCBubble();}','drawNPCBubble();c.restore();}')
s=s.replace('px=(e.clientX-r.left)*SW/r.width,py=(e.clientY-r.top)*SH/r.height','px=(e.clientX-r.left)*SW/r.width+camera.x,py=(e.clientY-r.top)*SH/r.height+camera.y')
(p/'range-game.js').write_text(s,encoding='utf-8')
s=(p/'range-world.js').read_text(encoding='utf-8-sig')
a=s.index(' const chair=');b=s.index(' const tent=',a)
s=s[:a]+''' const chair=(x,y)=>{add(x+.25,y+.25,()=>{shadow(x+.25,y+.25,18,8);for(const [a,b]of [[0,0],[.5,0],[0,.5],[.5,.5]])line([x+a,y+b,0],[x+a,y+b,15],'#68765c',2);rect(x,y,.5,.5,15,'#9da979');poly([[x,y,15],[x,y+.5,15],[x,y+.5,34],[x,y,34]],'#a7b786');line([x,y,31],[x,y+.5,31],'#c8d0a4',2)},{x,y,w:.5,d:.5})};
 const sprite=(name,x,y,scale=1)=>{if(name==='range-chair'){chair(x,y);return}if(name==='range-table')name='table';
 if(name==='range-target'){add(x,y,()=>{shadow(x,y,30,12);for(const yy of [y-.5,y+.5]){line([x,yy],[x,yy,100],'#8c805a',4);line([x-.2,yy],[x+.3,yy],'#8c805a',3)}poly([[x,y-.6,25],[x,y+.6,25],[x,y+.6,100],[x,y-.6,100]],'#f6efd7');const q=P(x,y,61);ellipse(q[0],q[1],12,23,'#6b8272');ellipse(q[0],q[1],8,16,'#a4b29a');ellipse(q[0],q[1],4,8,'#c5956a')});return}
 if(name==='range-ambulance'){add(x,y,()=>{shadow(x,y,90,35);box(x-.8,y-1,1.6,2.4,72,'#e9e7d5');const q=P(x+.8,y+.2,42);c.fillStyle='#71938d';c.fillRect(q[0]-21,q[1]-21,36,22);c.fillStyle='#c66e59';c.fillRect(q[0]-23,q[1]+5,42,6);const r=P(x,y-.3,73);c.fillStyle='#c66e59';c.fillRect(r[0]-15,r[1]-4,30,8);c.fillRect(r[0]-4,r[1]-15,8,30);for(const yy of [y-.6,y+.9]){const v=P(x+.8,yy,0);ellipse(v[0],v[1],11,15,'#657265');ellipse(v[0],v[1],5,8,'#b0b7a2')}});return}
 const src=assets.records.find(a=>a.name===name);if(!src)return;add(x,y,()=>{const q=P(x,y);c.drawImage(src.image,q[0]-src.width*scale/2,q[1]-src.height*scale,src.width*scale,src.height*scale)})};
'''+s[b:]
a=s.index(' add(x+width,y+depth,()=>{const src=');b=s.index(' for(const [a,b]of',a)
s=s[:a]+''' add(x+width,y+depth,()=>{const q=P(x+width/2,y+depth/2),f=P(player.x,player.y);const fade=Math.abs(f[0]-q[0])<190&&Math.abs(f[1]-q[1])<180;c.save();if(fade)c.globalAlpha=.22;const color=title==='安全規定區'?'#c3a16e':'#8ba285';for(const a of [0,width])for(const b of [0,depth]){line([x+a,y+b],[x+a,y+b,116],'#657760',3);line([x+a+.04,y+b],[x+a+.04,y+b,116],'#c8cfac',1)}poly([[x-.2,y-.2,116],[x+width/2,y-.2,150],[x+width/2,y+depth+.2,150],[x-.2,y+depth+.2,116]],color);poly([[x+width/2,y-.2,150],[x+width+.2,y-.2,116],[x+width+.2,y+depth+.2,116],[x+width/2,y+depth+.2,150]],title==='安全規定區'?'#d9bc86':'#b4c29a');for(let yy=y;yy<y+depth;yy+=.7){line([x,yy,118],[x+width/2,yy,150],'#f5e8bc55',1);line([x+width/2,yy,150],[x+width,yy,118],'#eff2c955',1)}c.restore();label(x+width/2,y+depth/2,145,title)});
'''+s[b:]
(p/'range-world.js').write_text(s,encoding='utf-8')
