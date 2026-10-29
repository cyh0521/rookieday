import * as T from 'three';
import { createWorld } from './world.js';
import { STATIONS, NOTES, canWalk, findPath, normaliseProgress } from './core.js';

const $=s=>document.querySelector(s);
const eventDialog=$('#eventDialog'), notebook=$('#notebook');
let saved=[];try{saved=normaliseProgress(JSON.parse(localStorage.getItem('field-notes-v1')||'[]'))}catch{}
let audioEnabled=false,audioContext,toastTimer,world,renderer,scene,camera;
let currentStation=null,nearest=null,route=[],routeStation=null,follow=innerWidth<761,zoom=1,clockTime=0;
const keys=new Set(),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const stationOrder=['safety','map','waiting'];
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3400)}
function chime(success=false){if(!audioEnabled)return;try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();for(const [i,f] of (success?[523,659,784]:[587]).entries()){const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.value=f;const t=audioContext.currentTime+i*.09;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(audioContext.destination);o.start(t);o.stop(t+.32)}}catch{}}
function updateProgress(){
  const count=saved.length,next=stationOrder.find(s=>!saved.includes(s));
  $('#progressText').textContent=$('#bookCount').textContent=`${count} / 3`;$('#progressBar').style.width=`${count/3*100}%`;
  document.querySelectorAll('#steps button').forEach(b=>{const id=b.dataset.station;b.classList.toggle('done',saved.includes(id));b.classList.toggle('current',id===next);b.querySelector('.step-number').textContent=saved.includes(id)?'✓':String(STATIONS[id].order+1).padStart(2,'0')});
  document.querySelectorAll('.map-label').forEach(b=>b.classList.toggle('done',saved.includes(b.dataset.station)));
  $('#guideTip').textContent=count===3?'三份筆記收集完成！可以打開手冊，或繼續走訪旁側設施。':`下一站：${STATIONS[next].name}。點選站點卡片即可出發。`;
  try{localStorage.setItem('field-notes-v1',JSON.stringify(saved))}catch{}
}
function showNotebook(){route=[];routeStation=null;keys.clear();eventDialog.close();$('#notesList').replaceChildren();for(const id of stationOrder){const card=document.createElement('article');card.className='note-card'+(saved.includes(id)?' saved':'');card.innerHTML=`<span class="stamp">${saved.includes(id)?'✳':'·'}</span><div><h3>${NOTES[id].title}</h3><p>${saved.includes(id)?NOTES[id].text:'尚未記錄 · 前往'+STATIONS[id].name+'完成見習。'}</p></div>`;$('#notesList').append(card)}notebook.showModal()}
function complete(id){if(!saved.includes(id)){saved.push(id);updateProgress();chime(true);toast(saved.length===3?'見習完成！三份筆記已收進手冊。':'已獲得一枚見習印章。')}eventDialog.close();if(saved.length===3)showNotebook()}

