/**
 * Global teardown file for Playwright tests
 * Runs once after all tests
 * 
 * @see https://playwright.dev/docs/test-advanced#global-setup-and-teardown
 */
import { FullConfig } from '@playwright/test';

/**
 * Teardown function that runs after all tests
 * Used for cleaning up resources, closing connections, etc.
 */
async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('Starting global teardown...');
  
  try {
    // Example of cleaning up global resources
    // Such as closing database connections, removing temporary files, etc.
    
    // Log teardown completion
    console.log('Global teardown completed successfully');
  } catch (error) {
    console.error('Global teardown failed:', error);
    throw error;
  }
}

export default globalTeardown;