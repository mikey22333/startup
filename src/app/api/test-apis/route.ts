import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const testResults: any = {
    timestamp: new Date().toISOString(),
    apiTests: {},
    configurationStatus: {}
  }

  // Test FRED API
  try {
    const fredResponse = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=${process.env.FRED_API_KEY}&file_type=json&limit=1&sort_order=desc`
    )
    
    if (fredResponse.ok) {
      const fredData = await fredResponse.json()
      testResults.apiTests.fred = {
        status: 'SUCCESS ✅',
        data: `GDP data available: ${fredData.observations?.[0]?.value || 'Processing'}`
      }
    } else {
      testResults.apiTests.fred = {
        status: 'FAILED ❌',
        error: `HTTP ${fredResponse.status}`
      }
    }
  } catch (error) {
    testResults.apiTests.fred = {
      status: 'ERROR ❌',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Test Alpha Vantage API
  try {
    const alphaResponse = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=AAPL&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    )
    
    if (alphaResponse.ok) {
      const alphaData = await alphaResponse.json()
      if (alphaData.Note && alphaData.Note.includes('call frequency')) {
        testResults.apiTests.alphaVantage = {
          status: 'RATE LIMITED ⚠️',
          message: 'API key working but rate limit reached'
        }
      } else {
        testResults.apiTests.alphaVantage = {
          status: 'SUCCESS ✅',
          data: `AAPL Market Cap: ${alphaData.MarketCapitalization || 'Processing'}`
        }
      }
    } else {
      testResults.apiTests.alphaVantage = {
        status: 'FAILED ❌',
        error: `HTTP ${alphaResponse.status}`
      }
    }
  } catch (error) {
    testResults.apiTests.alphaVantage = {
      status: 'ERROR ❌',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Test Yahoo Finance API
  try {
    const yahooResponse = await fetch(
      'https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/AAPL/financial-data',
      {
        headers: {
          'X-RapidAPI-Key': process.env.YAHOO_FINANCE_API_KEY || '',
          'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
        }
      }
    )
    
    if (yahooResponse.ok) {
      const yahooData = await yahooResponse.json()
      testResults.apiTests.yahooFinance = {
        status: 'SUCCESS ✅',
        data: `AAPL Market Cap: ${yahooData.marketCap?.fmt || 'Processing'}`
      }
    } else {
      testResults.apiTests.yahooFinance = {
        status: 'FAILED ❌',
        error: `HTTP ${yahooResponse.status}`
      }
    }
  } catch (error) {
    testResults.apiTests.yahooFinance = {
      status: 'ERROR ❌',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Test News API
  try {
    const newsResponse = await fetch(
      `https://newsapi.org/v2/everything?q=business+market&sortBy=publishedAt&pageSize=1&apiKey=${process.env.NEWS_API_KEY}`
    )
    
    if (newsResponse.ok) {
      const newsData = await newsResponse.json()
      testResults.apiTests.newsApi = {
        status: 'SUCCESS ✅',
        data: `Latest article: ${newsData.articles?.[0]?.title || 'Processing'}`
      }
    } else {
      testResults.apiTests.newsApi = {
        status: 'FAILED ❌',
        error: `HTTP ${newsResponse.status}`
      }
    }
  } catch (error) {
    testResults.apiTests.newsApi = {
      status: 'ERROR ❌',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // API Key Configuration Check
  testResults.configurationStatus = {
    fredApiKey: process.env.FRED_API_KEY ? 'Configured ✅' : 'Missing ❌',
    alphaVantageKey: process.env.ALPHA_VANTAGE_API_KEY ? 'Configured ✅' : 'Missing ❌',
    yahooFinanceKey: process.env.YAHOO_FINANCE_API_KEY ? 'Configured ✅' : 'Missing ❌',
    newsApiKey: process.env.NEWS_API_KEY ? 'Configured ✅' : 'Missing ❌'
  }

  return NextResponse.json(testResults, { 
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
