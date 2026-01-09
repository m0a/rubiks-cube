import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Raycaster, Vector2 } from 'three';
import type { Face } from './types';

interface InteractionHandlerProps {
  onDragStart: (face: Face) => void;
  onDrag: (rotation: number) => void;
  onDragEnd: () => void;
  isAnimating: boolean;
}

const InteractionHandler = ({ onDragStart, onDrag, onDragEnd, isAnimating }: InteractionHandlerProps) => {
  const { camera, gl, scene } = useThree();
  const raycaster = useRef(new Raycaster());
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const selectedFaceRef = useRef<Face | null>(null);
  const isDraggingRef = useRef(false);

  const getPointerPosition = (event: PointerEvent): Vector2 => {
    const rect = gl.domElement.getBoundingClientRect();
    return new Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (isAnimating) return;

    pointerDownPos.current = { x: event.clientX, y: event.clientY };

    // レイキャスティングで交点を検出
    const pointer = getPointerPosition(event);
    raycaster.current.setFromCamera(pointer, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    if (intersects.length > 0 && intersects[0].face) {
      const point = intersects[0].point;
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

      selectedFaceRef.current = face;
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!pointerDownPos.current || isAnimating || !selectedFaceRef.current) return;

    const deltaX = event.clientX - pointerDownPos.current.x;
    const deltaY = event.clientY - pointerDownPos.current.y;

    const threshold = 10;
    if (!isDraggingRef.current && (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)) {
      isDraggingRef.current = true;
      onDragStart(selectedFaceRef.current);
    }

    if (isDraggingRef.current) {
      // ドラッグ距離から回転量を計算（ピクセル→ラジアン変換）
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
      const distance = isHorizontal ? deltaX : -deltaY;
      const rotation = (distance / 100) * (Math.PI / 2); // 100pxで90度

      onDrag(rotation);
    }
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      onDragEnd();
    }

    pointerDownPos.current = null;
    selectedFaceRef.current = null;
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const element = gl.domElement;
    element.addEventListener('pointerdown', handlePointerDown as any);
    element.addEventListener('pointermove', handlePointerMove as any);
    element.addEventListener('pointerup', handlePointerUp as any);
    element.addEventListener('pointercancel', handlePointerUp as any);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown as any);
      element.removeEventListener('pointermove', handlePointerMove as any);
      element.removeEventListener('pointerup', handlePointerUp as any);
      element.removeEventListener('pointercancel', handlePointerUp as any);
    };
  }, [isAnimating, onDragStart, onDrag, onDragEnd]);

  return null;
};

export default InteractionHandler;
