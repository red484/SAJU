/* Only completion is remembered; birth details remain in the existing session flow. */
(() => {
  const key = 'zero-observatory-onboarding-complete';
  const stores = ['localStorage', 'sessionStorage'];
  window.SajuJourney = {
    hasCompleted() {
      return stores.some(name => {
        try { return window[name].getItem(key) === '1'; } catch { return false; }
      });
    },
    complete() {
      for (const name of stores) {
        try { window[name].setItem(key, '1'); } catch {}
      }
    }
  };
})();
