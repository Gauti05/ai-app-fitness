const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  plan: {
    type: Object, // Stores the JSON 7-day diet
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('mealPlan', MealPlanSchema);