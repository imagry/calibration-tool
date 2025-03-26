export function drawLine(
  context: CanvasRenderingContext2D,
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  style: { width?: number; color?: string; opacity?: number }
) {
  context.beginPath();
  context.moveTo(p1.x, p1.y);
  context.lineTo(p2.x, p2.y);
  context.lineWidth = style.width ?? 1;
  context.strokeStyle = style.color ?? 'black';
  context.globalAlpha = style.opacity ?? 1;
  context.stroke();
  context.globalAlpha = 1;
}
