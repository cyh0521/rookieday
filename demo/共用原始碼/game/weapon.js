import * as THREE from 'three';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
export async function makeWeapon(renderer,assets){
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.015,5);scene.add(camera);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#e7eee6','#4e6147',2.1));const key=new THREE.DirectionalLight('#fff0d9',2);key.position.set(-2,4,-1);scene.add(key);
  const root=new THREE.Group();scene.add(root);
  const load=new THREE.TextureLoader();
  const files=['M4A1_Base_Color.png','M4A1_Normal.png','M4A1_Metallic.png','M4A1_Roughness.png'];
  const [model,...tex]=await Promise.all([new FBXLoader().loadAsync(assets['M4A1.fbx']),...files.map(f=>load.loadAsync(assets[f]))]);
  tex[0].colorSpace=THREE.SRGBColorSpace;tex.forEach(t=>t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()));
  const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const wrapper=new THREE.Group();root.add(wrapper);wrapper.scale.setScalar(.86/Math.max(size.x,size.y,size.z));model.position.sub(center);wrapper.add(model);
  const material=new THREE.MeshStandardMaterial({map:tex[0],normalMap:tex[1],metalnessMap:tex[2],roughnessMap:tex[3],metalness:1,roughness:1,envMapIntensity:1});let mag=null,magHome;
  model.traverse(o=>{if(o.isMesh){const old=o.material;if(Array.isArray(old))old.forEach(m=>m.dispose());else old?.dispose();o.material=material;o.frustumCulled=false;if(o.name==='Magazine'){mag=o;magHome=o.position.clone();}}});
  // Simple original foreground forearms, not a full body or motion-captured animation.
  const sleeve=new THREE.MeshStandardMaterial({color:'#465740',roughness:1});const glove=new THREE.MeshStandardMaterial({color:'#454b39',roughness:.95});
  function limb(a,b,r,mat){const dir=new THREE.Vector3().subVectors(b,a),mesh=new THREE.Mesh(new THREE.CapsuleGeometry(r,Math.max(.01,dir.length()-r*2),4,8),mat);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());root.add(mesh);return mesh;}
  limb(new THREE.Vector3(-.22,-.21,.05),new THREE.Vector3(-.055,-.12,-.23),.045,sleeve);
  limb(new THREE.Vector3(.23,-.19,.10),new THREE.Vector3(.035,-.105,.02),.047,sleeve);
  limb(new THREE.Vector3(-.05,-.1,-.2),new THREE.Vector3(-.025,-.08,-.25),.035,glove);
  limb(new THREE.Vector3(.04,-.10,.01),new THREE.Vector3(.012,-.07,.015),.035,glove);
  const flash=new THREE.Mesh(new THREE.PlaneGeometry(.08,.08),new THREE.MeshBasicMaterial({color:'#ffe0a0',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));flash.position.set(0,.03,-.44);root.add(flash);
  let ads=0,recoil=0;
  return {scene,camera,root,model,wrapper,
    shot(){recoil=1;},
    frame(dt,aim,reloading,reloadLeft,reduced,fov,phase){
      ads=THREE.MathUtils.damp(ads,aim?1:0,12,dt);recoil=Math.max(0,recoil-dt*8);
      const r=reloading?Math.sin((1-reloadLeft/1.7)*Math.PI):0;
      root.position.set(THREE.MathUtils.lerp(.105,.0015,ads),THREE.MathUtils.lerp(-.19,-.123,ads)-r*.12,THREE.MathUtils.lerp(-.36,-.255,ads)+recoil*(reduced?.003:.018));
      root.rotation.set(recoil*(reduced?.002:.025)-r*.23,0,-r*.24);
      if(mag){mag.position.copy(magHome);mag.position.y-=r*24;}
      flash.material.opacity=reduced?0:recoil>.75?(recoil-.75)*2.4:0;
      camera.fov=fov;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
      root.visible=!['intro','complete'].includes(phase);return ads;
    }
  };
}
