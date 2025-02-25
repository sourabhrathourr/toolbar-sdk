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
  const dragCooldownRef = useRef<NodeJS.Timeout | null>(null);
  const blockExpandRef = useRef(false);
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
  
  // Use buttons directly from props or default buttons
  const buttons = initialButtons || defaultButtons;
  
  const pinnedButtons = buttons.filter(button => button.pinned);
  const unpinnedButtons = buttons.filter(button => !button.pinned);
  
  // Default to first button if no pinned buttons
  const hasDefaultIcon = defaultIcon !== undefined;
  const hasPinnedButtons = pinnedButtons.length > 0;
  const buttonToShow = hasPinnedButtons ? pinnedButtons[0] : buttons[0];

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
      if (dragCooldownRef.current) {
        clearTimeout(dragCooldownRef.current);
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

  // Determine if toolbar is near bottom of screen
  const isNearBottom = () => {
    const viewportHeight = document.documentElement.clientHeight;
    const viewportWidth = document.documentElement.clientWidth;
    const yPos = getNumericPosition(position.y, viewportHeight);
    const xPos = getNumericPosition(position.x, viewportWidth);
    
    // Special case: don't reorder for bottom center position (horizontal orientation)
    const isBottomCenter = yPos > viewportHeight * 0.7 && 
                          xPos > viewportWidth * 0.35 && 
                          xPos < viewportWidth * 0.65 &&
                          orientation === 'horizontal';
    
    // Only return true for bottom positions that are not bottom center
    return yPos > viewportHeight * 0.7 && !isBottomCenter;
  };

  // Determine if toolbar is near right of screen
  const isNearRight = () => {
    const viewportWidth = document.documentElement.clientWidth;
    const xPos = getNumericPosition(position.x, viewportWidth);
    return xPos > viewportWidth * 0.7; // If in the right 30% of the viewport
  };

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
    
    // Briefly show the toolbar in expanded state
    setIsExpanded(true);
    
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (dragCooldownRef.current) {
      clearTimeout(dragCooldownRef.current);
    }
    
    // Set a flag to block manual expansion/collapse during preview
    blockExpandRef.current = true;
    
    // Automatically collapse the toolbar after a brief preview
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
      
      // Allow normal hover behavior after the preview
      dragCooldownRef.current = setTimeout(() => {
        blockExpandRef.current = false;
      }, 100);
    }, 1500); // Show expanded state for 1.5 seconds
  };

  // Update onDragStart
  const onDragStart = () => {
    setIsDragging(true);
    setIsExpanded(false);
    setHoveredButtonId(null);
    setTooltipLocked(false);
    blockExpandRef.current = true;
    
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    if (dragCooldownRef.current) {
      clearTimeout(dragCooldownRef.current);
    }
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
          open={isHovered && hoveredButtonId === button.id && !isDragging}
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
  
  // When dragging, only show the first button
  if (isDragging) {
    // Use the first pinned button, or the first button if no pinned buttons
    const buttonToDisplay = hasPinnedButtons ? pinnedButtons[0] : buttons[0];
    const icon = hasDefaultIcon && !hasPinnedButtons ? defaultIcon : buttonToDisplay.icon;
    
    content = (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '50%',
        }}>
          {icon}
        </div>
      </div>
    );
  } else if (!hasPinnedButtons) {
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
          open={isHovered && !isDragging}
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
    // Check if we should reverse the order (when near bottom)
    const shouldReverseOrder = isNearBottom();
    
    // Order elements with pinned at bottom when in bottom position
    const elementsToRender: React.ReactNode[] = [];
    
    if (shouldReverseOrder) {
      // When at the bottom, unpinned buttons are shown first (when expanded), pinned buttons at the bottom
      if (isExpanded && !isDragging && unpinnedButtons.length > 0) {
        // For expanded state, add unpinned buttons first (they appear on top)
        unpinnedButtons.reverse().forEach((button, index) => {
          const isLast = index === unpinnedButtons.length - 1;
          // Show divider after last unpinned button, before pinned buttons
          const showDivider = !isLast || pinnedButtons.length > 0;
          elementsToRender.push(renderButton(button, showDivider, orientation));
        });
      }
      
      // Add pinned buttons at the end (they appear at the bottom)
      pinnedButtons.reverse().forEach((button, index) => {
        const isLast = index === pinnedButtons.length - 1;
        const showDivider = !isLast;
        elementsToRender.push(renderButton(button, showDivider, orientation));
      });
    } else {
      // Normal order (pinned buttons first, unpinned after)
      // Add pinned buttons first
      pinnedButtons.forEach((button, index) => {
        const isLast = index === pinnedButtons.length - 1;
        // Only show divider if there are unpinned buttons and we're expanded
        const showDivider = !isLast || (isExpanded && !isDragging && unpinnedButtons.length > 0);
        elementsToRender.push(renderButton(button, showDivider, orientation));
      });
      
      // Then add unpinned buttons when expanded
      if (isExpanded && !isDragging && unpinnedButtons.length > 0) {
        unpinnedButtons.forEach((button, index) => {
          const isLast = index === unpinnedButtons.length - 1;
          const showDivider = !isLast;
          elementsToRender.push(renderButton(button, showDivider, orientation));
        });
      }
    }
    
    // Unified approach for both orientations
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: orientation === 'horizontal' ? 'row' : 'column',
      padding: orientation === 'horizontal' ? '6px' : '7px 6px',
      gap: '6px',
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: shouldReverseOrder ? 'flex-end' : 'flex-start', // Align based on position
      boxSizing: 'border-box',
    };
    
    // Render the content
    content = (
      <div style={containerStyle}>
        {elementsToRender}
      </div>
    );
  }

  // Calculate sizes for the toolbar
  const buttonSize = 28; // Size of the button
  const buttonSpacing = 6; // Spacing between buttons
  const padding = 6; // Padding around buttons
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
      // For horizontal, calculate full width including all buttons
      const width = buttonCount * buttonSize + (buttonCount - 1) * buttonSpacing + padding * 2;
      return { width: `${width}px`, height: `${buttonSize + padding * 2}px` };
    } else {
      // For vertical, calculate full height including all buttons
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
  
  // Calculate appropriate anchor position based on toolbar position
  const getAnchorPosition = (): React.CSSProperties => {
    const nearBottom = isNearBottom();
    const nearRight = isNearRight();
    
    if (orientation === 'vertical') {
      return {
        position: 'absolute' as const,
        ...(nearBottom ? { bottom: 0 } : { top: 0 }),
        ...(nearRight ? { right: 0 } : { left: 0 }),
      };
    } else {
      return {
        position: 'absolute' as const,
        ...(nearBottom ? { bottom: 0 } : { top: 0 }),
        ...(nearRight ? { right: 0 } : { left: 0 }),
      };
    }
  };
  
  // Set transform origin to bottom or right based on position
  const getTransformOrigin = () => {
    if (isNearBottom()) {
      return orientation === 'vertical' ? 'center bottom' : 'right center';
    } else {
      return orientation === 'horizontal' ? 'left center' : 'center top';
    }
  };

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
    // Only allow expansion if not dragging and not in cooldown period
    if (!isDragging && !blockExpandRef.current) {
      // Clear any pending close timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Expand immediately on hover (no delay)
      setIsExpanded(true);
    }
  };

  const handleMouseLeaveToolbar = () => {
    // Clear any pending expand/collapse timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Collapse with minimal delay
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 100); // Reduced from 2000ms to 100ms for quicker response
    
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
          x,
          y,
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 10000,
          overflow: 'visible', // Make overflow visible to allow content to expand outside
        }}
        initial={{}}
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
      >
        {/* Inner container for content with animations */}
        <motion.div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            overflow: 'hidden',
            borderRadius: getBorderRadius(),
            transformOrigin: getTransformOrigin(),
            ...getAnchorPosition(),
          }}
          animate={{
            width: isDragging 
              ? `${buttonSize + padding * 2}px` // Consistent size with padding when dragging
              : (isExpanded ? expandedDimensions.width : collapsedDimensions.width),
            height: isDragging 
              ? `${buttonSize + padding * 2}px` // Consistent size with padding when dragging
              : (isExpanded ? expandedDimensions.height : collapsedDimensions.height),
          }}
          transition={{
            // Different animation types for opening vs closing
            type: isExpanded ? 'spring' : 'tween',
            // Spring properties (only used when opening)
            stiffness: 200,
            damping: 25,
            // Tween properties (only used when closing)
            duration: isExpanded ? 0.4 : 0.3, // Reduced closing duration from 0.7 to 0.3
            ease: isExpanded ? undefined : [0.2, 0, 0.3, 1], // Slightly faster easing curve
          }}
          initial={{
            width: collapsedDimensions.width,
            height: collapsedDimensions.height,
          }}
          onMouseEnter={handleMouseEnterToolbar}
          onMouseLeave={handleMouseLeaveToolbar}
        >
          {content}
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}; 