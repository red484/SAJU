import fs from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const file=process.argv[2] || fileURLToPath(new URL('./epic.sample.json',import.meta.url));
const d=JSON.parse(fs.readFileSync(file,'utf8'));
const count=s=>[...s.normalize('NFC').replace(/\n/g,'')].length;
const check=(value,min,max,label)=>{
  assert.equal(typeof value,'string',label+' must be a string');
  assert(count(value)>=min&&count(value)<=max,`${label}: ${count(value)} characters, expected ${min}-${max}`);
};
if(d.status==='insufficient_input'){
  assert.equal(d.result,null);
  assert(Array.isArray(d.missing_fields)&&d.missing_fields.length>0);
  assert(d.missing_fields.every(x=>typeof x==='string'&&x.length>0));
  console.log('PASS: insufficient-input response');
  process.exit(0);
}
assert.equal(d.status,'ok');
assert(['sample','live'].includes(d.meta.mode));
assert.equal(typeof d.meta.archive,'string');
if(d.meta.mode==='sample')assert(d.meta.notice.includes('샘플'));
for(const[key,n]of Object.entries({stops:5,fragments:3,forces:2,chapters:5}))assert.equal(d[key].length,n,key);
assert.equal(d.ending.questions.length,3);
const ids=d.stops.map(s=>s.id);
assert.equal(new Set(ids).size,5);
assert.equal(new Set(d.fragments.map(f=>f.routeId)).size,3);
assert.deepEqual(d.fragments.map(f=>f.archetype).sort(),['GILGAMESH','INANNA','ODYSSEUS']);
assert.deepEqual(d.forces.map(f=>f.en),['THE SIREN','WISDOM']);
assert.deepEqual(d.chapters.map(c=>c.routeId),ids);
for(const f of d.fragments)assert(ids.includes(f.routeId));
for(const[group,items]of Object.entries({hero:[d.hero],stops:d.stops,fragments:d.fragments,forces:d.forces,chapters:d.chapters,ending:[d.ending]})){
  items.forEach((x,i)=>{
    const label=`${group}[${i}]`;
    if('en'in x)assert(/^[A-Z]+(?: [A-Z]+)?$/.test(x.en),label+'.en');
    if('kr'in x)assert(/^[가-힣]{2,4}$/.test(x.kr),label+'.kr');
    if('pull'in x){check(x.pull,25,45,label+'.pull');assert.equal(x.pull.split('\n').length,2,label+'.pull lines');}
    for(const key of ['idx','index'])if(key in x)assert.equal(x[key].split(' · ').length,3,label+'.'+key);
    for(const key of ['gate','bodyRow','trace'])if(key in x)check(x[key],12,20,label+'.'+key);
    if(group==='stops')for(const key of ['line1','line2'])check(x[key],12,25,label+'.'+key);
    if(group==='fragments'){check(x.body,60,90,label+'.body');check(x.essay,200,260,label+'.essay');}
    if(group==='chapters'){
      assert.equal(x.headings.length,2,label+'.headings');
      for(let p=1;p<=5;p++)check(x['p'+p],90,150,label+'.p'+p);
    }
    if(['stops','fragments','forces','chapters'].includes(group)){
      assert('pillar'in x,label+'.pillar missing');
      if(d.meta.mode==='sample')assert.equal(x.pillar,null);
      else if(x.pillar!==null){
        assert(ids.includes(x.pillar.routeId));
        assert(['low','medium','high'].includes(x.pillar.confidence));
        assert(Number.isInteger(x.pillar.startAge)&&x.pillar.startAge>=0);
        for(const key of ['ganji','sipseong','rationale'])assert.equal(typeof x.pillar[key],'string');
      }else assert(!['stops','fragments','chapters'].includes(group),label+' live pillar required');
    }
  });
}
const quotes={
  INANNA:['From the great heaven Inana set her mind on the great below.','https://etcsl.orinst.ox.ac.uk/section1/tr141.htm','ETCSL, University of Oxford'],
  ODYSSEUS:['Tell me, O Muse, of that ingenious hero','https://www.gutenberg.org/files/1727/1727-h/1727-h.htm','Samuel Butler'],
  GILGAMESH:['Do thou, Ur-Shanabi, go up and walk on the ramparts of Erech,','https://sacred-texts.com/ane/eog/eog13.htm','R. Campbell Thompson, 1928']
};
for(const f of d.fragments){
  if(f.epigraph===null)continue;
  assert.deepEqual([f.epigraph.text,f.epigraph.url,f.epigraph.translation],quotes[f.archetype]);
  assert(f.epigraph.work&&f.epigraph.locator);
}
function scan(value,path=''){
  if(typeof value==='string'){
    assert(!/[*!<>]/.test(value),path+' contains forbidden markup or punctuation');
    assert(!/\p{Extended_Pictographic}/u.test(value),path+' contains emoji');
    assert(!/(?:19|20)\d{2}년|할 것입니다|힘내세요|건강|수명|질병|임신|사망/.test(value),path+' contains a prohibited claim');
    assert(!/십성|오행|신살|원국|대운|편인|정인|식신|상관|편재|정재|편관|정관|비견|겁재|원진/.test(value),path+' leaks pillar terminology');
  }else if(value&&typeof value==='object'){
    for(const[key,v]of Object.entries(value))if(key!=='pillar')scan(v,path+'.'+key);
  }
}
scan(d);
console.log('PASS: shape, counts, references, lengths, two-line pulls, terminology isolation and quote allowlist');
console.log('Editorial review still required for factual grounding, tone and unsupported predictions.');
