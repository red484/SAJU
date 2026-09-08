/* This page is a sample, not a calculation from onboarding answers. */
const ARCH='01472';
const entry=document.getElementById('entry');
try{
  const input=JSON.parse(sessionStorage.getItem('unwrittenMyth')||'null');
  if(input?.year&&entry) entry.textContent='샘플 서사 · 입력한 정보로 생성된 판독이 아닙니다.';
}catch{}

/* Anchor light changes to chapters so expanding prose cannot change the sky. */
const HOURS=[
  {id:'hDay',anchor:'s3',start:.9,end:.1},
  {id:'hDusk',anchor:'s4',start:.95,end:.15},
  {id:'hNight',anchor:'dusk',start:.6,end:-.3},
];
HOURS.forEach(h=>{h.el=document.getElementById(h.id);h.section=document.getElementById(h.anchor);});
const readingAir=document.getElementById('reading-air');
const READING_LIGHT=[
  ['s4',[240,240,229,0]],
  ['myth-chapter-1',[221,231,235,.045]],
  ['myth-chapter-2',[205,222,235,.065]],
  ['myth-chapter-3',[192,208,223,.08]],
  ['myth-chapter-4',[233,233,224,.04]],
  ['myth-chapter-5',[243,234,211,.035]],
  ['dusk',[211,224,235,.06]],
].map(([id,color])=>({section:document.getElementById(id),color}));
function updateReadingAir(night){
  const focus=innerHeight*.55;
  const stops=READING_LIGHT.map(stop=>({...stop,top:stop.section.getBoundingClientRect().top}));
  let color=[240,240,229,0];
  for(let i=0;i<stops.length;i++){
    if(stops[i].top>focus) break;
    const current=stops[i],next=stops[i+1]||current;
    const span=next.top-current.top;
    const t=span>0?Math.min(1,Math.max(0,(focus-current.top)/span)):1;
    const mix=t*t*(3-2*t);
    color=current.color.map((value,j)=>value+(next.color[j]-value)*mix);
  }
  // Let blue mist precede the night without adding a brown dimming layer.
  if(night>0) color=[211,224,235,(.06+.04*Math.sin(Math.PI*night))*(1-night)];
  readingAir.style.backgroundColor=`rgba(${color.slice(0,3).map(Math.round).join(',')},${color[3].toFixed(4)})`;
}
const duskEl=document.getElementById('dusk');
const tint=document.getElementById('tint'), veil=document.getElementById('veil'),
      idx=document.getElementById('idx');
/* 편집면이 한 뷰포트를 넘으면 그만큼만 줄인다 — 화면 높이별 규칙을 손으로 쪼개지 않는다 */
const fragCopy=document.querySelector('.fragcopy');
function fitFrags(){
  return;   /* 한 화면 고정을 풀었으므로 축소하지 않는다 */
  if(!fragCopy) return;
  const sec=document.getElementById('s2');
  if(getComputedStyle(document.querySelector('.figureStage')).display==='none'){
    fragCopy.style.setProperty('--fit',1); return;
  }
  fragCopy.style.setProperty('--fit',1);
  const top=fragCopy.getBoundingClientRect().top-sec.getBoundingClientRect().top;
  const avail=innerHeight*0.955-top;
  const need=fragCopy.scrollHeight;
  const k=need>avail ? Math.max(0.82, avail/need) : 1;
  fragCopy.style.setProperty('--fit',k.toFixed(3));
}
addEventListener('resize',fitFrags);
addEventListener('load',fitFrags);
/* III장 배경 레이어는 화면 고정이라 섹션 경계에서 잘리지 않는다.
   대신 그 장에 들어설 때만 서서히 켠다. */
