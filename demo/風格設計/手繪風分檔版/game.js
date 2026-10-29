
'use strict';
// Offline-rendered model sprites; runtime uses only Canvas 2D and independent PNG layers.
const canvas=document.getElementById('scene'),c=canvas.getContext('2d');
const SW=1100,SH=740,TX=45,TY=22.5,OX=514,OY=196;
const P=(x,y,z=0)=>[OX+(x-y)*TX,OY+(x+y)*TY-z];
const unproject=(u,v)=>{const a=(u-OX)/TX,b=(v-OY)/TY;return{x:(a+b)/2,y:(b-a)/2}};
const player={x:5.1,y:6.8,face:'front',dir:0,step:0,moving:false};
const assets=window.HANDDRAWN_ASSETS;
let ready=false;
function ellipse(x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill()}
function shadow(x,y,rx,ry){const p=P(x,y);c.save();c.translate(...p);c.scale(1,ry/rx);const g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,'#294d4a36');g.addColorStop(1,'#294d4a00');ellipse(0,0,rx,rx,g);c.restore()}
const blocks=[{x:1.65,y:1.32,w:2.95,d:.38},{x:6.8,y:1.65,w:2.45,d:.95},{x:7,y:3,w:1.95,d:.55},{x:1.05,y:4.5,w:.8,d:.8},{x:8.8,y:5.6,w:.85,d:.85}];
const npcCentre=assets.records.find(a=>a.name==='instructor'),NPC_BODY_RADIUS=.55;
function canWalk(x,y){const r=.21;return x>=.65&&x<=9.4&&y>=.7&&y<=7.55&&!blocks.some(b=>x>b.x-r&&x<b.x+b.w+r&&y>b.y-r&&y<b.y+b.d+r)&&Math.hypot(x-.6,y-.7)>.45&&Math.hypot(x-9.35,y-.65)>.45&&Math.hypot(x-npcCentre.worldX,y-npcCentre.worldY)>=NPC_BODY_RADIUS-1e-7}
function segmentClear(a,b){const n=Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/.08);for(let i=1;i<=n;i++)if(!canWalk(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n))return false;return true}
function route(start,end){if(!canWalk(end.x,end.y))return [];if(segmentClear(start,end))return [end];const step=.2,key=(x,y)=>x+','+y;const sx=Math.round(start.x/step),sy=Math.round(start.y/step),tx=Math.round(end.x/step),ty=Math.round(end.y/step);const open=[{x:sx,y:sy,g:0,f:0}],cost=new Map([[key(sx,sy),0]]),prev=new Map();let found;
 for(let n=0;open.length&&n<4000;n++){open.sort((a,b)=>a.f-b.f);const a=open.shift(),ak=key(a.x,a.y);if(a.g>cost.get(ak))continue;if(a.x===tx&&a.y===ty){found=a;break}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const x=a.x+dx,y=a.y+dy;if(!canWalk(x*step,y*step)||!segmentClear({x:a.x*step,y:a.y*step},{x:x*step,y:y*step}))continue;const k=key(x,y),g=a.g+Math.hypot(dx,dy);if(g>=(cost.get(k)??Infinity))continue;cost.set(k,g);prev.set(k,a);open.push({x,y,g,f:g+Math.hypot(tx-x,ty-y)})}}
 if(!found)return [];const points=[end];let a=found;while(a.x!==sx||a.y!==sy){points.unshift({x:a.x*step,y:a.y*step});a=prev.get(key(a.x,a.y));if(!a)return []}points.unshift({x:sx*step,y:sy*step});const result=[];let anchor=start;while(points.length){let n=points.length-1;while(n>=0&&!segmentClear(anchor,points[n]))n--;if(n<0)return [];anchor=points[n];result.push(anchor);points.splice(0,n+1)}return result;
}
let destination=null,waypoints=[],lastTime=0;const keys=new Set();let near=false;


