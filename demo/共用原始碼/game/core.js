// Browser-independent rules for the virtual range. Units and scores are game values.
export const ROUNDS = [
  {name:'引導練習', limit:3, label:'B1', guided:true},
  {name:'自主練習 01', limit:5, label:'B2', guided:false},
  {name:'自主練習 02', limit:5, label:'B2', guided:false},
];
export class RangeSession {
  constructor(){ this.reset(); }
  reset(){ this.phase='intro'; this.round=0; this.ammo=0; this.rounds=ROUNDS.map(()=>[]); this.reloadLeft=0; this.cooldown=0; this.aimed=false; this.pausedFrom=null; this.elapsed=0; }
  get config(){ return ROUNDS[this.round]; }
  get shots(){ return this.rounds[this.round]; }
  get remaining(){ return this.config.limit-this.shots.length; }
  start(){ if(this.phase!=='intro')return false; this.phase='active'; return true; }
  setAim(v){ if(!['active','reloading'].includes(this.phase))return false; this.aimed=!!v; return true; }
  reload(){ if(this.phase!=='active'||this.remaining<=0||this.ammo>=Math.min(5,this.remaining))return false; this.phase='reloading'; this.reloadLeft=1.7; this.aimed=false; return true; }
  shoot(hit){
    if(this.phase!=='active'||this.ammo<=0||this.cooldown>0||this.remaining<=0)return null;
    const shot={x:hit?.x??null,y:hit?.y??null,hit:!!hit?.hit,score:hit?.score??0,index:this.shots.length+1};
    this.shots.push(shot); this.ammo--; this.cooldown=.22;
    if(this.remaining===0){this.phase='review'; this.aimed=false;}
    return shot;
  }
  tick(dt){
    if(!['active','reloading'].includes(this.phase))return;
    this.elapsed+=dt; this.cooldown=Math.max(0,this.cooldown-dt);
    if(this.phase==='reloading'){
      this.reloadLeft=Math.max(0,this.reloadLeft-dt);
      if(this.reloadLeft===0){this.ammo=Math.min(5,this.remaining);this.phase='active';}
    }
  }
  pause(){ if(!['active','reloading'].includes(this.phase))return false; this.pausedFrom=this.phase; this.phase='paused'; return true; }
  resume(){ if(this.phase!=='paused')return false; this.phase=this.pausedFrom; this.pausedFrom=null; return true; }
  advance(){
    if(this.phase!=='review')return false;
    if(this.round===ROUNDS.length-1){this.phase='complete';return true;}
    this.round++;this.ammo=0;this.reloadLeft=0;this.cooldown=0;this.aimed=false;this.phase='active';return true;
  }
}
export function scorePoint(x,y){
  const radius=Math.hypot(x,y), hit=radius<=.55;
  return {x,y,hit,score:hit?Math.max(1,6-Math.floor(radius/(.55/6))):0};
}
