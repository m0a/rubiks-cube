import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Spherical } from 'three';

interface CameraControllerProps {
  targetRotation: { theta: number; phi: number };
  onRotationComplete: () => void;
}

const CameraController = ({ targetRotation, onRotationComplete }: CameraControllerProps) => {
  const { camera } = useThree();
  const currentRotation = useRef({ theta: Math.PI / 4, phi: Math.PI / 4 });
  const isAnimating = useRef(false);
  const animationProgress = useRef(0);

  useEffect(() => {
    if (
      targetRotation.theta !== currentRotation.current.theta ||
      targetRotation.phi !== currentRotation.current.phi
    ) {
      isAnimating.current = true;
      animationProgress.current = 0;
    }
  }, [targetRotation]);

  useFrame((_, delta) => {
    if (!isAnimating.current) return;

    const speed = 3; // 回転速度
    animationProgress.current += delta * speed;

    if (animationProgress.current >= 1) {
      animationProgress.current = 1;
      isAnimating.current = false;
      currentRotation.current = { ...targetRotation };
      onRotationComplete();
    }

    const t = animationProgress.current;
    // イージング関数（ease-out）
    const eased = 1 - Math.pow(1 - t, 3);

    const startTheta = currentRotation.current.theta;
    const startPhi = currentRotation.current.phi;

    const theta = startTheta + (targetRotation.theta - startTheta) * eased;
    const phi = startPhi + (targetRotation.phi - startPhi) * eased;

    const radius = 8;
    const spherical = new Spherical(radius, phi, theta);
    const position = new Vector3().setFromSpherical(spherical);

    camera.position.copy(position);
    camera.lookAt(0, 0, 0);
  });

  return null;
};

export default CameraController;
