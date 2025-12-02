// =====================================================
// NEXCELL WHATSAPP WEBHOOK SERVER - PRODUCTION
// =====================================================

// Load environment variables
require('dotenv').config();

// Import required packages
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

// Create Express app
const app = express();
const PORT = 3000;

// Middleware to parse incoming data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Import templates
const Templates = require('./template');

// Import message sender - UNCOMMENT when ready for Ojas
const WhatsAppMessenger = require('./message_sender');
const messenger = new WhatsAppMessenger();

// =====================================================
// ENDPOINT 1: RECEIVE MESSAGES FROM TWILIO
// This receives incoming WhatsApp messages
// =====================================================
app.post('/webhook/twilio', async (req, res) => {
  console.log('\n📨 Incoming WhatsApp message:');
  
  // Extract data from Twilio webhook
  const {
    From,           // Sender's WhatsApp number
    Body,           // Message text
    MessageSid,     // Unique message ID
    ProfileName     // Sender's WhatsApp name
  } = req.body;
  
  // Clean phone number (remove "whatsapp:" prefix)
  const userPhone = From.replace('whatsapp:', '');
  
  // Log incoming message
  console.log('From:', userPhone);
  console.log('Name:', ProfileName);
  console.log('Message:', Body);
  console.log('Message ID:', MessageSid);
  
  // Create payload for n8n
  const payload = {
    phone: userPhone,
    message: Body,
    messageId: MessageSid,
    timestamp: new Date().toISOString(),
    profileName: ProfileName
  };
  
  console.log('\n📤 Payload prepared for n8n:', payload);
  
  // ===== PRODUCTION CODE =====
  try {
    console.log('Forwarding to n8n...');
    
    // Send to n8n workflow
    const n8nResponse = await axios.post(
      process.env.N8N_WEBHOOK_URL, 
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      }
    );
    
    console.log('✅ Message forwarded to n8n successfully');
    console.log('n8n Response:', n8nResponse.data);
    
  } catch (error) {
    console.error('❌ Error forwarding to n8n:', error.message);
    
    // Log more details if available
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    // Even if n8n fails, we still respond OK to Twilio
    // This prevents Twilio from retrying unnecessarily
  }
  
  // IMPORTANT: Always respond with 200 OK to Twilio
  res.status(200).send('OK');
});

// =====================================================
// ENDPOINT 2: SEND MESSAGES VIA WHATSAPP
// This receives requests from n8n to send WhatsApp messages
// =====================================================
app.post('/send-whatsapp', async (req, res) => {
  console.log('\n📨 Received message request from n8n');
  console.log('Request body:', req.body);
  
  const { phone, message } = req.body;
  
  // Validate required fields
  if (!phone || !message) {
    console.error('❌ Missing required fields');
    return res.status(400).json({ 
      success: false, 
      error: 'Missing phone or message in request body' 
    });
  }
  
  // Validate phone number format
  if (!phone.match(/^\+?[1-9]\d{1,14}$/)) {
    console.error('❌ Invalid phone number format');
    return res.status(400).json({
      success: false,
      error: 'Invalid phone number format. Use E.164 format (e.g., +447123456789)'
    });
  }
  
  // Validate message length (WhatsApp limit is 4096, but we use 1600)
  if (message.length > 1600) {
    console.error('❌ Message too long');
    return res.status(400).json({
      success: false,
      error: 'Message exceeds 1600 character limit'
    });
  }
  
  console.log('Sending WhatsApp message to:', phone);
  console.log('Message preview:', message.substring(0, 100) + '...');
  
  // Send via WhatsApp using message-sender
  const result = await messenger.sendMessage(phone, message);
  
  if (result.success) {
    console.log('✅ Message sent successfully via WhatsApp');
  } else {
    console.error('❌ Failed to send message via WhatsApp');
  }
  
  // Return result to n8n
  res.json(result);
});

// =====================================================
// ENDPOINT 3: HEALTH CHECK
// Use this to verify the server is running
// =====================================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'NexCell WhatsApp Webhook - Production',
    version: '1.0.0',
    mode: 'production',
    endpoints: {
      incoming: '/webhook/twilio',
      outgoing: '/send-whatsapp',
      health: '/health'
    }
  });
});

// =====================================================
// ENDPOINT 4: TEST ENDPOINT
// Use this to test if server is receiving requests
// =====================================================
app.post('/test', (req, res) => {
  console.log('\n🧪 Test endpoint called');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  res.json({
    success: true,
    message: 'Production server test endpoint working!',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// =====================================================
// START SERVER
// =====================================================
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 NexCell WhatsApp Webhook Server');
  console.log('========================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`⚙️  Mode: PRODUCTION`);
  console.log('\n📨 Webhook Endpoints:');
  console.log(`   Incoming (Twilio):  POST /webhook/twilio`);
  console.log(`   Outgoing (n8n):     POST /send-whatsapp`);
  console.log(`   Health Check:       GET  /health`);
  console.log(`   Test:               POST /test`);
});