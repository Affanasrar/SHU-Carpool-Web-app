const PaymentRequest = require('../models/paymentRequest.models.js');
const User = require('../models/user.models.js');
const nodemailer = require('nodemailer');

async function getPendingPayments(req, res) {
  try {
    const pending = await PaymentRequest.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email isPremium');

    return res.status(200).json({ pending });
  } catch (err) {
    console.error('Error fetching pending payments:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function approvePaymentRequest(req, res) {
  try {
    const { id } = req.params;
    const request = await PaymentRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Payment request not found' });

    if (request.status === 'approved') {
      return res.status(400).json({ message: 'Request already approved' });
    }

    request.status = 'approved';
    request.reviewedBy = req.user && req.user.id ? req.user.id : undefined;
    request.reviewedAt = new Date();
    await request.save();

    const user = await User.findById(request.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isPremium = true;
    await user.save();

    // send notification email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: 'Membership Approved — SHU Carpool',
        html: `<p>Hi ${user.firstName} ${user.lastName},</p>
               <p>Your membership payment has been approved. You can now use SHU Carpool without restrictions.</p>
               <p>Thank you,<br/>SHU Carpool Team</p>`
      };

      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error('Failed to send approval email:', emailErr);
    }

    return res.status(200).json({ message: 'Payment approved and user upgraded to premium.' });
  } catch (err) {
    console.error('Error approving payment request:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getPendingPayments, approvePaymentRequest };
