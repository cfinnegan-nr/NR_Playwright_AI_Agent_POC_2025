# AGENT.md

## Project Overview

This project contains Playwright tests written in TypeScript for automating web application testing. Tests include scenarios for user navigation, UI interactions, form submissions, and API endpoint validation.

This project uses connections to a Playwright MCP Server, and other named MCP Servers, to generate the Playwright test automation code.

## Directory Structure

```
.
├── tests/
│   ├── ui/                # End-to-end test scenarios
│   └── api/                # API integration test scenarios
├── pages/                  # Page object models for reusability
├── utils/                  # Utility and helper functions
├── fixtures/               # Test data fixtures
├── test-results/           # Output directory for reports and traces
├── playwright.config.ts    # Playwright configuration
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Key Dependencies

- **Playwright**: Browser automation and cross-browser testing.
- **TypeScript**: Typed superset of JavaScript for robust tests.


## Key Commands

| Command               | Description                         |
| --------------------- | ----------------------------------- |
| `npm install`         | Install all project dependencies    |
| `npm run test`        | Execute all tests                   |
| `npm run test:e2e`    | Execute end-to-end UI tests         |
| `npm run test:api`    | Execute API integration tests       |
| `npm run test:headed` | Run tests with browser UI           |
| `npm run test:debug`  | Debug tests interactively           |
| `npm run lint`        | Run ESLint for static code analysis |

## Best Practices

- Adopt Page Object Model (POM) to improve maintainability.
- Use fixtures for reusable test data and state management.
- Utilize built-in Playwright reporting for easier debugging and analysis.
- Implement comprehensive error handling with try-catch blocks using standard Playwright error handling
- Keep test scenarios modular and independent for easier debugging.
- Include proper test setup and teardown using standard Playwright lifecycle methods
- Use Playwright's native expect assertions with comprehensive validation.
- Implement screenshot capture on test failure using Playwright's built-in screenshot capabilities.
- All element selectors stored in Page Object Model classes after identification by the Playwright MCP Server page analysis.
- No hardcoded values in test file code - all values are from project constant files or Page Object files.
- Ensure that the test code contains a logical assertion to track success or failure of the test case. The outcome of the assertion is presented to the user in the test report in a visually pleasing but plain Englist description and not a syntax error extract description.
- Ensure that the code generates output that can be used in a test report to confirm to external users that the test has been executed successfully, or not.


## MCP Server Integration
- Initiate a connection to the Playwright MCP server within the IDE Code Agent and use the capabilities of the Playwright MCP server during the code generation sessions.
- Before any UI operations, allow the Playwright MCP server to analyze the Page HTML structure. Then perform operations to reduce the fale operation on UI elelments and generate robust selectors.
- Connect to the sequentialthinking MCP server to repeat debugging steps as needed until there are no syntax errors in the test code (one user permission confirmation is sufficient for this session).
- Critical: No runtime dependencies on MCP server - all code must execute with standard Playwright installation


## Code Style

- TypeScript: Strict mode with exactOptionalPropertyTypes, noUncheckedIndexedAccess
- Tabs for indentation (2 spaces for YAML/JSON/MD)
- Single quotes, no semicolons, trailing commas
- Use JSDoc docstrings for documenting TypeScript definitions, not `//` comments
- Add detailed JSDoc comments for all functions and critical logic blocks
- 100 character line limit
- Imports: Use consistent-type-imports
- Use descriptive variable/function names.
- Use async/await pattern throughout with proper error handling.
- In CamelCase names, use "URL" (not "Url"), "API" (not "Api"), "ID" (not "Id")
- Prefer functional programming patterns
- Use TypeScript interfaces for public APIs
- NEVER use `@ts-expect-error` or `@ts-ignore` to suppress type errors


## Security

- Never commit secrets or API keys to repository
- Use environment variables for sensitive data


## How to Maintain

- Add new tests by creating `*.spec.ts` files in `/tests`.
- Refactor frequently used selectors into POM classes in `/pages`.
- Update `playwright.config.ts` for new projects, test parameters, or environments.
- Review and update dependencies periodically:
sh npm install npm outdated



## Troubleshooting

- **Test failures:** Review the logs and screenshots located in the `test-results/` directory.
- **Dependency issues:** Always run `npm install` after fetching or pulling new code.


## Configuration

When adding new configuration options, update all relevant places:
1. Environment variables in `.env.example`
2. Configuration schemas in `src/config/`
3. Documentation in README.md

All configuration keys use consistent naming and MUST be documented.



## Contact Information

- **Automation Lead:** `[ciaran.finnegan@symphonyai.com]`
- **Repository Owner:** `[ciaran.finnegan@symphonyai.com]`

