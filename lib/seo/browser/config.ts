/**
 * Puppeteer browser configuration for SEO analysis
 * Optimized for headless rendering with minimal resource usage
 */

import type { LaunchOptions } from 'puppeteer'

/**
 * Get browser launch options for Puppeteer
 * Configured for headless mode with security and performance optimizations
 */
export function getBrowserConfig(): LaunchOptions {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      // Disable unnecessary features for faster rendering
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      // Memory optimization
      '--single-process',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
    // Set timeout from environment variable
    timeout: Number(process.env.BROWSER_TIMEOUT) || 30000,
    // Disable downloads
    dumpio: !isProduction,
  }
}

/**
 * Get page navigation options
 */
export function getNavigationConfig() {
  return {
    waitUntil: 'networkidle2' as const,
    timeout: Number(process.env.BROWSER_TIMEOUT) || 30000,
  }
}
