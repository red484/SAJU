const products = {
  boundary: { name: '경계', title: '나를 지키던 이름이\n짐이 되었을 때.', question: '나를 지키던 이름 가운데 이제는 짐이 된 것은 무엇입니까.', image: 'scene-descent-v1.jpg', chapter: 3, topics: ['나를 설명해 온 역할과 이름', '보호와 구속을 가르는 경계', '다시 받아들일 것과 내려놓을 것'] },
  direction: { name: '방향', title: '그리운 곳과\n머물 곳은 다릅니다.', question: '돌아가고 싶은 곳과 지금 머물 수 있는 곳은 어디서 갈라집니까.', image: 'scene-return-v1.jpg', chapter: 4, topics: ['돌아보고 있는 선택의 갈림길', '그리움과 필요의 서로 다른 방향', '지금의 내가 머물 수 있는 자리'] },
  structure: { name: '골조', title: '남은 것은,\n시작할 재료입니다.', question: '남은 것 가운데 내 손으로 다시 다룰 수 있는 것은 무엇입니까.', image: 'scene-remains-v1.jpg', chapter: 5, topics: ['지금 손에 남아 있는 자원', '다시 세울 삶의 기준', '나의 권한으로 시작하는 작은 재건'] }
};
const excerpts = {
 boundary: '좋은 동료, 착한 딸, 이해심 많은 사람. 그 이름들이 싫었던 것은 아닙니다. 다만 그 이름으로 불리는 동안, 싫다는 말을 어디에 두었는지 잊었습니다.',
 direction: '그리운 풍경 속에는 그곳에서 살던 내가 함께 있습니다. 주소를 되찾는다고 그 시간까지 돌아오는 것은 아닙니다.',
 structure: '성과라고 부르지 않았을 뿐, 없어진 것은 아니었습니다. 처음 놓을 돌은 그 정도 크기여도 됩니다.'
};
const validProduct = id => Object.hasOwn(products, id);
const key = 'zero-observatory-saved-questions';
let saved = [];
try { const value = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(value)) saved = [...new Set(value.filter(validProduct))]; } catch {}
const dialog = document.querySelector('#product-dialog');
let active = null;
let toastTimer;
let returnFocus;
function notify(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
}
function persist() { try { localStorage.setItem(key, JSON.stringify(saved)); return true; } catch { return false; } }
function renderSaved() {
  const count = document.querySelector('#saved-count');
  if (count) count.textContent = saved.length;
  document.querySelectorAll('[data-save]').forEach(button => {
    const id = button.dataset.save;
    button.setAttribute('aria-pressed', String(saved.includes(id)));
    button.setAttribute('aria-label', products[id].name + (saved.includes(id) ? ' 물음 보관 취소' : ' 물음 담기'));
  });
  if (active) document.querySelector('#save-question').textContent = saved.includes(active) ? '담아둔 물음 · 보관 취소' : '이 물음 담아두기';
  const list = document.querySelector('#saved-list');
  if (!list) return;
  list.replaceChildren();
  if (!saved.length) {
    const p = document.createElement('p'); p.className = 'empty'; p.textContent = '아직 책갈피한 물음이 없습니다.'; const link = document.createElement('a'); link.href = 'readings.html'; link.className = 'text-link'; link.textContent = '마음에 남는 기록 찾아보기 ↗'; list.append(p, link); return;
  }
  saved.forEach(id => {
    const row = document.createElement('div'); row.className = 'saved-row';
    const open = document.createElement('button'); open.type = 'button'; open.textContent = products[id].name + ' · ' + products[id].topics[0]; open.onclick = () => showProduct(id);
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '삭제'; remove.setAttribute('aria-label', products[id].name + ' 물음 삭제'); remove.onclick = () => toggleSaved(id);
    row.append(open, remove); list.append(row);
  });
}
function toggleSaved(id) {
  if (!validProduct(id)) return;
  const removing = saved.includes(id);
  saved = removing ? saved.filter(item => item !== id) : [...saved, id];
  const stored = persist(); renderSaved();
  const message = stored ? (removing ? '보관한 물음을 삭제했습니다.' : '책갈피를 꽂았습니다.') : '현재 화면에서만 유지됩니다. 이 브라우저에서는 저장할 수 없습니다.';
  if (dialog.open) document.querySelector('#save-status').textContent = message;
  else notify(message);
}
function showProduct(id) {
  if (!validProduct(id)) return;
  active = id;
  const p = products[id];
  document.querySelector('#dialog-title').textContent = p.title;
  document.querySelector('#dialog-category').textContent = p.name + ' / DEEP ARCHIVE';
  document.querySelector('#dialog-art-name').textContent = p.name;
  document.querySelector('#dialog-question').textContent = p.question;
  document.querySelector('#dialog-excerpt').textContent = excerpts[id];
  document.querySelector('#dialog-image').src = 'assets/' + p.image;
  document.querySelector('#dialog-image').alt = p.name + '의 신화';
  document.querySelector('#dialog-topics').replaceChildren(...p.topics.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
  document.querySelector('#sample-link').href = 'result.html#myth-chapter-' + p.chapter;
  document.querySelector('#save-status').textContent = '';
  document.querySelector('#checkout-preview').hidden = true;
  renderSaved();
  if (!dialog.open) { returnFocus = document.activeElement; dialog.showModal(); }
  document.body.classList.add('modal-open');
  dialog.scrollTop = 0;
}
document.querySelectorAll('[data-product]').forEach(button => button.onclick = () => showProduct(button.dataset.product));
document.querySelectorAll('[data-save]').forEach(button => button.onclick = () => toggleSaved(button.dataset.save));
document.querySelector('.close').onclick = () => dialog.close();
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  const url = new URL(location.href);
  if (url.searchParams.has('question')) { url.searchParams.delete('question'); history.replaceState(null, '', url); }
  if (returnFocus?.isConnected && returnFocus !== document.body) returnFocus.focus();
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
document.querySelector('#save-question').onclick = () => toggleSaved(active);
document.querySelector('#purchase-button').onclick = () => {
  document.querySelector('#checkout-preview').hidden = false;
  document.querySelector('#checkout-back').focus();
};
document.querySelector('#checkout-back').onclick = () => {
  document.querySelector('#checkout-preview').hidden = true;
  document.querySelector('#purchase-button').focus();
};
function filterReadings(id, updateUrl = false) {
  if (!document.querySelector('[data-filter]') || (id !== 'all' && !validProduct(id))) return;
  document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.filter === id)));
  document.querySelectorAll('[data-kind]').forEach(card => card.hidden = id !== 'all' && card.dataset.kind !== id);
  document.querySelector('#filter-status').textContent = id === 'all' ? '전체 기록 3개' : products[id].name + ' 기록 1개';
  if (updateUrl) {
    const url = new URL(location.href); url.searchParams.set('chapter', id); history.replaceState(null, '', url);
  }
}
document.querySelectorAll('[data-filter]').forEach(button => button.onclick = () => filterReadings(button.dataset.filter, true));
window.addEventListener('storage', event => {
  if (event.key !== key && event.key !== null) return;
  try { const value = JSON.parse(event.newValue || '[]'); saved = Array.isArray(value) ? [...new Set(value.filter(validProduct))] : []; } catch { saved = []; }
  renderSaved();
});
window.addEventListener('pageshow', () => {
  try { const value = JSON.parse(localStorage.getItem(key) || '[]'); saved = Array.isArray(value) ? [...new Set(value.filter(validProduct))] : []; } catch { saved = []; }
  renderSaved();
});
renderSaved();
const params = new URLSearchParams(location.search);
let preferred = 'boundary';
if (window.SajuCalendarModel) {
  let answers = {}, preference;
  try { answers = JSON.parse(sessionStorage.getItem('unwrittenMyth')); } catch {}
  try { preference = localStorage.getItem('zero-observatory-calendar-interest'); } catch {}
  const model = window.SajuCalendarModel;
  const interest = model.initialInterest(answers, preference);
  preferred = model.intentions[interest].product;
  const basis = document.querySelector('#recommendation-basis');
  if (basis) basis.textContent = `‘${model.intentions[interest].label}’에 맞춰 골랐습니다.`;
}
const chapter = params.get('chapter') || params.get('question');
filterReadings(chapter === 'all' || validProduct(chapter) ? chapter : preferred);
const initial = new URLSearchParams(location.search).get('question');
if (validProduct(initial)) showProduct(initial);
