import React from 'react'

interface DataValidation {
  validated: boolean
  warnings: string[]
  suggestions: string[]
  correctionsMade: boolean
}

interface ImprovementSummaryProps {
  dataValidation?: DataValidation
  className?: string
}

const ImprovementSummary: React.FC<ImprovementSummaryProps> = ({ 
  dataValidation, 
  className = '' 
}) => {
  if (!dataValidation || !dataValidation.validated) {
    return null
  }

  const hasIssues = dataValidation.warnings.length > 0 || 
                   dataValidation.suggestions.length > 0 || 
                   dataValidation.correctionsMade

  if (!hasIssues) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 mb-6 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              ✅ Plan Quality Validated
            </h3>
            <div className="mt-1 text-sm text-green-700">
              Your business plan passed all quality checks and consistency validations.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            🔧 Plan Enhanced with AI Improvements
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            Our AI validation system reviewed your business plan and made improvements for accuracy and realism.
          </div>
          
          {dataValidation.correctionsMade && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-blue-800">Corrections Applied:</h4>
              <ul className="mt-1 text-sm text-blue-700 list-disc list-inside">
                <li>Financial projections adjusted for realism</li>
                <li>Market size calculations corrected</li>
                <li>Break-even analysis recalculated</li>
              </ul>
            </div>
          )}
          
          {dataValidation.warnings.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-blue-800">Validation Notes:</h4>
              <ul className="mt-1 text-sm text-blue-700 space-y-1">
                {dataValidation.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-2">⚠️</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {dataValidation.suggestions.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-blue-800">Improvement Suggestions:</h4>
              <ul className="mt-1 text-sm text-blue-700 space-y-1">
                {dataValidation.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">💡</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-3 text-xs text-blue-600 bg-blue-100 rounded p-2">
            <strong>About AI Validation:</strong> This business plan was automatically reviewed using advanced validation algorithms that check for financial consistency, market size accuracy, and competitive analysis quality. All improvements maintain the integrity of your original business concept.
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImprovementSummary
