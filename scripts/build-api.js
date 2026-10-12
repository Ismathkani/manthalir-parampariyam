import esbuild from 'esbuild';
import fs from 'node:fs';

esbuild.buildSync({
  entryPoints: ['src/server/serverless.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  banner: {
    js: "import { createRequire as __createRequire } from 'module';\nconst require = __createRequire(import.meta.url);"
  },
  outfile: 'api/index.js',
  loader: { '.json': 'json' }
});

fs.copyFileSync('api/index.js', 'api/[...path].js');

console.log('✓ Vercel Serverless API handlers bundled at api/index.js and api/[...path].js');

