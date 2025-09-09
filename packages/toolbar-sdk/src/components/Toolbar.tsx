import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  theme = {},
}) => {
  // Default theme values for backward compatibility
  const defaultTheme = {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    iconColor: 'white',
    hoverBackgroundColor: 'rgba(255, 255, 255, 0.1)',
    tooltipBackgroundColor: 'rgba(0, 0, 0, 0.9)',
    tooltipTextColor: 'white',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    badgeBackgroundColor: '#ef4444',
    badgeTextColor: 'white',
    badgeBorderColor: 'rgba(255, 255, 255, 0.15)',
  };
  
  const appliedTheme = { ...defaultTheme, ...theme };
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandedBadges, setShowExpandedBadges] = useState(false);
  const badgeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
  
  // Ensure the first button is always pinned
  const processedButtons = buttons.map((button, index) => {
    if (index === 0) {
      // Force the first button to be pinned
      return { ...button, pinned: true };
    }
    return button;
  });
  
  const pinnedButtons = processedButtons.filter(button => button.pinned);
  const unpinnedButtons = processedButtons.filter(button => !button.pinned);
  
  // Default to first button if no pinned buttons (should never happen now)
  const hasDefaultIcon = defaultIcon !== undefined;
  const hasPinnedButtons = pinnedButtons.length > 0;
  const buttonToShow = hasPinnedButtons ? pinnedButtons[0] : processedButtons[0];

  // Track if mouse is currently over the toolbar
  const isMouseOverRef = useRef(false);

  // Set toolbar position
  useEffect(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    const xPos = getNumericPosition(position.x, viewportWidth);
    const yPos = getNumericPosition(position.y, viewportHeight);

    x.set(xPos);
    y.set(yPos);
  }, [position, x, y]);

  // Handle drag interactions with improved cleanup
  useEffect(() => {
    if (isDragging) {
      // Clear all interaction states when dragging
      setIsExpanded(false);
      setHoveredButtonId(null);
      setTooltipLocked(false);
      
      // Clear all timeouts
      clearAllTimeouts();
    }
  }, [isDragging]);

  // Function to clear all timeouts in one place
  const clearAllTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    if (dragCooldownRef.current) {
      clearTimeout(dragCooldownRef.current);
      dragCooldownRef.current = null;
    }
    if (badgeTimeoutRef.current) {
      clearTimeout(badgeTimeoutRef.current);
      badgeTimeoutRef.current = null;
    }
  };

  // Clean up any timeouts
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  // Control badge visibility for expanded buttons with timing
  useEffect(() => {
    if (badgeTimeoutRef.current) {
      clearTimeout(badgeTimeoutRef.current);
    }

    if (isExpanded) {
      // Show expanded badges after a delay when expanding
      badgeTimeoutRef.current = setTimeout(() => {
        setShowExpandedBadges(true);
      }, 300); // Increased delay to let toolbar fully expand
    } else {
      // Hide expanded badges immediately when collapsing
      setShowExpandedBadges(false);
    }

    return () => {
      if (badgeTimeoutRef.current) {
        clearTimeout(badgeTimeoutRef.current);
      }
    };
  }, [isExpanded]);

  // Update badges when toolbar position changes
  useEffect(() => {
    // Badges will re-render automatically when position changes
  }, [position, x.get(), y.get()]);

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
    _event: MouseEvent | TouchEvent | PointerEvent,
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
    
    // Clear all existing timeouts to prevent interference
    clearAllTimeouts();
    
    // Add a brief cooldown to prevent accidental expansion immediately after drag
    blockExpandRef.current = true;
    
    // Simple cooldown to prevent immediate hover expansion after drag
    dragCooldownRef.current = setTimeout(() => {
      blockExpandRef.current = false;
    }, 300); // Short cooldown to prevent accidental hover
  };

  // Update onDragStart with improved cleanup
  const onDragStart = () => {
    setIsDragging(true);
    setIsExpanded(false);
    setHoveredButtonId(null);
    setTooltipLocked(false);
    blockExpandRef.current = true;
    
    // Clear all existing timeouts
    clearAllTimeouts();
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

  // Create a ref for the toolbar container to calculate badge positions
  const toolbarRef = useRef<HTMLDivElement>(null);
  
  // Render count badges using portal for better positioning
  const renderPortalBadges = () => {
    if (!toolbarRef.current || isDragging) return null;
    
    const badges: React.ReactNode[] = [];
    const toolbarRect = toolbarRef.current.getBoundingClientRect();
    const shouldReverseOrder = isNearBottom();
    
    // Calculate the actual visual positions based on how buttons are rendered
    if (shouldReverseOrder) {
      // Bottom position: button order is reversed for both horizontal and vertical
      
      if (orientation === 'horizontal') {
        // Horizontal bottom: elements are counted from left to right, but in reversed order
        
        if (!isExpanded) {
          // Collapsed: only pinned buttons, but reversed
          pinnedButtons.forEach((button, index) => {
            if (!button.count || button.count <= 0) return;
            const visualIndex = pinnedButtons.length - 1 - index;
            const badgeElement = createBadgeElement(button, visualIndex, toolbarRect, true, 'pinned');
            badges.push(badgeElement);
          });
        } else {
          // Expanded: unpinned first (reversed), then pinned (reversed)
          pinnedButtons.forEach((button, index) => {
            if (!button.count || button.count <= 0) return;
            const visualIndex = unpinnedButtons.length + (pinnedButtons.length - 1 - index);
            const badgeElement = createBadgeElement(button, visualIndex, toolbarRect, true, 'pinned');
            badges.push(badgeElement);
          });
          
          if (showExpandedBadges && unpinnedButtons.length > 0) {
            unpinnedButtons.forEach((button, index) => {
              if (!button.count || button.count <= 0) return;
              const visualIndex = unpinnedButtons.length - 1 - index;
              const badgeElement = createBadgeElement(button, visualIndex, toolbarRect, false, 'unpinned');
              badges.push(badgeElement);
            });
          }
        }
      } else {
        // Vertical bottom: create exact DOM order list and find button positions
        
        if (!isExpanded) {
          // Collapsed: only pinned buttons, visual order should match DOM
          // Visual order from top to bottom: [settings, mail, ai]
          pinnedButtons.forEach((button, index) => {
            if (!button.count || button.count <= 0) return;
            const badgeElement = createBadgeElement(button, index, toolbarRect, true, 'pinned');
            badges.push(badgeElement);
          });
        } else {
          // Expanded: create the exact same order as DOM rendering  
          // Visual order from top to bottom: Help, Like, Docs, Mail, Settings, AI
          const domOrder = [
            ...unpinnedButtons,  // Already in correct visual order: Help, Like, Docs, Mail  
            ...pinnedButtons     // Already in correct visual order: Settings, AI
          ];
          
          // Find buttons with counts and map them to their correct DOM positions
          const buttonsWithCounts = processedButtons.filter(b => b.count && b.count > 0);
          
          buttonsWithCounts.forEach((button) => {
            // Find the actual DOM index of this button in the domOrder array  
            const domIndex = domOrder.findIndex(b => b.id === button.id);
            
            if (domIndex !== -1) {
              const isPinned = button.pinned || false;
              const badgeType = isPinned ? 'pinned' : 'unpinned';
              
              // Only show unpinned badges if they're ready to be shown
              if (!isPinned && !showExpandedBadges) {
                return; // Skip unpinned badges if not ready
              }
              
              const badgeElement = createBadgeElement(button, domIndex, toolbarRect, isPinned, badgeType);
              badges.push(badgeElement);
            }
          });
        }
      }
    } else {
      // Normal order: pinned buttons first, then unpinned buttons
      
      // Render pinned button badges
      pinnedButtons.forEach((button, index) => {
        if (!button.count || button.count <= 0) return;
        
        const badgeElement = createBadgeElement(button, index, toolbarRect, true, 'pinned');
        badges.push(badgeElement);
      });
      
      // Render unpinned button badges when expanded
      if (isExpanded && showExpandedBadges && unpinnedButtons.length > 0) {
        unpinnedButtons.forEach((button, index) => {
          if (!button.count || button.count <= 0) return;
          
          const visualIndex = pinnedButtons.length + index;
          const badgeElement = createBadgeElement(button, visualIndex, toolbarRect, false, 'unpinned');
          badges.push(badgeElement);
        });
      }
    }
    
    return typeof document !== 'undefined' ? createPortal(
      <>{badges}</>,
      document.body
    ) : null;
  };
  
  // Helper function to create a badge element with animation
  const createBadgeElement = (button: ToolbarButton, visualIndex: number, toolbarRect: DOMRect, isPinned: boolean, badgeType: 'pinned' | 'unpinned') => {
    // Use existing position detection functions
    const nearBottom = isNearBottom();
    const nearRight = isNearRight();
    
    // Calculate button position within the toolbar based on toolbar position
    let badgeX = 0;
    let badgeY = 0;
    
    if (orientation === 'horizontal') {
      badgeX = toolbarRect.left + (visualIndex * (28 + 6)) + 6 + 14; // button offset + padding + center
      
      if (nearBottom) {
        badgeY = toolbarRect.bottom + 8; // Below the toolbar when toolbar is at bottom
      } else {
        badgeY = toolbarRect.top - 8; // Above the toolbar when toolbar is at top
      }
    } else {
      // For vertical orientation
      if (nearBottom) {
        // In bottom positions, calculate from bottom to prevent jumping during expansion
        // Use different calculation for collapsed vs expanded state
        const totalVisibleButtons = isExpanded ? (pinnedButtons.length + unpinnedButtons.length) : pinnedButtons.length;
        badgeY = toolbarRect.bottom - ((totalVisibleButtons - 1 - visualIndex) * (28 + 6)) - 7 - 14;
      } else {
        // In top positions, calculate from top as usual
        badgeY = toolbarRect.top + (visualIndex * (28 + 6)) + 7 + 14;
      }
      
      if (nearRight) {
        badgeX = toolbarRect.left - 12; // Further left to avoid overlapping icon when toolbar is on right
      } else {
        badgeX = toolbarRect.right - 4; // Close to the right border of toolbar when toolbar is on left
      }
    }
    
    return (
      <div
        key={`portal-badge-${badgeType}-${button.id}`}
        style={{
          position: 'fixed',
          left: `${badgeX}px`,
          top: `${badgeY}px`,
          minWidth: '16px',
          height: '16px',
          backgroundColor: appliedTheme.badgeBackgroundColor,
          color: appliedTheme.badgeTextColor,
          border: `1px solid ${appliedTheme.badgeBorderColor}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: '600',
          padding: '0 4px',
          zIndex: 10001,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          pointerEvents: 'none',
          boxSizing: 'border-box',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          transform: orientation === 'horizontal' ? 'translateX(-50%)' : 'translateY(-50%)', // Center appropriately
          // Smooth fade-in animation for unpinned badges
          ...(!isPinned && {
            animation: 'badgeFadeIn 0.3s ease-out',
          }),
        }}
      >
        {(button.count ?? 0) > 99 ? '99+' : button.count}
        
        {/* Add CSS animation inline */}
        {!isPinned && (
          <style>
            {`
              @keyframes badgeFadeIn {
                0% {
                  opacity: 0;
                  transform: ${
                    orientation === 'horizontal'
                      ? nearBottom
                        ? 'translateX(-50%) translateY(-4px) scale(0.8)'  // Slide down from above when toolbar is at bottom
                        : 'translateX(-50%) translateY(4px) scale(0.8)'   // Slide up from below when toolbar is at top
                      : nearRight
                        ? 'translateY(-50%) translateX(4px) scale(0.8)'   // Slide in from right when toolbar is on right
                        : 'translateY(-50%) translateX(-4px) scale(0.8)'  // Slide in from left when toolbar is on left
                  };
                }
                100% {
                  opacity: 1;
                  transform: ${orientation === 'horizontal' 
                    ? 'translateX(-50%) translateY(0) scale(1)' 
                    : 'translateY(-50%) translateX(0) scale(1)'
                  };
                }
              }
            `}
          </style>
        )}
      </div>
    );
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
          theme={appliedTheme}
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
              color: appliedTheme.iconColor,
              borderRadius: '50%',
              position: 'relative',
            }}
            whileHover={{ backgroundColor: appliedTheme.hoverBackgroundColor }}
          >
            {button.icon}
          </motion.button>
        </Tooltip>
        
        {showDivider && (
          <div
            style={{
              position: 'absolute',
              backgroundColor: appliedTheme.borderColor,
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
    const buttonToDisplay = hasPinnedButtons ? pinnedButtons[0] : processedButtons[0];
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
          color: appliedTheme.iconColor,
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
          theme={appliedTheme}
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
              color: appliedTheme.iconColor,
              borderRadius: '50%',
              position: 'relative',
            }}
            whileHover={{ backgroundColor: appliedTheme.hoverBackgroundColor }}
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
  const expandedDimensions = getToolbarDimensions(processedButtons.length);
  
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
    // Track that the mouse is over the toolbar
    isMouseOverRef.current = true;
    
    // Only allow expansion if not dragging and not in cooldown period
    if (!isDragging && !blockExpandRef.current) {
      // Clear any pending close timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Expand immediately on hover
      setIsExpanded(true);
    }
  };

  const handleMouseLeaveToolbar = () => {
    // Track that the mouse is no longer over the toolbar
    isMouseOverRef.current = false;
    
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Collapse with minimal delay - this gives a chance to re-enter
    timeoutRef.current = setTimeout(() => {
      // Double-check mouse is still not over toolbar
      if (!isMouseOverRef.current) {
        setIsExpanded(false);
      }
    }, 150); // Slight delay to prevent accidental closing
    
    // Clear tooltip with a delay to prevent flickering
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    
    tooltipTimeoutRef.current = setTimeout(() => {
      setHoveredButtonId(null);
      setTooltipLocked(false);
    }, 100);
  };

  return (
    <TooltipProvider>
      {/* Portal badges rendered above toolbar */}
      {renderPortalBadges()}
      <motion.div
        className={className}
        style={{
          x,
          y,
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 10000,
          overflow: 'visible',
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
          ref={toolbarRef}
          style={{
            backgroundColor: appliedTheme.backgroundColor,
            boxShadow: appliedTheme.boxShadow,
            backdropFilter: appliedTheme.backdropFilter,
            WebkitBackdropFilter: appliedTheme.backdropFilter,
            border: `1px solid ${appliedTheme.borderColor}`,
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