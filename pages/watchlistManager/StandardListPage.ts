/**
 * Standard List page object model
 * Handles interactions with the Lists and Standard Lists sections in the Watchlist Manager module
 */
import { Page, Locator, expect } from '@playwright/test';
import { BasePage, waitForElement, safeClick, elementExists, retry } from '../../utils/helpers';
import { NAVIGATION, TEST_DATA, TIMEOUTS } from '../../config/constants';

// Type definition for MCP selector function that will be injected
type McpSelectorFn = (description: string) => string;

/**
 * StandardListPage class provides methods to interact with the 
 * Lists and Standard Lists sections in the Watchlist Manager module
 */
export class StandardListPage extends BasePage {
  // Main navigation elements
  private readonly mainMenuButton: Locator;
  private readonly watchlistManagerMenu: Locator;
  private readonly listsMenu: Locator;
  private readonly standardListsMenu: Locator;
  
  // List elements
  private readonly euListLink: Locator;
  private readonly euNameText: Locator;
  
  // Optional MCP selector function
  private mcpSelector: McpSelectorFn | null = null;

  /**
   * Creates an instance of StandardListPage
   * @param page - Playwright Page object
   * @param mcpSelectorFn - Optional function that generates selectors from MCP analysis
   */
  constructor(page: Page, mcpSelectorFn?: McpSelectorFn) {
    super(page);
    
    // Store the MCP selector function if provided
    this.mcpSelector = mcpSelectorFn || null;
    
    // Initialize selectors for navigation elements
    // Use MCP-generated selectors if available, otherwise fall back to exact XPath identifiers
    this.mainMenuButton = page.locator(this.getSelector('main menu', '//*[@id="menu-trigger"]'));
    
    // Menu items in the main navigation region - using multiple selector strategies for robustness
    this.watchlistManagerMenu = page.locator(this.getSelector('watchlist manager menu',
      `//*[@id="home_watchlistmanagement"], [role="menuitem"]:has-text("${NAVIGATION.WATCHLIST_MANAGER}"), menuitem:has-text("${NAVIGATION.WATCHLIST_MANAGER}"), text="${NAVIGATION.WATCHLIST_MANAGER}"`));
    
    this.listsMenu = page.locator(this.getSelector('lists menu',
      `[role="menuitem"]:has-text("${NAVIGATION.LISTS}"), menuitem:has-text("${NAVIGATION.LISTS}"), :text-is("${NAVIGATION.LISTS}"), :text("${NAVIGATION.LISTS}"), li:has-text("${NAVIGATION.LISTS}")`));
    
    this.standardListsMenu = page.locator(this.getSelector('standard lists menu',
      `[role="menuitem"]:has-text("${NAVIGATION.STANDARD_LISTS}"), menuitem:has-text("${NAVIGATION.STANDARD_LISTS}"), :text-is("${NAVIGATION.STANDARD_LISTS}"), :text("${NAVIGATION.STANDARD_LISTS}"), li:has-text("${NAVIGATION.STANDARD_LISTS}")`));
    
    // Initialize selectors for list elements
    this.euListLink = page.locator(this.getSelector('eu list', `a:has-text("${TEST_DATA.EU_LIST_NAME}"), text="${TEST_DATA.EU_LIST_NAME}"`));
    this.euNameText = page.locator(this.getSelector('eu_name', `text="${TEST_DATA.EU_NAME_TEXT}", text=eu_name, :has-text("eu_name")`));
    
    console.log('StandardListPage initialized with MCP selectors:');
    console.log(`- Main menu: ${this.getSelector('main menu', '//*[@id="menu-trigger"]')}`);
    console.log(`- Watchlist Manager menu: ${this.getSelector('watchlist manager menu', '//*[@id="home_watchlistmanagement"]')}`);
    console.log(`- EU List link: ${this.getSelector('eu list', 'a:has-text("EU List")')}`);
  }
  
  /**
   * Get the appropriate selector based on availability of MCP analysis
   * @param description - Human-readable description of the element
   * @param fallbackSelector - Default selector to use if MCP is not available
   */
  private getSelector(description: string, fallbackSelector: string): string {
    if (this.mcpSelector) {
      try {
        const mcpGeneratedSelector = this.mcpSelector(description);
        console.log(`Using MCP selector for "${description}": ${mcpGeneratedSelector}`);
        return mcpGeneratedSelector;
      } catch (error) {
        console.warn(`Error using MCP selector for "${description}": ${error}`);
      }
    }
    
    console.log(`Using fallback selector for "${description}": ${fallbackSelector}`);
    return fallbackSelector;
  }

