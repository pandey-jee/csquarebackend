@echo off
REM Windows batch script to ping the production backend

set BACKEND_URL=https://csquarebackend-1.onrender.com
node scripts/ping.js
