const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller.js');
const { restrictToUserlogin } = require('../middlewares/auth.middleware.js');

const userModel = require('../models/user.models.js');
async function ensureAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Unauthorized' });
    const user = await userModel.findById(req.user.id).select('role');
    if (!user || user.role !== 'Admin') return res.status(403).json({ message: 'Access denied' });
    next();
  } catch (err) {
    console.error('ensureAdmin error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Dashboard UI page (shows pending payment requests)
router.get('/dashboard', restrictToUserlogin, ensureAdmin, (req, res) => {
  return res.render('adminDashboard');
});

// API endpoint to fetch pending payments
router.get('/payments/pending', restrictToUserlogin, ensureAdmin, adminController.getPendingPayments);

// API endpoint to approve a payment request
router.post('/payments/:id/approve', restrictToUserlogin, ensureAdmin, adminController.approvePaymentRequest);

module.exports = router;
