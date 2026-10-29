// Offline orthographic triangle renderer. Builds real 3D meshes, then exports PNG sprites.
const fs=require('fs');
const {createCanvas,ImageData}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const OUT='demo/預渲染模型風';fs.mkdirSync(OUT,{recursive:true});
const width=1100,height=740,scale=45,origin=[514,196];
const project=p=>[origin[0]+(p[0]-p[1])*scale,origin[1]+(p[0]+p[1])*22.5-p[2]*55];
const normalize=p=>{const l=Math.hypot(...p);return p.map(x=>x/l)};
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const light=normalize([-3,-4,8]),cam=normalize([1,1,.82]);
const rgb=h=>h.match(/\w\w/g).map(x=>parseInt(x,16));
let mesh=[];
function tri(a,b,c,na,nb,nc,color){mesh.push({p:[a,b,c],n:[na,nb,nc],color:rgb(color)});}
function sphere(center,r,color,seg=22,rings=14){
 const v=(i,j)=>{const a=i/seg*Math.PI*2,b=j/rings*Math.PI;const u=[Math.sin(b)*Math.cos(a),Math.sin(b)*Math.sin(a),Math.cos(b)];return{p:u.map((x,k)=>center[k]+x*r[k]),n:normalize(u.map((x,k)=>x/r[k]))}};
 for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){const a=v(i,j),b=v(i+1,j),c=v(i+1,j+1),d=v(i,j+1);tri(a.p,b.p,c.p,a.n,b.n,c.n,color);tri(a.p,c.p,d.p,a.n,c.n,d.n,color)}
}
function box(center,size,color,r=.04){
 const h=size.map(x=>x/2);r=Math.min(r,...h);const inner=h.map(x=>x-r);
 // Sample more densely at bevels; the flat faces remain flat.
 const steps=h.map((hh,k)=>[-hh,-hh+r*.12,-hh+r*.42,-hh+r*.8,-inner[k],0,inner[k],hh-r*.8,hh-r*.42,hh-r*.12,hh].filter((x,i,a)=>i===0||x>a[i-1]+.00001));
 for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){const u=(axis+1)%3,v=(axis+2)%3;const get=(i,j)=>{let q=[0,0,0];q[axis]=h[axis]*sign;q[u]=steps[u][i];q[v]=steps[v][j];const base=q.map((x,k)=>Math.max(-inner[k],Math.min(inner[k],x)));const n=normalize(q.map((x,k)=>x-base[k]));return{p:base.map((x,k)=>center[k]+x+n[k]*r),n}};for(let i=0;i<steps[u].length-1;i++)for(let j=0;j<steps[v].length-1;j++){const a=get(i,j),b=get(i+1,j),c=get(i+1,j+1),d=get(i,j+1);tri(a.p,b.p,c.p,a.n,b.n,c.n,color);tri(a.p,c.p,d.p,a.n,c.n,d.n,color)}}
}
function rod(a,b,r,color){const d=b.map((x,i)=>x-a[i]),dir=normalize(d),u=normalize(cross(dir,Math.abs(dir[2])>.9?[1,0,0]:[0,0,1])),v=cross(dir,u);const at=(p,t)=>p.map((x,i)=>x+r*(Math.cos(t)*u[i]+Math.sin(t)*v[i]));for(let i=0;i<16;i++){const t=i/16*Math.PI*2,s=(i+1)/16*Math.PI*2,n=normalize(at([0,0,0],t)),nn=normalize(at([0,0,0],s));tri(at(a,t),at(b,t),at(b,s),n,n,nn,color);tri(at(a,t),at(b,s),at(a,s),n,nn,nn,color)}sphere(a,[r,r,r],color,12,8);sphere(b,[r,r,r],color,12,8)}
let shadowDepth;
const LU=normalize([light[1],-light[0],0]),LV=cross(light,LU),SM=1024;
function lp(p){return[512+dot(p,LU)*65,700-dot(p,LV)*65,dot(p,light)]}
function shadowMap(all){const z=new Float32Array(SM*SM).fill(-1e10);for(const t of all)raster(t.p.map(lp),SM,SM,(i,a,b,d)=>{z[i]=Math.max(z[i],a*t._z0+b*t._z1+d*t._z2)},t);return z}
function raster(v,w,h,pixel,t){
 const [a,b,c]=v;const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<1e-7)return;
 if(t){t._z0=a[2];t._z1=b[2];t._z2=c[2]}
 const minx=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),maxx=Math.min(w-1,Math.ceil(Math.max(a[0],b[0],c[0]))),miny=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),maxy=Math.min(h-1,Math.ceil(Math.max(a[1],b[1],c[1])));
 for(let y=miny;y<=maxy;y++)for(let x=minx;x<=maxx;x++){const f=((b[1]-c[1])*(x+.5-c[0])+(c[0]-b[0])*(y+.5-c[1]))/den,g=((c[1]-a[1])*(x+.5-c[0])+(a[0]-c[0])*(y+.5-c[1]))/den,k=1-f-g;if(f>=-.001&&g>=-.001&&k>=-.001)pixel(y*w+x,f,g,k,x,y)}
}
function render(tris,useShadow=true){const rw=width*2,rh=height*2;const data=new Uint8ClampedArray(rw*rh*4),depth=new Float32Array(rw*rh).fill(-1e9);
 for(const t of tris){const depths=t.p.map(p=>dot(p,cam));const proj=t.p.map(p=>project(p).map(x=>x*2));raster(proj,rw,rh,(i,a,b,d)=>{const z=a*depths[0]+b*depths[1]+d*depths[2];if(z<depth[i])return;depth[i]=z;let n=[0,1,2].map(k=>a*t.n[0][k]+b*t.n[1][k]+d*t.n[2][k]);n=normalize(n);let shade=1;
 if(useShadow&&shadowDepth){const p=[0,1,2].map(k=>a*t.p[0][k]+b*t.p[1][k]+d*t.p[2][k]);const q=lp(p);let lit=0,count=0;for(const dx of [-2,0,2])for(const dy of [-2,0,2]){const xx=Math.round(q[0])+dx,yy=Math.round(q[1])+dy;if(xx>=0&&xx<SM&&yy>=0&&yy<SM){lit+=q[2]+.035>=shadowDepth[yy*SM+xx]?1:0;count++}}shade=count?lit/count:1;}
 const nd=Math.max(0,dot(n,light)),spec=Math.pow(Math.max(0,dot(n,normalize(light.map((x,k)=>x+cam[k])))),35)*.12*shade;const ambient=.72+.10*Math.max(0,n[2]);let f=ambient+nd*.28*shade;for(let k=0;k<3;k++)data[i*4+k]=Math.min(255,t.color[k]*f+spec*255+(k===2?3:0));data[i*4+3]=255;
 });}
 const raw=createCanvas(rw,rh);raw.getContext('2d').putImageData(new ImageData(data,rw,rh),0,0);const c=createCanvas(width,height);c.getContext('2d').drawImage(raw,0,0,width,height);return c;
}
function capture(name,fn,depth){mesh=[];fn();return{name,tris:mesh,depth}}
const assets=[];
assets.push(capture('ground',()=>{
box([5,4,-.22],[10.4,8.4,.42],'9dada0',.13);
for(let x=0;x<10;x++)for(let y=0;y<8;y++){const paved=(x>=1&&x<9&&y>=1&&y<7)||(x>=4&&x<=6&&y===7);box([x+.5,y+.5,.005],[.975,.975,.1],paved?['d6d9ce','dcded3','cdd4c9'][(x*7+y*3)%3]:'99ae88',.035)}
for(const [x,y,w,d] of [[2.8,3.8,4.6,.04],[2.8,6.6,4.6,.04],[2.8,3.8,.04,2.8],[7.4,3.8,.04,2.85]])box([x+w/2,y+d/2,.065],[w,d,.018],'cbb371',.006);
for(let x=0;x<10;x++)for(let z=0;z<3;z++)box([x+.5,.05,.22+z*.25],[.97,.3,.23],['adb8ad','b5beb2','a5b2a5'][(x+z)%3],.025);
for(let x=0;x<10;x++)box([x+.5,.05,.9],[.99,.42,.12],'d4d4bf',.025);
for(let y=1;y<6;y++){box([.05,y,.27],[.3,.96,.55],'b3beac',.04);box([.05,y,.59],[.42,.98,.1],'d4d4bf',.025)}
},-100));
function tree(x,y,s=1){rod([x,y,0],[x,y,s*1.5],.11*s,'957554');rod([x,y,.8*s],[x-.35*s,y,1.7*s],.065*s,'957554');for(const [dx,dy,dz,r] of [[-.3,0,1.7,.48],[.35,.1,1.8,.48],[0,-.28,2.1,.47],[0,.3,2.05,.51],[.1,0,2.4,.4]])sphere([x+dx*s,y+dy*s,dz*s],[r*s,r*s,r*s*.9],['789873','86a477','97b081'][Math.round(dz*10)%3],24,16)}
assets.push(capture('tree-left',()=>tree(.6,.7,.95),1.3));assets.push(capture('tree-right',()=>tree(9.35,.65,1.1),10));
assets.push(capture('board',()=>{for(const x of [1.85,4.35])box([x,1.5,.85],[.13,.13,1.7],'a78a60');box([3.1,1.5,1.7],[2.95,.22,1.35],'b5986b',.075);box([3.1,1.63,1.7],[2.73,.055,1.13],'e9e4ca',.035);},4.5));
assets.push(capture('table',()=>{for(const x of [6.95,8.95])for(const y of [1.8,2.4])box([x,y,.28],[.12,.12,.56],'8c8c71',.025);box([8.025,2.125,.66],[2.55,1.05,.16],'bd9f75',.07);for(let i=0;i<4;i++)box([8.025,1.73+i*.26,.746],[2.4,.014,.006],'a48b65',.002);
for(const x of [7.25,7.85]){for(let i=0;i<12;i++){const a=i/12*Math.PI,b=(i+1)/12*Math.PI;rod([x+Math.cos(a)*.16,2.13,.88+Math.sin(a)*.16],[x+Math.cos(b)*.16,2.13,.88+Math.sin(b)*.16],.025,'384c48')}for(const dx of [-.16,.16])box([x+dx,2.13,.85],[.09,.16,.22],'d3b46f',.04)}box([8.5,2,.765],[.45,.55,.035],'f0ecd5',.015);for(let i=0;i<4;i++)box([8.5,1.84+i*.08,.785],[.3,.01,.004],'8d9b90',.002);box([8.95,2.25,.88],[.4,.4,.25],'6c8f7c',.04);box([8.95,2.25,1.02],[.43,.43,.055],'8baa92',.02);
},10.05));
assets.push(capture('bench',()=>{for(const x of [7.15,8.75])box([x,3.25,.15],[.15,.35,.3],'80846d',.02);box([7.97,3.27,.35],[2.05,.6,.12],'bb9e73',.04);},11.2));
function planter(x,y){box([x+.33,y+.33,.17],[.7,.7,.34],'c2c2ae',.055);box([x+.33,y+.33,.35],[.58,.58,.035],'756c52',.02);for(const [dx,dy] of [[.15,.15],[.4,.2],[.3,.45]]){rod([x+dx,y+dy,.35],[x+dx,y+dy,.66],.012,'668761');sphere([x+dx-.05,y+dy,.51],[.09,.035,.035],'81a36e',12,8);for(let i=0;i<5;i++)sphere([x+dx+Math.cos(i*1.256)*.055,y+dy+Math.sin(i*1.256)*.055,.69],[.04,.04,.025],'ebcd8c',10,8);sphere([x+dx,y+dy,.71],[.022,.022,.018],'caa45d',10,8)}}
assets.push(capture('planter-left',()=>planter(1.15,4.55),6.7));assets.push(capture('planter-right',()=>planter(9,5.7),15.2));
function fence(x,y,w){for(let j=0;j<=3;j++)box([x+w*j/3,y,.24],[.12,.12,.5],'b6a67e',.025);for(const z of [.17,.37])box([x+w/2,y,z],[w,.065,.055],'c6b38d',.015)}
assets.push(capture('fence-left',()=>fence(1,7.75,2.2),9.75));assets.push(capture('fence-right',()=>fence(7.4,7.75,2),16.15));
function bush(x,y){for(let i=0;i<6;i++){const a=i*Math.PI/3;sphere([x+Math.cos(a)*.3,y+Math.sin(a)*.23,.19+i%2*.08],[.25,.23,.24],i%2?'8da77e':'759772',18,12)}}
assets.push(capture('bush-left',()=>bush(.6,6.5),7.1));assets.push(capture('bush-right',()=>bush(8.8,7.3),16.1));
function person(x,y,angle=0,walk=0,npc=false){const start=mesh.length;const skin='e8c19c',coat=npc?'6f9380':'a7b58b';
for(const s of [-1,1]){const z=s*walk*.07;rod([s*.105,0,.43],[s*.11,s*walk*.1,.16+Math.max(0,z)],.075,'5c766e');box([s*.11,.065+s*walk*.1,.085+Math.max(0,z)],[.17,.29,.13],'55594c',.055)}
box([0,0,.61],[.43,.29,.43],coat,.11);box([0,.15,.6],[.22,.035,.29],'bbc49c',.015);for(const s of [-1,1]){rod([s*.24,0,.74],[s*.29,s*walk*.11,.45],.065,coat);sphere([s*.29,s*walk*.11,.42],[.065,.063,.075],skin)}
sphere([0,0,.91],[.08,.08,.12],skin);sphere([0,.01,1.13],[.25,.22,.28],skin,32,22);for(const s of [-1,1])sphere([s*.25,.01,1.13],[.05,.06,.075],skin,16,12);
// Hair is an upper cap with individual locks, leaving the face clear.
sphere([0,-.045,1.32],[.26,.22,.13],'65533e',28,16);for(const [a,b,z] of [[-.2,-.04,1.19],[.2,-.04,1.19],[0,-.17,1.18],[-.14,.13,1.32],[.02,.15,1.33],[.14,.11,1.34]])sphere([a,b,z],[.095,.08,.1],'705c42',16,12);
for(const s of [-1,1]){sphere([s*.085,.209,1.15],[.04,.022,.045],'f6f0df',14,10);sphere([s*.085,.229,1.147],[.019,.012,.027],'354e46',14,10);sphere([s*.078,.238,1.16],[.006,.004,.008],'ffffff',10,8);sphere([s*.145,.193,1.075],[.04,.013,.022],'dba98e',12,8)}sphere([0,.23,1.105],[.031,.035,.036],skin,14,10);rod([-.04,.207,1.03],[.04,.207,1.03],.009,'a0775c');
box([0,-.19,.62],[.3,.14,.3],'758c72',.055);box([0,-.27,.56],[.22,.07,.12],'96a688',.025);
if(npc){sphere([0,0,1.38],[.27,.23,.11],'71927b',24,14);box([0,.19,1.335],[.42,.25,.04],'567b68',.02);box([.24,.19,.62],[.16,.06,.23],'e1dfc6',.015)}
for(let i=start;i<mesh.length;i++)for(let j=0;j<3;j++){const p=mesh[i].p[j],n=mesh[i].n[j],cs=Math.cos(angle),sn=Math.sin(angle);mesh[i].p[j]=[x+p[0]*cs-p[1]*sn,y+p[0]*sn+p[1]*cs,p[2]];mesh[i].n[j]=[n[0]*cs-n[1]*sn,n[0]*sn+n[1]*cs,n[2]];}
}
assets.push(capture('instructor',()=>person(5.45,2.55,-Math.PI/4,0,true),8));
console.log('Created static meshes:',assets.reduce((s,a)=>s+a.tris.length,0));
shadowDepth=shadowMap(assets.flatMap(a=>a.tris));
const records=[];
function saveCrop(name,can,extra={}){const g=can.getContext('2d'),d=g.getImageData(0,0,width,height).data;let l=width,t=height,r=0,b=0;for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(d[(y*width+x)*4+3]){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}l=Math.max(0,l-2);t=Math.max(0,t-2);r=Math.min(width-1,r+2);b=Math.min(height-1,b+2);const crop=createCanvas(r-l+1,b-t+1);crop.getContext('2d').drawImage(can,-l,-t);const buffer=crop.toBuffer('image/png');fs.writeFileSync(OUT+'/'+name+'.png',buffer);return{name,left:l,top:t,width:crop.width,height:crop.height,src:'data:image/png;base64,'+buffer.toString('base64'),...extra}}
for(const asset of assets){const img=render(asset.tris);if(asset.name==='board'){const g=img.getContext('2d'),p=project([1.78,1.663,2.1]);g.save();g.translate(...p);g.transform(1,.5,0,1,0,0);g.fillStyle='#e9e4ca';g.fillRect(0,-7,119,80);g.fillStyle='#426f60';g.fillRect(0,-7,119,24);g.fillStyle='#fff6da';g.font='bold 15px "Microsoft JhengHei"';g.fillText('安全規定區',12,10);g.fillStyle='#667e68';g.font='10px "Microsoft JhengHei"';['聽從指示','依序集合','確認裝備'].forEach((s,i)=>g.fillText('• '+s,9,32+i*13));g.restore()}records.push(saveCrop(asset.name,img,{depth:asset.depth}));console.log('Rendered',asset.name)}
// Eight directions, two alternate steps and a resting pose, all actual mesh renders.
shadowDepth=null;const chars=[];
for(let dir=0;dir<8;dir++)for(let frame=0;frame<3;frame++){mesh=[];person(5,4,dir*Math.PI/4,frame===0?0:frame===1?.8:-.8);const p=project([5,4,0]);const rec=saveCrop('player-'+dir+'-'+frame,render(mesh,false));chars.push({...rec,anchorX:p[0]-rec.left,anchorY:p[1]-rec.top});}console.log('Rendered 24 player sprites');
fs.writeFileSync(OUT+'/assets.json',JSON.stringify({records,chars}));
fs.writeFileSync(OUT+'/製作說明.txt','此資料夾保存離線 3D 模型預渲染素材。模型由球體、圓角盒與圓柱構成，經正交投影、逐像素法線光照與陰影貼圖渲染。遊戲執行時只使用透明 PNG 圖層；人物有八方向，每方向三個影格。\n建置：node tmp/build-prerendered.cjs\n網頁：安全規定區-預渲染模型風.html（內嵌全部素材，可獨立開啟）。');
