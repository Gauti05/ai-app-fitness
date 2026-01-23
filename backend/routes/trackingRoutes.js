const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { logWorkout, getStats, getLeaderboard, getHistory } = require('../controllers/trackingController');

router.post('/log', auth, logWorkout);
router.get('/stats', auth, getStats);
router.get('/leaderboard', auth, getLeaderboard); // <--- Add Route
router.get('/history', auth, getHistory); // <--- Add this line

module.exports = router;