// Each interactive question has explanatory feedback and can be retried without penalty.
const flows={
  safety:[
    {title:'歡迎，今天一起慢慢看。',body:'<p class="lead">先停在安全規定區，聽一段行前說明。</p><p>我們會先認識各區的位置和用途。看到不熟悉的標示，可以向現場工作人員詢問。</p><p>今天從這裡出發，接著看配置圖，最後找到待命線。</p>',next:'開始認識 →'},
    {title:'從哪一件事開始？',body:'<p>你剛抵達場地，還不清楚集合與移動安排。這時最合適的做法是？</p>',answers:['先看清楚說明，向工作人員確認安排。','跟著任意一群人走，到了再問。','自行挑一個看起來空著的區域等待。'],correct:0,reason:'先確認安排，才知道自己應該在哪裡。這次遊戲會以站點提示引導你。',wrong:'你還不知道各組的安排。先聽取說明、向工作人員確認，會更清楚。'},
    {title:'第一份筆記，完成。',body:'<p class="lead">先認識環境，再依指示行動。</p><p>接下來請到配置看板。試著把眼前的微縮場地，和課本的靶場示意圖連起來。</p><p class="source">區域名稱依據：課本 p.190–191。此情境為教學遊戲設計。</p>',finish:true}
  ],
  map:[
    {title:'把場地讀成一張地圖。',body:'<p>課本示意圖把不同工作安排在不同區域。先記住主要區域的前後關係：</p><div class="mini-plan"><span class="wide">前方｜目標區</span><span class="wide">射擊線 · 清（驗）槍線</span><span>預備線</span><span>旁側｜指揮、管制</span><span>待命線（著裝區）</span><span>旁側｜急救、安全規定區</span></div><p class="source">依課本 p.190–191 整理；各靶場會因地形而有不同配置。</p>',next:'試著辨認 →'},
    {title:'哪裡可以聽取行前說明？',body:'<p>請從剛走過的場景，找出適合進行安全說明的區域。</p>',answers:['目標區','安全規定區','預備槍管制區'],correct:1,reason:'答對了。安全規定區是本次見習聽取說明的第一站。',wrong:'回想第一站，教官是在「安全規定區」向大家說明。再選一次。'},
    {title:'哪一區提供醫護協助？',body:'<p>同學表示身體不舒服。你先通報工作人員，並知道地圖上哪個區域與醫護協助有關？</p>',answers:['指揮臺','待命線','急救站'],correct:2,reason:'答對了。知道急救站的位置，有助於清楚表達與尋求協助。',wrong:'急救站旁有醫護標示與救護車。先回報現場人員，再依指示行動。'},
    {title:'地圖不只是地名。',body:'<p class="lead">每一個分區，都有不同的用途。</p><p>你已辨認安全規定區與急救站。接下來走到待命線，了解它與預備線的差異。</p><p class="source">教材依據：課本 p.190–191「靶場搶先看」。</p>',finish:true}
  ],
  waiting:[
    {title:'到了，這裡是待命線。',body:'<p class="lead">課本也把這裡標示為「著裝區」。</p><p>待命線與前方的預備線是不同區域。集合、著裝與接下來的移動，依現場人員安排。</p><p>在遊戲中，你可以從座椅、標示和地面分界辨識位置。</p>',next:'記住這個差別 →'},
    {title:'哪個名稱與「著裝區」對應？',body:'<p>看一看剛才的看板，也想想課本的區域名稱。</p>',answers:['待命線','目標區','指揮臺'],correct:0,reason:'正確。課本 p.191 標示「待命線（著裝區）」。',wrong:'教材將「著裝區」放在「待命線」的括號中。再選一次。'},
    {title:'帶著觀察，完成今天的見習。',body:'<p class="lead">認識位置，也知道各區有不同用途。</p><p>這份記錄會留在見習手冊。你還可以走訪指揮臺、管制區與急救站，閱讀簡短介紹。</p><p class="source">教材依據：課本 p.190–191。展示版不含射擊操作。</p>',finish:true}
  ],
  medical:[{title:'認識急救站。',body:'<p class="lead">這是與醫護協助有關的區域。</p><p>觀察醫護標示與救護車的位置。有人不舒服或需要協助時，先通報現場人員，依指示處理。</p><p class="source">區域名稱與照片依據：課本 p.191。</p>',info:true}],
  command:[{title:'認識指揮臺。',body:'<p class="lead">觀察現場人員如何協調活動。</p><p>課本將指揮臺列為靶場的一個區域。見習時，可把「誰在說明、誰在協調」記成觀察問題。</p><p class="source">區域依據：課本 p.190。分工延伸：p.192。</p>',info:true}],
  control:[{title:'認識兩種管制區。',body:'<p class="lead">預備槍管制區與彈藥管制區。</p><p>教材把它們列為專責人員管理的區域。遊戲中從旁側走道認識名稱與位置，器材由工作人員管理。</p><p class="source">教材依據：課本 p.190。</p>',info:true}]
};
function openEvent(id){
  if(!flows[id])return;route=[];routeStation=null;keys.clear();currentStation=id;notebook.close();let page=0;
  function render(){const item=flows[id][page];$('#eventKicker').textContent=`${STATIONS[id].name} / ${item.info?'場地觀察':'見習事件'}`;$('#eventTitle').textContent=item.title;$('#eventBody').innerHTML=item.body;$('#eventChoices').replaceChildren();$('#eventFeedback').textContent='';$('#eventFooter').innerHTML=`<span class="page-num">${String(page+1).padStart(2,'0')} / ${String(flows[id].length).padStart(2,'0')}</span>`;eventDialog.scrollTop=0;
    function nextButton(text,fn){const b=document.createElement('button');b.textContent=text;b.addEventListener('click',fn);$('#eventFooter').append(b)}
    if(item.answers){item.answers.forEach((a,i)=>{const b=document.createElement('button');b.textContent=String.fromCharCode(65+i)+'　'+a;b.addEventListener('click',()=>{if(i===item.correct){b.classList.add('correct');$('#eventFeedback').textContent=item.reason;$('#eventChoices').querySelectorAll('button').forEach(x=>x.disabled=true);chime();nextButton('繼續 →',()=>{page++;render()})}else{b.classList.add('wrong');$('#eventFeedback').textContent=item.wrong;b.disabled=true}});$('#eventChoices').append(b)})}
    else if(item.finish)nextButton(saved.includes(id)?'回到場地 →':'收進見習手冊 ✓',()=>complete(id));
    else if(item.info)nextButton('回到場地 →',()=>eventDialog.close());
    else nextButton(item.next||'繼續 →',()=>{page++;render()});
  }
  render();eventDialog.showModal();chime();
}
function travelTo(id){if(!world||!STATIONS[id])return;const dest=STATIONS[id];const pos=world.player.group.position;const next=findPath(pos,dest);if(!next.length){toast('請先移到步道，再試一次。');return}route=next;routeStation=id;toast(`前往${dest.name}…`);chime()}

