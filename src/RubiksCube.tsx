import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import AnimatedCube from './AnimatedCube';
import CameraController from './CameraController';
import { createInitialCube, rotateFace, shuffleCube } from './cubeLogic';
import type { CubeSize, Piece, Face, Direction } from './types';

const RubiksCube = () => {
  const [size, setSize] = useState<CubeSize>(3);
  const [pieces, setPieces] = useState<Piece[]>(() => createInitialCube(3));
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingFace, setAnimatingFace] = useState<Face | null>(null);
  const [animatingDirection, setAnimatingDirection] = useState<Direction | null>(null);
  const [cameraRotation, setCameraRotation] = useState({ theta: Math.PI / 4, phi: Math.PI / 4 });
  const [isCameraAnimating, setIsCameraAnimating] = useState(false);

  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const pendingRotationRef = useRef<{ face: Face; direction: Direction } | null>(null);

  const handleSizeChange = (newSize: CubeSize) => {
    setSize(newSize);
    setPieces(createInitialCube(newSize));
  };

  const handleReset = () => {
    setPieces(createInitialCube(size));
  };

  const handleShuffle = () => {
    setPieces(shuffleCube(pieces, size, 20));
  };

  const handleRotate = (face: Face, direction: Direction) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimatingFace(face);
    setAnimatingDirection(direction);
    pendingRotationRef.current = { face, direction };
  };

  const handleAnimationComplete = () => {
    if (pendingRotationRef.current) {
      const { face, direction } = pendingRotationRef.current;
      setPieces(rotateFace(pieces, face, direction, size));
      pendingRotationRef.current = null;
    }
    setIsAnimating(false);
    setAnimatingFace(null);
    setAnimatingDirection(null);
  };

  const handleCameraRotate = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (isCameraAnimating) return;
    setIsCameraAnimating(true);

    const step = Math.PI / 4; // 45度回転
    const newRotation = { ...cameraRotation };

    switch (direction) {
      case 'left':
        newRotation.theta -= step;
        break;
      case 'right':
        newRotation.theta += step;
        break;
      case 'up':
        newRotation.phi = Math.max(0.1, newRotation.phi - step);
        break;
      case 'down':
        newRotation.phi = Math.min(Math.PI - 0.1, newRotation.phi + step);
        break;
    }

    setCameraRotation(newRotation);
  };

  const handleCameraRotationComplete = () => {
    setIsCameraAnimating(false);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPos.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDownPos.current || isAnimating) return;

    const deltaX = event.clientX - pointerDownPos.current.x;
    const deltaY = event.clientY - pointerDownPos.current.y;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      // スワイプの方向に基づいて面と方向を決定
      let face: Face;
      let direction: Direction;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 横スワイプ
        if (deltaX > 0) {
          face = 'right';
          direction = 'clockwise';
        } else {
          face = 'left';
          direction = 'clockwise';
        }
      } else {
        // 縦スワイプ
        if (deltaY > 0) {
          face = 'bottom';
          direction = 'clockwise';
        } else {
          face = 'top';
          direction = 'clockwise';
        }
      }

      handleRotate(face, direction);
    }

    pointerDownPos.current = null;
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      {/* UI Controls */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={handleReset}
          disabled={isAnimating}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            opacity: isAnimating ? 0.5 : 1,
          }}
        >
          リセット
        </button>
        <button
          onClick={handleShuffle}
          disabled={isAnimating}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            opacity: isAnimating ? 0.5 : 1,
          }}
        >
          シャッフル
        </button>
        <button
          onClick={() => handleSizeChange(2)}
          disabled={isAnimating || size === 2}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: size === 2 ? '#555' : '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isAnimating || size === 2 ? 'not-allowed' : 'pointer',
            opacity: isAnimating || size === 2 ? 0.5 : 1,
          }}
        >
          2×2
        </button>
        <button
          onClick={() => handleSizeChange(3)}
          disabled={isAnimating || size === 3}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: size === 3 ? '#555' : '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isAnimating || size === 3 ? 'not-allowed' : 'pointer',
            opacity: isAnimating || size === 3 ? 0.5 : 1,
          }}
        >
          3×3
        </button>
      </div>

      {/* 視点操作ボタン */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 50px)',
          gridTemplateRows: 'repeat(3, 50px)',
          gap: '5px',
        }}
      >
        {/* 上 */}
        <div style={{ gridColumn: '2', gridRow: '1' }}>
          <button
            onClick={() => handleCameraRotate('up')}
            disabled={isCameraAnimating}
            style={{
              width: '100%',
              height: '100%',
              background: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isCameraAnimating ? 'not-allowed' : 'pointer',
              opacity: isCameraAnimating ? 0.5 : 1,
              fontSize: '20px',
            }}
          >
            ▲
          </button>
        </div>
        {/* 左 */}
        <div style={{ gridColumn: '1', gridRow: '2' }}>
          <button
            onClick={() => handleCameraRotate('left')}
            disabled={isCameraAnimating}
            style={{
              width: '100%',
              height: '100%',
              background: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isCameraAnimating ? 'not-allowed' : 'pointer',
              opacity: isCameraAnimating ? 0.5 : 1,
              fontSize: '20px',
            }}
          >
            ◀
          </button>
        </div>
        {/* 中央（視点リセット） */}
        <div style={{ gridColumn: '2', gridRow: '2' }}>
          <button
            onClick={() => setCameraRotation({ theta: Math.PI / 4, phi: Math.PI / 4 })}
            disabled={isCameraAnimating}
            style={{
              width: '100%',
              height: '100%',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isCameraAnimating ? 'not-allowed' : 'pointer',
              opacity: isCameraAnimating ? 0.5 : 1,
              fontSize: '16px',
            }}
          >
            ●
          </button>
        </div>
        {/* 右 */}
        <div style={{ gridColumn: '3', gridRow: '2' }}>
          <button
            onClick={() => handleCameraRotate('right')}
            disabled={isCameraAnimating}
            style={{
              width: '100%',
              height: '100%',
              background: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isCameraAnimating ? 'not-allowed' : 'pointer',
              opacity: isCameraAnimating ? 0.5 : 1,
              fontSize: '20px',
            }}
          >
            ▶
          </button>
        </div>
        {/* 下 */}
        <div style={{ gridColumn: '2', gridRow: '3' }}>
          <button
            onClick={() => handleCameraRotate('down')}
            disabled={isCameraAnimating}
            style={{
              width: '100%',
              height: '100%',
              background: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isCameraAnimating ? 'not-allowed' : 'pointer',
              opacity: isCameraAnimating ? 0.5 : 1,
              fontSize: '20px',
            }}
          >
            ▼
          </button>
        </div>
      </div>

      {/* 操作説明 */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
          color: 'white',
          fontSize: '14px',
        }}
      >
        <div>スワイプ: キューブ回転</div>
        <div>矢印: 視点移動</div>
      </div>

      {/* 3D Canvas */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
      >
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <directionalLight position={[-10, -10, -10]} intensity={0.5} />

          <AnimatedCube
            pieces={pieces}
            size={size}
            animatingFace={animatingFace}
            animatingDirection={animatingDirection}
            onAnimationComplete={handleAnimationComplete}
          />

          <CameraController
            targetRotation={cameraRotation}
            onRotationComplete={handleCameraRotationComplete}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default RubiksCube;
