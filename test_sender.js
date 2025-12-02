require('dotenv').config();
const WhatsAppMessenger = require('./message_sender');
const Templates = require('./template');

async function testSender() {
  const messenger = new WhatsAppMessenger();
  
  console.log('🧪 Testing WhatsApp Message Sender\n');
  
  // Test 1: Simple message
  console.log('Test 1: Sending simple message...');
  const result1 = await messenger.sendMessage(
    process.env.YOUR_WHATSAPP_NUMBER.replace('whatsapp:', ''),
    'Test message from NexCell sender! 🚀'
  );
  console.log('Result:', result1);
  
  // Wait 2 seconds (rate limiting)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Send greeting template
  console.log('\nTest 2: Sending greeting template...');
  const result2 = await messenger.sendMessage(
    process.env.YOUR_WHATSAPP_NUMBER.replace('whatsapp:', ''),
    Templates.greeting()
  );
  console.log('Result:', result2);
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 3: Send property list
  console.log('\nTest 3: Sending property list...');
  const mockProperties = [
    {
      title: 'Modern 2-Bed Flat in Islington',
      location: 'Angel, N1',
      price: 1650,
      bedrooms: 2,
      link: 'https://bit.ly/prop123'
    },
    {
      title: 'Cozy Studio in Shoreditch',
      location: 'Old Street, EC2',
      price: 1200,
      bedrooms: 1,
      link: 'https://bit.ly/prop456'
    }
  ];
  
  const result3 = await messenger.sendMessage(
    process.env.YOUR_WHATSAPP_NUMBER.replace('whatsapp:', ''),
    Templates.propertyList(mockProperties)
  );
  console.log('Result:', result3);
  
  console.log('\n✅ All tests complete! Check your WhatsApp.');
}

testSender();