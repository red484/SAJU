(function (root) {
  'use strict';
  const concerns = {
    career_start: { label: '취업과 첫 진로', interest: 'work', product: 'structure', question: '어떤 일로 시작할지, 첫 발을 어디에 놓을지 고민하고 있나요?' },
    career_move: { label: '이직과 다음 선택', interest: 'work', product: 'direction', question: '지금 하는 일을 이어갈지, 다른 곳으로 옮길지 고민하고 있나요?' },
    confidence: { label: '내 진로에 대한 확신', interest: 'work', product: 'direction', question: '하고 있는 일이 내 길이라는 확신이 필요할 때인가요?' },
    business: { label: '사업의 방향과 지속', interest: 'work', product: 'structure', question: '사업을 이어가면서 지킬 것과 바꿀 것을 고민하고 있나요?' },
    transition: { label: '삶의 다음 단계', interest: 'rest', product: 'direction', question: '지금까지와는 다른 방식으로 살아갈 다음 단계를 생각하고 있나요?' },
    relationship: { label: '관계와 내 마음의 경계', interest: 'relationship', product: 'boundary', question: '관계를 지키면서도 내 마음을 뒤로 미루지 않는 방법이 필요하나요?' },
    rest: { label: '지침과 회복', interest: 'rest', product: 'boundary', question: '당장 더 나아가기보다 나를 돌볼 여유가 필요한 때인가요?' },
    other: { label: '직접 적은 고민', interest: 'rest', product: 'direction', question: '지금 가장 마음이 쓰이는 일을 편하게 적어주세요.' }
  };
  const situations = { unknown: '아직 정하지 않았어요', student: '공부하거나 준비하고 있어요', seeking: '일을 찾고 있어요', employed: '직장에 다니고 있어요', independent: '사업·프리랜서 일을 하고 있어요', pause: '쉬거나 다음 단계를 준비해요' };
  const eventTypes = {
    interview: { label: '면접·지원', product: 'structure', guide: '내가 해온 일 중 이야기하고 싶은 경험 하나를 골라보세요. 결과보다 내가 준비할 수 있는 부분에 집중합니다.' },
    conversation: { label: '중요한 대화', product: 'boundary', guide: '상대에게 전하고 싶은 말과 듣고 싶은 말을 따로 적어보세요. 한 번의 대화에서 모두 해결하지 않아도 괜찮습니다.' },
    beginning: { label: '새로운 시작', product: 'direction', guide: '이번 선택으로 지키고 싶은 것 한 가지를 적어보세요. 첫날에 할 수 있는 작은 일부터 정합니다.' },
    business: { label: '사업·업무 일정', product: 'structure', guide: '이번 자리에서 확인할 질문과 아직 모르는 것을 나누어 적어보세요. 답을 서두르기보다 필요한 정보를 준비합니다.' },
    personal: { label: '나를 위한 일정', product: 'direction', guide: '이 시간을 왜 남겨두었는지 떠올려보세요. 일정을 채우는 것만큼 내 여력을 남기는 일도 중요합니다.' }
  };
  const own = (object, key) => typeof key === 'string' && Object.hasOwn(object, key);
  const product = value => ['boundary', 'direction', 'structure'].includes(value);
  const clean = (value, length = 400) => typeof value === 'string' ? value.trim().slice(0, length) : '';
  const dayKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [y,m,d] = value.split('-').map(Number), date = new Date(y,m-1,d,12);
    return y >= 1900 && y <= 2200 && dayKey(date) === value;
  }
  const bands = ['under20', '20s', '30s', '40s', '50plus'];
  function ageBand(answers, now = new Date()) {
    const year = Number(answers?.year), month = Number(answers?.month), day = Number(answers?.day);
    if (!Number.isInteger(year) || year < 1900 || year > now.getFullYear()) return '';
    let age = now.getFullYear() - year;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && (now.getMonth()+1 < month || (now.getMonth()+1 === month && now.getDate() < day))) age--;
    if (age < 0 || age > 120) return '';
    return age < 20 ? 'under20' : age < 30 ? '20s' : age < 40 ? '30s' : age < 50 ? '40s' : '50plus';
  }
  function normalize(raw) {
    const value = raw && typeof raw === 'object' ? raw : {};
    const p = value.profile || {};
    const profile = { nickname: clean(p.nickname, 24), band: bands.includes(p.band) ? p.band : '', situation: own(situations, p.situation) ? p.situation : 'unknown', concern: own(concerns, p.concern) ? p.concern : '', detail: clean(p.detail), confirmed: p.confirmed === true && own(concerns, p.concern) };
    const feedback = {}, notes = {};
    for (const id of ['boundary','direction','structure']) {
      if (['yes','later'].includes(value.feedback?.[id]?.value)) feedback[id] = { value: value.feedback[id].value, date: validDate(value.feedback[id].date) ? value.feedback[id].date : '' };
      if (clean(value.notes?.[id]?.text, 1000)) notes[id] = { text: clean(value.notes[id].text,1000), date: validDate(value.notes[id].date) ? value.notes[id].date : '' };
    }
    const events = (Array.isArray(value.events) ? value.events : []).filter(e => e && validDate(e.date) && own(eventTypes,e.type) && clean(e.title,60)).slice(0,100).map(e => ({ id: clean(e.id,80), date:e.date, type:e.type, title:clean(e.title,60), note:clean(e.note,240) })).filter(e=>e.id);
    const uniqueEvents = [...new Map(events.map(e=>[e.id,e])).values()];
    const recent = (Array.isArray(value.recent) ? value.recent : []).filter(e=>product(e?.id)&&validDate(e.date)).slice(0,12).map(e=>({id:e.id,date:e.date}));
    return { version:1, profile, feedback, notes, events:uniqueEvents, recent };
  }
  // Only a verified personal reading may seed a hypothesis. The site's sample never does.
  function readingContext(raw) {
    if (raw?.mode !== 'personal' || !Array.isArray(raw.themes)) return null;
    const themes = raw.themes.filter(value=>own(concerns,value)).slice(0,3);
    if (!themes.length) return null;
    return { mode:'personal', themes, summary:clean(raw.summary,300) };
  }
  function questionSeed(answers, rawReading, draft = {}, now = new Date()) {
    const band = Object.hasOwn(draft,'band') ? (bands.includes(draft.band) ? draft.band : '') : ageBand(answers,now);
    const situation = own(situations,draft.situation) ? draft.situation : 'unknown';
    const reading = readingContext(rawReading);
    let concern = 'transition', basis = '현재 상황을 먼저 확인하기 위한 시작 질문입니다.';
    if (reading) { concern=reading.themes[0]; basis='개인 사주 해석에서 나온 주제를 질문으로 옮겼습니다. 지금의 고민인지는 아직 확인하지 않았습니다.'; }
    else if (situation === 'employed') { concern='career_move'; basis='직장에 다니고 있다고 선택한 답을 참고했습니다.'; }
    else if (situation === 'independent') { concern='business'; basis='사업·프리랜서 일을 하고 있다고 선택한 답을 참고했습니다.'; }
    else if (['student','seeking'].includes(situation)) { concern='career_start'; basis='공부·취업을 준비하고 있다고 선택한 답을 참고했습니다.'; }
    else if (situation === 'pause') { concern='transition'; basis='쉬거나 다음 단계를 준비한다고 선택한 답을 참고했습니다.'; }
    else if (clean(answers?.absence).includes('사람')) { concern='relationship'; basis='처음 기록에서 ‘사람’이 부족하다고 답한 것을 참고했습니다.'; }
    else if (clean(answers?.absence).includes('여유')) { concern='rest'; basis='처음 기록에서 ‘여유’가 부족하다고 답한 것을 참고했습니다.'; }
    else if (['under20','20s','30s'].includes(band)) { concern='confidence'; basis='연령대에 맞춰 시작 질문을 골랐습니다. 취업 여부와 실제 고민은 답변으로 확인합니다.'; }
    else if (['40s','50plus'].includes(band)) { concern='transition'; basis='연령대에 맞춰 삶의 다음 단계에 관한 질문을 골랐습니다. 사업 여부는 추정하지 않습니다.'; }
    const question = situation === 'unknown' && band === '20s' && !reading && concern === 'confidence'
      ? '첫 일을 찾는 중인가요, 하고 있는 일의 다음 방향이나 확신이 필요한가요?'
      : situation === 'unknown' && band === '40s' && !reading && concern === 'transition'
      ? '지금 하는 일이나 사업의 다음 방향, 혹은 삶의 다른 전환을 고민하고 있나요?'
      : concerns[concern].question;
    return {band,situation,concern,question,basis,source:reading ? '해석에서 나온 가설 · 확인 전' : '답변·연령대 기반 시작 질문'};
  }
  function recommend(raw, today = new Date()) {
    const state=normalize(raw), p=state.profile;
    const scores={boundary:0,direction:0,structure:0}, reasons={boundary:[],direction:[],structure:[]};
    if(p.confirmed) { const c=concerns[p.concern];scores[c.product]+=6;reasons[c.product].push(`지금의 고민으로 ‘${c.label}’을 선택해주셨어요.`); }
    const upcoming=state.events.filter(e=>e.date>=dayKey(today)).sort((a,b)=>a.date.localeCompare(b.date))[0];
    if(upcoming) { const limit=new Date(today.getFullYear(),today.getMonth(),today.getDate()+7); if(upcoming.date<=dayKey(limit)){ const id=eventTypes[upcoming.type].product;scores[id]+=2;reasons[id].push(`다가오는 ‘${upcoming.title}’ 일정을 준비하는 데 함께 읽을 수 있어요.`); } }
    for(const id of Object.keys(scores)) { if(state.feedback[id]?.value==='yes'){scores[id]+=2;reasons[id].push('이 기록이 와닿았다고 남겨주셨어요.');} if(state.feedback[id]?.value==='later')scores[id]-=12; }
    const order=Object.keys(scores).sort((a,b)=>scores[b]-scores[a]);
    let id=order[0];
    const available=order.filter(id=>state.feedback[id]?.value!=='later');
    if(!available.length) return {id:null,reason:'세 기록 모두 지금은 아니라고 남겨주셨어요. 서재에서 고민이나 반응을 바꾸면 다시 골라드릴게요.',interest:p.confirmed?concerns[p.concern].interest:'rest'};
    id=available[0];
    let reason=reasons[id].join(' ');
    if(!reason) reason=Object.values(state.feedback).some(f=>f.value==='later')?'지금은 아니라고 남긴 기록을 제외하고 다른 물음을 골랐습니다.':'아직 고민을 확인하지 않아, 먼저 읽어볼 수 있는 시작 기록입니다.';
    return {id,reason,interest:p.confirmed?concerns[p.concern].interest:'rest'};
  }
  const api={concerns,situations,eventTypes,own,product,clean,dayKey,validDate,ageBand,normalize,readingContext,questionSeed,recommend};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SajuPersonalModel=api;
})(globalThis);
