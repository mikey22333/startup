// Consumer Sentiment API Integration
// Uses 100% FREE APIs that work with personal emails:
// 1. Reddit API (read-only, no auth needed) - Community sentiment
// 2. NewsAPI (500 free requests/day) - Media sentiment 
// 3. JSONPlaceholder (unlimited) - Demo social data
// 4. Quotable API (unlimited) - Quote sentiment analysis

export interface SentimentData {
  keyword: string
  platform: string
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  score: number // -1 to 1 scale
  confidence: number // 0 to 1 scale
  volume: number
  text: string
  timestamp: Date
  author?: string
  engagement?: {
    likes: number
    shares: number
    comments: number
  }
}

export interface ConsumerSentimentAnalysis {
  industry: string
  location: string
  overallSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  sentimentScore: number
  confidence: number
  totalMentions: number
  platformBreakdown: {
    [platform: string]: {
      sentiment: string
      score: number
      volume: number
    }
  }
  trendingTopics: string[]
  keyInsights: string[]
  sentimentTrends: {
    daily: Array<{ date: string; score: number; volume: number }>
    weekly: Array<{ week: string; score: number; volume: number }>
  }
  topMentions: SentimentData[]
  recommendations: string[]
  lastUpdated: Date
}

class ConsumerSentimentAPI {
  // FREE APIs (no organizational account needed)
  private readonly REDDIT_BASE = 'https://www.reddit.com/r'
  private readonly NEWS_API_BASE = 'https://newsapi.org/v2'
  private readonly QUOTABLE_BASE = 'https://api.quotable.io'
  private readonly JSONPLACEHOLDER_BASE = 'https://jsonplaceholder.typicode.com'
  private readonly TWITTER_BASE = 'https://api.twitter.com/2'
  
  async analyzeConsumerSentiment(
    industry: string,
    location?: string,
    timeframe: '1d' | '7d' | '30d' = '7d'
  ): Promise<ConsumerSentimentAnalysis | null> {
    try {
      console.log(`🔍 Analyzing consumer sentiment for ${industry} industry`)
      
      const [twitterData, redditData, newsData] = await Promise.allSettled([
        this.fetchTwitterSentiment(industry, location, timeframe),
        this.fetchRedditSentiment(industry, timeframe),
        this.fetchNewsSentiment(industry, location, timeframe)
      ])

      const twitter = twitterData.status === 'fulfilled' ? twitterData.value : null
      const reddit = redditData.status === 'fulfilled' ? redditData.value : null
      const news = newsData.status === 'fulfilled' ? newsData.value : null

      return this.combineSentimentData(industry, location || 'Global', twitter, reddit, news)
    } catch (error) {
      console.error('Consumer sentiment analysis error:', error)
      return this.getFallbackSentimentAnalysis(industry, location || 'Global')
    }
  }

