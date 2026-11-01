# 06. 개발 규칙

## 폴더 구조 (기능별)
```
src/
  app/                 # 라우트 (page, layout, api/places/route.ts 등)
  features/
    map/               # 지도 기능 전용 컴포넌트·훅·유틸
    forecast/          # 예측 차트 기능 전용 컴포넌트·훅·유틸
  components/
    ui/                # shadcn/ui 컴포넌트 (CLI가 생성)
  lib/                 # UI 없는 공통 로직
    congestion.ts      # 혼잡도 단계 ↔ 숫자, 구 평균 계산 등
    seoul-api/         # 서울시 API 호출·어댑터 ('server-only')
    utils.ts           # shadcn의 cn() 등
  hooks/               # 여러 기능이 같이 쓰는 훅이 생기면 그때 만든다
scripts/               # 빌드용 스크립트 (05 문서)
data/raw/              # 원본 데이터 (05 문서). 34MB 경계 geojson은 .gitignore
docs/design/           # 확정 화면 도안 PNG·HTML (구현 참고용)
```
- 한 기능에서만 쓰는 것은 그 기능 폴더 안에 둔다. 두 기능 이상이 쓰게 되면 `lib/`(로직) 또는 `components/`(UI)로 올린다.
- `lib/`는 되도록 React에 의존하지 않는 함수로 둔다. 테스트와 재사용이 쉽다.

## 코드 스타일
- Prettier + `prettier-plugin-tailwindcss` (Tailwind 클래스 순서 자동 정렬)
  ```json
  {
    "singleQuote": true,
    "semi": true,
    "plugins": ["prettier-plugin-tailwindcss"],
    "tailwindStylesheet": "./src/app/globals.css"
  }
  ```
- ESLint는 Next 기본 설정 뒤에 `eslint-config-prettier/flat`을 둬서 Prettier와 충돌하는 규칙을 끈다.
- husky·lint-staged는 MVP에서 쓰지 않는다.

## 환경변수
- `.env.local`에 `SEOUL_API_KEY=발급받은_인증키`
- **`NEXT_PUBLIC_` 접두사 금지.** 붙이면 브라우저 코드에 키가 그대로 들어간다.
- `.gitignore`의 `.env*`로 git에서 제외된다. `.env.example`은 만들지 않고, README 실행 방법에 변수 이름을 적는다.
- Vercel에는 배포할 때 프로젝트 설정의 Environment Variables에 같은 이름으로 넣는다.

## 브랜치·커밋
- **main에 직접 커밋** (PR 없음, 혼자 짧게 진행하는 프로젝트)
- 커밋 메시지: `타입: 설명` (설명은 한국어 OK). **한 커밋에 한 가지 일.**

| 타입 | 언제 |
| --- | --- |
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 동작은 그대로, 코드 정리 |
| `style` | 디자인·CSS 변경 |
| `docs` | README 등 문서 |
| `chore` | 설정, 패키지 설치 같은 잡일 |
| `remove` | 파일·코드 삭제 |

11/9 이후 측정·개선 기간에 필요하면 `perf`(성능 개선)를 추가한다.

예: `feat: 구 클릭 시 viewBox 확대`, `chore: Recharts 설치`
