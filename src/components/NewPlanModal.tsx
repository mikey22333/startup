'use client'

import { useState } from 'react'
import { X, Lightbulb, Building2, Zap, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NewPlanModalProps {
  isOpen: boolean
  onClose: () => void
}

const BUSINESS_TEMPLATES = [
  {
    icon: <Building2 className="w-6 h-6" />,
    title: "Tech Startup",
    description: "SaaS, mobile apps, AI/ML solutions",
    examples: ["AI productivity tool", "Mobile fitness app", "B2B software platform"],
    color: "from-blue-500 to-purple-600"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "E-commerce",
    description: "Online stores, marketplaces, dropshipping",
    examples: ["Fashion boutique", "Handmade crafts store", "Digital products"],
    color: "from-green-500 to-emerald-600"
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: "Service Business",
    description: "Consulting, agencies, local services",
    examples: ["Marketing agency", "Consulting firm", "Local home services"],
    color: "from-orange-500 to-red-600"
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: "Physical Product",
    description: "Manufacturing, retail, consumer goods",
    examples: ["Eco-friendly products", "Food & beverage", "Health & wellness"],
    color: "from-purple-500 to-pink-600"
  }
]

export default function NewPlanModal({ isOpen, onClose }: NewPlanModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [businessIdea, setBusinessIdea] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const router = useRouter()

  const handleContinue = () => {
    if (!businessIdea.trim()) return
    
    // Navigate to plan generation with the business idea
    const encodedIdea = encodeURIComponent(businessIdea.trim())
    router.push(`/plan?idea=${encodedIdea}`)
    onClose()
  }

  const handleTemplateSelect = (template: typeof BUSINESS_TEMPLATES[0]) => {
    setSelectedTemplate(template.title)
    setIsCustom(false)
    setBusinessIdea('')
  }

  const handleCustomSelect = () => {
    setIsCustom(true)
    setSelectedTemplate(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Create New Business Plan</h2>
            <p className="text-neutral-600 mt-1">Choose a template or describe your custom business idea</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Choose Template or Custom */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Step 1: Choose Your Approach</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {BUSINESS_TEMPLATES.map((template) => (
                <button
                  key={template.title}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                    selectedTemplate === template.title
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${template.color} flex items-center justify-center text-white mb-3`}>
                    {template.icon}
                  </div>
                  <h4 className="font-semibold text-neutral-900 mb-1">{template.title}</h4>
                  <p className="text-sm text-neutral-600 mb-2">{template.description}</p>
                  <div className="space-y-1">
                    {template.examples.slice(0, 2).map((example, index) => (
                      <p key={index} className="text-xs text-neutral-500">• {example}</p>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Option */}
            <button
              onClick={handleCustomSelect}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                isCustom
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900">Custom Business Idea</h4>
                  <p className="text-sm text-neutral-600">Describe your unique business concept in your own words</p>
                </div>
              </div>
            </button>
          </div>

          {/* Step 2: Describe Your Business */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Step 2: Describe Your Business</h3>
            
            {selectedTemplate && !isCustom && (
              <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Template: {selectedTemplate}</h4>
                <p className="text-blue-700 text-sm mb-3">
                  Great choice! Now describe your specific {selectedTemplate.toLowerCase()} idea.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {BUSINESS_TEMPLATES.find(t => t.title === selectedTemplate)?.examples.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setBusinessIdea(example)}
                      className="text-left p-2 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                    >
                      <p className="text-sm text-blue-800">{example}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea
              value={businessIdea}
              onChange={(e) => setBusinessIdea(e.target.value)}
              placeholder={
                selectedTemplate 
                  ? `Describe your ${selectedTemplate.toLowerCase()} idea in detail. What problem does it solve? Who are your customers? What makes it unique?`
                  : "Describe your business idea in detail. What problem does it solve? Who are your customers? What makes it unique?"
              }
              className="w-full h-32 p-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-neutral-500">
                Be specific about your target market, unique value proposition, and how you'll make money.
              </p>
              <span className="text-xs text-neutral-400">{businessIdea.length}/500</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              disabled={!businessIdea.trim()}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>Generate Business Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
