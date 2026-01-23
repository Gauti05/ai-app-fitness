const mongoose = require('mongoose');

const ExerciseCacheSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  data: {
    type: Object, // Stores the full JSON instructions, muscles, etc.
    required: true
  }
});

module.exports = mongoose.model('ExerciseCache', ExerciseCacheSchema);