const express = require('express');
const router = express.Router();

const { registerVisitor, login, me } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth');

router.post('/register', registerVisitor);
router.post('/login', login);
router.get('/me', authMiddleware, me);

module.exports = router;
const { forgotPassword, resetPassword } = require('../controllers/reset.controller');

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);