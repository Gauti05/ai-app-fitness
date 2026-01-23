const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  // We will store the AI response as a flexible JSON structure
  plan: {
    type: Object, 
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('workout', WorkoutSchema);