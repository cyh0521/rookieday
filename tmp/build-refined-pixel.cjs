// Original pixel tiles and character sprites, drawn separately on a 550 × 370 pixel grid.
const fs=require('fs');
const {createCanvas}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const OUT='DEMO/精緻像素風';fs.mkdirSync(OUT,{recursive:true});
const canvas=createCanvas(550,370),c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
const P=(x,y,z=0)=>[Math.round(264+(x-y)*24),Math.round(76+(x+y)*12-z)];
let seed=42;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
const ink='#2d3429',stone=['#7d8272','#8c8d79','#999986','#a5a18c'],wood=['#b28a4f','#8d683b','#604c30'];
function rect(x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function poly(points,fill,stroke){c.beginPath();points.forEach((p,i)=>i?c.lineTo(Math.round(p[0]),Math.round(p[1])):c.moveTo(Math.round(p[0]),Math.round(p[1])));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.lineJoin='miter';c.stroke()}}
function line(points,color,width=1){c.beginPath();points.forEach((p,i)=>i?c.lineTo(Math.round(p[0]),Math.round(p[1])):c.moveTo(Math.round(p[0]),Math.round(p[1])));c.strokeStyle=color;c.lineWidth=width;c.lineCap='butt';c.stroke()}
function ellipse(x,y,rx,ry,color){c.beginPath();c.ellipse(Math.round(x),Math.round(y),rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill()}
function plane(x,y,w,d,z,color,stroke){poly([P(x,y,z),P(x+w,y,z),P(x+w,y+d,z),P(x,y+d,z)],color,stroke)}
function box(x,y,w,d,z,h,col){poly([P(x,y+d,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x,y+d,z+h)],col[1],ink);poly([P(x+w,y,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x+w,y,z+h)],col[2],ink);plane(x,y,w,d,z+h,col[0],ink)}
function shadow(x,y,rx,ry){const p=P(x,y);ellipse(p[0]+3,p[1]+2,rx,ry,'#31452c44');ellipse(p[0],p[1],rx*.65,ry*.6,'#26362b33')}
function grass(x,y,s=1){const p=P(x,y);line([[p[0]-3*s,p[1]-4*s],[p[0],p[1]],[p[0]+3*s,p[1]-6*s]],'#81914e');rect(p[0]-1,p[1]-5*s,1,5*s,'#a1a85a');rect(p[0]+3*s,p[1]-2,2,1,'#3b5733')}
function ground(){box(-.1,-.1,10.2,8.2,-11,11,['#667749','#5c6040','#414b32']);
for(let x=0;x<10;x++)for(let y=0;y<8;y++){
 const paved=(x>=1&&x<9&&y>=1&&y<7)||(x>=4&&x<=6&&y===7);
 plane(x,y,1,1,0,paved?stone[Math.floor(rnd()*4)]:['#617846','#6b8047','#72854b'][Math.floor(rnd()*3)],paved?'#505b49':null);
 if(paved){line([P(x+.03,y+.97,1),P(x+.03,y+.03,1),P(x+.97,y+.03,1)],'#c0b99b');line([P(x+.97,y+.03),P(x+.97,y+.97),P(x+.03,y+.97)],'#545e4c');}
 for(let i=0;i<25;i++){const p=P(x+.1+rnd()*.8,y+.1+rnd()*.8);rect(p[0],p[1],i%3===0?2:1,1,paved?(i%2?'#c3b99944':'#424f3c44'):(i%2?'#9ba35988':'#38532f77'));}
 if(!paved)for(let i=0;i<4;i++)grass(x+rnd(),y+rnd(),.5);
 if(paved&&rnd()<.22){const p=P(x+.2,y+.7);line([[p[0]-3,p[1]-2],[p[0],p[1]],[p[0]-1,p[1]+2]],'#626d56')}
}
for(const [x,y,w,d] of [[2.8,3.8,4.6,.065],[2.8,6.6,4.6,.065],[2.8,3.8,.065,2.8],[7.4,3.8,.065,2.85]])plane(x,y,w,d,1,'#d2b34f');
for(const [x,y]of [[4,4.7],[5.8,4.7],[4,5.9],[5.8,5.9]]){plane(x-.22,y,.44,.06,1,'#dac67b')}
for(let row=0;row<4;row++)for(let x=0;x<10;x++){const xx=x+(row%2)*.5,w=Math.min(.97,10-xx);box(xx,0,w,.28,row*10,9,['#9b9d8d','#767d70','#5b665c']);line([P(xx+.03,.29,row*10+8),P(xx+w-.03,.29,row*10+8)],'#b7b3a0');for(let j=0;j<4;j++){const p=P(xx+.1+rnd()*(w-.2),.3,row*10+2+rnd()*5);rect(p[0],p[1],2+rnd()*3,1,'#919582')}
 if(row===0&&x%3===0){const p=P(xx,.3);rect(p[0],p[1]-3,6,2,'#637c47');rect(p[0]+2,p[1]-5,2,2,'#8c9854')}
}
for(let x=0;x<10;x++)box(x-.025,-.035,.99,.37,40,4,['#b6b29b','#8e9581','#677461']);
for(let y=.4;y<6;y++){for(let row=0;row<3;row++)box(0,y,.28,.97,row*9,8,['#919a80','#7d8970','#67765e']);box(-.04,y,.4,.98,27,4,['#acae92','#8a9578','#6b7d60']);}
for(const [x,y] of [[.7,2],[1,5.7],[8.95,4],[8.5,6.9],[5,.5]])grass(x,y,.8);
}
function bark(x,y,h=40){const p=P(x,y);poly([[p[0]-4,p[1]],[p[0]-3,p[1]-h],[p[0]+3,p[1]-h],[p[0]+4,p[1]],[p[0],p[1]+2]],'#715635',ink);rect(p[0]-2,p[1]-h+2,2,h-2,'#a27e48');for(let j=0;j<5;j++)rect(p[0]+1,p[1]-7-j*6,1,4,'#493f2c')}
function tree(x,y,s=1){const p=P(x,y);shadow(x,y,24*s,9*s);bark(x,y,42*s);c.save();c.translate(...p);c.scale(s,s);
for(let layer=0;layer<4;layer++){const w=26-layer*4,yy=-22-layer*13;poly([[-w,yy],[-w+5,yy-6],[-w+2,yy-6],[-w+10,yy-14],[-w+7,yy-14],[-2,yy-31],[2,yy-31],[w-7,yy-14],[w-10,yy-14],[w-2,yy-6],[w-5,yy-6],[w,yy],[12,yy+4],[-9,yy+3]],'#294b36',ink);poly([[-w+3,yy-1],[-w+11,yy-14],[-1,yy-29],[4,yy-12],[-4,yy-6],[5,yy+1],[-9,yy+2]],'#527442');
 for(let i=0;i<60;i++){const yy2=yy-rnd()*22,spread=(yy2-(yy-30))/30*w;const xx=(rnd()*2-1)*spread;rect(xx,yy2,2+Math.floor(rnd()*3),1,['#83a154','#6b8e4a','#395c38','#42693c'][i%4])}
}c.restore()}
function bush(x,y,s=1){const p=P(x,y);shadow(x,y,18*s,6*s);for(let j=0;j<10;j++){const xx=p[0]+(rnd()-.5)*27*s,yy=p[1]-5*s-rnd()*8*s;ellipse(xx,yy,6*s,5*s,'#304d2f');ellipse(xx-1,yy-2,5*s,3*s,['#617f3e','#789548','#526d36'][j%3]);for(let i=0;i<3;i++)rect(xx-3+rnd()*7,yy-5+rnd()*5,2,1,'#9baa5b');}}
function board(x,y){shadow(x+1.2,y,39,8);const p=P(x,y);c.save();c.translate(...p);c.transform(1,.5,0,1,0,0);
for(const a of [1,66]){rect(a,-66,5,68,ink);rect(a+1,-65,3,66,'#96703f');rect(a+1,-63,1,62,'#c49852');for(let j=0;j<5;j++)rect(a+2,-55+j*10,1,4,'#624c2f')}
rect(-4,-77,80,55,ink);rect(-3,-76,78,53,'#ac8146');rect(-2,-75,76,2,'#dbb56a');rect(1,-71,70,43,'#334a38');rect(3,-69,66,39,'#3d513d');rect(-2,-25,76,2,'#694e2e');
for(const xx of [-1,72])for(const yy of [-73,-26]){rect(xx,yy,2,2,'#ddc888');rect(xx+1,yy+1,1,1,'#6f6445')}
c.fillStyle='#f3dfab';c.font='bold 10px "Microsoft JhengHei"';c.textAlign='center';c.fillText('安全規定區',36,-56);rect(8,-51,56,1,'#98a26d');
c.font='6px "Microsoft JhengHei"';c.textAlign='left';['聽從指示','依序集合','確認裝備'].forEach((t,i)=>{rect(9,-46+i*7,3,3,'#c8b76d');c.fillText(t,16,-43+i*7)});c.restore()}
function table(x,y){shadow(x+1.2,y+.4,40,11);for(const xx of [x+.12,x+2.16])for(const yy of [y+.09,y+.7])box(xx,yy,.13,.13,0,22,wood);box(x-.04,y-.04,2.53,1.01,22,4,['#bd9657','#896238','#5c472f']);for(let j=0;j<5;j++)line([P(x,y+j*.21,27),P(x+2.4,y+j*.21,27)],j%2?'#ddb479':'#956c3c');
for(let j=0;j<16;j++){const xx=x+.1+rnd()*2.2,yy=y+.1+rnd()*.7;line([P(xx,yy,27),P(xx+.15,yy,27)],'#e2bb7877')}
for(const xx of [x+.45,x+1.04]){const p=P(xx,y+.46,27);line([[p[0]-4,p[1]-1],[p[0]-4,p[1]-6],[p[0]-2,p[1]-8],[p[0]+2,p[1]-8],[p[0]+4,p[1]-6],[p[0]+4,p[1]-1]],'#232e27',2);rect(p[0]-6,p[1]-3,4,7,'#34362a');rect(p[0]-5,p[1]-2,2,5,'#deb653');rect(p[0]+3,p[1]-3,4,7,'#292f25');rect(p[0]+4,p[1]-2,2,5,'#bf923b')}
plane(x+1.5,y+.16,.5,.54,27,'#4d503b',ink);plane(x+1.55,y+.2,.4,.45,28,'#e2ddbc');for(let i=0;i<4;i++)line([P(x+1.61,y+.26+i*.08,29),P(x+1.88,y+.26+i*.08,29)],'#8b947b');
box(x+2.03,y+.22,.4,.44,26,9,['#7c8e60','#4b6445','#344b37']);box(x+2,y+.19,.46,.5,35,2,['#97a676','#5e7851','#3e593e']);const p=P(x+2.43,y+.38,30);rect(p[0],p[1],2,3,'#c6bd89');
}
function bench(x,y){shadow(x+.9,y+.3,30,8);for(const xx of [x+.13,x+1.7])box(xx,y+.08,.14,.3,0,10,wood);box(x,y,1.95,.55,10,3,['#b38b4e','#8c6739','#604d30']);line([P(x,y+.27,14),P(x+1.95,y+.27,14)],'#6a512f');line([P(x+.03,y+.03,14),P(x+1.9,y+.03,14)],'#d9b375')}
function fence(x,y,w){for(const z of [8,18])box(x,y,w,.075,z,3,['#b69458','#876638','#614e30']);for(let i=0;i<=3;i++)box(x+w*i/3,y-.025,.13,.13,0,25,['#d0b27b','#a2814c','#6a5837'])}
function planter(x,y){box(x,y,.7,.7,0,10,['#a4a78c','#7f8a6c','#5b7057']);plane(x+.07,y+.07,.56,.56,11,'#4b4b32');for(let i=0;i<7;i++){const p=P(x+.12+rnd()*.47,y+.12+rnd()*.47,12);line([[p[0],p[1]],[p[0]+1,p[1]-8]],'#6c8a44');rect(p[0]-3,p[1]-5,3,1,'#9cac60');rect(p[0]-1,p[1]-10,4,4,i%2?'#dfb75b':'#ca8659');rect(p[0],p[1]-9,2,2,'#f1d686')}}

// Hand-authored 28 × 44 sprites. Side/back silhouettes differ; moving limbs use two key poses.
function person(x,y,dir=7,frame=0,npc=false){const p=P(x,y);c.save();c.translate(p[0]-14,p[1]-43);const R=rect;
 const back=dir>=2&&dir<=4,side=[0,1,4,5].includes(dir),flip=[0,1,2].includes(dir);
 if(flip){c.translate(28,0);c.scale(-1,1)}
 const step=frame===1?2:frame===2?-2:0,co='#667147',li='#8b965c',sh='#424e34',sk='#d3a476',hi='#efc596';
 R(7,30,6,11,ink);R(15,30,6,11,ink);R(8,31,4,8+step,sh);R(16,31,4,8-step,co);R(6,39+step,7,4,ink);R(15,39-step,8,4,ink);R(7,40+step,5,2,'#655139');R(16,40-step,6,2,'#796343');R(7,40+step,4,1,'#9c8357');R(16,40-step,4,1,'#a38b60');
 R(7,19,14,14,ink);R(8,20,12,11,co);R(8,21,4,9,li);R(18,22,2,9,sh);R(8,31,12,2,'#30372a');R(13,31,3,2,'#baa166');R(13,31,2,1,'#e2c58a');
 const ar=step/2;R(4,22+ar,4,11,ink);R(5,23+ar,3,7,co);R(5,23+ar,1,4,li);R(5,30+ar,3,4,sk);R(5,30+ar,2,2,hi);R(20,22-ar,4,11,ink);R(20,23-ar,3,7,sh);R(20,30-ar,3,4,sk);R(20,30-ar,2,2,hi);
 if(back){R(9,20,10,12,'#343c2b');R(10,21,8,9,'#7e8051');R(10,22,7,2,'#a49d68');R(11,26,6,5,'#535f3b');R(12,27,4,1,'#929663');R(8,20,1,11,'#c1b27c');R(19,20,1,11,'#9b9560')}else{R(10,20,7,3,'#b8bc8b');R(13,23,2,7,'#58613e');R(17,26,2,3,'#a8a673');R(14,28,1,1,'#d6bd7f')}
 R(10,17,9,4,ink);R(11,17,7,4,sk);R(7,5,14,13,ink);R(5,8,18,8,ink);R(7,7,14,10,sk);R(8,7,12,8,hi);R(7,13,2,4,sk);R(19,12,3,4,sk);R(10,17,9,2,sk);R(5,12,2,4,sk);R(22,12,2,3,sk);
 // Hair: contiguous dark masses, small highlight clusters and an uneven fringe.
 R(7,3,14,6,ink);R(5,6,18,5,ink);R(9,1,5,5,ink);R(14,2,5,5,ink);R(19,4,4,5,ink);
 R(7,5,14,4,'#795436');R(6,7,16,4,'#795436');R(9,3,5,4,'#956b3e');R(14,4,6,3,'#9f7443');R(8,5,4,2,'#b68a4e');R(7,8,4,4,'#795436');R(11,8,4,2,'#99703e');R(19,8,3,5,'#5d452e');R(6,10,3,4,'#5d452e');
 if(back){R(8,10,13,8,'#795436');R(9,12,10,5,'#6a4c30');R(10,17,7,2,'#3f3828');R(9,10,6,2,'#956b3e');R(18,13,2,3,'#4c3d29');}else{R(side?15:11,12,2,3,'#2d3327');R(19,12,2,3,'#2d3327');R(15,15,2,1,'#bd8a5d');R(14,17,4,1,'#986745');R(9,15,2,1,'#dfad7d');R(11,12,1,1,'#f5dfb4')}
 if(npc){R(6,3,17,6,ink);R(8,1,12,4,ink);R(8,3,13,4,'#6b7b4c');R(9,2,10,2,'#91a064');R(5,8,19,3,'#354b32');R(5,8,17,1,'#9eab6c');R(14,4,3,3,'#dbc47c');R(15,4,1,1,'#f3dea2');R(17,24,6,8,'#263f38');R(18,25,4,6,'#c7c9a2');R(19,26,2,1,'#8b9b7b');}
 c.restore();}

const records=[],chars=[];
function save(name,fn,depth,anchor){c.clearRect(0,0,550,370);seed=42+records.length*193;fn();const data=c.getImageData(0,0,550,370);let l=550,t=370,r=0,b=0;for(let y=0;y<370;y++)for(let x=0;x<550;x++){const i=(y*550+x)*4;if(data.data[i+3]<20){data.data[i+3]=0;continue}if(data.data[i+3]>235)data.data[i+3]=255;l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}c.putImageData(data,0,0);l=Math.max(0,l-1);t=Math.max(0,t-1);r=Math.min(549,r+1);b=Math.min(369,b+1);const crop=createCanvas((r-l+1)*2,(b-t+1)*2),g=crop.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(canvas,l,t,r-l+1,b-t+1,0,0,crop.width,crop.height);const bytes=crop.toBuffer('image/png');fs.writeFileSync(OUT+'/'+name+'.png',bytes);return{name,left:l*2,top:t*2,width:crop.width,height:crop.height,depth,src:'data:image/png;base64,'+bytes.toString('base64'),...(anchor?{anchorX:anchor[0]*2-l*2,anchorY:anchor[1]*2-t*2}:{})}}
records.push(save('ground',ground,-100));
for(const [name,x,y,depth,fn] of [
['tree-left',.6,.7,1.3,()=>tree(.6,.7,.9)],['tree-right',9.35,.65,10,()=>tree(9.35,.65,1.05)],
['board',1.7,1.5,4.5,()=>board(1.7,1.5)],['table',6.8,1.65,10.05,()=>table(6.8,1.65)],['bench',7,3,11.2,()=>bench(7,3)],
['planter-left',1.15,4.55,6.7,()=>planter(1.15,4.55)],['planter-right',9,5.7,15.2,()=>planter(9,5.7)],
['fence-left',1,7.75,9.75,()=>fence(1,7.75,2.2)],['fence-right',7.4,7.75,16.15,()=>fence(7.4,7.75,2)],
['bush-left',.6,6.5,7.1,()=>bush(.6,6.5,1)],['bush-right',8.8,7.3,16.1,()=>bush(8.8,7.3,1.1)],
['instructor',5.45,2.55,8,()=>person(5.45,2.55,7,0,true)]])records.push(save(name,fn,depth));
for(let dir=0;dir<8;dir++)for(let frame=0;frame<3;frame++)chars.push(save('player-'+dir+'-'+frame,()=>person(5,4,dir,frame),0,P(5,4)));
fs.writeFileSync(OUT+'/assets.json',JSON.stringify({records,chars}));
fs.writeFileSync(OUT+'/製作說明.txt','獨立原創像素地磚、石牆、樹木、家具與人物，以 550×370 像素座標繪製，最近鄰放大至 1100×740。人物依八個移動方向選取正面、側面、背面及鏡像姿態，每方向三個影格。HTML 內嵌全部素材，不依賴此資料夾。\n重建：node tmp/build-refined-pixel.cjs，再執行 node tmp/package-refined-pixel.cjs。');
let pack=fs.readFileSync('tmp/package-prerendered.cjs','utf8').replaceAll('demo/預渲染模型風','DEMO/精緻像素風').replaceAll('光影裡的安全庭院','石牆邊的集合時光').replaceAll('預渲染模型風','精緻像素風').replaceAll('內嵌模型素材','內嵌像素素材').replaceAll('TX=45,TY=22.5,OX=514,OY=196','TX=48,TY=24,OX=528,OY=152').replaceAll('#edf0e6','#394631').replaceAll('#d9e2d6','#273b2e');
pack=pack.replace("const canvas=document.getElementById('scene'),c=canvas.getContext('2d');","const canvas=document.getElementById('scene'),c=canvas.getContext('2d');c.imageSmoothingEnabled=false;");
pack=pack.replace("c.drawImage(sprite.image,p[0]-sprite.anchorX,p[1]-sprite.anchorY)","c.drawImage(sprite.image,Math.round((p[0]-sprite.anchorX)/2)*2,Math.round((p[1]-sprite.anchorY)/2)*2)");
// Pixel rendering and a matching dark UI. CSS added after the source template styles.
pack=pack.replace("const begin=source.indexOf",`source=source.replace('</style>','body{background:#202d25;color:#e4d9b6}header p,.eyebrow,footer{color:#a6b390}.chapter{color:#c4ad70}figure{border-radius:6px;border-color:#677453;background:#34432e}canvas{image-rendering:pixelated}.hud,.note{background:#283c30ee;border-color:#71805a;border-radius:3px;color:#eddfb5}.hud p,.note p{color:#bfca9f}kbd,button{background:#3a503a;color:#e6d8ac;border-color:#798664;border-radius:3px}#status{color:#c4cda6}.pad button{background:#304832ed}</style>');\nconst begin=source.indexOf`);
fs.writeFileSync('tmp/package-refined-pixel.cjs',pack);
let test=fs.readFileSync('tmp/check-prerendered.cjs','utf8').replaceAll('預渲染模型風','精緻像素風').replaceAll('預渲染-告示牌驗證','精緻像素-告示牌驗證').replaceAll('model sprites','pixel sprites');
fs.writeFileSync('tmp/check-refined-pixel.cjs',test);
console.log('Generated 14 separate environment assets and 24 directional pixel character frames.');
