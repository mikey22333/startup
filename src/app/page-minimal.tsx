'use client'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Test Page</h1>
      <p className="text-center">This is a minimal test page to isolate the build issue.</p>
    </div>
  )
}
