import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import AnimatedCube from './AnimatedCube';
import { createInitialCube, rotateFace, shuffleCube } from './cubeLogic';
import type { CubeSize, Piece, Face, Direction } from './types';

const RubiksCube = () => {
  const [size, setSize] = useState<CubeSize>(3);
  const [pieces, setPieces] = useState<Piece[]>(() => createInitialCube(3));
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingFace, setAnimatingFace] = useState<Face | null>(null);
  const [animatingDirection, setAnimatingDirection] = useState<Direction | null>(null);

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

      {/* 操作説明 */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          color: 'white',
          textAlign: 'center',
          fontSize: '14px',
        }}
      >
        画面をスワイプしてキューブを回転
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

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={15}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default RubiksCube;
