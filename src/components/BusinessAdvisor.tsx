'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Lightbulb, TrendingUp, DollarSign, Target, X, Minimize2, Maximize2 } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  suggestions?: string[]
}

interface BusinessAdvisorProps {
  isOpen: boolean
  onClose: () => void
  isMinimized: boolean
  onToggleMinimize: () => void
  planData?: any // The current business plan data
}

const QUICK_PROMPTS = [
  {
    icon: <Lightbulb className="w-4 h-4" />,
    text: "Validate my business idea",
    prompt: "Help me validate my business idea and identify potential challenges and opportunities."
  },
  {
    icon: <TrendingUp className="w-4 h-4" />,
    text: "Growth strategies",
    prompt: "What are the best growth strategies for my type of business?"
  },
  {
    icon: <DollarSign className="w-4 h-4" />,
    text: "Pricing strategy",
    prompt: "Help me develop an effective pricing strategy for my business."
  },
  {
    icon: <Target className="w-4 h-4" />,
    text: "Target market analysis",
    prompt: "Analyze my target market and suggest customer acquisition strategies."
  }
]

export default function BusinessAdvisor({ isOpen, onClose, isMinimized, onToggleMinimize, planData }: BusinessAdvisorProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // Initialize with contextual welcome message
  useEffect(() => {
    if (planData) {
      const contextualMessage: Message = {
        id: '1',
        content: `Hello! I'm your AI Business Advisor and I've analyzed your ${planData.feasibility?.marketType || 'business'} plan. I can see you're planning a ${planData.executiveSummary ? planData.executiveSummary.slice(0, 100) + '...' : 'business venture'}.

I have access to all your business plan data including:
• Market analysis (TAM: ${planData.marketAnalysis?.marketSize?.tam || 'analyzing'})
• Financial projections and startup costs
• Competition and market positioning  
• Growth strategies and roadmap
• Tools and resource recommendations

What specific aspect of your business would you like to discuss or improve?`,
        sender: 'ai',
        timestamp: new Date(),
        suggestions: [
          "How can I improve my marketing strategy?",
          "What are my biggest risks and how to mitigate them?", 
          "How can I optimize my financial projections?",
          "What should I focus on in the next 30 days?"
        ]
      }
      setMessages([contextualMessage])
    } else {
      const genericMessage: Message = {
        id: '1',
        content: "Hello! I'm your AI Business Advisor. I can help you with business planning, market analysis, financial projections, and strategic decisions. What would you like to discuss today?",
        sender: 'ai',
        timestamp: new Date(),
        suggestions: [
          "Validate my business idea",
          "Create a marketing strategy", 
          "Analyze my competition",
          "Help with financial planning"
        ]
      }
      setMessages([genericMessage])
    }
  }, [planData])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Call the real chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          planData: planData
        }),
      })

      const data = await response.json()
      
      if (data.response) {
        return data.response
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Chat API error:', error)
      // Fallback to a simple response if API fails
      return `I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment, or feel free to ask your question in a different way.`
    }
  }

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim()
    if (!text || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(text)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        suggestions: [
          "Tell me more about this",
          "What are the next steps?",
          "How do I implement this?",
          "What are the costs involved?"
        ]
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className={`fixed left-4 bottom-4 z-50 bg-white rounded-2xl shadow-2xl border border-neutral-200 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-[500px] h-[700px] flex flex-col'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-100 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-neutral-100" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">AI Business Advisor</h3>
            <p className="text-xs text-neutral-500">
              {planData ? 'Analyzing your business plan' : 'Always here to help'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleMinimize}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-[500px]">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 ${
                  message.sender === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-neutral-50 text-neutral-900'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.sender === 'ai' && (
                      <Bot className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div 
                        className="text-sm whitespace-pre-wrap" 
                        dangerouslySetInnerHTML={{
                          __html: message.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br/>')
                        }} 
                      />
                      {message.suggestions && (
                        <div className="mt-3 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSendMessage(suggestion)}
                              className="block w-full text-left text-xs bg-white/20 hover:bg-white/30 text-neutral-600 px-2 py-1 rounded-lg transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-50 rounded-2xl p-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-blue-500" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-neutral-100 p-4 flex-shrink-0 bg-white rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your business..."
                className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-neutral-900 placeholder-neutral-500"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
