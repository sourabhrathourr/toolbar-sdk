import { ReactNode } from 'react';

export enum ActionButtonsType {
  Annotation = 'annotation',
  Comment = 'comment',
  Summarize = 'summarize'
}

export interface ToolbarButton {
  id: string;
  icon: ReactNode;
  tooltip: string;
  onClick: () => void;
  pinned?: boolean;
}

export interface Position {
  x: string | number;
  y: string | number;
}

export interface Hotspot {
  x: string | number;
  y: string | number;
  orientation: 'horizontal' | 'vertical';
}

export interface ToolbarConfig {
  position?: Position;
  orientation?: 'horizontal' | 'vertical';
  theme?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
  };
  buttons?: ToolbarButton[];
  defaultIcon?: ReactNode;
}

export interface ToolbarProps extends ToolbarConfig {
  className?: string;
} 