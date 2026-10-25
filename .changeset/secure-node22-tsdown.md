---
'react-abode': minor
---

Require Node.js >= 22 (Node 20 is end-of-life). Build with tsdown instead of tsup (output file names are unchanged; an additional `dist/index.d.mts` is emitted) and resolve the form-data security advisory in dev dependencies.
