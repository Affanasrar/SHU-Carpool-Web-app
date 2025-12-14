const User = require('../models/user.models.js');

async function checkMembership(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id).select('ridesCompleted isPremium');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.ridesCompleted >= 1 && !user.isPremium) {
        // Log blocking details for debugging
        console.log(`Membership block: user=${req.user.id} ridesCompleted=${user.ridesCompleted} isPremium=${user.isPremium} path=${req.path} accept=${req.headers.accept}`);

      // Browser requests: redirect to payment page; API requests: 403 JSON
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return res.redirect('/pay-membership');
      }
        // For API/fetch requests, return JSON including a redirect field so client can navigate
        // Detect JSON requests by Accept header or Content-Type or X-Requested-With
        const acceptsJson = (req.headers.accept && req.headers.accept.includes('application/json')) ||
                            (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) ||
                            (req.headers['x-requested-with'] && req.headers['x-requested-with'] === 'XMLHttpRequest');

        const payload = { message: 'Free trial over. Please pay membership fee.', redirect: '/pay-membership' };
        if (acceptsJson) return res.status(403).json(payload);

        // Fallback: send JSON payload
        return res.status(403).json(payload);
    }

    return next();
  } catch (err) {
    console.error('checkMembership error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = checkMembership;
