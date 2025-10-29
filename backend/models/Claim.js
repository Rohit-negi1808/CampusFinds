const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  claimantName: { type: String, required: true },
  contact: { type: String, required: true },
  message: { type: String, required: true, maxlength: 5000 },
  dateClaimed: { type: Date, default: Date.now },
  status: { type: String, enum: ['waiting', 'approved', 'rejected'], default: 'waiting' }
});

module.exports = mongoose.model('Claim', claimSchema);
