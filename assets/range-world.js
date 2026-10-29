/* World coordinates and separate drawable objects, not a flattened background. */
window.RANGE_WORLD={width:50,height:40,minX:-10,minY:-10,blocks:[],objects:[],lanes:[],zones:[],build(){
 const w=this;w.blocks=[];w.objects=[];w.lanes=[];w.zones=[];
 const poly=(points,fill,stroke='#596550',line=1.5)=>{c.beginPath();points.forEach((p,i)=>{const q=P(...p);i?c.lineTo(...q):c.moveTo(...q)});c.closePath();if(/^#[0-9a-f]{6}$/i.test(fill)){const a=P(...points[0]),b=P(...points[Math.floor(points.length/2)]),g=c.createLinearGradient(a[0],a[1],b[0]+.01,b[1]+.01);g.addColorStop(0,fill);g.addColorStop(1,fill);c.fillStyle=g}else c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke()}};
 const line=(a,b,color,width=2)=>{c.beginPath();c.moveTo(...P(...a));c.lineTo(...P(...b));c.strokeStyle=color;c.lineWidth=width;c.stroke()};
 const rect=(x,y,w,d,z,color)=>poly([[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]],color);
 const box=(x,y,w,d,h,color='#ad9877')=>{poly([[x,y,0],[x+w,y,0],[x+w,y,h],[x,y,h]],color);poly([[x+w,y,0],[x+w,y+d,0],[x+w,y+d,h],[x+w,y,h]],'#867d66');rect(x,y,w,d,h,'#ddc9a1')};
 const add=(x,y,render,block)=>{w.objects.push({depth:x+y,render});if(block)w.blocks.push(block)};
 const label=(x,y,z,text)=>{const q=P(x,y,z);c.save();c.font='bold 17px Microsoft JhengHei';const size=c.measureText(text).width+22;c.fillStyle='#fff8e8';c.strokeStyle='#51634d';c.lineWidth=1.5;c.beginPath();c.roundRect(q[0]-size/2,q[1]-25,size,29,5);c.fill();c.stroke();c.fillStyle='#3e5140';c.textAlign='center';c.fillText(text,q[0],q[1]-5);c.restore()};
 // Deterministic painted details: the same palette, fine outlines and warm tile edges as the original courtyard.
 const detail=(x,y,dx,dy,color,width=1)=>line([x,y],[x+dx,y+dy],color,width);
 const tuft=(x,y)=>{for(let k=0;k<4;k++)line([x+k*.045,y],[x+k*.045-.035,y,5+k%3*2],'#7d9d6a',1)};
 const wood=(x,y,w,d,z)=>{for(let i=.15;i<d;i+=.25)line([x+.08,y+i,z],[x+w-.08,y+i,z],'#ab8c574d',.8)};
 const stoneWall=(x,y)=>{poly([[x,y,0],[x,y+1.9,0],[x,y+1.9,64],[x,y,64]],'#9fac92');for(let z=16;z<64;z+=16){line([x,y,z],[x,y+1.9,z],'#6f816b',1);line([x,y,z+2],[x,y+1.9,z+2],'#c5cbb0',1);for(let yy=y+(z%32?.45:0);yy<y+1.9;yy+=.9)line([x,yy,z-15],[x,yy,z],'#6f816b',1)}rect(x-.14,y-.03,.35,1.96,65,'#d2d2b5');line([x-.14,y,67],[x-.14,y+1.9,67],'#f2e7c4',1.5)};
 // Static crop bounds avoid getImageData: file:// images may taint a browser canvas.
 const preparePlant=a=>{if(!a.atlasCell||a.paintedImage)return;
 const [sx,sy,sw,sh]=a.atlasCell,out=document.createElement('canvas');out.width=sw;out.height=sh;
 out.getContext('2d').drawImage(a.image,sx,sy,sw,sh,0,0,sw,sh);
 a.paintedImage=out;a.height=a.width*sh/sw;
 };
 const plantContact=(x,y,width,tree)=>{const q=P(x,y),rx=width*(tree?.16:.33),ry=rx*.38;
 c.save();c.translate(q[0],q[1]-1);c.scale(1,ry/rx);const g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,tree?'#51482955':'#51482938');g.addColorStop(.4,'#61513225');g.addColorStop(1,'#61513200');ellipse(0,0,rx,rx,g);c.restore();};
 const sprite=(name,x,y,scale=1)=>{if(['range-shrub','sun-shrub','bush-left','bush-right'].includes(name))name='range-shrub-v3-'+(1+Math.abs(Math.round(x*13.7+y*9.3))%3);if(name==='range-railing')name='sun-fence';if(name==='tree-left'||name==='tree-right'){name='range-tree-'+(1+Math.abs(Math.round(x*17.317+y*11.713))%3);scale*=.9+(Math.abs(Math.round(x*13+y*7))%5)*.045}if(name==='planter-left'||name==='planter-right')name='range-planter';name=({'tree-left':'range-tree','tree-right':'range-tree','bush-left':'range-shrub','bush-right':'range-shrub','fence-left':'range-railing','fence-right':'range-railing','bench':'range-bench'})[name]||name;const src=assets.records.find(a=>a.name===name);if(!src)return;add(x,y,()=>{preparePlant(src);const q=P(x,y);if(src.atlasCell)plantContact(x,y,src.width*scale,/tree/.test(name));if(!/tree|shrub|berm|fence/.test(name))shadow(x,y,src.width*scale*.25,src.width*scale*.08);c.save();if(name==='range-wall'||(name==='range-planter'&&x>37&&x<40)){c.translate(q[0],q[1]);c.scale(-1,1);c.drawImage(src.image,-src.width*scale/2,-src.height*scale,src.width*scale,src.height*scale)}else c.drawImage(src.paintedImage||src.image,q[0]-src.width*scale/2,q[1]-src.height*scale,src.width*scale,src.height*scale);c.restore()});Object.assign(w.objects[w.objects.length-1],{assetName:name,worldX:x,worldY:y})};
 // Fixed-height wall courses: source pixels supply paint, world geometry supplies perspective.
 const wallPaint=new Map();
 const wallTexture=()=>{if(wallPaint.has('face'))return wallPaint.get('face');const im=assets.records.find(a=>a.name==='sun-wall-high').image,iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;
 // The source wall is already isometric. Undo its rising baseline before applying
 // the destination wall projection; otherwise joints and cracks receive two shears.
 const layer=document.createElement('canvas');layer.width=112;layer.height=128;
 const k=layer.getContext('2d'),x0=iw*.39,y0=ih*.43,ax=112/(iw*.21),ay=128/(ih*.28),sourceSlope=-(ih*.457)/(iw*(.906-.05));
 k.setTransform(ax,-sourceSlope*ay,0,ay,-x0*ax,(sourceSlope*x0-y0)*ay);k.filter='contrast(1.13) saturate(.9)';k.drawImage(im,0,0);
 wallPaint.set('face',layer);return layer;};
 const boundaryPanel=(x,y,dx,dy)=>{const front=x===40||y===29,H=88,t=.18;
 add(x+dx/2,y+dy/2,()=>{c.save();if(front&&Math.hypot(player.x-x-dx/2,player.y-y-dy/2)<3)c.globalAlpha=.3;
 const a=P(x,y),b=P(x+dx,y+dy),width=Math.abs(b[0]-a[0]),left=a[0]<b[0]?a:b,right=a[0]<b[0]?b:a;
 c.save();c.transform(1,(right[1]-left[1])/width,0,1,left[0],left[1]-H);
 c.fillStyle=c.createPattern(wallTexture(),'repeat');c.fillRect(-.6,0,width+1.2,H);
 c.fillStyle=dx?'#e3cc9a12':'#354a4824';c.fillRect(0,0,width,H);
 c.strokeStyle='#646e6155';c.lineWidth=.8;for(let z=24;z<H;z+=24){c.beginPath();c.moveTo(0,z);c.lineTo(width,z);c.stroke()}
 c.restore();
 const ox=dy?t:0,oy=dx?t:0;
 const cap=[[x-ox,y-oy,H],[x+dx-ox,y+dy-oy,H],[x+dx+ox,y+dy+oy,H],[x+ox,y+oy,H]];
 poly(cap,'#c5bca5','#68705c',1.1);
 c.save();c.beginPath();cap.forEach((v,i)=>{const p=P(...v);i?c.lineTo(...p):c.moveTo(...p)});c.closePath();c.clip();
 // Fine hand-painted flecks stay inside the cap and follow its two world axes.
 for(let i=0;i<22;i++){const u=(i*.61803398875)%1,v=((i*7)%19)/19-.5,px=x+dx*u+ox*v*1.7,py=y+dy*u+oy*v*1.7;
 line([px,py,H+.15],[px+dx*.018+ox*.12,py+dy*.018+oy*.12,H+.15],i%4?'#776e5c77':'#f5e7c8a8',.6+(i%3)*.2)}c.restore();
 line([x-ox,y-oy,H+.35],[x+dx-ox,y+dy-oy,H+.35],'#f7e8c7',1.2);
 line([x+ox,y+oy,H+.2],[x+dx+ox,y+dy+oy,H+.2],'#777863',.85);
 // Expansion joint crosses the full width of the cap at the panel endpoint.
 line([x+dx-ox,y+dy-oy,H+.5],[x+dx+ox,y+dy+oy,H+.5],'#686b587f',1);
 // The two exposed ends beside the service gate need a visible stone end face.
 if(x===40&&dy&&(Math.abs(y+dy-20)<.01||Math.abs(y-25)<.01)){
 const yy=Math.abs(y+dy-20)<.01?y+dy:y;
 const endFace=[[x-t,yy,H],[x+t,yy,H],[x+t,yy,0],[x-t,yy,0]];
 poly(endFace,'#8b8d7b','#596457',1.15);
 c.save();c.beginPath();endFace.forEach((v,i)=>{const p=P(...v);i?c.lineTo(...p):c.moveTo(...p)});c.closePath();c.clip();c.fillStyle=c.createPattern(wallTexture(),'repeat');const q=P(x,yy,H);c.fillRect(q[0]-TX*.3,q[1],TX*.6,H+2);c.fillStyle='#394f4433';c.fillRect(q[0]-TX*.3,q[1],TX*.6,H+2);c.restore();
 for(let z=14;z<H;z+=18)line([x-t,yy,z],[x+t,yy,z],z%36?'#c9c2a6':'#5d675d',.9);
 line([x-t,yy,H+.2],[x+t,yy,H+.2],'#f3e4be',1.1);
 }


 c.restore();
 },{x:Math.min(x,x+dx)-.23,y:Math.min(y,y+dy)-.23,w:Math.abs(dx)+.46,d:Math.abs(dy)+.46});
 Object.assign(w.objects[w.objects.length-1],{kind:'perimeter-wall',assetName:'sun-wall-high',height:H,wallX:x,wallY:y,wallDX:dx,wallDY:dy});};
 const chair=(x,y)=>{sprite('range-chair-rear',x+.32,y+.31,1);w.blocks.push({x,y,w:.64,d:.62});Object.assign(w.objects[w.objects.length-1],{kind:'waiting-chair',worldX:x,worldY:y,facingX:-1,facingY:0})};
 const tent=(x,y,width,depth,title,roof,medical=false)=>{w.zones.push({name:title,x,y,width,depth});
 // The painted workstation already includes crates, a radio and a clipboard.
 sprite('range-table',x+.7,y+depth/2,.85);w.blocks.push({x:x+.3,y:y+.5,w:1,d:depth-1});
 if(title==='安全規定區'){for(const yy of [2,3.4]){sprite('bench',x+2.1,y+yy,.85);w.blocks.push({x:x+1.6,y:y+yy-.3,w:1,d:.6})}sprite('board',x+width-.25,y+depth-.2,.65)}
 if(title==='預備槍管制區')chair(x+2.1,y+2.5);
 if(title==='彈藥管制區'){sprite('range-table',x+2.1,y+.95,.55);w.blocks.push({x:x+1.65,y:y+.5,w:.9,d:.8})}
 add(x+width,y+depth,()=>{const safety=title==='安全規定區',src=assets.records.find(a=>a.name===(safety?'range-safety':title==='彈藥管制區'?'range-canopy-olive':'range-canopy')),q=P(x+width/2,y+depth/2),f=P(player.x,player.y),n=P(npcCentre.worldX,npcCentre.worldY);
 const widthPx=safety?360:300,heightPx=widthPx*src.height/src.width;
 c.save();if([f,n].some(v=>Math.abs(v[0]-q[0])<widthPx/2+35&&v[1]>q[1]-heightPx&&v[1]<q[1]+70))c.globalAlpha=.22;
 // Colour variants retain the source brushwork, fabric folds and shaded edges.
 c.filter='none';
 c.drawImage(src.image,q[0]-widthPx/2,q[1]-heightPx+48,widthPx,heightPx);if(medical){const sign=P(x+width/2,y+depth/2,100);c.fillStyle='#f9f3df';c.fillRect(sign[0]-13,sign[1]-17,26,28);c.fillStyle='#c45448';c.fillRect(sign[0]-3,sign[1]-13,6,20);c.fillRect(sign[0]-10,sign[1]-6,20,6)}c.restore();label(x+width/2,y+depth/2,heightPx-28,title);
 });Object.assign(w.objects[w.objects.length-1],{kind:'painted-canopy',assetName:title==='安全規定區'?'range-safety':'range-canopy'});

 for(const [a,b]of [[0,0],[width,0],[0,depth],[width,depth]])w.blocks.push({x:x+a-.12,y:y+b-.12,w:.24,d:.24});
 };
 // Pixel-scale pigment and broad colour variation keep ground legible without enlarged props.
 const groundTextures=new Map();
 const groundTexture=grass=>{const key=grass?'grass':'sand';if(groundTextures.has(key))return groundTextures.get(key);
 const im=assets.records.find(a=>a.name==='range-ground-atlas-v2').image,iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;
 const layer=document.createElement('canvas');layer.width=768;layer.height=1024;const k=layer.getContext('2d');for(let row=0;row<2;row++)for(let col=0;col<2;col++){k.save();k.translate(col?768:0,row?1024:0);k.scale(col?-1:1,row?-1:1);k.drawImage(im,grass?iw/2:0,0,iw/2,ih,0,0,384,512);k.restore()}if(!grass){k.fillStyle='#e8d2a22b';k.fillRect(0,0,768,1024)}
 groundTextures.set(key,layer);return layer;};
 const texturedGround=(x,y,width,depth,grass=false)=>{c.save();c.beginPath();for(const [i,v]of [[x,y],[x+width,y],[x+width,y+depth],[x,y+depth]].entries()){const q=P(...v);i?c.lineTo(...q):c.moveTo(...q)}c.closePath();c.fillStyle=c.createPattern(groundTexture(grass),'repeat');c.fill();c.restore()};
 const groundGrain=(x,y,width,depth,count,grass=false)=>texturedGround(x,y,width,depth,grass);
 const quietPaving=(x,y,width,depth)=>texturedGround(x,y,width,depth,false);
 // One continuous backstop, at near-native resolution; no repeated hills or blur mask.
 const drawBackstop=()=>{const im=assets.records.find(a=>a.name==='range-backstop-v2').image,q=P(-2.8,14.5),width=34*TX,height=width*(im.naturalHeight||im.height)/(im.naturalWidth||im.width);c.save();c.filter='none';c.drawImage(im,q[0]-width/2,q[1]-height*.61,width,height);c.restore();};
 w.ground=()=>{
 rect(-10,-10,60,50,0,'#9aaf70');
 groundGrain(-10,-10,60,50,2300,true);
 // Sandy maintenance path wraps around the rear and joins a small rest area.
 quietPaving(40,21,8,3);quietPaving(44,23,3,13);quietPaving(27,32,19,3);
 quietPaving(41,28,7,6);
 // Continuous painted backstop, overlapping along the entire target bank.
 drawBackstop();

 // Fine marks supplement the painted ground texture.

 
 // Break the sand perimeter into irregular grass tongues with the same painted texture.
 c.save();c.beginPath();const edge=[];
 for(let x=.5;x<=39.5;x+=.5)edge.push([x,.55+(.5+.5*Math.sin(x*2.3))*.65]);
 for(let y=1;y<=28.5;y+=.5)edge.push([39.4-(.5+.5*Math.sin(y*2.7))*.55,y]);
 for(let x=39;x>=.5;x-=.5)edge.push([x,28.4-(.5+.5*Math.cos(x*2.1))*.6]);
 for(let y=28;y>=1;y-=.5)edge.push([.55+(.5+.5*Math.cos(y*2.5))*.6,y]);
 const pts=edge.map(v=>P(...v));const last=pts[pts.length-1],first=pts[0];c.moveTo((last[0]+first[0])/2,(last[1]+first[1])/2);for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];c.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}c.closePath();c.clip();texturedGround(.4,.4,39.2,28.2,false);c.restore();
 for(let i=0;i<260;i++){const x=.6+((i*97)%382)/10,y=i%2?.7+(.5+.5*Math.sin(x*2.3))*.5:28.3-(.5+.5*Math.cos(x*2.1))*.5;tuft(x,y)}for(let y=1;y<28;y+=.47){tuft(39.3-(.5+.5*Math.sin(y*2.7))*.5,y);tuft(.65+(.5+.5*Math.cos(y*2.5))*.5,y)}
 // Narrow grass borders and limestone curb tie the large map to the courtyard.
 for(let y=1;y<28;y+=1.5){rect(27.65,y,.3,1.45,2,'#d5d5b2');line([27.65,y,3],[27.95,y,3],'#f5ebcb',1)}
 for(const [x,color] of [[18.6,'#c65d4f'],[21.1,'#fff8de']]){c.save();c.setLineDash([14,10]);line([x,4.5],[x,24],color,3);c.restore()}
 for(let i=0;i<5;i++){const y=6+i*4,im=assets.records.find(a=>a.name==='range-prone-mat-v6').image,q=P(20.25,y),w=144,h=78;
 c.save();c.globalAlpha=.18;rect(19.05,y-.43,2.4,.86,0,'#38504b');c.restore();
 c.drawImage(im,87,26,1588,853,q[0]-w/2,q[1]-h/2,w,h);
 }
 label(18.6,4,2,'射擊／清驗槍線');label(23.4,5,2,'預備線');label(28.4,5,2,'待命線（著裝區）');};
 for(let i=0;i<5;i++){const y=6+i*4,student=assets.records.find(a=>a.name==='range-prone-student-t91');
 add(20.25,y,()=>{const q=P(20.25,y);c.drawImage(student.image,27,70,1488,894,q[0]-68,q[1]-41,136,82)},{x:19.25,y:y-.38,w:2,d:.76});
 w.lanes.push({target:{x:5.4,y},mat:{x:20.25,y}});sprite('range-target',5.4,y,.9);w.blocks.push({x:5.1,y:y-.6,w:.6,d:1.2});add(5.4,y,()=>label(5.4,y,111,String(i+1)));}
 
 // Keep the inside of the rear wall clear; woodland is planted outside the enclosure.
 tent(31,2,3.3,3.5,'指揮臺','#668e81');tent(31,7,3.3,3.5,'預備槍管制區','#688b9a');tent(31,12,3.3,3.5,'彈藥管制區','#6f8e91');tent(31,17,3.3,3.5,'急救站','#ae6253',true);tent(31,22,4,4.7,'安全規定區','#ba9360');
 sprite('board',30.2,24.5,.8);w.blocks.push({x:29.9,y:23.9,w:.5,d:1.1});
 sprite('range-ambulance',36.8,19,.95);w.blocks.push({x:35.8,y:17.8,w:2,d:2.8});
 for(const y of [3,11,26]){sprite('bush-right',39.3,y+1,.7);sprite('planter-left',38.5,y,.9);w.blocks.push({x:38.1,y:y-.4,w:.8,d:.8})}
 sprite('tree-right',39,27,1);sprite('tree-left',39,1,1);
 for(let lane=0;lane<5;lane++)for(let seat=0;seat<6;seat++)chair(22.5+seat*1.12,6+lane*4-.31);
 // Dense upper-right woodland, plus varied perimeter groves.
 for(let x=3;x<48;x+=3.1)for(let y=-8;y<-1;y+=2.8){const j=Math.sin(x*13+y*7)*.85;sprite('tree-left',x+j,y-j,.9+(.12*Math.sin(x+y)));w.blocks.push({x:x+j-.2,y:y-j-.2,w:.4,d:.4})}
 for(let y=3;y<38;y+=3.4){sprite('tree-right',-5.5+Math.sin(y)*.8,y,1);sprite('bush-left',-3.4,y,.9)}
 for(let x=3;x<43;x+=3.5){sprite('tree-left',x,37+Math.sin(x)*.6,.85);sprite('bush-right',x,35.8,.9)}
 for(const x of [42,46])for(const y of [5,10,15]){sprite('tree-right',x,y,.9);w.blocks.push({x:x-.25,y:y-.25,w:.5,d:.5})}
 for(const x of [41.8,44.8]){sprite('range-bench',x,30.5,1);w.blocks.push({x:x-.8,y:30,w:1.6,d:.6})}
 sprite('range-planter',44.5,32,1);
 // Continuous weathered enclosure; the gate opens onto the rear maintenance path.
 for(let x=0;x<40;x+=2.5){boundaryPanel(x,0,2.5,0);boundaryPanel(x,29,2.5,0);if(Math.sin(x*2.1)>.05)sprite('range-shrub',x+1.2,-.8-Math.sin(x)*.3,.72+Math.abs(Math.sin(x))*.2);if(Math.cos(x*1.7)>-.15)sprite('range-shrub',x+1.2,30+Math.cos(x)*.4,.7+Math.abs(Math.cos(x))*.25)}
 for(let y=0;y<29;y+=2.5){const d=Math.min(2.5,29-y);boundaryPanel(0,y,0,d);if(y<20||y>=25)boundaryPanel(40,y,0,d);if(Math.cos(y*1.8)>-.3)sprite('range-shrub',-.85,y+.8,.72+Math.abs(Math.sin(y))*.2);if((y<20||y>=25)&&Math.sin(y*1.5)>-.2)sprite('range-shrub',40.8,y+.8,.7+Math.abs(Math.cos(y))*.25)}
 for(let x=-7;x<48;x+=2.6){sprite('tree-left',x,-5.7+Math.sin(x)*.6,1.05);sprite('range-shrub',x,-3.2,.9)}
 for(let y=1;y<37;y+=2.7){sprite('tree-right',-7,y,.95);if(y<19)sprite('tree-left',44.6,y,1)}
 // A single cap stone covers the seam where perpendicular wall courses meet.
 for(const [cx,cy] of [[0,0],[40,0],[0,29],[40,29]])add(cx+.18,cy+.18,()=>{
 const h=88,t=.18;
 poly([[cx-t,cy-t,h],[cx+t,cy-t,h],[cx+t,cy+t,h],[cx-t,cy+t,h]],'#c6bea6','#626b5b',1.2);
 line([cx-t,cy-t,h+.4],[cx+t,cy-t,h+.4],'#f3e6c5',1);
 line([cx-t,cy+t,h+.2],[cx+t,cy+t,h+.2],'#7a7966',.9);
 });
 // Banks belong to the ground layer, so props and characters sort in front of them.


 for(let y=2;y<28;y+=4.3)sprite('sun-fence',42,y,.85);
 return w;
}};












