# SAJU · 제0관측소

사주와 신화의 서사를 바다 항로, 조각상 포스터, 다섯 장의 기록으로 표현한 정적 웹 프로토타입입니다.

## 실행

`index.html`을 브라우저에서 열면 메인 홈에서 항로를 탐색할 수 있습니다. `onboarding.html`은 온보딩, `result.html`은 결과 화면입니다. 별도 빌드나 패키지 설치는 필요하지 않습니다. Google Fonts 로딩에는 인터넷 연결이 필요합니다.

홈에는 경계·방향·골조의 상품 상세와 관심 물음 보관 기능이 있습니다. 관심 물음은 현재 기기의 브라우저에 저장됩니다. 가격과 결제는 연결되지 않았으며 심층 기록은 판매 준비 상태입니다.

## 주요 파일

- `index.html`, `home.css`, `home.js`: 메인 홈, 탐색, 상세 및 관심 기록
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
