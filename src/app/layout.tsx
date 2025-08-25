import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/components/AuthProvider'

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
      <body className="bg-black">
        <AuthProvider>
          <div className="min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
