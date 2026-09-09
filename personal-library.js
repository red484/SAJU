(() => {
  'use strict';
  const P=window.SajuPersonal, M=P.model, $=id=>document.getElementById(id);
  if(!$('profile-form'))return;
  const names={boundary:'경계',direction:'방향',structure:'골조'};
  const bandNames={under20:'20세 미만','20s':'20대','30s':'30대','40s':'40대', '50plus':'50대 이상'};
  const context=P.context(), drafts=new Map();
  for(const [key,item] of Object.entries(M.concerns)){const option=document.createElement('option');option.value=key;option.textContent=item.label;$('profile-concern').append(option);}
  function setForm(){
    const p=P.get().profile, seed=M.questionSeed(context.answers,context.reading,p.confirmed?p:{situation:p.situation});
    $('profile-name').value=p.nickname;$('profile-band').value=p.band||seed.band;$('profile-situation').value=p.situation;
    $('profile-concern').value=p.confirmed?p.concern:seed.concern;$('profile-detail').value=p.detail;
    renderQuestion(false);
  }
  function renderQuestion(resetChoice=true){
    const seed=M.questionSeed(context.answers,context.reading,{band:$('profile-band').value,situation:$('profile-situation').value});
    $('suggested-question').textContent=seed.question;$('question-source').textContent=seed.source;$('question-basis').textContent=seed.basis;
    if(resetChoice)$('profile-concern').value=seed.concern;
  }
  ['profile-band','profile-situation'].forEach(id=>$(id).addEventListener('change',()=>renderQuestion()));
  $('different-concern').addEventListener('click',()=>{$('profile-concern').focus();$('profile-status').textContent='다른 고민을 고르거나 ‘직접 적은 고민’에 적어주세요.';});
  $('profile-form').addEventListener('submit',e=>{
    e.preventDefault();
    if($('profile-concern').value==='other'&&!$('profile-detail').value.trim()){$('profile-status').textContent='직접 적은 고민을 선택했다면 상황을 한 줄 남겨주세요.';$('profile-detail').focus();return;}
    const stored=P.update(s=>{s.profile={nickname:$('profile-name').value,band:$('profile-band').value,situation:$('profile-situation').value,concern:$('profile-concern').value,detail:$('profile-detail').value,confirmed:true};});
    $('profile-status').textContent=stored?'지금의 고민을 기억했습니다. 추천 이유와 기록이 바뀌었어요.':'이 화면에서만 기억합니다. 브라우저 저장이 차단되어 있어요.';
  });
  $('clear-profile').addEventListener('click',()=>{const stored=P.update(s=>s.profile={});setForm();$('profile-status').textContent=stored?'확인한 프로필을 지웠습니다. 메모·일정·반응은 각각 따로 관리할 수 있어요.':'이 화면에서 지웠지만 기기 저장을 갱신하지 못했습니다.';});
  $('clear-recent').addEventListener('click',()=>{const stored=P.update(s=>s.recent=[]);$('profile-status').textContent=stored?'최근 읽기 기록을 지웠습니다.':'현재 화면에서만 지웠습니다.';});
  function renderSummary(){
    const s=P.get(),p=s.profile,list=$('profile-facts');list.replaceChildren();
    const pairs=p.confirmed?[['불러줄 이름',p.nickname||'남기지 않았어요'],['연령대',bandNames[p.band]||'남기지 않았어요'],['현재 상황',M.situations[p.situation]],['지금의 고민',M.concerns[p.concern].label],['내가 남긴 맥락',p.detail||'아직 남긴 설명이 없어요']]:[['아직 확인한 고민이 없어요','옆의 질문에 답하면 이곳에 나의 기록이 시작됩니다.']];
    for(const [label,value] of pairs){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;list.append(dt,dd);}
    $('reading-hypothesis').textContent=context.reading?context.reading.summary||'개인 해석에서 떠오른 주제를 질문으로 확인하고 있어요.':'아직 개인 사주 분석이 연결되지 않았습니다. 지금은 연령대와 처음 남긴 답을 참고한 예시 질문으로 시작합니다.';
    const rec=P.recommend();$('personal-recommendation-title').textContent=rec.id?`지금은 ‘${names[rec.id]}’의 기록을 골랐어요.`:'지금은 추천을 잠시 쉬어갈게요.';$('personal-recommendation-reason').textContent=rec.reason;
    $('personal-recommendation-link').href=rec.id?`readings.html?chapter=${rec.id}`:'readings.html';$('personal-recommendation-link').textContent=rec.id?'추천 기록 읽기 ↗':'모든 기록 둘러보기 ↗';
  }
  function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.className='text-link';b.addEventListener('click',fn);return b;}
  function renderNotebook(){
    const s=P.get(), reactions=$('personal-feedback-list');reactions.replaceChildren();
    for(const [id,f] of Object.entries(s.feedback)){
      const row=document.createElement('div');row.className='notebook-row';const p=document.createElement('p');p.textContent=`${names[id]} · ${f.value==='yes'?'와닿았어요':'지금은 아니에요'}${f.date?' · '+f.date:''}`;
      row.append(p,button(`${names[id]} 반응 지우기`,()=>{const stored=P.update(s=>delete s.feedback[id]);$('profile-status').textContent=stored?'반응을 지웠습니다.':'이 화면에서만 반영됩니다.';}));reactions.append(row);
    }
    if(!reactions.children.length){const p=document.createElement('p');p.className='personal-small';p.textContent='기록을 읽고 반응을 남겨보세요. 지금은 아닌 기록은 다음 추천에서 뒤로 보냅니다.';reactions.append(p);}
    const notes=$('personal-notes');
    notes.querySelectorAll('textarea[data-note]').forEach(input=>drafts.set(input.dataset.note,input.value));notes.replaceChildren();
    for(const [id,note] of Object.entries(s.notes)){
      const article=document.createElement('article');article.className='notebook-note';const label=document.createElement('label');label.htmlFor=`note-${id}`;label.textContent=`${names[id]}에 남긴 메모 · ${note.date}`;
      const input=document.createElement('textarea');input.id=`note-${id}`;input.dataset.note=id;input.maxLength=1000;input.rows=3;input.value=drafts.has(id)?drafts.get(id):note.text;
      const status=document.createElement('p');status.className='personal-status';status.setAttribute('role','status');
      const save=button('메모 수정 저장',()=>{const text=input.value.trim();if(!text){status.textContent='메모를 지우려면 삭제를 눌러주세요.';return;}drafts.set(id,text);const stored=P.update(s=>s.notes[id]={text,date:M.dayKey(new Date())});$('profile-status').textContent=stored?'메모를 수정했습니다.':'메모는 현재 화면에서만 유지됩니다.';});
      const remove=button(`${names[id]} 메모 삭제`,()=>{drafts.delete(id);input.remove();const stored=P.update(s=>delete s.notes[id]);$('profile-status').textContent=stored?'메모를 삭제했습니다.':'이 화면에서만 삭제되었습니다.';});
      article.append(label,input,save,remove,status);notes.append(article);
    }
    if(!notes.children.length){const p=document.createElement('p');p.className='personal-small';p.textContent='아직 메모가 없어요. 기록 상세에서 내 상황과 겹친 문장을 남겨보세요.';notes.append(p);}
    const recent=$('personal-recent');recent.replaceChildren();
    for(const entry of s.recent){const a=document.createElement('a');a.href=`readings.html?question=${entry.id}`;a.textContent=`${names[entry.id]} · ${entry.date} 다시 펼치기 ↗`;recent.append(a);}
    if(!recent.children.length)recent.textContent='기록을 펼치면 이곳에서 다시 이어 읽을 수 있어요.';
  }
  window.addEventListener('saju-personal-change',()=>{renderSummary();renderNotebook();});
  setForm();renderSummary();renderNotebook();
})();
