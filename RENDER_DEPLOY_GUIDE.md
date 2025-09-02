# Render Deployment Guide for PlanSpark

## Quick Deploy to Render

### 1. Connect Repository
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo: `mikey22333/startup`

### 2. Configure Service
- **Name**: `planspark`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`

### 3. Environment Variables (Required)
Add these in Render dashboard under "Environment":

```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://planspark.onrender.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TOGETHER_API_KEY=your_together_ai_key
```

### 4. Optional Environment Variables (for enhanced features)
```
ALPHA_VANTAGE_API_KEY=your_key
NEWS_API_KEY=your_key
FRED_API_KEY=your_key
GOOGLE_CSE_API_KEY=your_key
GOOGLE_CSE_ID=your_id
YAHOO_FINANCE_API_KEY=your_key
RAPIDAPI_HOST=rapidapi.com
STRIPE_PUBLIC_KEY=your_key
STRIPE_SECRET_KEY=your_key
```

### 5. Deploy
- Click "Create Web Service"
- Render will automatically deploy from your main branch
- First build takes 5-10 minutes

### 6. Custom Domain (Optional)
- Go to Settings → Custom Domains
- Add your domain and configure DNS

## Troubleshooting

### If build fails:
- Check environment variables are set
- Ensure all API keys are valid
- Check build logs for specific errors

### If app doesn't start:
- Verify `npm start` command works locally
- Check that all required environment variables are set
- Review application logs in Render dashboard

## Auto-Deploy
Render automatically deploys when you push to the main branch.
