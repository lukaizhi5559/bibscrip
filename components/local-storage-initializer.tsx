"use client"

import { useEffect } from 'react'
import { cleanupSessionStorage } from '@/utils/localStorage-cleanup'

/**
 * Component that runs on client-side to clean up localStorage 
 * and fix any duplicate session IDs
 */
export function LocalStorageInitializer() {
  useEffect(() => {
    // Run the cleanup utility on component mount
    const cleaned = cleanupSessionStorage()
    if (cleaned) {
      console.log('Successfully cleaned up localStorage session data')
    }
  }, [])
  
  // This component doesn't render anything
  return null
}
