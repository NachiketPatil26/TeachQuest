import { Groq } from 'groq-sdk';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class GroqService {
  private groq: Groq;
  private static instance: GroqService;

  private constructor() {
    this.groq = new Groq();
    this.groq.apiKey = process.env.GROQ_API_KEY;
  }

  public static getInstance(): GroqService {
    if (!GroqService.instance) {
      GroqService.instance = new GroqService();
    }
    return GroqService.instance;
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
      const chatCompletion = await this.groq.chat.completions.create({
        messages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,        // Balanced creativity and consistency
        max_tokens: 1024,        // Sufficient length for detailed responses
        top_p: 0.9,              // High-quality token selection
        stream: false            // Complete response at once
      });

      // Extract and validate response content
      const responseContent = chatCompletion.choices[0]?.message?.content || '';
      return responseContent;
    } catch (error: any) {
      console.error('Groq API error:', error);
      
      // Provide more specific error messages based on error type
      if (error.status === 401 || error.status === 403) {
        return JSON.stringify({
          intent: 'error',
          message: 'Authentication error with AI service',
          suggestion: 'Please check your API key configuration',
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
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
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

export default GroqService;