class Point2D {
  x: number;
  y: number;

  constructor(arg: { x: number; y: number }) {
    this.x = arg.x;
    this.y = arg.y;
  }

  // Method to display the point coordinates
  draw(
    ctx: CanvasRenderingContext2D,
    size: number = 5,
    style: { color?: string; filled?: boolean }
  ): void {
    ctx.beginPath();
    ctx.arc(this.x, this.y, size, 0, Math.PI * 2, true);
    if (style.color) {
      ctx.fillStyle = style.color;
      ctx.strokeStyle = style.color;
    }
    if (style.filled === true) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  }
}

export type Point3D = { x: number; y: number; z: number; v?: number };

export { Point2D };
