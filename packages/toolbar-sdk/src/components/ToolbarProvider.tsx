import React, { createContext, useContext, ReactNode } from 'react';
import type { ToolbarConfig } from '../types';
import { getInitialPosition } from '../utils/position';

interface ToolbarContextType {
  config: ToolbarConfig;
  updateConfig: (newConfig: Partial<ToolbarConfig>) => void;
}

const ToolbarContext = createContext<ToolbarContextType | undefined>(undefined);

export function useToolbarContext() {
  const context = useContext(ToolbarContext);
  if (!context) {
    throw new Error('useToolbarContext must be used within a ToolbarProvider');
  }
  return context;
}

interface ToolbarProviderProps {
  children: ReactNode;
  initialConfig?: Partial<ToolbarConfig>;
}

export const ToolbarProvider: React.FC<ToolbarProviderProps> = ({
  children,
  initialConfig = {},
}) => {
  const initialState = getInitialPosition();
  
  const [config, setConfig] = React.useState<ToolbarConfig>({
    position: initialState.position,
    orientation: initialState.orientation,
    theme: {},
    buttons: [],
    ...initialConfig,
  });

  const updateConfig = (newConfig: Partial<ToolbarConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <ToolbarContext.Provider value={{ config, updateConfig }}>
      {children}
    </ToolbarContext.Provider>
  );
}; 