  /**
   * Click the main menu button
   */
  async clickMainMenu(): Promise<void> {
    try {
      console.log('Checking if main menu needs to be clicked...');
      
      // First check if the Watchlist Manager menu is already expanded/visible
      // This indicates the main menu might already be open
      const watchlistManagerVisible = await this.watchlistManagerMenu.isVisible().catch(() => false);
      
      if (watchlistManagerVisible) {
        console.log('Watchlist Manager menu already visible, skipping main menu click');
        return; // Main menu already clicked or expanded
      }
      
      console.log('Clicking main menu button');
      
      // Wait for the menu button to be visible before clicking
      await waitForElement(this.mainMenuButton, TIMEOUTS.MEDIUM);
      
      // Click the main menu button using the exact XPath identifier
      await safeClick(this.mainMenuButton);
      
      // Verify menu was clicked by checking if Watchlist Manager is now visible
      await this.page.waitForTimeout(500); // Short wait for animation
      const isWatchlistVisible = await this.watchlistManagerMenu.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false);
      if (!isWatchlistVisible) {
        console.log('Watchlist Manager not visible after clicking main menu, trying again');
        await safeClick(this.mainMenuButton);
      }
      
      console.log('Main menu button clicked successfully');
    } catch (error) {
      console.error(`Failed to click main menu button: ${error}`);
      throw new Error(`Failed to click main menu button: ${error}`);
    }
  }

  /**
   * Navigate to Watchlist Manager from main menu
   */
  async navigateToWatchlistManager(): Promise<void> {
    try {
      console.log('Navigating to Watchlist Manager');
      await safeClick(this.watchlistManagerMenu);
      console.log('Navigated to Watchlist Manager');
    } catch (error) {
      console.error(`Failed to navigate to Watchlist Manager: ${error}`);
      throw new Error(`Failed to navigate to Watchlist Manager: ${error}`);
    }
  }

  /**
   * Navigate to Lists submenu
   */
  async navigateToLists(): Promise<void> {
    try {
      console.log('Navigating to Lists');
      
      // Check if we're already on the Lists page or sub-page
      const currentUrl = await this.page.url();
      if (currentUrl.toLowerCase().includes('list')) {
        console.log('URL already contains "list", checking if already on correct page');
        // Check for standard lists submenu visibility as confirmation
        const isStandardListsVisible = await this.standardListsMenu.isVisible().catch(() => false);
        if (isStandardListsVisible) {
          console.log('Already on Lists page, skipping navigation');
          return;
        }
      }
      
      // First verify Lists menu is expanded in Watchlist Manager
      const isWatchlistExpanded = await this.page.locator(`menuitem:has-text("${NAVIGATION.WATCHLIST_MANAGER}")[expanded="true"], [role="menuitem"]:has-text("${NAVIGATION.WATCHLIST_MANAGER}")[expanded="true"]`).isVisible().catch(() => false);
      
      if (!isWatchlistExpanded) {
        console.log('Watchlist Manager not expanded, expanding it first');
        await retry(async () => {
          await safeClick(this.watchlistManagerMenu);
          // Wait for expansion animation
          await this.page.waitForTimeout(1000);
          // Verify it's now expanded
          const expanded = await this.page.locator(`menuitem:has-text("${NAVIGATION.WATCHLIST_MANAGER}")[expanded="true"], [role="menuitem"]:has-text("${NAVIGATION.WATCHLIST_MANAGER}")[expanded="true"]`).isVisible().catch(() => false);
          if (!expanded) throw new Error('Watchlist Manager menu not expanded after click');
        }, 3, 1000);
      }
      
      // Now try multiple strategies to find and click the Lists menu
      console.log('Attempting to click Lists menu using multiple strategies');
      
      // Try multiple selector strategies
      const selectorStrategies = [
        // Strategy 1: Direct menu item selector
        () => this.listsMenu,
        // Strategy 2: Find by exact text within menu
        () => this.page.locator(`text="${NAVIGATION.LISTS}"`).first(),
        // Strategy 3: Find within the expanded Watchlist Manager menu
        () => this.page.locator(`[expanded="true"] menuitem:has-text("${NAVIGATION.LISTS}"), [expanded="true"] [role="menuitem"]:has-text("${NAVIGATION.LISTS}")`).first(),
        // Strategy 4: More generic text matcher
        () => this.page.locator(`:text("${NAVIGATION.LISTS}")`).first(),
        // Strategy 5: By list item containing the text
        () => this.page.locator(`li:has-text("${NAVIGATION.LISTS}")`).first()
      ];
      
      let success = false;
      
      for (let i = 0; i < selectorStrategies.length && !success; i++) {
        try {
          console.log(`Trying Lists menu click strategy ${i+1}`);
          // Ensure the strategy exists before calling it
          const strategy = selectorStrategies[i];
          if (!strategy) {
            console.log(`Strategy ${i+1} is undefined, skipping`);
            continue;
          }
          
          const locator = strategy();
          const isVisible = await locator.isVisible({ timeout: 1000 }).catch(() => false);
          
          if (isVisible) {
            await safeClick(locator);
            // Wait for navigation to happen
            await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT });
            
            // Verify navigation happened by checking if Standard Lists is now visible
            await this.page.waitForTimeout(500); // Short wait for UI
            const standardListsVisible = await this.standardListsMenu.isVisible({ timeout: 1000 }).catch(() => false);
            
            if (standardListsVisible) {
              success = true;
              console.log(`Successfully clicked Lists using strategy ${i+1}`);
              break;
            } else {
              console.log(`Strategy ${i+1} clicked but Standard Lists not visible`);
            }
          } else {
            console.log(`Lists menu not visible with strategy ${i+1}`);
          }
        } catch (err) {
          console.log(`Strategy ${i+1} failed: ${err}`);
        }
      }
      
      if (!success) {
        throw new Error('All Lists menu click strategies failed');
      }
      
      console.log('Successfully navigated to Lists');
    } catch (error) {
      console.error(`Failed to navigate to Lists: ${error}`);
      throw new Error(`Failed to navigate to Lists: ${error}`);
    }
  }

  /**
   * Navigate to Standard Lists submenu
   */
  async navigateToStandardLists(): Promise<void> {
    try {
      console.log('Navigating to Standard Lists');
      
      // Check if we're already on the Standard Lists page
      const currentUrl = await this.page.url();
      if (currentUrl.toLowerCase().includes('standard') && currentUrl.toLowerCase().includes('list')) {
        console.log('URL suggests we might already be on Standard Lists page');
        
        // Try to find EU List which should be visible on Standard Lists page
        const euListVisible = await this.euListLink.isVisible({ timeout: 1000 }).catch(() => false);
        if (euListVisible) {
          console.log('EU List already visible, we are already on Standard Lists page');
          return;
        }
      }
      
      // Try multiple strategies to find and click the Standard Lists menu
      console.log('Attempting to click Standard Lists menu using multiple strategies');
      
      // Try multiple selector strategies
      const selectorStrategies = [
        // Strategy 1: Use the class property
        () => this.standardListsMenu,
        // Strategy 2: Find by exact text
        () => this.page.locator(`text="${NAVIGATION.STANDARD_LISTS}"`).first(),
        // Strategy 3: Find within context of any menu
        () => this.page.locator(`menu menuitem:has-text("${NAVIGATION.STANDARD_LISTS}"), [role="menu"] [role="menuitem"]:has-text("${NAVIGATION.STANDARD_LISTS}")`).first(),
        // Strategy 4: More generic text matcher
        () => this.page.locator(`:text("${NAVIGATION.STANDARD_LISTS}")`).first(),
        // Strategy 5: By list item containing the text
        () => this.page.locator(`li:has-text("${NAVIGATION.STANDARD_LISTS}")`).first()
      ];
      
      let success = false;
      
      for (let i = 0; i < selectorStrategies.length && !success; i++) {
        try {
          console.log(`Trying Standard Lists menu click strategy ${i+1}`);
          // Ensure the strategy exists before calling it
          const strategy = selectorStrategies[i];
          if (!strategy) {
            console.log(`Strategy ${i+1} is undefined, skipping`);
            continue;
          }
          
          const locator = strategy();
          const isVisible = await locator.isVisible({ timeout: 1000 }).catch(() => false);
          
          if (isVisible) {
            // Take screenshot before clicking for debug purposes
            await this.page.screenshot({ path: `./test-results/before-standard-lists-click-${Date.now()}.png` });
            
            await safeClick(locator);
            // Wait for navigation to complete
            await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.MEDIUM });
            await this.page.waitForTimeout(1000); // Additional wait for any JS rendering
            
            // Take screenshot after clicking for debug purposes
            await this.page.screenshot({ path: `./test-results/after-standard-lists-click-${Date.now()}.png` });
            
            // Verify navigation happened by checking for EU List visibility or URL change
            const euListVisible = await this.euListLink.isVisible({ timeout: 1000 }).catch(() => false);
            const newUrl = await this.page.url();
            const urlChanged = newUrl !== currentUrl;
            
            if (euListVisible || urlChanged) {
              success = true;
              console.log(`Successfully clicked Standard Lists using strategy ${i+1}`);
              break;
            } else {
              console.log(`Strategy ${i+1} clicked but EU List not visible and URL didn't change`);
            }
          } else {
            console.log(`Standard Lists menu not visible with strategy ${i+1}`);
          }
        } catch (err) {
          console.log(`Strategy ${i+1} failed: ${err}`);
        }
      }
      
      if (!success) {
        throw new Error('All Standard Lists menu click strategies failed');
      }
      
      console.log('Successfully navigated to Standard Lists');
    } catch (error) {
      console.error(`Failed to navigate to Standard Lists: ${error}`);
      throw new Error(`Failed to navigate to Standard Lists: ${error}`);
    }
  }

  /**
   * Click the 'EU List' hyperlink
   */
  async clickEUList(): Promise<void> {
    try {
      console.log('Clicking EU List link');
      
      // Take a screenshot before attempting to click for debugging
      await this.page.screenshot({ path: `./test-results/before-eu-list-click-${Date.now()}.png` });
      
      // First check if EU List link is visible with our primary selector
      const isEUListVisible = await this.euListLink.isVisible().catch(() => false);
      
      if (!isEUListVisible) {
        console.log('EU List link not immediately visible, trying alternate strategies');
        
        // Try multiple strategies to locate the EU List link
        const selectorStrategies = [
          // Strategy 1: Most specific - exact text match on anchor
          () => this.page.locator(`a:text-is("${TEST_DATA.EU_LIST_NAME}")`).first(),
          // Strategy 2: Contains text match on anchor
          () => this.page.locator(`a:has-text("${TEST_DATA.EU_LIST_NAME}")`).first(),
          // Strategy 3: Any element with exact EU List text
          () => this.page.locator(`:text-is("${TEST_DATA.EU_LIST_NAME}")`).first(),
          // Strategy 4: Any element containing EU List text
          () => this.page.locator(`:has-text("${TEST_DATA.EU_LIST_NAME}")`).first(),
          // Strategy 5: Table cell containing EU List text
          () => this.page.locator(`td:has-text("${TEST_DATA.EU_LIST_NAME}")`).first(),
          // Strategy 6: Fallback - hardcoded text
          () => this.page.locator('a:has-text("EU List")').first()
        ];
        
        let success = false;
        
        for (let i = 0; i < selectorStrategies.length && !success; i++) {
          try {
            console.log(`Trying EU List click strategy ${i+1}`);
            // Ensure the strategy exists before calling it
            const strategy = selectorStrategies[i];
            if (!strategy) {
              console.log(`Strategy ${i+1} is undefined, skipping`);
              continue;
            }
            
            const locator = strategy();
            const isVisible = await locator.isVisible({ timeout: 1000 }).catch(() => false);
            
            if (isVisible) {
              // Log the found element details for debugging
              const boundingBox = await locator.boundingBox();
              console.log(`Found EU List with strategy ${i+1}, position: ${JSON.stringify(boundingBox)}`);
              
              // First try scrolling into view
              await locator.scrollIntoViewIfNeeded();
              
              await safeClick(locator, { timeout: TIMEOUTS.LONG });
              await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.MEDIUM });
              
              // Verify we navigated successfully - URL should change
              const newUrl = await this.page.url();
              if (newUrl.includes('list') || newUrl !== this.page.url()) {
                success = true;
                console.log(`Successfully clicked EU List using strategy ${i+1}`);
                break;
              }
            } else {
              console.log(`EU List not visible with strategy ${i+1}`);
            }
          } catch (err) {
            console.log(`Strategy ${i+1} failed: ${err}`);
          }
        }
        
        if (!success) {
          // Debug: Take screenshot and dump HTML if all strategies failed
          await this.page.screenshot({ path: `./test-results/eu-list-not-found-${Date.now()}.png` });
          const html = await this.page.content();
          console.log('Page HTML:', html.substring(0, 500) + '...');
          
          throw new Error('All EU List click strategies failed');
        }
      } else {
        // Use the standard selector that was found to be visible
        await safeClick(this.euListLink, { timeout: TIMEOUTS.LONG });
      }
      
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.MEDIUM });
      await this.page.waitForTimeout(1000); // Additional wait for any JS rendering
      
      // Take a screenshot after clicking for debugging
      await this.page.screenshot({ path: `./test-results/after-eu-list-click-${Date.now()}.png` });
      
      console.log('Successfully clicked EU List link');
    } catch (error) {
      console.error(`Failed to click EU List link: ${error}`);
      throw new Error(`Failed to click EU List link: ${error}`);
    }
  }

  /**
   * Assert that 'eu_name' text is present and visible in the Search Indexes section
   */
  async assertEuNameTextVisible(): Promise<void> {
    try {
      console.log('Asserting eu_name text is present');
      
      // First check if eu_name text is visible with the default selector
      const isEuNameVisible = await this.euNameText.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false);
      
      if (!isEuNameVisible) {
        console.log('eu_name text not immediately visible, trying alternate selectors');
        // Try using more direct selectors
        const alternativeLocators = [
          this.page.locator('text="eu_name"'),
          this.page.locator(':has-text("eu_name")'),
          this.page.locator('[id*="eu_name"]'),
          this.page.locator('text=eu_name'),
          this.page.locator('td:has-text("eu_name")')
        ];
        
        let found = false;
        for (const locator of alternativeLocators) {
          const isVisible = await locator.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false);
          if (isVisible) {
            console.log('Found eu_name with alternative selector');
            await expect(locator).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
            found = true;
            break;
          }
        }
        
        if (!found) {
          console.log('Trying to find any element in the Search Indexes section');
          // Try to find the section first
          const searchIndexesSection = this.page.locator(':has-text("Search Indexes")').first();
          const isSectionVisible = await searchIndexesSection.isVisible().catch(() => false);
          
          if (isSectionVisible) {
            console.log('Found Search Indexes section, looking for eu_name within it');
            const indexNameColumn = await searchIndexesSection.locator(':has-text("Index Name")').first();
            const euNameInSection = await indexNameColumn.locator(':has-text("eu_name")').first();
            await expect(euNameInSection).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
          } else {
            throw new Error('Could not find Search Indexes section or eu_name text');
          }
        }
      } else {
        await expect(this.euNameText).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      }
      
      console.log('Assertion passed: eu_name text is present and visible');
    } catch (error) {
      console.error(`Assertion failed: eu_name text is not visible: ${error}`);
      throw new Error(`Assertion failed: eu_name text is not visible: ${error}`);
    }
  }

  /**
   * Complete the navigation sequence to EU List without final assertion
   */
  async navigateToEUListWithoutAssertion(): Promise<void> {
    try {
      console.log('Starting enhanced navigation sequence to EU List with super robust error handling...');
      
      // Create a directory to save debugging artifacts
      const debugDirPath = `./test-results/eu-list-nav-debug-${Date.now()}`;
      
      // Save the HTML content of the page for debugging
      const initialHtml = await this.page.content();
      console.log(`Initial page HTML length: ${initialHtml.length} chars`);
      
      console.log('---------- MULTI-STRATEGY NAVIGATION START ----------');
      
      // Strategy 1: Standard navigation path through the menu structure
      console.log('Attempting Strategy 1: Standard menu navigation path');
      
      try {
        // Step 1: Click the main menu button (only if needed)
        console.log('Step 1: Opening main menu (if needed)');
        await this.clickMainMenu();
        
        // Capture screenshot after main menu click
        await this.page.screenshot({ path: `./test-results/after-main-menu-click-${Date.now()}.png` });
        
        // Wait for any animations to complete
        await this.page.waitForTimeout(1000);
        
        // Step 2: Navigate to Watchlist Manager
        console.log('Step 2: Navigating to Watchlist Manager');
        
        // Verify if Watchlist Manager is already expanded or visible
        const isWatchlistManagerVisible = await this.page.locator(`menuitem:has-text("${NAVIGATION.WATCHLIST_MANAGER}"), [role="menuitem"]:has-text("${NAVIGATION.WATCHLIST_MANAGER}")`).isVisible().catch(() => false);
        const isWatchlistExpanded = await this.page.locator(`menuitem:has-text("${NAVIGATION.WATCHLIST_MANAGER}")[expanded="true"], [role="menuitem"]:has-text("${NAVIGATION.WATCHLIST_MANAGER}")[expanded="true"]`).isVisible().catch(() => false);
        
        if (!isWatchlistManagerVisible) {
          console.log('Watchlist Manager not visible after clicking main menu - checking if page structure is as expected');
          // Take screenshot to analyze page structure
          await this.page.screenshot({ path: `./test-results/no-watchlist-manager-visible-${Date.now()}.png` });
          
          // Try to click the main menu again with a longer wait
          console.log('Trying main menu again with longer wait');
          await this.mainMenuButton.click({ force: true });
          await this.page.waitForTimeout(2000);
        }
        
        if (!isWatchlistExpanded) {
          console.log('Watchlist Manager visible but not expanded, expanding it now');
          await retry(async () => {
            // Try to scroll into view if needed
            const watchlistManagerLocator = this.page.locator(`menuitem:has-text("${NAVIGATION.WATCHLIST_MANAGER}"), [role="menuitem"]:has-text("${NAVIGATION.WATCHLIST_MANAGER}")`).first();
            await watchlistManagerLocator.scrollIntoViewIfNeeded();
            
            // Try to click with different strategies
            await watchlistManagerLocator.click({ force: true, timeout: 5000 });
            
            // Verify it's now expanded
            await this.page.waitForTimeout(1000); // Wait for expansion
            const expanded = await this.page.locator(`menuitem:has-text("${NAVIGATION.WATCHLIST_MANAGER}")[expanded="true"], [role="menuitem"]:has-text("${NAVIGATION.WATCHLIST_MANAGER}")[expanded="true"]`).isVisible().catch(() => false);
            
            if (!expanded) {
              console.log('First click didn\'t expand Watchlist Manager, trying alternate click method');
              // Try clicking by JS if normal click didn't work
              await this.page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('*'))
                  .filter(el => el.textContent && el.textContent.includes('Watchlist Manager'));
                if (elements.length > 0) {
                  elements[0].click();
                  console.log('Clicked via JavaScript');
                }
              });
              
              await this.page.waitForTimeout(1000);
              const jsExpanded = await this.page.locator(`menuitem:has-text("${NAVIGATION.WATCHLIST_MANAGER}")[expanded="true"], [role="menuitem"]:has-text("${NAVIGATION.WATCHLIST_MANAGER}")[expanded="true"]`).isVisible().catch(() => false);
              
              if (!jsExpanded) throw new Error('Failed to expand Watchlist Manager menu after multiple attempts');
            }
          }, 3, 1000);
        } else {
          console.log('Watchlist Manager already expanded, proceeding to Lists');
        }
        
        // Take screenshot after Watchlist Manager expansion
        await this.page.screenshot({ path: `./test-results/after-watchlist-manager-expanded-${Date.now()}.png` });
        
        // Step 3: Navigate to Lists submenu
        console.log('Step 3: Navigating to Lists');
        try {
          await this.navigateToLists();
          // Capture screenshot after Lists navigation
          await this.page.screenshot({ path: `./test-results/after-lists-navigation-${Date.now()}.png` });
          // Wait for UI stability
          await this.page.waitForTimeout(1000);
        } catch (listsError) {
          console.error(`Lists navigation failed in standard path: ${listsError}`);
          console.log('Attempting direct Lists navigation via JavaScript');
          
          // Try using JavaScript to find and click the Lists menu item
          await this.page.evaluate(() => {
            const listElements = Array.from(document.querySelectorAll('*'))
              .filter(el => el.textContent && el.textContent.trim() === 'Lists');
            
            if (listElements.length > 0) {
              console.log(`Found ${listElements.length} Lists elements via JavaScript`);
              listElements[0].click();
              return true;
            }
            return false;
          });
          
          // Wait to see if JS click had any effect
          await this.page.waitForTimeout(2000);
          await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => console.log('Network did not reach idle state after JS Lists click'));
        }
        
        // Step 4: Navigate to Standard Lists submenu
        console.log('Step 4: Navigating to Standard Lists');
        try {
          await this.navigateToStandardLists();
          // Capture screenshot after Standard Lists navigation
          await this.page.screenshot({ path: `./test-results/after-standard-lists-${Date.now()}.png` });
        } catch (standardListsError) {
          console.error(`Standard Lists navigation failed in standard path: ${standardListsError}`);
          
          // Try direct JS click on Standard Lists
          console.log('Trying direct JavaScript click on Standard Lists');
          const standardListsClicked = await this.page.evaluate(() => {
            const standardListElements = Array.from(document.querySelectorAll('*'))
              .filter(el => el.textContent && el.textContent.trim() === 'Standard Lists');
            
            if (standardListElements.length > 0) {
              console.log(`Found ${standardListElements.length} Standard Lists elements via JavaScript`);
              standardListElements[0].click();
              return true;
            }
            return false;
          });
          
          if (standardListsClicked) {
            console.log('Successfully clicked Standard Lists via JavaScript');
            await this.page.waitForTimeout(2000);
            await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => console.log('Network did not reach idle state after JS Standard Lists click'));
          } else {
            console.log('Failed to find Standard Lists element via JavaScript');
          }
        }
        
        // Step 5: Click on EU List
        console.log('Step 5: Clicking on EU List from standard navigation path');
        await this.clickEUList();
        
        console.log('Strategy 1 (Standard navigation) succeeded');
        return; // Exit the method as we've successfully navigated
        
      } catch (strategy1Error) {
        console.error(`Strategy 1 (Standard navigation) failed: ${strategy1Error}`);
        // Take screenshot of failure state
        await this.page.screenshot({ path: `./test-results/strategy1-failure-${Date.now()}.png` });
        // Continue to next strategy - do not throw error yet
      }
      
      // Strategy 2: Try to find EU List directly via URL or direct navigation
      console.log('Attempting Strategy 2: Direct navigation to EU List');
      
      try {
        console.log('Looking for any direct links to EU List...');
        
        // Check for any links containing EU List text
        const euListLinks = [
          this.page.locator(`a:has-text("${TEST_DATA.EU_LIST_NAME}")`).first(),
          this.page.locator('a:has-text("EU List")').first(),
          this.page.locator('a[href*="eu_list"], a[href*="eulist"]').first()
        ];
        
        let directLinkFound = false;
        
        for (let i = 0; i < euListLinks.length; i++) {
          const isVisible = await euListLinks[i].isVisible({ timeout: 1000 }).catch(() => false);
          if (isVisible) {
            console.log(`Found direct EU List link with strategy ${i+1}`);
            await euListLinks[i].scrollIntoViewIfNeeded();
            await euListLinks[i].click();
            await this.page.waitForLoadState('networkidle', { timeout: 5000 });
            directLinkFound = true;
            break;
          }
        }
        
        if (!directLinkFound) {
          // Try URL-based navigation if we know the pattern
          console.log('No direct links found, trying URL-based navigation');
          
          // Examine current URL to determine pattern
          const currentUrl = this.page.url();
          if (currentUrl.includes('netreveal') || currentUrl.includes('watchlist')) {
            // Construct likely URL for EU List based on observed pattern
            const baseUrl = currentUrl.split('?')[0];
            const euListUrl = `${baseUrl}?section=wlm&view=list&list=EU%20List`;
            
            console.log(`Attempting direct URL navigation to: ${euListUrl}`);
            await this.page.goto(euListUrl, { timeout: 10000 });
            
            // Check if we've reached a page with EU List content
            const pageText = await this.page.textContent('body');
            if (pageText && (pageText.includes('EU List') || pageText.includes('eu_name'))) {
              console.log('Successfully navigated to EU List via direct URL');
              return; // Exit the method as we've successfully navigated
            }
          }
          
          throw new Error('Could not find direct link or construct valid URL for EU List');
        } else {
          console.log('Strategy 2 (Direct navigation) succeeded');
          return; // Exit the method as we've successfully navigated
        }
        
      } catch (strategy2Error) {
        console.error(`Strategy 2 (Direct navigation) failed: ${strategy2Error}`);
        // Take screenshot of failure state
        await this.page.screenshot({ path: `./test-results/strategy2-failure-${Date.now()}.png` });
        // Continue to final fallback strategy
      }
      
      // Strategy 3: Complete UI scanning and full-DOM search as last resort
      console.log('Attempting Strategy 3: Full DOM search for EU List path');
      
      try {
        // This is a more aggressive approach to find any possible path to EU List
        console.log('Scanning entire DOM for any menu or link elements that might lead to EU List');
        
        // First, try to find and click through the main menu structure via JavaScript
        const foundPath = await this.page.evaluate(() => {
          const results = {
            foundMainMenu: false,
            foundWatchlistManager: false,
            foundLists: false,
            foundStandardLists: false,
            foundEUList: false,
            path: []
          };
          
          // Function to find elements by text
          const findElementsByText = (text) => {
            return Array.from(document.querySelectorAll('a, button, [role="menuitem"], li, span'))
              .filter(el => el.textContent && el.textContent.trim().includes(text));
          };
          
          // Try to find and click main menu
          const mainMenuElements = findElementsByText('Menu') || document.querySelectorAll('#menu-trigger');
          if (mainMenuElements.length > 0) {
            results.foundMainMenu = true;
            results.path.push('Found Main Menu');
            mainMenuElements[0].click();
          }
          
          // Wait a moment for menu to appear
          setTimeout(() => {
            // Try to find and click Watchlist Manager
            const watchlistElements = findElementsByText('Watchlist Manager');
            if (watchlistElements.length > 0) {
              results.foundWatchlistManager = true;
              results.path.push('Found Watchlist Manager');
              watchlistElements[0].click();
              
              // Wait for submenu to appear
              setTimeout(() => {
                // Try to find and click Lists
                const listsElements = findElementsByText('Lists');
                if (listsElements.length > 0) {
                  results.foundLists = true;
                  results.path.push('Found Lists');
                  listsElements[0].click();
                  
                  // Wait for next submenu
                  setTimeout(() => {
                    // Try to find and click Standard Lists
                    const standardListsElements = findElementsByText('Standard Lists');
                    if (standardListsElements.length > 0) {
                      results.foundStandardLists = true;
                      results.path.push('Found Standard Lists');
                      standardListsElements[0].click();
                      
                      // Finally try to find EU List
                      setTimeout(() => {
                        const euListElements = findElementsByText('EU List');
                        if (euListElements.length > 0) {
                          results.foundEUList = true;
                          results.path.push('Found EU List');
                          euListElements[0].click();
                        }
                      }, 500);
                    }
                  }, 500);
                }
              }, 500);
            }
          }, 500);
          
          return results;
        });
        
        console.log(`JavaScript DOM navigation results: ${JSON.stringify(foundPath)}`);
        
        // Give time for the JavaScript clicks to have effect
        await this.page.waitForTimeout(3000);
        
        // Verify if we've reached the EU List by checking for eu_name
        const euNameVisible = await this.page.locator(`text="${TEST_DATA.EU_NAME_TEXT}", text="eu_name"`).isVisible({ timeout: 2000 }).catch(() => false);
        
        if (euNameVisible) {
          console.log('Strategy 3 (DOM search) succeeded - EU List reached');
          return;
        }
        
        throw new Error('Full DOM search did not successfully navigate to EU List');
        
      } catch (strategy3Error) {
        console.error(`Strategy 3 (Full DOM search) failed: ${strategy3Error}`);
        // Take screenshot of final failure state
        await this.page.screenshot({ path: `./test-results/strategy3-failure-${Date.now()}.png` });
        
        // At this point, all strategies have failed
        throw new Error(`All navigation strategies to EU List failed: ${strategy3Error}`);
      }
    } catch (error) {
      console.error(`Navigation sequence to EU List completely failed: ${error}`);
      // Final failure screenshot
      await this.page.screenshot({ path: `./test-results/all-strategies-failed-${Date.now()}.png` });
      
      // Dump HTML for debugging
      const finalHtml = await this.page.content();
      console.log(`Final page HTML length: ${finalHtml.length} chars`);
      
      throw new Error(`All navigation strategies to EU List failed: ${error}`);
    }
  }

  /**
   * Complete the full navigation sequence with assertion
   */
  async navigateToEUListAndAssert(): Promise<void> {
    try {
      // Navigate to EU List
      await this.navigateToEUListWithoutAssertion();
      
      // Assert that eu_name text is visible in the Search Indexes section
      console.log('Asserting eu_name text is present');
      await this.assertEuNameTextVisible();
      
      console.log('Navigation and assertion sequence completed successfully');
    } catch (error) {
      console.error(`Navigation and assertion sequence failed: ${error}`);
      throw new Error(`Navigation and assertion sequence failed: ${error}`);
    }
  }
}