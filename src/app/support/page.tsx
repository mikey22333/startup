'use client'

import Link from 'next/link'
import { Mail, MessageSquare, Clock, Phone } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/landing" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">PlanSpark</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-8">
                <Link href="/landing#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Features
                </Link>
                <Link href="/landing#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
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
                href="/" 
                className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
              >
                Try for free
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-light text-gray-900 leading-tight mb-6 tracking-tight">
            How can we <span className="font-semibold italic">help you?</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Get the support you need to make the most of PlanSpark. We're here to help you succeed.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <Mail className="w-12 h-12 text-gray-900 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">Get help via email within 24 hours</p>
              <a href="mailto:support@planspark.com" className="text-gray-900 font-medium hover:underline">
                support@planspark.com
              </a>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <MessageSquare className="w-12 h-12 text-gray-900 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Chat with our support team</p>
              <button className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                Start Chat
              </button>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <Clock className="w-12 h-12 text-gray-900 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Help Center</h3>
              <p className="text-gray-600 mb-4">Browse our knowledge base</p>
              <a href="#" className="text-gray-900 font-medium hover:underline">
                Visit Help Center
              </a>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <Phone className="w-12 h-12 text-gray-900 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-4">Call us during business hours</p>
              <a href="tel:+1234567890" className="text-gray-900 font-medium hover:underline">
                (123) 456-7890
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How does PlanSpark generate business plans?</h3>
              <p className="text-gray-600 leading-relaxed">
                PlanSpark uses advanced AI algorithms combined with real-time market data to analyze your business idea 
                and generate comprehensive, customized business plans tailored to your specific industry and goals.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I edit my business plan after it's generated?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! You can edit, modify, and update your business plan at any time. PlanSpark provides intuitive editing 
                tools to help you refine your plan as your business evolves.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">What file formats can I export my plan to?</h3>
              <p className="text-gray-600 leading-relaxed">
                You can export your business plan as a professional PDF document, Word document, or PowerPoint presentation. 
                All exports are investor-ready and professionally formatted.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Is my business plan data secure?</h3>
              <p className="text-gray-600 leading-relaxed">
                Absolutely. We use enterprise-grade encryption and security measures to protect your data. Your business 
                plans are private and confidential, and we never share your information with third parties.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Do you offer refunds?</h3>
              <p className="text-gray-600 leading-relaxed">
                We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with PlanSpark, 
                contact our support team within 30 days for a full refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light text-gray-900 mb-4">Still need help?</h2>
            <p className="text-xl text-gray-600">Send us a message and we'll get back to you shortly</p>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              ></textarea>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/landing" className="text-gray-600 hover:text-gray-900 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </footer>
    </div>
  )
}
