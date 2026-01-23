const mongoose = require('mongoose');

const WorkoutLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  workoutDay: { type: String, default: "Custom" }, // e.g. "Push Day"
  duration: { type: Number, required: true },      // Minutes
  calories: { type: Number },
  mood: { type: String, enum: ['Great', 'Good', 'Hard', 'Tired'], default: 'Good' },
  notes: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('workoutLog', WorkoutLogSchema);