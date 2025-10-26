# Tasks: Next.js TypeScript Project with Minimal Code Style

**Feature Branch**: `002-nextjs-ts-minimal-lint`  
**Input**: Design documents from `/specs/002-nextjs-ts-minimal-lint/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are OUT OF SCOPE for this feature (explicitly deferred to separate testing feature)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Next.js project with basic structure

- [ ] T001 Initialize Next.js 14.x project with TypeScript template using create-next-app
- [ ] T002 Install core dependencies: next@14.x, react@18.x, typescript@5.x
- [ ] T003 [P] Install code quality dependencies: eslint@8.x, prettier@3.x, eslint-config-next, eslint-config-prettier
- [ ] T004 [P] Install workflow dependencies: husky@8.x, lint-staged@15.x
- [ ] T005 [P] Install ESLint plugins: @typescript-eslint/parser, @typescript-eslint/eslint-plugin, eslint-plugin-simple-import-sort
- [ ] T006 Create base directory structure: components/ui/, lib/utils/, lib/hooks/, types/

**Checkpoint**: Project initialized with all dependencies installed

---

## Phase 2: Foundational Configuration (Blocking Prerequisites)

**Purpose**: Core configuration that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Configure tsconfig.json with strict mode and path aliases (@/, @components, @lib, @types) per research.md
- [ ] T008 Configure .eslintrc.json with Next.js baseline and minimal style rules per research.md
- [ ] T009 [P] Configure .prettierrc with minimal formatting rules (no semi, single quotes, etc.) per research.md
- [ ] T010 [P] Create .prettierignore file excluding node_modules, .next, build artifacts
- [ ] T011 Configure next.config.js for Next.js 14.x App Router
- [ ] T012 [P] Setup Husky pre-commit hooks in .husky/pre-commit
- [ ] T013 [P] Configure lint-staged in package.json for auto-fix and re-staging workflow
- [ ] T014 Add npm scripts to package.json: dev, build, start, lint, format, type-check
- [ ] T015 Create .vscode/settings.json for format-on-save and editor integration
- [ ] T016 Create .gitignore with Next.js patterns, node_modules, .env files
- [ ] T017 Create app/globals.css with basic CSS reset and minimal global styles

**Checkpoint**: Foundation ready - all configuration complete, user story implementation can now begin

---

## Phase 3: User Story 1 - Project Foundation Setup (Priority: P1) 🎯 MVP

**Goal**: Deliver a functioning Next.js application with TypeScript, example components, and a landing page

**Independent Test**: Run development server, verify TypeScript compiles with strict mode, view landing page with Header, Footer, Button components

### Implementation for User Story 1

- [ ] T018 [P] [US1] Create Button component in components/ui/button/index.tsx with ButtonProps interface per button-contract.md
- [ ] T019 [P] [US1] Create Header component in components/ui/header/index.tsx with HeaderProps interface per header-contract.md
- [ ] T020 [P] [US1] Create Footer component in components/ui/footer/index.tsx with FooterProps interface per footer-contract.md
- [ ] T021 [US1] Create app/layout.tsx root layout with metadata, Header, Footer composition using path aliases
- [ ] T022 [US1] Create app/page.tsx landing page demonstrating Button usage and TypeScript patterns
- [ ] T023 [US1] Add basic CSS styling for Button component (variants: primary, secondary, outline; sizes: small, medium, large)
- [ ] T024 [US1] Add basic CSS styling for Header component (layout, navigation)
- [ ] T025 [US1] Add basic CSS styling for Footer component (layout, copyright, links)
- [ ] T026 [US1] Verify all components use minimal code style (no semicolons, destructured props, template literals)
- [ ] T027 [US1] Verify all imports use path aliases (@components, @lib, @types) correctly
- [ ] T028 [US1] Run type-check script and fix any TypeScript strict mode errors
- [ ] T029 [US1] Test development server starts successfully (< 5s per performance goal)
- [ ] T030 [US1] Verify landing page renders with all components visible and functional

**Checkpoint**: User Story 1 complete - functioning application with example components

---

## Phase 4: User Story 2 - Code Quality Enforcement (Priority: P2)

**Goal**: Automated linting enforcing minimal code style with auto-fix capabilities

**Independent Test**: Create files with style violations (semicolons, verbose syntax), run linter, verify auto-fix works

### Implementation for User Story 2

- [ ] T031 [US2] Verify ESLint rules enforce no semicolons (semi: ["error", "never"])
- [ ] T032 [US2] Verify ESLint rules enforce single quotes (quotes: ["error", "single"])
- [ ] T033 [US2] Verify ESLint rules enforce modern patterns (prefer-const, prefer-template, object-shorthand)
- [ ] T034 [US2] Verify ESLint rules enforce import sorting (simple-import-sort plugin)
- [ ] T035 [US2] Verify ESLint warns on console statements in production (no-console with allow: warn/error)
- [ ] T036 [US2] Run lint script on all project files and fix any violations
- [ ] T037 [US2] Test Prettier auto-formats files with minimal style (no semi, single quotes, 100 char width)
- [ ] T038 [US2] Create sample file with violations, run format script, verify auto-fix works
- [ ] T039 [US2] Verify all existing code (components, pages, layout) passes lint checks with zero warnings
- [ ] T040 [US2] Document linting rules and code style philosophy in project README or docs

**Checkpoint**: User Story 2 complete - linting configured and enforced across codebase

---

## Phase 5: User Story 3 - Development Workflow Integration (Priority: P3)

**Goal**: Automated linting and formatting during development and pre-commit

**Independent Test**: Trigger file save, git commit with violations, verify auto-fix and workflow

### Implementation for User Story 3

- [ ] T041 [US3] Test VS Code format-on-save with .vscode/settings.json configuration
- [ ] T042 [US3] Create file with style violations, save in editor, verify auto-format on save
- [ ] T043 [US3] Test pre-commit hook: create file with violations, attempt commit
- [ ] T044 [US3] Verify pre-commit hook auto-fixes violations and re-stages files
- [ ] T045 [US3] Verify pre-commit hook aborts commit with informative message requiring review
- [ ] T046 [US3] Review auto-fixed changes using git diff, re-commit successfully
- [ ] T047 [US3] Verify pre-commit hook execution time is < 10s for typical changesets
- [ ] T048 [US3] Test --no-verify flag allows bypassing hooks in emergency situations
- [ ] T049 [US3] Document pre-commit workflow in quickstart.md or development guide
- [ ] T050 [US3] Document troubleshooting steps for common linting/formatting issues

**Checkpoint**: User Story 3 complete - all workflow automation functional

---

## Phase 6: Polish & Validation

**Purpose**: Final validation and documentation

- [ ] T051 [P] Verify all Success Criteria from spec.md are met (SC-001 through SC-011)
- [ ] T052 [P] Verify TypeScript compilation with strict mode passes with zero errors
- [ ] T053 [P] Verify lint checks pass with zero warnings across all files
- [ ] T054 [P] Verify build command succeeds and generates optimized production bundle
- [ ] T055 Verify initial bundle size < 200KB gzipped per constitutional constraint
- [ ] T056 [P] Test development server start time is < 5s per performance goal
- [ ] T057 [P] Test TypeScript compilation time is < 10s per performance goal
- [ ] T058 [P] Test lint execution time is < 10s per performance goal
- [ ] T059 Create README.md with project overview, setup instructions, development commands
- [ ] T060 Create or update quickstart.md with development workflow guide per plan.md
- [ ] T061 Verify all path aliases work in both development and production builds
- [ ] T062 Verify all component imports use clean pattern (e.g., @components/ui/button)
- [ ] T063 Update AGENTS.md with final technology stack summary if needed
- [ ] T064 Final smoke test: fresh clone, npm install, npm run dev, verify everything works

**Checkpoint**: Feature complete and ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) completion - Can run parallel to US1 if multi-team
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) completion - Can run parallel to US1/US2 if multi-team
- **Polish (Phase 6)**: Depends on all user stories (Phases 3-5) being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - Creates example components
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Validates US1 components against style rules
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses US1 components for workflow testing

### Within Each User Story

**User Story 1:**

- T018-T020 (Components) can run in parallel - different files
- T021 (Layout) depends on T018-T020 (uses components)
- T022 (Page) depends on T018-T020 (uses components)
- T023-T025 (Styling) can run in parallel - different components
- T026-T030 (Validation) run after implementation complete

**User Story 2:**

- T031-T035 (Rule verification) can run in parallel - different rule categories
- T036 (Lint run) depends on rules configured
- T037-T039 (Testing) sequential - build on each other
- T040 (Documentation) can run in parallel with testing

**User Story 3:**

- T041-T042 (Editor) can run in parallel
- T043-T046 (Pre-commit) sequential - testing workflow steps
- T047-T050 (Documentation/Testing) can run in parallel

### Parallel Opportunities

```bash
# Phase 1 - Setup (parallel package installs):
T003, T004, T005 can all run together

