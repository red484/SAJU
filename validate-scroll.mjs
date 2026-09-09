import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('./scroll-scenes.js', import.meta.url), 'utf8');
function harness({ reduced = false, height = 800, fontSize = 16 } = {}) {
  const events = {}, documentEvents = {}, frames = new Map();
  let serial = 0;
  const scene = type => {
    const values = {}, classes = new Set();
    return { dataset: {scrollScene: type}, values, classes, top: 0, height: height * 1.85,
      style: {setProperty(name, value) {values[name] = Number(value);}},
      classList: {toggle(name, enabled) {if (enabled) classes.add(name); else classes.delete(name);}},
      getBoundingClientRect() {return {top: this.top, height: this.height};},
      querySelector() {return {getBoundingClientRect: () => ({height})};}
    };
  };
  const scenes = [scene('fragments')];
  const media = {matches: reduced, addEventListener(name, fn) {this.change = fn;}};
  const document = {querySelectorAll: () => scenes, documentElement: {}, body: {}, hidden: false, addEventListener(name, fn) {documentEvents[name] = fn;}};
  const context = vm.createContext({document, innerHeight: height, window: {matchMedia: () => media},
    getComputedStyle: () => ({fontSize: String(fontSize)}),
    addEventListener(name, fn, options) {events[name] = {fn, options};},
    requestAnimationFrame(fn) {frames.set(++serial, fn);return serial;}, cancelAnimationFrame(id) {frames.delete(id);}
  });
  vm.runInContext(source, context);
  const flush = () => {const pending = [...frames.values()];frames.clear();pending.forEach(fn => fn());};
  const at = p => {scenes.forEach(s => s.top = -(s.height-height)*p);events.scroll.fn();flush();};
  flush();return {scenes, events, media, document, documentEvents, frames, context, flush, at};
}
const h = harness();
assert.equal(h.scenes[0].values['--spread'], 1);
h.at(.5); const middle = h.scenes[0].values['--joined']; assert(middle > 0 && middle < 1);
h.at(1); assert.equal(h.scenes[0].values['--spread'],0); assert.equal(h.scenes[0].values['--joined'],1);
h.at(0); assert.equal(h.scenes[0].values['--spread'],1);
for (const progress of [-2, .3, 3]) {h.at(progress);for(const s of h.scenes) for(const value of Object.values(s.values)) assert(value >= 0 && value <= 1);}
assert.equal(h.events.scroll.options.passive,true);assert(!h.events.wheel && !h.events.touchmove);
h.events.scroll.fn();h.events.scroll.fn();assert.equal(h.frames.size,1);h.flush();
h.media.matches=true;h.media.change();assert(h.scenes.every(s => !s.classes.has('is-animated')));assert.equal(h.frames.size,0);
h.media.matches=false;h.media.change();h.flush();assert(h.scenes.every(s => s.classes.has('is-animated')));
for(const options of [{reduced:true},{height:500},{fontSize:24}]) {const fallback=harness(options);assert(fallback.scenes.every(s => !s.classes.has('is-animated')));assert.equal(fallback.frames.size,0);}
h.document.hidden=true;h.events.scroll.fn();assert.equal(h.frames.size,0);
h.document.hidden=false;h.documentEvents.visibilitychange();h.flush();
const html=['readings.html','library.html'].map(name=>fs.readFileSync(new URL(name,import.meta.url),'utf8')).join('');
assert.equal((html.match(/data-scroll-scene=/g)||[]).length,1);
assert.equal((html.match(/class="fragment-panel"/g)||[]).length,4);
assert.match(html,/<section class="descent-spread" aria-labelledby="descent-title">/);
assert(html.indexOf('class="descent-title-block"') > html.indexOf('class="descent-illustration"'));
assert.doesNotMatch(source,/--drop|--intro|--outro/);
assert.match(html,/href="#explore">기록으로 건너가기/);assert.match(html,/href="#library">나의 서재로/);
console.log('PASS: scroll forward/back, range bounds, frame coalescing, passive input, reduced motion, small-screen/large-type fallbacks, skip links');
