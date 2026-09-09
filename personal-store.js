(() => {
  'use strict';
  const M=window.SajuPersonalModel, key='zero-observatory-personal-v1';
  let state=M.normalize(null), persisted=true;
  try {state=M.normalize(JSON.parse(localStorage.getItem(key)));}catch{persisted=false;}
  function publish(){window.dispatchEvent(new CustomEvent('saju-personal-change'));}
  function update(change){ const next=M.normalize(state);change(next);state=M.normalize(next);try{localStorage.setItem(key,JSON.stringify(state));persisted=true;}catch{persisted=false;}publish();return persisted; }
  function context(){let answers={},reading=null;try{answers=JSON.parse(sessionStorage.getItem('unwrittenMyth'))||{};reading=M.readingContext(JSON.parse(sessionStorage.getItem('saju-reading-context')));}catch{}return{answers,reading};}
  window.SajuPersonal={model:M,get:()=>M.normalize(state),update,context,isPersisted:()=>persisted,recommend:()=>M.recommend(state),key};
  window.addEventListener('storage',e=>{if(e.key!==key&&e.key!==null)return;try{state=M.normalize(JSON.parse(e.newValue));}catch{state=M.normalize(null);}publish();});
  window.addEventListener('pageshow',()=>{try{const raw=localStorage.getItem(key);if(persisted){state=M.normalize(JSON.parse(raw));publish();}}catch{}});
})();
