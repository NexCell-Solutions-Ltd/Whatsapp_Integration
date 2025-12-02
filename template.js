// Message Templates for NexCell AI

const Templates = {
  
  // Greeting message
  greeting: () => {
    return `Hello! 👋 I'm NexCell AI Receptionist.

I can help you find properties. To get started, I'll need to store our conversation. Is that okay?

Reply "Yes" to continue.`;
  },
  
  // Property list (example with 3 properties)
  propertyList: (properties) => {
    let message = `Great! I found ${properties.length} properties:\n\n`;
    
    properties.forEach((prop, index) => {
      message += `${index + 1}️⃣ ${prop.title}\n`;
      message += `📍 ${prop.location} | 💰 £${prop.price}/month | 🛏️ ${prop.bedrooms} bed\n`;
      message += `🔗 ${prop.shortLink || prop.link}\n\n`;
    });
    
    message += `Which interests you? Reply with the number (1, 2, or 3).`;
    return message;
  },
  
  // Booking confirmation
  bookingConfirmation: (booking) => {
    return `✅ Viewing Confirmed!

📅 ${booking.date} | 🕐 ${booking.time}
🏠 ${booking.propertyName}
👤 Agent: ${booking.agentName}

Reminder sent 24h before.

Need to reschedule? Just ask! 📱`;
  },
  
  // Error messages
  systemError: () => {
    return `⚠️ System issue. Please try again in 1-2 minutes. 

Urgent? Call: 020 1234 5678`;
  },
  
  noResults: () => {
    return `I couldn't find properties matching your criteria. Would you like to adjust your search? 🔍`;
  }
  
};

// Export templates
module.exports = Templates;