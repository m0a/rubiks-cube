import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import AnimatedCube from './AnimatedCube';
import CameraController from './CameraController';
import InteractionHandler from './InteractionHandler';
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

  // ドラッグ状態
  const [isDragging, setIsDragging] = useState(false);
  const [draggingFace, setDraggingFace] = useState<Face | null>(null);
  const [currentRotation, setCurrentRotation] = useState(0);

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

  const handleDragStart = (face: Face) => {
    setIsDragging(true);
    setDraggingFace(face);
    setCurrentRotation(0);
  };

  const handleDrag = (rotation: number) => {
    setCurrentRotation(rotation);
  };

  const handleDragEnd = () => {
    if (!draggingFace) return;

    setIsDragging(false);
    setIsAnimating(true);

    // 現在の回転量から最も近い90度の倍数を決定
    const snapRotation = Math.round(currentRotation / (Math.PI / 2)) * (Math.PI / 2);
    const direction: Direction = snapRotation >= 0 ? 'clockwise' : 'counterclockwise';

    // 90度の倍数でない場合はスナップ
    if (Math.abs(snapRotation) >= Math.PI / 4) {
      setAnimatingFace(draggingFace);
      setAnimatingDirection(direction);
      pendingRotationRef.current = { face: draggingFace, direction };
    } else {
      // 回転量が小さい場合は元に戻す
      setIsAnimating(false);
      setCurrentRotation(0);
    }

    setDraggingFace(null);
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
          gridTemplateColumns: 'repeat(3, 65px)',
          gridTemplateRows: 'repeat(3, 65px)',
          gap: '8px',
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
              borderRadius: '8px',
              cursor: isCameraAnimating ? 'not-allowed' : 'pointer',
              opacity: isCameraAnimating ? 0.5 : 1,
              fontSize: '28px',
              fontWeight: 'bold',
              touchAction: 'manipulation',
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
              borderRadius: '8px',
              cursor: isCameraAnimating ? 'not-allowed' : 'pointer',
              opacity: isCameraAnimating ? 0.5 : 1,
              fontSize: '28px',
              fontWeight: 'bold',
              touchAction: 'manipulation',
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
              borderRadius: '8px',
              cursor: isCameraAnimating ? 'not-allowed' : 'pointer',
              opacity: isCameraAnimating ? 0.5 : 1,
              fontSize: '24px',
              touchAction: 'manipulation',
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
              borderRadius: '8px',
              cursor: isCameraAnimating ? 'not-allowed' : 'pointer',
              opacity: isCameraAnimating ? 0.5 : 1,
              fontSize: '28px',
              fontWeight: 'bold',
              touchAction: 'manipulation',
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
              borderRadius: '8px',
              cursor: isCameraAnimating ? 'not-allowed' : 'pointer',
              opacity: isCameraAnimating ? 0.5 : 1,
              fontSize: '28px',
              fontWeight: 'bold',
              touchAction: 'manipulation',
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
      <div style={{ width: '100%', height: '100%', touchAction: 'none' }}>
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
            isDragging={isDragging}
            draggingFace={draggingFace}
            currentRotation={currentRotation}
          />

          <CameraController
            targetRotation={cameraRotation}
            onRotationComplete={handleCameraRotationComplete}
          />

          <InteractionHandler
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            isAnimating={isAnimating || isDragging}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default RubiksCube;
