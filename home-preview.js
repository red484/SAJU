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
      const $ = id => document.getElementById(id);
      const confirmed=state.profile.confirmed;
      const shortQuestions={career_start:'어떤 일로 첫발을 내딛고 싶나요?',career_move:'남을까요, 새로운 곳으로 갈까요?',confidence:'지금 걷는 길에 확신이 필요한가요?',business:'지금의 일에서 무엇을 지키고 싶나요?',transition:'다음 장에는 어떻게 살고 싶나요?',relationship:'관계 속에서 내 마음은 괜찮은가요?',rest:'지금은 잠깐 쉬어갈 때인가요?',other:'지금 가장 마음이 쓰이는 것은 무엇인가요?'};
      const covers={boundary:['I','나를 지키는 마음의 경계'],direction:['II','내가 머물 다음 방향'],structure:['III','다시 세울 나의 골조']};
      $('for-you-address').textContent=state.profile.nickname?`${state.profile.nickname}님을 위한 질문`:'당신을 위한 질문';
      $('home-personal-question').textContent=shortQuestions[confirmed?state.profile.concern:seed.concern];
      $('home-personal-reason').textContent=confirmed?recommendation.reason:'지금의 마음에 맞춰 기록을 골라드려요.';
      $('home-profile-link').textContent=confirmed?'지금의 고민 다시 살피기 ↗':'내 이야기 들려주기 ↗';
      const ready=Boolean(recommendation.id);
      const cover=ready?covers[recommendation.id]:null;
      $('for-you-book').href=ready?`readings.html?chapter=${recommendation.id}`:'readings.html';
      $('for-you-book-label').textContent=ready?(confirmed?'이 고민과 함께 읽기':'먼저 펼쳐볼 기록'):'나의 속도로';
      $('for-you-book-number').textContent=ready?cover[0]:'—';
      $('for-you-book-title').textContent=ready?cover[1]:'다른 기록 둘러보기';
      document.querySelectorAll('.preview-chapters a').forEach(a=>a.classList.toggle('is-personal-pick', Boolean(confirmed && recommendation.id && a.getAttribute('href').includes('chapter='+recommendation.id))));
    }
  }
  window.addEventListener('saju-personal-change',refresh);
  refresh();
  window.addEventListener('pageshow', refresh);
  window.addEventListener('storage', refresh);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
