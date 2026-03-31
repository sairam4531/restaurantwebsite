const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  number: { type: Number, required: true },
  seats: { type: Number, required: true },
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
  orderId: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
