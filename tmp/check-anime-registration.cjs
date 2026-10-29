const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {createCanvas,loadImage}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const root='DEMO/手繪風分檔版',env={window:{}};vm.createContext(env);vm.runInContext(fs.readFileSync(root+'/assets.js','utf8'),env);const a=env.window.HANDDRAWN_ASSETS;
(async()=>{
const preview=createCanvas(800,400),g=preview.getContext('2d');g.fillStyle='#e5efdb';g.fillRect(0,0,800,400);
for(let dir=0;dir<4;dir++){
 const group=a.chars.slice(dir*5,dir*5+5);assert(group.every(x=>x.anchorX===group[0].anchorX&&x.anchorY===group[0].anchorY),'Fixed direction baseline');
 for(let frame=0;frame<5;frame++){
 const sprite=group[frame],im=await loadImage(root+'/'+sprite.src),c=createCanvas(im.width,im.height),ctx=c.getContext('2d');ctx.drawImage(im,0,0);const p=ctx.getImageData(0,0,im.width,im.height).data;let top=im.height,left=im.width,right=0;
 for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++)if(p[(y*im.width+x)*4+3]>30){top=Math.min(top,y);left=Math.min(left,x);right=Math.max(right,x)}
 assert(top>=25&&left>3&&right<im.width-4,'Hair and body have transparent padding');
 let sum=0,n=0;for(let y=top+10;y<top+65;y++){let l=im.width,r=0;for(let x=0;x<im.width;x++)if(p[(y*im.width+x)*4+3]>70){l=Math.min(l,x);r=Math.max(r,x)}if(r>l){sum+=(l+r)/2;n++}}
 assert(Math.abs(sum/n-160)<4,'Head remains centred independently of support foot');
 if(frame===0&&(dir===0||dir===2)){let bottoms=[0,0];for(let y=im.height*.75;y<im.height;y++)for(let x=0;x<im.width;x++)if(p[(Math.floor(y)*im.width+x)*4+3]>70)bottoms[x<160?0:1]=Math.floor(y);assert(Math.abs(bottoms[0]-bottoms[1])<14,'Idle boots share ground level')}
 if(dir===0||dir===2){const row=dir===0?0:1;g.drawImage(im,frame*160+80-sprite.anchorX*2,row*200+192-sprite.anchorY*2,sprite.width*2,sprite.height*2)}
 }
}
fs.writeFileSync('DEMO/手繪風分檔版-行走影格預覽.png',preview.toBuffer('image/png'));
console.log('PASS: all 20 frames have head padding and stable head alignment; fixed per-direction anchors; front/back idle boots grounded.');
})();
