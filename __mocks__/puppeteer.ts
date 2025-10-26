/**
 * Mock for Puppeteer
 * Provides a simplified Puppeteer implementation for testing
 */

const mockHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Example Domain</title>
  <meta name="description" content="Example website for testing">
</head>
<body>
  <h1>Example Domain</h1>
  <p>This domain is for use in illustrative examples in documents.</p>
</body>
</html>`

const mockPage = {
  setViewport: jest.fn().mockResolvedValue(undefined),
  goto: jest.fn().mockImplementation((url: string) => {
    // Simulate different behaviors based on URL
    if (url.includes('thisdoesnotexist.invalid')) {
      return Promise.reject(new Error('net::ERR_NAME_NOT_RESOLVED'))
    }
    if (url.includes('localhost:99999')) {
      return Promise.reject(new Error('net::ERR_CONNECTION_REFUSED'))
    }
    if (url.includes('expired.badssl.com')) {
      return Promise.reject(new Error('net::ERR_CERT_DATE_INVALID'))
    }
    if (url.includes('sleep=60000')) {
      return Promise.reject(new Error('Navigation timeout of 30000 ms exceeded'))
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return Promise.reject(new Error('Invalid URL'))
    }
    return Promise.resolve()
  }),
  content: jest.fn().mockResolvedValue(mockHtml),
  close: jest.fn().mockResolvedValue(undefined),
}

const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn().mockResolvedValue(undefined),
  isConnected: jest.fn().mockReturnValue(true),
}

const puppeteer = {
  launch: jest.fn().mockResolvedValue(mockBrowser),
}

export default puppeteer
