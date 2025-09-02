'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight, Check, Brain, BarChart3, FileText, Users, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
      <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-lg font-medium text-gray-900">PlanSpark</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <div className="flex items-center space-x-3">
                <a 
                  href="/" 
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </a>
                <a 
                  href="/" 
                  className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
                >
                  Try for free
                </a>
              </div>
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
              <Link href="#features" className="block py-2 text-sm text-gray-600">Features</Link>
              <Link href="#pricing" className="block py-2 text-sm text-gray-600">Pricing</Link>
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <a href="/" className="block py-2 text-sm text-gray-600">Sign in</a>
                <a href="/" className="block py-2 px-4 bg-gray-900 text-white text-sm rounded-md font-medium">Try for free</a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Small tag */}
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200/50 mb-8">
            <span className="mr-2">✨</span>
            AI-POWERED BUSINESS PLANNING
          </div>
          
          {/* Main heading - Premium styling */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 leading-[0.9] mb-8 tracking-tight">
            Turn your <span className="font-semibold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">idea</span> into
            <br />
            a <span className="font-semibold italic">business plan</span>
          </h1>
          
          {/* Description */}
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Generate comprehensive, investor-ready business plans in minutes using AI and real market data.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <a
              href="/"
              className="bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors font-semibold text-lg"
            >
              Create your plan
            </a>
            <button className="flex items-center text-gray-700 hover:text-gray-900 transition-colors font-medium text-lg">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Watch demo
            </button>
          </div>
        </div>
        
        {/* Dashboard Preview */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <img 
                src="/Screenshot 2025-09-01 202851.png" 
                alt="PlanSpark Dashboard interface"
                className="w-full h-auto rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-light text-gray-900 mb-6">
              Everything you need to
              <span className="block font-normal">launch your business</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From idea validation to execution roadmap, powered by AI and real market data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-light text-gray-900 leading-tight">
                Build with confidence
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                From automated business plan generation to comprehensive market analysis and financial projections - all powered by AI to help you build your next successful venture.
              </p>
              
              {/* Feature List */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-900 font-medium">Market Research</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-900 font-medium">Financial Projections</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-900 font-medium">Business Strategy</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-900 font-medium">Competitive Analysis</span>
                </div>
              </div>

              <div className="pt-4">
                <a 
                  href="#"
                  className="inline-flex items-center text-gray-900 font-medium hover:text-gray-700 transition-colors"
                >
                  Get on top of your business planning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>

            {/* Right Content - Visual */}
            <div className="relative">
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <img 
                  src="/Screenshot 2025-09-01 202824.png" 
                  alt="PlanSpark Business Planning Dashboard"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-light text-gray-900 mb-6">
              From idea to plan
              <span className="block font-normal">in three simple steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Describe Your Idea</h3>
              <p className="text-gray-600">Tell us about your business idea, target market, and goals. Our AI will understand your vision.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Generates Plan</h3>
              <p className="text-gray-600">Our AI analyzes market data, competitors, and industry trends to create a comprehensive business plan.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Export & Execute</h3>
              <p className="text-gray-600">Download your professional business plan as a PDF and start executing your vision with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-light text-gray-900 mb-6">
              Simple, transparent
              <span className="block font-normal">pricing</span>
            </h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">3 business plans per day</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Basic market research</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">PDF export</span>
                </li>
              </ul>
              <a 
                href="/"
                className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors block"
              >
                Get Started Free
              </a>
            </div>

            {/* Premium Plan */}
            <div className="bg-white text-black p-8 rounded-2xl relative border-2 border-gray-900 shadow-lg">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-2">Premium</h3>
                <div className="text-4xl font-bold mb-2">$9<span className="text-lg font-normal">/month</span></div>
                <p className="text-gray-600">For growing businesses</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>25 business plans per day</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Advanced market research</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Financial projections</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>AI business advisor</span>
                </li>
              </ul>
              <a 
                href="/"
                className="w-full bg-gray-900 text-white py-3 rounded-lg text-center font-medium hover:bg-gray-800 transition-colors block"
              >
                Try Premium Free
              </a>
            </div>

            {/* Pro Plan */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$19<span className="text-lg font-normal">/month</span></div>
                <p className="text-gray-600">For serious entrepreneurs</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Unlimited business plans</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Premium market research</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Custom branding</span>
                </li>
              </ul>
              <a 
                href="/"
                className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors block"
              >
                Upgrade to Pro
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-light mb-6">
            Ready to turn your idea
            <span className="block font-normal">into a business?</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who've launched successful businesses with PlanSpark.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="border border-gray-300 text-gray-900 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              View examples
            </button>
            <a
              href="/"
              className="bg-gray-900 text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center space-x-2 text-lg font-medium"
            >
              <span>Start planning now</span>
            </a>
          </div>
          <p className="text-gray-500 text-sm mt-4">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center mr-2">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-900 font-medium">PlanSpark</span>
              </div>
              <p className="text-gray-600 mb-4">
                Turn ideas into reality with AI-powered business planning.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-600 hover:text-gray-900">Overview</Link></li>
                <li><Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link></li>
                <li><a href="/" className="text-gray-600 hover:text-gray-900">Dashboard</a></li>
                <li><a href="/" className="text-gray-600 hover:text-gray-900">Download</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Support</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Terms and Conditions</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Branding</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Story</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Updates</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Open startup</a></li>
                <li><a href="/" className="text-gray-600 hover:text-gray-900">Sign In</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">&copy; 2025 PlanSpark. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <a href="#" className="text-gray-600 hover:text-gray-900">Twitter</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Github</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
