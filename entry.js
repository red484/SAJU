(() => {
  const url = new URL(window.location.href);
  const question = url.searchParams.get('question');
  const directHome = ['boundary', 'direction', 'structure'].includes(question)
    || ['#main', '#explore', '#library', '#boundary-reading'].includes(url.hash);
  const page = window.SajuJourney.hasCompleted() || directHome ? 'home.html' : 'onboarding.html';
  const target = new URL(page, url);
  target.search = url.search;
  if (page === 'home.html') target.hash = url.hash;
  window.location.replace(target.href);
})();
