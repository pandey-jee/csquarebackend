#!/usr/bin/env node

/**
 * Keep-Alive Script for Render Backend
 * 
 * This script prevents the Render backend from going into cold start
 * by pinging the health endpoint every 14 minutes (Render's free tier
 * spins down after 15 minutes of inactivity).
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'https://csquarebackend-1.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds
const HEALTH_ENDPOINT = '/api/health';

// Create axios instance with timeout
const api = axios.create({
  timeout: 30000, // 30 seconds timeout
  headers: {
    'User-Agent': 'C-Square-KeepAlive/1.0.0'
  }
});

class KeepAliveService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.pingCount = 0;
    this.lastPingTime = null;
    this.failureCount = 0;
    this.maxFailures = 3;
  }

  /**
   * Start the keep-alive service
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Keep-alive service is already running');
      return;
    }

    console.log('🚀 Starting C-Square Club Keep-Alive Service');
    console.log(`📡 Target: ${BACKEND_URL}${HEALTH_ENDPOINT}`);
    console.log(`⏰ Interval: ${PING_INTERVAL / 60000} minutes`);
    console.log('─'.repeat(50));

    this.isRunning = true;
    
    // Perform initial ping
    this.ping();
    
    // Set up interval for regular pings
    this.intervalId = setInterval(() => {
      this.ping();
    }, PING_INTERVAL);

    // Handle graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  /**
   * Stop the keep-alive service
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('\n🛑 Stopping keep-alive service...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    console.log('✅ Keep-alive service stopped gracefully');
    console.log(`📊 Total pings sent: ${this.pingCount}`);
    process.exit(0);
  }

  /**
   * Ping the backend health endpoint
   */
  async ping() {
    const startTime = Date.now();
    this.pingCount++;
    
    try {
      console.log(`🏓 Ping #${this.pingCount} at ${new Date().toISOString()}`);
      
      const response = await api.get(`${BACKEND_URL}${HEALTH_ENDPOINT}`);
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200) {
        this.failureCount = 0; // Reset failure count on success
        this.lastPingTime = new Date();
        
        console.log(`✅ Ping successful (${responseTime}ms)`);
        console.log(`📈 Server Status: ${response.data.status}`);
        console.log(`⏱️  Server Uptime: ${Math.floor(response.data.uptime)}s`);
        
        if (response.data.environment) {
          console.log(`🌍 Environment: ${response.data.environment}`);
        }
        
        console.log('─'.repeat(30));
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
      
    } catch (error) {
      this.failureCount++;
      const responseTime = Date.now() - startTime;
      
      console.error(`❌ Ping #${this.pingCount} failed (${responseTime}ms)`);
      console.error(`🔥 Error: ${error.message}`);
      
      if (error.response) {
        console.error(`📊 Status: ${error.response.status}`);
        console.error(`📝 Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      
      if (this.failureCount >= this.maxFailures) {
        console.error(`🚨 Maximum failures (${this.maxFailures}) reached`);
        console.error('🔄 Consider checking the backend deployment');
        // Don't stop the service, just log the issue
      }
      
      console.log('─'.repeat(30));
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      pingCount: this.pingCount,
      lastPingTime: this.lastPingTime,
      failureCount: this.failureCount,
      uptime: this.isRunning ? Date.now() - (this.lastPingTime || Date.now()) : 0
    };
  }
}

// CLI interface
if (require.main === module) {
  const keepAlive = new KeepAliveService();
  
  console.log('🎯 C-Square Club Backend Keep-Alive Service');
  console.log('🛡️  Preventing Render cold starts...\n');
  
  keepAlive.start();
}

module.exports = KeepAliveService;
