'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight, Check, Brain, BarChart3, FileText, Users, ChevronRight } from 'lucide-react'
import { trackEvent } from '@/components/PostHogProvider'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const handleCTAClick = (location: string) => {
    trackEvent('cta_clicked', {
      location,
      page: 'landing',
      timestamp: new Date().toISOString(),
    })
  }

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Planning',
      description: 'Advanced AI generates comprehensive business plans tailored to your specific idea and market conditions.'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Market Data',
      description: 'Access verified industry data, competitive analysis, and market trends to validate your business idea.'
    },
    {
      icon: FileText,
      title: 'Professional Export',
      description: 'Generate beautiful, investor-ready PDF documents with financial projections and action plans.'
    },
    {
      icon: Users,
      title: 'Business Advisory',
      description: 'Get personalized recommendations and strategic insights from our AI business advisor.'
    }
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <motion.nav 
        className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">PlanSpark</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
                <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Pricing
                </Link>
                <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  About
                </Link>
              </div>
            </div>
            
            {/* Try for free button */}
            <div className="hidden md:block">
              <a 
                href="/generate" 
                onClick={() => handleCTAClick('header')}
                className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
              >
                Try for free
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-3 space-y-3">
              <Link href="/" className="block py-2 text-sm text-gray-600 text-center">Home</Link>
              <Link href="#features" className="block py-2 text-sm text-gray-600 text-center">Features</Link>
              <Link href="#pricing" className="block py-2 text-sm text-gray-600 text-center">Pricing</Link>
              <Link href="/about" className="block py-2 text-sm text-gray-600 text-center">About</Link>
              <div className="pt-3 border-t border-gray-100">
                <a 
                  href="/generate" 
                  onClick={() => handleCTAClick('mobile_menu')}
                  className="block py-2 px-4 bg-gray-900 text-white text-sm rounded-md font-medium text-center"
                >
                  Try for free
                </a>
              </div>
            </div>
          </div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Small tag */}
          <motion.div 
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200/50 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="mr-2">✨</span>
            AI-POWERED BUSINESS PLANNING
          </motion.div>
          
          {/* Main heading - Premium styling */}
          <motion.h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 leading-[0.9] mb-8 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Turn your <span className="font-semibold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">idea</span> into
            <br />
            a <span className="font-semibold italic">business plan</span>
          </motion.h1>
          
          {/* Description */}
          <motion.p 
            className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Generate comprehensive, investor-ready business plans in minutes using AI and real market data.
          </motion.p>
          
          {/* CTA Button */}
          <motion.div 
            className="flex justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <a
              href="/generate"
              onClick={() => handleCTAClick('hero_primary')}
              className="bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors font-semibold text-lg"
            >
              Create your plan
            </a>
          </motion.div>
        </div>
        
        {/* Dashboard Preview */}
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="relative">
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src="/Screenshot 2025-09-01 202851.png" 
                alt="PlanSpark Dashboard interface"
                className="w-full h-auto rounded-2xl"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-5xl font-light text-gray-900 mb-6">
              Everything you need to
              <span className="block font-normal">launch your business</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From idea validation to execution roadmap, powered by AI and real market data.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <motion.div 
                  className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <feature.icon className="w-6 h-6 text-gray-700" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <motion.h2 
                className="text-4xl lg:text-5xl font-light text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Build with confidence
              </motion.h2>
              <motion.p 
                className="text-lg text-gray-600 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                From automated business plan generation to comprehensive market analysis and financial projections - all powered by AI to help you build your next successful venture.
              </motion.p>
              
              {/* Feature List */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {['Market Research', 'Financial Projections', 'Business Strategy', 'Competitive Analysis'].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  >
                    <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-gray-900 font-medium">{item}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div 
                className="pt-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <a 
                  href="#"
                  className="inline-flex items-center text-gray-900 font-medium hover:text-gray-700 transition-colors"
                >
                  Get on top of your business planning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </motion.div>
            </motion.div>

            {/* Right Content - Visual */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div 
                className="bg-gray-50 rounded-2xl p-8 border border-gray-200"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src="/Screenshot 2025-09-01 202824.png" 
                  alt="PlanSpark Business Planning Dashboard"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Competitive Comparison Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-5xl font-light text-gray-900 mb-6">
              Comprehensive
              <span className="block font-normal">competitive analysis</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI automatically identifies and analyzes your competitors, providing detailed insights into their strengths, weaknesses, and market positioning.
            </p>
          </motion.div>

          {/* Example Competitive Analysis Table */}
          <motion.div 
            className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Example: Skill-Sharing Platform Competitive Analysis</h3>
              <p className="text-sm text-gray-600 mt-1">AI-generated competitive analysis for your business plan</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Company</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Pricing</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Key Strength</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Main Weakness</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Market Share</th>
                  </tr>
                </thead>
                <tbody>
                  <motion.tr 
                    className="border-b border-gray-100 bg-orange-50"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <td className="py-4 px-6 font-semibold text-orange-700">Your Business</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Flexible pay-per-use model vs subscription lock-in</td>
                    <td className="py-4 px-6 text-sm text-gray-700">First-to-market AI integration & automation</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Two-sided market development & network effects</td>
                    <td className="py-4 px-6 text-sm text-gray-700">0% (launching)</td>
                  </motion.tr>
                  <motion.tr 
                    className="border-b border-gray-100"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <td className="py-4 px-6 font-medium text-gray-900">Skillshare</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Subscription SaaS - $14/month or $99/year</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Large library of courses</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Limited focus on direct skill swapping</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Estimated 1-3% of the online learning market, with over 30,000 courses.</td>
                  </motion.tr>
                  <motion.tr 
                    className="border-b border-gray-100"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <td className="py-4 px-6 font-medium text-gray-900">Udemy</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Individual course purchases, subscription options - Courses range from free to $199+, subscription options available</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Large course selection</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Course quality varies significantly</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Estimated 2-4% of the online learning market, with over 200,000 courses.</td>
                  </motion.tr>
                  <motion.tr 
                    className="border-b border-gray-100"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <td className="py-4 px-6 font-medium text-gray-900">Fiverr</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Commission-based, transaction fees - Freelancers set their own prices; Fiverr takes a commission (typically 20%)</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Large marketplace of freelancers</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Focus on paid services, not skill swapping</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Estimated 1-2% of the global freelance market.</td>
                  </motion.tr>
                  <motion.tr 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <td className="py-4 px-6 font-medium text-gray-900">Meetup</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Subscription for organizers - $16.99/month or $14.99/month (billed annually)</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Facilitates in-person networking and skill sharing</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Less focus on online skill exchange</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Difficult to quantify market share; significant presence in local communities.</td>
                  </motion.tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Analysis Features */}
          <div className="grid md:grid-cols-2 gap-12 mt-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Competitive Advantages</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our AI automatically identifies your competitive advantages by analyzing your business model against 
                    market leaders. Discover unique positioning opportunities and understand exactly where your business 
                    can outperform existing solutions.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Market Opportunities</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Identify untapped market segments and gaps in competitor offerings. Our analysis reveals opportunities 
                    where competitors show weaknesses, helping you position your business for maximum market impact 
                    and sustainable growth.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-5xl font-light text-gray-900 mb-6">
              From idea to plan
              <span className="block font-normal">in three simple steps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: 1, 
                title: "Describe Your Idea", 
                description: "Tell us about your business idea, target market, and goals. Our AI will understand your vision." 
              },
              { 
                step: 2, 
                title: "AI Generates Plan", 
                description: "Our AI analyzes market data, competitors, and industry trends to create a comprehensive business plan." 
              },
              { 
                step: 3, 
                title: "Export & Execute", 
                description: "Download your professional business plan as a PDF and start executing your vision with confidence." 
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: [0, -10, 10, -10, 0],
                    transition: { duration: 0.5 }
                  }}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20, 
                    delay: index * 0.2 + 0.3 
                  }}
                >
                  {item.step}
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold text-gray-900 mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
                >
                  {item.title}
                </motion.h3>
                <motion.p 
                  className="text-gray-600"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.6 }}
                >
                  {item.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-5xl font-light text-gray-900 mb-6">
              Simple, transparent
              <span className="block font-normal">pricing</span>
            </h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your needs</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <motion.div 
              className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Basic</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">Free</div>
                <p className="text-gray-600">Best for personal use</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">1 business plan per day</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Basic financial projections</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Market size analysis</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Risk assessment</span>
                </li>
              </ul>
              <a 
                href="/generate"
                className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors block"
              >
                Get Started
              </a>
            </motion.div>

            {/* Pro Plan */}
            <motion.div 
              className="bg-white text-black p-8 rounded-2xl relative border-2 border-gray-900 shadow-lg"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -12, scale: 1.02, transition: { duration: 0.2 } }}
            >
              <motion.div 
                className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
              </motion.div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-2">$12.99<span className="text-lg font-normal">/month</span></div>
                <p className="text-gray-600">For entrepreneurs & startups</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Everything in Basic</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>5 business plans per day</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>PDF export</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Advanced competitor analysis</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Priority customer support</span>
                </li>
              </ul>
              <a 
                href="/generate"
                className="w-full bg-gray-900 text-white py-3 rounded-lg text-center font-medium hover:bg-gray-800 transition-colors block"
              >
                Get Started
              </a>
            </motion.div>

            {/* Pro+ Plan */}
            <motion.div 
              className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Pro+</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$29.99<span className="text-lg font-normal">/month</span></div>
                <p className="text-gray-600">For agencies & consultants</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Unlimited business plans</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Everything in Pro</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Premium market research</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Custom branding options</span>
                </li>
              </ul>
              <a 
                href="/generate"
                className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors block"
              >
                Get Started
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl lg:text-5xl font-light mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            Ready to turn your idea
            <span className="block font-normal">into a business?</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join thousands of entrepreneurs who've launched successful businesses with PlanSpark.
          </motion.p>
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.a
              href="/generate"
              className="bg-gray-900 text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center space-x-2 text-lg font-medium"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Start planning now</span>
            </motion.a>
          </motion.div>
          <motion.p 
            className="text-gray-500 text-sm mt-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            No credit card required
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <span className="text-xl font-bold text-gray-900">PlanSpark</span>
              <p className="text-gray-600 mt-4">
                Turn ideas into reality with AI-powered business planning.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link></li>
                <li><Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</Link></li>
                <li><Link href="/support" className="text-gray-600 hover:text-gray-900 transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">&copy; 2025 PlanSpark. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
