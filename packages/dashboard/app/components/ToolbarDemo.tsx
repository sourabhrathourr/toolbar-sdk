'use client';

import dynamic from 'next/dynamic';
import { MessageCircle, Sparkles, Settings, FileText, Mail } from 'lucide-react';
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
        ]}
        defaultIcon={<Sparkles size={16} />}
      />
    </div>
  );
}
