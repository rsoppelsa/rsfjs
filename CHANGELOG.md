# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
