export type Point3D = { x: number; y: number; z: number; v?: number };
export type AnnotationStyle = {
  color?: string;
  opacity?: number;
  size?: number;
  fillStyle?: string | CanvasGradient | CanvasPattern;
  frontColor?: string;
  backColor?: string;
};

export type calibrationType = {
  X: number;
  Y: number;
  Z: number;
  pitch: number;
  roll: number;
  yaw: number;
  FOV: number;
};

class Annotation3D {
  style: AnnotationStyle | undefined;
  pointList: Point3D[];
  id?: number;

  static calculatePoints(
    dimensions: { sx: number; sy: number; sz: number },
    orientation: { pitch: number; roll: number; yaw: number },
    centroid: { x: number; y: number; z: number }
  ): Point3D[] {
    const halfW = dimensions.sx / 2;
    const halfH = dimensions.sy / 2;
    const halfD = dimensions.sz / 2;
    const vertices: Point3D[] = [
      { x: -halfW, y: -halfH, z: -halfD },
      { x: halfW, y: -halfH, z: -halfD },
      { x: -halfW, y: halfH, z: -halfD },
      { x: halfW, y: halfH, z: -halfD },
      { x: -halfW, y: -halfH, z: halfD },
      { x: halfW, y: -halfH, z: halfD },
      { x: -halfW, y: halfH, z: halfD },
      { x: halfW, y: halfH, z: halfD },
    ];
    const rotatePositions = Annotation3D.translateRotation(
      vertices,
      orientation.pitch,
      orientation.roll,
      orientation.yaw
    );
    const translatePositions = Annotation3D.translatePositions(
      rotatePositions,
      centroid.x,
      centroid.y,
      centroid.z
    );

    return translatePositions;
  }

  constructor(
    centroid: { x: number; y: number; z: number },
    dimensions: { sx: number; sy: number; sz: number },
    orientation: { pitch: number; roll: number; yaw: number },
    id?: number,
    style?: AnnotationStyle
  ) {
    this.pointList = Annotation3D.calculatePoints(
      dimensions,
      orientation,
      centroid
    );
    this.id = id;
    this.style = style;
  }

  getCentroid() {
    const totalPoints = this.pointList.length;
    const sum = this.pointList.reduce(
      (acc, point) => {
        acc.x += point.x;
        acc.y += point.y;
        acc.z += point.z;
        return acc;
      },
      { x: 0, y: 0, z: 0 }
    );

    return {
      x: sum.x / totalPoints,
      y: sum.y / totalPoints,
      z: sum.z / totalPoints,
    };
  }

  static getFocalPoints(
    fov: number,
    img_width: number,
    img_height: number,
    pointList: Point3D[],
    prt: boolean = false
  ): { x: number; y: number }[] {
    const focal = img_width / Math.tan((fov / 2) * (Math.PI / 180)) / 2;
    return pointList.map((point) => {
      prt &&
        console.log(`      (${focal.toFixed(3)}, 0.00, ${img_width / 2} )
      (0.00, ${focal.toFixed(3)}, ${img_height / 2})
      (0.00, 0.00, 1.00)`);

      prt &&
        console.log(
          'U',
          (focal * point.x + (point.z * img_width) / 2).toFixed(3),
          (focal * point.y + (point.z * img_height) / 2).toFixed(3),
          point.z.toFixed(3)
        );

      return {
        x: (focal * point.x + (point.z * img_width) / 2) / point.z,
        y: (focal * point.y + (point.z * img_height) / 2) / point.z,
      };
    });
  }

  static multiplyMatrixAndVector(
    matrix: number[][], //4X4 matrix
    vector: Point3D,
    prt: boolean = false
  ): Point3D {
    const x =
      matrix[0][0] * vector.x +
      matrix[0][1] * vector.y +
      matrix[0][2] * vector.z +
      (matrix.length == 4 ? matrix[0][3] : 0);

    const y =
      matrix[1][0] * vector.x +
      matrix[1][1] * vector.y +
      matrix[1][2] * vector.z +
      (matrix.length == 4 ? matrix[1][3] : 0);
    const z =
      matrix[2][0] * vector.x +
      matrix[2][1] * vector.y +
      matrix[2][2] * vector.z +
      (matrix.length == 4 ? matrix[2][3] : 0);

    const w =
      matrix.length === 3
        ? 1
        : matrix[3][0] * vector.x +
          matrix[3][1] * vector.y +
          matrix[3][2] * vector.z +
          matrix[3][3];
    return { x: x / w, y: y / w, z: z / w, v: vector.v };
  }

