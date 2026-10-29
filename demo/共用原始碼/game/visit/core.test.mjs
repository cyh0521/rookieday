import test from 'node:test';
import assert from 'node:assert/strict';
import { STATIONS, canWalk, findPath, normaliseProgress } from './core.js';

test('every station is reachable from the entrance without crossing closed areas',()=>{
  for(const [id,target] of Object.entries(STATIONS)){
    const start={x:2,z:26},route=findPath(start,target);assert.ok(route.length,`${id} reachable`);
    let previous=start;
    for(const point of route){for(let t=0;t<=1;t+=.1)assert.ok(canWalk(previous.x+(point.x-previous.x)*t,previous.z+(point.z-previous.z)*t),`${id} route stays walkable`);previous=point}
    assert.deepEqual(route.at(-1),{x:target.x,z:target.z});
  }
});
test('all required stations connect in either order',()=>{
  for(const a of ['safety','map','waiting'])for(const b of ['safety','map','waiting'])assert.ok(findPath(STATIONS[a],STATIONS[b]).length);
});
test('clicks in target, firing and furniture areas cannot create paths',()=>{
  for(const point of [{x:0,z:-28},{x:0,z:-5},{x:0,z:2},{x:20,z:22}])assert.deepEqual(findPath({x:2,z:26},point),[]);
});
test('saved progress filters invalid and repeated entries',()=>{
  assert.deepEqual(normaliseProgress(['map','invalid','map','safety',null]),['map','safety']);
  assert.deepEqual(normaliseProgress({map:true}),[]);
});
