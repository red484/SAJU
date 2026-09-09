(() => {
  const P=window.SajuPersonal;
  if(!P||!document.getElementById('result-personal-title'))return;
  function render(){
    const context=P.context(),profile=P.get().profile;
    const seed=P.model.questionSeed(context.answers,context.reading,profile.confirmed?profile:{});
    document.getElementById('result-personal-title').textContent=profile.confirmed?`‘${P.model.concerns[profile.concern].label}’, 지금도 마음에 남아 있나요?`:seed.question;
    document.getElementById('result-personal-basis').textContent=profile.confirmed?'전에 확인한 고민을 다시 살피고, 달라졌다면 바꿀 수 있어요.':seed.basis+(context.reading?'':' 현재는 개인 사주 분석이 연결되기 전의 시작 질문입니다.');
    document.getElementById('result-personal-link').textContent=profile.confirmed?'지금의 고민 다시 살피기 ↗':'내 상황에 맞춰 답하기 ↗';
  }
  render();window.addEventListener('saju-personal-change',render);
})();
