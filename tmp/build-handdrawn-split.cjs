const fs=require('fs'),vm=require('vm');
const {createCanvas}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const OUT='DEMO/手繪風分檔版';fs.mkdirSync(OUT+'/images/characters',{recursive:true});
const source=fs.readFileSync('DEMO/安全規定區-手繪等角試作.html','utf8');
let art=source.match(/<script>([\s\S]*?)<\/script>/)[1].split('const blocks=')[0];
// Richer emerald foliage, warm sandstone, honey-coloured timber and blue-green shadows.
const colors={'#e8ecdf':'#dcebd9','#dbe4d2':'#c2ddc6','#9eb28b':'#87b16d','#a0b08b':'#83a879','#8a9a74':'#658c69','#7c906d':'#4c765c','#dedbc6':'#f0dfb8','#d8d5bf':'#e5d3aa','#e3dfca':'#f5e6c7','#d3d2bb':'#d8cda9','#b7bea5':'#a3ab87','#f1edda':'#fff3d5','#648563':'#366e57','#8da67b':'#59965b','#a5b98c':'#7fb660','#b3c197':'#a4ca72','#96ae80':'#6ca75d','#88a374':'#4f935b','#9fb68a':'#7fb368','#c2ce9b65':'#d5e89788','#63855e33':'#1a654c44','#b3beaa':'#9eaf9a','#95a791':'#789382','#d4b382':'#d4a568','#b39569':'#b5864d','#958260':'#8e6d43','#e5ce8f':'#f7c85c','#e7a581':'#e88369','#7c9c70':'#62a062','#91a97b':'#83b666','#a5b88a':'#a3ce78','#6c8d65':'#407e56'};
for(const [a,b]of Object.entries(colors))art=art.replaceAll(a,b);
const canvas=createCanvas(2200,1480),ctx=canvas.getContext('2d');ctx.scale(2,2);
const sandbox={document:{getElementById:()=>canvas},console};vm.createContext(sandbox);vm.runInContext(art,sandbox);
const records=[],chars=[];
function exportAsset(name,draw,depth,anchor){ctx.clearRect(0,0,1100,740);draw();const pixels=ctx.getImageData(0,0,2200,1480).data;let l=2200,t=1480,r=0,b=0;for(let y=0;y<1480;y++)for(let x=0;x<2200;x++)if(pixels[(y*2200+x)*4+3]>1){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}l=Math.max(0,l-3);t=Math.max(0,t-3);r=Math.min(2199,r+3);b=Math.min(1479,b+3);const png=createCanvas(r-l+1,b-t+1);png.getContext('2d').drawImage(canvas,-l,-t);const filename=name.startsWith('player-')?'characters/'+name+'.png':name+'.png';fs.writeFileSync(OUT+'/images/'+filename,png.toBuffer('image/png'));return{name,src:'images/'+filename,left:l/2,top:t/2,width:png.width/2,height:png.height/2,pixelWidth:png.width,pixelHeight:png.height,depth,...(anchor?{anchorX:anchor[0]-l/2,anchorY:anchor[1]-t/2}:{})}}
records.push(exportAsset('ground',()=>vm.runInContext('rng=427;ground();wall()',sandbox),-100));
for(const [name,draw,depth]of [
['tree-left','tree(.6,.7,.93)',1.3],['tree-right','tree(9.35,.65,1.06)',10],['board','board(1.7,1.5)',4.5],['table','table(6.8,1.65)',10.05],['bench','bench(7,3)',11.2],['planter-left','planter(1.15,4.55,.65)',6.7],['planter-right','planter(9,5.7,.65)',15.2],['fence-left','fence(1,7.75,2.2)',9.75],['fence-right','fence(7.4,7.75,2)',16.15],['bush-left','bush(.6,6.5,1.1)',7.1],['bush-right','bush(8.8,7.3,1.2)',16.1]])records.push(exportAsset(name,()=>vm.runInContext('rng=912;'+draw,sandbox),depth));

