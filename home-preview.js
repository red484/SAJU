(() => {
  'use strict';
  // Preserve links saved before calendar, readings and library became pages.
  const url = new URL(location.href);
  const question = url.searchParams.get('question');
  const valid = id => ['boundary', 'direction', 'structure'].includes(id);
  let legacy;
  if (valid(question)) legacy = `readings.html?question=${question}`;
  else if (url.hash === '#explore') legacy = 'readings.html';
  else if (url.hash === '#boundary-reading') legacy = 'readings.html?chapter=boundary';
  else if (url.hash === '#library') legacy = 'library.html';
  else if (['#my-calendar', '#calendar-panel', '#day-reading'].includes(url.hash)) legacy = `calendar.html${url.hash}`;
  if (legacy) { location.replace(new URL(legacy, url).href); return; }

  function refresh() {
    const model = window.SajuCalendarModel;
    if (!model) return;
    let answers = {}, preference;
    try { answers = model.profile(JSON.parse(sessionStorage.getItem('unwrittenMyth'))); } catch {}
    try { preference = localStorage.getItem('zero-observatory-calendar-interest'); } catch {}
    const today = new Date(), personal = window.SajuPersonal, state = personal?.get(), recommendation = personal?.recommend();
    const interest = state?.profile.confirmed ? recommendation.interest : model.initialInterest(answers, preference);
    document.getElementById('preview-date').textContent = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
    document.getElementById('preview-day').textContent = String(today.getDate()).padStart(2, '0');
    document.getElementById('preview-message').textContent = (state?.profile.nickname ? state.profile.nickname + '님, ' : '') + model.reading(today, interest, answers).title;
    document.getElementById('preview-context').textContent = `${model.intentions[interest].label}에 맞춘 오늘의 안내 · 예시`;
    if (recommendation) {
      const context=personal.context();
      const seed=personal.model.questionSeed(context.answers,context.reading);
      document.getElementById('home-personal-reason').textContent = state.profile.confirmed ? recommendation.reason : seed.question;
      document.getElementById('home-profile-link').textContent = state.profile.confirmed ? '추천 기준 바꾸기 ↗' : '나에게 맞는 질문에 답하기 ↗';
      document.querySelectorAll('.preview-chapters a').forEach(a=>a.classList.toggle('is-personal-pick', Boolean(recommendation.id && a.getAttribute('href').includes('chapter='+recommendation.id))));
    }
  }
  window.addEventListener('saju-personal-change',refresh);
  refresh();
  window.addEventListener('pageshow', refresh);
  window.addEventListener('storage', refresh);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
