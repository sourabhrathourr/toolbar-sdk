import { Position, Hotspot } from '../types';

export const POSITION_STORAGE_KEY = 'toolbar_position';
export const ORIENTATION_STORAGE_KEY = 'toolbar_orientation';

export const hotspots: Hotspot[] = [
  { x: 40, y: 40, orientation: 'vertical' }, // Top left
  { x: '47%', y: 40, orientation: 'horizontal' }, // Top center
  { x: '96%', y: 40, orientation: 'vertical' }, // Top right
  { x: 40, y: '45%', orientation: 'vertical' }, // Center left
  { x: '47%', y: '50%', orientation: 'horizontal' }, // Center
  { x: '96%', y: '45%', orientation: 'vertical' }, // Center right
  { x: 40, y: '80%', orientation: 'vertical' }, // Bottom left
  { x: '47%', y: '92%', orientation: 'horizontal' }, // Bottom center
  { x: '96%', y: '80%', orientation: 'vertical' }, // Bottom right
];

export const getNumericPosition = (pos: string | number, viewportSize: number): number => {
  if (typeof pos === 'number') return pos;
  if (pos.includes('%')) {
    const percentage = parseFloat(pos);
    const value = (percentage / 100) * viewportSize;
    return percentage === 50 ? value : value;
  }
  return parseFloat(pos);
};

export const getNumericPositionObject = (
  pos: Position,
  viewportWidth: number,
  viewportHeight: number
) => ({
  x: getNumericPosition(pos.x, viewportWidth),
  y: getNumericPosition(pos.y, viewportHeight),
});

export const convertToPercentage = (
  position: Position,
  viewportWidth: number,
  viewportHeight: number
): Position => ({
  x: typeof position.x === 'number' ? `${(position.x / viewportWidth) * 100}%` : position.x,
  y: typeof position.y === 'number' ? `${(position.y / viewportHeight) * 100}%` : position.y,
});

export const getInitialPosition = (): {
  position: Position;
  orientation: 'horizontal' | 'vertical';
} => {
  try {
    const savedPosition = localStorage.getItem(POSITION_STORAGE_KEY);
    const savedOrientation = localStorage.getItem(ORIENTATION_STORAGE_KEY);

    if (savedPosition && savedOrientation) {
      return {
        position: JSON.parse(savedPosition),
        orientation: savedOrientation as 'horizontal' | 'vertical',
      };
    }
  } catch (error) {
    console.error('Error loading position from localStorage:', error);
  }

  // Default position matching bottom right hotspot exactly
  return {
    position: {
      x: '96%',
      y: '80%',
    },
    orientation: 'vertical',
  };
};

export const getExpandDirection = (
  xPos: number,
  yPos: number,
) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  return {
    horizontal: xPos > viewportWidth - 120 ? 'left' : 'right',
    vertical: yPos > viewportHeight - 120 ? 'up' : 'down',
  };
}; 