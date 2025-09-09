'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MessageCircle, Sparkles, Settings, FileText, Mail, HelpCircle, Heart } from 'lucide-react';
import type { ToolbarProps } from '@betterstacks/toolbar-sdk';

// Dynamically import Toolbar with SSR disabled
const Toolbar = dynamic<ToolbarProps>(
  () => import('@betterstacks/toolbar-sdk').then(mod => mod.Toolbar),
  { ssr: false }
);

export function ToolbarDemo() {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(42);
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
            id: 'mail',
            icon: <Mail size={16} />,
            tooltip: 'Send Email',
            onClick: () => console.log('Mail clicked'),
            count: 27,
            pinned: true
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
            id: 'like',
            icon: <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : '#60A5FA'} />,
            tooltip: isLiked ? 'Unlike' : 'Like',
            onClick: () => {
              setIsLiked(!isLiked);
              setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
            },
            count: 102,
          },
          {
            id: 'help',
            icon: <HelpCircle size={16} />,
            tooltip: 'Help',
            onClick: () => console.log('Help clicked'),
          },
 
        ]}
        defaultIcon={<Sparkles size={16} />}
        theme={{
          backgroundColor: 'white',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          iconColor: '#60A5FA',
          hoverBackgroundColor: 'rgba(59, 130, 246, 0.15)',
          tooltipBackgroundColor: 'white',
          tooltipTextColor: 'black',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
          badgeBackgroundColor: '#3b82f6',
          badgeTextColor: '#ffffff',
          badgeBorderColor: 'rgba(255, 255, 255, 0.2)',
        }}
      />
    </div>
  );
}
