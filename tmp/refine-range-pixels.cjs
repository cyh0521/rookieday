const fs=require('fs');
const {createCanvas,loadImage}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const dir='DEMO/精緻像素風';
(async()=>{
const assets=JSON.parse(fs.readFileSync(dir+'/assets.json','utf8'));
for(const a of [...assets.records,...assets.chars]){
 const image=await loadImage(dir+'/'+a.name+'.png');const canvas=createCanvas(image.width,image.height),g=canvas.getContext('2d');g.drawImage(image,0,0);
 // Keep transparent edges; remap the old timber tones to military storage finishes.
 if(['table','bench','fence-left','fence-right'].includes(a.name)){
 const pixels=g.getImageData(0,0,canvas.width,canvas.height);for(let i=0;i<pixels.data.length;i+=4){let r=pixels.data[i],b=pixels.data[i+2];if(r>b*1.35&&pixels.data[i+3]>200){pixels.data[i]=Math.round(r*.72);pixels.data[i+1]=Math.round(pixels.data[i+1]*.94);pixels.data[i+2]=Math.round(b*1.18)}}g.putImageData(pixels,0,0);
 }
 if(a.name==='board'){
 const px=2*Math.round(264+(1.7-1.5)*24)-a.left,py=2*Math.round(76+(1.7+1.5)*12)-a.top;
 g.save();g.translate(px,py);g.transform(1,.5,0,1,0,0);
 g.fillStyle='#e6e1c8';g.fillRect(6,-138,132,78);g.fillStyle='#213e34';g.fillRect(6,-138,132,25);
 g.fillStyle='#fff5d1';g.font='bold 16px "Microsoft JhengHei"';g.textAlign='center';g.fillText('靶場安全規定',72,-120);
 g.textAlign='left';g.font='bold 12px "Microsoft JhengHei"';['聽從現場指示','依序集合待命','確認防護裝備'].forEach((t,i)=>{g.fillStyle='#a48b41';g.fillRect(13,-106+i*15,4,7);g.fillStyle='#263e30';g.fillText(t,23,-99+i*15)});
 g.restore();
 }
 if(a.name==='ground'){
 const at=(x,y)=>[528+(x-y)*48-a.left,152+(x+y)*24-a.top];
 let p=at(3.3,6.3);g.save();g.translate(...p);g.transform(1,.5,-1,.5,0,0);g.fillStyle='#e8cd72';g.font='bold 15px "Microsoft JhengHei"';g.fillText('集合待命區',0,0);g.restore();
 // Reflective yellow/black entry markers.
 for(const x of [3.75,7.2]){p=at(x,7.45);g.fillStyle='#252e26';g.fillRect(p[0]-5,p[1]-16,10,18);g.fillStyle='#e1bc4e';g.fillRect(p[0]-4,p[1]-15,8,5);g.fillRect(p[0]-4,p[1]-5,8,4);g.fillStyle='#f0d783';g.fillRect(p[0]-4,p[1]-15,2,15)}
 }
 if(a.name==='table'){
 // A small numbered equipment inspection stencil, on the table front.
 g.save();g.translate(64,59);g.transform(1,.5,0,1,0,0);g.fillStyle='#ede2b5';g.font='bold 9px "Microsoft JhengHei"';g.fillText('裝備檢查',0,0);g.restore();
 }
 const bytes=canvas.toBuffer('image/png');fs.writeFileSync(dir+'/'+a.name+'.png',bytes);a.src='data:image/png;base64,'+bytes.toString('base64');
}
fs.writeFileSync(dir+'/assets.json',JSON.stringify(assets));
fs.appendFileSync(dir+'/製作說明.txt','\n靶場版重繪：高對比告示文字、集合區字樣、反光標柱、軍綠色裝備家具。執行 node tmp/refine-range-pixels.cjs 後，再執行打包腳本。\n');
console.log('Updated all 38 asset files and manifest; readable sign, assembly markings, and military palette.');
})();
