# 🆓 FREE API Integration Guide

This project uses **100% FREE APIs** that work with personal email accounts. No organizational accounts or paid subscriptions required!

## 📊 Market Data APIs (All FREE)

### 1. Alpha Vantage - Economic Data
- **Free Tier**: 500 calls/day, 5 calls/minute
- **Sign up**: [https://www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)
- **Personal email**: ✅ Works with Gmail, Outlook, etc.
- **Provides**: GDP, unemployment, inflation data

### 2. NewsAPI - News Sentiment
- **Free Tier**: 500 requests/day
- **Sign up**: [https://newsapi.org/register](https://newsapi.org/register)
- **Personal email**: ✅ Works with any email
- **Provides**: News articles for sentiment analysis

### 3. OpenWeatherMap - Weather Context
- **Free Tier**: 1,000 calls/day
- **Sign up**: [https://openweathermap.org/api](https://openweathermap.org/api)
- **Personal email**: ✅ Works with any email
- **Provides**: Weather data for seasonal business analysis

## 🌍 No-Key APIs (Unlimited & Free)

### 1. REST Countries API
- **URL**: `https://restcountries.com/v3.1`
- **Rate Limit**: None
- **Provides**: Country economic and demographic data

### 2. Nominatim (OpenStreetMap)
- **URL**: `https://nominatim.openstreetmap.org`
- **Rate Limit**: 1 request/second (generous)
- **Provides**: Address geocoding and location data

### 3. Overpass API (OpenStreetMap)
- **URL**: `https://overpass-api.de/api/interpreter`
- **Rate Limit**: Very generous
- **Provides**: Business location and POI data

### 4. Reddit API (Read-Only)
- **URL**: `https://www.reddit.com/r/subreddit.json`
- **Rate Limit**: None for read-only
- **Provides**: Community sentiment and discussions

### 5. CoinGecko API
- **URL**: `https://api.coingecko.com/api/v3`
- **Rate Limit**: 50 calls/minute
- **Provides**: Market sentiment indicators

### 6. JSONPlaceholder
- **URL**: `https://jsonplaceholder.typicode.com`
- **Rate Limit**: None
- **Provides**: Demo data for testing

### 7. Quotable API
- **URL**: `https://api.quotable.io`
- **Rate Limit**: None
- **Provides**: Inspirational content

## 🚀 Quick Setup

1. **Copy environment file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Get your FREE API keys**:
   - Alpha Vantage: [Get key](https://www.alphavantage.co/support/#api-key)
   - NewsAPI: [Get key](https://newsapi.org/register)
   - OpenWeatherMap: [Get key](https://openweathermap.org/api)

3. **Add keys to `.env.local`**:
   ```env
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
   NEWS_API_KEY=your_news_api_key
   OPENWEATHER_API_KEY=your_openweather_key
   ```

4. **Start the app**:
   ```bash
   npm run dev
   ```

## 💡 Fallback System

Even without API keys, the app works with:
- **Smart fallbacks**: Static estimates when APIs are unavailable
- **Graceful degradation**: Never crashes due to missing keys
- **Realistic data**: Industry-specific estimates and trends

## 🔄 Upgrade Path

All APIs have paid tiers for scaling:
- **Alpha Vantage**: Up to unlimited calls
- **NewsAPI**: Up to 1M requests/month
- **OpenWeatherMap**: Up to 60M calls/month

## 📈 Rate Limits Summary

| API | Free Calls | Rate Limit | Upgrade Available |
|-----|------------|------------|-------------------|
| Alpha Vantage | 500/day | 5/minute | ✅ |
| NewsAPI | 500/day | No limit | ✅ |
| OpenWeatherMap | 1,000/day | 60/minute | ✅ |
| REST Countries | Unlimited | None | - |
| Nominatim | Unlimited | 1/second | - |
| Overpass API | Unlimited | Generous | - |
| Reddit (read) | Unlimited | None | - |
| CoinGecko | Unlimited | 50/minute | ✅ |

## 🛡️ Best Practices

1. **Cache responses** to minimize API calls
2. **Implement retries** with exponential backoff
3. **Monitor usage** through API dashboards
4. **Use fallbacks** for reliability
5. **Respect rate limits** to avoid blocking

All APIs are production-ready and used by thousands of developers worldwide! 🌟
