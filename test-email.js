require('dotenv').config();
const { sendMembershipApprovalEmail } = require('./services/emailsend.js');

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('RESEND_EMAIL_API_KEY:', process.env.RESEND_EMAIL_API_KEY ? 'SET' : 'MISSING');
  console.log('SENDER_EMAIL:', process.env.SENDER_EMAIL || 'MISSING');

  const result = await sendMembershipApprovalEmail(
    'test@example.com',
    'Test',
    'User'
  );

  console.log('\nEmail Result:');
  console.log(result);

  if (result.success) {
    console.log('\n✓ Email configuration is working!');
    process.exit(0);
  } else {
    console.error('\n✗ Email configuration error:', result.error);
    process.exit(1);
  }
}

testEmail();
