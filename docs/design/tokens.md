# 디자인 토큰 (2026-11-01 확정)

도안의 모든 색은 아래 **primitive** 중 하나예요. 화면 코드에서는 primitive를 직접 쓰지 말고 **semantic**(역할 이름)을 써요.
예: `bg-background`, `text-muted-foreground`, `fill-[var(--congestion-busy)]`.

- 1층 primitive: 색 이름표. `--gray-50`처럼 "무슨 색인지"만 말해요.
- 2층 semantic: 역할 이름. `--background`처럼 "어디에 쓰는지"를 말해요. 값은 primitive를 가리켜요.
- shadcn/ui가 만드는 변수(★ 표시)는 **이름은 그대로 두고 값만** 우리 primitive로 바꿔요. 그래야 shadcn 컴포넌트가 별도 수정 없이 우리 색을 써요.

## 1층 · Primitive

| 이름            | 값        |
| --------------- | --------- |
| `--gray-0`      | `#FFFFFF` |
| `--gray-25`     | `#FBFAF8` |
| `--gray-50`     | `#F7F6F4` |
| `--gray-75`     | `#F1EEE9` |
| `--gray-100`    | `#EEEBE6` |
| `--gray-150`    | `#E8E4DE` |
| `--gray-200`    | `#E2DED8` |
| `--gray-250`    | `#D6D1CA` |
| `--gray-300`    | `#CDC7BF` |
| `--gray-400`    | `#B5AFA7` |
| `--gray-500`    | `#A39B90` |
| `--gray-600`    | `#8A847C` |
| `--gray-700`    | `#6B655E` |
| `--gray-750`    | `#5C5751` |
| `--gray-800`    | `#3D3A36` |
| `--gray-900`    | `#1F1F1F` |
| `--neutral-200` | `#E6E6E6` |
| `--green-100`   | `#CFE8CF` |
| `--green-200`   | `#B9DEB9` |
| `--green-400`   | `#7FB27F` |
| `--yellow-100`  | `#F3EED2` |
| `--yellow-200`  | `#EDE3B4` |
| `--yellow-500`  | `#C2B064` |
| `--orange-50`   | `#FBF4EA` |
| `--orange-100`  | `#EBD6BE` |
| `--orange-200`  | `#F5C99B` |
| `--orange-300`  | `#F2B98A` |
| `--orange-500`  | `#E07A4F` |
| `--orange-900`  | `#7A5230` |
| `--red-200`     | `#EE9A7E` |
| `--red-300`     | `#EA8A6E` |
| `--red-500`     | `#C9573C` |
| `--red-600`     | `#B5574A` |
| `--blue-50`     | `#E4EBEE` |
| `--blue-100`    | `#D6E4EB` |
| `--blue-200`    | `#CBD5DA` |
| `--blue-300`    | `#A9BBC4` |
| `--blue-500`    | `#7F98A5` |

## 2층 · Semantic

### 바탕과 면

| 이름                  | 값                            | 쓰는 곳                         |
| --------------------- | ----------------------------- | ------------------------------- |
| `--background` ★      | `var(--gray-50)` = `#F7F6F4`  | 페이지 바탕, 지도 가장자리 fade |
| `--card` ★            | `var(--gray-25)` = `#FBFAF8`  | 떠 있는 패널, 안내 상자         |
| `--card-foreground` ★ | `var(--gray-900)` = `#1F1F1F` |                                 |
| `--muted` ★           | `var(--gray-75)` = `#F1EEE9`  | 목록 hover 줄, code 바탕        |
| `--accent` ★          | `var(--gray-75)` = `#F1EEE9`  | shadcn hover 바탕 (주황 아님!)  |
| `--popover` ★         | `var(--gray-25)` = `#FBFAF8`  | shadcn 팝오버(지금은 안 씀)     |
| `--surface-white`     | `var(--gray-0)` = `#FFFFFF`   | 버튼 바탕                       |

### 글자

