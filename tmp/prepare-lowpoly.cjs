const fs=require('fs');
let code=fs.readFileSync('tmp/build-prerendered.cjs','utf8');
code=code.replaceAll('demo/預渲染模型風','DEMO/低多邊形等角風');
code=code.replace('function tri(a,b,c,na,nb,nc,color){mesh.push({p:[a,b,c],n:[na,nb,nc],color:rgb(color)});}',`function tri(a,b,c,na,nb,nc,color){
 const ab=b.map((x,i)=>x-a[i]),ac=c.map((x,i)=>x-a[i]);let normal=cross(ab,ac);if(Math.hypot(...normal)<1e-10)return;normal=normalize(normal);if(dot(normal,na.map((x,i)=>x+nb[i]+nc[i]))<0)normal=normal.map(x=>-x);
 mesh.push({p:[a,b,c],n:[normal,normal,normal],color:rgb(color)});
}`);
const begin=code.indexOf('function sphere('),end=code.indexOf('function box(',begin);
code=code.slice(0,begin)+`function sphere(center,r,color,seg=22){
 const f=(1+Math.sqrt(5))/2;
 const verts=[[-1,f,0],[1,f,0],[-1,-f,0],[1,-f,0],[0,-1,f],[0,1,f],[0,-1,-f],[0,1,-f],[f,0,-1],[f,0,1],[-f,0,-1],[-f,0,1]].map(normalize);
 const faces=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
 function face(a,b,c,level){if(level){const ab=normalize(a.map((x,i)=>x+b[i])),ac=normalize(a.map((x,i)=>x+c[i])),bc=normalize(b.map((x,i)=>x+c[i]));face(a,ab,ac,0);face(ab,b,bc,0);face(ac,bc,c,0);face(ab,bc,ac,0);return}const pos=v=>v.map((x,i)=>center[i]+x*r[i]),norm=v=>normalize(v.map((x,i)=>x/r[i]));tri(pos(a),pos(b),pos(c),norm(a),norm(b),norm(c),color)}
 for(const [a,b,c] of faces)face(verts[a],verts[b],verts[c],seg>=28?1:0);
}
`+code.slice(end);
code=code.replace(/const steps=h\.map\([^\n]+/,'const steps=h.map((hh,k)=>[-hh,-inner[k],inner[k],hh].filter((x,i,a)=>i===0||x>a[i-1]+.00001));');
code=code.replace('for(let i=0;i<16;i++){const t=i/16*Math.PI*2,s=(i+1)/16*Math.PI*2','for(let i=0;i<6;i++){const t=i/6*Math.PI*2,s=(i+1)/6*Math.PI*2');
code=code.replace("const ambient=.72+.10*Math.max(0,n[2]);let f=ambient+nd*.28*shade","const ambient=.64+.12*Math.max(0,n[2]);let f=ambient+nd*.38*shade").replace(')),35)*.12*shade',')),35)*.015*shade');
const ts=code.indexOf('function tree('),te=code.indexOf("assets.push(capture('tree-left'",ts);
code=code.slice(0,ts)+`function cone(x,y,z,r,h,color){const sides=7;for(let i=0;i<sides;i++){const a=i/sides*Math.PI*2+.17,b=(i+1)/sides*Math.PI*2+.17;const p=[x+Math.cos(a)*r,y+Math.sin(a)*r,z],q=[x+Math.cos(b)*r,y+Math.sin(b)*r,z],tip=[x,y,z+h];const n=normalize([Math.cos((a+b)/2),Math.sin((a+b)/2),r/h]);tri(p,q,tip,n,n,n,color);tri([x,y,z],q,p,[0,0,-1],[0,0,-1],[0,0,-1],color)}}
function tree(x,y,s=1){rod([x,y,0],[x,y,s*1.8],.12*s,'9c7048');if(x>5){cone(x,y,.85*s,.67*s,1.15*s,'397d68');cone(x,y,1.36*s,.54*s,1.02*s,'4e9976');cone(x,y,1.85*s,.37*s,.9*s,'75b080')}else{rod([x,y,.9*s],[x-.3*s,y,1.9*s],.065*s,'9c7048');sphere([x-.28*s,y,1.75*s],[.6*s,.53*s,.6*s],'79ac77');sphere([x+.28*s,y+.1*s,1.9*s],[.51*s,.55*s,.6*s],'93bb7d');sphere([x,y-.15*s,2.25*s],[.47*s,.48*s,.6*s],'b1c98b')}}
`+code.slice(te);
const colors={ '9dada0':'829f85','d6d9ce':'e2dcca','dcded3':'ece4cf','cdd4c9':'d5d8c3','99ae88':'95b57e','adb8ad':'9ab3a6','b5beb2':'afc2b1','a5b2a5':'8ea99d','d4d4bf':'d5dbbe','b3beac':'a1b8a5','789873':'529777','86a477':'74ad79','97b081':'93bf83','bd9f75':'cfaa72','bb9e73':'cfaa72','b5986b':'ba905b','a7b58b':'c2b872','5c766e':'537d78','6f9380':'548e7a','8da77e':'84b77a','759772':'4f9b77'};
for(const [a,b]of Object.entries(colors))code=code.replaceAll("'"+a+"'","'"+b+"'");
code=code.replaceAll('此資料夾保存離線 3D 模型預渲染素材。模型由球體、圓角盒與圓柱構成','此資料夾保存低多邊形模型素材。造型由二十面體、七角錐、六角柱與簡化倒角盒構成，採用逐面法線形成清楚切面').replaceAll('tmp/build-prerendered.cjs','tmp/build-lowpoly.cjs').replaceAll('安全規定區-預渲染模型風.html','安全規定區-低多邊形等角風.html');
fs.writeFileSync('tmp/build-lowpoly.cjs',code);
let pack=fs.readFileSync('tmp/package-prerendered.cjs','utf8').replaceAll('demo/預渲染模型風','DEMO/低多邊形等角風').replaceAll('光影裡的安全庭院','綠蔭裡的幾何庭院').replaceAll('預渲染模型風','低多邊形等角風').replaceAll('預渲染模型素材','低多邊形素材').replaceAll('#edf0e6','#eef0e1').replaceAll('#d9e2d6','#d6e5d5');
fs.writeFileSync('tmp/package-lowpoly.cjs',pack);
let test=fs.readFileSync('tmp/check-prerendered.cjs','utf8').replaceAll('預渲染模型風','低多邊形等角風').replaceAll('預渲染-告示牌驗證','低多邊形-告示牌驗證');
fs.writeFileSync('tmp/check-lowpoly.cjs',test);
console.log('Created independent low-poly renderer, packager, and verification script.');
