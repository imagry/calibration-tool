import React, { createContext, useContext, useState } from 'react';

type Point3D = { x: number; y: number; z: number };

export type calibrationType = {
  X: number;
  Y: number;
  Z: number;
  pitch: number;
  roll: number;
  yaw: number;
  FOV: number;
};

export const defaultCalibration: calibrationType = {
  X: 0,
  Y: 0,
  Z: 0,
  pitch: 0,
  roll: 0,
  yaw: 0,
  FOV: 120,
};

// export const lidarToEgoTranslation: calibrationType = { //1699186586.211930_pcd
//   //older calibration
//   X: 1.105,
//   Y: 1.023,
//   Z: 1.876,
//   pitch: 0,
//   roll: 0,
//   yaw: 90,
//   FOV: 360,
// };

// export const EgoToLidarTranslation: calibrationType = {
//   //1731044482.042498_pcd
//   X: -1.846,
//   Y: 0.005,
//   Z: 1.872,
//   pitch: 0,
//   roll: 0,
//   yaw: 0,
//   FOV: 360,
// };

export const EgoToLidarTranslation: calibrationType = {
  //2025-01-21
  X: 0,
  Y: 0,
  Z: 0,
  pitch: 0,
  roll: 0,
  yaw: 0,
  FOV: 360,
};

export const defaultCameraCalibration: Record<string, calibrationType> = {
  //2025-01-21
  image_0l: {
    X: -1.628,
    Y: 0.589,
    Z: 1.582,
    pitch: 11.999,
    roll: -6.061,
    yaw: 51.683,
    FOV: 93,
  },

  image_1l: {
    X: -0.746,
    Y: 0.996,
    Z: 1.019,
    pitch: -0.115,
    roll: 1.906,
    yaw: 135.341,
    FOV: 93,
  },

  image_2l: {
    X: -0.855,
    Y: -0.331,
    Z: 1.376,
    pitch: -13.963,
    roll: -1.812,
    yaw: -0.625,
    FOV: 110,
  },

  image_3l: {
    X: -0.858,
    Y: -0.374,
    Z: 1.373,
    pitch: -9.476,
    roll: -0.272,
    yaw: 0.974,
    FOV: 58,
  },

  image_6l: {
    X: -1.63,
    Y: -0.591,
    Z: 1.584,
    pitch: 11.182,
    roll: 6.14,
    yaw: -50.381,
    FOV: 93,
  },
};

// export const lidarToEgoTranslation: calibrationType = { //newer calibration
//   X: 0,
//   Y: 1.91,
//   Z: 1.919,
//   pitch: 0,
//   roll: 0,
//   yaw: 90,
//   FOV: 360,
// };

// export const defaultCameraCalibration: Record<string, calibrationType> = {
//   // 1731044482.042498_pcd
//   image_0l: {
//     X: -1.995,
//     Y: 0.71,
//     Z: 1.618,
//     pitch: 0.607,
//     roll: 0.366,
//     yaw: 51.755,
//     FOV: 93,
//   },
//   image_1l: {
//     X: -1.299,
//     Y: 0.695,
//     Z: 1.596,
//     pitch: -0.13,
//     roll: 0.632,
//     yaw: 129.248,
//     FOV: 93,
//   },
//   image_2l: {
//     X: -1.07,
//     Y: -0.026,
//     Z: 1.507,
//     pitch: -0.536,
//     roll: -0.547,
//     yaw: 0.674,
//     FOV: 110,
//   },
//   image_3l: {
//     X: -1.065,
//     Y: 0.009,
//     Z: 1.507,
//     pitch: -0.727,
//     roll: -0.637,
//     yaw: 0.324,
//     FOV: 58,
//   },
//   image_4l: {
//     X: -1.075,
//     Y: 0.04,
//     Z: 1.507,
//     pitch: -0.449,
//     roll: -0.428,
//     yaw: -0.055,
//     FOV: 25.5,
//   },
//   image_5l: {
//     X: -1.31,
//     Y: -0.679,
//     Z: 1.594,
//     pitch: -0.683,
//     roll: 0.21,
//     yaw: -129.35,
//     FOV: 93,
//   },
//   image_6l: {
//     X: -2.005,
//     Y: -0.667,
//     Z: 1.618,
//     pitch: -0.267,
//     roll: 0.142,
//     yaw: -49.679,
//     FOV: 93,
//   },
//   image_7l: {
//     X: -3.295,
//     Y: 0.017,
//     Z: 1.506,
//     pitch: 1.046,
//     roll: 0.884,
//     yaw: 180.697,
//     FOV: 130,
//   },
// };

