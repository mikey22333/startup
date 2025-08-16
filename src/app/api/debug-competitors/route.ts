import { NextRequest, NextResponse } from 'next/server'

// Test endpoint to debug competitor generation
export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json()
    
    if (!idea) {
      return NextResponse.json({ error: 'Business idea is required' }, { status: 400 })
    }

    console.log('Testing competitor generation for:', idea)

    // Test the AI generation directly
    const competitorPrompt = `You are a market research expert with access to current business data. Analyze this business idea: "${idea}" and identify 3-4 real competitors with actual market data.

    INSTRUCTIONS:
    1. Research and identify REAL companies that compete in this exact business space
    2. Provide ACTUAL market data - no placeholders or generic terms
    3. Include both direct competitors (same service) and indirect competitors (alternative solutions)
    4. Use current 2024-2025 market information

    Required JSON format:
    {
      "competitors": [
        {
          "name": "Actual Company Name",
          "description": "Specific description of what this company does",
          "marketShare": "Exact market share percentage OR specific revenue/valuation",
          "funding": "Current funding status",
          "strengths": ["advantage 1", "advantage 2", "advantage 3"],
          "weaknesses": ["weakness 1", "weakness 2"],
          "pricing": {
            "model": "Exact pricing strategy", 
            "range": "Specific price points"
          },
          "features": ["feature 1", "feature 2", "feature 3"],
          "differentiators": ["differentiator 1", "differentiator 2"]
        }
      ]
    }

    RESPOND WITH ONLY THE JSON - NO OTHER TEXT.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: competitorPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 3048,
          }
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      return NextResponse.json({ 
        error: 'Gemini API failed',
        status: response.status,
        details: errorText
      }, { status: 500 })
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    console.log('Raw AI response length:', aiResponse?.length)
    console.log('Raw AI response:', aiResponse)

    if (!aiResponse) {
      return NextResponse.json({ 
        error: 'No response from AI',
        data: data
      }, { status: 500 })
    }

    let parsedResponse
    try {
      parsedResponse = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.log('Trying to extract JSON from response...')
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0])
        } catch (extractError) {
          return NextResponse.json({
            error: 'Failed to parse JSON',
            rawResponse: aiResponse,
            parseError: parseError instanceof Error ? parseError.message : String(parseError)
          }, { status: 500 })
        }
      } else {
        return NextResponse.json({
          error: 'No JSON found in response',
          rawResponse: aiResponse
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      idea: idea,
      rawResponse: aiResponse,
      parsedData: parsedResponse,
      competitorCount: parsedResponse.competitors?.length || 0
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