let sceneTime=0;
let idleSeed=761;function idleRandom(){idleSeed=(Math.imul(idleSeed,1664525)+1013904223)>>>0;return idleSeed/4294967296}
const npcIdleState={clock:0,next:3.5,elapsed:0,action:null,frame:0,history:[]};
function updateNPCIdle(dt){const state=npcIdleState;state.clock+=dt;if(state.action){state.elapsed+=dt;const tilt=state.action==='tilt';const duration=tilt?2.3:.26;if(state.elapsed>=duration){state.action=null;state.frame=0;state.next=state.clock+3.5+idleRandom()*4.5;}else if(tilt){state.frame=state.elapsed<.75?1:state.elapsed<1.55?2:0;}else state.frame=3;}else if(state.clock>=state.next){state.action=idleRandom()<.6?'tilt':'blink';state.elapsed=0;state.frame=state.action==='tilt'?1:3;state.history.push(state.action);}}
function npcDotOffset(index,time){const phase=((time*1.1-index*.16)%1+1)%1;return phase<.4?-3*Math.sin(phase/.4*Math.PI):0;}
function drawNPCBubble(){if(dialogue.active)return;const npc=assets.records.find(a=>a.name==='instructor');const x=npc.left+npc.anchorX,y=npc.top+npc.headTop-11;c.save();
c.fillStyle='#fff9e9';c.strokeStyle='#64775b';c.lineWidth=1.2;c.beginPath();c.roundRect(x-19,y-26,38,25,8);c.fill();c.stroke();
c.beginPath();c.moveTo(x-4,y-1);c.lineTo(x,y+5);c.lineTo(x+5,y-1);c.fill();c.stroke();
c.fillStyle='#fff9e9';c.fillRect(x-3,y-3,7,3);
for(let i=0;i<3;i++){c.beginPath();c.ellipse(x+(i-1)*8,y-13+npcDotOffset(i,sceneTime),2,2,0,0,Math.PI*2);c.fillStyle='#4c6956';c.fill();}c.restore();}
function drawNPC(npc){const dir=dialogue.active?dialogue.npcDir:0;const sprite=dir===0?assets.npcIdle[npcIdleState.frame]:assets.npcViews[dir];c.save();const breathing=dialogue.active?0:Math.sin(sceneTime*1.5)*.35;c.drawImage(sprite.image,npc.left,npc.top+breathing,npc.width,npc.height);c.restore();}
const dialogue={active:false,armed:true,previousFocus:null,npcDir:0,scroll:null};
const dialoguePanel=document.getElementById('npcDialogue'),dialogueButton=document.getElementById('dialogueContinue');
const figure=canvas.closest('figure');
function facingDirection(sx,sy){return Math.abs(sx)>Math.abs(sy)*1.25?(sx<0?1:3):(sy<0?2:0)}
function npcDistance(){const npc=assets.records.find(a=>a.name==='instructor');return Math.hypot(player.x-npc.worldX,player.y-npc.worldY)}
function openNPCDialogue(){if(dialogue.active||!dialogue.armed)return;const npc=assets.records.find(a=>a.name==='instructor');
 const a=P(player.x,player.y),b=P(npc.worldX,npc.worldY);const sx=a[0]-b[0],sy=a[1]-b[1];
 dialogue.active=true;dialogue.armed=false;dialogue.previousFocus=document.activeElement;dialogue.npcDir=facingDirection(sx,sy);
 Object.assign(player,{dir:facingDirection(-sx,-sy),moving:false,step:0});keys.clear();waypoints=[];destination=null;
 npcIdleState.frame=0;npcIdleState.action=null;dialoguePanel.hidden=false;figure.classList.add('in-dialogue');
 document.getElementById('status').textContent='正在與靶場教官對話。';dialogueButton.focus({preventScroll:true});
}
function closeNPCDialogue(){if(!dialogue.active)return;dialogue.active=false;dialoguePanel.hidden=true;figure.classList.remove('in-dialogue');keys.clear();player.moving=false;npcIdleState.next=npcIdleState.clock+4;
 document.getElementById('status').textContent='對話結束，離開教官身邊後可再次交談。';canvas.focus({preventScroll:true});}
const NPC_CONTACT_RADIUS=NPC_BODY_RADIUS+1e-5,NPC_REARM_RADIUS=.85;
function checkNPCContact(){const distance=npcDistance();if(!dialogue.armed){if(distance>NPC_REARM_RADIUS)dialogue.armed=true;return;}if(distance<=NPC_CONTACT_RADIUS)openNPCDialogue();}
function moveToNPCBoundary(dx,dy){const x=player.x-npcCentre.worldX,y=player.y-npcCentre.worldY,a=dx*dx+dy*dy;if(a<1e-12)return false;const b=2*(x*dx+y*dy),cc=x*x+y*y-NPC_BODY_RADIUS*NPC_BODY_RADIUS,discriminant=b*b-4*a*cc;if(discriminant<0||b>=-1e-7)return false;const t=(-b-Math.sqrt(discriminant))/(2*a);if(t< -1e-6||t>1)return false;const px=player.x+dx*Math.max(0,t),py=player.y+dy*Math.max(0,t);if(!canWalk(px,py))return false;player.x=px;player.y=py;checkNPCContact();return true;}
function npcBodyHit(x,y){const npc=assets.records.find(a=>a.name==='instructor');return x>=npc.left+15&&x<=npc.left+npc.width-15&&y>=npc.top+4&&y<=npc.top+npc.anchorY+3;}
function routeToNPC(){const npc=assets.records.find(a=>a.name==='instructor');let best=[],bestCost=Infinity;const angle=Math.atan2(player.y-npc.worldY,player.x-npc.worldX);
for(let i=0;i<16;i++){const theta=angle+i*Math.PI/8,end={x:npc.worldX+Math.cos(theta)*NPC_BODY_RADIUS,y:npc.worldY+Math.sin(theta)*NPC_BODY_RADIUS};if(!canWalk(end.x,end.y))continue;const path=route(player,end);if(!path.length)continue;let previous=player,cost=0;for(const point of path){cost+=Math.hypot(point.x-previous.x,point.y-previous.y);previous=point}if(cost<bestCost){bestCost=cost;best=path;}}
return best;}
dialogueButton.addEventListener('click',closeNPCDialogue);
window.addEventListener('keydown',event=>{if(!dialogue.active)return;if(event.key==='Tab'){event.preventDefault();dialogueButton.focus({preventScroll:true});return;}if(['Enter',' ','Escape'].includes(event.key)){event.preventDefault();if(!event.repeat)closeNPCDialogue();}},true);

function draw(){if(!ready)return;c.clearRect(0,0,SW,SH);const bg=c.createLinearGradient(0,0,SW,SH);bg.addColorStop(0,'#e5efdb');bg.addColorStop(1,'#bfdcc8');c.fillStyle=bg;c.fillRect(0,0,SW,SH);shadow(5,4.3,460,230);
const ground=assets.records[0];c.drawImage(ground.image,ground.left,ground.top,ground.width,ground.height);
if(destination){const p=P(destination.x,destination.y);c.setLineDash([3,4]);c.strokeStyle='#5b9b8e';c.lineWidth=1.5;c.beginPath();c.ellipse(...p,12,6,0,0,Math.PI*2);c.stroke();c.setLineDash([])}
const items=[...assets.records.slice(1),{depth:player.x+player.y,player:true}].sort((a,b)=>a.depth-b.depth);
for(const obj of items){if(!obj.player){if(obj.name==='instructor'){drawNPC(obj)}else c.drawImage(obj.image,obj.left,obj.top,obj.width,obj.height);continue}const p=P(player.x,player.y);shadow(player.x,player.y,22,10);const frame=player.moving?1+(Math.floor(player.step*.8)%4):0;const sprite=assets.chars[player.dir*assets.walkFrames+frame];c.drawImage(sprite.image,p[0]-sprite.anchorX,p[1]-sprite.anchorY,sprite.width,sprite.height);}drawNPCBubble();}
function update(dt){sceneTime+=dt;if(dialogue.active){player.moving=false;return;}updateNPCIdle(dt);let vx=0,vy=0;const right=keys.has('ArrowRight')||keys.has('d'),left=keys.has('ArrowLeft')||keys.has('a'),up=keys.has('ArrowUp')||keys.has('w'),down=keys.has('ArrowDown')||keys.has('s');const h=Number(right)-Number(left),v=Number(down)-Number(up);if(h||v){vx=h+v;vy=-h+v;waypoints=[];destination=null}else if(waypoints.length){const target=waypoints[0];vx=target.x-player.x;vy=target.y-player.y;const distance=Math.hypot(vx,vy);if(distance<.045){if(canWalk(target.x,target.y)){player.x=target.x;player.y=target.y;}waypoints.shift();vx=vy=0;}}
 const len=Math.hypot(vx,vy);player.moving=false;if(len>.001){const amount=Math.min(2.2*dt,waypoints.length?len:Infinity),dx=vx/len*amount,dy=vy/len*amount;const oldx=player.x,oldy=player.y;if(moveToNPCBoundary(dx,dy)){player.moving=false;return;}if(canWalk(player.x+dx,player.y))player.x+=dx;if(canWalk(player.x,player.y+dy))player.y+=dy;player.moving=Math.hypot(player.x-oldx,player.y-oldy)>.001;if(player.moving){player.step+=dt*10;player.face=vx+vy<-.05?'back':'front';const sx=(player.x-oldx)-(player.y-oldy),sy=((player.x-oldx)+(player.y-oldy))*.5;player.dir=Math.abs(sx)>Math.abs(sy)*1.25?(sx<0?1:3):(sy<0?2:0)}}if(!waypoints.length)destination=null;
 if(!player.moving)player.step=0;checkNPCContact();if(dialogue.active)return;
 const close=player.x>1.3&&player.x<4.9&&player.y>1.6&&player.y<3.4;if(close!==near){near=close;document.getElementById('status').textContent=close?'已抵達安全規定告示牌。':'探索這一小片庭院。';}}
