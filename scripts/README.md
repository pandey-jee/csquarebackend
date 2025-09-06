# Backend Keep-Alive Scripts

This directory contains scripts to prevent the Render backend from going into cold start by pinging it regularly.

## 📁 Files

### `keep-alive.js`
A comprehensive keep-alive service that runs continuously and pings the backend every 14 minutes.

**Features:**
- ✅ Automatic pinging every 14 minutes
- ✅ Health monitoring and statistics
- ✅ Failure tracking and reporting
- ✅ Graceful shutdown handling
- ✅ Detailed logging

### `ping.js`
A simple, lightweight script that performs a single ping to the backend.

**Features:**
- ✅ Single ping execution
- ✅ Lightweight and fast
- ✅ Perfect for cron jobs
- ✅ Exit codes for monitoring

## 🚀 Usage

### Running the Keep-Alive Service

```bash
# Start the continuous keep-alive service
npm run keep-alive

# The service will run until stopped with Ctrl+C
```

### Single Ping

```bash
# Ping the backend once
npm run ping

# Ping production backend specifically
npm run ping-production
```

### Using with Cron Jobs

To set up automatic pinging using cron (Linux/Mac):

```bash
# Edit crontab
crontab -e

# Add this line to ping every 10 minutes
*/10 * * * * cd /path/to/your/backend && npm run ping-production

# Or ping every 14 minutes
*/14 * * * * cd /path/to/your/backend && npm run ping-production
```

### Using with Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger to "Daily" and repeat every 10-14 minutes
4. Set action to start program: `cmd.exe`
5. Add arguments: `/c cd "C:\path\to\backend" && npm run ping-production`

## 🔧 Configuration

### Environment Variables

Set these in your `.env` file:

```env
# Backend URL to ping
BACKEND_URL=https://csquarebackend-1.onrender.com
```

### Customizing Ping Interval

Edit `keep-alive.js` and modify the `PING_INTERVAL` constant:

```javascript
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds
```

## 📊 Why Use Keep-Alive?

**Render Free Tier Limitations:**
- Free tier services spin down after 15 minutes of inactivity
- Cold starts can take 30+ seconds
- Users experience delays when accessing the API

**Our Solution:**
- Ping every 14 minutes to keep the service warm
- Prevents cold starts and improves user experience
- Minimal resource usage

## 🛡️ Best Practices

1. **Use for Production Only**: Don't run keep-alive on development
2. **Monitor Logs**: Check logs regularly to ensure pings are successful
3. **Set Up Alerts**: Monitor for consecutive failures
4. **Resource Awareness**: Keep-alive uses minimal resources but monitor usage

## 📈 Monitoring

The keep-alive service provides detailed logs:

```
🏓 Ping #1 at 2025-01-09T10:00:00.000Z
✅ Ping successful (245ms)
📈 Server Status: OK
⏱️  Server Uptime: 3600s
🌍 Environment: production
```

## 🚨 Troubleshooting

### Service Not Starting
- Check if the backend URL is correct
- Verify network connectivity
- Ensure all dependencies are installed

### High Failure Rate
- Check backend deployment status
- Verify Render service is running
- Check for network issues

### Resource Usage
- Monitor CPU and memory usage
- Adjust ping interval if needed
- Consider using the simple ping script instead

## 🔗 Integration

### CI/CD Pipeline
Add keep-alive monitoring to your deployment scripts:

```bash
# After deployment, verify with a ping
npm run ping-production
```

### Health Monitoring
Integrate with monitoring services by parsing the script output:

```bash
# Returns exit code 0 on success, 1 on failure
npm run ping-production && echo "Backend is healthy" || echo "Backend is down"
```
