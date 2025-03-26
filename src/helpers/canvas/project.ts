import { Point3D } from 'components/annotation/point';

export function project(
  point: Point3D,
  context: HTMLCanvasElement
): { x: number; y: number } {
  return { x: point.x, y: point.y };
  const x = (point.x * context.clientWidth) / context.width;
  const y = (point.y * context.clientHeight) / context.height;
  return { x, y };
}

export class Transform3D {
  // Translation matrix
  static translationMatrix(tx: number, ty: number, tz: number): number[][] {
    return [
      [1, 0, 0, tx],
      [0, 1, 0, ty],
      [0, 0, 1, tz],
      [0, 0, 0, 1],
    ];
  }

  // Scaling matrix
  static scalingMatrix(sx: number, sy: number, sz: number): number[][] {
    return [
      [sx, 0, 0, 0],
      [0, sy, 0, 0],
      [0, 0, sz, 0],
      [0, 0, 0, 1],
    ];
  }

  // Rotation matrices for pitch, roll, yaw (in radians)
  static rotationMatrixX(pitch: number): number[][] {
    return [
      [1, 0, 0, 0],
      [0, Math.cos(pitch), -Math.sin(pitch), 0],
      [0, Math.sin(pitch), Math.cos(pitch), 0],
      [0, 0, 0, 1],
    ];
  }

  static rotationMatrixY(roll: number): number[][] {
    return [
      [Math.cos(roll), 0, Math.sin(roll), 0],
      [0, 1, 0, 0],
      [-Math.sin(roll), 0, Math.cos(roll), 0],
      [0, 0, 0, 1],
    ];
  }

