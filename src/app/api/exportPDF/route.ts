import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'

interface PlanData {
  businessType: 'DIGITAL' | 'PHYSICAL/SERVICE'
  businessSummary: string
  thirtyDayPlan: string
  sixtyDayPlan: string
  ninetyDayPlan: string
  resourceList: Array<{
    name: string
    type: 'VERIFIED' | 'AI_SUGGESTED'
    description: string
    cost?: string
    link?: string
  }>
  challenges: string
  verifiedFacts: Array<{
    category: string
    content: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const { plan }: { plan: PlanData } = await request.json()

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan data is required' },
        { status: 400 }
      )
    }

    // Create new PDF document
    const doc = new jsPDF()
    let yPosition = 20
    const margin = 20
    const pageWidth = doc.internal.pageSize.width
    const maxWidth = pageWidth - 2 * margin

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      doc.setFontSize(fontSize)
      if (isBold) {
        doc.setFont('helvetica', 'bold')
      } else {
        doc.setFont('helvetica', 'normal')
      }

      const lines = doc.splitTextToSize(text, maxWidth)
      const lineHeight = fontSize * 0.5

      // Check if we need a new page
      if (yPosition + (lines.length * lineHeight) > doc.internal.pageSize.height - margin) {
        doc.addPage()
        yPosition = margin
      }

      doc.text(lines, margin, yPosition)
      yPosition += lines.length * lineHeight + 10
    }

    // Title
    addWrappedText('Business Action Plan', 24, true)
    addWrappedText(`Business Type: ${plan.businessType}`, 14, true)
    yPosition += 10

    // Verified Facts
    if (plan.verifiedFacts.length > 0) {
      addWrappedText('Verified Industry Data', 16, true)
      plan.verifiedFacts.forEach(fact => {
        addWrappedText(`${fact.category}: ${fact.content}`, 11)
      })
      yPosition += 10
    }

    // Business Summary
    addWrappedText('Business Summary', 16, true)
    addWrappedText(plan.businessSummary, 11)

    // 30-Day Plan
    addWrappedText('30-Day Action Plan', 16, true)
    addWrappedText(plan.thirtyDayPlan, 11)

    // 60-Day Plan
    addWrappedText('60-Day Action Plan', 16, true)
    addWrappedText(plan.sixtyDayPlan, 11)

    // 90-Day Plan
    addWrappedText('90-Day Action Plan', 16, true)
    addWrappedText(plan.ninetyDayPlan, 11)

    // Resources
    addWrappedText('Resources & Tools', 16, true)
    plan.resourceList.forEach(resource => {
      addWrappedText(`${resource.name} (${resource.type})`, 12, true)
      addWrappedText(resource.description, 10)
      if (resource.cost) {
        addWrappedText(`Cost: ${resource.cost}`, 10)
      }
      if (resource.link) {
        addWrappedText(`Link: ${resource.link}`, 10)
      }
      yPosition += 5
    })

    // Challenges
    addWrappedText('Challenges & Mitigation', 16, true)
    addWrappedText(plan.challenges, 11)

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="business-action-plan.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'PDF export failed' },
      { status: 500 }
    )
  }
}
