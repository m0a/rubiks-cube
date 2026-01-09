export type CubeSize = 2 | 3;

export interface CubeState {
  size: CubeSize;
  pieces: Piece[];
}

export interface Piece {
  id: number;
  position: [number, number, number];
  rotation: [number, number, number];
  colors: {
    front?: string;
    back?: string;
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
  };
}

export type Face = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
export type Direction = 'clockwise' | 'counterclockwise';
