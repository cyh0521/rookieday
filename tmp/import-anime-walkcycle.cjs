const fs=require('fs'),vm=require('vm');
const {createCanvas,loadImage}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const root='DEMO/手繪風分檔版',sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(root+'/assets.js','utf8'),sandbox);const assets=sandbox.window.HANDDRAWN_ASSETS;
(async()=>{
const file=process.argv[2],sheet=await loadImage(file);fs.copyFileSync(file,root+'/images/characters/anime-walkcycle-sheet.png');const cw=Math.floor(sheet.width/4),ch=Math.floor(sheet.height/3),cells=[];
for(let row=0;row<3;row++)for(let col=0;col<4;col++){
 const cell=createCanvas(cw,ch),g=cell.getContext('2d');g.drawImage(sheet,col*cw,row*ch,cw,ch,0,0,cw,ch);const imageData=g.getImageData(0,0,cw,ch),d=imageData.data;
 // The side-view row's bottom gutter contains hair tips from the following row.
 if(row===1)for(let y=Math.floor(ch*.93);y<ch;y++)for(let x=0;x<cw;x++)d[(y*cw+x)*4+3]=0;
 // Remove disconnected fragments from neighbouring rows and small generation specks.
 const visited=new Uint8Array(cw*ch),queue=new Int32Array(cw*ch);let largest=[];
 for(let index=0;index<cw*ch;index++){if(visited[index]||d[index*4+3]<8)continue;let head=0,tail=1;queue[0]=index;visited[index]=1;const component=[];
 while(head<tail){const at=queue[head++];component.push(at);const x=at%cw,y=Math.floor(at/cw);for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]]){const xx=x+dx,yy=y+dy;if(xx<0||xx>=cw||yy<0||yy>=ch)continue;const next=yy*cw+xx;if(!visited[next]&&d[next*4+3]>=8){visited[next]=1;queue[tail++]=next}}}if(component.length>largest.length)largest=component;
 }const keep=new Uint8Array(cw*ch);for(const at of largest)keep[at]=1;for(let at=0;at<cw*ch;at++)if(!keep[at])d[at*4+3]=0;g.putImageData(imageData,0,0);
 let l=cw,t=ch,r=0,b=0;
 for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(d[(y*cw+x)*4+3]>30){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}
 if(r<=l||b<=t)throw Error('Empty sprite');let fl=cw,fr=0;for(let y=b-7;y<=b;y++)for(let x=l;x<=r;x++)if(d[(y*cw+x)*4+3]>70){fl=Math.min(fl,x);fr=Math.max(fr,x)}
 cells.push({cell,l:Math.max(0,l-4),t:Math.max(0,t-4),r:Math.min(cw-1,r+4),b:Math.min(ch-1,b+4),foot:(fl+fr)/2});
}
const scale=85/Math.max(...cells.map(a=>a.b-a.t+1));assets.chars=[];assets.walkFrames=5;assets.directionCount=4;
// Screen-space directions: down=front, left=mirrored side, up=back, right=side.
for(let dir=0;dir<4;dir++)for(let frame=0;frame<5;frame++){
 const row=dir===0?0:dir===2?2:1,flip=dir===1||((dir===0||dir===2)&&frame>=3),col=frame===0?1:frame-1,a=cells[row*4+col];const png=createCanvas(a.r-a.l+1,a.b-a.t+1),g=png.getContext('2d');if(flip){g.translate(png.width,0);g.scale(-1,1)}g.drawImage(a.cell,-a.l,-a.t);const name='walk-'+dir+'-'+frame,src='images/characters/'+name+'.png';fs.writeFileSync(root+'/'+src,png.toBuffer('image/png'));
 assets.chars.push({name,src,width:png.width*scale,height:png.height*scale,pixelWidth:png.width,pixelHeight:png.height,anchorX:(flip?png.width-(a.foot-a.l):a.foot-a.l)*scale,anchorY:(png.height-4)*scale});
}
fs.writeFileSync(root+'/assets.js','// Four screen-space views; 0 idle + 4 alternating walk poses per direction.\nwindow.HANDDRAWN_ASSETS = '+JSON.stringify(assets,null,2)+';\n');
let game=fs.readFileSync(root+'/game.js','utf8');
game=game.replaceAll('dir:7','dir:0');
game=game.replace('const frame=player.moving?1+(Math.floor(player.step/Math.PI)%2):0;const sprite=assets.chars[player.dir*3+frame]','const frame=player.moving?1+(Math.floor(player.step*.8)%4):0;const sprite=assets.chars[player.dir*assets.walkFrames+frame]');
game=game.replace('player.dir=(Math.round(Math.atan2(-vx,vy)/(Math.PI/4))+8)%8','const sx=(player.x-oldx)-(player.y-oldy),sy=((player.x-oldx)+(player.y-oldy))*.5;player.dir=Math.abs(sx)>Math.abs(sy)*1.25?(sx<0?1:3):(sy<0?2:0)');
// Reset must also restore front-facing sprite after changing the direction indexing.
game=game.replace("face:'front',step:0,moving:false","face:'front',dir:0,step:0,moving:false");
fs.writeFileSync(root+'/game.js',game);
fs.appendFileSync(root+'/使用說明.txt','\n行走修正：方向依畫面座標決定。向下完全正面、向上完全背面、向左與向右為側面；斜向移動選取主要方向。每方向有四個行走影格，約每秒八影格，左右腳交替。assets.js 中 walkFrames=5（含停步影格）、directionCount=4。\n');
fs.writeFileSync(root+'/images/characters/行走影格生成說明.txt','內建 image_gen 依現有動漫角色表製作新的透明行走角色表。提示要求三列四欄：完全正面、完整側面、完全背面；每列為左腳接地、交替通過、右腳接地、反向通過四個姿勢。保留棕髮、琥珀色眼睛、軍綠制服與背包。原圖：anime-walkcycle-sheet.png。匯入：node tmp/import-anime-walkcycle.cjs <原圖路徑>。');
console.log('Imported four real walk poses per direction; screen up/back and down/front; 8 fps cadence.');
})();
