from pathlib import Path
p=Path('DEMO/手繪風分檔版/range-world.js');s=p.read_text(encoding='utf-8')
a=s.index(" if(name==='range-ambulance')");b=s.index(' const src=assets.records',a)
s=s[:a]+''' if(name==='range-ambulance'){add(x,y,()=>{
 shadow(x,y,94,36);const ax=x-.8,ay=y-1.2;
 // Panel silhouettes, inset glazing, wheels and small hardware are independent painted shapes.
 poly([[ax,ay,16],[ax+1.6,ay,16],[ax+1.6,ay+2.6,16],[ax,ay+2.6,16]],'#65776b');
 for(const yy of [ay+.45,ay+2.12]){const q=P(ax+1.62,yy,12);ellipse(q[0],q[1],12,17,'#56695e');ellipse(q[0],q[1],7,11,'#b6c0a5');ellipse(q[0],q[1],3,5,'#758979')}
 poly([[ax+1.6,ay,22],[ax+1.6,ay+2.6,22],[ax+1.6,ay+2.6,62],[ax+1.6,ay+1.75,78],[ax+1.6,ay,78]],'#d9dcc9');
 poly([[ax,ay+2.6,22],[ax+1.6,ay+2.6,22],[ax+1.6,ay+2.6,62],[ax,ay+2.6,62]],'#edf0db');
 rect(ax,ay,1.6,1.75,79,'#f5f0d9');poly([[ax,ay+1.75,79],[ax+1.6,ay+1.75,79],[ax+1.6,ay+2.6,62],[ax,ay+2.6,62]],'#a6bcb0');
 poly([[ax+.12,ay+1.87,76],[ax+1.48,ay+1.87,76],[ax+1.48,ay+2.48,64],[ax+.12,ay+2.48,64]],'#78978c');line([ax+.22,ay+1.95,75],[ax+.65,ay+2.43,65],'#dce5cf',2);
 for(const yy of [ay+.15,ay+.85])poly([[ax+1.61,yy,49],[ax+1.61,yy+.53,49],[ax+1.61,yy+.53,69],[ax+1.61,yy,69]],'#8da99b');
 poly([[ax+1.62,ay+.05,36],[ax+1.62,ay+2.55,36],[ax+1.62,ay+2.55,42],[ax+1.62,ay+.05,42]],'#ca7d65');
 line([ax+1.63,ay+1.55,24],[ax+1.63,ay+1.55,71],'#a1ad97',1);line([ax+1.64,ay+1.32,45],[ax+1.64,ay+1.46,45],'#687f6e',2.5);
 rect(ax+.35,ay+.3,.9,.35,84,'#d98c6d');rect(ax+.35,ay+.3,.45,.35,85,'#f0b08a');
 const cross=(xx,yy,z)=>{const q=P(xx,yy,z);c.fillStyle='#c87f65';c.fillRect(q[0]-10,q[1]-3,20,6);c.fillRect(q[0]-3,q[1]-10,6,20)};cross(ax+.85,ay+.9,80);
 for(const xx of [ax+.22,ax+1.38]){const q=P(xx,ay+2.62,49);ellipse(q[0],q[1],5,3.5,'#f5dda0');}line([ax+.42,ay+2.63,37],[ax+1.18,ay+2.63,37],'#7c8e7d',4);line([ax+.08,ay+2.64,27],[ax+1.52,ay+2.64,27],'#9dac96',4);
 });return}
'''+s[b:]
p.write_text(s,encoding='utf-8')
