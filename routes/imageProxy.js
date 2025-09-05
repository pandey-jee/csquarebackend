const express = require('express');
const axios = require('axios');
const router = express.Router();

// Image proxy endpoint to fetch external images
router.get('/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Image URL is required as query parameter'
      });
    }

    // Validate URL format
    let imageUrl;
    try {
      imageUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(imageUrl.protocol)) {
      return res.status(400).json({
        success: false,
        error: 'Only HTTP and HTTPS URLs are allowed'
      });
    }

    console.log(`🖼️  Proxying image from: ${url}`);

    // Fetch the image with proper headers to mimic a real browser
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      }
    });

    // Set appropriate headers
    const contentType = response.headers['content-type'];
    if (contentType && contentType.startsWith('image/')) {
      res.setHeader('Content-Type', contentType);
    } else {
      res.setHeader('Content-Type', 'image/jpeg'); // Default fallback
    }

    // Set caching headers
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Pipe the image data to the response
    response.data.pipe(res);

    console.log(`✅ Successfully proxied image from: ${imageUrl.hostname}`);

  } catch (error) {
    console.error('❌ Image proxy error:', error.message);
    
    // Handle specific error types
    if (error.code === 'ENOTFOUND') {
      return res.status(404).json({
        success: false,
        error: 'Image not found or domain unreachable'
      });
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(408).json({
        success: false,
        error: 'Request timeout - image took too long to load'
      });
    }

    if (error.response && error.response.status === 403) {
      return res.status(403).json({
        success: false,
        error: 'Access forbidden - image may be protected'
      });
    }

    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Failed to fetch image',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check for image proxy
router.get('/proxy-image/health', (req, res) => {
  res.json({
    success: true,
    message: 'Image proxy service is running',
    usage: '/api/proxy-image?url=https://example.com/image.jpg',
    supportedDomains: [
      'LinkedIn (linkedin.com)',
      'Twitter/X (twitter.com, x.com, pbs.twimg.com)',
      'Instagram (instagram.com, cdninstagram.com)',
      'Facebook (facebook.com, fbcdn.net)',
      'Google (google.com, googleusercontent.com)',
      'GitHub (github.com, githubusercontent.com)',
      'And any other public image URLs'
    ]
  });
});

module.exports = router;
