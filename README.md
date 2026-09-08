# SAJU · 제0관측소

사주와 신화의 서사를 바다 항로, 조각상 포스터, 다섯 장의 기록으로 표현한 정적 웹 프로토타입입니다.

## 실행

`index.html`은 첫 방문에 온보딩을, 온보딩 완료 후 재방문에는 메인 홈을 엽니다. `home.html`은 메인 홈을 직접 여는 주소입니다. `onboarding.html`은 온보딩, `result.html`은 결과 화면입니다. 별도 빌드나 패키지 설치는 필요하지 않습니다. Google Fonts 로딩에는 인터넷 연결이 필요합니다.

홈에는 경계·방향·골조의 상품 상세와 관심 물음 보관 기능이 있습니다. 관심 물음은 현재 기기의 브라우저에 저장됩니다. 9,900원은 디자인 검토용 예시 가격입니다. 구매 버튼은 준비 안내 화면으로 연결되며 실제 결제·주문·구매 내역을 만들지 않습니다. 심층 기록은 판매 준비 상태입니다. 오늘의 물음은 세 개의 편집된 질문을 기기 날짜에 따라 순환 표시합니다.

## 주요 파일

- `index.html`, `entry.js`, `journey.js`: 첫 방문 및 재방문 분기
- `home.html`, `home.css`, `home.js`: 메인 홈, 탐색, 상세 및 관심 기록
- `onboarding.html`: 입력 및 영상 온보딩
- `result.html`, `result.js`: 결과 화면과 인터랙션
- `result.css`, `reading.css`, `poster.css`, `epic.css`: 화면 스타일
- `assets/`: 이미지, 영상, 항로 선, 아이콘
- `RESULT-GENERATION-PROMPT.md`: 결과 JSON 생성 프롬프트와 구조
- `epic.sample.json`: 샘플 신화 서사
- `validate-result.mjs`: 샘플 데이터 검증
- `ART-DIRECTION.md`, `EPIC-UPDATE.md`, `VOYAGE-LINE-PROMPT.md`: 디자인 및 작업 문서

현재 결과는 샘플 서사입니다. 실제 사주 계산 및 결과 생성 API는 연결되어 있지 않습니다.

## 검증

Node.js가 설치된 환경에서 실행합니다.

```sh
node validate-result.mjs
node --check result.js
```

## 홈 디자인 업데이트

재방문 홈, 오늘의 물음, 세 가지 심층 기록 상세, 책갈피 보관, 모바일 하단 내비게이션을 제공합니다. 결과 마지막의 질문은 각 심층 기록 상세로 바로 연결됩니다. 계정·실제 결제·사주 분석은 연동되지 않았습니다.

Sites 정적 게시용 파일은 `node build.mjs`로 생성합니다.

홈 2차 디자인: 검정·금색 편집 지면, 판화 표지, 경계·방향·골조의 짧은 글과 이어 읽기. 글은 디자인을 위한 창작 예시이며 개인 사주 해석이 아닙니다.

첫 방문 흐름은 `/` → `onboarding.html` → `result.html` → `home.html`입니다. 온보딩에서 결과로 이동할 때 완료 여부만 현재 기기에 저장합니다. 같은 기기의 재방문은 홈으로 이동하며, 저장이 차단된 환경에서도 결과의 홈 버튼은 홈을 직접 엽니다. 기존 `index.html?question=...` 링크는 유지됩니다.
