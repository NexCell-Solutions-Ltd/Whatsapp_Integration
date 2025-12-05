// =====================================================
// SIMPLE WEBHOOK - Forward to FastAPI
// =====================================================

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// =====================================================
// RECEIVE FROM TWILIO → SEND TO FASTAPI
// =====================================================
app.post('/webhook/twilio', async (req, res) => {
  console.log('\n' + '='.repeat(80));
  console.log('📨 INCOMING MESSAGE FROM TWILIO');
  console.log('='.repeat(80));
  
  try {
    // Get complete raw payload
    const rawPayload = {
      ...req.body,
      _receivedAt: new Date().toISOString()
    };
    
    console.log('\n📦 Message Info:');
    console.log('  From:', rawPayload.From);
    console.log('  Body:', rawPayload.Body);
    console.log('  MessageSid:', rawPayload.MessageSid);
    console.log('  ProfileName:', rawPayload.ProfileName);
    
    // Send to FastAPI
    console.log('\n📤 Sending to FastAPI...');
    console.log('  URL:', process.env.FASTAPI_WEBHOOK_URL);
    
    const response = await axios.post(
      process.env.FASTAPI_WEBHOOK_URL,
      rawPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.FASTAPI_API_KEY
        },
        timeout: 30000
      }
    );
    
    console.log('✅ Sent to FastAPI successfully');
    console.log('  Status:', response.status);
    console.log('  Response:', response.data);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('  → FastAPI not running!');
      console.error('  → Start it with: python main.py');
    } else if (error.response) {
      console.error('  → FastAPI Error:', error.response.status);
      console.error('  → Details:', error.response.data);
    }
  }
  
  console.log('='.repeat(80) + '\n');
  
  // Always respond OK to Twilio
  res.status(200).send('OK');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Simple Webhook Server',
    fastapi_url: process.env.FASTAPI_WEBHOOK_URL
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 SIMPLE WEBHOOK SERVER');
  console.log('='.repeat(80));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`📨 Endpoint: POST /webhook/twilio`);
  console.log(`🔗 FastAPI: ${process.env.FASTAPI_WEBHOOK_URL}`);
  console.log('='.repeat(80) + '\n');
});