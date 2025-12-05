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

router.get('/payments/pending', restrictToUserlogin, ensureAdmin, adminController.getPendingPayments);
router.post('/payments/:id/approve', restrictToUserlogin, ensureAdmin, adminController.approvePaymentRequest);

module.exports = router;
