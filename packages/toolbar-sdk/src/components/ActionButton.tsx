import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pin, PinOff } from 'lucide-react';
import { Tooltip } from './Tooltip';
import type { Position } from '../types';

interface ActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip: string;
  isLast?: boolean;
  orientation?: 'horizontal' | 'vertical';
  position?: Position;
  pinned?: boolean;
  onTogglePin?: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  onClick,
  tooltip,
  isLast,
  orientation = 'vertical',
  position,
  pinned = false,
  onTogglePin,
}) => {
  const [showPinMenu, setShowPinMenu] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onTogglePin) {
      setShowPinMenu(true);
    }
  };

  const handleTogglePin = () => {
    if (onTogglePin) {
      onTogglePin();
      setShowPinMenu(false);
    }
  };

  return (
    <div 
      style={{ 
        position: 'relative',
        width: '32px',
        height: '32px',
        margin: orientation === 'vertical' ? '4px 0' : '0 4px',
      }}
      onContextMenu={handleContextMenu}
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
      {showPinMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.1 }}
          style={{
            position: 'absolute',
            top: orientation === 'vertical' ? '0' : '40px',
            left: orientation === 'vertical' ? '40px' : '0',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderRadius: '8px',
            padding: '8px',
            zIndex: 10001,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <motion.button
            onClick={handleTogglePin}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: 'white',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {pinned ? (
              <>
                <PinOff size={16} />
                <span>Unpin</span>
              </>
            ) : (
              <>
                <Pin size={16} />
                <span>Pin</span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}; 