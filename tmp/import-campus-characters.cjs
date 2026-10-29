// Import the three one-row strips plus one female NPC; retain fixed registration and grounded idle poses.
const fs=require('fs');
let original=fs.readFileSync('tmp/fix-anime-registration.cjs','utf8');
original=original.slice(0,original.indexOf('(async()=>{'));
original=original.replace("'registered-'+dir+'-'+frame","'campus-'+dir+'-'+frame");
original+=`(async()=>{
const front=await strip(process.argv[2]),side=await strip(process.argv[3]),back=await strip(process.argv[4]);
register(0,front);register(2,back);register(3,side);
const left=side.map(a=>{const png=createCanvas(a.canvas.width,a.canvas.height),g=png.getContext('2d');g.translate(png.width,0);g.scale(-1,1);g.drawImage(a.canvas,0,0);return analyse(png)});register(1,left);
const female=await fromPNG(process.argv[5]);const npcPNG=createCanvas(320,400),g=npcPNG.getContext('2d'),scale=Math.min(352/(female.b-female.t+1),280/(female.r-female.l+1));g.drawImage(female.canvas,160-female.headX*scale,20-female.t*scale,female.canvas.width*scale,female.canvas.height*scale);const npc=assets.records.find(a=>a.name==='instructor'),npcX=6.15,npcY=3.15,baseline=(20+(female.b-female.t+1)*scale)/4;
fs.writeFileSync(root+'/images/characters/female-taiwan-instructor.png',npcPNG.toBuffer('image/png'));
Object.assign(npc,{src:'images/characters/female-taiwan-instructor.png',width:80,height:100,pixelWidth:320,pixelHeight:400,anchorX:40,anchorY:baseline,left:514+(npcX-npcY)*45-40,top:196+(npcX+npcY)*22.5-baseline,depth:npcX+npcY,worldX:npcX,worldY:npcY,label:'靶場教官',role:'NPC',headTop:5});
assets.characterStyle='附圖簡約Q版；男高中生運動服；女性國軍數位迷彩教官';
fs.writeFileSync(root+'/assets.js','// Independent campus student and instructor sprites. Fixed registration in every direction.\\nwindow.HANDDRAWN_ASSETS = '+JSON.stringify(assets,null,2)+';\\n');
for(const [i,name]of [[2,'campus-front-source.png'],[3,'campus-side-source.png'],[4,'campus-back-source.png'],[5,'female-instructor-source.png']])fs.copyFileSync(process.argv[i],root+'/images/characters/'+name);
let game=fs.readFileSync(root+'/game.js','utf8');game=game.replace('{x:5.2,y:2.3,w:.55,d:.55}','{x:5.90,y:2.90,w:.55,d:.55}');
const marker=\`\nfunction drawNPCMarker(){const npc=assets.records.find(a=>a.name==='instructor');const x=npc.left+npc.anchorX,y=npc.top+npc.headTop; c.save();c.textAlign='center';c.lineWidth=1.5;\n c.beginPath();c.roundRect(x-12,y-62,24,26,6);c.fillStyle='#f5d574';c.fill();c.strokeStyle='#937339';c.stroke();c.fillStyle='#514b2c';c.font='bold 22px "Microsoft JhengHei"';c.fillText('!',x,y-42);\n c.beginPath();c.moveTo(x-4,y-36);c.lineTo(x+4,y-36);c.lineTo(x,y-31);c.closePath();c.fillStyle='#f5d574';c.fill();\n c.beginPath();c.roundRect(x-55,y-27,110,21,5);c.fillStyle='#244a3fed';c.fill();c.strokeStyle='#e6d29a';c.lineWidth=1;c.stroke();c.font='bold 11px "Microsoft JhengHei"';c.fillStyle='#f7df9e';c.fillText('NPC · '+npc.label,x,y-12);c.restore();}\n\`;
if(!game.includes('function drawNPCMarker')){game=game.replace('function draw(){',marker+'function draw(){');game=game.replace('sprite.width,sprite.height);}}','sprite.width,sprite.height);}drawNPCMarker();}');}
fs.writeFileSync(root+'/game.js',game);
fs.appendFileSync(root+'/使用說明.txt','\\n角色更新：依使用者附圖，改為簡潔豆豆眼 Q 版。主角為無特定校名的白／深藍高中運動服男學生；教官為穿軍綠數位迷彩的女性。NPC 頭上由程式繪製驚嘆號及「NPC · 靶場教官」標籤，位置與碰撞同步移動。素材由內建 imagegen 製作，完整提示詞在 images/characters/簡約Q版角色生成提示詞.txt。\\n');
console.log('Imported student tracksuit walk cycles, female digital-camouflage NPC, and RPG marker.');
})();`;
fs.writeFileSync('tmp/import-campus-characters.generated.cjs',original);
console.log('Campus sprite import script prepared.');
