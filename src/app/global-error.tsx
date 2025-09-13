'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{ 
        backgroundColor: 'black', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        margin: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>500</h1>
          <h2 style={{ fontSize: '2rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>Application Error</h2>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
            A critical error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{ 
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}