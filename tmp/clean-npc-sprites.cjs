const fs=require('fs'),vm=require('vm');
const {createCanvas,loadImage,ImageData}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const root='DEMO/手繪風分檔版',env={window:{}};vm.createContext(env);vm.runInContext(fs.readFileSync(root+'/assets.js','utf8'),env);const assets=env.window.HANDDRAWN_ASSETS;
(async()=>{
const im=await loadImage(root+'/images/characters/super-chibi-npc-source.png'),canvas=createCanvas(im.width,im.height),ctx=canvas.getContext('2d');ctx.drawImage(im,0,0);const d=ctx.getImageData(0,0,im.width,im.height).data,w=im.width,h=im.height,visited=new Uint8Array(w*h),queue=new Int32Array(w*h),parts=[];
for(let index=0;index<w*h;index++){if(visited[index]||d[index*4+3]<20)continue;let head=0,tail=1,l=w,r=0,t=h,b=0;queue[0]=index;visited[index]=1;while(head<tail){const at=queue[head++],x=at%w,y=at/w|0;l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);for(const next of [x>0?at-1:-1,x<w-1?at+1:-1,y>0?at-w:-1,y<h-1?at+w:-1])if(next>=0&&!visited[next]&&d[next*4+3]>=20){visited[next]=1;queue[tail++]=next}}
if(tail>5000)parts.push({l,r,t,b,pixels:Int32Array.from(queue.subarray(0,tail))});}
parts.sort((a,b)=>a.l-b.l);if(parts.length!==6)throw Error('Expected six separate complete characters');
const scale=336/Math.max(...parts.map(p=>p.b-p.t+1));
function save(part,name,flip=false){const cut=createCanvas(part.r-part.l+1,part.b-part.t+1),g=cut.getContext('2d'),data=new Uint8ClampedArray(cut.width*cut.height*4);for(const at of part.pixels){const x=at%w-part.l,y=(at/w|0)-part.t,offset=(y*cut.width+x)*4;for(let k=0;k<4;k++)data[offset+k]=d[at*4+k]}g.putImageData(new ImageData(data,cut.width,cut.height),0,0);
const out=createCanvas(320,400),o=out.getContext('2d');if(flip){o.translate(320,0);o.scale(-1,1)}o.drawImage(cut,160-cut.width*scale/2,368-cut.height*scale,cut.width*scale,cut.height*scale);const src='images/characters/npc-clean-'+name+'.png';fs.writeFileSync(root+'/'+src,out.toBuffer('image/png'));return{src,width:80,height:100,pixelWidth:320,pixelHeight:400};}
const frames=parts.map((part,i)=>save(part,i));assets.npcIdle=frames.slice(0,4);assets.npcViews=[frames[0],save(parts[4],'left',true),frames[5],frames[4]];const npc=assets.records.find(a=>a.name==='instructor');npc.src=frames[0].src;
fs.writeFileSync(root+'/assets.js','// NPCs extracted as complete connected characters; no grid-cell fragments.\nwindow.HANDDRAWN_ASSETS = '+JSON.stringify(assets,null,2)+';\n');
console.log('Extracted six whole NPC silhouettes and mirrored side view; removed neighbour fragments and clipping.');
})();
