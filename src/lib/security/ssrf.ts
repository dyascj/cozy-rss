/**
 * SSRF (Server-Side Request Forgery) Protection
 * Validates URLs to prevent requests to internal/private networks
 */

// Patterns matching private/internal IP ranges
const PRIVATE_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,      // 127.0.0.0/8 loopback
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,        // 10.0.0.0/8 private
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/,  // 172.16.0.0/12 private
  /^192\.168\.\d{1,3}\.\d{1,3}$/,           // 192.168.0.0/16 private
  /^169\.254\.\d{1,3}\.\d{1,3}$/,           // 169.254.0.0/16 link-local
  /^0\.0\.0\.0$/,                            // Unspecified
  /^::1$/,                                   // IPv6 loopback
  /^fc00:/i,                                 // IPv6 unique local
  /^fe80:/i,                                 // IPv6 link-local
  /^::$/,                                    // IPv6 unspecified
  /^\[::1\]$/,                              // IPv6 loopback with brackets
  /^0+\.0+\.0+\.0+$/,                       // All zeros variants
  /\.local$/i,                              // mDNS local domain
  /\.internal$/i,                           // Internal domain
  /\.localhost$/i,                          // Localhost subdomain
];

// Additional blocked hostnames
const BLOCKED_HOSTNAMES = new Set([
  "metadata.google.internal",  // GCP metadata
  "169.254.169.254",          // AWS/Azure/GCP metadata endpoint
  "metadata",                  // Generic metadata
  "kubernetes.default",        // Kubernetes
  "kubernetes.default.svc",    // Kubernetes
]);

/**
 * Check if a hostname matches private/internal patterns
 */
function isPrivateHostname(hostname: string): boolean {
  const lowerHostname = hostname.toLowerCase();

  // Check blocked hostnames
  if (BLOCKED_HOSTNAMES.has(lowerHostname)) {
    return true;
  }

  // Check against patterns
  return PRIVATE_HOSTNAME_PATTERNS.some(pattern => pattern.test(hostname));
}

/**
 * Validate a URL for SSRF protection
 * Returns an error message if the URL is blocked, null if safe
 */
export function validateUrlForSSRF(urlString: string): string | null {
  let url: URL;

  try {
    url = new URL(urlString);
  } catch {
    return "Invalid URL format";
  }

  // Only allow http and https
  if (!["http:", "https:"].includes(url.protocol)) {
    return "Invalid URL protocol. Only HTTP and HTTPS are allowed";
  }

  // Block private/internal hostnames
  if (isPrivateHostname(url.hostname)) {
    return "Access to internal networks is not allowed";
  }

  // Block URLs with authentication credentials
  if (url.username || url.password) {
    return "URLs with credentials are not allowed";
  }

  return null; // URL is safe
}

/**
 * Safe URL validation that returns a boolean
 */
export function isUrlSafeForFetch(urlString: string): boolean {
  return validateUrlForSSRF(urlString) === null;
}
