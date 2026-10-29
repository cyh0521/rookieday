const fs=require('fs'),vm=require('vm');
const {createCanvas,loadImage}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const root='DEMO/手繪風分檔版',context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(root+'/assets.js','utf8'),context);const assets=context.window.HANDDRAWN_ASSETS;
(async()=>{
const sheet=await loadImage(process.argv[2]);fs.copyFileSync(process.argv[2],root+'/images/characters/anime-source-sheet.png');
const cellW=Math.floor(sheet.width/3),cellH=Math.floor(sheet.height/4);
function extract(row,col,flip,name,height=85){
const cell=createCanvas(cellW,cellH),g=cell.getContext('2d');g.drawImage(sheet,col*cellW,row*cellH,cellW,cellH,0,0,cellW,cellH);
const pixels=g.getImageData(0,0,cellW,cellH).data;let left=cellW,right=0,top=cellH,bottom=0;for(let y=0;y<cellH;y++)for(let x=0;x<cellW;x++)if(pixels[(y*cellW+x)*4+3]>24){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}
if(right<=left||bottom<=top)throw Error('Empty cell '+row+','+col);
let footL=cellW,footR=0;for(let y=Math.max(top,bottom-8);y<=bottom;y++)for(let x=left;x<=right;x++)if(pixels[(y*cellW+x)*4+3]>50){footL=Math.min(footL,x);footR=Math.max(footR,x)}
const foot=(footL+footR)/2;left=Math.max(0,left-4);top=Math.max(0,top-4);right=Math.min(cellW-1,right+4);bottom=Math.min(cellH-1,bottom+4);
const png=createCanvas(right-left+1,bottom-top+1),out=png.getContext('2d');if(flip){out.translate(png.width,0);out.scale(-1,1)}out.drawImage(cell,-left,-top);
const scale=height/png.height;fs.writeFileSync(root+'/images/characters/'+name+'.png',png.toBuffer('image/png'));
return{src:'images/characters/'+name+'.png',width:png.width*scale,height,pixelWidth:png.width,pixelHeight:png.height,anchorX:(flip?png.width-(foot-left):foot-left)*scale,anchorY:height-4*scale};
}
const map=[[0,true],[1,true],[2,true],[2,true],[2,false],[1,false],[0,false],[0,false]];
for(let dir=0;dir<8;dir++)for(let frame=0;frame<3;frame++){const a=assets.chars[dir*3+frame];Object.assign(a,extract(map[dir][0],frame,map[dir][1],a.name))}
const instructor=assets.records.find(a=>a.name==='instructor'),sprite=extract(3,0,false,'instructor-anime',88);Object.assign(instructor,sprite,{left:514+(5.45-2.55)*45-sprite.anchorX,top:196+(5.45+2.55)*22.5-sprite.anchorY});
fs.writeFileSync(root+'/assets.js','// External illustrated anime sprites; all sizes below are logical display pixels.\nwindow.HANDDRAWN_ASSETS = '+JSON.stringify(assets,null,2)+';\n');
fs.appendFileSync(root+'/使用說明.txt','\n動漫角色更新：人物素材由內建 imagegen 製作，原始角色表為 images/characters/anime-source-sheet.png。場景人物高度約 85px，教官約 88px，維持腳底定位；八方向使用正面斜視、側面、背面與鏡像。重新執行舊建置程式會覆寫此更新，需再執行 tmp/import-anime-characters.cjs 並提供原始角色表路徑。\n');
console.log('Imported anime sprites; trainee 85px tall, instructor 88px tall.');
})();