// Original high-resolution illustrated chibi sprites; deliberately different from the pixel set.
function character(x,y,direction=7,frame=0,npc=false){
 const u=514+(x-y)*45,v=196+(x+y)*22.5;
 ctx.save();ctx.translate(u,v);const back=direction>=2&&direction<=4,side=[0,1,4,5].includes(direction),flip=[0,1,2].includes(direction);if(flip)ctx.scale(-1,1);
 const step=frame===1?3:frame===2?-3:0;
 function path(commands,fill,stroke='#3d5b49',w=1.3){ctx.beginPath();commands();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke()}}
 function oval(x,y,rx,ry,fill,stroke=null){path(()=>ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2),fill,stroke,.9)}
 function rr(x,y,w,h,r,fill,stroke='#3d5b49'){path(()=>ctx.roundRect(x,y,w,h,r),fill,stroke,1.1)}
 function line(p,color,width=1){path(()=>{ctx.moveTo(...p[0]);p.slice(1).forEach(a=>ctx.lineTo(...a))},null,color,width)}
 function gradient(a,b,x=-18,y=-90,w=35,h=70){const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,a);g.addColorStop(1,b);return g}
 // Rounded boots and trouser legs with distinct highlights and cuffs.
 for(const [a,s]of [[-13,step],[3,-step]]){rr(a,-35,12,29+s,5,gradient('#77947b','#456956'));rr(a-2,-10+s,17,9,4,'#65523e','#4e513c');line([[a+1,-8+s],[a+8,-8+s]],'#b29b70',1.2);line([[a+2,-3+s],[a+12,-3+s]],'#403f30',1);line([[a+2,-23],[a+8,-22]],'#acbd8f',1);}
 // Uniform has shoulder seams, ribbed collar, pockets, buttons and embroidered patch.
 path(()=>{ctx.moveTo(-14,-71);ctx.quadraticCurveTo(-25,-65,-21,-44);ctx.lineTo(-18,-28);ctx.quadraticCurveTo(0,-23,20,-29);ctx.lineTo(22,-51);ctx.quadraticCurveTo(22,-66,13,-72);ctx.closePath()},gradient(npc?'#93b676':'#b4c580',npc?'#4e8b69':'#648c61'));
 for(const [a,s]of [[-26,step],[18,-step]]){rr(a,-64+s,11,29,5,gradient('#b5c983','#6d9868'));oval(a+5.5,-33+s,5,7,gradient('#ffe0b3','#dda17c'), '#b48661');line([[a+2,-40+s],[a+8,-39+s]],'#476f52',1);}
 rr(-18,-31,36,5,1.5,'#465c3f');rr(-3,-31,8,6,1.5,'#d7b66e','#9d8d51');rr(-1,-30,4,3,.5,'#f1d99d',null);
 if(back){rr(-15,-69,31,35,7,gradient('#9cac79','#537c59'));rr(-12,-67,25,9,3,'#c0cb91');rr(-10,-53,22,16,4,'#6a9064');line([[-9,-49],[11,-49]],'#aac38c',1.2);rr(-1,-49,4,5,1,'#d7c18a');line([[-18,-68],[-18,-35]],'#d4d39b',2.5);line([[18,-68],[18,-35]],'#d4d39b',2.5)}else{
 path(()=>{ctx.moveTo(-10,-72);ctx.lineTo(0,-63);ctx.lineTo(-7,-57);ctx.lineTo(-14,-69)},'#d4d8a4','#799467');path(()=>{ctx.moveTo(10,-72);ctx.lineTo(0,-63);ctx.lineTo(7,-57);ctx.lineTo(14,-69)},'#d4d8a4','#799467');line([[0,-63],[0,-32]],'#4e7650',1.2);
 for(const a of [-15,5]){rr(a,-54,11,14,2,'#7ca368');rr(a-1,-54,13,4,1,'#becd90');oval(a+5,-50,1,1,'#d9c48b')}
 for(const yy of [-57,-45,-36])oval(1,yy,1.1,1.1,'#e6cf92');rr(8,-62,8,3,1,'#efc565',null);line([[9,-61],[14,-61]],'#fff0af',.7);
 }
 rr(-7,-80,15,13,5,gradient('#f8d4a1','#d8a173'), '#b68d64');
 // Big head, soft silhouette, carefully drawn locks, rounded ears and expressive eyes.
 oval(-25,-94,5,8,'#efba8c','#b48461');oval(25,-94,5,8,'#efba8c','#b48461');
 path(()=>{ctx.moveTo(-25,-106);ctx.bezierCurveTo(-27,-136,27,-137,26,-107);ctx.lineTo(24,-89);ctx.bezierCurveTo(20,-67,-19,-67,-24,-89);ctx.closePath()},gradient('#ffe4b7','#edba8e',-25,-130,50,60),'#896c4b',1.4);
 if(back){
 path(()=>{ctx.moveTo(-25,-92);ctx.bezierCurveTo(-37,-132,28,-143,29,-107);ctx.lineTo(23,-84);ctx.quadraticCurveTo(7,-76,-18,-82);ctx.closePath()},gradient('#a36d3b','#62472e',-25,-130,50,50),'#574d34');line([[-15,-114],[-18,-99],[-15,-86]],'#ba8650',1.3);line([[13,-118],[18,-105],[16,-89]],'#bd8951',1.2);
 }else{
 path(()=>{ctx.moveTo(-25,-91);ctx.quadraticCurveTo(-33,-109,-23,-121);ctx.quadraticCurveTo(-20,-130,-7,-128);ctx.lineTo(-2,-134);ctx.lineTo(8,-129);ctx.quadraticCurveTo(30,-128,29,-107);ctx.lineTo(23,-92);ctx.lineTo(19,-110);ctx.quadraticCurveTo(11,-107,9,-116);ctx.quadraticCurveTo(2,-104,-3,-114);ctx.quadraticCurveTo(-11,-105,-17,-110);ctx.closePath()},gradient('#ac793e','#6c4b30',-25,-130,50,40),'#594d33',1.5);
 line([[-19,-117],[-12,-122],[-6,-121]],'#d9a45f',2.2);line([[4,-124],[12,-121],[17,-117]],'#c79650',1.7);
 const eye=side?-2:-10;for(const a of [eye,12]){oval(a,-97,4.2,6,'#354f43');oval(a+.6,-98,2.3,4,'#5e7460');oval(a-1,-100,1.55,1.8,'#fff7da');oval(a+1,-94,1,1,'#e7eaca');line([[a-4,-106],[a+3,-107]],'#7b5938',1.2)}
 oval(-16,-88,5.5,2.6,'#e99e8170');oval(17,-88,5.5,2.6,'#e99e8170');path(()=>{ctx.moveTo(1,-94);ctx.quadraticCurveTo(5,-89,1,-88)},null,'#c39470',1);path(()=>{ctx.moveTo(-5,-82);ctx.quadraticCurveTo(2,-76,9,-83)},null,'#a16d53',1.5);line([[-1,-81],[5,-81]],'#fff3d0',1.3);
 }
 if(npc){
 path(()=>{ctx.moveTo(-26,-117);ctx.quadraticCurveTo(-25,-141,0,-141);ctx.quadraticCurveTo(24,-142,26,-118);ctx.closePath()},gradient('#8fad75','#557d58',-25,-141,50,25),'#46674b');rr(-27,-121,54,8,3,'#84a46b');path(()=>{ctx.moveTo(-26,-113);ctx.quadraticCurveTo(-2,-104,30,-114);ctx.lineTo(25,-118);ctx.quadraticCurveTo(-1,-111,-26,-117);ctx.closePath()},'#537e59','#416347');rr(-4,-132,9,9,2,'#ebce7f','#a48e51');line([[-1,-128],[3,-128]],'#fff1b8',1.5);rr(13,-54,14,24,2,'#496b60');rr(15,-52,10,19,1,'#eae6c4',null);for(let i=0;i<3;i++)line([[17,-47+i*4],[23,-47+i*4]],'#889c80',.7);
 }
 ctx.restore();
}
records.push(exportAsset('instructor',()=>character(5.45,2.55,7,0,true),8));
for(let dir=0;dir<8;dir++)for(let frame=0;frame<3;frame++)chars.push(exportAsset('player-'+dir+'-'+frame,()=>character(5,4,dir,frame),0,[559,398.5]));
// Correct the foot anchor from the same world projection used to draw the character.
for(const a of chars){a.anchorX=559-a.left;a.anchorY=398.5-a.top;}
fs.writeFileSync(OUT+'/assets.js','// Positions and display sizes are logical pixels. PNGs have twice the resolution.\nwindow.HANDDRAWN_ASSETS = '+JSON.stringify({records,chars},null,2)+';\n');
// Reuse the tested 2.5D movement controller, now referencing external PNGs and a classic JS manifest.
const previous=fs.readFileSync('DEMO/安全規定區-預渲染模型風.html','utf8');
let game=previous.match(/<script>([\s\S]*?)<\/script>/)[1];
game=game.replace(/const assets=\{[\s\S]*?\};\s*let ready=false;/,'const assets=window.HANDDRAWN_ASSETS;\nlet ready=false;');
game=game.replaceAll('c.drawImage(ground.image,ground.left,ground.top)','c.drawImage(ground.image,ground.left,ground.top,ground.width,ground.height)').replaceAll('c.drawImage(obj.image,obj.left,obj.top)','c.drawImage(obj.image,obj.left,obj.top,obj.width,obj.height)').replace('p[1]-sprite.anchorY);','p[1]-sprite.anchorY,sprite.width,sprite.height);');
game=game.replace("bg.addColorStop(0,'#edf0e6');bg.addColorStop(1,'#d9e2d6')","bg.addColorStop(0,'#e5efdb');bg.addColorStop(1,'#bfdcc8')");
game=game.replace("ready=true;document.getElementById('status')","const dpr=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||1)));canvas.width=SW*dpr;canvas.height=SH*dpr;c.setTransform(dpr,0,0,dpr,0,0);ready=true;document.getElementById('status')");
game=game.replace("image.onerror=()=>reject(new Error('素材載入失敗'))","image.onerror=()=>reject(new Error('無法載入 '+asset.src))").replace(".catch(()=>{document.getElementById('status').textContent='素材未能載入，請重新開啟此檔案。'})",".catch(error=>{document.getElementById('status').textContent=error.message+'；請確認 images 資料夾與 index.html 一起保留。'})");
fs.writeFileSync(OUT+'/game.js',game);
let html=source.replace(/<script>[\s\S]*?<\/script>/,'<script src="assets.js"></script>\n<script src="game.js"></script>');
const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];
fs.writeFileSync(OUT+'/style.css',css+'\nbody{background:#f5eddb;color:#234f40}.eyebrow,header p{color:#63845f}.chapter{color:#bf914c}figure{border-color:#9dbe94;box-shadow:0 18px 48px #285c3520}.hud{background:#fff9e7ed;border-color:#b5c98f}.hud i{background:#43977b}.hud strong{color:#245e47}.note{background:#fffae8ed;border-color:#c5b17a}button{background:#f7efcf;border-color:#9eb482;color:#325b43}button:hover{background:#e9dfad}kbd{background:#fff8e5}.pad button{background:#fffae8eb}canvas{image-rendering:auto}\n');
html=html.replace(/<style>[\s\S]*?<\/style>/,'<link rel="stylesheet" href="style.css">').replaceAll('樹蔭下的行前說明','綠蔭裡的見習時光').replaceAll('手繪等角試作','手繪風分檔版').replaceAll('手繪等角場景','手繪等角場景 · 分檔版').replace('探索這一小片庭院。</span>','正在載入手繪素材…</span>');
fs.writeFileSync(OUT+'/index.html',html);
fs.writeFileSync(OUT+'/使用說明.txt',`入口：index.html。以 Chrome 或 Edge 開啟；無網路套件、無 fetch、無模組匯入，圖片由相對路徑載入。分享時請複製整個「手繪風分檔版」資料夾。
操作：WASD／方向鍵、點地面自動尋路；手機可使用方向按鈕。走近告示牌顯示提醒。

index.html：介面入口
style.css：版面和配色
game.js：移動、碰撞、排序、圖像載入
assets.js：圖片檔名、位置、邏輯顯示尺寸、人物腳底定位
images/：可獨立替換的透明 PNG；characters/ 為人物方向與行走影格。

PNG 使用顯示尺寸的兩倍解析度。若只更換同尺寸圖片，保留透明畫布與人物腳底位置，再重新整理即可；若圖片被瀏覽器快取，使用 Ctrl+F5。調整尺寸或裁切時，需同步修改 assets.js 中 width、height、anchorX、anchorY；素材長寬和顯示長寬可以不同。
目前八方向使用正面、側面、背面與鏡像姿態，每方向三影格。地面、牆體合併為一張 ground.png，樹木、家具、告示牌、人物各自獨立。
重建素材：在專案根目錄執行 node tmp/build-handdrawn-split.cjs。此指令會覆寫本分檔版，手動修改的 PNG 請先備份。
`);
console.log('Created split hand-drawn scene:',OUT,'; independent PNGs:',records.length+chars.length);
