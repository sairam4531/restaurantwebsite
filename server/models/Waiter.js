const mongoose = require('mongoose');

const waiterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: String, required: true },
}, { timestamps: false });

module.exports = mongoose.model('Waiter', waiterSchema);
