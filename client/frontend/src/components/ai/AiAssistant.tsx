import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Bot, User, X } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
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
  // Add CSS animations and advanced styling
  useEffect(() => {
    // Add animation classes and styling to the global stylesheet
    const style = document.createElement('style');
    style.innerHTML = `
      /* Enhanced animations */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(25px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes slideInLeft {
        from { opacity: 0; transform: translateX(-25px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes pulse-slow {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(159, 192, 174, 0.7); }
        50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(159, 192, 174, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(159, 192, 174, 0); }
      }
      
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
        100% { transform: translateY(0px); }
      }
      
      @keyframes typing {
        0% { opacity: 0.3; }
        50% { opacity: 1; }
        100% { opacity: 0.3; }
      }
      
      @keyframes borderPulse {
        0% { border-color: rgba(159, 192, 174, 0.6); }
        50% { border-color: rgba(159, 192, 174, 1); }
        100% { border-color: rgba(159, 192, 174, 0.6); }
      }
      
      /* Animation classes */
      .animate-fadeIn {
        animation: fadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }
      
      .animate-slideInRight {
        animation: slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }
      
      .animate-slideInLeft {
        animation: slideInLeft 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }
      
      .animate-pulse-slow {
        animation: pulse-slow 3s infinite;
      }
      
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      .animate-shimmer {
        background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%);
        background-size: 200% 100%;
        animation: shimmer 3s infinite;
      }
      
      .animate-typing {
        animation: typing 1.5s infinite;
      }
      
      .animate-border-pulse {
        animation: borderPulse 2s infinite;
      }
      
      /* Glass morphism effects */
      .glass-effect {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
      }
      
      .glass-effect-dark {
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
      }
      
      /* Custom scrollbar for the chat */
      .ai-chat-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      
      .ai-chat-scrollbar::-webkit-scrollbar-track {
        background: rgba(241, 245, 249, 0.5);
        border-radius: 10px;
      }
      
      .ai-chat-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(159, 192, 174, 0.5);
        border-radius: 10px;
        transition: all 0.3s ease;
      }
      
      .ai-chat-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(159, 192, 174, 0.8);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
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
  const [isPaused, setIsPaused] = useState(false); // New state for pause functionality
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
    
    // If paused, don't continue typing and prepare for next input
    if (isPaused) {
      // Complete the message immediately when paused
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === typingMessageId
            ? {
                ...msg,
                displayedText: msg.text // Show full text immediately
              }
            : msg
        )
      );
      setTypingMessageId(null); // Reset typing message ID
      setIsPaused(false); // Reset pause state for next message
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
  }, [messages, typingMessageId, isPaused]); // Added isPaused to dependency array



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
      {/* Floating button with pulse animation */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-[#9FC0AE] to-[#7DA899] text-white rounded-full shadow-xl hover:shadow-2xl animate-pulse-slow transition-all duration-300 flex items-center justify-center z-50 border-2 border-white"
        aria-label="Open AI Assistant"
      >
        <div className="relative">
          <Bot size={28} className="animate-float" />
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
          )}
        </div>
      </button>

      {/* Chat interface with glass morphism */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[420px] max-w-[calc(100vw-3rem)] h-[600px] z-50 animate-fadeIn">
          <div className="flex flex-col h-full glass-effect rounded-2xl shadow-2xl overflow-hidden border border-white/20">
            {/* Header with improved gradient */}
            <div className="p-4 bg-gradient-to-r from-[#9FC0AE] via-[#8BAF9A] to-[#7DA899] text-white rounded-t-2xl flex items-center justify-between shadow-md">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-full mr-3">
                  <Bot className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">TeachQuest Assistant</h2>
                  <div className="flex items-center text-xs text-white/80">

                  
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-white/20 p-2 rounded-full text-white hover:bg-white/30 hover:scale-110 transition-all duration-200"
                aria-label="Close AI Assistant"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages with improved styling */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gradient-to-b from-gray-50/90 to-white/90 ai-chat-scrollbar">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-4 rounded-2xl transition-all duration-300 ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-[#9FC0AE] to-[#7DA899] text-white rounded-tr-none shadow-lg animate-slideInRight' 
                        : 'glass-effect rounded-tl-none shadow-md animate-slideInLeft'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {message.sender === 'ai' ? (
                        <div className="bg-[#9FC0AE]/20 p-1 rounded-full mr-2">
                          <Bot size={14} className="text-[#7DA899]" />
                        </div>
                      ) : (
                        <div className="bg-white/30 p-1 rounded-full mr-2">
                          <User size={14} className="text-white" />
                        </div>
                      )}
                      <span className={`text-xs ${message.sender === 'user' ? 'text-white/80' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className={`${message.sender === 'user' ? 'text-white' : 'text-gray-800'} leading-relaxed`}>
                      {message.isLoading ? (
                        <div className="flex items-center">
                          <div className="flex space-x-1 mr-2">
                            <div className="w-2 h-2 bg-current rounded-full animate-typing" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                          <span>{message.text}</span>
                        </div>
                      ) : (
                        <>
                          {message.thinking && (
                            <div className="mb-4 p-4 bg-[#F8FAFC] text-gray-700 text-sm rounded-xl border border-gray-200/50 shadow-sm">
                              <div className="flex items-center mb-2 pb-2 border-b border-gray-200/50">
                                <svg className="w-4 h-4 mr-2 text-[#9FC0AE]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <span className="font-semibold text-[#7DA899]">Thinking Process</span>
                              </div>
                              <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-gray-600 max-h-40 overflow-y-auto ai-chat-scrollbar">
                                {message.thinking}
                              </div>
                            </div>
                          )}
                          {message.sender === 'ai' && typingMessageId === message.id ? (
                            <div className="relative">
                              <div>{message.displayedText}</div>
                              <span className="inline-block w-2 h-5 ml-1 bg-[#9FC0AE] animate-pulse absolute"></span>
                            </div>
                          ) : (
                            message.sender === 'ai' ? message.displayedText || message.text : message.text
                          )}
                        </>
                      )}
                    </div>
                    
                    {message.result && message.result.statusCode === 201 && (
                      <div className="mt-3 p-3 bg-green-100/80 text-green-800 text-sm rounded-xl border border-green-200/50 shadow-sm">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-medium">Action completed successfully!</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form with improved styling */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/20 glass-effect">
              <div className="flex items-center relative">
                <TextareaAutosize
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Type your request..."
                  className="flex-1 p-3 pr-12 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9FC0AE] focus:border-transparent resize-none max-h-32 shadow-inner text-gray-700 placeholder-gray-400"
                  minRows={1}
                  maxRows={5}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {typingMessageId ? (
                    <button 
                      onClick={() => setIsPaused(!isPaused)}
                      className="bg-[#9FC0AE]/10 hover:bg-[#9FC0AE]/20 p-2 rounded-full text-[#7DA899] transition-colors duration-200"
                      title={isPaused ? "Resume response" : "Pause response"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                      </svg>
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      className="bg-gradient-to-r from-[#9FC0AE] to-[#7DA899] p-2 rounded-full text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed animate-border-pulse"
                      disabled={isProcessing || !input.trim()}
                    >
                      {isProcessing ? (
                        <Loader className="animate-spin" size={18} />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-2 text-xs text-center text-gray-400">
                Press Enter to send, Shift+Enter for new line
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistant;