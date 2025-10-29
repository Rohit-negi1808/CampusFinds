const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  dateLost: Date,
  location: String,
  imageUrl: String,
  status: { type: String, default: 'Lost' }, 
  contact: String
}, { timestamps: true });

module.exports = mongoose.model('LostItems', lostItemSchema);
