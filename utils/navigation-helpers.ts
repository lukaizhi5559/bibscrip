/**
 * Utility functions for in-app navigation
 */

/**
 * Navigate to a specific tab in the results panel and set the active resource tab for a verse
 * This uses DOM manipulation since we don't have direct access to React context/state across components
 */
export function navigateToVerseResource(
  verseRef: string, 
  resourceType: 'biblegateway' | 'biblehub' | 'blueletterbible'
): void {
  console.log(`Navigating to verse resource: ${verseRef}, type: ${resourceType}`);
  
  // First, set sessionStorage values to communicate between components
  window.sessionStorage.setItem('activeVerseRef', verseRef);
  window.sessionStorage.setItem('activeResourceTab', resourceType);
  
  // Find and click the Bible Verses tab to activate it
  // Try different selectors since Radix UI may apply different attributes
  const versesTabSelectors = [
    '[data-value="verses"]',
    '[value="verses"]',
    '[role="tab"][data-state][value="verses"]',
    '[role="tab"][value="verses"]'
  ];
  
  let versesTab: HTMLElement | null = null;
  
  for (const selector of versesTabSelectors) {
    const tab = document.querySelector(selector) as HTMLElement;
    if (tab) {
      versesTab = tab;
      console.log(`Found verses tab with selector: ${selector}`);
      break;
    }
  }
  
  if (versesTab) {
    console.log('Clicking verses tab');
    versesTab.click();
    
    // Allow time for the tab content to render
    setTimeout(() => {
      // Find the verse container by reference
      const verseContainers = document.querySelectorAll('[data-verse-ref]');
      console.log(`Found ${verseContainers.length} verse containers`);
      
      let verseContainer: Element | null = null;
      
      verseContainers.forEach(container => {
        const containerRef = container.getAttribute('data-verse-ref');
        console.log(`Container ref: ${containerRef}`);
        if (containerRef === verseRef) {
          verseContainer = container;
          console.log(`Found matching container for verse: ${verseRef}`);
        }
      });
      
      // If we found the verse container, click the appropriate resource tab
      if (verseContainer) {
        // Try multiple selectors for resource tabs
        const resourceTabSelectors = [
          `[data-value="${resourceType}"]`,
          `[value="${resourceType}"]`,
          `button[value="${resourceType}"]`
        ];
        
        let resourceTab: HTMLElement | null = null;
        
        // Type assertion to Element to ensure querySelector exists
        const verseContainerElement = verseContainer as Element;
        
        for (const selector of resourceTabSelectors) {
          resourceTab = verseContainerElement.querySelector(selector) as HTMLElement | null;
          if (resourceTab) {
            console.log(`Found resource tab with selector: ${selector}`);
            break;
          }
        }
        
        if (resourceTab) {
          console.log(`Clicking resource tab: ${resourceType}`);
          resourceTab.click();
        } else {
          console.error(`Could not find resource tab for: ${resourceType}`);
        }
      } else {
        console.error(`Could not find verse container for: ${verseRef}`);
      }
    }, 300); // Increased delay to ensure the verses tab content is rendered
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
