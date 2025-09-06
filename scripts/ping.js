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
  
  console.log('🚀 ============================================');
  console.log('🏓 C-Square Club Backend Keep-Alive Ping');
  console.log('🚀 ============================================');
  console.log(`📍 Target URL: ${url}`);
  console.log(`🌐 Protocol: ${isHttps ? 'HTTPS' : 'HTTP'}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log(`🎯 Purpose: Preventing Render cold start`);
  console.log('─'.repeat(44));
  
  const startTime = Date.now();
  
  const req = client.get(url, (res) => {
    const responseTime = Date.now() - startTime;
    let data = '';
    
    res.on('data', chunk => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📥 Response received from server');
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          console.log(`✅ SUCCESS: Ping completed successfully!`);
          console.log(`⚡ Response Time: ${responseTime}ms`);
          console.log(`📊 Server Status: ${response.status}`);
          if (response.uptime) {
            console.log(`⏱️  Server Uptime: ${Math.floor(response.uptime)}s (${Math.floor(response.uptime/60)} minutes)`);
          }
          if (response.environment) {
            console.log(`🌍 Environment: ${response.environment}`);
          }
          console.log('🎉 Backend is warm and ready to serve requests!');
        } catch (e) {
          console.log(`✅ SUCCESS: Response received (${responseTime}ms)`);
          console.log('📄 Raw response received (not JSON)');
        }
      } else {
        console.log(`⚠️  WARNING: Unexpected status code ${res.statusCode}`);
        console.log(`⚡ Response Time: ${responseTime}ms`);
        console.log('🔍 Server may be experiencing issues');
      }
      console.log('─'.repeat(44));
      console.log('✨ Keep-alive ping completed');
      console.log('🚀 ============================================');
      process.exit(0);
    });
  });
  
  req.on('error', (error) => {
    const responseTime = Date.now() - startTime;
    console.log('❌ ERROR: Ping failed!');
    console.log(`⚡ Time Elapsed: ${responseTime}ms`);
    console.log(`🔥 Error Type: ${error.code || 'Unknown'}`);
    console.log(`📝 Error Message: ${error.message}`);
    console.log('🚨 Possible causes:');
    console.log('   • Server is down or unreachable');
    console.log('   • Network connectivity issues');
    console.log('   • Render service is cold starting');
    console.log('   • DNS resolution problems');
    console.log('─'.repeat(44));
    console.log('💡 Tip: Try running the ping again in a few moments');
    console.log('🚀 ============================================');
    process.exit(1);
  });
  
  req.setTimeout(30000, () => {
    console.log('⏰ TIMEOUT: Request timed out after 30 seconds');
    console.log('🚨 Server may be experiencing high load or cold start');
    console.log('💡 Tip: This is normal for Render free tier cold starts');
    console.log('🔄 The server should warm up shortly');
    console.log('─'.repeat(44));
    console.log('🚀 ============================================');
    req.destroy();
    process.exit(1);
  });
}

// Run the ping
ping();
