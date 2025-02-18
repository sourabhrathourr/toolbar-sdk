import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Position } from '../types';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: Position;
  orientation?: 'horizontal' | 'vertical';
}

export const Tooltip: React.FC<TooltipProps> = ({
  text,
  children,
  position,
  orientation = 'vertical'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getTooltipPosition = () => {
    if (!position) return {};

    const viewportWidth = window.innerWidth;
    const isRightSide = position.x > viewportWidth / 2;

    if (orientation === 'vertical') {
      return isRightSide
        ? {
            right: '100%',
            left: 'auto',
            top: '20%',
            bottom: 'auto',
            transform: 'translateY(-50%)',
            marginRight: '12px',
            marginBottom: '0',
          }
        : {
            left: '100%',
            right: 'auto',
            top: '20%',
            bottom: 'auto',
            transform: 'translateY(-50%)',
            marginLeft: '12px',
            marginBottom: '0',
          };
    }

    return {
      left: '-90%',
      bottom: '100%',
      transform: 'translateX(-50%)',
      marginBottom: '12px',
    };
  };

  const getArrowPosition = () => {
    if (!position) return {};

    const viewportWidth = window.innerWidth;
    const isRightSide = position.x > viewportWidth / 2;

    if (orientation === 'vertical') {
      return isRightSide
        ? {
            right: '-4px',
            left: 'auto',
            top: '50%',
            bottom: 'auto',
            transform: 'translateY(-50%) rotate(45deg)',
          }
        : {
            left: '-4px',
            right: 'auto',
            top: '50%',
            bottom: 'auto',
            transform: 'translateY(-50%) rotate(45deg)',
          };
    }

    return {
      bottom: '-4px',
      left: '50%',
      transform: 'translateX(-50%) rotate(45deg)',
    };
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            style={{
              position: 'absolute',
              padding: '6px 8px',
              backgroundColor: '#000',
              color: '#fff',
              fontSize: '12px',
              lineHeight: '14px',
              fontWeight: 500,
              borderRadius: '6px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10001,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              letterSpacing: '-0.01em',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              ...getTooltipPosition(),
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                backgroundColor: '#000',
                zIndex: -1,
                ...getArrowPosition(),
              }}
            />
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 