const router = require('express').Router();
const { get } = require('mongoose');
const { 
    sendResetPasswordLinkCtrl,
    getResetPasswordLinkCtrl,
    resetPasswordCtrl, 
} = require('../controllers/passwordController');

// /api/password/reset-password-link 
router.post('/reset-password-link',sendResetPasswordLinkCtrl);
// /api/password/reset-password/:userId/:token
router.route('/reset-password/:userId/:token')
.get(getResetPasswordLinkCtrl)
.post(resetPasswordCtrl);
module.exports = router;
