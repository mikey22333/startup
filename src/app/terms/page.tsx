'use client'

import Link from 'next/link'

export default function TermsPage() {
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: September 3, 2025</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              By accessing and using PlanSpark, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Permission is granted to temporarily use PlanSpark for personal, non-commercial transitory viewing only. 
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
              You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Content and Intellectual Property</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              You retain ownership of any intellectual property rights that you hold in the content you submit to PlanSpark. 
              However, by submitting content, you grant us a license to use, modify, and distribute that content as necessary 
              to provide our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. AI-Generated Content</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              PlanSpark uses artificial intelligence to generate business plans and recommendations. While we strive for accuracy, 
              AI-generated content should be reviewed and verified before making business decisions. We are not responsible for 
              decisions made based on AI-generated content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment Terms</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Some features of PlanSpark require payment. By subscribing to a paid plan, you agree to pay all fees associated 
              with your subscription. Fees are non-refundable except as required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              In no event shall PlanSpark or its suppliers be liable for any damages (including, without limitation, damages 
              for loss of data or profit, or due to business interruption) arising out of the use or inability to use PlanSpark.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, 
              under our sole discretion, for any reason whatsoever including without limitation if you breach the Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material changes to these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">Email: legal@planspark.com</p>
              <p className="text-gray-700">Address: 123 Business St, Suite 100, City, State 12345</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/landing" className="text-gray-600 hover:text-gray-900 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
