const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {createCanvas}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const source=fs.readFileSync('安全規定區-手繪等角試作.html','utf8');
const canvas=createCanvas(1100,740);canvas.addEventListener=()=>{};canvas.focus=()=>{};
const elements={scene:canvas,note:{hidden:true},status:{textContent:''},reset:{addEventListener(){}}};
const sandbox={console,document:{getElementById:id=>elements[id],createElement:()=>createCanvas(1100,740),querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){}};
vm.createContext(sandbox);vm.runInContext(source.match(/<script>([\s\S]*?)<\/script>/)[1],sandbox);
fs.writeFileSync('安全規定區-手繪等角預覽.png',canvas.toBuffer('image/png'));
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
check(canWalk(player.x,player.y),'spawn is walkable');
for(const end of [{x:3,y:2.25},{x:8.5,y:4.1},{x:6.4,y:1.1},{x:2,y:6.8}]){
 const steps=route(player,end);check(steps.length>0,'path found '+JSON.stringify(end));
 let prev={x:player.x,y:player.y};for(const p of steps){check(segmentClear(prev,p),'route does not cross obstacles');prev=p}
 waypoints=steps;destination=end;for(let i=0;i<1200&&waypoints.length;i++){update(1/60);check(canWalk(player.x,player.y),'movement remains walkable')}
 check(Math.hypot(player.x-end.x,player.y-end.y)<.1,'destination reached');
}
check(route(player,{x:7.3,y:2}).length===0,'table blocks clicks');
check(route(player,{x:-1,y:4}).length===0,'outside ground blocked');
player.x=5.1;player.y=6.8;keys.add('w');for(let i=0;i<30;i++)update(1/60);keys.clear();check(player.x<5.1&&player.y<6.8,'W moves up the screen');
keys.add('s');for(let i=0;i<500;i++)update(1/60);keys.clear();check(canWalk(player.x,player.y),'keyboard respects bounds');
player.x=3;player.y=2.25;update(0);check(near,'board proximity shows note');draw();
`,sandbox);
fs.writeFileSync('tmp/手繪等角-告示牌驗證.png',canvas.toBuffer('image/png'));
console.log('PASS: rendered; four routes reached safely; table/bounds block clicks; keyboard movement and boundaries; board proximity.');
