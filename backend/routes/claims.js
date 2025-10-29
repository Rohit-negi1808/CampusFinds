const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');

// GET all claims
router.get('/', async (req, res) => {
  try {
    const claims = await Claim.find();
    // ✅ Ensure a valid array is always returned
    res.json(Array.isArray(claims) ? claims : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new claim
router.post('/', async (req, res) => {
  try {
    let { itemId, claimantName, contact, message } = req.body;
    contact = String(contact);

    if (!itemId || !claimantName || !contact || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newClaim = new Claim({ itemId, claimantName, contact, message });
    const savedClaim = await newClaim.save();
    res.status(201).json(savedClaim);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT (Update) a claim by ID (only update status)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;

    // ✅ only allow valid statuses
    if (!['waiting', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedClaim = await Claim.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedClaim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    res.json(updatedClaim);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;