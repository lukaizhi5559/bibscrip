import { NextResponse } from 'next/server';
import { ENDPOINTS } from '@/lib/api-config';
import axios from 'axios';

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

    // Forward the request to the backend AI service
    let response;
    try {
      response = await axios.post(ENDPOINTS.GENERATE.TEXT, {
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
      timeout: 15000 // 15 second timeout
    });
    } catch (axiosError: any) {
      // Handle specific axios errors
      if (axiosError.response) {
        // The request was made and the server responded with a status code outside 2xx range
        console.error(`Backend API error: ${axiosError.response.status}`, axiosError.response.data);
        return NextResponse.json(
          { error: axiosError.response.data?.error || 'Error from AI service' },
          { status: axiosError.response.status || 500 }
        );
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error('Backend API timeout or no response:', axiosError.message);
        return NextResponse.json(
          { error: 'AI service unavailable. Please try again later.' },
          { status: 503 }
        );
      } else {
        // Something happened in setting up the request
        console.error('Error setting up backend API request:', axiosError.message);
        throw axiosError; // Let the outer catch handle this
      }
    }
    
    const aiResponse = response.data.data.text;
    
    // Parse the response to extract the sections
    const theologicalMatch = aiResponse.match(/Theological Meaning:(.*?)(?=Historical Context:|$)/i);
    const historicalMatch = aiResponse.match(/Historical Context:(.*?)(?=Modern Application:|$)/i);
    const applicationMatch = aiResponse.match(/Modern Application:(.*?)(?=$)/i);
    
    const explanation = {
      theological: theologicalMatch ? theologicalMatch[1].trim() : 'No theological explanation available.',
      historical: historicalMatch ? historicalMatch[1].trim() : 'No historical context available.',
      application: applicationMatch ? applicationMatch[1].trim() : 'No application insights available.',
    };
    
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
  } catch (error) {
    console.error('Error in verse explanation API:', error);
    
    // Handle axios errors with more specific messages
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        // Timeout error
        return NextResponse.json(
          { error: 'Request to AI service timed out. Please try again later.' },
          { status: 504 }
        );
      } else if (error.code === 'ERR_NETWORK') {
        // Network error
        return NextResponse.json(
          { error: 'Unable to connect to AI service. Please ensure backend is running.' },
          { status: 503 }
        );
      } else if (error.code === 'ERR_BAD_REQUEST') {
        // Bad request error
        return NextResponse.json(
          { error: 'AI service rejected the request. Please check your query format.' },
          { status: 400 }
        );
      }
    }
    
    // Generic error fallback
    return NextResponse.json(
      { 
        error: 'Failed to generate verse explanation', 
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined 
      },
      { status: 500 }
    );
  }
}
