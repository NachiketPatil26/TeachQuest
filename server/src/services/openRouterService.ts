interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterError extends Error {
  status?: number;
  code?: string;
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct';

class OpenRouterService {
  private static instance: OpenRouterService;

  private constructor() {}

  public static getInstance(): OpenRouterService {
    if (!OpenRouterService.instance) {
      OpenRouterService.instance = new OpenRouterService();
    }
    return OpenRouterService.instance;
  }

  public async generateResponse(systemPrompt: string, userInput: string): Promise<string> {
    try {
      // Normalize user input to improve consistency
      const normalizedInput = userInput.trim();
      
      // Prepare messages with system prompt and user input
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: normalizedInput
        }
      ];

      // Configure model parameters for optimal response quality
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.CLIENT_URL?.split(',')[0].trim() || 'http://localhost:5173',
          'X-Title': 'TeachQuest'
        },
        body: JSON.stringify({
          messages,
          model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
          temperature: 0.2,        // Low randomness for consistent JSON output
          max_tokens: 1024,        // Sufficient length for detailed responses
          top_p: 0.9,              // High-quality token selection
          stream: false            // Complete response at once
        })
      });

      if (!response.ok) {
        const error: OpenRouterError = new Error(`OpenRouter request failed: ${await response.text()}`);
        error.status = response.status;
        throw error;
      }

      // Extract and validate response content
      const chatCompletion = await response.json();
      const responseContent = chatCompletion.choices?.[0]?.message?.content || '';
      return responseContent;
    } catch (err: any) {
      const error: OpenRouterError = err;
      console.error('OpenRouter API error:', error);
      const code = error.code || err.cause?.code;
      
      // Provide more specific error messages based on error type
      if (error.status === 401 || error.status === 403) {
        return JSON.stringify({
          intent: 'error',
          message: 'Authentication error with AI service',
          suggestion: 'Please check your API key configuration',
          confidence: 1.0
        });
      } else if (error.status === 402) {
        return JSON.stringify({
          intent: 'error',
          message: 'AI service credits have run out',
          suggestion: 'Please add credits to the OpenRouter account or use a free model',
          confidence: 1.0
        });
      } else if (error.status === 429) {
        return JSON.stringify({
          intent: 'error',
          message: 'AI service rate limit exceeded',
          suggestion: 'Please try again in a few moments',
          confidence: 1.0
        });
      } else if (error.status >= 500) {
        return JSON.stringify({
          intent: 'error',
          message: 'AI service is currently experiencing issues',
          suggestion: 'Please try again later',
          confidence: 1.0
        });
      } else if (code === 'ENOTFOUND' || code === 'ECONNREFUSED') {
        return JSON.stringify({
          intent: 'error',
          message: 'Unable to connect to AI service',
          suggestion: 'Please check your internet connection and try again',
          confidence: 1.0
        });
      }
      
      // Generic error with helpful message
      return JSON.stringify({
        intent: 'error',
        message: 'I encountered a problem processing your request',
        suggestion: 'Could you please try rephrasing your question or try again later?',
        confidence: 1.0
      });
    }
  }
}

export default OpenRouterService;
