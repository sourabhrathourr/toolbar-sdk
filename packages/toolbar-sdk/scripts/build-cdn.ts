import { build } from 'esbuild';
import { join } from 'path';

async function buildCDN() {
  try {
    await build({
      entryPoints: [join(__dirname, '../src/index.tsx')],
      bundle: true,
      minify: true,
      format: 'iife',
      globalName: 'Toolbar',
      outfile: join(__dirname, '../dist/toolbar.min.js'),
      external: ['react', 'react-dom'],
      define: {
        'process.env.NODE_ENV': '"production"',
      },
    });
    console.log('CDN build completed successfully');
  } catch (error) {
    console.error('CDN build failed:', error);
    process.exit(1);
  }
}

buildCDN(); 