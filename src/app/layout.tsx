import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Idea2Action - Turn Your Business Idea Into Action',
  description: 'Generate detailed, actionable 30-60-90 day business plans from your ideas using AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
