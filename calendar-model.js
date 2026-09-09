/* Editorial planning examples, deliberately separate from any future saju API. */
(function (root) {
  'use strict';
  const intentions = {
    relationship: { label: '관계와 마음', product: 'boundary', order: ['boundary', 'direction', 'structure'],
      days: [3, 1, 2, 4, 5, 7, 6], title: '미뤄둔 마음을\n전하기 좋은 날.',
      reason: '서두르지 않고 대화할 자리를 잡아보세요. 해야 할 말보다 나누고 싶었던 마음부터 꺼내도 좋습니다. 서로 편한 시간을 미리 물어보세요.',
      readings: [
        ['마음을 나누는 날', '대답을 재촉하지 않는 대화.', '오래 연락하지 못한 사람이 떠오른다면 짧게 안부를 건네보세요. 큰 약속을 잡기보다 서로의 하루를 묻는 정도면 충분합니다.', '생각나는 한 사람에게 안부를 건네기.'],
        ['내 마음을 살피는 날', '좋은 관계에도 여백은 필요하니까.', '곧바로 괜찮다고 답하기 전에 내 일정을 먼저 살펴봅니다. 상대를 아끼는 마음과 나를 돌보는 마음은 함께 있어도 됩니다.', '부담스러운 부탁에는 생각할 시간을 요청하기.'],
        ['가볍게 다가가는 날', '작은 말 한마디를 남겨두세요.', '무슨 말을 해야 할지 오래 고르다 연락을 놓친 적이 있나요. 오늘은 잘 지내는지 묻는 한 문장으로 시작해보세요.', '고마웠던 일을 구체적인 한 문장으로 전하기.']
      ] },
    work: { label: '일과 성장', product: 'structure', order: ['structure', 'direction', 'boundary'],
      days: [1, 4, 7, 5, 6, 3, 2], title: '마음에 둔 일을\n한 걸음 옮길 때.',
      reason: '한 주의 계획이 조금 자리를 잡은 때, 가장 중요한 일 하나를 앞으로 가져와보세요. 끝내는 것보다 시작할 자리를 만드는 데 집중합니다.',
      readings: [
        ['한 걸음 나아가는 날', '가장 중요한 일에 먼저 시간을.', '여러 일을 한꺼번에 바꾸기보다 하나에 손을 대봅니다. 미뤄둔 초안을 열거나, 시작에 필요한 자료를 모으는 것부터 해도 좋습니다.', '방해받지 않는 30분을 일정에 남겨두기.'],
        ['기반을 다지는 날', '더하기 전에, 남아 있는 것을.', '새로운 계획을 세우기 전에 이미 해낸 일과 익숙한 기술을 적어봅니다. 다음 시작에 가져갈 수 있는 것이 생각보다 가까이 있을 수 있습니다.', '이번 주에 다시 쓸 수 있는 경험 세 가지 적기.'],
        ['방향을 고르는 날', '속도보다 먼저 확인할 것.', '지금 하고 있는 일이 내가 원한 방향과 이어지는지 돌아봅니다. 당장 결론을 내릴 필요는 없습니다. 계속할 일과 멈출 일을 나누어보세요.', '오늘 꼭 해야 할 일을 한 가지로 줄이기.']
      ] },
    rest: { label: '나를 돌보는 일', product: 'direction', order: ['direction', 'boundary', 'structure'],
      days: [7, 2, 3, 5, 4, 6, 7], title: '아무것도 증명하지\n않아도 되는 하루.',
      reason: '쉬는 시간까지 잘 보내려 애쓰지 않아도 괜찮습니다. 이번 주에는 약속 사이에 빈칸 하나를 남겨 내 속도로 돌아와보세요.',
      readings: [
        ['나를 돌보는 날', '채우지 않은 시간도 나의 몫.', '쉬는 날에 해야 할 일을 길게 적었다면 한 가지쯤 지워봅니다. 익숙한 길을 걷거나, 좋아하는 자리에 앉아 있는 것만으로도 충분합니다.', '누구와도 약속하지 않은 한 시간을 남겨두기.'],
        ['숨을 고르는 날', '오늘의 여력부터 헤아려보세요.', '계획에 맞춰 나를 밀어붙이기 전에 지금의 몸과 마음을 살펴봅니다. 평소보다 천천히 움직여도 오늘이 실패가 되는 것은 아닙니다.', '급하지 않은 일 하나를 내일의 목록으로 옮기기.'],
        ['리듬을 되찾는 날', '잠깐, 익숙한 속도에서 벗어나.', '하루를 크게 바꾸려 하지 않아도 됩니다. 식사를 천천히 하거나 잠시 바깥 공기를 쐬는 작은 틈부터 만들어보세요.', '화면을 내려놓고 10분 동안 걷기.']
      ] }
  };
  const valid = value => typeof value === 'string' && Object.hasOwn(intentions, value);
  function profile(raw) {
    const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    // Only consume these two non-identifying answers; never copy birth details.
    return Object.fromEntries(['recover', 'absence'].map(key => [key, typeof source[key] === 'string' ? source[key].slice(0, 80) : '']));
  }
  function initialInterest(raw, saved) {
    if (valid(saved)) return saved;
    const p = profile(raw);
    if (p.absence.includes('사람')) return 'relationship';
    if (p.absence.includes('확신')) return 'work';
    return 'rest';
  }
  const noon = date => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  function addDays(date, amount) { const next = noon(date); next.setDate(next.getDate() + amount); return next; }
  const key = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  function week(date) {
    const start = addDays(date, -((date.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }
  function month(year, index) {
    const start = new Date(year, index, 1, 12);
    const length = new Date(year, index + 1, 0, 12).getDate();
    const cells = Array(start.getDay()).fill(null);
    for (let day = 1; day <= length; day++) cells.push(new Date(year, index, day, 12));
    while (cells.length % 7) cells.push(null);
    return cells;
  }
  function weight(date, interest, raw) {
    const config = intentions[valid(interest) ? interest : 'rest'];
    const p = profile(raw);
    let value = config.days[date.getDay()];
    if (p.recover.includes('혼자') && date.getDay() === 0) value += 2;
    if (p.recover.includes('사람') && date.getDay() === 5) value += 2;
    if (p.recover.includes('움직') && date.getDay() === 6) value += 2;
    return value;
  }
  function bestDay(date, interest, raw) {
    const candidates = week(date).filter(day => day >= noon(date));
    return candidates.reduce((best, next) => weight(next, interest, raw) > weight(best, interest, raw) ? next : best);
  }
  function reading(date, interest, raw) {
    const config = intentions[valid(interest) ? interest : 'rest'];
    const level = weight(date, interest, raw);
    const type = level >= 6 ? 0 : level <= 3 ? 1 : 2;
    const entry = config.readings[type];
    return { label: entry[0], caption: ['✧ 추천', '정돈', '여유'][type], title: entry[1], copy: entry[2], action: entry[3], recommended: level >= 6, product: config.product };
  }
  const api = { intentions, valid, profile, initialInterest, noon, addDays, key, week, month, bestDay, reading };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SajuCalendarModel = api;
})(globalThis);
