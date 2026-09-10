import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('./onboarding.html',import.meta.url),'utf8');
const script=html.slice(html.indexOf('function syncClip('),html.indexOf('function renderCD('));
const scope=vm.createContext({playing:false,clamp:(v,a,b)=>Math.max(a,Math.min(b,v))});
vm.runInContext(script,scope);
let seeks=0,plays=0,pauses=0,time=3;
const video={duration:6,dataset:{fwd:'3'},paused:true,loop:false,get currentTime(){return time;},set currentTime(t){seeks++;time=t;},play(){plays++;this.paused=false;return Promise.resolve();},pause(){pauses++;this.paused=true;}};
for(let n=0;n<120;n++) scope.syncClip(video,1,true,false);
assert.equal(seeks,0,'A stationary final frame must not be sought repeatedly');
scope.syncClip(video,.5,true,false);assert.equal(seeks,1);assert.equal(time,1.5);
scope.syncClip(video,1,true,true);assert.equal(video.loop,true);assert.equal(plays,1);
scope.syncClip(video,1,true,true);assert.equal(plays,1,'The browser should own hold playback');
scope.syncClip(video,1,false,true);assert.equal(video.paused,true);assert.equal(pauses,1);
const clips=[...html.matchAll(/<video([^>]+)>([\s\S]*?)<\/video>/g)];
assert.equal(clips.length,17);
for(const [,attrs,body] of clips){const sources=[...body.matchAll(/src="([^"]+)"/g)];assert.equal(sources.length,1,attrs);assert.ok(existsSync(new URL('./'+sources[0][1],import.meta.url)));}
console.log('PASS: native hold playback, no redundant paused seeks, inactive media pause, unique and available restored sources');
