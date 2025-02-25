import { useState, useEffect, useRef } from 'react';
import { useMotionValue } from 'framer-motion';
import type { Position } from '../types';

const POSITION_STORAGE_KEY = 'toolbar_position';

interface UseToolbarProps {
  position: Position;
}

export const useToolbar = ({ position: initialPosition }: UseToolbarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullyExpanded, setIsFullyExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    // Initialize position
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const xPos = typeof position.x === 'string'
      ? (parseFloat(position.x) / 100) * viewportWidth
      : position.x;
    const yPos = typeof position.y === 'string'
      ? (parseFloat(position.y) / 100) * viewportHeight
      : position.y;

    x.set(xPos);
    y.set(yPos);
  }, [position, x, y]);

  const handleDragStart = () => {
    setIsDragging(true);
    setIsExpanded(false);
    setIsFullyExpanded(false);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsExpanded(true);
    setIsFullyExpanded(true);

    // Save position
    const newPosition = {
      x: `${(x.get() / window.innerWidth) * 100}%`,
      y: `${(y.get() / window.innerHeight) * 100}%`,
    };
    setPosition(newPosition);
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(newPosition));
  };

  const handleMouseEnter = () => {
    if (!isDragging) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    timeoutRef.current = setTimeout(() => {
      setIsFullyExpanded(false);
    }, 300);
  };

  useEffect(() => {
    if (isExpanded && !isDragging) {
      setIsFullyExpanded(true);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isExpanded, isDragging]);

  return {
    isExpanded,
    isFullyExpanded,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleMouseEnter,
    handleMouseLeave,
    x,
    y,
  };
};
