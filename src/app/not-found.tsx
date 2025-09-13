export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: 'black', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>404</h1>
            <h2 style={{ fontSize: '2rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>Page Not Found</h2>
            <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
              Sorry, we could not find the page you are looking for.
            </p>
            <a
              href="/"
              style={{ 
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '0.5rem',
                textDecoration: 'none'
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}