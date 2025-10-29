const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();
const app = express();

// =====================
// Middleware
// =====================
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// =====================
// Connect Database
// =====================
connectDB();

// =====================
// API Routes
// =====================
app.use('/api/lost-items', require('./routes/lostItems'));
app.use('/api/found-items', require('./routes/foundItems'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/users', require('./routes/users'));
app.use('/api/contact', require('./routes/contactRoutes'));

// ✅ Keep only this — all admin-related endpoints are under /api/admin/
app.use("/api/admin", adminRoutes);

// =====================
// Start Server
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
