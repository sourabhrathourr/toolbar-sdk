import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { Highlighter, MessageCircle, Sparkles } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { ActionButton } from './ActionButton';
import { ActionButtonsType, Position, ToolbarProps, ToolbarButton } from '../types';
import {
  hotspots,
  getNumericPosition,
  getNumericPositionObject,
  convertToPercentage,
  getInitialPosition,
  getExpandDirection,
  POSITION_STORAGE_KEY,
  ORIENTATION_STORAGE_KEY,
} from '../utils/position';

const defaultButtons: ToolbarButton[] = [
  {
    id: ActionButtonsType.Summarize,
    icon: <Sparkles size={16} />,
    tooltip: 'AI Chat',
    onClick: () => console.log('AI Chat clicked'),
  },
  {
    id: ActionButtonsType.Annotation,
    icon: <Highlighter size={16} />,
    tooltip: 'Highlight text',
    onClick: () => console.log('Highlight clicked'),
  },
  {
    id: ActionButtonsType.Comment,
    icon: <MessageCircle size={16} />,
    tooltip: 'Add Comment',
    onClick: () => console.log('Comment clicked'),
  },
];

export const Toolbar: React.FC<ToolbarProps> = ({ 
  className = '', 
  buttons,
  defaultIcon,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullyExpanded, setIsFullyExpanded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initialState = getInitialPosition();
  const [position, setPosition] = useState<Position>(initialState.position);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(
    initialState.orientation
  );

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  const activeButtons = buttons || defaultButtons;
  const collapsedIcon = defaultIcon || <Sparkles size={16} />;

  const toolbarVariants = {
    collapsed: {
      width: '32px',
      height: '32px',
      borderRadius: '24px',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    expanded: {
      width: orientation === 'horizontal' 
        ? `${(activeButtons.length * 40) + 8}px`
        : '40px',
      height: orientation === 'horizontal'
        ? '40px'
        : `${(activeButtons.length * 40) + 8}px`,
      borderRadius: '24px',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  useEffect(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    const xPos = getNumericPosition(position.x, viewportWidth);
    const yPos = getNumericPosition(position.y, viewportHeight);

    x.set(xPos);
    y.set(yPos);
  }, [position, x, y]);

  useEffect(() => {
    if (isExpanded && !isDragging) {
      setIsFullyExpanded(true);
    } else if (isDragging) {
      setIsFullyExpanded(false);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsFullyExpanded(false);
      }, 3000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isExpanded, isDragging]);

  const onDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: {
      point: { x: number; y: number };
    }
  ) => {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    const viewportX = info.point.x;
    const viewportY = info.point.y - window.scrollY;

    const padding = 20;
    const constrainedPoint = {
      x: Math.max(padding, Math.min(viewportX, viewportWidth - padding)),
      y: Math.max(padding, Math.min(viewportY, viewportHeight - padding)),
    };

    const closestHotspot = hotspots.reduce(
      (closest, hotspot) => {
        const hotspotX = getNumericPosition(hotspot.x, viewportWidth);
        const hotspotY = getNumericPosition(hotspot.y, viewportHeight);

        const distance = Math.sqrt(
          Math.pow(constrainedPoint.x - hotspotX, 2) +
            Math.pow(constrainedPoint.y - hotspotY, 2)
        );

        const isEdgeHotspot =
          hotspotX <= padding * 2 ||
          hotspotX >= viewportWidth - padding * 2 ||
          hotspotY <= padding * 2 ||
          hotspotY >= viewportHeight - padding * 2;

        const adjustedDistance = isEdgeHotspot ? distance * 0.8 : distance;

        return adjustedDistance < closest.distance
          ? { hotspot, distance: adjustedDistance }
          : closest;
      },
      { hotspot: hotspots[0], distance: Infinity }
    ).hotspot;

    const newPosition = convertToPercentage(
      {
        x: getNumericPosition(closestHotspot.x, viewportWidth),
        y: getNumericPosition(closestHotspot.y, viewportHeight),
      },
      viewportWidth,
      viewportHeight
    );

    try {
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(newPosition));
      localStorage.setItem(ORIENTATION_STORAGE_KEY, closestHotspot.orientation);
    } catch (error) {
      console.error('Error saving position to localStorage:', error);
    }

    setOrientation(closestHotspot.orientation);
    setPosition(newPosition);
    setIsDragging(false);
    setIsExpanded(true);
    setIsFullyExpanded(true);
  };

  const onDragStart = () => {
    setIsDragging(true);
    setIsExpanded(false);
    setIsFullyExpanded(false);
  };

  return (
    <motion.div
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translate(-50%, -50%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        x,
        y,
      }}
      initial={{
        x: getNumericPosition('98%', window.innerWidth),
        y: getNumericPosition('80%', window.innerHeight),
        ...toolbarVariants.collapsed,
      }}
      drag
      dragConstraints={{
        top: 40,
        left: 40,
        right: document.documentElement.clientWidth - 40,
        bottom: document.documentElement.clientHeight - 40,
      }}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      animate={isFullyExpanded ? 'expanded' : 'collapsed'}
      variants={toolbarVariants}
      onMouseEnter={() => !isDragging && setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300,
        mass: 0.5,
        bounce: 0.25,
      }}
    >
      <AnimatePresence mode="wait">
        {isFullyExpanded && !isDragging ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px',
              flexDirection: orientation === 'vertical' ? 'column' : 'row',
              width: '100%',
              height: '100%',
              transformOrigin:
                orientation === 'vertical'
                  ? getExpandDirection(
                      getNumericPosition(position.x, window.innerWidth),
                      getNumericPosition(position.y, window.innerHeight)
                    ).vertical === 'up'
                    ? 'bottom'
                    : 'top'
                  : getExpandDirection(
                      getNumericPosition(position.x, window.innerWidth),
                      getNumericPosition(position.y, window.innerHeight)
                    ).horizontal === 'left'
                  ? 'right'
                  : 'left',
            }}
          >
            {activeButtons.map((button, index) => (
              <ActionButton
                key={button.id}
                icon={button.icon}
                onClick={button.onClick}
                tooltip={button.tooltip}
                isLast={index === activeButtons.length - 1}
                orientation={orientation}
                position={position}
              />
            ))}
          </motion.div>
        ) : (
          <Tooltip
            text={activeButtons[0]?.tooltip || "AI Chat"}
            position={getNumericPositionObject(
              position,
              window.innerWidth,
              window.innerHeight
            )}
            orientation={orientation}
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={activeButtons[0]?.onClick}
              style={{
                width: '32px',
                height: '32px',
                padding: '0',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              {collapsedIcon}
            </motion.button>
          </Tooltip>
        )}
      </AnimatePresence>
    </motion.div>
  );
}; 