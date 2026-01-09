import type { Piece } from './types';

interface CubePieceProps {
  piece: Piece;
  size: number;
}

const CubePiece = ({ piece, size }: CubePieceProps) => {
  const gap = 0.05;
  const cubeSize = 1 - gap;

  return (
    <group
      position={[
        piece.position[0] * (size + gap * 2),
        piece.position[1] * (size + gap * 2),
        piece.position[2] * (size + gap * 2),
      ]}
      rotation={piece.rotation}
    >
      <mesh>
        <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* 各面にステッカーを配置 */}
      {piece.colors.front && (
        <mesh position={[0, 0, cubeSize / 2 + 0.01]}>
          <planeGeometry args={[cubeSize * 0.9, cubeSize * 0.9]} />
          <meshStandardMaterial color={piece.colors.front} />
        </mesh>
      )}

      {piece.colors.back && (
        <mesh position={[0, 0, -cubeSize / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[cubeSize * 0.9, cubeSize * 0.9]} />
          <meshStandardMaterial color={piece.colors.back} />
        </mesh>
      )}

      {piece.colors.left && (
        <mesh position={[-cubeSize / 2 - 0.01, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[cubeSize * 0.9, cubeSize * 0.9]} />
          <meshStandardMaterial color={piece.colors.left} />
        </mesh>
      )}

      {piece.colors.right && (
        <mesh position={[cubeSize / 2 + 0.01, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[cubeSize * 0.9, cubeSize * 0.9]} />
          <meshStandardMaterial color={piece.colors.right} />
        </mesh>
      )}

      {piece.colors.top && (
        <mesh position={[0, cubeSize / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[cubeSize * 0.9, cubeSize * 0.9]} />
          <meshStandardMaterial color={piece.colors.top} />
        </mesh>
      )}

      {piece.colors.bottom && (
        <mesh position={[0, -cubeSize / 2 - 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[cubeSize * 0.9, cubeSize * 0.9]} />
          <meshStandardMaterial color={piece.colors.bottom} />
        </mesh>
      )}
    </group>
  );
};

export default CubePiece;
