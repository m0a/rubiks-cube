import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Raycaster, Vector2, Vector3 } from 'three';
import type { Face, Direction } from './types';

interface InteractionHandlerProps {
  onRotate: (face: Face, direction: Direction) => void;
  isAnimating: boolean;
}

const InteractionHandler = ({ onRotate, isAnimating }: InteractionHandlerProps) => {
  const { camera, gl, scene } = useThree();
  const raycaster = useRef(new Raycaster());
  const pointerDownPos = useRef<{ x: number; y: number; screenX: number; screenY: number } | null>(null);
  const selectedPointRef = useRef<Vector3 | null>(null);

  const getPointerPosition = (event: PointerEvent): Vector2 => {
    const rect = gl.domElement.getBoundingClientRect();
    return new Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (isAnimating) return;

    pointerDownPos.current = {
      x: event.clientX,
      y: event.clientY,
      screenX: event.clientX,
      screenY: event.clientY,
    };

    // レイキャスティングで交点を検出
    const pointer = getPointerPosition(event);
    raycaster.current.setFromCamera(pointer, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    if (intersects.length > 0 && intersects[0].face) {
      selectedPointRef.current = intersects[0].point.clone();
    }
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (!pointerDownPos.current || isAnimating) {
      pointerDownPos.current = null;
      selectedPointRef.current = null;
      return;
    }

    const deltaX = event.clientX - pointerDownPos.current.screenX;
    const deltaY = event.clientY - pointerDownPos.current.screenY;
    const threshold = 30;

    if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
      pointerDownPos.current = null;
      selectedPointRef.current = null;
      return;
    }

    if (!selectedPointRef.current) {
      pointerDownPos.current = null;
      return;
    }

    // タップした位置のポイントから最も近い面を特定
    const point = selectedPointRef.current;
    const abs = { x: Math.abs(point.x), y: Math.abs(point.y), z: Math.abs(point.z) };
    const max = Math.max(abs.x, abs.y, abs.z);

    let face: Face;
    if (max === abs.z) {
      face = point.z > 0 ? 'front' : 'back';
    } else if (max === abs.x) {
      face = point.x > 0 ? 'right' : 'left';
    } else {
      face = point.y > 0 ? 'top' : 'bottom';
    }

    // スワイプ方向から回転方向を決定
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    let direction: Direction;

    // 各面でのスワイプ方向と回転の対応を修正
    switch (face) {
      case 'front':
        if (isHorizontal) {
          direction = deltaX > 0 ? 'counterclockwise' : 'clockwise';
        } else {
          direction = deltaY < 0 ? 'clockwise' : 'counterclockwise';
        }
        break;
      case 'back':
        if (isHorizontal) {
          direction = deltaX > 0 ? 'clockwise' : 'counterclockwise';
        } else {
          direction = deltaY < 0 ? 'counterclockwise' : 'clockwise';
        }
        break;
      case 'left':
        if (isHorizontal) {
          direction = deltaX > 0 ? 'clockwise' : 'counterclockwise';
        } else {
          direction = deltaY < 0 ? 'clockwise' : 'counterclockwise';
        }
        break;
      case 'right':
        if (isHorizontal) {
          direction = deltaX > 0 ? 'counterclockwise' : 'clockwise';
        } else {
          direction = deltaY < 0 ? 'clockwise' : 'counterclockwise';
        }
        break;
      case 'top':
        if (isHorizontal) {
          direction = deltaX > 0 ? 'counterclockwise' : 'clockwise';
        } else {
          direction = deltaY < 0 ? 'counterclockwise' : 'clockwise';
        }
        break;
      case 'bottom':
        if (isHorizontal) {
          direction = deltaX > 0 ? 'clockwise' : 'counterclockwise';
        } else {
          direction = deltaY < 0 ? 'clockwise' : 'counterclockwise';
        }
        break;
    }

    onRotate(face, direction);

    pointerDownPos.current = null;
    selectedPointRef.current = null;
  };

  useEffect(() => {
    const element = gl.domElement;
    element.addEventListener('pointerdown', handlePointerDown as any);
    element.addEventListener('pointerup', handlePointerUp as any);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown as any);
      element.removeEventListener('pointerup', handlePointerUp as any);
    };
  }, [isAnimating, onRotate]);

  return null;
};

export default InteractionHandler;
