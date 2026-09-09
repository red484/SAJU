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
    let answers = {}, preference, saved = [];
    try { answers = model.profile(JSON.parse(sessionStorage.getItem('unwrittenMyth'))); } catch {}
    try { preference = localStorage.getItem('zero-observatory-calendar-interest'); } catch {}
    try { const raw = JSON.parse(localStorage.getItem('zero-observatory-saved-questions')); saved = Array.isArray(raw) ? [...new Set(raw.filter(valid))] : []; } catch {}
    const today = new Date(), interest = model.initialInterest(answers, preference);
    document.getElementById('preview-date').textContent = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
    document.getElementById('preview-day').textContent = String(today.getDate()).padStart(2, '0');
    document.getElementById('preview-message').textContent = model.reading(today, interest, answers).title;
    document.getElementById('preview-context').textContent = `${model.intentions[interest].label}에 맞춘 오늘의 안내 · 예시`;
    document.getElementById('preview-library').textContent = saved.length ? `책갈피한 물음 ${saved.length}개와 나의 신화가 기다리고 있습니다.` : '나의 신화와 책갈피한 물음을 모아두었습니다.';
  }
  refresh();
  window.addEventListener('pageshow', refresh);
  window.addEventListener('storage', refresh);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
