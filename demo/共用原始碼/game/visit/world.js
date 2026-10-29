import * as T from 'three';

// A small, self-contained art kit. Every mesh is authored for this scene.
export function createWorld(scene) {
  const root = new T.Group(); scene.add(root);
  const palette = {grass:'#94b987',lightGrass:'#b0c997',deepGrass:'#6c9677',soil:'#bba887',sand:'#dbcdac',paving:'#e9dfc4',edge:'#e8e3cd',wood:'#b78b60',woodDark:'#846b51',green:'#628f73',dark:'#3b5c51',cream:'#fff5dc',orange:'#e2a26c',blue:'#83b9be',red:'#d48c79',skin:'#f1c49c',hair:'#4d4940',pants:'#56777c',shoe:'#394e4a',yellow:'#efc878'};
  const mats = Object.fromEntries(Object.entries(palette).map(([k,c])=>[k,new T.MeshStandardMaterial({color:c,roughness:.87,flatShading:k!=='skin'})]));
  const geometries = new Map();
  const geo=(key,fn)=>{if(!geometries.has(key))geometries.set(key,fn());return geometries.get(key)};
  function mesh(g,m,x,y,z,parent=root){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
  function box(w,h,d,x,y,z,m,parent=root,r=.04){
    r=Math.min(r,w/4,h/4,d/4);const key=`b${w},${h},${d},${r}`;
    const g=geo(key,()=>{if(r<.009)return new T.BoxGeometry(w,h,d);const s=new T.Shape();const a=w/2-r,b=h/2-r;s.moveTo(-a,-b);s.lineTo(a,-b);s.lineTo(a,b);s.lineTo(-a,b);s.closePath();const g=new T.ExtrudeGeometry(s,{depth:d-r*2,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:1,steps:1,curveSegments:1});g.center();return g});
    return mesh(g,m,x,y,z,parent);
  }
  function cyl(rt,rb,h,x,y,z,m,parent=root,n=10){return mesh(geo(`c${rt},${rb},${h},${n}`,()=>new T.CylinderGeometry(rt,rb,h,n)),m,x,y,z,parent)}
  function ball(r,x,y,z,m,parent=root,detail=0){return mesh(geo(`i${r},${detail}`,()=>new T.IcosahedronGeometry(r,detail)),m,x,y,z,parent)}
  function sphere(r,x,y,z,m,parent=root){return mesh(geo(`s${r}`,()=>new T.SphereGeometry(r,12,8)),m,x,y,z,parent)}
  function group(x,y,z,rot=0){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rot;root.add(g);return g}
  function line(x1,z1,x2,z2,m,width=.08,y=.19){const b=box(width,.018,Math.hypot(x2-x1,z2-z1),(x1+x2)/2,y,(z1+z2)/2,m,root,0);b.rotation.y=Math.atan2(x2-x1,z2-z1);return b}
  let seed=9128;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const cx=canvas.getContext('2d');cx.fillStyle='#94b987';cx.fillRect(0,0,128,128);for(let i=0;i<1300;i++){cx.fillStyle=i%2?'#9bbd8c':'#8fb382';cx.fillRect(random()*128,random()*128,1+random()*2,1+random()*2)}
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(12,14);const grassMat=new T.MeshStandardMaterial({map:texture,roughness:1});
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;const sc=shadowCanvas.getContext('2d'),grad=sc.createRadialGradient(32,32,0,32,32,32);grad.addColorStop(0,'rgba(38,62,40,.23)');grad.addColorStop(.45,'rgba(38,62,40,.12)');grad.addColorStop(1,'rgba(38,62,40,0)');sc.fillStyle=grad;sc.fillRect(0,0,64,64);const contactMat=new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false});
  function contact(x,z,s,parent=root){const o=new T.Mesh(geo('shadow',()=>new T.PlaneGeometry(1,1)),contactMat);o.rotation.x=-Math.PI/2;o.position.set(x,.19,z);o.scale.set(s,s,1);parent.add(o)}
  box(59,1.4,70,1,-.85,-1,mats.deepGrass,root,.7);box(58,.5,69,1,-.1,-1,grassMat,root,.24);
  box(29,.17,33,-4,.1,-15,mats.sand,root,.12);box(31,.19,25,-3,.1,15,mats.paving,root,.15);box(12,.19,45,19.5,.1,5,mats.paving,root,.15);
  // The textbook's front-to-rear relationships: targets, firing line, reserve, waiting.
  box(29,.19,7,-4,.14,-5.5,mats.edge,root,.1);box(28,.11,7,-4,.16,3,mats.sand,root,.05);box(28,.11,8,-4,.16,11,mats.paving,root,.05);
  for(let i=0;i<5;i++){const x=-15+i*5.5;box(3.2,.1,4.5,x,.26,-5.2,mats.blue,root,.07);box(1.1,.3,.7,x,.43,-7.1,mats.green,root,.13);for(let j=0;j<3;j++)box(.05,.015,4,x-1.25+j*1.25,.32,-5.2,mats.cream,root,0);}
  line(-18,-8.5,10,-8.5,mats.orange,.15,.28);line(-18,-1.3,10,-1.3,mats.cream,.16,.28);
  for(let x=-18;x<10;x+=1.5){box(.65,.02,.12,x,.25,6.6,mats.cream,root,0);box(.65,.02,.12,x,.25,15.4,mats.orange,root,0)}
  // Substantial low walls, softly faceted earthen stop and trees beyond the target area.
  for(const x of [-19,11]){box(.65,1.35,34,x,.8,-16,mats.soil,root,.12);box(.82,.18,34.2,x,1.56,-16,mats.edge,root,.08);for(let z=-31;z<0;z+=5.5)box(.92,1.65,.92,x,.9,z,mats.edge,root,.09)}
  box(31,2.4,1, -4,1.3,-32.5,mats.soil,root,.15);box(31.5,.2,1.2,-4,2.6,-32.5,mats.edge,root,.1);
  for(let i=0;i<8;i++){const b=ball(2.7,-17+i*3.8,1,-34,mats.deepGrass,root,0);b.scale.set(1.2,.8,.75)}
  for(let i=0;i<5;i++){const x=-15+i*5.5;for(const dx of [-.6,.6])box(.12,2.3,.13,x+dx,1.3,-28,mats.woodDark);box(1.8,2.3,.16,x,2,-28,mats.cream,root,.045);const c=document.createElement('canvas');c.width=128;c.height=160;const g=c.getContext('2d');g.fillStyle='#fff7e4';g.fillRect(0,0,128,160);g.fillStyle='#446458';g.fillRect(40,6,48,24);g.fillStyle='#fff7e4';g.font='bold 18px sans-serif';g.textAlign='center';g.fillText(String(i+1).padStart(2,'0'),64,24);g.strokeStyle='#77836b';g.lineWidth=2;for(let r=35;r>=7;r-=7){g.beginPath();g.arc(64,93,r,0,Math.PI*2);g.stroke()}g.fillStyle='#5d725d';g.beginPath();g.arc(64,93,7,0,Math.PI*2);g.fill();const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(1.7,2.15),new T.MeshBasicMaterial({map:t}),x,2,-27.9);}
  // Modular seating and open tables. There are no overhead canopies.
  function chair(x,z,rot=0,tint=mats.green){const p=group(x,.2,z,rot);box(.68,.14,.7,0,.55,0,tint,p,.06);box(.68,.62,.12,0,.94,-.29,tint,p,.07);for(const a of [-.23,.23])for(const b of [-.23,.23])box(.065,.54,.065,a,.27,b,mats.woodDark,p,0);return p}
  function bench(x,z,rot=0){const p=group(x,.2,z,rot);for(const a of [-.26,0,.26])box(3,.11,.23,0,.62,a,mats.wood,p,.025);for(const y of [.98,1.25])box(3,.2,.09,0,y,-.34,mats.wood,p);for(const a of [-1.14,1.14]){box(.16,.65,.6,a,.3,0,mats.dark,p);box(.12,1.2,.1,a,.65,-.31,mats.dark,p)}contact(x,z,3.2)}
  function table(x,z,w=3){const p=group(x,.2,z);box(w,.17,1.25,0,1.1,0,mats.wood,p,.07);for(const a of [-w*.39,w*.39])for(const b of [-.43,.43])box(.1,1.1,.1,a,.55,b,mats.dark,p);contact(x,z,w);return p}
  for(let row=0;row<2;row++)for(let col=0;col<5;col++)chair(-15+col*5.5,1.5+row*2.5,Math.PI);
  for(let row=0;row<2;row++)for(let col=0;col<6;col++)chair(-14+col*3.6,9+row*2.7,Math.PI);
  for(const x of [15.5,19.5,23.5])for(const z of [22,25])bench(x,z,Math.PI);
  const podium=table(19.5,18,2.4);box(.7,.08,.5,0,1.23,.15,mats.cream,podium);box(.08,.7,.08,.65,1.55,0,mats.dark,podium);sphere(.12,.65,1.93,0,mats.dark,podium);
  const command=table(20,-8,3.7);box(1.05,.7,.07,-.6,1.55,-.2,mats.dark,command);box(.9,.52,.08,-.6,1.58,-.15,mats.blue,command);box(.7,.08,.5,.7,1.25,.1,mats.cream,command);chair(20,-9.4);
  table(20,-1.3,4);for(const x of [18.8,20.2,21.4]){box(.8,.65,.8,x,.55,-1.3,mats.deepGrass);box(.8,.65,.8,x,.55,.1,mats.deepGrass);box(.45,.05,.07,x,.72,.52,mats.cream)}
  const firstAid=table(21,9,3.7);box(.9,.7,.55,-.9,1.5,0,mats.cream,firstAid,.08);box(.14,.45,.02,-.9,1.5,.29,mats.red,firstAid,0);box(.44,.14,.02,-.9,1.5,.30,mats.red,firstAid,0);box(1.5,.05,.9,21,.75,12,mats.blue);for(const x of [20.4,21.6])box(.09,.65,.09,x,.42,12,mats.dark);
  // Wayfinding uses textures rather than font geometry, keeping the offline file small.
  function sign(x,z,title,sub,color='#446d59',w=3.8){const p=group(x,.2,z);for(const a of [-w*.39,w*.39])box(.12,2.1,.14,a,1.05,0,mats.woodDark,p);box(w,1.25,.18,0,2.15,0,mats.cream,p,.08);const c=document.createElement('canvas');c.width=512;c.height=168;const g=c.getContext('2d');g.fillStyle='#fff7e2';g.fillRect(0,0,512,168);g.fillStyle=color;g.fillRect(0,0,10,168);g.textAlign='center';g.font='bold 41px Microsoft JhengHei, sans-serif';g.fillText(title,256,75);g.fillStyle='#8b957b';g.font='20px sans-serif';g.fillText(sub,256,121);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(w-.12,1.12),new T.MeshBasicMaterial({map:t}),0,2.15,.101,p);return p}
  sign(21,17,'安全規定區','LISTEN & LEARN',undefined,5);sign(-5,7,'待命線','著裝區 · WAITING');sign(20,-12,'指揮臺','CONTROL');sign(21,-4,'管制區','預備槍 · 彈藥');sign(23.3,7,'急救站','FIRST AID','#b17966',3.2);
  // Field map board with actual miniature regions, near the beginning of the tour.
  const mapBoard=group(1,.2,20.4);for(const x of [-1.8,1.8])box(.15,2.9,.18,x,1.4,0,mats.woodDark,mapBoard);box(4.4,2.5,.2,0,2,0,mats.wood,mapBoard,.1);box(4.05,2.15,.07,0,2,.15,mats.cream,mapBoard,.04);for(let i=0;i<4;i++)box(2.7,.27,.06,-.35,2.75-i*.44,.22,[mats.green,mats.blue,mats.orange,mats.sand][i],mapBoard);box(.55,1.65,.06,1.32,2.1,.22,mats.deepGrass,mapBoard);
  // Chibi characters with eyes, hair, backpacks and articulated limbs.
  const npcs=[];
  function person(x,z,{shirt=mats.cream,cap=false,backpack=false,rotation=0,scale=1}={}){
    const p=group(x,.22,z,rotation);p.scale.setScalar(scale);const body=new T.Group();p.add(body);
    box(.68,.68,.44,0,1.05,0,shirt,body,.14);box(.64,.12,.44,0,.73,0,mats.pants,body,.03);sphere(.42,0,1.85,0,mats.skin,body);for(const a of [-1,1]){sphere(.105,a*.41,1.83,0,mats.skin,body);sphere(.035,a*.145,1.87,.391,mats.hair,body)}
    const hair=sphere(.435,0,2,-.035,mats.hair,body);hair.scale.set(1,.58,1);if(cap){const h=sphere(.45,0,2.05,-.015,mats.green,body);h.scale.y=.6;box(.7,.09,.44,0,2.04,.26,mats.green,body,.045);box(.14,.12,.025,0,2.19,.405,mats.yellow,body,.015)}else{for(const a of [-.25,0,.25]){const h=sphere(.16,a,2,.28,mats.hair,body);h.scale.y=.62}}
    box(.13,.035,.025,0,1.68,.38,mats.woodDark,body,.008);if(backpack){box(.6,.6,.24,0,1.08,-.32,mats.orange,body,.1);for(const a of [-.22,.22])box(.08,.57,.08,a,1.13,.24,mats.orange,body,.015)}
    const arms=[],legs=[];for(const a of [-1,1]){const arm=new T.Group();arm.position.set(a*.44,1.26,0);body.add(arm);cyl(.105,.12,.43,0,-.17,0,shirt,arm,8);sphere(.115,0,-.42,0,mats.skin,arm);arms.push(arm);const leg=new T.Group();leg.position.set(a*.18,.7,0);body.add(leg);cyl(.105,.12,.5,0,-.23,0,mats.pants,leg,8);box(.25,.17,.4,0,-.49,.065,mats.shoe,leg,.055);legs.push(leg)}
    contact(0,0,1.65,p);return {group:p,body,arms,legs};
  }
  const player=person(2,26,{backpack:true,shirt:mats.cream,rotation:Math.PI,scale:1.15});
  for(const [x,z,cap,rot] of [[19,18,true,0],[-5,8.2,true,0],[20,-7,true,1.2],[22,10,true,-.8],[-12,11,false,.3],[-8.5,11,false,-.3],[-1,11.5,false,1],[3,13.5,false,-.4],[17,23,false,.7],[22,24,false,-.4]])npcs.push(person(x,z,{cap,shirt:cap?mats.green:mats.blue,backpack:!cap,rotation:rot,scale:cap?1.04:.95}));
  // Dense, deliberately composed landscape around the clear teaching spaces.
  function tree(x,z,s=1,type=0){const p=group(x,.2,z);p.scale.setScalar(s);cyl(.18,.27,2.3,0,1.15,0,mats.wood,p,7);const branch=cyl(.10,.14,1.2,.35,1.9,0,mats.wood,p,6);branch.rotation.z=-.6;if(type===1){for(let i=0;i<3;i++)cyl(.06,1.4-i*.22,1.8,0,2.6+i*.7,0,i%2?mats.green:mats.deepGrass,p,7)}else{const crown=ball(1.55,0,3.3,0,type===2?mats.lightGrass:mats.green,p,1);crown.scale.set(1.1,1.12,.98);ball(1.1,.8,3.55,.25,mats.lightGrass,p,0);ball(1,-.7,2.95,.3,mats.deepGrass,p,0)}contact(x,z,s*5)}
  for(const [x,z,s,t] of [[-24,-28,1.3,0],[-24,-20,1,1],[-23,-11,1.15,0],[-24,-1,1.2,2],[-24,9,1.1,0],[-23,20,1.2,0],[-23,28,1,2],[27,-28,1.1,1],[23,-27,1.35,0],[17,-25,1.1,2],[27,-18,1.3,0],[27,-8,1,1],[28,1,1.2,0],[28,16,1.05,2],[-17,27,.95,2],[-10,28,.85,0],[10,29,.9,0],[26,27,1.1,0]])tree(x,z,s,t);
  function shrub(x,z,s=1){const p=group(x,.2,z);p.scale.setScalar(s);ball(.65,0,.42,0,mats.deepGrass,p);ball(.55,.55,.45,.05,mats.green,p);ball(.45,-.5,.35,.1,mats.lightGrass,p);contact(x,z,2.2*s)}
  for(let i=0;i<35;i++){const x=i<16?-21.5:26.5,z=-28+(i%16)*3.8;shrub(x,z,.7+random()*.4)}
  for(let i=0;i<20;i++){let x=-24+i*2.65;if(Math.abs(x-2)<5)continue;shrub(x,30.3,.8+random()*.3)}
  function planter(x,z,w=3){box(w,.45,1,x,.43,z,mats.edge,root,.15);box(w-.2,.1,.8,x,.68,z,mats.soil,root,.07);for(let a=-w/2+.5;a<w/2;a+=.65){ball(.42,x+a,.94,z,mats.green);for(let b=0;b<2;b++)sphere(.11,x+a+(b-.5)*.3,1.23,z+.08,mats.yellow)}}
  for(const z of [18,22,26])planter(-15,z,3);planter(12,19,3);planter(12,27,3);planter(24.5,14,2);
  for(let i=0;i<55;i++){const x=(random()-.5)*55+1,z=(random()-.5)*65-1;if(x>-20&&x<26&&z>-32&&z<28)continue;const rock=ball(.22+random()*.25,x,.27,z,mats.soil);rock.scale.y=.5}
  // Entrance, campus path and small parking court.
  box(9,.07,11,2,.16,30,mats.paving,root,.12);for(let z=25;z<35;z+=1.6)box(8,.015,.05,2,.205,z,mats.edge,root,0);
  for(const x of [-3,7]){box(.3,2.2,.3,x,1.2,28,mats.woodDark);ball(.24,x,2.4,28,mats.yellow)}
  for(const x of [-19,-14,-9,12,17,22]){box(.12,.85,.12,x,.6,32,mats.woodDark);box(4,.11,.12,x+2,.93,32,mats.wood)}
  sign(-7,23.5,'靶場見習日','FIELD NOTES · START',undefined,4.8);bench(-19,16,Math.PI/2);bench(-19,23,Math.PI/2);
  for(const x of [-12,11]){cyl(.08,.12,3.4,x,1.9,25,mats.woodDark);box(.6,.5,.6,x,3.7,25,mats.cream,root,.1);box(.8,.1,.8,x,4,25,mats.dark)}
  // Ambulance parked next to first aid; recognizable rounded toy proportions.
  const van=group(27,.2,9,-Math.PI/2);box(2.3,1.8,4.6,0,1.25,0,mats.cream,van,.25);box(2.1,.8,1.25,0,2.24,-.8,mats.cream,van,.18);box(2.02,.67,.06,0,2.2,-1.45,mats.blue,van,.06);box(2.1,.48,.06,0,1.69,2.34,mats.blue,van,.03);box(2.32,.16,4.25,0,1,0,mats.red,van,.04);box(1,.16,.3,0,2.76,-.6,mats.red,van,.05);for(const x of [-1.12,1.12])for(const z of [-1.35,1.35]){const w=cyl(.43,.43,.22,x,.45,z,mats.shoe,van,12);w.rotation.z=Math.PI/2;const rim=cyl(.22,.22,.24,x,.45,z,mats.edge,van,10);rim.rotation.z=Math.PI/2}box(.12,.62,.17,1.19,1.65,.6,mats.red,van,.01);box(.12,.18,.6,1.19,1.65,.6,mats.red,van,.01);contact(27,9,6);
  // Wind pennants, grass tufts and small pots provide a sense of lived-in scale.
  const flags=[];for(const [x,z] of [[12,-9],[12,7],[-18,17]]){cyl(.055,.055,3,x,1.65,z,mats.woodDark);const f=box(.85,.5,.025,x+.42,2.85,z,mats.orange);flags.push(f)}
  const labels=[
    {text:'目標區',x:-4,y:3.7,z:-28,quiet:true},
    {text:'射擊線 · 清（驗）槍線',x:-4,y:1.1,z:-5,quiet:true},
    {text:'預備線',x:-15,y:1.4,z:3,quiet:true},
    {text:'待命線 · 著裝區',x:-5,y:3.4,z:8,station:'waiting',number:'03'},
    {text:'配置看板',x:1,y:3.9,z:20.4,station:'map',number:'02'},
    {text:'安全規定區',x:21,y:3.6,z:18,station:'safety',number:'01'},
    {text:'指揮臺',x:20,y:3.5,z:-10,station:'command'},
    {text:'預備槍 · 彈藥管制區',x:21,y:3.4,z:-2,station:'control'},
    {text:'急救站',x:23,y:3.8,z:10,station:'medical'}
  ];
  // Batch repeated static shapes. Characters remain articulated, while furniture,
  // foliage and terrain share GPU draws where their geometry and materials match.
  root.updateMatrixWorld(true);
  const moving=new Set([player.group,...npcs.map(n=>n.group),...flags]);
  const buckets=new Map();
  root.traverse(o=>{if(!o.isMesh||o.material.transparent)return;let p=o;while(p&&p!==root){if(moving.has(p))return;p=p.parent}const key=o.geometry.uuid+o.material.uuid;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o)});
  for(const list of buckets.values())if(list.length>=3){const batch=new T.InstancedMesh(list[0].geometry,list[0].material,list.length);batch.castShadow=true;batch.receiveShadow=true;list.forEach((o,i)=>{batch.setMatrixAt(i,o.matrixWorld);o.removeFromParent()});batch.instanceMatrix.needsUpdate=true;root.add(batch)}
  return {root,player,npcs,flags,labels,mats,mesh,box};
}