| 이름                   | 값                            | 쓰는 곳                 |
| ---------------------- | ----------------------------- | ----------------------- |
| `--foreground` ★       | `var(--gray-900)` = `#1F1F1F` | 제목·본문               |
| `--text-body`          | `var(--gray-800)` = `#3D3A36` | 긴 설명                 |
| `--text-secondary`     | `var(--gray-750)` = `#5C5751` | 부제·설명               |
| `--muted-foreground` ★ | `var(--gray-700)` = `#6B655E` | 시각·인구 수            |
| `--text-subtle`        | `var(--gray-600)` = `#8A847C` | 축 글자·메모            |
| `--text-faint`         | `var(--gray-500)` = `#A39B90` | 평소 구 이름, 로딩 제목 |

### 테두리

| 이름                     | 값                            | 쓰는 곳               |
| ------------------------ | ----------------------------- | --------------------- |
| `--border` ★             | `var(--gray-200)` = `#E2DED8` | 범례·카드             |
| `--border-soft`          | `var(--gray-150)` = `#E8E4DE` | 목록 줄 사이          |
| `--border-dashed`        | `var(--gray-250)` = `#D6D1CA` | 실패 칸·메모 점선     |
| `--input` ★              | `var(--gray-900)` = `#1F1F1F` | 버튼 테두리           |
| `--primary` ★            | `var(--gray-900)` = `#1F1F1F` | 검정 채움(버튼 hover) |
| `--primary-foreground` ★ | `var(--gray-0)` = `#FFFFFF`   | 검정 위 흰 글자       |

### 상태

| 이름                  | 값                              | 쓰는 곳                                                      |
| --------------------- | ------------------------------- | ------------------------------------------------------------ |
| `--ring` ★            | `var(--orange-500)` = `#E07A4F` | 키보드 focus 바깥선                                          |
| `--brand`             | `var(--orange-500)` = `#E07A4F` | TOP 1, eyebrow (shadcn의 --accent와 다른 뜻이라 이름을 바꿈) |
| `--destructive` ★     | `var(--red-600)` = `#B5574A`    | ERROR eyebrow                                                |
| `--selected`          | `var(--gray-800)` = `#3D3A36`   | 선택 장소 테두리                                             |
| `--notice`            | `var(--orange-50)` = `#FBF4EA`  | 오래된 데이터 안내 바탕                                      |
| `--notice-border`     | `var(--orange-100)` = `#EBD6BE` | 안내 테두리                                                  |
| `--notice-foreground` | `var(--orange-900)` = `#7A5230` | 안내 글자                                                    |
| `--skeleton`          | `var(--gray-100)` = `#EEEBE6`   | 스켈레톤(반짝임은 gray-50)                                   |

### 혼잡도

| 이름                          | 값                               | 쓰는 곳                  |
| ----------------------------- | -------------------------------- | ------------------------ |
| `--congestion-free`           | `var(--green-100)` = `#CFE8CF`   | 여유                     |
| `--congestion-free-hover`     | `var(--green-200)` = `#B9DEB9`   |                          |
| `--congestion-free-stroke`    | `var(--green-400)` = `#7FB27F`   |                          |
| `--congestion-normal`         | `var(--yellow-100)` = `#F3EED2`  | 보통                     |
| `--congestion-normal-hover`   | `var(--yellow-200)` = `#EDE3B4`  |                          |
| `--congestion-normal-stroke`  | `var(--yellow-500)` = `#C2B064`  |                          |
| `--congestion-busyish`        | `var(--orange-200)` = `#F5C99B`  | 약간 붐빔                |
| `--congestion-busyish-hover`  | `var(--orange-300)` = `#F2B98A`  |                          |
| `--congestion-busyish-stroke` | `var(--orange-500)` = `#E07A4F`  |                          |
| `--congestion-busy`           | `var(--red-200)` = `#EE9A7E`     | 붐빔                     |
| `--congestion-busy-hover`     | `var(--red-300)` = `#EA8A6E`     |                          |
| `--congestion-busy-stroke`    | `var(--red-500)` = `#C9573C`     |                          |
| `--congestion-none`           | `var(--neutral-200)` = `#E6E6E6` | 데이터 없음 (hover 없음) |

