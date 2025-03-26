// src/pages/MainPage.tsx
import React, { use, useEffect, useState } from 'react';
import './MainPage.css';
import Viewport from '../../components/Viewport/Viewport';
import { CanvasPointProvider } from '../../components/Viewport/pointsContext';
// import Viewport from 'components/Viewport/Viewport';

const PORT = 9999;

const MainPage: React.FC = () => {
  const [frameList, setFrameList] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState<string | undefined>();
  // const renderViewports = () => {
  //   return <Viewport src={currentFrame} />;
  // switch (layout) {
  //   case 2:
  //     return images
  //       .slice(0, 2)
  //       .map((src, index) => <Viewport key={index} src={src} />);
  //   case 4:
  //     return images
  //       .slice(0, 4)
  //       .map((src, index) => <Viewport key={index} src={src} />);
  //   case 8:
  //     return images
  //       .slice(0, 8)
  //       .map((src, index) => <Viewport key={index} src={src} />);
  //   default:
  //     return <Viewport src={images[0]} />;
  // }
  // };

  const fetchFolders = async () => {
    try {
      const response = await fetch(`http://localhost:${PORT}/files/`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch folders:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchFolders().then((data) => {
      console.log(data);
      if (data.files ? data.files.length > 0 : false) {
        setFrameList(data.files);
        setCurrentFrame(data.files[0]);
      }
    });
  }, []);

  useEffect(() => {}, [frameList, currentFrame]);

  return (
    <div className="main-page">
      <div className="controls">
        {/* <button onClick={() => setLayout(1)}>Single</button>
        <button onClick={() => setLayout(2)}>Two</button>
        <button onClick={() => setLayout(4)}>Four</button>
        <button onClick={() => setLayout(8)}>Eight</button> */}
        <input
          type="file"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              const formData = new FormData();
              formData.append('file', file);

              try {
                const response = await fetch(
                  `http://localhost:${PORT}/upload`,
                  {
                    method: 'POST',
                    body: formData,
                  }
                );

                if (!response.ok) {
                  throw new Error('Failed to upload file');
                }

                const data = await response.json();
                setFrameList((prev) => [...prev, data.file]);
                setCurrentFrame(data.file);
              } catch (error) {
                console.error('Error uploading file:', error);
              }
            }
          }}
        />
        <select
          onChange={(e) => setCurrentFrame(e.target.value)}
          value={currentFrame}
        >
          <option value="" disabled>
            Select a frame
          </option>
          {frameList.map((frame, index) => (
            <option key={index} value={frame}>
              {frame}
            </option>
          ))}
        </select>
      </div>
      <CanvasPointProvider>
        <div className="viewport-container">
          <Viewport src={currentFrame} />
        </div>
      </CanvasPointProvider>
    </div>
  );
};

export default MainPage;
