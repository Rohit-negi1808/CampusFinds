const express = require("express");
const Contact = require("../models/Contact");

const router = express.Router();

// POST /api/contact → save contact form data
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Status defaults to "open" based on the Mongoose schema
    const newContact = new Contact({ name, email, subject, message }); 
    await newContact.save();

    res.status(201).json({ message: "Your message has been sent successfully!" });
  } catch (error) {
    console.error("Error saving contact:", error);
    res.status(500).json({ error: "Server error, please try again later." });
  }
});

// GET /api/contact → get all contact messages (for admin)
router.get("/", async (req, res) => {
  try {
    // Fetch all contacts, sorted by creation date (newest first)
    const contacts = await Contact.find().sort({ createdAt: -1 }); 
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// 💡 NEW ROUTE: PUT /api/contact/:id/resolve → Mark a contact message as resolved
router.put("/:id/resolve", async (req, res) => {
  try {
    const contactId = req.params.id;
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { status: "resolved" }, // Update the status field
      { new: true } // Return the updated document
    );

    if (!updatedContact) {
      return res.status(404).json({ error: "Contact message not found" });
    }

    res.json({ message: "Contact resolved successfully", contact: updatedContact });
  } catch (error) {
    console.error("Error resolving contact:", error);
    res.status(500).json({ error: "Server error, failed to resolve contact." });
  }
});

module.exports = router;