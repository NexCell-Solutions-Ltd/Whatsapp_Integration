// =====================================================
// SIMPLE TEST SERVER - See WhatsApp Messages
// =====================================================

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Parse incoming data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Webhook endpoint
app.post('/webhook/twilio', (req, res) => {
  console.log('\n' + '='.repeat(80));
  console.log('📱 NEW WHATSAPP MESSAGE!');
  console.log('='.repeat(80));
  console.log('Time:', new Date().toLocaleString());
  console.log('\nFrom:', req.body.From);
  console.log('Name:', req.body.ProfileName);
  console.log('Message:', req.body.Body);
  console.log('\n📦 FULL PAYLOAD:');
  console.log(JSON.stringify(req.body, null, 2));
  
  // Save to file
  const filename = `message-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(req.body, null, 2));
  console.log('\n💾 Saved to:', filename);
  console.log('='.repeat(80) + '\n');
  
  res.status(200).send('OK');
});

// Health check
app.get('/health', (req, res) => {
  res.send('✅ Server is running!');
});

// Start server
app.listen(PORT, () => {
  console.clear();
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║   🚀 TWILIO WHATSAPP TEST SERVER                  ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  console.log('📡 Server: http://localhost:' + PORT);
  console.log('✅ Ready to receive WhatsApp messages!\n');
  console.log('📋 NEXT STEPS:');
  console.log('   1. Keep this terminal OPEN');
  console.log('   2. Open NEW terminal');
  console.log('   3. Run: npx ngrok http 3000');
  console.log('   4. Copy ngrok https URL');
  console.log('   5. Go to Twilio Console');
  console.log('   6. Configure webhook (instructions below)\n');
  console.log('═'.repeat(56) + '\n');
});