const { Resend } = require('resend');

async function sendemail(Url, email, firstName, lastName) {

  const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);
  const emailTemplate = `
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9fafb;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #6d74fc;
            margin-top: 0;
        }
        p {
            color: #555;
        }
        .reset-link a {
            font-size: 18px;
            font-weight: bold;
            color: #6d74fc; /* Your primary text color */
            text-decoration: none;
        }
        .reset-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Password Reset Request</h1>
        <p>Hi ${firstName} ${lastName},</p>
        <p>We received a request to reset your password. Click the link below to reset your password:</p>
        <p class="reset-link"><a href="${Url}">Reset Password</a></p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
        <p>Thank you,</p>
        <p>SHU CarPool</p>
    </div>
</body>
</html>
`;

  await resend.emails.send({
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: 'Password Reset Request',
    html: emailTemplate
  });
}

async function sendMembershipApprovalEmail(email, firstName, lastName) {
  try {
    if (!process.env.RESEND_EMAIL_API_KEY) {
      console.error('RESEND_EMAIL_API_KEY is not set');
      return { success: false, error: 'Email API key missing' };
    }

    if (!process.env.SENDER_EMAIL) {
      console.error('SENDER_EMAIL is not set');
      return { success: false, error: 'Sender email not configured' };
    }

    const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);
    
    const emailTemplate = `
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9fafb;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #4caf50;
            margin-top: 0;
        }
        p {
            color: #555;
            line-height: 1.6;
        }
        .highlight {
            background-color: #e8f5e9;
            padding: 16px;
            border-left: 4px solid #4caf50;
            border-radius: 4px;
            margin: 16px 0;
        }
        .cta {
            display: inline-block;
            background-color: #4caf50;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 16px;
        }
        .cta:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>✓ Membership Approved!</h1>
        <p>Hi ${firstName} ${lastName},</p>
        <p>Great news! Your membership payment has been approved by our admin team.</p>
        <div class="highlight">
            <strong>You are now a Premium Member!</strong>
            <p>You can now enjoy unlimited rides on SHU Carpool without any restrictions.</p>
        </div>
        <p><strong>What's next:</strong></p>
        <ul>
            <li>Create and join rides anytime</li>
            <li>Connect with other students for carpooling</li>
            <li>Track your ride history</li>
        </ul>
        <p>
            <a href="${process.env.CLIENT_URL || 'https://shucarpool.com'}/home" class="cta">Go to SHU Carpool</a>
        </p>
        <p style="margin-top: 32px; color: #999; font-size: 12px;">
            If you have any questions or need support, please contact us.
        </p>
        <p>Thank you for joining SHU Carpool!<br/>SHU CarPool Team</p>
    </div>
</body>
</html>
`;

    console.log(`Sending membership approval email to ${email}...`);
    
    const response = await resend.emails.send({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: '✓ Your SHU Carpool Membership is Approved!',
      html: emailTemplate
    });

        console.log(`Resend response for ${email}:`, response);

        // Resend returns an `error` field when the request was invalid (e.g. unverified domain)
        if (response && response.error) {
            const errMsg = response.error.message || JSON.stringify(response.error);
            console.error(`Resend error sending email to ${email}:`, errMsg);
            return { success: false, error: errMsg, data: response };
        }

        return { success: true, data: response };
  } catch (error) {
    console.error(`Error sending membership approval email to ${email}:`, error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

module.exports = { sendemail, sendMembershipApprovalEmail };