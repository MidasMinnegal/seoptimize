# Implementation Plan: SEO Analysis & Results Display

**Branch**: `001-input-field-fetches` | **Date**: 2025-10-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-input-field-fetches/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build an SEO analysis feature that fetches web pages, renders JavaScript content using a headless browser (Puppeteer/Playwright), performs comprehensive SEO analysis (images, meta tags, robots, content quality, duplicate content), and displays organized results on a dedicated results page with URL query parameters. The system will include server-side HTML sanitization for security and implement a scalable structured logging solution for application-wide observability.

## Technical Context

**Language/Version**: TypeScript 5.x (latest stable compatible with Next.js 14), JavaScript ES2022+  
**Primary Dependencies**: Next.js 14.x (App Router), React 18.x, Puppeteer or Playwright (headless browser), DOMPurify (HTML sanitization), structured logging library (e.g., Winston or Pino)  
**Storage**: Session-based storage (no persistent database for MVP)  
**Testing**: Jest, React Testing Library, Playwright for E2E tests  
**Target Platform**: Next.js server-side (Node.js) + browser client  
**Project Type**: Web application (Next.js full-stack)  
**Performance Goals**: Analysis completion within 30 seconds including JavaScript rendering, API routes < 300ms p95 for non-analysis operations  
**Constraints**: < 30s analysis time (including headless browser rendering), results shareable via URL query parameters, re-analyze on page load  
**Scale/Scope**: Single-user synchronous analysis (one URL at a time), supporting pages with up to 100 images without performance degradation

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Pre-Research Evaluation

| Principle                  | Status  | Notes                                                                                              |
| -------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| **Type Safety First**      | ✅ PASS | TypeScript with strict mode, all entities will have explicit types                                 |
| **Component Architecture** | ✅ PASS | Functional components, separation of concerns (analysis logic vs UI presentation)                  |
| **TDD for Critical Paths** | ✅ PASS | SEO analysis is critical business logic - TDD mandatory for analysis functions, API routes         |
| **Performance Budgets**    | ✅ PASS | 30s analysis time acceptable, bundle size monitored, lazy loading for results page                 |
| **UX Consistency**         | ✅ PASS | Will use existing UI components (Button, LoadingSpinner, ErrorMessage), consistent with app design |
| **Code Quality**           | ✅ PASS | ESLint + Prettier already configured, will follow existing conventions                             |

**Gate Status**: ✅ **PASSED** - No violations. Feature aligns with all constitutional principles.

### Complexity Justification

No deviations from constitutional principles required. This feature integrates naturally with existing Next.js architecture and follows all established patterns.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── analyze-seo/
│   │   └── route.ts          # Server-side SEO analysis endpoint (NEW)
│   └── fetch-url/
│       └── route.ts          # Existing URL fetch endpoint
├── results/
│   └── page.tsx              # Results display page (NEW)
├── layout.tsx                # Existing root layout
├── page.tsx                  # Existing home page with URL input
└── globals.css               # Existing global styles

components/
├── seo/
│   ├── url-input-form/       # Existing URL input component
│   ├── analysis-results/
│   │   └── index.tsx         # Results display container (NEW)
│   └── seo-findings/
│       ├── index.tsx         # Individual finding card component (NEW)
│       └── category-section.tsx  # Findings grouped by category (NEW)
└── ui/
    ├── button/               # Existing
    ├── loading-spinner/      # Existing
    ├── error-message/        # Existing
    ├── header/               # Existing
    └── footer/               # Existing

lib/
├── seo/
│   ├── analyzers/
│   │   ├── image-analyzer.ts      # Image alt text analysis (NEW)
│   │   ├── meta-analyzer.ts       # Meta tag analysis (NEW)
│   │   ├── robots-analyzer.ts     # Robots directive analysis (NEW)
│   │   ├── content-analyzer.ts    # Content quality/quantity (NEW)
│   │   └── duplicate-analyzer.ts  # Duplicate content detection (NEW)
│   ├── browser/
│   │   └── renderer.ts       # Headless browser rendering (NEW)
│   ├── sanitizer.ts          # HTML sanitization utility (NEW)
│   └── url-validator.ts      # Existing URL validation
├── logger/
│   ├── index.ts              # Logger setup and configuration (NEW)
│   └── types.ts              # Logger types (NEW)
└── utils/
    └── [existing utilities]

types/
├── seo/
│   └── index.ts              # Existing + NEW analysis types
└── logger/
    └── index.ts              # Logger types (NEW)

__tests__/
├── lib/
│   ├── seo/
│   │   ├── analyzers/
│   │   │   ├── image-analyzer.test.ts   (NEW)
│   │   │   ├── meta-analyzer.test.ts    (NEW)
│   │   │   ├── robots-analyzer.test.ts  (NEW)
│   │   │   ├── content-analyzer.test.ts (NEW)
│   │   │   └── duplicate-analyzer.test.ts (NEW)
│   │   ├── browser/
│   │   │   └── renderer.test.ts         (NEW)
│   │   └── sanitizer.test.ts            (NEW)
│   └── logger/
│       └── logger.test.ts               (NEW)
├── components/
│   └── seo/
│       ├── analysis-results.test.tsx    (NEW)
│       └── seo-findings.test.tsx        (NEW)
└── e2e/
    └── seo-analysis.spec.ts             (NEW)
