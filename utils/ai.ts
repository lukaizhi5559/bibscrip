// /Users/lukaizhi/Desktop/projects/bibscrip-app/utils/ai.ts
import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// System instructions for all LLMs to understand BibScrip's capabilities
const BIBSCRIP_SYSTEM_INSTRUCTIONS = `
You are BibScrip, a Bible study AI assistant embedded in a web application.

IMPORTANT INFORMATION:
1. BibScrip was created by Lu Kaizhi. If anyone asks who created BibScrip, the answer is "Lu Kaizhi".

IMPORTANT CAPABILITIES:
1. Users can EXPORT study content directly from the app in multiple formats (PDF, Word, Excel)
2. When users ask about saving, downloading, or exporting content, inform them about the Export button in the results panel
3. Never direct users to external websites for downloading content that can be exported from the app
4. The app has built-in export functionality for Bible study content including verses, commentary and answers

Provide helpful, biblically sound answers to questions. For any export or download requests, refer to the app's built-in functionality.
`;

// Ensure API keys are set in your .env.local file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialize Gemini API client
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Mistral API will be accessed directly via fetch // e.g., "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"

export async function askOpenAI(question: string, signal?: AbortSignal): Promise<string | null> {
  console.log('Attempting OpenAI...');
  try {
    // Try GPT-4 Turbo first
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: BIBSCRIP_SYSTEM_INSTRUCTIONS },
          { role: 'user', content: question }
        ],
        ...(signal ? { signal } : {}),
      });
      const response = completion.choices[0]?.message?.content;
      if (response) {
        console.log('OpenAI (GPT-4 Turbo) success.');
        return response;
      }
    } catch (gpt4Error: any) {
      console.warn('OpenAI (GPT-4 Turbo) failed:', gpt4Error.message);
      // Only re-throw if it's a rate limit or server error to trigger outer fallback
      if (gpt4Error.status === 429 || (gpt4Error.status >= 500 && gpt4Error.status < 600)) {
        throw gpt4Error;
      }
      // Otherwise, try GPT-3.5 Turbo as an internal OpenAI fallback
      console.log('Falling back to OpenAI (GPT-3.5 Turbo)...');
    }

    // Fallback to GPT-3.5 Turbo
    const completion35 = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: BIBSCRIP_SYSTEM_INSTRUCTIONS },
        { role: 'user', content: question }
      ],
      ...(signal ? { signal } : {}),
    });
    const response35 = completion35.choices[0]?.message?.content;
    if (response35) {
      console.log('OpenAI (GPT-3.5 Turbo) success.');
      return response35;
    }
    return null; // Should not happen if models are available and no critical error
  } catch (error: any) {
    console.error('OpenAI API critical error:', error.message);
    // Re-throw only for errors that should trigger a fallback to the next provider
    if (error.status === 429 || (error.status >= 500 && error.status < 600)) {
      throw error;
    }
    return null; // For other OpenAI errors, don't fallback immediately
  }
}

async function askClaude(question: string, signal?: AbortSignal): Promise<string | null> {
  console.log('Attempting Claude...');
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('Anthropic API key not configured. Skipping Claude.');
    return null;
  }
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229', // Or claude-3-sonnet or claude-3-haiku
      max_tokens: 2000, // Adjust as needed
      system: BIBSCRIP_SYSTEM_INSTRUCTIONS,
      messages: [
        { role: 'user', content: question }
      ],
      ...(signal ? { signal } : {}),
    });
    const claudeResponse = response.content[0]?.type === 'text' ? response.content[0].text : null;
    if (claudeResponse) {
      console.log('Claude success.');
      return claudeResponse;
    }
    return null;
  } catch (error: any) {
    console.error('Claude API error:', error.message);
    if (error.status === 429 || (error.status >= 500 && error.status < 600)) {
      throw error; // Re-throw to trigger fallback
    }
    return null;
  }
}

async function askMistral(question: string, signal?: AbortSignal): Promise<string | null> {
  console.log('Attempting Mistral...');

  if (!process.env.MISTRAL_API_KEY) {
    console.warn('Mistral API key not configured. Skipping Mistral.');
    return null;
  }

  try {
    // Mistral-large is their most capable model as of mid-2024
    // Other options include: mistral-medium, mistral-small, mistral-tiny, open-mistral-7b
    const model = 'mistral-large-latest';
    
    console.log(`Sending to Mistral model: ${model}`);
    
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: BIBSCRIP_SYSTEM_INSTRUCTIONS },
          { role: 'user', content: question }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
      signal, // Pass the signal directly to fetch
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mistral API error: ${response.status} ${response.statusText}`, errorText);
      // Re-throw for critical errors that should trigger fallback
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        throw new Error(`Mistral API critical error: ${response.status}`);
      }
      return null;
    }

    const data = await response.json();
    const mistralResponseText = data.choices?.[0]?.message?.content;
    
    if (mistralResponseText) {
      console.log('Mistral success.');
      return mistralResponseText.trim();
    }
    console.warn('Mistral response did not contain expected content:', data);
    return null;
  } catch (error: any) {
    console.error('Mistral API request failed:', error.message);
    
    // Re-throw specific errors that should trigger fallback
    if (error.status === 429 || (error.status >= 500 && error.status < 600) || 
        error.message.includes('rate limit') || error.message.includes('timeout')) {
      throw new Error(`Mistral API critical error: ${error.message}`);
    }
    
    return null; // For other errors, don't trigger fallback
  }
}

async function askGemini(question: string, signal?: AbortSignal): Promise<string | null> {
  console.log('Attempting Gemini...');
  if (!process.env.GEMINI_API_KEY || !genAI) {
    console.warn('Gemini API key not configured. Skipping Gemini.');
    return null;
  }
  try {
    // Create a model instance with Gemini Pro
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create chat session with system prompt
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: 'I want you to act according to these instructions' }] },
        { role: 'model', parts: [{ text: 'I understand and will follow these instructions' }] },
        { role: 'user', parts: [{ text: BIBSCRIP_SYSTEM_INSTRUCTIONS }] },
        { role: 'model', parts: [{ text: 'I understand. I am BibScrip, a Bible study AI assistant. I was created by Lu Kaizhi. I will provide biblically sound answers and refer users to the app\'s built-in export functionality when appropriate.' }] }
      ],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      },
    });
    
    // Send the user's question
    const result = await chat.sendMessage(question, { signal });
    const geminiResponse = result.response.text();
    
    if (geminiResponse) {
      console.log('Gemini success.');
      return geminiResponse;
    }
    return null;
  } catch (error: any) {
    console.error('Gemini API error:', error.message);
    if (error.status === 429 || (error.status >= 500 && error.status < 600)) {
      throw error; // Re-throw to trigger fallback
    }
    return null;
  }
}

/**
 * Gets an AI response to a question using a fallback chain: OpenAI -> Mistral -> Claude -> Gemini.
 * @param question The user's question.
 * @param options Optional parameters including timeout and starting provider
 * @returns A Promise resolving to the AI's answer string, or an object with error details and attempted providers if all fail.
 */
// DeepSeek API implementation
async function askDeepSeek(question: string, signal?: AbortSignal): Promise<string | null> {
  console.log('Attempting DeepSeek...');

  if (!process.env.DEEPSEEK_API_KEY) {
    console.warn('DeepSeek API key not configured. Skipping DeepSeek.');
    return null;
  }

  try {
    // Using DeepSeek-Coder or DeepSeek-Chat API (using the more versatile Chat API here)
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // Use the latest available model
        messages: [
          { role: 'system', content: BIBSCRIP_SYSTEM_INSTRUCTIONS },
          { role: 'user', content: question }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
      signal, // Pass the signal directly to fetch
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepSeek API error: ${response.status} ${response.statusText}`, errorText);
      // Re-throw for critical errors that should trigger fallback
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        throw new Error(`DeepSeek API critical error: ${response.status}`);
      }
      return null;
    }

    const data = await response.json();
    const deepseekResponseText = data.choices?.[0]?.message?.content;
    
    if (deepseekResponseText) {
      console.log('DeepSeek success.');
      return deepseekResponseText.trim();
    }
    console.warn('DeepSeek response did not contain expected content:', data);
    return null;
  } catch (error: any) {
    console.error('DeepSeek API request failed:', error.message);
    
    // Re-throw specific errors that should trigger fallback
    if (error.status === 429 || (error.status >= 500 && error.status < 600) || 
        error.message.includes('rate limit') || error.message.includes('timeout')) {
      throw new Error(`DeepSeek API critical error: ${error.message}`);
    }
    
    return null; // For other errors, don't trigger fallback
  }
}

