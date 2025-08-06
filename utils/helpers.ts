/**
 * Helper functions for test automation
 * Contains utility methods for common operations
 */
import { Page, Locator, expect } from '@playwright/test';
import { TIMEOUTS } from '../config/constants';

/**
 * Base class for page objects
 */
export class BasePage {
  readonly page: Page;

  /**
   * Creates an instance of BasePage
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   * @param url - URL to navigate to
   */
  async navigateTo(url: string): Promise<void> {
    try {
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: TIMEOUTS.LONG
      });
    } catch (error) {
      console.error(`Navigation to ${url} failed: ${error}`);
      throw new Error(`Failed to navigate to ${url}: ${error}`);
    }
  }

  /**
   * Maximize browser window
   */
  async maximizeWindow(): Promise<void> {
    try {
      await this.page.setViewportSize({ width: 1920, height: 1080 });
    } catch (error) {
      console.error(`Failed to maximize window: ${error}`);
      throw new Error(`Failed to maximize window: ${error}`);
    }
  }
}

/**
 * Wait for an element to be visible with a custom timeout
 * @param locator - Playwright Locator object
 * @param timeoutMs - Timeout in milliseconds (defaults to MEDIUM timeout)
 */
export async function waitForElement(
  locator: Locator, 
  timeoutMs: number = TIMEOUTS.MEDIUM
): Promise<void> {
  try {
    await locator.waitFor({ state: 'visible', timeout: timeoutMs });
  } catch (error) {
    console.error(`Element wait timed out: ${error}`);
    throw new Error(`Element wait timed out: ${error}`);
  }
}

/**
 * Retry an operation multiple times until it succeeds
 * @param operation - Function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param delayMs - Delay between retries in milliseconds
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Retry attempt ${attempt}/${maxRetries} failed: ${error}`);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw new Error(`Operation failed after ${maxRetries} attempts. Last error: ${lastError}`);
}

/**
 * Take a screenshot with a meaningful name
 * @param page - Playwright Page object
 * @param testName - Name of the test
 * @param screenshotName - Name of the screenshot
 */
export async function takeScreenshot(
  page: Page,
  testName: string,
  screenshotName: string
): Promise<void> {
  try {
    await page.screenshot({
      path: `./test-results/screenshots/${testName}-${screenshotName}-${Date.now()}.png`,
      fullPage: true
    });
  } catch (error) {
    console.error(`Failed to take screenshot: ${error}`);
  }
}

/**
 * Check if an element exists in the DOM
 * @param locator - Playwright Locator object
 * @param timeoutMs - Optional timeout in milliseconds
 * @returns True if element exists, false otherwise
 */
export async function elementExists(
  locator: Locator,
  timeoutMs: number = 5000
): Promise<boolean> {
  try {
    await locator.waitFor({ state: 'attached', timeout: timeoutMs });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Safely click on an element with retries
 * @param locator - Playwright Locator object
 * @param options - Click options
 */
export async function safeClick(
  locator: Locator,
  options?: { force?: boolean; timeout?: number }
): Promise<void> {
  const timeout = options?.timeout || TIMEOUTS.MEDIUM;
  
  await retry(async () => {
    await waitForElement(locator, timeout);
    await locator.click({ force: options?.force, timeout });
  });
}