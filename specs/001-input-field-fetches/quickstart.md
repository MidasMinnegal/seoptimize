# Quickstart: SEO Analysis & Results Display

**Feature**: 001-input-field-fetches  
**Branch**: `001-input-field-fetches`  
**Last Updated**: 2025-10-26

---

## Purpose

This guide helps developers quickly set up, run, and develop the SEO Analysis & Results Display feature. It covers local environment setup, development workflow, testing, and common troubleshooting.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js**: v18.x or v20.x (required for Next.js 14)
- **npm**: v9.x or higher
- **Git**: For version control
- **Chrome/Chromium**: Required by Puppeteer (auto-installed by puppeteer package)

Verify your environment:

```bash
node --version  # Should be v18.x or v20.x
npm --version   # Should be v9.x+
```

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd seoptimize
```

### 2. Install Dependencies

```bash
npm install
```

This will install:

- Next.js 14.x
- React 18.x
- Puppeteer (includes Chromium)
- isomorphic-dompurify (HTML sanitization)
- Pino (structured logging)
- TypeScript, ESLint, Prettier

### 3. Verify Installation

Run the linter and build:

```bash
npm run lint
npm run build
```

If successful, you're ready to develop!

---

## Running the Feature

### Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at:

- **Local**: http://localhost:3000
- **Network**: http://[your-ip]:3000

### Test the SEO Analysis Feature

1. Navigate to http://localhost:3000
2. Enter a URL in the input field (e.g., `https://example.com`)
3. Click "Analyze"
4. Wait for analysis to complete (10-30 seconds)
5. View results on `/results?url=https://example.com`

---

## Key Files & Their Purpose

### API Routes

| File                           | Purpose                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `app/api/analyze-seo/route.ts` | Main SEO analysis endpoint - orchestrates fetching, rendering, sanitization, and analysis |
| `app/api/fetch-url/route.ts`   | (Existing) Simple URL fetch without analysis                                              |

### Pages

| File                   | Purpose                           |
| ---------------------- | --------------------------------- |
| `app/page.tsx`         | Home page with URL input form     |
| `app/results/page.tsx` | SEO analysis results display page |

### Components

| File                                        | Purpose                               |
| ------------------------------------------- | ------------------------------------- |
| `components/seo/url-input-form/index.tsx`   | URL input form with validation        |
| `components/seo/analysis-results/index.tsx` | Container for displaying SEO findings |
| `components/seo/seo-findings/index.tsx`     | Individual finding card component     |
| `components/ui/loading-spinner/index.tsx`   | Loading state indicator               |
| `components/ui/error-message/index.tsx`     | Error display component               |

### Business Logic

| File                                      | Purpose                                                |
| ----------------------------------------- | ------------------------------------------------------ |
| `lib/seo/browser/renderer.ts`             | Puppeteer integration - renders JavaScript-heavy pages |
| `lib/seo/sanitizer.ts`                    | HTML sanitization using isomorphic-dompurify           |
| `lib/seo/analyzers/image-analyzer.ts`     | Analyzes images for missing alt text                   |
| `lib/seo/analyzers/meta-analyzer.ts`      | Analyzes meta tags (title, description, robots)        |
| `lib/seo/analyzers/robots-analyzer.ts`    | Parses robots directives                               |
| `lib/seo/analyzers/content-analyzer.ts`   | Analyzes content quality (word count, headings)        |
| `lib/seo/analyzers/duplicate-analyzer.ts` | Detects duplicate content using rolling hash           |
| `lib/logger/index.ts`                     | Pino logger setup with structured logging              |

### Type Definitions

| File                     | Purpose                                                        |
| ------------------------ | -------------------------------------------------------------- |
| `types/seo/index.ts`     | SEO analysis types (SEOAnalysisResult, SEOFinding, etc.)       |
| `types/seo/analyzers.ts` | Analyzer-specific types (ImageAnalysis, MetaTagAnalysis, etc.) |
| `types/seo/api.ts`       | API request/response types                                     |
| `types/logger/index.ts`  | Logging types                                                  |

---

## Development Workflow

### 1. Create a New Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Follow TDD for critical business logic:

```bash
# 1. Write a failing test
npm test -- --watch lib/seo/analyzers/image-analyzer.test.ts

# 2. Implement the feature
# Edit lib/seo/analyzers/image-analyzer.ts

# 3. Verify test passes
# 4. Refactor if needed
```

### 3. Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- image-analyzer.test.ts

# Run tests in watch mode
npm test -- --watch

# Run E2E tests
npm run test:e2e
```

### 4. Lint & Format

```bash
# Run ESLint
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### 5. Commit Changes

Husky pre-commit hook will automatically:

- Run ESLint on staged files
- Run Prettier on staged files
- Prevent commit if errors found

```bash
git add .
git commit -m "feat: add image analyzer with alt text detection"
```

---

## Testing

### Unit Tests

Located in `__tests__/lib/seo/analyzers/`

**Example**: Testing the image analyzer

```bash
npm test -- image-analyzer.test.ts
```

Key test scenarios:

