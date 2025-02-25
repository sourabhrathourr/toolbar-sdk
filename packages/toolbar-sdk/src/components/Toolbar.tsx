import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { Highlighter, MessageCircle, Sparkles } from 'lucide-react';
import { ActionButtonsType, Position, ToolbarProps, ToolbarButton } from '../types';
import {
  hotspots,
  getNumericPosition,
  convertToPercentage,
  getInitialPosition,
  POSITION_STORAGE_KEY,
  ORIENTATION_STORAGE_KEY,
} from '../utils/position';
import { getTooltipSide } from '../utils/tooltip';
import { TooltipProvider } from './ui/tooltip';
import Tooltip from './ui/tooltip';

// Storage key for pinned buttons
const PINNED_BUTTONS_STORAGE_KEY = 'toolbar-pinned-buttons';

const defaultButtons: ToolbarButton[] = [
  {
    id: ActionButtonsType.Summarize,
    icon: <Sparkles size={16} />,
    tooltip: 'AI Chat',
    onClick: () => console.log('AI Chat clicked'),
    pinned: true,
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
  buttons: initialButtons,
  defaultIcon,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hoveredButtonId, setHoveredButtonId] = useState<string | null>(null);
  const [tooltipLocked, setTooltipLocked] = useState(false);

  const initialState = getInitialPosition();
  const [position, setPosition] = useState<Position>(initialState.position);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(
    initialState.orientation
  );

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Initialize buttons with saved pinned state
  const [buttons] = useState<ToolbarButton[]>(() => {
    const providedButtons = initialButtons || defaultButtons;
    
    try {
      const savedPinnedButtons = localStorage.getItem(PINNED_BUTTONS_STORAGE_KEY);
      if (savedPinnedButtons) {
        const pinnedIds = JSON.parse(savedPinnedButtons) as string[];
        return providedButtons.map(button => ({
          ...button,
          pinned: pinnedIds.includes(button.id) || button.pinned
        }));
      }
    } catch (error) {
      console.error('Error loading pinned buttons from localStorage:', error);
    }
    
    return providedButtons;
  });
  
  const pinnedButtons = buttons.filter(button => button.pinned);
  const unpinnedButtons = buttons.filter(button => !button.pinned);
  
  // Default to first button if no pinned buttons
  const hasDefaultIcon = defaultIcon !== undefined;
  const hasPinnedButtons = pinnedButtons.length > 0;
  const buttonToShow = hasPinnedButtons ? pinnedButtons[0] : buttons[0];
  
  // Save pinned buttons to localStorage when they change
  useEffect(() => {
    try {
      const pinnedIds = buttons.filter(button => button.pinned).map(button => button.id);
      localStorage.setItem(PINNED_BUTTONS_STORAGE_KEY, JSON.stringify(pinnedIds));
    } catch (error) {
      console.error('Error saving pinned buttons to localStorage:', error);
    }
  }, [buttons]);

  // Set toolbar position
  useEffect(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    const xPos = getNumericPosition(position.x, viewportWidth);
    const yPos = getNumericPosition(position.y, viewportHeight);

    x.set(xPos);
    y.set(yPos);
  }, [position, x, y]);

  // Clean up any timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Handle drag interactions
  useEffect(() => {
    if (isDragging) {
      setIsExpanded(false);
      setHoveredButtonId(null);
      setTooltipLocked(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    }
  }, [isDragging]);

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
  };

  const onDragStart = () => {
    setIsDragging(true);
    setIsExpanded(false);
    setHoveredButtonId(null);
    setTooltipLocked(false);
  };

  // Handle button click (normal functionality)
  const handleButtonClick = (button: ToolbarButton) => {
    button.onClick();
  };

  // Handle mouse events for tooltips with debounce
  const handleMouseEnter = (buttonId: string) => {
    // Clear any pending hide timeouts
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    // Set the hover state after a small delay to prevent accidental triggers
    tooltipTimeoutRef.current = setTimeout(() => {
      setHoveredButtonId(buttonId);
      setTooltipLocked(true);
    }, 50);
  };

  const handleMouseLeave = () => {
    // Don't immediately hide the tooltip
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    // Add a delay before hiding to prevent flickering when moving between elements
    tooltipTimeoutRef.current = setTimeout(() => {
      setHoveredButtonId(null);
      setTooltipLocked(false);
    }, 100);
  };

  // Render a single button with tooltip
  const renderButton = (button: ToolbarButton, showDivider: boolean, orientation: 'horizontal' | 'vertical') => {
    const tooltipSide = getTooltipSide(position, orientation);
    const isHovered = hoveredButtonId === button.id || tooltipLocked;
    
    return (
      <div 
        key={button.id}
        style={{ 
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Tooltip 
          content={button.tooltip} 
          side={tooltipSide}
          sideOffset={15}
          open={isHovered && hoveredButtonId === button.id}
        >
          <motion.button
            onClick={() => handleButtonClick(button)}
            onMouseEnter={() => handleMouseEnter(button.id)}
            onMouseLeave={handleMouseLeave}
            style={{
              width: '28px',
              height: '28px',
              padding: '0',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              borderRadius: '50%',
            }}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            {button.icon}
          </motion.button>
        </Tooltip>
        
        {showDivider && (
          <div
            style={{
              position: 'absolute',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              ...(orientation === 'vertical'
                ? {
                    bottom: '-3px',
                    left: '25%',
                    width: '50%',
                    height: '1px',
                  }
                : {
                    right: '-3px',
                    top: '25%',
                    width: '1px',
                    height: '50%',
                  }),
            }}
          />
        )}
      </div>
    );
  };

  // Decide content based on number of pinned buttons
  let content: React.ReactNode;
  if (!hasPinnedButtons) {
    // If no pinned buttons, just show the default icon or the first button
    const icon = hasDefaultIcon ? defaultIcon : buttonToShow?.icon;
    const tooltip = buttonToShow?.tooltip || "Action";
    const tooltipSide = getTooltipSide(position, orientation);
    const isHovered = buttonToShow && hoveredButtonId === buttonToShow.id;
    
    content = (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}>
        <Tooltip 
          content={tooltip} 
          side={tooltipSide}
          sideOffset={15}
          open={isHovered}
        >
          <motion.button
            onClick={() => buttonToShow && handleButtonClick(buttonToShow)}
            onMouseEnter={() => buttonToShow && handleMouseEnter(buttonToShow.id)}
            onMouseLeave={handleMouseLeave}
            style={{
              width: '28px',
              height: '28px',
              padding: '0',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              borderRadius: '50%',
            }}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            {icon}
          </motion.button>
        </Tooltip>
      </div>
    );
  } else {
    // Unified approach for both orientations - pinned elements remain static
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: orientation === 'horizontal' ? 'row' : 'column',
      padding: orientation === 'horizontal' ? '6px' : '7px 6px',
      gap: '6px',
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'flex-start', // Restore original alignment to keep pinned elements static
      boxSizing: 'border-box',
      transformOrigin: orientation === 'horizontal' ? 'left center' : 'center top',
    };
    
    // Show the toolbar content conditionally based on expanded state
    content = (
      <div style={containerStyle}>
        {/* Always show pinned buttons */}
        {pinnedButtons.map((button, index) => {
          const isLast = index === pinnedButtons.length - 1;
          // Only show divider if there are unpinned buttons and we're expanded
          const showDivider = !isLast || (isExpanded && !isDragging && unpinnedButtons.length > 0);
          return renderButton(button, showDivider, orientation);
        })}
        
        {/* Only show unpinned buttons when expanded */}
        {isExpanded && !isDragging && unpinnedButtons.map((button, index) => {
          const isLast = index === unpinnedButtons.length - 1;
          const showDivider = !isLast;
          return renderButton(button, showDivider, orientation);
        })}
      </div>
    );
  }

  // Calculate sizes for the toolbar
  const buttonSize = 28; // Reduced from 32px to 28px
  const buttonSpacing = 6; // Reduced from 8px to 6px
  const padding = 6; // Reduced from 8px to 6px
  const verticalPadding = 7; // Slightly more padding for vertical orientation

  // Calculate the border radius - fully rounded edges
  const getBorderRadius = () => {
    // For a pill shape, use half the height/width
    if (orientation === 'horizontal') {
      // For horizontal: half the height for fully rounded sides
      return `${(buttonSize + padding * 2) / 2}px`;
    } else {
      // For vertical: half the width for fully rounded sides
      return `${(buttonSize + padding * 2) / 2}px`;
    }
  };

  // Calculate the width and height of the toolbar based on orientation and number of visible buttons
  const getToolbarDimensions = (buttonCount: number) => {
    if (orientation === 'horizontal') {
      // For horizontal, calculate full width including all buttons when expanded
      const width = buttonCount * buttonSize + (buttonCount - 1) * buttonSpacing + padding * 2;
      return { width: `${width}px`, height: `${buttonSize + padding * 2}px` };
    } else {
      // For vertical, calculate full height including all buttons when expanded
      const contentHeight = buttonCount * buttonSize + (buttonCount - 1) * buttonSpacing;
      return { 
        width: `${buttonSize + padding * 2}px`, 
        height: `${contentHeight + verticalPadding * 2}px` 
      };
    }
  };

  // Get dimensions for both states
  const collapsedDimensions = getToolbarDimensions(hasPinnedButtons ? pinnedButtons.length : 1);
  const expandedDimensions = getToolbarDimensions(buttons.length);
  const borderRadius = getBorderRadius();

  // Clear tooltip when toolbar is closed
  useEffect(() => {
    if (!isExpanded) {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      setHoveredButtonId(null);
      setTooltipLocked(false);
    }
  }, [isExpanded]);

  const handleMouseEnterToolbar = () => {
    if (!isDragging) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeaveToolbar = () => {
    setIsExpanded(false);
    // Clear tooltip with a delay to prevent flickering
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    tooltipTimeoutRef.current = setTimeout(() => {
      setHoveredButtonId(null);
      setTooltipLocked(false);
    }, 100);
  };

  return (
    <TooltipProvider>
      <motion.div
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 10000,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          transform: 'translate(-50%, -50%)',
          x,
          y,
          overflow: 'hidden',
        }}
        animate={{
          width: isExpanded && !isDragging ? expandedDimensions.width : collapsedDimensions.width,
          height: isExpanded && !isDragging ? expandedDimensions.height : collapsedDimensions.height,
          borderRadius: borderRadius,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
          originX: orientation === 'horizontal' ? 0 : 0.5,
          originY: orientation === 'horizontal' ? 0.5 : 0,
        }}
        initial={{
          x: getNumericPosition('98%', window.innerWidth),
          y: getNumericPosition('80%', window.innerHeight),
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
        onMouseEnter={handleMouseEnterToolbar}
        onMouseLeave={handleMouseLeaveToolbar}
      >
        {content}
      </motion.div>
    </TooltipProvider>
  );
}; 