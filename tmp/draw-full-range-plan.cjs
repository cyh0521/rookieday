const fs=require('fs');const{createCanvas}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const c=createCanvas(1100,1100),g=c.getContext('2d');g.fillStyle='#e4ebd8';g.fillRect(0,0,1100,1100);
const sx=x=>85+(x+25)*17,sy=z=>70+(z+36)*13;
function rect(x,z,w,d,color,label,size=22){g.fillStyle=color;g.fillRect(sx(x),sy(z),w*17,d*13);g.strokeStyle='#576b50';g.lineWidth=2;g.strokeRect(sx(x),sy(z),w*17,d*13);if(label){g.fillStyle='#23372e';g.font='bold '+size+'px Microsoft JhengHei';g.textAlign='center';g.fillText(label,sx(x+w/2),sy(z+d/2)+7)}}
rect(-24,-35,52,68,'#93af80');rect(-19,-32,30,34,'#c8ba96');rect(-18,-31,28,6,'#a0aa8a','目標區 / TARGETS');
for(let i=0;i<5;i++)rect(-16+i*5.5,-29.5,2,2.8,'#f1edd8',String(i+1),16);
rect(-18,-24,28,15.5,'#dbcdab','射向 / OPEN RANGE',20);
rect(-18,-8.5,28,7.2,'#d0d8c2','射擊線 · 清（驗）槍線',20);
for(let i=0;i<5;i++)rect(-16+i*5.5,-7,2.6,4,'#78a4ae');
rect(-18,-.5,28,7.1,'#e8dbb8','預備線 / RESERVE',20);
rect(-18,6.6,28,8.8,'#e8dfc6','待命線 · 著裝區',22);
rect(-18,15.4,28,13,'#e7dfc4');rect(13,-14,12,42,'#eedfbe');rect(17,-12,7,6,'#a0b5a1','指揮臺',19);rect(17,-4,7,6,'#b3bea0','管制區',19);rect(19,7,6,7,'#e7b9a5','急救站',19);rect(14,16,11,11,'#d0d9a0','安全規定區',21);rect(-1.5,19.5,5,2.5,'#aebc91','配置看板',17);rect(-1,28,6,7,'#e5dac1','入口',20);
g.fillStyle='#263d32';g.font='bold 26px Microsoft JhengHei';g.textAlign='left';g.fillText('完整導覽版配置依據（上方為靶面後側）',70,40);
fs.writeFileSync('tmp/全靶場配置依據.png',c.toBuffer('image/png'));
