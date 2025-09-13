// Force permissions policy to be applied at runtime
if (typeof window !== 'undefined') {
  // Set document permissions policy if not already set
  try {
    // Add permissions policy meta tag if missing
    if (!document.querySelector('meta[http-equiv="Permissions-Policy"]')) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Permissions-Policy';
      meta.content = 'payment=*, publickey-credentials-get=*, web-share=*, clipboard-write=*, clipboard-read=*';
      document.head.appendChild(meta);
    }

    // Set iframe allow attributes for any Paddle iframes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as Element;
            // Check if it's a Paddle iframe or contains Paddle iframes
            if (element.tagName === 'IFRAME' && 
                (element.getAttribute('src')?.includes('paddle.com') || 
                 element.getAttribute('src')?.includes('m2pfintech.com'))) {
              element.setAttribute('allow', 'payment; publickey-credentials-get; web-share; clipboard-write; clipboard-read');
            }
            // Also check child iframes
            const iframes = element.querySelectorAll('iframe');
            iframes.forEach((iframe) => {
              if (iframe.src.includes('paddle.com') || iframe.src.includes('m2pfintech.com')) {
                iframe.setAttribute('allow', 'payment; publickey-credentials-get; web-share; clipboard-write; clipboard-read');
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    console.log('✅ Permissions policy runtime fix applied');
  } catch (error) {
    console.warn('Permissions policy runtime fix failed:', error);
  }
}