const fragLayers=[
  ['.paper', .92],
  ['.chartline', .055],
  ['.relief-haze', .62],
  ['.figureStage', .9],
  ['.air', .34],
].map(([q,alpha])=>({el:document.querySelector(q),alpha})).filter(x=>x.el);
const mythFigures=[...document.querySelectorAll('.mythFigure')];
const mythCards=[...document.querySelectorAll('.frag')];
mythCards.forEach((card,i)=>{
  const figure=mythFigures[i];
  if(!figure) return;
  const mobileFigure=document.createElement('img');
  mobileFigure.className='myth-portrait';
  mobileFigure.src=figure.src;
  mobileFigure.alt='';
  mobileFigure.loading='lazy';
  const frame=document.createElement("div");
  frame.className="portrait-frame";
  frame.setAttribute("aria-hidden","true");
  frame.append(mobileFigure);
  card.prepend(frame);
});
function syncMythFigure(H=innerHeight){
  if(!mythFigures.length||!mythCards.length) return;
  let active=0, best=Infinity;
  mythCards.forEach((card,i)=>{
    const cr=card.getBoundingClientRect();
    const d=Math.abs((cr.top+cr.height*.38)-H*.48);
    if(cr.bottom>H*.08 && cr.top<H*.92 && d<best){best=d;active=i;}
  });
  mythFigures.forEach((img,i)=>img.classList.toggle('on',i===active));
}
function fragScene(){
  const sec=document.getElementById('s2');
  const cov=document.getElementById('fragcover');
  const H=innerHeight;
  syncMythFigure(H);
  if(!sec||!fragLayers.length) return;
  if(getComputedStyle(fragLayers[0].el).display==='none'){ return; }
  /* 표지와 본문을 하나의 구간으로 본다 */
  const r0=cov?cov.getBoundingClientRect():sec.getBoundingClientRect();
  const r1=sec.getBoundingClientRect();
  const r={top:r0.top, bottom:r1.bottom};
  /* 앞 장이 아직 화면에 있으면 나타나지 않는다.
     섹션 상단이 화면 중앙을 지난 뒤부터 차오르고, 하단이 중앙을 지나면 물러난다. */
  const inRamp = 1-(r.top-H*0.34)/(H*0.58);      // 화면 아래에서 이미 종이면이 깔리기 시작한다
  const outRamp= (r.bottom-H*0.10)/(H*0.44);
  const raw=Math.max(0,Math.min(1,inRamp,outRamp));
  const k=raw*raw*(3-2*raw);
  fragLayers.forEach(({el,alpha})=>el.style.opacity=(k*alpha).toFixed(3));
}
addEventListener('resize',fragScene);
const route=document.getElementById('route');
const lineFill=document.getElementById('lineFill');
const STOPS=[...document.querySelectorAll('.stop')];
const IDX=[...document.querySelectorAll('#idx a')];
const SECS=['s1','s3','s2','s4','s5','dusk'].map(id=>document.getElementById(id));
const lerp=(a,b,t)=>a+(b-a)*t;
function onScroll(){
  /* 화면 중앙에 걸린 장을 현재 장으로 본다 */
  let cur=0;
  SECS.forEach((el,i)=>{ if(el && el.getBoundingClientRect().top<=innerHeight*0.45) cur=i; });
  IDX.forEach((a,i)=>{
    a.classList.toggle('on',i===cur);
    if(i===cur) a.setAttribute('aria-current','location');
    else a.removeAttribute('aria-current');
  });
  /* 배경이 밝으면 어두운 글씨로 뒤집는다. 밤 구간(VI)만 흰 글씨. */
  /* 수렴 화면과 마지막 장에서만 밝은 글씨로 뒤집는다 */
  const duskEl=document.getElementById('dusk');
  const thEl=document.getElementById('thread');
  const inDusk = duskEl && duskEl.getBoundingClientRect().top < innerHeight*0.55;
  const inThread = thEl && (()=>{const r=thEl.getBoundingClientRect();
    return r.top<innerHeight*0.45 && r.bottom>innerHeight*0.55;})();
  const coversFocus=el=>{if(!el)return false;const r=el.getBoundingClientRect();return r.top<innerHeight*.45&&r.bottom>innerHeight*.45;};
  const inAbyss=coversFocus(document.getElementById('myth-chapter-3'));
  const inSiren=innerWidth<=760&&coversFocus(document.querySelector('#s4 .side.dark'));
  idx.classList.toggle('day', !inDusk && !inThread && !inAbyss && !inSiren && cur!==2);

  fragScene();

  HOURS.forEach(h=>{
    const top=h.section.getBoundingClientRect().top;
    const progress=Math.min(1,Math.max(0,(innerHeight*h.start-top)/(innerHeight*(h.start-h.end))));
    h.el.style.opacity=(progress*progress*(3-2*progress)).toFixed(3);
  });
  const night=Number(HOURS[2].el.style.opacity);
  HOURS[1].el.style.opacity=(Number(HOURS[1].el.style.opacity)*(1-night)).toFixed(3);
  veil.style.opacity=(night*.24).toFixed(3);
  updateReadingAir(night);

  /* 항로는 스크롤이 지나간 만큼만 그려지고, 정박지는 지날 때 켜진다 */
  const rb=route.getBoundingClientRect();
  const q=Math.min(1,Math.max(0,(innerHeight*0.62-rb.top)/(rb.height*0.86)));
  lineFill.style.height=(q*100)+'%';
  STOPS.forEach((el,i)=>el.classList.toggle('on', q>(i+0.22)/STOPS.length));
}
addEventListener('scroll',onScroll,{passive:true});
addEventListener('resize',onScroll);
document.querySelectorAll('details').forEach(detail=>detail.addEventListener('toggle',onScroll));
onScroll();
fitFrags();
fragScene();
setTimeout(()=>{fitFrags();fragScene();},600);