document.querySelectorAll('[data-station]').forEach(b=>b.addEventListener('click',()=>travelTo(b.dataset.station)));
document.querySelectorAll('.dialog-close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$('#notebookButton').addEventListener('click',showNotebook);$('#returnButton').addEventListener('click',()=>notebook.close());
$('#soundButton').addEventListener('click',()=>{audioEnabled=!audioEnabled;$('#soundButton').textContent='音效 '+(audioEnabled?'開':'關');$('#soundButton').setAttribute('aria-pressed',audioEnabled);$('#soundButton').setAttribute('aria-label',audioEnabled?'關閉音效':'開啟音效');chime()});
$('#overviewButton').addEventListener('click',()=>{follow=!follow;zoom=1;$('#overviewButton').textContent=follow?'跟隨':'全景'});
$('.brand').addEventListener('click',e=>{e.preventDefault();follow=false;zoom=1;$('#overviewButton').textContent='全景'});
$('#restartButton').addEventListener('click',()=>{saved=[];updateProgress();if(world){world.player.group.position.set(2,.22,26);world.player.group.rotation.y=Math.PI}route=[];routeStation=null;follow=false;zoom=1;toast('新的見習開始了。請前往安全規定區。')});
$('#interactButton').addEventListener('click',()=>{if(nearest)openEvent(nearest)});
window.addEventListener('keydown',e=>{if(eventDialog.open||notebook.open)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)){e.preventDefault();keys.add(e.key.toLowerCase())}if(e.key.toLowerCase()==='e'&&nearest&&!e.repeat){e.preventDefault();openEvent(nearest)}});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
document.querySelectorAll('.mobile-pad button').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key.toLowerCase())});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(b.dataset.key.toLowerCase()))});

