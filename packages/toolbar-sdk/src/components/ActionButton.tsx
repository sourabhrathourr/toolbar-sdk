import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from './Tooltip';
import type { Position } from '../types';

interface ActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip: string;
  isLast?: boolean;
  orientation?: 'horizontal' | 'vertical';
  position?: Position;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  onClick,
  tooltip,
  isLast,
  orientation = 'vertical',
  position,
}) => {
  return (
    <div 
      style={{ 
        position: 'relative',
        width: '32px',
        height: '32px',
        margin: orientation === 'vertical' ? '2px 0' : '0 2px',
      }}
    >
      <Tooltip
        text={tooltip}
        position={position}
        orientation={orientation}
      >
        <motion.button
          onClick={onClick}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            border: 'none',
            borderRadius: '24px',
            backgroundColor: 'transparent',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {icon}
        </motion.button>
      </Tooltip>
      {!isLast && (
        <div
          style={{
            position: 'absolute',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            ...(orientation === 'vertical'
              ? {
                  bottom: '-4px',
                  left: '20%',
                  width: '60%',
                  height: '1px',
                }
              : {
                  right: '-4px',
                  top: '20%',
                  width: '1px',
                  height: '60%',
                }),
          }}
        />
      )}
    </div>
  );
}; 