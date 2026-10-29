export const STATIONS = {
  safety:{name:'安全規定區',x:17,z:19,order:0},
  map:{name:'配置看板',x:1,z:22.5,order:1},
  waiting:{name:'待命線（著裝區）',x:-5,z:13.5,order:2},
  medical:{name:'急救站',x:23,z:13.8},
  command:{name:'指揮臺',x:18,z:-5.5},
  control:{name:'預備槍管制區、彈藥管制區',x:17,z:2.5}
};
// Teaching-route collision bounds. The shooting and reserve areas are not walkable.
const BLOCKS = [
  [-1.5,3.5,19.5,21.2],[-9.8,-4.2,22.8,24.2],
  [-16.8,-13.2,17.2,18.8],[-16.8,-13.2,21.2,22.8],[-16.8,-13.2,25.2,26.8],
  [13.5,25.3,21.25,22.75],[13.5,25.3,24.25,25.75],
  [18,22,16.7,18.7],[19.1,22.9,8.1,10],[20,22,11.3,12.6],
  [17.6,22.4,-2.5,.9],[17.6,22.4,-9.1,-6.8],
  [10.2,13.8,18.2,19.8],[10.2,13.8,26.2,27.8]
];
export function canWalk(x,z) {
  const courtyard=x>=-12&&x<=25&&z>=7.6&&z<=28;
  const corridor=x>=13&&x<=25&&z>=-6&&z<=28;
  const entry=x>=-1&&x<=5&&z>=28&&z<=32;
  return (courtyard||corridor||entry)&&!BLOCKS.some(([a,b,c,d])=>x>a-.35&&x<b+.35&&z>c-.35&&z<d+.35);
}
export function findPath(start,end) {
  const step=.75,key=(x,z)=>`${x},${z}`,quant=v=>Math.round(v/step);
  const sx=quant(start.x),sz=quant(start.z),tx=quant(end.x),tz=quant(end.z);
  if(!canWalk(end.x,end.z))return [];
  const open=[{x:sx,z:sz,g:0,f:0}],cost=new Map([[key(sx,sz),0]]),prev=new Map();
  const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  let found=null;
  for(let tries=0;open.length&&tries<7000;tries++){
    open.sort((a,b)=>a.f-b.f);const n=open.shift(),nk=key(n.x,n.z);if(n.g>cost.get(nk))continue;
    if(Math.hypot(n.x-tx,n.z-tz)<=1){found=n;break}
    for(const [dx,dz] of dirs){const x=n.x+dx,z=n.z+dz;if(!canWalk(x*step,z*step))continue;if(dx&&dz&&(!canWalk(n.x*step,z*step)||!canWalk(x*step,n.z*step)))continue;const k=key(x,z),g=n.g+Math.hypot(dx,dz);if(g>=(cost.get(k)??Infinity))continue;cost.set(k,g);prev.set(k,n);open.push({x,z,g,f:g+Math.hypot(x-tx,z-tz)})}
  }
  if(!found)return [];
  const path=[];let n=found;while(n.x!==sx||n.z!==sz){path.unshift({x:n.x*step,z:n.z*step});n=prev.get(key(n.x,n.z));if(!n)return []}path.push({x:end.x,z:end.z});return path;
}
export function normaliseProgress(value){return Array.isArray(value)?[...new Set(value.filter(x=>['safety','map','waiting'].includes(x)))]:[]}
export const NOTES={
  safety:{title:'先認識環境，再依指示行動',text:'安全規定區是聽取說明的地方。遇到不清楚的指示，先詢問現場工作人員。'},
  map:{title:'一張地圖，幾種不同任務',text:'目標區在前方，後方依序可見射擊線、預備線與待命線；指揮、管制、急救等設施設在旁側。'},
  waiting:{title:'待命線也是著裝區',text:'認識待命線與預備線的差異，集合、著裝與移動都依現場人員安排。'}
};
