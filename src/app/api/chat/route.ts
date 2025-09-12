import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL = 'llama3-8b-8192' // Better model for conversational chat

// Business advisor system prompt
const BUSINESS_ADVISOR_PROMPT = `You are an expert AI Business Advisor with deep experience in entrepreneurship, startups, and business strategy. You provide practical, actionable advice based on real-world business principles.

Your personality:
- Direct and honest, but supportive
- Focus on actionable insights over theory
- Ask clarifying questions when needed
- Use specific examples when helpful
- Balance optimism with realism

Key areas of expertise:
- Business planning and strategy
- Market analysis and competition
- Financial planning and projections
- Risk assessment and mitigation
- Marketing and customer acquisition
- Operations and scaling
- Funding and investment

Always provide:
1. Clear, specific advice
2. Actionable next steps
3. Relevant questions to help the user think deeper
4. Realistic timelines when applicable

Keep responses conversational but professional, typically 2-3 paragraphs unless more detail is specifically requested.`

export async function POST(request: NextRequest) {
  try {
    const { message, planData } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check if Groq API key is available
    if (!GROQ_API_KEY) {
      return NextResponse.json({ 
        error: 'Chat service temporarily unavailable',
        response: "I apologize, but the chat service is currently unavailable. Please try again later or contact support if this issue persists."
      }, { status: 503 })
    }

    // Build comprehensive context from plan data if available
    let contextPrompt = BUSINESS_ADVISOR_PROMPT
    
    if (planData) {
      const businessContext = []
      
      // Business Overview
      if (planData.businessOverview?.businessIdea) {
        businessContext.push(`Business Idea: ${planData.businessOverview.businessIdea}`)
      }
      if (planData.businessOverview?.missionStatement) {
        businessContext.push(`Mission: ${planData.businessOverview.missionStatement}`)
      }
      if (planData.businessOverview?.targetAudience) {
        businessContext.push(`Target Audience: ${planData.businessOverview.targetAudience}`)
      }

      // Market Analysis
      if (planData.marketAnalysis) {
        if (planData.marketAnalysis.marketSize?.tam) {
          businessContext.push(`Market Size (TAM): ${planData.marketAnalysis.marketSize.tam}`)
        }
        if (planData.marketAnalysis.targetMarket) {
          businessContext.push(`Target Market: ${planData.marketAnalysis.targetMarket}`)
        }
        if (planData.marketAnalysis.competitiveAnalysis) {
          businessContext.push(`Competition: ${planData.marketAnalysis.competitiveAnalysis}`)
        }
      }

      // Financial Projections
      if (planData.financialProjections) {
        if (planData.financialProjections.startupCosts?.total) {
          businessContext.push(`Startup Costs: ${planData.financialProjections.startupCosts.total}`)
        }
        if (planData.financialProjections.revenueProjections?.year1?.total) {
          businessContext.push(`Year 1 Revenue Projection: ${planData.financialProjections.revenueProjections.year1.total}`)
        }
        if (planData.financialProjections.monthlyExpenses?.total) {
          businessContext.push(`Monthly Operating Expenses: ${planData.financialProjections.monthlyExpenses.total}`)
        }
      }

      // Risk Analysis
      if (planData.riskAnalysis) {
        if (planData.riskAnalysis.mainChallenges) {
          businessContext.push(`Key Challenges: ${planData.riskAnalysis.mainChallenges}`)
        }
        if (planData.riskAnalysis.mitigationStrategies) {
          businessContext.push(`Mitigation Strategies: ${planData.riskAnalysis.mitigationStrategies}`)
        }
      }

      // Marketing Strategy
      if (planData.marketingStrategy) {
        if (planData.marketingStrategy.channels) {
          businessContext.push(`Marketing Channels: ${planData.marketingStrategy.channels}`)
        }
        if (planData.marketingStrategy.budget) {
          businessContext.push(`Marketing Budget: ${planData.marketingStrategy.budget}`)
        }
      }

      // Operations
      if (planData.operationsStrategy) {
        if (planData.operationsStrategy.location) {
          businessContext.push(`Business Location: ${planData.operationsStrategy.location}`)
        }
        if (planData.operationsStrategy.keyOperations) {
          businessContext.push(`Key Operations: ${planData.operationsStrategy.keyOperations}`)
        }
      }

      // Funding Sources
      if (planData.fundingSources && planData.fundingSources.length > 0) {
        const fundingOptions = planData.fundingSources.map((f: any) => f.name).join(', ')
        businessContext.push(`Potential Funding Sources: ${fundingOptions}`)
      }

      if (businessContext.length > 0) {
        contextPrompt += `

CURRENT BUSINESS PLAN CONTEXT:
${businessContext.join('\n')}

Important: Use this specific business plan information to provide highly relevant, contextual advice. Reference specific details from their plan when giving recommendations.`
      }
    }

    console.log('Chat API: Processing message for business advisor')
    console.log('Message length:', message.length)
    console.log('Has plan data:', !!planData)

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: contextPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      }),
    })

    if (!response.ok) {
      let errorDetails = 'Unknown error'
      try {
        const errorResponse = await response.text()
        errorDetails = errorResponse
        console.error('Groq API error:', errorDetails)
      } catch (e) {
        console.error('Failed to read error response')
      }

      // Return a helpful fallback response
      return NextResponse.json({ 
        response: "I'm experiencing some technical difficulties right now. Could you please rephrase your question or try again in a moment? In the meantime, I'd be happy to help with general business planning questions."
      }, { status: 200 })
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content

    if (!aiResponse) {
      console.error('No response content from Groq API')
      return NextResponse.json({ 
        response: "I apologize, but I didn't receive a proper response. Could you please try asking your question again?"
      }, { status: 200 })
    }

    console.log('Chat API: Successfully generated response, length:', aiResponse.length)
    
    return NextResponse.json({ 
      response: aiResponse.trim(),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ 
      response: "I'm sorry, but I encountered an unexpected error. Please try again, and if the problem persists, please contact support."
    }, { status: 200 })
  }
}
