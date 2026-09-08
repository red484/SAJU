import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const journey = readFileSync(new URL('./journey.js', import.meta.url), 'utf8');
const entry = readFileSync(new URL('./entry.js', import.meta.url), 'utf8');
const key = 'zero-observatory-onboarding-complete';
function setup({ completed=false, blocked=false, sessionOnly=false, path='/' }={}) {
  const local = new Map(completed ? [[key,'1']] : []);
  const session = new Map();
  const storage = (map, deny) => ({getItem(k){if(deny) throw Error('blocked');return map.get(k)??null;},setItem(k,v){if(deny) throw Error('blocked');map.set(k,v);}});
  let destination;
  const context=vm.createContext({URL,window:{location:{href:'https://example.com'+path,replace(href){destination=href;}},localStorage:storage(local,blocked||sessionOnly),sessionStorage:storage(session,blocked)}});
  vm.runInContext(journey,context);
  return {context,run(){vm.runInContext(entry,context);return destination;},complete(){context.window.SajuJourney.complete();}};
}
assert.equal(setup().run(),'https://example.com/onboarding.html');
assert.equal(setup({completed:true}).run(),'https://example.com/home.html');
for(const path of ['/','/index.html','/index','/SAJU/']) {
 const page=setup({path}); assert.match(page.run(),/\/onboarding.html$/);
 page.complete(); assert.match(page.run(),/\/home.html$/);
}
for(const id of ['boundary','direction','structure']) assert.equal(setup({path:'/?question='+id}).run(),'https://example.com/home.html?question='+id);
assert.equal(setup({path:'/#library'}).run(),'https://example.com/home.html#library');
assert.equal(setup({path:'/?question=invalid'}).run(),'https://example.com/onboarding.html?question=invalid');
assert.equal(setup({blocked:true}).run(),'https://example.com/onboarding.html');
const fallback=setup({sessionOnly:true}); fallback.complete(); assert.equal(fallback.run(),'https://example.com/home.html');
const result=readFileSync(new URL('./result.html',import.meta.url),'utf8');
assert.match(result,/class="observatory-home" href="home.html"/);
assert.doesNotMatch(result,/href="index.html/);
assert.match(readFileSync(new URL('./onboarding.html',import.meta.url),'utf8'),/function handoff\(\)\{\s*window.SajuJourney.complete\(\)/);
console.log('PASS: first visit, completed revisit, subpaths, legacy links, blocked storage and result-to-home navigation');
