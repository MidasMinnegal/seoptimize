# Feature Specification: SEO URL Analyzer Input

**Feature Branch**: `003-seo-url-input`  
**Created**: 2025-10-26  
**Status**: Draft  
**Input**: User description: "Instead of the content on the landing page, I want to show a text input. This input should accept websites urls. Whenever a website url is inputted in the input, we should fetch this url as html so that we can analyze it and give SEO tips. We dont have to implement this analyzing yet, but we should keep in mind that this is comming in our implementation."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Enter URL for Analysis (Priority: P1)

A user wants to analyze their website for SEO issues. They visit the SEOptimize homepage, enter their website URL, and the system fetches the HTML content in preparation for analysis.

**Why this priority**: This is the core entry point for the entire SEO analysis functionality. Without the ability to input and fetch URLs, no SEO analysis can occur. This is the foundational MVP feature.

**Independent Test**: Can be fully tested by entering a valid URL (e.g., "https://example.com"), submitting it, and verifying that the HTML content is successfully fetched and stored. Delivers immediate value by demonstrating the fetch capability, even before analysis is implemented.

**Acceptance Scenarios**:

1. **Given** I am on the homepage, **When** I see the page, **Then** I should see a prominent URL input field with placeholder text indicating I should enter a website URL
2. **Given** I have entered a valid URL (https://example.com), **When** I submit the URL, **Then** the system should fetch the HTML content from that URL
3. **Given** the URL has been submitted, **When** the fetch is in progress, **Then** I should see a loading indicator
4. **Given** the HTML fetch completes successfully, **When** the response is received, **Then** I should see a success message indicating the URL was fetched
5. **Given** the HTML content has been fetched, **When** I view the result, **Then** the raw HTML should be available for future analysis (stored in component state)

---

### User Story 2 - URL Validation and Error Handling (Priority: P2)

A user may enter invalid URLs or URLs that cannot be fetched. The system should provide clear feedback about what went wrong and guide them to correct their input.

**Why this priority**: Without proper validation and error handling, users will encounter confusing errors and may abandon the tool. This ensures a smooth user experience but can be added after basic functionality works.

**Independent Test**: Can be tested independently by entering various invalid inputs (malformed URLs, unreachable domains, non-http protocols) and verifying appropriate error messages appear for each case.

**Acceptance Scenarios**:

1. **Given** I enter text that is not a valid URL format, **When** I submit, **Then** I should see an error message "Please enter a valid URL (e.g., https://example.com)"
2. **Given** I enter a URL without a protocol (example.com), **When** I submit, **Then** the system should either auto-prepend "https://" or show a validation error
3. **Given** I enter a URL that cannot be reached (network error, 404, etc.), **When** the fetch fails, **Then** I should see an error message explaining the issue
4. **Given** the fetch takes longer than expected, **When** a timeout occurs, **Then** I should see a timeout error message
5. **Given** I have received an error, **When** I view the error message, **Then** the input should remain editable so I can correct it

---

### User Story 3 - Clear and Re-analyze (Priority: P3)

After analyzing a URL, a user wants to analyze a different website without refreshing the page.

**Why this priority**: This improves usability for users analyzing multiple websites but is not critical for the initial MVP. Users can refresh the page as a workaround.

**Independent Test**: Can be tested by successfully fetching one URL, then clicking a "Clear" or "Analyze Another" button, and verifying the form resets to its initial state.

**Acceptance Scenarios**:

1. **Given** I have successfully fetched a URL, **When** the result is displayed, **Then** I should see an option to "Analyze Another URL"
2. **Given** I click "Analyze Another URL", **When** the action completes, **Then** the input field should be cleared and ready for new input
3. **Given** the form has been reset, **When** I view the page, **Then** the previous fetch results should be cleared

---

### Edge Cases

- What happens when a URL redirects (301/302)? Should we follow redirects and analyze the final destination?
- How does the system handle very large HTML responses (>10MB)? Should there be a size limit?
- What happens if the target website blocks the fetch request (CORS, robots.txt, rate limiting)?
- How should the system handle non-HTML responses (PDF, images, API endpoints)?
- What happens when a user submits while a previous fetch is still in progress?
- Should we validate against localhost/internal IPs for security reasons?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST replace the current landing page content with a URL input form
- **FR-002**: System MUST accept text input for website URLs
- **FR-003**: System MUST validate that input is a properly formatted URL before submission
- **FR-004**: System MUST fetch HTML content from the submitted URL
- **FR-005**: System MUST display loading state while fetching URL content
- **FR-006**: System MUST handle and display errors when URL fetch fails
- **FR-007**: System MUST store fetched HTML content in component state for future analysis
- **FR-008**: System MUST display success feedback when URL is successfully fetched
- **FR-009**: System MUST support HTTPS URLs at minimum
- **FR-010**: System MUST handle HTTP URLs [NEEDS CLARIFICATION: Should HTTP be automatically upgraded to HTTPS, or allowed as-is?]
- **FR-011**: System MUST handle URL fetch timeouts [NEEDS CLARIFICATION: What is acceptable timeout duration - 10s, 30s, 60s?]
- **FR-012**: System MUST [NEEDS CLARIFICATION: Should redirects be followed automatically? If yes, what's the max redirect depth?]
- **FR-013**: System MUST [NEEDS CLARIFICATION: Should there be rate limiting on URL submissions to prevent abuse?]

### Non-Functional Requirements

- **NFR-001**: URL input should be the primary focus of the homepage (visually prominent)
- **NFR-002**: Loading states should appear within 100ms of submission to provide immediate feedback
- **NFR-003**: Error messages should be clear, actionable, and user-friendly (avoid technical jargon)
- **NFR-004**: The interface should follow the existing design system (Button component, consistent styling)
- **NFR-005**: Form should be keyboard accessible (Enter key to submit)
- **NFR-006**: Component should follow existing TypeScript strict mode standards

### Key Entities _(include if feature involves data)_

- **URLAnalysisRequest**: Represents a user's request to analyze a URL
  - URL string (the target website)
  - Fetch status (idle, loading, success, error)
  - Error message (if applicable)
  - Timestamp of request
- **FetchedHTML**: Represents the HTML content retrieved from the target URL
  - Raw HTML string
  - Content length
  - Final URL (after redirects, if applicable)
  - Response headers (for future analysis - content-type, etc.)
  - Fetch timestamp

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can successfully enter and submit a URL in under 5 seconds
- **SC-002**: System successfully fetches and stores HTML content from valid URLs with 95%+ success rate
- **SC-003**: Loading indicators appear within 100ms of form submission
- **SC-004**: Error messages clearly communicate the issue in 100% of failure cases
- **SC-005**: Form validation catches invalid URLs before submission in 100% of malformed URL cases

## Technical Architecture Considerations

### Frontend Implementation Notes

The implementation should consider:

1. **URL Fetching Strategy**: Since browser fetch has CORS limitations, we need to decide:
   - Option A: Create a Next.js API route (/api/fetch-url) that performs server-side fetch
   - Option B: Use a CORS proxy service (not recommended for production)
   - Option C: Use Next.js Server Actions for the fetch operation
2. **State Management**: Keep it simple with React useState for:
   - URL input value
   - Loading state
   - Error state
   - Fetched HTML content
   - Success message

3. **Component Structure**:
   - Replace current page.tsx content with URLInputForm component
   - Create reusable TextInput component (or extend existing UI components)
   - Possibly create LoadingSpinner component for loading state

4. **Validation**: Use browser native URL validation or a library like validator.js

### Future Analysis Preparation

The fetched HTML should be stored in a format that makes future SEO analysis easy:

- Raw HTML string should be preserved
- Consider storing response metadata (headers, status code)
- Structure state to easily add "analysis results" field later
- Keep the HTML in memory (not localStorage) for now, but design state shape to support persistence later

## Out of Scope

The following are explicitly **not** part of this specification:

- SEO analysis algorithms and logic (future feature)
- Displaying analysis results (future feature)
- Saving/persisting analysis history (future feature)
- User authentication (future feature)
- Comparing multiple URL analyses (future feature)
- Scheduling recurring analyses (future feature)
- Visual rendering of fetched pages (future feature)

## Questions Requiring Clarification

1. Should HTTP URLs be automatically upgraded to HTTPS, or rejected, or allowed as-is?
2. What should be the maximum timeout for URL fetching? (recommendation: 30 seconds)
3. Should the system follow redirects? If yes, what's the maximum redirect depth? (recommendation: yes, max 5)
4. Should there be a maximum HTML size limit? (recommendation: 10MB)
5. Should localhost/private IP addresses be blocked for security? (recommendation: yes in production)
6. Should the current Header/Footer remain, or should the URL input be a full-page focus?
7. Do we need to handle authentication-required pages, or only public URLs?

## Dependencies

- Next.js 14.x (already in project)
- React 18.x (already in project)
- Existing UI component system (Button, etc.)
- New: Possibly a URL validation library
- New: Potentially a Next.js API route or Server Action for CORS-free fetching

## Risks & Mitigations

| Risk                                  | Impact                           | Mitigation                                                 |
| ------------------------------------- | -------------------------------- | ---------------------------------------------------------- |
| CORS blocking client-side fetches     | High - Core functionality broken | Implement server-side fetch via API route                  |
| Malicious URLs submitted (XSS, etc.)  | High - Security vulnerability    | Sanitize/validate URLs, never render fetched HTML directly |
| Large HTML causing performance issues | Medium - Poor UX                 | Implement size limits and streaming/chunking if needed     |
| Rate limiting from target sites       | Medium - Fetch failures          | Implement respectful rate limiting, user-agent header      |
| Timeout issues on slow sites          | Low - User frustration           | Implement clear timeout with retry option                  |

## Acceptance Checklist

Before this feature is considered complete:

- [ ] URL input field is prominently displayed on homepage
- [ ] Form validates URL format before submission
- [ ] Loading indicator appears during fetch
- [ ] Success message shown when fetch completes
- [ ] Error messages display for all failure scenarios
- [ ] HTML content is successfully stored in component state
- [ ] TypeScript types are defined for all data structures
- [ ] Code follows existing ESLint/Prettier rules
- [ ] Component is tested with valid URLs (e.g., https://example.com)
- [ ] Component is tested with invalid URLs
- [ ] Component is tested with unreachable URLs
- [ ] Keyboard navigation works (Enter to submit)
- [ ] All existing tests still pass
- [ ] No console errors or warnings
