'use client';

import dynamic from 'next/dynamic';
import { MessageCircle, Sparkles, Settings, FileText, Mail, HelpCircle } from 'lucide-react';
import type { ToolbarProps } from '@betterstacks/toolbar-sdk';

// Dynamically import Toolbar with SSR disabled
const Toolbar = dynamic<ToolbarProps>(
  () => import('@betterstacks/toolbar-sdk').then(mod => mod.Toolbar),
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
          },
          {
            id: 'chat',
            icon: <MessageCircle size={16} />,
            tooltip: 'Chat',
            onClick: () => console.log('Chat clicked'),
          },
          {
            id: 'settings',
            icon: <Settings size={16} />,
            tooltip: 'Settings',
            onClick: () => console.log('Settings clicked'),
            pinned: true
          },
          {
            id: 'docs',
            icon: <FileText size={16} />,
            tooltip: 'Documentation',
            onClick: () => console.log('Docs clicked'),
          },
          {
            id: 'mail',
            icon: <Mail size={16} />,
            tooltip: 'Send Email',
            onClick: () => console.log('Mail clicked'),
          },
          {
            id: 'help',
            icon: <HelpCircle size={16} />,
            tooltip: 'Help',
            onClick: () => console.log('Help clicked'),
          },
        ]}
        defaultIcon={<Sparkles size={16} />}
      />
    </div>
  );
}
