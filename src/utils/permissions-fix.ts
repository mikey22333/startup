/**
 * Permissions Fix Utility
 * 
 * Provides utilities for handling permissions policy and iframe allow attributes
 * to ensure payment processing works across different browsers and deployments.
 */

// Standard permissions for payment processing
export const PAYMENT_PERMISSIONS = [
  'payment',
  'publickey-credentials-get',
  'web-share',
  'clipboard-write',
  'clipboard-read'
] as const;

// Restricted permissions (explicitly denied)
export const RESTRICTED_PERMISSIONS = [
  'camera',
  'microphone', 
  'geolocation'
] as const;

/**
 * Generate iframe allow attribute string for payment processing
 */
export function getIframeAllowString(): string {
  const allowedFeatures = PAYMENT_PERMISSIONS.map(permission => `${permission} *`);
  return allowedFeatures.join('; ');
}

/**
 * Generate Permissions Policy header value with wildcard syntax
 */
export function getPermissionsPolicyHeader(): string {
  const allowedPolicies = PAYMENT_PERMISSIONS.map(permission => `${permission}=(*)`);
  const restrictedPolicies = RESTRICTED_PERMISSIONS.map(permission => `${permission}=()`);
  return [...allowedPolicies, ...restrictedPolicies].join(', ');
}

/**
 * Generate Feature Policy header value for older browsers
 */
export function getFeaturePolicyHeader(): string {
  return PAYMENT_PERMISSIONS.map(permission => `${permission} *`).join('; ');
}

/**
 * Runtime permissions policy fix for client-side
 */
export function applyRuntimePermissionsFix(): void {
  if (typeof window === 'undefined') return;

  try {
    // Check if permissions policy meta tag exists
    const existingMeta = document.querySelector('meta[http-equiv="Permissions-Policy"]');
    
    if (!existingMeta) {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Permissions-Policy');
      meta.setAttribute('content', getPermissionsPolicyHeader());
      document.head.appendChild(meta);
      console.log('✅ Runtime Permissions-Policy meta tag added');
    }

    // Check if feature policy meta tag exists
    const existingFeatureMeta = document.querySelector('meta[http-equiv="Feature-Policy"]');
    
    if (!existingFeatureMeta) {
      const featureMeta = document.createElement('meta');
      featureMeta.setAttribute('http-equiv', 'Feature-Policy');
      featureMeta.setAttribute('content', getFeaturePolicyHeader());
      document.head.appendChild(featureMeta);
      console.log('✅ Runtime Feature-Policy meta tag added');
    }

    // Validate payment API availability
    if ('PaymentRequest' in window) {
      console.log('✅ Payment Request API is available');
    } else {
      console.warn('⚠️ Payment Request API not available');
    }

  } catch (error) {
    console.warn('❌ Runtime permissions fix failed:', error);
  }
}

/**
 * Check if current environment supports payment processing
 */
export function checkPaymentSupport(): {
  paymentRequest: boolean;
  secureContext: boolean;
  permissions: boolean;
} {
  return {
    paymentRequest: typeof window !== 'undefined' && 'PaymentRequest' in window,
    secureContext: typeof window !== 'undefined' && window.isSecureContext,
    permissions: typeof window !== 'undefined' && 'permissions' in navigator
  };
}

/**
 * Get iframe props for payment processing components
 */
export function getPaymentIframeProps(): {
  allow: string;
  sandbox: string;
} {
  return {
    allow: getIframeAllowString(),
    sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox'
  };
}