/**
 * URL validation utilities for flexible image URL handling
 */

/**
 * Validates if a URL is accessible and could be an image
 * Supports various formats including:
 * - Standard HTTP/HTTPS URLs
 * - Data URLs (base64 encoded images)
 * - CDN URLs without file extensions
 * - Image hosting service URLs
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid image URL format
 */
function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url.trim());
    
    // Allow http, https, and data protocols
    const allowedProtocols = ['http:', 'https:', 'data:'];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return false;
    }
    
    // For data URLs, check if it's an image
    if (urlObj.protocol === 'data:') {
      return url.startsWith('data:image/');
    }
    
    // For HTTP/HTTPS URLs, accept any valid URL
    // Many modern image hosting services don't use file extensions
    return true;
    
  } catch (error) {
    return false;
  }
}

/**
 * Validates general URLs (for links, social media, etc.)
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid URL format
 */
function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url.trim());
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch (error) {
    return false;
  }
}

module.exports = {
  isValidImageUrl,
  isValidUrl
};
