(function () {
  'use strict';
  const M = window.SajuCalendarModel;
  if (!M || !document.getElementById('my-calendar')) return;
  const $ = id => document.getElementById(id);
  const preferenceKey = 'zero-observatory-calendar-interest';
  let answers = {}, preference;
  try { answers = M.profile(JSON.parse(sessionStorage.getItem('unwrittenMyth'))); } catch {}
  try { preference = localStorage.getItem(preferenceKey); } catch {}
  let interest = M.initialInterest(answers, preference);
  let current = M.noon(new Date());
  let selected = M.noon(current);
  let year = selected.getFullYear(), month = selected.getMonth();
  const shortDate = date => `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, '0')}`;
  const fullDate = date => date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const stateLabel = date => M.key(date) === M.key(current) ? '오늘' : '';
  const reasons = {
    relationship: { boundary: '관계 속에서 내 마음을 지키고 싶다면.', direction: '누구 곁에 머물고 싶은지 궁금하다면.', structure: '함께 쌓아온 것들을 돌아보고 싶다면.' },
    work: { structure: '새 출발에 가져갈 내 힘을 발견하도록.', direction: '다음 선택의 기준이 필요할 때.', boundary: '일과 나 사이에 선을 긋고 싶다면.' },
    rest: { direction: '지금 편히 머물 곳을 찾고 있으니까.', boundary: '쉬어도 괜찮다고 말하기 어려운 날에.', structure: '속도를 늦추고 남은 힘을 살펴보도록.' }
  };
  function renderWeek() {
    const config = M.intentions[interest], days = M.week(current), best = M.bestDay(current, interest, answers);
    $('almanac-today').textContent = fullDate(current);
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
    config.order.forEach((id, index) => {
      const button = $('personal-reading-list').querySelector(`[data-product="${id}"]`);
      button.querySelector('.personal-reading-number').textContent = String(index + 1).padStart(2, '0');
      button.querySelector('.personal-reading-reason').textContent = reasons[interest][id];
      $('personal-reading-list').append(button);
    });
    $('recommendation-basis').textContent = `‘${config.label}’에 마음이 향한 당신에게.`;
  }
  function renderReading(announce = false) {
    const entry = M.reading(selected, interest, answers);
    $('selected-date').textContent = fullDate(selected);
    $('selected-mood').textContent = entry.label;
    $('day-title').textContent = entry.title;
    $('day-copy').textContent = entry.copy;
    $('day-action').textContent = entry.action;
    $('day-product').dataset.product = entry.product;
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
      button.addEventListener('click', () => { selected = date; renderMonth(); renderReading(true); $('calendar-dates').querySelector(`[data-date="${dateKey}"]`).focus({ preventScroll: true }); });
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
    renderMonth(); renderReading(true);
  }
  function changeMonth(offset) {
    const first = new Date(year, month + offset, 1, 12);
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0, 12).getDate();
    selectDate(new Date(first.getFullYear(), first.getMonth(), Math.min(selected.getDate(), last), 12));
  }
  $('calendar-prev').addEventListener('click', () => changeMonth(-1));
  $('calendar-next').addEventListener('click', () => changeMonth(1));
  $('calendar-today').addEventListener('click', () => { current = M.noon(new Date()); renderWeek(); selectDate(current); });
  $('open-best-day').addEventListener('click', () => {
    selectDate(M.bestDay(current, interest, answers));
    $('day-reading').focus({ preventScroll: true });
    $('day-reading').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
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
})();
