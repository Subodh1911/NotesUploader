const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database');

router.get('/', async (req, res) => {
    try {
        const filters = {
            subject_id: req.query.subject_id,
            chapter_id: req.query.chapter_id,
            search: req.query.search
        };
        const videos = await dbHelpers.getAllVideos(filters);
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/trending', async (req, res) => {
    try {
        const videos = await dbHelpers.getTrendingVideos(5);
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/popular', async (req, res) => {
    try {
        const videos = await dbHelpers.getPopularVideos(5);
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const video = await dbHelpers.getVideoById(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        res.json(video);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/related', async (req, res) => {
    try {
        const video = await dbHelpers.getVideoById(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        const related = await dbHelpers.getRelatedVideos(video.id, video.chapter_id, video.subject_id);
        res.json(related);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:id/view', async (req, res) => {
    try {
        await dbHelpers.incrementViewCount(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
