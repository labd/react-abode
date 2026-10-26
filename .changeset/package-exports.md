---
'react-abode': minor
---

Add an `exports` map (ESM `dist/index.mjs` and CommonJS `dist/index.js`, each with its own type declarations), `"type": "commonjs"` and `"sideEffects": false`. Deep imports into `dist/` are no longer possible; import from `react-abode` instead.
