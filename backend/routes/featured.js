const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database');

router.get('/', async (req, res) => {
    try {
        const videos = await dbHelpers.getFeaturedVideos();
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
