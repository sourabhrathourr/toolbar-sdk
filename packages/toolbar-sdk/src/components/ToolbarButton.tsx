import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from './Tooltip';

interface ToolbarButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  isLast?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  tooltip,
  onClick,
  isLast,
  orientation = 'vertical',
}) => {
  return (
    <div style={{ position: 'relative' }}>
      <Tooltip text={tooltip}>
        <motion.button
          onClick={onClick}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          style={{
            width: '32px',
            height: '32px',
            padding: '0',
            border: 'none',
            borderRadius: '24px',
            backgroundColor: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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