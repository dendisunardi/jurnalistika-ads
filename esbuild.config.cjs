const { build } = require('esbuild');
const path = require('path');
const fs = require('fs');

const externals = [
  '@babel/core',
  'fsevents',
  'lightningcss',
  'express',
  'drizzle-orm',
  '@neondatabase/serverless',
  'pg',
  'connect-pg-simple',
  '@vercel/blob',
  '@uppy/core',
  '@uppy/dashboard',
  '@uppy/aws-s3',
  '@uppy/xhr-upload',
  '@uppy/react',
  '@google-cloud/storage',
];

// Find the root directory by looking for package.json
let currentDir = process.cwd();
while (!fs.existsSync(path.join(currentDir, 'package.json')) && currentDir !== '/') {
  currentDir = path.dirname(currentDir);
}

const entryPoint = path.resolve(currentDir, 'server', 'index.ts');
const outdir = path.resolve(currentDir, 'dist');

console.log(`Current working directory: ${process.cwd()}`);
console.log(`Root directory: ${currentDir}`);
console.log(`Building with entry point: ${entryPoint}`);
console.log(`Output directory: ${outdir}`);
console.log(`Entry point exists: ${fs.existsSync(entryPoint)}`);

build({
  entryPoints: [entryPoint],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: ['es2020'],
  external: externals,
  outdir: outdir,
  loader: {
    '.ts': 'ts',
    '.js': 'js',
  },
}).then(() => {
  console.log('Build completed successfully');
}).catch(err => {
  console.error('Build error:', err);
  process.exit(1);
});
