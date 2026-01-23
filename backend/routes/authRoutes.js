const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { registerUser, loginUser, getMe } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user', auth, getMe); // Protected route

module.exports = router;