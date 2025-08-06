import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright configuration for NetReveal test automation
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Directory where test files are located
  testDir: './tests',
  
  // Maximum time one test can run for
  timeout: 60000,
  
  // Run tests in files in parallel
  fullyParallel: false,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : 1, // Fixed: Using explicit value instead of undefined
  
  // Reporter to use - fixed output folder clash issue
  reporter: [
    ['html', { outputFolder: './test-output/html-report' }],
    ['list'],
    ['junit', { outputFile: './test-output/junit-report.xml' }]
  ],

  // Global setup for the tests
  globalSetup: './utils/global-setup.ts',
  
  // Global teardown for the tests
  globalTeardown: './utils/global-teardown.ts',

  // Shared settings for all the projects
  use: {
    // Base URL to use in navigation - updated to match constants.ts
    baseURL: 'https://10.222.17.231:8443',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'on-first-retry',
    
    // Viewport dimensions
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors for self-signed certificates
    ignoreHTTPSErrors: true,
    
    // Collect test coverage
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Configure projects for Chromium browser only as per requirements
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--disable-web-security',
            '--no-sandbox',
            '--disable-gpu',
            '--ignore-certificate-errors',  // Additional flag for SSL errors
          ],
        },
      },
    },
  ],

  // Output directory for test reports - changed to avoid conflict with html reporter
  outputDir: './test-results/',
});