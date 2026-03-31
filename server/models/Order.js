const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  category: String,
  veg: Boolean,
  quantity: Number,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tableId: { type: Number, required: true },
  items: [cartItemSchema],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'preparing', 'served', 'completed'], default: 'pending' },
  createdAt: { type: String, required: true },
}, { timestamps: false });

module.exports = mongoose.model('Order', orderSchema);
