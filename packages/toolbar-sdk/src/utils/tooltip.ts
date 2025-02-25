import type { Position } from '../types';

type Side = 'top' | 'right' | 'bottom' | 'left';

/**
 * Determines the optimal side for a tooltip based on toolbar position and orientation
 */
export function getTooltipSide(
  position: Position | undefined,
  orientation: 'horizontal' | 'vertical'
): Side {
  if (!position) return orientation === 'horizontal' ? 'top' : 'right';

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Get numeric positions
  let posX = 0;
  let posY = 0;
  
  try {
    // Parse percentage values like "80%" to numeric values
    if (typeof position.x === 'string' && position.x.includes('%')) {
      const percent = parseFloat(position.x) / 100;
      posX = viewportWidth * percent;
    } else {
      posX = Number(position.x);
    }
    
    if (typeof position.y === 'string' && position.y.includes('%')) {
      const percent = parseFloat(position.y) / 100;
      posY = viewportHeight * percent;
    } else {
      posY = Number(position.y);
    }
  } catch (e) {
    // Fall back to default calculation if parsing fails
    posX = viewportWidth / 2;
    posY = viewportHeight / 2;
  }
  
  const isRightSide = posX > viewportWidth / 2;
  const isBottomHalf = posY > viewportHeight / 2;

  if (orientation === 'vertical') {
    // For vertical orientation, place tooltip on left or right based on toolbar position
    return isRightSide ? 'left' : 'right';
  } else {
    // For horizontal orientation, place tooltip above or below based on toolbar position
    return isBottomHalf ? 'top' : 'bottom';
  }
} 