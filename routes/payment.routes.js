const express = require('express');
const router = express.Router();
const { restrictToUserlogin } = require('../middlewares/auth.middleware.js');
const { upload } = require('../utils/multer.utils.js');
const paymentController = require('../controllers/payment.controller.js');

// Show pay-membership page (you can create a view named payMembership.ejs)
router.get('/pay-membership', restrictToUserlogin, (req, res) => {
  return res.render('payMembership', { error: null });
});

// Form POST to submit payment (transaction id + optional proof image)
router.post('/pay-membership', restrictToUserlogin, upload.single('proofImage'), paymentController.submitPaymentRequest);

// Simple success page
router.get('/payment-submitted', restrictToUserlogin, (req, res) => {
  return res.render('paymentSubmitted');
});

module.exports = router;
