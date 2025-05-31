/**
 * Utility functions for string operations
 */

/**
 * Truncates a string to a maximum length and adds ellipsis if needed
 * @param text The string to truncate
 * @param maxLength Maximum length before truncation
 * @param useWordBoundary Whether to truncate at word boundaries (true) or exact character position (false)
 * @returns The truncated string with ellipsis if needed
 */
export function truncateText(
  text: string, 
  maxLength: number = 80, 
  useWordBoundary: boolean = true
): string {
  if (!text || text.length <= maxLength) return text;
  
  const subString = text.substring(0, maxLength - 3); // -3 to leave room for ellipsis
  
  // If useWordBoundary is true, find the last space within the substring
  return useWordBoundary
    ? subString.substring(0, subString.lastIndexOf(' ')) + '...'
    : subString + '...';
}
