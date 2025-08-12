'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Beams from "@/components/Beams"

export default function HomePage() {
  const [idea, setIdea] = useState('')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [timeline, setTimeline] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [currency, setCurrency] = useState('USD')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (idea.trim()) {
      const params = new URLSearchParams({
        idea: idea.trim(),
        ...(location.trim() && { location: location.trim() }),
        ...(budget && { budget }),
        ...(timeline && { timeline }),
        ...(businessType && { businessType }),
        ...(currency && { currency })
      })
      router.push(`/plan?${params.toString()}`)
    }
  }

  const examplePrompts = [
    "I want to start a car rental business in Texas",
    "I want to build a food delivery app",
    "I want to open a boutique coffee shop in downtown Seattle",
    "I want to create a SaaS tool for project management",
    "I want to start an online fitness coaching business"
  ]

  return (
    <div className="bg-gradient-to-br from-neutral-50 via-white to-neutral-50 relative">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Beams
          beamWidth={3}
          beamHeight={30}
          beamNumber={20}
          lightColor="#f5f5f5"
          speed={1.5}
          noiseIntensity={1}
          scale={0.1}
          rotation={30}
        />
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-8 md:py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center space-x-3 mb-6 md:mb-8">
            <div className="w-2 h-2 bg-white/80 rounded-full shadow-lg" />
            <span className="text-xs font-medium text-white/90 tracking-wider uppercase bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">AI-Powered Business Planning</span>
            <div className="w-2 h-2 bg-white/80 rounded-full shadow-lg" />
          </div>
          
          <h1 className="text-3xl md:text-6xl font-light text-white mb-6 md:mb-8 leading-tight drop-shadow-2xl">
            Turn Your Business Idea Into
            <span className="block font-normal text-white/90 drop-shadow-xl">Actionable Plans</span>
          </h1>
          <p className="text-base md:text-lg text-white mb-8 md:mb-12 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-xl bg-black/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
            Get a detailed, step-by-step action plan tailored to your specific business idea. 
            Powered by AI with verified industry data and real-time market research.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-6 md:p-8 mb-8 md:mb-16" suppressHydrationWarning>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="idea" className="block text-left text-lg font-medium text-white mb-3">
                What&apos;s your business idea? <span className="text-red-400">*</span>
              </label>
              <textarea
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your business idea in detail..."
                className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400/50 resize-none h-32 font-light transition-all backdrop-blur-sm shadow-lg"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: '#ffffff',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  outline: 'none'
                }}
                required
                autoComplete="off"
              />
            </div>

            {/* Optional Fields Section */}
            <div className="border-t border-white/20 pt-8">
              <h3 className="text-lg font-medium text-white mb-6">Optional Details (helps create more precise plans)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-left font-semibold text-white mb-2">
                    Location
                  </label>
                  <select
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-white/50 font-light text-white transition-all bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg"
                  >
                    <option value="">Select location...</option>
                    <optgroup label="United States">
                      <option value="New York, NY">New York, NY</option>
                      <option value="Los Angeles, CA">Los Angeles, CA</option>
                      <option value="Chicago, IL">Chicago, IL</option>
                      <option value="Houston, TX">Houston, TX</option>
                      <option value="Phoenix, AZ">Phoenix, AZ</option>
                      <option value="Philadelphia, PA">Philadelphia, PA</option>
                      <option value="San Antonio, TX">San Antonio, TX</option>
                      <option value="San Diego, CA">San Diego, CA</option>
                      <option value="Dallas, TX">Dallas, TX</option>
                      <option value="San Jose, CA">San Jose, CA</option>
                      <option value="Austin, TX">Austin, TX</option>
                      <option value="Jacksonville, FL">Jacksonville, FL</option>
                      <option value="San Francisco, CA">San Francisco, CA</option>
                      <option value="Columbus, OH">Columbus, OH</option>
                      <option value="Charlotte, NC">Charlotte, NC</option>
                      <option value="Fort Worth, TX">Fort Worth, TX</option>
                      <option value="Indianapolis, IN">Indianapolis, IN</option>
                      <option value="Seattle, WA">Seattle, WA</option>
                      <option value="Denver, CO">Denver, CO</option>
                      <option value="Boston, MA">Boston, MA</option>
                      <option value="Miami, FL">Miami, FL</option>
                      <option value="Nashville, TN">Nashville, TN</option>
                      <option value="Atlanta, GA">Atlanta, GA</option>
                      <option value="Las Vegas, NV">Las Vegas, NV</option>
                      <option value="Portland, OR">Portland, OR</option>
                    </optgroup>
                    <optgroup label="Canada">
                      <option value="Toronto, ON">Toronto, ON</option>
                      <option value="Vancouver, BC">Vancouver, BC</option>
                      <option value="Montreal, QC">Montreal, QC</option>
                      <option value="Calgary, AB">Calgary, AB</option>
                      <option value="Edmonton, AB">Edmonton, AB</option>
                      <option value="Ottawa, ON">Ottawa, ON</option>
                    </optgroup>
                    <optgroup label="United Kingdom">
                      <option value="London, UK">London, UK</option>
                      <option value="Manchester, UK">Manchester, UK</option>
                      <option value="Birmingham, UK">Birmingham, UK</option>
                      <option value="Edinburgh, UK">Edinburgh, UK</option>
                      <option value="Glasgow, UK">Glasgow, UK</option>
                      <option value="Liverpool, UK">Liverpool, UK</option>
                    </optgroup>
                    <optgroup label="Australia">
                      <option value="Sydney, AU">Sydney, AU</option>
                      <option value="Melbourne, AU">Melbourne, AU</option>
                      <option value="Brisbane, AU">Brisbane, AU</option>
                      <option value="Perth, AU">Perth, AU</option>
                      <option value="Adelaide, AU">Adelaide, AU</option>
                    </optgroup>
                    <optgroup label="Europe">
                      <option value="Paris, France">Paris, France</option>
                      <option value="Berlin, Germany">Berlin, Germany</option>
                      <option value="Madrid, Spain">Madrid, Spain</option>
                      <option value="Rome, Italy">Rome, Italy</option>
                      <option value="Amsterdam, Netherlands">Amsterdam, Netherlands</option>
                      <option value="Zurich, Switzerland">Zurich, Switzerland</option>
                      <option value="Stockholm, Sweden">Stockholm, Sweden</option>
                      <option value="Copenhagen, Denmark">Copenhagen, Denmark</option>
                    </optgroup>
                    <optgroup label="Asia">
                      <option value="Tokyo, Japan">Tokyo, Japan</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Hong Kong">Hong Kong</option>
                      <option value="Seoul, South Korea">Seoul, South Korea</option>
                      <option value="Mumbai, India">Mumbai, India</option>
                      <option value="Delhi, India">Delhi, India</option>
                      <option value="Shanghai, China">Shanghai, China</option>
                      <option value="Beijing, China">Beijing, China</option>
                    </optgroup>
                    <optgroup label="Other">
                      <option value="São Paulo, Brazil">São Paulo, Brazil</option>
                      <option value="Mexico City, Mexico">Mexico City, Mexico</option>
                      <option value="Dubai, UAE">Dubai, UAE</option>
                      <option value="Tel Aviv, Israel">Tel Aviv, Israel</option>
                    </optgroup>
                  </select>
                  <p className="text-xs text-gray-200 mt-1 font-medium drop-shadow-lg">Select your business location for local regulations and market data</p>
                </div>

                <div>
                  <label htmlFor="budget" className="block text-left font-semibold text-white mb-2">
                    Budget Range
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-48 px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-white/50 text-sm font-light text-white transition-all bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg"
                    >
                      <option value="USD">USD - United States</option>
                      <option value="EUR">EUR - Eurozone</option>
                      <option value="GBP">GBP - United Kingdom</option>
                      <option value="CAD">CAD - Canada</option>
                      <option value="AUD">AUD - Australia</option>
                      <option value="JPY">JPY - Japan</option>
                      <option value="CHF">CHF - Switzerland</option>
                      <option value="CNY">CNY - China</option>
                      <option value="INR">INR - India</option>
                      <option value="BRL">BRL - Brazil</option>
                      <option value="MXN">MXN - Mexico</option>
                      <option value="SGD">SGD - Singapore</option>
                    </select>
                    <select
                      id="budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-white/50 font-light text-white transition-all bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg"
                    >
                      <option value="">Select budget range...</option>
                      <option value="under-5k">Under {currency === 'JPY' ? '¥750,000' : currency === 'INR' ? '₹400,000' : currency === 'EUR' ? '€4,500' : currency === 'GBP' ? '£4,000' : currency === 'CAD' ? 'C$6,500' : currency === 'AUD' ? 'A$7,500' : currency === 'CHF' ? 'CHF 4,500' : currency === 'CNY' ? '¥35,000' : currency === 'BRL' ? 'R$25,000' : currency === 'MXN' ? '$90,000' : currency === 'SGD' ? 'S$6,500' : '$5,000'}</option>
                      <option value="5k-10k">{currency === 'JPY' ? '¥750,000 - ¥1,500,000' : currency === 'INR' ? '₹400,000 - ₹800,000' : currency === 'EUR' ? '€4,500 - €9,000' : currency === 'GBP' ? '£4,000 - £8,000' : currency === 'CAD' ? 'C$6,500 - C$13,000' : currency === 'AUD' ? 'A$7,500 - A$15,000' : currency === 'CHF' ? 'CHF 4,500 - CHF 9,000' : currency === 'CNY' ? '¥35,000 - ¥70,000' : currency === 'BRL' ? 'R$25,000 - R$50,000' : currency === 'MXN' ? '$90,000 - $180,000' : currency === 'SGD' ? 'S$6,500 - S$13,000' : '$5,000 - $10,000'}</option>
                      <option value="10k-25k">{currency === 'JPY' ? '¥1,500,000 - ¥3,750,000' : currency === 'INR' ? '₹800,000 - ₹2,000,000' : currency === 'EUR' ? '€9,000 - €22,500' : currency === 'GBP' ? '£8,000 - £20,000' : currency === 'CAD' ? 'C$13,000 - C$32,500' : currency === 'AUD' ? 'A$15,000 - A$37,500' : currency === 'CHF' ? 'CHF 9,000 - CHF 22,500' : currency === 'CNY' ? '¥70,000 - ¥175,000' : currency === 'BRL' ? 'R$50,000 - R$125,000' : currency === 'MXN' ? '$180,000 - $450,000' : currency === 'SGD' ? 'S$13,000 - S$32,500' : '$10,000 - $25,000'}</option>
                      <option value="25k-50k">{currency === 'JPY' ? '¥3,750,000 - ¥7,500,000' : currency === 'INR' ? '₹2,000,000 - ₹4,000,000' : currency === 'EUR' ? '€22,500 - €45,000' : currency === 'GBP' ? '£20,000 - £40,000' : currency === 'CAD' ? 'C$32,500 - C$65,000' : currency === 'AUD' ? 'A$37,500 - A$75,000' : currency === 'CHF' ? 'CHF 22,500 - CHF 45,000' : currency === 'CNY' ? '¥175,000 - ¥350,000' : currency === 'BRL' ? 'R$125,000 - R$250,000' : currency === 'MXN' ? '$450,000 - $900,000' : currency === 'SGD' ? 'S$32,500 - S$65,000' : '$25,000 - $50,000'}</option>
                      <option value="50k-100k">{currency === 'JPY' ? '¥7,500,000 - ¥15,000,000' : currency === 'INR' ? '₹4,000,000 - ₹8,000,000' : currency === 'EUR' ? '€45,000 - €90,000' : currency === 'GBP' ? '£40,000 - £80,000' : currency === 'CAD' ? 'C$65,000 - C$130,000' : currency === 'AUD' ? 'A$75,000 - A$150,000' : currency === 'CHF' ? 'CHF 45,000 - CHF 90,000' : currency === 'CNY' ? '¥350,000 - ¥700,000' : currency === 'BRL' ? 'R$250,000 - R$500,000' : currency === 'MXN' ? '$900,000 - $1,800,000' : currency === 'SGD' ? 'S$65,000 - S$130,000' : '$50,000 - $100,000'}</option>
                      <option value="100k-250k">{currency === 'JPY' ? '¥15,000,000 - ¥37,500,000' : currency === 'INR' ? '₹8,000,000 - ₹20,000,000' : currency === 'EUR' ? '€90,000 - €225,000' : currency === 'GBP' ? '£80,000 - £200,000' : currency === 'CAD' ? 'C$130,000 - C$325,000' : currency === 'AUD' ? 'A$150,000 - A$375,000' : currency === 'CHF' ? 'CHF 90,000 - CHF 225,000' : currency === 'CNY' ? '¥700,000 - ¥1,750,000' : currency === 'BRL' ? 'R$500,000 - R$1,250,000' : currency === 'MXN' ? '$1,800,000 - $4,500,000' : currency === 'SGD' ? 'S$130,000 - S$325,000' : '$100,000 - $250,000'}</option>
                      <option value="250k+">{currency === 'JPY' ? '¥37,500,000+' : currency === 'INR' ? '₹20,000,000+' : currency === 'EUR' ? '€225,000+' : currency === 'GBP' ? '£200,000+' : currency === 'CAD' ? 'C$325,000+' : currency === 'AUD' ? 'A$375,000+' : currency === 'CHF' ? 'CHF 225,000+' : currency === 'CNY' ? '¥1,750,000+' : currency === 'BRL' ? 'R$1,250,000+' : currency === 'MXN' ? '$4,500,000+' : currency === 'SGD' ? 'S$325,000+' : '$250,000+'}</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-200 mt-1 font-medium drop-shadow-lg">Select your preferred currency and budget range</p>
                </div>

                <div>
                  <label htmlFor="timeline" className="block text-left font-semibold text-white mb-2">
                    Timeline to Launch
                  </label>
                  <select
                    id="timeline"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-white/50 font-light text-white transition-all bg-white/10 backdrop-blur-sm border border-white/20"
                  >
                    <option value="">Select timeline...</option>
                    <option value="1-month">1 month</option>
                    <option value="2-3-months">2-3 months</option>
                    <option value="3-6-months">3-6 months</option>
                    <option value="6-12-months">6-12 months</option>
                    <option value="12-months+">12+ months</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-left font-semibold text-white mb-2">
                    Business Type
                  </label>
                  <select
                    id="businessType"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-white/50 font-light text-white transition-all bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg"
                  >
                    <option value="">Auto-detect from idea...</option>
                    <option value="DIGITAL">Website / App / SaaS</option>
                    <option value="PHYSICAL/SERVICE">Physical Store / Service Business</option>
                    <option value="HYBRID">E-commerce with Physical Components</option>
                    <option value="MANUFACTURING">Manufacturing</option>
                    <option value="CONSULTING">Consulting / Professional Services</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!idea.trim()}
              className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 disabled:bg-white/10 text-white font-medium py-4 px-8 rounded-xl text-lg transition-all border border-white/30 shadow-lg"
            >
              Generate My Action Plan →
            </button>
          </form>
        </div>

        {/* Example Prompts */}
        <div className="mb-8 md:mb-16">
          <div className="text-center mb-6 md:mb-8">
            <h3 className="text-lg font-medium text-white mb-2 drop-shadow-lg">Try these examples:</h3>
            <p className="text-sm text-white/70 font-light">Click any example to get started</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setIdea(prompt)}
                className="text-left p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 hover:border-white/40 hover:bg-black/50 transition-all text-sm text-white/90 font-light shadow-lg"
              >
                &quot;{prompt}&quot;
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
