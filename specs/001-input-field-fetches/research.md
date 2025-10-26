# Research Findings: SEO Analysis & Results Display

**Feature**: 001-input-field-fetches  
**Date**: 2025-10-26  
**Status**: Complete

## Overview

This document consolidates research findings for key technical decisions required to implement the SEO analysis feature. All decisions prioritize free/open-source software, Next.js 14 compatibility, and production-ready solutions.

---

## 1. Headless Browser: Puppeteer vs Playwright

### Decision: **Puppeteer**

### Rationale

Puppeteer is the optimal choice for server-side JavaScript rendering in our Next.js SEO analysis tool because:

1. **Perfect fit for use case**: SEO analysis only requires rendering in Chromium/Chrome (Google's indexing engine) - we don't need WebKit or Firefox support
2. **Lighter resource footprint**: 170MB download vs 600MB for Playwright (bundles 3 browsers)
3. **More mature ecosystem**: 92.7k GitHub stars, 7+ years of production use, larger community
4. **Better for server-side API routes**: Lower memory overhead (~300-400MB per instance) is critical for Next.js API routes handling concurrent requests
5. **No controversial patching**: Uses standard Chromium without modifications (Playwright patches Firefox/WebKit)
6. **Sufficient for SEO**: Google uses Chromium for indexing, so Chrome covers 95%+ of SEO scenarios
7. **Apache 2.0 License**: Fully free and open-source

### Alternatives Considered

**Playwright**:

- **Pros**: Cross-browser testing (Chromium, Firefox, WebKit), more modern API conveniences, better device emulation
- **Cons**: Heavier installation (600MB), unnecessary browsers for SEO use case, larger memory footprint, controversial browser patching
- **Why rejected**: Overkill for single-browser SEO analysis; extra browsers add complexity without benefit

### Implementation Notes

1. **Use singleton pattern** for browser instances in API routes (reuse across requests)
2. **Set aggressive timeouts** to prevent hanging requests (30s max)
3. **Memory management**: Always close pages after use, reuse browser instance
4. **Configuration**:
   ```typescript
   await page.goto(url, {
     waitUntil: 'networkidle2',
     timeout: 30000,
   })
   ```
5. **Error handling**: Implement graceful browser restart on crashes
6. **API route config**: Set `maxDuration = 30` and `dynamic = 'force-dynamic'`

**Dependencies**: `puppeteer` (Apache 2.0 License)

---

## 2. Structured Logging: Winston vs Pino vs Bunyan

### Decision: **Pino**

### Rationale

Pino is the best logging library for our Next.js 14 App Router application because:

1. **Performance**: 5x faster than alternatives - critical for production server-side logging that won't impact response times
2. **Next.js ecosystem fit**: Native integration with modern Node.js frameworks, widely used in production Next.js apps
3. **TypeScript native**: Excellent TypeScript support out of the box - matches our TypeScript 5.x setup
4. **Structured JSON logging**: Built for structured logs from the ground up (not retrofitted like Winston)
5. **Active maintenance**: Heavily maintained, battle-tested in production environments
6. **App Router compatible**: Works seamlessly with Next.js 14 server components and API routes
7. **MIT License**: Free and open-source

### Alternatives Considered

**Winston**:

- **Pros**: Most popular (12.2M downloads/week), familiar API, extensive plugin ecosystem
- **Cons**: Slower performance, configuration complexity, not purpose-built for modern async/await patterns
- **Why rejected**: Overkill for most Next.js apps; performance overhead not justified

**Bunyan**:

- **Pros**: Good performance, mature, similar to Pino
- **Cons**: Maintenance concerns (fewer updates), falling behind Pino in adoption
- **Why rejected**: Pino has better momentum and active development

**Roarr**:

- **Pros**: Minimalist, modern
- **Cons**: Less adoption, smaller ecosystem
- **Why rejected**: Too niche; prefer battle-tested solution

### Implementation Approach

1. **Install**: `pino` + `pino-pretty` (dev-only for readable local logs)
2. **Create logger instance** in `lib/logger/index.ts` with environment-based config
3. **Use in API routes** for request/response logging (analysis start/complete/fail, timing metrics)
4. **Configure log levels**: `info` (normal ops), `warn` (issues), `error` (failures)
5. **Production**: JSON output → stream to monitoring service (future: Datadog, CloudWatch, etc.)
6. **Development**: Pretty-printed human-readable logs via `pino-pretty`

**Key Features**:

- Structured JSON output for machine parsing
- Log levels: trace, debug, info, warn, error, fatal
- Child loggers for request correlation
- Serializers for error objects
- Redaction for sensitive data

**Dependencies**: `pino`, `pino-pretty` (MIT License)

---

## 3. HTML Sanitization: DOMPurify vs sanitize-html

### Decision: **isomorphic-dompurify**

### Rationale

isomorphic-dompurify provides the best balance of security, maintenance, and ease of use for server-side Next.js applications because:

1. **Best security**: Built on DOMPurify, the industry-leading XSS sanitizer maintained by security experts at Cure53
2. **Zero configuration**: Works out of the box in Next.js without manual jsdom setup (wrapper handles boilerplate)
3. **Actively maintained**: Latest release Oct 2025 (tracks DOMPurify closely)
4. **TypeScript ready**: Built-in type definitions
5. **Perfect for Next.js**: Designed specifically for isomorphic/SSR applications
6. **Future-proof**: Automatically benefits from DOMPurify security updates
7. **Same API everywhere**: Identical code for server and client (if needed)
8. **MIT License**: Free and open-source

### Alternatives Considered

**DOMPurify + jsdom (manual setup)**:

- **Pros**: Same security as isomorphic-dompurify, industry standard
- **Cons**: Requires manual boilerplate setup, more configuration
- **Why rejected**: isomorphic-dompurify eliminates boilerplate without compromising security

**sanitize-html**:

- **Pros**: Node.js native (no jsdom), smaller bundle (~20KB), Edge Runtime compatible
- **Cons**: Not security-focused by design (built for content cleanup, not XSS prevention), parser-based approach may miss DOM-specific attack vectors, less frequent security updates
- **Why rejected**: Security is paramount for processing untrusted HTML; DOMPurify's security-first approach is non-negotiable

**xss (js-xss)**:

- **Pros**: Lightweight, simple whitelist configuration
- **Cons**: Stale maintenance (last update March 2024), 70 open issues, not maintained by security experts
- **Why rejected**: Outdated and poorly maintained; not recommended for new projects

### Security Considerations

1. **Always sanitize server-side**: Never trust client-side sanitization
2. **Keep dependencies updated**: jsdom <20.0.0 has known XSS vulnerabilities; isomorphic-dompurify requires jsdom@^27.0.1
3. **Restrictive configuration**:
   ```typescript
   const clean = DOMPurify.sanitize(html, {
     USE_PROFILES: { html: true },
     ALLOWED_TAGS: ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'img'],
     ALLOWED_ATTR: ['src', 'alt'],
   })
   ```
4. **Additional precautions**: URL validation before fetching, rate limiting, timeout limits, Content-Type verification

**Bundle Size**: ~578KB (DOMPurify + jsdom) - acceptable for server-side API routes (not sent to client)

**Dependencies**: `isomorphic-dompurify` (MIT License)

---

## 4. Duplicate Content Detection Algorithm

### Decision: **Simple Sliding Window with Rolling Hash (Rabin-Karp approach)**

### Rationale

A simplified Rabin-Karp algorithm with polynomial rolling hash is optimal for exact duplicate detection within a single page because:

1. **Simplicity**: Easy to implement and understand (critical for MVP)
2. **Performance**: O(n) average time complexity, O(1) window updates - handles 1000+ words easily (<10ms)
3. **Exact matches**: SEO duplicate detection needs exact matches, not fuzzy similarity
4. **Proven**: Well-documented algorithm with clear use case (plagiarism detection)
5. **No dependencies**: Can implement without heavy npm packages
6. **Memory efficient**: Only stores hash values, not full text blocks (O(n) space)

### Alternatives Considered

**Similarity algorithms (Dice's Coefficient, Levenshtein Distance, Cosine Similarity)**:

- **Pros**: Detect near-duplicates, handle paraphrasing
- **Cons**: Overkill for exact duplicate detection, more complex implementation
- **Why rejected**: SEO analysis needs exact duplicates (50%+ threshold); fuzzy matching adds unnecessary complexity

**W-Shingling (N-gram approach)**:

- **Pros**: Standard for near-duplicate detection, used in plagiarism detection
- **Cons**: More complex, better for cross-document comparison
- **Why rejected**: Single-page analysis doesn't require sophisticated shingling; rolling hash is simpler

**FastCDC (Content-Defined Chunking)**:

- **Pros**: 10x faster than Rabin-based approaches, used in backup software
- **Cons**: Optimized for file chunking, not necessary for single-page text analysis
- **Why rejected**: Over-engineered for our use case; sliding window is sufficient

**Existing npm packages** (`near-dup-detection`, `string-similarity-js`):

- **Pros**: Pre-built solutions
- **Cons**: Outdated (last updated 2014), not actively maintained, add dependencies
- **Why rejected**: No mature, actively-maintained package for within-page duplicate detection; custom implementation is straightforward

### Implementation Approach

**Algorithm Steps**:

1. **Pre-processing**:
   - Parse HTML and extract text content
   - Filter out `<nav>`, `<header>`, `<footer>`, `<aside>` elements (boilerplate exclusion)
   - Exclude heading tags (`<h1>`-`<h6>`)
   - Normalize whitespace (collapse multiple spaces)
   - Split into words

2. **Window Configuration**:
   - Window size: **50 words** (~250 characters) - balances sensitivity and false positives
   - Minimum block for duplication: 50 words
   - Hash function: Polynomial rolling hash
     ```
     H = (c1 * a^(k-1) + c2 * a^(k-2) + ... + ck) mod p
     where a = 256, p = large prime (e.g., 101)
     ```

3. **Sliding Window Scan**:
   - Initialize: Compute hash for first 50-word window
   - Store hash in Map: `{ hash → [positions] }`
   - Slide window by 1 word:
     - Remove first word (subtract `c1 * a^49`)
     - Multiply by `a` (shift left)
     - Add new word
     - Update hash (constant time O(1))
   - Check if hash exists in Map:
     - If yes: Potential duplicate found
     - If no: Add to Map with current position

4. **Duplicate Verification**:
   - On hash collision, do character-by-character comparison
   - Confirms true duplicate (vs. hash collision)
   - Track duplicate positions and text

5. **Calculate Percentage**:
   - Total content words: N
   - Duplicate words: D (sum of all duplicate blocks)
   - Percentage: `(D / N) * 100`
   - **Flag if > 50%** (per specification)

6. **Return Results**:
   ```typescript
   {
     isDuplicate: boolean,
     percentage: number,
     duplicateBlocks: [{ text: string, positions: number[] }]
   }
   ```

### Edge Cases Handling

| Edge Case                              | Solution                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------- |
| **Repeated headings**                  | Exclude `<h1>`-`<h6>` tags during text extraction                          |
| **Navigation/menus**                   | DOM filtering: Skip `<nav>`, `<header>`, `<footer>`, `<aside>` elements    |
| **Short repeated phrases** (<50 words) | Automatically filtered by 50-word window size                              |
| **Boilerplate detection**              | Pre-filter structural elements; post-filter consistent-position duplicates |
| **Overlapping duplicates**             | Use Set to track counted positions; don't count same words multiple times  |
| **Hash collisions**                    | Always verify with full text comparison; use large prime modulus           |

### Performance

- **1000 words** with 50-word windows = ~950 hash computations
- **Each window update**: O(1) with rolling hash
- **Total**: O(n) where n = number of words
- **Memory**: O(n) for hash storage
- **Expected runtime**: < 10ms for 1000-word page

**Data Structures**:

- `Map<number, number[]>`: hash → array of word positions
- `Set<number>`: word positions already counted as duplicates (avoid double-counting)

**Dependencies**: None (custom implementation)

---

## Summary of Decisions

| Component               | Decision              | License    | Rationale                                                   |
| ----------------------- | --------------------- | ---------- | ----------------------------------------------------------- |
| **Headless Browser**    | Puppeteer             | Apache 2.0 | Lighter, mature, sufficient for SEO (Chrome only)           |
| **Structured Logging**  | Pino                  | MIT        | 5x faster, TypeScript native, Next.js ecosystem fit         |
| **HTML Sanitization**   | isomorphic-dompurify  | MIT        | Best security (DOMPurify), zero config, actively maintained |
| **Duplicate Detection** | Custom (Rolling Hash) | N/A        | Simple, performant, no dependencies needed                  |

All technologies are **free and open-source** as required.

---

## Next Steps

Proceed to **Phase 1: Design & Contracts** to:

1. Generate `data-model.md` with entity definitions
2. Create API contracts in `contracts/` directory
3. Generate `quickstart.md` for developer onboarding
4. Update agent context with new technologies