### 지도

| 이름                  | 값                            | 쓰는 곳                        |
| --------------------- | ----------------------------- | ------------------------------ |
| `--map-outside`       | `var(--gray-100)` = `#EEEBE6` | 서울 밖, 확대 시 나머지 구     |
| `--map-outside-line`  | `var(--gray-300)` = `#CDC7BF` |                                |
| `--map-line`          | `var(--gray-400)` = `#B5AFA7` | 구 경계선                      |
| `--map-wall`          | `var(--gray-150)` = `#E8E4DE` | 구 옆면                        |
| `--map-empty`         | `var(--gray-25)` = `#FBFAF8`  | 색 없는 구(로딩·실패)          |
| `--map-zoom-face`     | `var(--gray-150)` = `#E8E4DE` | 확대 구 빈 바탕                |
| `--map-zoom-wall`     | `var(--gray-250)` = `#D6D1CA` | 확대 구 옆면                   |
| `--map-zoom-edge`     | `var(--gray-500)` = `#A39B90` | 확대 구 바닥선                 |
| `--map-river`         | `var(--blue-100)` = `#D6E4EB` | 한강 (테두리 blue-300)         |
| `--map-river-outside` | `var(--blue-50)` = `#E4EBEE`  | 서울 밖 한강 (테두리 blue-200) |
| `--map-river-label`   | `var(--blue-500)` = `#7F98A5` | 한강 글자                      |

## 모양·글자·움직임