  static rotationMatrixZ(yaw: number): number[][] {
    return [
      [Math.cos(yaw), -Math.sin(yaw), 0, 0],
      [Math.sin(yaw), Math.cos(yaw), 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
  }

  // Combine transformations
  static combineMatrices(matrices: number[][][]): number[][] {
    return matrices.reduce((a, b) => this.multiplyMatrices(a, b));
  }

  // Multiply two matrices
  static multiplyMatrices(a: number[][], b: number[][]): number[][] {
    const result: number[][] = Array(a.length)
      .fill(0)
      .map(() => Array(b[0].length).fill(0));
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b[0].length; j++) {
        for (let k = 0; k < a[0].length; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return result;
  }

  static getFocal(fov: number = Math.PI / 4): number {
    // `fov` in radians
    return 1 / Math.tan(fov / 2);
  }

  // Convert degrees to radians
  static deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Convert radians to degrees
  static rad2deg(radians: number): number {
    return radians * (180 / Math.PI);
  }

  // Get the center of a 2D image
  static getImageCenter(
    width: number,
    height: number
  ): { x: number; y: number } {
    return {
      x: width / 2,
      y: height / 2,
    };
  }

  static perspectiveMatrix(
    fov: number,
    width: number,
    height: number,
    far: number,
    near: number
  ): number[][] {
    const f = 1.0 / Math.tan((fov / 2) * (Math.PI / 180));
    return [
      [f / (width / height), 0, 0, 0],
      [0, f, 0, 0],
      [0, 0, (far + near) / (near - far), (2 * far * near) / (near - far)],
      [0, 0, -1, 0],
    ];
  }

  // Apply transformation
  static applyTransformation(
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    pitch: number,
    roll: number,
    yaw: number,
    tx: number,
    ty: number,
    tz: number
  ): {
    x: number;
    y: number;
    z: number;
    sx: number;
    sy: number;
    sz: number;
    pitch: number;
    roll: number;
    yaw: number;
  } {
    const translationMatrix = this.translationMatrix(tx, ty, tz);
    const scalingMatrix = this.scalingMatrix(sx, sy, sz);
    const rotationMatrixX = this.rotationMatrixX(pitch);
    const rotationMatrixY = this.rotationMatrixY(roll);
    const rotationMatrixZ = this.rotationMatrixZ(yaw);

    const transformationMatrix = this.combineMatrices([
      translationMatrix,
      scalingMatrix,
      rotationMatrixZ,
      rotationMatrixY,
      rotationMatrixX,
    ]);

    const coords = [x, y, z, 1];
    const transformedCoords = this.multiplyMatrixAndPoint(
      transformationMatrix,
      coords
    );

    return {
      x: transformedCoords[0],
      y: transformedCoords[1],
      z: transformedCoords[2],
      sx: sx,
      sy: sy,
      sz: sz,
      pitch: pitch,
      roll: roll,
      yaw: yaw,
    };
  }

  // Multiply matrix and point
  static multiplyMatrixAndPoint(matrix: number[][], point: number[]): number[] {
    const result: number[] = [];
    for (let i = 0; i < matrix.length; i++) {
      let sum = 0;
      for (let j = 0; j < point.length; j++) {
        sum += matrix[i][j] * point[j];
      }
      result.push(sum);
    }
    return result;
  }
}

export class Cuboid3d extends Transform3D {
  position: { x: number; y: number; z: number };
  size: { sx: number; sy: number; sz: number };
  orientation: { pitch: number; roll: number; yaw: number };

  constructor(
    position: { x: number; y: number; z: number },
    size: { sx: number; sy: number; sz: number },
    orientation: { pitch: number; roll: number; yaw: number }
  ) {
    super();
    this.position = position;
    this.size = size;
    this.orientation = orientation;
  }

  get3DPoints(): { x: number; y: number; z: number }[] {
    const halfSx = this.size.sx / 2;
    const halfSy = this.size.sy / 2;
    const halfSz = this.size.sz / 2;

    const vertices = [
      { x: -halfSx, y: -halfSy, z: -halfSz },
      { x: halfSx, y: -halfSy, z: -halfSz },
      { x: halfSx, y: halfSy, z: -halfSz },
      { x: -halfSx, y: halfSy, z: -halfSz },
      { x: -halfSx, y: -halfSy, z: halfSz },
      { x: halfSx, y: -halfSy, z: halfSz },
      { x: halfSx, y: halfSy, z: halfSz },
      { x: -halfSx, y: halfSy, z: halfSz },
    ];

    const rotationMatrixX = Transform3D.rotationMatrixX(this.orientation.pitch);
    const rotationMatrixY = Transform3D.rotationMatrixY(this.orientation.roll);
    const rotationMatrixZ = Transform3D.rotationMatrixZ(this.orientation.yaw);
    const rotationMatrix = Transform3D.combineMatrices([
      rotationMatrixZ,
      rotationMatrixY,
      rotationMatrixX,
    ]);

    return vertices.map((vertex) => {
      const transformedVertex = Transform3D.multiplyMatrixAndPoint(
        rotationMatrix,
        [vertex.x, vertex.y, vertex.z, 1]
      );
      return {
        x: transformedVertex[0] + this.position.x,
        y: transformedVertex[1] + this.position.y,
        z: transformedVertex[2] + this.position.z,
      };
    });
  }

  projectCuboidTo2D(
    fov: number = Math.PI / 4,
    width: number,
    height: number
  ): { x: number; y: number }[] {
    const perspectiveMatrix = Transform3D.perspectiveMatrix(
      fov,
      width,
      height,
      1000,
      0.1
    );
    const focalLength = Transform3D.getFocal(fov);
    const imageCenter = Transform3D.getImageCenter(width, height);
    const points3D = this.get3DPoints();
    return points3D.map((point) => {
      const newPoint = Transform3D.multiplyMatrixAndPoint(perspectiveMatrix, [
        point.x,
        point.y,
        point.z,
      ]);
      const x =
        (newPoint[0] * focalLength * width) / newPoint[3] + imageCenter.x;
      const y =
        (newPoint[1] * focalLength * height) / newPoint[3] + imageCenter.y;
      return { x, y };
    });
  }
}
