# 02. 기술 스택과 확정된 결정

## 스택
| 항목 | 선택 | 이유 |
| --- | --- | --- |
| 프레임워크 | Next.js 16.4.3 (App Router, Turbopack) | 서버(BFF)와 화면을 한 프로젝트에서. 인증키를 서버에 숨길 수 있음 |
| 언어 | TypeScript | API 응답을 타입으로 다루기 위해 |
| 스타일 | Tailwind CSS v4 | `globals.css`의 `@import "tailwindcss"`와 `@theme`로 설정 (설정 파일 없음) |
| UI 컴포넌트 | shadcn/ui (Radix 기반) | 컴포넌트 소스를 프로젝트에 복사해 직접 고칠 수 있음. 툴팁·패널 등 접근성이 기본 제공 |
| 서버 데이터 | TanStack Query | 브라우저에서 `/api/places`를 불러오고 주기적으로 다시 불러오기 |
| 차트 | Recharts | 점 13개(현재 + 예측 12개)라 성능 차이 없고, React 컴포넌트 방식으로 작성 |
| 지도 변환 | d3-geo, mapshaper | **빌드 스크립트에서만** 사용. 브라우저에는 안 들어감 |
| 경계 데이터 | [vuski/admdongkor](https://github.com/vuski/admdongkor) 2026-10-01 행정동 | 최신(3개월마다 갱신), WGS84, CC BY 4.0. 2013년 자료보다 구 모양이 정확해 장소 배정 오류가 줄어듦 (`05` 문서) |
| 패키지 매니저 | pnpm | 유령 의존성(설치 안 한 패키지를 쓰는 실수) 차단, 전역 저장소로 디스크 절약 |
| 배포 | Vercel | MVP가 어느 정도 되면 연결 |

## 프로젝트 생성 옵션
```
pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --no-react-compiler --disable-git
```
- `src/` 폴더 사용, import 별칭 `@/*`
- **React Compiler 끔.** 11/9 이후 켜서 전후 성능을 측정하는 개선 항목으로 남겨 둠
- **Cache Components 켬.** Next 16 공식 기본 방향이고 공식 캐싱 문서가 이 방식 기준. 5분 캐시는 `'use cache'` + `cacheLife`(revalidate 300초 사용자 프로필)로 구현. `'use cache'`를 붙인 함수는 async여야 함

## 화면·지도 관련 결정
| 항목 | 결정 | 이유 |
| --- | --- | --- |
| 화면 방식 | 전부 SVG, 서울 → 구 → 장소 드릴다운 | [cs.yeolyi.com](https://cs.yeolyi.com/)처럼 하나의 그림으로 이어지는 경험. 공간 데이터를 직접 다룬 경험이 됨 |
| 카카오 지도 | MVP에서 제외 | MVP 이후 "현장 가이드"로, 버튼을 눌렀을 때만 SDK 로드 |
| 구 색깔 | 기본은 연한 혼잡도 색. hover하면 그 구만 진하게 + 같은 계열 테두리, **나머지 구는 옅어짐** | 차분한 느낌을 지키면서 hover한 구를 확실히 구분 (`03` 문서) |
| 구 대표 혼잡도 | 구 안 장소 단계의 **평균** (여유 1 ~ 붐빔 4, 반올림) | 최솟값으로 하면 대부분 구가 같은 색이 됨. 오른쪽 패널에 가장 한산한 장소와 단계별 장소 수를 함께 표시. 과천시(서울대공원)는 평균에서 뺀다 |
| 장소 없는 구 | "데이터 없음" 회색 | |
| 장소 사진 | `next/image`, 16:9, 출처·라이선스 표기 | 사진은 사용자가 직접 준비. 없으면 자리째 숨김 (`03` 문서) |

## 디자인 시스템 결정 (2026-11-01)
| 항목 | 결정 | 이유 |
| --- | --- | --- |
| 글꼴 | **Pretendard 하나** (한글·영문·숫자 모두, SIL OFL 1.1). 시각·배율 숫자는 `tabular-nums` | 글꼴 하나라 섞였을 때 어색함이 없고, 숫자 폭이 일정해 5분마다 바뀌어도 흔들리지 않음. IBM Plex Mono·Noto Sans KR은 쓰지 않음 |
| 색 토큰 | **2층**: primitive(`--gray-50` 같은 색 이름표) → semantic(`--background` 같은 역할 이름). 전체 목록은 `docs/design/tokens.md` | 색을 바꿀 때 primitive 한 곳만 고치면 됨. 화면 코드는 역할 이름만 써서 뜻이 읽힘 |
| shadcn 변수 | `shadcn init`이 만든 변수(`--background`, `--foreground`, `--card`, `--muted`, `--accent`, `--border`, `--input`, `--ring`, `--destructive`, `--primary`…)는 **이름은 그대로, 값만** 우리 primitive로 | shadcn 컴포넌트를 고치지 않고도 우리 색이 입혀짐. 주의: shadcn의 `--accent`는 hover 바탕(회색)이라 주황 강조는 `--brand`로 따로 둠 |
| 모서리 | `--radius: 6px` → sm 2px(버튼·뱃지) · md 4px(범례) · lg 6px(패널·카드) | 도면풍이라 각진 느낌 유지 |
| Tailwind 연결 | `:root`에 primitive·semantic, `@theme inline`에 `--color-*: var(--*)` | `bg-congestion-busy` 같은 클래스를 바로 씀 (`tokens.md`의 코드 그대로) |
| 컴포넌트 | Primitive(작은 부품)는 `src/components/ui/`(shadcn 파일 + 우리 작은 부품), 조합 부품은 `src/components/{map,panel,mobile}/`. 파일 이름 kebab-case | 목록과 화면별 사용표는 `docs/design/system/DS-2`, `DS-3`. 폴더 규칙은 `06` 문서 |
| 정렬 | shadcn ToggleGroup(type="single")에 `underline` variant 추가 ("북적 · 한적") | 키보드·스크린리더 처리가 기본 제공 |
| 혼잡도 뱃지 | shadcn Badge에 `free / normal / busyish / busy / none` variant 추가 (별도 파일 없음) | 색만 다르고 동작이 없어서 파일을 늘릴 이유가 없음 |
| 모바일 바텀시트 | shadcn Drawer(vaul) `snapPoints` 3단 | 끌어서 멈추는 높이를 직접 구현하지 않아도 됨 |
| 휠 확대 (MVP 이후) | d3-zoom | 휠·핀치·드래그·배율 제한을 한 번에. 클릭과 드래그 구분(5px) |
