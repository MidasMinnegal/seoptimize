# Implementation Tasks: SEO URL Input

**Feature Branch**: `003-seo-url-input`  
**Created**: 2025-10-26  
**Status**: Ready for Implementation

## Task Organization

Tasks are organized by implementation phase, with dependencies clearly marked. Each task is tagged with:

- **Task ID**: Sequential identifier (T001, T002, etc.)
- **[P]**: Parallelizable - can be done concurrently with other [P] tasks in same phase
- **[Story]**: Associated user story (US1, US2, US3)

---

## Phase 1: Setup & Prerequisites

Foundation setup tasks that enable all subsequent work.

### 1.1 Project Structure

- [ ] **T001** [P] Create component directory structure at `components/seo/url-input-form/`
- [ ] **T002** [P] Create types directory at `types/seo/` for shared TypeScript types
- [ ] **T003** [P] Create API route directory at `app/api/fetch-url/`

### 1.2 Type Definitions

- [ ] **T004** Create `types/seo/index.ts` with core data types:
  - `FetchStatus` type
  - `URLInputState` type
  - `FetchedHTML` type
  - `ValidationError` and `ValidationErrorCode` types
  - `FetchError` and `FetchErrorType` types
  - `FetchURLRequest` type
  - `FetchURLResponse` type

**Dependencies**: T002

---

## Phase 2: Foundational Components

Reusable components needed by the main form.

### 2.1 Loading Indicator

- [ ] **T005** [P] [US1] Create `components/ui/loading-spinner/index.tsx`
  - Visual spinner component
  - Accessible with `aria-label` and `role="status"`
  - Matches existing UI design system

### 2.2 Error Display

- [ ] **T006** [P] [US2] Create `components/ui/error-message/index.tsx`
  - Displays error messages with icon
  - Supports `aria-live="assertive"` for screen readers
  - Accepts `message` and optional `details` props
  - Matches existing UI design system

**Dependencies**: None (can run in parallel)

---

## Phase 3: User Story 1 - Enter URL for Analysis (P1)

Core URL input and fetch functionality.

### 3.1 URL Validation

- [ ] **T007** [US1] Create validation utility at `lib/seo/url-validator.ts`
  - Implement `validateURL(url: string)` function
  - Return validation result with error code if invalid
  - Check for empty value, invalid format, protocol requirements
  - Export validation error messages

**Dependencies**: T004

### 3.2 API Endpoint for URL Fetching

- [ ] **T008** [US1] Create `app/api/fetch-url/route.ts` (Next.js API route)
  - Accept POST requests with `{ url: string }`
  - Validate URL server-side using validation utility
  - Implement server-side fetch with:
    - 30-second timeout
    - Follow redirects (max 5)
    - 10MB size limit
    - Block localhost/private IPs in production
  - Return `FetchURLResponse` with `FetchedHTML` or `FetchError`
  - Handle all error types: network, timeout, HTTP errors, CORS, invalid response, size exceeded

**Dependencies**: T004, T007

### 3.3 URLInputForm Component - Basic Structure

- [ ] **T009** [US1] Create `components/seo/url-input-form/index.tsx` with:
  - Component skeleton with props interface
  - Internal state management (url, status, error, fetchedData)
  - Initial "idle" state rendering

**Dependencies**: T001, T004

### 3.4 URLInputForm Component - Input Field

- [ ] **T010** [US1] Implement URL input field in `components/seo/url-input-form/index.tsx`
  - Text input with type="url"
  - Placeholder text
  - Auto-focus on mount
  - onChange handler to update state
  - Clear validation errors on input change
  - Proper ARIA attributes (aria-label, aria-required)

**Dependencies**: T009

### 3.5 URLInputForm Component - Form Submission

- [ ] **T011** [US1] Implement form submission logic in `components/seo/url-input-form/index.tsx`
  - Submit button using existing Button component
  - Handle both button click and Enter key press
  - Prevent default form behavior
  - Client-side validation before submission
  - Disable form during loading state
  - Call API endpoint on valid submission

**Dependencies**: T007, T008, T010

### 3.6 URLInputForm Component - Loading State

- [ ] **T012** [US1] Implement loading state in `components/seo/url-input-form/index.tsx`
  - Show LoadingSpinner component
  - Display "Fetching website content..." message
  - Disable input and button
  - Add `aria-live="polite"` announcement

**Dependencies**: T005, T011

### 3.7 URLInputForm Component - Success State

- [ ] **T013** [US1] Implement success state in `components/seo/url-input-form/index.tsx`
  - Display success message with fetched URL
  - Store fetched HTML in component state
  - Call `onFetchComplete` callback if provided
  - Show "Analyze Another URL" button for reset
  - Display checkmark icon or visual confirmation

