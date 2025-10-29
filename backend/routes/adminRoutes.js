const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

const LostItems = require("../models/LostItems");
const FoundItems = require("../models/FoundItems");
const Claim = require("../models/Claim");
const User = require("../models/User");
const Contact = require("../models/Contact");

// =====================
// ADMIN LOGIN (NEW SECURE ROUTE)
// =====================
// NOTE: returns { admin: { name, email } } to match frontend AppRouter expectation
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Validate against .env credentials
    if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
    ) {
        return res.status(200).json({
            success: true,
            admin: { name: "Admin", email },     // <-- returned as `admin` (not `user`)
            message: "Admin login successful",
        });
    }

    return res
        .status(401)
        .json({ success: false, message: "Invalid admin credentials" });
});

// =====================
// DASHBOARD STATS
// =====================
router.get("/stats", async (req, res) => {
    try {
        const totalLost = await LostItems.countDocuments();
        const totalFound = await FoundItems.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalContacts = await Contact.countDocuments();

        // Total Claims (ALL statuses)
        const totalClaims = await Claim.countDocuments();

        // Pending Claims (only status: 'waiting')
        const pendingClaims = await Claim.countDocuments({ status: "waiting" });

        res.json({
            totalLost,
            totalFound,
            totalClaims,
            pendingClaims,
            totalUsers,
            totalContacts,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =====================
// FETCH LOST ITEMS
// =====================
router.get("/lost-items", async (req, res) => {
    try {
        const items = await LostItems.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =====================
// FETCH FOUND ITEMS
// =====================
router.get("/found-items", async (req, res) => {
    try {
        const items = await FoundItems.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =====================
// FETCH CLAIMS
// =====================
router.get("/claims", async (req, res) => {
    try {
        const claims = await Claim.find().sort({ dateClaimed: -1 });
        res.json(claims);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =====================
// FETCH USERS
// =====================
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =====================
// FETCH FEEDBACK / CONTACT
// =====================
router.get("/feedback", async (req, res) => {
    try {
        const feedback = await Contact.find().sort({ createdAt: -1 });
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =====================
// RECENT ITEMS (latest 7 combined)
// =====================
router.get("/recent-items", async (req, res) => {
    try {
        const lostItems = await LostItems.find().sort({ createdAt: -1 }).limit(7);
        const foundItems = await FoundItems.find().sort({ createdAt: -1 }).limit(7);

        // merge and sort by createdAt, latest first
        const allItems = [...lostItems, ...foundItems]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 7);

        res.json(allItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =====================
// RECENT CLAIMS (latest 7)
// =====================
router.get("/recent-claims", async (req, res) => {
    try {
        const recentClaims = await Claim.find().sort({ dateClaimed: -1 }).limit(7);
        res.json(recentClaims);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
