const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  dateFound: { type: Date },
  location: { type: String, required: true },
  imageUrl: { type: String },
  contact: { type: String, required: true },

  // 🔹 Only two statuses: Found and Found and Submitted
  status: {
    type: String,
    enum: ["Found", "Found and Submitted"],
    default: "Found"
  }

}, { timestamps: true });

module.exports = mongoose.model('FoundItems', foundItemSchema);
