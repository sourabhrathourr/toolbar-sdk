import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

// Create a default provider with explicit settings
const TooltipProvider = ({ children }: { children: React.ReactNode }) => (
  <TooltipPrimitive.Provider skipDelayDuration={0}>
    {children}
  </TooltipPrimitive.Provider>
);

const TooltipRoot = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

// Custom arrow component with styling
const TooltipArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    width={8}
    height={4}
    {...props}
    style={{
      fill: 'rgba(0, 0, 0, 0.95)',
      filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
      ...props.style,
    }}
  />
))

TooltipArrow.displayName = TooltipPrimitive.Arrow.displayName

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={className}
      collisionPadding={10}
      {...props}
      style={{
        padding: '6px 10px',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        color: '#fff',
        fontSize: '12px',
        lineHeight: '14px',
        fontWeight: 500,
        borderRadius: '6px',
        whiteSpace: 'nowrap',
        zIndex: 99999,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
        letterSpacing: '-0.01em',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        pointerEvents: 'none', // Prevent tooltip from interfering with mouse events
        ...props.style,
      }}
    >
      {props.children}
      <TooltipArrow />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Create compound components with defaults for easier use
const Tooltip = ({
  children,
  content,
  side,
  sideOffset = 10,
  open,
  defaultOpen,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  open?: boolean;
  defaultOpen?: boolean;
}) => (
  <TooltipRoot 
    delayDuration={0}
    open={open} 
    defaultOpen={defaultOpen}
  >
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent 
      side={side} 
      sideOffset={sideOffset} 
      forceMount={true}
      avoidCollisions={true}
    >
      {content}
    </TooltipContent>
  </TooltipRoot>
);

export { 
  TooltipRoot, 
  TooltipTrigger, 
  TooltipContent, 
  TooltipProvider,
  TooltipArrow,
  Tooltip as default 
} 