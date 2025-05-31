/**
 * Utility functions for in-app navigation
 */

/**
 * Navigate to a specific tab in the results panel and set the active resource tab for a verse
 * This now uses sessionStorage to communicate with our isolated VerseResourceTabs components
 */
export function navigateToVerseResource(
  verseRef: string, 
  resourceType: 'biblegateway' | 'biblehub' | 'blueletterbible'
): void {
  console.log(`Navigating to verse resource: ${verseRef}, type: ${resourceType}`);
  
  // First, set sessionStorage values to communicate between components
  // Our VerseResourceTabs component will check these values on mount/initialization
  window.sessionStorage.setItem('activeVerseRef', verseRef);
  window.sessionStorage.setItem('activeResourceTab', resourceType);
  
  // Find and click the Bible Verses tab to activate it
  // Try different selectors since Radix UI may apply different attributes
  const versesTabSelectors = [
    '[data-value="verses"]',
    '[value="verses"]',
    '[role="tab"][data-state][value="verses"]',
    '[role="tab"][value="verses"]',
    // Add more generic selectors
    'button[value="verses"]',
    'button:contains("Bible Verses")',
    // Try data-state attribute
    '[data-state][value="verses"]',
    // Try radix tab selectors
    '[data-radix-tab][value="verses"]',
    // Let's try classes that might contain tab details
    '.tabs [value="verses"]',
    '.tab-navigation [value="verses"]',
    // Try by aria-label
    '[aria-label="Bible Verses"]'
  ];
  
  let versesTab: HTMLElement | null = null;
  
  // Custom selector for text content
  const buttons = document.querySelectorAll('button');
  for (const button of buttons) {
    if ((button.textContent || '').trim().toLowerCase().includes('bible verses')) {
      versesTab = button;
      console.log('Found verses tab by button text content');
      break;
    }
  }
  
  // If not found by text, try the standard selectors
  if (!versesTab) {
    for (const selector of versesTabSelectors) {
      try {
        const tab = document.querySelector(selector) as HTMLElement;
        if (tab) {
          versesTab = tab;
          console.log(`Found verses tab with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`Error with selector ${selector}:`, e);
      }
    }
  }
  
  if (versesTab) {
    console.log('Clicking verses tab', versesTab);
    
    try {
      // Try different methods to trigger the tab click
      versesTab.click(); // Standard click
      
      // Also try event dispatching
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      versesTab.dispatchEvent(clickEvent);
      
      // Try to set active attributes directly
      versesTab.setAttribute('data-state', 'active');
      versesTab.setAttribute('aria-selected', 'true');
      
      console.log('VerseResourceTabs will automatically handle tab selection via sessionStorage');
    } catch (error) {
      console.error('Error clicking verses tab:', error);
    }
    
    // Add a forced scroll to the Bible Verses section to ensure it's visible
    setTimeout(() => {
      // Try to scroll to the Bible Verses section
      try {
        const bibleVersesSection = document.querySelector('[data-value="verses"], [id="verses-tab"]');
        if (bibleVersesSection) {
          bibleVersesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (e) {
        console.error('Error scrolling to Bible Verses section:', e);
      }
      
      // Find the verse container by reference
      const verseContainers = document.querySelectorAll('[data-verse-ref]');
      console.log(`Found ${verseContainers.length} verse containers`);
      
      let verseContainer: Element | null = null;
      
      verseContainers.forEach(container => {
        const containerRef = container.getAttribute('data-verse-ref');
        if (containerRef === verseRef) {
          verseContainer = container;
          console.log(`Found matching container for verse: ${verseRef}`);
          
          // Scroll to the verse container
          verseContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }, 300);
  }
}

/**
 * Get the current active main tab in the results panel
 */
export function getActiveMainTab(): string {
  const activeTab = document.querySelector('[role="tablist"] [data-state="active"]');
  return activeTab?.getAttribute('data-value') || 'answer';
}

/**
 * Set the active main tab in the results panel
 */
export function setActiveMainTab(tabValue: string): void {
  const tab = document.querySelector(`[data-value="${tabValue}"]`) as HTMLElement;
  if (tab) {
    tab.click();
  }
}
