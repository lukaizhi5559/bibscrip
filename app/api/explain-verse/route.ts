import { NextResponse } from 'next/server';
import { ENDPOINTS } from '@/lib/api-config';
import axios from 'axios';
import { getMockExplanation } from './mock-data';

// Config for Edge runtime for optimal performance
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { reference, text, translation } = await req.json();
    
    if (!reference || !text) {
      return new NextResponse(
        JSON.stringify({ error: 'Reference and text are required' }),
        { status: 400 }
      );
    }

    // Try to connect to the backend AI service if available
    let aiResponse;
    let usedMockData = false;
    
    try {
      // Always prefer using mock data in development or when explicitly requested
      if (process.env.NODE_ENV === 'development' || process.env.USE_MOCK_EXPLANATIONS === 'true') {
        console.log(`Using mock explanation data for ${reference}`);
        const mockData = getMockExplanation(reference);
        aiResponse = mockData;
        usedMockData = true;
      } else {
        // Try the real API service with a longer timeout
        console.log(`Requesting explanation from API for ${reference}`);
        
        // Set up a timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.log('API request timed out after 25 seconds');
        }, 25000); // 25 second timeout (longer than axios timeout)
        
        try {
          const response = await axios.post(ENDPOINTS.GENERATE.TEXT, {
            prompt: `
              As a biblical scholar with expertise in theology, history, and practical application of scripture, 
              provide a comprehensive explanation of this Bible verse:

              Reference: ${reference} (${translation})
              Verse Text: "${text}"

              Divide your explanation into exactly three sections:

              1. Theological Meaning: Explain the core theological concepts, doctrinal significance, 
              and spiritual truths contained in this verse. What does it reveal about God, humanity, 
              salvation, or other key theological themes?

              2. Historical Context: Provide relevant historical background about when this was written, 
              to whom, and why. Include cultural context that helps modern readers understand what this 
              verse meant to its original audience.

              3. Modern Application: Explain how this verse can be practically applied to contemporary life. 
              How should this scripture guide believers' thoughts, decisions, relationships, or actions today?

              Keep each section concise but insightful, focusing on scholarly consensus while acknowledging 
              any significant interpretive differences where relevant.
            `,
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 2000
          }, {
            timeout: 20000, // 20 second timeout for axios
            signal: controller.signal // Allow manual abort
          });
          
          // Clear the timeout if request succeeds
          clearTimeout(timeoutId);
          
          // Extract the AI response text
          aiResponse = response.data.data.text;
          console.log('Successfully received API response');
        } catch (apiError) {
          // Clear the timeout if the request errors out
          clearTimeout(timeoutId);
          throw apiError; // Rethrow to be caught by outer catch
        }
      }
    } catch (error: any) {
      // If the API call fails, use mock data as fallback
      console.error('Error with explanation API:', error.message);
      
      // Check for timeout-specific errors
      const isTimeout = 
        error.code === 'ECONNABORTED' || 
        (error.message && (error.message.includes('timeout') || error.message.includes('aborted'))) ||
        error.name === 'AbortError';
        
      if (isTimeout) {
        console.log(`API request timed out for ${reference}, using mock data`);
      } else {
        console.log(`API request failed for ${reference}: ${error.message}, using mock data`);
      }
      
      console.log(`Falling back to mock explanation data for ${reference}`);
      
      try {
        aiResponse = getMockExplanation(reference);
        usedMockData = true;
      } catch (mockError) {
        // If even the mock data fails, create a minimal fallback
        console.error('Error getting mock data:', mockError);
        aiResponse = {
          theological: 'Unable to generate explanation due to service timeout.',
          historical: 'Please try again later or check your connection.',
          application: 'Consider using a different verse or translation if this issue persists.',
          source: 'error_fallback'
        };
        usedMockData = true;
      }
    }
    
    // If we used mock data, we already have the structured sections
    // Otherwise, parse the text response to extract sections
    let explanation;
    
    if (usedMockData) {
      // Mock data is already structured correctly
      explanation = aiResponse;
    } else {
      // Parse the text response from the AI service
      const theologicalMatch = aiResponse.match(/Theological Meaning:(.*?)(?=Historical Context:|$)/i);
      const historicalMatch = aiResponse.match(/Historical Context:(.*?)(?=Modern Application:|$)/i);
      const applicationMatch = aiResponse.match(/Modern Application:(.*?)(?=$)/i);
      
      explanation = {
        theological: theologicalMatch ? theologicalMatch[1].trim() : 'No theological explanation available.',
        historical: historicalMatch ? historicalMatch[1].trim() : 'No historical context available.',
        application: applicationMatch ? applicationMatch[1].trim() : 'No application insights available.',
      };
    }
    
    // Add source metadata to the response
    explanation.source = usedMockData ? 'mock' : 'api';
    
    // Track analytics event
    try {
      await fetch(`${process.env.BACKEND_URL || 'http://localhost:4000'}/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'verse_explanation_requested',
          data: {
            reference,
            translation,
          },
        }),
      });
    } catch (analyticsError) {
      console.error('Failed to log analytics:', analyticsError);
      // Non-blocking - continue even if analytics fails
    }
    
    return NextResponse.json(explanation);
  } catch (error: any) {
    console.error('Error in verse explanation API:', error.message || error);
    
    // Try to get a reference from the request if available
    let referenceFromError = "unknown verse";
    try {
      if (req.body) {
        const body = await req.clone().json().catch(() => ({}));
        referenceFromError = body.reference || referenceFromError;
      }
    } catch (parseError) {
      console.error('Error parsing request body for error handler:', parseError);
    }
    
    // First try to provide a mock explanation even in the error case
    try {
      console.log(`Error occurred, trying emergency mock data for ${referenceFromError}`);
      const mockData = getMockExplanation(referenceFromError);
      return NextResponse.json({
        ...mockData,
        source: 'error_fallback',
        error_info: process.env.NODE_ENV === 'development' ? (error.message || 'Unknown error') : undefined
      });
    } catch (mockError) {
      // If mock data fails too, send a structured error response
      console.error('Emergency mock data failed:', mockError);
      
      // Handle axios errors with more specific messages
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          // Timeout error
          return NextResponse.json({
            error: 'Request to AI service timed out. Please try again later.',
            theological: 'The explanation service took too long to respond.',
            historical: 'This could be due to high server load or network issues.',
            application: 'You might want to try again in a few moments or use a different verse.',
            source: 'error'
          }, { status: 504 });
        } else if (error.code === 'ERR_NETWORK') {
          // Network error
          return NextResponse.json({
            error: 'Unable to connect to AI service.',
            theological: 'There was a problem connecting to the explanation service.',
            historical: 'This is likely due to network connectivity issues or server downtime.',
            application: 'Please check your internet connection and try again later.',
            source: 'error'
          }, { status: 503 });
        } else if (error.code === 'ERR_BAD_REQUEST') {
          // Bad request error
          return NextResponse.json({
            error: 'AI service rejected the request.',
            theological: 'There was a problem with how the request was formatted.',
            historical: 'This is typically due to an issue with the verse text or reference format.',
            application: 'Please try a different verse or check for special characters in your input.',
            source: 'error'
          }, { status: 400 });
        }
      }
      
      // Generic error fallback
      return NextResponse.json({ 
        error: 'Failed to generate verse explanation',
        theological: 'Explanation service is currently unavailable.',
        historical: 'Please try again later.',
        application: 'Consider checking your network connection or trying a different verse.',
        source: 'error'
      }, { status: 500 });
    }
  }
}