**Dependencies**: T011

### 3.8 Landing Page Integration

- [ ] **T014** [US1] Replace content in `app/page.tsx`
  - Remove existing placeholder content
  - Import and render URLInputForm component
  - Add heading: "Analyze Your Website for SEO"
  - Keep existing Header/Footer (pending clarification)
  - Apply appropriate layout styling

**Dependencies**: T013

---

## Phase 4: User Story 2 - URL Validation and Error Handling (P2)

Enhanced error handling and user feedback.

### 4.1 Client-Side Validation

- [ ] **T015** [US2] Enhance validation in `components/seo/url-input-form/index.tsx`
  - Validate on form submission before API call
  - Show inline validation errors
  - Implement all validation error codes:
    - INVALID_FORMAT
    - MISSING_PROTOCOL
    - UNSUPPORTED_PROTOCOL
    - LOCALHOST_BLOCKED (production only)
    - PRIVATE_IP (production only)
    - EMPTY_VALUE

**Dependencies**: T007, T011

### 4.2 Error State Display

- [ ] **T016** [US2] Implement error state in `components/seo/url-input-form/index.tsx`
  - Use ErrorMessage component to display errors
  - Map FetchError types to user-friendly messages
  - Keep URL in input for easy correction
  - Re-enable form for retry
  - Add `aria-live="assertive"` for errors
  - Add `aria-invalid` and `aria-describedby` to input

**Dependencies**: T006, T011

### 4.3 Error Type Handling

- [ ] **T017** [US2] Implement specific error messages for each FetchError type
  - NETWORK_ERROR: "Unable to reach {url}. Please check your internet connection and try again."
  - TIMEOUT: "The request took too long. Please try again or enter a different URL."
  - HTTP_ERROR: Map status codes to friendly messages (404, 500, etc.)
  - CORS_ERROR: "Unable to access {url}. The website may block analysis tools."
  - INVALID_RESPONSE: "The URL didn't return a valid webpage. Please enter a different URL."
  - SIZE_EXCEEDED: "The webpage is too large to analyze."
  - UNKNOWN: "An unexpected error occurred. Please try again."

**Dependencies**: T016

### 4.4 Callback Integration

- [ ] **T018** [US2] Implement error callback in `components/seo/url-input-form/index.tsx`
  - Call `onFetchError` callback when errors occur
  - Pass complete FetchError object to callback

**Dependencies**: T016

---

## Phase 5: User Story 3 - Clear and Re-analyze (P3)

Form reset and multiple analysis support.

### 5.1 Reset Functionality

- [ ] **T019** [US3] Implement reset function in `components/seo/url-input-form/index.tsx`
  - Create `handleReset` function
  - Clear all state back to initial values
  - Re-enable and focus input field

**Dependencies**: T013

### 5.2 Reset UI

- [ ] **T020** [US3] Add "Analyze Another URL" button in success state
  - Button appears after successful fetch
  - Triggers reset function on click
  - Uses existing Button component
  - Clear, prominent placement

**Dependencies**: T019

---

## Phase 6: Polish & Cross-Cutting Concerns

Final touches for production readiness.

### 6.1 Accessibility Audit

- [ ] **T021** [P] Verify all accessibility requirements:
  - Keyboard navigation (Tab, Shift+Tab, Enter)
  - Screen reader compatibility
  - ARIA labels and live regions
  - Focus management across state transitions
  - Color contrast for all states
  - Test with keyboard-only navigation
  - Test with screen reader (VoiceOver/NVDA)

**Dependencies**: T014, T016, T020

### 6.2 TypeScript & Linting

- [ ] **T022** [P] Ensure TypeScript strict mode compliance:
  - No TypeScript errors
  - No ESLint warnings
  - No Prettier formatting issues
  - Run pre-commit hooks successfully

**Dependencies**: T014, T016, T020

### 6.3 Performance Optimization

- [ ] **T023** [P] Verify performance requirements:
  - Loading indicator appears <100ms after submission
  - No UI blocking during fetch
  - Minimal re-renders (consider React.memo if needed)
  - Test with slow network conditions

**Dependencies**: T014

### 6.4 Security Review

- [ ] **T024** [P] Security checklist:
  - Verify fetched HTML is never rendered directly
  - Confirm URL sanitization/validation
  - Test localhost/private IP blocking in production
  - Verify no JavaScript/data protocol URLs accepted
  - Review server-side fetch implementation for SSRF vulnerabilities

**Dependencies**: T008, T015

---

## Phase 7: Testing & Validation