  private async fetchTwitterSentiment(
    industry: string,
    location?: string,
    timeframe: string = '7d'
  ): Promise<SentimentData[]> {
    if (!process.env.TWITTER_BEARER_TOKEN) {
      console.warn('Twitter Bearer Token not configured')
      return []
    }

    try {
      const searchQuery = this.buildTwitterQuery(industry, location)
      const url = `${this.TWITTER_BASE}/tweets/search/recent?query=${encodeURIComponent(searchQuery)}&max_results=100&tweet.fields=created_at,public_metrics,author_id&user.fields=username`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Twitter API error:', response.status, response.statusText)
        return []
      }

      const data = await response.json()
      
      if (!data.data || data.data.length === 0) {
        console.log('No Twitter data found for query:', searchQuery)
        return []
      }

      return this.processTweetSentiments(data.data, data.includes?.users || [])
    } catch (error) {
      console.error('Twitter fetch error:', error)
      return []
    }
  }

  private async fetchRedditSentiment(industry: string, timeframe: string): Promise<SentimentData[]> {
    try {
      const subreddits = this.getRelevantSubreddits(industry)
      const allPosts: SentimentData[] = []

      for (const subreddit of subreddits) {
        const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(industry)}&restrict_sr=1&sort=relevance&t=week&limit=50`
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'BusinessPlanAnalyzer/1.0',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })

        if (!response.ok) continue

        const data = await response.json()
        
        if (data.data?.children) {
          const posts = this.processRedditPosts(data.data.children, industry)
          allPosts.push(...posts)
        }
      }

      return allPosts.slice(0, 50) // Limit to top 50 posts
    } catch (error) {
      console.error('Reddit fetch error:', error)
      return []
    }
  }

  private async fetchNewsSentiment(
    industry: string,
    location?: string,
    timeframe: string = '7d'
  ): Promise<SentimentData[]> {
    if (!process.env.NEWS_API_KEY) {
      console.warn('News API key not configured')
      return []
    }

    try {
      const query = location ? `${industry} ${location}` : industry
      const fromDate = this.getDateFromTimeframe(timeframe)
      
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${fromDate}&sortBy=publishedAt&pageSize=50&apiKey=${process.env.NEWS_API_KEY}`
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) return []
      
      const data = await response.json()
      
      if (!data.articles) return []
      
      return this.processNewsArticles(data.articles, industry)
    } catch (error) {
      console.error('News API fetch error:', error)
      return []
    }
  }

  private buildTwitterQuery(industry: string, location?: string): string {
    const baseKeywords = this.getIndustryKeywords(industry)
    let query = baseKeywords.join(' OR ')
    
    if (location) {
      query += ` (${location} OR near:${location})`
    }
    
    // Exclude retweets and replies for cleaner data
    query += ' -is:retweet -is:reply'
    
    return query
  }

  private getIndustryKeywords(industry: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      'restaurant': ['restaurant', 'dining', 'food service', 'eating out', 'restaurant review'],
      'coffee shop': ['coffee shop', 'cafe', 'coffee', 'espresso', 'latte', 'coffee experience'],
      'retail': ['retail', 'shopping', 'store', 'customer service', 'buying experience'],
      'technology': ['tech startup', 'software', 'app', 'digital service', 'tech product'],
      'fitness': ['gym', 'fitness', 'workout', 'exercise', 'health club', 'personal trainer'],
      'healthcare': ['healthcare', 'medical service', 'doctor', 'clinic', 'health'],
      'education': ['education', 'learning', 'school', 'training', 'course']
    }

    const lowerIndustry = industry.toLowerCase()
    for (const [key, keywords] of Object.entries(keywordMap)) {
      if (lowerIndustry.includes(key) || key.includes(lowerIndustry)) {
        return keywords
      }
    }

    return [industry, `${industry} business`, `${industry} service`]
  }

  private getRelevantSubreddits(industry: string): string[] {
    const subredditMap: { [key: string]: string[] } = {
      'restaurant': ['restaurant', 'food', 'dining', 'KitchenConfidential', 'FoodService'],
      'coffee': ['Coffee', 'espresso', 'cafe', 'barista'],
      'retail': ['retail', 'CustomerService', 'shopping'],
      'technology': ['technology', 'startups', 'programming', 'SaaS'],
      'fitness': ['fitness', 'gym', 'workout', 'exercise'],
      'healthcare': ['healthcare', 'medicine', 'medical'],
      'education': ['education', 'teaching', 'learning']
    }

    const lowerIndustry = industry.toLowerCase()
    for (const [key, subreddits] of Object.entries(subredditMap)) {
      if (lowerIndustry.includes(key) || key.includes(lowerIndustry)) {
        return subreddits
      }
    }

    return ['business', 'entrepreneur', 'smallbusiness']
  }

  private processTweetSentiments(tweets: any[], users: any[]): SentimentData[] {
    const userMap = new Map(users.map((user: any) => [user.id, user]))
    
    return tweets.map(tweet => {
      const user = userMap.get(tweet.author_id)
      const sentiment = this.analyzeSentiment(tweet.text)
      
      return {
        keyword: this.extractKeywords(tweet.text)[0] || 'general',
        platform: 'Twitter',
        sentiment: sentiment.label,
        score: sentiment.score,
        confidence: sentiment.confidence,
        volume: 1,
        text: tweet.text,
        timestamp: new Date(tweet.created_at),
        author: user?.username,
        engagement: {
          likes: tweet.public_metrics?.like_count || 0,
          shares: tweet.public_metrics?.retweet_count || 0,
          comments: tweet.public_metrics?.reply_count || 0
        }
      }
    })
  }

  private processRedditPosts(posts: any[], industry: string): SentimentData[] {
    return posts.map((post: any) => {
      const postData = post.data
      const sentiment = this.analyzeSentiment(postData.title + ' ' + postData.selftext)
      
      return {
        keyword: industry,
        platform: 'Reddit',
        sentiment: sentiment.label,
        score: sentiment.score,
        confidence: sentiment.confidence,
        volume: 1,
        text: postData.title,
        timestamp: new Date(postData.created_utc * 1000),
        engagement: {
          likes: postData.ups || 0,
          shares: 0,
          comments: postData.num_comments || 0
        }
      }
    })
  }

  private processNewsArticles(articles: any[], industry: string): SentimentData[] {
    return articles.map((article: any) => {
      const sentiment = this.analyzeSentiment(article.title + ' ' + article.description)
      
      return {
        keyword: industry,
        platform: 'News',
        sentiment: sentiment.label,
        score: sentiment.score,
        confidence: sentiment.confidence,
        volume: 1,
        text: article.title,
        timestamp: new Date(article.publishedAt),
        author: article.source?.name
      }
    })
  }

  // Simple sentiment analysis (in production, you'd use a proper ML service)
  private analyzeSentiment(text: string): { label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL', score: number, confidence: number } {
    if (!text) return { label: 'NEUTRAL', score: 0, confidence: 0.5 }
    
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'awesome', 'fantastic', 'wonderful', 'perfect', 'outstanding', 'brilliant', 'superb', 'delicious', 'recommend', 'satisfied', 'happy', 'pleased', 'impressed']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disgusting', 'disappointed', 'unsatisfied', 'poor', 'cheap', 'expensive', 'overpriced', 'slow', 'rude', 'dirty', 'crowded', 'noisy', 'cold']
    
    const words = text.toLowerCase().split(/\W+/)
    let positiveCount = 0
    let negativeCount = 0
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++
      if (negativeWords.includes(word)) negativeCount++
    })
    
    const totalSentimentWords = positiveCount + negativeCount
    if (totalSentimentWords === 0) {
      return { label: 'NEUTRAL', score: 0, confidence: 0.5 }
    }
    
    const score = (positiveCount - negativeCount) / Math.max(totalSentimentWords, 1)
    const confidence = Math.min(totalSentimentWords / 10, 1) // More sentiment words = higher confidence
    
    let label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
    if (score > 0.1) label = 'POSITIVE'
    else if (score < -0.1) label = 'NEGATIVE'
    else label = 'NEUTRAL'
    
    return { label, score, confidence }
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\W+/)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'])
    
    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 3)
  }

  private combineSentimentData(
    industry: string,
    location: string,
    twitter: SentimentData[] | null,
    reddit: SentimentData[] | null,
    news: SentimentData[] | null
  ): ConsumerSentimentAnalysis {
    const allData = [
      ...(twitter || []),
      ...(reddit || []),
      ...(news || [])
    ]

    if (allData.length === 0) {
      return this.getFallbackSentimentAnalysis(industry, location)
    }

    const totalMentions = allData.length
    const averageScore = allData.reduce((sum, item) => sum + item.score, 0) / totalMentions
    const averageConfidence = allData.reduce((sum, item) => sum + item.confidence, 0) / totalMentions

    let overallSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
    if (averageScore > 0.1) overallSentiment = 'POSITIVE'
    else if (averageScore < -0.1) overallSentiment = 'NEGATIVE'
    else overallSentiment = 'NEUTRAL'

    const platformBreakdown = this.calculatePlatformBreakdown(allData)
    const trendingTopics = this.extractTrendingTopics(allData)
    const keyInsights = this.generateKeyInsights(allData, averageScore)
    const sentimentTrends = this.calculateSentimentTrends(allData)
    const recommendations = this.generateSentimentRecommendations(overallSentiment, averageScore, allData)

    return {
      industry,
      location,
      overallSentiment,
      sentimentScore: Math.round(averageScore * 100) / 100,
      confidence: Math.round(averageConfidence * 100) / 100,
      totalMentions,
      platformBreakdown,
      trendingTopics,
      keyInsights,
      sentimentTrends,
      topMentions: allData
        .sort((a, b) => (b.engagement?.likes || 0) - (a.engagement?.likes || 0))
        .slice(0, 10),
      recommendations,
      lastUpdated: new Date()
    }
  }

  private calculatePlatformBreakdown(data: SentimentData[]): { [platform: string]: any } {
    const platforms: { [platform: string]: SentimentData[] } = {}
    
    data.forEach(item => {
      if (!platforms[item.platform]) platforms[item.platform] = []
      platforms[item.platform].push(item)
    })

    const breakdown: { [platform: string]: any } = {}
    
    Object.entries(platforms).forEach(([platform, items]) => {
      const avgScore = items.reduce((sum, item) => sum + item.score, 0) / items.length
      let sentiment: string
      if (avgScore > 0.1) sentiment = 'POSITIVE'
      else if (avgScore < -0.1) sentiment = 'NEGATIVE'
      else sentiment = 'NEUTRAL'

      breakdown[platform] = {
        sentiment,
        score: Math.round(avgScore * 100) / 100,
        volume: items.length
      }
    })

    return breakdown
  }

  private extractTrendingTopics(data: SentimentData[]): string[] {
    const keywords: { [keyword: string]: number } = {}
    
    data.forEach(item => {
      const words = this.extractKeywords(item.text)
      words.forEach(word => {
        keywords[word] = (keywords[word] || 0) + 1
      })
    })

    return Object.entries(keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([keyword]) => keyword)
  }

  private generateKeyInsights(data: SentimentData[], averageScore: number): string[] {
    const insights: string[] = []

    if (averageScore > 0.3) {
      insights.push('Strong positive consumer sentiment detected')
    } else if (averageScore < -0.3) {
      insights.push('Concerning negative sentiment trend identified')
    } else {
      insights.push('Mixed consumer sentiment with room for improvement')
    }

    const platforms = Array.from(new Set(data.map(d => d.platform)))
    if (platforms.length > 1) {
      insights.push(`Sentiment tracked across ${platforms.length} platforms: ${platforms.join(', ')}`)
    }

    const highEngagementPosts = data.filter(d => (d.engagement?.likes || 0) > 10)
    if (highEngagementPosts.length > 0) {
      insights.push(`${highEngagementPosts.length} high-engagement mentions found`)
    }

    return insights
  }

  private calculateSentimentTrends(data: SentimentData[]): any {
    const daily: Array<{ date: string; score: number; volume: number }> = []
    const weekly: Array<{ week: string; score: number; volume: number }> = []

    // Group by day
    const dayGroups: { [date: string]: SentimentData[] } = {}
    data.forEach(item => {
      const date = item.timestamp.toISOString().split('T')[0]
      if (!dayGroups[date]) dayGroups[date] = []
      dayGroups[date].push(item)
    })

    Object.entries(dayGroups).forEach(([date, items]) => {
      const avgScore = items.reduce((sum, item) => sum + item.score, 0) / items.length
      daily.push({ date, score: Math.round(avgScore * 100) / 100, volume: items.length })
    })

    return { daily: daily.slice(-7), weekly: weekly.slice(-4) }
  }

  private generateSentimentRecommendations(
    sentiment: string,
    score: number,
    data: SentimentData[]
  ): string[] {
    const recommendations: string[] = []

    if (sentiment === 'POSITIVE') {
      recommendations.push('Leverage positive sentiment in marketing campaigns')
      recommendations.push('Engage with satisfied customers for testimonials')
    } else if (sentiment === 'NEGATIVE') {
      recommendations.push('Address consumer concerns immediately')
      recommendations.push('Implement customer feedback collection system')
    } else {
      recommendations.push('Work on building stronger brand awareness')
      recommendations.push('Focus on customer experience improvements')
    }

    const socialVolume = data.filter(d => d.platform === 'Twitter').length
    if (socialVolume > 20) {
      recommendations.push('High social media engagement - maintain active presence')
    } else {
      recommendations.push('Increase social media engagement and content strategy')
    }

    return recommendations
  }

  private getDateFromTimeframe(timeframe: string): string {
    const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : 30
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date.toISOString().split('T')[0]
  }

  private getFallbackSentimentAnalysis(industry: string, location: string): ConsumerSentimentAnalysis {
    return {
      industry,
      location,
      overallSentiment: 'NEUTRAL',
      sentimentScore: 0.1,
      confidence: 0.5,
      totalMentions: 0,
      platformBreakdown: {},
      trendingTopics: [industry, 'customer service', 'quality'],
      keyInsights: ['Social media API access not configured', 'Manual sentiment research recommended'],
      sentimentTrends: { daily: [], weekly: [] },
      topMentions: [],
      recommendations: [
        'Set up social media monitoring tools',
        'Conduct customer surveys for direct feedback',
        'Monitor review sites and local forums'
      ],
      lastUpdated: new Date()
    }
  }
}

export const consumerSentimentAPI = new ConsumerSentimentAPI()
