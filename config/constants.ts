/**
 * Application configuration constants
 * Contains URLs, credentials, and other configuration values
 */
export const NETREVEAL_URL = 'https://10.222.2.239:8443/netreveal/login.do';
export const USERNAME = 'admin';
export const PASSWORD = 'password';

/**
 * Timeout values (in milliseconds)
 */
export const TIMEOUTS = {
  /** Short timeout for quick operations */
  SHORT: 5000,
  /** Medium timeout for standard operations */
  MEDIUM: 15000,
  /** Long timeout for operations that may take longer */
  LONG: 30000,
  /** Extended timeout for operations that might be very slow */
  EXTENDED: 60000
};

/**
 * Navigation paths for menu items
 */
export const NAVIGATION = {
  WATCHLIST_MANAGER: 'Watchlist Manager',
  SYNONYMS: 'Synonyms',
  SYNONYMS_RULES_MANAGER: 'Synonyms Rules Manager',
  LISTS: 'Lists',
  STANDARD_LISTS: 'Standard Lists'
};

/**
 * Test data for assertions
 * Used in initial simple WLM verification tests 
 */
export const TEST_DATA = {
  RULE_SET_NAME: 'Weighted words rule set',
  EXPECTED_TEXT: 'agency rule',
  EU_LIST_NAME: 'EU List',
  EU_NAME_TEXT: 'eu_name'
};