import { Toolbar } from './components/Toolbar';
import { ToolbarProvider, useToolbarContext } from './components/ToolbarProvider';
import type { ToolbarConfig } from './types';

export { Toolbar, ToolbarProvider, useToolbarContext };
export type { ToolbarConfig };

// CDN bundle entry
if (typeof window !== 'undefined') {
  const win = window as unknown as Window & {
    Toolbar: {
      Toolbar: typeof Toolbar;
      ToolbarProvider: typeof ToolbarProvider;
    };
  };
  win.Toolbar = {
    Toolbar,
    ToolbarProvider,
  };
} 