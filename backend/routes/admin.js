const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database');
const { isAuthenticated } = require('../middleware/auth');

// Login
router.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logout successful' });
});

// Channel Info
router.put('/channel-info', isAuthenticated, async (req, res) => {
    try {
        const { name, description, logo, youtube_channel } = req.body;
        await dbHelpers.updateChannelInfo(name, description, logo, youtube_channel);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Subjects
router.post('/subjects', isAuthenticated, async (req, res) => {
    try {
        const { name, description, icon } = req.body;
        const result = await dbHelpers.createSubject(name, description, icon);
        res.json({ success: true, id: result.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/subjects/:id', isAuthenticated, async (req, res) => {
    try {
        const { name, description, icon } = req.body;
        await dbHelpers.updateSubject(req.params.id, name, description, icon);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/subjects/:id', isAuthenticated, async (req, res) => {
    try {
        await dbHelpers.deleteSubject(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Chapters
router.post('/chapters', isAuthenticated, async (req, res) => {
    try {
        const { name, subject_id, order } = req.body;
        const result = await dbHelpers.createChapter(name, subject_id, order);
        res.json({ success: true, id: result.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/chapters/:id', isAuthenticated, async (req, res) => {
    try {
        const { name, subject_id, order } = req.body;
        await dbHelpers.updateChapter(req.params.id, name, subject_id, order);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/chapters/:id', isAuthenticated, async (req, res) => {
    try {
        await dbHelpers.deleteChapter(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Videos
router.post('/videos', isAuthenticated, async (req, res) => {
    try {
        const { title, description, youtube_url, drive_file_id, subject_id, chapter_id, thumbnail, is_featured } = req.body;
        const result = await dbHelpers.createVideo(title, description, youtube_url, drive_file_id, subject_id, chapter_id, thumbnail, is_featured);
        res.json({ success: true, id: result.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/videos/:id', isAuthenticated, async (req, res) => {
    try {
        const { title, description, youtube_url, drive_file_id, subject_id, chapter_id, thumbnail, is_featured } = req.body;
        await dbHelpers.updateVideo(req.params.id, title, description, youtube_url, drive_file_id, subject_id, chapter_id, thumbnail, is_featured);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/videos/:id', isAuthenticated, async (req, res) => {
    try {
        await dbHelpers.deleteVideo(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