function frame(time){const dt=Math.min((time-lastTime)/1000,.04);lastTime=time;update(dt);draw();requestAnimationFrame(frame)}
function clearInput(){keys.clear();player.moving=false}
function onMovementKeyDown(e){const k=e.key.length===1?e.key.toLowerCase():e.key;if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(k))return;if(e.target?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;e.preventDefault();if(!dialogue.active)keys.add(k);}
function onMovementKeyUp(e){const k=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(k)&&!e.target?.isContentEditable&&!['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))e.preventDefault();keys.delete(k);}
window.addEventListener('keydown',onMovementKeyDown,true);window.addEventListener('keyup',onMovementKeyUp,true);window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInput()});
canvas.addEventListener('pointerdown',e=>{if(dialogue.active)return;canvas.focus({preventScroll:true});const r=canvas.getBoundingClientRect(),px=(e.clientX-r.left)*SW/r.width,py=(e.clientY-r.top)*SH/r.height,end=unproject(px,py);const npc=assets.records.find(a=>a.name==='instructor');const clickedNPC=npcBodyHit(px,py)||Math.hypot(end.x-npc.worldX,end.y-npc.worldY)<.55;if(clickedNPC){dialogue.armed=true;if(npcDistance()<=NPC_CONTACT_RADIUS){openNPCDialogue();return;}}const path=clickedNPC?routeToNPC():route(player,end);if(path.length){waypoints=path;destination=path[path.length-1];document.getElementById('status').textContent=clickedNPC?'正在走向教官…':'前往指定位置…'}else{document.getElementById('status').textContent='請點選庭院中可行走的地面。'}});
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{if(dialogue.active)return;e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key)});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(b.dataset.key))});
Promise.all([...assets.records,...assets.chars,...assets.npcIdle,...assets.npcViews].map(asset=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{asset.image=image;resolve()};image.onerror=()=>reject(new Error('無法載入 '+asset.src));image.src=asset.src;}))).then(()=>{const dpr=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||1)));canvas.width=SW*dpr;canvas.height=SH*dpr;c.setTransform(dpr,0,0,dpr,0,0);ready=true;document.getElementById('status').textContent='探索這一小片庭院。';draw();requestAnimationFrame(frame)}).catch(error=>{document.getElementById('status').textContent=error.message+'；請確認 images 資料夾與 index.html 一起保留。'});
