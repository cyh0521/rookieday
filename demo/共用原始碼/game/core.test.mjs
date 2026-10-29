import assert from 'node:assert/strict';
import {RangeSession,scorePoint} from './core.js';
const s=new RangeSession();
assert.equal(s.shoot(scorePoint(0,0)),null,'intro cannot shoot');
s.start();assert.equal(s.shoot(scorePoint(0,0)),null,'empty magazine cannot shoot');
assert.equal(s.reload(),true);assert.equal(s.reload(),false,'cannot stack reloads');
s.tick(.6);s.pause();const frozen=s.reloadLeft;s.tick(10);assert.equal(s.reloadLeft,frozen,'pause freezes reload');
assert.equal(s.shoot(scorePoint(0,0)),null,'paused cannot shoot');s.resume();s.tick(1.2);assert.equal(s.ammo,3);
for(let i=0;i<3;i++){assert.ok(s.shoot(scorePoint(0,0)));assert.equal(s.shoot(scorePoint(0,0)),null);s.tick(.3);}
assert.equal(s.phase,'review');assert.equal(s.shots.length,3);assert.equal(s.shoot(scorePoint(0,0)),null);
s.advance();assert.equal(s.round,1);assert.equal(s.ammo,0);s.reload();s.tick(2);
for(let i=0;i<5;i++){s.shoot(scorePoint(2,2));s.tick(.3);}assert.equal(s.phase,'review');assert.equal(s.shots.filter(x=>x.hit).length,0);
s.advance();s.reload();s.tick(2);for(let i=0;i<5;i++){s.shoot(scorePoint(.1,.1));s.tick(.3);}s.advance();assert.equal(s.phase,'complete');assert.deepEqual(s.rounds.map(x=>x.length),[3,5,5]);
s.reset();assert.equal(s.phase,'intro');assert.deepEqual(s.rounds.map(x=>x.length),[0,0,0]);
assert.equal(scorePoint(0,0).score,6);assert.equal(scorePoint(.55,0).hit,true);assert.equal(scorePoint(.551,0).hit,false);
console.log('PASS: round lifecycle, input gates, reload/pause, cooldown, misses, reset, scoring bounds');
