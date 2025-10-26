/**
 * Browser Renderer Module
 *
 * Provides headless browser rendering using Puppeteer for JavaScript-heavy pages.
 * Implements singleton pattern for browser instance management.
 */

import puppeteer, { type Browser } from 'puppeteer'

import logger from '@/lib/logger'

import { getBrowserConfig, getNavigationConfig } from './config'

/**
 * Singleton browser instance
 * Reused across multiple render requests for performance
 */
let browserInstance: Browser | null = null

/**
 * Gets or creates the browser instance (singleton pattern)
 *
 * @returns The Puppeteer browser instance
 */
async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance
  }

  logger.info('Launching new browser instance')

  try {
    browserInstance = await puppeteer.launch(getBrowserConfig())
    logger.info('Browser launched successfully')
    return browserInstance
  } catch (error) {
    logger.error('Failed to launch browser', {
      operation: 'getBrowser',
      metadata: { error },
    })
    throw new Error(
      `Failed to launch browser: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Renders a URL using headless browser and returns the fully rendered HTML
 *
 * Waits for network to be idle before capturing content to ensure JavaScript
 * has fully executed and dynamic content has loaded.
 *
 * @param url - The URL to render
 * @returns The fully rendered HTML content
 * @throws Error if rendering fails (invalid URL, timeout, network error, etc.)
 */
export async function renderPage(url: string): Promise<string> {
  const startTime = Date.now()
  const renderLogger = logger.child({ url })

  renderLogger.info('Starting page render')

  let page
  try {
    const browser = await getBrowser()
    page = await browser.newPage()

    // Set viewport for consistent rendering
    await page.setViewport({ width: 1920, height: 1080 })

    renderLogger.debug('Navigating to URL')

    // Navigate to the page and wait for network idle
    await page.goto(url, getNavigationConfig())

    renderLogger.debug('Page loaded, extracting HTML')

    // Get the fully rendered HTML
    const html = await page.content()

    const duration = Date.now() - startTime
    renderLogger.info('Page rendered successfully', {
      operation: 'renderPage',
      url,
      metadata: { duration, htmlLength: html.length },
    })

    return html
  } catch (error) {
    const duration = Date.now() - startTime
    renderLogger.error('Failed to render page', {
      operation: 'renderPage',
      url,
      metadata: { error, duration },
    })

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error(`Page render timeout after ${duration}ms: ${url}`)
      }
      if (error.message.includes('net::ERR')) {
        throw new Error(`Network error while rendering page: ${error.message}`)
      }
      if (error.message.includes('Invalid URL')) {
        throw new Error(`Invalid URL provided: ${url}`)
      }
      throw new Error(`Failed to render page: ${error.message}`)
    }

    throw new Error('Failed to render page: Unknown error')
  } finally {
    // Always close the page to free resources
    if (page) {
      try {
        await page.close()
        renderLogger.debug('Page closed')
      } catch (closeError) {
        renderLogger.warn('Failed to close page', {
          operation: 'renderPage.cleanup',
          url,
          metadata: { error: closeError },
        })
      }
    }
  }
}

/**
 * Closes the browser instance and cleans up resources
 * Safe to call multiple times - will only close if browser is active
 *
 * Should be called on application shutdown or when browser is no longer needed
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance && browserInstance.isConnected()) {
    logger.info('Closing browser instance')
    try {
      await browserInstance.close()
      browserInstance = null
      logger.info('Browser closed successfully')
    } catch (error) {
      logger.error('Failed to close browser', {
        operation: 'closeBrowser',
        metadata: { error },
      })
      // Reset instance even on error to prevent memory leaks
      browserInstance = null
    }
  } else {
    logger.debug('Browser already closed or not initialized')
  }
}
