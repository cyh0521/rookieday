const fs=require('fs'),vm=require('vm');
const {createCanvas,loadImage}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const root='DEMO/手繪風分檔版',env={window:{}};vm.createContext(env);vm.runInContext(fs.readFileSync(root+'/assets.js','utf8'),env);const assets=env.window.HANDDRAWN_ASSETS;
function analyse(canvas){const g=canvas.getContext('2d'),d=g.getImageData(0,0,canvas.width,canvas.height).data,w=canvas.width,h=canvas.height;let l=w,r=0,t=h,b=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>45){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}
let sum=0,n=0;for(let y=t+(b-t)*.07|0;y<t+(b-t)*.3;y++){let lo=w,hi=0;for(let x=l;x<=r;x++)if(d[(y*w+x)*4+3]>80){lo=Math.min(lo,x);hi=Math.max(hi,x)}if(hi>lo){sum+=(lo+hi)/2;n++}}return{canvas,l,r,t,b,cx:sum/n};}
async function split(file,count){const im=await loadImage(file),cw=Math.floor(im.width/count),parts=[];for(let i=0;i<count;i++){const c=createCanvas(cw,im.height);c.getContext('2d').drawImage(im,i*cw,0,cw,im.height,0,0,cw,im.height);parts.push(analyse(c))}return parts;}
(async()=>{
const npcParts=await split(process.argv[2],4),backParts=await split(process.argv[3],5),npc=assets.records.find(a=>a.name==='instructor');
// Use the clean right-foot swing and its mirror for the opposite half-cycle,
// avoiding the generated crossed-leg pose in column four.
for(const [to,from]of [[3,1],[4,2]]){const source=backParts[from].canvas,mirror=createCanvas(source.width,source.height),g=mirror.getContext('2d');g.translate(mirror.width,0);g.scale(-1,1);g.drawImage(source,0,0);backParts[to]=analyse(mirror)}
const npcScale=Math.min(344/Math.max(...npcParts.map(a=>a.b-a.t+1)),280/Math.max(...npcParts.map(a=>a.r-a.l+1)));
assets.npcIdle=[];
for(let i=0;i<4;i++){const a=npcParts[i],png=createCanvas(320,400),g=png.getContext('2d');g.drawImage(a.canvas,160-a.cx*npcScale,368-a.b*npcScale,a.canvas.width*npcScale,a.canvas.height*npcScale);const src='images/characters/npc-front-idle-'+i+'.png';fs.writeFileSync(root+'/'+src,png.toBuffer('image/png'));assets.npcIdle.push({src,width:80,height:100,pixelWidth:320,pixelHeight:400});}
Object.assign(npc,{src:assets.npcIdle[0].src,anchorX:40,anchorY:92,left:514+(npc.worldX-npc.worldY)*45-40,top:196+(npc.worldX+npc.worldY)*22.5-92,headTop:6});
const bs=336/Math.max(...backParts.map(a=>a.b-a.t+1)),baseline=32+(backParts[0].b-backParts[0].t+1)*bs;
for(let f=0;f<5;f++){const a=backParts[f],png=createCanvas(320,400),g=png.getContext('2d');g.drawImage(a.canvas,160-a.cx*bs,32-a.t*bs,a.canvas.width*bs,a.canvas.height*bs);const src='images/characters/student-back-fixed-'+f+'.png';fs.writeFileSync(root+'/'+src,png.toBuffer('image/png'));assets.chars[10+f]={name:'student-back-fixed-'+f,src,width:80,height:100,pixelWidth:320,pixelHeight:400,anchorX:40,anchorY:baseline/4};}
fs.copyFileSync(process.argv[2],root+'/images/characters/npc-front-idle-source.png');fs.copyFileSync(process.argv[3],root+'/images/characters/student-back-fixed-source.png');
fs.writeFileSync(root+'/assets.js','// Separate front-facing NPC idle frames and corrected away-walking student sprites.\nwindow.HANDDRAWN_ASSETS = '+JSON.stringify(assets,null,2)+';\n');
let game=fs.readFileSync(root+'/game.js','utf8');
const start=game.indexOf('function drawNPCMarker()'),end=game.indexOf('function draw(){',start);
const routines=`
let sceneTime=0;
let idleSeed=761;function idleRandom(){idleSeed=(Math.imul(idleSeed,1664525)+1013904223)>>>0;return idleSeed/4294967296}
const npcIdleState={clock:0,next:3.5,elapsed:0,action:null,frame:0,history:[]};
function updateNPCIdle(dt){const state=npcIdleState;state.clock+=dt;if(state.action){state.elapsed+=dt;const tilt=state.action==='tilt';const duration=tilt?2.3:.26;if(state.elapsed>=duration){state.action=null;state.frame=0;state.next=state.clock+3.5+idleRandom()*4.5;}else if(tilt){state.frame=state.elapsed<.75?1:state.elapsed<1.55?2:0;}else state.frame=3;}else if(state.clock>=state.next){state.action=idleRandom()<.6?'tilt':'blink';state.elapsed=0;state.frame=state.action==='tilt'?1:3;state.history.push(state.action);}}
function drawNPCHalo(npc){const x=npc.left+npc.anchorX,y=npc.top+npc.anchorY;const pulse=.8+.2*Math.sin(sceneTime*2);c.save();c.translate(x,y);c.scale(1,.38);const gradient=c.createRadialGradient(0,0,9,0,0,30);gradient.addColorStop(0,'#e6c86a00');gradient.addColorStop(.65,'rgba(250,217,111,'+(.3*pulse)+')');gradient.addColorStop(1,'#e6c86a00');ellipse(0,0,30,30,gradient);c.shadowColor='#ffe497';c.shadowBlur=8;c.strokeStyle='rgba(255,224,128,'+(.85*pulse)+')';c.lineWidth=2;c.beginPath();c.arc(0,0,23,0,Math.PI*2);c.stroke();c.shadowBlur=0;c.strokeStyle='#fff3c3';c.lineWidth=.7;c.beginPath();c.arc(0,0,18,0,Math.PI*2);c.stroke();c.restore();}
function drawNPC(npc){const sprite=assets.npcIdle[npcIdleState.frame];c.save();const breathing=Math.sin(sceneTime*1.5)*.35;c.drawImage(sprite.image,npc.left,npc.top+breathing,npc.width,npc.height);c.restore();}
`;
if(start<0)throw Error('NPC marker function missing');game=game.slice(0,start)+routines+game.slice(end);
game=game.replace("if(!obj.player){c.drawImage(obj.image,obj.left,obj.top,obj.width,obj.height);continue}","if(!obj.player){if(obj.name==='instructor'){drawNPCHalo(obj);drawNPC(obj)}else c.drawImage(obj.image,obj.left,obj.top,obj.width,obj.height);continue}");
game=game.replace('}drawNPCMarker();}','}}');
game=game.replace('function update(dt){let vx=0,vy=0;','function update(dt){sceneTime+=dt;updateNPCIdle(dt);let vx=0,vy=0;');
game=game.replace('[...assets.records,...assets.chars].map','[...assets.records,...assets.chars,...assets.npcIdle].map');
fs.writeFileSync(root+'/game.js',game);
fs.appendFileSync(root+'/使用說明.txt','\nNPC 修正：正面朝下、頭上標示移除，改用腳下金色光圈。以獨立完整站姿影格呈現不規則的擺頭、眨眼，間隔約 3.5–8 秒；另有輕微呼吸。學生背面步態重製，抬腳、支撐腳分開交替，固定頭部及腳底基準。\n');
console.log('Updated front-facing NPC, foot halo, irregular idle actions and student back gait.');
})();
