const fs=require('fs');
let source=fs.readFileSync('tmp/import-campus-characters.generated.cjs','utf8');source=source.slice(0,source.indexOf('(async()=>{'));
source+=`(async()=>{
const front=await strip(process.argv[2]),side=await strip(process.argv[3]),back=await strip(process.argv[4]);register(0,front);register(3,side);register(2,back);
const left=side.map(a=>{const png=createCanvas(a.canvas.width,a.canvas.height),g=png.getContext('2d');g.translate(png.width,0);g.scale(-1,1);g.drawImage(a.canvas,0,0);return analyse(png)});register(1,left);
const im=await loadImage(process.argv[5]),cw=Math.floor(im.width/6),parts=[];for(let i=0;i<6;i++){const png=createCanvas(cw,im.height);png.getContext('2d').drawImage(im,i*cw,0,cw,im.height,0,0,cw,im.height);parts.push(analyse(png))}
const scale=Math.min(344/Math.max(...parts.map(a=>a.b-a.t+1)),280/Math.max(...parts.map(a=>a.r-a.l+1)));const frames=[];
function make(a,index,mirror=false){const out=createCanvas(320,400),g=out.getContext('2d');if(mirror){g.translate(320,0);g.scale(-1,1)}g.drawImage(a.canvas,160-a.headX*scale,368-a.b*scale,a.canvas.width*scale,a.canvas.height*scale);const src='images/characters/super-chibi-npc-'+index+'.png';fs.writeFileSync(root+'/'+src,out.toBuffer('image/png'));return{src,width:80,height:100,pixelWidth:320,pixelHeight:400}}
for(let i=0;i<6;i++)frames.push(make(parts[i],i));const leftNPC=make(parts[4],'left',true);
assets.npcIdle=frames.slice(0,4);assets.npcViews=[frames[0],leftNPC,frames[5],frames[4]];
const npc=assets.records.find(a=>a.name==='instructor');Object.assign(npc,{src:frames[0].src,width:80,height:100,pixelWidth:320,pixelHeight:400,anchorX:40,anchorY:92,headTop:6,left:514+(npc.worldX-npc.worldY)*45-40,top:196+(npc.worldX+npc.worldY)*22.5-92});
assets.characterStyle='約兩頭身大頭短身 Q 版，高中運動服男學生與女性國軍教官';
fs.writeFileSync(root+'/assets.js','// Super-chibi four-direction characters, stable anchors and external PNG files.\\nwindow.HANDDRAWN_ASSETS = '+JSON.stringify(assets,null,2)+';\\n');
for(const [i,name]of [[2,'super-chibi-front-source.png'],[3,'super-chibi-side-source.png'],[4,'super-chibi-back-source.png'],[5,'super-chibi-npc-source.png']])fs.copyFileSync(process.argv[i],root+'/images/characters/'+name);
let html=fs.readFileSync(root+'/index.html','utf8');html=html.replace('src="images/characters/npc-front-idle-0.png"','src="'+frames[0].src+'"');fs.writeFileSync(root+'/index.html',html);
console.log('Imported two-head-tall students, front/side/back instructor and idle frames.');
})();`;
fs.writeFileSync('tmp/import-super-chibi.generated.cjs',source);