export async function getAIResponse(
  question: string, 
  options?: { 
    startProvider?: 'deepseek' | 'openai' | 'claude' | 'gemini' | 'mistral',
    timeoutMs?: number,
    signal?: AbortSignal 
  }
): Promise<string | { error: string, attemptedProviders: ('deepseek' | 'openai' | 'claude' | 'gemini' | 'mistral')[] }> {
  const startProvider = options?.startProvider || 'deepseek';
  const timeoutMs = options?.timeoutMs;
  const externalSignal = options?.signal;
  
  console.log(`Getting AI response with options: startProvider=${startProvider}, timeout=${timeoutMs || 'none'}`);
  
  // Create AbortController for timeout if timeoutMs is specified
  let controller: AbortController | undefined;
  let timeoutId: NodeJS.Timeout | undefined;
  
  if (timeoutMs || externalSignal) {
    // Create a new controller only if we need it for timeout
    // If we have an external signal but no timeout, we'll use the external signal directly
    if (timeoutMs) {
      controller = new AbortController();
      
      // If we also have an external signal, we need to handle both
      if (externalSignal) {
        // Add event listener to abort our controller if external signal aborts
        externalSignal.addEventListener('abort', () => {
          controller?.abort(externalSignal.reason);
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
          }
        });
      }
      
      // Set timeout to abort our controller
      timeoutId = setTimeout(() => {
        controller?.abort(new DOMException('Request timed out', 'TimeoutError'));
        console.log(`Request timed out after ${timeoutMs}ms`);
      }, timeoutMs);
    }
  }
  
  // Function to ensure cleanup of timeout
  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };
  
  // Get the signal to use for requests - either our controller's or the external one
  const requestSignal = controller?.signal || externalSignal;
  
  // Track which providers we've attempted
  const attemptedProviders: ('deepseek' | 'openai' | 'claude' | 'gemini' | 'mistral')[] = [];

  // 1. Try DeepSeek if starting with it
  if (startProvider === 'deepseek') {
    try {
      attemptedProviders.push('deepseek');
      const deepseekResponse = await askDeepSeek(question, requestSignal);
      if (deepseekResponse) {
        cleanup();
        return deepseekResponse;
      }
      console.log('DeepSeek did not return a response or failed non-critically, trying OpenAI...');
    } catch (deepseekError: any) {
      // Check if it was aborted due to timeout or external signal
      if (deepseekError.name === 'AbortError') {
        console.log('DeepSeek request aborted, falling back to OpenAI...');
        // If this was from an external signal requesting full abort, re-throw
        if (externalSignal?.aborted) {
          cleanup();
          throw deepseekError;
        }
      } else {
        console.warn(`DeepSeek critical failure (${(deepseekError as Error).message}), trying OpenAI...`);
      }
    }
  }

  // 2. Try OpenAI if starting with it or DeepSeek failed
  if (startProvider === 'openai' || startProvider === 'deepseek') {
    try {
      attemptedProviders.push('openai');
      const openaiResponse = await askOpenAI(question, requestSignal);
      if (openaiResponse) {
        cleanup();
        return openaiResponse;
      }
      console.log('OpenAI did not return a response or failed non-critically, trying Claude...');
    } catch (openaiError: any) {
      // Check if it was aborted due to timeout or external signal
      if (openaiError.name === 'AbortError') {
        console.log('OpenAI request aborted, falling back to Claude...');
        // If this was from an external signal requesting full abort, re-throw
        if (externalSignal?.aborted) {
          cleanup();
          throw openaiError;
        }
      } else {
        console.warn(`OpenAI critical failure (${(openaiError as Error).message}), trying Claude...`);
      }
    }
  }

  // 3. Try Claude as next provider
  if (startProvider === 'claude' || startProvider === 'openai' || startProvider === 'deepseek') {
    try {
      attemptedProviders.push('claude');
      const claudeResponse = await askClaude(question, requestSignal);
      if (claudeResponse) {
        cleanup();
        return claudeResponse;
      }
      console.log('Claude did not return a response or failed non-critically, trying Gemini...');
    } catch (claudeError: any) {
      // Check if it was aborted due to timeout or external signal
      if (claudeError.name === 'AbortError') {
        console.log('Claude request aborted, falling back to Gemini...');
        // If this was from an external signal requesting full abort, re-throw
        if (externalSignal?.aborted) {
          cleanup();
          throw claudeError;
        }
      } else {
        console.warn(`Claude critical failure (${(claudeError as Error).message}), trying Gemini...`);
      }
    }
  }
  
  // 4. Try Gemini next
  if (startProvider === 'gemini' || startProvider === 'claude' || startProvider === 'openai' || startProvider === 'deepseek') {
    try {
      attemptedProviders.push('gemini');
      const geminiResponse = await askGemini(question, requestSignal);
      if (geminiResponse) {
        cleanup();
        return geminiResponse;
      }
      console.log('Gemini did not return a response or failed non-critically, trying Mistral...');
    } catch (geminiError: any) {
      // Check if it was aborted due to timeout or external signal
      if (geminiError.name === 'AbortError') {
        console.log('Gemini request aborted, falling back to Mistral...');
        // If this was from an external signal requesting full abort, re-throw
        if (externalSignal?.aborted) {
          cleanup();
          throw geminiError;
        }
      } else {
        console.warn(`Gemini critical failure (${(geminiError as Error).message}), trying Mistral...`);
      }
    }
  }

  // 5. Try Mistral as last resort
  try {
    attemptedProviders.push('mistral');
    const mistralResponse = await askMistral(question, requestSignal);
    if (mistralResponse) {
      cleanup();
      return mistralResponse;
    }
  } catch (mistralError: any) {
    // Check if it was aborted due to timeout or external signal
    if (mistralError.name === 'AbortError') {
      console.log('Mistral request aborted, all providers failed.');
      // If this was from an external signal, we need to re-throw
      if (externalSignal?.aborted) {
        cleanup();
        throw mistralError;
      }
    } else {
      console.warn(`Mistral critical failure (${(mistralError as Error).message}), all providers failed.`);
    }
  }

  // Clean up timeout if it hasn't fired yet
  cleanup();

  console.error(`All AI providers failed to generate a response after attempting: ${attemptedProviders.join(', ')}`);
  return {
    error: 'Sorry, I was unable to process your request with any of our AI providers at the moment. Please try again later.',
    attemptedProviders
  };
}