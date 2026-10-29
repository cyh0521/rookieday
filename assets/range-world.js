/* World coordinates and separate drawable objects, not a flattened background. */
window.RANGE_WORLD={width:40,height:29,blocks:[],objects:[],lanes:[],zones:[],build(){
 const w=this;w.blocks=[];w.objects=[];
 const poly=(points,fill,stroke='#596550',line=1.5)=>{c.beginPath();points.forEach((p,i)=>{const q=P(...p);i?c.lineTo(...q):c.moveTo(...q)});c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke()}};
 const line=(a,b,color,width=2)=>{c.beginPath();c.moveTo(...P(...a));c.lineTo(...P(...b));c.strokeStyle=color;c.lineWidth=width;c.stroke()};
 const rect=(x,y,w,d,z,color)=>poly([[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]],color);
 const box=(x,y,w,d,h,color='#ad9877')=>{poly([[x,y,0],[x+w,y,0],[x+w,y,h],[x,y,h]],color);poly([[x+w,y,0],[x+w,y+d,0],[x+w,y+d,h],[x+w,y,h]],'#867d66');rect(x,y,w,d,h,'#ddc9a1')};
 const add=(x,y,render,block)=>{w.objects.push({depth:x+y,render});if(block)w.blocks.push(block)};
 const label=(x,y,z,text)=>{const q=P(x,y,z);c.save();c.font='bold 17px Microsoft JhengHei';const size=c.measureText(text).width+22;c.fillStyle='#fff7e6';c.strokeStyle='#51634d';c.lineWidth=1.5;c.beginPath();c.roundRect(q[0]-size/2,q[1]-25,size,29,5);c.fill();c.stroke();c.fillStyle='#3e5140';c.textAlign='center';c.fillText(text,q[0],q[1]-5);c.restore()};
 // Deterministic painted details: the same palette, fine outlines and warm tile edges as the original courtyard.
 const detail=(x,y,dx,dy,color,width=1)=>line([x,y],[x+dx,y+dy],color,width);
 const tuft=(x,y)=>{for(let k=0;k<4;k++)line([x+k*.045,y],[x+k*.045-.035,y,5+k%3*2],'#7d9d6a',1)};
 const wood=(x,y,w,d,z)=>{for(let i=.15;i<d;i+=.25)line([x+.08,y+i,z],[x+w-.08,y+i,z],'#ab8c574d',.8)};
 const stoneWall=(x,y)=>{poly([[x,y,0],[x,y+1.9,0],[x,y+1.9,64],[x,y,64]],'#9fac92');for(let z=16;z<64;z+=16){line([x,y,z],[x,y+1.9,z],'#6f816b',1);line([x,y,z+2],[x,y+1.9,z+2],'#c5cbb0',1);for(let yy=y+(z%32?.45:0);yy<y+1.9;yy+=.9)line([x,yy,z-15],[x,yy,z],'#6f816b',1)}rect(x-.14,y-.03,.35,1.96,65,'#d2d2b5');line([x-.14,y,67],[x-.14,y+1.9,67],'#f2e7c4',1.5)};
 const chair=(x,y)=>{add(x+.25,y+.25,()=>{shadow(x+.25,y+.25,20,9);for(const [a,b]of [[0,0],[.55,0],[0,.55],[.55,.55]]){line([x+a,y+b,0],[x+a,y+b,17],'#657860',2.4);line([x+a+.02,y+b,1],[x+a+.02,y+b,16],'#c9d1b0',.7)}line([x,y,2],[x+.55,y+.55,17],'#6b7b64',1.4);line([x+.55,y+.55,2],[x,y,17],'#6b7b64',1.4);rect(x,y,.55,.55,17,'#a8b78b');line([x+.55,y,18],[x+.55,y+.55,18],'#d4d9b7',1.3);poly([[x+.55,y,17],[x+.55,y+.55,17],[x+.55,y+.55,38],[x+.55,y,38]],'#a3b487');line([x+.55,y,35],[x+.55,y+.55,35],'#d7dfb9',1.4);line([x+.55,y,21],[x+.55,y+.55,21],'#7e956d',.8);for(const yy of [y+.06,y+.49]){const q=P(x+.55,yy,29);ellipse(q[0],q[1],1.3,1.3,'#e0dbb6')}},{x,y,w:.55,d:.55})};
 const sprite=(name,x,y,scale=1)=>{if(name==='range-chair'){chair(x,y);return}if(name==='range-table')name='table';
 if(name==='range-target'){add(x,y,()=>{shadow(x,y,30,12);for(const yy of [y-.5,y+.5]){line([x,yy],[x,yy,100],'#8c805a',4);line([x-.2,yy],[x+.3,yy],'#8c805a',3)}poly([[x,y-.6,25],[x,y+.6,25],[x,y+.6,100],[x,y-.6,100]],'#f6efd7');const q=P(x,y,61);ellipse(q[0],q[1],12,23,'#6b8272');ellipse(q[0],q[1],8,16,'#a4b29a');ellipse(q[0],q[1],4,8,'#c5956a');for(const yy of [y-.52,y+.52]){const v=P(x,yy,93);ellipse(v[0],v[1],1.6,1.6,'#b39d6b')}for(let i=0;i<4;i++)line([x,y-.44+i*.2,29],[x,y-.39+i*.2,32],'#ccbd9170',.8)});return}
 if(name==='range-ambulance'){add(x,y,()=>{
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
 const src=assets.records.find(a=>a.name===name);if(!src)return;add(x,y,()=>{const q=P(x,y);c.drawImage(src.image,q[0]-src.width*scale/2,q[1]-src.height*scale,src.width*scale,src.height*scale)})};
 const tent=(x,y,width,depth,title,roof,medical=false)=>{w.zones.push({name:title,x,y,width,depth});
 sprite('range-table',x+.7,y+depth/2,.85);if(title==='安全規定區'){sprite('bench',x+2.3,y+2,.95);w.blocks.push({x:x+2,y:y+1.3,w:.5,d:1.6})}if(title==='指揮臺'||title==='彈藥管制區')add(x+1,y+1,()=>{box(x+.7,y+.6,.55,.55,27,'#8c9f79');rect(x+.68,y+.58,.59,.59,29,'#acb893');line([x+.7,y+.86,30],[x+1.25,y+.86,30],'#6f8467',1.5)});w.blocks.push({x:x+.3,y:y+.5,w:1,d:depth-1});
 add(x+width,y+depth,()=>{const q=P(x+width/2,y+depth/2),f=P(player.x,player.y);const n=P(npcCentre.worldX,npcCentre.worldY);const fade=(Math.abs(f[0]-q[0])<210&&Math.abs(f[1]-q[1])<220)||(Math.abs(n[0]-q[0])<210&&Math.abs(n[1]-q[1])<220);c.save();if(fade)c.globalAlpha=.16;const color=title==='安全規定區'?'#c3a16e':'#8ba285';for(const a of [0,width])for(const b of [0,depth]){line([x+a,y+b],[x+a,y+b,116],'#657760',3);line([x+a+.04,y+b],[x+a+.04,y+b,116],'#c8cfac',1)}poly([[x-.2,y-.2,116],[x+width/2,y-.2,150],[x+width/2,y+depth+.2,150],[x-.2,y+depth+.2,116]],color);poly([[x+width/2,y-.2,150],[x+width+.2,y-.2,116],[x+width+.2,y+depth+.2,116],[x+width/2,y+depth+.2,150]],title==='安全規定區'?'#d9bc86':'#b4c29a');for(let yy=y;yy<y+depth;yy+=.7){line([x,yy,118],[x+width/2,yy,150],'#f5e8bc55',1);line([x+width/2,yy,150],[x+width,yy,118],'#eff2c955',1)}for(const xx of [x-.2,x+width+.2]){line([xx,y-.2,116],[xx,y+depth+.2,116],'#5e755d',2);line([xx,y-.2,109],[xx,y+depth+.2,109],'#8a9b76',2)}for(const a of [0,width])for(const b of [0,depth]){const q=P(x+a,y+b);ellipse(q[0],q[1],5,2.5,'#7f8a70');line([x+a,y+b,12],[x+a,y+b,112],'#e7e1bd',.8)}line([x+width/2,y-.2,151],[x+width/2,y+depth+.2,151],'#f1e8c2',1.6);c.restore();label(x+width/2,y+depth/2,210,title)});
 for(const [a,b]of [[0,0],[width,0],[0,depth],[width,depth]])w.blocks.push({x:x+a-.12,y:y+b-.12,w:.24,d:.24});
 };
 w.ground=()=>{poly([[0,29,0],[40,29,0],[40,29,-16],[0,29,-16]],'#698e6c');poly([[40,0,0],[40,29,0],[40,29,-16],[40,0,-16]],'#567e60');rect(0,0,40,29,0,'#a9c18a');rect(1,1,38,27,0,'#e1cf9e');rect(1.3,1.3,13.7,20.3,0,'#e7d4a8');
 // Reproducible hand-drawn speckles and subtle paved service path.
 for(let i=0;i<1700;i++){const x=1+((i*7919)%2800)/100,y=1+((i*3571)%2600)/100;const p=P(x,y);c.fillStyle=i%3?'#ad956020':'#fff8d04a';c.fillRect(p[0],p[1],2+(i%3),1)}
 rect(28,1,11,27,0,'#91ad7e');for(let x=28.2;x<38.7;x+=1.5)for(let y=1.2;y<27.7;y+=1.5){const tone=(Math.round(x*10+y*10)%4);rect(x,y,1.39,1.39,0,['#e6d7a8','#efe1b7','#dfd4a8','#d2cda7'][tone]);line([x,y,.7],[x+1.39,y,.7],'#fff4cf',2);line([x,y,.7],[x,y+1.39,.7],'#fff4cf',2);line([x+1.39,y],[x+1.39,y+1.39],'#b7a26b',1.2);for(let k=0;k<3;k++)detail(x+.2+k*.29,y+.3+(k%2)*.7,.16,.015,'#b9a36c40',.8)}
 for(let i=0;i<220;i++){const x=.2+((i*97)%390)/10,y=i%2?.55:28.45;tuft(x,y)}for(let y=1;y<28;y+=.65)tuft(39.45,y);
 // Narrow grass borders and limestone curb tie the large map to the courtyard.
 for(let y=1;y<28;y+=1.5){rect(27.65,y,.3,1.45,2,'#d5d5b2');line([27.65,y,3],[27.95,y,3],'#f5ebcb',1)}
 for(const [x,color] of [[15.6,'#c65d4f'],[18.1,'#fff8de']]){c.save();c.setLineDash([14,10]);line([x,1.5],[x,21],color,3);c.restore()}
 for(let i=0;i<5;i++){const y=3+i*4;rect(15.96,y-.74,1.78,1.48,0,'#536f6545');rect(16,y-.7,1.7,1.4,1,'#7eaaa0');rect(16.06,y-.64,1.58,1.28,1,'#91b5a6');for(let t=0;t<10;t++){const xx=16.1+t*.15;line([xx,y-.6,2],[xx,y+.6,2],'#bdd1b32d',.7)}line([16.07,y-.63,2],[17.63,y-.63,2],'#d5e0c1',1);line([16.07,y+.63,2],[17.63,y+.63,2],'#5e8a7c',1);for(const xx of [16.1,17.6])for(const yy of [y-.59,y+.59]){const q=P(xx,yy,2);ellipse(q[0],q[1],1.3,1,'#d3d5b0')}}
 label(15.6,1,2,'射擊／清驗槍線');label(20.4,2,2,'預備線');label(25.4,2,2,'待命線（著裝區）');};
 for(let i=0;i<5;i++){const y=3+i*4;w.lanes.push({target:{x:2.4,y},mat:{x:16.8,y}});sprite('range-target',2.4,y,.9);w.blocks.push({x:2.1,y:y-.6,w:.6,d:1.2});add(2.4,y,()=>label(2.4,y,111,String(i+1)));for(const x of [20,22,24,26])chair(x,y-.25)}
 for(let y=1;y<28;y+=2){add(.5,y,()=>stoneWall(.5,y),{x:0,y,w:.8,d:1.9});sprite('bush-left',.3,y,.9)}
 for(let x=2;x<29;x+=3){sprite('tree-left',x,.2,.8);sprite('bush-right',x,.5,1)}
 tent(31,2,3.3,3.5,'指揮臺','#668e81');tent(31,7,3.3,3.5,'預備槍管制區','#688b9a');tent(31,12,3.3,3.5,'彈藥管制區','#6f8e91');tent(31,17,3.3,3.5,'急救站','#ae6253',true);tent(31,22,4,4.7,'安全規定區','#ba9360');
 sprite('board',30.2,24.5,.8);w.blocks.push({x:29.9,y:23.9,w:.5,d:1.1});
 sprite('range-ambulance',36.8,19,.95);w.blocks.push({x:35.8,y:17.8,w:2,d:2.8});
 for(let y=2;y<28;y+=4){sprite('bush-right',39.3,y+1,.8);sprite('planter-left',38.5,y,.9);w.blocks.push({x:38.1,y:y-.4,w:.8,d:.8})}
 for(const y of [2,10,18,26]){sprite('fence-left',39.2,y,.9);w.blocks.push({x:38.9,y:y-.7,w:.3,d:1.4})}sprite('tree-right',39,27,1);sprite('tree-left',39,1,1);
 return w;
}};



