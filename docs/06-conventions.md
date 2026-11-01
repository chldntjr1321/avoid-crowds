# 06. 개발 규칙

## 폴더 구조 (2026-11-01 변경: 컴포넌트는 components/ 아래 영역별)
```
src/
  app/                 # 라우트 (page, layout, api/places/route.ts 등)
  components/
    ui/                # shadcn이 넣은 파일(button.tsx, badge.tsx…) + 두 영역 이상에서 쓰는 우리 부품
    map/               # 지도 SVG와 지도 위 부품 (seoul-map, district-layer, legend, zoom-controls…)
    panel/             # 웹 패널·모바일 시트 안 내용 (top5-list, place-list, forecast-card…)
    mobile/            # 모바일 전용 틀 (bottom-sheet, sheet-header, sheet-min-line…)
  hooks/               # React 훅 (지도 확대, 주소 상태 등)
  lib/                 # UI 없는 공통 로직
    congestion.ts      # 혼잡도 단계 ↔ 숫자, 구 평균 계산 등
    seoul-api/         # 서울시 API 호출·어댑터 ('server-only')
    utils.ts           # shadcn의 cn() 등
scripts/               # 빌드용 스크립트 (05 문서)
data/raw/              # 원본 데이터 (05 문서). 34MB 경계 geojson은 .gitignore
docs/design/           # 확정 화면 도안 PNG·HTML (구현 참고용)
```
- **파일 이름은 전부 kebab-case** (`top5-list.tsx`), 컴포넌트 이름은 PascalCase(`Top5List`). 맥은 대소문자를 구분하지 않지만 Vercel(리눅스)은 구분해서, 대소문자가 섞이면 배포 때만 import 오류가 날 수 있다.
- **shadcn 파일은 이름·위치를 바꾸지 않는다.** shadcn 파일끼리 `@/components/ui/toggle`처럼 경로로 서로 import하고, CLI가 파일 이름으로 "이미 있는지"를 판단하기 때문. 내용(스타일)은 고쳐도 된다. 고친 파일에 `shadcn add`가 덮어쓸지 물으면 "아니요".
- **모양만 다른 부품은 새 파일을 만들지 않고 shadcn 파일 안에 variant를 추가한다.** 혼잡도 뱃지 = `badge.tsx`에 `free / normal / busyish / busy / none` variant(`<Badge variant="busy">`), 정렬 탭(북적 · 한적) = `toggle-group.tsx`에 `underline` variant. 파일 맨 위에 "혼잡도 뱃지도 이 파일의 variant로 씀" 같은 주석을 단다. 단계 → 글자 변환("약간 붐빔")은 `lib/congestion.ts`.
- 동작이나 여러 부품 조합이 들어가는 것(ForecastCard, Top5List…)만 새 파일로 만든다.
- **처음엔 쓰는 영역 폴더(`map/`, `panel/`, `mobile/`)에 만들고, 두 번째 영역에서 쓰게 되면 `ui/`로 옮긴다.** 예: 장소 목록 줄은 패널에서만 쓰니 `panel/place-list-item.tsx`, 나중에 지도 툴팁에서도 쓰게 되면 `ui/`로. 그래서 `ui/`는 "shadcn 원본 + 여러 곳에서 쓰는 것"만 남는다.
- 부품은 미리 만들지 않고 **필요해질 때** 만든다. shadcn 부품도 쓸 때 `pnpm dlx shadcn add 이름`으로 하나씩 추가한다.
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
