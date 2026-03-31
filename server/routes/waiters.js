const express = require('express');
const router = express.Router();
const Waiter = require('../models/Waiter');

// GET all waiters
router.get('/', async (req, res) => {
  try {
    const waiters = await Waiter.find();
    res.json(waiters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add a new waiter
router.post('/', async (req, res) => {
  const waiter = new Waiter(req.body);
  try {
    const newWaiter = await waiter.save();
    res.status(201).json(newWaiter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a waiter
router.delete('/:id', async (req, res) => {
  try {
    await Waiter.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Waiter deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
