// Higher-detail original character sprites. All frames share the same foot anchor.
const fs=require('fs');
const {createCanvas}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const dir='DEMO/精緻像素風',assets=JSON.parse(fs.readFileSync(dir+'/assets.json','utf8'));
function drawCharacter(direction,frame,instructor=false){
 const small=createCanvas(48,78),c=small.getContext('2d');c.imageSmoothingEnabled=false;
 const R=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const ink='#202e28',skin='#d6a477',lightSkin='#f1c99b',olive='#687d50',highlight='#93a36a',shade='#40583c';
 const back=direction>=2&&direction<=4,side=[0,1,4,5].includes(direction),flip=[0,1,2].includes(direction);
 if(flip){c.translate(48,0);c.scale(-1,1)}
 const step=frame===1?2:frame===2?-2:0;
 // Legs, knee folds, soles and boot uppers.
 for(const [x,s]of [[15,step],[26,-step]]){
 R(x,55,9,17+s,ink);R(x+1,56,7,12+s,shade);R(x+2,56,4,7,olive);R(x+1,63,5,2,'#829260');R(x+2,67+s,4,3,'#344b36');
 R(x-2,70+s,12,6,ink);R(x-1,70+s,10,4,'#665b43');R(x,70+s,7,1,'#a38f65');R(x-1,74+s,10,1,'#3c4030');R(x+2,72+s,4,1,'#8a7954');}
 // Body silhouette, shoulder shaping and uniform panels.
 R(13,31,24,25,ink);R(11,34,28,18,ink);R(14,32,21,21,olive);R(14,33,6,18,highlight);R(32,35,3,18,shade);
 const swing=step;for(const [x,s,col]of [[7,swing,olive],[36,-swing,shade]]){R(x,35+s,7,19,ink);R(x+1,36+s,5,13,col);R(x+1,38+s,2,7,highlight);R(x+1,49+s,5,7,skin);R(x+1,50+s,3,4,lightSkin);R(x+2,55+s,3,1,'#a47b5c');}
 R(14,53,21,4,ink);R(23,53,5,4,'#b9a05a');R(24,54,3,2,'#ead29b');R(16,53,3,1,'#a0a97b');
 if(back){
 R(16,33,17,19,'#2e4433');R(18,34,13,17,'#7a8b5b');R(19,35,11,4,'#a2ac78');R(20,41,10,9,'#526d44');R(20,43,9,2,'#7f9360');R(23,44,3,3,'#b4ac77');R(15,33,2,19,'#c1b684');R(33,33,2,19,'#9eaa77');
 }else{
 R(20,31,11,5,'#b5bd8b');R(23,35,3,17,'#4b6342');R(16,40,6,8,'#3f593d');R(17,41,5,5,'#94a36b');R(17,40,5,2,'#b5bb83');R(28,40,6,8,'#425e40');R(29,41,4,5,'#82955e');R(28,40,6,2,'#a7b57a');R(25,42,1,1,'#d5c288');R(25,48,1,1,'#d5c288');R(30,35,4,2,'#d8bb70');R(31,35,2,1,'#f3dc96');
 }
 // Neck and a wider face with clear eyes, cheeks, nose and mouth.
 R(20,26,11,7,ink);R(21,26,9,7,skin);R(22,27,7,3,lightSkin);
 R(13,8,23,19,ink);R(11,11,27,13,ink);R(14,9,21,18,skin);R(15,10,18,14,lightSkin);R(15,24,18,3,skin);R(18,27,12,2,'#a77d58');R(10,17,4,8,skin);R(11,18,2,4,lightSkin);R(36,17,4,8,skin);R(37,18,2,4,lightSkin);
 // Hair locks and highlights form connected clusters, not random noise.
 R(14,5,20,8,ink);R(11,9,27,8,ink);R(17,3,7,5,ink);R(24,4,8,5,ink);R(33,7,5,6,ink);
 R(14,7,20,6,'#775236');R(12,10,24,6,'#775236');R(17,5,6,5,'#a07443');R(24,6,7,4,'#996b3e');R(16,8,9,2,'#bc9054');R(13,12,5,7,'#654a31');R(18,12,5,4,'#89613a');R(23,12,5,2,'#b38548');R(33,11,3,9,'#4d3f2d');
 if(back){R(14,15,21,12,'#775236');R(16,18,17,9,'#684b31');R(18,25,13,3,'#473d2b');R(15,16,10,3,'#986b3e');R(32,18,2,6,'#493e2b');}
 else{
 const eye=side?23:19;R(eye,17,3,5,ink);R(eye,17,1,2,'#fff0c9');R(31,17,3,5,ink);R(31,17,1,2,'#fff0c9');R(eye-1,15,4,1,'#735136');R(30,15,4,1,'#735136');R(26,21,2,2,'#be8c62');R(27,22,2,1,'#f8d3a4');R(17,23,3,1,'#d8a080');R(33,23,2,1,'#d8a080');R(24,26,6,1,'#8e6549');R(26,27,3,1,'#e7b485');
 }
 if(instructor){
 R(12,5,25,9,ink);R(16,2,17,7,ink);R(14,6,21,7,olive);R(17,3,15,5,highlight);R(14,9,21,3,'#516e46');R(11,13,29,4,ink);R(12,13,26,2,'#a4b175');R(16,16,20,1,'#43613e');R(24,7,5,5,'#d5bb71');R(25,7,3,2,'#f2dfa5');
 R(31,43,9,13,ink);R(32,44,7,11,'#d4d2ab');R(33,46,5,1,'#768c73');R(33,49,5,1,'#768c73');R(33,52,4,1,'#768c73');
 }
 const out=createCanvas(192,312),g=out.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(small,0,0,192,312);return out;
}
for(let dirn=0;dirn<8;dirn++)for(let frame=0;frame<3;frame++){
 const a=assets.chars[dirn*3+frame],image=drawCharacter(dirn,frame),bytes=image.toBuffer('image/png');Object.assign(a,{width:96,height:156,pixelWidth:192,pixelHeight:312,anchorX:48,anchorY:152,src:'data:image/png;base64,'+bytes.toString('base64')});fs.writeFileSync(dir+'/'+a.name+'.png',bytes);
}
const npc=assets.records.find(a=>a.name==='instructor'),npcImage=drawCharacter(7,0,true),bytes=npcImage.toBuffer('image/png');Object.assign(npc,{left:528+(5.45-2.55)*48-48,top:152+(5.45+2.55)*24-152,width:96,height:156,pixelWidth:192,pixelHeight:312,src:'data:image/png;base64,'+bytes.toString('base64')});fs.writeFileSync(dir+'/instructor.png',bytes);
fs.writeFileSync(dir+'/assets.json',JSON.stringify(assets));
const preview=createCanvas(640,360),g=preview.getContext('2d');g.fillStyle='#304133';g.fillRect(0,0,640,360);g.imageSmoothingEnabled=false;for(let i=0;i<3;i++){g.drawImage(drawCharacter([7,0,3][i],0),25+i*150,20);};g.drawImage(npcImage,455,20);fs.writeFileSync('DEMO/精緻像素風-人物細節.png',preview.toBuffer('image/png'));
fs.appendFileSync(dir+'/製作說明.txt','\n人物重繪：原生像素網格提升至 48×78，顯示 96×156，PNG 為 192×312。新增五官、制服口袋、腰帶、背包、鞋靴細節；八方向與三影格共用腳底定位。重建人物：node tmp/redraw-pixel-characters.cjs，之後執行打包腳本。\n');
console.log('Redrew 24 walking frames and instructor: 192×312 PNGs, 96×156 logical display, shared foot anchor.');
