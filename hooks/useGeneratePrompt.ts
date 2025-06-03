import { useState, useCallback } from 'react';

interface GeneratePromptOptions {
  timeout?: number; // in milliseconds
}

interface GeneratePromptResult {
  isLoading: boolean;
  error: string | null;
  result: string | null;
  generate: (prompt: string) => Promise<string | null>;
}

/**
 * React hook for interacting with the backend prompt generation API
 * Provides loading state, error handling, and a simple function to generate responses
 */
export function useGeneratePrompt(options: GeneratePromptOptions = {}): GeneratePromptResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  
  // Default timeout to 30 seconds if not provided
  const timeout = options.timeout || 30000;
  
  const generate = useCallback(async (prompt: string): Promise<string | null> => {
    if (!prompt?.trim()) {
      setError('Prompt cannot be empty');
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        
        const data = await response.json();
        setResult(data.result);
        return data.result;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Handle timeout specifically
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timed out. The server took too long to respond.');
        }
        
        throw fetchError;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [timeout]);
  
  return {
    isLoading,
    error,
    result,
    generate
  };
}

/**
 * Simple example of a one-off prompt generation without using the hook
 * Useful for fire-and-forget scenarios where you don't need state management
 */
export async function generatePrompt(prompt: string, options: GeneratePromptOptions = {}): Promise<string | null> {
  try {
    const timeout = options.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error generating prompt:', error);
    return null;
  }
}