| 항목             | 값                                                                                                                                                                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--radius` ★     | `6px`. `rounded-sm` 2px · `rounded-md` 4px · `rounded-lg` 6px. 새 shadcn은 `--radius`에 배수(0.6, 0.8)를 곱해서 나누므로 `sm`·`md`는 `@theme inline`에 고정값으로 넣는다 (11/5). 버튼·뱃지 2px, 범례 4px, 패널·카드 6px, 바텀시트 위 모서리 12px(`rounded-t-[12px]`) |
| 패널 그림자      | `0 1px 2px rgba(60,45,30,0.06), 0 10px 30px rgba(60,45,30,0.10)` (웹 떠 있는 패널). `@theme inline`의 `--shadow-panel` → `shadow-panel` 클래스 (11/6)                                                                                                                |
| 바텀시트 그림자  | `0 -1px 2px rgba(60,45,30,0.06), 0 -10px 30px rgba(60,45,30,0.10)` (위쪽으로)                                                                                                                                                                                        |
| 글꼴             | **Pretendard 하나** (한글·영문·숫자 모두). 시각·배율처럼 바뀌는 숫자에는 `font-variant-numeric: tabular-nums`(`tabular-nums` 클래스)                                                                                                                                 |
| 글자 크기        | 웹 제목 22px 800 · 모바일 제목 18px 800 · 패널 제목 18~20px 800 · 본문 13~14px · 보조 12px · eyebrow 11px(letter-spacing 1px)                                                                                                                                        |
| 구 hover         | 1px 위로, `220ms cubic-bezier(.2,.8,.2,1)`. 나머지 구는 배경색 막 opacity .6                                                                                                                                                                                         |
| 처음 색 들어오기 | 데이터 도착 후 400ms 기다렸다가 모든 구 fill이 600ms 동안 `--map-empty` → 혼잡도 색. 5분 갱신 땐 바뀐 구만 `transition: fill`                                                                                                                                        |
| 움직임 줄이기    | `prefers-reduced-motion: reduce`면 위 움직임은 모두 즉시(색만 바뀜)                                                                                                                                                                                                  |

## Tailwind v4에 넣는 법 (`src/app/globals.css`)

`shadcn init`을 **먼저** 해서 `:root`와 `@theme inline`을 만든 뒤, 거기에 primitive를 넣고, shadcn 변수의 **값만** 바꾸고, 우리 semantic을 추가해요. (11/5 적용 완료. 실제 `globals.css`는 `:root`를 아래 분류 주석대로 정리했고, 문서에 없는 shadcn 변수는 `/* shadcn 기본값 (tokens.md에 없음) */` 아래에 그대로 뒀어요.)

아래 코드에 없는 것 두 가지는 `globals.css`에서 따로 처리했어요.

- `@theme inline`의 shadcn 줄 `--radius-sm`, `--radius-md`를 `2px`, `4px` 고정값으로 바꿈
- shadcn이 만든 `--font-sans: var(--font-sans);`(Geist용)를 아래 Pretendard 값으로 바꿈 (줄을 하나 더 추가하지 않음)

```css
:root {
  /* 1층: primitive */
  --gray-0: #ffffff;
  --gray-25: #fbfaf8;
  --gray-50: #f7f6f4;
  --gray-75: #f1eee9;
  --gray-100: #eeebe6;
  --gray-150: #e8e4de;
  --gray-200: #e2ded8;
  --gray-250: #d6d1ca;
  --gray-300: #cdc7bf;
  --gray-400: #b5afa7;
  --gray-500: #a39b90;
  --gray-600: #8a847c;
  --gray-700: #6b655e;
  --gray-750: #5c5751;
  --gray-800: #3d3a36;
  --gray-900: #1f1f1f;
  --neutral-200: #e6e6e6;
  --green-100: #cfe8cf;
  --green-200: #b9deb9;
  --green-400: #7fb27f;
  --yellow-100: #f3eed2;
  --yellow-200: #ede3b4;
  --yellow-500: #c2b064;
  --orange-50: #fbf4ea;
  --orange-100: #ebd6be;
  --orange-200: #f5c99b;
  --orange-300: #f2b98a;
  --orange-500: #e07a4f;
  --orange-900: #7a5230;
  --red-200: #ee9a7e;
  --red-300: #ea8a6e;
  --red-500: #c9573c;
  --red-600: #b5574a;
  --blue-50: #e4ebee;
  --blue-100: #d6e4eb;
  --blue-200: #cbd5da;
  --blue-300: #a9bbc4;
  --blue-500: #7f98a5;

  /* 2층: semantic */
  /* 바탕과 면 */
  --background: var(--gray-50);
  --card: var(--gray-25);
  --card-foreground: var(--gray-900);
  --muted: var(--gray-75);
  --accent: var(--gray-75);
  --popover: var(--gray-25);
  --surface-white: var(--gray-0);
  /* 글자 */
  --foreground: var(--gray-900);
  --text-body: var(--gray-800);
  --text-secondary: var(--gray-750);
  --muted-foreground: var(--gray-700);
  --text-subtle: var(--gray-600);
  --text-faint: var(--gray-500);
  /* 테두리 */
  --border: var(--gray-200);
  --border-soft: var(--gray-150);
  --border-dashed: var(--gray-250);
  --input: var(--gray-900);
  --primary: var(--gray-900);
  --primary-foreground: var(--gray-0);
  /* 상태 */
  --ring: var(--orange-500);
  --brand: var(--orange-500);
  --destructive: var(--red-600);
  --selected: var(--gray-800);
  --notice: var(--orange-50);
  --notice-border: var(--orange-100);
  --notice-foreground: var(--orange-900);
  --skeleton: var(--gray-100);
  /* 혼잡도 */
  --congestion-free: var(--green-100);
  --congestion-free-hover: var(--green-200);
  --congestion-free-stroke: var(--green-400);
  --congestion-normal: var(--yellow-100);
  --congestion-normal-hover: var(--yellow-200);
  --congestion-normal-stroke: var(--yellow-500);
  --congestion-busyish: var(--orange-200);
  --congestion-busyish-hover: var(--orange-300);
  --congestion-busyish-stroke: var(--orange-500);
  --congestion-busy: var(--red-200);
  --congestion-busy-hover: var(--red-300);
  --congestion-busy-stroke: var(--red-500);
  --congestion-none: var(--neutral-200);
  /* 지도 */
  --map-outside: var(--gray-100);
  --map-outside-line: var(--gray-300);
  --map-line: var(--gray-400);
  --map-wall: var(--gray-150);
  --map-empty: var(--gray-25);
  --map-zoom-face: var(--gray-150);
  --map-zoom-wall: var(--gray-250);
  --map-zoom-edge: var(--gray-500);
  --map-river: var(--blue-100);
  --map-river-outside: var(--blue-50);
  --map-river-label: var(--blue-500);
  --radius: 6px;
}