// export const defaultCameraCalibration: Record<string, calibrationType> = {
//   image_0l: {
//     X: -1.628,
//     Y: 0.589,
//     Z: 1.582,
//     pitch: 11.999,
//     roll: -6.061,
//     yaw: 51.683,
//     FOV: 93,
//   },
//   image_1l: {
//     X: -0.746,
//     Y: 0.996,
//     Z: 1.019,
//     pitch: -0.115,
//     roll: 1.906,
//     yaw: 135.341,
//     FOV: 93,
//   },
//   image_2l: {
//     X: 0, // -0.855,
//     Y: 0, // -0.331,
//     Z: 0, // 1.376,
//     pitch: 0, // -13,
//     roll: 0, // 1,
//     yaw: 0, // 1.936,
//     FOV: 110,
//   },
//   image_3l: {
//     X: -0.858,
//     Y: -0.374,
//     Z: 1.373,
//     pitch: -9.476,
//     roll: -0.272,
//     yaw: 0.974,
//     FOV: 58,
//   },
//   image_4l: {
//     X: -0.815,
//     Y: 0.157,
//     Z: 1.388,
//     pitch: 0.126,
//     roll: 0.945,
//     yaw: -0.414,
//     FOV: 25,
//   },
//   image_5l: {
//     X: -0.785,
//     Y: -0.977,
//     Z: 1.026,
//     pitch: -0.638,
//     roll: -0.548,
//     yaw: -142.932,
//     FOV: 93,
//   },
//   image_6l: {
//     X: -1.63,
//     Y: -0.591,
//     Z: 1.584,
//     pitch: 11.182,
//     roll: 6.14,
//     yaw: -50.381,
//     FOV: 93,
//   },
//   image_7l: {
//     X: -3.242,
//     Y: -0.033,
//     Z: 1.493,
//     pitch: -5.556,
//     roll: 0.596,
//     yaw: 181.04,
//     FOV: 130,
//   },
// };

interface CanvasContextProps {
  points: Point3D[];
  setPoints: (points: Point3D[]) => void;
  cameraCalibration: Record<
    string,
    {
      X: number;
      Y: number;
      Z: number;
      pitch: number;
      roll: number;
      yaw: number;
      FOV: number;
    }
  >;
  setCameraCalibration: (
    cameraCalibration: Record<
      string,
      {
        X: number;
        Y: number;
        Z: number;
        pitch: number;
        roll: number;
        yaw: number;
        FOV: number;
      }
    >
  ) => void;
  // subscribe: (listener: (points: Point[]) => void) => void;
}

const CanvasPointContext = createContext<CanvasContextProps | undefined>(
  undefined
);

interface CanvasProviderProps {
  children: React.ReactNode;
}

export const CanvasPointProvider: React.FC<CanvasProviderProps> = ({
  children,
}) => {
  const [points, setPoints] = useState<Point3D[]>([]);
  const [cameraCalibration, setCameraCalibration] = useState<
    Record<
      string,
      {
        X: number;
        Y: number;
        Z: number;
        pitch: number;
        roll: number;
        yaw: number;
        FOV: number;
      }
    >
  >(defaultCameraCalibration);

  // const subscribe = (listener: (points: Point[]) => void) => {
  //     setListeners(prevListeners => [...prevListeners, listener]);
  // };

  return (
    <CanvasPointContext.Provider
      value={{ points, setPoints, cameraCalibration, setCameraCalibration }}
    >
      {children}
    </CanvasPointContext.Provider>
  );
};

export const useCanvasPointContext = (): CanvasContextProps => {
  const context = useContext(CanvasPointContext);
  if (!context) {
    throw new Error(
      'useCanvasPointContext must be used within a CanvasProvider'
    );
  }
  return context;
};
