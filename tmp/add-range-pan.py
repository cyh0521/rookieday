from pathlib import Path
p=Path('DEMO/手繪風分檔版/range-game.js');s=p.read_text(encoding='utf-8-sig')
s=s.replace("}else{camera.zoom=camera.followZoom;const q=P(player.x,player.y);", "}else if(camera.mode==='follow'){camera.zoom=camera.followZoom;const q=P(player.x,player.y);")
s=s.replace("if(camera.mode==='overview')camera.overviewZoom=z;else camera.followZoom=z;", "if(camera.mode==='overview')camera.overviewZoom=z;else if(camera.mode==='follow')camera.followZoom=z;else{camera.x+=SW/(2*camera.zoom)-SW/(2*z);camera.y+=SH/(2*camera.zoom)-SH/(2*z);camera.zoom=z;}")
a=s.index("canvas.addEventListener('pointerdown',e=>{if(dialogue.active)return;");b=s.index("document.querySelectorAll('[data-key]')",a)
old=s[a:b];body=old[old.index('if(dialogue.active)'):old.rindex('});')]
s=s[:a]+"function navigatePointer(e){"+body+"}\n"+'''let mapDrag=null;
function beginMapDrag(e){if(dialogue.active)return;if(e.button===2){e.preventDefault();navigatePointer(e);return}if(e.button!==0&&e.button!==1)return;e.preventDefault();canvas.focus({preventScroll:true});updateCamera();mapDrag={id:e.pointerId,x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y,zoom:camera.zoom,moved:false,button:e.button};canvas.setPointerCapture?.(e.pointerId)}
function moveMapDrag(e){if(!mapDrag||mapDrag.id!==e.pointerId)return;const dx=e.clientX-mapDrag.x,dy=e.clientY-mapDrag.y;if(!mapDrag.moved&&Math.hypot(dx,dy)<5)return;mapDrag.moved=true;camera.mode='free';const r=canvas.getBoundingClientRect();camera.x=mapDrag.cx-dx*SW/r.width/mapDrag.zoom;camera.y=mapDrag.cy-dy*SH/r.height/mapDrag.zoom;for(const id of ['overview','follow'])document.getElementById('view-'+id)?.setAttribute('aria-pressed','false');canvas.style.cursor='grabbing';if(ready)draw()}
function endMapDrag(e){if(!mapDrag||mapDrag.id!==e.pointerId)return;const click=!mapDrag.moved&&mapDrag.button===0;mapDrag=null;canvas.style.cursor='grab';if(canvas.hasPointerCapture?.(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(click)navigatePointer(e)}
function cancelMapDrag(){mapDrag=null;canvas.style.cursor='grab'}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',beginMapDrag);
canvas.addEventListener('pointermove',moveMapDrag);
canvas.addEventListener('pointerup',endMapDrag);
canvas.addEventListener('pointercancel',cancelMapDrag);
canvas.addEventListener('lostpointercapture',cancelMapDrag);
window.addEventListener('blur',cancelMapDrag);
'''+s[b:]
s=s.replace("camera.followZoom=1;camera.overviewZoom=null;updateCamera();if(ready)draw()", "camera.followZoom=1;camera.overviewZoom=null;setCameraMode(camera.mode==='free'?'follow':camera.mode)")
p.write_text(s,encoding='utf-8')
css=Path('DEMO/手繪風分檔版/style.css');css.write_text(css.read_text(encoding='utf-8')+'\n#scene{cursor:grab;touch-action:none}\n',encoding='utf-8')
