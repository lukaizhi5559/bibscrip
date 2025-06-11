/**
 * AI Service
 * Provides methods for interacting with the AI API endpoints
 */

import axios from 'axios';
import { ENDPOINTS } from '../lib/api-config';

// Interface for AI response
export interface AiResponse {
  answer: string;
  sources?: any[];
  metadata?: Record<string, any>;
}

// Interface for verse explanation
export interface VerseExplanation {
  theological: string;
  historical: string;
  application: string;
}

/**
 * Service class for AI-related API operations
 */
class AiService {
  /**
   * Ask a question to the AI
   * @param question The question to ask
   * @param options Additional options
   */
  async askQuestion(question: string, options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
    stream?: boolean;
  }): Promise<AiResponse> {
    try {
      const response = await axios.post(ENDPOINTS.ASK, {
        query: question,
        ...options
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error asking AI question:', error);
      throw error;
    }
  }

  /**
   * Generate text using AI
   * @param prompt The prompt for text generation
   * @param options Additional options
   */
  async generateText(prompt: string, options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  }): Promise<string> {
    try {
      const response = await axios.post(ENDPOINTS.GENERATE.TEXT, {
        prompt,
        ...options
      });
      
      return response.data.data.text;
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }

  /**
   * Generate verse explanation using AI
   * @param reference Bible verse reference
   * @param text Bible verse text
   * @param translation Bible translation
   */
  async explainVerse(
    reference: string, 
    text: string, 
    translation: string
  ): Promise<VerseExplanation> {
    try {
      // Construct prompt for the backend AI API
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
      
      // Use the backend text generation API
      const response = await this.generateText(prompt, {
        model: 'gpt-4', // Specify model if available on backend
        temperature: 0.7,
        maxTokens: 2000,
      });
      
      // Parse the response to extract the sections
      const theologicalMatch = response.match(/Theological Meaning:(.*?)(?=Historical Context:|$)/i);
      const historicalMatch = response.match(/Historical Context:(.*?)(?=Modern Application:|$)/i);
      const applicationMatch = response.match(/Modern Application:(.*?)(?=$)/i);
      
      return {
        theological: theologicalMatch ? theologicalMatch[1].trim() : 'No theological explanation available.',
        historical: historicalMatch ? historicalMatch[1].trim() : 'No historical context available.',
        application: applicationMatch ? applicationMatch[1].trim() : 'No application insights available.',
      };
    } catch (error) {
      console.error('Error explaining verse:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const aiService = new AiService();
