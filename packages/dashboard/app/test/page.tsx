'use client';

import { Toolbar } from '@betterstacks/toolbar-sdk';
import { MessageCircle, Sparkles, Settings, FileText, Mail } from 'lucide-react';

export default function TestPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Toolbar SDK Demo</h1>

        <div className="grid grid-cols-2 gap-8">
          {/* Default Toolbar */}
          {/* <div>
            <h2 className="text-lg font-semibold mb-4">Default Toolbar</h2>
            <Toolbar />
          </div> */}

          {/* Custom Toolbar with more buttons */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Custom Toolbar</h2>
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
        </div>
      </div>
    </div>
  );
}
