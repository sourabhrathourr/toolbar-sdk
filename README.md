# Toolbar SDK Monorepo

This monorepo contains a customizable floating toolbar SDK for web applications and a Next.js demo application. The toolbar provides a draggable interface with customizable actions and snaps to predefined hotspots on the screen.

## Features

- 🎯 Snap-to-grid with 9 predefined hotspots
- 🔄 Automatic orientation switching (horizontal/vertical)
- 🎨 Customizable actions and icons
- 💾 Persistent position storage
- 🌟 Smooth animations and transitions
- 📱 Responsive and draggable interface

## Project Structure

```
toolbar-sdk/
├── packages/
│   ├── toolbar-sdk/     # Core SDK package
│   └── dashboard/       # Demo Next.js application
```

## Getting Started

First, install the dependencies:

```bash
bun install
```

Then, run the development server:

```bash
bun run dev
```

This will start both:
- The SDK in watch mode
- The demo dashboard at [http://localhost:3000/test](http://localhost:3000/test)

## Usage

### Basic Implementation

```tsx
import { Toolbar } from '@betterstacks/toolbar-sdk';

function App() {
  return (
    <div>
      <Toolbar />
    </div>
  );
}
```

### Custom Actions

```tsx
import { Toolbar } from '@betterstacks/toolbar-sdk';
import { Sparkles, MessageCircle, Settings } from 'lucide-react';

function App() {
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
        ]}
        defaultIcon={<Sparkles size={16} />}
      />
    </div>
  );
}
```

## Development

This project uses:
- [Next.js](https://nextjs.org) for the demo application
- [Turbo](https://turbo.build) for monorepo management
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [Framer Motion](https://www.framer.com/motion/) for animations

### Building the SDK

```bash
cd packages/toolbar-sdk
bun run build
```

### Running the Demo

```bash
cd packages/dashboard
bun run dev
```

Visit `http://localhost:3000/test` to see the demo in action.

