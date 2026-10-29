import * as THREE from 'three';
import {RangeSession,ROUNDS,scorePoint} from './core.js';
import {buildWorld,TARGET,paperCanvas} from './world.js';
import {makeWeapon} from './weapon.js';
const $=s=>document.querySelector(s),session=new RangeSession();
const settings={sensitivity:1,volume:.25,reduceMotion:true,quality:'medium'};
let renderer,world,weapon,camera,scene,ready=false,lastPhase='',lastRound=-1,viewRound=0;
let yaw=0,pitch=0,aimBlend=0,toastUntil=0,audio,transitionBlock=0,hasAimed=false;
const eye=new THREE.Vector3(0,.46,4.1),basePitch=Math.atan2(TARGET.y-eye.y,eye.z-TARGET.z);
const assetNames=['M4A1.fbx','M4A1_Base_Color.png','M4A1_Normal.png','M4A1_Metallic.png','M4A1_Roughness.png'];
const assets=Object.fromEntries(assetNames.map(f=>[f,window.__RANGE_ASSETS__?.[f]??'../viewer/assets/'+f]));
function toast(message){$('#toast').textContent=message;$('#toast').style.opacity=1;toastUntil=performance.now()+2600;}
function sound(type){
  if(!audio||settings.volume===0)return;
  const t=audio.currentTime,g=audio.createGain();g.connect(audio.destination);
  if(type==='shot'){
    const b=audio.createBuffer(1,Math.round(audio.sampleRate*.16),audio.sampleRate),data=b.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/data.length*9);
    const s=audio.createBufferSource(),f=audio.createBiquadFilter();s.buffer=b;f.type='lowpass';f.frequency.value=1800;g.gain.value=settings.volume*.35;s.connect(f);f.connect(g);s.start(t);s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();};
  }else{
    const o=audio.createOscillator();o.type='triangle';o.frequency.setValueAtTime(type==='reload'?380:660,t);o.frequency.exponentialRampToValueAtTime(110,t+.10);g.gain.setValueAtTime(settings.volume*.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(g);o.start(t);o.stop(t+.13);o.onended=()=>{o.disconnect();g.disconnect();};
  }
}
function enableAudio(){try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});}catch{}}
function releasePointer(){if(document.pointerLockElement)document.exitPointerLock();}
function start(){if(!ready)return;enableAudio();session.reset();session.start();world.clear();yaw=0;pitch=0;hasAimed=false;transitionBlock=performance.now()+250;sync();}
function pause(reason='準備好後繼續。'){
  if(session.pause()){$('#pauseReason').textContent=reason;releasePointer();sync();}
}
function reload(){if(!ready)return;if(session.reload()){sound('reload');sync();}else if(session.phase==='active')toast('目前彈匣已足夠完成本回合。');}
function aim(){if(session.setAim(!session.aimed)){hasAimed ||= session.aimed;sync();}}
function shoot(){
  if(performance.now()<transitionBlock||!ready)return;
  if(session.phase!=='active')return;
  if(session.ammo===0){toast('請先按右鍵換彈匣。');return;}
  camera.rotation.set(basePitch+pitch,yaw,0,'YXZ');
  const p=world.trace(camera),shot=session.shoot(p?scorePoint(p.x,p.y):null);
  if(!shot)return;
  sound('shot');weapon.shot();world.mark(shot);
  if(shot.hit)toast(`第 ${shot.index} 次 · ${shot.score} 環`);else toast(`第 ${shot.index} 次 · 未命中圓環`);
  if(session.phase==='review'){releasePointer();viewRound=session.round;}
  sync();
}
function summary(shots){return {hits:shots.filter(s=>s.hit).length,total:shots.length,score:shots.reduce((v,s)=>v+s.score,0)};}
function drawResult(round){
  const c=$('#resultCanvas'),g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);
  g.fillStyle='#f3f1e7';g.fillRect(0,0,c.width,c.height);
  const p=paperCanvas('03',600),w=548,h=w*TARGET.height/TARGET.width,x=(c.width-w)/2,y=34;
  g.drawImage(p,x,y,w,h);
  const shots=session.rounds[round],colors=['#bd713f','#bd713f','#376d76'];
  for(const s of shots){
    if(s.x===null||Math.abs(s.x)>TARGET.width/2||Math.abs(s.y)>TARGET.height/2)continue;
    const px=x+w/2+s.x/TARGET.width*w,py=y+h/2-s.y/TARGET.height*h;
    g.beginPath();g.arc(px,py,6.5,0,Math.PI*2);g.fillStyle=colors[round];g.fill();g.strokeStyle='#fff6e4';g.lineWidth=2;g.stroke();
    g.font='bold 14px sans-serif';g.fillStyle=colors[round];g.fillText(String(s.index),px+10,py-8);
  }
  const s=summary(shots);g.fillStyle='#486249';g.font='14px sans-serif';g.textAlign='center';g.fillText(`${ROUNDS[round].name}  |  ${s.hits} / ${s.total} 命中  |  ${s.score} 遊戲環分`,c.width/2,c.height-19);g.textAlign='left';
  $('#boardCounter').textContent=ROUNDS[round].name;
  document.querySelectorAll('#roundTabs button').forEach(b=>b.classList.toggle('active',Number(b.dataset.round)===round));
}
function review(){
  const complete=session.phase==='complete',shots=complete?session.rounds.slice(1).flat():session.shots,s=summary(shots);
  $('#reviewTitle').textContent=complete?'完成了，看看自己的紀錄。':session.round===0?'準備好進入自主練習。':'回看這一張紙靶。';
  $('#reviewLabel').textContent=complete?'SESSION COMPLETE':`ROUND REVIEW / ${session.config.label}`;
  $('#reviewDescription').textContent=complete?'以下統計兩個自主回合。可切換右側靶紙，查看每一回合的落點。':`${session.config.name}已完成。每個落點都保留在右側紙靶。`;
  $('#resultHits').textContent=`${s.hits} / ${s.total}`;$('#resultScore').textContent=`${s.score} / ${s.total*6}`;$('#resultShots').textContent=complete?'2 回合':`${s.total} 次`;
  $('#feedbackText').textContent=complete?'可下載這次落點圖，或重新練習。下次仍會從簡短引導開始。':session.round===0?'接下來有兩個自主回合，每回合 5 次。新回合先按右鍵換彈匣。':session.round===1?'下一回合保持相同靶位與紙靶，減少提示，按照自己的步調完成。':'兩個回合已完成。查看總結，或先下載本回合紙靶。';
  $('#next').innerHTML=complete?'重新練習 <span>↻</span>':session.round===2?'查看總結 <span>→</span>':'下一回合 <span>→</span>';
  $('#roundTabs').replaceChildren();
  for(let i=0;i<=session.round;i++){const b=document.createElement('button');b.type='button';b.textContent=ROUNDS[i].name;b.dataset.round=i;b.onclick=()=>{viewRound=i;drawResult(i);};$('#roundTabs').append(b);}
  drawResult(viewRound);
  if(complete){try{localStorage.setItem('field03-last-summary',JSON.stringify({date:new Date().toISOString(),rounds:session.rounds,weapon:'M4A1',posture:'prone'}));}catch{}}
}
function sync(){
  const phase=session.phase,playing=['active','reloading'].includes(phase),reviewing=['review','complete'].includes(phase);
  $('#intro').hidden=phase!=='intro';$('#hud').hidden=!playing;$('#pause').hidden=phase!=='paused';$('#review').hidden=!reviewing;
  $('#pauseButton').hidden=!playing;
  const status={intro:'準備',active:'開始',reloading:'換彈匣中',paused:'停止',review:'回合結束',complete:'完成'};
  $('#status').textContent=status[phase]||'準備';$('#status').classList.toggle('stopped',!playing);
  $('#roundLabel').textContent=session.config.name;$('#roundNumber').textContent=session.config.label;
  $('#ammo').textContent=String(session.ammo).padStart(2,'0');$('#remaining').textContent=`剩餘練習 ${session.remaining} 次`;
  $('#aimButton').classList.toggle('active',session.aimed);$('#aimButton').setAttribute('aria-pressed',String(session.aimed));
  $('#reloadMeter').hidden=phase!=='reloading';$('#reloadButton').disabled=phase==='reloading';$('#fireButton').disabled=phase!=='active'||session.ammo===0;
  let n='01',title='右鍵換彈匣',body='完成後按空白鍵切換瞄具視角。';
  if(phase==='reloading'){title='正在更換彈匣';body='換彈匣完成後即可繼續。';}
  else if(session.ammo>0){n=hasAimed?'03':'02';title=!hasAimed?'按空白鍵進入瞄具視角':'左鍵射擊 · 對準 03 號紙靶';body=session.round===0?'移動滑鼠調整視角，依自己的步調完成 3 次。':'完成本回合後，自動進入靶紙回顧。';}
  if(session.round===2&&session.ammo>0){title='自主練習 02';body='保持自己的節奏；Esc 可隨時暫停。';}
  $('#hintIndex').textContent=n;$('#hintTitle').textContent=title;$('#hintText').textContent=body;
  if(reviewing&&(lastPhase!==phase||lastRound!==session.round))review();
  lastPhase=phase;lastRound=session.round;
}
function home(){releasePointer();session.reset();world.clear();yaw=0;pitch=0;hasAimed=false;sync();}
$('#start').onclick=start;$('#pauseButton').onclick=()=>pause();$('#resume').onclick=()=>{session.resume();transitionBlock=performance.now()+200;sync();};$('#restart').onclick=start;$('#home').onclick=home;$('#brand').onclick=e=>{e.preventDefault();if(session.phase==='intro')return;pause('練習已暫停，可繼續或重新開始。');};
$('#aimButton').onclick=aim;$('#reloadButton').onclick=reload;$('#fireButton').onclick=shoot;
$('#next').onclick=()=>{if(session.phase==='complete'){start();return;}session.advance();world.clear();yaw=0;pitch=0;hasAimed=false;transitionBlock=performance.now()+200;sync();};
$('#saveResult').onclick=()=>{const a=document.createElement('a');a.download=`靜靶-臥姿-${ROUNDS[viewRound].name}.png`;a.href=$('#resultCanvas').toDataURL('image/png');a.click();};
function openDialog(id){pause('設定完成後，按「繼續練習」返回。');$('#'+id).showModal();}
$('#settingsButton').onclick=()=>openDialog('settings');$('#aboutButton').onclick=()=>openDialog('about');document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());
$('#sensitivity').oninput=e=>{settings.sensitivity=Number(e.target.value);$('#sensitivityValue').textContent=settings.sensitivity.toFixed(1);};
$('#volume').oninput=e=>{settings.volume=Number(e.target.value);$('#volumeValue').textContent=`${Math.round(settings.volume*100)}%`;};
$('#reduceMotion').onchange=e=>settings.reduceMotion=e.target.checked;$('#quality').onchange=e=>{settings.quality=e.target.value;world?.quality(settings.quality);};
$('#lockButton').onclick=async()=>{if(!['active','reloading'].includes(session.phase))return;try{await renderer.domElement.requestPointerLock();}catch{toast('此瀏覽器不允許鎖定游標，仍可使用游標模式。');}};
document.addEventListener('pointerlockchange',()=>{const locked=!!document.pointerLockElement;$('#pointerHint').textContent=locked?'游標已鎖定 · Esc 暫停':'游標模式';if(!locked&&['active','reloading'].includes(session.phase))pause('游標已釋放，練習暫停。');});
document.addEventListener('keydown',e=>{
  if($('dialog[open]')||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
  if(e.code==='Escape'){e.preventDefault();if(session.phase==='paused'){session.resume();sync();}else pause();}
  if(!['active','reloading'].includes(session.phase)||e.repeat)return;
  if(e.code==='Space'){e.preventDefault();aim();}if(e.code==='KeyR'){e.preventDefault();reload();}
});
window.addEventListener('blur',()=>pause('你已切換視窗，練習自動暫停。'));document.addEventListener('visibilitychange',()=>{if(document.hidden)pause('畫面已離開，練習自動暫停。');});
try{
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.autoClear=false;$('#viewport').append(renderer.domElement);
  scene=new THREE.Scene();scene.fog=new THREE.Fog('#b4c1ad',38,140);camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.04,200);camera.rotation.order='YXZ';camera.position.copy(eye);
  world=buildWorld(scene,renderer);$('#loadText').textContent='準備 M4A1 與機械瞄具';weapon=await makeWeapon(renderer,assets);ready=true;$('#loading').hidden=true;sync();
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();pause('3D 畫面中斷，請重新載入頁面。');});
  renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
  renderer.domElement.addEventListener('pointerdown',e=>{if(e.button===2){e.preventDefault();reload();}else if(e.button===0)shoot();});
  renderer.domElement.addEventListener('pointermove',e=>{
    if(!['active','reloading'].includes(session.phase))return;
    if(document.pointerLockElement){yaw-=e.movementX*.00075*settings.sensitivity;pitch-=e.movementY*.00075*settings.sensitivity;}
    else{const r=renderer.domElement.getBoundingClientRect();yaw=-((e.clientX-r.left)/r.width-.5)*.30*settings.sensitivity;pitch=-((e.clientY-r.top)/r.height-.5)*.20*settings.sensitivity;}
    yaw=THREE.MathUtils.clamp(yaw,-.18,.18);pitch=THREE.MathUtils.clamp(pitch,-.14,.14);
  });
  const clock=new THREE.Clock();let t=0;
  function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);t+=dt;const prev=session.phase;session.tick(dt);if(session.phase!==prev)sync();
    aimBlend=THREE.MathUtils.damp(aimBlend,session.aimed?1:0,12,dt);
    camera.position.copy(eye);camera.rotation.set(basePitch+pitch,yaw,0,'YXZ');camera.fov=THREE.MathUtils.lerp(62,38,aimBlend);camera.updateProjectionMatrix();
    if(session.phase==='intro'){camera.position.set(0,.57,4.7);camera.rotation.set(basePitch,-.025,0,'YXZ');}
    weapon.frame(dt,session.aimed,session.phase==='reloading',session.reloadLeft,settings.reduceMotion,camera.fov,session.phase);
    renderer.clear();renderer.render(scene,camera);
    if(!['intro','complete'].includes(session.phase)){renderer.clearDepth();renderer.render(weapon.scene,weapon.camera);}
    if(session.phase==='reloading')$('#reloadBar').style.width=`${(1-session.reloadLeft/1.7)*100}%`;
    if(toastUntil&&performance.now()>toastUntil){$('#toast').style.opacity=0;toastUntil=0;}
  }frame();
  window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
  // Read-only diagnostic state used by local QA; it cannot fire or bypass game rules.
  window.rangeDiagnostics=()=>({phase:session.phase,round:session.round,ammo:session.ammo,shots:session.rounds.map(s=>s.length),eyeHeight:eye.y,weapon:'M4A1',aimed:session.aimed,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles});
}catch(error){console.error(error);$('#loading').hidden=true;$('#error').hidden=false;$('#errorMessage').textContent='請使用支援 WebGL 的 Chrome 或 Edge，並確認遊戲檔案完整。詳細原因：'+error.message;$('#status').textContent='無法載入';}