  static createTranslationMatrix(
    tx: number,
    ty: number,
    tz: number
  ): number[][] {
    return [
      [1, 0, 0, tx],
      [0, 1, 0, ty],
      [0, 0, 1, tz],
      [0, 0, 0, 1],
    ];
  }
  static combineMatrices = (a: number[][], b: number[][]): number[][] => {
    const result = Array(a.length)
      .fill(null)
      .map(() => Array(b[0].length).fill(0));
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b[0].length; j++) {
        for (let k = 0; k < b.length; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return result;
  };

  //Xe = Rl_e+Xl  + Te_l
  static translateLidarPointsToEgo(
    points: Point3D[],
    lidarToEgoTranslation: calibrationType
  ): Point3D[] {
    console.log("Tc'9l'");
    const egoPoints = Annotation3D.translatePositionAndRotation(points, {
      X: 0,
      Y: 0,
      Z: 0,
      roll: -180,
      pitch: 0,
      yaw: -90,
    });
    console.log(
      "Xc'9",
      egoPoints[0].x.toFixed(3),
      egoPoints[0].y.toFixed(3),
      egoPoints[0].z.toFixed(3)
    );
    console.log("Twc'9");
    return Annotation3D.translatePositionAndRotation(
      egoPoints,
      {
        X: lidarToEgoTranslation.X,
        Y: -lidarToEgoTranslation.Y,
        Z: -lidarToEgoTranslation.Z,
        roll: lidarToEgoTranslation.roll,
        pitch: -lidarToEgoTranslation.pitch,
        yaw: -lidarToEgoTranslation.yaw,
      },
      true
    );
  }

  // [[ 0.   , -1.   , -0.002, -1.846],
  // [ 1.   ,  0.   ,  0.016,  0.005],
  // [-0.016, -0.002,  1.   ,  1.87 ],
  //  [ 0.   ,  0.   ,  0.   ,  1.   ]]

  // [0.9999975434136671, -0.00003535785238416131, -0.0022162843800361967]
  // [1.224643790696764e-16, -0.9998727646182582, 0.015951632350364613]
  // [-0.002216566405708985, 0.015951593163802593, 0.9998703083444901]

  static translateEgoToCamera(
    egoPoints: Point3D[],
    egoToCameraTranslation: calibrationType
  ): Point3D[] {
    const cameraCalibration: calibrationType = {
      X: -egoToCameraTranslation.X,
      Y: egoToCameraTranslation.Y,
      Z: egoToCameraTranslation.Z,
      roll: -egoToCameraTranslation.roll,
      pitch: egoToCameraTranslation.pitch,
      yaw: egoToCameraTranslation.yaw,
      FOV: egoToCameraTranslation.FOV,
    };
    return Annotation3D.reverseTranslatePositionAndRotation(
      egoPoints,
      cameraCalibration
    );
  }
  //Xc = Rc'_c*Xc'
  // (0  0 1)
  // (-1 0 0)
  // (0 -1 0)
  static translateCameraToImage(cameraPoints: Point3D[]): Point3D[] {
    return Annotation3D.translatePositionAndRotation(cameraPoints, {
      X: 0,
      Y: 0,
      Z: 0,
      roll: -90,
      pitch: 0,
      yaw: -90,
    });
  }

  static translateLidarToImage(
    points: Point3D[],
    lidarToEgoTranslation: calibrationType,
    egoToCameraTranslation: calibrationType
  ): Point3D[] {
    console.log(
      "Xl'",
      points[0].x.toFixed(3),
      points[0].y.toFixed(3),
      points[0].z.toFixed(3)
    );
    const egoPoints = this.translateLidarPointsToEgo(
      points,
      lidarToEgoTranslation
    );
    console.log(
      'Xw',
      egoPoints[0].x.toFixed(3),
      egoPoints[0].y.toFixed(3),
      egoPoints[0].z.toFixed(3)
    );
    console.log("Tc'iw");
    const cameraPoints = this.translateEgoToCamera(
      egoPoints,
      egoToCameraTranslation
    );
    console.log(
      "Xci'",
      cameraPoints[0].x.toFixed(3),
      cameraPoints[0].y.toFixed(3),
      cameraPoints[0].z.toFixed(3)
    );
    //TCC', Tc'w, Twc'9
    console.log("Tcc'i");
    const imagePoints = this.translateCameraToImage(cameraPoints);
    console.log(
      'Xc',
      imagePoints[0].x.toFixed(3),
      imagePoints[0].y.toFixed(3),
      imagePoints[0].z.toFixed(3)
    );

    return imagePoints;
  }

  static reverseTranslatePositionAndRotation(
    pointList: Point3D[],
    t: {
      X: number;
      Y: number;
      Z: number;
      roll: number;
      pitch: number;
      yaw: number;
    },
    debug: boolean = false
  ): Point3D[] {
    const { X, Y, Z, roll, pitch, yaw } = t;
    const RotationMatrix = Annotation3D.getRotationMatrix({
      roll: roll,
      pitch: pitch,
      yaw: yaw,
    });

    const inverseRotationMatrix: number[][] = [];
    for (let i = 0; i < 3; i++) {
      inverseRotationMatrix[i] = [];
      for (let j = 0; j < 3; j++) {
        inverseRotationMatrix[i][j] = RotationMatrix[i][j];
      }
    }

    const inverseTranslationMatrix = Annotation3D.multiplyMatrixAndVector(
      inverseRotationMatrix,
      { x: X, y: Y, z: Z, v: 1 },
      true
    );
    inverseRotationMatrix[0].push(inverseTranslationMatrix.x);
    inverseRotationMatrix[1].push(inverseTranslationMatrix.y);
    inverseRotationMatrix[2].push(inverseTranslationMatrix.z);
    inverseRotationMatrix.push([0, 0, 0, 1]);

    // console.log(
    //   Annotation3D.multiplyMatrixAndVector(
    //     inverseRotationMatrix,
    //     pointList[0],
    //     true
    //   )
    // );

    return pointList.map((point) => {
      return Annotation3D.multiplyMatrixAndVector(inverseRotationMatrix, point);
    });
  }

  //Xb = Ra_b * Xa + Ta_b
  static translatePositionAndRotation(
    pointList: Point3D[],
    t: {
      X: number;
      Y: number;
      Z: number;
      roll: number;
      pitch: number;
      yaw: number;
    },
    prt: boolean = false
  ): Point3D[] {
    const { X, Y, Z, roll, pitch, yaw } = t;
    const rotationMatrix = Annotation3D.getRotationMatrix({
      roll: roll,
      pitch: pitch,
      yaw: yaw,
    });
    rotationMatrix[0].push(X);
    rotationMatrix[1].push(Y);
    rotationMatrix[2].push(Z);
    rotationMatrix[3] = [0, 0, 0, 1];
    prt &&
      console.log(`      (${rotationMatrix[0][0].toFixed(
        3
      )}, ${rotationMatrix[0][1].toFixed(3)}, ${rotationMatrix[0][2].toFixed(
        3
      )}, ${rotationMatrix[0][3].toFixed(3)})
      (${rotationMatrix[1][0].toFixed(3)}, ${rotationMatrix[1][1].toFixed(
        3
      )}, ${rotationMatrix[1][2].toFixed(3)}, ${rotationMatrix[1][3].toFixed(
        3
      )})
      (${rotationMatrix[2][0].toFixed(3)}, ${rotationMatrix[2][1].toFixed(
        3
      )}, ${rotationMatrix[2][2].toFixed(3)}, ${rotationMatrix[2][3].toFixed(
        3
      )})
      (${rotationMatrix[3][0].toFixed(3)}, ${rotationMatrix[3][1].toFixed(
        3
      )}, ${rotationMatrix[3][2].toFixed(3)}, ${rotationMatrix[3][3].toFixed(
        3
      )})`);
    Annotation3D.multiplyMatrixAndVector(rotationMatrix, pointList[0], prt);

    return pointList.map((point) => {
      const rotatedPoint = Annotation3D.multiplyMatrixAndVector(
        rotationMatrix,
        point
      );
      return {
        x: rotatedPoint.x,
        y: rotatedPoint.y,
        z: rotatedPoint.z,
        v: rotatedPoint.v,
      };
    });
  }

  static getRotationMatrix(tOrientation: {
    pitch: number;
    roll: number;
    yaw: number;
  }) {
    const { pitch, roll, yaw } = tOrientation;
    const radPitch = Annotation3D.deg2rad(pitch);
    const radRoll = Annotation3D.deg2rad(roll);
    const radYaw = Annotation3D.deg2rad(yaw);

    const cosPitch = Math.cos(radPitch);
    const sinPitch = Math.sin(radPitch);
    const cosRoll = Math.cos(radRoll);
    const sinRoll = Math.sin(radRoll);
    const cosYaw = Math.cos(radYaw);
    const sinYaw = Math.sin(radYaw);

    const Rx = [
      [1, 0, 0],
      [0, cosRoll, -sinRoll],
      [0, sinRoll, cosRoll],
    ];
    const Ry = [
      [cosPitch, 0, sinPitch],
      [0, 1, 0],
      [-sinPitch, 0, cosPitch],
    ];
    const Rz = [
      [cosYaw, -sinYaw, 0],
      [sinYaw, cosYaw, 0],
      [0, 0, 1],
    ];

    const R = this.combineMatrices(Rx, this.combineMatrices(Ry, Rz));
    return R;
  }

  static pincushionDistort(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    k: number
  ) {
    const dx = x - centerX;
    const dy = y - centerY;
    const r = Math.sqrt(dx * dx + dy * dy);
    const factor = 1 + k * (r * r);
    return {
      x: centerX + dx * factor,
      y: centerY + dy * factor,
    };
  }

  static scalePoints(pointList: Point3D[], sx: number, sy: number, sz: number) {
    return pointList.map((point) => {
      return { x: point.x * sx, y: point.y * sy, z: point.z * sz, v: point.v };
    });
  }

  static translatePositions(
    pointList: Point3D[],
    tx: number,
    ty: number,
    tz: number
  ): Point3D[] {
    const translationMatrix = Annotation3D.createTranslationMatrix(tx, ty, tz);
    return pointList.map((point) => {
      return Annotation3D.multiplyMatrixAndVector(translationMatrix, point);
    });
  }

  translatePositions(tx: number, ty: number, tz: number): void {
    const translationMatrix = Annotation3D.createTranslationMatrix(tx, ty, tz);
    this.pointList = this.pointList.map((point) => {
      return Annotation3D.multiplyMatrixAndVector(translationMatrix, point);
    });
  }

  static translateRotation(
    pointList: Point3D[],
    tpitch: number,
    troll: number,
    tyaw: number
  ): Point3D[] {
    const rotationMatrix = Annotation3D.getRotationMatrix({
      pitch: tpitch,
      roll: troll,
      yaw: tyaw,
    });
    return pointList.map((point) => {
      return Annotation3D.multiplyMatrixAndVector(rotationMatrix, point);
    });
  }

  translateRotation(tpitch: number, troll: number, tyaw: number): void {
    const rotationMatrix = Annotation3D.getRotationMatrix({
      pitch: tpitch,
      roll: troll,
      yaw: tyaw,
    });
    this.pointList = this.pointList.map((point) => {
      return Annotation3D.multiplyMatrixAndVector(rotationMatrix, point);
    });
  }
  trasnlatePoints(
    tpitch: number,
    troll: number,
    tyaw: number,
    tx: number = 0,
    ty: number = 0,
    tz: number = 0
  ): void {
    const rotationMatrix = Annotation3D.getRotationMatrix({
      pitch: tpitch,
      roll: troll,
      yaw: tyaw,
    });
    const translationMatrix = Annotation3D.createTranslationMatrix(tx, ty, tz);
    this.pointList = this.pointList.map((point) => {
      const rotatedPoint = Annotation3D.multiplyMatrixAndVector(
        rotationMatrix,
        point
      );
      return Annotation3D.multiplyMatrixAndVector(
        translationMatrix,
        rotatedPoint
      );
    });
  }

  static drawLine(
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

  static drawCubeFromPoints(
    context: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    style?: AnnotationStyle
  ) {
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

      Annotation3D.drawLine(context, points[start], points[end], {
        width: isBottomEdge ? 10 : 1,
        color: isFrontEdge ? style?.frontColor : style?.color,
        opacity: style?.opacity,
      });
    });

    backEdges.forEach(([start, end]) => {
      Annotation3D.drawLine(context, points[start], points[end], {
        width: 1,
        color: style?.backColor,
        opacity: style?.opacity,
      });
    });
  }

