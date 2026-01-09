import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import CubePiece from './CubePiece';
import type { Piece, Face, Direction, CubeSize } from './types';

interface AnimatedCubeProps {
  pieces: Piece[];
  size: CubeSize;
  animatingFace: Face | null;
  animatingDirection: Direction | null;
  onAnimationComplete: () => void;
}

const AnimatedCube = ({
  pieces,
  size,
  animatingFace,
  animatingDirection,
  onAnimationComplete,
}: AnimatedCubeProps) => {
  const rotatingGroupRef = useRef<Group>(null);
  const animationProgressRef = useRef(0);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (animatingFace && animatingDirection) {
      animationProgressRef.current = 0;
      isAnimatingRef.current = true;
    }
  }, [animatingFace, animatingDirection]);

  useFrame((_, delta) => {
    if (!isAnimatingRef.current || !rotatingGroupRef.current) return;
    if (!animatingFace || !animatingDirection) return;

    // アニメーション速度（1秒で90度回転）
    const speed = Math.PI / 2 / 0.3; // 0.3秒で90度
    animationProgressRef.current += delta * speed;

    const targetAngle = animatingDirection === 'clockwise' ? -Math.PI / 2 : Math.PI / 2;
    const currentAngle = Math.min(animationProgressRef.current, Math.abs(targetAngle)) * Math.sign(targetAngle);

    // 回転軸を設定
    rotatingGroupRef.current.rotation.set(0, 0, 0);
    switch (animatingFace) {
      case 'front':
      case 'back':
        rotatingGroupRef.current.rotation.z = animatingFace === 'front' ? currentAngle : -currentAngle;
        break;
      case 'left':
      case 'right':
        rotatingGroupRef.current.rotation.x = animatingFace === 'right' ? currentAngle : -currentAngle;
        break;
      case 'top':
      case 'bottom':
        rotatingGroupRef.current.rotation.y = animatingFace === 'top' ? currentAngle : -currentAngle;
        break;
    }

    // アニメーション完了チェック
    if (animationProgressRef.current >= Math.abs(targetAngle)) {
      isAnimatingRef.current = false;
      animationProgressRef.current = 0;
      rotatingGroupRef.current.rotation.set(0, 0, 0);
      onAnimationComplete();
    }
  });

  // 回転対象のピースを判定
  const offset = (size - 1) / 2;
  const rotatingPieces: Piece[] = [];
  const staticPieces: Piece[] = [];

  pieces.forEach((piece) => {
    let shouldRotate = false;

    if (animatingFace) {
      switch (animatingFace) {
        case 'front':
          shouldRotate = piece.position[2] === offset;
          break;
        case 'back':
          shouldRotate = piece.position[2] === -offset;
          break;
        case 'left':
          shouldRotate = piece.position[0] === -offset;
          break;
        case 'right':
          shouldRotate = piece.position[0] === offset;
          break;
        case 'top':
          shouldRotate = piece.position[1] === offset;
          break;
        case 'bottom':
          shouldRotate = piece.position[1] === -offset;
          break;
      }
    }

    if (shouldRotate) {
      rotatingPieces.push(piece);
    } else {
      staticPieces.push(piece);
    }
  });

  return (
    <>
      {/* 静止しているピース */}
      <group>
        {staticPieces.map((piece) => (
          <CubePiece key={piece.id} piece={piece} size={1} />
        ))}
      </group>

      {/* 回転中のピース */}
      <group ref={rotatingGroupRef}>
        {rotatingPieces.map((piece) => (
          <CubePiece key={piece.id} piece={piece} size={1} />
        ))}
      </group>
    </>
  );
};

export default AnimatedCube;
