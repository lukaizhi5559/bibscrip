import { NextResponse } from 'next/server';
import { askOpenAI } from '@/utils/ai'; // askOpenAI already exists in utils/ai.ts

export async function POST(req: Request) {
  try {
    const { reference, text, translation } = await req.json();
    
    if (!reference || !text) {
      return new NextResponse(
        JSON.stringify({ error: 'Reference and text are required' }),
        { status: 400 }
      );
    }

    // Create prompt for AI to explain the verse
    const prompt = `
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
    `;

    // Call OpenAI with the prompt
    const aiResponse = await askOpenAI(prompt);
    
    if (!aiResponse) {
      throw new Error('Failed to get a response from AI');
    }
    
    // Parse the response to extract the sections
    // This is a simple parsing approach - you might want to make it more robust
    // or have the AI return structured JSON instead
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
    return new NextResponse(
      JSON.stringify({ error: 'Failed to generate verse explanation' }),
      { status: 500 }
    );
  }
}
