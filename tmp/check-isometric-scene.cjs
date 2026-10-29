const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const {createCanvas} = require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const source = fs.readFileSync('安全規定區-2.5D等角場景.html','utf8');
const script = source.match(/<script>([\s\S]*?)<\/script>/)[1];
const canvas = createCanvas(960,680);
const noop = {addEventListener(){}};
const sandbox = {document:{getElementById(id){return id==='scene'?canvas:noop},querySelectorAll(){return []}},console};
vm.createContext(sandbox);
vm.runInContext(script,sandbox);
const full=canvas.toBuffer('image/png');
fs.writeFileSync('安全規定區-2.5D實際渲染.png',full);
for(const layer of ['people','equipment','greenery','board']){
 vm.runInContext(`layers.${layer}=false;draw()`,sandbox);
 assert(!full.equals(canvas.toBuffer('image/png')),`${layer} must independently change the scene`);
 vm.runInContext(`layers.${layer}=true;draw()`,sandbox);
 assert(full.equals(canvas.toBuffer('image/png')),`${layer} must restore exactly`);
}
assert(!/requestAnimationFrame|data:image|<img|fetch\(/.test(source),'Scene must be static and self-contained drawing');
console.log('PASS: rendered 960×680; all four independent layers hide and restore deterministically; no embedded image or animation loop.');
