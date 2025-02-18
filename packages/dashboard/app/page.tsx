import { ToolbarDemo } from './components/ToolbarDemo';

export default function HomePage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Toolbar SDK Demo</h1>
        <div className="prose dark:prose-invert">
          <h2>Features</h2>
          <ul>
            <li>Draggable toolbar that snaps to 9 hotspots on the screen</li>
            <li>Automatic orientation change based on position</li>
            <li>Smooth animations and transitions</li>
            <li>Hover to expand, shows all actions</li>
          </ul>

          <h2 className="mt-8">Try it out</h2>
          <p>
            The toolbar is visible in the bottom right corner. Try:
          </p>
          <ul>
            <li>Hover over the toolbar to see it expand</li>
            <li>Drag it to different positions on the screen</li>
            <li>Notice how it snaps to predefined hotspots</li>
            <li>See how the orientation changes based on position</li>
          </ul>
        </div>
      </div>
      <ToolbarDemo />
    </div>
  );
} 