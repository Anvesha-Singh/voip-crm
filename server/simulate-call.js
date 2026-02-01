// This script simulates a webhook POST from a VoIP provider

const https = require('https');

const data = JSON.stringify({
  caller_number: '555-0199' // Matches 'Alice' created in Phase 1
});

const options = {
  hostname: 'viscid-laurice-vitalistically.ngrok-free.dev',
  port: 443,
  path: '/api/webhook/call',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (d) => {
    process.stdout.write(d);
    console.log('\nCall simulation complete.');
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();