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
    
    // With our new component approach, we don't need to manually click the resource tab
    // The VerseResourceTabs component will automatically show the correct tab based on sessionStorage
    console.log('VerseResourceTabs component will automatically handle tab selection');
    
    // Trigger a focus event to help force a re-render in some cases
    setTimeout(() => {
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
