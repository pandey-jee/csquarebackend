# PowerShell script to ping the production backend

$env:BACKEND_URL = "https://csquarebackend-1.onrender.com"
node scripts/ping.js
