from pathlib import Path
p=Path('DEMO/手繪風分檔版/range-game.js');s=p.read_text(encoding='utf-8-sig')
a=s.index('function updateCamera()');b=s.index('\nfunction ellipse',a)
s=s[:a]+'''function cameraTarget(){if(camera.mode==='overview'){const b=overviewBounds(),zoom=camera.overviewZoom??Math.min(SW/(b.right-b.left),SH/(b.bottom-b.top));return {zoom,cx:(b.left+b.right)/2,cy:(b.top+b.bottom)/2}}if(camera.mode==='follow'){const q=P(player.x,player.y),zoom=camera.followZoom;return {zoom,cx:q[0],cy:q[1]+(0.5-.62)*SH/zoom}}return {zoom:camera.zoom,cx:camera.x+SW/(2*camera.zoom),cy:camera.y+SH/(2*camera.zoom)}}
function updateCamera(dt=0){const target=cameraTarget();let view=target;if(camera.transition){const t=camera.transition;t.elapsed=Math.min(t.duration,t.elapsed+dt);const u=t.elapsed/t.duration,e=u*u*u*(u*(u*6-15)+10);view={zoom:Math.exp(Math.log(t.zoom)+(Math.log(target.zoom)-Math.log(t.zoom))*e),cx:t.cx+(target.cx-t.cx)*e,cy:t.cy+(target.cy-t.cy)*e};if(u>=1)camera.transition=null}camera.zoom=view.zoom;camera.x=view.cx-SW/(2*view.zoom);camera.y=view.cy-SH/(2*view.zoom);const meter=document.getElementById('zoomValue');if(meter)meter.textContent=Math.round(camera.zoom*100)+'%'}
function setCameraMode(mode){updateCamera();if(mode!==camera.mode){camera.transition={cx:camera.x+SW/(2*camera.zoom),cy:camera.y+SH/(2*camera.zoom),zoom:camera.zoom,elapsed:0,duration:.7};camera.mode=mode;}for(const id of ['overview','follow'])document.getElementById('view-'+id)?.setAttribute('aria-pressed',String(id===mode));if(ready)draw()}
function releaseCamera(){updateCamera();camera.transition=null;camera.mode='free';for(const id of ['overview','follow'])document.getElementById('view-'+id)?.setAttribute('aria-pressed','false')}
function zoomCamera(factor){updateCamera();if(camera.transition)releaseCamera();const z=Math.max(.2,Math.min(2.5,camera.zoom*factor));if(camera.mode==='overview')camera.overviewZoom=z;else if(camera.mode==='follow')camera.followZoom=z;else{camera.x+=SW/(2*camera.zoom)-SW/(2*z);camera.y+=SH/(2*camera.zoom)-SH/(2*z);camera.zoom=z;}updateCamera();if(ready)draw()}
''' +s[b:]
s=s.replace('update(dt);draw();requestAnimationFrame(frame)','update(dt);updateCamera(dt);draw();requestAnimationFrame(frame)')
s=s.replace("mapDrag.moved=true;camera.mode='free';", "mapDrag.moved=true;camera.transition=null;camera.mode='free';")
# Freeze transition at the displayed position before a drag is started.
s=s.replace("e.preventDefault();canvas.focus({preventScroll:true});updateCamera();mapDrag=", "e.preventDefault();canvas.focus({preventScroll:true});updateCamera();if(camera.transition)releaseCamera();mapDrag=")
p.write_text(s,encoding='utf-8')
