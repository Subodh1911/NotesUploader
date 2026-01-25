const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const { initDatabase, seedData } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Initialize database
initDatabase();
seedData();

// API Routes
const channelInfoRoutes = require('./routes/channelInfo');
const subjectsRoutes = require('./routes/subjects');
const videosRoutes = require('./routes/videos');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const featuredRoutes = require('./routes/featured');

app.use('/api/channel-info', channelInfoRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/featured', featuredRoutes);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
