const Templates = require('./template');

// Test data
const testProperties = [
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

const testBooking = {
  date: 'Thursday, Dec 18',
  time: '10:00 AM',
  propertyName: 'Modern 2-Bed, Angel',
  agentName: 'Sarah Johnson'
};

// Test all templates
console.log('=== GREETING ===');
console.log(Templates.greeting());
console.log('\n=== PROPERTY LIST ===');
console.log(Templates.propertyList(testProperties));
console.log('\n=== BOOKING CONFIRMATION ===');
console.log(Templates.bookingConfirmation(testBooking));
console.log('\n=== ERROR MESSAGE ===');
console.log(Templates.systemError());

// Check message lengths
console.log('\n=== LENGTH CHECK ===');
console.log('Greeting length:', Templates.greeting().length, 'chars');
console.log('Property list length:', Templates.propertyList(testProperties).length, 'chars');