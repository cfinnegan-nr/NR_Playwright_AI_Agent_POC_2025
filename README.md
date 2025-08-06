# NetReveal Playwright Test Automation

This project contains Playwright TypeScript automated tests for the NetReveal application, focusing on the Watchlist Manager functionality.

## Project Structure

```
.
├── config/                  # Configuration files
│   └── constants.ts         # Application constants (URLs, credentials)
├── pages/                   # Page Object Models
│   ├── login/
│   │   └── LoginPage.ts     # Login page interactions
│   └── watchlistManager/
│       └── WatchlistManagerPage.ts  # Watchlist Manager page interactions
├── tests/
│   └── ui/
│       └── WLM/
│           └── Lists/
│               └── WLMEUList.spec.ts  # Test for Watchlist Manager EU List
├── utils/                   # Utility functions
│   ├── global-setup.ts      # Global setup for tests
│   ├── global-teardown.ts   # Global teardown for tests
│   └── helpers.ts           # Helper functions for tests
├── test-results/            # Test results and screenshots
├── playwright.config.ts     # Playwright configuration
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## Prerequisites

- Node.js (version 18 or later)
- npm (comes with Node.js)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Install Playwright browsers:
   ```
   npx playwright install
   ```

## Running Tests

### Run all tests

```
npm test
```

### Run UI tests only

```
npm run test:e2e
```

### Run tests with headed browsers

```
npm run test:headed
```

### Run tests in debug mode

```
npm run test:debug
```

## Test Implementation

The main test case (`WLMEUList.spec.ts`) verifies that the "agency rule" hyperlink is present in the "Weighted words rule set" in the Synonyms Rules Manager section of the Watchlist Manager.

The test follows these steps:
1. Navigate to the NetReveal application
2. Login with credentials from constants
3. Click the main menu button
4. Navigate to Watchlist Manager
5. Navigate to Synonyms
6. Navigate to Synonyms Rules Manager
7. Sort the Name column if the "Weighted words rule set" is not visible
8. Click the "Weighted words rule set" hyperlink
9. Verify that the "agency rule" hyperlink is present

## Page Object Model

The project uses the Page Object Model design pattern to improve maintainability and readability:

- `LoginPage`: Handles login functionality
- `WatchlistManagerPage`: Handles Watchlist Manager menu and related pages

## Utilities

The project includes several utility functions:

- `waitForElement`: Wait for an element to be visible
- `retry`: Retry an operation multiple times
- `takeScreenshot`: Take a screenshot with a meaningful name
- `elementExists`: Check if an element exists
- `safeClick`: Safely click on an element with retries

## Error Handling

Error handling is implemented throughout the project:
- Each method in page objects includes try/catch blocks
- Screenshots are taken when errors occur
- Detailed error messages are provided

## Reporting

The project uses Playwright's built-in reporters:
- HTML reporter (outputs to `test-results/html-report`)
- List reporter (console output)
- JUnit reporter (outputs to `test-results/junit-report.xml`)

## Configuration

The Playwright configuration (`playwright.config.ts`) includes:
- Browser configurations (Chrome, Firefox, WebKit, Mobile Chrome)
- Test timeouts and retry settings
- Screenshot and trace options
- Reporter configurations