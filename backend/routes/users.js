// File: ../routes/user.js (Complete, All 5 Routes Included with Login Fix)

const express = require("express");
const bcrypt = require("bcryptjs");
// Ensure this path is correct for your User model
const User = require("../models/User"); 

const router = express.Router();

// 1. ROUTE: /register (POST)
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, studentId } = req.body;

        if (!name || !email || !password || !studentId) {
            return res.status(400).json({ message: "All fields required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            studentId,
            // role and status will default to 'user' and 'active' from the schema
        });

        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("❌ Register Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// 2. ROUTE: /login (POST) - FIXED to include status
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // --- START FIX ---
        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                studentId: user.studentId,
                role: user.role, 
                status: user.status, // 🔑 CRUCIAL ADDITION TO FIX FRONTEND UNDEFINED ERROR
            },
        });
        // --- END FIX ---

    } catch (err) {
        console.error("❌ Login Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// 3. ROUTE: GET / (GET ALL USERS)
router.get("/", async (req, res) => {
    try {
        // Only return necessary fields for the admin panel
        const users = await User.find().select('-password'); 
        
        // Map _id to id to match your frontend code convention
        const formattedUsers = users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt
        }));

        res.json(formattedUsers);
    } catch (err) {
        console.error("❌ Get Users Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});


// 4. ROUTE: PUT /status/:id (UPDATE USER STATUS)
router.put("/status/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        // Validate the status input (optional but good practice)
        if (!['active', 'suspended'].includes(status)) {
             return res.status(400).json({ message: "Invalid status value." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { status: status },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ message: "User status updated successfully", user: updatedUser });
    } catch (err) {
        console.error("❌ User Status Update Error:", err);
        res.status(500).json({ message: "Failed to update user status on the server." });
    }
});

// 5. ROUTE: DELETE /:id (DELETE USER)
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await User.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("❌ User Delete Error:", err);
        res.status(500).json({ message: "Failed to delete user on the server." });
    }
});


module.exports = router;