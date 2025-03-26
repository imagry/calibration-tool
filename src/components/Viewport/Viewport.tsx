// src/components/Viewport.tsx
import React, {
  useRef,
  useState,
  useEffect,
  KeyboardEventHandler,
  useCallback,
} from 'react';
import './Viewport.css';
import { Point2D, Point3D } from '../../components/annotation/point';
import { Annotation3D, calibrationType } from '../annotation/annotation';
import { canvasToImageScale } from '../../helpers/viewport/viewportToCanvas';
import {
  defaultCalibration,
  EgoToLidarTranslation,
} from '../Viewport/pointsContext';

interface ViewportProps {
  src: string | undefined;
}

// const ego_to_cam_t = {
//   X: -1.117,
//   Y: -0.04,
//   Z: 1.613,
// };

// const ego_to_cam = {
//   roll: 0.886,
//   pitch: -1.411,
//   yaw: -0.394,
// };

// const cam_to_image = {
//   pitch: 0,
//   roll: 0,
//   yaw: 0,
// };

// console.log('cam_to_image', Annotation3D.getRotationMatrix(cam_to_image));
// console.log('ego_to_cam', Annotation3D.getRotationMatrix(ego_to_cam));

const ego_to_cam_t = {
  X: -1.494,
  Y: -0.615,
  Z: 1.563,
};

const ego_to_cam = {
  roll: -2.515,
  pitch: 10.134,
  yaw: 52.117,
};

const cam_to_image = {
  roll: -90,
  pitch: 0,
  yaw: -90,
};

console.log('cam_to_image', Annotation3D.getRotationMatrix(cam_to_image));
console.log('ego_to_cam', Annotation3D.getRotationMatrix(ego_to_cam));

Annotation3D.reverseTranslatePositionAndRotation(
  [],
  {
    X: ego_to_cam_t.X,
    Y: ego_to_cam_t.Y,
    Z: ego_to_cam_t.Z,
    pitch: ego_to_cam.pitch,
    roll: ego_to_cam.roll,
    yaw: ego_to_cam.yaw,
  },
  true
);

const localPath = 'http://localhost:9999/file/';

