import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  // Keep the file names referenced by package.json (main/module/typings):
  // dist/index.js (cjs), dist/index.mjs (esm), dist/index.d.ts
  fixedExtension: false,
  // Same syntax level tsup 6 emitted by default (node14 ~ es2020)
  target: 'es2020',
  platform: 'neutral',
});
