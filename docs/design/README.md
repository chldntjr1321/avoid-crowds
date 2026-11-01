# 화면 도안 (2026-11-01 최종)

원본 와이어프레임: https://claude.ai/artifact/Pg9n5sVm2XwXPgrwxER62R
화면 규칙 설명은 `docs/03-screens-and-mvp.md`, 색·글자 값 이름은 `tokens.md`.

## 웹 (1024px 이상) · `web/`
| 파일 | 화면 |
| --- | --- |
| `01-seoul` | 1. 서울 전체 처음 화면. 지도 전체 + 떠 있는 패널(TOP 5). HTML에서 구에 마우스를 올리면 hover가 실제로 움직인다 |
| `01-L-loading` | 1-L. 로딩. 색 없는 지도 + TOP 5 스켈레톤 |
| `01-E-error` | 1-E. 전체 실패. 패널 정중앙에 안내 + 다시 시도 |
| `01-S-stale` | 1-S. 일부 실패·오래된 데이터. 제목 아래 주황 안내 |
| `02-district` | 2. 구 확대(중구). 패널에 구 요약 + 장소 목록(북적 · 한적) |
| `02-Z-wheel-zoom` | 2-Z. 휠로 300%까지 더 확대 (MVP 이후 가능) |
| `03-place` | 3. 장소 상세(남산공원). 패널에 정보 → 사진 → 안내 문구 → 12시간 예측 |
| `03-F-forecast-error` | 3-F. 예측 그래프만 실패 |

## 모바일 (1024px 미만) · `mobile/`
| 파일 | 화면 |
| --- | --- |
| `M-flow` | 폰 7대: M-1 처음(용산 1.8배) · M-2 구 선택 · M-3 구 확대 · M-4 장소 상세(시트 중간) · M-4b 화면을 덮는 시트 · M-5 시트 최소 · M-5b 구 선택 중 시트 최소 |
| `M-states` | 폰 5대: 로딩 · 전체 실패 · 오래된 데이터 · 예측만 실패 · 전체 실패(시트 최소) |

## 디자인 시스템 · `system/`
| 파일 | 내용 |
| --- | --- |
| `DS-1-foundations` | 색(primitive → semantic), 글자, 모서리, 그림자, 간격, 움직임, Tailwind에 넣는 법 |
| `DS-2-primitives` | 작은 부품: Button, IconButton, ToggleGroup underline(북적 · 한적), Badge 혼잡도 variant, Eyebrow, Skeleton, LegendSwatch, Notice, Breadcrumb, MapHint, Divider, Readout, 지도 도형 |
| `DS-3-composites` | 조합 부품(웹 + 모바일)과 **화면별 사용 부품 표** |
| `sort-options-discussion` | 정렬 버튼 시안 비교 기록(최종은 E안 모양 + "북적 · 한적" 문구) |
| `../tokens.md` | 토큰 전체 목록과 `globals.css`에 붙여 넣을 코드 |

## 보는 법
- **PNG**: 전체 모양과 배치를 볼 때.
- **HTML**: 정확한 크기, 선 두께, 간격, CSS 값을 읽을 때. 브라우저로 그냥 열면 된다(글꼴은 HTML 안에 들어 있음).
- 모바일 PNG는 가로로 길다. 폰 한 대 = 390×844.

## 주의
- HTML 안의 SVG path 좌표는 **와이어프레임용 임시 데이터**다. 복사하지 않는다. 실제 path는 변환 스크립트 결과(`src/data/generated/`)를 쓴다.
- HTML의 색은 hex로 적혀 있지만, 코드에서는 `tokens.md`의 semantic 이름으로 쓴다(모든 hex가 primitive 중 하나와 같다).
- 장소 이름, 인구 수, TOP 5, 사진은 모두 예시다.