  draw(
    context: CanvasRenderingContext2D,
    fov: number,
    width: number,
    height: number,
    style?: AnnotationStyle,
    distortion: number = 0
  ) {
    if (context && this.getCentroid().z >= 0) {
      let focalPoints = Annotation3D.getFocalPoints(
        fov,
        width,
        height,
        this.pointList
      );

      Annotation3D.drawCubeFromPoints(
        context,
        focalPoints,
        style ?? this.style
      );
    }
  }

  onCentroidClick(func: (event: MouseEvent) => void) {}
  static deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static rad2deg(radians: number): number {
    return radians * (180 / Math.PI);
  }

  static drawPoint(
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
    fov: number,
    width: number,
    height: number,
    // distortion: number = 0,
    style?: AnnotationStyle,
    prt: boolean = false
  ) {
    const context = canvas.getContext('2d');
    if (context) {
      const focalPoint = Annotation3D.getFocalPoints(
        fov,
        width,
        height,
        [point],
        prt
      )[0];
      prt &&
        console.log('(u,v)', focalPoint.x.toFixed(3), focalPoint.y.toFixed(3));
      context.fillStyle = style?.color ?? 'red';
      context.beginPath();
      context.arc(focalPoint.x, focalPoint.y, style?.size ?? 1, 0, 2 * Math.PI);
      context.fill();
      return focalPoint;
    }
  }
}

export { Annotation3D };
