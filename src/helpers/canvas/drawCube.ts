import { drawLine } from './drawline';
import { AnnotationStyle } from 'components/annotation/annotationStyle';

export function drawCubeFromPoints(
  canvas: HTMLCanvasElement,
  points: { x: number; y: number }[],
  style?: AnnotationStyle
) {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to get 2D context');
  }

  const edges = [
    [0, 1],
    [1, 3],
    [3, 2],
    [2, 0],
    [4, 5],
    [5, 7],
    [7, 6],
    [6, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];

  const frontEdges = [
    [3, 2],
    [2, 6],
    [3, 7],
    [7, 6],
  ];

  const backEdges = [
    [0, 5],
    [1, 4],
  ];

  const bottomEdges = [
    [2, 0],
    [1, 3],
  ];

  edges.forEach(([start, end]) => {
    const isFrontEdge = frontEdges.some(
      ([frontStart, frontEnd]) =>
        (frontStart === start && frontEnd === end) ||
        (frontStart === end && frontEnd === start)
    );
    const isBottomEdge = bottomEdges.some(
      ([frontStart, frontEnd]) =>
        (frontStart === start && frontEnd === end) ||
        (frontStart === end && frontEnd === start)
    );

    drawLine(context, points[start], points[end], {
      width: isBottomEdge ? 10 : 1,
      color: isFrontEdge ? style?.frontColor : style?.color,
      opacity: style?.opacity,
    });
  });

  backEdges.forEach(([start, end]) => {
    drawLine(context, points[start], points[end], {
      width: 1,
      color: style?.backColor,
      opacity: style?.opacity,
    });
  });
}
