'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'black', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>500</h1>
        <h2 style={{ fontSize: '2rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>Something went wrong</h2>
        <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
          We encountered an error while processing your request.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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
          <a
            href="/"
            style={{ 
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4b5563',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none'
            }}
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}