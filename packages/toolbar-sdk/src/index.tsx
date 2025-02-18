import { Toolbar } from './components/Toolbar';
import { ToolbarProvider, useToolbarContext } from './components/ToolbarProvider';
import type { ToolbarConfig } from './types';

export { Toolbar, ToolbarProvider, useToolbarContext };
export type { ToolbarConfig };

// CDN bundle entry
if (typeof window !== 'undefined') {
  (window as any).Toolbar = {
    Toolbar,
    ToolbarProvider,
  };
} 