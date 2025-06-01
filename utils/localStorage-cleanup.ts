/**
 * Utility function to clean up the localStorage session data
 * to fix issues with duplicate session IDs
 */
export function cleanupSessionStorage() {
  try {
    const savedSessions = localStorage.getItem('bibscrip-chat-sessions')
    
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions) as Array<any>
      
      // Deduplicate sessions by ID
      const sessionIds = new Set<string>()
      const uniqueSessions = parsedSessions.filter(session => {
        // Skip sessions without an ID
        if (!session.id) return false
        
        if (sessionIds.has(session.id)) {
          console.warn(`Removing duplicate session ID: ${session.id}`)
          return false
        }
        
        // Make sure the session has all required properties
        if (!session.title || !session.messages || !Array.isArray(session.messages)) {
          console.warn(`Removing malformed session: ${session.id}`)
          return false
        }
        
        sessionIds.add(session.id)
        return true
      })
      
      // Update localStorage with cleaned data
      if (uniqueSessions.length !== parsedSessions.length) {
        console.log(`Cleaned up sessions: removed ${parsedSessions.length - uniqueSessions.length} problematic sessions`)
        localStorage.setItem('bibscrip-chat-sessions', JSON.stringify(uniqueSessions))
        return true
      }
    }
    
    return false
  } catch (error) {
    console.error('Error cleaning up session storage:', error)
    return false
  }
}
