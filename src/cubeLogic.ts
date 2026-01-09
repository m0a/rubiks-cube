import type { CubeSize, Piece, Face, Direction } from './types';

const COLORS = {
  front: '#00ff00',   // 緑
  back: '#0000ff',    // 青
  left: '#ff6600',    // オレンジ
  right: '#ff0000',   // 赤
  top: '#ffffff',     // 白
  bottom: '#ffff00',  // 黄
};

export function createInitialCube(size: CubeSize): Piece[] {
  const pieces: Piece[] = [];
  const offset = (size - 1) / 2;
  let id = 0;

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        const position: [number, number, number] = [
          x - offset,
          y - offset,
          z - offset,
        ];

        const colors: Piece['colors'] = {};

        // 外側の面のみ色を付ける
        if (z === size - 1) colors.front = COLORS.front;
        if (z === 0) colors.back = COLORS.back;
        if (x === 0) colors.left = COLORS.left;
        if (x === size - 1) colors.right = COLORS.right;
        if (y === size - 1) colors.top = COLORS.top;
        if (y === 0) colors.bottom = COLORS.bottom;

        // 中心のピースは表示しない（3x3の場合のみ）
        if (Object.keys(colors).length > 0) {
          pieces.push({
            id: id++,
            position,
            rotation: [0, 0, 0],
            colors,
          });
        }
      }
    }
  }

  return pieces;
}

export function rotateFace(
  pieces: Piece[],
  face: Face,
  direction: Direction,
  size: CubeSize
): Piece[] {
  const angle = direction === 'clockwise' ? -Math.PI / 2 : Math.PI / 2;
  const newPieces = pieces.map((piece) => ({ ...piece }));

  const offset = (size - 1) / 2;

  newPieces.forEach((piece) => {
    let shouldRotate = false;

    switch (face) {
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

    if (shouldRotate) {
      const [x, y, z] = piece.position;
      const [rx, ry, rz] = piece.rotation;

      switch (face) {
        case 'front':
        case 'back': {
          const rotAngle = face === 'back' ? -angle : angle;
          piece.position = [
            Math.round(Math.cos(rotAngle) * x - Math.sin(rotAngle) * y),
            Math.round(Math.sin(rotAngle) * x + Math.cos(rotAngle) * y),
            z,
          ];
          piece.rotation = [rx, ry, rz + rotAngle];
          break;
        }
        case 'left':
        case 'right': {
          const rotAngle = face === 'right' ? -angle : angle;
          piece.position = [
            x,
            Math.round(Math.cos(rotAngle) * y - Math.sin(rotAngle) * z),
            Math.round(Math.sin(rotAngle) * y + Math.cos(rotAngle) * z),
          ];
          piece.rotation = [rx + rotAngle, ry, rz];
          break;
        }
        case 'top':
        case 'bottom': {
          const rotAngle = face === 'top' ? -angle : angle;
          piece.position = [
            Math.round(Math.cos(rotAngle) * x + Math.sin(rotAngle) * z),
            y,
            Math.round(-Math.sin(rotAngle) * x + Math.cos(rotAngle) * z),
          ];
          piece.rotation = [rx, ry + rotAngle, rz];
          break;
        }
      }
    }
  });

  return newPieces;
}

export function shuffleCube(pieces: Piece[], size: CubeSize, moves: number = 20): Piece[] {
  let shuffled = [...pieces];
  const faces: Face[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];
  const directions: Direction[] = ['clockwise', 'counterclockwise'];

  for (let i = 0; i < moves; i++) {
    const face = faces[Math.floor(Math.random() * faces.length)];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    shuffled = rotateFace(shuffled, face, direction, size);
  }

  return shuffled;
}
