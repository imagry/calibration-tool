import { Point2D } from '../../components/annotation/point';

export const canvasToImageScale = (canvas: HTMLCanvasElement) => {
  return new Point2D({
    x: canvas.clientWidth / canvas.width,
    y: canvas.clientHeight / canvas.height,
  });
};

export const viewportToCanvas = (
  viewportX: number,
  viewportY: number,
  canvas: HTMLCanvasElement
) => {
  const canvasRect = canvas.getBoundingClientRect();
  if (!canvasRect) return { x: viewportX, y: viewportY };
  const canvasToImageScale_ = canvasToImageScale(canvas);

  const canvasX = (viewportX - canvasRect.left) / canvasToImageScale_.x;
  const canvasY = (viewportY - canvasRect.top) / canvasToImageScale_.y;

  return { x: canvasX, y: canvasY };
};
