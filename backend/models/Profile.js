const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', 
    required: true
  },
  // Physical Stats
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  height: { type: Number, required: true }, 
  weight: { type: Number, required: true }, 
  bodyType: { 
    type: String, 
    enum: ['Ectomorph', 'Mesomorph', 'Endomorph'], 
    default: 'Mesomorph' 
  },
  
  // The Fitness Goal
  goal: { 
    type: String, 
    // ✅ FIX: Added 'Maintenance' to this list
    enum: ['Fat Loss', 'Muscle Gain', 'Recomposition', 'Strength', 'General Fitness', 'Maintenance'],
    required: true 
  },
  
  // Activity / Experience Level
  activityLevel: {
    type: String,
    // ✅ FIX: Added 'Intermediate', 'Beginner', 'Advanced' to this list
    enum: [
      'Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 
      'Beginner', 'Intermediate', 'Advanced'
    ],
    required: true
  },

  // Logistics
  workoutLocation: { type: String, enum: ['Gym', 'Home'], default: 'Gym' },
  equipment: [String], 
  timePerSession: { type: Number, default: 45 }, 
  
  // Nutrition Context
  dietaryPreference: { 
    type: String, 
    enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian', 'Jain'], 
    required: true 
  },
  allergies: [String],
  budget: { type: String, enum: ['Low', 'Medium', 'High'] },

  // Health Safety
  injuries: [String],
  medicalConditions: [String]
}, { timestamps: true });

module.exports = mongoose.model('profile', ProfileSchema);