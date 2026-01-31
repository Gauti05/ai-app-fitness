const mongoose = require('mongoose');

const SupplementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stack: [
    {
      name: { type: String, required: true },
      dosage: String,
      timing: String,
      reason: String, // "Why am I taking this?"
      warning: String // "Take with food" etc.
    }
  ],
  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Supplement', SupplementSchema);