const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['starters', 'main_course', 'drinks', 'desserts'], required: true },
  image: { type: String },
  veg: { type: Boolean, required: true },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