```

**Structure Decision**: Next.js 14 App Router architecture with clear separation of concerns:

- **API routes** (`app/api/`) handle server-side operations (analysis, fetch)
- **Pages** (`app/`) define routes and layouts
- **Components** (`components/`) organized by domain (seo, ui)
- **Business logic** (`lib/`) contains pure functions for analysis, browser automation, logging
- **Types** (`types/`) centralize TypeScript definitions
- **Tests** (`__tests__/`) mirror source structure for discoverability

## Complexity Tracking

No constitutional violations. This section is not applicable.

---

## Post-Design Constitution Re-Evaluation

_Re-checked after Phase 1 (Design & Contracts) completion on 2025-10-26_

After completing the design phase and generating data models, API contracts, and developer documentation, we re-evaluated compliance with all constitutional principles:

### Final Constitutional Compliance Status

| Principle                  | Status  | Evidence                                                                                                                                                                                                                                                              |
| -------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type Safety First**      | ✅ PASS | All types explicitly defined in `data-model.md` (SEOAnalysisResult, SEOFinding, ImageAnalysis, etc.) with strict TypeScript mode. No `any` types used. Union types and type guards implemented for category-specific details.                                         |
| **Component Architecture** | ✅ PASS | Clean separation: analyzer modules (`lib/seo/analyzers/`), React components (`components/seo/`), API routes (`app/api/`). Functional components with hooks. Single responsibility per analyzer (image, meta, robots, content, duplicate).                             |
| **TDD for Critical Paths** | ✅ PASS | SEO analysis is critical business logic - test files defined for all analyzers (`__tests__/lib/seo/analyzers/*.test.ts`), browser rendering, sanitization, and API routes. E2E tests planned (`__tests__/e2e/seo-analysis.spec.ts`).                                  |
| **Performance Budgets**    | ✅ PASS | 30s timeout enforced (NFR-001). Puppeteer optimized with `--disable-gpu`, `--disable-software-rasterizer`. Rolling hash algorithm O(n) for duplicate detection (<10ms). Results page uses lazy loading. API routes configured with `maxDuration = 30`.                |
| **UX Consistency**         | ✅ PASS | Reuses existing UI components (`LoadingSpinner`, `ErrorMessage`, `Button`). Structured findings with consistent severity levels (critical, warning, info, success) mapped to colors/icons. Error messages are user-friendly (non-technical per NFR-003).              |
| **Code Quality**           | ✅ PASS | All modules follow naming conventions (kebab-case files, PascalCase types, camelCase functions). Pre-commit hooks configured. JSDoc comments planned for public APIs. Analyzers kept focused (<50 lines per function expected). Early returns used in error handling. |

### Technology Alignment with Constitution

| Technology               | Constitutional Principle | Alignment                                                                                                                         |
| ------------------------ | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Puppeteer**            | Performance Budgets      | ✅ Lighter alternative (170MB vs 600MB); singleton pattern for memory efficiency; aggressive timeouts prevent resource exhaustion |
| **Pino**                 | Code Quality             | ✅ TypeScript native; structured JSON logging; 5x faster than Winston; minimal performance impact                                 |
| **isomorphic-dompurify** | Type Safety First        | ✅ Built-in TypeScript definitions; zero configuration; wraps jsdom boilerplate                                                   |
| **Custom Rolling Hash**  | Code Quality             | ✅ No external dependencies; simple implementation (~100 lines); well-documented algorithm (Rabin-Karp)                           |

### Design Decisions Validated

1. **URL Query Parameters Architecture** (`/results?url=example.com`):
   - ✅ **UX Consistency**: Standard web pattern, shareable links, browser history support
   - ✅ **Performance**: Re-analysis on load (stateless) aligns with Next.js App Router SSR patterns

2. **Server-Side HTML Sanitization**:
   - ✅ **Type Safety**: Sanitizer has explicit input/output types (string → string)
   - ✅ **Code Quality**: Security-critical operation isolated in `lib/seo/sanitizer.ts` module

3. **50% Duplicate Content Threshold**:
   - ✅ **TDD**: Clear acceptance criteria for tests (isDuplicate = true if >50%)
   - ✅ **Performance**: Custom algorithm optimized for threshold detection

4. **Headless Browser for JS Rendering**:
   - ✅ **Performance Budgets**: Puppeteer with `waitUntil: 'networkidle2'` balances accuracy and speed
   - ✅ **Component Architecture**: Browser logic isolated in `lib/seo/browser/renderer.ts`

5. **Structured Logging (Pino)**:
   - ✅ **Code Quality**: Request correlation via child loggers; error serializers for debugging
   - ✅ **Performance**: Asynchronous logging prevents blocking API responses

### Complexity Verification

**No constitutional deviations required.** All design decisions align with existing principles:

- **Zero `any` types**: All 15+ entity types explicitly defined with unions and discriminated unions
- **TDD enforced**: 12+ test files planned covering all critical paths (analyzers, API routes, E2E)
- **Performance targets met**: 30s timeout, <10ms duplicate detection, O(n) algorithms
- **Reusable components**: Existing UI components leveraged; new components follow functional patterns
- **Clean architecture**: Clear separation between data fetching, business logic, and presentation

**Gate Status**: ✅ **PASSED** - Design fully compliant with all constitutional principles. Ready to proceed to Phase 2 (Tasks).

---

### Recommendations for Implementation

To maintain constitutional compliance during implementation:

1. **Type Safety**: Enable `strict: true` in `tsconfig.json` before writing code
2. **TDD Workflow**: Write failing tests before implementing each analyzer (`npm test -- --watch`)
3. **Performance Monitoring**: Log execution time for each analyzer to identify bottlenecks
4. **Code Reviews**: Use constitutional checklist in PR template (type safety, tests, performance)
5. **Incremental Validation**: Run `npm run type-check && npm run lint && npm test` before each commit