@theme inline {
  /* shadcn이 이미 만든 줄(--color-background 등)은 그대로 두고, 우리 semantic만 추가 */
  --color-surface-white: var(--surface-white);
  --color-text-body: var(--text-body);
  --color-text-secondary: var(--text-secondary);
  --color-text-subtle: var(--text-subtle);
  --color-text-faint: var(--text-faint);
  --color-border-soft: var(--border-soft);
  --color-border-dashed: var(--border-dashed);
  --color-brand: var(--brand);
  --color-selected: var(--selected);
  --color-notice: var(--notice);
  --color-notice-border: var(--notice-border);
  --color-notice-foreground: var(--notice-foreground);
  --color-skeleton: var(--skeleton);
  --color-congestion-free: var(--congestion-free);
  --color-congestion-free-hover: var(--congestion-free-hover);
  --color-congestion-free-stroke: var(--congestion-free-stroke);
  --color-congestion-normal: var(--congestion-normal);
  --color-congestion-normal-hover: var(--congestion-normal-hover);
  --color-congestion-normal-stroke: var(--congestion-normal-stroke);
  --color-congestion-busyish: var(--congestion-busyish);
  --color-congestion-busyish-hover: var(--congestion-busyish-hover);
  --color-congestion-busyish-stroke: var(--congestion-busyish-stroke);
  --color-congestion-busy: var(--congestion-busy);
  --color-congestion-busy-hover: var(--congestion-busy-hover);
  --color-congestion-busy-stroke: var(--congestion-busy-stroke);
  --color-congestion-none: var(--congestion-none);
  --color-map-outside: var(--map-outside);
  --color-map-outside-line: var(--map-outside-line);
  --color-map-line: var(--map-line);
  --color-map-wall: var(--map-wall);
  --color-map-empty: var(--map-empty);
  --color-map-zoom-face: var(--map-zoom-face);
  --color-map-zoom-wall: var(--map-zoom-wall);
  --color-map-zoom-edge: var(--map-zoom-edge);
  --color-map-river: var(--map-river);
  --color-map-river-outside: var(--map-river-outside);
  --color-map-river-label: var(--map-river-label);
  --font-sans: 'Pretendard Variable', Pretendard, system-ui, sans-serif;
}
```

이렇게 하면 `bg-congestion-busy`, `text-text-secondary`, `border-border-soft`, `fill-map-line` 같은 클래스를 바로 쓸 수 있어요.

### Pretendard 넣기

`pnpm add pretendard` 후 `src/app/layout.tsx`에서 `import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'`를 해요 (11/5 적용). 라이선스는 SIL OFL 1.1(무료, 출처 표기 권장).

- **dynamic subset을 고른 이유**: 92조각으로 나뉘어 화면에 나온 글자의 조각만 받아요. `next/font/local`로 `PretendardVariable.woff2`를 쓰면 약 2MB 전체를 첫 화면에서 미리 받아요. 지도 위주라 글자가 적어서 dynamic subset이 유리해요. 자세한 내용은 `docs/log/04-배포와-토큰-구-평균.md`.
- **확인 방법**: 개발 컴퓨터에 Pretendard가 설치돼 있으면 눈으로는 구별이 안 돼요. Elements → 계산됨 → 렌더링된 글꼴이 "네트워크 리소스"인지 봐요.
- `pnpm dev`에서 Network에 `geist-latin.woff2`가 보이는 건 Next 개발 도구가 쓰는 글꼴이라 무시해요.