- Images with missing alt text
- Images with empty alt text
- Images with proper alt text
- Edge cases (no images, malformed HTML)

### Integration Tests

Located in `__tests__/components/` and `__tests__/lib/`

**Example**: Testing the analyze-seo API route

```bash
npm test -- api/analyze-seo
```

### E2E Tests

Located in `__tests__/e2e/`

**Example**: Full user flow

```bash
npm run test:e2e
```

Test scenarios:

- User submits URL → sees loading state → sees results
- Error handling (invalid URL, network failure)
- Results page displays findings correctly

---

## Common Development Tasks

### Add a New SEO Analyzer

1. **Create the analyzer file**: `lib/seo/analyzers/my-analyzer.ts`
2. **Define input/output types**: `types/seo/analyzers.ts`
3. **Write tests**: `__tests__/lib/seo/analyzers/my-analyzer.test.ts`
4. **Implement analyzer logic** (TDD approach)
5. **Integrate into main endpoint**: `app/api/analyze-seo/route.ts`
6. **Update results display**: `components/seo/analysis-results/index.tsx`

### Add a New Finding Category

1. **Update type definitions**: `types/seo/index.ts` (SEOFindingCategory)
2. **Create analyzer** following steps above
3. **Update results UI** to display new category
4. **Add tests** for new category

### Debug Analysis Issues

Enable verbose logging:

```typescript
// In lib/logger/index.ts
const logger = pino({
  level: 'debug', // Change from 'info' to 'debug'
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
})
```

View logs during analysis:

```bash
npm run dev
# Submit URL for analysis
# Check terminal for detailed logs
```

### Test with Different URLs

Use these test URLs for different scenarios:

| URL                                | Test Case            |
| ---------------------------------- | -------------------- |
| `https://example.com`              | Simple static HTML   |
| `https://react.dev`                | JavaScript-heavy SPA |
| `https://invalid-domain-12345.com` | Network failure      |
| `http://localhost:9999`            | Timeout scenario     |

---

## Troubleshooting

### Issue: Puppeteer Fails to Launch

**Symptoms**: `Error: Failed to launch the browser process`

**Solutions**:

1. Install missing dependencies (Linux):
   ```bash
   sudo apt-get install -y chromium-browser
   ```
2. Set executable path manually:
   ```typescript
   // In lib/seo/browser/renderer.ts
   executablePath: '/usr/bin/chromium-browser'
   ```

### Issue: Analysis Times Out

**Symptoms**: Analysis exceeds 30 seconds

**Solutions**:

1. Check target URL response time:
   ```bash
   curl -w "@curl-format.txt" -o /dev/null -s https://target-url.com
   ```
2. Reduce Puppeteer timeout for faster failure
3. Check logs for bottleneck (rendering vs. analysis)

### Issue: HTML Sanitization Removes Valid Content

**Symptoms**: Missing content in analysis results

**Solutions**:

1. Review DOMPurify configuration in `lib/seo/sanitizer.ts`
2. Adjust sanitization rules for specific tags/attributes
3. Check logs for sanitized elements

### Issue: Tests Fail on CI/CD

**Symptoms**: Tests pass locally but fail in CI

**Solutions**:

1. Ensure Puppeteer dependencies are installed in CI:
   ```yaml
   # .github/workflows/test.yml
   - run: sudo apt-get install -y chromium-browser
   ```
2. Set `CI=true` environment variable
3. Use headless mode in tests

---

## Environment Variables

Create a `.env.local` file for local development:

```bash
# Logging
LOG_LEVEL=info           # Options: trace, debug, info, warn, error, fatal

# Puppeteer
PUPPETEER_SKIP_DOWNLOAD=false
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser  # Optional

# Analysis
SEO_ANALYSIS_TIMEOUT=30000  # Milliseconds (30s)
```

---

## Performance Tips

### Optimize Puppeteer Performance

```typescript
// In lib/seo/browser/renderer.ts
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage', // Reduce memory usage
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--disable-software-rasterizer',
  ],
})
```

### Reduce Analysis Time

1. **Limit rendering wait time**: Adjust `waitUntil` option
2. **Skip unnecessary resources**: Block images/fonts if not needed
3. **Cache browser instance**: Reuse browser between requests (advanced)

---

## Documentation References

- **Specification**: [spec.md](./spec.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contract**: [contracts/analyze-seo-contract.md](./contracts/analyze-seo-contract.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Research Findings**: [research.md](./research.md)

---

## Next Steps

After setup, proceed with implementation:

1. **Review the specification**: [spec.md](./spec.md)
2. **Run `/speckit.tasks`**: Generate implementation tasks
3. **Start with Phase 0**: Implement headless browser rendering
4. **Follow TDD**: Write tests before implementation
5. **Commit frequently**: Use conventional commit messages

---

## Getting Help

- **Slack**: #seoptimize-dev
- **Issues**: GitHub Issues with `feature/001-input-field-fetches` label
- **Docs**: All specs in `/specs/001-input-field-fetches/`

---

**Happy coding!**
