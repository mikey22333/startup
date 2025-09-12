'use client'

import Link from 'next/link'
import { ArrowRight, Brain, BarChart3, Users, Target, Zap, Globe, CheckCircle, Database } from 'lucide-react'

export default function AboutPage() {
  const principles = [
    {
      title: "Intelligence first",
      description: "When entrepreneurs think of business planning, they often think of tedious templates and generic advice. We believe AI can deliver personalized, data-driven insights that traditional planning tools simply can't match."
    },
    {
      title: "Planning for everyone", 
      description: "Business planning shouldn't be exclusive to MBAs or seasoned entrepreneurs. We create tools that make professional-grade business planning accessible to anyone with an idea, regardless of their background or experience."
    },
    {
      title: "The details matter",
      description: "We regard business planning as both art and science. Every market insight, financial projection, and strategic recommendation is crafted with precision to help entrepreneurs make informed decisions and build successful ventures."
    },
    {
      title: "Start with simple",
      description: "Even the most comprehensive business plans should start with clarity. We design our platform to be intuitive from day one while providing the depth and sophistication that serious entrepreneurs need to succeed."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">PlanSpark</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
                <Link href="/#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Features
                </Link>
                <Link href="/#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Pricing
                </Link>
                <Link href="/about" className="text-sm text-gray-900 font-medium">
                  About
                </Link>
              </div>
            </div>
            
            {/* Try for free button */}
            <div className="hidden md:block">
              <a 
                href="/" 
                className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
              >
                Try for free
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Grayscale gradient like Polymer */}
      <section className="py-32 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-light text-gray-900 leading-tight mb-6">
            About us
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Hyper-focused on details. We're dedicated to our craft and we 
            hope it shows through in our work.
          </p>
        </div>
      </section>

      {/* Principles Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-16 text-center">
            Our principles
          </h2>
          
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
            {principles.map((principle, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {principle.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built in Location Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Image */}
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <div className="aspect-w-16 aspect-h-10">
                  <img 
                    src="/Screenshot 2025-09-01 202910.png" 
                    alt="PlanSpark AI Business Planning Platform Interface"
                    className="w-full h-80 object-cover rounded-2xl"
                  />
                </div>
              </div>
            </div>
            
            {/* Right: Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6">
                Built with innovation
              </h2>
              <div className="space-y-6 text-gray-600">
                <p className="text-lg leading-relaxed">
                  In the heart of the world's technology capital, PlanSpark was 
                  born from a simple observation: entrepreneurs needed better tools 
                  to transform their ideas into actionable business plans.
                </p>
                <p className="text-lg leading-relaxed">
                  Founded by entrepreneurs for entrepreneurs, PlanSpark combines 
                  cutting-edge AI technology with deep business expertise to 
                  democratize professional business planning worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6">
                Making business planning accessible to everyone
              </h2>
              <div className="space-y-6 text-gray-600">
                <p className="text-lg leading-relaxed">
                  Every great business starts with an idea. But turning that idea into a comprehensive, 
                  actionable business plan has traditionally been time-consuming, expensive, and often 
                  inaccessible to many entrepreneurs.
                </p>
                <p className="text-lg leading-relaxed">
                  PlanSpark democratizes business planning by making professional-grade business plan 
                  generation accessible to everyone, powered by AI and backed by real market intelligence.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <img 
                src="/Screenshot 2025-09-01 202824.png" 
                alt="PlanSpark Business Plan Generation Interface"
                className="w-full h-auto rounded-2xl"
              />
              <div className="p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">10,000+</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider">Business Plans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">50+</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider">Industries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">95%</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider">Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">24/7</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider">AI Advisor</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology and Differentiators Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20">
            {/* Technology Stack */}
            <div>
              <h3 className="text-2xl font-light text-gray-900 mb-8">How we build</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center flex-shrink-0 mt-1">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Supabase Database</h4>
                    <p className="text-gray-600">Real-time market intelligence and data processing</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Together AI</h4>
                    <p className="text-gray-600">Advanced language models for intelligent planning</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center flex-shrink-0 mt-1">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Next.js Platform</h4>
                    <p className="text-gray-600">High-performance, scalable web application</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What makes us different */}
            <div>
              <h3 className="text-2xl font-light text-gray-900 mb-8">What makes us different</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 mt-1">
                    <Globe className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Global Coverage</h4>
                    <p className="text-gray-600">Market data from 50+ countries worldwide</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 mt-1">
                    <BarChart3 className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Real-Time Processing</h4>
                    <p className="text-gray-600">Complete business plans generated in under 2 minutes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">AI Advisory</h4>
                    <p className="text-gray-600">Contextual business guidance available 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-light mb-6">
            Ready to start your business journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of entrepreneurs who've used PlanSpark to turn their ideas into successful businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="/"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Start planning now
            </a>
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors inline-flex items-center space-x-2"
            >
              <span>Learn more about our features</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
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
                <li><Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link></li>
                <li><Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link></li>
                <li><Link href="/#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link></li>
                <li><Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link></li>
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
