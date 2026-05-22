# Changelog

All notable changes to the `@rbl/validator-ts` package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com), and this project adheres to [Semantic Versioning](https://semver.org).

---

## - 2026-05-22

### Added
- Created a separate `validateSync()` engine method alongside the asynchronous `validate()` method to support instant calculations.
- Introduced specialized framework hooks to optimize performance for heavy network payloads:
  - **React:** `useReactFormValidator` (Sync) and `useReactAsyncFormValidator` (Async).
  - **Vue 3:** `useVueFormValidator` (Sync) and `useVueAsyncFormValidator` (Async).
- Added support for deeply nested object parsing using dot-notation schemas (e.g., `'user.profile.username'`).
- Added full support for asynchronous validation custom rules via an `async/await` execution model.

### Fixed
- Fixed an internal reactivity issue where Vue 3 lazy computed properties were returning incorrect validation states during layout mount phases.
- Corrected a token replacement error in the custom error dictionaries when parsing parameters with colons.

---

## - 2026-05-21

### Added
- Initial official stable release of the `@rbl/validator-ts` library package.
- Built-in pipe parsing pipeline engine supporting standard string rules layout (`required|email|min:5|max:20`).
- Bundled standard core rule blocks: `RequiredRule`, `EmailRule`, `MinRule`, and `MaxRule`.
- Created advanced validation layout features:
  - String short-circuit tracking (`bail`).
  - Dynamic global shortcut runtime registration (`Validator.extend`).
  - Contextual parameter assignment mappings (`:attribute`).
- Formulated custom message override libraries to replace generic engine fallback text.
- Included full automated test suite setups using Vitest under browser-mocked environments.

---

: https://github.com
