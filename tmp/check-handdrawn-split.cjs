const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const {createCanvas,Image}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const root=path.resolve('DEMO/手繪風分檔版');
class LocalImage extends Image{set src(value){super.src=path.resolve(root,value)}get src(){return super.src}}
const canvas=createCanvas(1100,740);canvas.addEventListener=()=>{};canvas.focus=()=>{};canvas.closest=()=>({classList:{add(){},remove(){}}});
const elements={scene:canvas,note:{hidden:true},status:{textContent:''},reset:{addEventListener(){}},npcDialogue:{hidden:true},dialogueContinue:{addEventListener(){},focus(){}}};
const sandbox={Image:LocalImage,console,document:{body:{style:{cssText:''}},documentElement:{style:{cssText:''},clientWidth:1080},getElementById:id=>elements[id],querySelectorAll:()=>[],addEventListener(){}},window:{scrollX:0,scrollY:137,innerWidth:1100,scrollTo(value){this.restored=value},addEventListener(){}},requestAnimationFrame(){}};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(root+'/assets.js','utf8'),sandbox);vm.runInContext(fs.readFileSync(root+'/game.js','utf8'),sandbox);
setTimeout(()=>{
vm.runInContext(`if(!ready)throw Error('External PNGs did not load: '+document.getElementById('status').textContent);draw();const realContactCheck=typeof checkNPCContact==='function'?checkNPCContact:null;if(realContactCheck)checkNPCContact=()=>{};`,sandbox);
fs.writeFileSync('DEMO/手繪風分檔版-預覽.png',canvas.toBuffer('image/png'));
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
for(const end of [{x:3,y:2.25},{x:8.5,y:4.1},{x:6.4,y:1.1},{x:2,y:6.8}]){const steps=route(player,end);check(steps.length>0,'path found');let prev={x:player.x,y:player.y};for(const p of steps){check(segmentClear(prev,p),'clear route');prev=p}waypoints=steps;destination=end;for(let i=0;i<1200&&waypoints.length;i++){update(1/60);check(canWalk(player.x,player.y),'movement walkable')}check(Math.hypot(player.x-end.x,player.y-end.y)<.1,'destination reached '+JSON.stringify({end,player,waypoints}))}
check(route(player,{x:7.3,y:2}).length===0,'table blocked');check(route(player,{x:-1,y:4}).length===0,'outside blocked');
player.x=5.1;player.y=6.8;keys.add('w');for(let i=0;i<30;i++)update(1/60);keys.clear();check(player.x<5.1&&player.y<6.8,'W moves up');
for(let dir=0;dir<4;dir++){player.dir=dir;player.moving=true;player.step=4;draw()}
player.x=3;player.y=2.25;update(0);check(near,'notice proximity');draw();
`,sandbox);
fs.writeFileSync('tmp/手繪分檔-告示牌驗證.png',canvas.toBuffer('image/png'));
vm.runInContext(`
for(const [key,facing]of [['ArrowDown',0],['ArrowLeft',1],['ArrowUp',2],['ArrowRight',3]]){player.x=5;player.y=5;waypoints=[];keys.clear();keys.add(key);update(1/60);keys.clear();check(player.dir===facing,key+' must face correct screen direction')}
const seen=new Set();player.step=0;for(let i=0;i<16;i++){player.step+=10/16;seen.add(1+Math.floor(player.step*.8)%4)}check(seen.size===4,'all four walking poses are selected within one second');
if(typeof onMovementKeyDown==='function'){
for(const tagName of ['CANVAS','BODY','BUTTON'])for(const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d']){let prevented=false;onMovementKeyDown({key,target:{tagName},preventDefault(){prevented=true}});check(prevented,'Movement key prevents native page scroll even with button focus');check(keys.has(key.length===1?key.toLowerCase():key),'Movement key registered');onMovementKeyUp({key,target:{tagName},preventDefault(){}});check(!keys.has(key),'Movement key released');}
let blocked=false;onMovementKeyDown({key:'ArrowDown',target:{tagName:'INPUT'},preventDefault(){blocked=true}});check(!blocked,'Editable input remains usable');keys.clear();
}
`,sandbox);
const assets=sandbox.window.HANDDRAWN_ASSETS;
if(elements.npcDialogue){
 vm.runInContext(`
 if(realContactCheck){checkNPCContact=realContactCheck;const npc=assets.records.find(a=>a.name==='instructor');
 dialogue.armed=true;player.x=npc.worldX+.38891;player.y=npc.worldY+.38891;keys.clear();update(0);
 check(dialogue.active&&!dialoguePanel.hidden,'Contact opens dialogue');check(player.dir===2,'Student faces up towards front-facing NPC');check(canWalk(player.x,player.y),'Staged conversation position remains walkable');
 const a=P(player.x,player.y),b=P(npc.worldX,npc.worldY);check(Math.abs(a[0]-b[0])<.1&&a[1]>b[1],'Face-to-face vertical alignment');
 if(typeof facingDirection==='function'){
 check(document.body.style.position!=='fixed'&&document.documentElement.style.overflow!=='hidden','Page remains scrollable during dialogue');
 closeNPCDialogue();
 for(const [dx,dy,expected]of [[.68,.68,0],[-.68,-.68,2],[.68,-.68,3],[-.68,.68,1],[.9,0,3],[-.9,0,1],[0,.9,1],[0,-.9,3]]){
 player.x=npc.worldX+dx;player.y=npc.worldY+dy;dialogue.armed=true;const px=player.x,py=player.y;openNPCDialogue();
 check(dialogue.active&&dialogue.npcDir===expected,'NPC faces radial contact direction');check(player.x===px&&player.y===py,'Dialogue does not teleport student');check(player.dir===[2,3,0,1][expected],'Student faces opposite NPC');draw();closeNPCDialogue();}
 if(typeof routeToNPC==='function'){
 for(let i=0;i<16;i++){
 const theta=i*Math.PI/8;
 for(const radius of [.6,.9,1.4]){player.x=npc.worldX+Math.cos(theta)*radius;player.y=npc.worldY+Math.sin(theta)*radius;dialogue.armed=true;checkNPCContact();check(!dialogue.active,'No dialogue outside actual collision boundary');}
 player.x=npc.worldX+Math.cos(theta)*.60;player.y=npc.worldY+Math.sin(theta)*.60;dialogue.armed=true;
 const touched=moveToNPCBoundary(-Math.cos(theta)*.08,-Math.sin(theta)*.08);
 check(touched&&dialogue.active,'Actual contact triggers from each of sixteen angles');check(Math.abs(npcDistance()-NPC_BODY_RADIUS)<1e-6,'Player stops at contact, never at a distance');closeNPCDialogue();
 }
 const facingSeen=new Set();
 for(const [x,y]of [[6,1],[7.5,1],[3,4],[6,6],[9.3,4.1],[4.5,2.5],[8,5]]){player.x=x;player.y=y;dialogue.armed=true;keys.clear();check(canWalk(x,y),'Approach start is walkable');waypoints=routeToNPC();check(waypoints.length>0,'Find reachable NPC contact point around obstacles');destination=waypoints[waypoints.length-1];for(let i=0;i<1500&&!dialogue.active;i++)update(1/60);check(dialogue.active,'Actual walking route triggers NPC contact');facingSeen.add(dialogue.npcDir);closeNPCDialogue();}
 check(facingSeen.size>=3,'Physical routes cover several contact sides');
 check(npcBodyHit(npc.left+40,npc.top+15)&&npcBodyHit(npc.left+40,npc.top+60),'Head and torso click targets');
 }
 player.x=npc.worldX+.38891;player.y=npc.worldY+.38891;dialogue.armed=true;openNPCDialogue();
 }
 const ox=player.x,oy=player.y;keys.add('ArrowDown');update(1);check(player.x===ox&&player.y===oy,'Movement locked during dialogue');check(npcIdleState.frame===0,'NPC faces straight ahead');
 if(typeof onMovementKeyDown==='function'){keys.clear();let prevented=false;onMovementKeyDown({key:'ArrowDown',target:{tagName:'BUTTON'},preventDefault(){prevented=true}});check(prevented&&!keys.has('ArrowDown'),'Dialogue arrows neither scroll page nor move player');}
 closeNPCDialogue();check(!dialogue.active&&dialoguePanel.hidden,'Close returns to scene');update(0);check(!dialogue.active,'No immediate retrigger');
 player.x=5.1;player.y=6.8;keys.clear();update(0);check(dialogue.armed,'Walking away rearms dialogue');
 player.x=npc.worldX+.38891;player.y=npc.worldY+.38891;update(0);check(dialogue.active,'Contact retriggers after leaving');draw();
 }
 `,sandbox);
 fs.writeFileSync('tmp/手繪分檔-對話場景.png',canvas.toBuffer('image/png'));
 const html=fs.readFileSync(root+'/index.html','utf8');assert(html.includes('這裡有一張自願留營表，你要簽一下嗎？'),'Exact dialogue text');assert(html.includes('role="dialog"'),'Accessible dialogue panel');
}
if(assets.npcIdle){
 vm.runInContext(`
 const used=new Set();for(let i=0;i<6000;i++){updateNPCIdle(1/60);used.add(npcIdleState.frame)}
 check(used.has(0)&&used.has(1)&&used.has(2)&&used.has(3),'NPC normal, left tilt, right tilt and blink frames');
 check(npcIdleState.history.includes('tilt')&&npcIdleState.history.includes('blink'),'Both idle actions occur');
 check(npcIdleState.history.length>5&&npcIdleState.history.length<30,'Actions have quiet intervals');
 npcIdleState.frame=1;draw();
 `,sandbox);
 fs.writeFileSync('tmp/NPC-擺頭驗證.png',canvas.toBuffer('image/png'));
 for(const frame of assets.npcIdle)assert(frame.image,'NPC animation image loaded');
 assert(!fs.readFileSync(root+'/game.js','utf8').includes('drawNPCMarker'),'No overhead NPC label');
 if(fs.readFileSync(root+'/game.js','utf8').includes('drawNPCBubble')){
 vm.runInContext(`check(npcDotOffset(0,.1)!==npcDotOffset(1,.1),'Ellipsis dots jump at different times');check(npcDotOffset(0,.1)!==npcDotOffset(0,.6),'Ellipsis animates over time');`,sandbox);
 assert(!/drawNPCHalo|#7fb9ab/.test(fs.readFileSync(root+'/game.js','utf8')),'Both character rings removed');
 }
}
for(const a of [...assets.records,...assets.chars]){assert(fs.existsSync(path.resolve(root,a.src)),a.src);assert(a.image.width===a.pixelWidth&&a.image.height===a.pixelHeight,'asset resolution');}
const game=fs.readFileSync(root+'/game.js','utf8');assert(!/data:image|fetch\(|\bimport\b/.test(game),'No bundled images, fetch, or module dependency');
console.log('PASS: external PNG dimensions match metadata; four routes, keyboard, collisions and proximity; four facing directions and walk cadence.');
},150);
