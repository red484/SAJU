(function () {
  'use strict';
  const M = window.SajuCalendarModel;
  if (!M || !document.getElementById('my-calendar')) return;
  const $ = id => document.getElementById(id);
  const P = window.SajuPersonal;
  let profileSnapshot = JSON.stringify(P.get().profile);
  const preferenceKey = 'zero-observatory-calendar-interest';
  let answers = {}, preference;
  try { answers = M.profile(JSON.parse(sessionStorage.getItem('unwrittenMyth'))); } catch {}
  try { preference = localStorage.getItem(preferenceKey); } catch {}
  let interest = P.get().profile.confirmed ? P.recommend().interest : M.initialInterest(answers, preference);
  let current = M.noon(new Date());
  let selected = M.noon(current);
  const queryDate = new URLSearchParams(location.search).get('date');
  if (P.model.validDate(queryDate)) { const [y,m,d]=queryDate.split('-').map(Number); selected=new Date(y,m-1,d,12); }
  let year = selected.getFullYear(), month = selected.getMonth();
  const shortDate = date => `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, '0')}`;
  const fullDate = date => date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const stateLabel = date => M.key(date) === M.key(current) ? '오늘' : '';
  const practiceKey = 'zero-observatory-today-intention';
  let practice = null;
  try { practice = JSON.parse(localStorage.getItem(practiceKey)); } catch {}
  function renderPractice(action) {
    $('practice-action').textContent = action;
    const chosen = practice?.date === M.key(current) && practice?.interest === interest;
    $('practice-done').setAttribute('aria-pressed', String(chosen));
    $('practice-button-label').textContent = chosen ? '오늘의 약속으로 남겼어요' : '오늘 해볼게요';
    $('practice-feedback').textContent = chosen ? '마음이 바뀌면 다시 눌러 지울 수 있어요.' : '작은 선택 하나면 충분해요.';
  }
  $('practice-done').addEventListener('click', () => {
    practice = practice?.date === M.key(current) && practice?.interest === interest ? null : { date: M.key(current), interest };
    let stored = true;
    try { localStorage.setItem(practiceKey, JSON.stringify(practice)); } catch { stored = false; }
    renderPractice(M.reading(current, interest, answers).action);
    if (!stored) $('practice-feedback').textContent = '이 화면에서만 기억할게요. 지금은 기기에 저장할 수 없습니다.';
  });
  function renderWeek() {
    $('calendar-personal-reason').textContent = P.recommend().reason;
    const config = M.intentions[interest], days = M.week(current), best = M.bestDay(current, interest, answers);
    const todayReading = M.reading(current, interest, answers);
    $('almanac-today').textContent = fullDate(current);
    $('almanac-title').textContent = todayReading.title;
    $('today-message').textContent = todayReading.copy.match(/^.*?[.!?](?:\s|$)/)?.[0].trim() || todayReading.copy;
    $('today-interest').textContent = `${config.label} · 예시 안내`;
    $('week-range').textContent = `${shortDate(days[0])} — ${shortDate(days[6])}`;
    $('week-title').textContent = config.title;
    $('best-day').textContent = String(best.getDate()).padStart(2, '0');
    $('best-month').textContent = `${best.getMonth() + 1}월`;
    $('best-weekday').textContent = best.toLocaleDateString('ko-KR', { weekday: 'long' });
    $('week-reason').textContent = config.reason;
    $('week-basis').textContent = `${config.label}에 맞춘 예시 제안`;
    const hasAnswer = Boolean(answers.recover || answers.absence);
    $('calendar-basis').textContent = hasAnswer
      ? '처음 기록에서 답한 회복 방식과 지금 필요한 것, 현재 선택한 관심사를 참고합니다. 위의 관심사를 바꾸면 추천 날짜와 기록도 달라집니다.'
      : '위에서 고른 관심사에 맞춰 날짜별 안내와 읽을 기록을 추천합니다. 처음 방문하면 ‘나를 돌보는 일’로 시작합니다.';
    document.querySelectorAll('[data-intention]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.intention === interest)));
    renderPractice(todayReading.action);

  }
  function renderReading(announce = false) {
    const entry = M.reading(selected, interest, answers);
    $('selected-date').textContent = fullDate(selected);
    $('selected-mood').textContent = entry.label;
    $('day-title').textContent = entry.title;
    $('day-copy').textContent = entry.copy;
    $('day-action').textContent = entry.action;
    $('day-product').href = `readings.html?question=${entry.product}`;
    renderEvents();
    if (!$('event-id').value) $('event-date').value = M.key(selected);
    if (announce) $('calendar-status').textContent = `${fullDate(selected)}. ${entry.label}. ${entry.title}`;
  }
  function renderMonth() {
    $('calendar-month').textContent = `${year}년 ${month + 1}월`;
    const fragment = document.createDocumentFragment();
    M.month(year, month).forEach(date => {
      if (!date) { const blank = document.createElement('span'); blank.className = 'calendar-blank'; blank.setAttribute('aria-hidden', 'true'); fragment.append(blank); return; }
      const entry = M.reading(date, interest, answers), dateKey = M.key(date);
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'calendar-day'; button.dataset.date = dateKey;
      button.setAttribute('aria-pressed', String(dateKey === M.key(selected)));
      button.setAttribute('aria-label', `${fullDate(date)}${stateLabel(date) ? ', 오늘' : ''}, ${entry.label}${entry.recommended ? ', 추천하는 날' : ''}`);
      if (stateLabel(date)) button.setAttribute('aria-current', 'date');
      if (entry.recommended) button.classList.add('is-recommended');
      const number = document.createElement('span'); number.className = 'calendar-number'; number.textContent = date.getDate();
      const caption = document.createElement('span'); caption.className = 'calendar-day-caption'; caption.textContent = entry.caption;
      button.append(number, caption);
      const eventCount = P.get().events.filter(e=>e.date===dateKey).length;
      if (eventCount) { const marker=document.createElement('span');marker.className='calendar-event-dot';marker.setAttribute('aria-hidden','true');button.append(marker);button.setAttribute('aria-label',button.getAttribute('aria-label')+`, 내 일정 ${eventCount}개`); }
      button.addEventListener('click', () => { selectDate(date); $('calendar-dates').querySelector(`[data-date="${dateKey}"]`).focus({ preventScroll: true }); });
      button.addEventListener('keydown', event => {
        const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
        if (!Object.hasOwn(offsets, event.key)) return;
        event.preventDefault(); selectDate(M.addDays(date, offsets[event.key]));
        $('calendar-dates').querySelector(`[data-date="${M.key(selected)}"]`).focus({ preventScroll: true });
      });
      fragment.append(button);
    });
    $('calendar-dates').replaceChildren(fragment);
  }
  function selectDate(date) {
    selected = M.noon(date); year = selected.getFullYear(); month = selected.getMonth();
    const url = new URL(location.href); url.searchParams.set('date', M.key(selected)); history.replaceState(null, '', url);
    renderMonth(); renderReading(true);
  }
  function changeMonth(offset) {
    const first = new Date(year, month + offset, 1, 12);
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0, 12).getDate();
    selectDate(new Date(first.getFullYear(), first.getMonth(), Math.min(selected.getDate(), last), 12));
  }
  function eventButton(label, action) { const button=document.createElement('button');button.type='button';button.className='text-link';button.textContent=label;button.addEventListener('click',action);return button; }
  function resetEventForm() { $('event-form').reset();$('event-id').value='';$('event-date').value=M.key(selected);$('event-submit').textContent='일정 남기기';$('event-cancel').hidden=true; }
  function editEvent(event) { $('event-id').value=event.id;$('event-date').value=event.date;$('event-title').value=event.title;$('event-type').value=event.type;$('event-note').value=event.note;$('event-submit').textContent='일정 수정 저장';$('event-cancel').hidden=false;$('event-title').focus(); }
  function eventRow(event, full=false) {
    const article=document.createElement('article');article.className='event-row';
    const meta=document.createElement('p');meta.className='personal-small';meta.textContent=`${event.date} · ${P.model.eventTypes[event.type].label}`;
    const title=document.createElement('h4');title.textContent=event.title;article.append(meta,title);
    if(full){const guide=document.createElement('p');guide.textContent=P.model.eventTypes[event.type].guide;const profile=P.get().profile;if(profile.confirmed)guide.textContent+=` 지금 남겨둔 고민은 ‘${P.model.concerns[profile.concern].label}’이에요. 이 일정에서 무엇을 확인하고 싶은지도 함께 적어보세요.`;article.append(guide);if(event.note){const note=document.createElement('p');note.className='event-user-note';note.textContent='내가 남긴 말: '+event.note;article.append(note);}}
    else {const open=eventButton('이날 보기',()=>{const [y,m,d]=event.date.split('-').map(Number);selectDate(new Date(y,m-1,d,12));revealCalendar($('day-reading'));});article.append(open);}
    article.append(eventButton('수정',()=>editEvent(event)),eventButton('삭제',()=>{const stored=P.update(s=>s.events=s.events.filter(e=>e.id!==event.id));if($('event-id').value===event.id)resetEventForm();$('event-status').textContent=stored?'일정을 지웠습니다.':'현재 화면에서만 삭제되었습니다.';}));return article;
  }
  function renderEvents() {
    const events=P.get().events.sort((a,b)=>a.date.localeCompare(b.date));
    const dayEvents=$('selected-events');dayEvents.replaceChildren();
    for(const event of events.filter(e=>e.date===M.key(selected)))dayEvents.append(eventRow(event,true));
    const monthEvents=$('month-events');monthEvents.replaceChildren();
    const prefix=`${year}-${String(month+1).padStart(2,'0')}-`;
    $('month-events-title').textContent=`${year}년 ${month+1}월에 남긴 일정`;
    for(const event of events.filter(e=>e.date.startsWith(prefix)))monthEvents.append(eventRow(event));
    if(!monthEvents.children.length){const p=document.createElement('p');p.className='personal-small';p.textContent='아직 남긴 일정이 없어요. 마음 쓰이는 날을 하나 골라보세요.';monthEvents.append(p);}
  }
  $('event-cancel').addEventListener('click',resetEventForm);
  $('event-form').addEventListener('submit',event=>{
    event.preventDefault();const date=$('event-date').value,title=$('event-title').value.trim();
    if(!P.model.validDate(date)||!title){$('event-status').textContent='날짜와 일정 이름을 확인해주세요.';return;}
    const oldId=$('event-id').value;
    if(!oldId&&P.get().events.length>=100){$('event-status').textContent='일정은 100개까지 남길 수 있어요. 지난 일정을 정리해주세요.';return;}
    const item={id:oldId||crypto.randomUUID(),date,title,type:$('event-type').value,note:$('event-note').value};
    const stored=P.update(s=>{s.events=s.events.filter(e=>e.id!==item.id);s.events.push(item);});
    const [y,m,d]=date.split('-').map(Number);resetEventForm();selectDate(new Date(y,m-1,d,12));
    $('event-status').textContent=stored?(oldId?'일정을 수정했습니다.':'내 일정을 달력에 남겼습니다.'):'현재 화면에서만 일정을 기억합니다. 기기 저장을 사용할 수 없어요.';
  });
  window.addEventListener('saju-personal-change',()=>{const next=JSON.stringify(P.get().profile);if(next!==profileSnapshot){profileSnapshot=next;interest=P.get().profile.confirmed?P.recommend().interest:M.initialInterest(answers,preference);}renderWeek();renderMonth();renderReading();});
  $('calendar-prev').addEventListener('click', () => changeMonth(-1));
  $('calendar-next').addEventListener('click', () => changeMonth(1));
  $('calendar-today').addEventListener('click', () => { current = M.noon(new Date()); renderWeek(); selectDate(current); });
  function revealCalendar(target) {
    $('calendar-panel').open = true;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
  }
  document.querySelectorAll('a[href="#calendar-panel"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    revealCalendar($('calendar-panel').querySelector('summary'));
  }));
  $('open-today-reading').addEventListener('click', () => {
    current = M.noon(new Date()); renderWeek(); selectDate(current);
    revealCalendar($('day-reading'));
  });
  $('open-best-day').addEventListener('click', () => {
    selectDate(M.bestDay(current, interest, answers));
    revealCalendar($('day-reading'));
  });
  document.querySelectorAll('[data-intention]').forEach(button => button.addEventListener('click', () => {
    if (!M.valid(button.dataset.intention)) return;
    interest = button.dataset.intention;
    try { localStorage.setItem(preferenceKey, interest); } catch {}
    renderWeek(); renderMonth(); renderReading();
    const best = M.bestDay(current, interest, answers);
    $('calendar-status').textContent = `${M.intentions[interest].label} 기준으로 변경했습니다. 이번 주 추천 날짜는 ${fullDate(best)}입니다.`;
  }));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    const next = M.noon(new Date());
    if (M.key(next) !== M.key(current)) {
      const wasToday = M.key(selected) === M.key(current);
      current = next; renderWeek();
      if (wasToday) selectDate(current); else renderMonth();
    }
  });
  renderWeek(); renderMonth(); renderReading();
  if (location.hash === '#day-reading') revealCalendar($('day-reading'));
  if (location.hash === '#calendar-panel') $('calendar-panel').open = true;
})();
