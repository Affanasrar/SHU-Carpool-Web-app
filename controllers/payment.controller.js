const PaymentRequest = require('../models/paymentRequest.models.js');
const { uploadImageToCloudinary } = require('../utils/cloudinary.utils.js');

async function submitPaymentRequest(req, res) {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Unauthorized' });

    const { transactionId } = req.body;
    if (!transactionId) {
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json')) || req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.status(400).json({ error: 'Transaction ID is required' });
      }
      return res.status(400).render('payMembership', { error: 'Transaction ID is required' });
    }

    let proofImageUrl;
    if (req.file && req.file.buffer) {
      proofImageUrl = await uploadImageToCloudinary(req.file.buffer);
    }

    await PaymentRequest.create({
      userId: req.user.id,
      transactionId,
      proofImage: proofImageUrl
    });

    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json')) || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.json({ success: true, redirect: '/payment-submitted' });
    }

    return res.redirect('/payment-submitted');
  } catch (err) {
    console.error('submitPaymentRequest error:', err);
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json')) || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.status(500).json({ error: 'Failed to submit payment request.' });
    }
    return res.status(500).render('payMembership', { error: 'Failed to submit payment request.' });
  }
}

module.exports = { submitPaymentRequest };
