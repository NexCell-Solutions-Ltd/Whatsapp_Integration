require('dotenv').config();
const twilio = require('twilio');

class WhatsAppMessenger {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.from = process.env.TWILIO_WHATSAPP_NUMBER;
    
    // Rate limiting: max 1 message per second
    this.lastMessageTime = 0;
    this.minInterval = 1000; // 1 second
  }
  
  // Wait for rate limit
  async rateLimiter() {
    const now = Date.now();
    const timeSinceLastMessage = now - this.lastMessageTime;
    
    if (timeSinceLastMessage < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastMessage;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastMessageTime = Date.now();
  }
  
  // Send message with retry logic
  async sendMessage(to, body, retries = 3) {
    await this.rateLimiter();
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`📤 Sending message (attempt ${attempt}/${retries})...`);
        
        const message = await this.client.messages.create({
          from: this.from,
          to: `whatsapp:${to}`,
          body: body
        });
        
        console.log('✅ Message sent successfully');
        console.log('Message SID:', message.sid);
        console.log('Status:', message.status);
        
        return {
          success: true,
          messageId: message.sid,
          status: message.status
        };
        
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt === retries) {
          console.error('❌ All retry attempts failed');
          return {
            success: false,
            error: error.message
          };
        }
        
        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
        console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
}

module.exports = WhatsAppMessenger;