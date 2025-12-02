// =====================================================
// NEXCELL WHATSAPP WEBHOOK SERVER - TESTING
// This version is for local testing without n8n
// =====================================================

// Load environment variables
require('dotenv').config();

// Import required packages
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const path = require('path');

// Create Express app
const app = express();
const PORT = 3000;

// Middleware to parse incoming data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Import templates
const Templates = require('./template');

// Store for conversation data (temporary, for testing)
const conversations = new Map();

// =====================================================
// ENDPOINT 1: RECEIVE MESSAGES FROM TWILIO
// =====================================================
app.post('/webhook/twilio', async (req, res) => {
  console.log('\n📨 Incoming WhatsApp message:');
  
  // Extract data from Twilio webhook
  const {
    From,
    Body,
    MessageSid,
    ProfileName
  } = req.body;
  
  // Clean phone number
  const userPhone = From.replace('whatsapp:', '');
  
  // Log incoming message
  console.log('From:', userPhone);
  console.log('Name:', ProfileName);
  console.log('Message:', Body);
  console.log('Message ID:', MessageSid);
  
  // Create test payload (what would be sent to n8n)
  const payload = {
    phone: userPhone,
    message: Body,
    messageId: MessageSid,
    timestamp: new Date().toISOString(),
    profileName: ProfileName
  };
  
  console.log('\n📤 Test Payload (would be sent to n8n):', payload);
  
  // Handle message with test logic
  await handleMessageForTesting(userPhone, Body);
  
  // Always respond 200 OK to Twilio
  res.status(200).send('OK');
});

// =====================================================
// TEST MESSAGE HANDLER
// Simulates conversation flow without n8n
// =====================================================
async function handleMessageForTesting(phone, message) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  
  try {
    let responseMessage;
    const lowerMessage = message.toLowerCase().trim();
    
    // Store conversation state
    if (!conversations.has(phone)) {
      conversations.set(phone, { step: 'greeting' });
    }
    
    const userState = conversations.get(phone);
    
    // Conversation flow
    if (lowerMessage === 'hi' || lowerMessage === 'hello' || lowerMessage === 'hey') {
      responseMessage = Templates.greeting();
      userState.step = 'awaiting_consent';
    } 
    else if (lowerMessage === 'yes' && userState.step === 'awaiting_consent') {
      responseMessage = "Great! What type of property are you looking for?\n\nExamples:\n• '2 bed flat in Islington'\n• 'Studio under £1500'\n• '3 bed house in Hackney'";
      userState.step = 'awaiting_search';
    }
    else if (lowerMessage.includes('bed') && userState.step === 'awaiting_search') {
      // Simulate property search
      const mockProperties = [
        {
          title: 'Modern 2-Bed Flat in Islington',
          location: 'Angel, N1',
          price: 1650,
          bedrooms: 2,
          link: 'https://bit.ly/prop123'
        },
        {
          title: 'Spacious 2-Bed Apartment',
          location: 'Islington, N1',
          price: 1800,
          bedrooms: 2,
          link: 'https://bit.ly/prop789'
        },
        {
          title: 'Bright 2-Bed with Garden',
          location: 'Islington, N1',
          price: 1950,
          bedrooms: 2,
          link: 'https://bit.ly/prop999'
        }
      ];
      responseMessage = Templates.propertyList(mockProperties);
      userState.step = 'awaiting_selection';
      userState.properties = mockProperties;
    }
    else if (['1', '2', '3'].includes(lowerMessage) && userState.step === 'awaiting_selection') {
      const selectedIndex = parseInt(lowerMessage) - 1;
      if (userState.properties && userState.properties[selectedIndex]) {
        const property = userState.properties[selectedIndex];
        responseMessage = `Great choice! 🏠\n\n${property.title}\n📍 ${property.location}\n💰 £${property.price}/month\n\nWould you like to:\n1️⃣ Book a viewing\n2️⃣ Get more details\n3️⃣ See other properties\n\nReply with the number.`;
        userState.step = 'awaiting_action';
        userState.selectedProperty = property;
      }
    }
    else if (lowerMessage === '1' && userState.step === 'awaiting_action') {
      const mockBooking = {
        date: 'Thursday, Dec 5',
        time: '10:00 AM',
        propertyName: userState.selectedProperty?.title || 'Selected Property',
        agentName: 'Sarah Johnson'
      };
      responseMessage = Templates.bookingConfirmation(mockBooking);
      userState.step = 'completed';
    }
    else if (lowerMessage === 'no') {
      responseMessage = "No problem! Feel free to reach out when you're ready. Have a great day! 👋";
      conversations.delete(phone); // Reset conversation
    }
    else {
      responseMessage = "I'm not sure I understand. Could you rephrase that? 😊\n\nOr type 'hi' to start over.";
    }
    
    // Update conversation state
    conversations.set(phone, userState);
    
    // Send response via WhatsApp
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${phone}`,
      body: responseMessage
    });
    
    console.log('✅ Test response sent to user');
    console.log('Current step:', userState.step);
    
  } catch (error) {
    console.error('❌ Error sending test response:', error.message);
  }
}

// =====================================================
// HEALTH CHECK ENDPOINT
// =====================================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'NexCell WhatsApp Webhook - Testing',
    version: '1.0.0',
    mode: 'testing',
    activeConversations: conversations.size
  });
});

// =====================================================
// RESET CONVERSATION (TESTING ONLY)
// =====================================================
app.post('/reset', (req, res) => {
  const { phone } = req.body;
  
  if (phone) {
    conversations.delete(phone);
    console.log(`🔄 Reset conversation for: ${phone}`);
    res.json({ success: true, message: `Conversation reset for ${phone}` });
  } else {
    conversations.clear();
    console.log('🔄 Reset all conversations');
    res.json({ success: true, message: 'All conversations reset' });
  }
});

// =====================================================
// VIEW CONVERSATIONS (TESTING ONLY)
// =====================================================
app.get('/conversations', (req, res) => {
  const conversationsList = Array.from(conversations.entries()).map(([phone, data]) => ({
    phone,
    ...data
  }));
  
  res.json({
    count: conversations.size,
    conversations: conversationsList
  });
});

// =====================================================
// SERVE STATIC HTML FILES
// =====================================================
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'test_interface_production.html'));
});

app.get('/test-interface', (req, res) => {
  res.sendFile(path.join(__dirname, 'test_interface_production.html'));
});


// =====================================================
// START SERVER
// =====================================================
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🧪 NexCell WhatsApp Webhook Server - TEST MODE');
  console.log('========================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`⚙️  Mode: TESTING (No n8n required)`);
  console.log('\n📨 Available Endpoints:');
  console.log(`   Webhook (Twilio):   POST /webhook/twilio`);
  console.log(`   Health Check:       GET  /health`);
  console.log(`   View Conversations: GET  /conversations`);
  console.log(`   Reset Conversation: POST /reset`);
  console.log('\n💡 Testing Instructions:');
  console.log('   1. Start ngrok: ngrok http 3000');
  console.log('   2. Update Twilio webhook with ngrok URL');
  console.log('   3. Send WhatsApp messages to test flow');
  console.log('   4. Visit http://localhost:3000/conversations to see state');
  console.log('\n🎯 Test Conversation Flow:');
  console.log('   Send: "Hi" → Get greeting');
  console.log('   Send: "Yes" → Get property search prompt');
  console.log('   Send: "2 bed flat" → Get property list');
  console.log('   Send: "1" → Select property');
  console.log('   Send: "1" → Book viewing');
  console.log('\n✅ Ready for testing!');
  console.log('========================================\n');
});