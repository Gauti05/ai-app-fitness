const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// 1. Add the new functions to this list
const { 
  generateWorkout, 
  getWorkout,
  generateMealPlan,
  getMealPlan, 
  explainExercise,
  chatWithCoach,
  generateSupplements, // <--- ADDED
  getSupplements       // <--- ADDED
} = require('../controllers/aiController');

// Workout Routes
router.post('/generate', auth, generateWorkout);
router.get('/plan', auth, getWorkout);

// Nutrition Routes
router.post('/generate-meal', auth, generateMealPlan);
router.get('/meal-plan', auth, getMealPlan);

// Exercise Library Route
router.post('/explain-exercise', auth, explainExercise); 

// Chatbot Route
router.post('/chat', auth, chatWithCoach); 

// 2. Use the functions directly (removed "aiController.")
router.post('/generate-supplements', auth, generateSupplements);
router.get('/supplements', auth, getSupplements);

module.exports = router;