import { Point3D } from '../../components/annotation/point';

// Function to rotate a point around the X-axis
export function rotateX(point: Point3D, angle: number): Point3D {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: point.x,
    y: point.y * cos - point.z * sin,
    z: point.y * sin + point.z * cos,
  };
}

// Function to rotate a point around the Y-axis
export function rotateY(point: Point3D, angle: number): Point3D {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: point.x * cos + point.z * sin,
    y: point.y,
    z: -point.x * sin + point.z * cos,
  };
}

// Function to rotate a point around the Z-axis
export function rotateZ(point: Point3D, angle: number): Point3D {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos,
    z: point.z,
  };
}

export function calculateVertices(
  centroid: { x: number; y: number; z: number },
  dimensions: {
    sx: number;
    sy: number;
    sz: number;
  },
  orientation: {
    pitch: number;
    roll: number;
    yaw: number;
  }
): Point3D[] {
  const halfW = dimensions.sx / 2;
  const halfH = dimensions.sy / 2;
  const halfD = dimensions.sz / 2;

  // Initial vertices centered at the origin
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

  // Translate vertices to the centroid
  const translatedVertices = vertices.map((vertex) => ({
    x: vertex.x,
    y: vertex.y,
    z: vertex.z,
  }));

  // Apply rotation
  const rotatedVertices = translatedVertices.map((vertex) => {
    let v = rotateX(vertex, orientation.pitch);
    v = rotateY(v, orientation.roll);
    v = rotateZ(v, orientation.yaw);
    return v;
  });
  const centeredVertices = rotatedVertices.map((vertex) => {
    return {
      x: vertex.x + centroid.x,
      y: vertex.y + centroid.y,
      z: vertex.z + centroid.z,
    };
  });

  return centeredVertices;
}
