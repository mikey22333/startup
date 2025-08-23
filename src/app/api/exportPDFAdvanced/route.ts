import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check user's subscription tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Block free users from accessing export functionality
    if (profile.subscription_tier === 'free') {
      return NextResponse.json({ 
        error: 'Export functionality is only available for Pro and Pro+ users. Please upgrade your subscription.' 
      }, { status: 403 })
    }

    const { html, filename = 'business-plan.pdf' } = await request.json()

    if (!html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 })
    }

    // Launch Puppeteer with more stable configuration
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      timeout: 30000
    })

    const page = await browser.newPage()
    
    try {
      // Set viewport for consistent rendering
      await page.setViewport({ width: 1200, height: 800 })

      // Set content with enhanced CSS for print
      const enhancedHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Business Plan</title>
          <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: white;
            font-size: 14px;
          }
          
          .container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
          }
          
          h1 {
            font-size: 28px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 12px;
          }
          
          h2 {
            font-size: 22px;
            font-weight: 600;
            color: #374151;
            margin: 32px 0 16px 0;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
          }
          
          h3 {
            font-size: 18px;
            font-weight: 600;
            color: #4b5563;
            margin: 24px 0 12px 0;
          }
          
          p {
            margin-bottom: 12px;
            line-height: 1.7;
          }
          
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin: 24px 0;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          
          .metric-item {
            padding: 12px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          }
          
          .metric-label {
            font-weight: 600;
            color: #374151;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
          }
          
          .metric-value {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
          }
          
          .tools-grid {
            display: grid;
            gap: 12px;
            margin: 20px 0;
          }
          
          .tool-item {
            padding: 16px;
            background: #f9fafb;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          
          .tool-name {
            font-weight: 600;
            color: #111827;
            margin-bottom: 4px;
          }
          
          .tool-meta {
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 8px;
          }
          
          .funding-grid {
            display: grid;
            gap: 16px;
            margin: 20px 0;
          }
          
          .funding-item {
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            border-left: 4px solid #10b981;
          }
          
          .funding-platform {
            font-weight: 600;
            color: #111827;
            font-size: 16px;
            margin-bottom: 8px;
          }
          
          .funding-meta {
            color: #6b7280;
            font-size: 13px;
            margin-bottom: 4px;
          }
          
          .chart-container {
            margin: 20px 0;
            text-align: center;
            page-break-inside: avoid;
          }
          
          .chart-container img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          th, td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          
          th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          tr:hover {
            background: #f9fafb;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          
          ul, ol {
            margin: 12px 0 12px 24px;
          }
          
          li {
            margin-bottom: 8px;
            line-height: 1.6;
          }
          
          .highlight {
            background: #fef3c7;
            padding: 2px 6px;
            border-radius: 4px;
          }
          
          .success {
            color: #059669;
            font-weight: 600;
          }
          
          .warning {
            color: #d97706;
            font-weight: 600;
          }
          
          .error {
            color: #dc2626;
            font-weight: 600;
          }
          
          /* Enhanced sections styling */
          .idea-review-section, .business-scope-section, .action-plan-section {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #8b5cf6;
          }
          
          .score-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin: 16px 0;
            padding: 16px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          }
          
          .score-item {
            text-align: center;
            padding: 12px;
            background: #f8fafc;
            border-radius: 6px;
          }
          
          .score-label {
            font-weight: 600;
            color: #475569;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 8px;
          }
          
          .score-value {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
          }
          
          .bullet-list {
            background: white;
            padding: 16px 20px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            margin: 12px 0;
          }
          
          .bullet-list li {
            margin-bottom: 8px;
            padding-left: 8px;
            border-left: 2px solid #3b82f6;
            margin-left: 12px;
          }
          
          .action-item {
            background: white;
            padding: 16px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            margin-bottom: 16px;
          }
          
          .action-item h3 {
            color: #1e293b;
            margin-top: 0;
            margin-bottom: 12px;
            font-size: 16px;
          }
          
          @page {
            size: A4;
            margin: 15mm;
          }
          
          @media print {
            .container {
              padding: 0;
              max-width: none;
            }
            
            .chart-container,
            .tool-item,
            .funding-item {
              page-break-inside: avoid;
            }
            
            h1, h2, h3 {
              page-break-after: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${html}
        </div>
      </body>
      </html>
    `

    await page.setContent(enhancedHtml, { 
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000
    })

    // Wait for any images to load
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const images = Array.from(document.images)
        let loadedImages = 0
        
        if (images.length === 0) {
          resolve()
          return
        }
        
        images.forEach(img => {
          if (img.complete) {
            loadedImages++
            if (loadedImages === images.length) resolve()
          } else {
            img.onload = img.onerror = () => {
              loadedImages++
              if (loadedImages === images.length) resolve()
            }
          }
        })
        
        // Timeout after 10 seconds
        setTimeout(() => resolve(), 10000)
      })
    })

      // Generate PDF with timeout protection
      const pdf = await Promise.race([
        page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '15mm',
            right: '15mm',
            bottom: '15mm',
            left: '15mm'
          },
          preferCSSPageSize: true,
          displayHeaderFooter: true,
          headerTemplate: '<div></div>',
          footerTemplate: `
            <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin: 0 15mm;">
              <span>Generated by PlanSpark AI • Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
            </div>
          `
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('PDF generation timeout')), 25000)
        )
      ]) as Uint8Array

      return new NextResponse(Buffer.from(pdf), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
    } catch (error) {
      console.error('PDF generation error:', error)
      throw error
    } finally {
      // Always close the browser
      try {
        await browser.close()
      } catch (closeError) {
        console.warn('Error closing browser:', closeError)
      }
    }

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
