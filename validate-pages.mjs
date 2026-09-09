import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root = new URL('./', import.meta.url);
const pages = ['home', 'calendar', 'readings', 'library'];
for (const name of pages) {
  const html = fs.readFileSync(new URL(`${name}.html`, root), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, `Unique ids: ${name}`);
  const main = html.split('<main id="main">')[1].split('</main>')[0];
  const nav = html.match(/<nav class="mobile-nav"[^>]*>(.*?)<\/nav>/s)[1];
  assert.equal((nav.match(/aria-current="page"/g) || []).length, 1);
  assert.ok(nav.includes(`href="${name}.html" class="active" aria-current="page"`));
  for (const page of pages) assert.ok(nav.includes(`href="${page}.html"`));
  for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|data:)/.test(href)) continue;
    const target = new URL(href, new URL(`${name}.html`, root));
    assert.ok(fs.existsSync(new URL(target.pathname, 'file://')), `${name}: missing ${href}`);
    if (target.hash && target.pathname.endsWith('.html')) {
      const content = fs.readFileSync(new URL(target.pathname, 'file://'), 'utf8');
      assert.ok(content.includes(`id="${target.hash.slice(1)}"`), `${name}: missing anchor ${href}`);
    }
  }
  if (name === 'home') {
    assert.doesNotMatch(main, /<(button|input|dialog|details)\b/);
    assert.doesNotMatch(main, /id="(calendar-dates|saved-list|explore)"/);
    assert.match(main, /class="cover sanctuary-cover"/);
  }
  if (name === 'calendar') assert.match(main, /id="calendar-dates"/);
  if (name === 'readings') assert.equal((main.match(/data-kind=/g) || []).length, 3);
  if (name === 'library') assert.match(main, /id="saved-list"/);
}
const source = fs.readFileSync(new URL('home-preview.js', root), 'utf8');
function run(path, { blocked = false } = {}) {
  let target;
  const elements = {};
  const document = { getElementById: id => elements[id] ||= {}, addEventListener() {} };
  const storage = { getItem() { if (blocked) throw Error('blocked'); return null; } };
  const model = { profile: () => ({}), initialInterest: () => 'rest', intentions: { rest: { label: '돌봄' } }, reading: () => ({ title: '오늘의 안내' }) };
  const location = { href: new URL(path, 'https://example.test/app/').href, replace(url) { target = url; } };
  vm.runInNewContext(source, { URL, Date, Set, location, document, sessionStorage: storage, localStorage: storage, window: { SajuCalendarModel: model, addEventListener() {} } });
  return { target, elements };
}
for (const id of ['boundary', 'direction', 'structure']) assert.equal(run(`home.html?question=${id}`).target, `https://example.test/app/readings.html?question=${id}`);
for (const [hash, page] of [['#library','library.html'], ['#explore','readings.html'], ['#boundary-reading','readings.html?chapter=boundary'], ['#calendar-panel','calendar.html#calendar-panel']]) assert.equal(run(`home.html${hash}`).target, `https://example.test/app/${page}`);
assert.equal(run('home.html?question=__proto__').target, undefined);
assert.equal(run('home.html', { blocked: true }).elements['preview-message'].textContent, '오늘의 안내');
console.log('PASS: separate page responsibilities, navigation, links/assets, legacy redirects and storage fallback');