Comprehensive testing before feature completion.

### 7.1 Manual Testing

- [ ] **T025** [US1] Test successful URL fetch flow:
  - Enter https://example.com
  - Verify loading state appears
  - Verify success message and data stored
  - Verify callbacks are invoked

- [ ] **T026** [US2] Test validation error scenarios:
  - Empty input
  - Invalid URL format
  - Missing protocol
  - Unsupported protocol (ftp://, javascript:, data:)

- [ ] **T027** [US2] Test fetch error scenarios:
  - Network error (unreachable domain)
  - Timeout (slow-responding site)
  - HTTP 404 error
  - HTTP 500 error
  - Non-HTML response

- [ ] **T028** [US3] Test reset functionality:
  - Successful fetch → Analyze Another URL → form resets
  - Error state → Analyze Another URL → form resets

- [ ] **T029** Test keyboard navigation:
  - Tab through all interactive elements
  - Submit form with Enter key
  - Verify focus management

- [ ] **T030** Test edge cases:
  - Submit while fetch in progress (should be disabled)
  - Very long URLs
  - URLs with special characters
  - Redirected URLs (301/302)
  - Large HTML responses (near 10MB limit)

**Dependencies**: All previous tasks

### 7.2 Final Checklist

- [ ] **T031** Complete acceptance checklist from spec.md:
  - [ ] URL input field prominently displayed on homepage
  - [ ] Form validates URL format before submission
  - [ ] Loading indicator appears during fetch
  - [ ] Success message shown when fetch completes
  - [ ] Error messages display for all failure scenarios
  - [ ] HTML content successfully stored in component state
  - [ ] TypeScript types defined for all data structures
  - [ ] Code follows ESLint/Prettier rules
  - [ ] Tested with valid URLs
  - [ ] Tested with invalid URLs
  - [ ] Tested with unreachable URLs
  - [ ] Keyboard navigation works
  - [ ] All existing tests still pass
  - [ ] No console errors or warnings

**Dependencies**: T025-T030

---

## Parallel Execution Opportunities

Tasks that can be executed concurrently:

**Batch 1** (Phase 1):

- T001, T002, T003 (directory structure setup)

**Batch 2** (Phase 2):

- T005, T006 (UI components)

**Batch 3** (Phase 6):

- T021, T022, T023, T024 (all polish tasks after core implementation)

---

## Dependency Graph

```
T001, T002, T003 (Setup)
    ↓
T004 (Types)
    ↓
T005, T006, T007 (Foundational + Validation)
    ↓
T008 (API Endpoint)
    ↓
T009 (Component Skeleton)
    ↓
T010 (Input Field)
    ↓
T011 (Form Submission) ──→ T012 (Loading State)
    ↓                          ↓
T013 (Success State) ──────────┘
    ↓
T014 (Landing Page Integration)
    ↓
T015 (Enhanced Validation)
    ↓
T016 (Error Display)
    ↓
T017 (Error Messages)
    ↓
T018 (Error Callbacks)
    ↓
T019 (Reset Function)
    ↓
T020 (Reset UI)
    ↓
T021, T022, T023, T024 (Polish - parallel)
    ↓
T025-T030 (Testing)
    ↓
T031 (Final Checklist)
```

---

## Estimated Complexity

- **Setup & Types** (T001-T004): ~30 minutes
- **Foundational Components** (T005-T006): ~45 minutes
- **Core Form** (T007-T014): ~3-4 hours
- **Error Handling** (T015-T018): ~1.5 hours
- **Reset Functionality** (T019-T020): ~30 minutes
- **Polish** (T021-T024): ~1 hour
- **Testing** (T025-T031): ~1.5 hours

**Total Estimated Time**: ~8-9 hours

---

## Notes

1. **No Test Files**: Per project patterns, unit tests are not included in initial implementation. Testing is manual via acceptance scenarios.

2. **Clarifications Needed**: The following items from spec.md require decisions before implementation:
   - Header/Footer retention on landing page (affects T014)
   - HTTP URL handling strategy (affects T007, T008)
   - Production environment detection for localhost/private IP blocking (affects T008, T015)

3. **Future Extensibility**: The data model and component structure are designed to easily support future SEO analysis features without breaking changes.

4. **Security First**: Tasks T008, T015, and T024 include critical security considerations. These should not be skipped or rushed.

---

## Success Criteria

Feature is complete when:

- ✅ All tasks T001-T031 are checked off
- ✅ All acceptance scenarios from spec.md pass
- ✅ All items in final checklist (T031) are verified
- ✅ Code passes TypeScript, ESLint, and Prettier checks
- ✅ Manual testing confirms all user stories work as specified
