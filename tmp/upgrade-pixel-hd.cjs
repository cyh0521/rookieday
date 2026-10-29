const fs=require('fs');
const {createCanvas,loadImage}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const dir='DEMO/精緻像素風';
(async()=>{
const assets=JSON.parse(fs.readFileSync(dir+'/assets.json','utf8'));
for(const a of [...assets.records,...assets.chars]){
const image=await loadImage(a.src);const out=createCanvas(a.width*2,a.height*2),g=out.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(image,0,0,out.width,out.height);
if(a.name==='board'){
g.scale(2,2);const px=2*Math.round(264+(1.7-1.5)*24)-a.left,py=2*Math.round(76+(1.7+1.5)*12)-a.top;
g.translate(px,py);g.transform(1,.5,0,1,0,0);g.fillStyle='#e6e1c8';g.fillRect(6,-138,132,78);g.fillStyle='#213e34';g.fillRect(6,-138,132,25);g.fillStyle='#fff5d1';g.font='bold 16px "Microsoft JhengHei"';g.textAlign='center';g.fillText('靶場安全規定',72,-120);g.textAlign='left';g.font='bold 12px "Microsoft JhengHei"';['聽從現場指示','依序集合待命','確認防護裝備'].forEach((t,i)=>{g.fillStyle='#a48b41';g.fillRect(13,-106+i*15,4,7);g.fillStyle='#263e30';g.fillText(t,23,-99+i*15)});
}
const bytes=out.toBuffer('image/png');fs.writeFileSync(dir+'/'+a.name+'.png',bytes);a.pixelWidth=out.width;a.pixelHeight=out.height;a.src='data:image/png;base64,'+bytes.toString('base64');
}
fs.writeFileSync(dir+'/assets.json',JSON.stringify(assets));
let pack=fs.readFileSync('tmp/package-refined-pixel.cjs','utf8');
// Keep logical positions and collision data unchanged when images have more physical pixels.
pack=pack.replaceAll('c.drawImage(ground.image,ground.left,ground.top)','c.drawImage(ground.image,ground.left,ground.top,ground.width,ground.height)').replaceAll('c.drawImage(obj.image,obj.left,obj.top)','c.drawImage(obj.image,obj.left,obj.top,obj.width,obj.height)').replace('Math.round((p[1]-sprite.anchorY)/2)*2);','Math.round((p[1]-sprite.anchorY)/2)*2,sprite.width,sprite.height);');
pack=pack.replace('image-rendering:pixelated','image-rendering:auto');
pack=pack.replace("ready=true;document.getElementById('status')","const resolution=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||1)));canvas.width=SW*resolution;canvas.height=SH*resolution;c.setTransform(resolution,0,0,resolution,0,0);c.imageSmoothingEnabled=false;ready=true;document.getElementById('status')");
fs.writeFileSync('tmp/package-refined-pixel.cjs',pack);
fs.appendFileSync(dir+'/製作說明.txt','\nHD 顯示更新：PNG 實體寬高為原版兩倍，場景邏輯尺寸維持原值；告示文字以兩倍解析度重畫。Canvas 使用 2–3 倍後備畫布，CSS 使用自動取樣以避免非整數縮放造成不均勻像素。原有像素圖案保持原生細節，不代表增加四倍美術內容。重建素材後需重新執行 HD 更新腳本。\n');
console.log('38 PNGs upgraded to 2× dimensions; sign text rerendered; packaging now supports high-DPI output.');
})();
