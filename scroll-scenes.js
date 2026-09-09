/* Scroll position drives transforms only. Native wheel, touch and keyboard scrolling stay intact. */
(() => {
  const scenes = [...document.querySelectorAll('[data-scroll-scene="fragments"]')];
  if (!scenes.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => { const x = clamp(n); return x * x * (3 - 2 * x); };
  const active = new Set(scenes);
  let frame = 0;
  let enabled = false;
  const set = (scene, name, value) => scene.style.setProperty(name, value.toFixed(4));
  function render() {
    frame = 0;
    if (!enabled || document.hidden) return;
    // Read all geometry before writing styles.
    const samples = [...active].map(scene => {
      const rect = scene.getBoundingClientRect();
      const height = scene.querySelector('.scene-stage').getBoundingClientRect().height;
      return {scene, progress: clamp(-rect.top / Math.max(1, rect.height - height))};
    });
    for (const {scene, progress: p} of samples) {
      const joined = smooth((p - .08) / .66);
      set(scene, '--spread', 1 - joined);
      set(scene, '--joined', joined);
    }
  }
  function schedule() {
    if (enabled && !frame && !document.hidden) frame = requestAnimationFrame(render);
  }
  function configure() {
    // Avoid pinning where large text or a short screen would crowd the scene.
    const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    enabled = !reduce.matches && innerHeight >= 620 && fontSize <= 20;
    scenes.forEach(scene => scene.classList.toggle('is-animated', enabled));
    if (!enabled && frame) { cancelAnimationFrame(frame); frame = 0; }
    schedule();
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) active.add(entry.target);
        else active.delete(entry.target);
      }
      schedule();
    }, {rootMargin: '100% 0px'});
    scenes.forEach(scene => observer.observe(scene));
  }
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', configure, {passive: true});
  addEventListener('pageshow', configure);
  document.addEventListener('toggle', schedule, true);
  document.addEventListener('visibilitychange', schedule);
  reduce.addEventListener('change', configure);
  document.fonts?.ready.then(configure);
  configure();
})();
