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
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Enhanced responses with plan context
    if (planData) {
      const planContext = {
        businessType: planData.feasibility?.marketType || 'business',
        marketSize: planData.marketAnalysis?.marketSize,
        financials: planData.financialProjections || planData.financialAnalysis,
        marketing: planData.marketingStrategy,
        competition: planData.competitiveAnalysis,
        risks: planData.riskAnalysis || planData.riskAssessment,
        tools: planData.recommendedTools || [],
        actionPlan: planData.actionPlan || []
      }

      const message = userMessage.toLowerCase()

      if (message.includes('marketing') || message.includes('promote') || message.includes('customer') || message.includes('traffic') || message.includes('visitors') || message.includes('audience')) {
        return `Let me give you realistic timelines for building traffic to your ${planContext.businessType} business:

**The Traffic Reality Check:**
Getting meaningful traffic takes time, but I can give you realistic expectations based on your coffee shop concept.

**Timeline Breakdown:**

**Month 1-3: Foundation & Local Awareness**
- **Foot Traffic**: 20-50 customers/day initially
- **Digital Presence**: 100-500 social media followers
- **Local SEO**: Start appearing in "coffee near me" searches
- **Key Focus**: Grand opening buzz, local partnerships, community engagement

**Month 4-6: Building Momentum**
- **Foot Traffic**: 50-150 customers/day
- **Digital Growth**: 500-1,500 followers across platforms
- **Review Building**: 20-50 Google/Yelp reviews
- **Key Focus**: Loyalty program, word-of-mouth marketing, consistent quality

**Month 7-12: Sustainable Growth**
- **Foot Traffic**: 150-300+ customers/day
- **Digital Presence**: 1,500-5,000 engaged followers
- **Market Position**: Recognized local destination
- **Key Focus**: Expansion planning, catering services, events

**Acceleration Strategies:**
1. **Location Advantage**: Your downtown Seattle location is HUGE - capitalize on foot traffic immediately
2. **Community Integration**: Partner with local businesses, office buildings, events
3. **Social Proof**: Encourage Instagram-worthy moments with unique aesthetics
4. **Consistency**: Be open when you say you'll be open - reliability builds traffic

**Critical Success Factors:**
- **Quality First**: One bad experience can kill 10 potential customers
- **Local Partnerships**: Connect with nearby offices for corporate catering
- **Events**: Host community events to build awareness

**Investment Timeline**: Your $50-100k budget should focus 30% on marketing in the first 6 months.

What specific type of traffic are you most concerned about - foot traffic or digital/online presence?`
      }

      if (message.includes('risk') || message.includes('challenge') || message.includes('problem')) {
        return `Let me give you some real talk about the risks I'm seeing and how to think about them strategically:

**The Reality Check:**
Every business faces risks, but most entrepreneurs either ignore them or get paralyzed by them. The smart approach is systematic risk management.

**Here's What Keeps Me Up at Night for Your Business:**
1. **Cash Flow Reality**: 82% of businesses fail due to cash flow problems, not lack of profit. Your biggest risk isn't competition - it's running out of money before you find product-market fit.

2. **Market Timing**: You might be too early (customers aren't ready) or too late (market is saturated). ${planContext.businessType} businesses especially need to nail timing.

3. **Founder-Market Fit**: Do you have the specific skills and network needed for THIS business? Being a good entrepreneur isn't enough - you need to be the RIGHT entrepreneur for this opportunity.

**My Strategic Framework for Risk:**
- **Probability x Impact Matrix**: Rate each risk 1-10 on likelihood and potential damage
- **Early Warning Signals**: Define specific metrics that indicate when a risk is materializing
- **Contingency Triggers**: Decide in advance what you'll do if metrics hit certain thresholds

**The One Risk That Matters Most:**
For your business, I'd bet the biggest risk is customer acquisition cost exceeding lifetime value. This kills more startups than any external factor.

**Immediate Action**: Create a simple risk dashboard with 3-5 key metrics you'll track weekly. What's your biggest fear about this business right now?`
      }

      if (message.includes('financial') || message.includes('money') || message.includes('revenue') || message.includes('cost')) {
        return `Let me break down the financial realities and give you some hard truths about making money:

**The Financial Foundation Truth:**
Most business plans are overly optimistic on revenue and underestimate costs by 50-100%. I'm going to help you think like an investor, not just an entrepreneur.

**Revenue Reality Check:**
Your revenue projections need the "grandmother test" - could you explain to your grandmother exactly how you'll make each dollar? If not, your model needs work.

**The 3 Financial Metrics That Matter:**
1. **Unit Economics**: Can you make money on a single customer? If LTV/CAC ratio is below 3:1, you have a problem.
2. **Cash Conversion Cycle**: How long from spending $1 to getting $1.20 back? Shorter cycles = less risk.
3. **Runway vs. Milestones**: Every dollar you spend should get you to a specific, measurable milestone.

**Cost Structure Insights:**
- **Fixed vs. Variable**: Start with more variable costs - it reduces risk but limits scale
- **The Hidden 30%**: Budget 30% more than your projections for unexpected costs
- **Personnel Trap**: Avoid hiring too early - each employee needs to generate 3x their fully-loaded cost

**Funding Strategy:**
Don't raise money to "buy time" - raise money to accelerate what's already working. Investors fund traction, not hope.

**Critical Question**: If you had to become profitable with half your projected budget, what would you cut first? That exercise reveals what's truly essential.

What's your biggest financial assumption that you're least confident about?`
      }

      if (message.includes('next') || message.includes('30 days') || message.includes('immediate') || message.includes('start')) {
        return `Here's my strategic thinking on your next 30 days - and why sequence matters more than speed:

**The Prioritization Philosophy:**
Most entrepreneurs try to do everything at once and end up doing nothing well. Success comes from ruthless prioritization and execution discipline.

**Your Strategic Focus Areas:**

**Week 1-2: Validation Before Building**
The biggest mistake I see is building before validating. Your priority should be:
- **Customer Discovery**: Talk to 10 potential customers. Don't pitch - just listen. Ask: "How do you currently solve this problem?"
- **Competitive Intelligence**: Use your competitors' products. Understand why customers choose them.
- **MVP Definition**: Based on customer feedback, define the absolute minimum viable product.

**Week 3-4: Foundation Setting**
Now you build the foundation:
- **Legal Structure**: Get your business properly set up (LLC/Corp decision matters for future funding)
- **Financial Systems**: Set up proper bookkeeping from day one. Future investors will scrutinize this.
- **Core Team**: If you need co-founders or early employees, now's the time. Equity conversations get harder as value increases.

**The Tools Strategy:**
Don't over-tool. Start with: Notion/Airtable for project management, QuickBooks for finances, and Google Workspace for communication. Add complexity only when simplicity breaks.

**Success Metrics That Actually Matter:**
- 10 customer conversations completed
- 3 potential customers who say "I'd pay for this"
- Legal structure established
- First version of product spec completed

**The One Thing Rule**: Each week, pick ONE thing that, if accomplished, would make the week successful. Everything else is secondary.

What's the one customer assumption you're most nervous about testing?`
      }

      if (message.includes('competition') || message.includes('competitor') || message.includes('market position')) {
        return `Let me share some strategic thinking about competition - because most entrepreneurs get this completely wrong:

**The Competition Mindset Shift:**
Your biggest competitor isn't another company - it's the status quo. Most customers aren't comparing you to other solutions; they're deciding whether to solve the problem at all.

**Competitive Intelligence Framework:**
1. **Direct Competitors**: Who solves the exact same problem the same way?
2. **Indirect Competitors**: Who solves the same problem differently?
3. **Non-Consumption**: What do people do when they don't use any solution?

**The Real Competitive Questions:**
- Why would a customer fire their current solution to hire yours?
- What job is the customer really trying to get done?
- Where are competitors weak that you could be strong?

**Strategic Positioning Insights:**
Don't try to beat competitors at their own game - change the game entirely. Southwest Airlines didn't try to be a better traditional airline; they redefined air travel.

**Competitive Advantage Hierarchy:**
1. **Network Effects**: Gets stronger as more people use it (hardest to replicate)
2. **Brand/Reputation**: Built over time with consistent delivery
3. **Cost Structure**: Structural advantages in how you operate
4. **Features**: Easiest to copy, weakest defense

**The Unfair Advantage Test:**
What do you have that can't be easily copied? If your answer is "better execution," that's not enough. You need structural advantages.

**Market Entry Strategy:**
Start in a niche where you can dominate, then expand. Better to own 100% of a small market than 1% of a big one.

What's your theory for why you'll win when competitors have more resources than you?`
      }
    }

    // Fallback to generic responses if no plan data
    return `I understand you're asking about "${userMessage}". Based on general business best practices, I can help you with:

• **Strategic Planning**: Setting clear goals and objectives
• **Market Research**: Understanding your customers and competition
• **Financial Planning**: Revenue projections and cost management
• **Risk Management**: Identifying and mitigating potential challenges

Could you be more specific about your business context so I can provide more targeted advice?`
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