/* 등장 */
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); }
}),{rootMargin:'0px 0px -12% 0px'});
document.querySelectorAll('.rise').forEach((el,i)=>{
  const step=matchMedia('(max-width:760px)').matches?18:34;
  el.style.transitionDelay=(Math.min(i%4,3)*step)+'ms';
  io.observe(el);
});

const more=document.getElementById('more'), moreBody=document.getElementById('moreBody');
more.addEventListener('click',()=>{
  const open=moreBody.classList.toggle('open');
  more.setAttribute('aria-expanded',String(open));
  more.firstChild.textContent=open?'물음 접기':'남은 세 가지 물음';
});

const shareBtn=document.getElementById('share');
const saveBtn=document.getElementById('save');
if(shareBtn){
  shareBtn.addEventListener('click',async()=>{
    const data={title:document.title,text:'제0관측소 · ARCHIVE No. '+ARCH+' · 샘플 신화 서사',url:location.href};
    try{
      if(navigator.share){ await navigator.share(data); }
      else if(navigator.clipboard){ await navigator.clipboard.writeText(location.href); shareBtn.textContent='링크가 복사되었습니다'; }
    }catch(e){}
  });
}
if(saveBtn){
  saveBtn.textContent='PDF로 보관하기';
  saveBtn.addEventListener('click',()=>{
    window.print();
  });
}
let printDetails=[];
addEventListener('beforeprint',()=>{
  printDetails=[...document.querySelectorAll('details')].map(el=>({el,open:el.open}));
  printDetails.forEach(({el})=>el.open=true);
});
addEventListener('afterprint',()=>printDetails.forEach(({el,open})=>el.open=open));

/* Keep the supplied ribbon inside the three-fragment voyage, including reflow. */
(()=>{
  const ribbon=document.getElementById('voyage-ribbon');
  const main=document.querySelector('main');
  const startAnchor=document.querySelector('#route .line');
  const endAnchor=document.querySelector('.sequence-closing');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let height=0,top=0,frame=0;
  function draw(){
    frame=0;
    const passed=innerHeight*.7-main.getBoundingClientRect().top-top;
    const progress=reduce.matches?1:Math.max(0,Math.min(1,passed/Math.max(1,height)));
    ribbon.style.setProperty('--ribbon-hidden',((1-progress)*100).toFixed(3)+'%');
  }
  function schedule(){if(!frame) frame=requestAnimationFrame(draw);}
  function build(){
    const base=main.getBoundingClientRect().top;
    top=startAnchor.getBoundingClientRect().bottom-base;
    const end=endAnchor.getBoundingClientRect().top-base-16;
    height=Math.max(0,end-top);
    ribbon.style.top=top+'px';
    ribbon.style.height=height+'px';
    draw();
  }
  const observer=new ResizeObserver(build);
  observer.observe(main);
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',build);
  reduce.addEventListener('change',schedule);
  document.fonts.ready.then(build);
  build();
})();
