const mongoose = require('mongoose');

const onlineOrderItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number,
}, { _id: false });

const onlineOrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  platform: { type: String, enum: ['swiggy', 'zomato'], required: true },
  customerName: { type: String, required: true },
  customerAddress: { type: String, required: true },
  items: [onlineOrderItemSchema],
  total: { type: Number, required: true },
  paymentType: { type: String, enum: ['prepaid', 'cod'], required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered'],
    default: 'pending',
  },
  createdAt: { type: String, required: true },
  deliveryPartnerId: { type: String, default: null },
}, { timestamps: false });

module.exports = mongoose.model('OnlineOrder', onlineOrderSchema);
