import * as THREE from 'three';
let seed=84;
const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
export const TARGET={x:0,y:1.27,z:-15,width:1.6,height:2.05,radius:.55};
export function paperCanvas(number='03',size=768){
  const c=document.createElement('canvas');c.width=size;c.height=Math.round(size*TARGET.height/TARGET.width);const g=c.getContext('2d');
  g.fillStyle='#f7f4e8';g.fillRect(0,0,c.width,c.height);
  g.strokeStyle='#bbc2b4';g.lineWidth=2;g.strokeRect(18,18,c.width-36,c.height-36);
  g.fillStyle='#314a3b';g.fillRect(size*.39,28,size*.22,75);g.fillStyle='#fff';g.font=`bold ${size*.062}px sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(number,size*.5,67);
  const cx=c.width/2,cy=c.height/2, r=size*TARGET.radius/TARGET.width;
  g.strokeStyle='#293c30';g.lineWidth=3;
  for(let i=6;i>0;i--){g.beginPath();g.arc(cx,cy,r*i/6,0,Math.PI*2);g.stroke();}
  g.fillStyle='#293c30';g.beginPath();g.arc(cx,cy,r/6,0,Math.PI*2);g.fill();
  g.fillStyle='#f7f4e8';g.beginPath();g.arc(cx,cy,3,0,Math.PI*2);g.fill();
  g.fillStyle='#778472';g.font=`${size*.023}px sans-serif`;g.fillText('FIELD / '+number,size/2,c.height-40);
  return c;
}
export function buildWorld(scene,renderer){
  const group=new THREE.Group();scene.add(group);const lit=[];const marks=[];
  const texture=(base,grain,repeat)=>{
    const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,256,256);
    for(let i=0;i<14000;i++){const v=Math.floor(rand()*grain);g.fillStyle=`rgba(${v},${v},${v},${.07+rand()*.12})`;g.fillRect(rand()*256,rand()*256,rand()*2+1,rand()*2+1);}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
  };
  const grassMat=new THREE.MeshStandardMaterial({map:texture('#7a8050',190,20),roughness:1});
  const concrete=new THREE.MeshStandardMaterial({map:texture('#a3a69a',210,3),roughness:.95});
  const soil=new THREE.MeshStandardMaterial({map:texture('#82715a',170,6),roughness:1});
  const metal=new THREE.MeshStandardMaterial({color:'#364d3d',roughness:.65,metalness:.4});
  const wood=new THREE.MeshStandardMaterial({color:'#7a6b4a',roughness:.95});
  const mat=new THREE.MeshStandardMaterial({map:texture('#354b3d',170,5),roughness:1});
  function box(w,h,d,x,y,z,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
  box(130,.3,150,0,-.19,-25,grassMat);
  box(24,.22,10,0,-.07,5,concrete);
  box(12,.06,.11,0,.056,.2,new THREE.MeshStandardMaterial({color:'#e1ce6e',roughness:.95}));
  for(const x of [-8,-4,0,4,8]){
    box(1.3,.05,2.7,x,.073,3.7,mat); // ground mats, no shooting tables
    const bag=box(.53,.14,.28,x+.08,.17,1.95,mat);bag.rotation.y=.08;
    box(1.25,.01,.035,x,.055,5.25,wood);
  }
  // Canopy remains above the player; camera stays low on the center mat.
  for(const x of [-10,-5,5,10])for(const z of [.3,8.8])box(.17,3,.17,x,1.5,z,metal);
  box(22,.18,10,0,3.03,4.7,metal);
  for(let z=.2;z<9.5;z+=1.2)box(21,.12,.09,0,2.88,z,metal);
  for(const x of [-10.5,10.5]){
    box(.38,1.8,27,x,.86,-12.6,concrete);
    box(.48,.1,27,x,1.79,-12.6,concrete);
  }
  // Backstop is a sloped, irregular landscape mesh, rendered only as game scenery.
  const berm=new THREE.PlaneGeometry(35,19,50,25);berm.rotateX(-Math.PI/2);
  const pos=berm.attributes.position;for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),z=pos.getZ(i),rise=Math.max(0,1-Math.abs(z)/9.5);
    pos.setY(i,rise*6+Math.sin(x*.7)*.22*rise+(rand()-.5)*.25*rise);
  }berm.computeVertexNormals();const mound=new THREE.Mesh(berm,soil);mound.position.set(0,0,-28);mound.castShadow=true;mound.receiveShadow=true;group.add(mound);
  const targetPlanes=[];
  for(let i=-2;i<=2;i++){
    const x=i*4,number=String(i+3).padStart(2,'0'),c=paperCanvas(number);
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
    box(1.69,2.14,.09,x,TARGET.y,TARGET.z-.09,wood);
    for(const side of [-.68,.68])box(.07,1.6,.07,x+side,.8,TARGET.z-.13,wood);
    box(1.85,.12,.7,x,.06,TARGET.z-.15,concrete);
    const paper=new THREE.Mesh(new THREE.PlaneGeometry(TARGET.width,TARGET.height),new THREE.MeshStandardMaterial({map:tex,roughness:1,side:THREE.FrontSide}));
    paper.position.set(x,TARGET.y,TARGET.z);paper.receiveShadow=true;group.add(paper);targetPlanes.push(paper);
    const plateCanvas=document.createElement('canvas');plateCanvas.width=128;plateCanvas.height=80;const ctx=plateCanvas.getContext('2d');ctx.fillStyle='#263c2e';ctx.fillRect(0,0,128,80);ctx.fillStyle='#f5f2db';ctx.font='bold 55px sans-serif';ctx.textAlign='center';ctx.fillText(number,64,60);
    const pt=new THREE.CanvasTexture(plateCanvas);pt.colorSpace=THREE.SRGBColorSpace;
    const plate=new THREE.Mesh(new THREE.PlaneGeometry(.65,.4),new THREE.MeshStandardMaterial({map:pt,roughness:1}));plate.position.set(x,.3,TARGET.z+.06);group.add(plate);
  }
  // Sparse near-ground grass outside the mats and target stands.
  const blades=new THREE.InstancedMesh(new THREE.ConeGeometry(.012,.09,3),new THREE.MeshStandardMaterial({color:'#6d7d45',roughness:1}),1300);
  const dummy=new THREE.Object3D();for(let i=0;i<1300;i++){const x=(rand()-.5)*24,z=-1-rand()*22;dummy.position.set(x,.07,z);dummy.rotation.y=rand()*Math.PI;dummy.scale.setScalar(.6+rand());dummy.updateMatrix();blades.setMatrixAt(i,dummy.matrix);}blades.receiveShadow=true;group.add(blades);
  const trunkGeo=new THREE.CylinderGeometry(.12,.22,3,6),foliageGeo=new THREE.IcosahedronGeometry(1,2);
  const leafMats=['#425e3b','#556d42','#697649'].map(color=>new THREE.MeshStandardMaterial({color,roughness:1}));
  for(let i=0;i<54;i++){
    const x=(rand()-.5)*95,z=-40-rand()*35,h=3+rand()*5;
    const trunk=new THREE.Mesh(trunkGeo,wood);trunk.position.set(x,h/2,z);trunk.scale.y=h/3;group.add(trunk);
    for(let j=0;j<3;j++){const leaf=new THREE.Mesh(foliageGeo,leafMats[i%3]);leaf.position.set(x+(rand()-.5)*1.8,h-1+j*.8,z);leaf.scale.set(1.7+rand(),1.5+rand()*1.3,1.8+rand());leaf.castShadow=false;group.add(leaf);}
  }
  // Distant hills soften the skyline.
  for(let i=0;i<11;i++){const hill=new THREE.Mesh(new THREE.SphereGeometry(1,18,9),new THREE.MeshStandardMaterial({color:'#6f8870',roughness:1}));hill.position.set((i-5)*19,-3,-94-rand()*20);hill.scale.set(22,12+rand()*8,18);group.add(hill);}
  const sky=new THREE.Mesh(new THREE.SphereGeometry(180,24,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,vertexShader:'varying vec3 v; void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 v;void main(){float h=clamp(normalize(v).y,0.,1.);gl_FragColor=vec4(mix(vec3(.82,.86,.79),vec3(.32,.55,.71),pow(h,.5)),1.);}'}));scene.add(sky);
  const hemi=new THREE.HemisphereLight('#c9e2f1','#526340',2);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#fff0cd',3.1);sun.position.set(-14,23,-4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-24;sun.shadow.camera.right=24;sun.shadow.camera.top=24;sun.shadow.camera.bottom=-24;sun.shadow.camera.far=80;sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;scene.add(sun);scene.add(sun.target);sun.target.position.set(0,0,-10);lit.push(sun);
  const raycaster=new THREE.Raycaster();
  return {
    target:targetPlanes[2],sun,
    trace(camera){camera.updateMatrixWorld(true);raycaster.setFromCamera(new THREE.Vector2(0,0),camera);const plane=new THREE.Plane(new THREE.Vector3(0,0,1),-TARGET.z);const point=new THREE.Vector3();if(!raycaster.ray.intersectPlane(plane,point))return null;return {x:point.x,y:point.y-TARGET.y};},
    mark(shot){if(shot.x===null||Math.abs(shot.x)>TARGET.width/2||Math.abs(shot.y)>TARGET.height/2)return;const m=new THREE.Mesh(new THREE.CircleGeometry(.018,10),new THREE.MeshBasicMaterial({color:'#211a15',depthWrite:false}));m.position.set(shot.x,TARGET.y+shot.y,TARGET.z+.008+marks.length*.0001);group.add(m);marks.push(m);},
    clear(){for(const m of marks){group.remove(m);m.geometry.dispose();m.material.dispose();}marks.length=0;},
    quality(value){sun.castShadow=value!=='low';blades.visible=value!=='low';renderer.shadowMap.enabled=value!=='low';renderer.setPixelRatio(Math.min(devicePixelRatio,value==='low'?1:value==='high'?2:1.5));}
  };
}
