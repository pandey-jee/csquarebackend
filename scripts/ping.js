#!/usr/bin/env node

/**
 * Simple Ping Script for Production Environment
 * 
 * This is a lightweight script that can be run as a cron job
 * or scheduled task to ping the backend and prevent cold starts.
 */

const https = require('https');
const http = require('http');

// Get backend URL from environment variable or command line argument or default
const BACKEND_URL = process.env.BACKEND_URL || 
                   process.argv[2] || 
                   'https://csquarebackend-1.onrender.com';
const HEALTH_ENDPOINT = '/api/health';

function ping() {
  const url = `${BACKEND_URL}${HEALTH_ENDPOINT}`;
  const isHttps = url.startsWith('https');
  const client = isHttps ? https : http;
  
  console.log(`🏓 Pinging: ${url} at ${new Date().toISOString()}`);
  
  const startTime = Date.now();
  
  const req = client.get(url, (res) => {
    const responseTime = Date.now() - startTime;
    let data = '';
    
    res.on('data', chunk => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          console.log(`✅ Success (${responseTime}ms) - Status: ${response.status}`);
          if (response.uptime) {
            console.log(`⏱️  Server Uptime: ${Math.floor(response.uptime)}s`);
          }
        } catch (e) {
          console.log(`✅ Success (${responseTime}ms) - Response received`);
        }
      } else {
        console.log(`⚠️  Status: ${res.statusCode} (${responseTime}ms)`);
      }
      process.exit(0);
    });
  });
  
  req.on('error', (error) => {
    const responseTime = Date.now() - startTime;
    console.error(`❌ Error (${responseTime}ms): ${error.message}`);
    process.exit(1);
  });
  
  req.setTimeout(30000, () => {
    console.error('❌ Request timeout (30s)');
    req.destroy();
    process.exit(1);
  });
}

// Run the ping
ping();
