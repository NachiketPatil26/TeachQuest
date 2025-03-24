import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Bot, User, X } from 'lucide-react';
import api from '../../services/api';

// Define proper types for the API response and error
interface ApiResponse {
  message: string;
  thinking?: string;
  result?: {
    statusCode: number;
    [key: string]: unknown;
  };
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
  thinking?: string;
  result?: ApiResponse['result'];
  displayedText?: string; // For typewriter effect
}

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your TeachQuest Assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
      displayedText: 'Hello! I\'m your TeachQuest Assistant. How can I help you today?' // Initial message is fully displayed
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingSpeed = 20; // milliseconds per character

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Typewriter effect
  useEffect(() => {
    const currentTypingMessage = messages.find(msg => msg.id === typingMessageId);
    
    if (!currentTypingMessage || currentTypingMessage.isLoading || currentTypingMessage.sender !== 'ai') {
      return;
    }
    
    if (currentTypingMessage.displayedText === currentTypingMessage.text) {
      setTypingMessageId(null);
      return;
    }
    
    const currentLength = currentTypingMessage.displayedText?.length || 0;
    const targetText = currentTypingMessage.text;
    
    if (currentLength < targetText.length) {
      const timer = setTimeout(() => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === typingMessageId
              ? {
                  ...msg,
                  displayedText: targetText.substring(0, currentLength + 1)
                }
              : msg
          )
        );
      }, typingSpeed);
      
      return () => clearTimeout(timer);
    }
  }, [messages, typingMessageId]);



  // Optimized message extraction function
  const extractMessageContent = (messageText: string): { message: string, thinking: string } => {
    let thinking = '';
    let message = messageText;
    
    // Fast check if we need to do any processing
    if (!message.includes('<') && !message.includes('{')) {
      return { message, thinking };
    }
    
    // Try to parse as JSON first (faster than regex for valid JSON)
    try {
      const parsedMessage = JSON.parse(message);
      
      // Case 1: Standard format with message field
      if (parsedMessage && typeof parsedMessage.message === 'string') {
        // Extract only the message content, ignoring all metadata fields
        message = parsedMessage.message;
        thinking = parsedMessage.thinking || '';
        
        // Log all metadata fields that were filtered out
        const metadataFields = Object.keys(parsedMessage).filter(key => 
          key !== 'message' && key !== 'thinking');
          
        if (metadataFields.length > 0) {
          console.log('Filtered metadata from AI response:', metadataFields);
        }
        
        return { message, thinking };
      }
      
      // Case 2: JSON with intent/confidence metadata format
      // Handles: { "intent": "chat", "message": "Hello!", "confidence": 0.95 }
      if (parsedMessage && 
          typeof parsedMessage.message === 'string' && 
          (typeof parsedMessage.intent === 'string' || 
           typeof parsedMessage.confidence === 'number')) {
        console.log('Filtered intent/confidence metadata from AI response');
        return { message: parsedMessage.message, thinking };
      }
      
      // Case 3: If it's valid JSON but doesn't match our expected formats,
      // convert it back to string for display (fallback)
      message = JSON.stringify(parsedMessage, null, 2);
    } catch {
      // Not valid JSON, continue with tag extraction
    }
    
    // Extract thinking content with a single regex operation
    const thinkRegex = /<think>([\s\S]*?)<\/think>|<thinking>([\s\S]*?)<\/thinking>/g;
    let match;
    const thinkingParts = [];
    
    while ((match = thinkRegex.exec(message)) !== null) {
      thinkingParts.push(match[1] || match[2]);
    }
    
    if (thinkingParts.length > 0) {
      thinking = thinkingParts.join('\n');
      // Remove all thinking tags in one operation
      message = message.replace(/<think>([\s\S]*?)<\/think>|<thinking>([\s\S]*?)<\/thinking>/g, '');
    }
    
    return { message: message.trim(), thinking };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    const aiLoadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Processing your request...',
      sender: 'ai',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, aiLoadingMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Use a timeout to abort the request if it takes too long
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 15 second timeout
      
      const response = await api.post<ApiResponse>('/api/ai/process', 
        { input: userMessage.text },
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      // Process the response data
      let messageText = response.data.message || '';
      let thinkingText = response.data.thinking || '';
      
      // If no thinking was provided directly, extract it from the message
      if (!thinkingText) {
        const extracted = extractMessageContent(messageText);
        messageText = extracted.message;
        thinkingText = extracted.thinking;
      }
      
      // Update the message with the processed content
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiLoadingMessage.id 
            ? {
                ...msg,
                text: messageText,
                displayedText: '', // Start with empty displayed text for typewriter effect
                thinking: thinkingText,
                isLoading: false,
                result: response.data.result
              }
            : msg
        )
      );
      
      // Start typewriter effect for this message
      setTypingMessageId(aiLoadingMessage.id);
    } catch (error) { 
      console.error('AI processing error:', error);
      let errorMessage = 'Sorry, I encountered an error processing your request.';
      
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        errorMessage = 'Request timed out. The AI service is taking longer than expected to respond.';
      }
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiLoadingMessage.id 
            ? {
                ...msg,
                text: errorMessage,
                isLoading: false
              }
            : msg
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#9FC0AE] text-white rounded-full shadow-lg hover:bg-[#8BAF9A] transition-all duration-300 flex items-center justify-center z-50"
      >
        <Bot size={24} />
      </button>

      {/* Chat interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] z-50">
          <div className="flex flex-col h-full bg-white rounded-lg shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-[#9FC0AE] text-white rounded-t-lg flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="mr-2" size={20} />
                <h2 className="text-lg font-semibold">TeachQuest Assistant</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-[#9FC0AE] text-white rounded-tr-none' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {message.sender === 'ai' ? (
                        <Bot size={16} className="mr-1" />
                      ) : (
                        <User size={16} className="mr-1" />
                      )}
                      <span className="text-xs opacity-75">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div>
                      {message.isLoading ? (
                        <div className="flex items-center">
                          <Loader className="animate-spin mr-2" size={16} />
                          {message.text}
                        </div>
                      ) : (
                        <>
                          {message.thinking && (
                            <div className="mb-3 p-3 bg-gray-50 text-gray-600 text-sm rounded-md border border-gray-200 shadow-sm">
                              <div className="flex items-center mb-2 pb-1 border-b border-gray-200">
                                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <span className="font-medium text-gray-700">Thinking</span>
                              </div>
                              <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                                {message.thinking}
                              </div>
                            </div>
                          )}
                          {message.sender === 'ai' && typingMessageId === message.id ? (
                            <>
                              {message.displayedText}
                              <span className="inline-block w-1 h-4 ml-1 bg-gray-500 animate-pulse"></span>
                            </>
                          ) : (
                            message.sender === 'ai' ? message.displayedText || message.text : message.text
                          )}
                        </>
                      )}
                    </div>
                    
                    {message.result && message.result.statusCode === 201 && (
                      <div className="mt-2 p-2 bg-green-100 text-green-800 text-sm rounded">
                        Action completed successfully!
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your request..."
                  className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#9FC0AE]"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  className="bg-[#9FC0AE] text-white p-2 rounded-r-lg hover:bg-[#8BAF9A] disabled:opacity-50"
                  disabled={!input.trim() || isProcessing}
                >
                  {isProcessing ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistant;