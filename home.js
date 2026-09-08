const products = {
  boundary: { name: '경계', title: '나를 지키던 이름이\n짐이 되었을 때.', question: '나를 지키던 이름 가운데 이제는 짐이 된 것은 무엇입니까.', image: 'scene-descent-v1.jpg', chapter: 3, topics: ['나를 설명해 온 역할과 이름', '보호와 구속을 가르는 경계', '다시 받아들일 것과 내려놓을 것'] },
  direction: { name: '방향', title: '그리운 곳과\n머물 곳은 다릅니다.', question: '돌아가고 싶은 곳과 지금 머물 수 있는 곳은 어디서 갈라집니까.', image: 'scene-return-v1.jpg', chapter: 4, topics: ['돌아보고 있는 선택의 갈림길', '그리움과 필요의 서로 다른 방향', '지금의 내가 머물 수 있는 자리'] },
  structure: { name: '골조', title: '남은 것은,\n시작할 재료입니다.', question: '남은 것 가운데 내 손으로 다시 다룰 수 있는 것은 무엇입니까.', image: 'scene-remains-v1.jpg', chapter: 5, topics: ['지금 손에 남아 있는 자원', '다시 세울 삶의 기준', '나의 권한으로 시작하는 작은 재건'] }
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
  document.querySelector('#saved-count').textContent = saved.length;
  document.querySelectorAll('[data-save]').forEach(button => {
    const id = button.dataset.save;
    button.setAttribute('aria-pressed', String(saved.includes(id)));
    button.setAttribute('aria-label', products[id].name + (saved.includes(id) ? ' 물음 보관 취소' : ' 물음 담기'));
  });
  if (active) document.querySelector('#save-question').textContent = saved.includes(active) ? '담아둔 물음 · 보관 취소' : '이 물음 담아두기';
  const list = document.querySelector('#saved-list');
  list.replaceChildren();
  if (!saved.length) {
    const p = document.createElement('p'); p.className = 'empty'; p.textContent = '기록의 책갈피를 눌러 물음을 담아보세요.'; list.append(p); return;
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
  const message = stored ? (removing ? '보관한 물음을 삭제했습니다.' : '마음에 남은 물음에 담았습니다.') : '현재 화면에서만 유지됩니다. 이 브라우저에서는 저장할 수 없습니다.';
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
document.querySelectorAll('[data-filter]').forEach(button => button.onclick = () => {
  document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelectorAll('[data-kind]').forEach(card => card.hidden = button.dataset.filter !== 'all' && card.dataset.kind !== button.dataset.filter);
  document.querySelector('#filter-status').textContent = button.dataset.filter === 'all' ? '전체 기록 3개' : products[button.dataset.filter].name + ' 기록 1개';
});
const dailyPrompts = [
  { id: 'boundary', text: '나를 설명하던 이름 중,\n오늘은 잠시 내려놓고 싶은 것이 있나요?' },
  { id: 'direction', text: '지금의 나에게 더 필요한 것은\n떠날 용기일까요, 머물 기준일까요.' },
  { id: 'structure', text: '다시 시작하는 오늘,\n내 손에 남아 있는 것은 무엇인가요?' }
];
const today = new Date();
const dayIndex = Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86400000);
const daily = dailyPrompts[dayIndex % dailyPrompts.length];
document.querySelector('.daily-date').textContent = String(today.getMonth() + 1).padStart(2, '0') + '.' + String(today.getDate()).padStart(2, '0');
document.querySelector('.daily-question').textContent = daily.text;
document.querySelector('.daily [data-product]').dataset.product = daily.id;
document.querySelector('.daily-bottom span:last-child').textContent = '0' + (dayIndex % dailyPrompts.length + 1) + ' / 03';
window.addEventListener('storage', event => {
  if (event.key !== key && event.key !== null) return;
  try { const value = JSON.parse(event.newValue || '[]'); saved = Array.isArray(value) ? [...new Set(value.filter(validProduct))] : []; } catch { saved = []; }
  renderSaved();
});
renderSaved();
const initial = new URLSearchParams(location.search).get('question');
if (validProduct(initial)) showProduct(initial);
