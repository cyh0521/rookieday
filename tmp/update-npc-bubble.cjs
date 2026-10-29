const fs=require('fs');
const root='DEMO/手繪風分檔版';let game=fs.readFileSync(root+'/game.js','utf8');
const start=game.indexOf('function drawNPCHalo('),end=game.indexOf('function drawNPC(',start);
if(start<0||end<0)throw Error('Expected NPC halo function');
game=game.slice(0,start)+`function npcDotOffset(index,time){const phase=((time*1.1-index*.16)%1+1)%1;return phase<.4?-3*Math.sin(phase/.4*Math.PI):0;}
function drawNPCBubble(){const npc=assets.records.find(a=>a.name==='instructor');const x=npc.left+npc.anchorX,y=npc.top+npc.headTop-11;c.save();
c.fillStyle='#fff9e9';c.strokeStyle='#64775b';c.lineWidth=1.2;c.beginPath();c.roundRect(x-19,y-26,38,25,8);c.fill();c.stroke();
c.beginPath();c.moveTo(x-4,y-1);c.lineTo(x,y+5);c.lineTo(x+5,y-1);c.fill();c.stroke();
c.fillStyle='#fff9e9';c.fillRect(x-3,y-3,7,3);
for(let i=0;i<3;i++){c.beginPath();c.ellipse(x+(i-1)*8,y-13+npcDotOffset(i,sceneTime),2,2,0,0,Math.PI*2);c.fillStyle='#4c6956';c.fill();}c.restore();}
`+game.slice(end);
game=game.replace('drawNPCHalo(obj);drawNPC(obj)','drawNPC(obj)');
game=game.replace("c.strokeStyle='#7fb9ab';c.lineWidth=2;c.beginPath();c.ellipse(...p,17,7,0,0,Math.PI*2);c.stroke();",'');
const suffix='sprite.width,sprite.height);}}';if(!game.includes(suffix))throw Error('Draw ending not found');game=game.replace(suffix,'sprite.width,sprite.height);}drawNPCBubble();}');
fs.writeFileSync(root+'/game.js',game);
fs.appendFileSync(root+'/使用說明.txt','\nNPC 標示更新：頭上對話氣泡內的三個圓點依序跳動。學生和 NPC 腳下皆無光圈；地面點選目的地標記保留，NPC 的擺頭／眨眼待機動作保留。\n');
console.log('Replaced NPC halo with animated ellipsis bubble; removed player ring.');