try{
  const stage=$('#stage');scene=new T.Scene();scene.background=new T.Color('#dbe7d4');
  camera=new T.OrthographicCamera(-40,40,30,-30,.1,200);const cameraOffset=new T.Vector3(38,55,65),viewCenter=new T.Vector3(1,0,-1),projected=new T.Vector3();
  renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;stage.append(renderer.domElement);
  scene.add(new T.HemisphereLight('#fff8df','#769577',2.1));const sun=new T.DirectionalLight('#fff2ce',3.1);sun.position.set(-24,48,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:1,far:120});sun.shadow.normalBias=.035;sun.shadow.bias=-.00015;sun.shadow.radius=3;scene.add(sun);
  const ground=new T.Mesh(new T.PlaneGeometry(400,400),new T.MeshStandardMaterial({color:'#dbe7d4',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-1.7;ground.receiveShadow=true;scene.add(ground);
  world=createWorld(scene);
  const ring=new T.Mesh(new T.RingGeometry(.7,.82,40),new T.MeshBasicMaterial({color:'#fff5b9',side:T.DoubleSide,transparent:true,opacity:.85,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.29;scene.add(ring);
  const destination=new T.Mesh(new T.RingGeometry(.3,.43,24),new T.MeshBasicMaterial({color:'#f7d88c',side:T.DoubleSide,transparent:true,opacity:.9,depthWrite:false}));destination.rotation.x=-Math.PI/2;destination.visible=false;destination.position.y=.29;scene.add(destination);
  const routeDots=new T.Group();scene.add(routeDots);const dotGeo=new T.CircleGeometry(.075,6),dotMat=new T.MeshBasicMaterial({color:'#fff5d0',side:T.DoubleSide,transparent:true,opacity:.8});for(let i=0;i<100;i++){const d=new T.Mesh(dotGeo,dotMat);d.rotation.x=-Math.PI/2;d.visible=false;routeDots.add(d)}
  const labelNodes=world.labels.map(item=>{const el=document.createElement(item.station?'button':'span');el.className='map-label'+(item.station?' station':' quiet');el.innerHTML=(item.number?`<b>${item.number}</b>`:'')+item.text;if(item.station){el.dataset.station=item.station;el.addEventListener('click',()=>travelTo(item.station))}$('#labels').append(el);return {...item,el}});
  let stageRect,baseHalf=30;
  function resize(){stageRect=stage.getBoundingClientRect();renderer.setSize(stageRect.width,stageRect.height);baseHalf=Math.max(30,44*stageRect.height/stageRect.width);}
  window.addEventListener('resize',resize);resize();
  stage.addEventListener('wheel',e=>{e.preventDefault();zoom=T.MathUtils.clamp(zoom*Math.exp(-e.deltaY*.001),.72,2.1)},{passive:false});
  const raycaster=new T.Raycaster(),mouse=new T.Vector2(),hit=new T.Vector3(),plane=new T.Plane(new T.Vector3(0,1,0),-.22);
  let down=null;stage.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});stage.addEventListener('pointerup',e=>{if(!down||Math.hypot(down.x-e.clientX,down.y-e.clientY)>8)return;down=null;if(eventDialog.open||notebook.open)return;mouse.set((e.clientX-stageRect.left)/stageRect.width*2-1,-(e.clientY-stageRect.top)/stageRect.height*2+1);raycaster.setFromCamera(mouse,camera);if(!raycaster.ray.intersectPlane(plane,hit))return;if(canWalk(hit.x,hit.z)){const path=findPath(world.player.group.position,hit);if(path.length){route=path;routeStation=null}}else toast('請沿候位區與旁側步道走訪。')});
  let last=performance.now(),labelTick=0;
  function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.04);last=now;clockTime+=dt;const p=world.player.group.position;let walking=false;const isModal=eventDialog.open||notebook.open;
    if(!isModal){let sx=0,sz=0;if(keys.has('w')||keys.has('arrowup'))sz--;if(keys.has('s')||keys.has('arrowdown'))sz++;if(keys.has('a')||keys.has('arrowleft'))sx--;if(keys.has('d')||keys.has('arrowright'))sx++;
      if(sx||sz){route=[];routeStation=null;const vx=sx*.863+sz*.505,vz=-sx*.505+sz*.863,len=Math.hypot(vx,vz);const dx=vx/len*5.2*dt,dz=vz/len*5.2*dt;if(canWalk(p.x+dx,p.z))p.x+=dx;if(canWalk(p.x,p.z+dz))p.z+=dz;world.player.group.rotation.y=Math.atan2(vx,vz);walking=true}
      else if(route.length){let budget=6*dt;while(route.length&&budget>0){const t=route[0],dx=t.x-p.x,dz=t.z-p.z,dist=Math.hypot(dx,dz);if(dist<.02){route.shift();continue}world.player.group.rotation.y=Math.atan2(dx,dz);const step=Math.min(dist,budget);p.x+=dx/dist*step;p.z+=dz/dist*step;budget-=step;walking=true;if(step>=dist-.001)route.shift()}if(!route.length&&routeStation){const id=routeStation;routeStation=null;openEvent(id)}}
    }
    const walkPhase=clockTime*11;world.player.legs.forEach((a,i)=>a.rotation.x=walking?Math.sin(walkPhase+i*Math.PI)*.55:0);world.player.arms.forEach((a,i)=>a.rotation.x=walking?-Math.sin(walkPhase+i*Math.PI)*.5:0);world.player.body.position.y=walking&&!reducedMotion?Math.abs(Math.sin(walkPhase))*.055:0;
    if(!reducedMotion)world.npcs.forEach((n,i)=>{n.body.position.y=Math.sin(clockTime*1.7+i)*.015});
    ring.position.x=p.x;ring.position.z=p.z;ring.scale.setScalar(reducedMotion?1:1+Math.sin(clockTime*3)*.04);
    destination.visible=route.length>0;if(route.length){const end=route.at(-1);destination.position.set(end.x,.29,end.z)}routeDots.children.forEach((d,i)=>{d.visible=!!route[i];if(route[i])d.position.set(route[i].x,.29,route[i].z)});
    nearest=null;let distance=2.25;for(const [id,s]of Object.entries(STATIONS)){const d=Math.hypot(p.x-s.x,p.z-s.z);if(d<distance){distance=d;nearest=id}}
    $('#interactButton').hidden=!nearest||isModal||route.length>0;if(nearest){$('#interactButton span').textContent='查看'+STATIONS[nearest].name;$('#locationText').textContent=STATIONS[nearest].name}else $('#locationText').textContent=p.z>24?'入口步道':p.x>13?'旁側服務走道':'候位區步道';
    const target=follow?new T.Vector3(p.x,0,p.z-2):new T.Vector3(1,0,-1);viewCenter.lerp(target,reducedMotion?1:1-Math.exp(-dt*4));camera.position.copy(viewCenter).add(cameraOffset);camera.lookAt(viewCenter);const half=(follow?13:baseHalf)/zoom;camera.left=-half*stageRect.width/stageRect.height;camera.right=-camera.left;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();camera.updateMatrixWorld();
    if(labelTick++%3===0){const occupied=[];for(const item of [...labelNodes].sort((a,b)=>(b.number?1:0)-(a.number?1:0))){projected.set(item.x,item.y,item.z).project(camera);const x=stageRect.left+(projected.x+1)*stageRect.width/2,y=stageRect.top+(1-projected.y)*stageRect.height/2;const width=item.el.offsetWidth||100,height=30;let visible=x>stageRect.left+width/2+5&&x<stageRect.right-width/2-5&&y>100&&y<stageRect.bottom-110&&Math.abs(projected.z)<1;if(visible){visible=!occupied.some(b=>Math.abs(x-b.x)<(width+b.width)/2+4&&Math.abs(y-b.y)<height+4);if(visible)occupied.push({x,y,width})}item.el.hidden=!visible;item.el.style.left=x+'px';item.el.style.top=y+'px'}}
    renderer.render(scene,camera);
  }
  $('#overviewButton').textContent=follow?'跟隨':'全景';updateProgress();requestAnimationFrame(animate);requestAnimationFrame(()=>{$('#loading').classList.add('ready');document.body.dataset.ready='true';setTimeout(()=>$('#loading').hidden=true,600)});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#errorText').textContent='圖形連線已中斷，請重新載入展示版。';$('#errorPanel').hidden=false});
}catch(error){console.error(error);$('#loading').hidden=true;$('#errorPanel').hidden=false;$('#errorText').textContent='無法建立 3D 場景：'+error.message+'。請使用支援 WebGL 的 Chrome 或 Edge。'}
updateProgress();
