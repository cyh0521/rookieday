const fs=require('fs'),vm=require('vm');
const {createCanvas,loadImage}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const root='DEMO/手繪風分檔版',env={window:{}};vm.createContext(env);vm.runInContext(fs.readFileSync(root+'/assets.js','utf8'),env);const assets=env.window.HANDDRAWN_ASSETS;
function analyse(canvas){const g=canvas.getContext('2d'),d=g.getImageData(0,0,canvas.width,canvas.height),w=canvas.width,h=canvas.height;let l=w,r=0,t=h,b=0;
for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d.data[(y*w+x)*4+3]>35){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}if(b<=t)throw Error('Empty sprite');
// Register on the head centre, never on the currently planted left/right boot.
let centres=[];for(let y=t+Math.floor((b-t)*.07);y<t+(b-t)*.32;y++){let lo=w,hi=0;for(let x=l;x<=r;x++)if(d.data[(y*w+x)*4+3]>70){lo=Math.min(lo,x);hi=Math.max(hi,x)}if(hi>lo)centres.push((lo+hi)/2)}centres.sort((a,b)=>a-b);
return{canvas,l,r,t,b,headX:centres[Math.floor(centres.length/2)]};}
async function strip(file){const im=await loadImage(file),list=[];const cw=Math.floor(im.width/5);for(let col=0;col<5;col++){const a=createCanvas(cw,im.height);a.getContext('2d').drawImage(im,col*cw,0,cw,im.height,0,0,cw,im.height);list.push(analyse(a))}return list;}
async function fromPNG(file,flip=false){const im=await loadImage(file),a=createCanvas(im.width,im.height),g=a.getContext('2d');if(flip){g.translate(im.width,0);g.scale(-1,1)}g.drawImage(im,0,0);return analyse(a)}
function register(dir,list){
const scale=336/Math.max(...list.map(a=>a.b-a.t+1));const baseline=32+(list[0].b-list[0].t+1)*scale;
for(let frame=0;frame<5;frame++){const a=list[frame],png=createCanvas(320,400),g=png.getContext('2d');g.drawImage(a.canvas,160-a.headX*scale,32-a.t*scale,a.canvas.width*scale,a.canvas.height*scale);const name='registered-'+dir+'-'+frame,src='images/characters/'+name+'.png';fs.writeFileSync(root+'/'+src,png.toBuffer('image/png'));assets.chars[dir*5+frame]={name,src,width:80,height:100,pixelWidth:320,pixelHeight:400,anchorX:40,anchorY:baseline/4};}
}
(async()=>{
const front=await strip(process.argv[2]),back=await strip(process.argv[3]);register(0,front);register(2,back);
for(const dir of [1,3]){const list=[await fromPNG(root+'/images/characters/player-5-0.png',dir===1)];for(let f=1;f<=4;f++)list.push(await fromPNG(root+'/'+assets.chars[dir*5+f].src));register(dir,list)}
assets.registration={canvas:[320,400],logicalCanvas:[80,100],anchor:'head centre; fixed shared ground baseline per direction',idle:'dedicated both-feet-planted pose'};
fs.writeFileSync(root+'/assets.js','// All poses use a common canvas, head centre and fixed ground anchor.\nwindow.HANDDRAWN_ASSETS = '+JSON.stringify(assets,null,2)+';\n');
fs.copyFileSync(process.argv[2],root+'/images/characters/front-idle-walk-strip.png');fs.copyFileSync(process.argv[3],root+'/images/characters/back-idle-walk-strip.png');
let game=fs.readFileSync(root+'/game.js','utf8');game=game.replace('if(len>.001){const amount=', 'if(len>.001){const amount=');
// Reset cycle when stopping so the next start has a consistent gait phase.
game=game.replace("const close=player.x>1.3", "if(!player.moving)player.step=0;\n const close=player.x>1.3");
fs.writeFileSync(root+'/game.js',game);
fs.appendFileSync(root+'/使用說明.txt','\n定位修正：所有人物影格使用 320×400 固定透明畫布，顯示 80×100；以頭部中心和每方向共用地面基準定位，不再跟隨左右支撐腳切換定位點。正面與背面使用單列角色表，保留完整髮頂；停步使用獨立雙腳著地姿勢。\n');
console.log('Registered all 20 poses on shared head centres and ground anchors; dedicated grounded idle poses.');
})();
