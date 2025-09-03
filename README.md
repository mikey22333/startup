<<<<<<< HEAD
# PlanSpark - AI Business Plan Generator

A production-ready AI web application that transforms business ideas into detailed, actionable 30-60-90 day plans.

## 🚀 Features

- **Smart Business Type Detection**: Automatically detects DIGITAL vs PHYSICAL/SERVICE businesses
- **AI-Powered Planning**: Uses Together AI (Llama-3-70b) for personalized action plans
- **Verified Industry Data**: Reduces hallucinations with real data from Supabase
- **Smart Resource Enhancement**: Google Custom Search for latest business tools & resources
- **PDF Export**: Download professional business plans
- **Responsive Design**: Built with Tailwind CSS for all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI**: Together AI API (meta-llama/Llama-3-70b-chat)
- **Search**: Google Custom Search Engine
- **PDF**: jsPDF
- **Payments**: Stripe (for future freemium)

## 📦 Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd planspark
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your API keys in `.env.local`

3. **Set up Supabase database:**
   Create the following tables in your Supabase project:

   ```sql
   -- Industries table
   CREATE TABLE industries (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     type VARCHAR(50) CHECK (type IN ('DIGITAL', 'PHYSICAL/SERVICE')),
     keywords TEXT[],
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Legal requirements table
   CREATE TABLE legal_requirements (
     id SERIAL PRIMARY KEY,
     industry_id INTEGER REFERENCES industries(id),
     location VARCHAR(255),
     requirement VARCHAR(500),
     description TEXT,
     cost_estimate VARCHAR(100),
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Average startup costs table
   CREATE TABLE avg_startup_costs (
     id SERIAL PRIMARY KEY,
     industry_id INTEGER REFERENCES industries(id),
     location VARCHAR(255),
     cost_range_min INTEGER,
     cost_range_max INTEGER,
     description TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Common tools table
   CREATE TABLE common_tools (
     id SERIAL PRIMARY KEY,
     industry_id INTEGER REFERENCES industries(id),
     name VARCHAR(255),
     description TEXT,
     cost VARCHAR(100),
     link VARCHAR(500),
     category VARCHAR(100),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. **Seed sample data (optional):**
   ```sql
   -- Sample industry
   INSERT INTO industries (name, type, keywords) VALUES 
   ('Food Delivery App', 'DIGITAL', ARRAY['food', 'delivery', 'app', 'restaurant']),
   ('Car Rental', 'PHYSICAL/SERVICE', ARRAY['car', 'rental', 'vehicle', 'transport']);

   -- Sample legal requirements
   INSERT INTO legal_requirements (industry_id, location, requirement, description, cost_estimate) VALUES
   (2, 'Texas', 'Business License', 'General business operation license required', '$50-200'),
   (2, 'Texas', 'Vehicle Registration', 'Commercial vehicle registration for rental fleet', '$100-500 per vehicle');

   -- Sample startup costs
   INSERT INTO avg_startup_costs (industry_id, location, cost_range_min, cost_range_max, description) VALUES
   (2, 'Texas', 50000, 200000, 'Initial fleet purchase and business setup costs');

   -- Sample tools
   INSERT INTO common_tools (industry_id, name, description, cost, category) VALUES
   (2, 'Turo Host Tools', 'Fleet management platform for car rentals', '$30-100/month', 'Management Software'),
   (1, 'Stripe', 'Payment processing for online transactions', '2.9% + $0.30 per transaction', 'Payment Processing');
   ```

## 🔧 Configuration

### Required API Keys

1. **Together AI**: Sign up at [together.ai](https://together.ai)
2. **Supabase**: Create project at [supabase.com](https://supabase.com)
3. **Google Custom Search Engine**: 
   - Create a CSE at [Google Custom Search](https://cse.google.com/cse/)
   - Get API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Configure your CSE to search business-related sites for better results

### Google CSE Setup Tips

For optimal results, configure your Custom Search Engine to prioritize:
- Business resource websites (e.g., entrepreneur.com, inc.com, sba.gov)
- Tool directories (e.g., capterra.com, g2.com, producthunt.com)
- Industry-specific sites relevant to your target market

This approach keeps you within the free tier (100 queries/day) while providing high-quality, relevant business resources.

## 🏃‍♂️ Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

Visit [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generatePlan/
│   │   │   └── route.ts      # Main plan generation API
│   │   └── exportPDF/
│   │       └── route.ts      # PDF export API
│   ├── plan/
│   │   └── page.tsx          # Plan display page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles
├── components/
│   └── PlanCard.tsx          # Plan display component
├── lib/
│   └── supabase.ts           # Supabase configuration
└── utils/
    └── prompt.ts             # AI prompt templates
```

## 🎯 How It Works

1. **User Input**: User enters business idea and optional location
2. **Type Detection**: Algorithm detects DIGITAL vs PHYSICAL/SERVICE business
3. **Data Retrieval**: Fetches verified facts from Supabase database
4. **AI Generation**: Creates adaptive prompt and calls Together AI
5. **Enhancement**: Adds supplemental resource links via Google Custom Search
6. **Display**: Shows plan with verified vs AI-suggested labels
7. **Export**: Generates PDF for download

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

Compatible with any Node.js hosting platform:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

## 🔮 Future Features

- [ ] Stripe integration for freemium model
- [ ] User accounts and plan history
- [ ] Competitor analysis feature
- [ ] Industry-specific templates
- [ ] Collaboration tools
- [ ] Progress tracking
- [ ] Integration with business tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, email info@planspark.app or create an issue in this repository.

---

Built with ❤️ by the PlanSpark team
=======
# startup
>>>>>>> c1a1f8fe445728b37a31d7282f8fce7d39e3fff3
