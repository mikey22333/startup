import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import PricingSection from '@/components/PricingSection'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <main>
        <HeroSection />
        
        <div id="features">
          <FeaturesSection />
        </div>
        
        <div id="pricing">
          <PricingSection />
        </div>
        
        {/* Footer */}
        <footer className="bg-neutral-900 text-white py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              
              {/* Brand */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xl font-semibold">PlanGen</span>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  AI-powered business planning platform that helps entrepreneurs create investor-ready plans.
                </p>
              </div>

              {/* Product */}
              <div>
                <h3 className="font-medium mb-4">Product</h3>
                <div className="space-y-2 text-sm text-neutral-400">
                  <div className="hover:text-white transition-colors cursor-pointer">Features</div>
                  <div className="hover:text-white transition-colors cursor-pointer">Pricing</div>
                  <div className="hover:text-white transition-colors cursor-pointer">API</div>
                  <div className="hover:text-white transition-colors cursor-pointer">Templates</div>
                </div>
              </div>

              {/* Company */}
              <div>
                <h3 className="font-medium mb-4">Company</h3>
                <div className="space-y-2 text-sm text-neutral-400">
                  <div className="hover:text-white transition-colors cursor-pointer">About</div>
                  <div className="hover:text-white transition-colors cursor-pointer">Blog</div>
                  <div className="hover:text-white transition-colors cursor-pointer">Careers</div>
                  <div className="hover:text-white transition-colors cursor-pointer">Contact</div>
                </div>
              </div>

              {/* Support */}
              <div>
                <h3 className="font-medium mb-4">Support</h3>
                <div className="space-y-2 text-sm text-neutral-400">
                  <div className="hover:text-white transition-colors cursor-pointer">Help Center</div>
                  <div className="hover:text-white transition-colors cursor-pointer">Documentation</div>
                  <div className="hover:text-white transition-colors cursor-pointer">Privacy</div>
                  <div className="hover:text-white transition-colors cursor-pointer">Terms</div>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-neutral-400">
              <div>© 2024 PlanGen. All rights reserved.</div>
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <div className="hover:text-white transition-colors cursor-pointer">Privacy</div>
                <div className="hover:text-white transition-colors cursor-pointer">Terms</div>
                <div className="hover:text-white transition-colors cursor-pointer">Cookies</div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default LandingPage
