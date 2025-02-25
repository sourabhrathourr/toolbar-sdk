'use client';

import dynamic from 'next/dynamic';
import { MessageCircle, Sparkles, Settings, FileText, Mail, HelpCircle } from 'lucide-react';
import type { ToolbarProps } from '../../../toolbar-sdk/src/types';

// Dynamically import Toolbar with SSR disabled
const Toolbar = dynamic<ToolbarProps>(
  () => import('../../../toolbar-sdk/src/components/Toolbar').then(mod => mod.Toolbar),
  { ssr: false }
);

export function ToolbarDemo() {
  return (
    <div>
      <Toolbar
        buttons={[
          {
            id: 'ai',
            icon: <Sparkles size={16} />,
            tooltip: 'AI Assistant',
            onClick: () => console.log('AI clicked'),
            pinned: true, // This button will always be visible in the collapsed state
          },
          {
            id: 'chat',
            icon: <MessageCircle size={16} />,
            tooltip: 'Chat',
            onClick: () => console.log('Chat clicked'),
            pinned: true,
          },
          {
            id: 'settings',
            icon: <Settings size={16} />,
            tooltip: 'Settings',
            onClick: () => console.log('Settings clicked'),
            // Not pinned by default, will only show when expanded
          },
          {
            id: 'docs',
            icon: <FileText size={16} />,
            tooltip: 'Documentation',
            onClick: () => console.log('Docs clicked'),
            // Not pinned by default, will only show when expanded
          },
          {
            id: 'mail',
            icon: <Mail size={16} />,
            tooltip: 'Send Email',
            onClick: () => console.log('Mail clicked'),
            // Not pinned by default, will only show when expanded
          },
          {
            id: 'help',
            icon: <HelpCircle size={16} />,
            tooltip: 'Help',
            onClick: () => console.log('Help clicked'),
            // Not pinned by default, will only show when expanded
          },
        ]}
        defaultIcon={<Sparkles size={16} />} // This is used only if there are no pinned buttons
      />
      
      {/* 
        Toolbar Features:
        1. Pinned buttons are always visible in the collapsed state
        2. Right-click on any button to toggle its pinned state
        3. Pinned state is persisted in localStorage
        4. Toolbar expands on hover to show all buttons
        5. Toolbar can be dragged to any position on the screen
      */}
    </div>
  );
}
