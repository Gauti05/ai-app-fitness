const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  generateWorkout, 
  getWorkout,
  generateMealPlan,
  getMealPlan, 
  explainExercise,
  chatWithCoach
} = require('../controllers/aiController');

// Workout Routes
router.post('/generate', auth, generateWorkout);
router.get('/plan', auth, getWorkout);

// Nutrition Routes
router.post('/generate-meal', auth, generateMealPlan);
router.get('/meal-plan', auth, getMealPlan);

// Exercise Library Route (UPDATED THIS LINE)
router.post('/explain-exercise', auth, explainExercise); 

// Chatbot Route
router.post('/chat', auth, chatWithCoach); 

module.exports = router;