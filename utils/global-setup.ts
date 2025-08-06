/**
 * Global setup file for Playwright tests
 * Runs once before all tests
 * 
 * @see https://playwright.dev/docs/test-advanced#global-setup-and-teardown
 */
import { chromium, FullConfig } from '@playwright/test';

/**
 * Setup function that runs before all tests
 * Can be used to set up global state, create shared resources, etc.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  console.log('Starting global setup...');
  
  try {
    // Example of setting up something global
    // Can be used for setting up authentication state, etc.
    const browser = await chromium.launch({ headless: true });
    
    // Log setup completion
    console.log('Global setup completed successfully');
    
    // Close the browser after setup
    await browser.close();
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;