const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// Import BOTH functions
const { createProfile, getCurrentProfile } = require('../controllers/profileController');

// Debugging: Check if imports are working
if (!createProfile || !getCurrentProfile) {
  console.error("❌ ERROR: Profile Controller functions not found. Check your exports in profileController.js");
}
if (!auth) {
  console.error("❌ ERROR: Auth Middleware not found. Check your exports in middleware/auth.js");
}

// @route   GET /api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, getCurrentProfile);

// @route   POST /api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', auth, createProfile);

module.exports = router;