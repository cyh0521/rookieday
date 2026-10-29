const fs=require('fs');const root='DEMO/手繪風分檔版';let game=fs.readFileSync(root+'/game.js','utf8');
const routines=`function drawNPC(npc){const dir=dialogue.active?dialogue.npcDir:0;const sprite=dir===0?assets.npcIdle[npcIdleState.frame]:assets.npcViews[dir];c.save();const breathing=dialogue.active?0:Math.sin(sceneTime*1.5)*.35;c.drawImage(sprite.image,npc.left,npc.top+breathing,npc.width,npc.height);c.restore();}
`;
game=game.slice(0,game.indexOf('function drawNPC(npc)'))+routines+game.slice(game.indexOf('const dialogue='));
const start=game.indexOf('const dialogue='),end=game.indexOf("dialogueButton.addEventListener",start);
game=game.slice(0,start)+`const dialogue={active:false,armed:true,previousFocus:null,npcDir:0,scroll:null};
const dialoguePanel=document.getElementById('npcDialogue'),dialogueButton=document.getElementById('dialogueContinue');
const figure=canvas.closest('figure');
function facingDirection(sx,sy){return Math.abs(sx)>Math.abs(sy)*1.25?(sx<0?1:3):(sy<0?2:0)}
function lockPageScroll(){const body=document.body,html=document.documentElement;dialogue.scroll={x:window.scrollX||0,y:window.scrollY||0,body:body.style.cssText,html:html.style.cssText};const gap=window.innerWidth-html.clientWidth;body.style.position='fixed';body.style.top=-dialogue.scroll.y+'px';body.style.left=-dialogue.scroll.x+'px';body.style.width='100%';body.style.overflow='hidden';if(gap>0)body.style.paddingRight=gap+'px';html.style.overflow='hidden';}
function unlockPageScroll(){const saved=dialogue.scroll;if(!saved)return;document.body.style.cssText=saved.body;document.documentElement.style.cssText=saved.html;window.scrollTo({left:saved.x,top:saved.y,behavior:'instant'});dialogue.scroll=null;}
function npcDistance(){const npc=assets.records.find(a=>a.name==='instructor');return Math.hypot(player.x-npc.worldX,player.y-npc.worldY)}
function openNPCDialogue(){if(dialogue.active||!dialogue.armed)return;const npc=assets.records.find(a=>a.name==='instructor');
 const a=P(player.x,player.y),b=P(npc.worldX,npc.worldY);const sx=a[0]-b[0],sy=a[1]-b[1];
 dialogue.active=true;dialogue.armed=false;dialogue.previousFocus=document.activeElement;dialogue.npcDir=facingDirection(sx,sy);
 Object.assign(player,{dir:facingDirection(-sx,-sy),moving:false,step:0});keys.clear();waypoints=[];destination=null;
 npcIdleState.frame=0;npcIdleState.action=null;dialoguePanel.hidden=false;figure.classList.add('in-dialogue');document.getElementById('note').hidden=true;
 lockPageScroll();document.getElementById('status').textContent='正在與靶場教官對話。';dialogueButton.focus({preventScroll:true});
}
function closeNPCDialogue(){if(!dialogue.active)return;dialogue.active=false;dialoguePanel.hidden=true;figure.classList.remove('in-dialogue');keys.clear();player.moving=false;npcIdleState.next=npcIdleState.clock+4;
 document.getElementById('status').textContent='對話結束，離開教官身邊後可再次交談。';canvas.focus({preventScroll:true});unlockPageScroll();}
function checkNPCContact(){const distance=npcDistance();if(!dialogue.armed){if(distance>1.65)dialogue.armed=true;return;}if(distance<=1.02)openNPCDialogue();}
function blockDialogueScroll(event){if(dialogue.active)event.preventDefault();}
window.addEventListener('wheel',blockDialogueScroll,{passive:false});window.addEventListener('touchmove',blockDialogueScroll,{passive:false});
`+game.slice(end);
game=game.replace("if(event.key==='Tab'){event.preventDefault();dialogueButton.focus();return;}","if(event.key==='Tab'){event.preventDefault();dialogueButton.focus({preventScroll:true});return;}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown','Home','End'].includes(event.key)){event.preventDefault();return;}");
const forced="if(Math.hypot(end.x-npc.worldX,end.y-npc.worldY)<.55){end.x=npc.worldX+.65;end.y=npc.worldY+.65;}";
game=game.replace(forced,"if(Math.hypot(end.x-npc.worldX,end.y-npc.worldY)<.55){const dist=Math.hypot(player.x-npc.worldX,player.y-npc.worldY)||1;end.x=npc.worldX+(player.x-npc.worldX)/dist*.94;end.y=npc.worldY+(player.y-npc.worldY)/dist*.94;}");
game=game.replace('...assets.npcIdle].map','...assets.npcIdle,...assets.npcViews].map');
fs.writeFileSync(root+'/game.js',game);
let css=fs.readFileSync(root+'/style.css','utf8');css=css.slice(0,css.indexOf('.npc-dialogue{'))+`
.npc-dialogue{position:absolute;z-index:10;left:2.5%;right:2.5%;bottom:24px;min-height:76px;display:flex;align-items:center;padding:15px 48px 15px 136px;background:linear-gradient(110deg,#fffdf4fa,#f5eddeFA);border:2px solid #41463b;border-radius:18px;box-shadow:0 3px 12px #324f381a;isolation:isolate}
.dialogue-portrait{position:absolute;left:9px;bottom:0;width:114px;height:125px;overflow:hidden;pointer-events:none}.dialogue-portrait img{position:absolute;width:160px;height:200px;max-width:none;left:-23px;top:0;object-fit:contain}
#dialogueSpeaker{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.dialogue-copy p{font-size:18px;font-weight:700;letter-spacing:.045em;line-height:1.6;color:#303a31;margin:0}.dialogue-next{position:absolute;right:10px;bottom:9px;border:0;background:transparent!important;color:#ed873a;padding:6px;font-size:24px;border-radius:5px}.dialogue-next:focus-visible{outline:2px solid #e5873f}figure.in-dialogue .pad,figure.in-dialogue .note{display:none!important}
@media(max-width:650px){.npc-dialogue{left:8px;right:8px;bottom:10px;min-height:68px;padding:10px 30px 10px 88px;border-radius:14px}.dialogue-portrait{width:78px;height:98px;left:3px}.dialogue-portrait img{width:130px;height:162.5px;left:-25px;top:0}.dialogue-copy p{font-size:12px;letter-spacing:0;line-height:1.6}.dialogue-next{right:2px;bottom:5px;font-size:20px;padding:4px}}
`;
fs.writeFileSync(root+'/style.css',css);fs.appendFileSync(root+'/使用說明.txt','\n對話調整：任何方向接觸均觸發，角色留在原位置；教官依學生所在的畫面方向轉向，學生同時朝向教官。對話中固定頁面位置，鎖定捲軸、滾輪、觸控捲動及捲頁按鍵，關閉後恢復原位置。對話框縮為約 76px 高的橫框，無額外說話者行，左側半身立繪。\n');
console.log('Updated radial facing, fixed page scroll and compact dialogue layout.');
