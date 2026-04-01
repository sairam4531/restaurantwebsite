const express = require('express');
const router = express.Router();
const OnlineOrder = require('../models/OnlineOrder');

const normalizePlatform = (platform) => {
  if (platform === 'zomato' || platform === 'swiggy') return platform;
  return null;
};

const createDummyOrderFromWebhook = (platform, body = {}) => {
  const safePlatform = normalizePlatform(platform);
  if (!safePlatform) {
    const error = new Error('Unsupported platform');
    error.statusCode = 400;
    throw error;
  }

  const createdAt = new Date().toISOString();
  const items = Array.isArray(body.items) && body.items.length > 0
    ? body.items.map((item, index) => ({
        name: item.name || `Item ${index + 1}`,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
      }))
    : [
        {
          name: body.itemName || `${safePlatform} Sample Order`,
          quantity: Number(body.quantity) || 1,
          price: Number(body.price) || 250,
        },
      ];

  const total = body.total
    ? Number(body.total)
    : items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    id: body.id || `${safePlatform.toUpperCase()}-${Date.now()}`,
    platform: safePlatform,
    customerName: body.customerName || body.customer?.name || `${safePlatform} Customer`,
    customerAddress: body.customerAddress || body.customer?.address || 'Address not provided',
    items,
    total,
    paymentType: body.paymentType === 'prepaid' ? 'prepaid' : 'cod',
    status: body.status || 'pending',
    createdAt,
    deliveryPartnerId: body.deliveryPartnerId || null,
  };
};

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

// POST dummy webhook receiver for Swiggy / Zomato
router.post('/webhooks/:platform', async (req, res) => {
  try {
    const payload = createDummyOrderFromWebhook(req.params.platform, req.body);
    const order = new OnlineOrder(payload);
    const savedOrder = await order.save();

    res.status(201).json({
      message: `${payload.platform} webhook received`,
      order: savedOrder,
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
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
