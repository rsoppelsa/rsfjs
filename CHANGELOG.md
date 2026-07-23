# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.1] - 2026-07-23

### Changed

- Rebuilt the minified artifacts with a pinned toolchain. No source or behaviour
  change: the files are a few bytes smaller only because a newer terser drops
  redundant parentheses.

### Fixed

- Builds are now reproducible. `terser` was a caret range and `package-lock.json`
  was gitignored, so nothing pinned the tool producing the committed `.min.js`
  files - and with no local install, `npm run minify` silently fell through to an
  apt-installed terser on `PATH`. Pinned exactly, lockfile committed.

## [1.1.0] - 2026-07-23

### Added

- `State` in `rsf-static.js`, so `createStatic` can render components that use
  state. Previously `new r.State(...)` threw `r.State is not a constructor`,
  which made any real component unrenderable server-side.
- `noscript` in the tag lists of both `rsf.js` and `rsf-static.js`, giving
  `r.noscript()` alongside the existing `r.elem('noscript', ...)`.
- Node tests for `rsf-static.js` (`npm test`, or `node --test tests/`). The
  browser examples in `tests/index.html` are unchanged.

### Notes

- Static `State` mirrors the browser API, except that `set()` updates the value
  without notifying: static output is a single pass, so nothing can re-render.
  Components that change state while rendering therefore produce the same markup
  in both environments; only reactivity is absent.
- No breaking changes. Both additions are new surface - `createStatic` previously
  threw on state rather than behaving differently.

## [1.0.0] - 2025-12-06

### Added
- Core RSF framework with reactive state management
- Support for all standard HTML elements as helper methods
- `r.State` class for reactive state with `get()`, `set()`, and `update()` methods
- `watch` attribute for reactive DOM updates
- Custom element support via `r.elem()` method
- `addTags` option for registering custom HTML tags
- Event handling with automatic binding
- Inline styling with object notation (camelCase to kebab-case conversion)
- String-based styling support
- Boolean attribute handling
- Raw HTML rendering with `html` attribute
- Conditional rendering support using JavaScript conditionals
- List rendering using JavaScript loops
- Component composition via functions
- Custom state comparators for complex objects
- Debug mode for state tracking
- Server-side static HTML generation (`rsf-static.js`)
- HTML to RSF converter utility (`renderHtmlToRsf.js`)
- `renderReactive` helper for self-contained reactive components
- `select.js` helper utility
- UMD module support (Browser, ES Modules, CommonJS, AMD)
- Comprehensive documentation and examples
- Example applications in `/tests` directory:
  - Hello World
  - Counter
  - Todo List
  - Form handling
  - Data fetching
  - Filtering/Search
  - HTML Converter tool

### Features
- Zero dependencies
- No build step required
- Tiny footprint (single file)
- DOM-based state tracking
- Minimal re-rendering (only watched elements update)
- Browser-friendly (ES5/ES6 compatible)
- Direct DOM manipulation (no virtual DOM)

[unreleased]: https://github.com/rsoppelsa/rsfjs/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/rsoppelsa/rsfjs/releases/tag/v1.0.0
