# Render Environment Variables Configuration

## Required Environment Variables

These variables are **essential** for basic functionality and must be configured:

### 1. NODE_ENV
- **Value**: `production`
- **Description**: Sets the application to production mode

### 2. NEXT_PUBLIC_APP_URL
- **Value**: `https://your-app-name.onrender.com`
- **Description**: Your Render app URL (replace with actual URL after deployment)

### 3. SUPABASE_URL
- **Value**: `[Your Supabase Project URL]`
- **Description**: Your Supabase project URL from dashboard

### 4. SUPABASE_ANON_KEY
- **Value**: `[Your Supabase Anon Key]`
- **Description**: Your Supabase anonymous key from dashboard

### 5. TOGETHER_API_KEY
- **Value**: `[Your Together AI API Key]`
- **Description**: Primary AI provider for plan generation

## Optional Environment Variables

These enhance functionality but are not required for basic operation:

### 6. GEMINI_API_KEY
- **Value**: `[Your Google Gemini API Key]`
- **Description**: Fallback AI provider

### 7. OPENROUTER_API_KEY
- **Value**: `[Your OpenRouter API Key]`
- **Description**: Secondary fallback AI provider

### 8. ALPHA_VANTAGE_API_KEY
- **Value**: `[Your Alpha Vantage API Key]`
- **Description**: Financial data for market analysis

### 9. NEWS_API_KEY
- **Value**: `[Your News API Key]`
- **Description**: Industry news and trends

### 10. FRED_API_KEY
- **Value**: `[Your FRED API Key]`
- **Description**: Economic data from Federal Reserve

### 11. GOOGLE_CSE_ID
- **Value**: `[Your Google Custom Search Engine ID]`
- **Description**: For web search functionality

### 12. GOOGLE_API_KEY
- **Value**: `[Your Google API Key]`
- **Description**: For Google Custom Search

## Configuration Steps in Render

1. Go to your Render dashboard
2. Select your deployed service
3. Navigate to "Environment" tab
4. Click "Add Environment Variable"
5. Add each variable with its key and value
6. Start with the **Required** variables first
7. Click "Save Changes" after adding all variables
8. Redeploy your service if needed

## Testing After Configuration

Once configured, test your deployment by visiting:
- `https://your-app-name.onrender.com/api/health`

This endpoint will verify that all critical environment variables are properly configured.

## Security Notes

- Never commit these values to your repository
- All API keys should be kept secure and private
- Rotate keys regularly for security
- Use the minimum required permissions for each API key
