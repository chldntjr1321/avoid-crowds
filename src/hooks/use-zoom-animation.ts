import districts from '@/data/generated/districts.json';
import { useLayoutEffect, useRef } from 'react';

type ViewBox = { x: number; y: number; width: number; height: number };

const SEOUL_VIEW_BOX: ViewBox = { x: 0, y: 0, width: 1000, height: 1000 };

function getViewBox(gu: string | null): ViewBox {
  if (!gu) {
    return SEOUL_VIEW_BOX;
  }
  const targetGu = districts.find((district) => district.name === gu);
  if (!targetGu) {
    return SEOUL_VIEW_BOX;
  }
  const [[left, top], [right, bottom]] = targetGu.bbox;
  const width = right - left;
  const height = bottom - top;
  const pad = Math.max(width, height) * 0.3; // 자치구 및 장소 선택 시 여백 크기

  return {
    x: left - pad,
    y: top - pad,
    width: width + pad * 2,
    height: height + pad * 2,
  };
}

// viewBox가 상자에 통째로 들어가는 가장 큰 배율 (지도 1단위가 화면에서 몇 px인지)
function getScale(viewBox: ViewBox, boxWidth: number, boxHeight: number) {
  const scale = Math.min(boxWidth / viewBox.width, boxHeight / viewBox.height);

  return scale;
}

function getCenter(viewBox: ViewBox) {
  const center = {
    x: viewBox.x + viewBox.width / 2,
    y: viewBox.y + viewBox.height / 2,
  };

  return center;
}

// 새 viewBox(to)가 적용된 svg를 이전 viewBox(from)처럼 보이게 되돌리는 값
function getFlipTransform(
  from: ViewBox,
  to: ViewBox,
  boxWidth: number,
  boxHeight: number,
) {
  const s0 = getScale(from, boxWidth, boxHeight);
  const s1 = getScale(to, boxWidth, boxHeight);
  const c0 = getCenter(from);
  const c1 = getCenter(to);

  const k = s0 / s1;
  const dx = s0 * (c1.x - c0.x);
  const dy = s0 * (c1.y - c0.y);

  return { k, dx, dy };
}

export default function useZoomAnimation(gu: string | null) {
  const viewBox = getViewBox(gu);
  const containerRef = useRef<HTMLDivElement>(null); // 상자 크기를 잴 div
  const svgRef = useRef<SVGSVGElement>(null); // transform을 걸 svg
  const prevViewBoxRef = useRef(viewBox); // 바뀌기 전 viewBox

  // 화면에 그리기 전에 실행 → 확대된 화면이 한 프레임도 보이지 않음
  useLayoutEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) {
      return;
    }

    const from = prevViewBoxRef.current;
    const to = getViewBox(gu);
    prevViewBoxRef.current = to;

    // Invert: 새 viewBox가 이미 적용된 svg를 이전 화면처럼 보이게 되돌림
    const { k, dx, dy } = getFlipTransform(
      from,
      to,
      container.clientWidth,
      container.clientHeight,
    );
    svg.style.transition = 'none';
    svg.style.transform = `translate(${dx}px, ${dy}px) scale(${k})`;

    // Play: 출발점이 한 번 그려진 다음 프레임에 transform을 풀어 transition으로 움직이기
    let secondFrameId = 0;
    const firstFrameId = requestAnimationFrame(() => {
      secondFrameId = requestAnimationFrame(() => {
        svg.style.transition = ''; // inline 값을 지워 className의 transition을 다시 살림
        svg.style.transform = ''; // 출발점을 지움 → 0.5초 동안 원래 크기로 돌아옴
      });
    });

    // 움직이기 전에 gu가 또 바뀌면 남은 예약을 취소
    return () => {
      cancelAnimationFrame(firstFrameId);
      cancelAnimationFrame(secondFrameId);
    };
  }, [gu]);

  return { viewBox, containerRef, svgRef };
}
