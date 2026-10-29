const fs=require('fs'),vm=require('vm');
const {createCanvas,Image}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const source=fs.readFileSync('DEMO/安全規定區-預渲染模型風.html','utf8');
const canvas=createCanvas(1100,740);canvas.addEventListener=()=>{};canvas.focus=()=>{};
const elements={scene:canvas,note:{hidden:true},status:{textContent:''},reset:{addEventListener(){}}};
const sandbox={console,Image,document:{getElementById:id=>elements[id],querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){}};
vm.createContext(sandbox);vm.runInContext(source.match(/<script>([\s\S]*?)<\/script>/)[1],sandbox);
setTimeout(()=>{
vm.runInContext(`if(!ready)throw Error('Images not ready');draw()`,sandbox);
fs.writeFileSync('DEMO/安全規定區-預渲染模型風預覽.png',canvas.toBuffer('image/png'));
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
for(const end of [{x:3,y:2.25},{x:8.5,y:4.1},{x:6.4,y:1.1},{x:2,y:6.8}]){const steps=route(player,end);check(steps.length>0,'path found');let prev={x:player.x,y:player.y};for(const p of steps){check(segmentClear(prev,p),'clear route');prev=p}waypoints=steps;destination=end;for(let i=0;i<1200&&waypoints.length;i++){update(1/60);check(canWalk(player.x,player.y),'movement walkable')}check(Math.hypot(player.x-end.x,player.y-end.y)<.1,'destination reached')}
check(route(player,{x:7.3,y:2}).length===0,'table blocked');
check(route(player,{x:-1,y:4}).length===0,'outside blocked');
player.x=5.1;player.y=6.8;keys.add('w');for(let i=0;i<30;i++)update(1/60);keys.clear();check(player.x<5.1&&player.y<6.8,'W moves up');
for(let dir=0;dir<8;dir++){player.dir=dir;player.moving=true;player.step=4;draw()}
player.x=3;player.y=2.25;update(0);check(near,'notice proximity');draw();
`,sandbox);
fs.writeFileSync('tmp/預渲染-告示牌驗證.png',canvas.toBuffer('image/png'));
console.log('PASS: 38 embedded model sprites decoded; 8 walking directions rendered; four paths; obstacles and bounds; keyboard and proximity.');
},100);
