# WLMAgencyList-FailureTest.spec.ts - Enhanced Error Reporting Documentation

## Overview

The `WLMAgencyList-FailureTest.spec.ts` file demonstrates enhanced error reporting capabilities in Playwright tests. This test is **intentionally designed to fail** to showcase how detailed error messages can help with troubleshooting and debugging.

## Key Features

### 1. Structured Error Messages

Error messages are formatted with clear visual structure:
- Section headers with emoji icons (🔍, 💡, 🔧)
- Visual separators using dashed lines
- Categorized information blocks

Example:
```
🔍 ERROR DETAILS: Agency rule element was not found on the page
------------------------------------------------------------
📄 Current page title: "NetReveal"
🔗 Current URL: https://example.com/watchlist
...
```

### 2. Comprehensive Diagnostics

Error messages include extensive diagnostic information:

#### For Element Not Found Errors:
- Current page title and URL
- Total links found on the page
- Similar elements that might be alternatives
- Page content sample
- Information about the correct element that should have been found
- The selector that was attempted

#### For Visibility Errors:
- Element text content
- Element bounds and dimensions
- Element enabled state
- CSS properties affecting visibility (display, opacity, position, etc.)
- Element coordinates on page

### 3. Root Cause Analysis

Each error message includes:
- Clearly labeled "POSSIBLE CAUSES" section
- Multiple potential reasons for failure
- Indication that this is a demonstration test with intentional failure

### 4. Troubleshooting Guidance

Error messages provide actionable next steps:
- Specific troubleshooting instructions
- Solutions for each potential cause
- Clear guidance on how to fix the intentional error

## Implementation Details

### Error Handling Strategy

The test implements a multi-layered error handling approach:
1. Outer try/catch block for the entire test
2. Inner try/catch for the enhanced assertion function
3. Multiple verification steps with specific error handling for each

### Key Functions

#### `performEnhancedAgencyRuleAssertion()`
- Central function for demonstrating enhanced error reporting
- Performs multiple verification steps:
  1. Element existence check
  2. Element visibility check with retry logic
  3. Element text content verification

#### `getMcpSelector()`
- Intentionally uses incorrect selector for the demonstration
- Uses 'administrative rule' instead of 'agency rule'

### Error Types Demonstrated

1. **Element Not Found**:
   - Triggered when the element doesn't exist on the page
   - Provides context about the page state and similar elements

2. **Element Not Visible**:
   - Triggered when element exists but isn't visible
   - Provides detailed CSS and positioning information

3. **Content Mismatch**:
   - Triggered when element text doesn't match expectations
   - Compares expected vs. actual content

## Usage Guide

### When to Use This Pattern

This enhanced error reporting approach is recommended for:

1. Complex UI tests with multiple potential failure points
2. Tests involving dynamically loaded content
3. Tests that are frequently failing with unclear reasons
4. Tests that other team members need to maintain

### Implementation Steps

To add enhanced error reporting to your own tests:

1. Separate complex assertions into dedicated functions
2. Add try/catch blocks with detailed error message construction
3. Include page state information in error messages
4. Use emoji icons and visual separators for readability
5. Include both diagnostic information and troubleshooting guidance
6. Consider using retry logic for flaky assertions

## Conclusion

This demonstration test shows how proper error reporting can transform cryptic test failures into detailed, actionable diagnostics. By implementing similar patterns in your own tests, you can significantly reduce debugging time and make test maintenance easier for the entire team.