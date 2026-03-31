const express = require('express');
const router = express.Router();
const Table = require('../models/Table');

// GET all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find().sort({ number: 1 });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update a table's status
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Table.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST seed initial tables (run once)
router.post('/seed', async (req, res) => {
  try {
    const existing = await Table.countDocuments();
    if (existing > 0) return res.json({ message: 'Tables already seeded' });

    const tables = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      number: i + 1,
      seats: [2, 4, 4, 6, 2, 4, 8, 4, 2, 6, 4, 2][i],
      status: 'available',
    }));
    await Table.insertMany(tables);
    res.status(201).json({ message: '12 tables seeded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
