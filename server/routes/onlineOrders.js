const express = require('express');
const router = express.Router();
const OnlineOrder = require('../models/OnlineOrder');

// GET all online orders
router.get('/', async (req, res) => {
  try {
    const orders = await OnlineOrder.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new online order
router.post('/', async (req, res) => {
  const order = new OnlineOrder(req.body);
  try {
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update online order status
router.patch('/:id', async (req, res) => {
  try {
    const updated = await OnlineOrder.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