const Viewport: React.FC<ViewportProps> = ({ src }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [img, setImg] = useState<HTMLImageElement>(new Image());
  const [imgSrc, setImgSrc] = useState<number>(0);
  const [cameraCalibraitons, setCameraCalibraitons] = useState<
    Record<string, calibrationType>
  >({
    image_0l: defaultCalibration,
    image_1l: defaultCalibration,
    image_2l: defaultCalibration,
    image_3l: defaultCalibration,
    image_4l: defaultCalibration,
    image_5l: defaultCalibration,
    image_6l: defaultCalibration,
    image_7l: defaultCalibration,
  });
  const [defaultCameraCalibraiton, setDefaultCameraCalibration] = useState<
    Record<string, calibrationType>
  >({
    image_0l: defaultCalibration,
    image_1l: defaultCalibration,
    image_2l: defaultCalibration,
    image_3l: defaultCalibration,
    image_4l: defaultCalibration,
    image_5l: defaultCalibration,
    image_6l: defaultCalibration,
    image_7l: defaultCalibration,
  });

  const [lidarCalibraitons, setlidarCalibraitons] =
    useState<calibrationType>(defaultCalibration);
  const [defaultLidarCalibration, setDefaultLidarCalibration] =
    useState<calibrationType>(defaultCalibration);

  const [hover, setHover] = useState(false);

  const [points, setPoints] = useState<
    Array<{ x: number; y: number; z: number; v: number }>
  >([]);

  useEffect(() => {
    if (src === undefined) return;
    fetch(localPath + src + `/image_${imgSrc}l.jpeg`).then((response) => {
      response
        .blob()
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const image = new Image();
          image.src = url;
          // const imageDict: Record<string, HTMLImageElement> = {};
          // imageDict[`image_${imgSrc}l`] = image;
          image.onload = () => setImg(image);
        })
        .catch((error) => console.error('Error loading image:', error));
    });

    // img.src = localPath + src + `/image_${imgSrc}l.jpeg`;
    // console.log(img.src);
    //fetch camera calibration
  }, [imgSrc, src]);

  useEffect(() => {
    console.log(localPath + src + `/cams_configs.json`);
    if (src === undefined) return;
    fetch(localPath + src + `/cams_configs.json`).then((response) => {
      response.json().then((data) => {
        console.log(data);
        const cams = data['cams'];
        if (!cams) return;
        const calibrations: Record<string, calibrationType> = {};
        for (let i = 0; i < cams.length; i++) {
          const cam = cams[i];
          calibrations[`image_${cam.id}l`] = {
            X: cam['x'],
            Y: cam['y'],
            Z: cam['z'],
            pitch: cam['pitch'],
            roll: cam['roll'],
            yaw: cam['heading'],
            FOV: cam['h_fov'],
          };
        }
        const defaultCalibrations: Record<string, calibrationType> = {};
        for (let i = 0; i < cams.length; i++) {
          const cam = cams[i];
          defaultCalibrations[`image_${cam.id}l`] = {
            X: cam['x'],
            Y: cam['y'],
            Z: cam['z'],
            pitch: cam['pitch'],
            roll: cam['roll'],
            yaw: cam['heading'],
            FOV: cam['h_fov'],
          };
        }
        setCameraCalibraitons(calibrations);
        setDefaultCameraCalibration(defaultCalibrations);
      });
    });
    //fetch lidar calibration
    if (src === undefined) return;
    fetch(localPath + src + `/sensors_info.json`).then((response) => {
      response.json().then((data) => {
        const lidar = data.sensors.find((s: { name: string }) =>
          s.name.toLowerCase().includes('lidar')
        );
        if (!lidar) return;
        const positions = lidar['position'].split(',').map(Number);
        setlidarCalibraitons({
          X: positions[0] ?? 0,
          Y: positions[1] ?? 0,
          Z: positions[2] ?? 0,
          pitch: lidar['pitch'] ?? 0,
          roll: lidar['roll'] ?? 0,
          yaw: lidar['heading'] ?? 0,
          FOV: 0,
        });
        setDefaultLidarCalibration({
          X: positions[0] ?? 0,
          Y: positions[1] ?? 0,
          Z: positions[2] ?? 0,
          pitch: lidar['pitch'] ?? 0,
          roll: lidar['roll'] ?? 0,
          yaw: lidar['heading'] ?? 0,
          FOV: 0,
        });
      });
    });
  }, [src]);

  useEffect(() => {
    console.log(localPath + src + `/pcd.pcd`);
    if (src === undefined) return;
    fetch(localPath + src + `/pcd.pcd`)
      .then((response) => response.text())
      .then((data) => {
        if (!data) return;
        const parsedPoints = data
          .split('\n')
          .slice(11)
          .map((line) => {
            const [x, y, z, v] = line.split(' ').map(Number);
            return { x, y, z: z, v };
          });
        let filteredPoints = parsedPoints.filter((point) => point.v > 0);
        if (filteredPoints.length > 100000) {
          filteredPoints = filteredPoints.filter((_, index) => index % 3 === 0);
        }

        setPoints(
          filteredPoints.map((point) => ({
            x: point.x,
            y: point.y,
            z: point.z,
            v: Math.sqrt(point.x ** 2 + point.y ** 2 + point.z ** 2),
          }))
        );
      })
      .catch((error) => console.error('Error loading PCD file:', error));
  }, [src]);

  const setOri = useCallback(
    (ori: { pitch: number; roll: number; yaw: number }) => {
      const newCalibration =
        cameraCalibraitons[`image_${imgSrc}l`] ?? defaultCalibration;
      newCalibration.pitch = ori.pitch;
      newCalibration.roll = ori.roll;
      newCalibration.yaw = ori.yaw;
      setCameraCalibraitons({
        ...cameraCalibraitons,
        [`image_${imgSrc}l`]: newCalibration,
      });
    },
    [cameraCalibraitons, imgSrc]
  );

  const setFov = useCallback(
    (FOV: number) => {
      const newCalibration =
        cameraCalibraitons[`image_${imgSrc}l`] ?? defaultCalibration;
      newCalibration.FOV = FOV;
      setCameraCalibraitons({
        ...cameraCalibraitons,
        [`image_${imgSrc}l`]: newCalibration,
      });
    },
    [cameraCalibraitons, imgSrc]
  );

  const setCent = useCallback(
    (cent: { X: number; Y: number; Z: number }) => {
      const newCalibration =
        cameraCalibraitons[`image_${imgSrc}l`] ?? defaultCalibration;
      newCalibration.X = cent.X;
      newCalibration.Y = cent.Y;
      newCalibration.Z = cent.Z;
      setCameraCalibraitons({
        ...cameraCalibraitons,
        [`image_${imgSrc}l`]: newCalibration,
      });
    },
    [cameraCalibraitons, imgSrc]
  );

  const [offset, setOffset] = useState<Point2D>(new Point2D({ x: 0, y: 0 }));
  const [draggingOffset, setDraggingOffset] = useState<Point2D | undefined>();
  const [isDragging, setIsDragging] = useState(false);
  const [viewportStartPos, setViewportStartPos] = useState<Point2D>();
  const [clickPoint, setClickPoint] = useState<Point2D>();
  const [shiftOn, setShiftOn] = useState<boolean>(false);

  const [scale, setScale] = useState<{ x: number; y: number }>({
    x: 1,
    y: 1,
  });

  const [distortion, setDistortion] = useState<number>(0);
  const [pointSize, setPointSize] = useState<number>(3.5);
  const [maxDistance, setMaxDistance] = useState<number>(35);
  const [minDistance, setMinDistance] = useState<number>(3);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>(
    {
      width: 1920,
      height: 1080,
    }
  );

  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation3D>();
  const [check, setCheck] = useState<boolean>(true);

  const keepImageInBounds = React.useCallback(
    (newOffsetX?: number, newOffsetY?: number, e?: MouseEvent) => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
    },
    [offset]
  );

  const colors: string[] = [
    '#000000',
    '#0d0887',
    '#46039f',
    '#7201a8',
    '#cc4778',
    '#f07c4a',
    '#f89540',
    '#f0f921',
  ];

  const roundDown = (
    num: number,
    maxV: number,
    minV: number,
    k: number
  ): number => {
    if (num < minV) return 1;
    if (num > maxV) return k;
    const breakpart = (maxV - minV) / k;
    return 1 + Math.floor((num - minV) / breakpart);
  };

  const handleMouseDown = React.useCallback(
    (e: MouseEvent) => {
      canvasRef.current?.focus();
      e.preventDefault();
      if (e.button == 0) {
        setClickPoint(
          new Point2D({
            x: e.pageX,
            y: e.pageY,
          })
        );
      }

      if (e.button !== 1) return;
      setIsDragging(true);
      setDraggingOffset(new Point2D({ x: offset.x, y: offset.y }));
      setViewportStartPos(
        new Point2D({
          x: e.pageX,
          y: e.pageY,
        })
      );
    },
    [offset]
  );

  const handleWheel = React.useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const scaleBy = 1.1;

      if ((e.deltaY > 0 && scale.x < 0) || (e.deltaY < 0 && scale.x > 7))
        return;
      const newScale = e.deltaY > 0 ? scale.x / scaleBy : scale.x * scaleBy;

      const container = containerRef.current;
      if (!container || !img) return;

      setScale({ x: Math.max(newScale, 1), y: Math.max(newScale, 1) });

      // keepImageInBounds();
    },
    [scale, keepImageInBounds]
  );

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      if (selectedAnnotation && clickPoint && canvasRef.current) {
        const changeX =
          (e.pageX - clickPoint.x) / canvasToImageScale(canvasRef.current).x;
        const changeY =
          (e.pageY - clickPoint.y) / canvasToImageScale(canvasRef.current).y;
        selectedAnnotation.getCentroid().x = clickPoint.x + changeX;
        selectedAnnotation.getCentroid().y = clickPoint.y + changeY;
      } else if (draggingOffset && viewportStartPos && canvasRef.current) {
        const changeX =
          (e.pageX - viewportStartPos.x) /
          canvasToImageScale(canvasRef.current).x;
        const changeY =
          (e.pageY - viewportStartPos.y) /
          canvasToImageScale(canvasRef.current).y;
        const newX = offset.x - changeX;
        const newY = offset.y - changeY;

        setDraggingOffset(new Point2D({ x: newX, y: newY }));
        keepImageInBounds(newX, newY, e);
      }
    },
    [
      isDragging,
      viewportStartPos,
      keepImageInBounds,
      scale,
      draggingOffset,
      selectedAnnotation,
      clickPoint,
    ]
  );

  const handleMouseUp = React.useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      if (e.button == 0) {
        setClickPoint(undefined);
      }
      if (e.button !== 1) return;
      setIsDragging(false);
      setViewportStartPos(undefined);
      setOffset(
        new Point2D({
          x: draggingOffset?.x ?? offset.x,
          y: draggingOffset?.y ?? offset.y,
        })
      );
    },
    [draggingOffset, offset]
  );

  const keyShiftCent = 0.1;
  const keyShiftOri = 0.1;
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>): void => {
    if (e.key.toLowerCase() === 'shift') setShiftOn(true);
    if (shiftOn) {
      switch (e.key.toLowerCase()) {
        case 'arrowup':
          setCent({
            ...cameraCalibraitons[`image_${imgSrc}l`],
            Y: cameraCalibraitons[`image_${imgSrc}l`].Y - keyShiftCent,
          });
          break;
        case 'arrowdown':
          setCent({
            ...cameraCalibraitons[`image_${imgSrc}l`],
            Y: cameraCalibraitons[`image_${imgSrc}l`].Y + keyShiftCent,
          });
          break;
        case 'arrowleft':
          setCent({
            ...cameraCalibraitons[`image_${imgSrc}l`],
            X: cameraCalibraitons[`image_${imgSrc}l`].X - keyShiftCent,
          });
          break;
        case 'arrowright':
          setCent({
            ...cameraCalibraitons[`image_${imgSrc}l`],
            X: cameraCalibraitons[`image_${imgSrc}l`].X + keyShiftCent,
          });
          break;
        case 'w':
          setOri({
            ...cameraCalibraitons[`image_${imgSrc}l`],
            pitch: cameraCalibraitons[`image_${imgSrc}l`].pitch + keyShiftOri,
          });
          break;
        case 's':
          setOri({
            ...cameraCalibraitons[`image_${imgSrc}l`],
            pitch: cameraCalibraitons[`image_${imgSrc}l`].pitch - keyShiftOri,
          });
          break;
        case 'a':
          setOri({
            ...cameraCalibraitons[`image_${imgSrc}l`],
            yaw: cameraCalibraitons[`image_${imgSrc}l`].yaw + keyShiftOri,
          });
          break;
        case 'd':
          setOri({
            ...cameraCalibraitons[`image_${imgSrc}l`],
            yaw: cameraCalibraitons[`image_${imgSrc}l`].yaw - keyShiftOri,
          });
          break;
        case 'q':
          setOri({
            ...cameraCalibraitons[`image_${imgSrc}l`],
            roll: cameraCalibraitons[`image_${imgSrc}l`].roll + keyShiftOri,
          });
          break;
        case 'e':
          setOri({
            ...cameraCalibraitons[`image_${imgSrc}l`],
            roll: cameraCalibraitons[`image_${imgSrc}l`].roll - keyShiftOri,
          });
          break;
        default:
          break;
      }
    }
  };
  const handleKeyUp = (e: React.KeyboardEvent<HTMLCanvasElement>): void => {
    e.key.toLowerCase() === 'shift' && setShiftOn(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      if (hover) {
        // (canvas as HTMLCanvasElement).addEventListener('wheel', handleWheel, {
        //   passive: false,
        // });
        // canvas.addEventListener('mousemove', handleMouseMove);
        // canvas.addEventListener('mouseup', handleMouseUp);
        // canvas.addEventListener('mousedown', handleMouseDown);
      } else {
        canvas.removeEventListener('wheel', handleWheel);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mousedown', handleMouseDown);
        setIsDragging(false);
        setDraggingOffset(undefined);
        setShiftOn(false);
      }
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mousedown', handleMouseDown);
      }
    };
  }, [
    isDragging,
    offset,
    scale,
    handleWheel,
    handleMouseMove,
    handleMouseUp,
    handleMouseDown,
    keepImageInBounds,
    hover,
  ]);

  const drawCanvas = React.useCallback(
    (
      img: HTMLImageElement,
      cameraCalibraitons: calibrationType,
      check: boolean,
      lidarPoints: Array<{ x: number; y: number; z: number; v: number }>,
      lidarCalibraitons: calibrationType,
      pointSize: number,
      maxDistance: number,
      minDistance: number
    ) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');

      if (!context || !canvas) return;
      //draw image
      context.clearRect(0, 0, canvas.width, canvas.height);
      // context.scale(scale.x, scale.y);
      context.drawImage(
        img,
        draggingOffset ? draggingOffset.x : offset.x, // /scale.x,
        draggingOffset ? draggingOffset.y : offset.y, // /scale.y,
        img.width,
        img.height,
        0,
        0,
        img.width,
        img.height
      );
      //draw annotations

      const Concrete_mixer = new Annotation3D(
        { x: -0.11, y: 12.62, z: 0.34 },
        {
          sx: 3.09,
          sy: 6.25,
          sz: 4.32,
        },
        { pitch: 0, roll: 0, yaw: 0 },
        2
      );

      const white_car = new Annotation3D(
        { x: 7.14, y: 7.13, z: -0.79 },
        {
          sx: 2.026,
          sy: 4.42,
          sz: 1.85,
        },
        { pitch: 0, roll: 0, yaw: (-1.21 * 180) / Math.PI },
        2
      );

      const cameraCalibration: calibrationType = {
        X: cameraCalibraitons.X,
        Y: cameraCalibraitons.Y,
        Z: cameraCalibraitons.Z,
        pitch: cameraCalibraitons.pitch,
        roll: cameraCalibraitons.roll,
        yaw: cameraCalibraitons.yaw,
        FOV: cameraCalibraitons.FOV,
      };

      if (check) {
        let calibrationPointsX = [];
        let calibraionPointsY = [];
        for (let j = 0; j <= maxDistance; j++) {
          calibrationPointsX.push({
            x: j,
            y: 0,
            z: 0,
            v: j,
          });
          calibraionPointsY.push({
            x: 0,
            y: j,
            z: 0,
            v: j,
          });
        }
        const imagePoints = Annotation3D.translateLidarToImage(
          lidarPoints,
          lidarCalibraitons,
          cameraCalibration
        );

        // calibrationPointsX = Annotation3D.translateLidarToImage(
        //   calibrationPointsX,
        //   lidarCalibraitons,
        //   cameraCalibration
        // );
        // calibraionPointsY = Annotation3D.translateLidarToImage(
        //   calibraionPointsY,
        //   lidarCalibraitons,
        //   cameraCalibration
        // );

        function findClosestNumber(
          list: number[],
          v1: number,
          maxV: number,
          minV: number
        ): number {
          if (v1 < minV || v1 > maxV) {
            return 0;
          }
          const step = (maxV - minV) / (list.length - 1);
          if (list.length === 0) {
            throw new Error('The list cannot be empty.');
          }
          for (let i = 1; i < list.length; i += 1) {
            if (v1 < minV + i * step) {
              return i;
            }
          }

          return 0;
        }

        // Annotation3D.drawPoint(
        //   canvas,
        //   imagePoints[0],
        //   cameraCalibration.FOV,
        //   imageSize.width,
        //   imageSize.height,
        //   {},
        //   true
        // );

        imagePoints.forEach((point, index) => {
          const v1 = Math.abs(point.v ?? 0);

          if (
            0 < point.z &&
            v1 <= maxDistance &&
            v1 >= minDistance
            // &&            index == 9585
          ) {
            const pt = Annotation3D.drawPoint(
              canvas,
              { x: point.x, y: point.y, z: point.z },
              cameraCalibration.FOV,
              imageSize.width,
              imageSize.height,
              {
                color:
                  colors[
                    roundDown(
                      point.v ?? 0,
                      maxDistance,
                      minDistance,
                      colors.length - 1
                    )
                  ],
                opacity: 1,
                size: pointSize ?? 1,
              }
            );
            // if (index == 9585) console.log('screen', pt?.x, pt?.y);
          }
        });
        calibrationPointsX.forEach((point) => {
          //X is red
          const color =
            colors[
              findClosestNumber(
                Object.keys(colors).map(Number),
                point.v ?? 0,
                maxDistance,
                minDistance
              )
            ];
          if (0 < point.z) {
            Annotation3D.drawPoint(
              canvas,
              { x: point.x, y: point.y, z: point.z },
              cameraCalibration.FOV,
              imageSize.width,
              imageSize.height,
              {
                // color: 'red',
                color: color,
                opacity: 1,
                size: pointSize ?? 1,
              }
            );
          }
        });
        calibraionPointsY.forEach((point) => {
          //Y is yellow
          const color =
            colors[
              roundDown(
                point.v ?? 0,
                Object.keys(colors).length,
                maxDistance,
                minDistance
              )
            ];
          0 < point.z &&
            Annotation3D.drawPoint(
              canvas,
              { x: point.x, y: point.y, z: point.z },
              cameraCalibration.FOV,
              imageSize.width,
              imageSize.height,
              {
                // color: 'yellow',
                color: color,
                opacity: 1,
                size: pointSize ?? 1,
              }
            );
        });
      } else {
        white_car.pointList = Annotation3D.translateLidarToImage(
          white_car.pointList,
          lidarCalibraitons,
          cameraCalibration
        );

        white_car.draw(context, cameraCalibration.FOV, img.width, img.height, {
          color: 'white',
          opacity: 1,
          frontColor: 'black',
        });

        Concrete_mixer.pointList = Annotation3D.translateLidarToImage(
          Concrete_mixer.pointList,
          EgoToLidarTranslation,
          cameraCalibration
        );
        Concrete_mixer.draw(
          context,
          cameraCalibration.FOV,
          img.width,
          img.height,
          {
            color: 'green',
            opacity: 1,
            frontColor: 'black',
          }
        );
      }
    },
    []
  ); //imageSrc, scale, offset, img, draggingOffset,

  useEffect(() => {
    console.log('draw', img.src, points.length);
    if (img.src != '' && img.src != undefined && points.length > 0) {
      // img.onload = () => {
      if (img.complete) {
        drawCanvas(
          img,
          cameraCalibraitons[`image_${imgSrc}l`],
          check,
          points,
          lidarCalibraitons,
          pointSize,
          maxDistance,
          minDistance
        );
        if (imageSize.width === 0 || imageSize.height === 0)
          setImageSize({ width: img.width, height: img.height });
      }
      // else {
      //   img.onload = () => {
      //     drawCanvas(
      //       img,
      //       cameraCalibraitons[`image_${imgSrc}l`],
      //       check,
      //       points,
      //       lidarCalibraitons,
      //       pointSize,
      //       maxDistance,
      //       minDistance
      //     );
      //     if (imageSize.width === 0 || imageSize.height === 0)
      //       setImageSize({ width: img.width, height: img.height });
      //   };
      // }
      //   if (imageSize.width === 0 || imageSize.height === 0)
      //     setImageSize({ width: img.width, height: img.height });
      // };
    }
  }, [
    drawCanvas,
    img,
    cameraCalibraitons,
    check,
    points,
    pointSize,
    maxDistance,
    minDistance,
    imgSrc,
    lidarCalibraitons,
  ]); //offset, scale

  if (src === undefined) {
    return <div className="viewport">Image not found</div>;
  }

  return (
    <div ref={containerRef} className="viewport" style={{ display: 'flex' }}>
      <canvas
        ref={canvasRef}
        className="canvas"
        width={imageSize.width}
        height={imageSize.height}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        // onMouseDown={handleMouseDown}
        tabIndex={1}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <p>Lidar:</p>
        <div>
          {' '}
          <div style={{ display: 'flex' }}>
            <label>
              x:
              <input
                type="number"
                step={keyShiftCent}
                min="-50"
                max="50"
                value={lidarCalibraitons.X}
                onChange={(e) => {
                  setlidarCalibraitons({
                    ...lidarCalibraitons,
                    X: Number(e.target.value),
                  });
                }}
              />
              {lidarCalibraitons.X != defaultLidarCalibration.X && (
                <p className="error">{defaultLidarCalibration.X}</p>
              )}
            </label>
            <label>
              y:
              <input
                type="number"
                step={keyShiftCent}
                min="-50"
                max="50"
                value={lidarCalibraitons.Y}
                onChange={(e) => {
                  setlidarCalibraitons({
                    ...lidarCalibraitons,
                    Y: Number(e.target.value),
                  });
                }}
              />
              {lidarCalibraitons.Y != defaultLidarCalibration.Y && (
                <p className="error">{defaultLidarCalibration.Y}</p>
              )}
            </label>
            <label>
              z:
              <input
                type="number"
                step={keyShiftCent}
                min="-50"
                max="50"
                value={lidarCalibraitons.Z}
                onChange={(e) => {
                  setlidarCalibraitons({
                    ...lidarCalibraitons,
                    Z: Number(e.target.value),
                  });
                }}
              />
              {lidarCalibraitons.Z != defaultLidarCalibration.Z && (
                <p className="error">{defaultLidarCalibration.Z}</p>
              )}
            </label>
          </div>
          <div style={{ display: 'flex' }}>
            <label>
              pitch:
              <input
                type="number"
                min="-180"
                step="0.1"
                max="180"
                value={lidarCalibraitons.pitch}
                onChange={(e) => {
                  setlidarCalibraitons({
                    ...lidarCalibraitons,
                    pitch: Number(e.target.value),
                  });
                }}
              />
              {lidarCalibraitons.pitch != defaultLidarCalibration.pitch && (
                <p className="error">{defaultLidarCalibration.pitch}</p>
              )}
            </label>
            <label style={{ display: 'flex', flexDirection: 'column' }}>
              roll:
              <input
                type="number"
                min="-180"
                step="0.1"
                max="180"
                value={lidarCalibraitons.roll}
                onChange={(e) => {
                  setlidarCalibraitons({
                    ...lidarCalibraitons,
                    roll: Number(e.target.value),
                  });
                }}
              />
              {lidarCalibraitons.roll != defaultLidarCalibration.roll && (
                <p className="error">{defaultLidarCalibration.roll}</p>
              )}
            </label>
            <label>
              yaw:
              <input
                type="number"
                min="-180"
                max="180"
                step="0.1"
                value={lidarCalibraitons.yaw}
                onChange={(e) => {
                  setlidarCalibraitons({
                    ...lidarCalibraitons,
                    yaw: Number(e.target.value),
                  });
                }}
              />
              {lidarCalibraitons.yaw != defaultLidarCalibration.yaw && (
                <p className="error">{defaultLidarCalibration.yaw}</p>
              )}
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {colors.slice(1).map((key, index) => (
              <div
                key={key}
                style={{
                  backgroundColor: key,
                  color: 'white',
                  height: '20px',
                  margin: '5px',
                }}
              >
                {(
                  minDistance +
                  (index * (maxDistance - minDistance)) / (colors.length - 1)
                ).toFixed(0)}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p>camera:</p>
              <div>
                <button onClick={() => setImgSrc((8 + imgSrc - 1) % 8)}>
                  ◄
                </button>
                <input
                  type="number"
                  min={0}
                  max={7}
                  value={imgSrc}
                  onChange={(e) => setImgSrc(Number(e.target.value))}
                  style={{ width: '50px', margin: '5px' }}
                />
                <button onClick={() => setImgSrc((imgSrc + 1) % 8)}>►</button>
              </div>
              <button onClick={() => setCheck(!check)}>check</button>
              <label>
                fov:
                <input
                  type="number"
                  min="1"
                  max="179"
                  value={cameraCalibraitons[`image_${imgSrc}l`]?.FOV}
                  onChange={(e) => {
                    setFov(Number(e.target.value));
                  }}
                />
                {defaultCameraCalibraiton[`image_${imgSrc}l`].FOV !=
                  cameraCalibraitons[`image_${imgSrc}l`].FOV && (
                  <p className="error">
                    {defaultCameraCalibraiton[`image_${imgSrc}l`].FOV}
                  </p>
                )}
              </label>
              <div style={{ display: 'flex' }}>
                <label>
                  x:
                  <input
                    type="number"
                    step={keyShiftCent}
                    min="-50"
                    max="50"
                    value={cameraCalibraitons[`image_${imgSrc}l`].X}
                    onChange={(e) => {
                      setCent({
                        ...cameraCalibraitons[`image_${imgSrc}l`],
                        X: Number(e.target.value),
                      });
                    }}
                  />
                  {defaultCameraCalibraiton[`image_${imgSrc}l`].X !=
                    cameraCalibraitons[`image_${imgSrc}l`].X && (
                    <p className="error">
                      {defaultCameraCalibraiton[`image_${imgSrc}l`].X}
                    </p>
                  )}
                </label>
                <label>
                  y:
                  <input
                    type="number"
                    step={keyShiftCent}
                    min="-50"
                    max="50"
                    value={cameraCalibraitons[`image_${imgSrc}l`].Y}
                    onChange={(e) => {
                      setCent({
                        ...cameraCalibraitons[`image_${imgSrc}l`],
                        Y: Number(e.target.value),
                      });
                    }}
                  />
                  {defaultCameraCalibraiton[`image_${imgSrc}l`].Y !=
                    cameraCalibraitons[`image_${imgSrc}l`].Y && (
                    <p className="error">
                      {defaultCameraCalibraiton[`image_${imgSrc}l`].Y}
                    </p>
                  )}
                </label>
                <label>
                  z:
                  <input
                    type="number"
                    step={keyShiftCent}
                    min="-50"
                    max="50"
                    value={cameraCalibraitons[`image_${imgSrc}l`].Z}
                    onChange={(e) => {
                      setCent({
                        ...cameraCalibraitons[`image_${imgSrc}l`],
                        Z: Number(e.target.value),
                      });
                    }}
                  />
                  {defaultCameraCalibraiton[`image_${imgSrc}l`].Z !=
                    cameraCalibraitons[`image_${imgSrc}l`].Z && (
                    <p className="error">
                      {defaultCameraCalibraiton[`image_${imgSrc}l`].Z}
                    </p>
                  )}
                </label>
              </div>
              <div style={{ display: 'flex' }}>
                <label>
                  pitch:
                  <input
                    type="number"
                    min="-180"
                    step="0.1"
                    max="180"
                    value={cameraCalibraitons[`image_${imgSrc}l`].pitch}
                    onChange={(e) => {
                      setOri({
                        ...cameraCalibraitons[`image_${imgSrc}l`],
                        pitch: Number(e.target.value),
                      });
                    }}
                  />
                  {defaultCameraCalibraiton[`image_${imgSrc}l`].pitch !=
                    cameraCalibraitons[`image_${imgSrc}l`].pitch && (
                    <p className="error">
                      {defaultCameraCalibraiton[`image_${imgSrc}l`].pitch}
                    </p>
                  )}
                </label>
                <label>
                  roll:
                  <input
                    type="number"
                    min="-180"
                    step="0.1"
                    max="180"
                    value={cameraCalibraitons[`image_${imgSrc}l`].roll}
                    onChange={(e) => {
                      setOri({
                        ...cameraCalibraitons[`image_${imgSrc}l`],
                        roll: Number(e.target.value),
                      });
                    }}
                  />
                  {defaultCameraCalibraiton[`image_${imgSrc}l`].roll !=
                    cameraCalibraitons[`image_${imgSrc}l`].roll && (
                    <p className="error">
                      {defaultCameraCalibraiton[`image_${imgSrc}l`].roll}
                    </p>
                  )}
                </label>
                <label>
                  yaw:
                  <input
                    type="number"
                    min="-180"
                    max="180"
                    step="0.1"
                    value={cameraCalibraitons[`image_${imgSrc}l`].yaw}
                    onChange={(e) => {
                      setOri({
                        ...cameraCalibraitons[`image_${imgSrc}l`],
                        yaw: Number(e.target.value),
                      });
                    }}
                  />
                  {defaultCameraCalibraiton[`image_${imgSrc}l`].yaw !=
                    cameraCalibraitons[`image_${imgSrc}l`].yaw && (
                    <p className="error">
                      {defaultCameraCalibraiton[`image_${imgSrc}l`].yaw}
                    </p>
                  )}
                </label>
              </div>
              <label>
                Point Size:
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={pointSize}
                  onChange={(e) => {
                    setPointSize(Number(e.target.value));
                  }}
                />
              </label>
              <label>
                min distance:
                <input
                  type="number"
                  min="0"
                  max={maxDistance}
                  step="0.1"
                  value={minDistance}
                  onChange={(e) => {
                    setMinDistance(Number(e.target.value));
                  }}
                />
              </label>
              <label>
                max distance:
                <input
                  type="number"
                  min="0"
                  max={100}
                  step="0.1"
                  value={maxDistance}
                  onChange={(e) => {
                    setMaxDistance(Number(e.target.value));
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Viewport;
