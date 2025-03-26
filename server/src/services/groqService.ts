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
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userInput
        }
      ];

      const chatCompletion = await this.groq.chat.completions.create({
        messages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9,
        stream: false
      });

      return chatCompletion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error('Failed to generate response from Groq');
    }
  }
}

export default GroqService;