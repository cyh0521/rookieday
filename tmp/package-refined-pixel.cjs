const fs=require('fs');
const payload=JSON.parse(fs.readFileSync('DEMO/精緻像素風/assets.json','utf8'));
let source=fs.readFileSync('DEMO/安全規定區-手繪等角試作.html','utf8');
source=source.replaceAll('樹蔭下的行前說明','石牆邊的集合時光').replaceAll('手繪等角試作','精緻像素風試作').replaceAll('手繪等角場景','精緻像素風 · 2.5D 場景').replaceAll('可移動的手繪等角庭院','可移動的精緻像素風庭院').replace('探索這一小片庭院。</span>','正在載入內嵌像素素材…</span>');
source=source.replace('</style>','body{background:#202d25;color:#e4d9b6}header p,.eyebrow,footer{color:#a6b390}.chapter{color:#c4ad70}figure{border-radius:6px;border-color:#677453;background:#34432e}canvas{image-rendering:auto}.hud,.note{background:#283c30ee;border-color:#71805a;border-radius:3px;color:#eddfb5}.hud p,.note p{color:#bfca9f}kbd,button{background:#3a503a;color:#e6d8ac;border-color:#798664;border-radius:3px}#status{color:#c4cda6}.pad button{background:#304832ed}</style>');
const begin=source.indexOf("'use strict';"),end=source.indexOf('const blocks=');
source=source.slice(0,begin)+`'use strict';
// Offline-rendered model sprites; runtime uses only Canvas 2D and independent PNG layers.
const canvas=document.getElementById('scene'),c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
const SW=1100,SH=740,TX=48,TY=24,OX=528,OY=152;
const P=(x,y,z=0)=>[OX+(x-y)*TX,OY+(x+y)*TY-z];
const unproject=(u,v)=>{const a=(u-OX)/TX,b=(v-OY)/TY;return{x:(a+b)/2,y:(b-a)/2}};
const player={x:5.1,y:6.8,face:'front',dir:7,step:0,moving:false};
const assets=${JSON.stringify(payload)};
let ready=false;
function ellipse(x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill()}
function shadow(x,y,rx,ry){const p=P(x,y);c.save();c.translate(...p);c.scale(1,ry/rx);const g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,'#294d4a36');g.addColorStop(1,'#294d4a00');ellipse(0,0,rx,rx,g);c.restore()}
`+source.slice(end);
const a=source.indexOf('const scenery='),b=source.indexOf('let destination=',a);
source=source.slice(0,a)+source.slice(b);
const start=source.indexOf('function draw(){'),finish=source.indexOf('function update(dt)',start);
source=source.slice(0,start)+`function draw(){if(!ready)return;c.clearRect(0,0,SW,SH);const bg=c.createLinearGradient(0,0,SW,SH);bg.addColorStop(0,'#394631');bg.addColorStop(1,'#273b2e');c.fillStyle=bg;c.fillRect(0,0,SW,SH);shadow(5,4.3,460,230);
const ground=assets.records[0];c.drawImage(ground.image,ground.left,ground.top,ground.width,ground.height);
if(destination){const p=P(destination.x,destination.y);c.setLineDash([3,4]);c.strokeStyle='#5b9b8e';c.lineWidth=1.5;c.beginPath();c.ellipse(...p,12,6,0,0,Math.PI*2);c.stroke();c.setLineDash([])}
const items=[...assets.records.slice(1),{depth:player.x+player.y,player:true}].sort((a,b)=>a.depth-b.depth);
for(const obj of items){if(!obj.player){c.drawImage(obj.image,obj.left,obj.top,obj.width,obj.height);continue}const p=P(player.x,player.y);shadow(player.x,player.y,22,10);c.strokeStyle='#7fb9ab';c.lineWidth=2;c.beginPath();c.ellipse(...p,17,7,0,0,Math.PI*2);c.stroke();const frame=player.moving?1+(Math.floor(player.step/Math.PI)%2):0;const sprite=assets.chars[player.dir*3+frame];c.drawImage(sprite.image,Math.round((p[0]-sprite.anchorX)/2)*2,Math.round((p[1]-sprite.anchorY)/2)*2,sprite.width,sprite.height);}}
`+source.slice(finish);
source=source.replace("player.face=vx+vy<-.05?'back':'front'","player.face=vx+vy<-.05?'back':'front';player.dir=(Math.round(Math.atan2(-vx,vy)/(Math.PI/4))+8)%8");
source=source.replace("face:'front',step:0,moving:false","face:'front',dir:7,step:0,moving:false");
source=source.replace('draw();requestAnimationFrame(frame);\n</script>',`Promise.all([...assets.records,...assets.chars].map(asset=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{asset.image=image;resolve()};image.onerror=()=>reject(new Error('素材載入失敗'));image.src=asset.src;}))).then(()=>{const resolution=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||1)));canvas.width=SW*resolution;canvas.height=SH*resolution;c.setTransform(resolution,0,0,resolution,0,0);c.imageSmoothingEnabled=false;ready=true;document.getElementById('status').textContent='探索這一小片庭院。';draw();requestAnimationFrame(frame)}).catch(()=>{document.getElementById('status').textContent='素材未能載入，請重新開啟此檔案。'});
</script>`);
fs.writeFileSync('DEMO/安全規定區-精緻像素風.html',source);
console.log('Packaged standalone HTML:',Buffer.byteLength(source),'bytes');
