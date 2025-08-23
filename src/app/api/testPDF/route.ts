import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Test the financial projections data generation
    const testFinancialProjections = `
<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">
  <thead>
    <tr>
      <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Month</th>
      <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Revenue</th>
      <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Costs</th>
      <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Profit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">Month 1</td>
      <td style="border: 1px solid #ddd; padding: 8px;">$1,000</td>
      <td style="border: 1px solid #ddd; padding: 8px;">$500</td>
      <td style="border: 1px solid #ddd; padding: 8px;">$500</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">Month 2</td>
      <td style="border: 1px solid #ddd; padding: 8px;">$1,200</td>
      <td style="border: 1px solid #ddd; padding: 8px;">$600</td>
      <td style="border: 1px solid #ddd; padding: 8px;">$600</td>
    </tr>
  </tbody>
</table>
    `.trim()

    console.log('Test Financial Projections HTML:')
    console.log(testFinancialProjections)

    // Test if the string contains table tags
    const hasTable = testFinancialProjections.includes('<table')
    console.log('Contains table tags:', hasTable)

    // Test the parsing logic
    if (hasTable) {
      console.log('Table detected - should render as HTML')
    } else {
      console.log('No table detected - would convert newlines to <br>')
    }

    return NextResponse.json({
      success: true,
      message: 'Test completed - check console logs',
      hasTable,
      financialProjections: testFinancialProjections
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
