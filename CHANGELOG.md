## 2.2.0

### Minor Changes

- [#32](https://github.com/labd/react-abode/pull/32) [`68499be`](https://github.com/labd/react-abode/commit/68499bea93c4681387e4afc7439f5c6c68a662c0) Thanks [@mvantellingen](https://github.com/mvantellingen)! - Add an `exports` map (ESM `dist/index.mjs` and CommonJS `dist/index.js`, each with its own type declarations), `"type": "commonjs"` and `"sideEffects": false`. Deep imports into `dist/` are no longer possible; import from `react-abode` instead.

- [#30](https://github.com/labd/react-abode/pull/30) [`840242c`](https://github.com/labd/react-abode/commit/840242c276f3bb16ef9fa108d2b0094fde2f71bc) Thanks [@mvantellingen](https://github.com/mvantellingen)! - Require Node.js >= 22 (Node 20 is end-of-life). Build with tsdown instead of tsup (output file names are unchanged; an additional `dist/index.d.mts` is emitted) and resolve the form-data security advisory in dev dependencies.

### Patch Changes

- [`64887a7`](https://github.com/labd/react-abode/commit/64887a730de1b1965ac78cfd63a3cd968a8fc19f) Thanks [@blurrah](https://github.com/blurrah)! - Fix release process

## 2.0.0 (2022-08-04)

- chore: update to react 18

## 1.1.0 (2022-03-25)

- feature: unmount React components when DOM nodes are removed

## 1.0.0 (2021-06-18)

- feature: Add option for passing custom prop parsers

- fixed: getScriptProps returns props on IE11

- improved: extend example based unit tests
