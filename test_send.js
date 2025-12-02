// Load environment variables
require('dotenv').config();

// Import Twilio
const twilio = require('twilio');

// Create Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Function to send test message
async function sendTestMessage() {
  try {
    console.log('Sending test message...');
    
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: process.env.YOUR_WHATSAPP_NUMBER,
      body: 'Hello! This is a test message from NexCell AI. 👋'
    });
    
    console.log('✅ Message sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('Status:', message.status);
    
  } catch (error) {
    console.error('❌ Error sending message:', error.message);
  }
}

// Run the function
sendTestMessage();