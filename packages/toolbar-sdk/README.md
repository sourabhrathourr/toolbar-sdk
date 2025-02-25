# @betterstacks/toolbar-sdk

A customizable floating toolbar SDK for React applications. Create a draggable interface with customizable actions that snaps to predefined hotspots on the screen.


## Features

- 🎯 Snap-to-grid with 9 predefined hotspots
- 🔄 Automatic orientation switching (horizontal/vertical)
- 🎨 Customizable actions and icons
- 💾 Persistent position storage
- 🌟 Smooth animations and transitions
- 📱 Responsive and draggable interface
- 🧠 Smart button management with first-button-always-pinned
- 🎭 Simplified single-button display during drag operations
- 📍 Tooltip with directional arrows for better visual connection
- 🔄 Different animation types for expanding (spring) and collapsing (tween)
- ⭕ Circular appearance when only one button is visible

## Installation

```bash
npm install @betterstacks/toolbar-sdk
# or
yarn add @betterstacks/toolbar-sdk
# or
bun add @betterstacks/toolbar-sdk
```

## Quick Start

### React Applications

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

### Next.js Applications

For Next.js applications, you need to use dynamic imports to disable SSR for the toolbar:

```tsx
'use client';

import dynamic from 'next/dynamic';
import type { ToolbarProps, ToolbarButton } from '@betterstacks/toolbar-sdk';

const Toolbar = dynamic<ToolbarProps>(
  () => import('@betterstacks/toolbar-sdk').then(mod => mod.Toolbar),
  { ssr: false }
);

export function MyComponent() {
  return (
    <div>
      <Toolbar />
    </div>
  );
}
```

> **Note**: The toolbar needs to be client-side rendered because it uses browser APIs like `localStorage` and `window`. Using `dynamic` import with `ssr: false` ensures proper functionality in Next.js applications.

## Custom Actions

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

## API Reference

### Toolbar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `buttons` | `ToolbarButton[]` | Default actions | Array of button configurations |
| `defaultIcon` | `ReactNode` | `<Sparkles />` | Icon shown when toolbar is collapsed |
| `className` | `string` | `''` | Additional CSS classes |

### ToolbarButton

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier for the button |
| `icon` | `ReactNode` | Icon component to display |
| `tooltip` | `string` | Tooltip text shown on hover |
| `onClick` | `() => void` | Click handler for the button |
| `pinned` | `boolean` | Whether the button is pinned (visible in collapsed state) |

## Behavior

- The toolbar starts in a collapsed state with the default/first action icon
- Hover to expand and show all actions
- Drag to reposition (simplifies to a single button during drag)
- Automatically snaps to the nearest hotspot
- Persists position between page reloads
- Automatically switches between horizontal/vertical orientation based on position
- First button is always pinned by default
- Displays as a circle when only one button is visible
- Tooltips feature directional arrows that point to their associated buttons

## Requirements

- React 18 or higher
- Modern browser support (uses CSS backdrop-filter)

## Browser Support

- Chrome/Edge ≥ 76
- Firefox ≥ 70
- Safari ≥ 9
- iOS Safari ≥ 9

## Contributing

We welcome contributions! Please see our [contributing guide](https://github.com/sourabhrathourr/toolbar-sdk/blob/main/CONTRIBUTING.md) for details.

## License

MIT © [BetterStacks](https://github.com/sourabhrathourr) 

Visit the demo:
```bash
http://localhost:3000
``` 