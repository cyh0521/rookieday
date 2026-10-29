from pathlib import Path
p=Path('DEMO/手繪風分檔版')
s=(p/'range-game.js').read_text(encoding='utf-8-sig')
s=s.replace('const camera={x:0,y:0};', '''const camera={x:0,y:0,zoom:1,mode:'follow',followZoom:1,overviewZoom:null};
function overviewBounds(){const points=[[0,0],[world.width,0],[0,world.height],[world.width,world.height]].map(v=>P(...v));return {left:Math.min(...points.map(v=>v[0]))-80,right:Math.max(...points.map(v=>v[0]))+80,top:Math.min(...points.map(v=>v[1]))-180,bottom:Math.max(...points.map(v=>v[1]))+80}}
function updateCamera(){if(camera.mode==='overview'){const b=overviewBounds();camera.zoom=camera.overviewZoom??Math.min(SW/(b.right-b.left),SH/(b.bottom-b.top));camera.x=(b.left+b.right)/2-SW/(2*camera.zoom);camera.y=(b.top+b.bottom)/2-SH/(2*camera.zoom)}else{camera.zoom=camera.followZoom;const q=P(player.x,player.y);camera.x=q[0]-SW/(2*camera.zoom);camera.y=q[1]-SH*.62/camera.zoom}const meter=document.getElementById('zoomValue');if(meter)meter.textContent=Math.round(camera.zoom*100)+'%'}
function setCameraMode(mode){camera.mode=mode;updateCamera();for(const id of ['overview','follow'])document.getElementById('view-'+id)?.setAttribute('aria-pressed',String(id===mode));if(ready)draw()}
function zoomCamera(factor){updateCamera();const z=Math.max(.2,Math.min(2.5,camera.zoom*factor));if(camera.mode==='overview')camera.overviewZoom=z;else camera.followZoom=z;updateCamera();if(ready)draw()}
''')
s=s.replace('const focus=P(player.x,player.y);camera.x=focus[0]-SW/2;camera.y=focus[1]-SH*.62;c.save();c.translate(-camera.x,-camera.y);','updateCamera();c.save();c.scale(camera.zoom,camera.zoom);c.translate(-camera.x,-camera.y);')
s=s.replace('(e.clientX-r.left)*SW/r.width+camera.x','(e.clientX-r.left)*SW/r.width/camera.zoom+camera.x').replace('(e.clientY-r.top)*SH/r.height+camera.y','(e.clientY-r.top)*SH/r.height/camera.zoom+camera.y')
s+='''
canvas.addEventListener('wheel',e=>{e.preventDefault();const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?SH:1);zoomCamera(Math.exp(-Math.max(-200,Math.min(200,delta))*.0015))},{passive:false});
document.getElementById('view-overview')?.addEventListener('click',()=>setCameraMode('overview'));
document.getElementById('view-follow')?.addEventListener('click',()=>setCameraMode('follow'));
document.getElementById('zoom-out')?.addEventListener('click',()=>zoomCamera(1/1.2));
document.getElementById('zoom-in')?.addEventListener('click',()=>zoomCamera(1.2));
document.getElementById('zoom-reset')?.addEventListener('click',()=>{camera.followZoom=1;camera.overviewZoom=null;updateCamera();if(ready)draw()});
'''
(p/'range-game.js').write_text(s,encoding='utf-8')
s=(p/'index.html').read_text(encoding='utf-8').replace('<figure><canvas','''<figure><nav class="scene-controls" aria-label="場景視角"><button type="button" id="view-overview" aria-pressed="false">全景</button><button type="button" id="view-follow" aria-pressed="true">跟隨人物</button><span class="control-divider"></span><button type="button" id="zoom-out" aria-label="縮小">−</button><output id="zoomValue" aria-live="off">100%</output><button type="button" id="zoom-in" aria-label="放大">＋</button><button type="button" id="zoom-reset">重設</button></nav><canvas''')
(p/'index.html').write_text(s,encoding='utf-8')
with (p/'style.css').open('a',encoding='utf-8') as f:f.write('''\n.scene-controls{position:absolute;top:12px;left:12px;z-index:20;display:flex;gap:5px;align-items:center;padding:7px;background:#fffaedee;border:1px solid #7d8d6c;border-radius:12px;box-shadow:0 2px 8px #40533a20;font:14px "Microsoft JhengHei",sans-serif}.scene-controls button{font:inherit;border:0;border-radius:7px;padding:7px 10px;color:#42553f;background:transparent;cursor:pointer}.scene-controls button:hover{background:#e6ebd4}.scene-controls button[aria-pressed=true]{background:#698369;color:white}.scene-controls button:focus-visible{outline:2px solid #416644;outline-offset:1px}.scene-controls output{min-width:42px;text-align:center;font-variant-numeric:tabular-nums}.control-divider{height:20px;border-left:1px solid #bac5a5;margin:0 3px}@media(max-width:500px){.scene-controls{top:6px;left:6px;gap:2px;padding:4px;font-size:12px}.scene-controls button{padding:6px}}\n''')
