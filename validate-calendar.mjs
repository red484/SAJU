import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const M = createRequire(import.meta.url)('./calendar-model.js');
const date = (year, month, day) => new Date(year, month - 1, day, 12);

// Gregorian month geometry, including leap years and trailing empty cells.
for (const [year, month, days] of [[2026, 2, 28], [2028, 2, 29], [2100, 2, 28], [2026, 9, 30], [2026, 12, 31]]) {
  const cells = M.month(year, month - 1), dates = cells.filter(Boolean);
  assert.equal(dates.length, days);
  assert.equal(cells.length % 7, 0);
  assert.equal(cells.findIndex(Boolean), date(year, month, 1).getDay());
  assert.equal(new Set(dates.map(M.key)).size, days);
  dates.forEach((day, index) => assert.equal(day.getDate(), index + 1));
}
assert.equal(M.key(M.addDays(date(2026, 12, 31), 1)), '2027-01-01');
assert.equal(M.key(M.addDays(date(2028, 3, 1), -1)), '2028-02-29');
assert.equal(M.key(M.week(date(2027, 1, 1))[0]), '2026-12-28');
assert.equal(M.key(M.week(date(2027, 1, 1))[6]), '2027-01-03');

// Every recommendation stays within the remaining current week, even on Sunday.
for (const interest of Object.keys(M.intentions)) {
  for (let day = 1; day <= 365; day++) {
    const now = M.addDays(date(2026, 1, 1), day - 1), best = M.bestDay(now, interest, {});
    assert.ok(best >= now && best <= M.week(now)[6]);
    assert.equal(M.key(best), M.key(M.bestDay(now, interest, {})));
    assert.ok(M.reading(best, interest, {}).copy.length > 0);
    if (now.getDay() === 0) assert.equal(M.key(best), M.key(now));
  }
}
assert.notEqual(M.key(M.bestDay(date(2026, 9, 7), 'work')), M.key(M.bestDay(date(2026, 9, 7), 'relationship')));
assert.notEqual(M.key(M.bestDay(date(2026, 9, 7), 'rest', { recover: '혼자 있을 때' })), M.key(M.bestDay(date(2026, 9, 7), 'rest', { recover: '몸을 움직일 때' })));
assert.equal(M.initialInterest({ absence: '사람' }, null), 'relationship');
assert.equal(M.initialInterest({ absence: '확신' }, null), 'work');
assert.equal(M.initialInterest({ absence: '확신' }, 'rest'), 'rest');
assert.equal(M.initialInterest(null, '__proto__'), 'rest');
assert.equal(M.valid('toString'), false);
assert.deepEqual(M.profile({ year: '1990', hour: '12', recover: '혼자 있을 때', absence: { bad: true } }), { recover: '혼자 있을 때', absence: '' });
assert.deepEqual(M.profile(['invalid']), { recover: '', absence: '' });
assert.ok(M.reading(date(2026, 9, 9), 'invalid').title);

// The calendar does not break the existing static home/product integration.
const html = readFileSync(new URL('./calendar.html', import.meta.url), 'utf8');
const js = readFileSync(new URL('./calendar.js', import.meta.url), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate element ids');
for (const [, id] of js.matchAll(/\$\('([^']+)'\)/g)) assert.ok(ids.includes(id), `Missing calendar target ${id}`);
for (const [, product] of html.matchAll(/data-product="([^"]+)"/g)) assert.ok(['boundary', 'direction', 'structure'].includes(product));
assert.ok(html.indexOf('src="calendar-model.js"') < html.indexOf('src="calendar.js'));
assert.ok(html.includes('실제 사주를 계산하거나'));
console.log('PASS: calendar dates, leap years, year boundaries, remaining-week recommendations, personalization, safe defaults and home integration');
