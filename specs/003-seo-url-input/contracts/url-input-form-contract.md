# Component Contract: URLInputForm

## Component Overview

**Component Name**: `URLInputForm`  
**Location**: `components/seo/url-input-form/index.tsx` (suggested)  
**Purpose**: Primary interface for users to submit website URLs for SEO analysis

## Public API

### Props

```typescript
type URLInputFormProps = {
  onFetchComplete?: (data: FetchedHTML) => void
  onFetchError?: (error: FetchError) => void
  className?: string
  autoFocus?: boolean
}
```

**Props Description:**

- `onFetchComplete` (optional): Callback invoked when URL fetch succeeds
  - Receives the `FetchedHTML` data
  - Allows parent components to react to successful fetches
- `onFetchError` (optional): Callback invoked when URL fetch fails
  - Receives the `FetchError` object
  - Allows parent components to handle errors

- `className` (optional): Additional CSS classes for styling
  - Follows existing component pattern from Button/Header/Footer

- `autoFocus` (optional): Whether input should auto-focus on mount
  - Default: `true` (since it's the primary page action)

### State Management

The component manages its own internal state:

```typescript
const [url, setUrl] = useState<string>('')
const [status, setStatus] = useState<FetchStatus>('idle')
const [error, setError] = useState<string | null>(null)
const [fetchedData, setFetchedData] = useState<FetchedHTML | null>(null)
```

**State Responsibilities:**

- URL input value
- Fetch operation status
- Error messages
- Fetched HTML data

**Why self-contained state?**
For MVP, this component owns its state. Future iterations may lift state up for history tracking or persistence.

## Behaviors

### URL Input

**MUST:**

- Render a text input field with type="url"
- Show placeholder text: "Enter website URL (e.g., https://example.com)"
- Update state on every keystroke
- Clear validation errors when user modifies input
- Support keyboard navigation (Tab, Shift+Tab)

**MUST NOT:**

- Submit on every keystroke (only on form submit)
- Modify the URL format while user is typing

### URL Validation

**MUST:**

- Validate URL format before submission
- Show inline error for invalid format
- Prevent submission if validation fails
- Accept both HTTP and HTTPS protocols (pending clarification on HTTP handling)

**Validation Rules:**

- Non-empty string
- Valid URL format (protocol + domain)
- Supported protocol (http/https)
- Not localhost or private IP (pending security requirements)

**Error Messages:**

- Invalid format: "Please enter a valid URL (e.g., https://example.com)"
- Empty value: "Please enter a URL to analyze"
- Unsupported protocol: "Only HTTP and HTTPS URLs are supported"

### Form Submission

**MUST:**

- Trigger on button click OR Enter key press
- Prevent default form submission (no page reload)
- Validate URL before initiating fetch
- Set status to 'loading' immediately
- Disable input and submit button during fetch
- Call API endpoint/Server Action to fetch URL

**MUST NOT:**

- Allow concurrent submissions
- Submit empty or invalid URLs

### Loading State

**MUST:**

- Show loading indicator immediately (<100ms after submission)
- Disable form inputs during loading
- Display loading message: "Fetching website content..."
- Provide visual feedback (spinner or skeleton)

**SHOULD:**

- Show elapsed time for long-running fetches
- Provide option to cancel long-running requests (future enhancement)

### Success State

**MUST:**

- Display success message: "Successfully fetched {url}"
- Store fetched HTML in component state
- Call `onFetchComplete` callback if provided
- Show "Analyze Another URL" button
- Display URL that was fetched

**SHOULD:**

- Show content metadata (size, fetch time)
- Provide visual confirmation (checkmark icon)

### Error State

**MUST:**

- Display user-friendly error message
- Keep URL in input field for easy correction
- Call `onFetchError` callback if provided
- Re-enable form for retry
- Provide actionable guidance

**Error Message Examples:**

- Network error: "Unable to reach {url}. Please check your internet connection and try again."
- Timeout: "The request took too long. Please try again or enter a different URL."
- HTTP 404: "The page at {url} was not found. Please check the URL and try again."
- HTTP 500: "The website encountered an error. Please try again later."
- CORS error: "Unable to access {url}. The website may block analysis tools."
- Invalid response: "The URL didn't return a valid webpage. Please enter a different URL."

### Reset/Clear

**MUST:**

- Provide "Analyze Another URL" button after success
- Clicking reset clears all state back to initial
- Re-enables and focuses the input field

## Integration Points

### API Endpoint

The component will call:

- **Endpoint**: `POST /api/fetch-url`
- **Request**: `{ url: string }`
- **Response**: `{ success: boolean, data?: FetchedHTML, error?: FetchError }`

Alternative: Next.js Server Action

- **Function**: `fetchURL(url: string)`
- **Returns**: `Promise<FetchURLResponse>`

### UI Components

**Dependencies:**

- `Button` component (existing) - for submit and reset buttons
- `LoadingSpinner` component (new) - for loading indicator
- `ErrorDisplay` component (new or inline) - for error messages

## Accessibility Requirements

**MUST:**

- Label input field properly: "Website URL"
- Associate error messages with input via `aria-describedby`
- Announce loading state to screen readers via `aria-live="polite"`
- Announce errors via `aria-live="assertive"`
- Maintain focus management (don't lose focus during state changes)
- Support keyboard-only navigation
- Provide sufficient color contrast for all states

**ARIA Attributes:**

```typescript
<input
  type="url"
  id="website-url"
  aria-label="Website URL"
  aria-describedby={error ? "url-error" : undefined}
  aria-invalid={!!error}
  aria-required="true"
/>
```

## Visual States

### Idle State

```
┌────────────────────────────────────────┐
│ Enter website URL                      │
│ ┌────────────────────────────────────┐ │
│ │ https://example.com                │ │
│ └────────────────────────────────────┘ │
│                                        │
│          [Analyze Website]             │
└────────────────────────────────────────┘
```

### Loading State

```
┌────────────────────────────────────────┐
│ Fetching website content...            │
│ ┌────────────────────────────────────┐ │
│ │ https://example.com         [🔄]   │ │
│ └────────────────────────────────────┘ │
│                                        │
│      [Analyzing...] (disabled)         │
└────────────────────────────────────────┘
```

### Success State

```
┌────────────────────────────────────────┐
│ ✓ Successfully fetched example.com     │
│                                        │
│ Content ready for analysis             │
│                                        │
│       [Analyze Another URL]            │
└────────────────────────────────────────┘
```

### Error State

```
┌────────────────────────────────────────┐
│ ✗ Unable to reach the website          │
│   Please check the URL and try again   │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ https://nonexistent.com            │ │
│ └────────────────────────────────────┘ │
│                                        │
│          [Try Again]                   │
└────────────────────────────────────────┘
```

## Testing Contract

### Unit Tests

**MUST test:**

- URL validation logic
- State transitions (idle → loading → success/error)
- Error message selection based on error type
- Callback invocations (onFetchComplete, onFetchError)
- Form reset functionality

### Integration Tests

**MUST test:**

- Successful URL fetch flow (end-to-end)
- Failed URL fetch flow (network error)
- Form submission via button click
- Form submission via Enter key
- Multiple consecutive submissions

### Manual Test Scenarios

**MUST manually test:**

- Enter valid URL and verify success
- Enter invalid URL and verify error
- Test with slow network (loading state)
- Test with unreachable domain
- Keyboard-only navigation
- Screen reader compatibility

## Performance Contract

**MUST:**

- Loading indicator appears within 100ms of submission
- No UI blocking during fetch operation
- Minimal re-renders (use React.memo if needed)

**SHOULD:**

- Debounce validation if real-time validation is added
- Optimize large HTML storage (consider chunking for very large responses)

## Security Considerations

**MUST:**

- Never render fetched HTML directly (XSS risk)
- Validate and sanitize URL input
- Use server-side fetch to avoid CORS and expose IP issues
- Consider blocking localhost/private IPs in production

**MUST NOT:**

- Allow JavaScript protocol URLs (javascript:)
- Allow data URLs (data:)
- Execute any code from fetched content

## Future Extensions

This contract is designed to support future features:

- **Analysis Display**: Add `analysisResults` prop to show SEO findings
- **History**: Add `onSaveToHistory` callback
- **Comparison**: Support multiple URL inputs side-by-side
- **Scheduling**: Add scheduling options for recurring analysis

## Example Usage

```tsx
// In app/page.tsx
import { URLInputForm } from '@components/seo/url-input-form'

export default function HomePage() {
  const handleFetchComplete = (data: FetchedHTML) => {
    console.log('Fetched:', data.url)
    // Future: trigger SEO analysis
  }

  const handleFetchError = (error: FetchError) => {
    console.error('Fetch failed:', error.type)
    // Future: log to analytics
  }

  return (
    <div className="home-page">
      <h2>Analyze Your Website for SEO</h2>
      <URLInputForm
        onFetchComplete={handleFetchComplete}
        onFetchError={handleFetchError}
        autoFocus={true}
      />
    </div>
  )
}
```

## Breaking Changes

Any changes to the following require a contract update:

- Props interface
- Callback signatures
- Error message formats (if documented elsewhere)
- State transition behavior
- Accessibility attributes

## Version History

- **v1.0** (2025-10-26): Initial contract for MVP
