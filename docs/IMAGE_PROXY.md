# Image Proxy API Documentation

## Overview
The C-Square Club backend now supports fetching images from any external URL through a proxy endpoint. This allows your frontend to display images from social media platforms and other external sources without CORS restrictions.

## Configuration Changes

### 1. CORS Configuration
- **Updated**: `server.js` now allows all origins for maximum compatibility
- **Previous**: Restricted to specific allowed origins
- **Current**: `origin: true` allows requests from any domain

### 2. New Dependencies
- **Added**: `axios` for making HTTP requests to external image URLs

## API Endpoints

### Image Proxy Endpoint
```
GET /api/proxy-image?url={imageUrl}
```

**Parameters:**
- `url` (required): The external image URL to fetch

**Examples:**
```bash
# LinkedIn profile image
http://localhost:5000/api/proxy-image?url=https://media.licdn.com/dms/image/profile.jpg

# Twitter/X profile image  
http://localhost:5000/api/proxy-image?url=https://pbs.twimg.com/profile_images/123/avatar.jpg

# Instagram image
http://localhost:5000/api/proxy-image?url=https://scontent.cdninstagram.com/v/image.jpg

# Facebook image
http://localhost:5000/api/proxy-image?url=https://scontent.xx.fbcdn.net/v/image.jpg

# Google/YouTube image
http://localhost:5000/api/proxy-image?url=https://lh3.googleusercontent.com/image.jpg

# GitHub avatar
http://localhost:5000/api/proxy-image?url=https://avatars.githubusercontent.com/u/123?v=4

# Any other public image URL
http://localhost:5000/api/proxy-image?url=https://example.com/image.png
```

### Health Check Endpoint
```
GET /api/proxy-image/health
```

Returns service status and supported domains.

## Response Formats

### Successful Image Fetch
- **Content-Type**: The original image content type (image/jpeg, image/png, etc.)
- **Body**: Binary image data
- **Headers**: 
  - `Cache-Control: public, max-age=3600` (1 hour cache)
  - `Access-Control-Allow-Origin: *`

### Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Image URL is required as query parameter"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Image not found or domain unreachable"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": "Access forbidden - image may be protected"
}
```

#### 408 Request Timeout
```json
{
  "success": false,
  "error": "Request timeout - image took too long to load"
}
```

## Supported Platforms

✅ **LinkedIn** (linkedin.com, media.licdn.com)
✅ **Twitter/X** (twitter.com, x.com, pbs.twimg.com)
✅ **Instagram** (instagram.com, cdninstagram.com, scontent.cdninstagram.com)
✅ **Facebook** (facebook.com, fbcdn.net, scontent.xx.fbcdn.net)
✅ **Google/YouTube** (google.com, googleusercontent.com, ytimg.com)
✅ **GitHub** (github.com, githubusercontent.com)
✅ **Any other public image URLs**

## Security Features

- **Protocol Validation**: Only HTTP and HTTPS URLs are allowed
- **URL Validation**: Proper URL format validation
- **Timeout Protection**: 10-second timeout for requests
- **Redirect Limits**: Maximum 5 redirects allowed
- **User-Agent Spoofing**: Uses real browser headers to avoid blocking

## Frontend Integration

### JavaScript/React Example
```javascript
// Instead of using the external URL directly:
// <img src="https://pbs.twimg.com/profile_images/123/avatar.jpg" />

// Use the proxy:
const imageUrl = "https://pbs.twimg.com/profile_images/123/avatar.jpg";
const proxyUrl = `http://localhost:5000/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;

<img src={proxyUrl} alt="Profile" />
```

### URL Encoding
Always use `encodeURIComponent()` when passing URLs as query parameters:
```javascript
const externalUrl = "https://example.com/image with spaces.jpg";
const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(externalUrl)}`;
```

## Performance Considerations

- **Caching**: Images are cached for 1 hour with `Cache-Control` headers
- **Timeout**: 10-second timeout prevents hanging requests
- **Memory**: Streams images directly without storing in memory
- **Rate Limiting**: Uses existing rate limiting (100 requests per 15 minutes)

## Error Handling Best Practices

```javascript
// Frontend error handling example
const loadImageWithFallback = (externalUrl, fallbackUrl) => {
  const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(externalUrl)}`;
  
  return (
    <img 
      src={proxyUrl} 
      onError={(e) => {
        e.target.src = fallbackUrl; // Fallback to default image
      }}
      alt="Profile"
    />
  );
};
```

## Deployment Notes

### Environment Variables
No additional environment variables required. The image proxy uses existing configuration.

### Production Deployment
- The proxy will work with any external image URL
- CORS is now open for all origins
- Rate limiting applies to proxy requests

### Monitoring
Check the health endpoint to verify the service is running:
```bash
curl http://your-domain.com/api/proxy-image/health
```

## Troubleshooting

### Common Issues

1. **URL Encoding**: Make sure to encode URLs properly
2. **HTTPS Mixed Content**: When serving over HTTPS, some HTTP images may be blocked by browsers
3. **Rate Limiting**: Social media platforms may rate limit requests
4. **Image Size**: Very large images may take longer to load

### Debug Logs
The server logs show successful proxy requests:
```
🖼️  Proxying image from: https://example.com/image.jpg
✅ Successfully proxied image from: example.com
```

Error logs show failed requests:
```
❌ Image proxy error: Request timeout
```
