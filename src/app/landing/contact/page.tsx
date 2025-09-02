'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { X, Menu, Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleTryForFree = () => {
    router.push('/');
  };

  const scrollToLandingSection = (sectionId: string) => {
    router.push(`/landing#${sectionId}`);
  };

  const scrollToTop = () => {
    router.push('/landing');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // You would typically send this to your backend API
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navigation */}
      <nav 
        role="navigation"
        aria-label="Main navigation"
        className="fixed top-0 left-0 right-0 z-50 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200/50"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              {/* Logo - Left Corner */}
              <div className="flex items-center">
                <button 
                  onClick={scrollToTop}
                  className="text-xl font-bold hover:opacity-80 transition-opacity"
                  aria-label="Navigate to PlanSpark home page"
                >
                  <span className="text-black">Plan</span>
                  <span className="text-orange-500">Spark</span>
                </button>
              </div>
              
              {/* Desktop Navigation - Center */}
              <ul className="hidden md:flex items-center space-x-8" role="menubar">
                <li role="none">
                  <button 
                    onClick={scrollToTop} 
                    className="text-gray-600 hover:text-black transition-colors text-sm font-medium"
                    role="menuitem"
                    aria-label="Navigate to home section"
                  >
                    Home
                  </button>
                </li>
                <li role="none">
                  <button 
                    onClick={() => scrollToLandingSection('features')} 
                    className="text-gray-600 hover:text-black transition-colors text-sm font-medium"
                    role="menuitem"
                    aria-label="Navigate to features section"
                  >
                    Features
                  </button>
                </li>
                <li role="none">
                  <button 
                    onClick={() => scrollToLandingSection('how-it-works')} 
                    className="text-gray-600 hover:text-black transition-colors text-sm font-medium"
                    role="menuitem"
                    aria-label="Navigate to how it works section"
                  >
                    How it works
                  </button>
                </li>
                <li role="none">
                  <Link
                    href="/landing/pricing"
                    className="text-gray-600 hover:text-black transition-colors text-sm font-medium"
                    role="menuitem"
                    aria-label="Navigate to pricing page"
                  >
                    Pricing
                  </Link>
                </li>
                <li role="none">
                  <Link 
                    href="/landing/about" 
                    className="text-gray-600 hover:text-black transition-colors text-sm font-medium"
                    role="menuitem"
                    aria-label="Navigate to about page"
                  >
                    About
                  </Link>
                </li>
              </ul>

              {/* Try for Free Button - Right Corner */}
              <div className="flex items-center">
                <button
                  onClick={handleTryForFree}
                  className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
                >
                  Try for free
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200/50 py-4"
            >
              <div className="flex flex-col space-y-4 px-6">
                <button onClick={() => { scrollToTop(); setIsMenuOpen(false); }} className="text-gray-600 hover:text-black transition-colors text-sm font-medium text-left">
                  Home
                </button>
                <button onClick={() => { scrollToLandingSection('features'); setIsMenuOpen(false); }} className="text-gray-600 hover:text-black transition-colors text-sm font-medium text-left">
                  Features
                </button>
                <button onClick={() => { scrollToLandingSection('how-it-works'); setIsMenuOpen(false); }} className="text-gray-600 hover:text-black transition-colors text-sm font-medium text-left">
                  How it works
                </button>
                <Link href="/landing/pricing" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-black transition-colors text-sm font-medium text-left">
                  Pricing
                </Link>
                <Link href="/landing/about" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-black transition-colors text-sm font-medium text-left">
                  About
                </Link>
                <button onClick={() => { handleTryForFree(); setIsMenuOpen(false); }} className="text-gray-600 hover:text-black transition-colors text-sm font-medium text-left">
                  Try for free
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </nav>

      {/* Content with top padding to account for fixed nav */}
      <div className="pt-16">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-light mb-6 leading-[1.1] tracking-tight">
                <span className="text-black">Get in</span>
                <br />
                <span className="text-gray-500">touch</span>
              </h1>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                Have questions? Need support? Want to share feedback? We'd love to hear from you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Information & Form */}
        <section className="pb-16 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-semibold text-black mb-6">
                    Let's start a conversation
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-8">
                    Whether you're looking to transform your business idea into a comprehensive plan, 
                    need technical support, or want to explore partnership opportunities, we're here to help.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black mb-1">Email us</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Send us an email and we'll respond within 24 hours
                      </p>
                      <a href="mailto:hello@planspark.com" className="text-black hover:text-gray-600 transition-colors">
                        hello@planspark.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black mb-1">Call us</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Speak with our team during business hours
                      </p>
                      <a href="tel:+1-555-123-4567" className="text-black hover:text-gray-600 transition-colors">
                        +1 (555) 123-4567
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black mb-1">Visit us</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Come say hello at our office
                      </p>
                      <address className="text-black not-italic">
                        123 Innovation Drive<br />
                        San Francisco, CA 94105<br />
                        United States
                      </address>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <h3 className="font-semibold text-black mb-4">Office Hours</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monday - Friday</span>
                      <span className="text-black">9:00 AM - 6:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saturday</span>
                      <span className="text-black">10:00 AM - 4:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sunday</span>
                      <span className="text-black">Closed</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl p-8 border border-gray-200"
              >
                <h2 className="text-2xl font-semibold text-black mb-6">
                  Send us a message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-black mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                      placeholder="What's this about?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-black mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors resize-vertical"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send size={18} />
                    <span>Send Message</span>
                  </button>
                </form>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  By submitting this form, you agree to our{' '}
                  <Link href="/landing/privacy" className="text-black hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600">
                Quick answers to common questions about PlanSpark
              </p>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  question: "How long does it take to generate a business plan?",
                  answer: "Most comprehensive business plans are generated within 10-15 minutes, depending on the complexity of your business idea and the level of detail requested."
                },
                {
                  question: "Can I customize the generated business plan?",
                  answer: "Yes! You can regenerate your business plan with different inputs, parameters, or focus areas to better match your specific needs and vision. Each generation creates a new plan tailored to your updated requirements."
                },
                {
                  question: "What industries does PlanSpark support?",
                  answer: "PlanSpark supports virtually all industries, from tech startups to traditional retail businesses, restaurants, consulting firms, and more. Our AI adapts to your specific industry requirements."
                },
                {
                  question: "Is my data secure?",
                  answer: "Yes, we take data security very seriously. All your information is encrypted and stored securely. We never share your business plans or data with third parties."
                },
                {
                  question: "Do you offer customer support?",
                  answer: "Yes! We offer email support for all users and priority support for premium subscribers. Our team typically responds within 24 hours."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-gray-50 rounded-lg p-6"
                >
                  <h3 className="font-semibold text-black mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
