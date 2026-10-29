const fs=require('fs');
const root='DEMO/手繪風分檔版';
let html=fs.readFileSync(root+'/index.html','utf8');
html=html.replace('</figure>',`<section id="npcDialogue" class="npc-dialogue" role="dialog" aria-modal="true" aria-labelledby="dialogueSpeaker" aria-describedby="dialogueText" hidden>
<div class="dialogue-portrait" aria-hidden="true"><img src="images/characters/npc-front-idle-0.png" alt=""></div>
<div class="dialogue-copy"><div id="dialogueSpeaker">靶場教官</div><p id="dialogueText">這裡有一張自願留營表，你要簽一下嗎？</p></div>
<button id="dialogueContinue" class="dialogue-next" aria-label="結束對話，返回場景">▶</button>
</section></figure>`);
fs.writeFileSync(root+'/index.html',html);
fs.appendFileSync(root+'/style.css',`
.npc-dialogue{position:absolute;z-index:10;left:2.5%;right:2.5%;bottom:24px;min-height:112px;display:flex;align-items:center;padding:20px 65px 20px 170px;background:linear-gradient(110deg,#fffdf3f7,#f5edddfa);border:3px solid #444d42;border-radius:22px;box-shadow:0 5px 20px #324f3825;isolation:isolate}
.dialogue-portrait{position:absolute;left:8px;bottom:0;width:152px;height:158px;overflow:hidden;pointer-events:none}.dialogue-portrait img{position:absolute;width:220px;height:275px;max-width:none;left:-34px;top:-3px;object-fit:contain}
#dialogueSpeaker{font-size:12px;font-weight:700;color:#6b8060;letter-spacing:.15em;margin-bottom:9px}.dialogue-copy p{font-size:20px;font-weight:700;letter-spacing:.045em;line-height:1.6;color:#303a31;margin:0}.dialogue-next{position:absolute;right:15px;bottom:14px;border:0;background:transparent!important;color:#e5873f;padding:10px;font-size:24px;border-radius:6px}.dialogue-next:focus-visible{outline:2px solid #e5873f;outline-offset:2px}figure.in-dialogue .pad,figure.in-dialogue .note{display:none!important}
@media(max-width:650px){.npc-dialogue{left:8px;right:8px;bottom:10px;min-height:96px;padding:13px 38px 13px 90px;border-width:2px;border-radius:14px}.dialogue-portrait{width:82px;height:118px;left:2px}.dialogue-portrait img{width:154px;height:193px;left:-36px;top:0}.dialogue-copy p{font-size:13px;letter-spacing:0;line-height:1.65}#dialogueSpeaker{font-size:10px;margin-bottom:5px}.dialogue-next{right:2px;bottom:7px;font-size:20px;padding:6px}}
`);
let game=fs.readFileSync(root+'/game.js','utf8');
const logic=`
const dialogue={active:false,armed:true,previousFocus:null};
const dialoguePanel=document.getElementById('npcDialogue'),dialogueButton=document.getElementById('dialogueContinue');
const figure=canvas.closest('figure');
function npcDistance(){const npc=assets.records.find(a=>a.name==='instructor');return Math.hypot(player.x-npc.worldX,player.y-npc.worldY)}
function openNPCDialogue(){if(dialogue.active||!dialogue.armed)return;const npc=assets.records.find(a=>a.name==='instructor');
 // Stage the conversation directly below the instructor so both face each other.
 const x=npc.worldX+.8,y=npc.worldY+.8;if(!canWalk(x,y))return;
 dialogue.active=true;dialogue.armed=false;dialogue.previousFocus=document.activeElement;
 Object.assign(player,{x,y,dir:2,face:'back',moving:false,step:0});keys.clear();waypoints=[];destination=null;
 npcIdleState.frame=0;npcIdleState.action=null;dialoguePanel.hidden=false;figure.classList.add('in-dialogue');document.getElementById('note').hidden=true;
 document.getElementById('status').textContent='正在與靶場教官對話。';dialogueButton.focus();
}
function closeNPCDialogue(){if(!dialogue.active)return;dialogue.active=false;dialoguePanel.hidden=true;figure.classList.remove('in-dialogue');keys.clear();player.moving=false;npcIdleState.next=npcIdleState.clock+4;
 document.getElementById('status').textContent='對話結束，離開教官身邊後可再次交談。';canvas.focus();}
function checkNPCContact(){const distance=npcDistance();if(!dialogue.armed){if(distance>1.65)dialogue.armed=true;return;}if(distance<=1.02)openNPCDialogue();}
dialogueButton.addEventListener('click',closeNPCDialogue);
window.addEventListener('keydown',event=>{if(!dialogue.active)return;if(['Enter',' ','Escape'].includes(event.key)){event.preventDefault();if(!event.repeat)closeNPCDialogue();}},true);
`;
game=game.replace('function draw(){',logic+'\nfunction draw(){');
game=game.replace('function drawNPCBubble(){','function drawNPCBubble(){if(dialogue.active)return;');
game=game.replace('function update(dt){sceneTime+=dt;updateNPCIdle(dt);','function update(dt){sceneTime+=dt;if(dialogue.active){player.moving=false;return;}updateNPCIdle(dt);');
game=game.replace('if(!player.moving)player.step=0;','if(!player.moving)player.step=0;checkNPCContact();if(dialogue.active)return;');
game=game.replace("window.addEventListener('keydown',e=>{if(e.target.tagName==='BUTTON')return;","window.addEventListener('keydown',e=>{if(dialogue.active||e.defaultPrevented||e.target.tagName==='BUTTON')return;");
game=game.replace("canvas.addEventListener('pointerdown',e=>{canvas.focus();","canvas.addEventListener('pointerdown',e=>{if(dialogue.active)return;canvas.focus();");
// Clicks on the NPC take the student to a reachable contact point instead of a blocked hitbox.
game=game.replace("const path=route(player,end);if(path.length)","const npc=assets.records.find(a=>a.name==='instructor');if(Math.hypot(end.x-npc.worldX,end.y-npc.worldY)<.55){end.x=npc.worldX+.65;end.y=npc.worldY+.65;}const path=route(player,end);if(path.length)");
game=game.replace("b.addEventListener('pointerdown',e=>{e.preventDefault();","b.addEventListener('pointerdown',e=>{if(dialogue.active)return;e.preventDefault();");
game=game.replace("addEventListener('click',()=>{Object.assign(player", "addEventListener('click',()=>{closeNPCDialogue();dialogue.armed=true;Object.assign(player");
fs.writeFileSync(root+'/game.js',game);
fs.appendFileSync(root+'/使用說明.txt','\nNPC 對話：主角進入教官身旁的接觸範圍自動開啟；對話時學生移至教官正前方、背對鏡頭，教官正面朝下。暫停移動與 NPC 待機動作，底部顯示教官立繪和指定台詞。按橘色箭頭、Enter、空白鍵或 Esc 結束。離開觸發範圍後才會再次觸發，避免對話連續彈出。點選 NPC 腳下可自動走近。\n');
console.log('Added contact dialogue, face-to-face staging, input lock, and leave-to-rearm.');