# Phase 2 - Foundational (parallel config):
T009, T010, T012, T013 can run in parallel

# Phase 3 - User Story 1 (parallel component creation):
T018, T019, T020 can run in parallel
T023, T024, T025 can run in parallel

# Phase 4 - User Story 2 (parallel rule verification):
T031, T032, T033, T034, T035 can run in parallel

# Phase 6 - Polish (parallel validation):
T051, T052, T053, T054, T056, T057, T058 can run in parallel
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test application runs, components render, TypeScript compiles
5. Ready for basic demo/preview

### Incremental Delivery

1. Setup + Foundational → Configuration complete ✅
2. Add User Story 1 → Functional app with examples ✅ (MVP!)
3. Add User Story 2 → Code quality enforced ✅
4. Add User Story 3 → Workflow automated ✅
5. Polish → Production ready ✅

### Single Developer Strategy (Sequential)

1. Complete Phases 1-2 (Setup + Foundational)
2. Complete Phase 3 (User Story 1) - Get working app
3. Complete Phase 4 (User Story 2) - Add quality enforcement
4. Complete Phase 5 (User Story 3) - Automate workflow
5. Complete Phase 6 (Polish) - Final validation

### Multi-Developer Strategy (Parallel)

1. Team completes Phases 1-2 together (Setup + Foundational)
2. Once Foundational complete:
   - Developer A: Phase 3 (User Story 1 - Components)
   - Developer B: Phase 4 (User Story 2 - Linting setup verification)
   - Developer C: Phase 5 (User Story 3 - Workflow testing)
3. Integrate and validate together
4. Team completes Phase 6 (Polish) together

---

## Validation Checklist

Before marking feature complete, verify:

- [ ] Development server starts in < 5s
- [ ] TypeScript compiles with strict mode, zero errors
- [ ] All files pass lint checks, zero warnings
- [ ] Landing page renders with Header, Footer, Button components
- [ ] All components demonstrate minimal code style
- [ ] Path aliases work correctly in imports
- [ ] Pre-commit hooks auto-fix and abort correctly
- [ ] Format-on-save works in supported editors
- [ ] Build succeeds, bundle < 200KB gzipped
- [ ] All 11 Success Criteria (SC-001 to SC-011) from spec.md verified
- [ ] Documentation complete (README, quickstart)
- [ ] Fresh clone test passes

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Tests are OUT OF SCOPE - no test tasks included per specification
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate progress
- Foundational phase MUST complete before any component work begins
- All components must follow contracts in contracts/ directory
- Minimal code style must be enforced: no semicolons, single quotes, destructured props, template literals
- Path aliases (@/, @components, @lib, @types) must be used consistently
